import React, { useState, useEffect } from 'react';
import soundManager from '../game/managers/SoundManager.js';
import { Volume2, VolumeX, Play, Pause, Music, ChevronDown, ChevronUp } from 'lucide-react';

export const GlobalAudioPlayer = () => {
  const [audioState, setAudioState] = useState({
    bgmPlaying: soundManager.bgmPlaying,
    bgmMode: soundManager.bgmMode || 'menu',
    muted: soundManager.muted,
    bgmVolume: soundManager.bgmVolume
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Subscribe to soundManager state changes
    const unsubscribe = soundManager.subscribe((state) => {
      setAudioState({ ...state });
    });

    return () => unsubscribe();
  }, []);

  const handleTogglePlay = (e) => {
    e.stopPropagation();
    if (audioState.bgmPlaying) {
      soundManager.stopBGM();
    } else {
      const isCombat = window.location.pathname.includes('combat') || window.location.pathname.includes('gameplay');
      soundManager.startBGM(isCombat ? 'combat' : 'menu');
    }
  };

  const handleToggleMute = (e) => {
    e.stopPropagation();
    soundManager.toggleMute();
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    soundManager.setVolumes(soundManager.sfxVolume, newVol);
  };

  const trackTitle = audioState.bgmMode === 'combat' 
    ? 'SECTOR COMBAT // HIGH-OCTANE SYNTH' 
    : 'COSMIC DRIFT // AMBIENT EXPLORATION';

  return (
    <div 
      className="global-audio-widget glass-panel cyber-box animate-pulse-glow"
      style={styles.widgetContainer}
      onClick={() => setIsExpanded(!isExpanded)}
      title="Click to expand/collapse soundtrack controls"
    >
      <div style={styles.headerRow}>
        {/* Equalizer Visualizer Bars */}
        <div style={styles.equalizerContainer}>
          <span className={`eq-bar bar-1 ${audioState.bgmPlaying && !audioState.muted ? 'playing' : ''}`} />
          <span className={`eq-bar bar-2 ${audioState.bgmPlaying && !audioState.muted ? 'playing' : ''}`} />
          <span className={`eq-bar bar-3 ${audioState.bgmPlaying && !audioState.muted ? 'playing' : ''}`} />
          <span className={`eq-bar bar-4 ${audioState.bgmPlaying && !audioState.muted ? 'playing' : ''}`} />
        </div>

        {/* Track Label */}
        <div style={styles.trackInfo}>
          <div style={styles.trackTag}>
            <Music size={11} color="var(--secondary-cyan)" style={{ display: 'inline', marginRight: '4px' }} />
            <span>SOUNDTRACK</span>
          </div>
          <div className="font-heading text-glow-cyan" style={styles.trackName}>
            {audioState.bgmPlaying ? trackTitle : 'AUDIO PAUSED (CLICK TO PLAY)'}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div style={styles.actionButtons} onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={handleTogglePlay}
            style={styles.controlBtn}
            title={audioState.bgmPlaying ? 'Pause Music' : 'Play Music'}
          >
            {audioState.bgmPlaying ? (
              <Pause size={15} color="var(--secondary-cyan)" />
            ) : (
              <Play size={15} color="var(--secondary-cyan)" fill="var(--secondary-cyan)" />
            )}
          </button>

          <button 
            onClick={handleToggleMute}
            style={styles.controlBtn}
            title={audioState.muted ? 'Unmute' : 'Mute'}
          >
            {audioState.muted ? (
              <VolumeX size={15} color="#EF4444" />
            ) : (
              <Volume2 size={15} color="var(--secondary-cyan)" />
            )}
          </button>

          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={styles.chevronBtn}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded Slider Controls */}
      {isExpanded && (
        <div style={styles.expandedPanel} onClick={(e) => e.stopPropagation()}>
          <div style={styles.sliderRow}>
            <span style={styles.sliderLabel}>VOLUME</span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={audioState.muted ? 0 : audioState.bgmVolume}
              onChange={handleVolumeChange}
              style={styles.rangeSlider}
            />
            <span style={styles.sliderVal}>
              {audioState.muted ? '0%' : `${Math.round(audioState.bgmVolume * 100)}%`}
            </span>
          </div>
        </div>
      )}

      {/* Animated Equalizer CSS */}
      <style>{`
        .global-audio-widget {
          position: fixed;
          bottom: 22px;
          right: 22px;
          z-index: 9999;
          background: rgba(6, 9, 25, 0.92);
          border: 1px solid rgba(0, 229, 255, 0.4);
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0, 229, 255, 0.25), inset 0 0 12px rgba(0, 229, 255, 0.1);
          backdrop-filter: blur(12px);
          cursor: pointer;
          user-select: none;
          transition: all 0.25s ease;
        }
        .global-audio-widget:hover {
          border-color: var(--secondary-cyan);
          box-shadow: 0 6px 30px rgba(0, 229, 255, 0.4), inset 0 0 16px rgba(0, 229, 255, 0.2);
        }
        .eq-bar {
          display: inline-block;
          width: 3px;
          background: var(--secondary-cyan);
          border-radius: 2px;
          height: 6px;
          transition: height 0.15s ease;
        }
        .eq-bar.playing {
          animation: eqPulse 1.2s infinite ease-in-out;
        }
        .eq-bar.bar-1 { animation-delay: 0.1s; }
        .eq-bar.bar-2 { animation-delay: 0.4s; }
        .eq-bar.bar-3 { animation-delay: 0.25s; }
        .eq-bar.bar-4 { animation-delay: 0.55s; }
        @keyframes eqPulse {
          0%, 100% { height: 5px; }
          50% { height: 18px; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  widgetContainer: {
    padding: '8px 14px',
    maxWidth: '380px',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  equalizerContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '2.5px',
    height: '20px',
    paddingBottom: '2px'
  },
  trackInfo: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: '170px'
  },
  trackTag: {
    fontSize: '0.62rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.12em',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center'
  },
  trackName: {
    fontSize: '0.74rem',
    letterSpacing: '0.04em',
    color: '#FFFFFF',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '190px'
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  controlBtn: {
    background: 'rgba(0, 229, 255, 0.12)',
    border: '1px solid rgba(0, 229, 255, 0.35)',
    borderRadius: '6px',
    padding: '5px 7px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.18s ease'
  },
  chevronBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center'
  },
  expandedPanel: {
    marginTop: '10px',
    paddingTop: '8px',
    borderTop: '1px solid rgba(0, 229, 255, 0.2)',
    cursor: 'default'
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  sliderLabel: {
    fontSize: '0.64rem',
    color: 'var(--text-muted)',
    fontWeight: 'bold',
    letterSpacing: '0.08em'
  },
  rangeSlider: {
    flex: 1,
    accentColor: 'var(--secondary-cyan)',
    cursor: 'pointer',
    height: '4px'
  },
  sliderVal: {
    fontSize: '0.68rem',
    color: 'var(--secondary-cyan)',
    fontFamily: 'monospace',
    minWidth: '34px',
    textAlign: 'right'
  }
};

export default GlobalAudioPlayer;
