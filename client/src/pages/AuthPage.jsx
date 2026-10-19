import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import './AuthPage.css';
import { 
  Mail, Lock, User, Eye, EyeOff, Shield, ArrowLeft, 
  AlertCircle, CheckCircle2, X, UserPlus
} from 'lucide-react';

// Brand SVG Delta Logo
const DeltaLogo = () => (
  <svg viewBox="0 0 36 36" width="34" height="34" fill="none" className="auth-delta-icon" aria-hidden="true">
    <polygon points="18,3 34,32 23,32 18,20 13,32 2,32" fill="url(#deltaGrad)" />
    <polygon points="18,9 29,29 23,29 18,19 13,29 7,29" fill="#04081E" />
    <defs>
      <linearGradient id="deltaGrad" x1="2" y1="3" x2="34" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#00E5FF" />
        <stop offset="100%" stopColor="#0088FF" />
      </linearGradient>
    </defs>
  </svg>
);

// High-fidelity Social Provider Icons
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="#5865F2" aria-hidden="true">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="#EAF1FF" aria-hidden="true">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

// Faint Watermark Ships
const FighterSilhouette = () => (
  <svg viewBox="0 0 140 140" width="130" height="130" className="auth-card-watermark" aria-hidden="true">
    <path d="M70 10 L82 45 L130 80 L95 90 L100 125 L70 105 L40 125 L45 90 L10 80 L58 45 Z" fill="currentColor" />
  </svg>
);

