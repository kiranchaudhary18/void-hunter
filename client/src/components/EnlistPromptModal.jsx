import React from 'react';
import soundManager from '../game/managers/SoundManager.js';
import { Lock, UserCheck, ArrowRight, X, Sparkles } from 'lucide-react';

export const EnlistPromptModal = ({ 
  isOpen, 
  onClose, 
  onEnlist, 
  onGuestLaunch, 
  title = "PILOT ENLISTMENT REQUIRED", 
  subtitle = "Log in or enlist now to deploy on combat missions, save flight telemetry, and claim sector rewards.",
  featureList = [
    "Deploy on all 50 tactical missions across 5 galaxy sectors",
    "Command and customize 5 specialized spacecraft hulls",
    "Record high scores on the global intergalactic leaderboard",
    "Earn Credits, Energy Cores, and double-entry wallet rewards"
  ]
}) => {
  if (!isOpen) return null;

  const handleEnlistClick = () => {
    soundManager.playLaser();
    if (onEnlist) onEnlist();
  };

  const handleClose = () => {
    soundManager.playLaser();
    if (onClose) onClose();
  };

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div 
        style={styles.modal} 
        className="glass-panel cyber-box animate-scale-up" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button 
          onClick={handleClose} 
          style={styles.closeBtn} 
          title="Close dialog"
        >
          <X size={20} color="var(--text-muted)" />
        </button>

        {/* Modal Header */}
        <div style={styles.header}>
          <div style={styles.iconCircle} className="animate-pulse-glow">
            <Lock size={28} color="var(--secondary-cyan)" />
          </div>
          <div>
            <div style={styles.tagline}>
              <span style={styles.dot}>●</span>
              <span>RESTRICTED VOID COMMAND ACCESS</span>
            </div>
            <h2 className="font-heading text-glow-cyan" style={styles.title}>
              {title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <p style={styles.subtitle}>
          {subtitle}
        </p>

        {/* Features Checklist */}
        <div style={styles.featureBox} className="glass-card">
          <div style={styles.featureTitle}>
            <Sparkles size={16} color="var(--currency-gold)" />
            <span>UNLOCKED UPON PILOT COMMISSIONING:</span>
          </div>
          <ul style={styles.featureUl}>
            {featureList.map((feat, i) => (
              <li key={i} style={styles.featureLi}>
                <span style={styles.bullet}>▸</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button 
            onClick={handleEnlistClick} 
            className="btn btn-cyan animate-pulse-glow" 
            style={styles.enlistBtn}
          >
            <UserCheck size={18} />
            <span>LOGIN / ENLIST AS PILOT</span>
            <ArrowRight size={16} />
          </button>

                    {onGuestLaunch && (
            <button 
              onClick={() => {
                soundManager.playLaser();
                onGuestLaunch();
              }} 
              className="btn btn-outline" 
              style={{ width: '100%', padding: '12px', borderColor: 'rgba(0, 229, 255, 0.4)', color: '#00E5FF', fontFamily: 'Orbitron', fontWeight: 700 }}
            >
              <span>⚡ DEPLOY AS GUEST CADET</span>
            </button>
          )}

          <button 
            onClick={handleClose} 
            className="btn btn-outline" 
            style={styles.cancelBtn}
          >
            <span>CONTINUE BROWSING</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(3, 5, 18, 0.85)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  modal: {
    maxWidth: '540px',
    width: '100%',
    maxHeight: '90dvh',
    overflowY: 'auto',
    boxSizing: 'border-box',
    padding: 'clamp(20px, 4vw, 32px)',
    borderRadius: '16px',
    background: 'rgba(8, 14, 38, 0.96)',
    border: '1px solid rgba(0, 229, 255, 0.4)',
    boxShadow: '0 0 50px rgba(0, 229, 255, 0.25), 0 20px 40px rgba(0, 0, 0, 0.8)',
    position: 'relative'
  },
  closeBtn: {
    position: 'absolute',
    top: '18px',
    right: '18px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'background 0.2s ease'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px'
  },
  iconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'rgba(0, 229, 255, 0.12)',
    border: '1px solid rgba(0, 229, 255, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  tagline: {
    fontSize: '0.66rem',
    color: 'var(--secondary-cyan)',
    letterSpacing: '0.12em',
    fontFamily: 'var(--font-heading)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px'
  },
  dot: {
    color: '#00E5FF'
  },
  title: {
    fontSize: '1.4rem',
    margin: 0,
    letterSpacing: '0.06em'
  },
  subtitle: {
    fontSize: '0.92rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    marginBottom: '20px'
  },
  featureBox: {
    padding: '16px 20px',
    borderRadius: '10px',
    background: 'rgba(0, 229, 255, 0.05)',
    border: '1px solid rgba(0, 229, 255, 0.18)',
    marginBottom: '24px'
  },
  featureTitle: {
    fontSize: '0.72rem',
    color: 'var(--currency-gold)',
    fontWeight: '700',
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-heading)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '10px'
  },
  featureUl: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  featureLi: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '0.84rem',
    color: 'var(--text-light)',
    lineHeight: 1.4
  },
  bullet: {
    color: 'var(--secondary-cyan)',
    fontWeight: 'bold'
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  enlistBtn: {
    width: '100%',
    padding: '14px',
    fontSize: '0.92rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    borderRadius: '10px'
  },
  cancelBtn: {
    width: '100%',
    padding: '10px',
    fontSize: '0.82rem',
    textAlign: 'center',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: 'var(--text-muted)'
  }
};

export default EnlistPromptModal;
