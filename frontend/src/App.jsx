import { Routes, Route, Navigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
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

const App = () => {
  useEffect(() => {
    const handler = () => {
      const audio = new Audio("/sounds/notify.mp3");
      audio.play().catch(() => {});
      window.removeEventListener("click", handler);
    };

    window.addEventListener("click", handler);

    return () => {
      window.removeEventListener("click", handler);
    };
  }, []);

  return (
    <Routes>
      {/* Public login route */}
      <Route path="/login" element={<Login />} />

      {/* Protected app routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<Home />} />
          <Route path="chats" element={<SimpleChat />} />
          <Route path="documents" element={<Documents />} />
          <Route path="employee-directory" element={<EmployeeDirectory />} />
          <Route path="it-support" element={<ITSupport />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="lms" element={<LMS />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="innovations" element={<Innovations />} />
          <Route path="calls" element={<Calls />} />
        </Route>
      </Route>

      {/* Redirect root to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
