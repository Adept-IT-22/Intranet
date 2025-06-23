import { useState, useEffect, useRef } from 'react';
import { Plus, Send, Mic, Paperclip } from 'lucide-react';
import './chats.css';

const Chats = () => {
  const [selectedChat, setSelectedChat] = useState('Marketing Team');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const colleagues = [
    { id: 1, name: 'Fuji', avatar: '🌊', online: true },
    { id: 2, name: 'Ann', avatar: '🏔️', online: true },
    { id: 3, name: 'Mark', avatar: '🔥', online: false }
  ];

  const recentChats = [
    { id: 1, name: 'Marketing Team', type: 'team', unread: 2 },
    { id: 2, name: 'Matthew Wachira', type: 'individual', unread: 0 },
    { id: 3, name: 'Frank Ochieng', type: 'individual', unread: 0 }
  ];

  const initialMessages = {
    'Marketing Team': [
      {
        id: 1,
        sender: 'Ann',
        avatar: '🏔️',
        content: "Hello! I've been thinking about developing some new skills. Any suggestions on where to start?",
        time: '10:30 AM',
        isMe: false
      },
      {
        id: 2,
        sender: 'Fuji',
        avatar: '🌊',
        content: "Hi there! That's great to hear. The first step is to identify your interests. What areas are you passionate about or curious to explore?",
        time: '10:32 AM',
        isMe: false
      }
    ],
    'Matthew Wachira': [],
    'Frank Ochieng': []
  };

  const [chatMessages, setChatMessages] = useState(() => {
    const saved = localStorage.getItem('chatMessages');
    return saved ? JSON.parse(saved) : initialMessages;
  });

  const messagesEndRef = useRef(null);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: (chatMessages[selectedChat]?.length || 0) + 1,
        sender: 'You',
        avatar: '👤',
        content: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      };

      const updatedMessages = {
        ...chatMessages,
        [selectedChat]: [...(chatMessages[selectedChat] || []), newMessage]
      };

      setChatMessages(updatedMessages);
      localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages[selectedChat]]);

  const filteredChats = recentChats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-logo"><span>✨</span></div>
            <h1>Chat</h1>
          </div>
          <button className="create-chat-btn" title="Create new chat">
            <Plus size={16} />
            <span>Create Chat</span>
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="colleagues-section">
          <h2>My Colleagues</h2>
          <div className="colleagues-list">
            {colleagues.map(c => (
              <div key={c.id} className="colleague-item">
                <div className="colleague-avatar-wrapper">
                  <div className="colleague-avatar">{c.avatar}</div>
                  {c.online && <div className="online-indicator"></div>}
                </div>
                <span className="colleague-name">{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="recent-chats-section">
          <h2>Chats</h2>
          <div className="recent-chats-list">
            {filteredChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.name)}
                className={`chat-item ${selectedChat === chat.name ? 'selected' : ''}`}
              >
                <div className="chat-avatar">
                  <span>{chat.type === 'team' ? '👥' : '👤'}</span>
                </div>
                <div className="chat-info">
                  <p className="chat-name">{chat.name}</p>
                </div>
                {chat.unread > 0 && <div className="unread-badge">{chat.unread}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chat-main">
        <div className="chat-main-header">
          <div className="chat-main-header-content">
            <div className="current-chat-avatar"><span>{selectedChat[0]}</span></div>
            <div className="current-chat-info">
              <h2>{selectedChat}</h2>
              <p>{selectedChat === 'Marketing Team' ? '3 members online' : 'Active now'}</p>
            </div>
          </div>
        </div>

        <div className="messages-container">
          {(chatMessages[selectedChat] || []).map(msg => (
            <div key={msg.id} className={`message-wrapper ${msg.isMe ? 'my-message' : 'other-message'}`}>
              <div className="message-content">
                <div className="message-avatar">{msg.avatar}</div>
                <div className="message-bubble-wrapper">
                  <div className={`message-bubble ${msg.isMe ? 'my-bubble' : 'other-bubble'}`}>
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
            <button className="input-icon-btn" title="Attachment (coming soon)" disabled>
              <Paperclip size={20} />
            </button>
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
            <button className="input-icon-btn" title="Voice message (coming soon)" disabled>
              <Mic size={20} />
            </button>
            <button
              onClick={sendMessage}
              className={`send-btn ${!message.trim() ? 'disabled' : ''}`}
              disabled={!message.trim()}
              title="Send"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chats;