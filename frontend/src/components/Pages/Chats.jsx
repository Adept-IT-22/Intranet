import { useState, useEffect, useRef } from "react";
import { Plus, Send, Mic, Paperclip } from "lucide-react";
import "./chats.css";

const API_BASE = "http://127.0.0.1:8000/api/chat";

const Chats = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch logged-in user & user list on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return console.error("❌ No token found. Please log in.");

    fetch("http://127.0.0.1:8000/api/auth/user/", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setCurrentUser(data.username))
      .catch((err) => console.error("❌ Error fetching user:", err));

    fetchUsers();
  }, []);

  const fetchUsers = () => {
    const token = localStorage.getItem("access_token");
    fetch(`${API_BASE}/users/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error("❌ Failed to fetch users:", err));
  };

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages[selectedChat]]);

  // WebSocket connection
  useEffect(() => {
    if (!selectedChat || !currentUser) return;

    const token = localStorage.getItem("access_token");
    const roomName = [currentUser, selectedChat].sort().join("_");
    const wsUrl = `ws://127.0.0.1:8000/ws/chat/${roomName}/?token=${token}`;

    fetchChatHistory(selectedChat);

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => console.log("✅ WebSocket connected");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const newMsg = {
        id: crypto.randomUUID(),
        sender: data.sender,
        content: data.message,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMe: data.sender === currentUser,
        avatar: data.sender === currentUser ? "👤" : "💬",
      };

      setChatMessages((prev) => ({
        ...prev,
        [selectedChat]: [...(prev[selectedChat] || []), newMsg],
      }));

      fetchUsers();
    };

    socket.onclose = () => console.log("❌ WebSocket closed");

    return () => socket.close();
  }, [selectedChat, currentUser]);

  const fetchChatHistory = (username) => {
    const token = localStorage.getItem("access_token");
    fetch(`${API_BASE}/history/${username}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((msg) => ({
          id: msg.id,
          sender: msg.sender,
          content: msg.content,
          time: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isMe: msg.sender === currentUser,
          avatar: msg.sender === currentUser ? "👤" : "💬",
        }));
        setChatMessages((prev) => ({ ...prev, [username]: formatted }));
      })
      .catch((err) => console.error("❌ Failed to load chat history:", err));
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("❌ WebSocket not connected!");
      return;
    }

    const payload = {
      sender: currentUser,
      receiver: selectedChat,
      message: message.trim(),
    };

    socketRef.current.send(JSON.stringify(payload));
    setMessage("");

    // Update local chat immediately
    setChatMessages((prev) => ({
      ...prev,
      [selectedChat]: [
        ...(prev[selectedChat] || []),
        {
          id: crypto.randomUUID(),
          sender: currentUser,
          content: payload.message,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isMe: true,
          avatar: "👤",
        },
      ],
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredUsers = users
    .filter((u) => u.username !== currentUser)
    .filter((u) => u.username.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-logo"><span>✨</span></div>
            <h1>Chat</h1>
          </div>
          <button className="create-chat-btn" title="Create new chat">
            <Plus size={16} /><span>Create Chat</span>
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="recent-chats-section">
          <h2>Users</h2>
          <div className="recent-chats-list">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedChat(user.username)}
                  className={`chat-item ${selectedChat === user.username ? "selected" : ""}`}
                >
                  <div className="chat-avatar"><span>👤</span></div>
                  <div className="chat-info">
                    <p className="chat-name">{user.username}</p>
                    <p className="chat-last-msg">{user.last_message ? user.last_message.slice(0, 25) : "No messages yet"}</p>
                  </div>
                  {user.unread_count > 0 && <span className="unread-badge">{user.unread_count}</span>}
                </div>
              ))
            ) : <div style={{ padding: "10px" }}>No users found</div>}
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="chat-main">
        {selectedChat ? (
          <>
            <div className="chat-main-header">
              <div className="chat-main-header-content">
                <div className="current-chat-avatar"><span>{selectedChat[0]}</span></div>
                <div className="current-chat-info">
                  <h2>{selectedChat}</h2>
                  <p>Active now</p>
                </div>
              </div>
            </div>

            <div className="messages-container">
              {(chatMessages[selectedChat] || []).map((msg) => (
                <div key={msg.id} className={`message-wrapper ${msg.isMe ? "my-message" : "other-message"}`}>
                  <div className="message-content">
                    <div className="message-avatar">{msg.avatar}</div>
                    <div className="message-bubble-wrapper">
                      <div className={`message-bubble ${msg.isMe ? "my-bubble" : "other-bubble"}`}>
                        <p>{msg.content}</p>
                      </div>
                      <p className="message-info">{msg.sender} • {msg.time}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && <div className="typing-indicator">Typing...</div>}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              <div className="message-input-wrapper">
                <button className="input-icon-btn" title="Attachment" disabled><Paperclip size={20} /></button>
                <textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setIsTyping(true);
                    setTimeout(() => setIsTyping(false), 1000);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Message"
                  className="message-input"
                  rows={1}
                />
                <button className="input-icon-btn" title="Voice" disabled><Mic size={20} /></button>
                <button
                  onClick={sendMessage}
                  className={`send-btn ${!message.trim() ? "disabled" : ""}`}
                  disabled={!message.trim()}
                  title="Send"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : <div style={{ padding: "20px" }}>👈 Select a user to start chatting</div>}
      </div>
    </div>
  );
};

export default Chats;
