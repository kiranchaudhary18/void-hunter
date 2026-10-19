import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import { GAME_NAME, GAME_TAGLINE } from '../config/gameConfig.js';
import { Volume2, VolumeX, LogIn, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';

export const PublicNavbar = ({ current = 'home', onNavigate }) => {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const [isMuted, setIsMuted] = useState(soundManager.muted);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMuted(soundManager.muted);
  }, []);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundManager.playPowerUp();
      if (!soundManager.bgmPlaying) {
        soundManager.startBGM('menu');
      }
    } else {
      soundManager.stopBGM();
    }
  };

  const handleAction = (screenName) => {
    soundManager.playLaser();
    setMobileMenuOpen(false);
    if (onNavigate) onNavigate(screenName);
  };

  const handleLogout = () => {
    soundManager.playExplosion();
    if (logout) logout();
    setMobileMenuOpen(false);
    if (onNavigate) onNavigate('landing');
  };

  const navLinks = [
    { id: 'landing', label: 'HOME', match: ['landing', 'home', 'main_menu'] },
    { id: 'missions', label: 'MISSIONS', match: ['missions'] },
    { id: 'hangar', label: 'HANGAR', match: ['hangar', 'ships'] },
    { id: 'leaderboard', label: 'LEADERBOARD', match: ['leaderboard', 'ranks'] },
  ];

  return (
    <header style={styles.topBar}>
      <div style={styles.container}>
        {/* Brand Group */}
        <div 
          style={styles.brandGroup} 
          onClick={() => handleAction('landing')} 
          title="Return to Main Menu"
        >
          {/* Authentic VOID HUNTER Crest Logo */}
          <div style={styles.logoWrapper}>
            <svg width="34" height="34" viewBox="0 0 64 64" style={styles.logoSvg}>
              <polygon points="32,6 44,28 60,52 48,56 38,48 32,58 26,48 16,56 4,52 20,28" fill="#00E5FF" />
              <polygon points="32,12 40,30 50,48 38,48 32,52 26,48 14,48 24,30" fill="#080A2F" />
              <ellipse cx="32" cy="26" rx="3.5" ry="9" fill="#EAF0FF" />
            </svg>
          </div>
          <div style={styles.brandTitles}>
            <div className="font-heading" style={styles.brandTitle}>
              {GAME_NAME}
            </div>
            <div style={styles.brandTag}>
              {GAME_TAGLINE}
            </div>
          </div>
        </div>

        {/* Center Desktop Navigation Links */}
        <nav className="public-center-nav" style={styles.centerNavLinks}>
          {navLinks.map((item) => {
            const isActive = item.match.includes(current);
            return (
              <button
                key={item.id}
                onClick={() => handleAction(item.id)}
                style={{
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {})
                }}
                className={`public-nav-link ${isActive ? 'active' : ''}`}
              >
                {item.label}
                {isActive && <div style={styles.activePill} />}
              </button>
            );
          })}
        </nav>

        {/* Top Right Controls & Auth State */}
        <div style={styles.topBarRight}>
          {/* Sound Control Toggle */}
          <button 
            id="nav-sound-toggle"
            onClick={handleToggleMute} 
            style={styles.iconCircleBtn}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX size={17} color="#EF4444" /> : <Volume2 size={17} color="#00E5FF" />}
          </button>

          {/* Authentication State */}
          {isAuthenticated ? (
            <div style={styles.authGroup}>
              <button
                id="public-nav-dashboard"
                onClick={() => handleAction('dashboard')}
                style={styles.dashboardBtn}
                title="Open Command Deck"
              >
                <LayoutDashboard size={15} color="#00E5FF" />
                <span style={styles.pilotCallsign}>
                  {user?.pilotName || user?.username || 'COMMAND DECK'}
                </span>
              </button>
              <button
                onClick={handleLogout}
                style={styles.logoutBtn}
                title="Disconnect Pilot Link"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button 
              id="public-nav-login"
              onClick={() => handleAction('auth')} 
              style={styles.loginBtn}
              title="Authenticate Pilot Link"
            >
              <LogIn size={15} />
              <span className="public-login-text-full">LOGIN / ENLIST</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={styles.mobileMenuBtn}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} color="#00E5FF" /> : <Menu size={20} color="#EAF0FF" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={styles.mobileDrawer}>
          <div style={styles.mobileNavLinks}>
            {navLinks.map((item) => {
              const isActive = item.match.includes(current);
              return (
                <button
                  key={item.id}
                  onClick={() => handleAction(item.id)}
                  style={{
                    ...styles.mobileNavLink,
                    ...(isActive ? styles.mobileNavLinkActive : {})
                  }}
                >
                  {item.label}
                </button>
              );
            })}
            {isAuthenticated ? (
              <button
                onClick={() => handleAction('dashboard')}
                style={{ ...styles.mobileNavLink, color: '#00E5FF' }}
              >
                COMMAND DECK ({user?.pilotName || user?.username || 'PILOT'})
              </button>
            ) : (
              <button
                onClick={() => handleAction('auth')}
                style={{ ...styles.mobileNavLink, color: '#00E5FF' }}
              >
                LOGIN / ENLIST
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const styles = {
  topBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '70px',
    background: 'rgba(8, 10, 47, 0.94)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(0, 229, 255, 0.25)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(0, 229, 255, 0.08)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 clamp(16px, 3.5vw, 36px)',
    boxSizing: 'border-box'
  },
  container: {
    maxWidth: '1380px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    userSelect: 'none'
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    filter: 'drop-shadow(0 0 8px rgba(0, 229, 255, 0.6))'
  },
  logoSvg: {
    display: 'block'
  },
  brandTitles: {
    display: 'flex',
    flexDirection: 'column'
  },
  brandTitle: {
    fontFamily: 'Orbitron, sans-serif',
    fontSize: '1.15rem',
    fontWeight: '900',
    lineHeight: 1.1,
    letterSpacing: '0.08em',
    color: '#EAF0FF',
    textShadow: '0 0 12px rgba(0, 229, 255, 0.4)'
  },
  brandTag: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.62rem',
    color: '#94A3B8',
    letterSpacing: '0.12em',
    marginTop: '2px',
    textTransform: 'uppercase'
  },
  centerNavLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  navLink: {
    position: 'relative',
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    fontFamily: 'Orbitron, sans-serif',
    fontSize: '0.82rem',
    letterSpacing: '0.12em',
    cursor: 'pointer',
    padding: '8px 12px',
    transition: 'all 0.2s ease',
    borderRadius: '6px'
  },
  navLinkActive: {
    color: '#00E5FF',
    textShadow: '0 0 10px rgba(0, 229, 255, 0.8)'
  },
  activePill: {
    position: 'absolute',
    bottom: '-4px',
    left: '12%',
    right: '12%',
    height: '2px',
    background: '#00E5FF',
    boxShadow: '0 0 8px #00E5FF',
    borderRadius: '2px'
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  iconCircleBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(17, 23, 53, 0.85)',
    border: '1px solid rgba(0, 229, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.4)'
  },
  authGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  dashboardBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#111735',
    border: '1px solid rgba(0, 229, 255, 0.4)',
    color: '#EAF0FF',
    fontFamily: 'Orbitron, sans-serif',
    fontSize: '0.78rem',
    fontWeight: '700',
    letterSpacing: '0.08em',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 0 12px rgba(0, 229, 255, 0.15)'
  },
  pilotCallsign: {
    maxWidth: '140px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    background: 'rgba(17, 23, 53, 0.7)',
    border: '1px solid rgba(239, 68, 68, 0.35)',
    color: '#EF4444',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  loginBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #00E5FF 0%, #00B4D8 100%)',
    color: '#080A2F',
    fontFamily: 'Orbitron, sans-serif',
    fontSize: '0.8rem',
    fontWeight: '800',
    letterSpacing: '0.1em',
    padding: '9px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 0 18px rgba(0, 229, 255, 0.35)',
    transition: 'all 0.2s ease'
  },
  mobileMenuBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px'
  },
  mobileDrawer: {
    position: 'absolute',
    top: '70px',
    left: 0,
    right: 0,
    background: 'rgba(8, 10, 47, 0.98)',
    borderBottom: '1px solid rgba(0, 229, 255, 0.3)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
    padding: '16px 24px',
    zIndex: 99
  },
  mobileNavLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  mobileNavLink: {
    background: 'none',
    border: 'none',
    color: '#EAF0FF',
    fontFamily: 'Orbitron, sans-serif',
    fontSize: '0.9rem',
    letterSpacing: '0.1em',
    padding: '10px 0',
    textAlign: 'left',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  mobileNavLinkActive: {
    color: '#00E5FF'
  }
};

export default PublicNavbar;
