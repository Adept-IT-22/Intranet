import React, { useEffect } from 'react';

const InnovationsBoard = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://canny.io/sdk.js";
    script.onload = () => {
      if (window.Canny) {
        window.Canny('render', {
          appID: 'adept-technologies', // ✅ Subdomain
          board: 'feedback',           // ✅ Board slug (from your URL)
          basePath: '/innovations',
          theme: 'light',
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  return <div id="canny" style={{ height: '90vh' }} />;
};

export default InnovationsBoard;
