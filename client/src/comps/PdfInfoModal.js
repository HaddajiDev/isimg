import React from 'react';
import './modal.css';

const PdfInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>PDF Upload</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body info-content">
          <img 
            src="https://savage-files-cdn.vercel.app/files/inspect/67bafde68966c22c8b077744"
            alt="PDF upload instructions" 
            className="guide-image"
          />
          <div className="guide-text">
            <p>1. Accédez au site: https://isimg.rnu.tn</p>
            <p>2. Naviguez vers: Relevé de notes</p>
            <p>3. Téléchargez: PDF en bas de page</p>
            <p>4. Importez: Le fichier sur cette site</p>
          </div>
          <button className="ok-btn" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default PdfInfoModal;