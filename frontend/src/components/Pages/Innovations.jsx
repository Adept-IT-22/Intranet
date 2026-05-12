import React from 'react';
import innovationImg1 from '../../assets/ideahub1-pic.png';
import './Innovations.css';

const InnovationsBoard = () => {
  const useButtonCTA = true;
  
  //const ideahubLink = "http://localhost:4200/home"; //change to hosted domain
  const ideahubLink = "https://ideahub.adept-techno.co.ke/";

  return (
    <div className="innovations-container">
      <div className="innovations-image-container">
        <div className="innovations-image-wrapper">
          <img 
            src={innovationImg1} 
            alt="Innovation Screenshot" 
            className="innovations-image" 
          />
          <div className="innovations-overlay-content">
            <a 
              href={ideahubLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="innovations-button-cta"
            >
              💡 Click here to contribute your ideas
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InnovationsBoard;
