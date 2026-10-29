import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Donor & Verify pages manage their own dedicated responsive navigation — hide global navbar
  if (location.pathname.startsWith('/donor') || location.pathname.startsWith('/verify')) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'hospital') return '/hospital';
    return '/donor';
  };

  return (
    <nav style={styles.nav} className="navbar-container">
      {/* Brand */}
      <Link to="/" style={styles.brand}>
        <img src={logo} alt="RedFlow Logo" style={styles.logoImg} className="navbar-logo-img" />
        <span style={styles.brandText} className="navbar-brand-text">
          <span style={styles.red}>Red</span>
          <span style={styles.flow}>Flow</span>
        </span>
      </Link>

      {/* Desktop / Navigation links */}
      <div style={styles.links} className="navbar-links">
        {isAuthenticated && user?.role === 'admin' && (
          <Link
            to="/admin/blockchain"
            style={{
              ...styles.link,
              ...(location.pathname.startsWith('/admin/blockchain') || location.pathname === '/blockchain' ? styles.activeLink : {}),
            }}
          >
            Blockchain Hub
          </Link>
        )}

        {isAuthenticated ? (
          <>
            <Link to={dashLink()} style={styles.link}>Dashboard</Link>
            <span style={styles.roleChip}>{user?.role}</span>
            {user?.picture && (
              <img
                src={user.picture}
                alt={user.name || 'User'}
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #007C91' }}
              />
            )}
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        ) : (

          <>
            <Link
              to="/login"
              className="navbar-login-link"
              style={{
                ...styles.link,
                ...(location.pathname === '/login' ? styles.activeLink : {}),
              }}
            >
              Login
            </Link>
            <Link to="/register" style={styles.registerBtn}>Register</Link>
          </>
        )}
      </div>


      {/* Mobile hamburger */}
      <button
        style={styles.hamburger}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <span style={styles.bar} />
        <span style={styles.bar} />
        <span style={styles.bar} />
      </button>

      {menuOpen && (
        <div style={styles.mobileMenu}>
          {isAuthenticated ? (
            <>
              <Link to={dashLink()} style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={styles.mobileLinkBtn}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: '64px',
    background: '#172B4D',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoImg: {
    height: '42px',
    width: '42px',
    objectFit: 'contain',
  },
  brandText: {
    fontSize: '32px',
    fontWeight: '900',
    letterSpacing: '0.2px',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
  },
  red: {
    color: '#D32F2F',
  },
  flow: {
    color: '#FFFFFF',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  link: {
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    opacity: 0.85,
  },
  activeLink: {
    opacity: 1,
    borderBottom: '2px solid #007C91',
    paddingBottom: '2px',
  },
  registerBtn: {
    background: '#007C91',
    color: '#FFFFFF',
    padding: '8px 18px',
    borderRadius: '4px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.4)',
    color: '#FFFFFF',
    padding: '6px 14px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  roleChip: {
    background: 'rgba(0,124,145,0.3)',
    color: '#7FDFEF',
    padding: '3px 10px',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  hamburger: {
    display: 'none',
    flexDirection: 'column',
    gap: '5px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
  },
  bar: {
    display: 'block',
    width: '22px',
    height: '2px',
    background: '#FFFFFF',
    borderRadius: '2px',
  },
  mobileMenu: {
    position: 'absolute',
    top: '64px',
    left: 0,
    right: 0,
    background: '#172B4D',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 32px',
    gap: '12px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  mobileLink: {
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
  },
  mobileLinkBtn: {
    background: 'transparent',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    padding: 0,
  },
};

export default Navbar;
