import React, { useState, useEffect } from 'react';

// Mock data for categories and priorities
const categories = ['Process', 'Product', 'Tech', 'Culture'];
const priorities = ['Low', 'Medium', 'High'];
const statuses = ['New', 'Under Review', 'In Progress', 'Completed'];

function InnovationsPage() {
  const [ideas, setIdeas] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: categories[0],
    priority: priorities[1],
  });
  const [filter, setFilter] = useState({ category: '', status: '' });
  const [search, setSearch] = useState('');

  // Fetch ideas - replace with real API call
  useEffect(() => {
    // Example initial data
    setIdeas([
      {
        id: 1,
        title: 'Automate reporting process',
        description: 'Create scripts to automate monthly reporting.',
        category: 'Process',
        priority: 'High',
        status: 'Under Review',
        votes: 5,
        submitter: 'Alice',
      },
      {
        id: 2,
        title: 'New onboarding video',
        description: 'Make an engaging onboarding video for new hires.',
        category: 'Culture',
        priority: 'Medium',
        status: 'New',
        votes: 3,
        submitter: 'Bob',
      },
    ]);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const ideaToAdd = {
      ...newIdea,
      id: Date.now(),
      status: 'New',
      votes: 0,
      submitter: 'You',
    };
    setIdeas([ideaToAdd, ...ideas]);
    setFormOpen(false);
    setNewIdea({
      title: '',
      description: '',
      category: categories[0],
      priority: priorities[1],
    });
  }

  // Filter and search logic
  const filteredIdeas = ideas.filter((idea) => {
    return (
      (filter.category ? idea.category === filter.category : true) &&
      (filter.status ? idea.status === filter.status : true) &&
      (search ? idea.title.toLowerCase().includes(search.toLowerCase()) || idea.description.toLowerCase().includes(search.toLowerCase()) : true)
    );
  });

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 20 }}>
      <h1>Innovations Hub</h1>
      <p>Share your ideas, collaborate, and help us innovate together!</p>

      <button onClick={() => setFormOpen(!formOpen)}>
        {formOpen ? 'Cancel' : 'Submit New Idea'}
      </button>

      {formOpen && (
        <form onSubmit={handleSubmit} style={{ marginTop: 20, border: '1px solid #ccc', padding: 20, borderRadius: 8 }}>
          <div>
            <label>Title</label><br />
            <input
              type="text"
              value={newIdea.title}
              onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
              required
              style={{ width: '100%', padding: 8 }}
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <label>Description</label><br />
            <textarea
              value={newIdea.description}
              onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
              required
              rows={4}
              style={{ width: '100%', padding: 8 }}
            />
          </div>

          <div style={{ marginTop: 10, display: 'flex', gap: 20 }}>
            <div>
              <label>Category</label><br />
              <select
                value={newIdea.category}
                onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value })}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Priority</label><br />
              <select
                value={newIdea.priority}
                onChange={(e) => setNewIdea({ ...newIdea, priority: e.target.value })}
              >
                {priorities.map((pri) => (
                  <option key={pri} value={pri}>{pri}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" style={{ marginTop: 15 }}>Submit Idea</button>
        </form>
      )}

      <hr style={{ margin: '30px 0' }} />

      {/* Filters */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search ideas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flexGrow: 1, padding: 8 }}
        />
        <select onChange={(e) => setFilter({ ...filter, category: e.target.value })} value={filter.category}>
          <option value="">All Categories</option>
          {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select onChange={(e) => setFilter({ ...filter, status: e.target.value })} value={filter.status}>
          <option value="">All Statuses</option>
          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </div>

      {/* Ideas List */}
      {filteredIdeas.length === 0 ? (
        <p>No ideas found.</p>
      ) : (
        filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            style={{
              border: '1px solid #ddd',
              padding: 15,
              borderRadius: 6,
              marginBottom: 15,
            }}
          >
            <h3>{idea.title}</h3>
            <p>{idea.description}</p>
            <p>
              <strong>Category:</strong> {idea.category} | <strong>Priority:</strong> {idea.priority} | <strong>Status:</strong> {idea.status}
            </p>
            <p>
              <strong>Votes:</strong> {idea.votes} | <strong>Submitted by:</strong> {idea.submitter}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default InnovationsPage;
