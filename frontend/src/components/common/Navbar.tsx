import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Globe2,
  Compass,
  CloudSun,
  Coins,
  Scale,
  LayoutDashboard,
  Bookmark,
  History,
  Shield,
  LogOut,
  User,
  Menu,
  X,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand" onClick={closeMobile}>
          <div className="brand-icon">
            <Globe2 size={22} />
          </div>
          <span>OpenData<span style={{ color: 'var(--primary-light)' }}>Explorer</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-links">
          <NavLink to="/countries" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Compass size={17} />
            <span>Countries</span>
          </NavLink>
          <NavLink to="/compare" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Scale size={17} />
            <span>Compare</span>
          </NavLink>
          <NavLink to="/weather" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <CloudSun size={17} />
            <span>Weather</span>
          </NavLink>
          <NavLink to="/currency" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Coins size={17} />
            <span>Currency</span>
          </NavLink>
        </nav>

        {/* User Auth Actions */}
        <div className="nav-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                title="Personal Dashboard"
              >
                <LayoutDashboard size={15} />
                <span className="hide-sm">Dashboard</span>
              </NavLink>

              <NavLink
                to="/saved"
                className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                title="Saved Favourites"
              >
                <Bookmark size={15} />
              </NavLink>

              <NavLink
                to="/history"
                className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                title="Search History"
              >
                <History size={15} />
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                  style={{ borderColor: 'var(--accent-amber)', color: 'var(--accent-amber)' }}
                  title="Admin Portal"
                >
                  <Shield size={15} />
                  <span className="hide-sm">Admin</span>
                </NavLink>
              )}

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.65rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <User size={15} color="var(--primary-light)" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.username}</span>
                <span className={`badge ${user.role === 'admin' ? 'badge-amber' : 'badge-primary'}`} style={{ fontSize: '0.65rem' }}>
                  {user.role}
                </span>
              </div>

              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log out">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger toggle */}
          <button
            className="btn btn-secondary btn-icon show-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
            style={{ display: 'none' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <NavLink to="/countries" className="nav-link" onClick={closeMobile}>
              <Compass size={17} /> Countries Explorer
            </NavLink>
            <NavLink to="/compare" className="nav-link" onClick={closeMobile}>
              <Scale size={17} /> Country Comparator
            </NavLink>
            <NavLink to="/weather" className="nav-link" onClick={closeMobile}>
              <CloudSun size={17} /> Live Weather Forecast
            </NavLink>
            <NavLink to="/currency" className="nav-link" onClick={closeMobile}>
              <Coins size={17} /> Currency Converter
            </NavLink>
            {user && (
              <>
                <NavLink to="/dashboard" className="nav-link" onClick={closeMobile}>
                  <LayoutDashboard size={17} /> Dashboard
                </NavLink>
                <NavLink to="/saved" className="nav-link" onClick={closeMobile}>
                  <Bookmark size={17} /> Favourites
                </NavLink>
                <NavLink to="/history" className="nav-link" onClick={closeMobile}>
                  <History size={17} /> Search History
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className="nav-link" onClick={closeMobile}>
                    <Shield size={17} /> Admin Panel
                  </NavLink>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
