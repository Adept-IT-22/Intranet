// src/api.js
import axios from "axios";

// Use environment variable or default based on environment
// For Render: Set VITE_API_BASE=https://adept-intranet-backend.onrender.com/api/
// For local dev: Uses /api/ (proxied by Vite)
const baseURL = import.meta.env.VITE_API_BASE || 
  (import.meta.env.PROD 
    ? 'https://adept-intranet-backend.onrender.com/api/' 
    : '/api/');

const api = axios.create({
  baseURL,
});

// ✅ Always attach the token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
