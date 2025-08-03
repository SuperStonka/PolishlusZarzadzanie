import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface ApiErrorProps {
  error: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

const ApiError: React.FC<ApiErrorProps> = ({ 
  error, 
  onRetry, 
  showRetry = true 
}) => {
  return (
    <div className="api-error">
      <div className="error-content">
        <AlertCircle className="error-icon" />
        <h3>Błąd połączenia</h3>
        <p>{error}</p>
        {showRetry && onRetry && (
          <button 
            onClick={onRetry}
            className="retry-button"
          >
            <RefreshCw className="retry-icon" />
            Spróbuj ponownie
          </button>
        )}
      </div>
    </div>
  );
};

export default ApiError; 