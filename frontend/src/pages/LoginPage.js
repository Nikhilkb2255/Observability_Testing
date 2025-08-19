import React, { useState, useContext, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN } from '../graphql/auth';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AuthContext from '../context/AuthContext';
import { metrics, tracing, logger } from '../observability';

function LoginPage() {
  const navigate = useNavigate();
  const { login, token, role, loading, clearAuth } = useContext(AuthContext);
  const [form, setForm] = useState({ username: '', password: '' });

  const [loginMutation] = useMutation(LOGIN, {
    onCompleted: (data) => {
      const span = tracing.createApiCallSpan('/graphql', 'POST');
      
      try {
        const decoded = jwtDecode(data.login);
        
        // Track successful login
        metrics.trackUserInteraction('login_success', { 
          username: form.username, 
          role: decoded.role 
        });
        
        span.setAttributes({
          'login.success': true,
          'user.role': decoded.role
        });
        
        logger.info('Login successful', { username: form.username, role: decoded.role });
        
        alert('Login successful');
        login(data.login, decoded.role);
        
        if (decoded.role === 'admin') {
          navigate('/dashboard');
        } else if (decoded.role === 'teacher') {
          navigate('/teacher');
        } else {
          alert('Unknown role, staying on login page.');
        }
      } catch (err) {
        // Track login error
        metrics.trackError(err, { username: form.username, context: 'login_decode' });
        logger.error('Error decoding token', err, { username: form.username });
        
        span.setAttributes({
          'login.success': false,
          'error.type': 'token_decode_error'
        });
        
        alert('Login failed: invalid token');
      } finally {
        span.end();
      }
    },
    onError: (err) => {
      // Track login error
      metrics.trackError(err, { username: form.username, context: 'login_mutation' });
      logger.error('Login error details', err, { username: form.username });
      
      const span = tracing.createApiCallSpan('/graphql', 'POST');
      span.setAttributes({
        'login.success': false,
        'error.type': 'graphql_error',
        'error.message': err.message
      });
      span.end();
      
      alert(`Login failed: ${err.message}`);
    }
  });

  // Redirect if already logged in (only after loading is complete)
  useEffect(() => {
    if (!loading && token && role) {
      logger.info('User already logged in, redirecting', { role });
      if (role === 'admin') {
        navigate('/dashboard');
      } else if (role === 'teacher') {
        navigate('/teacher');
      }
    }
  }, [token, role, navigate, loading]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Track login attempt
    metrics.trackUserInteraction('login_attempt', { username: form.username });
    logger.info('Login attempt', { username: form.username });
    
    const span = tracing.createUserInteractionSpan('login_form_submit', {
      username: form.username
    });
    
    loginMutation({ variables: form });
    span.end();
  };

  const handleClearAuth = () => {
    // Track clear auth action
    metrics.trackUserInteraction('clear_auth_data');
    logger.info('Auth data cleared by user');
    
    const span = tracing.createUserInteractionSpan('clear_auth_data');
    clearAuth();
    span.end();
  };

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
    
    // Track form interaction
    metrics.trackUserInteraction('form_input', { field, hasValue: !!value });
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Login</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input
            placeholder="Username"
            value={form.username}
            onChange={e => handleInputChange('username', e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={e => handleInputChange('password', e.target.value)}
            style={{
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
          <button 
            type="submit"
            style={{
              padding: '12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Login
          </button>
          
          {/* Debug button to clear authentication */}
          <button 
            type="button"
            onClick={handleClearAuth}
            style={{
              padding: '8px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginTop: '10px'
            }}
          >
            Clear Auth Data
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
