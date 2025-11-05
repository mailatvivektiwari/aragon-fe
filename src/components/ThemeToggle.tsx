import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle-container">
      <div className="theme-toggle-wrapper">
        <div className="theme-icon-left">
          ☀️
        </div>
        
        <button 
          className={`theme-toggle-switch ${theme}`}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <div className="theme-toggle-track">
            <div className="theme-toggle-thumb"></div>
          </div>
        </button>
        
        <div className="theme-icon-right">
          🌙
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
