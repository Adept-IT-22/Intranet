import React, { useState, useEffect } from "react";
import { FaUserShield, FaUserEdit, FaUserMinus, FaCheckCircle, FaExclamationTriangle, FaFileUpload, FaComments, FaTrash, FaUsers, FaKey } from "react-icons/fa";

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

  const token = localStorage.getItem("access_token");

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "users") {
        const response = await fetch("/api/admin/users/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch users");
        setUsers(await response.json());
      } else if (activeTab === "groups") {
        const response = await fetch("/api/chat/conversations/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch conversations");
        const data = await response.json();
        setConversations(data.filter(c => c.is_group));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) throw new Error("Failed to update role");
      setMessage("Role updated successfully!");
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}/delete/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete user");
      setMessage(`User ${username} deleted.`);
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (userId, username) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to toggle status");
      setMessage(data.message);
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResetPassword = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to send a password reset link to ${username}?`)) return;
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send password reset");
      setMessage(data.message || `Password reset link sent to ${username}.`);
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleDeleteConversation = async (convId, name) => {
    if (!window.confirm(`Are you sure you want to delete group chat "${name}"?`)) return;
    try {
      const response = await fetch(`/api/chat/conversations/${convId}/delete-group/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to delete group");
      setMessage(`Group chat "${name}" deleted.`);
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCsvUpload = async (e) => {
    e.preventDefault();
    if (!csvFile) return;

    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("overwrite", overwrite);

    try {
      const response = await fetch("/api/admin/upload-employees/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");
      setMessage(data.message);
      setCsvFile(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.titleContainer}>
          <FaUserShield size={28} color="#1B467A" />
          <h1 style={styles.title}>Admin Control Panel</h1>
        </div>
        <p style={styles.subtitle}>System-wide management and configuration</p>
      </header>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab("users")}
          style={{ ...styles.tab, borderBottom: activeTab === "users" ? "3px solid #1B467A" : "none" }}
        >
          <FaUsers /> Users
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          style={{ ...styles.tab, borderBottom: activeTab === "groups" ? "3px solid #1B467A" : "none" }}
        >
          <FaComments /> Group Chats
        </button>
        <button
          onClick={() => setActiveTab("csv")}
          style={{ ...styles.tab, borderBottom: activeTab === "csv" ? "3px solid #1B467A" : "none" }}
        >
          <FaFileUpload /> Employee CSV
        </button>
      </div>

      {message && <div style={styles.successMessage}><FaCheckCircle /> {message}</div>}
      {error && <div style={styles.errorMessage}><FaExclamationTriangle /> {error}</div>}

      <div style={styles.content}>
        {loading ? (
          <div style={styles.loading}>Loading data...</div>
        ) : activeTab === "users" ? (
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={styles.tableRow}>
                    <td style={styles.cell}><b>{u.username}</b></td>
                    <td style={styles.cell}>{u.email}</td>
                    <td style={styles.cell}>
                      <select
                        value={u.role || "employee"}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        style={styles.select}
                        disabled={u.is_superuser}
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                      </select>
                    </td>
                    <td style={styles.cell}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: u.is_active ? "#d1e7dd" : "#f8d7da",
                        color: u.is_active ? "#0f5132" : "#842029"
                      }}>
                        {u.is_active ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td style={styles.cell}>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "nowrap", alignItems: "center" }}>
                        <button 
                          onClick={() => handleToggleStatus(u.id, u.username)} 
                          style={{
                            ...styles.secondaryButton,
                            backgroundColor: u.is_active ? "#6c757d" : "#0d6efd"
                          }}
                          disabled={u.is_superuser}
                        >
                          {u.is_active ? "Deactivate" : "Approve"}
                        </button>
                        <button 
                          onClick={() => handleResetPassword(u.id, u.username)} 
                          style={{
                            ...styles.secondaryButton,
                            backgroundColor: "#198754",
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <FaKey style={{ marginRight: "4px" }} /> Reset Pass
                        </button>
                        <button onClick={() => handleDeleteUser(u.id, u.username)} style={styles.deleteButton} disabled={u.is_superuser}>
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
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th>Group Name</th>
                  <th>Last Message</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((c) => (
                  <tr key={c.id} style={styles.tableRow}>
                    <td style={styles.cell}><b>{c.name}</b></td>
                    <td style={styles.cell}>{c.last_message}</td>
                    <td style={styles.cell}>{new Date(c.timestamp).toLocaleDateString()}</td>
                    <td style={styles.cell}>
                      <button onClick={() => handleDeleteConversation(c.id, c.name)} style={styles.deleteButton}>
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
          <div style={styles.uploadCard}>
            <h3>Upload Employee Directory (CSV)</h3>
            <p style={{ color: "#666", marginBottom: 20 }}>
              Prepare a CSV file with headers: <b>username, email, role, department, team</b>
            </p>
            <form onSubmit={handleCsvUpload} style={styles.uploadForm}>
              <div style={styles.fileBox}>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  style={styles.fileInput}
                />
              </div>
              
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={overwrite}
                  onChange={(e) => setOverwrite(e.target.checked)}
                />
                Overwrite existing records (Sync data for existing usernames)
              </label>

              <button type="submit" style={styles.uploadButton} disabled={!csvFile}>
                <FaFileUpload /> Process CSV & Sync Directory
              </button>
            </form>

            {uploadResult && (
              <div style={styles.resultBox}>
                <h4>Sync Summary:</h4>
                <div style={styles.resultGrid}>
                  <div style={styles.resultItem}><b>{uploadResult.created}</b> New Created</div>
                  <div style={styles.resultItem}><b>{uploadResult.updated}</b> Existing Updated</div>
                  <div style={styles.resultItem}><b>{uploadResult.skipped}</b> Records Skipped</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px", maxWidth: "1200px", margin: "0 auto" },
  header: { marginBottom: "30px" },
  titleContainer: { display: "flex", alignItems: "center", gap: "15px", marginBottom: "5px" },
  title: { fontSize: "24px", fontWeight: "700", color: "#1B467A", margin: 0 },
  subtitle: { color: "#666", fontSize: "14px" },
  tabs: { display: "flex", gap: "30px", marginBottom: "30px", borderBottom: "1px solid #eee" },
  tab: {
    padding: "10px 5px",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#555",
    transition: "0.2s",
  },
  successMessage: { padding: "12px", backgroundColor: "#d1e7dd", color: "#0f5132", borderRadius: "8px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" },
  errorMessage: { padding: "12px", backgroundColor: "#f8d7da", color: "#842029", borderRadius: "8px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" },
  tableCard: { background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  tableHeader: { backgroundColor: "#f8f9fa", borderBottom: "2px solid #eee", color: "#1B467A" },
  cell: { padding: "15px 20px", borderBottom: "1px solid #eee" },
  tableRow: { "&:hover": { backgroundColor: "#fcfcfc" } },
  select: { padding: "6px 10px", borderRadius: "6px", border: "1px solid #ddd" },
  deleteButton: { padding: "6px 10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap" },
  secondaryButton: { padding: "6px 10px", backgroundColor: "#6c757d", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "4px" },
  statusBadge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  uploadCard: { background: "#fff", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", textAlign: "center" },
  uploadForm: { display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" },
  fileInput: { padding: "10px", border: "1px dashed #1B467A", borderRadius: "8px", width: "100%", maxWidth: "400px" },
  uploadButton: {
    padding: "12px 30px",
    backgroundColor: "#1B467A",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "0.2s",
    "&:disabled": { backgroundColor: "#ccc" }
  },
  loading: { padding: "40px", textAlign: "center", color: "#666" },
  fileBox: { width: "100%", maxWidth: "400px", padding: "20px", border: "2px dashed #ddd", borderRadius: "10px", marginBottom: "10px" },
  checkboxLabel: { display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#444", cursor: "pointer", marginBottom: "20px" },
  resultBox: { marginTop: "30px", padding: "20px", borderTop: "1px solid #eee", width: "100%" },
  resultGrid: { display: "flex", justifyContent: "space-around", gap: "20px", marginTop: "15px" },
  resultItem: { padding: "10px 20px", borderRadius: "8px", backgroundColor: "#f8f9fa", fontSize: "14px", color: "#555" }
};
