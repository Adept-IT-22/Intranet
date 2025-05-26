import React from "react";

const MessageBubble = ({ message }) => {
  const isMine = message.isMine;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
          isMine
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-white text-gray-800 rounded-bl-none border"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <span className="text-[10px] mt-1 text-gray-400 block text-right select-none">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
