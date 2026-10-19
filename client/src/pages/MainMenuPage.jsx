import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import PublicNavbar from '../components/PublicNavbar.jsx';
import { GAME_NAME, GAME_TAGLINE } from '../config/gameConfig.js';
import { 
  Play, Compass, Shield, Award, BarChart3, Wallet, 
  User, ChevronRight, Zap, Coins, Sparkles 
} from 'lucide-react';

export const MainMenuPage = ({ onNavigate }) => {
  const { user, profile, isAuthenticated, logout } = useAuth();

  const handleAction = (screenName) => {
    soundManager.playLaser();
    if (onNavigate) onNavigate(screenName);
  };

  // If user is already authenticated, redirect straight to Command Deck
  React.useEffect(() => {
    if (isAuthenticated && onNavigate) {
      onNavigate('dashboard');
    }
  }, [isAuthenticated, onNavigate]);

  // Ambient Sci-Fi Music on First User Gesture
  React.useEffect(() => {
    const handleFirstGesture = () => {
      if (!soundManager.muted && !soundManager.bgmPlaying) {
        soundManager.startBGM('menu');
      }
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

  return (
    <div style={styles.mainWrapper}>
      {/* Dynamic Starry Space Backdrop */}
      <div style={styles.starsBackdrop} />
      <div style={styles.nebulaGlow} />

      {/* Screen 1 Top Cyber Navigation Bar (Unified Public Navbar) */}
      <PublicNavbar current="home" onNavigate={onNavigate} />

      {/* Screen 1 Two-Column Hero Showcase */}
      <main className="main-menu-hero-grid">
        {/* Left Column: Mission Control & Deploy CTAs */}
        <div className="hero-left-col" style={styles.heroLeftCol}>
          <div style={styles.missionControlBadge}>
            <span style={styles.onlineDot}>●</span>
            <span>MISSION CONTROL // ONLINE</span>
          </div>

          <h1 className="font-heading" style={styles.screen1HeroTitle}>
            ENTER THE VOID.<br />
            <span className="text-glow-cyan" style={{ color: 'var(--secondary-cyan)' }}>HUNT THE UNKNOWN.</span>
          </h1>

          <p style={styles.screen1Subtitle}>
            Explore hostile sectors. Master advanced spacecraft. Defend the galaxy from the forces beyond known space.
          </p>

          <div className="hero-actions-row" style={styles.screen1ActionsRow}>
            <button 
              onClick={() => handleAction('gameplay')}
              className="btn btn-cyan animate-pulse-glow"
              style={styles.screen1PlayBtn}
            >
              <Play size={20} fill="currentColor" />
              <span>PLAY NOW</span>
            </button>

            <button 
              onClick={() => handleAction('missions')}
              className="btn btn-outline"
              style={styles.screen1ContinueBtn}
            >
              <span>CONTINUE MISSION</span>
            </button>
          </div>

          <div style={styles.pressEnterDeploy}>
            PRESS ENTER TO DEPLOY
          </div>
        </div>

        {/* Right Column: Hero Starfighter Graphic (Screen 1) */}
        <div style={styles.heroRightCol}>
          <div style={styles.heroShipGlowBackdrop} />
          <div className="animate-float" style={styles.heroShipContainer}>
            <svg width="340" height="340" viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 0 28px rgba(0, 229, 255, 0.75))' }}>
              <polygon points="32,4 46,24 62,48 48,56 36,46 32,58 28,46 16,56 2,48 18,24" fill="#00E5FF" />
              <polygon points="32,8 42,28 54,46 40,46 32,52 24,46 10,46 22,28" fill="#060919" />
              <ellipse cx="32" cy="24" rx="4" ry="12" fill="#FFFFFF" />
              <circle cx="26" cy="56" r="3" fill="#FF2DFF" style={{ filter: 'drop-shadow(0 0 8px #FF2DFF)' }} />
              <circle cx="38" cy="56" r="3" fill="#FF2DFF" style={{ filter: 'drop-shadow(0 0 8px #FF2DFF)' }} />
            </svg>
          </div>
        </div>
      </main>

      {/* Screen 1 Footer Status Bar */}
      <footer style={styles.screen1Footer}>
        <span style={styles.footerTag}>VOID HUNTER // EARLY ACCESS</span>
        <span style={styles.footerTag}>
          <span style={{ color: '#10B981', marginRight: '6px' }}>●</span>
          SYSTEM READY // V0.1.0
        </span>
      </footer>
    </div>
  );
};

const styles = {
  mainWrapper: {
    position: 'relative',
    minHeight: '100vh',
    width: '100vw',
    backgroundColor: '#060919',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '90px 32px 24px 32px',
    overflow: 'hidden'
  },
  starsBackdrop: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at 50% 30%, rgba(14, 23, 60, 0.75) 0%, #060919 80%)',
    zIndex: 1
  },
  nebulaGlow: {
    position: 'absolute',
    width: '650px',
    height: '650px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(0, 229, 255, 0.08) 50%, transparent 80%)',
    top: '15%',
    left: '50%',
    transform: 'translateX(-50%)',
    filter: 'blur(40px)',
    zIndex: 2,
    pointerEvents: 'none'
  },
  topBar: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '1280px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0'
  },
  brandGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  centerNavLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px'
  },
  navLink: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.78rem',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    transition: 'color 0.2s ease'
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
    border: '1px solid var(--border-glass)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--text-light)'
  },
  pilotCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '6px 14px',
    borderRadius: '12px',
    cursor: 'pointer'
  },
  pilotInfo: {
    textAlign: 'left'
  },
  pilotName: {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.82rem',
    color: 'var(--text-light)'
  },
  pilotRank: {
    fontSize: '0.62rem',
    color: 'var(--secondary-cyan)'
  },
  screen1HeroGrid: {
    position: 'relative',
    zIndex: 10,
    display: 'grid',
    gridTemplateColumns: '1.15fr 0.85fr',
    alignItems: 'center',
    maxWidth: '1280px',
    width: '100%',
    margin: 'auto',
    gap: '40px',
    padding: '20px 0'
  },
  heroLeftCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
    gap: '18px'
  },
  missionControlBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: '20px',
    background: 'rgba(0, 229, 255, 0.1)',
    border: '1px solid rgba(0, 229, 255, 0.35)',
    color: 'var(--secondary-cyan)',
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-heading)'
  },
  onlineDot: {
    color: '#10B981',
    fontSize: '0.9rem'
  },
  screen1HeroTitle: {
    fontSize: 'clamp(2.4rem, 4.5vw, 4rem)',
    lineHeight: 1.08,
    letterSpacing: '0.06em',
    margin: 0
  },
  screen1Subtitle: {
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    maxWidth: '520px',
    margin: 0
  },
  screen1ActionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '10px'
  },
  screen1PlayBtn: {
    padding: '14px 34px',
    fontSize: '0.92rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderRadius: '12px'
  },
  screen1ContinueBtn: {
    padding: '14px 28px',
    fontSize: '0.88rem',
    fontWeight: 'bold',
    borderRadius: '12px'
  },
  pressEnterDeploy: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.12em',
    fontFamily: 'var(--font-heading)',
    marginTop: '4px'
  },
  heroRightCol: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroShipGlowBackdrop: {
    position: 'absolute',
    width: '380px',
    height: '380px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0, 229, 255, 0.25) 0%, rgba(124, 58, 237, 0.15) 50%, transparent 75%)',
    filter: 'blur(30px)',
    pointerEvents: 'none'
  },
  heroShipContainer: {
    zIndex: 5
  },
  screen1Footer: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '1280px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: '16px'
  },
  footerTag: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-heading)'
  }
};

export default MainMenuPage;
