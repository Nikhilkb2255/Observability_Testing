const { ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateExcel = require('../utils/excelGenerator');
const { logInfo, logError, logWarn } = require('../logger');
const { loginAttempts } = require('../metrics');
const { createSpan, addSpanEvent, setSpanAttributes } = require('../tracing');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key';

const resolvers = {
  Query: {
    getStudents: async (_, __, { db, user }) => {
      const span = createSpan('getStudents', { user_role: user?.role });
      
      try {
        if (!user || !['admin', 'teacher'].includes(user.role)) {
          logWarn('Unauthorized access attempt to getStudents', { user: user?.username });
          throw new Error('Unauthorized');
        }
        
        const students = await db.collection('students').find().toArray();
        const result = students.map(s => ({ id: s._id.toString(), name: s.name, rollNumber: s.rollNumber }));
        
        addSpanEvent(span, 'students_retrieved', { count: result.length });
        logInfo('Students retrieved successfully', { count: result.length, user: user.username });
        
        span.end();
        return result;
      } catch (error) {
        logError('Error retrieving students', error, { user: user?.username });
        span.end();
        throw error;
      }
    },

    getStudentById: async (_, { id }, { db, user }) => {
      const span = createSpan('getStudentById', { student_id: id, user_role: user?.role });
      
      try {
        if (!user || !['admin', 'teacher'].includes(user.role)) {
          logWarn('Unauthorized access attempt to getStudentById', { user: user?.username, studentId: id });
          throw new Error('Unauthorized');
        }
        
        const student = await db.collection('students').findOne({ _id: new ObjectId(id) });
        if (!student) {
          logWarn('Student not found', { studentId: id, user: user.username });
          span.end();
          return null;
        }
        
        const result = { id: student._id.toString(), name: student.name, rollNumber: student.rollNumber };
        addSpanEvent(span, 'student_retrieved', { studentId: id });
        logInfo('Student retrieved successfully', { studentId: id, user: user.username });
        
        span.end();
        return result;
      } catch (error) {
        logError('Error retrieving student by ID', error, { studentId: id, user: user?.username });
        span.end();
        throw error;
      }
    },

    getMarks: async (_, { studentId }, { db, user }) => {
      const span = createSpan('getMarks', { student_id: studentId, user_role: user?.role });
      
      try {
        if (!user || user.role !== 'teacher') {
          logWarn('Unauthorized access attempt to getMarks', { user: user?.username, studentId });
          throw new Error('Unauthorized');
        }
        
        const record = await db.collection('marks').findOne({ studentId: new ObjectId(studentId) });
        const result = record ? record.marks : null;
        
        addSpanEvent(span, 'marks_retrieved', { studentId, hasMarks: !!result });
        logInfo('Marks retrieved successfully', { studentId, user: user.username, hasMarks: !!result });
        
        span.end();
        return result;
      } catch (error) {
        logError('Error retrieving marks', error, { studentId, user: user?.username });
        span.end();
        throw error;
      }
    },

    getAllStudentsWithMarks: async (_, __, { db, user }) => {
      const span = createSpan('getAllStudentsWithMarks', { user_role: user?.role });
      
      try {
        if (!user || user.role !== 'teacher') {
          logWarn('Unauthorized access attempt to getAllStudentsWithMarks', { user: user?.username });
          throw new Error('Unauthorized');
        }
        
        const students = await db.collection('students').find().toArray();
        const studentsWithMarks = [];
        
        for (const student of students) {
          const markRecord = await db.collection('marks').findOne({ studentId: student._id });
          studentsWithMarks.push({
            id: student._id.toString(),
            name: student.name,
            rollNumber: student.rollNumber,
            marks: markRecord ? markRecord.marks : null
          });
        }
        
        addSpanEvent(span, 'students_with_marks_retrieved', { count: studentsWithMarks.length });
        logInfo('All students with marks retrieved successfully', { count: studentsWithMarks.length, user: user.username });
        
        span.end();
        return studentsWithMarks;
      } catch (error) {
        logError('Error retrieving all students with marks', error, { user: user?.username });
        span.end();
        throw error;
      }
    },

    downloadAllMarksBase64: async (_, __, { db, user }) => {
      const span = createSpan('downloadAllMarksBase64', { user_role: user?.role });
      
      try {
        if (!user || user.role !== 'teacher') {
          logWarn('Unauthorized access attempt to downloadAllMarksBase64', { user: user?.username });
          throw new Error('Unauthorized');
        }
        
        const students = await db.collection('students').find().toArray();
        const studentsWithMarks = [];
        
        for (const student of students) {
          const markRecord = await db.collection('marks').findOne({ studentId: student._id });
          studentsWithMarks.push({
            id: student._id.toString(),
            name: student.name,
            rollNumber: student.rollNumber,
            marks: markRecord ? markRecord.marks : null
          });
        }
        
        const buffer = await generateExcel(studentsWithMarks, null, true);
        const result = buffer.toString('base64');
        
        addSpanEvent(span, 'all_marks_downloaded', { studentCount: studentsWithMarks.length });
        logInfo('All marks downloaded successfully', { studentCount: studentsWithMarks.length, user: user.username });
        
        span.end();
        return result;
      } catch (error) {
        logError('Error downloading all marks', error, { user: user?.username });
        span.end();
        throw error;
      }
    }
  },

  Mutation: {
    register: async (_, { username, password, role }, { db }) => {
      const span = createSpan('register', { username, role });
      
      try {
        const users = db.collection('users');
        const existing = await users.findOne({ username });
        
        if (existing) {
          logWarn('Registration attempt with existing username', { username });
          throw new Error('User already exists');
        }
        
        await users.insertOne({ username, password: password, role });
        
        addSpanEvent(span, 'user_registered', { username, role });
        logInfo('User registered successfully', { username, role });
        
        span.end();
        return 'User registered successfully';
      } catch (error) {
        logError('Error registering user', error, { username, role });
        span.end();
        throw error;
      }
    },    

    login: async (_, { username, password }, { db }) => {
      const span = createSpan('login', { username });
      
      try {
        const users = db.collection('users');
        const user = await users.findOne({ username });
      
        if (!user) {
          loginAttempts.labels('failed', username).inc();
          logWarn('Login attempt with non-existent username', { username });
          throw new Error('Invalid credentials');
        }

        if (password !== user.password) {
          loginAttempts.labels('failed', username).inc();
          logWarn('Login attempt with wrong password', { username });
          throw new Error('Invalid credentials');
        }
      
        const token = jwt.sign({ username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        
        loginAttempts.labels('success', username).inc();
        addSpanEvent(span, 'login_successful', { username, role: user.role });
        logInfo('User logged in successfully', { username, role: user.role });

        span.end();
        return token;
      } catch (error) {
        logError('Error during login', error, { username });
        span.end();
        throw error;
      }
    },
    
    addStudent: async (_, { name, rollNumber }, { db, user }) => {
      const span = createSpan('addStudent', { student_name: name, roll_number: rollNumber, user_role: user?.role });
      
      try {
        if (!user || user.role !== 'admin') {
          logWarn('Unauthorized attempt to add student', { user: user?.username, studentName: name });
          throw new Error('Unauthorized');
        }
        
        await db.collection('students').insertOne({ name, rollNumber });
        
        addSpanEvent(span, 'student_added', { name, rollNumber });
        logInfo('Student added successfully', { name, rollNumber, user: user.username });
        
        span.end();
        return 'Student added';
      } catch (error) {
        logError('Error adding student', error, { name, rollNumber, user: user?.username });
        span.end();
        throw error;
      }
    },

    addMarks: async (_, { studentId, marks }, { db, user }) => {
      const span = createSpan('addMarks', { student_id: studentId, user_role: user?.role });
      
      try {
        if (!user || user.role !== 'teacher') {
          logWarn('Unauthorized attempt to add marks', { user: user?.username, studentId });
          throw new Error('Unauthorized');
        }
        
        await db.collection('marks').updateOne(
          { studentId: new ObjectId(studentId) },
          { $set: { marks } },
          { upsert: true }
        );
        
        addSpanEvent(span, 'marks_added', { studentId });
        logInfo('Marks added successfully', { studentId, user: user.username });
        
        span.end();
        return 'Marks saved';
      } catch (error) {
        logError('Error adding marks', error, { studentId, user: user?.username });
        span.end();
        throw error;
      }
    },

    downloadMarksBase64: async (_, { studentId }, { db, user }) => {
      const span = createSpan('downloadMarksBase64', { student_id: studentId, user_role: user?.role });
      
      try {
        if (!user || !['admin', 'teacher'].includes(user.role)) {
          logWarn('Unauthorized attempt to download marks', { user: user?.username, studentId });
          throw new Error('Unauthorized');
        }
        
        const student = await db.collection('students').findOne({ _id: new ObjectId(studentId) });
        const markRecord = await db.collection('marks').findOne({ studentId: new ObjectId(studentId) });
        
        if (!student || !markRecord) {
          logWarn('Student or marks not found for download', { studentId, user: user.username });
          throw new Error('Student or marks not found');
        }
        
        const buffer = await generateExcel(student, markRecord.marks);
        const result = buffer.toString('base64');
        
        addSpanEvent(span, 'marks_downloaded', { studentId });
        logInfo('Marks downloaded successfully', { studentId, user: user.username });
        
        span.end();
        return result;
      } catch (error) {
        logError('Error downloading marks', error, { studentId, user: user?.username });
        span.end();
        throw error;
      }
    }
  }
};

module.exports = resolvers;
