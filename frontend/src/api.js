// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/", // adjust if needed
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
