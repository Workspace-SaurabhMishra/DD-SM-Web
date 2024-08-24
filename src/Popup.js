// src/Popup.js
import React from "react";
import "./Popup.css";

const Popup = ({ message, type, image, onClose }) => {
  return (
    <div className={`popup-container ${type}`}>
      <div className="popup-content">
        {image && <img src={image} alt="Popup" className="popup-image" />}
        <p className="popup-message">{message}</p>
        <button className="popup-close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Popup;
