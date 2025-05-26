import React from "react";

const MessageInput = ({ text, onChange, onSend, onKeyDown }) => {
  return (
    <div className="p-4 border-t bg-white flex items-center gap-2">
      <textarea
        rows={1}
        value={text}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="Type your message..."
        className="flex-1 border border-gray-300 rounded-full px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
      <button
        onClick={onSend}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full transition"
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
