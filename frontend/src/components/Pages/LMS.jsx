import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";

const LMSPage = () => {
  const lmsLoginUrl = "https://learn.adept-techno.co.ke/login/index.php";
  const [iframeError, setIframeError] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  const handleIframeError = () => {
    setIframeError(true);
  };

  // Fetch notifications (announcements and unread messages)
  useEffect(() => {
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        let count = 0;
        const notificationList = [];

        // Fetch recent announcements (last 7 days)
        try {
          const announcementsRes = await fetch('/api/announcements/', {
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
          const conversationsRes = await fetch('/api/chat/conversations/', {
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
  }, [token]);

  const handleNotificationClick = (link) => {
    setShowNotifications(false);
    navigate(link);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Adept Technologies LMS</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={styles.notificationButton}
              title="Notifications"
            >
              <FaBell size={20} />
              {notificationCount > 0 && (
                <span style={styles.notificationBadge}>{notificationCount > 99 ? '99+' : notificationCount}</span>
              )}
            </button>
            
            {/* Notification Dropdown */}
            {showNotifications && (
              <div style={styles.notificationDropdown}>
                <div style={styles.notificationHeader}>
                  <h3 style={{ margin: 0, fontSize: '16px' }}>Notifications</h3>
                  {notificationCount > 0 && (
                    <span style={styles.notificationCountBadge}>{notificationCount}</span>
                  )}
                </div>
                <div style={styles.notificationList}>
                  {notifications.length === 0 ? (
                    <div style={styles.noNotifications}>No new notifications</div>
                  ) : (
                    notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif.id}
                        style={styles.notificationItem}
                        onClick={() => handleNotificationClick(notif.link)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={styles.notificationIcon}>
                          {notif.type === 'announcement' ? '📢' : '💬'}
                        </div>
                        <div style={styles.notificationContent}>
                          <div style={styles.notificationTitle}>{notif.title}</div>
                          <div style={styles.notificationMessage}>{notif.message}</div>
                          <div style={styles.notificationTime}>
                            {new Date(notif.date).toLocaleDateString()} {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        {notif.count && (
                          <span style={styles.messageCountBadge}>{notif.count}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <div style={styles.notificationFooter}>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate('/dashboard/announcements');
                      }}
                      style={styles.viewAllButton}
                    >
                      View All
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <a
            href={lmsLoginUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={styles.externalLink}
            title="Open in new tab"
          >
            Open in New Tab ↗
          </a>
        </div>
      </div>
      {iframeError ? (
        <div style={styles.fallbackContainer}>
          <div style={styles.fallbackContent}>
            <h3>Unable to embed LMS page</h3>
            <p>Please click the link below to access the LMS login page:</p>
            <a
              href={lmsLoginUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.fallbackLink}
            >
              Go to Adept Technologies LMS Login
            </a>
          </div>
        </div>
      ) : (
        <div style={styles.iframeContainer}>
          <iframe
            src={lmsLoginUrl}
            style={styles.iframe}
            title="Adept Technologies LMS Login"
            allow="fullscreen"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            onError={handleIframeError}
          />
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Arial', sans-serif",
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    color: "#333",
    margin: 0,
    padding: 0,
  },
  header: {
    width: "100%",
    padding: "15px 20px",
    backgroundColor: "#004aad",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    position: "relative",
    zIndex: 1000,
  },
  headerTitle: {
    margin: 0,
    fontSize: "1.25rem",
    fontWeight: "bold",
  },
  notificationButton: {
    position: "relative",
    padding: "8px 12px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.3s ease",
  },
  notificationBadge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    backgroundColor: "#ef4444",
    color: "white",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "bold",
  },
  notificationDropdown: {
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
  },
  notificationHeader: {
    padding: "15px",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notificationCountBadge: {
    backgroundColor: "#004aad",
    color: "white",
    borderRadius: "12px",
    padding: "2px 8px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  notificationList: {
    maxHeight: "400px",
    overflowY: "auto",
  },
  noNotifications: {
    padding: "40px 20px",
    textAlign: "center",
    color: "#6b7280",
  },
  notificationItem: {
    padding: "12px 15px",
    borderBottom: "1px solid #f3f4f6",
    cursor: "pointer",
    display: "flex",
    gap: "12px",
    transition: "background-color 0.2s",
  },
  notificationItemHover: {
    backgroundColor: "#f9fafb",
  },
  notificationIcon: {
    fontSize: "24px",
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationTitle: {
    fontWeight: "600",
    fontSize: "14px",
    color: "#111827",
    marginBottom: "4px",
  },
  notificationMessage: {
    fontSize: "13px",
    color: "#6b7280",
    marginBottom: "4px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  notificationTime: {
    fontSize: "11px",
    color: "#9ca3af",
  },
  messageCountBadge: {
    backgroundColor: "#ef4444",
    color: "white",
    borderRadius: "10px",
    padding: "2px 6px",
    fontSize: "11px",
    fontWeight: "bold",
    alignSelf: "flex-start",
    marginTop: "4px",
  },
  notificationFooter: {
    padding: "10px 15px",
    borderTop: "1px solid #e5e7eb",
    textAlign: "center",
  },
  viewAllButton: {
    padding: "6px 16px",
    backgroundColor: "#004aad",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  externalLink: {
    padding: "8px 16px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    color: "white",
    textDecoration: "none",
    borderRadius: "5px",
    fontSize: "0.9rem",
    fontWeight: 500,
    transition: "background-color 0.3s ease",
  },
  iframeContainer: {
    flex: 1,
    width: "100%",
    height: "calc(100vh - 70px)",
    overflow: "hidden",
    backgroundColor: "#f5f7fa",
  },
  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
    display: "block",
  },
  fallbackContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    padding: "40px",
  },
  fallbackContent: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    maxWidth: "500px",
  },
  fallbackLink: {
    display: "inline-block",
    marginTop: "20px",
    padding: "12px 30px",
    backgroundColor: "#004aad",
    color: "white",
    textDecoration: "none",
    borderRadius: "5px",
    fontWeight: 600,
    transition: "background-color 0.3s ease",
  },
};

export default LMSPage;
