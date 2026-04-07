import { useState, useEffect, useRef } from "react";
import { Send, Phone, Video, MoreVertical, Search } from "lucide-react";
import api from "../../api";
import "./SimpleChat.css";

const SimpleChat = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [lastMessageTime, setLastMessageTime] = useState({}); // Track last message time for each user
  const [previousMessageCounts, setPreviousMessageCounts] = useState({}); // Track message counts for notifications
  const [unreadCount, setUnreadCount] = useState(0); // Track total unread messages
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("access_token");

  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Function to show notification
  const showNotification = (sender, messageContent) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(`New message from ${sender}`, {
        body: messageContent,
        icon: "/favicon.png", // Changed to .png to match existing file
        tag: `chat-${sender}`, // Prevents duplicate notifications from same sender
      });

      // Auto-close notification after 5 seconds
      setTimeout(() => notification.close(), 5000);

      // Click notification to focus on chat
      notification.onclick = () => {
        window.focus();
        setSelectedChat(sender);
        notification.close();
      };
    }
  };

  // Fetch current user and users list
  useEffect(() => {
    if (!token) return;

    // Get current user
    api.get("/auth/user/")
      .then(res => setCurrentUser(res.data.username))
      .catch(err => console.error("Error fetching user:", err));

    // Get users list
    api.get("/chat/users/")
      .then(res => {
        setUsers(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => console.error("Error fetching users:", err));
  }, [token]);

  // Poll for messages every 2 seconds (simple and reliable)
  useEffect(() => {
    if (!selectedChat || !token) return;

    const pollMessages = () => {
      api.get(`/chat/history/${selectedChat}/`)
        .then(res => {
          const data = res.data;
          const formattedMessages = Array.isArray(data) ? data.map(msg => ({
            id: msg.id,
            sender: msg.sender,
            content: msg.content || msg.message, // Handle both field names
            timestamp: msg.timestamp,
            isMe: msg.sender === currentUser,
          })) : [];

          // Check for new messages and show notifications
          const previousMessages = messages[selectedChat] || [];
          const previousCount = previousMessageCounts[selectedChat] || 0;

          if (formattedMessages.length > previousCount && previousCount > 0) {
            // New message detected
            const newMessages = formattedMessages.slice(previousCount);
            newMessages.forEach(msg => {
              if (!msg.isMe) { // Only notify for messages from others
                showNotification(msg.sender, msg.content);
              }
            });
          }

          // Update message counts for notification tracking
          setPreviousMessageCounts(prev => ({
            ...prev,
            [selectedChat]: formattedMessages.length
          }));

          // Update last message time for sorting
          if (formattedMessages.length > 0) {
            const lastMsg = formattedMessages[formattedMessages.length - 1];
            setLastMessageTime(prev => ({
              ...prev,
              [selectedChat]: new Date(lastMsg.timestamp).getTime()
            }));
          }

          setMessages(prev => ({ ...prev, [selectedChat]: formattedMessages }));
        })
        .catch(err => console.error("Error fetching messages:", err));
    };

    // Initial load
    pollMessages();

    // Poll every 2 seconds
    const interval = setInterval(pollMessages, 2000);
    return () => clearInterval(interval);
  }, [selectedChat, currentUser, token, messages, previousMessageCounts]);

  // Global polling for all users to detect new messages and update recent activity
  useEffect(() => {
    if (!currentUser || !token || users.length === 0) return;

    const pollAllUsers = () => {
      users.forEach(user => {
        if (user.username !== currentUser) {
          api.get(`/chat/history/${user.username}/`)
            .then(res => {
              const data = res.data;
              const messageList = Array.isArray(data) ? data : [];

              // Update last message time for sorting
              if (messageList.length > 0) {
                const lastMsg = messageList[messageList.length - 1];
                const lastMsgTime = new Date(lastMsg.timestamp).getTime();

                setLastMessageTime(prev => {
                  const currentTime = prev[user.username] || 0;
                  if (lastMsgTime > currentTime) {
                    // New message detected for this user
                    if (currentTime > 0 && lastMsg.sender !== currentUser) {
                      // Show notification only if we had previous messages and it's not from current user
                      showNotification(lastMsg.sender, lastMsg.content || lastMsg.message);
                      // Update unread count for tab title
                      setUnreadCount(prev => prev + 1);
                    }
                    return { ...prev, [user.username]: lastMsgTime };
                  }
                  return prev;
                });
              }
            })
            .catch(err => console.error(`Error fetching messages for ${user.username}:`, err));
        }
      });
    };

    // Initial load to populate last message times
    pollAllUsers();

    // Poll every 5 seconds for global updates (less frequent than selected chat)
    const globalInterval = setInterval(pollAllUsers, 5000);
    return () => clearInterval(globalInterval);
  }, [currentUser, token, users]);

  // Update browser tab title with unread count
  useEffect(() => {
    const originalTitle = "Intranet - Chat";
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }

    // Clear unread count when user focuses on the window
    const handleFocus = () => {
      setUnreadCount(0);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [unreadCount]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages[selectedChat]]);

  const sendMessage = async () => {
    if (!message.trim() || !selectedChat || !token) return;

    try {
      const response = await api.post(`/chat/send/${selectedChat}/`, {
        message: message.trim()
      });

      if (response.status === 200 || response.status === 201) {
        setMessage("");
        // Message will appear via polling
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredUsers = users
    .filter(user =>
      user.username !== currentUser &&
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by recent activity (most recent first)
      const timeA = lastMessageTime[a.username] || 0;
      const timeB = lastMessageTime[b.username] || 0;
      return timeB - timeA; // Most recent first
    });


  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="teams-chat-container">
      {/* Sidebar */}
      <div className="teams-sidebar">
        <div className="teams-header">
          <h2>Chat</h2>
        </div>

        <div className="teams-search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="teams-contacts">
          <h3>Recent</h3>
          <div className="teams-contact-list">
            {filteredUsers.map(user => (
              <div
                key={user.id}
                className={`teams-contact ${selectedChat === user.username ? "active" : ""}`}
                onClick={() => setSelectedChat(user.username)}
              >
                <div className="teams-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="teams-contact-info">
                  <div className="teams-contact-name">
                    {user.username}
                    {lastMessageTime[user.username] && (
                      <span className="recent-indicator">●</span>
                    )}
                  </div>
                  <div className="teams-contact-status">
                    {lastMessageTime[user.username]
                      ? `Last active ${formatTime(lastMessageTime[user.username])}`
                      : "Available"
                    }
                  </div>
                </div>
                <div className="teams-contact-time">
                  {lastMessageTime[user.username] &&
                    formatTime(lastMessageTime[user.username])
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="teams-main">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="teams-chat-header">
              <div className="teams-chat-user">
                <div className="teams-avatar">
                  {selectedChat.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="teams-chat-name">{selectedChat}</div>
                  <div className="teams-chat-status">Available</div>
                </div>
              </div>
              <div className="teams-chat-actions">
                <button className="teams-action-btn" title="Call">
                  <Phone size={20} />
                </button>
                <button className="teams-action-btn" title="Video Call">
                  <Video size={20} />
                </button>
                <button className="teams-action-btn" title="More">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="teams-messages">
              {(messages[selectedChat] || []).map(msg => (
                <div key={msg.id} className={`teams-message ${msg.isMe ? "own" : "other"}`}>
                  {!msg.isMe && (
                    <div className="teams-message-avatar">
                      {msg.sender.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="teams-message-content">
                    {!msg.isMe && <div className="teams-message-sender">{msg.sender}</div>}
                    <div className="teams-message-bubble">
                      {msg.content}
                    </div>
                    <div className="teams-message-time">
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="teams-input-area">
              <div className="teams-input-container">
                <input
                  type="text"
                  placeholder={`Message ${selectedChat}`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="teams-message-input"
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="teams-send-btn"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="teams-welcome">
            <div className="teams-welcome-content">
              <h2>Welcome to Chat</h2>
              <p>Select a person from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleChat;
