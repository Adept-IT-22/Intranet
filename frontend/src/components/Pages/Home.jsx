import React from "react";

export default function HomePage() {
  return (
    <div style={styles.container}>
      <h1 style={styles.welcome}>Welcome to Adept Technologies Intranet</h1>

      <div style={styles.infoBoxes}>
        <div style={styles.infoBox}>
          <h3>Announcements</h3>
          <p>No new announcements</p>
        </div>
        <div style={styles.infoBox}>
          <h3>Upcoming Meetings</h3>
          <p>Team sync on Friday</p>
        </div>
        <div style={styles.infoBox}>
          <h3>Tasks</h3>
          <p>3 tasks pending</p>
        </div>
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
  },
};
