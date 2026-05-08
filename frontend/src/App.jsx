import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Login from "./components/Pages/login";
import Dashboard from "./components/Pages/Dashboard";
import Home from "./components/Pages/Home";
import Chats from "./components/Pages/Chats";
import SimpleChat from "./components/Pages/SimpleChat";
import Documents from "./components/Pages/Documents";
import EmployeeDirectory from "./components/Pages/EmployeeDirectory";
import ITSupport from "./components/Pages/ITSupport";
import Calendar from "./components/Pages/Calendar";
import LMS from "./components/Pages/LMS";
import Announcements from "./components/Pages/Announcements";
import Innovations from "./components/Pages/Innovations";
import ProtectedRoute from "./components/ProtectedRoute";
import Calls from "./components/Pages/Calls";
import AdminPanel from "./components/Pages/AdminPanel";
import ResetPassword from "./components/Pages/ResetPassword";
import api from "./api";
import "./components/Common/AuthLoading.css";

const Callback = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    } else if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="auth-loading-container">
      <div className="auth-loading-text">Completing login...</div>
    </div>
  );
};

const App = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const [tokenReady, setTokenReady] = useState(false);

  // Fetch token and save to localStorage BEFORE rendering routes
  useEffect(() => {
    if (isAuthenticated) {
      getAccessTokenSilently()
        .then(token => {
          localStorage.setItem("access_token", token);
          setTokenReady(true);
        })
        .catch(error => {
          console.error("Error fetching token for localStorage", error);
          setTokenReady(true);
        });
    } else if (!isLoading) {
      localStorage.removeItem("access_token");
      setTokenReady(true);
    }
  }, [isAuthenticated, isLoading, getAccessTokenSilently]);

  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      async (config) => {
        if (isAuthenticated) {
          try {
            const token = await getAccessTokenSilently();
            config.headers.Authorization = `Bearer ${token}`;
          } catch (error) {
            console.error("Error fetching token", error);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => api.interceptors.request.eject(interceptor);
  }, [getAccessTokenSilently, isAuthenticated]);

  useEffect(() => {
    const handler = () => {
      const audio = new Audio("/sounds/notify.mp3");
      audio.play().catch(() => { });
      window.removeEventListener("click", handler);
    };

    window.addEventListener("click", handler);

    return () => {
      window.removeEventListener("click", handler);
    };
  }, []);

  if (isLoading || (isAuthenticated && !tokenReady)) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-text">Initializing secure session...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/callback" element={<Callback />} />
      <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

      {/* Protected app routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Home />} />
          <Route path="chats" element={<Chats />} />
          <Route path="documents" element={<Documents />} />
          <Route path="employee-directory" element={<EmployeeDirectory />} />
          <Route path="it-support" element={<ITSupport />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="lms" element={<LMS />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="innovations" element={<Innovations />} />
          <Route path="calls" element={<Calls />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>
      </Route>

      {/* Home redirects to Dashboard (which will handle auth check) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Wildcard fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
