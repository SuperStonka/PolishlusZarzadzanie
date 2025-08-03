import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<Props> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header">
          <div className="confirm-icon">
            <AlertTriangle className="lucide-icon" size={24} color="#f39c12" />
          </div>
          <h3 className="confirm-title">{title}</h3>
          <button className="confirm-close" onClick={onCancel} type="button">
            <X className="lucide-icon" size={20} />
          </button>
        </div>
        
        <div className="confirm-body">
          <p className="confirm-message">{message}</p>
        </div>
        
        <div className="confirm-actions">
          <button className="confirm-btn-cancel" onClick={onCancel} type="button">
            Anuluj
          </button>
          <button className="confirm-btn-delete" onClick={onConfirm} type="button">
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog; 