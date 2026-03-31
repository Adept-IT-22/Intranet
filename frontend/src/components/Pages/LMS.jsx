import React from "react";
import { Check, ArrowRight, Layout, Globe, User, ShieldCheck, GraduationCap, Zap } from "lucide-react";
import "./LMS.css";

const LMSPage = () => {
  const lmsUrl = "http://lms.adept-techno.co.ke";

  return (
    <div className="lms-page">
      {/* Sticky Header */}
      <header className="lms-header">
        <div className="lms-logo-group">
          <Zap size={24} fill="#fbbf24" color="#fbbf24" />
          <span>Adept Technologies LMS</span>
        </div>
        <nav className="lms-nav">
          <a href={lmsUrl} target="_blank" rel="noopener noreferrer" className="lms-nav-link">Our Website</a>
          <a href={lmsUrl} target="_blank" rel="noopener noreferrer" className="lms-login-btn">Login</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="lms-hero">
        <div className="lms-hero-content">
          <h1>Learning For Professionals</h1>
          <p>
            An internal learning platform designed to help you build deep technical expertise, 
            stay compliant, and grow into leadership roles.
          </p>
          <div className="lms-hero-btns">
            <a href={lmsUrl} target="_blank" rel="noopener noreferrer" className="lms-btn btn-lms-primary">Access courses</a>
            <a href={lmsUrl} target="_blank" rel="noopener noreferrer" className="lms-btn btn-lms-outline">Enroll Now</a>
          </div>
        </div>
        
        {/* Visual Decoration (Replacing AI Images with CSS Shapes) */}
        <div className="lms-hero-visual">
          <div className="lms-mockup-stack">
            <div className="mockup-item mockup-1">
              <Layout size={40} color="#1e3a5f" />
            </div>
            <div className="mockup-item mockup-2">
              <ShieldCheck size={40} color="#1e3a5f" />
            </div>
            <div className="mockup-item mockup-3">
              <GraduationCap size={60} color="#1e3a5f" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content / Features */}
      <section className="lms-section">
        <div className="lms-section-header">
          <h2>Grow Your Career with Adept</h2>
          <p>
            The LMS provides structured, role-specific learning paths that align your development 
            with Adept's technology strategy and client needs.
          </p>
        </div>

        <div className="lms-grid">
          {/* Onboarding Card */}
          <div className="lms-card">
            <h3>Onboarding</h3>
            <ul className="lms-card-list">
              <li><Check size={18} className="check-icon" /> New hire journeys</li>
              <li><Check size={18} className="check-icon" /> Checklists and milestones</li>
              <li><Check size={18} className="check-icon" /> Automated reminders</li>
            </ul>
            <a href={lmsUrl} target="_blank" rel="noopener noreferrer" className="btn-card-action">View courses</a>
          </div>

          {/* Skills Card */}
          <div className="lms-card">
            <h3>Skills</h3>
            <ul className="lms-card-list">
              <li><Check size={18} className="check-icon" /> Assessments and certificates</li>
              <li><Check size={18} className="check-icon" /> Progress tracking</li>
              <li><Check size={18} className="check-icon" /> Course catalog</li>
            </ul>
            <a href={lmsUrl} target="_blank" rel="noopener noreferrer" className="btn-card-action">View courses</a>
          </div>

          {/* Compliance Card */}
          <div className="lms-card">
            <h3>Compliance</h3>
            <ul className="lms-card-list">
              <li><Check size={18} className="check-icon" /> Policy training & attestations</li>
              <li><Check size={18} className="check-icon" /> Audit-ready reporting</li>
              <li><Check size={18} className="check-icon" /> Expiry and renewal alerts</li>
            </ul>
            <a href={lmsUrl} target="_blank" rel="noopener noreferrer" className="btn-card-action">View courses</a>
          </div>
        </div>
      </section>

      {/* Mini Footer / Status Bar */}
      <footer className="lms-footer-mini">
        <div className="footer-info">
          © 2026 Adept LMS. All rights reserved.
        </div>
        <div className="status-indicator">
          <div className="status-dot"></div>
          <span>Systems Operational</span>
        </div>
        <div className="footer-links">
          <a href={lmsUrl} target="_blank" rel="noopener noreferrer" className="lms-nav-link" style={{color:'white', opacity:0.7, fontSize:'0.8rem'}}>Main Website</a>
        </div>
      </footer>
    </div>
  );
};

export default LMSPage;
