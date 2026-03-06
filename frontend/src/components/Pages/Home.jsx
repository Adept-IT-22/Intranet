import React, { useState } from "react";

// Main App Component with Router
export default function IntranetApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageHistory, setPageHistory] = useState(['home']);

  const navigateTo = (page) => {
    setCurrentPage(page);
    setPageHistory(prev => [...prev, page]);
  };

  const goBack = () => {
    if (pageHistory.length > 1) {
      const newHistory = pageHistory.slice(0, -1);
      setPageHistory(newHistory);
      setCurrentPage(newHistory[newHistory.length - 1]);
    }
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'home':
        return <HomePage navigateTo={navigateTo} />;
      case 'employee-handbook':
        return <EmployeeHandbook goBack={goBack} />;
      case 'organizational':
        return <OrganizationalResources goBack={goBack} />;
      case 'operational':
        return <OperationalDocuments goBack={goBack} />;
      case 'training':
        return <TrainingDevelopment goBack={goBack} />;
      case 'communication':
        return <CommunicationNews goBack={goBack} />;
      case 'tools':
        return <ToolsTemplates goBack={goBack} />;
      case 'knowledge':
        return <KnowledgeManagement goBack={goBack} />;
      default:
        return <HomePage navigateTo={navigateTo} />;
    }
  };

  return (
    <div style={styles.app}>
      {renderPage()}
    </div>
  );
}

