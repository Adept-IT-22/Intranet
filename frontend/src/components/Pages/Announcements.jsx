import React, { useState, useEffect } from "react";
import api from "../../api";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Delete } from "@mui/icons-material";

const CorporateAnnouncements = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refresh_token"));
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [userRole, setUserRole] = useState("");

  // Fetch current user to check role
  useEffect(() => {
    if (!token) return;
    api.get("/auth/user/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setUserRole(res.data.role))
      .catch(err => console.error("Error fetching user role:", err));
  }, [token]);

  // Login to get JWT
  const handleLogin = () => {
    api.post("/token/", { username, password })
      .then(res => {
        setToken(res.data.access);
        setRefreshToken(res.data.refresh);
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);
        setError("");
        fetchAnnouncements(res.data.access);
      })
      .catch(() => setError("Login failed. Check credentials."));
  };

  // Fetch announcements
  const fetchAnnouncements = (accessToken) => {
    api.get("/announcements/", {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => setAnnouncements(res.data))
      .catch(err => {
        if (err.response?.status === 401 && refreshToken) refreshAccessToken();
        else console.error(err);
      });
  };

  // Refresh JWT token
  const refreshAccessToken = () => {
    api.post("/token/refresh/", { refresh: refreshToken })
      .then(res => {
        setToken(res.data.access);
        localStorage.setItem("access_token", res.data.access);
        fetchAnnouncements(res.data.access);
      })
      .catch(() => setError("Session expired. Please login again."));
  };

  // Post new announcement
  const handlePostAnnouncement = () => {
    if (!title || !content) {
      setError("Title and content cannot be empty");
      return;
    }

    api.post(
      "/announcements/",
      {
        title: title,
        summary: content,                  // match serializer field
        details: content,                  // match serializer field
        date: new Date().toISOString(),    // ISO date
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(res => {
        setAnnouncements([res.data, ...announcements]);
        setTitle("");
        setContent("");
        setError("");
      })
      .catch(err => {
        if (err.response?.status === 401 && refreshToken) refreshAccessToken();
        else setError("Failed to post announcement.");
      });
  };

  // Delete announcement
  const handleDeleteAnnouncement = (id) => {
    api.delete(`/announcements/${id}/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setAnnouncements(announcements.filter(a => a.id !== id));
        setDeleteId(null);
      })
      .catch(err => {
        if (err.response?.status === 401 && refreshToken) refreshAccessToken();
        else setError("Failed to delete announcement.");
      });
  };

  // Fetch announcements on component mount if token exists
  useEffect(() => {
    if (token) fetchAnnouncements(token);
  }, [token]);

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, mb: 4, boxShadow: 3 }}>
        <Typography variant="h5" gutterBottom>Corporate Announcements</Typography>

        {!token && (
          <Box>
            <TextField
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button variant="contained" color="primary" onClick={handleLogin} fullWidth>
              Login
            </Button>
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          </Box>
        )}

        {token && userRole === "superadmin" && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Post New Announcement
            </Typography>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              multiline
              rows={4}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button variant="contained" color="primary" onClick={handlePostAnnouncement}>
              Post Announcement
            </Button>
            {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          </Box>
        )}
      </Paper>

      {token && (
        <Paper sx={{ p: 2, boxShadow: 2 }}>
          <Typography variant="h6" gutterBottom>All Announcements</Typography>
          <List>
            {announcements.map(a => (
              <Box key={a.id}>
                <ListItem
                  secondaryAction={
                    userRole === "superadmin" && (
                      <IconButton edge="end" color="error" onClick={() => setDeleteId(a.id)}>
                        <Delete />
                      </IconButton>
                    )
                  }
                >
                  <ListItemText
                    primary={a.title}
                    secondary={a.summary || a.details}
                  />
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>
        </Paper>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Announcement</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this announcement?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" onClick={() => handleDeleteAnnouncement(deleteId)}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CorporateAnnouncements;
