import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminPage';
import TeacherDashboard from './pages/TeacherPage';
import ProtectedRoute from './components/ProtectedRoute';
import { metrics, tracing, logger, initObservability } from './observability';

function App() {
  // Initialize observability
  useEffect(() => {
    initObservability();
    logger.info('React App started');
  }, []);

  // Track page views
  useEffect(() => {
    const currentPath = window.location.pathname;
    const pageName = currentPath === '/' ? 'login' : currentPath.substring(1);
    
    metrics.trackPageView(pageName);
    
    const span = tracing.createPageNavigationSpan(pageName);
    span.end();
    
    logger.info('Page view tracked', { page: pageName });
  }, [window.location.pathname]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/teacher" 
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
