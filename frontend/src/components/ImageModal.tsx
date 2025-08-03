import React, { useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  imageSrc: string;
  imageAlt: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageSrc, imageAlt, onClose }) => {
  const [scale, setScale] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // Reset zoom and rotation when opening
      setScale(1);
      setRotation(0);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  if (!isOpen) return null;

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="image-modal-header">
          <div className="image-modal-title">{imageAlt}</div>
          <div className="image-modal-controls">
            <button 
              className="image-modal-btn" 
              onClick={handleZoomOut}
              title="Pomniejsz"
            >
              <ZoomOut size={16} />
            </button>
            <button 
              className="image-modal-btn" 
              onClick={handleZoomIn}
              title="Powiększ"
            >
              <ZoomIn size={16} />
            </button>
            <button 
              className="image-modal-btn" 
              onClick={handleRotate}
              title="Obróć"
            >
              <RotateCw size={16} />
            </button>
            <button 
              className="image-modal-btn" 
              onClick={handleReset}
              title="Resetuj"
            >
              Reset
            </button>
            <button 
              className="image-modal-btn close" 
              onClick={onClose}
              title="Zamknij"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        
        <div className="image-modal-body">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="image-modal-image"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center'
            }}
          />
        </div>
        
        <div className="image-modal-footer">
          <div className="image-modal-info">
            Skala: {Math.round(scale * 100)}% | Obrót: {rotation}°
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal; 