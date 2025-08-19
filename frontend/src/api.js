import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5002/api',
});

// Add this interceptor to send the token with every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
