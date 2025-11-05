import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Invalid email or password');
      }

      // Login successful - store token and user data
      if (data.data && data.data.token && data.data.user) {
        login(data.data.token, data.data.user);
        navigate('/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="app-logo">
            <h1>📋 kanban</h1>
          </div>
          <h2>Welcome Back</h2>
          <p>Enter your credentials to access your Kanban boards</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                disabled={isLoading}
                style={{ paddingLeft: '48px' }}
              />
              <div className="input-icon">✉️</div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                style={{ paddingLeft: '48px' }}
              />
              <div className="input-icon">🔒</div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="magic-link-btn"
            disabled={isLoading || !email.trim() || !password.trim()}
          >
            {isLoading && <span className="loading-spinner">⏳</span>}
            {isLoading ? 'Signing In...' : '🚀 Sign In'}
          </button>
        </form>

        <div className="login-info">
          <div className="info-item">
            <span className="info-icon">🔐</span>
            <div>
              <strong>Secure Login</strong>
              <p>Your credentials are securely authenticated.</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">📋</span>
            <div>
              <strong>Manage Your Boards</strong>
              <p>Access all your Kanban boards and tasks.</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">⚡</span>
            <div>
              <strong>Quick Access</strong>
              <p>Login once and stay signed in for 7 days.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
