import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

interface Props {
  onLogin?: () => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Wypełnij wszystkie pola');
      return;
    }
    
    // Prosta walidacja - w rzeczywistej aplikacji byłoby to zapytanie do API
    if (username === 'admin' && password === 'admin') {
      setError('');
      if (onLogin) onLogin();
    } else {
      setError('Nieprawidłowe dane logowania');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <img src="/images/logo.png" alt="Polishlus logo" className="login-logo" />
          <h1>Zaloguj się</h1>
          <p>Wprowadź swoje dane aby uzyskać dostęp do systemu</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <User className="lucide-icon input-icon" size={20} />
            <input
              type="text"
              placeholder="Nazwa użytkownika"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
            />
          </div>

          <div className="input-group">
            <Lock className="lucide-icon input-icon" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Hasło"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 
                <EyeOff className="lucide-icon" size={20} /> : 
                <Eye className="lucide-icon" size={20} />
              }
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button">
            <LogIn className="lucide-icon" size={20} style={{marginRight: 8}} />
            Zaloguj się
          </button>
        </form>

        <div className="login-footer">
          <p>Demo: admin / admin</p>
        </div>
      </div>
    </div>
  );
};

export default Login; 