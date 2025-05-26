import React, { useEffect, useRef } from "react";
import MessageBubble from "./Messagebubble";

const ChatWindow = ({ thread, messages }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!thread) return null;

  return (
    <div className="flex flex-col flex-1 bg-gray-50">
      <div className="border-b px-6 py-3 bg-white shadow-sm">
        <h3 className="text-lg font-semibold truncate">{thread.name}</h3>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 mt-10">No messages yet</p>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
