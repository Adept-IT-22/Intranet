import { useState, useEffect, useRef } from "react";
import { Plus, Send, Mic, Paperclip } from "lucide-react";
import { toast } from "react-toastify";
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
  const [unreadCounts, setUnreadCounts] = useState({});
  const [notificationPermission, setNotificationPermission] = useState("default");

  // WhatsApp-style popover menu state
  const [menuState, setMenuState] = useState({ visible: false, msgId: null });

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const windowFocused = useRef(true);

  // 🔊 Notification sound
  const audioContextRef = useRef(null);
  const audioBufferRef = useRef(null);

  const token = localStorage.getItem("access_token");
  if (!token) console.warn("No JWT token found in localStorage.");

  // Handle right-click / long-press on a message
  const handleMessageContext = (e, msgId) => {
    e.preventDefault(); // prevent default context menu
    setMenuState({ visible: true, msgId });
  };

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();

    fetch("/sounds/notify.mp3")
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => audioContextRef.current.decodeAudioData(arrayBuffer))
      .then(decodedData => {
        audioBufferRef.current = decodedData;
      })
      .catch(err => console.error("Failed to load audio:", err));

    const unlockAudio = () => {
      if (audioContextRef.current.state === "suspended") audioContextRef.current.resume();
      window.removeEventListener("click", unlockAudio);
    };
    window.addEventListener("click", unlockAudio);

    return () => window.removeEventListener("click", unlockAudio);
  }, []);

  const playNotificationSound = () => {
    if (!audioBufferRef.current || !audioContextRef.current) return;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBufferRef.current;
    source.connect(audioContextRef.current.destination);
    source.start(0);
  };

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === "default") {
        Notification.requestPermission().then(permission => setNotificationPermission(permission));
      }
    }
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      windowFocused.current = true;
      if (selectedChat) setUnreadCounts(prev => ({ ...prev, [selectedChat]: 0 }));
    };
    const handleBlur = () => (windowFocused.current = false);
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedChat) setUnreadCounts(prev => ({ ...prev, [selectedChat]: 0 }));
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [selectedChat]);

  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE.replace("/chat", "")}/auth/user/`, {
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages[selectedChat]]);

  const showBrowserNotification = (sender, messageContent) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const notification = new Notification(`New message from ${sender}`, {
      body: messageContent.length > 50 ? messageContent.substring(0, 50) + "..." : messageContent,
      icon: "/favicon.ico",
      tag: `chat-${sender}`,
    });
    notification.onclick = () => {
      window.focus();
      setSelectedChat(sender);
      notification.close();
    };
    setTimeout(() => notification.close(), 5000);
  };

  useEffect(() => {
    if (!selectedChat || !currentUser || !token) return;

    fetchChatHistory(selectedChat);

    const wsUrl = `ws://127.0.0.1:8000/ws/chat/${selectedChat}/?token=${token}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => console.log("✅ WebSocket connected");

    socket.onmessage = event => {
      const data = JSON.parse(event.data);

      if (data.type === "chat_message") {
        if (data.sender === currentUser) return;

        const newMsg = {
          id: crypto.randomUUID(),
          sender: data.sender,
          content: data.message,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isMe: false,
          avatar: "💬",
        };

        setChatMessages(prev => {
          const msgs = prev[data.sender] || [];
          return { ...prev, [data.sender]: [...msgs, newMsg] };
        });

        const shouldNotify = selectedChat !== data.sender || !windowFocused.current || document.hidden;
        if (shouldNotify) {
          setUnreadCounts(prev => ({ ...prev, [data.sender]: (prev[data.sender] || 0) + 1 }));
          playNotificationSound();
          showBrowserNotification(data.sender, data.message);
        }
      }

      if (data.type === "typing") {
        setTypingUsers(prev => [...new Set([...prev, data.sender])]);
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u !== data.sender));
        }, 1500);
      }

      if (data.type === "delete_message") {
        setChatMessages(prev => ({
          ...prev,
          [data.chat]: prev[data.chat]?.filter(msg => msg.id !== data.message_id) || []
        }));
      }

      fetchUsers();
    };

    socket.onerror = error => console.error("WebSocket error:", error);
    socket.onclose = () => console.log("❌ WebSocket closed");

    return () => {
      if (socket.readyState === WebSocket.OPEN) socket.close();
    };
  }, [selectedChat, currentUser, token]);

  const fetchChatHistory = username => {
    fetch(`${API_BASE}/history/${username}/`, { headers: { Authorization: `Bearer ${token}` } })
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

    const tempId = crypto.randomUUID();
    const payload = {
      type: "chat_message",
      sender: currentUser,
      receiver: selectedChat,
      message: message.trim(),
      temp_id: tempId,
    };

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

  const handleKeyPress = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "typing", sender: currentUser, receiver: selectedChat }));
    }
  };

  // Delete functions
  const deleteMessageForMe = (msgId) => {
    if (!selectedChat) return;
    setChatMessages(prev => ({
      ...prev,
      [selectedChat]: prev[selectedChat].filter(msg => msg.id !== msgId)
    }));
    toast.success("Deleted for you", { autoClose: 2000 });
    setMenuState({ visible: false, msgId: null });
  };

  const deleteMessageForEveryone = (msgId) => {
    if (!selectedChat) return;
    setChatMessages(prev => ({
      ...prev,
      [selectedChat]: prev[selectedChat].filter(msg => msg.id !== msgId)
    }));
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "delete_message",
        message_id: msgId,
        chat: selectedChat,
        delete_for_everyone: true
      }));
    }
    toast.success("Deleted for everyone", { autoClose: 2000 });
    setMenuState({ visible: false, msgId: null });
  };

  useEffect(() => {
    const handleClickOutside = () => setMenuState({ visible: false, msgId: null });
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const filteredUsers = users
    .filter(u => u.username !== currentUser)
    .filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  useEffect(() => {
    const baseTitle = "Chat";
    document.title = totalUnread > 0 ? `(${totalUnread}) ${baseTitle}` : baseTitle;
  }, [totalUnread]);

  return (
    <div className="chat-container">
      {notificationPermission === "default" && (
        <div
          style={{ background: "#4CAF50", color: "white", padding: "10px", textAlign: "center", cursor: "pointer" }}
          onClick={() => Notification.requestPermission().then(permission => setNotificationPermission(permission))}
        >
          🔔 Click here to enable desktop notifications
        </div>
      )}

      <div className="chat-sidebar">
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-logo"><span>✨</span></div>
            <h1>Chat {totalUnread > 0 && `(${totalUnread})`}</h1>
          </div>
          <button className="create-chat-btn" title="Create new chat">
            <Plus size={16} /><span>Create Chat</span>
          </button>
        </div>

        <div className="search-bar">
          <input type="text" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        <div className="recent-chats-section">
          <h2>Users</h2>
          <div className="recent-chats-list">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => { setSelectedChat(user.username); setUnreadCounts(prev => ({ ...prev, [user.username]: 0 })); }}
                  className={`chat-item ${selectedChat === user.username ? "selected" : ""}`}
                >
                  <div className="chat-avatar"><span>👤</span></div>
                  <div className="chat-info">
                    <p className="chat-name">{user.username}</p>
                    <p className="chat-last-msg">{user.last_message?.slice(0, 25) || "No messages yet"}</p>
                  </div>
                  {unreadCounts[user.username] > 0 && <span className="unread-badge">{unreadCounts[user.username]}</span>}
                </div>
              ))
            ) : (
              <div style={{ padding: "10px" }}>No users found</div>
            )}
          </div>
        </div>
      </div>

      {/* Chat main */}
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
                <div
                  key={msg.id}
                  className={`message-wrapper ${msg.isMe ? "my-message" : "other-message"}`}
                  onContextMenu={(e) => handleMessageContext(e, msg.id)}
                >
                  <div className="message-content">
                    <div className="message-avatar">{msg.avatar}</div>
                    <div className="message-bubble-wrapper">
                      <div className={`message-bubble ${msg.isMe ? "my-bubble" : "other-bubble"}`}>
                        <p>{msg.content}</p>
                      </div>
                      <p className="message-info">{msg.sender} • {msg.time}</p>
                    </div>
                  </div>

                  {/* WhatsApp-style popover */}
                  {menuState.visible && menuState.msgId === msg.id && (
                    <div className="message-menu left" onClick={(e) => e.stopPropagation()}>
                      {msg.isMe && <button onClick={() => deleteMessageForMe(msg.id)}>Delete for me</button>}
                      <button onClick={() => deleteMessageForEveryone(msg.id)}>Delete for everyone</button>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              <div className="message-input-wrapper">
                <button className="input-icon-btn" title="Attachment" disabled><Paperclip size={20} /></button>
                <textarea value={message} onChange={e => setMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Message" className="message-input" rows={1} />
                <button className="input-icon-btn" title="Voice" disabled><Mic size={20} /></button>
                <button onClick={sendMessage} className={`send-btn ${!message.trim() ? "disabled" : ""}`} disabled={!message.trim()} title="Send"><Send size={20} /></button>
              </div>
            </div>
          </>
        ) : <div className="no-chat-selected">Select a chat to start messaging</div>}
      </div>
    </div>
  );
};

export default Chats;
