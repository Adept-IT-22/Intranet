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
  const [profileData, setProfileData] = useState({ first_name: "", last_name: "" });
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();
  const location = useLocation(); // ✅ Check current route
  const fileInputRef = React.useRef(null);

  const fetchUser = () => {
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
        if (!res.ok) {
          // Don't auto-logout, just log the error
          console.error("Failed to fetch user info");
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setUser(data);
          setProfileData({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
          });
        }
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
        // Don't auto-logout - user stays logged in
      });
  };

  useEffect(() => {
    fetchUser();
  }, [navigate]);

  // Fetch notifications (announcements and unread messages)
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        let count = 0;
        const notificationList = [];

        // Fetch recent announcements (last 7 days)
        try {
          const announcementsRes = await fetch("/api/announcements/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (announcementsRes.ok) {
            const announcements = await announcementsRes.json();
            const recentAnnouncements = announcements.filter(ann => {
              const createdDate = new Date(ann.created_at);
              const daysDiff = (new Date() - createdDate) / (1000 * 60 * 60 * 24);
              return daysDiff <= 7 && ann.is_active;
            });
            
            recentAnnouncements.forEach(ann => {
              notificationList.push({
                id: `ann-${ann.id}`,
                type: 'announcement',
                title: ann.title,
                message: ann.summary || ann.content.substring(0, 100),
                date: ann.created_at,
                link: '/dashboard/announcements',
              });
            });
            count += recentAnnouncements.length;
          }
        } catch (err) {
          console.error('Failed to fetch announcements:', err);
        }

        // Fetch unread messages
        try {
          const conversationsRes = await fetch("/api/chat/conversations/", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (conversationsRes.ok) {
            const conversations = await conversationsRes.json();
            const unreadConversations = conversations.filter(conv => conv.unread_count > 0);
            
            unreadConversations.forEach(conv => {
              notificationList.push({
                id: `msg-${conv.id}`,
                type: 'message',
                title: `New messages in ${conv.name}`,
                message: conv.last_message?.content || 'New message',
                count: conv.unread_count,
                date: conv.last_message?.timestamp || conv.updated_at,
                link: '/dashboard/chats',
              });
            });
            count += unreadConversations.reduce((sum, conv) => sum + conv.unread_count, 0);
          }
        } catch (err) {
          console.error('Failed to fetch conversations:', err);
        }

        setNotificationCount(count);
        setNotifications(notificationList.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) return;

    const token = localStorage.getItem("access_token");
    
    // Call logout endpoint
    try {
      await fetch("/api/auth/logout/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error("Logout API call failed:", err);
    }

    // Clear tokens and redirect
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const handleProfileUpdate = async () => {
    setProfileLoading(true);
    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    
    if (profileData.first_name) formData.append("first_name", profileData.first_name);
    if (profileData.last_name) formData.append("last_name", profileData.last_name);
    if (selectedAvatar) formData.append("avatar", selectedAvatar);

    try {
      const response = await fetch("/api/auth/profile/", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setShowProfileModal(false);
        setSelectedAvatar(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        const error = await response.json();
        alert("Failed to update profile: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const getAvatarDisplay = () => {
    if (user?.avatar) {
      return <img src={user.avatar} alt={user.username} style={styles.avatar} />;
    }
    // Show initials
    const initials = user?.initials || user?.username?.substring(0, 2).toUpperCase() || "U";
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
          fontSize: "16px",
        }}
      >
        {initials}
      </div>
    );
  };

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
                
                {/* Notification Bell */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
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
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    title="Notifications"
                  >
                    <FaBell size={20} />
                    {notificationCount > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-2px",
                          right: "-2px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          borderRadius: "50%",
                          width: "18px",
                          height: "18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: "bold",
                          border: "2px solid white",
                        }}
                      >
                        {notificationCount > 99 ? "99+" : notificationCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Notification Dropdown */}
                  {showNotifications && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        marginTop: "10px",
                        width: "350px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        zIndex: 1001,
                        maxHeight: "500px",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        style={{
                          padding: "15px",
                          borderBottom: "1px solid #e5e7eb",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>Notifications</h3>
                        {notificationCount > 0 && (
                          <span
                            style={{
                              backgroundColor: "#004aad",
                              color: "white",
                              borderRadius: "12px",
                              padding: "2px 8px",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            {notificationCount}
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          maxHeight: "400px",
                          overflowY: "auto",
                        }}
                      >
                        {notifications.length === 0 ? (
                          <div
                            style={{
                              padding: "40px 20px",
                              textAlign: "center",
                              color: "#6b7280",
                            }}
                          >
                            No new notifications
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notif) => (
                            <div
                              key={notif.id}
                              style={{
                                padding: "12px 15px",
                                borderBottom: "1px solid #f3f4f6",
                                cursor: "pointer",
                                display: "flex",
                                gap: "12px",
                                transition: "background-color 0.2s",
                              }}
                              onClick={() => {
                                setShowNotifications(false);
                                navigate(notif.link);
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                              <div style={{ fontSize: "24px", flexShrink: 0 }}>
                                {notif.type === "announcement" ? "📢" : "💬"}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontWeight: "600",
                                    fontSize: "14px",
                                    color: "#111827",
                                    marginBottom: "4px",
                                  }}
                                >
                                  {notif.title}
                                </div>
                                <div
                                  style={{
                                    fontSize: "13px",
                                    color: "#6b7280",
                                    marginBottom: "4px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {notif.message}
                                </div>
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: "#9ca3af",
                                  }}
                                >
                                  {new Date(notif.date).toLocaleDateString()}{" "}
                                  {new Date(notif.date).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                              {notif.count && (
                                <span
                                  style={{
                                    backgroundColor: "#ef4444",
                                    color: "white",
                                    borderRadius: "10px",
                                    padding: "2px 6px",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    alignSelf: "flex-start",
                                    marginTop: "4px",
                                  }}
                                >
                                  {notif.count}
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div
                          style={{
                            padding: "10px 15px",
                            borderTop: "1px solid #e5e7eb",
                            textAlign: "center",
                          }}
                        >
                          <button
                            onClick={() => {
                              setShowNotifications(false);
                              navigate("/dashboard/announcements");
                            }}
                            style={{
                              padding: "6px 16px",
                              backgroundColor: "#004aad",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "13px",
                              fontWeight: "500",
                            }}
                          >
                            View All
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div
                  onClick={() => setShowProfileModal(true)}
                  style={{ cursor: "pointer", position: "relative" }}
                  title="Click to edit profile"
                >
                  {getAvatarDisplay()}
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: "8px 16px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "14px",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#dc2626")}
                  onMouseLeave={(e) => (e.target.style.background = "#ef4444")}
                >
                  Logout
                </button>
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

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
          }}
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && user && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowProfileModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "400px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: "20px" }}>Edit Profile</h2>
            
            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <div style={{ marginBottom: "12px" }}>{getAvatarDisplay()}</div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => setSelectedAvatar(e.target.files[0])}
                style={{ display: "none" }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "8px 16px",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {selectedAvatar ? "Change Avatar" : "Upload Avatar"}
              </button>
              {selectedAvatar && (
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
                  Selected: {selectedAvatar.name}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
                First Name
              </label>
              <input
                type="text"
                value={profileData.first_name}
                onChange={(e) =>
                  setProfileData({ ...profileData, first_name: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
                placeholder="First name"
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "500" }}>
                Last Name
              </label>
              <input
                type="text"
                value={profileData.last_name}
                onChange={(e) =>
                  setProfileData({ ...profileData, last_name: e.target.value })
                }
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
                placeholder="Last name"
              />
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setShowProfileModal(false);
                  setSelectedAvatar(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                style={{
                  padding: "8px 16px",
                  background: "#e5e7eb",
                  color: "#333",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleProfileUpdate}
                disabled={profileLoading}
                style={{
                  padding: "8px 16px",
                  background: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: profileLoading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  opacity: profileLoading ? 0.6 : 1,
                }}
              >
                {profileLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
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
