import React, { useState, useEffect, useRef } from 'react';
import soundManager from '../game/managers/SoundManager.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Volume2, VolumeX, Sliders, Check, Keyboard, 
  Shield, Zap, Sparkles, Monitor, Gamepad2, 
  RotateCcw, ArrowLeft, Disc, Activity, AlertCircle, CheckCircle2,
  Camera, UploadCloud, Cloud, Trash2, User, Edit3, Loader2
} from 'lucide-react';
import { GAME_NAME, GAME_TAGLINE, GAME_VERSION } from '../config/gameConfig.js';
import './SettingsPage.css';

export const SettingsPage = ({ onBack, onNavigate: _onNavigate }) => {
  const { user, profile, updateProfileData } = useAuth();

  // Pilot Profile & Avatar State
  const [callsignInput, setCallsignInput] = useState(user?.name || profile?.pilotName || 'Commander');
  const [previewAvatar, setPreviewAvatar] = useState(user?.avatarUrl || profile?.avatarUrl || '');
  const [selectedFileBase64, setSelectedFileBase64] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  // Sync profile state if user updates
  useEffect(() => {
    if (user?.name) {
      setCallsignInput(user.name);
    }
    if (user?.avatarUrl !== undefined) {
      setPreviewAvatar(user.avatarUrl);
    }
  }, [user]);

  // Audio Settings State
  const [masterVol, setMasterVol] = useState(85);
  const [bgmVol, setBgmVol] = useState(70);
  const [sfxVol, setSfxVol] = useState(80);
  const [isMuted, setIsMuted] = useState(soundManager.muted);
  const [activeTrack, setActiveTrack] = useState(soundManager.bgmMode || soundManager.desiredBgmMode || 'vocal');

  // Display & Performance State
  const [graphicsQuality, setGraphicsQuality] = useState('ULTRA');
  const [screenShake, setScreenShake] = useState(true);
  const [particleFX, setParticleFX] = useState(true);
  const [bloomEffect, setBloomEffect] = useState(true);

  // Control Preferences State
  const [touchScheme, setTouchScheme] = useState('DIRECT_DRAG'); // 'DIRECT_DRAG' | 'VIRTUAL_JOYSTICK'
  const [mouseSensitivity, setMouseSensitivity] = useState(80);

  // UI Feedback State
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load Saved Preferences on Mount
  useEffect(() => {
    try {
      const savedAudio = localStorage.getItem('void_hunter_audio_settings');
      if (savedAudio) {
        const parsed = JSON.parse(savedAudio);
        if (parsed.master !== undefined) setMasterVol(parsed.master);
        if (parsed.bgm !== undefined) setBgmVol(parsed.bgm);
        if (parsed.sfx !== undefined) setSfxVol(parsed.sfx);
        if (parsed.muted !== undefined) setIsMuted(parsed.muted);
        if (parsed.track) setActiveTrack(parsed.track);
      }

      const savedDisplay = localStorage.getItem('void_hunter_display_settings');
      if (savedDisplay) {
        const parsed = JSON.parse(savedDisplay);
        if (parsed.graphicsQuality) setGraphicsQuality(parsed.graphicsQuality);
        if (parsed.screenShake !== undefined) setScreenShake(parsed.screenShake);
        if (parsed.particleFX !== undefined) setParticleFX(parsed.particleFX);
        if (parsed.bloomEffect !== undefined) setBloomEffect(parsed.bloomEffect);
      }

      const savedControls = localStorage.getItem('void_hunter_control_settings');
      if (savedControls) {
        const parsed = JSON.parse(savedControls);
        if (parsed.touchScheme) setTouchScheme(parsed.touchScheme);
        if (parsed.mouseSensitivity !== undefined) setMouseSensitivity(parsed.mouseSensitivity);
      }
    } catch (e) {
      console.warn('Could not load stored preferences:', e);
    }
  }, []);

  // Avatar Photo File Selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileErrorMsg('File size exceeds 5MB limit. Please select a smaller image.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setProfileErrorMsg('Please select a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    setProfileErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result;
      setPreviewAvatar(base64Data);
      setSelectedFileBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  // Remove Avatar Photo
  const handleRemovePhoto = () => {
    setPreviewAvatar('');
    setSelectedFileBase64('REMOVE');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Commit Pilot Profile & Cloudinary Upload
  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setProfileErrorMsg('');
    setProfileSuccessMsg('');

    if (!callsignInput || !callsignInput.trim()) {
      setProfileErrorMsg('Callsign cannot be blank. Please enter your pilot callsign or name.');
      return;
    }

    setIsUploading(true);
    try {
      const payload = {
        name: callsignInput.trim()
      };

      if (selectedFileBase64 === 'REMOVE') {
        payload.avatar = '';
      } else if (selectedFileBase64) {
        payload.avatar = selectedFileBase64;
      }

      const res = await updateProfileData(payload);
      if (res.success) {
        soundManager.playPowerUp();
        setProfileSuccessMsg('Pilot Callsign & Cloudinary Avatar successfully synchronized to galactic database!');
        setSelectedFileBase64(null);
        setTimeout(() => setProfileSuccessMsg(''), 4500);
      } else {
        setProfileErrorMsg(res.message || 'Failed to update pilot dossier on galactic server.');
      }
    } catch (err) {
      setProfileErrorMsg(err.message || 'Network error updating profile to Cloudinary.');
    } finally {
      setIsUploading(false);
    }
  };

  // Real-time Audio Sliders Sync
  const handleMasterChange = (val) => {
    setMasterVol(val);
    const mFactor = val / 100;
    soundManager.setVolumes((sfxVol / 100) * mFactor, (bgmVol / 100) * mFactor);
  };

  const handleBgmChange = (val) => {
    setBgmVol(val);
    const mFactor = masterVol / 100;
    soundManager.setVolumes((sfxVol / 100) * mFactor, (val / 100) * mFactor);
  };

  const handleSfxChange = (val) => {
    setSfxVol(val);
    const mFactor = masterVol / 100;
    soundManager.setVolumes((val / 100) * mFactor, (bgmVol / 100) * mFactor);
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.muted = nextMuted;
    if (nextMuted) {
      if (soundManager.tracks) {
        Object.values(soundManager.tracks).forEach(t => t && t.pause());
      }
    } else {
      soundManager.startBGM(activeTrack);
    }
  };

  const handleSelectTrack = (trackId) => {
    setActiveTrack(trackId);
    soundManager.startBGM(trackId);
  };

  const handleTestSfx = (type) => {
    if (type === 'laser') {
      soundManager.playLaser();
    } else if (type === 'powerup') {
      soundManager.playPowerUp();
    } else if (type === 'shield') {
      soundManager.playShieldHit();
    }
  };

  // Save Settings Action
  const handleSaveAll = () => {
    try {
      localStorage.setItem('void_hunter_audio_settings', JSON.stringify({
        master: masterVol,
        bgm: bgmVol,
        sfx: sfxVol,
        muted: isMuted,
        track: activeTrack
      }));

      localStorage.setItem('void_hunter_display_settings', JSON.stringify({
        graphicsQuality,
        screenShake,
        particleFX,
        bloomEffect
      }));

      localStorage.setItem('void_hunter_control_settings', JSON.stringify({
        touchScheme,
        mouseSensitivity
      }));

      soundManager.playPowerUp();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  };

  // Reset to Factory Defaults
  const handleResetDefaults = () => {
    setMasterVol(85);
    setBgmVol(70);
    setSfxVol(80);
    setIsMuted(false);
    setActiveTrack('vocal');
    soundManager.muted = false;
    soundManager.setVolumes(0.8, 0.7);
    soundManager.startBGM('vocal');

    setGraphicsQuality('ULTRA');
    setScreenShake(true);
    setParticleFX(true);
    setBloomEffect(true);
    setTouchScheme('DIRECT_DRAG');
    setMouseSensitivity(80);

    soundManager.playLaser();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const pilotName = user?.name || profile?.pilotName || 'Commander';
  const pilotRank = profile?.pilotRank || 'Star Cadet';
  const pilotLevel = profile?.level || 1;

  return (
    <div className="settings-page-root">
      
      {/* ================= 1. PAGE HEADER ================= */}
      <header className="settings-header-shell">
        <div className="settings-header-left">
          {onBack && (
            <button 
              onClick={onBack} 
              className="settings-back-btn"
              title="Return to Command Deck"
            >
              <ArrowLeft size={16} />
              <span>COMMAND DECK</span>
            </button>
          )}
          <div className="settings-title-group">
            <span className="settings-pretitle-tag">
              <Sparkles size={12} color="#00E5FF" />
              PILOT OPERATIONS // SYSTEMS CONFIGURATION
            </span>
            <h1 className="settings-main-title">PILOT & AUDIO SETTINGS</h1>
            <p className="settings-subtitle">
              Configure telemetry audio, customize pilot callsign & photo, calibrate sublight controls, and optimize visual performance.
            </p>
          </div>
        </div>

        <div className="settings-header-right">
          <div className="settings-status-pill">
            <span className="cyber-pulse-dot" style={{ color: '#00E5FF' }} />
            <span>SYSTEM MATRIX : SYNCHRONIZED</span>
          </div>

          <button 
            onClick={handleSaveAll}
            className="cyber-action-btn-primary settings-top-save-btn"
            title="Save and Commit Settings"
          >
            <Check size={16} />
            <span>SAVE PREFERENCES</span>
          </button>
        </div>
      </header>

      {/* Success Notification Banner */}
      {saveSuccess && (
        <div className="settings-success-toast">
          <CheckCircle2 size={18} color="#20D6A0" />
          <span>System configuration successfully updated and saved to flight telemetry!</span>
        </div>
      )}

      {/* ================= 2. MAIN SETTINGS GRID ================= */}
      <div className="settings-grid-layout">

        {/* ================= PANEL 0: PILOT CALLSIGN & CLOUDINARY AVATAR DOSSIER ================= */}
        <section className="cyber-panel settings-card cyber-interactive-card pilot-profile-settings-card" aria-label="Pilot Identity and Cloudinary Avatar">
          <span className="hud-corner hud-tl" aria-hidden="true" />
          <span className="hud-corner hud-tr" aria-hidden="true" />
          <span className="hud-corner hud-bl" aria-hidden="true" />
          <span className="hud-corner hud-br" aria-hidden="true" />

          <div className="card-header-bar">
            <div className="card-heading-group">
              <User size={18} color="#00E5FF" />
              <div>
                <h2 className="card-heading-title">PILOT CALLSIGN & AVATAR MATRIX</h2>
                <span className="card-heading-sub">Cloudinary Encrypted Bio-Telemetry & Callsign Registration</span>
              </div>
            </div>
            <div className="cloudinary-cloud-pill">
              <Cloud size={13} color="#00E5FF" />
              <span>CLOUDINARY STORAGE ACTIVE</span>
            </div>
          </div>

          {/* Feedback alerts */}
          {profileSuccessMsg && (
            <div className="profile-feedback-toast success">
              <CheckCircle2 size={16} color="#20D6A0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}
          {profileErrorMsg && (
            <div className="profile-feedback-toast error">
              <AlertCircle size={16} color="#FF5577" />
              <span>{profileErrorMsg}</span>
            </div>
          )}

          <div className="pilot-profile-content-grid">
            
            {/* Avatar Column */}
            <div className="pilot-avatar-column">
              <div className="pilot-avatar-hologram-frame">
                <div className="pilot-avatar-glow-ring" />
                <div className="pilot-avatar-circle">
                  {previewAvatar ? (
                    <img 
                      src={previewAvatar} 
                      alt="Pilot Avatar Preview" 
                      className="pilot-avatar-preview-img"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="pilot-avatar-placeholder">
                      <User size={44} color="#00E5FF" />
                      <span className="avatar-placeholder-callsign">
                        {callsignInput ? callsignInput.charAt(0).toUpperCase() : 'P'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Floating camera trigger button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="pilot-avatar-camera-btn"
                  title="Select New Photo"
                  aria-label="Select New Photo"
                >
                  <Camera size={14} />
                </button>
              </div>

              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoSelect} 
                accept="image/png, image/jpeg, image/jpg, image/webp" 
                style={{ display: 'none' }} 
              />

              <div className="avatar-button-group">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-avatar-action upload"
                  disabled={isUploading}
                >
                  <Camera size={13} />
                  <span>CHOOSE PHOTO</span>
                </button>
                {previewAvatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="btn-avatar-action remove"
                    disabled={isUploading}
                    title="Remove Profile Photo"
                  >
                    <Trash2 size={13} />
                    <span>REMOVE</span>
                  </button>
                )}
              </div>
              <span className="avatar-specs-hint">
                PNG, JPG or WEBP under 5MB. Auto-cropped & encrypted on Cloudinary CDN.
              </span>
            </div>

            {/* Callsign & Info Column */}
            <div className="pilot-callsign-column">
              <div className="callsign-input-wrapper">
                <label className="callsign-input-label" htmlFor="pilot-callsign-input">
                  <Edit3 size={13} color="#00E5FF" />
                  <span>REGISTERED PILOT CALLSIGN / NAME</span>
                </label>
                <div className="callsign-input-field-shell">
                  <input
                    id="pilot-callsign-input"
                    type="text"
                    value={callsignInput}
                    onChange={(e) => setCallsignInput(e.target.value)}
                    placeholder="e.g. Kiran Chaudhary / Viper-01"
                    maxLength={50}
                    className="callsign-text-input"
                    disabled={isUploading}
                  />
                  <span className="callsign-char-count">{callsignInput.length}/50</span>
                </div>
                <span className="callsign-helper-text">
                  Your callsign is displayed across the top HUD, galactic leaderboards, and flight dossiers.
                </span>
              </div>

              {/* Pilot Telemetry Specs Mini-Grid */}
              <div className="pilot-telemetry-mini-grid">
                <div className="mini-telemetry-item">
                  <span className="mini-label">MILITARY RANK</span>
                  <span className="mini-val text-gold">LVL {pilotLevel} • {pilotRank.toUpperCase()}</span>
                </div>
                <div className="mini-telemetry-item">
                  <span className="mini-label">ACCOUNT EMAIL</span>
                  <span className="mini-val text-dim">{user?.email || 'OFFLINE_SIMULATION'}</span>
                </div>
                <div className="mini-telemetry-item">
                  <span className="mini-label">CLOUD MEDIA STORAGE</span>
                  <span className="mini-val text-cyan">CLOUDINARY // SECURE</span>
                </div>
                <div className="mini-telemetry-item">
                  <span className="mini-label">AVATAR STATUS</span>
                  <span className="mini-val text-purple">
                    {previewAvatar ? (selectedFileBase64 ? 'READY TO SYNC' : 'ACTIVE') : 'DEFAULT ICON'}
                  </span>
                </div>
              </div>

              {/* Commit Button */}
              <div className="callsign-actions-row">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isUploading}
                  className="cyber-action-btn-primary btn-save-callsign-avatar"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={16} className="spin-icon" />
                      <span>UPLOADING TO CLOUDINARY & COMMITTING...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={16} />
                      <span>SAVE CALLSIGN & CLOUDINARY AVATAR</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </section>
        
        {/* PANEL A: AUDIO SYSTEMS MIXER CONSOLE */}
        <section className="cyber-panel settings-card cyber-interactive-card" aria-label="Audio Mixer Console">
          <span className="hud-corner hud-tl" aria-hidden="true" />
          <span className="hud-corner hud-tr" aria-hidden="true" />
          <span className="hud-corner hud-bl" aria-hidden="true" />
          <span className="hud-corner hud-br" aria-hidden="true" />

          <div className="card-header-bar">
            <div className="card-heading-group">
              <Sliders size={18} color="#00E5FF" />
              <div>
                <h2 className="card-heading-title">AUDIO MASTER & SOUNDSCAPE ENGINE</h2>
                <span className="card-heading-sub">Cyberpunk soundtrack channels & telemetry acoustics</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleToggleMute}
              className={`cyber-mute-toggle-btn ${isMuted ? 'muted' : 'active'}`}
              title={isMuted ? 'Unmute All Audio' : 'Mute All Audio'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span>{isMuted ? 'MUTED' : 'LIVE'}</span>
            </button>
          </div>

          {/* Sound Channels Sliders */}
          <div className="audio-channels-stack">
            
            {/* Master Volume */}
            <div className="audio-slider-row">
              <div className="slider-label-group">
                <span className="slider-channel-title">MASTER TELEMETRY GAIN</span>
                <span className="slider-val-badge">{masterVol}%</span>
              </div>
              <div className="cyber-slider-track-wrap">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={masterVol}
                  onChange={(e) => handleMasterChange(Number(e.target.value))}
                  className="cyber-range-input"
                  aria-label="Master Volume Gain"
                />
              </div>
            </div>

            {/* BGM Volume */}
            <div className="audio-slider-row">
              <div className="slider-label-group">
                <span className="slider-channel-title">ELECTRONIC SOUNDTRACK (BGM)</span>
                <span className="slider-val-badge text-cyan">{bgmVol}%</span>
              </div>
              <div className="cyber-slider-track-wrap">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bgmVol}
                  onChange={(e) => handleBgmChange(Number(e.target.value))}
                  className="cyber-range-input cyan-channel"
                  aria-label="BGM Music Volume"
                />
              </div>
            </div>

            {/* SFX Volume */}
            <div className="audio-slider-row">
              <div className="slider-label-group">
                <span className="slider-channel-title">COMBAT ACOUSTICS & WEAPONS (SFX)</span>
                <span className="slider-val-badge text-gold">{sfxVol}%</span>
              </div>
              <div className="cyber-slider-track-wrap">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sfxVol}
                  onChange={(e) => handleSfxChange(Number(e.target.value))}
                  className="cyber-range-input gold-channel"
                  aria-label="Sound Effects Volume"
                />
              </div>
            </div>

          </div>

          {/* Soundtrack Selection Matrix */}
          <div className="soundtrack-selector-box">
            <div className="soundtrack-header-row">
              <Disc size={15} color="#C084FC" />
              <span className="soundtrack-box-title">ACTIVE COMBAT SOUNDTRACK</span>
            </div>

            <div className="track-buttons-grid">
              <button
                type="button"
                onClick={() => handleSelectTrack('vocal')}
                className={`track-select-card ${activeTrack === 'vocal' ? 'active' : ''}`}
              >
                <div className="track-meta">
                  <span className="track-name">NEON VOID (VOCAL MIX)</span>
                  <span className="track-desc">AAA Synthwave vocal theme for tactical sorties</span>
                </div>
                {activeTrack === 'vocal' && <Activity size={16} color="#00E5FF" className="pulse-icon" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectTrack('retro')}
                className={`track-select-card ${activeTrack === 'retro' ? 'active' : ''}`}
              >
                <div className="track-meta">
                  <span className="track-name">ARCADE CHIP DRIVE (8-BIT)</span>
                  <span className="track-desc">Retro synthesized FM-frequency combat pulse</span>
                </div>
                {activeTrack === 'retro' && <Activity size={16} color="#00E5FF" className="pulse-icon" />}
              </button>
            </div>
          </div>

          {/* Quick SFX Sound Check */}
          <div className="sfx-test-bar">
            <span className="sfx-test-label">WEAPON ACOUSTICS TEST:</span>
            <div className="sfx-chips-group">
              <button 
                type="button" 
                onClick={() => handleTestSfx('laser')}
                className="btn-sfx-chip"
                title="Test Plasma Blaster Sound"
              >
                <Zap size={13} color="#00E5FF" />
                <span>PLASMA BLASTER</span>
              </button>
              <button 
                type="button" 
                onClick={() => handleTestSfx('shield')}
                className="btn-sfx-chip"
                title="Test Deflector Shield Sound"
              >
                <Shield size={13} color="#C084FC" />
                <span>DEFLECTOR SHIELD</span>
              </button>
              <button 
                type="button" 
                onClick={() => handleTestSfx('powerup')}
                className="btn-sfx-chip"
                title="Test Energy Core Acquisition Sound"
              >
                <Sparkles size={13} color="#FBBF24" />
                <span>CORE HARVEST</span>
              </button>
            </div>
          </div>
        </section>

        {/* PANEL B: FLIGHT CONTROLS & COMBAT TELEMETRY */}
        <section className="cyber-panel settings-card cyber-interactive-card" aria-label="Flight Controls & Keybindings">
          <span className="hud-corner hud-tl" aria-hidden="true" />
          <span className="hud-corner hud-tr" aria-hidden="true" />
          <span className="hud-corner hud-bl" aria-hidden="true" />
          <span className="hud-corner hud-br" aria-hidden="true" />

          <div className="card-header-bar">
            <div className="card-heading-group">
              <Keyboard size={18} color="#C084FC" />
              <div>
                <h2 className="card-heading-title">FLIGHT CONTROLS & KEYBINDINGS</h2>
                <span className="card-heading-sub">Starship sublight vector and weapon triggers</span>
              </div>
            </div>
          </div>

          {/* Keybindings Telemetry Grid */}
          <div className="control-telemetry-grid">
            <div className="control-telemetry-tile">
              <div className="key-combo-badge">
                <kbd className="key-cap">W</kbd>
                <kbd className="key-cap">A</kbd>
                <kbd className="key-cap">S</kbd>
                <kbd className="key-cap">D</kbd>
                <span className="key-or-divider">OR</span>
                <kbd className="key-cap">ARROWS</kbd>
              </div>
              <div className="control-meta">
                <span className="control-title">TRANSLATIONAL FLIGHT VECTORS</span>
                <span className="control-sub">Pitch, yaw, and omnidirectional evasive thrusters</span>
              </div>
            </div>

            <div className="control-telemetry-tile">
              <div className="key-combo-badge">
                <kbd className="key-cap">SPACE</kbd>
                <span className="key-or-divider">OR</span>
                <span className="key-mouse-badge">AUTOLOCK</span>
              </div>
              <div className="control-meta">
                <span className="control-title">PRIMARY WEAPONS DISCHARGE</span>
                <span className="control-sub">Heavy plasma cannons & rapid laser bursts</span>
              </div>
            </div>

            <div className="control-telemetry-tile">
              <div className="key-combo-badge">
                <kbd className="key-cap">F</kbd>
                <span className="key-or-divider">OR</span>
                <kbd className="key-cap">CLICK</kbd>
              </div>
              <div className="control-meta">
                <span className="control-title">ORDNANCE BOMB / SPECIAL</span>
                <span className="control-sub">Detonate antimatter screen-clearing payload</span>
              </div>
            </div>

            <div className="control-telemetry-tile">
              <div className="key-combo-badge">
                <kbd className="key-cap">P</kbd>
                <span className="key-or-divider">OR</span>
                <kbd className="key-cap">ESC</kbd>
              </div>
              <div className="control-meta">
                <span className="control-title">TACTICAL SORTIE PAUSE</span>
                <span className="control-sub">Temporarily freeze combat state to inspect fleet loadouts</span>
              </div>
            </div>
          </div>

          {/* Touch Screen & Sensitivity Options */}
          <div className="mobile-touch-options-card">
            <div className="touch-header-row">
              <Gamepad2 size={16} color="#FBBF24" />
              <span className="touch-title">MOBILE TOUCH CONTROLS CONFIGURATION</span>
            </div>
            
            <div className="touch-scheme-toggles">
              <button
                type="button"
                onClick={() => setTouchScheme('DIRECT_DRAG')}
                className={`btn-touch-scheme ${touchScheme === 'DIRECT_DRAG' ? 'active' : ''}`}
              >
                <strong>DIRECT TOUCH DRAG (RECOMMENDED)</strong>
                <span>Finger maps directly to starship coordinate translation</span>
              </button>

              <button
                type="button"
                onClick={() => setTouchScheme('VIRTUAL_JOYSTICK')}
                className={`btn-touch-scheme ${touchScheme === 'VIRTUAL_JOYSTICK' ? 'active' : ''}`}
              >
                <strong>FLOATING VIRTUAL JOYSTICK</strong>
                <span>Dynamic on-screen vector stick for retro arcade control</span>
              </button>
            </div>
          </div>
        </section>

        {/* PANEL C: DISPLAY & GRAPHICS PERFORMANCE */}
        <section className="cyber-panel settings-card cyber-interactive-card" aria-label="Display and Visual Tuning">
          <span className="hud-corner hud-tl" aria-hidden="true" />
          <span className="hud-corner hud-tr" aria-hidden="true" />
          <span className="hud-corner hud-bl" aria-hidden="true" />
          <span className="hud-corner hud-br" aria-hidden="true" />

          <div className="card-header-bar">
            <div className="card-heading-group">
              <Monitor size={18} color="#00E5FF" />
              <div>
                <h2 className="card-heading-title">DISPLAY & GRAPHICS PROTOCOLS</h2>
                <span className="card-heading-sub">Phaser 3 Hardware Acceleration & FX Tuning</span>
              </div>
            </div>
          </div>

          {/* Quality Presets */}
          <div className="quality-presets-row">
            <span className="quality-label">GRAPHICS PRESET:</span>
            <div className="quality-buttons-group">
              {['ULTRA', 'HIGH', 'BALANCED'].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setGraphicsQuality(q)}
                  className={`btn-quality-pill ${graphicsQuality === q ? 'active' : ''}`}
                >
                  {q === 'ULTRA' ? 'ULTRA (60 FPS)' : q}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Switches List */}
          <div className="toggle-switches-stack">
            {/* Screen Shake */}
            <div className="toggle-row-item">
              <div className="toggle-text-col">
                <span className="toggle-title">COMBAT SCREEN SHAKE FX</span>
                <span className="toggle-desc">Dynamic viewport vibrations upon weapon fire and heavy dreadnought explosions</span>
              </div>
              <button
                type="button"
                onClick={() => setScreenShake(!screenShake)}
                className={`cyber-toggle-switch ${screenShake ? 'on' : 'off'}`}
                aria-checked={screenShake}
              >
                <span className="toggle-thumb" />
              </button>
            </div>

            {/* Particle Dust */}
            <div className="toggle-row-item">
              <div className="toggle-text-col">
                <span className="toggle-title">ATMOSPHERIC NEBULAR PARTICLES</span>
                <span className="toggle-desc">Cosmic dust embers, ionization trails, and thruster plasma plumes</span>
              </div>
              <button
                type="button"
                onClick={() => setParticleFX(!particleFX)}
                className={`cyber-toggle-switch ${particleFX ? 'on' : 'off'}`}
                aria-checked={particleFX}
              >
                <span className="toggle-thumb" />
              </button>
            </div>

            {/* Bloom Glow */}
            <div className="toggle-row-item">
              <div className="toggle-text-col">
                <span className="toggle-title">CYBERPUNK NEON BLOOM</span>
                <span className="toggle-desc">High-contrast glowing shields, laser tracer trails, and specular reflections</span>
              </div>
              <button
                type="button"
                onClick={() => setBloomEffect(!bloomEffect)}
                className={`cyber-toggle-switch ${bloomEffect ? 'on' : 'off'}`}
                aria-checked={bloomEffect}
              >
                <span className="toggle-thumb" />
              </button>
            </div>
          </div>
        </section>

        {/* PANEL D: PILOT DOSSIER & REQUISITION PROTOCOLS */}
        <section className="cyber-panel settings-card cyber-interactive-card" aria-label="Pilot Dossier & System Info">
          <span className="hud-corner hud-tl" aria-hidden="true" />
          <span className="hud-corner hud-tr" aria-hidden="true" />
          <span className="hud-corner hud-bl" aria-hidden="true" />
          <span className="hud-corner hud-br" aria-hidden="true" />

          <div className="card-header-bar">
            <div className="card-heading-group">
              <Shield size={18} color="#FBBF24" />
              <div>
                <h2 className="card-heading-title">PILOT TELEMETRY & SYSTEM BUILD</h2>
                <span className="card-heading-sub">Command link specifications and cache maintenance</span>
              </div>
            </div>
          </div>

          <div className="dossier-summary-grid">
            <div className="dossier-item">
              <span className="dossier-lbl">ACTIVE CALLSIGN</span>
              <span className="dossier-val text-cyan">[ {pilotName} ]</span>
            </div>
            <div className="dossier-item">
              <span className="dossier-lbl">MILITARY FLIGHT RANK</span>
              <span className="dossier-val text-gold">LVL {pilotLevel} • {pilotRank.toUpperCase()}</span>
            </div>
            <div className="dossier-item">
              <span className="dossier-lbl">ENGINE BUILD PROTOCOL</span>
              <span className="dossier-val">PHASER v3.80 // VITE v8</span>
            </div>
            <div className="dossier-item">
              <span className="dossier-lbl">SOFTWARE SPECIFICATION</span>
              <span className="dossier-val text-purple">{GAME_VERSION} PRODUCTION</span>
            </div>
          </div>

          <div className="system-actions-footer">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="btn-reset-defaults"
              title="Reset all settings to initial factory defaults"
            >
              <RotateCcw size={14} />
              <span>RESET TO FACTORY DEFAULTS</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              className="cyber-action-btn-primary btn-save-primary"
              title="Commit all configurations to device"
            >
              <Check size={16} />
              <span>COMMIT & SAVE PREFERENCES</span>
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default SettingsPage;