// Home Page Component
function HomePage({ navigateTo }) {
  const [hoveredBox, setHoveredBox] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const infoBoxes = [
    { title: "Announcements", content: "No new announcements" },
    { title: "Upcoming Meetings", content: "Team sync on Friday" },
    { title: "Tasks", content: "3 tasks pending" },
  ];

  const faqCategories = {
    "Passwords & Account": [
      {
        question: "How do I reset my password?",
        answer: "Go to Settings > Account > Reset Password and follow the instructions.",
      },
      {
        question: "What if I don't receive the password reset email?",
        answer: "Check your spam folder first. If still not found, contact IT support at it@adept-techno.com.",
      },
    ],
    "Leave Requests": [
    {
      question: "How to submit a leave request?",
      answer: (
        <>
          Navigate to{" "}
          <a
            href="https://adept-technologies.odoo.com/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#004080", textDecoration: "underline" }}
          >
            Odoo
          </a>{" "}
          → Time Off → Select date and apply.
        </>
      ),
    },
    ],
    
    "Training & Resources": [
      {
        question: "How do I access training materials?",
        answer: "Check the Resources section below or access the LMS platform through the main menu.",
      },
    ],
  };

  const resources = [
    { title: "Employee Handbook & Policies", page: "employee-handbook" },
    { title: "Organizational Resources", page: "organizational" },
    { title: "Operational Documents", page: "operational" },
    { title: "Training & Development", page: "training" },
    { title: "Communication & News", page: "communication" },
    { title: "Tools & Templates", page: "tools" },
    { title: "Knowledge Management", page: "knowledge" },
  ];

  const handleMouseEnter = (index) => setHoveredBox(index);
  const handleMouseLeave = () => setHoveredBox(null);
  const toggleCategory = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
    setExpandedFAQ(null);
  };
  const toggleFAQ = (faqId) => setExpandedFAQ(expandedFAQ === faqId ? null : faqId);

  const getBoxStyle = (index) => ({
    ...styles.infoBox,
    ...(hoveredBox === index ? styles.infoBoxHover : {}),
  });

  return (
    <div style={styles.container}>
      <h1 style={styles.welcome}>Welcome to Adept Technologies Intranet</h1>
      <div style={styles.contentWrapper}>
        <div style={styles.sidebar}>
          <h2 style={styles.heading}>FAQ</h2>
          
          {Object.entries(faqCategories).map(([category, faqs]) => (
            <div key={category} style={styles.categoryContainer}>
              <div
                style={{
                  ...styles.categoryHeader,
                  ...(expandedCategory === category ? styles.categoryHeaderExpanded : {})
                }}
                onClick={() => toggleCategory(category)}
              >
                <span>{category}</span>
                <span style={styles.arrow}>
                  {expandedCategory === category ? '▼' : '▶'}
                </span>
              </div>
              
              {expandedCategory === category && (
                <div style={styles.faqContainer}>
                  {faqs.map((faq, index) => {
                    const faqId = `${category}-${index}`;
                    return (
                      <div key={faqId} style={styles.faqItem}>
                        <div
                          style={{
                            ...styles.question,
                            ...(expandedFAQ === faqId ? styles.questionExpanded : {})
                          }}
                          onClick={() => toggleFAQ(faqId)}
                        >
                          <span>{faq.question}</span>
                          <span style={styles.questionArrow}>
                            {expandedFAQ === faqId ? '−' : '+'}
                          </span>
                        </div>
                        {expandedFAQ === faqId && (
                          <div style={styles.answer}>{faq.answer}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          <h2 style={{ ...styles.heading, marginTop: 40 }}>Resources</h2>
          <ul style={styles.resourceList}>
            {resources.map((res, index) => (
              <li key={index} style={styles.resourceItem}>
                <button
                  onClick={() => navigateTo(res.page)}
                  style={styles.resourceLink}
                  onMouseEnter={(e) => e.target.style.color = "#FF6600"}
                  onMouseLeave={(e) => e.target.style.color = "#1B467A"}
                >
                  {res.title} →
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.infoBoxes}>
          {infoBoxes.map((box, index) => (
            <div
              key={index}
              style={getBoxStyle(index)}
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              <h3>{box.title}</h3>
              <p>{box.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Resource Page Components
function EmployeeHandbook({ goBack }) {
  const documents = [
    "Employee Code of Conduct",
    "Benefits Package Overview", 
    "Performance Review Process",
    "Disciplinary Procedures",
    "Health & Safety Guidelines",
    "Remote Work Policy"
  ];

  return (
    <div style={styles.container}>
      <button onClick={goBack} style={styles.backButton}>← Back to Home</button>
      <h1 style={styles.pageTitle}>Employee Handbook & Policies</h1>
      <div style={styles.pageContent}>
        <div style={styles.documentGrid}>
          {documents.map((doc, index) => (
            <div key={index} style={styles.documentCard}>
              <h3 style={styles.documentTitle}>{doc}</h3>
              <p style={styles.documentDesc}>Click to view document</p>
              <button style={styles.viewButton}>View PDF</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrganizationalResources({ goBack }) {
  return (
    <div style={styles.container}>
      <button onClick={goBack} style={styles.backButton}>← Back to Home</button>
      <h1 style={styles.pageTitle}>Organizational Resources</h1>
      <div style={styles.pageContent}>
        <div style={styles.resourceSection}>
          <h2 style={styles.sectionTitle}>Company Structure</h2>
          <ul style={styles.resourceLinks}>
            <li><a href="#" style={styles.linkItem}>Organizational Chart</a></li>
            <li><a href="#" style={styles.linkItem}>Department Directory</a></li>
            <li><a href="#" style={styles.linkItem}>Leadership Team</a></li>
          </ul>
        </div>
        <div style={styles.resourceSection}>
          <h2 style={styles.sectionTitle}>Company Information</h2>
          <ul style={styles.resourceLinks}>
            <li><a href="#" style={styles.linkItem}>Mission & Vision</a></li>
            <li><a href="#" style={styles.linkItem}>Company Values</a></li>
            <li><a href="#" style={styles.linkItem}>Strategic Plan 2025</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function TrainingDevelopment({ goBack }) {
  const courses = [
    { name: "New Employee Orientation", duration: "4 hours", mandatory: true },
    { name: "Cybersecurity Awareness", duration: "1 hour", mandatory: true },
    { name: "Leadership Skills", duration: "8 hours", mandatory: false },
    { name: "Project Management Basics", duration: "6 hours", mandatory: false }
  ];

  return (
    <div style={styles.container}>
      <button onClick={goBack} style={styles.backButton}>← Back to Home</button>
      <h1 style={styles.pageTitle}>Training & Development</h1>
      <div style={styles.pageContent}>
        <div style={styles.trainingGrid}>
          {courses.map((course, index) => (
            <div key={index} style={styles.courseCard}>
              <h3 style={styles.courseTitle}>{course.name}</h3>
              <p style={styles.courseDuration}>Duration: {course.duration}</p>
              <span style={{
                ...styles.courseTag,
                backgroundColor: course.mandatory ? "#dc3545" : "#28a745"
              }}>
                {course.mandatory ? "Mandatory" : "Optional"}
              </span>
              <button style={styles.enrollButton}>Enroll Now</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Placeholder components for other pages
function OperationalDocuments({ goBack }) {
  return (
    <div style={styles.container}>
      <button onClick={goBack} style={styles.backButton}>← Back to Home</button>
      <h1 style={styles.pageTitle}>Operational Documents</h1>
      <p style={styles.pageContent}>Standard Operating Procedures, Process Workflows, and Quality Management documents will be displayed here.</p>
    </div>
  );
}

function CommunicationNews({ goBack }) {
  return (
    <div style={styles.container}>
      <button onClick={goBack} style={styles.backButton}>← Back to Home</button>
      <h1 style={styles.pageTitle}>Communication & News</h1>
      <p style={styles.pageContent}>Company announcements, newsletters, and internal communications will be displayed here.</p>
    </div>
  );
}

function ToolsTemplates({ goBack }) {
  return (
    <div style={styles.container}>
      <button onClick={goBack} style={styles.backButton}>← Back to Home</button>
      <h1 style={styles.pageTitle}>Tools & Templates</h1>
      <p style={styles.pageContent}>Document templates, forms, and useful tools will be available here.</p>
    </div>
  );
}

function KnowledgeManagement({ goBack }) {
  return (
    <div style={styles.container}>
      <button onClick={goBack} style={styles.backButton}>← Back to Home</button>
      <h1 style={styles.pageTitle}>Knowledge Management</h1>
      <p style={styles.pageContent}>Knowledge base, best practices, and documentation will be accessible here.</p>
    </div>
  );
}

// Styles
const styles = {
  app: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
  },
  container: {
    maxWidth: 1200,
    margin: "40px auto",
    padding: "0 20px",
    fontFamily: "Arial, sans-serif",
  },
  welcome: {
    fontSize: "2.5rem",
    color: "#1B467A",
    marginBottom: 30,
    textAlign: "center",
  },
  pageTitle: {
    fontSize: "2rem",
    color: "#1B467A",
    marginBottom: 30,
  },
  backButton: {
    backgroundColor: "#1B467A",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: 5,
    cursor: "pointer",
    marginBottom: 20,
    fontSize: "1rem",
  },
  contentWrapper: {
    display: "flex",
    gap: 30,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  sidebar: {
    flex: "0 0 280px",
    padding: 20,
    backgroundColor: "#f4f6f8",
    borderRadius: 8,
    boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
    position: "sticky",
    top: 20,
    alignSelf: "flex-start",
    minHeight: "400px",
  },
  heading: {
    fontSize: "1.5rem",
    color: "#1B467A",
    marginBottom: 15,
    borderBottom: "1px solid #ccc",
    paddingBottom: 5,
  },
  categoryContainer: {
    marginBottom: 8,
  },
  categoryHeader: {
    backgroundColor: "#1B467A",
    color: "white",
    padding: "10px 12px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.95rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "background-color 0.2s",
  },
  categoryHeaderExpanded: {
    backgroundColor: "#2a5a8a",
  },
  arrow: {
    fontSize: "0.8rem",
  },
  faqContainer: {
    backgroundColor: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: "0 0 6px 6px",
    marginTop: -1,
  },
  faqItem: {
    borderBottom: "1px solid #f0f0f0",
  },
  question: {
    padding: "10px 12px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.9rem",
  },
  questionExpanded: {
    backgroundColor: "#f8f9fa",
  },
  questionArrow: {
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#1B467A",
  },
  answer: {
    padding: "10px 12px",
    backgroundColor: "#f8f9fa",
    fontSize: "0.85rem",
    lineHeight: 1.4,
    color: "#555",
    borderTop: "1px solid #e8e8e8",
  },
  resourceList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  resourceItem: {
    marginBottom: 10,
  },
  resourceLink: {
    background: "none",
    border: "none",
    color: "#1B467A",
    fontWeight: 500,
    cursor: "pointer",
    fontSize: "1rem",
    textAlign: "left",
    padding: 0,
    transition: "color 0.2s",
  },
  infoBoxes: {
    flex: "1 1 600px",
    display: "flex",
    justifyContent: "flex-start",
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
  pageContent: {
    padding: "20px 0",
  },
  documentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 20,
  },
  documentCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  documentTitle: {
    color: "#1B467A",
    marginBottom: 10,
  },
  documentDesc: {
    color: "#666",
    marginBottom: 15,
  },
  viewButton: {
    backgroundColor: "#1B467A",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: 4,
    cursor: "pointer",
  },
  resourceSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: "#1B467A",
    borderBottom: "2px solid #1B467A",
    paddingBottom: 5,
    marginBottom: 15,
  },
  resourceLinks: {
    listStyle: "none",
    padding: 0,
  },
  linkItem: {
    color: "#1B467A",
    textDecoration: "none",
    padding: "8px 0",
    display: "block",
    borderBottom: "1px solid #eee",
  },
  trainingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
  },
  courseCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  courseTitle: {
    color: "#1B467A",
    marginBottom: 10,
  },
  courseDuration: {
    color: "#666",
    marginBottom: 10,
  },
  courseTag: {
    color: "white",
    padding: "4px 8px",
    borderRadius: 4,
    fontSize: "0.8rem",
    fontWeight: "bold",
    display: "inline-block",
    marginBottom: 15,
  },
  enrollButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: 4,
    cursor: "pointer",
    width: "100%",
  },
};