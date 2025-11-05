import React from 'react';
import './ConfirmationModal.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal-overlay" onClick={onCancel}>
      <div className="confirmation-modal-content" onClick={e => e.stopPropagation()}>
        <div className="confirmation-modal-header">
          <h2 className="confirmation-modal-title">{title}</h2>
          <button className="confirmation-modal-close" onClick={onCancel}>×</button>
        </div>
        
        <div className="confirmation-modal-body">
          <div className={`confirmation-icon ${type}`}>
            {type === 'danger' && '⚠️'}
            {type === 'warning' && '⚠️'}
            {type === 'info' && 'ℹ️'}
          </div>
          <p className="confirmation-message">{message}</p>
        </div>
        
        <div className="confirmation-modal-actions">
          <button 
            className="btn-secondary" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`btn-${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
