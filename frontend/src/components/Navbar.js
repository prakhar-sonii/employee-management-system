import React from 'react';
import { useAuth } from '../app/context/AuthContext';
import { useTheme } from '../app/context/ThemeContext';

const Navbar = ({ pageTitle, onMenuToggle }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="navbar-menu-btn" onClick={onMenuToggle} aria-label="Toggle menu">
          ☰
        </button>
        <span className="navbar-title">{pageTitle}</span>
      </div>
      <div className="navbar-right">
        {user && (
          <>
            <span className="navbar-greeting">Hello, {user.name?.split(' ')[0]}</span>
            <span className="navbar-role-badge">{user.role}</span>
          </>
        )}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
