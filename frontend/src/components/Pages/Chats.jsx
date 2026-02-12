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
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Helper to get backend base URL (for WebSocket and attachment URLs)
const getBackendBaseUrl = () => {
  // In production, use current hostname with port 8000, or use environment variable
  if (import.meta.env.PROD) {
    // For deployed server, backend is on same hostname, port 8000
    const hostname = window.location.hostname;
    return `http://${hostname}:8000`;
  }
  // For development, use localhost
  return 'http://localhost:8000';
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

    fetch(`http://192.168.1.154:8001/api/auth/user/`, {
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

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages[selectedConversation?.id]]);

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
      })
      .catch(err => console.error("Failed to fetch conversation details:", err));
  }, [selectedConversation, token, currentUser]);

  // WebSocket connection for selected conversation
  useEffect(() => {
    if (!selectedConversation || !currentUser || !token) return;

    // Only fetch if we're not currently sending a message
    if (!isSendingMessageRef.current) {
      fetchConversationMessages(selectedConversation.id);
    }
    
    // Don't clear selectedFile when conversation changes - user might want to send it to different conversation

    // Use conversation endpoint for group chats, username for direct chats
    const backendBase = getBackendBaseUrl();
    const wsProtocol = backendBase.startsWith('https') ? 'wss' : 'ws';
    const wsHost = backendBase.replace(/^https?:\/\//, '');
    let wsUrl;
    if (selectedConversation.type === 'group') {
      wsUrl = `${wsProtocol}://${wsHost}/ws/conversation/${selectedConversation.id}/?token=${token}`;
    } else {
      const chatTarget = selectedConversation.participants[0];
      wsUrl = `${wsProtocol}://${wsHost}/ws/chat/${chatTarget}/?token=${token}`;
    }
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
    };

    socket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
      // WebSocket failed, but REST API will still work
    };

    socket.onmessage = (event) => {
      try {
      const data = JSON.parse(event.data);

      if (data.type === "chat_message") {
          // Add message immediately for real-time display
          const convId = selectedConversation.id;
          const isFromMe = data.sender === currentUser;
          
          // IMPORTANT: Skip messages from ourselves that we're currently sending
          // We handle our own messages via REST API response, not WebSocket
          if (isFromMe && isSendingMessageRef.current) {
            console.log("⏭️ Skipping WebSocket message from self (currently sending)");
            return; // Don't process our own message via WebSocket while sending
          }
          
          // Show browser notification for new messages (not from self)
          if (!isFromMe) {
            const notificationTitle = selectedConversation.type === 'group' 
              ? `${data.sender} in ${selectedConversation.name}`
              : data.sender;
            const notificationBody = data.message || (data.attachment ? `📎 ${data.attachment.name}` : 'New message');
            showNotification(notificationTitle, notificationBody);
          }
          
          // Check if message already exists (avoid duplicates)
          setChatMessages(prev => {
            const msgs = prev[convId] || [];
            const messageId = data.message_id || data.temp_id;
            
            // Check if message with this ID already exists (most reliable check)
            const existsById = messageId && msgs.some(m => {
              // Don't match temp messages by ID
              if (m.temp) return false;
              return m.id === messageId || m.id === String(messageId);
            });
            
            // Also check for duplicate by content and sender within 10 seconds (for messages without IDs)
            const existsByContent = !messageId && msgs.some(m => {
              if (m.temp) return false; // Don't match temp messages
              const timeDiff = Math.abs(new Date(m.time || new Date()) - new Date());
              return m.content === data.message && 
                     m.sender === data.sender && 
                     timeDiff < 10000; // Within 10 seconds
            });
            
            if (existsById || existsByContent) {
              console.log("⏭️ Message already exists, skipping duplicate:", messageId || data.message);
              return prev; // Don't add duplicate
            }
            
            // Add new message immediately
            let attachment = data.attachment;
            // Convert relative URL to absolute if needed
            if (attachment && attachment.url) {
              if (!attachment.url.startsWith('http')) {
                // Handle both /media/... and media/... formats
                const url = attachment.url.startsWith('/') ? attachment.url : `/${attachment.url}`;
                const backendBase = getBackendBaseUrl();
                attachment = {
                  ...attachment,
                  url: `${backendBase}${url}`,
                };
              }
              console.log("📎 Attachment in WebSocket message:", attachment); // Debug log
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
            
            console.log("📨 Real-time message received via WebSocket:", newMsg); // Debug log
            
            return {
              ...prev,
              [convId]: [...msgs, newMsg],
            };
          });
          
          // NEVER fetch messages after receiving WebSocket message - it will clear the UI
          // The WebSocket message is already added above, and REST API response will handle our own messages
        }

        if (data.type === "message_edited") {
          // Update edited message in real-time
          setChatMessages(prev => {
            const convId = selectedConversation.id;
            const msgs = prev[convId] || [];
            return {
              ...prev,
              [convId]: msgs.map(m =>
                m.id === data.message_id
                  ? {
                      ...m,
                      content: data.content,
                      edited_at: data.edited_at,
                    }
                  : m
              ),
            };
          });
        }

        if (data.type === "message_deleted") {
          // Update deleted message in real-time
          setChatMessages(prev => {
            const convId = selectedConversation.id;
            const msgs = prev[convId] || [];
            return {
              ...prev,
              [convId]: msgs.map(m =>
                m.id === data.message_id
                  ? {
                      ...m,
                      content: "[Message deleted]",
                      is_deleted: true,
                    }
                  : m
              ),
            };
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
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    socket.onclose = () => {
      console.log("❌ WebSocket closed");
      // Optionally try to reconnect
    };

    return () => socket.close();
  }, [selectedConversation, currentUser, token]);

  const fetchConversationMessages = (conversationId, mergeMode = false) => {
    if (!conversationId || !token) return;
    
    // Don't fetch if we're currently sending a message (to prevent clearing optimistic updates)
    if (isSendingMessageRef.current && mergeMode === false) {
      console.log("⏸️ Skipping fetch - message being sent");
      return;
    }
    
    console.log(`📥 Fetching messages for conversation ${conversationId}, mergeMode: ${mergeMode}`);
    
    fetch(`${API_BASE}/conversations/${conversationId}/messages/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        const formatted = data.map(msg => {
          // Ensure attachment URL is absolute
          let attachment = msg.attachment;
          if (attachment && attachment.url) {
            if (!attachment.url.startsWith('http')) {
              const url = attachment.url.startsWith('/') ? attachment.url : `/${attachment.url}`;
              const backendBase = getBackendBaseUrl();
              attachment = {
                ...attachment,
                url: `${backendBase}${url}`,
              };
            }
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
        
        // ALWAYS merge to preserve recent messages (especially temp/optimistic ones)
        setChatMessages(prev => {
          const existing = prev[conversationId] || [];
          
          // If we have existing messages, merge intelligently
          if (existing.length > 0) {
            // Get IDs of saved messages (exclude temp messages from ID check)
            const savedMessageIds = new Set(
              formatted.map(m => String(m.id))
            );
            
            // Keep existing messages that are either:
            // 1. Temp messages (they'll be replaced when saved message arrives)
            // 2. Saved messages that aren't in the new fetch (shouldn't happen, but be safe)
            const existingToKeep = existing.filter(m => {
              if (m.temp) {
                // Keep temp messages - they'll be replaced by saved message when it arrives
                return true;
              }
              // Keep if it's a saved message that's not in the new fetch
              // (this shouldn't happen, but be defensive)
              const msgId = String(m.id);
              return !savedMessageIds.has(msgId);
            });
            
            // Add all new formatted messages
            // Combine: existing (including temps) + all new messages
            const combined = [...existingToKeep, ...formatted];
            
            // Remove duplicates by ID (keep the first occurrence, which preserves temp messages)
            const seen = new Set();
            const deduped = combined.filter(m => {
              // Temp messages don't have real IDs, so skip duplicate check for them
              if (m.temp) {
                return true; // Always keep temp messages
              }
              const id = String(m.id);
              if (seen.has(id)) {
                return false; // Duplicate saved message
              }
              seen.add(id);
              return true;
            });
            
            // Sort by a simple order - keep temp messages near the end where they were added
            // For saved messages, they should already be in order from the API
            const sorted = deduped.sort((a, b) => {
              // Temp messages go to the end
              if (a.temp && !b.temp) return 1;
              if (!a.temp && b.temp) return -1;
              // Both are temp or both are saved - maintain order
              return 0;
            });
            
            console.log(`✅ Merged: ${existingToKeep.length} existing (${existingToKeep.filter(m => m.temp).length} temp) + ${formatted.length} new = ${sorted.length} total`);
            
            return { ...prev, [conversationId]: sorted };
          } else {
            // No existing messages, just use formatted
            console.log(`✅ Setting ${formatted.length} messages (no existing)`);
            return { ...prev, [conversationId]: formatted };
          }
        });
      })
      .catch(err => {
        console.error("Failed to load conversation messages:", err);
        // Retry once after a delay
        setTimeout(() => {
          if (selectedConversation?.id === conversationId && !isSendingMessageRef.current) {
            fetchConversationMessages(conversationId, true); // Use merge mode on retry
          }
        }, 2000);
      });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        // Reset the input so user can select another file
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
      // Store the file in both state and ref to persist across re-renders
      setSelectedFile(file);
      selectedFileRef.current = file;
      console.log("File selected:", file.name, "Size:", file.size); // Debug log
    }
    // If no file selected (e.g., user cancelled), keep existing file
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const sendMessage = async () => {
    const fileToUse = selectedFile || selectedFileRef.current;
    if ((!message.trim() && !fileToUse) || !selectedConversation) return;

    const messageContent = message.trim();
    const fileToSend = fileToUse;
    
    // Set flag to prevent fetch during send
    isSendingMessageRef.current = true;
    
    // Clear inputs immediately
    setMessage("");
    setSelectedFile(null);
    selectedFileRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    const tempId = generateUUID();
    const tempTimestamp = Date.now(); // Store timestamp for temp message

    setChatMessages(prev => ({
      ...prev,
      [selectedConversation.id]: [
        ...(prev[selectedConversation.id] || []),
        {
          id: tempId,
          sender: currentUser,
          content: messageContent || (fileToSend ? `📎 ${fileToSend.name}` : ""),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isMe: true,
          avatar: "👤",
          temp: true,
          tempTimestamp: tempTimestamp, // Store when temp message was created
          attachment: fileToSend ? { name: fileToSend.name, size: fileToSend.size } : null,
        },
      ],
    }));

    try {
      // Send via REST API with FormData for file upload
      const formData = new FormData();
      if (messageContent) {
        formData.append("message", messageContent);
      }
      if (fileToSend) {
        formData.append("attachment", fileToSend);
      }

      const response = await fetch(`${API_BASE}/conversations/${selectedConversation.id}/send/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type, let browser set it with boundary for FormData
        },
        body: formData,
      });

      if (response.ok) {
        const savedMessage = await response.json();
        
        // Replace temp message with saved message - ensure it's added even if temp wasn't found
        setChatMessages(prev => {
          const convId = selectedConversation.id;
          const msgs = prev[convId] || [];
          
          const savedMessageId = String(savedMessage.id);
          
          // Check if saved message already exists (from WebSocket or previous update)
          const alreadyExists = msgs.some(m => {
            if (m.temp) return false; // Don't match temp messages
            const msgId = String(m.id);
            return msgId === savedMessageId;
          });
          
          if (alreadyExists) {
            // Message already exists, just remove temp message
            console.log("✅ Saved message already exists, removing temp");
            const filtered = msgs.filter(m => {
              // Remove temp message
              if (m.temp && (m.id === tempId || String(m.id) === tempId)) {
                return false;
              }
              return true;
            });
            return { ...prev, [convId]: filtered };
          }
          
          // Remove temp message and any duplicates
          const filtered = msgs.filter(m => {
            // Remove if it's the temp message
            if (m.temp && (m.id === tempId || String(m.id) === tempId)) {
              return false;
            }
            // Also remove if it's a duplicate of the saved message (by ID)
            if (!m.temp && (String(m.id) === savedMessageId)) {
              return false; // Remove duplicate, we'll add the saved one
            }
            return true;
          });
          
          // Format attachment URL if present
          let attachment = savedMessage.attachment;
          if (attachment && attachment.url && !attachment.url.startsWith('http')) {
            const url = attachment.url.startsWith('/') ? attachment.url : `/${attachment.url}`;
            const backendBase = getBackendBaseUrl();
            attachment = {
              ...attachment,
              url: `${backendBase}${url}`,
            };
          }
          
          // Parse timestamp - handle both ISO string and Date object
          let messageTime;
          try {
            if (savedMessage.timestamp) {
              messageTime = new Date(savedMessage.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            } else {
              messageTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            }
          } catch (e) {
            messageTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          }
          
          // Add saved message
          const newMessage = {
            id: savedMessageId,
            sender: savedMessage.sender || currentUser,
            content: savedMessage.content || messageContent || (attachment ? `📎 ${attachment.name}` : ""),
            time: messageTime,
            isMe: true,
            avatar: "👤",
            attachment: attachment || null,
          };
          
          console.log("✅ Replacing temp message with saved message:", newMessage);
          
          return {
            ...prev,
            [convId]: [
              ...filtered,
              newMessage,
            ],
          };
        });

        // Also send via WebSocket for real-time to other users (optional, REST API is primary)
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          try {
            socketRef.current.send(JSON.stringify({
              type: "chat_message",
              sender: currentUser,
              conversation_id: selectedConversation.id,
              message: messageContent,
              temp_id: tempId,
            }));
          } catch (error) {
            console.warn("WebSocket send failed, but message saved via REST API:", error);
          }
        }

        // Store the saved message ID
        lastSentMessageIdRef.current = savedMessage.id;
        
        // Clear the sending flag after a short delay
        setTimeout(() => {
          isSendingMessageRef.current = false;
        }, 1000);
        
        // Refresh conversation list to update last_message
        fetchConversations();
      } else {
        // If REST API fails, keep the temp message and try WebSocket as fallback
        console.error("Failed to save message via API, trying WebSocket...");
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: "chat_message",
            sender: currentUser,
            conversation_id: selectedConversation.id,
            message: messageContent,
            temp_id: tempId,
          }));
        }
        
        // Clear the sending flag
        isSendingMessageRef.current = false;
        
        // Only reload messages after a longer delay to give WebSocket time (use merge mode)
        setTimeout(() => {
          fetchConversationMessages(selectedConversation.id, true);
        }, 2000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Keep the temp message visible - don't remove it on error
      // Fallback: try WebSocket (only for text messages, not files)
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && messageContent) {
        try {
          socketRef.current.send(JSON.stringify({
            type: "chat_message",
            sender: currentUser,
            conversation_id: selectedConversation.id,
            message: messageContent,
            temp_id: tempId,
          }));
        } catch (wsError) {
          console.warn("WebSocket send also failed:", wsError);
        }
      }
      
      // Only reload messages after a delay if WebSocket also fails
      // This gives time for the message to be saved via WebSocket
      setTimeout(() => {
        fetchConversationMessages(selectedConversation.id);
      }, 2000);
    }
  };

  const handleKeyPress = e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        type: "typing",
        sender: currentUser,
      };
      if (selectedConversation?.type === 'group') {
        payload.conversation_id = selectedConversation.id;
      } else {
        payload.receiver = selectedConversation?.participants[0];
      }
      socketRef.current.send(JSON.stringify(payload));
    }
  };

  const createDirectChat = (userId) => {
    if (!userId) {
      alert("Please select a user");
      return;
    }

    fetch(`${API_BASE}/conversations/create-direct/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: userId,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setShowCreateDirectModal(false);
          fetchConversations();
          // Select the newly created conversation
          fetch(`${API_BASE}/conversations/${data.id}/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(res => res.json())
            .then(convData => {
              setSelectedConversation({
                id: convData.id,
                name: convData.name,
                type: 'direct',
                participants: convData.participants.map(p => p.username),
                participant_count: convData.participants.length,
              });
              setConversationDetails(convData);
              setIsAdmin(false); // Direct chats don't have admins
            })
            .catch(err => console.error("Failed to fetch conversation details:", err));
        } else {
          alert("Failed to create direct chat: " + (data.error || "Unknown error"));
        }
      })
      .catch(err => {
        console.error("Failed to create direct chat:", err);
        alert("Failed to create direct chat");
      });
  };

  const createGroupChat = () => {
    if (!groupName.trim() || selectedParticipants.length === 0) {
      alert("Please enter a group name and select at least one participant");
      return;
    }

    fetch(`${API_BASE}/conversations/create-group/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: groupName.trim(),
        participant_ids: selectedParticipants,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.id) {
          setShowCreateGroupModal(false);
          setGroupName("");
          setSelectedParticipants([]);
          fetchConversations();
          // Select the newly created conversation
          // Fetch full conversation details
          fetch(`${API_BASE}/conversations/${data.id}/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(res => res.json())
            .then(convData => {
              setSelectedConversation({
                id: convData.id,
                name: convData.name,
                type: 'group',
                participants: convData.participants.map(p => p.username),
                participant_count: convData.participants.length,
              });
              setConversationDetails(convData);
              const currentUserParticipant = convData.participants.find(p => p.username === currentUser);
              setIsAdmin(currentUserParticipant?.role === 'admin' || convData.created_by === currentUser);
            })
            .catch(err => console.error("Failed to fetch conversation details:", err));
        } else {
          alert("Failed to create group chat: " + (data.error || "Unknown error"));
        }
      })
      .catch(err => {
        console.error("Failed to create group chat:", err);
        alert("Failed to create group chat");
      });
  };

  const toggleParticipant = (userId) => {
    setSelectedParticipants(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const addParticipantsToGroup = () => {
    if (selectedParticipants.length === 0) {
      alert("Please select at least one participant");
      return;
    }

    fetch(`${API_BASE}/conversations/${selectedConversation.id}/add-participants/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_ids: selectedParticipants,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setShowManageParticipantsModal(false);
          setSelectedParticipants([]);
          // Refresh conversation details
          fetch(`${API_BASE}/conversations/${selectedConversation.id}/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(res => res.json())
            .then(data => setConversationDetails(data))
            .catch(err => console.error("Failed to refresh conversation:", err));
        } else {
          alert("Failed to add participants: " + (data.error || "Unknown error"));
        }
      })
      .catch(err => {
        console.error("Failed to add participants:", err);
        alert("Failed to add participants");
      });
  };

  const editMessage = async (messageId, currentContent) => {
    setEditingMessageId(messageId);
    setEditMessageContent(currentContent);
  };

  const saveEditedMessage = async () => {
    if (!editMessageContent.trim() || !editingMessageId || !selectedConversation) return;

    try {
      const response = await fetch(
        `${API_BASE}/conversations/${selectedConversation.id}/messages/${editingMessageId}/edit/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: editMessageContent.trim(),
          }),
        }
      );

      if (response.ok) {
        const updatedMessage = await response.json();
        // Update message in state
        setChatMessages(prev => {
          const convId = selectedConversation.id;
          const msgs = prev[convId] || [];
          return {
            ...prev,
            [convId]: msgs.map(m =>
              m.id === editingMessageId
                ? {
                    ...m,
                    content: updatedMessage.content,
                    edited_at: updatedMessage.edited_at,
                  }
                : m
            ),
          };
        });
        setEditingMessageId(null);
        setEditMessageContent("");
        fetchConversations(); // Update last message
        
        // Broadcast edit via WebSocket
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          try {
            socketRef.current.send(JSON.stringify({
              type: "message_edited",
              message_id: editingMessageId,
              conversation_id: selectedConversation.id,
              content: updatedMessage.content,
              edited_at: updatedMessage.edited_at,
            }));
          } catch (error) {
            console.warn("WebSocket broadcast failed:", error);
          }
        }
      } else {
        const error = await response.json();
        alert("Failed to edit message: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error editing message:", error);
      alert("Failed to edit message");
    }
  };

  const deleteMessage = async (messageId) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    if (!selectedConversation) return;

    try {
      const response = await fetch(
        `${API_BASE}/conversations/${selectedConversation.id}/messages/${messageId}/delete/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Update message in state to show deleted
        setChatMessages(prev => {
          const convId = selectedConversation.id;
          const msgs = prev[convId] || [];
          return {
            ...prev,
            [convId]: msgs.map(m =>
              m.id === messageId
                ? {
                    ...m,
                    content: "[Message deleted]",
                    is_deleted: true,
                  }
                : m
            ),
          };
        });
        fetchConversations(); // Update last message
        
        // Broadcast delete via WebSocket
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          try {
            socketRef.current.send(JSON.stringify({
              type: "message_deleted",
              message_id: messageId,
              conversation_id: selectedConversation.id,
            }));
          } catch (error) {
            console.warn("WebSocket broadcast failed:", error);
          }
        }
      } else {
        const error = await response.json();
        alert("Failed to delete message: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      alert("Failed to delete message");
    }
  };

  const updateGroupName = async () => {
    if (!newGroupName.trim() || !selectedConversation) return;

    try {
      const response = await fetch(
        `${API_BASE}/conversations/${selectedConversation.id}/update-name/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: newGroupName.trim(),
          }),
        }
      );

      if (response.ok) {
        const updated = await response.json();
        setSelectedConversation(prev => ({ ...prev, name: updated.name }));
        setConversationDetails(prev => prev ? { ...prev, name: updated.name } : null);
        setEditingGroupName(false);
        setNewGroupName("");
        fetchConversations(); // Refresh conversation list
      } else {
        const error = await response.json();
        alert("Failed to update group name: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating group name:", error);
      alert("Failed to update group name");
    }
  };

  const removeParticipant = (userId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    fetch(`${API_BASE}/conversations/${selectedConversation.id}/remove-participant/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: userId,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          // Refresh conversation details
          fetch(`${API_BASE}/conversations/${selectedConversation.id}/`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then(res => res.json())
            .then(data => setConversationDetails(data))
            .catch(err => console.error("Failed to refresh conversation:", err));
        } else {
          alert("Failed to remove participant: " + (data.error || "Unknown error"));
        }
      })
      .catch(err => {
        console.error("Failed to remove participant:", err);
        alert("Failed to remove participant");
      });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participants.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="create-chat-btn" 
              title="Start private conversation"
              onClick={() => setShowCreateDirectModal(true)}
              style={{ fontSize: '12px', padding: '6px 10px' }}
            >
              <span>👤 Private</span>
            </button>
            <button 
              className="create-chat-btn" 
              title="Create group chat"
              onClick={() => setShowCreateGroupModal(true)}
              style={{ fontSize: '12px', padding: '6px 10px' }}
            >
              <Users size={14} style={{ marginRight: '4px' }} />
              <span>Group</span>
            </button>
          </div>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="recent-chats-section">
          <h2>Conversations</h2>
          <div className="recent-chats-list">
            {filteredConversations.length > 0 ? (
              filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    // Fetch full conversation details when selected
                    fetch(`${API_BASE}/conversations/${conv.id}/`, {
                      headers: { Authorization: `Bearer ${token}` },
                    })
                      .then(res => res.json())
                      .then(data => {
                        setConversationDetails(data);
                        const currentUserParticipant = data.participants.find(p => p.username === currentUser);
                        setIsAdmin(currentUserParticipant?.role === 'admin' || data.created_by === currentUser);
                      })
                      .catch(err => console.error("Failed to fetch conversation details:", err));
                  }}
                  className={`chat-item ${selectedConversation?.id === conv.id ? "selected" : ""}`}
                >
                  <div className="chat-avatar">
                    {conv.type === 'group' ? <Users size={20} /> : <span style={{ fontSize: '20px' }}>👤</span>}
                  </div>
                  <div className="chat-info">
                    <p className="chat-name">
                      {conv.name}
                      {conv.type === 'direct' && <span style={{ fontSize: '11px', color: '#666', marginLeft: '6px' }}>(Private)</span>}
                    </p>
                    <p className="chat-last-msg">
                      {conv.last_message 
                        ? (conv.type === 'direct' && conv.last_message.sender === currentUser 
                            ? `You: ${conv.last_message.content}` 
                            : `${conv.last_message.sender}: ${conv.last_message.content}`)
                        : "No messages yet"}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="unread-badge">{conv.unread_count}</span>
                  )}
                </div>
              ))
            ) : (
              <div style={{ padding: "10px" }}>No conversations found</div>
            )}
          </div>
        </div>
      </div>

      {/* Chat main */}
      <div className="chat-main">
        {selectedConversation ? (
          <>
            <div className="chat-main-header">
              <div className="chat-main-header-content">
                <div className="current-chat-avatar">
                  {selectedConversation.type === 'group' ? (
                    <Users size={24} />
                  ) : (
                    <span>{selectedConversation.name[0]}</span>
                  )}
                </div>
                <div className="current-chat-info">
                  {editingGroupName && selectedConversation.type === 'group' ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={e => setNewGroupName(e.target.value)}
                        onKeyPress={e => {
                          if (e.key === 'Enter') updateGroupName();
                          if (e.key === 'Escape') {
                            setEditingGroupName(false);
                            setNewGroupName("");
                          }
                        }}
                        autoFocus
                        style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #3b82f6', fontSize: '16px', flex: 1 }}
                      />
                      <button
                        onClick={updateGroupName}
                        style={{ padding: '4px 8px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingGroupName(false);
                          setNewGroupName("");
                        }}
                        style={{ padding: '4px 8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        <XIcon size={16} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2>{selectedConversation.name}</h2>
                      {selectedConversation.type === 'group' && isAdmin && (
                        <button
                          onClick={() => {
                            setEditingGroupName(true);
                            setNewGroupName(selectedConversation.name);
                          }}
                          style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Edit group name"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                    </div>
                  )}
                  {selectedConversation.type === 'group' ? (
                    <>
                      <p>{conversationDetails?.participants?.length || selectedConversation.participant_count} members</p>
                      {isAdmin && !editingGroupName && (
                        <button 
                          className="manage-participants-btn"
                          onClick={() => setShowManageParticipantsModal(true)}
                          style={{ marginTop: '4px', fontSize: '12px', padding: '4px 8px' }}
                        >
                          Manage Members
                        </button>
                      )}
                    </>
                  ) : (
                    <p style={{ fontSize: '12px', color: '#666' }}>Private conversation</p>
                  )}
                  {typingUsers.length > 0 && <p>Typing...</p>}
                </div>
              </div>
            </div>

            <div className="messages-container">
              {(chatMessages[selectedConversation.id] || []).map(msg => (
                <div
                  key={msg.id}
                  className={`message-wrapper ${msg.isMe ? "my-message" : "other-message"}`}
                  onMouseEnter={() => setHoveredMessageId(msg.id)}
                  onMouseLeave={() => setHoveredMessageId(null)}
                >
                  <div className="message-content">
                    <div className="message-avatar">{msg.avatar}</div>
                    <div className="message-bubble-wrapper">
                      {editingMessageId === msg.id ? (
                        <div className="edit-message-container">
                          <textarea
                            value={editMessageContent}
                            onChange={e => setEditMessageContent(e.target.value)}
                            className="edit-message-input"
                            rows={2}
                            autoFocus
                          />
                          <div className="edit-message-actions">
                            <button
                              className="edit-save-btn"
                              onClick={saveEditedMessage}
                              title="Save"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              className="edit-cancel-btn"
                              onClick={() => {
                                setEditingMessageId(null);
                                setEditMessageContent("");
                              }}
                              title="Cancel"
                            >
                              <XIcon size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                      <div className={`message-bubble ${msg.isMe ? "my-bubble" : "other-bubble"}`}>
                            {selectedConversation.type === 'group' && !msg.isMe && (
                              <p className="message-sender-name">{msg.sender}</p>
                            )}
                            {msg.attachment && (
                              <div className="message-attachment">
                                <File size={16} />
                                <div className="attachment-info">
                                  <a
                                    href={msg.attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="attachment-link"
                                  >
                                    {msg.attachment.name}
                                  </a>
                                  <span className="attachment-size">
                                    {formatFileSize(msg.attachment.size)}
                                  </span>
                                </div>
                                <a
                                  href={msg.attachment.url}
                                  download
                                  className="attachment-download"
                                  title="Download"
                                >
                                  <Download size={14} />
                                </a>
                              </div>
                            )}
                            {msg.content && (
                              <p style={{ opacity: msg.is_deleted ? 0.6 : 1, fontStyle: msg.is_deleted ? 'italic' : 'normal' }}>
                                {msg.content}
                              </p>
                            )}
                          </div>
                          <div className="message-info-row">
                            <p className="message-info">
                              {msg.sender} • {msg.time}
                              {msg.edited_at && <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '4px' }}>(edited)</span>}
                            </p>
                            {msg.isMe && hoveredMessageId === msg.id && !msg.is_deleted && (
                              <div className="message-actions">
                                <button
                                  className="message-action-btn"
                                  onClick={() => editMessage(msg.id, msg.content)}
                                  title="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  className="message-action-btn"
                                  onClick={() => deleteMessage(msg.id)}
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                      </div>
                        </>
                      )}
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
              {(selectedFile || selectedFileRef.current) && (selectedFile?.name || selectedFileRef.current?.name) && (
                <div className="selected-file-preview" key={`file-preview-${selectedFile?.name || selectedFileRef.current?.name}`}>
                  <File size={16} />
                  <span>{selectedFile?.name || selectedFileRef.current?.name}</span>
                  <span className="file-size">({formatFileSize((selectedFile || selectedFileRef.current)?.size)})</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedFile(null);
                      selectedFileRef.current = null;
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="remove-file-btn"
                    type="button"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <div className="message-input-wrapper">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="file-input"
                />
                <button
                  className="input-icon-btn"
                  title="Attachment"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Reset input value to allow selecting the same file again
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                    fileInputRef.current?.click();
                  }}
                >
                  <Paperclip size={20} />
                </button>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="message-input"
                  rows={1}
                />
                <button className="input-icon-btn" title="Voice" disabled><Mic size={20} /></button>
                <button
                  onClick={sendMessage}
                  className={`send-btn ${(!message.trim() && !selectedFile && !selectedFileRef.current) ? "disabled" : ""}`}
                  disabled={!message.trim() && !selectedFile && !selectedFileRef.current}
                  title="Send"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <p>👈 Select a conversation to start chatting</p>
            <p style={{ marginTop: "10px", color: "#666" }}>
              Click "Private" or "Group" to start a new conversation
            </p>
          </div>
        )}
      </div>

      {/* Create Group Chat Modal */}
      {showCreateGroupModal && (
        <div className="modal-overlay" onClick={() => setShowCreateGroupModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Group Chat</h2>
              <button className="modal-close" onClick={() => setShowCreateGroupModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Select Participants ({selectedParticipants.length} selected)</label>
                <div className="participants-list">
                  {users
                    .filter(u => u.id !== currentUserId)
                    .map(user => (
                      <div
                        key={user.id}
                        className={`participant-item ${selectedParticipants.includes(user.id) ? "selected" : ""}`}
                        onClick={() => toggleParticipant(user.id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedParticipants.includes(user.id)}
                          onChange={() => toggleParticipant(user.id)}
                        />
                        <span>{user.username}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateGroupModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={createGroupChat}>
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Direct Chat Modal */}
      {showCreateDirectModal && (
        <div className="modal-overlay" onClick={() => setShowCreateDirectModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Start Private Conversation</h2>
              <button className="modal-close" onClick={() => setShowCreateDirectModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select a user to chat with</label>
                <div className="participants-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {users
                    .filter(u => u.id !== currentUserId)
                    .map(user => (
                      <div
                        key={user.id}
                        className="participant-item"
                        onClick={() => createDirectChat(user.id)}
                        style={{ cursor: 'pointer', padding: '12px', marginBottom: '8px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%', 
                            background: '#3b82f6', 
                            color: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '16px',
                            fontWeight: 'bold'
                          }}>
                            {user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '500' }}>{user.username}</div>
                            {user.first_name || user.last_name ? (
                              <div style={{ fontSize: '12px', color: '#666' }}>
                                {[user.first_name, user.last_name].filter(Boolean).join(' ')}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateDirectModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Participants Modal */}
      {showManageParticipantsModal && conversationDetails && (
        <div className="modal-overlay" onClick={() => setShowManageParticipantsModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Group Members</h2>
              <button className="modal-close" onClick={() => setShowManageParticipantsModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Current Members</label>
                <div className="participants-list">
                  {conversationDetails.participants.map(participant => (
                    <div key={participant.id} className="participant-item">
                      <span>{participant.username}</span>
                      {participant.role === 'admin' && <span style={{ color: '#3b82f6', fontSize: '12px' }}>(Admin)</span>}
                      {isAdmin && participant.username !== currentUser && participant.role !== 'admin' && (
                        <button
                          className="remove-btn"
                          onClick={() => removeParticipant(participant.id)}
                          style={{ marginLeft: 'auto', fontSize: '12px', padding: '4px 8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {isAdmin && (
                <div className="form-group">
                  <label>Add New Members ({selectedParticipants.length} selected)</label>
                  <div className="participants-list">
                    {users
                      .filter(u => {
                        // Exclude users who are already participants
                        return u.id !== currentUserId && 
                               !conversationDetails.participants.some(p => p.id === u.id);
                      })
                      .map(user => (
                        <div
                          key={user.id}
                          className={`participant-item ${selectedParticipants.includes(user.id) ? "selected" : ""}`}
                          onClick={() => toggleParticipant(user.id)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedParticipants.includes(user.id)}
                            onChange={() => toggleParticipant(user.id)}
                          />
                          <span>{user.username}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => {
                setShowManageParticipantsModal(false);
                setSelectedParticipants([]);
              }}>
                Close
              </button>
              {isAdmin && selectedParticipants.length > 0 && (
                <button className="btn-primary" onClick={addParticipantsToGroup}>
                  Add Selected Members
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chats;
