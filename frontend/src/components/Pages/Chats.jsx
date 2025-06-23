import { useState } from 'react';
import { Plus, Send, Mic, Paperclip } from 'lucide-react';
import './chats.css';

const Chats = () => {
  const [selectedChat, setSelectedChat] = useState('Marketing Team');
  const [message, setMessage] = useState('');
  
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
  
  const [messages, setMessages] = useState([
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
    },
    {
      id: 3,
      sender: 'Ann',
      avatar: '🏔️',
      content: "I've always been interested in graphic design, but I'm not sure where to begin.",
      time: '10:35 AM',
      isMe: false
    },
    {
      id: 4,
      sender: 'Fuji',
      avatar: '🌊',
      content: "Graphic design is a fantastic choice! To start, you might want to learn the basics of design principles and software tools. There are many online platforms offering courses like Adobe Creative Cloud tutorials or design fundamentals. What specific aspects of graphic design are you interested in?",
      time: '10:38 AM',
      isMe: false
    }
  ]);
  
  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'You',
        avatar: '👤',
        content: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="chat-sidebar">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-logo">
              <span>✨</span>
            </div>
            <h1>Chat</h1>
          </div>
          <button className="create-chat-btn">
            <Plus size={16} />
            <span>Create Chat</span>
          </button>
        </div>
        
        {/* My Colleagues */}
        <div className="colleagues-section">
          <h2>My Colleagues</h2>
          <div className="colleagues-list">
            {colleagues.map(colleague => (
              <div key={colleague.id} className="colleague-item">
                <div className="colleague-avatar-wrapper">
                  <div className="colleague-avatar">
                    {colleague.avatar}
                  </div>
                  {colleague.online && <div className="online-indicator"></div>}
                </div>
                <span className="colleague-name">{colleague.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Chats */}
        <div className="recent-chats-section">
          <div className="recent-chats-header">
            <h2>Recent Chats</h2>
            <Plus size={16} className="add-chat-icon" />
          </div>
          <div className="recent-chats-list">
            {recentChats.map(chat => (
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
                {chat.unread > 0 && (
                  <div className="unread-badge">
                    {chat.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Chat Header */}
        <div className="chat-main-header">
          <div className="chat-main-header-content">
            <div className="current-chat-avatar">
              <span>MT</span>
            </div>
            <div className="current-chat-info">
              <h2>{selectedChat}</h2>
              <p>3 members online</p>
            </div>
          </div>
        </div>
        
        {/* Messages */}
        <div className="messages-container">
          {messages.map(msg => (
            <div key={msg.id} className={`message-wrapper ${msg.isMe ? 'my-message' : 'other-message'}`}>
              <div className="message-content">
                <div className="message-avatar">
                  {msg.avatar}
                </div>
                <div className="message-bubble-wrapper">
                  <div className={`message-bubble ${msg.isMe ? 'my-bubble' : 'other-bubble'}`}>
                    <p>{msg.content}</p>
                  </div>
                  <p className="message-info">
                    {msg.sender} • {msg.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Message Input */}
        <div className="message-input-container">
          <div className="message-input-wrapper">
            <button className="input-icon-btn">
              <Paperclip size={20} />
            </button>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message"
              className="message-input"
              rows={1}
            />
            <button className="input-icon-btn">
              <Mic size={20} />
            </button>
            <button
              onClick={sendMessage}
              className={`send-btn ${!message.trim() ? 'disabled' : ''}`}
              disabled={!message.trim()}
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