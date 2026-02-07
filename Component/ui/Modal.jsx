import React from "react";
import "./ui.css";


const Modal = ({ isOpen, onClose, title, children, className = "" }) => {
  if (!isOpen) return null;

  return (
    <div className="ui-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`ui-modal ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ui-modal-header">
          <h3>{title}</h3>
          <button
            type="button"
            className="ui-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="ui-modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
