import { useState, useEffect, useRef } from "react";
import { Plus, Send, Mic, Paperclip, X, Users, Edit2, Trash2, Check, X as XIcon, File, Download, Pencil } from "lucide-react";
import "./Chats.css";

const API_BASE = "/api/chat";

// UUID generator that works in all browsers
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for browsers that don't support crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper to get backend base URL (for WebSocket and attachment URLs)
const getBackendBaseUrl = () => {
  // Use current host for WebSocket and images
  const hostname = window.location.hostname;
  const protocol = window.location.protocol === 'https:' ? 'https' : 'http';

  // If we're on localhost:5173 (Vite), point to 8001
  if (window.location.port === '5173' || window.location.port === '3000') {
    return `${protocol}://${hostname}:8001`;
  }

  // In production, assume same host/port or proxy handled it
  return `${protocol}://${hostname}${window.location.port ? `:${window.location.port}` : ""}`;
};

const Chats = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [typingUsers, setTypingUsers] = useState([]);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showCreateDirectModal, setShowCreateDirectModal] = useState(false);
  const [showManageParticipantsModal, setShowManageParticipantsModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [conversationDetails, setConversationDetails] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageContent, setEditMessageContent] = useState("");
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingGroupName, setEditingGroupName] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const fileInputRef = useRef(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const selectedFileRef = useRef(null); // Persist file across re-renders
  const isSendingMessageRef = useRef(false); // Flag to prevent fetch during message send
  const lastSentMessageIdRef = useRef(null); // Track last sent message ID

  const token = localStorage.getItem("access_token");
  if (!token) console.warn("No JWT token found in localStorage.");

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('✅ Notification permission granted');
        } else {
          console.log('❌ Notification permission denied');
        }
      });
    }
  }, []);

  // Helper function to show browser notification
  const showNotification = (title, body, icon = null) => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      // Check if page is visible - only show notification if page is hidden
      if (document.hidden) {
        new Notification(title, {
          body: body,
          icon: icon || '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'chat-message', // Replace previous notifications with same tag
        });
      }
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted' && document.hidden) {
          new Notification(title, {
            body: body,
            icon: icon || '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'chat-message',
          });
        }
      });
    }
  };

  // Fetch logged-in user & user list
  useEffect(() => {
    if (!token) return;

    fetch(`${API_BASE.replace("/chat", "")}/auth/user/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setCurrentUser(data.username);
        setCurrentUserId(data.id);
      })
      .catch(err => console.error("Error fetching user:", err));

    fetchUsers();
    fetchConversations();
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

  const fetchConversations = () => {
    if (!token) return;

    fetch(`${API_BASE}/conversations/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setConversations(data))
      .catch(err => console.error("Failed to fetch conversations:", err));
  };


  const markAsRead = (conversationId) => {
    if (!token || !conversationId) return;

    fetch(`${API_BASE}/conversations/${conversationId}/mark-read/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.ok) {
          setConversations(prev =>
            prev.map(conv =>
              conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
            )
          );
        }
      })
      .catch(err => console.error("Failed to mark as read:", err));
  };

  // Fetch conversation details when selected
  useEffect(() => {
    if (!selectedConversation || !token) return;

    fetch(`${API_BASE}/conversations/${selectedConversation.id}/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setConversationDetails(data);
        // Check if current user is admin
        const currentUserParticipant = data.participants.find(p => p.username === currentUser);
        setIsAdmin(currentUserParticipant?.role === 'admin' || data.created_by === currentUser);

        // Mark as read when selected
        markAsRead(selectedConversation.id);
      })
      .catch(err => console.error("Failed to fetch conversation details:", err));
  }, [selectedConversation, token, currentUser]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages[selectedConversation?.id]]);

  // WebSocket connection for selected conversation
  useEffect(() => {
    if (!selectedConversation || !currentUser || !token) return;

    // Only fetch if we're not currently sending a message
    if (!isSendingMessageRef.current) {
      fetchConversationMessages(selectedConversation.id);
    }

    const backendBase = getBackendBaseUrl();
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsHost = backendBase.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}://${wsHost}/ws/chat/${selectedConversation.id}/?token=${token}`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "chat_message") {
          const convId = selectedConversation.id;
          const isFromMe = data.sender === currentUser;

          if (isFromMe && isSendingMessageRef.current) {
            return;
          }

          if (!isFromMe) {
            const notificationTitle = selectedConversation.type === 'group'
              ? `${data.sender} in ${selectedConversation.name}`
              : data.sender;
            const notificationBody = data.message || (data.attachment ? `📎 ${data.attachment.name}` : 'New message');
            showNotification(notificationTitle, notificationBody);
          }

          if (!isFromMe && selectedConversation?.id === convId) {
            markAsRead(convId);
          }

          setChatMessages(prev => {
            const msgs = prev[convId] || [];
            const messageId = data.message_id || data.temp_id;

            const exists = msgs.some(m => !m.temp && (m.id === messageId || String(m.id) === String(messageId)));
            if (exists) return prev;

            let attachment = data.attachment;
            if (attachment && attachment.url && !attachment.url.startsWith('http')) {
              attachment = { ...attachment, url: `${getBackendBaseUrl()}${attachment.url.startsWith('/') ? '' : '/'}${attachment.url}` };
            }

            const newMsg = {
              id: messageId || generateUUID(),
              sender: data.sender,
              content: data.message || (attachment ? `📎 ${attachment.name}` : ""),
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              isMe: isFromMe,
              avatar: isFromMe ? "👤" : "💬",
              attachment: attachment || null,
            };

            return { ...prev, [convId]: [...msgs, newMsg] };
          });
        }

        if (data.type === "message_edited") {
          setChatMessages(prev => {
            const msgs = prev[selectedConversation.id] || [];
            return {
              ...prev,
              [selectedConversation.id]: msgs.map(m =>
                m.id === data.message_id ? { ...m, content: data.content, edited_at: data.edited_at } : m
              ),
            };
          });
        }

        if (data.type === "message_deleted") {
          setChatMessages(prev => {
            const msgs = prev[selectedConversation.id] || [];
            return {
              ...prev,
              [selectedConversation.id]: msgs.map(m =>
                m.id === data.message_id ? { ...m, content: "[Message deleted]", is_deleted: true } : m
              ),
            };
          });
        }

        if (data.type === "typing") {
          setTypingUsers(prev => [...new Set([...prev, data.sender])]);
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setTypingUsers(prev => prev.filter(u => u !== data.sender));
          }, 1500);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onclose = () => {
      console.log("❌ WebSocket closed");
    };

    return () => socket.close();
  }, [selectedConversation, currentUser, token]);

  const fetchConversationMessages = (conversationId, mergeMode = false) => {
    if (!conversationId || !token) return;
    if (isSendingMessageRef.current && mergeMode === false) return;

    fetch(`${API_BASE}/conversations/${conversationId}/history/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(msg => {
          let attachment = msg.attachment;
          if (attachment && attachment.url && !attachment.url.startsWith('http')) {
            attachment = { ...attachment, url: `${getBackendBaseUrl()}${attachment.url.startsWith('/') ? '' : '/'}${attachment.url}` };
          }

          return {
            id: msg.id,
            sender: msg.sender,
            content: msg.content,
            time: new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isMe: msg.is_me,
            avatar: msg.is_me ? "👤" : "💬",
            edited_at: msg.edited_at,
            is_deleted: msg.is_deleted,
            attachment: attachment,
          };
        });

        setChatMessages(prev => {
          const existing = prev[conversationId] || [];
          const savedIds = new Set(formatted.map(m => String(m.id)));
          const temps = existing.filter(m => m.temp);
          const deduped = [...formatted, ...temps.filter(t => !savedIds.has(String(t.id)))];
          return { ...prev, [conversationId]: deduped.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)) };
        });
      })
      .catch(err => console.error("Failed to load messages:", err));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) return alert("File size must be less than 10MB");
      setSelectedFile(file);
      selectedFileRef.current = file;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const sendMessage = async () => {
    const fileToUse = selectedFile || selectedFileRef.current;
    if ((!message.trim() && !fileToUse) || !selectedConversation) return;

    const messageContent = message.trim();
    isSendingMessageRef.current = true;
    setMessage("");
    setSelectedFile(null);
    selectedFileRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";

    const tempId = generateUUID();
    setChatMessages(prev => ({
      ...prev,
      [selectedConversation.id]: [
        ...(prev[selectedConversation.id] || []),
        { id: tempId, sender: currentUser, content: messageContent || (fileToUse ? `📎 ${fileToUse.name}` : ""), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), isMe: true, avatar: "👤", temp: true, attachment: fileToUse ? { name: fileToUse.name, size: fileToUse.size } : null },
      ],
    }));

    try {
      const formData = new FormData();
      if (messageContent) formData.append("message", messageContent);
      if (fileToUse) formData.append("attachment", fileToUse);

      const response = await fetch(`${API_BASE}/conversations/${selectedConversation.id}/send/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const saved = await response.json();
        setChatMessages(prev => {
          const msgs = (prev[selectedConversation.id] || []).filter(m => m.id !== tempId);
          let attachment = saved.attachment;
          if (attachment && attachment.url && !attachment.url.startsWith('http')) {
            attachment = { ...attachment, url: `${getBackendBaseUrl()}${attachment.url.startsWith('/') ? '' : '/'}${attachment.url}` };
          }
          return { ...prev, [selectedConversation.id]: [...msgs, { id: saved.id, sender: saved.sender, content: saved.content, time: new Date(saved.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), isMe: true, avatar: "👤", attachment }] };
        });
        fetchConversations();
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      isSendingMessageRef.current = false;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: "typing", sender: currentUser, conversation_id: selectedConversation?.id }));
    }
  };

  const createDirectChat = (userId) => {
    fetch(`${API_BASE}/conversations/create-direct/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ user_id: userId }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setShowCreateDirectModal(false);
          fetchConversations();
          setSelectedConversation(data);
        }
      });
  };

  const createGroupChat = () => {
    fetch(`${API_BASE}/conversations/create-group/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: groupName.trim(), participant_ids: selectedParticipants }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setShowCreateGroupModal(false);
          setGroupName("");
          setSelectedParticipants([]);
          fetchConversations();
          setSelectedConversation(data);
        }
      });
  };

  const toggleParticipant = (userId) => {
    setSelectedParticipants(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const editMessage = (id, content) => {
    setEditingMessageId(id);
    setEditMessageContent(content);
  };

  const saveEditedMessage = async () => {
    const response = await fetch(`${API_BASE}/conversations/${selectedConversation.id}/messages/${editingMessageId}/edit/`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: editMessageContent.trim() }),
    });
    if (response.ok) {
      setEditingMessageId(null);
      fetchConversationMessages(selectedConversation.id, true);
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm("Are you sure?")) return;
    const response = await fetch(`${API_BASE}/conversations/${selectedConversation.id}/messages/${id}/delete/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) fetchConversationMessages(selectedConversation.id, true);
  };

  const handleUpdateGroupName = async () => {
    if (!newGroupName.trim() || !selectedConversation) return;
    try {
      const response = await fetch(`${API_BASE}/conversations/${selectedConversation.id}/update-name/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newGroupName.trim() }),
      });
      if (response.ok) {
        setEditingGroupName(false);
        fetchConversations();
        setSelectedConversation(prev => ({ ...prev, name: newGroupName.trim() }));
      }
    } catch (err) {
      console.error("Error updating group name:", err);
    }
  };

  const handleAddParticipant = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/conversations/${selectedConversation.id}/manage-participants/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: "add", user_id: userId }),
      });
      if (response.ok) {
        setShowAddParticipantModal(false);
        // Refresh details
        fetch(`${API_BASE}/conversations/${selectedConversation.id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(data => setConversationDetails(data));
      }
    } catch (err) {
      console.error("Error adding participant:", err);
    }
  };

  const handleRemoveParticipant = async (userId) => {
    if (!confirm("Are you sure you want to remove this person?")) return;
    try {
      const response = await fetch(`${API_BASE}/conversations/${selectedConversation.id}/manage-participants/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: "remove", user_id: userId }),
      });
      if (response.ok) {
        // Refresh details
        fetch(`${API_BASE}/conversations/${selectedConversation.id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(data => setConversationDetails(data));
      }
    } catch (err) {
      console.error("Error removing participant:", err);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-logo"><span>✨</span></div>
            <h1>Chat</h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="create-chat-btn" onClick={() => setShowCreateDirectModal(true)}><Plus size={14} /><span>Private</span></button>
            <button className="create-chat-btn" onClick={() => setShowCreateGroupModal(true)}><Users size={14} /><span>Group</span></button>
          </div>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Search conversations..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="recent-chats-section">
          <h2>Conversations</h2>
          <div className="recent-chats-list">
            {filteredConversations.map(conv => (
              <div key={conv.id} onClick={() => setSelectedConversation(conv)} className={`chat-item ${selectedConversation?.id === conv.id ? "selected" : ""}`}>
                <div className="chat-avatar">{conv.is_group ? <Users size={20} /> : <span>👤</span>}</div>
                <div className="chat-info">
                  <p className="chat-name">{conv.name}</p>
                  <p className="chat-last-msg">{conv.last_message}</p>
                </div>
                {conv.unread_count > 0 && <span className="unread-badge">{conv.unread_count}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chat-main">
        {selectedConversation ? (
          <>
            <div className="chat-main-header">
              <div className="chat-main-header-content">
                <div className="current-chat-avatar" onClick={() => selectedConversation.is_group && setShowManageParticipantsModal(true)} style={{ cursor: selectedConversation.is_group ? 'pointer' : 'default' }}>
                  {selectedConversation.is_group ? <Users size={24} /> : <span>{selectedConversation.name ? selectedConversation.name[0] : "?"}</span>}
                </div>
                <div className="current-chat-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {editingGroupName ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="text"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          className="edit-name-input"
                          autoFocus
                        />
                        <button className="icon-btn-small" onClick={handleUpdateGroupName}><Check size={16} /></button>
                        <button className="icon-btn-small" onClick={() => setEditingGroupName(false)}><XIcon size={16} /></button>
                      </div>
                    ) : (
                      <>
                        <h2 onClick={() => {
                          if (selectedConversation.is_group && isAdmin) {
                            setEditingGroupName(true);
                            setNewGroupName(selectedConversation.name);
                          }
                        }} style={{ cursor: (selectedConversation.is_group && isAdmin) ? 'pointer' : 'default' }}>
                          {selectedConversation.name}
                        </h2>
                        {selectedConversation.is_group && isAdmin && <Pencil size={14} className="edit-icon" onClick={() => { setEditingGroupName(true); setNewGroupName(selectedConversation.name); }} />}
                      </>
                    )}
                  </div>
                  <p onClick={() => selectedConversation.is_group && setShowManageParticipantsModal(true)} style={{ cursor: selectedConversation.is_group ? 'pointer' : 'default' }}>
                    {selectedConversation.is_group ? `${conversationDetails?.participants?.length || 0} participants` : "Private conversation"}
                  </p>
                </div>

                {selectedConversation.is_group && (
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                    <button className="icon-btn" onClick={() => setShowManageParticipantsModal(true)} title="Manage Group"><Users size={20} /></button>
                  </div>
                )}
              </div>
            </div>
            <div className="messages-container">
              {(chatMessages[selectedConversation.id] || []).map(msg => (
                <div key={msg.id} className={`message-wrapper ${msg.isMe ? "my-message" : "other-message"}`} onMouseEnter={() => setHoveredMessageId(msg.id)} onMouseLeave={() => setHoveredMessageId(null)}>
                  <div className="message-content">
                    <div className="message-avatar">{msg.avatar}</div>
                    <div className="message-bubble-wrapper">
                      <div className={`message-bubble ${msg.isMe ? "my-bubble" : "other-bubble"}`}>
                        {msg.attachment && <div className="message-attachment"><File size={16} /><div className="attachment-info"><a href={msg.attachment.url} target="_blank" rel="noreferrer" className="attachment-link">{msg.attachment.name}</a><span className="attachment-size">{formatFileSize(msg.attachment.size)}</span></div><a href={msg.attachment.url} download={msg.attachment.name} className="attachment-download"><Download size={14} /></a></div>}
                        <p>{msg.content}</p>
                      </div>
                      <div className="message-info-row">
                        <p className="message-info">{msg.sender} • {msg.time}</p>
                        {msg.isMe && hoveredMessageId === msg.id && !msg.is_deleted && (
                          <div className="message-actions">
                            <button className="message-action-btn" onClick={() => editMessage(msg.id, msg.content)}><Edit2 size={14} /></button>
                            <button className="message-action-btn" onClick={() => deleteMessage(msg.id)}><Trash2 size={14} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="message-input-container">
              {selectedFile && <div className="selected-file-preview"><File size={16} /><span>{selectedFile.name}</span><button onClick={() => setSelectedFile(null)} className="remove-file-btn"><X size={14} /></button></div>}
              <div className="message-input-wrapper">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
                <button className="input-icon-btn" onClick={() => fileInputRef.current?.click()}><Paperclip size={20} /></button>
                <textarea value={message} onChange={e => setMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type a message..." className="message-input" rows={1} />
                <button onClick={sendMessage} className="send-btn"><Send size={20} /></button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p>👈 Select a conversation to start chatting</p>
            <p style={{ marginTop: "10px", color: "#666" }}>Click "Private" or "Group" to start a new conversation</p>
          </div>
        )}
      </div>

      {showCreateDirectModal && (
        <div className="modal-overlay" onClick={() => setShowCreateDirectModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Private Chat</h2>
              <button onClick={() => setShowCreateDirectModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="participants-list">
                {users.filter(u => u.id !== currentUserId).map(user => (
                  <div key={user.id} className="participant-item" onClick={() => createDirectChat(user.id)}>
                    <div className="participant-avatar">{user.username[0].toUpperCase()}</div>
                    <span>{user.username}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateGroupModal && (
        <div className="modal-overlay" onClick={() => setShowCreateGroupModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Create Group Chat</h2><button onClick={() => setShowCreateGroupModal(false)}><X size={20} /></button></div>
            <div className="modal-body">
              <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Group Name" className="form-input" />
              <div className="participants-list">
                {users.filter(u => u.id !== currentUserId).map(user => (
                  <div key={user.id} className={`participant-item ${selectedParticipants.includes(user.id) ? "selected" : ""}`} onClick={() => toggleParticipant(user.id)}>
                    <input type="checkbox" checked={selectedParticipants.includes(user.id)} readOnly />
                    <span>{user.username}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer"><button className="btn-primary" onClick={createGroupChat}>Create</button></div>
          </div>
        </div>
      )}

      {showManageParticipantsModal && (
        <div className="modal-overlay" onClick={() => setShowManageParticipantsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Group Participants</h2>
              <button onClick={() => setShowManageParticipantsModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="participants-list">
                {conversationDetails?.participants?.map(p => (
                  <div key={p.id} className="participant-item-static">
                    <div className="participant-info">
                      <div className="participant-avatar-small">{p.username[0].toUpperCase()}</div>
                      <div className="participant-name-wrapper">
                        <span className="participant-username">{p.username}</span>
                        <span className="participant-role">{p.role === 'admin' ? 'Admin' : 'Member'}</span>
                      </div>
                    </div>
                    {isAdmin && p.username !== currentUser && (
                      <button className="remove-btn" onClick={() => handleRemoveParticipant(p.id)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {isAdmin && (
                <button className="add-participant-btn-long" onClick={() => setShowAddParticipantModal(true)}>
                  <Plus size={16} /> Add Participant
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddParticipantModal && (
        <div className="modal-overlay" onClick={() => setShowAddParticipantModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add to Group</h2>
              <button onClick={() => setShowAddParticipantModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="participants-list">
                {users.filter(u => u.id !== currentUserId && !conversationDetails?.participants?.some(p => p.id === u.id)).map(user => (
                  <div key={user.id} className="participant-item" onClick={() => handleAddParticipant(user.id)}>
                    <div className="participant-avatar">{user.username[0].toUpperCase()}</div>
                    <span>{user.username}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chats;
