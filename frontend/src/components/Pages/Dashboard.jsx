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
  FaUserShield,
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
  const [totalChatUnread, setTotalChatUnread] = useState(0);
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1000);


  const navigate = useNavigate();
  const location = useLocation();

  const getBackendBaseUrl = () => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    if (window.location.port === '5173' || window.location.port === '3000' || window.location.port === '8080') {
      return `${protocol}://${hostname}:8001`;
    }
    return `${protocol}://${hostname}${window.location.port ? `:${window.location.port}` : ""}`;
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1000);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const notificationAudioRef = React.useRef(null);

  useEffect(() => {
    notificationAudioRef.current = new Audio("/sounds/notify.mp3");
  }, []);



  const showNotification = (title, body) => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico', tag: 'chat-message' });
    }
  };

  // Fetch unread chat count & Subscribe to notifications
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !user) return;

    const fetchCount = () => {
      fetch("/api/chat/unread-count/", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setTotalChatUnread(data.unread_count))
        .catch(err => console.error("Error fetching unread count:", err));

      fetch("/api/announcements/", {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const readIds = JSON.parse(localStorage.getItem("read_announcements") || "[]");
          const unread = data.filter(a => !readIds.includes(a.id)).length;
          setUnreadAnnouncements(unread);
        })
        .catch(err => console.error("Error fetching announcements for badge:", err));
    };

    fetchCount();

    const handleAnnouncementsRead = () => {
      fetchCount();
    };
    window.addEventListener("announcementsRead", handleAnnouncementsRead);

    const backendBase = getBackendBaseUrl();
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsHost = backendBase.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}://${wsHost}/ws/notifications/?token=${token}`;

    const nSocket = new WebSocket(wsUrl);
    nSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_message_notification") {
          fetchCount();
          // Check if it's from someone else
          if (data.sender !== user.username) {
            notificationAudioRef.current?.play().catch(() => { });

            // Only show desktop notification if hidden OR on another page OR in a different chat
            const activeChatId = localStorage.getItem('active_chat_id');
            const isDifferentChat = String(activeChatId) !== String(data.conversation_id);
            const isNotOnChatsPage = !location.pathname.includes('/dashboard/chats');

            if (document.hidden || isNotOnChatsPage || isDifferentChat) {
              showNotification(data.conversation_name || data.sender, data.message);
            }
          }
        } else if (data.type === "messages_read_notification") {
          fetchCount();
        }
      } catch (err) {
        console.error("Error in dashboard notification socket:", err);
      }
    };

    return () => {
      nSocket.close();
      window.removeEventListener("announcementsRead", handleAnnouncementsRead);
    };
  }, [user, location.pathname]);

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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch("/api/profile/upload-avatar/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      
      setUser({ ...user, avatar: data.avatar_url });
    } catch (err) {
      alert(err.message);
    }
  };

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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Open Sans', sans-serif" }}>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
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
                  position: "relative",
                })}
              >
                {item.icon}
                {item.label === "Chats" && totalChatUnread > 0 && (
                  <span style={styles.badge}>
                    {totalChatUnread > 99 ? "99+" : totalChatUnread}
                  </span>
                )}
                {item.label === "Announcements" && unreadAnnouncements > 0 && (
                  <span style={styles.badge}>
                    {unreadAnnouncements > 99 ? "99+" : unreadAnnouncements}
                  </span>
                )}
              </NavLink>
            ))}

            {/* Admin Link (Only for admins/superusers) */}
            {(user?.role === "admin" || user?.is_superuser) && (
              <NavLink
                to="/dashboard/admin"
                title="Admin Panel"
                style={({ isActive }) => ({
                  ...styles.link,
                  backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                  borderRadius: "10px",
                  padding: "8px",
                  position: "relative",
                  marginTop: "auto", // Push to bottom if possible
                })}
              >
                <FaUserShield size={28} />
              </NavLink>
            )}
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div style={styles.modalOverlay} onClick={() => setShowProfileModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setShowProfileModal(false)}>&times;</button>
            <h2 style={{ marginBottom: "20px" }}>My Profile</h2>
            
            <div style={{ position: "relative", width: "120px", height: "120px", margin: "0 auto 20px" }}>
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" style={{ ...styles.avatar, width: "120px", height: "120px" }} />
              ) : (
                <div style={{ ...styles.avatar, width: "120px", height: "120px", fontSize: "40px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f2f5" }}>
                  {user?.username?.substring(0, 2).toUpperCase()}
                </div>
              )}
              <label style={styles.avatarLabel}>
                <FaLaptop size={14} /> Edit
                <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: "none" }} />
              </label>
            </div>

            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <h3 style={{ margin: "5px 0" }}>{user?.username}</h3>
              <p style={{ color: "#666" }}>{user?.email}</p>
              <div style={styles.roleTag}>{user?.role || "Member"}</div>
            </div>

            <button onClick={handleLogout} style={styles.logoutBtnFull}>Logout</button>
          </div>
        </div>
      )}
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
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    backgroundColor: "#e11d48",
    color: "white",
    borderRadius: "10px",
    padding: "2px 6px",
    fontSize: "10px",
    fontWeight: "bold",
    minWidth: "16px",
    textAlign: "center",
    border: "2px solid #1B467A",
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
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
  modalOverlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "white", padding: "40px", borderRadius: "16px", width: "100%", maxWidth: "400px",
    position: "relative", boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  closeBtn: {
    position: "absolute", top: "15px", right: "20px", background: "none", border: "none",
    fontSize: "24px", cursor: "pointer", color: "#666"
  },
  avatarLabel: {
    position: "absolute", bottom: "5px", right: "5px", background: "#1B467A", color: "white",
    padding: "6px 12px", borderRadius: "20px", fontSize: "12px", cursor: "pointer",
    display: "flex", alignItems: "center", gap: "5px", border: "2px solid white"
  },
  roleTag: {
    display: "inline-block", padding: "4px 12px", borderRadius: "12px",
    backgroundColor: "#e7f0fd", color: "#1B467A", fontSize: "12px", fontWeight: "600",
    marginTop: "10px", textTransform: "capitalize"
  },
  logoutBtnFull: {
    width: "100%", padding: "12px", backgroundColor: "#dc3545", color: "white",
    border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer"
  }
};
