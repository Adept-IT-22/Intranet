import React, { useState } from 'react';

const InnovationsBoard = () => {
  const [ideas, setIdeas] = useState([
    { id: 1, title: 'AI-powered Knowledge Base', votes: 12 },
    { id: 2, title: 'Dark Mode for Intranet', votes: 8 },
    { id: 3, title: 'Employee Skill Badges', votes: 5 },
  ]);

  const addIdea = () => {
    const newIdea = { id: Date.now(), title: `New Idea #${ideas.length + 1}`, votes: 0 };
    setIdeas([...ideas, newIdea]);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>🚀 Innovations Board</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>
        Share, vote, and discuss innovative ideas to improve our organization!
      </p>

      <div style={{ marginTop: '30px' }}>
        {ideas.map((idea) => (
          <div
            key={idea.id}
            style={{
              padding: '15px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f9f9f9',
            }}
          >
            <span>{idea.title}</span>
            <span>👍 {idea.votes}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={addIdea}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            background: '#007bff',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          + Submit New Idea
        </button>
      </div>
    </div>
  );
};

export default InnovationsBoard;
