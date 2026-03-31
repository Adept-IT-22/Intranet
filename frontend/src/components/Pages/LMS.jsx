import React from "react";
import { Layout, ShieldCheck, GraduationCap } from "lucide-react";
import "./LMS.css";

const LMSPage = () => {
  const lmsUrl = "http://lms.adept-techno.co.ke";

  return (
    <div className="lms-page">
      {/* Header - Simplified */}
      <header className="lms-header">
        <div className="lms-logo-group">
          <span>Adept Technologies LMS</span>
        </div>
      </header>

      {/* Hero Section - Simplified */}
      <section className="lms-hero">
        <div className="lms-hero-content">
          <h1>Learning For Professionals</h1>
          <p>
            An internal learning platform designed to help you build deep technical expertise, 
            stay compliant, and grow into leadership roles.
          </p>
          <div className="lms-hero-btns">
            <a href={lmsUrl} target="_blank" rel="noopener noreferrer" className="lms-btn btn-lms-primary">
              Access courses
            </a>
          </div>
        </div>
        
        {/* Mockup visual on the right */}
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
    </div>
  );
};

export default LMSPage;
