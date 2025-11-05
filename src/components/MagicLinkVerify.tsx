import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './MagicLinkVerify.css';

const MagicLinkVerify: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const verifyMagicLink = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid magic link. The token is missing.');
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/api/auth/verify-magic-link', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify magic link');
        }

        // Login successful
        login(data.data.token, data.data.user);
        setStatus('success');
        setMessage(`Welcome ${data.data.user.name || data.data.user.email}! Redirecting to your dashboard...`);

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/');
        }, 2000);

      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to verify magic link. Please try again.');
      }
    };

    verifyMagicLink();
  }, [searchParams, login, navigate]);

  const handleReturnToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="magic-link-verify">
      <div className="verify-container">
        <div className="verify-content">
          {status === 'verifying' && (
            <>
              <div className="verify-icon verifying">
                <div className="spinner">🔗</div>
              </div>
              <h2>Verifying Magic Link</h2>
              <p>Please wait while we verify your magic link...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="verify-icon success">
                <span>✅</span>
              </div>
              <h2>Welcome to Kanban!</h2>
              <p>{message}</p>
              <div className="success-animation">
                <div className="confetti">🎉</div>
                <div className="confetti">🎊</div>
                <div className="confetti">✨</div>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="verify-icon error">
                <span>❌</span>
              </div>
              <h2>Verification Failed</h2>
              <p>{message}</p>
              <div className="error-actions">
                <button 
                  className="retry-btn"
                  onClick={handleReturnToLogin}
                >
                  🔗 Get New Magic Link
                </button>
              </div>
            </>
          )}
        </div>

        {status !== 'success' && (
          <div className="verify-info">
            <div className="info-item">
              <span className="info-icon">💡</span>
              <div>
                <strong>Magic Link Tips</strong>
                <p>Magic links expire after 15 minutes and can only be used once for security.</p>
              </div>
            </div>
            {status === 'error' && (
              <div className="info-item">
                <span className="info-icon">🔄</span>
                <div>
                  <strong>Need Help?</strong>
                  <p>If you're having trouble, try requesting a new magic link from the login page.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MagicLinkVerify;
