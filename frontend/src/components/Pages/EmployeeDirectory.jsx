import React, { useState, useEffect } from "react";

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState({});

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch("/api/employees/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch employees");
        const data = await response.json();
        setEmployees(data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleImageLoad = (id) => {
    setLoadingImages((prev) => ({ ...prev, [id]: false }));
  };

  const handleImageStart = (id) => {
    setLoadingImages((prev) => ({ ...prev, [id]: true }));
  };

  const filteredEmployees = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    return (
      (emp.name && emp.name.toLowerCase().includes(term)) ||
      (emp.department && emp.department.toLowerCase().includes(term)) ||
      (emp.role && emp.role.toLowerCase().includes(term))
    );
  });

  return (
    <div style={{ padding: "1rem", maxWidth: 900, margin: "auto" }}>
      <h2>Employee Directory</h2>
      <input
        type="text"
        placeholder="Search by name or department..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "0.5rem",
          marginBottom: "1rem",
          fontSize: "1rem",
        }}
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>Loading employees...</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  padding: 16,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  backgroundColor: "#fff",
                  textAlign: "center",
                }}
              >
                <div style={{ position: "relative", width: 80, height: 80, margin: "auto" }}>
                  <img
                    src={emp.photo || "https://i.pravatar.cc/150"}
                    alt={emp.name}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <h3 style={{ margin: "0.5rem 0" }}>{emp.name || "Unknown User"}</h3>
                <p style={{ margin: 0, fontWeight: "bold" }}>{emp.role || "Employee"}</p>
                <p style={{ margin: "0.25rem 0", color: "#555" }}>
                  {emp.department || "No Department"}
                </p>
                <a href={`mailto:${emp.email}`} style={{ color: "#007bff", fontSize: "0.9rem" }}>
                  {emp.email}
                </a>
              </div>
            ))
          ) : (
            <p>No employees found.</p>
          )}
        </div>
      )}

      {/* Skeleton animation keyframes */}
      <style>
        {`
          @keyframes skeleton {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}
      </style>
    </div>
  );
}
