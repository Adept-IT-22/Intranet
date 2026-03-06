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

// ✅ Auto-refresh token if expired
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (refreshToken) {
          const res = await axios.post("/api/token/refresh/", { refresh: refreshToken });
          if (res.status === 200) {
            localStorage.setItem("access_token", res.data.access);
            api.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error("Session expired. Logging out...");
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
