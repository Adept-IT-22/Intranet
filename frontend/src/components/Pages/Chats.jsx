import { useState, useEffect, useRef } from "react";
import { Plus, Send, Mic, Paperclip } from "lucide-react";
import "./Chats.css"; 

const API_BASE = "http://127.0.0.1:8000/api/chat";

const Chats = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const token = localStorage.getItem("access_token");
  if (!token) console.warn("No JWT token found in localStorage.");

  // Fetch logged-in user & user list
  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE.replace("/chat","")}/auth/user/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCurrentUser(data.username))
      .catch(err => console.error("Error fetching user:", err));

    fetchUsers();
  }, [token]);

  const fetchUsers = () => {
    if (!token) return;

    fetch(`${API_BASE}/users/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Failed to fetch users:", err));
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages[selectedChat]]);

  // WebSocket connection for selected chat
  useEffect(() => {
    if (!selectedChat || !currentUser || !token) return;

    fetchChatHistory(selectedChat);

    const wsUrl = `ws://127.0.0.1:8000/ws/chat/${selectedChat}/?token=${token}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => console.log("✅ WebSocket connected");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "chat_message") {
        setChatMessages(prev => {
          const msgs = prev[selectedChat] || [];

          // Skip duplicates if temp_id exists
          if (data.temp_id && msgs.some(m => m.id === data.temp_id)) return prev;

          const newMsg = {
            id: data.temp_id || crypto.randomUUID(),
            sender: data.sender,
            content: data.message,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isMe: data.sender === currentUser,
            avatar: data.sender === currentUser ? "👤" : "💬",
          };

          return { ...prev, [selectedChat]: [...msgs, newMsg] };
        });
      }

      if (data.type === "typing") {
        setTypingUsers(prev => [...new Set([...prev, data.sender])]);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u !== data.sender));
        }, 1500);
      }

      fetchUsers(); // Optional: update unread counts
    };

    socket.onclose = () => console.log("❌ WebSocket closed");

    return () => socket.close();
  }, [selectedChat, currentUser, token]);

  const fetchChatHistory = (username) => {
    fetch(`${API_BASE}/history/${username}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(msg => ({
          id: msg.id,
          sender: msg.sender,
          content: msg.content,
          time: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isMe: msg.sender === currentUser,
          avatar: msg.sender === currentUser ? "👤" : "💬",
        }));
        setChatMessages(prev => ({ ...prev, [username]: formatted }));
      })
      .catch(err => console.error("Failed to load chat history:", err));
  };

  const sendMessage = () => {
    if (!message.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    const tempId = crypto.randomUUID(); // temp id for optimistic update
    const payload = {
      type: "chat_message",
      sender: currentUser,
      receiver: selectedChat,
      message: message.trim(),
      temp_id: tempId,
    };

    // Optimistic update
    setChatMessages(prev => ({
      ...prev,
      [selectedChat]: [
        ...(prev[selectedChat] || []),
        {
          id: tempId,
          sender: currentUser,
          content: payload.message,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isMe: true,
          avatar: "👤",
          temp: true,
        },
      ],
    }));

    socketRef.current.send(JSON.stringify(payload));
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "typing",
        sender: currentUser,
        receiver: selectedChat,
      }));
    }
  };

  const filteredUsers = users
    .filter(u => u.username !== currentUser)
    .filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()));

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
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="recent-chats-section">
          <h2>Users</h2>
          <div className="recent-chats-list">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => setSelectedChat(user.username)}
                  className={`chat-item ${selectedChat === user.username ? "selected" : ""}`}
                >
                  <div className="chat-avatar"><span>👤</span></div>
                  <div className="chat-info">
                    <p className="chat-name">{user.username}</p>
                    <p className="chat-last-msg">{user.last_message?.slice(0, 25) || "No messages yet"}</p>
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
                  {typingUsers.includes(selectedChat) && <p>Typing...</p>}
                  {typingUsers.length === 0 && <p>Active now</p>}
                </div>
              </div>
            </div>

            <div className="messages-container">
              {(chatMessages[selectedChat] || []).map(msg => (
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
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              <div className="message-input-wrapper">
                <button className="input-icon-btn" title="Attachment" disabled><Paperclip size={20} /></button>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
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
