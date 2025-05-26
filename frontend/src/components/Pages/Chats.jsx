import React, { useState } from "react";
import ChatList from "./Chats/Chatlist";
import ChatWindow from "./Chats/Chatwindow";
import MessageInput from "./Chats/MessageInput";

// Sample threads: mix of direct messages and groups
const sampleThreads = [
  { id: "dm1", name: "Alice Johnson", type: "dm" },
  { id: "dm2", name: "Bob Smith", type: "dm" },
  { id: "grp1", name: "Project Phoenix", type: "group" },
  { id: "grp2", name: "Marketing Team", type: "group" },
];

// Sample messages keyed by thread id
const sampleMessages = {
  dm1: [
    { id: 1, content: "Hey Alice! How's it going?", isMine: true, timestamp: Date.now() - 60000 },
    { id: 2, content: "Hi! Doing great, thanks 😊", isMine: false, timestamp: Date.now() - 30000 },
  ],
  dm2: [
    { id: 1, content: "Hey Bob, did you check the report?", isMine: true, timestamp: Date.now() - 90000 },
    { id: 2, content: "Yes, looks good!", isMine: false, timestamp: Date.now() - 60000 },
  ],
  grp1: [
    { id: 1, content: "Team, let's sync tomorrow at 10am.", isMine: false, timestamp: Date.now() - 120000 },
    { id: 2, content: "Sounds good, I'll be there.", isMine: true, timestamp: Date.now() - 110000 },
  ],
  grp2: [
    { id: 1, content: "New campaign starts next week.", isMine: false, timestamp: Date.now() - 80000 },
  ],
};

const Chats = () => {
  const [threads] = useState(sampleThreads);
  const [messages, setMessages] = useState(sampleMessages);
  const [selectedThreadId, setSelectedThreadId] = useState(threads[0].id);
  const [inputText, setInputText] = useState("");

  const selectedThread = threads.find((t) => t.id === selectedThreadId);
  const selectedMessages = messages[selectedThreadId] || [];

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now(),
      content: inputText.trim(),
      isMine: true,
      timestamp: Date.now(),
    };
    setMessages((prev) => ({
      ...prev,
      [selectedThreadId]: [...(prev[selectedThreadId] || []), newMessage],
    }));
    setInputText("");
  };

  return (
    <div className="flex h-screen bg-[#f9fafb]">
      <ChatList
        threads={threads}
        selectedThreadId={selectedThreadId}
        onSelectThread={setSelectedThreadId}
      />
      <div className="flex flex-col flex-1">
        <ChatWindow thread={selectedThread} messages={selectedMessages} />
        <MessageInput
          text={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onSend={handleSendMessage}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
      </div>
    </div>
  );
};

export default Chats;
