import React, { useState, useContext, useEffect } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_STUDENTS } from '../graphql/students';
import { ADD_MARKS, DOWNLOAD_MARKS, GET_MARKS, DOWNLOAD_ALL_MARKS } from '../graphql/marks';
import AuthContext from '../context/AuthContext';

function TeacherDashboard() {
  const { loading, error, data } = useQuery(GET_STUDENTS);
  const [marksForm, setMarksForm] = useState({});
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loadingMarks, setLoadingMarks] = useState({});

  // Lazy query to fetch marks for individual students
  const [getMarks] = useLazyQuery(GET_MARKS);

  const [addMarks] = useMutation(ADD_MARKS, {
    onCompleted: () => {
      alert('Marks saved successfully!');
    },
    onError: (err) => alert(`Error saving marks: ${err.message}`)
  });

  const [downloadMarks] = useMutation(DOWNLOAD_MARKS, {
    onCompleted: (data) => {
      const base64 = data.downloadMarksBase64;
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
      link.download = `marks.xlsx`;
      link.click();
      alert('Excel file downloaded successfully!');
    },
    onError: (err) => alert(`Error downloading file: ${err.message}`)
  });

  const [downloadAllMarks] = useLazyQuery(DOWNLOAD_ALL_MARKS, {
    onCompleted: (data) => {
      const base64 = data.downloadAllMarksBase64;
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
      link.download = `all_students_marks.xlsx`;
      link.click();
      alert('All students marks downloaded successfully!');
    },
    onError: (err) => alert(`Error downloading all marks: ${err.message}`)
  });

  // Function to fetch marks for a specific student
  const fetchStudentMarks = async (studentId) => {
    try {
      setLoadingMarks(prev => ({ ...prev, [studentId]: true }));
      const { data: marksData } = await getMarks({ variables: { studentId } });
      if (marksData?.getMarks) {
        setMarksForm(prev => ({
          ...prev,
          [studentId]: marksData.getMarks
        }));
      }
    } catch (error) {
      console.error('Error fetching marks:', error);
      alert(`Error loading marks for student: ${error.message}`);
    } finally {
      setLoadingMarks(prev => ({ ...prev, [studentId]: false }));
    }
  };

  // Function to download all students' marks
  const handleDownloadAllMarks = () => {
    downloadAllMarks();
  };

  // Automatically fetch marks for all students when the page loads
  useEffect(() => {
    if (data?.getStudents) {
      data.getStudents.forEach(student => {
        // Initialize empty marks structure for each student
        if (!marksForm[student.id]) {
          setMarksForm(prev => ({
            ...prev,
            [student.id]: {}
          }));
        }
        // Fetch existing marks for each student
        fetchStudentMarks(student.id);
      });
    }
  }, [data?.getStudents]);

  const handleMarksSubmit = (studentId) => {
    if (!marksForm[studentId]) {
      return alert('Enter marks before saving');
    }
    
    // Validate that at least one subject has marks
    const hasMarks = Object.values(marksForm[studentId]).some(mark => mark !== '' && mark !== null);
    if (!hasMarks) {
      return alert('Please enter marks for at least one subject before saving');
    }
    
    addMarks({ variables: { studentId, marks: marksForm[studentId] } });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <p>Loading students...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: 0, color: '#333' }}>Teacher Dashboard</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleDownloadAllMarks}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Download All Marks
          </button>
          <button 
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
          >
            Logout
          </button>
        </div>
      </div>
      
      {data.getStudents.map(s => (
        <div key={s.id} style={{ 
          marginBottom: '20px', 
          padding: '20px', 
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>{s.name} ({s.rollNumber})</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '15px' }}>
            {['Math', 'Physics', 'Chemistry', 'Biology', 'English'].map(subject => (
              <input
                key={subject}
                placeholder={`${subject} Marks`}
                type="number"
                value={marksForm[s.id]?.[subject] || ''}
                onChange={e => {
                  setMarksForm(prev => ({
                    ...prev,
                    [s.id]: { ...prev[s.id], [subject]: parseInt(e.target.value) || '' }
                  }));
                }}
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => handleMarksSubmit(s.id)}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Save Marks
            </button>
            <button 
              onClick={() => downloadMarks({ variables: { studentId: s.id } })}
              style={{
                padding: '8px 16px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Download Excel
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TeacherDashboard;
