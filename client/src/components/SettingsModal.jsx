import React, { useState, useEffect } from 'react';
import soundManager from '../game/managers/SoundManager.js';
import { Volume2, VolumeX, Sliders, X, Check, Info } from 'lucide-react';
import { GAME_NAME, GAME_TAGLINE } from '../config/gameConfig.js';

export const SettingsModal = ({ isOpen, onClose }) => {
  const [masterVol, setMasterVol] = useState(80);
  const [bgmVol, setBgmVol] = useState(50);
  const [sfxVol, setSfxVol] = useState(70);
  const [isMuted, setIsMuted] = useState(soundManager.muted);

  useEffect(() => {
    const saved = localStorage.getItem('void_hunter_audio_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMasterVol(parsed.master ?? 80);
        setBgmVol(parsed.bgm ?? 50);
        setSfxVol(parsed.sfx ?? 70);
        setIsMuted(parsed.muted ?? false);
      } catch {
        // Fallback default
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    soundManager.setVolumes((sfxVol / 100) * (masterVol / 100), (bgmVol / 100) * (masterVol / 100));
    soundManager.muted = isMuted;

    localStorage.setItem('void_hunter_audio_settings', JSON.stringify({
      master: masterVol,
      bgm: bgmVol,
      sfx: sfxVol,
      muted: isMuted
    }));

    if (!isMuted) soundManager.playPowerUp();
    onClose();
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.muted = nextMuted;
  };

  return (
    <div style={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className="glass-panel" style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sliders size={20} color="var(--secondary-cyan)" />
            <h2 className="font-heading" style={styles.title}>PILOT & AUDIO SETTINGS</h2>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={18} />
          </button>
        </div>

        {/* Audio Controls Section (Section 73) */}
        <div style={styles.section}>
          <div style={styles.sectionTitleRow}>
            <span style={styles.sectionTitle}>AUDIO MIXER (SECTION 73)</span>
            <button 
              onClick={handleToggleMute} 
              style={{ ...styles.muteBtn, borderColor: isMuted ? '#EF4444' : 'var(--secondary-cyan)' }}
            >
              {isMuted ? <VolumeX size={14} color="#EF4444" /> : <Volume2 size={14} color="var(--secondary-cyan)" />}
              <span>{isMuted ? 'ALL MUTED' : 'AUDIO ACTIVE'}</span>
            </button>
          </div>

          {/* Master Volume */}
          <div style={styles.sliderRow}>
            <div style={styles.sliderLabelRow}>
              <span>Master Volume</span>
              <span className="font-heading" style={{ color: 'var(--secondary-cyan)' }}>{masterVol}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={masterVol} 
              onChange={(e) => setMasterVol(Number(e.target.value))}
              style={styles.slider} 
              disabled={isMuted}
            />
          </div>

          {/* BGM Volume */}
          <div style={styles.sliderRow}>
            <div style={styles.sliderLabelRow}>
              <span>Cosmic Ambient (BGM)</span>
              <span className="font-heading" style={{ color: 'var(--accent-purple)' }}>{bgmVol}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={bgmVol} 
              onChange={(e) => setBgmVol(Number(e.target.value))}
              style={styles.slider} 
              disabled={isMuted}
            />
          </div>

          {/* SFX Volume */}
          <div style={styles.sliderRow}>
            <div style={styles.sliderLabelRow}>
              <span>Laser & Combat SFX</span>
              <span className="font-heading" style={{ color: 'var(--currency-gold)' }}>{sfxVol}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sfxVol} 
              onChange={(e) => setSfxVol(Number(e.target.value))}
              style={styles.slider} 
              disabled={isMuted}
            />
          </div>
        </div>

        {/* Flight Controls Reference (Section 7) */}
        <div style={styles.section}>
          <div style={styles.sectionTitleRow}>
            <span style={styles.sectionTitle}>FLIGHT CONTROLS (SECTION 7)</span>
          </div>

          <div style={styles.controlsGrid} className="glass-card">
            <div style={styles.controlItem}>
              <kbd style={styles.kbd}>W A S D</kbd> or <kbd style={styles.kbd}>ARROWS</kbd>
              <span style={styles.controlDesc}>Sublight Movement</span>
            </div>
            <div style={styles.controlItem}>
              <kbd style={styles.kbd}>SPACE</kbd> or <kbd style={styles.kbd}>DRAG</kbd>
              <span style={styles.controlDesc}>Primary Laser Volley</span>
            </div>
            <div style={styles.controlItem}>
              <kbd style={styles.kbd}>1 - 5</kbd>
              <span style={styles.controlDesc}>Tactical Abilities</span>
            </div>
            <div style={styles.controlItem}>
              <kbd style={styles.kbd}>P</kbd> or <kbd style={styles.kbd}>ESC</kbd>
              <span style={styles.controlDesc}>Tactical Pause</span>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div style={styles.infoRow}>
          <Info size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {GAME_NAME} • {GAME_TAGLINE} • Build v2.4.0 Production
          </span>
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
            CANCEL
          </button>
          <button onClick={handleSave} className="btn btn-cyan" style={{ flex: 1 }}>
            <Check size={16} /> SAVE PREFERENCES
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(6, 9, 25, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '20px'
  },
  modalBox: {
    maxWidth: '500px',
    width: '95%',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: 'clamp(18px, 4vw, 28px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    border: '1px solid var(--border-glass)',
    borderRadius: '16px',
    boxShadow: '0 0 45px rgba(0, 229, 255, 0.2)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 'clamp(1.05rem, 3.5vw, 1.25rem)',
    color: 'var(--secondary-cyan)',
    letterSpacing: '0.06em'
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  sectionTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    fontWeight: '700'
  },
  muteBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid',
    borderRadius: '12px',
    fontSize: '0.7rem',
    cursor: 'pointer',
    color: 'var(--text-light)'
  },
  sliderRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  sliderLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: 'var(--text-light)'
  },
  slider: {
    width: '100%',
    accentColor: 'var(--secondary-cyan)',
    cursor: 'pointer'
  },
  controlsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    padding: '14px'
  },
  controlItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  kbd: {
    display: 'inline-block',
    padding: '2px 6px',
    background: 'rgba(0, 229, 255, 0.1)',
    border: '1px solid var(--border-glass)',
    borderRadius: '4px',
    fontSize: '0.72rem',
    fontFamily: 'monospace',
    color: 'var(--secondary-cyan)',
    width: 'fit-content'
  },
  controlDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '4px'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '6px'
  }
};

export default SettingsModal;
