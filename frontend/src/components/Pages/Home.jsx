import React, { useState } from "react";

export default function HomePage() {
  const [hoveredBox, setHoveredBox] = useState(null);

  const handleMouseEnter = (index) => setHoveredBox(index);
  const handleMouseLeave = () => setHoveredBox(null);

  const getBoxStyle = (index) => ({
    ...styles.infoBox,
    ...(hoveredBox === index ? styles.infoBoxHover : {}),
  });

  return (
    <div style={styles.container}>
      <h1 style={styles.welcome}>Welcome to Adept Technologies Intranet</h1>

      <div style={styles.infoBoxes}>
        {["Announcements", "Upcoming Meetings", "Tasks"].map((title, index) => (
          <div
            key={index}
            style={getBoxStyle(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <h3>{title}</h3>
            <p>
              {title === "Announcements"
                ? "No new announcements"
                : title === "Upcoming Meetings"
                ? "Team sync on Friday"
                : "3 tasks pending"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 900,
    margin: "40px auto",
    padding: "0 20px",
    textAlign: "center",
  },
  welcome: {
    fontSize: "2.5rem",
    color: "#1B467A",
    marginBottom: 30,
  },
  infoBoxes: {
    display: "flex",
    justifyContent: "center",
    gap: 30,
    flexWrap: "wrap",
  },
  infoBox: {
    flex: "1 1 200px",
    backgroundColor: "#f4f6f8",
    padding: 20,
    borderRadius: 8,
    boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  infoBoxHover: {
    transform: "scale(1.05)",
    boxShadow: "0 6px 12px rgba(0,0,0,0.15)",
  },
};
