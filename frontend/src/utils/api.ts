import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://mealody.onrender.com';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Interceptor to add JWT auth header if token exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mealody_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to normalize error messages into clear, actionable user messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message = 'Recommendation engine request timed out. Please try again or check your backend connection.';
    } else if (error.response) {
      if (error.response.data && error.response.data.error) {
        message = error.response.data.error;
      } else if (error.response.status === 404) {
        message = 'Requested resource not found.';
      } else if (error.response.status === 401) {
        message = 'Session expired or invalid credentials. Please log in again.';
      } else if (error.response.status >= 500) {
        message = 'Server is currently busy. Re-trying with backup response...';
      }
    } else if (error.request) {
      message = 'Cannot connect to backend server. Please check your network connection.';
    }
    
    // Attach clean error message to error object
    error.userMessage = message;
    return Promise.reject(error);
  }
);

export default api;
