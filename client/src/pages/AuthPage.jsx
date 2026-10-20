import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import './AuthPage.css';
import { 
  Mail, Lock, User, Eye, EyeOff, Shield, ArrowLeft, 
  AlertCircle, CheckCircle2, X, UserPlus, LogIn, Check
} from 'lucide-react';

// Brand SVG Delta Logo
const DeltaLogo = () => (
  <svg viewBox="0 0 36 36" width="34" height="34" fill="none" className="auth-delta-icon" aria-hidden="true">
    <polygon points="18,3 34,32 23,32 18,20 13,32 2,32" fill="url(#authDeltaGrad)" />
    <polygon points="18,9 29,29 23,29 18,19 13,29 7,29" fill="#04081E" />
    <defs>
      <linearGradient id="authDeltaGrad" x1="2" y1="3" x2="34" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#00E5FF" />
        <stop offset="100%" stopColor="#0088FF" />
      </linearGradient>
    </defs>
  </svg>
);

// Subtle Non-Interactive Decorative Ship Schematics
const ShipSchematicWatermark = ({ color = '#00E5FF' }) => (
  <svg viewBox="0 0 160 160" width="140" height="140" className="auth-card-schematic" aria-hidden="true">
    <path 
      d="M80 12 L96 52 L148 90 L110 102 L116 142 L80 120 L44 142 L50 102 L12 90 L64 52 Z" 
      fill="none" 
      stroke={color} 
      strokeWidth="1.2" 
      strokeDasharray="4 3"
      opacity="0.22"
    />
    <circle cx="80" cy="80" r="42" fill="none" stroke={color} strokeWidth="0.8" strokeDasharray="3 4" opacity="0.18" />
    <line x1="80" y1="20" x2="80" y2="140" stroke={color} strokeWidth="0.8" opacity="0.15" />
    <line x1="20" y1="80" x2="140" y2="80" stroke={color} strokeWidth="0.8" opacity="0.15" />
  </svg>
);

