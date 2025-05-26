import React from "react";

const ChatList = ({ threads, selectedThreadId, onSelectThread }) => {
  // Separate DMs and groups
  const dms = threads.filter((t) => t.type === "dm");
  const groups = threads.filter((t) => t.type === "group");

  const renderThread = (thread) => {
    const isActive = selectedThreadId === thread.id;
    return (
      <div
        key={thread.id}
        onClick={() => onSelectThread(thread.id)}
        className={`cursor-pointer px-4 py-3 rounded-lg flex items-center gap-3 hover:bg-blue-50 ${
          isActive ? "bg-blue-100 font-semibold text-blue-700" : "text-gray-700"
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-blue-400 text-white flex items-center justify-center uppercase font-bold select-none">
          {thread.name[0]}
        </div>
        <span className="truncate">{thread.name}</span>
      </div>
    );
  };

  return (
    <div className="w-72 bg-white border-r shadow-sm overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-3">Direct Messages</h2>
        {dms.length ? dms.map(renderThread) : <p className="text-gray-400">No DMs</p>}

        <h2 className="text-xl font-semibold mt-8 mb-3">Teams</h2>
        {groups.length ? groups.map(renderThread) : <p className="text-gray-400">No Teams</p>}
      </div>
    </div>
  );
};

export default ChatList;
