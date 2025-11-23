import React, { useState } from "react";

const ITSupport = () => {
  const [ticket, setTicket] = useState({
    title: "",
    name: "",
    email: "",
    category: "Hardware",
    description: "",
  });

  const [status, setStatus] = useState(null); // "success" or "error"

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTicket({ ...ticket, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    try {
      // ✅ Get JWT from localStorage (from login)
      const token = localStorage.getItem("access_token");

      if (!token) {
        setStatus("unauthorized");
        return;
      }

      const res = await fetch("http://192.168.1.154:8001/api/support/tickets/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ must be Bearer for SimpleJWT
        },
        body: JSON.stringify(ticket),
      });

      if (res.ok) {
        setStatus("success");
        setTicket({
          title: "",
          name: "",
          email: "",
          category: "Hardware",
          description: "",
        });
      } else if (res.status === 401) {
        setStatus("unauthorized");
      } else {
        const errorData = await res.json();
        console.error("Submission error:", errorData);
        setStatus("error");
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
      setStatus("error");
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        color: "#333",
        padding: 20,
        background: "#f9f9f9",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "#004080",
          color: "#fff",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1>IT Support Center</h1>
        <p>Quick help for all your tech needs</p>
      </header>

      <main
        style={{
          maxWidth: 800,
          margin: "20px auto",
          background: "#fff",
          padding: 20,
          borderRadius: 8,
          boxShadow: "0 0 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Contact Info */}
        <section style={{ marginBottom: 30 }}>
          <h2 style={{ color: "#004080" }}>Contact</h2>
          <p>
            <strong>Phone:</strong>{" "}
            <a href="tel:+254712345678" style={{ color: "#004080" }}>
              +254 712 345 678
            </a>
          </p>
          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:support@anqad.com" style={{ color: "#004080" }}>
              support@anqad.com
            </a>
          </p>
          <p>Mon–Fri: 8 AM – 6 PM | Emergencies 24/7</p>
        </section>

        {/* Ticket Form */}
        <section style={{ marginBottom: 30 }}>
          <h2 style={{ color: "#004080" }}>Submit a Ticket</h2>

          {status === "success" && (
            <p style={{ color: "green" }}>✅ Ticket submitted successfully!</p>
          )}
          {status === "error" && (
            <p style={{ color: "red" }}>❌ Failed to submit ticket.</p>
          )}
          {status === "unauthorized" && (
            <p style={{ color: "orange" }}>
              ⚠️ You are not authorized. Please log in.
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <input
              type="text"
              name="title"
              placeholder="Ticket Title"
              value={ticket.title}
              onChange={handleChange}
              required
              style={{
                padding: 10,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />

            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={ticket.name}
              onChange={handleChange}
              required
              style={{
                padding: 10,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />

            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={ticket.email}
              onChange={handleChange}
              required
              style={{
                padding: 10,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />

            <select
              name="category"
              value={ticket.category}
              onChange={handleChange}
              style={{
                padding: 10,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            >
              <option>Hardware</option>
              <option>Software</option>
              <option>Network</option>
              <option>Access Issues</option>
              <option>Other</option>
            </select>

            <textarea
              name="description"
              placeholder="Describe your issue..."
              value={ticket.description}
              onChange={handleChange}
              rows={4}
              required
              style={{
                padding: 10,
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />

            <button
              type="submit"
              style={{
                padding: "10px 15px",
                background: "#004080",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Submit Ticket
            </button>
          </form>
        </section>

        {/* FAQ */}
        <section style={{ marginBottom: 30 }}>
          <h2 style={{ color: "#004080" }}>Quick FAQ</h2>
          <p>
            <strong>Password reset?</strong> Use the{" "}
            <a href="#" style={{ color: "#004080" }}>
              Reset Portal
            </a>
            .
          </p>
          <p>
            <strong>Wi-Fi setup?</strong> Check the{" "}
            <a href="#" style={{ color: "#004080" }}>
              Wi-Fi Guide
            </a>
            .
          </p>
          <p>
            <strong>Suspicious email?</strong> Report to{" "}
            <a href="mailto:support@anqad.com" style={{ color: "#004080" }}>
              support@anqad.com
            </a>
            .
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          marginTop: 40,
          marginBottom: 20,
          color: "#666",
          fontSize: "0.9em",
        }}
      >
        &copy; 2025 Adept Technologies. All rights reserved.
      </footer>
    </div>
  );
};

export default ITSupport;