export const AuthPage = ({ onBackToGame, onAuthSuccess }) => {
  const { login, register } = useAuth();
  const canvasRef = useRef(null);

  // Active tab on mobile/tablet: 'login' or 'register'
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
    document.title = 'Void Hunter — Space Combat Beyond Limits | Pilot Authentication';
  }, []);

  // Subtle floating particles canvas (respects reduced motion)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Initialize 55 subtle ambient space particles
    const particleCount = 55;
    const particles = [];
    const colors = ['#EAF1FF', '#00E5FF', '#8B5CF6', '#38BDF8'];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.4 + 0.3,
        alpha: Math.random() * 0.6 + 0.15,
        twinkleSpeed: (Math.random() * 0.01 + 0.003) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: prefersReducedMotion ? 0 : (Math.random() * 0.12 + 0.03),
        vx: prefersReducedMotion ? 0 : (Math.random() * 0.08 - 0.04)
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!prefersReducedMotion) {
          p.alpha += p.twinkleSpeed;
          if (p.alpha > 0.75 || p.alpha < 0.15) {
            p.twinkleSpeed = -p.twinkleSpeed;
          }
          p.y -= p.vy;
          p.x += p.vx;
          if (p.y < 0) {
            p.y = height;
            p.x = Math.random() * width;
          }
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.1, Math.min(0.8, p.alpha));
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
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

  // Accurate Password Strength Calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1;

    const levels = [
      { score: 1, label: 'Weak', color: '#EF4444' },
      { score: 2, label: 'Fair', color: '#F59E0B' },
      { score: 3, label: 'Good', color: '#00E5FF' },
      { score: 4, label: 'Strong', color: '#20D6A0' }
    ];
    return levels[Math.min(score - 1, 3)] || levels[0];
  };

  const pwdStrength = getPasswordStrength(regPassword);
  const isConfirmFilled = regConfirmPassword.length > 0;
  const isPasswordMismatch = isConfirmFilled && regPassword !== regConfirmPassword;
  const isPasswordMatch = isConfirmFilled && regPassword === regConfirmPassword && regPassword.length >= 6;

  // UI State: Alerts & Loading
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modals: Terms & Forgot Password
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

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
      setSuccessMsg('Authentication verified. Connecting to Command Deck...');
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
      setErrorMsg('Passwords do not match. Please verify your confirm password.');
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
    <div className="auth-viewport" id="auth-page-root">
      {/* Cinematic Orbital Command Station Background */}
      <div className="auth-station-backdrop" aria-hidden="true">
        <div className="auth-station-image" />
        <canvas ref={canvasRef} className="auth-particles-canvas" />
        <div className="auth-station-lighting" />
        <div className="auth-station-vignette" />
      </div>

      {/* Top Navigation Bar */}
      <header className="auth-topbar">
        <div 
          className="auth-brand-block" 
          onClick={onBackToGame} 
          role="button" 
          tabIndex={0}
          aria-label="Void Hunter Home"
          onKeyDown={(e) => { if (e.key === 'Enter') onBackToGame(); }}
        >
          <DeltaLogo />
          <div className="auth-brand-info">
            <span className="auth-brand-title">VOID HUNTER</span>
            <span className="auth-brand-subtitle">SPACE COMBAT BEYOND LIMITS</span>
          </div>
        </div>

        <button 
          type="button" 
          onClick={onBackToGame} 
          className="auth-back-btn"
          id="auth-back-button"
        >
          <ArrowLeft size={15} />
          <span>BACK TO GAME</span>
        </button>
      </header>

      {/* Dynamic Floating Toast Alerts */}
      {errorMsg && (
        <div className="auth-toast-alert toast-error" role="alert">
          <AlertCircle size={15} />
          <span>{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg('')} className="toast-dismiss-btn" aria-label="Dismiss alert">
            <X size={14} />
          </button>
        </div>
      )}
      {successMsg && (
        <div className="auth-toast-alert toast-success" role="status">
          <CheckCircle2 size={15} />
          <span>{successMsg}</span>
          <button type="button" onClick={() => setSuccessMsg('')} className="toast-dismiss-btn" aria-label="Dismiss alert">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Responsive Mobile / Tablet Tab Switcher */}
      {isMobile && (
        <div className="auth-tab-switch">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`auth-tab-btn ${activeTab === 'login' ? 'tab-active-cyan' : ''}`}
          >
            PILOT ACCESS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`auth-tab-btn ${activeTab === 'register' ? 'tab-active-purple' : ''}`}
          >
            JOIN THE FLEET
          </button>
        </div>
      )}

      {/* Centered Dual Panel Composition */}
      <main className={`auth-dual-panels ${isMobile ? (activeTab === 'login' ? 'view-login-tab' : 'view-register-tab') : ''}`}>
        
        {/* ================= LEFT PANEL: LOGIN (CYAN ACCENTS) ================= */}
        <section className="auth-panel panel-cyan" aria-label="Pilot Login Panel">
          {/* Subtle Corner HUD Accents */}
          <span className="hud-corner hud-tl" aria-hidden="true" />
          <span className="hud-corner hud-tr" aria-hidden="true" />
          <span className="hud-corner hud-bl" aria-hidden="true" />
          <span className="hud-corner hud-br" aria-hidden="true" />

          {/* Decorative Ship Schematic Watermark */}
          <ShipSchematicWatermark color="#00E5FF" />

          <div className="auth-panel-body">
            {/* Eyebrow */}
            <div className="auth-eyebrow eyebrow-cyan">
              <span className="eyebrow-prefix">//</span> PILOT ACCESS
            </div>

            {/* Heading & Description */}
            <h2 className="auth-heading">
              Welcome Back, <span className="text-cyan">Pilot.</span>
            </h2>
            <p className="auth-description">
              Your next mission awaits. Sign in to continue your journey across the galaxy.
            </p>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="auth-form-grid" noValidate>
              {/* Email Address */}
              <div className="auth-field-row">
                <label htmlFor="login-email-field" className="auth-field-label label-cyan">
                  EMAIL ADDRESS
                </label>
                <div className="auth-input-container">
                  <Mail size={16} className="auth-field-icon" aria-hidden="true" />
                  <input
                    id="login-email-field"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="pilot@voidhunter.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="auth-input-element"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field-row">
                <label htmlFor="login-password-field" className="auth-field-label label-cyan">
                  PASSWORD
                </label>
                <div className="auth-input-container">
                  <Lock size={16} className="auth-field-icon" aria-hidden="true" />
                  <input
                    id="login-password-field"
                    name="password"
                    type={showLoginPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter access code"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="auth-input-element"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="auth-eye-btn"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="auth-meta-row">
                <label htmlFor="login-remember-box" className="auth-check-label">
                  <input
                    id="login-remember-box"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="auth-checkbox-box check-cyan"
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
                  className="auth-text-link link-cyan"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Cyan Action Button */}
              <button
                type="submit"
                disabled={submitting}
                className="auth-submit-btn btn-cyan"
                id="auth-sign-in-submit"
              >
                <LogIn size={16} className="auth-btn-icon" />
                <span>{submitting ? 'AUTHENTICATING...' : 'SIGN IN'}</span>
              </button>
            </form>

            {/* Secure Transmission Status Detail */}
            <div className="auth-security-badge badge-cyan">
              <span className="security-pulse-dot" />
              <span>SECURE ENCRYPTED TRANSMISSION</span>
            </div>

            {/* Panel Footer Navigation */}
            <div className="auth-panel-footer">
              <span>Don't have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setActiveTab('register');
                  const regInput = document.getElementById('reg-name-field');
                  if (regInput) regInput.focus();
                }}
                className="auth-switch-link switch-cyan"
              >
                Enlist / Create Profile
              </button>
            </div>
          </div>
        </section>

        {/* ================= RIGHT PANEL: SIGNUP (PURPLE ACCENTS) ================= */}
        <section className="auth-panel panel-purple" aria-label="Pilot Signup Panel">
          {/* Subtle Corner HUD Accents */}
          <span className="hud-corner hud-tl" aria-hidden="true" />
          <span className="hud-corner hud-tr" aria-hidden="true" />
          <span className="hud-corner hud-bl" aria-hidden="true" />
          <span className="hud-corner hud-br" aria-hidden="true" />

          {/* Decorative Ship Schematic Watermark */}
          <ShipSchematicWatermark color="#8B5CF6" />

          <div className="auth-panel-body">
            {/* Eyebrow */}
            <div className="auth-eyebrow eyebrow-purple">
              <span className="eyebrow-prefix">//</span> JOIN THE FLEET
            </div>

            {/* Heading & Description */}
            <h2 className="auth-heading">
              Create Your <span className="text-purple">Pilot Profile.</span>
            </h2>
            <p className="auth-description">
              Enlist today. Make your mark across the galaxy.
            </p>

            {/* Registration Form */}
            <form onSubmit={handleRegisterSubmit} className="auth-form-grid" noValidate>
              {/* Callsign / Pilot Name */}
              <div className="auth-field-row">
                <label htmlFor="reg-name-field" className="auth-field-label label-purple">
                  CALLSIGN / PILOT NAME
                </label>
                <div className="auth-input-container">
                  <User size={16} className="auth-field-icon" aria-hidden="true" />
                  <input
                    id="reg-name-field"
                    name="name"
                    type="text"
                    autoComplete="nickname"
                    placeholder="e.g. Commander Vega"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="auth-input-element"
                    maxLength={50}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="auth-field-row">
                <label htmlFor="reg-email-field" className="auth-field-label label-purple">
                  EMAIL ADDRESS
                </label>
                <div className="auth-input-container">
                  <Mail size={16} className="auth-field-icon" aria-hidden="true" />
                  <input
                    id="reg-email-field"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="pilot@voidhunter.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="auth-input-element"
                    required
                  />
                </div>
              </div>

              {/* Password with Strength Indicator */}
              <div className="auth-field-row">
                <div className="auth-label-split">
                  <label htmlFor="reg-password-field" className="auth-field-label label-purple">
                    PASSWORD
                  </label>
                  {pwdStrength.label && (
                    <span className="auth-strength-text" style={{ color: pwdStrength.color }}>
                      {pwdStrength.label}
                    </span>
                  )}
                </div>
                <div className="auth-input-container">
                  <Lock size={16} className="auth-field-icon" aria-hidden="true" />
                  <input
                    id="reg-password-field"
                    name="password"
                    type={showRegPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Minimum 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="auth-input-element"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="auth-eye-btn"
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Meter Bars */}
                {regPassword.length > 0 && (
                  <div className="auth-strength-meter" aria-hidden="true">
                    {[1, 2, 3, 4].map((bar) => (
                      <span 
                        key={bar} 
                        className="strength-bar"
                        style={{
                          backgroundColor: bar <= pwdStrength.score ? pwdStrength.color : 'rgba(150, 166, 200, 0.2)'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="auth-field-row">
                <div className="auth-label-split">
                  <label htmlFor="reg-confirm-field" className="auth-field-label label-purple">
                    CONFIRM PASSWORD
                  </label>
                  {isPasswordMismatch && (
                    <span className="auth-mismatch-text text-error">Passwords do not match</span>
                  )}
                  {isPasswordMatch && (
                    <span className="auth-mismatch-text text-success">
                      <Check size={11} inline="true" /> Match
                    </span>
                  )}
                </div>
                <div className={`auth-input-container ${isPasswordMismatch ? 'input-error-state' : ''}`}>
                  <Shield size={16} className="auth-field-icon" aria-hidden="true" />
                  <input
                    id="reg-confirm-field"
                    name="confirmPassword"
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="auth-input-element"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="auth-eye-btn"
                    aria-label={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Terms of Service & Privacy Policy Agreement */}
              <div className="auth-meta-row">
                <label htmlFor="reg-terms-box" className="auth-check-label">
                  <input
                    id="reg-terms-box"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="auth-checkbox-box check-purple"
                    required
                  />
                  <span>
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setTermsModalOpen(true)}
                      className="auth-doc-link link-purple"
                    >
                      Terms of Service
                    </button>
                    {' & '}
                    <button
                      type="button"
                      onClick={() => setTermsModalOpen(true)}
                      className="auth-doc-link link-purple"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </label>
              </div>

              {/* Primary Purple Action Button */}
              <button
                type="submit"
                disabled={submitting}
                className="auth-submit-btn btn-purple"
                id="auth-register-submit"
              >
                <UserPlus size={16} className="auth-btn-icon" />
                <span>{submitting ? 'COMMISSIONING PILOT...' : 'CREATE ACCOUNT'}</span>
              </button>
            </form>

            {/* Secure Transmission Status Detail */}
            <div className="auth-security-badge badge-purple">
              <span className="security-pulse-dot dot-purple" />
              <span>FLEET COMMAND ENLISTMENT ACTIVE</span>
            </div>

            {/* Panel Footer Navigation */}
            <div className="auth-panel-footer">
              <span>Already have an account? </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setActiveTab('login');
                  const loginInput = document.getElementById('login-email-field');
                  if (loginInput) loginInput.focus();
                }}
                className="auth-switch-link switch-purple"
              >
                Sign in to Command Deck
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ================= TERMS & PRIVACY POLICY MODAL ================= */}
      {termsModalOpen && (
        <div 
          className="auth-modal-backdrop" 
          onClick={() => setTermsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-modal-heading"
        >
          <div className="auth-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-header">
              <h3 id="terms-modal-heading" className="auth-modal-title">
                SPACE FLEET COMMAND PROTOCOLS
              </h3>
              <button 
                type="button" 
                onClick={() => setTermsModalOpen(false)} 
                className="auth-modal-close-btn"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="auth-modal-content">
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

            <div className="auth-modal-footer">
              <button
                type="button"
                onClick={() => setTermsModalOpen(false)}
                className="auth-modal-action-btn"
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
          className="auth-modal-backdrop" 
          onClick={() => setForgotModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-modal-heading"
        >
          <div className="auth-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-header">
              <h3 id="forgot-modal-heading" className="auth-modal-title">
                RECOVER PILOT ACCESS CREDENTIALS
              </h3>
              <button 
                type="button" 
                onClick={() => setForgotModalOpen(false)} 
                className="auth-modal-close-btn"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div className="auth-modal-content">
              {forgotSubmitted ? (
                <div className="auth-modal-success-state">
                  <CheckCircle2 size={36} color="#00E5FF" />
                  <h4>RECOVERY TRANSMISSION DISPATCHED</h4>
                  <p>
                    Quantum recovery codes have been routed to <strong>{forgotEmail}</strong>. Please verify your communications channel to re-establish pilot access.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="auth-form-grid">
                  <p className="auth-modal-lead">
                    Enter your registered flight academy email. Fleet Command will transmit an encrypted recovery link.
                  </p>

                  <div className="auth-field-row">
                    <label htmlFor="forgot-email-field" className="auth-field-label label-cyan">
                      REGISTERED EMAIL
                    </label>
                    <div className="auth-input-container">
                      <Mail size={16} className="auth-field-icon" aria-hidden="true" />
                      <input
                        id="forgot-email-field"
                        type="email"
                        placeholder="pilot@voidhunter.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="auth-input-element"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="auth-submit-btn btn-cyan"
                    style={{ marginTop: '10px' }}
                  >
                    DISPATCH RECOVERY LINK
                  </button>
                </form>
              )}
            </div>

            <div className="auth-modal-footer">
              <button
                type="button"
                onClick={() => setForgotModalOpen(false)}
                className="auth-modal-action-btn"
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
