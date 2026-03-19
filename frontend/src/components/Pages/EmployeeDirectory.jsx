import React, { useState, useEffect } from "react";

const employeesData = [
  {
    id: 1,
    name: "Ann",
    role: "Frontend Developer",
    department: "IT",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 2,
    name: "Mark",
    role: "Backend Developer",
    department: "IT",
    photo: "https://randomuser.me/api/portraits/men/34.jpg",
  },
  {
    id: 3,
    name: "Fuji",
    role: "Product Manager",
    department: "Operations",
    photo: "https://randomuser.me/api/portraits/women/65.jpg",
  },
];

export default function EmployeeDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingImages, setLoadingImages] = useState({});

  const handleImageLoad = (id) => {
    setLoadingImages((prev) => ({ ...prev, [id]: false }));
  };

  const handleImageStart = (id) => {
    setLoadingImages((prev) => ({ ...prev, [id]: true }));
  };

  const filteredEmployees = employeesData.filter((emp) => {
    const term = searchTerm.toLowerCase();
    return (
      emp.name.toLowerCase().includes(term) ||
      emp.department.toLowerCase().includes(term)
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
              {/* ✅ Photo with skeleton loader */}
              <div style={{ position: "relative", width: 80, height: 80, margin: "auto" }}>
                {loadingImages[emp.id] && (
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(90deg, #e0e0e0 25%, #f5f5f5 50%, #e0e0e0 75%)",
                      backgroundSize: "200% 100%",
                      animation: "skeleton 1.5s infinite",
                    }}
                  ></div>
                )}
                <img
                  src={emp.photo}
                  alt={emp.name}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    objectFit: "cover",
                    display: loadingImages[emp.id] ? "none" : "block",
                  }}
                  onLoad={() => handleImageLoad(emp.id)}
                  onError={() => handleImageLoad(emp.id)}
                  onLoadStart={() => handleImageStart(emp.id)}
                />
              </div>

              <h3 style={{ margin: "0.5rem 0" }}>{emp.name}</h3>
              <p style={{ margin: 0, fontWeight: "bold" }}>{emp.role}</p>
              <p style={{ margin: "0.25rem 0", color: "#555" }}>
                {emp.department}
              </p>
              <a href={`mailto:${emp.email}`} style={{ color: "#007bff" }}>
                {emp.email}
              </a>
            </div>
          ))
        ) : (
          <p>No employees found.</p>
        )}
      </div>

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
