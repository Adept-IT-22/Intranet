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
  FaBell,
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Logout function
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      console.warn("❌ No token found, redirecting to login...");
      navigate("/login");
      return;
    }

    fetch("/api/auth/user/", {
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

  const getAvatarDisplay = () => {
    if (user?.avatar) {
      return <img src={user.avatar} alt={user.username} style={styles.avatar} />;
    }
    const initials = user?.username?.substring(0, 2).toUpperCase() || "U";
    return (
      <div
        style={{
          ...styles.avatar,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "600",
          fontSize: "14px",
        }}
      >
        {initials}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Open Sans', sans-serif" }}>
      {/* Sidebar */}
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

      {/* Main content wrapper */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f7f9fc" }}>
        {/* Header */}
        <header style={styles.header}>
          {/* Logo (hidden on mobile/narrow screens) */}
          {!isMobile && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <img
                src={logo}
                alt="Adept Technologies Logo"
                style={{ height: "180px", objectFit: "contain", marginRight: "20px" }}
              />
            </div>
          )}

          {/* Search bar */}
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.search}
            />
          </div>

          {/* User info on the right */}
          <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
            {user ? (
              <>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: "600", color: "#333", fontSize: "14px" }}>{user.username}</div>
                  <div style={{ fontSize: "0.85rem", color: "#666" }}>
                    {user.role || "Member"}
                  </div>
                </div>

                {/* Notification Bell */}
                <div style={{ position: "relative" }}>
                  <button
                    style={{
                      position: "relative",
                      padding: "8px",
                      backgroundColor: "transparent",
                      border: "none",
                      borderRadius: "50%",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#333",
                    }}
                    title="Notifications"
                  >
                    <FaBell size={20} />
                  </button>
                </div>

                <div
                  onClick={() => setShowProfileModal(true)}
                  style={{ cursor: "pointer", position: "relative" }}
                >
                  {getAvatarDisplay()}
                </div>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  style={{
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 20px",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#c82333")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")}
                >
                  Logout
                </button>
              </>
            ) : (
              <span style={{ color: "#666" }}>Loading...</span>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main style={styles.main}>
          {location.pathname === "/dashboard" && (
            <div style={styles.greetingsCard}>
              <GreetingsBar username={user?.username} />
            </div>
          )}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const sidebarLinks = [
  { to: "/dashboard", label: "Dashboard Home", icon: <FaTh size={28} /> },
  { to: "/dashboard/employee-directory", label: "Employee Directory", icon: <FaUsers size={28} /> },
  { to: "/dashboard/announcements", label: "Announcements", icon: <FaBullhorn size={28} /> },
  { to: "/dashboard/chats", label: "Chats", icon: <FaComments size={28} /> },
  { to: "/dashboard/documents", label: "Documents", icon: <FaFileAlt size={28} /> },
  { to: "/dashboard/it-support", label: "IT Support", icon: <FaLaptop size={28} /> },
  { to: "/dashboard/calendar", label: "Calendar", icon: <FaCalendarAlt size={28} /> },
  { to: "/dashboard/lms", label: "LMS", icon: <FaBook size={28} /> },
  { to: "/dashboard/innovations", label: "Innovations", icon: <FaLightbulb size={28} /> },
];

const styles = {
  sidebar: {
    width: "90px",
    backgroundColor: "#1B467A",
    color: "white",
    paddingTop: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100vh",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
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
    justifyContent: "space-between",
    padding: "0 20px",
    background: "#ffffff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  search: {
    maxWidth: "400px",
    width: "100%",
    padding: "8px 16px",
    borderRadius: "20px",
    border: "1px solid #e1e4e8",
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
    border: "2px solid #fff",
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
