import React from "react";

const LMSPage = () => {
  return (
    <div style={styles.container}>
      <header style={styles.header}>Grow and Learn</header>
      <main style={styles.main}>
        <h1>Welcome to our Learning Management Systems</h1>
        <p>
          Access your courses, track progress, and stay connected with teachers and classmates.
        </p>
        <div style={styles.linksContainer}>
          <a
            href="http://35.179.167.195/moodle/"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.websiteLink}
          >
            Visit School LMS
          </a>
          <a
            href="https://learn.adept-techno.co.ke/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...styles.websiteLink, marginLeft: "20px" }}
          >
            Visit Adept Technologies LMS
          </a>
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "'Arial', sans-serif",
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#333",
    margin: 0,
  },
  header: {
    width: "100%",
    padding: "20px",
    backgroundColor: "#004aad",
    color: "white",
    textAlign: "center",
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  main: {
    maxWidth: "600px",
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  linksContainer: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
  },
  websiteLink: {
    padding: "12px 30px",
    backgroundColor: "#004aad",
    color: "white",
    textDecoration: "none",
    borderRadius: "5px",
    fontWeight: 600,
    transition: "background-color 0.3s ease",
  },
};

export default LMSPage;
