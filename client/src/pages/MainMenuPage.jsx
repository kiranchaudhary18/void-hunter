import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import PublicNavbar from '../components/PublicNavbar.jsx';
import { GAME_NAME, GAME_TAGLINE, GAME_VERSION, API_BASE_URL } from '../config/gameConfig.js';
import { MISSIONS_CATALOG } from '../data/missionsData.js';
import { 
  Play, RotateCcw, Crosshair, Globe, Skull, 
  Award, Shield, Zap, Sparkles 
} from 'lucide-react';
import './MainMenuPage.css';

export const MainMenuPage = ({ onNavigate, onLaunchMission }) => {
  const { user, profile, isAuthenticated } = useAuth();
  const [serverStatus, setServerStatus] = useState({ online: true, latency: 5 });
  const [explanatoryTip, setExplanatoryTip] = useState(null);
  const canvasRef = useRef(null);

  // Compute player's real active mission based on backend profile progress
  const completedCount = profile?.stats?.missionsCompleted || 0;
  const currentMissionNumber = Math.min(50, completedCount + 1);
  const activeMission = MISSIONS_CATALOG.find(m => m.globalSequence === currentMissionNumber) || MISSIONS_CATALOG[0];

  // Real backend health check for the bottom status strip
  useEffect(() => {
    let isMounted = true;
    const checkServerHealth = async () => {
      const startTime = performance.now();
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const elapsed = Math.round(performance.now() - startTime);
        if (response.ok && isMounted) {
          setServerStatus({ online: true, latency: Math.max(1, elapsed) });
        } else if (isMounted) {
          setServerStatus({ online: false, latency: 0 });
        }
      } catch (e) {
        if (isMounted) {
          setServerStatus({ online: false, latency: 0 });
        }
      }
    };

    checkServerHealth();
    const interval = setInterval(checkServerHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Ambient Sci-Fi Audio unlock on first user gesture
  useEffect(() => {
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

  // Subtle floating particle dust on canvas overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.4 + 0.4,
      alpha: Math.random() * 0.7 + 0.15,
      twinkle: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      vx: (Math.random() - 0.5) * 0.2,
      vy: -Math.random() * 0.3 - 0.1
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.alpha += p.twinkle;
        if (p.alpha > 0.85 || p.alpha < 0.15) p.twinkle = -p.twinkle;
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) {
          p.y = canvas.height;
          p.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${Math.max(0.1, p.alpha)})`;
        ctx.shadowBlur = p.radius > 1.2 ? 6 : 0;
        ctx.shadowColor = '#00E5FF';
        ctx.fill();
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Primary Action: PLAY NOW
  const handlePlayNow = () => {
    soundManager.playLaser();
    if (isAuthenticated) {
      if (onLaunchMission) {
        onLaunchMission(activeMission);
      } else if (onNavigate) {
        onNavigate('gameplay');
      }
    } else {
      if (onNavigate) onNavigate('auth');
    }
  };

  // Secondary Action: CONTINUE MISSION
  const handleContinueMission = () => {
    soundManager.playLaser();
    if (isAuthenticated) {
      if (onLaunchMission) {
        onLaunchMission(activeMission);
      } else if (onNavigate) {
        onNavigate('gameplay');
      }
    } else {
      setExplanatoryTip('Enlist pilot credentials to resume saved checkpoint.');
      setTimeout(() => {
        if (onNavigate) onNavigate('auth');
      }, 1200);
    }
  };

  // Global Keyboard Listener for Enter key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handlePlayNow();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, activeMission]);

  return (
    <div className="main-menu-root">
      {/* Particle Canvas Overlay */}
      <canvas ref={canvasRef} className="main-menu-canvas" />

      {/* Atmospheric Vignette */}
      <div className="screen-vignette" />

      {/* Top Cyber Navigation Bar */}
      <PublicNavbar current="home" onNavigate={onNavigate} />

      {/* Main Page Content Body */}
      <main className="main-menu-content">
        
        {/* Upper Left Hero Showcase Section */}
        <section className="hero-upper-section">
          
          {/* Mission Control Status Pill */}
          <div className="hero-status-pill">
            <span className="status-beacon-dot" />
            <span className="status-pill-text">// MISSION CONTROL : OPERATIONAL</span>
          </div>

          {/* Headline Matching Reference Image */}
          <div className="hero-title-group">
            <h1 className="hero-main-heading">
              ENTER THE<br />
              VOID.<br />
              <span className="hero-cyan-highlight">
                HUNT THE<br />
                UNKNOWN.
              </span>
            </h1>
          </div>

          {/* Supporting Narrative */}
          <p className="hero-supporting-text">
            Command advanced starfighters across 50 hostile sorties and 5 deep-space sectors. 
            Engage ruthless alien fleets, master tactical power-ups, and neutralize apex Void bosses to defend the galaxy.
          </p>

          {/* Action Buttons Row */}
          <div className="hero-actions-container">
            <div className="hero-buttons-row">
              {/* PLAY NOW (Vibrant Cyan) */}
              <button
                id="btn-play-now"
                onClick={handlePlayNow}
                className="btn-hero-primary"
                title="Deploy immediately into tactical combat"
              >
                <Play size={18} fill="#080A2F" strokeWidth={0} />
                <span>PLAY NOW</span>
              </button>

              {/* CONTINUE MISSION (Panel Navy with Cyan Border) */}
              <button
                id="btn-continue-mission"
                onClick={handleContinueMission}
                className="btn-hero-secondary"
                title={isAuthenticated 
                  ? `Resume Campaign at Mission ${currentMissionNumber}` 
                  : 'Enlist to resume saved campaign progress'}
              >
                <RotateCcw size={17} />
                <span>CONTINUE MISSION</span>
              </button>
            </div>

            {/* Explanatory Message / Keyboard Shortcut Cue */}
            {explanatoryTip ? (
              <div style={{ color: '#00E5FF', fontSize: '0.82rem', fontFamily: 'Orbitron', marginTop: '6px' }}>
                ℹ {explanatoryTip}
              </div>
            ) : (
              <div className="hero-keyboard-hint">
                <span className="key-badge">ENTER</span>
                <span>PRESS ENTER TO ENGAGE SORTIE</span>
              </div>
            )}
          </div>
        </section>

        {/* 4 Feature Stats Cards (Bottom Row of Hero, Matching Reference Image) */}
        <section className="feature-cards-grid">
          
          {/* Card 1: 50 TACTICAL SORTIES */}
          <div 
            className="feature-card feature-card-cyan"
            onClick={() => onNavigate && onNavigate('missions')}
            title="Explore 50 Tactical Combat Sorties"
          >
            <div className="card-left-section">
              <div className="card-icon-badge badge-cyan">
                <Crosshair size={22} />
              </div>
              <div className="card-text-col">
                <span className="card-value">50</span>
                <span className="card-label">TACTICAL SORTIES</span>
                <div className="card-segmented-bar bar-cyan" />
              </div>
            </div>
            {/* Subtle Right Silhouette Graphic */}
            <div className="card-right-graphic">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
                <path d="M12 2v20M2 12h20" />
              </svg>
            </div>
          </div>

          {/* Card 2: 5 DEEP-SPACE SECTORS */}
          <div 
            className="feature-card feature-card-purple"
            onClick={() => onNavigate && onNavigate('missions')}
            title="Navigate 5 Deep Space Sectors"
          >
            <div className="card-left-section">
              <div className="card-icon-badge badge-purple">
                <Globe size={22} />
              </div>
              <div className="card-text-col">
                <span className="card-value">5</span>
                <span className="card-label">DEEP-SPACE SECTORS</span>
                <div className="card-segmented-bar bar-purple" />
              </div>
            </div>
            {/* Subtle Right Silhouette Graphic */}
            <div className="card-right-graphic">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="8" />
                <path d="M4 12c0-3.5 3.5-6 8-6s8 2.5 8 6-3.5 6-8 6-8-2.5-8-6z" />
              </svg>
            </div>
          </div>

          {/* Card 3: 5 APEX BOSSES */}
          <div 
            className="feature-card feature-card-red"
            onClick={() => onNavigate && onNavigate('missions')}
            title="Defeat 5 Apex Boss Dreadnoughts"
          >
            <div className="card-left-section">
              <div className="card-icon-badge badge-red">
                <Skull size={22} />
              </div>
              <div className="card-text-col">
                <span className="card-value">5</span>
                <span className="card-label">APEX BOSSES</span>
                <div className="card-segmented-bar bar-red" />
              </div>
            </div>
            {/* Subtle Right Silhouette Graphic */}
            <div className="card-right-graphic">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 10h.01M15 10h.01M10 2v4M14 2v4M12 16v2M10 20h4" />
                <path d="M6 12a6 6 0 1 1 12 0c0 4-2 7-6 7s-6-3-6-7z" />
              </svg>
            </div>
          </div>

          {/* Card 4: UNLOCK ADVANCED STARSHIPS */}
          <div 
            className="feature-card feature-card-gold"
            onClick={() => onNavigate && onNavigate('hangar')}
            title="Unlock and Upgrade 5 Starship Classes in the Hangar"
          >
            <div className="card-left-section">
              <div className="card-icon-badge badge-gold">
                <Award size={22} />
              </div>
              <div className="card-text-col">
                <span className="card-value">UNLOCK</span>
                <span className="card-label">ADVANCED STARSHIPS</span>
                <div className="card-segmented-bar bar-gold" />
              </div>
            </div>
            {/* Subtle Right Silhouette Graphic */}
            <div className="card-right-graphic">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2l4 8 6 10-6-3-4 5-4-5-6 3 6-10 4-8z" />
              </svg>
            </div>
          </div>

        </section>

      </main>

      {/* Bottom Status Strip (Matching Reference Image) */}
      <footer className="main-menu-status-strip">
        <div className="status-strip-container">
          
          {/* Left: PROTOCOL v1.0.0 | PHASER 3 ENGINE */}
          <div className="status-item">
            <span>PROTOCOL <span className="status-item-highlight">{GAME_VERSION}</span></span>
            <span style={{ margin: '0 4px', opacity: 0.6 }}>|</span>
            <span>PHASER 3 ENGINE</span>
          </div>

          {/* Center: EXPLORE • FIGHT • UPGRADE • LEAD */}
          <div className="status-item status-strip-center">
            <span>EXPLORE</span>
            <span style={{ margin: '0 6px', color: '#00E5FF' }}>•</span>
            <span>FIGHT</span>
            <span style={{ margin: '0 6px', color: '#00E5FF' }}>•</span>
            <span>UPGRADE</span>
            <span style={{ margin: '0 6px', color: '#00E5FF' }}>•</span>
            <span>LEAD</span>
          </div>

          {/* Right: ● SYSTEM OPERATIONAL // {latency}MS */}
          <div className="status-item">
            <span className={`status-live-dot ${serverStatus.online ? '' : 'offline'}`} />
            <span>
              {serverStatus.online 
                ? `SYSTEM OPERATIONAL // ${serverStatus.latency}MS` 
                : 'SYSTEM LINK OFFLINE'}
            </span>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default MainMenuPage;
