import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import PublicNavbar from '../components/PublicNavbar.jsx';
import { GAME_NAME, GAME_TAGLINE, GAME_VERSION, API_BASE_URL } from '../config/gameConfig.js';
import { MISSIONS_CATALOG } from '../data/missionsData.js';
import { Play, RotateCcw, Shield, Zap, Crosshair } from 'lucide-react';
import './MainMenuPage.css';

export const MainMenuPage = ({ onNavigate, onLaunchMission }) => {
  const { user, profile, isAuthenticated } = useAuth();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [serverStatus, setServerStatus] = useState({ online: true, latency: 18 });
  const [explanatoryTip, setExplanatoryTip] = useState(null);
  const canvasRef = useRef(null);
  const heroCardRef = useRef(null);

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

  // Ambient Sci-Fi Music on First User Gesture
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

  // HTML5 Starfield & Cosmic Dust Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate layered stars and floating motes
    const starCount = Math.floor(Math.min(180, window.innerWidth / 9));
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      twinkleSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
      speedY: Math.random() * 0.15 + 0.05
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 0.95 || star.alpha < 0.15) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }
        star.y -= star.speedY;
        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(234, 240, 255, ${Math.max(0.1, star.alpha)})`;
        ctx.shadowBlur = star.radius > 1.2 ? 6 : 0;
        ctx.shadowColor = '#00E5FF';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // 3D Interactive Mouse Parallax Tilt for Hero Starfighter Card
  const handleMouseMove = (e) => {
    if (!heroCardRef.current) return;
    const rect = heroCardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Smooth bounded tilt (-12deg to +12deg)
    const tiltX = -(mouseY / (rect.height / 2)) * 8;
    const tiltY = (mouseX / (rect.width / 2)) * 10;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

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
      // Unauthenticated pilots enter the onboarding / auth enlistment flow
      if (onNavigate) onNavigate('auth');
    }
  };

  // Secondary Action: CONTINUE MISSION
  const handleContinueMission = () => {
    soundManager.playLaser();
    if (isAuthenticated) {
      if (completedCount > 0) {
        // Resume saved progress
        if (onLaunchMission) {
          onLaunchMission(activeMission);
        } else if (onNavigate) {
          onNavigate('gameplay');
        }
      } else {
        // Authenticated but zero completions: deploy initial mission
        if (onLaunchMission) {
          onLaunchMission(MISSIONS_CATALOG[0]);
        } else if (onNavigate) {
          onNavigate('gameplay');
        }
      }
    } else {
      // Guest: show explanatory feedback and offer login
      setExplanatoryTip('Enlist pilot credentials to resume saved checkpoint.');
      setTimeout(() => {
        if (onNavigate) onNavigate('auth');
      }, 1200);
    }
  };

  // Global Keyboard Navigation (Enter engages sortie)
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
      {/* Dynamic Starry Space Backdrop Canvas */}
      <canvas ref={canvasRef} className="main-menu-canvas" />

      {/* Layered Cosmic Nebula Atmospheric Accents */}
      <div className="nebula-purple-glow" />
      <div className="nebula-cyan-glow" />
      <div className="screen-vignette" />

      {/* Premium Horizontal Navigation Bar */}
      <PublicNavbar current="home" onNavigate={onNavigate} />

      {/* Hero Section */}
      <main className="main-menu-content" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <div className="hero-main-grid">
          
          {/* Left Column: Mission Status & CTAs */}
          <div className="hero-left-column">
            {/* Small Mission Status Label */}
            <div className="hero-status-pill">
              <span className="status-beacon-dot" />
              <span className="status-pill-text">
                {isAuthenticated 
                  ? `// PILOT: ${user?.pilotName || user?.username || 'HUNTER-1'} • MISSION CONTROL READY` 
                  : '// MISSION CONTROL: OPERATIONAL • READY FOR SORTIE'}
              </span>
            </div>

            {/* Headline */}
            <div className="hero-title-group">
              <h1 className="hero-main-heading">
                ENTER THE VOID.<br />
                <span className="hero-cyan-highlight">HUNT THE UNKNOWN.</span>
              </h1>
            </div>

            {/* Concise Supporting Text */}
            <p className="hero-supporting-text">
              Command advanced starfighters across 50 hostile sorties and 5 deep-space sectors. 
              Engage ruthless alien fleets, master tactical power-ups, and neutralize apex Void bosses to defend the galaxy.
            </p>

            {/* Action Buttons */}
            <div className="hero-actions-container">
              <div className="hero-buttons-row">
                {/* Play Now Button */}
                <button
                  id="btn-play-now"
                  onClick={handlePlayNow}
                  className="btn-hero-primary"
                  title="Deploy immediately into tactical combat"
                >
                  <Play size={20} fill="#080A2F" strokeWidth={0} />
                  <span>PLAY NOW</span>
                </button>

                {/* Continue Mission Button */}
                <button
                  id="btn-continue-mission"
                  onClick={handleContinueMission}
                  className="btn-hero-secondary"
                  title={isAuthenticated 
                    ? `Resume Campaign at Mission ${currentMissionNumber}` 
                    : 'Enlist to resume saved campaign progress'}
                >
                  <RotateCcw size={18} />
                  <span>
                    {isAuthenticated 
                      ? (completedCount > 0 
                          ? `CONTINUE: M-${String(currentMissionNumber).padStart(2, '0')}` 
                          : 'START CAMPAIGN')
                      : 'CONTINUE MISSION'}
                  </span>
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
          </div>

          {/* Right Column: Hero Starfighter Showcase */}
          <div className="hero-right-column">
            <div className="starfighter-float-wrap">
              <div 
                ref={heroCardRef}
                className="starfighter-viewport-card"
                style={{
                  transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
                }}
              >
                {/* Tactical Telemetry HUD Corner Brackets */}
                <div className="hud-bracket hud-top-left">
                  + REG: V-01 ORBITRON
                </div>
                <div className="hud-bracket hud-top-right">
                  CLASS: INTERCEPTOR +
                </div>
                <div className="hud-bracket hud-bottom-left">
                  + SHIELD MATRIX: 100%
                </div>
                <div className="hud-bracket hud-bottom-right">
                  TWIN ION PROPULSION +
                </div>

                {/* Detailed Original 3D-Style Starfighter Visual */}
                <img 
                  src="/assets/hero_starfighter.jpg" 
                  alt="V-01 Orbitron Advanced Tactical Starfighter"
                  className="starfighter-hero-image"
                />

                {/* Soft Edge Vignette Masking & Scanlines */}
                <div className="starfighter-image-vignette" />
                <div className="starfighter-scanlines" />

                {/* Glowing Ion Thruster Emitters */}
                <div className="thruster-glow-left" />
                <div className="thruster-glow-right" />
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Restrained Bottom Status Strip */}
      <footer className="main-menu-status-strip">
        <div className="status-strip-container">
          <div className="status-item">
            <span>PROTOCOL <span className="status-item-highlight">{GAME_VERSION}</span></span>
            <span>•</span>
            <span>PHASER 3 ENGINE</span>
          </div>

          <div className="status-item status-strip-center">
            <span>50 TACTICAL SORTIES</span>
            <span>•</span>
            <span>5 SECTORS</span>
            <span>•</span>
            <span>5 APEX BOSSES</span>
          </div>

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
