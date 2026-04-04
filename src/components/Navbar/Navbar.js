import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiRepeat, FiSettings, FiClock, FiLogOut, FiLogIn, FiMenu, FiX, FiUser } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  const userRaw = localStorage.getItem('user');
  let userName = 'User';
  let userEmail = '';
  try {
    const parsed = JSON.parse(userRaw);
    userName = parsed?.name || parsed?.username || parsed?.email?.split('@')[0] || 'User';
    userEmail = parsed?.email || '';
  } catch {}

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserMenuOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't render on auth pages
  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  const navLinks = [
    { to: '/', label: 'Home', icon: <FiHome />, id: 'nav-home' },
    { to: '/convert', label: 'Conversions', icon: <FiRepeat />, id: 'nav-conversions' },
    { to: '/operations', label: 'Operations', icon: <FiSettings />, id: 'nav-operations' },
    { to: '/history', label: 'History', icon: <FiClock />, id: 'nav-history' },
  ];

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  const getInitial = () => {
    return (userName || 'U').charAt(0).toUpperCase();
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand" id="brand-link">
          <span className="brand-icon">Q</span>
          <span className="brand-text">Quanment</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-center">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              to={link.to}
              className={`navbar-link ${
                location.pathname === link.to ? 'active' : ''
              }`}
              id={link.id}
              onClick={() => handleNavClick()}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Right section */}
        <div className="navbar-right">
          {isAuthenticated ? (
            <div className="user-menu-container" ref={userMenuRef}>
              <button
                className="user-avatar-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                id="user-avatar-btn"
              >
                <span className="user-avatar">{getInitial()}</span>
                <span className="user-name-text">{userName}</span>
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="dropdown-avatar">{getInitial()}</div>
                    <div className="dropdown-info">
                      <span className="dropdown-name">{userName}</span>
                      {userEmail && <span className="dropdown-email">{userEmail}</span>}
                    </div>
                  </div>
                  <div className="user-dropdown-divider" />
                  <button className="dropdown-item dropdown-item--danger" onClick={handleLogout} id="logout-btn">
                    <FiLogOut />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-login-btn" id="login-link">
              <FiLogIn />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                to={link.to}
                className={`mobile-nav-link ${location.pathname === link.to ? 'active' : ''}`}
                onClick={() => handleNavClick()}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
          <div className="mobile-nav-divider" />
          {isAuthenticated ? (
            <div className="mobile-user-section">
              <div className="mobile-user-info">
                <span className="mobile-user-avatar">{getInitial()}</span>
                <div>
                  <span className="mobile-user-name">{userName}</span>
                  {userEmail && <span className="mobile-user-email">{userEmail}</span>}
                </div>
              </div>
              <button className="mobile-logout-btn" onClick={handleLogout}>
                <FiLogOut />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link to="/login" className="mobile-login-btn" onClick={() => setMobileOpen(false)}>
              <FiLogIn />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
