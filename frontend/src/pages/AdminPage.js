import React, { useState, useContext } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { GET_STUDENTS, ADD_STUDENT } from '../graphql/students';
import AuthContext from '../context/AuthContext';

function AdminDashboard() {
  const [studentForm, setStudentForm] = useState({ name: '', rollNumber: '' });
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch students
  const { loading, error, data, refetch } = useQuery(GET_STUDENTS);

  // Add student mutation
  const [addStudent] = useMutation(ADD_STUDENT, {
    onCompleted: () => {
      alert('Student added');
      setStudentForm({ name: '', rollNumber: '' });
      refetch(); // refresh list
    },
    onError: (err) => alert(err.message)
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.rollNumber) {
      return alert('Name and Roll Number are required');
    }
    addStudent({ variables: studentForm });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return <p>Loading students...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
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
        <h2 style={{ margin: 0, color: '#333' }}>Admin Dashboard</h2>
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
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Add New Student</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            placeholder="Student Name"
            value={studentForm.name}
            onChange={e => setStudentForm({ ...studentForm, name: e.target.value })}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              flex: '1',
              minWidth: '200px'
            }}
          />
          <input
            placeholder="Roll Number"
            value={studentForm.rollNumber}
            onChange={e => setStudentForm({ ...studentForm, rollNumber: e.target.value })}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              flex: '1',
              minWidth: '200px'
            }}
          />
          <button 
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Add Student
          </button>
        </form>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>All Students</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {data.getStudents.map(s => (
            <li key={s.id} style={{
              padding: '15px',
              border: '1px solid #eee',
              borderRadius: '4px',
              marginBottom: '10px',
              backgroundColor: '#f8f9fa'
            }}>
              <strong>{s.name}</strong> ({s.rollNumber})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboard;
