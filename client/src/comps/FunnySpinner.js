import React from 'react';
import './spinner.css';

const FunnySpinner = ({ status = 'Processing...' }) => {
  return (
    <div className="funny-spinner-wrapper">
      <div className="spinner-container">
        <div className="spinning-orb"></div>

        <div className="particles">
          <div className="particle p1"></div>
          <div className="particle p2"></div>
          <div className="particle p3"></div>
        </div>

        <div className="bouncing-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>

        <div className="rotating-ring"></div>

        <div className="pulse-background"></div>
      </div>

      <div className="funny-messages">
        <p className="status-text">{status}</p>
        <div className="loading-quotes">
          <span>⏳</span>
          <p>Teaching AI to read PDFs...</p>
        </div>
      </div>

      <div className="animated-loader">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default FunnySpinner;