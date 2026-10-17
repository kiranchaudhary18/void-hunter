import React, { useState } from 'react';
import soundManager from '../game/managers/SoundManager.js';
import { GAME_NAME, GAME_TAGLINE } from '../config/gameConfig.js';
import { Volume2, VolumeX, LogIn } from 'lucide-react';

export const PublicNavbar = ({ current = 'home', onNavigate }) => {
  const [isMuted, setIsMuted] = useState(soundManager.muted);

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
    if (onNavigate) onNavigate(screenName);
  };

  const navLinks = [
    { id: 'landing', label: 'HOME', match: ['landing', 'home', 'main_menu'] },
    { id: 'missions', label: 'MISSIONS', match: ['missions'] },
    { id: 'hangar', label: 'HANGAR', match: ['hangar'] },
    { id: 'leaderboard', label: 'LEADERBOARD', match: ['leaderboard'] },
  ];

  return (
    <header style={styles.topBar} className="glass-panel">
      <div style={styles.container}>
        {/* Brand Group */}
        <div 
          style={styles.brandGroup} 
          onClick={() => handleAction('landing')} 
          title="Return to Main Menu"
        >
          <svg width="32" height="32" viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 0 8px #00E5FF)' }}>
            <polygon points="32,6 44,28 60,52 48,56 38,48 32,58 26,48 16,56 4,52 20,28" fill="#00E5FF" />
            <ellipse cx="32" cy="26" rx="4" ry="10" fill="#FFFFFF" />
          </svg>
          <div>
            <div className="font-heading text-glow-cyan" style={styles.brandTitle}>
              {GAME_NAME}
            </div>
            <div style={styles.brandTag}>
              {GAME_TAGLINE}
            </div>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav style={styles.centerNavLinks}>
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

        {/* Top Right Utilities */}
        <div style={styles.topBarRight}>
          <button 
            onClick={handleToggleMute} 
            style={styles.iconCircleBtn}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={16} color="#EF4444" /> : <Volume2 size={16} color="var(--secondary-cyan)" />}
          </button>

          <button 
            id="public-nav-login"
            onClick={() => handleAction('auth')} 
            className="btn btn-cyan animate-pulse-glow"
            style={styles.loginBtn}
          >
            <LogIn size={15} />
            <span>LOGIN / ENLIST</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const styles = {
  topBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '68px',
    background: 'rgba(6, 9, 25, 0.94)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(0, 229, 255, 0.25)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(0, 229, 255, 0.1)',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 24px'
  },
  container: {
    maxWidth: '1320px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer'
  },
  brandTitle: {
    fontSize: '1.1rem',
    lineHeight: 1.1,
    letterSpacing: '0.08em',
    fontWeight: '900'
  },
  brandTag: {
    fontSize: '0.55rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.1em',
    marginTop: '2px'
  },
  centerNavLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '28px'
  },
  navLink: {
    position: 'relative',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.82rem',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    padding: '8px 12px',
    transition: 'all 0.2s ease',
    borderRadius: '6px'
  },
  navLinkActive: {
    color: 'var(--secondary-cyan)',
    textShadow: '0 0 10px rgba(0, 229, 255, 0.8)'
  },
  activePill: {
    position: 'absolute',
    bottom: '-4px',
    left: '15%',
    right: '15%',
    height: '2px',
    background: 'var(--secondary-cyan)',
    boxShadow: '0 0 8px #00E5FF',
    borderRadius: '2px'
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  iconCircleBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'rgba(10, 15, 40, 0.65)',
    border: '1px solid rgba(0, 229, 255, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  loginBtn: {
    padding: '8px 22px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '8px'
  }
};

export default PublicNavbar;
