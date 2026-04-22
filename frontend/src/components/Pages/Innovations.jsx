import React from 'react';
import api from '../../api';
import innovationImg1 from '../../assets/ideahub1-pic.png';

const InnovationsBoard = () => {
  const useButtonCTA = true;
  
  const ideahubLink = "https://ideahub.adept-techno.co.ke/";
  // Use the environment variable for the SSO route
  const ideahubSSORoute = import.meta.env.VITE_IDEAHUB_SSO_URL;

  const handleContribute = async (e) => {
    e.preventDefault();
    try {
      // 1. Fetch the short-lived SSO token from the Intranet backend
      const response = await api.get('/auth/sso-token/');
      const ssoToken = response.data.token;

      // 2. Redirect to Ideahub with the token in the URL
      // We use the local 4200 port for dev, but this would be the real domain in prod
      window.location.href = `${ideahubSSORoute}?token=${ssoToken}`;
    } catch (error) {
      console.error("SSO Handoff failed:", error);
      // Fallback: just open the link normally if SSO fails
      window.open(ideahubLink, "_blank");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>
        Innovations
      </h1>
      <p style={styles.subtitle}>
        Your Ideas Matter
      </p>

      <div style={styles.imageContainer}>
        <div style={styles.imageWrapper}>
          <img 
            src={innovationImg1} 
            alt="Innovation Screenshot" 
            style={styles.image} 
          />
        </div>
      </div>

      <div style={styles.actionContainer}>
        {useButtonCTA ? (
          /* Style B: PROMINENT BUTTON */
          <a 
            href={ideahubLink} 
            onClick={handleContribute}
            style={styles.buttonCTA}
          >
            💡 Click here to contribute your ideas
          </a>
        ) : (
          /* Style A: CLEAN TEXT LINK */
          <p style={styles.textLinkContainer}>
            Want to shape the future?{' '}
            <a 
              href={ideahubLink} 
              onClick={handleContribute}
              style={styles.textLink}
            >
              Click here to contribute your ideas
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: 'auto'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    fontSize: '3rem',
    fontWeight: '800',
    marginBottom: '15px'
  },
  subtitle: {
    textAlign: 'center',
    color: '#555',
    marginBottom: '50px',
    fontSize: '1.3rem',
    maxWidth: '800px',
    margin: '0 auto 50px',
    lineHeight: '1.6'
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '50px'
  },
  imageWrapper: {
    width: '100%',
    maxWidth: '1000px'
  },
  image: {
    width: '100%',
    height: '450px',
    objectFit: 'cover',
    borderRadius: '5px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
  },
  actionContainer: {
    textAlign: 'center',
    padding: '20px'
  },
  buttonCTA: {
    display: 'inline-block',
    padding: '16px 40px',
    background: '#1B467A',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '1.2rem',
    fontWeight: '600',
    transition: 'background-color 0.2s',
    border: 'none'
  },
  textLinkContainer: {
    fontSize: '1.1rem',
    color: '#444'
  },
  textLink: {
    color: '#007bff',
    fontWeight: 'bold',
    textDecoration: 'underline'
  }
};

export default InnovationsBoard;
