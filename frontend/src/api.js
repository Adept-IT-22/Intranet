// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Relative path for Nginx proxy or current host
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
