import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Collapse,
  IconButton,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';

const API_BASE = '/api/announcements/';
const token = localStorage.getItem('access_token');

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    event_date: '',
    event_end_date: '',
    priority: 'normal',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserRole();
    fetchAnnouncements();
  }, []);

  const fetchUserRole = async () => {
    try {
      const res = await fetch('/api/auth/user/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setIsSuperAdmin(data.role === 'super_admin');
    } catch (err) {
      console.error('Failed to fetch user role:', err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
      setError('Failed to load announcements');
    }
  };

  const handleExpandClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      summary: '',
      content: '',
      event_date: '',
      event_end_date: '',
      priority: 'normal',
    });
    setEditingAnnouncement(null);
    setShowCreateModal(true);
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      summary: announcement.summary || '',
      content: announcement.content,
      event_date: announcement.event_date ? announcement.event_date.slice(0, 16) : '',
      event_end_date: announcement.event_end_date ? announcement.event_end_date.slice(0, 16) : '',
      priority: announcement.priority || 'normal',
    });
    setEditingAnnouncement(announcement);
    setShowCreateModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const res = await fetch(`${API_BASE}${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchAnnouncements();
      } else {
        setError('Failed to delete announcement');
      }
    } catch (err) {
      console.error('Failed to delete announcement:', err);
      setError('Failed to delete announcement');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const url = editingAnnouncement
        ? `${API_BASE}${editingAnnouncement.id}/`
        : API_BASE;
      const method = editingAnnouncement ? 'PUT' : 'POST';

      // Format dates properly for Django
      const payload = {
        title: formData.title,
        content: formData.content,
        summary: formData.summary || '',
        priority: formData.priority,
        is_active: true, // Always set to active when creating
        event_date: formData.event_date ? new Date(formData.event_date).toISOString() : null,
        event_end_date: formData.event_end_date ? new Date(formData.event_end_date).toISOString() : null,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowCreateModal(false);
        fetchAnnouncements();
      } else {
        const data = await res.json();
        setError(data.detail || 'Failed to save announcement');
      }
    } catch (err) {
      console.error('Failed to save announcement:', err);
      setError('Failed to save announcement');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Company Announcements
        </Typography>
        {isSuperAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ backgroundColor: '#004aad' }}
          >
            Create Announcement
          </Button>
        )}
      </div>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {announcements.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No announcements yet.
        </Typography>
      ) : (
        announcements.map((announcement) => (
          <Card
            key={announcement.id}
            variant="outlined"
            sx={{ mb: 3, boxShadow: 3, borderRadius: 2, cursor: 'pointer' }}
            onClick={() => handleExpandClick(announcement.id)}
          >
            <CardContent>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <Typography variant="h6" component="div" fontWeight="600">
                    {announcement.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    {formatDate(announcement.created_at)} • By {announcement.created_by_username}
                    {announcement.event_date && ` • Event: ${formatDate(announcement.event_date)}`}
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ mt: 1 }}>
                    {announcement.summary || announcement.content.substring(0, 150) + '...'}
                  </Typography>
                </div>
                {isSuperAdmin && (
                  <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(announcement);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(announcement.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                )}
              </div>
            </CardContent>
            <CardActions disableSpacing>
              <Typography variant="body2" color="text.secondary">
                {expandedId === announcement.id ? 'Hide Details' : 'Read More'}
              </Typography>
              <ExpandMore
                expand={expandedId === announcement.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleExpandClick(announcement.id);
                }}
                aria-expanded={expandedId === announcement.id}
                aria-label="show more"
              >
                <ExpandMoreIcon />
              </ExpandMore>
            </CardActions>
            <Collapse in={expandedId === announcement.id} timeout="auto" unmountOnExit>
              <Divider />
              <CardContent>
                <Typography paragraph style={{ whiteSpace: 'pre-wrap' }}>
                  {announcement.content}
                </Typography>
                {announcement.event_date && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    <strong>Event Date:</strong> {formatDate(announcement.event_date)}
                    {announcement.event_end_date && ` - ${formatDate(announcement.event_end_date)}`}
                  </Typography>
                )}
              </CardContent>
            </Collapse>
          </Card>
        ))
      )}

      {/* Create/Edit Modal */}
      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Summary (optional)"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              multiline
              rows={2}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              multiline
              rows={6}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Event Date (optional - will appear on calendar)"
              type="datetime-local"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Event End Date (optional)"
              type="datetime-local"
              value={formData.event_end_date}
              onChange={(e) => setFormData({ ...formData, event_end_date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              SelectProps={{ native: true }}
              sx={{ mb: 2 }}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </TextField>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ backgroundColor: '#004aad' }}>
              {editingAnnouncement ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
}
