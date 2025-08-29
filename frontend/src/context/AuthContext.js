import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate token on app startup
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    
    if (storedToken && storedRole) {
      try {
        // Check if token is expired
        const decoded = jwtDecode(storedToken);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp > currentTime) {
          // Token is valid
          setToken(storedToken);
          setRole(storedRole);
        } else {
          // Token is expired, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('role');
        }
      } catch (error) {
        // Invalid token, clear it
        console.error('Invalid token in localStorage:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('role');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (token, role) => {
    setToken(token);
    setRole(role);
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint if token exists
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local state regardless of API call success
      setToken(null);
      setRole(null);
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
  };

  const clearAuth = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout, loading, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
