import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import { GAME_NAME, GAME_TAGLINE } from '../config/gameConfig.js';
import { 
  Play, Compass, Shield, Award, BarChart3, Wallet, 
  User, Volume2, VolumeX, LogOut, ChevronRight, Zap, Coins, Sparkles 
} from 'lucide-react';

export const MainMenuPage = ({ onNavigate }) => {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const [isMuted, setIsMuted] = useState(soundManager.muted);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) soundManager.playPowerUp();
  };

  const handleAction = (screenName) => {
    soundManager.playLaser();
    if (onNavigate) onNavigate(screenName);
  };

  return (
    <div style={styles.mainWrapper}>
      {/* Dynamic Starry Space Backdrop */}
      <div style={styles.starsBackdrop} />
      <div style={styles.nebulaGlow} />

      {/* Top Utility Bar: Sound Toggle & Pilot Status */}
      <header style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <button 
            onClick={handleToggleMute} 
            style={styles.soundBtn}
            className="glass-card"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={18} color="#EF4444" /> : <Volume2 size={18} color="var(--secondary-cyan)" />}
            <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-heading)' }}>
              {isMuted ? 'AUDIO OFF' : 'AUDIO ON'}
            </span>
          </button>
        </div>

        <div style={styles.topBarRight}>
          {isAuthenticated && profile ? (
            <div style={styles.pilotCard} className="glass-panel">
              <div style={styles.pilotInfo}>
                <div style={styles.pilotName}>{user?.name || 'Commander'}</div>
                <div style={styles.pilotRank}>LV. {profile.level} {profile.pilotRank}</div>
              </div>
              <div className="currency-pill credits" style={{ padding: '4px 10px' }}>
                <Coins size={14} color="var(--currency-gold)" />
                <span>{profile.credits?.toLocaleString() || 500}</span>
              </div>
              <button onClick={logout} style={styles.logoutBtn} title="Logout">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => handleAction('auth')} 
              className="btn btn-cyan"
              style={{ padding: '8px 20px', fontSize: '0.82rem' }}
            >
              LOGIN / ENLIST
            </button>
          )}
        </div>
      </header>

      {/* Center Cinematic Hero Presentation */}
      <main style={styles.heroContent}>
        {/* Floating Emblems & Badges */}
        <div style={styles.badgeRow}>
          <span className="badge badge-cyan animate-pulse-glow">
            <Sparkles size={13} style={{ marginRight: '6px' }} />
            ARCADE ODYSSEY 2.0 • 60 FPS PHASER COMBAT
          </span>
        </div>

        {/* Title & Tagline */}
        <h1 className="font-heading" style={styles.mainTitle}>
          {GAME_NAME}
        </h1>
        <p style={styles.tagline}>
          {GAME_TAGLINE}
        </p>

        {/* Primary CTA Play Button */}
        <button 
          onClick={() => handleAction('gameplay')}
          className="btn btn-cyan animate-pulse-glow"
          style={styles.mainPlayBtn}
        >
          <Play size={24} fill="currentColor" />
          <span>START COMBAT</span>
        </button>

        {/* Secondary Navigation Grid */}
        <div style={styles.menuGrid}>
          <button 
            onClick={() => handleAction('missions')} 
            style={styles.menuBtn}
            className="glass-card glass-card-hover"
          >
            <Compass size={20} color="var(--secondary-cyan)" />
            <div style={styles.menuBtnText}>
              <div className="font-heading" style={styles.menuBtnTitle}>CAMPAIGN MISSIONS</div>
              <div style={styles.menuBtnSub}>50 Strategic Stages & 5 Bosses</div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>

          <button 
            onClick={() => handleAction('hangar')} 
            style={styles.menuBtn}
            className="glass-card glass-card-hover"
          >
            <Shield size={20} color="var(--electric-magenta)" />
            <div style={styles.menuBtnText}>
              <div className="font-heading" style={styles.menuBtnTitle}>STARSHIP HANGAR</div>
              <div style={styles.menuBtnSub}>5 Ship Classes & 7 Modules</div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>

          <button 
            onClick={() => handleAction('dashboard')} 
            style={styles.menuBtn}
            className="glass-card glass-card-hover"
          >
            <User size={20} color="#38BDF8" />
            <div style={styles.menuBtnText}>
              <div className="font-heading" style={styles.menuBtnTitle}>COMMAND DECK</div>
              <div style={styles.menuBtnSub}>Pilot Statistics & Overview</div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>

          <button 
            onClick={() => handleAction('quests')} 
            style={styles.menuBtn}
            className="glass-card glass-card-hover"
          >
            <Award size={20} color="var(--currency-gold)" />
            <div style={styles.menuBtnText}>
              <div className="font-heading" style={styles.menuBtnTitle}>DAILY QUESTS</div>
              <div style={styles.menuBtnSub}>24h Resets & 10 Achievements</div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>

          <button 
            onClick={() => handleAction('leaderboard')} 
            style={styles.menuBtn}
            className="glass-card glass-card-hover"
          >
            <BarChart3 size={20} color="#C084FC" />
            <div style={styles.menuBtnText}>
              <div className="font-heading" style={styles.menuBtnTitle}>LEADERBOARD</div>
              <div style={styles.menuBtnSub}>Global Pilot Rankings</div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>

          <button 
            onClick={() => handleAction('wallet')} 
            style={styles.menuBtn}
            className="glass-card glass-card-hover"
          >
            <Wallet size={20} color="var(--status-green)" />
            <div style={styles.menuBtnText}>
              <div className="font-heading" style={styles.menuBtnTitle}>VELOP WALLET</div>
              <div style={styles.menuBtnSub}>Double-Entry Ledger & Rewards</div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>
        </div>
      </main>

      {/* Footer System Version */}
      <footer style={styles.footer}>
        <span>VOID HUNTER v1.0.0 • HARDENED VELOOP ENGINE • MONGO ATLAS SYNCED</span>
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
    padding: '24px 32px',
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
    maxWidth: '1200px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  topBarLeft: {},
  soundBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '10px',
    background: 'rgba(10, 15, 40, 0.65)',
    border: '1px solid var(--border-glass)',
    cursor: 'pointer',
    color: 'var(--text-light)'
  },
  topBarRight: {},
  pilotCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 16px',
    borderRadius: '12px'
  },
  pilotInfo: {
    textAlign: 'left'
  },
  pilotName: {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.85rem',
    color: 'var(--text-light)'
  },
  pilotRank: {
    fontSize: '0.65rem',
    color: 'var(--secondary-cyan)'
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px'
  },
  heroContent: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '850px',
    width: '100%',
    margin: 'auto 0'
  },
  badgeRow: {
    marginBottom: '16px'
  },
  mainTitle: {
    fontSize: 'clamp(2.8rem, 7vw, 4.8rem)',
    letterSpacing: '0.12em',
    color: 'var(--text-light)',
    textShadow: '0 0 40px rgba(0, 229, 255, 0.45)',
    margin: 0,
    lineHeight: 1.1
  },
  tagline: {
    fontSize: 'clamp(0.95rem, 2vw, 1.2rem)',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    margin: '12px 0 32px 0',
    fontFamily: 'var(--font-subheading)'
  },
  mainPlayBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '18px 48px',
    fontSize: '1.25rem',
    borderRadius: '16px',
    letterSpacing: '0.12em',
    marginBottom: '36px',
    boxShadow: '0 0 30px rgba(0, 229, 255, 0.45)'
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '14px',
    width: '100%'
  },
  menuBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 20px',
    borderRadius: '14px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.25s ease',
    border: '1px solid var(--border-glass)',
    background: 'rgba(10, 15, 40, 0.7)'
  },
  menuBtnText: {
    flex: 1
  },
  menuBtnTitle: {
    fontSize: '0.92rem',
    color: 'var(--text-light)',
    letterSpacing: '0.06em'
  },
  menuBtnSub: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    marginTop: '2px'
  },
  footer: {
    position: 'relative',
    zIndex: 10,
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-heading)',
    paddingTop: '20px'
  }
};

export default MainMenuPage;
