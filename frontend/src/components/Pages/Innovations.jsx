import React from 'react';
import api from '../../api';
import innovationImg1 from '../../assets/final-ideahub-image.png';
import './Innovations.css';

const InnovationsBoard = () => {
  const ideahubLink = "https://ideahub.adept-techno.co.ke/";
  const ideahubSSORoute = import.meta.env.VITE_IDEAHUB_SSO_URL;

  const handleContribute = async (e) => {
    e.preventDefault();
    try {
      const response = await api.get('/auth/sso-token/');
      const ssoToken = response.data.token;
      window.location.href = `${ideahubSSORoute}?token=${ssoToken}`;
    } catch (error) {
      console.error("SSO Handoff failed:", error);
      window.open(ideahubLink, "_blank");
    }
  };

  return (
    <div className="innovations-page">
      <section className="innovations-hero">
        <img src={innovationImg1} alt="Innovations Dashboard" />
        
        <div className="innovations-btn-container">
          <a 
            href={ideahubLink} 
            onClick={handleContribute}
            className="innovations-overlay-btn"
          >
            <span className="btn-icon">💡</span> Click here to contribute your ideas
          </a>
        </div>
      </section>
    </div>
  );
};

export default InnovationsBoard;

