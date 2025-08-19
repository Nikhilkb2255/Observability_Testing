const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const generateExcel = require('../utils/excelGenerator');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all marks routes so only Teacher can access
router.use(authMiddleware('teacher'));

// Add or update marks for a student
router.post('/:studentId', async (req, res) => {
  const db = req.app.locals.db;
  const { studentId } = req.params;
  const marks = req.body;

  if (!marks || Object.keys(marks).length === 0) {
    return res.status(400).json({ error: 'Marks data is required' });
  }

  try {
    const result = await db.collection('marks').updateOne(
      { studentId: new ObjectId(studentId) },
      { $set: { marks } },
      { upsert: true }
    );

    res.status(200).json({ message: 'Marks saved successfully' });
  } catch (err) {
    console.error('Error saving marks:', err);
    res.status(500).json({ error: 'Failed to save marks' });
  }
});

// Get marks of a student
router.get('/:studentId', async (req, res) => {
  const db = req.app.locals.db;
  const { studentId } = req.params;

  try {
    const markRecord = await db.collection('marks').findOne({ studentId: new ObjectId(studentId) });

    if (!markRecord) {
      return res.status(404).json({ error: 'Marks not found' });
    }

    res.status(200).json(markRecord.marks);
  } catch (err) {
    console.error('Error fetching marks:', err);
    res.status(500).json({ error: 'Failed to fetch marks' });
  }
});

// Download student marks as Excel
router.get('/:studentId/download', async (req, res) => {
  const db = req.app.locals.db;
  const { studentId } = req.params;

  try {
    const student = await db.collection('students').findOne({ _id: new ObjectId(studentId) });
    const markRecord = await db.collection('marks').findOne({ studentId: new ObjectId(studentId) });

    if (!student || !markRecord) {
      return res.status(404).json({ error: 'Student or marks not found' });
    }

    const buffer = await generateExcel(student, markRecord.marks);

    res.setHeader('Content-Disposition', `attachment; filename=${student.name}_marks.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Error generating Excel:', err);
    res.status(500).json({ error: 'Failed to generate Excel' });
  }
});

module.exports = router;
