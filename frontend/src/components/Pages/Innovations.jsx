import React, { useState, useEffect } from 'react';
import { FaThumbsUp, FaPlus } from 'react-icons/fa';

const API_BASE = '/api/innovations/';
const token = localStorage.getItem('access_token');

const InnovationsBoard = () => {
  const [ideas, setIdeas] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchUser();
    fetchIdeas();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/user/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.username);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const fetchIdeas = async () => {
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Sort by upvotes (highest first) - backend should already do this, but ensure it
        const sorted = data.sort((a, b) => {
          if (b.upvotes_count !== a.upvotes_count) {
            return b.upvotes_count - a.upvotes_count;
          }
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setIdeas(sorted);
      }
    } catch (err) {
      console.error('Failed to fetch ideas:', err);
      setError('Failed to load ideas');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    if (formData.title.length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }

    if (formData.description.length < 10) {
      setError('Description must be at least 10 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setFormData({ title: '', description: '' });
        fetchIdeas();
      } else {
        const data = await res.json();
        setError(data.detail || data.error || 'Failed to create idea');
      }
    } catch (err) {
      console.error('Failed to create idea:', err);
      setError('Failed to create idea');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (ideaId, hasUpvoted) => {
    try {
      const endpoint = hasUpvoted ? 'remove_upvote' : 'upvote';
      const res = await fetch(`${API_BASE}${ideaId}/${endpoint}/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchIdeas(); // Refresh to get updated vote count
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to upvote');
      }
    } catch (err) {
      console.error('Failed to upvote:', err);
      alert('Failed to upvote');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🚀 Innovations Board</h1>
          <p style={styles.subtitle}>
            Share, vote, and discuss innovative ideas to improve our organization!
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={styles.createButton}
        >
          <FaPlus size={16} style={{ marginRight: '8px' }} />
          Submit New Idea
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
          <button onClick={() => setError(null)} style={styles.closeError}>×</button>
        </div>
      )}

      <div style={styles.ideasList}>
        {ideas.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No ideas yet. Be the first to share an innovation!</p>
          </div>
        ) : (
          ideas.map((idea) => (
            <div key={idea.id} style={styles.ideaCard}>
              <div style={styles.ideaContent}>
                <h3 style={styles.ideaTitle}>{idea.title}</h3>
                <p style={styles.ideaDescription}>{idea.description}</p>
                <div style={styles.ideaMeta}>
                  <span style={styles.ideaAuthor}>
                    By {idea.created_by_name || idea.created_by_username}
                  </span>
                  <span style={styles.ideaDate}>• {formatDate(idea.created_at)}</span>
                </div>
              </div>
              <div style={styles.voteSection}>
                <button
                  onClick={() => handleUpvote(idea.id, idea.has_upvoted)}
                  style={{
                    ...styles.upvoteButton,
                    ...(idea.has_upvoted ? styles.upvotedButton : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (!idea.has_upvoted) {
                      e.currentTarget.style.background = '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!idea.has_upvoted) {
                      e.currentTarget.style.background = '#fff';
                    }
                  }}
                  title={idea.has_upvoted ? 'Remove upvote' : 'Upvote this idea'}
                >
                  <FaThumbsUp size={18} />
                  <span style={{ marginLeft: '6px' }}>{idea.upvotes_count}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Idea Modal */}
      {showCreateModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Submit New Idea</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ title: '', description: '' });
                  setError(null);
                }}
                style={styles.modalClose}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter a catchy title for your idea..."
                  style={styles.input}
                  required
                  minLength={3}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your innovative idea in detail..."
                  style={styles.textarea}
                  rows={6}
                  required
                  minLength={10}
                />
              </div>
              {error && (
                <div style={styles.error}>
                  {error}
                </div>
              )}
              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ title: '', description: '' });
                    setError(null);
                  }}
                  style={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...styles.submitButton,
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Idea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: "'Open Sans', sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  title: {
    textAlign: 'left',
    color: '#333',
    margin: 0,
    fontSize: '2rem',
  },
  subtitle: {
    textAlign: 'left',
    color: '#666',
    margin: '8px 0 0 0',
    fontSize: '0.95rem',
  },
  createButton: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    background: '#004aad',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.2s',
  },
  ideasList: {
    marginTop: '20px',
  },
  ideaCard: {
    padding: '20px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    marginBottom: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.2s',
  },
  ideaContent: {
    flex: 1,
    marginRight: '20px',
  },
  ideaTitle: {
    margin: '0 0 12px 0',
    color: '#111827',
    fontSize: '1.25rem',
    fontWeight: '600',
  },
  ideaDescription: {
    margin: '0 0 12px 0',
    color: '#4b5563',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  ideaMeta: {
    fontSize: '0.85rem',
    color: '#6b7280',
  },
  ideaAuthor: {
    fontWeight: '500',
  },
  ideaDate: {
    marginLeft: '8px',
  },
  voteSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '80px',
  },
  upvoteButton: {
    padding: '10px 16px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    background: '#fff',
    color: '#4b5563',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  upvotedButton: {
    background: '#004aad',
    color: '#fff',
    borderColor: '#004aad',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#6b7280',
    fontSize: '1rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: '#fff',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalClose: {
    background: 'transparent',
    border: 'none',
    fontSize: '28px',
    color: '#6b7280',
    cursor: 'pointer',
    padding: 0,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formGroup: {
    marginBottom: '20px',
    padding: '0 24px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#111827',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '15px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '15px',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  error: {
    padding: '12px 16px',
    background: '#fee2e2',
    color: '#dc2626',
    borderRadius: '6px',
    margin: '0 24px 20px 24px',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeError: {
    background: 'transparent',
    border: 'none',
    color: '#dc2626',
    fontSize: '20px',
    cursor: 'pointer',
    padding: 0,
    marginLeft: '12px',
  },
  modalFooter: {
    padding: '20px 24px',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelButton: {
    padding: '10px 20px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#374151',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  submitButton: {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    background: '#004aad',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
};

export default InnovationsBoard;
