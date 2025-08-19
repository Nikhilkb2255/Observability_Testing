const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

// Allow only admin to add students
router.post('/', authMiddleware('admin'), async (req, res) => {
  const db = req.app.locals.db;
  const student = req.body;

  if (!student.name || !student.rollNumber) {
    return res.status(400).json({ error: 'Name and Roll Number are required' });
  }

  try {
    const result = await db.collection('students').insertOne(student);
    res.status(201).json({ message: 'Student added', id: result.insertedId });
  } catch (err) {
    console.error('Error adding student:', err);
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// Allow admin and teacher to get students
router.get('/', authMiddleware(['admin', 'teacher']), async (req, res) => {
  const db = req.app.locals.db;
  try {
    const students = await db.collection('students').find().toArray();
    res.json(students);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

module.exports = router;
