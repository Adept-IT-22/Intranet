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
            const newAccessToken = res.data.access;
            localStorage.setItem("access_token", newAccessToken);

            // If rotation is enabled, update the refresh token too
            if (res.data.refresh) {
              localStorage.setItem("refresh_token", res.data.refresh);
            }

            // Update defaults for new requests
            api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;

            // ✅ Update headers for the retried request
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            }

            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error("Session expired or refresh failed. Logging out...");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
