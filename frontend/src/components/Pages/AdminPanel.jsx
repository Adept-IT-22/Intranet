import React, { useState, useEffect } from "react";
import { FaUserShield, FaUserEdit, FaUserMinus, FaCheckCircle, FaExclamationTriangle, FaFileUpload, FaComments, FaTrash, FaUsers, FaKey } from "react-icons/fa";
import api from "../../api";
import "./AdminPanel.css";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [overwrite, setOverwrite] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "users") {
        const response = await api.get("/admin/users/");
        setUsers(response.data);
      } else if (activeTab === "groups") {
        const response = await api.get("/chat/conversations/");
        setConversations(response.data.filter(c => c.is_group));
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role/`, { role: newRole });
      setMessage("Role updated successfully!");
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) return;
    try {
      await api.delete(`/admin/users/${userId}/delete/`);
      setMessage(`User ${username} deleted.`);
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleToggleStatus = async (userId, username) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/toggle-status/`);
      setMessage(response.data.message);
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleResetPassword = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to send a password reset link to ${username}?`)) return;
    try {
      const response = await api.post(`/admin/users/${userId}/reset-password/`);
      setMessage(response.data.message || `Password reset link sent to ${username}.`);
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeleteConversation = async (convId, name) => {
    if (!window.confirm(`Are you sure you want to delete group chat "${name}"?`)) return;
    try {
      await api.delete(`/chat/conversations/${convId}/delete-group/`);
      setMessage(`Group chat "${name}" deleted.`);
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("overwrite", overwrite);

    try {
      const response = await api.post("/admin/upload-employees/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data.message);
      if (response.data.created !== undefined) {
        setUploadResult(response.data);
      }
      setCsvFile(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-title-container">
          <FaUserShield size={28} color="#1B467A" />
          <h1 className="admin-title">Admin Control Panel</h1>
        </div>
        <p className="admin-subtitle">System-wide management and configuration</p>
      </header>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          onClick={() => setActiveTab("users")}
          className={`admin-tab ${activeTab === "users" ? "admin-tab-active" : ""}`}
        >
          <FaUsers /> Users
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`admin-tab ${activeTab === "groups" ? "admin-tab-active" : ""}`}
        >
          <FaComments /> Group Chats
        </button>
        <button
          onClick={() => setActiveTab("csv")}
          className={`admin-tab ${activeTab === "csv" ? "admin-tab-active" : ""}`}
        >
          <FaFileUpload /> Employee CSV
        </button>
      </div>

      {message && <div className="admin-success-message"><FaCheckCircle /> {message}</div>}
      {error && <div className="admin-error-message"><FaExclamationTriangle /> {error}</div>}

      <div className="admin-content">
        {loading ? (
          <div className="admin-loading">Loading data...</div>
        ) : activeTab === "users" ? (
          <div className="admin-table-card">
            <table className="admin-table">
              <thead>
                <tr className="admin-table-header">
                  <th className="admin-cell">Username</th>
                  <th className="admin-cell">Email</th>
                  <th className="admin-cell">Role</th>
                  <th className="admin-cell">Status</th>
                  <th className="admin-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="admin-table-row">
                    <td className="admin-cell"><b>{u.username}</b></td>
                    <td className="admin-cell">{u.email}</td>
                    <td className="admin-cell">
                      <select
                        value={u.role || "employee"}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="admin-select"
                        disabled={u.is_superuser}
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                      </select>
                    </td>
                    <td className="admin-cell">
                      <span className="admin-status-badge" style={{
                        backgroundColor: u.is_active ? "#d1e7dd" : "#f8d7da",
                        color: u.is_active ? "#0f5132" : "#842029"
                      }}>
                        {u.is_active ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="admin-cell">
                      <div style={{ display: "flex", gap: "6px", flexWrap: "nowrap", alignItems: "center" }}>
                        <button 
                          onClick={() => handleToggleStatus(u.id, u.username)} 
                          className="admin-secondary-button"
                          style={{
                            backgroundColor: u.is_active ? "#6c757d" : "#0d6efd"
                          }}
                          disabled={u.is_superuser}
                        >
                          {u.is_active ? "Deactivate" : "Approve"}
                        </button>
                        <button 
                          onClick={() => handleResetPassword(u.id, u.username)} 
                          className="admin-secondary-button"
                          style={{ backgroundColor: "#198754" }}
                        >
                          <FaKey style={{ marginRight: "4px" }} /> Reset Pass
                        </button>
                        <button onClick={() => handleDeleteUser(u.id, u.username)} className="admin-delete-button" disabled={u.is_superuser}>
                          <FaUserMinus /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === "groups" ? (
          <div className="admin-table-card">
            <table className="admin-table">
              <thead>
                <tr className="admin-table-header">
                  <th className="admin-cell">Group Name</th>
                  <th className="admin-cell">Last Message</th>
                  <th className="admin-cell">Created At</th>
                  <th className="admin-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((c) => (
                  <tr key={c.id} className="admin-table-row">
                    <td className="admin-cell"><b>{c.name}</b></td>
                    <td className="admin-cell">{c.last_message}</td>
                    <td className="admin-cell">{new Date(c.timestamp).toLocaleDateString()}</td>
                    <td className="admin-cell">
                      <button onClick={() => handleDeleteConversation(c.id, c.name)} className="admin-delete-button">
                        <FaTrash /> Delete Group
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {conversations.length === 0 && <p style={{ padding: 20, textAlign: "center" }}>No group conversations found.</p>}
          </div>
        ) : (
          <div className="admin-upload-card">
            <h3>Upload Employee Directory (CSV)</h3>
            <p style={{ color: "#666", marginBottom: 20 }}>
              Prepare a CSV file with headers: <b>username, email, role, department, team</b>
            </p>
            <form onSubmit={handleCsvUpload} className="admin-upload-form">
              <div className="admin-file-box">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  className="admin-file-input"
                />
              </div>
              
              <label className="admin-checkbox-label">
                <input
                  type="checkbox"
                  checked={overwrite}
                  onChange={(e) => setOverwrite(e.target.checked)}
                />
                Overwrite existing records (Sync data for existing usernames)
              </label>

              <button type="submit" className="admin-upload-button" disabled={!csvFile}>
                <FaFileUpload /> Process CSV & Sync Directory
              </button>
            </form>

            {uploadResult && (
              <div className="admin-result-box">
                <h4>Sync Summary:</h4>
                <div className="admin-result-grid">
                  <div className="admin-result-item"><b>{uploadResult.created}</b> New Created</div>
                  <div className="admin-result-item"><b>{uploadResult.updated}</b> Existing Updated</div>
                  <div className="admin-result-item"><b>{uploadResult.skipped}</b> Records Skipped</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
