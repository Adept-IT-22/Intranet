import { Outlet, Link } from "react-router-dom";
import {
  FaTh,
  FaUsers,
  FaBullhorn,
  FaComments,
  FaPeopleCarry,
  FaLaptop,
  FaCalendarAlt,
  FaBook,
  FaLightbulb,
} from "react-icons/fa";
import logo from "../../assets/adeptlogo.png";
import GreetingsBar from "./GreetingsBar";
import React, { useState } from "react";

const user = {
  name: "User X",
  role: "Software Engineer",
  avatarUrl: "https://i.pravatar.cc/100",
};

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "80px",
          backgroundColor: "#1B467A",
          color: "white",
          paddingTop: "10px",
        }}
      >
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            fontSize: "1.5rem",
          }}
        >
          <Link to="/" title="Dashboard Home" style={{ color: "white" }}>
            <FaTh />
          </Link>
          <Link to="/employee-directory" title="Employee Directory" style={{ color: "white" }}>
            <FaUsers />
          </Link>
          <Link to="/announcements" title="Announcements" style={{ color: "white" }}>
            <FaBullhorn />
          </Link>
          <Link to="/chats" title="Chats" style={{ color: "white" }}>
            <FaComments />
          </Link>
          <Link to="/teams" title="Teams" style={{ color: "white" }}>
            <FaPeopleCarry />
          </Link>
          <Link to="/it-support" title="IT Support" style={{ color: "white" }}>
            <FaLaptop />
          </Link>
          <Link to="/calendar" title="Calendar" style={{ color: "white" }}>
            <FaCalendarAlt />
          </Link>
          <Link to="/lms" title="LMS" style={{ color: "white" }}>
            <FaBook />
          </Link>
          <Link to="/innovations" title="Innovations" style={{ color: "white" }}>
            <FaLightbulb />
          </Link>
        </nav>
      </div>

      {/* Main content wrapper */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header bar */}
        <header
          style={{
            height: "80px",
            borderBottom: "1px solid #ddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            backgroundColor: "#fff",
            position: "relative",
          }}
        >
          {/* Logo left */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={logo}
              alt="Adept Technologies Logo"
              style={{ height: "60px", objectFit: "contain" }}
            />
          </div>

          {/* Search bar center */}
          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={{
                width: "300px",
                padding: "8px 12px",
                borderRadius: "20px",
                border: "1px solid #ccc",
                fontSize: "1rem",
              }}
            />
          </div>

          {/* User profile right */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "600", color: "#333" }}>{user.name}</div>
              <div style={{ fontSize: "0.9rem", color: "#666" }}>{user.role}</div>
            </span>
            <img
              src={user.avatarUrl}
              alt={user.name}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                objectFit: "cover",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            />
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          <div style={{ paddingLeft: "10px", maxWidth: "300px" }}>
            <GreetingsBar />
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
