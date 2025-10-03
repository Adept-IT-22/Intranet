import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FaTh,
  FaUsers,
  FaBullhorn,
  FaComments,
  FaFileAlt,
  FaLaptop,
  FaCalendarAlt,
  FaBook,
  FaLightbulb,
} from "react-icons/fa";
import logo from "../../assets/adeptlogo.png";
import GreetingsBar from "./GreetingsBar";

// ✅ Inject Google Fonts (Open Sans)
const openSansLink = document.createElement("link");
openSansLink.href =
  "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap";
openSansLink.rel = "stylesheet";
document.head.appendChild(openSansLink);

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  const location = useLocation(); // ✅ Check current route

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      console.warn("❌ No token found, redirecting to login...");
      navigate("/login");
      return;
    }

    fetch("http://192.168.1.154:8001/api/auth/user/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user info");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch((err) => {
        console.error("Error fetching user:", err);
        localStorage.removeItem("access_token");
        navigate("/login");
      });
  }, [navigate]);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Open Sans', sans-serif" }}>
      {/* ✅ Sidebar with all menu links */}
      <aside style={styles.sidebar}>
        <nav style={styles.nav}>
          {sidebarLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              style={({ isActive }) => ({
                ...styles.link,
                backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                borderRadius: "10px",
                padding: "8px",
              })}
            >
              {item.icon}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ✅ Main content wrapper */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f7f9fc" }}>
        {/* ✅ Header */}
        <header style={styles.header}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={logo}
              alt="Adept Technologies Logo"
              style={{ height: "180px", objectFit: "contain" }}
            />
          </div>

          {/* Search bar */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.search}
            />
          </div>

          {/* ✅ User info */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            {user ? (
              <>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: "600", color: "#333" }}>{user.username}</div>
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    {user.role || "Member"}
                  </div>
                </div>
                <img
                  src={user.avatar || "https://i.pravatar.cc/100"}
                  alt={user.username}
                  style={styles.avatar}
                />
              </>
            ) : (
              <span style={{ color: "#666" }}>Loading...</span>
            )}
          </div>
        </header>

        {/* ✅ Main Page Content */}
        <main style={styles.main}>
          {/* ✅ Show Greetings ONLY on the dashboard home */}
          {location.pathname === "/dashboard" && (
            <div style={styles.greetingsCard}>
              <GreetingsBar username={user?.username} />
            </div>
          )}

          {/* ✅ Outlet renders subpages */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ✅ Sidebar links (Innovations included) */
const sidebarLinks = [
  { to: "/dashboard", label: "Dashboard Home", icon: <FaTh size={28} /> },
  { to: "/dashboard/employee-directory", label: "Employee Directory", icon: <FaUsers size={28} /> },
  { to: "/dashboard/announcements", label: "Announcements", icon: <FaBullhorn size={28} /> },
  { to: "/dashboard/chats", label: "Chats", icon: <FaComments size={28} /> },
  { to: "/dashboard/documents", label: "Documents", icon: <FaFileAlt size={28} /> },
  { to: "/dashboard/it-support", label: "IT Support", icon: <FaLaptop size={28} /> },
  { to: "/dashboard/calendar", label: "Calendar", icon: <FaCalendarAlt size={28} /> },
  { to: "/dashboard/lms", label: "LMS", icon: <FaBook size={28} /> },
  { to: "/dashboard/innovations", label: "Innovations", icon: <FaLightbulb size={28} /> }, // ✅ Still here
];

/* ✅ Styles */
const styles = {
  sidebar: {
    width: "90px",
    backgroundColor: "#1B467A",
    color: "white",
    paddingTop: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100vh", // ✅ Full height so the blue reaches the bottom
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px", // ✅ Reduced from 28px → 20px so all icons fit
    flexGrow: 1,
  },
  link: {
    color: "white",
    textDecoration: "none",
    transition: "0.3s",
  },
  header: {
    height: "80px",
    borderBottom: "1px solid #ddd",
    display: "flex",
    alignItems: "center",
    padding: "0 20px",
    background: "linear-gradient(to right, #ffffff, #f4f6f9)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  search: {
    width: "300px",
    padding: "8px 12px",
    borderRadius: "20px",
    border: "1px solid #ccc",
    background: "#f1f3f6",
    fontSize: "0.95rem",
    color: "#333",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    objectFit: "cover",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  main: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    background: "#f7f9fc",
  },
  greetingsCard: {
    background: "#fff",
    padding: "15px 20px",
    borderRadius: "10px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    marginBottom: "20px",
  },
};
