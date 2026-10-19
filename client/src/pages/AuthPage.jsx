import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { GAME_NAME, GAME_TAGLINE } from '../config/gameConfig.js';
import soundManager from '../game/managers/SoundManager.js';
import './AuthPage.css';
import { 
  Mail, Lock, User, Eye, EyeOff, Shield, ArrowLeft, 
  AlertCircle, CheckCircle2, KeyRound, X, ExternalLink, Zap
} from 'lucide-react';

export const AuthPage = ({ onBackToGame, onAuthSuccess }) => {
  const { login, register } = useAuth();

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
    document.title = 'Void Hunter — Pilot Authentication & Fleet Enlistment';
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
      }, 350);
    } else {
      setErrorMsg(result.message || 'Invalid pilot credentials. Please verify email and password.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim() || !regEmail.trim() || !regPassword || !regConfirmPassword) {
      setErrorMsg('All fields are required to commission your pilot profile.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Password confirmation does not match.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters in length.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('You must accept the Fleet Command Terms of Service & Privacy Policy.');
      return;
    }

    try { soundManager.playLaser(); } catch {}
    setSubmitting(true);
    const result = await register(regName.trim(), regEmail.trim(), regPassword);
    setSubmitting(false);

    if (result.success) {
      setSuccessMsg('Pilot commission granted! Accessing Command Deck...');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
      }, 350);
    } else {
      setErrorMsg(result.message || 'Pilot registration failed. This email may already be in use.');
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    try { soundManager.playLaser(); } catch {}
    setForgotSubmitted(true);
  };

  // Inline Validation Helpers for Register Form
  const isPasswordMismatch = regConfirmPassword.length > 0 && regPassword !== regConfirmPassword;
  const isPasswordValid = regPassword.length >= 6;

  return (
    <div className="auth-root">
      {/* Cinematic Space Backdrop */}
      <div className="auth-backdrop" aria-hidden="true" />
      <div className="auth-stars" aria-hidden="true" />
      <div className="auth-nebula-glow" aria-hidden="true" />

      <div className="auth-page-container">
        {/* ================= TOP HEADER BAR ================= */}
        <header className="auth-topbar">
          <div 
            className="auth-brand" 
            onClick={() => {
              try { soundManager.playLaser(); } catch {}
              if (onBackToGame) onBackToGame();
            }}
            title="Return to Main Menu"
          >
            <img 
              src="/favicon.svg" 
              alt="Void Hunter Emblem" 
              className="auth-logo-img" 
            />
            <div className="auth-brand-text">
              <span className="auth-brand-title">{GAME_NAME}</span>
              <span className="auth-brand-tagline">{GAME_TAGLINE}</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => {
              try { soundManager.playLaser(); } catch {}
              if (onBackToGame) onBackToGame();
            }}
            className="auth-back-btn"
            id="auth-back-to-game-btn"
            aria-label="Return to game"
          >
            <ArrowLeft size={15} />
            <span>BACK TO GAME</span>
          </button>
        </header>

        {/* ================= ALERTS ================= */}
        <div className="auth-alerts-container" aria-live="polite">
          {errorMsg && (
            <div className="auth-alert-error" role="alert">
              <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="auth-alert-success" role="status">
              <CheckCircle2 size={18} color="#20D6A0" style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* ================= MOBILE TAB SWITCHER ================= */}
        <div className="auth-mobile-switch" role="tablist" aria-label="Sign in or register">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'login'}
            className={`auth-mobile-tab-btn ${activeTab === 'login' ? 'active-login' : ''}`}
            onClick={() => {
              setErrorMsg('');
              setActiveTab('login');
            }}
          >
            SIGN IN
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'register'}
            className={`auth-mobile-tab-btn ${activeTab === 'register' ? 'active-register' : ''}`}
            onClick={() => {
              setErrorMsg('');
              setActiveTab('register');
            }}
          >
            JOIN THE FLEET
          </button>
        </div>

        {/* ================= MAIN DUAL CARD GRID ================= */}
        <main className={`auth-grid ${isMobile ? (activeTab === 'login' ? 'show-login' : 'show-register') : ''}`}>
          {/* ================= LEFT PANEL: LOGIN ================= */}
          <section className="auth-card auth-card-login" aria-label="Pilot Sign In Form">
            <header className="auth-card-header">
              <span className="auth-eyebrow-badge auth-eyebrow-cyan">
                <Zap size={11} color="#00E5FF" aria-hidden="true" />
                PILOT ACCESS
              </span>
              <h2 className="auth-card-heading">
                WELCOME BACK, PILOT
              </h2>
              <p className="auth-card-desc">
                Your next mission awaits.
              </p>
            </header>

            <form onSubmit={handleLoginSubmit} className="auth-form" noValidate>
              {/* Email Address */}
              <div className="auth-field-group">
                <label htmlFor="login-email" className="auth-field-label">
                  EMAIL ADDRESS
                </label>
                <div className="auth-input-wrapper">
                  <Mail size={16} className="auth-input-icon" aria-hidden="true" />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="pilot@voidhunter.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="auth-input"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field-group">
                <label htmlFor="login-password" className="auth-field-label">
                  PASSWORD
                </label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" aria-hidden="true" />
                  <input
                    id="login-password"
                    name="password"
                    type={showLoginPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter security access code"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="auth-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="auth-eye-btn"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    tabIndex={0}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="auth-controls-row">
                <label htmlFor="login-remember-me" className="auth-checkbox-label">
                  <input
                    id="login-remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="auth-checkbox"
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
                  className="auth-text-link"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={submitting}
                className="auth-btn-primary auth-btn-cyan"
                id="auth-sign-in-submit"
              >
                {submitting ? 'AUTHENTICATING...' : 'SIGN IN'}
              </button>
            </form>

            {/* Quick Switch Link on Mobile/Tablet */}
            <div className="auth-switch-prompt">
              <span>Don't have an account?</span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setActiveTab('register');
                }}
                className="auth-switch-link"
              >
                Enlist / Create Profile
              </button>
            </div>
          </section>

          {/* ================= RIGHT PANEL: REGISTRATION ================= */}
          <section className="auth-card auth-card-register" aria-label="Pilot Registration Form">
            <header className="auth-card-header">
              <span className="auth-eyebrow-badge auth-eyebrow-purple">
                <Shield size={11} color="#A78BFA" aria-hidden="true" />
                JOIN THE FLEET
              </span>
              <h2 className="auth-card-heading">
                CREATE YOUR PILOT PROFILE
              </h2>
              <p className="auth-card-desc">
                Enlist today. Make your mark across the galaxy.
              </p>
            </header>

            <form onSubmit={handleRegisterSubmit} className="auth-form" noValidate>
              {/* Callsign / Full Name */}
              <div className="auth-field-group">
                <label htmlFor="reg-name" className="auth-field-label">
                  CALLSIGN / PILOT NAME
                </label>
                <div className="auth-input-wrapper">
                  <User size={16} className="auth-input-icon" aria-hidden="true" />
                  <input
                    id="reg-name"
                    name="name"
                    type="text"
                    autoComplete="nickname"
                    placeholder="e.g. Commander Vega"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="auth-input"
                    maxLength={50}
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="auth-field-group">
                <label htmlFor="reg-email" className="auth-field-label">
                  EMAIL ADDRESS
                </label>
                <div className="auth-input-wrapper">
                  <Mail size={16} className="auth-input-icon" aria-hidden="true" />
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="pilot@voidhunter.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="auth-input"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field-group">
                <label htmlFor="reg-password" className="auth-field-label">
                  <span>PASSWORD</span>
                  {regPassword.length > 0 && (
                    <span style={{ fontSize: '0.66rem', color: isPasswordValid ? '#20D6A0' : '#EF4444' }}>
                      {isPasswordValid ? 'Valid Length' : 'Min 6 chars'}
                    </span>
                  )}
                </label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" aria-hidden="true" />
                  <input
                    id="reg-password"
                    name="password"
                    type={showRegPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Minimum 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="auth-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="auth-eye-btn"
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                    tabIndex={0}
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="auth-field-group">
                <label htmlFor="reg-confirm-password" className="auth-field-label">
                  <span>CONFIRM PASSWORD</span>
                  {isPasswordMismatch && (
                    <span style={{ fontSize: '0.66rem', color: '#EF4444' }}>
                      Mismatch
                    </span>
                  )}
                </label>
                <div className="auth-input-wrapper">
                  <Shield size={16} className="auth-input-icon" aria-hidden="true" />
                  <input
                    id="reg-confirm-password"
                    name="confirmPassword"
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="auth-input"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="auth-eye-btn"
                    aria-label={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                    tabIndex={0}
                  >
                    {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Terms and Privacy Policy Checkbox */}
              <div className="auth-controls-row">
                <label htmlFor="reg-agree-terms" className="auth-checkbox-label">
                  <input
                    id="reg-agree-terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="auth-checkbox"
                    required
                  />
                  <span>
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => setTermsModalOpen(true)}
                      className="auth-text-link"
                      style={{ color: '#A78BFA' }}
                    >
                      Terms of Service
                    </button>
                    {' & '}
                    <button
                      type="button"
                      onClick={() => setTermsModalOpen(true)}
                      className="auth-text-link"
                      style={{ color: '#A78BFA' }}
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
                className="auth-btn-primary auth-btn-purple"
                id="auth-register-submit"
              >
                {submitting ? 'COMMISSIONING PILOT...' : 'CREATE ACCOUNT'}
              </button>
            </form>

            {/* Quick Switch Link on Mobile/Tablet */}
            <div className="auth-switch-prompt">
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setActiveTab('login');
                }}
                className="auth-switch-link"
              >
                Sign in to Command Deck
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* ================= TERMS & PRIVACY MODAL ================= */}
      {termsModalOpen && (
        <div 
          className="auth-modal-backdrop" 
          onClick={() => setTermsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="terms-modal-title"
        >
          <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-header">
              <h3 id="terms-modal-title" className="auth-modal-title">
                SPACE FLEET COMMAND PROTOCOLS
              </h3>
              <button 
                type="button" 
                onClick={() => setTermsModalOpen(false)} 
                className="auth-modal-close-btn"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="auth-modal-body">
              <h4>1. FAIR PLAY & COMBAT INTEGRITY</h4>
              <p>
                All flight combat runs, telemetry, weapon heat, and score submissions are validated by the authoritative Void Hunter server. Automated speedhacks, client tampering, or injection tools will result in pilot clearance revocation and score disqualification.
              </p>

              <h4>2. SECURE ECONOMY & CURRENCY LEDGER</h4>
              <p>
                Credits, energy cores, and campaign stars are tracked via double-entry ledger verification. Balance state is stored in your personal account and cannot be transferred or extracted outside fleet command.
              </p>

              <h4>3. PILOT DATA PRIVACY</h4>
              <p>
                Account passwords are encrypted with bcrypt salt rounds prior to persistence. Your combat callsign and high scores are displayed on the public Intergalactic Hall of Fame. Email addresses and security tokens are strictly kept confidential.
              </p>

              <h4>4. FLIGHT COMMUNICATIONS</h4>
              <p>
                Squadron callsigns must adhere to fleet civility standards. Impersonation of Star Fleet Command officers is prohibited.
              </p>
            </div>

            <div className="auth-modal-footer">
              <button
                type="button"
                onClick={() => setTermsModalOpen(false)}
                className="auth-btn-primary auth-btn-cyan"
                style={{ width: 'auto', padding: '10px 24px', margin: 0 }}
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
          aria-labelledby="forgot-modal-title"
        >
          <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-header">
              <h3 id="forgot-modal-title" className="auth-modal-title">
                PILOT CREDENTIAL RECOVERY
              </h3>
              <button 
                type="button" 
                onClick={() => setForgotModalOpen(false)} 
                className="auth-modal-close-btn"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="auth-modal-body">
              {forgotSubmitted ? (
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <CheckCircle2 size={44} color="#20D6A0" style={{ margin: '0 auto 12px auto' }} />
                  <h4 style={{ color: '#20D6A0', fontSize: '1.1rem' }}>RECOVERY TRANSMISSION LOGGED</h4>
                  <p style={{ color: '#EAF1FF', marginTop: '8px' }}>
                    A recovery request for <strong>{forgotEmail}</strong> has been registered with Space Fleet Command.
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#9AA9C7', marginTop: '12px' }}>
                    In this deployment, pilot passwords can be updated directly or via an administrator.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit}>
                  <p style={{ marginTop: 0 }}>
                    Enter your registered pilot email address to request a secure password recovery transmission.
                  </p>
                  <div className="auth-field-group" style={{ marginTop: '16px' }}>
                    <label htmlFor="forgot-email" className="auth-field-label">
                      REGISTERED EMAIL
                    </label>
                    <div className="auth-input-wrapper">
                      <Mail size={16} className="auth-input-icon" />
                      <input
                        id="forgot-email"
                        type="email"
                        placeholder="pilot@voidhunter.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="auth-input"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="auth-btn-primary auth-btn-cyan"
                    style={{ marginTop: '20px' }}
                  >
                    DISPATCH RECOVERY LINK
                  </button>
                </form>
              )}
            </div>

            {forgotSubmitted && (
              <div className="auth-modal-footer">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="auth-btn-primary auth-btn-cyan"
                  style={{ width: 'auto', padding: '10px 24px', margin: 0 }}
                >
                  RETURN TO SIGN IN
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
