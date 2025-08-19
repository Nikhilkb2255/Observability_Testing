const ExcelJS = require('exceljs');

async function generateExcel(student, marks, isAllStudents = false) {
  const workbook = new ExcelJS.Workbook();
  
  if (isAllStudents) {
    // Generate Excel for all students
    const sheet = workbook.addWorksheet('All Students Marks');
    
    // Define columns for all students
    sheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Roll Number', key: 'rollNumber', width: 15 },
      { header: 'Math', key: 'math', width: 12 },
      { header: 'Physics', key: 'physics', width: 12 },
      { header: 'Chemistry', key: 'chemistry', width: 12 },
      { header: 'Biology', key: 'biology', width: 12 },
      { header: 'English', key: 'english', width: 12 }
    ];
    
    // Make header row bold
    sheet.getRow(1).font = { bold: true };
    
    // Add data for each student
    for (const studentData of student) {
      const studentMarks = studentData.marks || {};
      sheet.addRow({
        name: studentData.name,
        rollNumber: studentData.rollNumber,
        math: studentMarks.Math || '',
        physics: studentMarks.Physics || '',
        chemistry: studentMarks.Chemistry || '',
        biology: studentMarks.Biology || '',
        english: studentMarks.English || ''
      });
    }
  } else {
    // Generate Excel for single student (existing functionality)
    const sheet = workbook.addWorksheet('Marks');
    
    sheet.columns = [
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Roll Number', key: 'rollNumber', width: 15 },
      { header: 'Math', key: 'math', width: 12 },
      { header: 'Physics', key: 'physics', width: 12 },
      { header: 'Chemistry', key: 'chemistry', width: 12 },
      { header: 'Biology', key: 'biology', width: 12 },
      { header: 'English', key: 'english', width: 12 }
    ];

    // Make header row bold
    sheet.getRow(1).font = { bold: true };

    sheet.addRow({
      name: student.name,
      rollNumber: student.rollNumber,
      math: marks.Math || '',
      physics: marks.Physics || '',
      chemistry: marks.Chemistry || '',
      biology: marks.Biology || '',
      english: marks.English || ''
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = generateExcel;