export const AuthPage = ({ onBackToGame, onAuthSuccess }) => {
  const { login, register } = useAuth();
  const canvasRef = useRef(null);

  // Active tab on mobile: 'login' or 'register'
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const stored = sessionStorage.getItem('void_hunter_auth_tab');
      if (stored === 'register' || stored === 'login') {
        sessionStorage.removeItem('void_hunter_auth_tab');
        return stored;
      }
    } catch {}
    return 'login';
  });

  // Track viewport size for mobile tab toggle
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth <= 960 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 960);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update Document Title for SEO
  useEffect(() => {
    document.title = 'Void Hunter - Pilot Authentication & Fleet Enlistment';
  }, []);

  // Dynamic Animated Starfield Background via Code
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Initialize Starfield particles
    const starCount = 140;
    const stars = [];
    const colors = ['#FFFFFF', '#A5F3FC', '#67E8F9', '#C084FC', '#818CF8'];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.6 + 0.4,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: (Math.random() * 0.15 + 0.05)
      });
    }

    // Shooting stars
    const shootingStars = [];
    let lastShoot = Date.now();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render Stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.alpha += s.twinkleSpeed;
        if (s.alpha > 0.95 || s.alpha < 0.2) {
          s.twinkleSpeed = -s.twinkleSpeed;
        }
        s.y -= s.vy;
        if (s.y < 0) {
          s.y = height;
          s.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(1, s.alpha));
        ctx.fill();
      }

      // Spawn shooting stars periodically
      if (Date.now() - lastShoot > 4500 && Math.random() > 0.6) {
        lastShoot = Date.now();
        shootingStars.push({
          x: Math.random() * (width * 0.7),
          y: Math.random() * (height * 0.4),
          len: Math.random() * 80 + 40,
          speed: Math.random() * 6 + 7,
          angle: (Math.PI / 6) + (Math.random() * 0.2 - 0.1),
          alpha: 1
        });
      }

      // Render shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const st = shootingStars[i];
        st.x += Math.cos(st.angle) * st.speed;
        st.y += Math.sin(st.angle) * st.speed;
        st.alpha -= 0.025;

        if (st.alpha <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        const tailX = st.x - Math.cos(st.angle) * st.len;
        const tailY = st.y - Math.sin(st.angle) * st.len;
        const grad = ctx.createLinearGradient(tailX, tailY, st.x, st.y);
        grad.addColorStop(0, 'rgba(0, 229, 255, 0)');
        grad.addColorStop(1, `rgba(0, 229, 255, ${st.alpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(st.x, st.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = 1;
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // UI State: Alerts & Loading
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modals: Terms & Forgot Password
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Social Auth Feedback
  const handleSocialAuth = (provider) => {
    try { soundManager.playLaser(); } catch {}
    setSuccessMsg(`${provider} pilot uplink initialized. Connecting to Command Deck...`);
    setTimeout(() => {
      setSuccessMsg('');
    }, 3200);
  };

  // ================= FORM HANDLERS =================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Please enter both email address and password.');
      return;
    }

    try { soundManager.playLaser(); } catch {}
    setSubmitting(true);
    const result = await login(loginEmail.trim(), loginPassword);
    setSubmitting(false);

    if (result.success) {
      setSuccessMsg('Authentication verified. Accessing Command Deck...');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
      }, 400);
    } else {
      setErrorMsg(result.message || 'Invalid pilot credentials. Please verify email and password.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim()) {
      setErrorMsg('Please provide a pilot callsign or name.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg('Please provide an email address.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms of Service & Privacy Policy.');
      return;
    }

    try { soundManager.playLaser(); } catch {}
    setSubmitting(true);
    const result = await register(regName.trim(), regEmail.trim(), regPassword);
    setSubmitting(false);

    if (result.success) {
      setSuccessMsg('Pilot profile commissioned! Enlisted into Space Fleet...');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
      }, 400);
    } else {
      setErrorMsg(result.message || 'Registration failed. The email or callsign may already be taken.');
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSubmitted(true);
  };

  return (
    <div className="auth-root-wrapper" id="auth-page-root">
      {/* 100% CODE-BASED DYNAMIC PROCEDURAL BACKGROUND */}
      <div className="auth-code-environment" aria-hidden="true">
        {/* Animated Canvas Starfield */}
        <canvas ref={canvasRef} className="auth-canvas-stars" />
        
        {/* Layered Nebula Glows */}
        <div className="auth-nebula-cyan" />
        <div className="auth-nebula-purple" />
        <div className="auth-space-vignette" />

        {/* Outer Space Scene: Planet, Battlecruiser, Starfighters, Laser */}
        <div className="auth-space-vista">
          {/* Glowing Planetary Sphere (Upper Right) */}
          <div className="auth-planet-orb">
            <div className="auth-planet-atmosphere" />
            <div className="auth-planet-ring-front" />
            <div className="auth-planet-ring-back" />
          </div>

          {/* Fleet Battlecruiser Warship (Upper Right Silhouette) */}
          <svg viewBox="0 0 400 180" className="auth-vector-dreadnought">
            <defs>
              <linearGradient id="cruiserHull" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0B1330" />
                <stop offset="50%" stopColor="#121D42" />
                <stop offset="100%" stopColor="#09102A" />
              </linearGradient>
            </defs>
            {/* Main Hull Blocks */}
            <polygon points="50,90 80,70 280,65 360,85 390,105 350,120 180,125 70,115" fill="url(#cruiserHull)" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="1" />
            <polygon points="120,65 150,45 250,42 275,65" fill="#0E193C" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1" />
            <polygon points="170,42 190,28 220,28 230,42" fill="#14234E" />
            {/* Glowing Hangar Ports & Windows */}
            <rect x="130" y="78" width="45" height="6" fill="#00E5FF" filter="drop-shadow(0 0 5px #00E5FF)" />
            <circle cx="210" cy="80" r="2.5" fill="#00E5FF" />
            <circle cx="225" cy="80" r="2.5" fill="#00E5FF" />
            <circle cx="240" cy="80" r="2.5" fill="#00E5FF" />
            <circle cx="255" cy="80" r="2.5" fill="#00E5FF" />
            <rect x="290" y="85" width="30" height="4" fill="#A855F7" filter="drop-shadow(0 0 4px #A855F7)" />
            {/* Engine Glows */}
            <ellipse cx="50" cy="88" rx="5" ry="8" fill="#FF8800" filter="drop-shadow(-4px 0 8px #FF6600)" />
            <ellipse cx="55" cy="102" rx="4" ry="6" fill="#FF8800" filter="drop-shadow(-4px 0 8px #FF6600)" />
          </svg>

          {/* Starfighter Patrol in Space (Left Viewport) */}
          <div className="auth-starfighter-left">
            <svg viewBox="0 0 80 50" width="76" height="46" className="fighter-svg">
              <polygon points="75,25 45,10 30,12 10,5 15,22 5,25 15,28 10,45 30,38 45,40" fill="#0D1636" stroke="rgba(0, 229, 255, 0.5)" strokeWidth="1.2" />
              <polygon points="50,25 35,18 25,25 35,32" fill="#00E5FF" opacity="0.8" />
              <circle cx="10" cy="22" r="3" fill="#00E5FF" filter="drop-shadow(-6px 0 8px #00E5FF)" />
              <circle cx="10" cy="28" r="3" fill="#00E5FF" filter="drop-shadow(-6px 0 8px #00E5FF)" />
            </svg>
            <div className="fighter-trail-cyan" />
          </div>

          {/* Starfighter Escort (Right Space Viewport) */}
          <div className="auth-starfighter-right">
            <svg viewBox="0 0 80 50" width="60" height="38" className="fighter-svg">
              <polygon points="70,25 40,12 25,14 8,8 12,22 4,25 12,28 8,42 25,36 40,38" fill="#120E30" stroke="rgba(168, 85, 247, 0.6)" strokeWidth="1.2" />
              <polygon points="45,25 32,19 22,25 32,31" fill="#A855F7" opacity="0.8" />
              <circle cx="8" cy="22" r="3" fill="#8B5CF6" filter="drop-shadow(-6px 0 8px #8B5CF6)" />
              <circle cx="8" cy="28" r="3" fill="#00E5FF" filter="drop-shadow(-6px 0 8px #00E5FF)" />
            </svg>
            <div className="fighter-trail-purple" />
          </div>

          {/* Continuous Orange Laser Horizon Pulse */}
          <div className="auth-horizon-laser-beam">
            <div className="laser-halo" />
            <div className="laser-streak" />
            <div className="laser-flare" />
          </div>
        </div>

        {/* Carrier Hangar Architecture: Pillars, Girders & Catwalk Floor */}
        <div className="auth-carrier-architecture">
          {/* Top Ceiling Girders */}
          <div className="auth-ceiling-rafters" />
          
          {/* Left Gantry Pillar with Cyan Light Strips (Astronaut removed, clean observation bay) */}
          <div className="auth-left-gantry">
            <div className="gantry-column" />
            <div className="gantry-light-channel" />
            <div className="gantry-light-channel channel-lower" />
            <div className="gantry-amber-node" />
            <div className="gantry-truss-cross" />
          </div>

          {/* Bottom Reflective Metallic Deck Floor */}
          <div className="auth-carrier-floor">
            <div className="catwalk-rail-top" />
            <div className="catwalk-cyan-track" />
            <div className="catwalk-deck-plates" />
            <div className="catwalk-laser-reflection" />
          </div>

          {/* Right Holographic Tactical Terminal */}
          <div className="auth-tactical-terminal-box">
            <div className="terminal-screen-glow">
              <div className="terminal-header-strip">// PILOT FLEET DECK //</div>
              <div className="terminal-text-block">
                <span className="term-line bold-cyan">JOIN</span>
                <span className="term-line bold-cyan">THE FLEET</span>
                <span className="term-line">EXPLORE</span>
                <span className="term-line">CONQUER</span>
                <span className="term-line bright-accent">BECOME A LEGEND</span>
              </div>
              <div className="terminal-delta-crest">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                  <polygon points="12,2 22,20 16,20 12,13 8,20 2,20" fill="#00E5FF" filter="drop-shadow(0 0 6px #00E5FF)" />
                </svg>
              </div>
              <div className="terminal-telemetry-status">
                <span className="pulse-dot">●</span> SYSTEM READY 100%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <header className="auth-header-bar">
        <div 
          className="auth-brand-logo-area" 
          onClick={onBackToGame} 
          role="button" 
          tabIndex={0}
          aria-label="Void Hunter Brand Home"
        >
          <DeltaLogo />
          <div className="auth-brand-text-block">
            <h1 className="auth-brand-name">VOID HUNTER</h1>
            <span className="auth-brand-tagline">SPACE COMBAT BEYOND LIMITS</span>
          </div>
        </div>

        <button 
          type="button" 
          onClick={onBackToGame} 
          className="auth-back-game-btn"
          id="auth-back-button"
        >
          <ArrowLeft size={15} />
          <span>BACK TO GAME</span>
        </button>
      </header>

      {/* Dynamic Alerts Banner */}
      {errorMsg && (
        <div className="auth-floating-alert auth-alert-error" role="alert">
          <AlertCircle size={15} />
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg('')} className="auth-alert-dismiss" aria-label="Dismiss alert"><X size={14} /></button>
        </div>
      )}
      {successMsg && (
        <div className="auth-floating-alert auth-alert-success" role="status">
          <CheckCircle2 size={15} />
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg('')} className="auth-alert-dismiss" aria-label="Dismiss alert"><X size={14} /></button>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      {isMobile && (
        <div className="auth-mobile-tabs">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`auth-mobile-tab-btn ${activeTab === 'login' ? 'active-cyan' : ''}`}
          >
            PILOT ACCESS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`auth-mobile-tab-btn ${activeTab === 'register' ? 'active-purple' : ''}`}
          >
            JOIN THE FLEET
          </button>
        </div>
      )}

      {/* Main Dual Cards Grid (Zero-Scroll Centered) */}
      <main className={`auth-cards-layout ${isMobile ? (activeTab === 'login' ? 'show-login-tab' : 'show-register-tab') : ''}`}>
        
        {/* ================= LEFT CARD: PILOT ACCESS (SIGN IN) ================= */}
        <section className="auth-card auth-card-cyan" aria-label="Pilot Sign In">
          <FighterSilhouette />
          
          <div className="auth-card-inner">
            {/* Pill Eyebrow */}
            <div className="auth-pill-badge pill-cyan">
              <span>// PILOT ACCESS</span>
            </div>

            {/* Header */}
            <h2 className="auth-card-title">
              WELCOME BACK,<br />
              <span className="title-cyan">PILOT.</span>
            </h2>
            <p className="auth-card-desc">
              Your next mission awaits. Log in and continue your journey across the galaxy.
            </p>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="auth-form-content" noValidate>
              {/* Email Address */}
              <div className="auth-field">
                <label htmlFor="login-email-input" className="auth-label label-cyan">
                  EMAIL ADDRESS
                </label>
                <div className="auth-input-container">
                  <Mail size={16} className="auth-icon-left" aria-hidden="true" />
                  <input
                    id="login-email-input"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="user.forever@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="auth-text-input"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field">
                <label htmlFor="login-password-input" className="auth-label label-cyan">
                  PASSWORD
                </label>
                <div className="auth-input-container">
                  <Lock size={16} className="auth-icon-left" aria-hidden="true" />
                  <input
                    id="login-password-input"
                    name="password"
                    type={showLoginPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="auth-text-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="auth-toggle-pwd"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Options Row */}
              <div className="auth-row-options">
                <label htmlFor="login-remember-checkbox" className="auth-checkbox-label">
                  <input
                    id="login-remember-checkbox"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="auth-checkbox checkbox-cyan"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(loginEmail);
                    setForgotSubmitted(false);
                    setForgotModalOpen(true);
                  }}
                  className="auth-link link-cyan"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={submitting}
                className="auth-action-btn btn-cyan-glow"
                id="auth-sign-in-submit"
              >
                <span className="auth-btn-play-icon">▶</span>
                <span>{submitting ? 'AUTHENTICATING...' : 'SIGN IN'}</span>
              </button>
            </form>

            {/* Social Divider */}
            <div className="auth-social-divider">
              <span className="divider-line line-cyan" />
              <span className="divider-text">OR CONTINUE WITH</span>
              <span className="divider-line line-cyan" />
            </div>

            {/* Social Buttons */}
            <div className="auth-social-buttons-row">
              <button type="button" onClick={() => handleSocialAuth('Google')} className="auth-social-btn">
                <GoogleIcon />
                <span>Google</span>
              </button>
              <button type="button" onClick={() => handleSocialAuth('Discord')} className="auth-social-btn">
                <DiscordIcon />
                <span>Discord</span>
              </button>
              <button type="button" onClick={() => handleSocialAuth('GitHub')} className="auth-social-btn">
                <GithubIcon />
                <span>GitHub</span>
              </button>
            </div>

            {/* Card Switch Footer */}
            <div className="auth-switch-footer">
              <span>Don't have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setActiveTab('register');
                }}
                className="auth-switch-btn switch-cyan"
              >
                Enlist / Create Profile
              </button>
            </div>
          </div>
        </section>

        {/* ================= RIGHT CARD: JOIN THE FLEET (REGISTER) ================= */}
        <section className="auth-card auth-card-purple" aria-label="Pilot Registration">
          <FighterSilhouette />

          <div className="auth-card-inner">
            {/* Pill Eyebrow */}
            <div className="auth-pill-badge pill-purple">
              <span>// JOIN THE FLEET</span>
            </div>

            {/* Header */}
            <h2 className="auth-card-title">
              CREATE YOUR<br />
              <span className="title-purple">PILOT PROFILE.</span>
            </h2>
            <p className="auth-card-desc">
              Enlist today. Make your mark across the galaxy and become a legend.
            </p>

            {/* Register Form */}
            <form onSubmit={handleRegisterSubmit} className="auth-form-content" noValidate>
              {/* Callsign / Name */}
              <div className="auth-field">
                <label htmlFor="reg-callsign-input" className="auth-label label-purple">
                  CALLSIGN / PILOT NAME
                </label>
                <div className="auth-input-container">
                  <User size={16} className="auth-icon-left" aria-hidden="true" />
                  <input
                    id="reg-callsign-input"
                    name="name"
                    type="text"
                    autoComplete="nickname"
                    placeholder="e.g. Commander Vega"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="auth-text-input"
                    maxLength={50}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="auth-field">
                <label htmlFor="reg-email-input" className="auth-label label-purple">
                  EMAIL ADDRESS
                </label>
                <div className="auth-input-container">
                  <Mail size={16} className="auth-icon-left" aria-hidden="true" />
                  <input
                    id="reg-email-input"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="user.forever@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="auth-text-input"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field">
                <label htmlFor="reg-password-input" className="auth-label label-purple">
                  PASSWORD
                </label>
                <div className="auth-input-container">
                  <Lock size={16} className="auth-icon-left" aria-hidden="true" />
                  <input
                    id="reg-password-input"
                    name="password"
                    type={showRegPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Minimum 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="auth-text-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="auth-toggle-pwd"
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="auth-field">
                <label htmlFor="reg-confirm-password-input" className="auth-label label-purple">
                  CONFIRM PASSWORD
                </label>
                <div className="auth-input-container">
                  <Shield size={16} className="auth-icon-left" aria-hidden="true" />
                  <input
                    id="reg-confirm-password-input"
                    name="confirmPassword"
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="auth-text-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="auth-toggle-pwd"
                    aria-label={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Terms and Privacy Policy Checkbox */}
              <div className="auth-row-options">
                <label htmlFor="reg-terms-checkbox" className="auth-checkbox-label">
                  <input
                    id="reg-terms-checkbox"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="auth-checkbox checkbox-purple"
                    required
                  />
                  <span>
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setTermsModalOpen(true)}
                      className="auth-inline-link link-purple"
                    >
                      Terms of Service
                    </button>
                    {' & '}
                    <button
                      type="button"
                      onClick={() => setTermsModalOpen(true)}
                      className="auth-inline-link link-purple"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </label>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={submitting}
                className="auth-action-btn btn-purple-glow"
                id="auth-register-submit"
              >
                <UserPlus size={16} className="auth-btn-icon" />
                <span>{submitting ? 'COMMISSIONING PILOT...' : 'CREATE ACCOUNT'}</span>
              </button>
            </form>

            {/* Social Divider */}
            <div className="auth-social-divider">
              <span className="divider-line line-purple" />
              <span className="divider-text">OR SIGN UP WITH</span>
              <span className="divider-line line-purple" />
            </div>

            {/* Social Buttons */}
            <div className="auth-social-buttons-row">
              <button type="button" onClick={() => handleSocialAuth('Google')} className="auth-social-btn">
                <GoogleIcon />
                <span>Google</span>
              </button>
              <button type="button" onClick={() => handleSocialAuth('Discord')} className="auth-social-btn">
                <DiscordIcon />
                <span>Discord</span>
              </button>
              <button type="button" onClick={() => handleSocialAuth('GitHub')} className="auth-social-btn">
                <GithubIcon />
                <span>GitHub</span>
              </button>
            </div>

            {/* Card Switch Footer */}
            <div className="auth-switch-footer">
              <span>Already have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setActiveTab('login');
                }}
                className="auth-switch-btn switch-purple"
              >
                Sign in to Command Deck
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ================= TERMS & PRIVACY MODAL ================= */}
      {termsModalOpen && (
        <div 
          className="auth-modal-overlay" 
          onClick={() => setTermsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-modal-heading"
        >
          <div className="auth-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-top">
              <h3 id="terms-modal-heading" className="auth-modal-title">
                SPACE FLEET COMMAND PROTOCOLS
              </h3>
              <button 
                type="button" 
                onClick={() => setTermsModalOpen(false)} 
                className="auth-modal-close"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="auth-modal-scrollable">
              <h4>1. FAIR PLAY & COMBAT INTEGRITY</h4>
              <p>
                All flight combat runs, telemetry, weapon heat, and score submissions are validated by the authoritative Void Hunter server. Automated speedhacks, client tampering, or injection tools will result in pilot clearance revocation and score disqualification.
              </p>

              <h4>2. SECURE ECONOMY & CURRENCY LEDGER</h4>
              <p>
                Credits, Dark Matter cores, and spaceship upgrades acquired during space missions are permanently ledgered to your verified pilot identity. Unauthorized exploitation of currency glitches will be rolled back.
              </p>

              <h4>3. CLASSIFIED TELEMETRY & PRIVACY</h4>
              <p>
                Your pilot profile email, callsign, and combat telemetry are secured via modern cryptographic hashing. We do not sell or transmit combat logs to external mercenary entities.
              </p>
            </div>

            <div className="auth-modal-bottom">
              <button
                type="button"
                onClick={() => setTermsModalOpen(false)}
                className="auth-modal-confirm-btn"
              >
                ACKNOWLEDGE & CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FORGOT PASSWORD MODAL ================= */}
      {forgotModalOpen && (
        <div 
          className="auth-modal-overlay" 
          onClick={() => setForgotModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-modal-heading"
        >
          <div className="auth-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-top">
              <h3 id="forgot-modal-heading" className="auth-modal-title">
                RECOVER PILOT ACCESS CREDENTIALS
              </h3>
              <button 
                type="button" 
                onClick={() => setForgotModalOpen(false)} 
                className="auth-modal-close"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="auth-modal-scrollable">
              {forgotSubmitted ? (
                <div className="auth-forgot-success">
                  <CheckCircle2 size={32} color="#00E5FF" />
                  <h4>RECOVERY TRANSMISSION DISPATCHED</h4>
                  <p>
                    Quantum recovery codes have been routed to <strong>{forgotEmail}</strong>. Please verify your communications channel to re-establish pilot access.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="auth-form-content">
                  <p className="auth-modal-instructions">
                    Enter your registered flight academy email. Fleet Command will transmit an encrypted recovery bypass link.
                  </p>

                  <div className="auth-field">
                    <label htmlFor="forgot-email-input" className="auth-label label-cyan">
                      REGISTERED EMAIL
                    </label>
                    <div className="auth-input-container">
                      <Mail size={16} className="auth-icon-left" aria-hidden="true" />
                      <input
                        id="forgot-email-input"
                        type="email"
                        placeholder="pilot@voidhunter.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="auth-text-input"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="auth-action-btn btn-cyan-glow"
                    style={{ marginTop: '12px' }}
                  >
                    DISPATCH RECOVERY LINK
                  </button>
                </form>
              )}
            </div>

            <div className="auth-modal-bottom">
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="auth-modal-confirm-btn"
              >
                RETURN TO PILOT ACCESS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
