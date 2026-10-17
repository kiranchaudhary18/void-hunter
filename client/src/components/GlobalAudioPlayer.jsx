import React, { useState, useEffect } from 'react';
import soundManager from '../game/managers/SoundManager.js';
import { 
  Volume2, VolumeX, Play, Pause, Music, ChevronDown, ChevronUp, 
  SkipForward, SkipBack, Mic, Radio, Disc 
} from 'lucide-react';

const LYRIC_SNIPPETS = [
  "⚡ 'Into the endless dark we fly, stars ignite across the sky!'",
  "🔥 'Void Hunters rise, our spirits bold! A galactic legend unfolds!'",
  "⚡ 'Feel the thunder, feel the flame! Write our victory in their name!'",
  "🛡️ 'Space warriors, never surrender! We are the Void Hunter!'",
  "🚀 'Target locked! Full laser overdrive! All wings engage!'",
  "👑 'Victory is ours! The galaxy belongs to Void Hunters!'"
];

export const GlobalAudioPlayer = () => {
  const [audioState, setAudioState] = useState({
    bgmPlaying: soundManager.bgmPlaying,
    bgmMode: soundManager.bgmMode || soundManager.desiredBgmMode || 'vocal',
    muted: soundManager.muted,
    bgmVolume: soundManager.bgmVolume,
    autoplayBlocked: soundManager.autoplayBlocked,
    playlist: soundManager.playlist
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [lyricIndex, setLyricIndex] = useState(0);

  useEffect(() => {
    // Subscribe to soundManager state changes
    const unsubscribe = soundManager.subscribe((state) => {
      setAudioState((prev) => ({ ...prev, ...state }));
    });
    return () => unsubscribe();
  }, []);

  // Cycle lyric snippets every 5 seconds when vocal track is active
  useEffect(() => {
    if (audioState.bgmMode === 'vocal' && audioState.bgmPlaying) {
      const interval = setInterval(() => {
        setLyricIndex((prev) => (prev + 1) % LYRIC_SNIPPETS.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [audioState.bgmMode, audioState.bgmPlaying]);

  const handleTogglePlay = (e) => {
    e.stopPropagation();
    if (audioState.bgmPlaying) {
      soundManager.stopBGM();
    } else {
      soundManager.unlockAudio();
      soundManager.startBGM(audioState.bgmMode || 'vocal');
    }
  };

  const handleNextTrack = (e) => {
    e.stopPropagation();
    soundManager.unlockAudio();
    soundManager.nextTrack();
  };

  const handlePrevTrack = (e) => {
    e.stopPropagation();
    soundManager.unlockAudio();
    soundManager.prevTrack();
  };

  const handleSelectTrack = (trackId) => {
    soundManager.unlockAudio();
    soundManager.setTrack(trackId);
  };

  const handleToggleMute = (e) => {
    e.stopPropagation();
    soundManager.toggleMute();
  };

  const handleVolumeChange = (e) => {
    const newVol = parseFloat(e.target.value);
    soundManager.setVolumes(soundManager.sfxVolume, newVol);
  };

  const handleWidgetClick = () => {
    if (!audioState.bgmPlaying) {
      soundManager.unlockAudio();
    }
    setIsExpanded(!isExpanded);
  };

  // Current track metadata
  const currentTrack = soundManager.playlist.find((p) => p.id === (audioState.bgmMode || 'vocal')) || soundManager.playlist[0];

  return (
    <div 
      className={`global-audio-widget glass-panel cyber-box ${!audioState.bgmPlaying ? 'audio-prompt-glow' : 'animate-pulse-glow'}`}
      style={styles.widgetContainer}
      onClick={handleWidgetClick}
      title={audioState.bgmPlaying ? "Click to expand soundtrack player" : "Click anywhere to enable soundtrack"}
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
            {currentTrack.hasLyrics ? (
              <Mic size={11} color="#10B981" style={{ display: 'inline', marginRight: '4px' }} />
            ) : (
              <Music size={11} color="var(--secondary-cyan)" style={{ display: 'inline', marginRight: '4px' }} />
            )}
            <span style={{ color: currentTrack.hasLyrics ? '#10B981' : 'var(--secondary-cyan)' }}>
              {currentTrack.hasLyrics ? 'VOCAL ANTHEM' : 'SOUNDTRACK'}
            </span>
            <span style={styles.trackBadge}>{currentTrack.bpm} BPM</span>
          </div>

          <div 
            className="font-heading" 
            style={{
              ...styles.trackName,
              color: audioState.bgmPlaying ? '#00E5FF' : '#F59E0B',
              textShadow: audioState.bgmPlaying ? '0 0 8px rgba(0,229,255,0.6)' : '0 0 8px rgba(245,158,11,0.6)'
            }}
          >
            {audioState.bgmPlaying ? currentTrack.title : '⚡ TAP TO START SOUNDTRACK 🔊'}
          </div>

          {/* Real-time lyrics ticker for the English vocal song */}
          {audioState.bgmPlaying && currentTrack.hasLyrics && (
            <div style={styles.lyricsTicker}>
              {LYRIC_SNIPPETS[lyricIndex]}
            </div>
          )}
        </div>

        {/* Playback Controls (Prev, Play/Pause, Next, Mute, Expand) */}
        <div style={styles.actionButtons} onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={handlePrevTrack}
            style={styles.controlBtn}
            title="Previous Track"
          >
            <SkipBack size={13} color="var(--secondary-cyan)" />
          </button>

          <button 
            onClick={handleTogglePlay}
            style={{
              ...styles.controlBtn,
              background: audioState.bgmPlaying ? 'rgba(0, 229, 255, 0.15)' : 'rgba(245, 158, 11, 0.25)',
              borderColor: audioState.bgmPlaying ? 'rgba(0, 229, 255, 0.4)' : '#F59E0B'
            }}
            title={audioState.bgmPlaying ? 'Pause Music' : 'Play Music'}
          >
            {audioState.bgmPlaying ? (
              <Pause size={14} color="var(--secondary-cyan)" />
            ) : (
              <Play size={14} color="#F59E0B" fill="#F59E0B" />
            )}
          </button>

          <button 
            onClick={handleNextTrack}
            style={styles.controlBtn}
            title="Next Track"
          >
            <SkipForward size={13} color="var(--secondary-cyan)" />
          </button>

          <button 
            onClick={handleToggleMute}
            style={styles.controlBtn}
            title={audioState.muted ? 'Unmute' : 'Mute'}
          >
            {audioState.muted ? (
              <VolumeX size={14} color="#EF4444" />
            ) : (
              <Volume2 size={14} color="var(--secondary-cyan)" />
            )}
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            style={styles.chevronBtn}
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded Playlist & Volume Drawer */}
      {isExpanded && (
        <div style={styles.expandedPanel} onClick={(e) => e.stopPropagation()}>
          {/* Track Selection Catalog */}
          <div style={styles.playlistHeader}>
            <Radio size={12} color="var(--secondary-cyan)" style={{ marginRight: '6px' }} />
            <span>SELECT SOUNDTRACK</span>
          </div>

          <div style={styles.playlistList}>
            {soundManager.playlist.map((track) => {
              const isSelected = (audioState.bgmMode || 'vocal') === track.id;
              return (
                <div 
                  key={track.id}
                  onClick={() => handleSelectTrack(track.id)}
                  style={{
                    ...styles.playlistItem,
                    borderColor: isSelected ? 'var(--secondary-cyan)' : 'rgba(255,255,255,0.08)',
                    background: isSelected ? 'rgba(0, 229, 255, 0.12)' : 'rgba(255,255,255,0.02)'
                  }}
                >
                  <div style={styles.itemLeft}>
                    {track.hasLyrics ? (
                      <Mic size={13} color={isSelected ? '#10B981' : 'var(--text-muted)'} />
                    ) : (
                      <Disc size={13} color={isSelected ? 'var(--secondary-cyan)' : 'var(--text-muted)'} />
                    )}
                    <div>
                      <div style={{ ...styles.itemTitle, color: isSelected ? '#00E5FF' : '#E2E8F0' }}>
                        {track.title}
                      </div>
                      <div style={styles.itemSubtitle}>{track.subtitle}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <span style={styles.playingBadge}>
                      {audioState.bgmPlaying ? 'PLAYING' : 'READY'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Volume Slider */}
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

      {/* Styles */}
      <style>{`
        .global-audio-widget {
          position: fixed;
          bottom: 22px;
          right: 22px;
          z-index: 9999;
          background: rgba(6, 9, 25, 0.94);
          border: 1px solid rgba(0, 229, 255, 0.4);
          border-radius: 12px;
          box-shadow: 0 4px 24px rgba(0, 229, 255, 0.25), inset 0 0 12px rgba(0, 229, 255, 0.1);
          backdrop-filter: blur(14px);
          cursor: pointer;
          user-select: none;
          transition: all 0.25s ease;
        }
        .global-audio-widget.audio-prompt-glow {
          border-color: #F59E0B;
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.45), inset 0 0 12px rgba(245, 158, 11, 0.2);
          animation: promptPulse 1.8s infinite alternate ease-in-out;
        }
        @keyframes promptPulse {
          0% { box-shadow: 0 0 12px rgba(245, 158, 11, 0.3); }
          100% { box-shadow: 0 0 28px rgba(245, 158, 11, 0.7), 0 0 10px rgba(0, 229, 255, 0.5); }
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
    maxWidth: '430px',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
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
    minWidth: '185px'
  },
  trackTag: {
    fontSize: '0.62rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.12em',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  trackBadge: {
    fontSize: '0.58rem',
    padding: '1px 5px',
    background: 'rgba(0, 229, 255, 0.12)',
    borderRadius: '4px',
    color: 'var(--secondary-cyan)',
    border: '1px solid rgba(0, 229, 255, 0.2)'
  },
  trackName: {
    fontSize: '0.74rem',
    letterSpacing: '0.04em',
    color: '#FFFFFF',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '195px'
  },
  lyricsTicker: {
    fontSize: '0.62rem',
    color: '#10B981',
    fontStyle: 'italic',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '195px',
    marginTop: '2px',
    animation: 'fadeIn 0.4s ease'
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  },
  controlBtn: {
    background: 'rgba(0, 229, 255, 0.12)',
    border: '1px solid rgba(0, 229, 255, 0.35)',
    borderRadius: '6px',
    padding: '5px 6px',
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
    paddingTop: '10px',
    borderTop: '1px solid rgba(0, 229, 255, 0.2)',
    cursor: 'default'
  },
  playlistHeader: {
    fontSize: '0.64rem',
    fontWeight: 'bold',
    letterSpacing: '0.08em',
    color: 'var(--secondary-cyan)',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px'
  },
  playlistList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '10px'
  },
  playlistItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  itemTitle: {
    fontSize: '0.70rem',
    fontWeight: 'bold',
    letterSpacing: '0.03em'
  },
  itemSubtitle: {
    fontSize: '0.58rem',
    color: 'var(--text-muted)'
  },
  playingBadge: {
    fontSize: '0.58rem',
    color: '#00E5FF',
    background: 'rgba(0, 229, 255, 0.2)',
    border: '1px solid rgba(0, 229, 255, 0.4)',
    padding: '1px 6px',
    borderRadius: '4px',
    fontWeight: 'bold'
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingTop: '4px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)'
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
