import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { GAME_NAME, GAME_TAGLINE } from '../config/gameConfig.js';
import { Mail, Lock, User, Eye, EyeOff, Shield, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AuthPage = ({ onBackToGame, onAuthSuccess }) => {
  const { login, register } = useAuth();

  // Active tab on mobile/desktop: 'login' or 'register'
  const [activeTab, setActiveTab] = useState('login');
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 960 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 960);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
  const [agreeTerms, setAgreeTerms] = useState(true);

  // UI State
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    const result = await login(loginEmail, loginPassword);
    setSubmitting(false);

    if (result.success) {
      setSuccessMsg('Authentication verified. Accessing Command Deck...');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
      }, 300);
    } else {
      setErrorMsg(result.message || 'Invalid email or password.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      setErrorMsg('All fields are required to register pilot clearance.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('You must agree to the Terms of Space Fleet Command.');
      return;
    }

    setSubmitting(true);
    const result = await register(regName, regEmail, regPassword);
    setSubmitting(false);

    if (result.success) {
      setSuccessMsg('Pilot commission granted! Accessing Command Deck...');
      setTimeout(() => {
        if (onAuthSuccess) onAuthSuccess();
      }, 300);
    } else {
      setErrorMsg(result.message || 'Registration failed.');
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Top Header Navigation */}
      <header style={styles.header}>
        <div style={styles.logoGroup}>
          <img src="/favicon.svg" alt="Void Hunter Crest" style={styles.logoImg} />
          <div>
            <h1 className="font-heading" style={styles.brandTitle}>
              {GAME_NAME}
            </h1>
            <p className="font-ui" style={styles.brandTagline}>
              {GAME_TAGLINE}
            </p>
          </div>
        </div>

        <button 
          onClick={onBackToGame} 
          className="btn btn-outline"
          style={styles.backButton}
        >
          <ArrowLeft size={16} /> BACK TO GAME
        </button>
      </header>

      {/* Alert Notifications */}
      {errorMsg && (
        <div style={styles.alertError} className="glass-panel">
          <AlertCircle size={18} color="#EF4444" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div style={styles.alertSuccess} className="glass-panel">
          <CheckCircle2 size={18} color="#10B981" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Mobile / Screen Tab Switcher */}
      <div 
        style={{
          display: isMobile ? 'flex' : 'none',
          gap: '10px',
          maxWidth: '480px',
          width: '100%',
          margin: '0 auto 20px auto'
        }}
      >
        <button 
          type="button"
          style={{
            ...styles.tabBtn,
            padding: '12px 14px',
            fontSize: '0.84rem',
            fontWeight: 'bold',
            ...(activeTab === 'login' ? styles.activeTabBtn : {})
          }}
          onClick={() => {
            setErrorMsg('');
            setActiveTab('login');
          }}
        >
          LOGIN
        </button>
        <button 
          type="button"
          style={{
            ...styles.tabBtn,
            padding: '12px 14px',
            fontSize: '0.84rem',
            fontWeight: 'bold',
            ...(activeTab === 'register' ? styles.activeTabBtn : {})
          }}
          onClick={() => {
            setErrorMsg('');
            setActiveTab('register');
          }}
        >
          CREATE ACCOUNT (SIGN UP)
        </button>
      </div>

      {/* Main Dual Card Grid */}
      <main style={styles.mainGrid}>
        {/* ================= LEFT CARD: LOGIN ================= */}
        <section 
          style={{
            ...styles.authCard,
            display: !isMobile || activeTab === 'login' ? 'flex' : 'none'
          }} 
          className="glass-panel"
        >
          <div style={styles.cardHeader}>
            <span className="badge badge-cyan">SIGN IN ACCOUNT</span>
            <h2 className="font-heading" style={styles.cardTitle}>
              LOGIN TO <span style={{ color: 'var(--secondary-cyan)' }}>{GAME_NAME}</span>
            </h2>
            <p style={styles.cardSubtitle}>Continue your journey. The galaxy awaits.</p>
          </div>

          <form onSubmit={handleLoginSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="pilot@voidhunter.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.inputIcon} />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={styles.input}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  style={styles.eyeBtn}
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={styles.rememberRow}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.checkbox}
                />
                Remember me
              </label>
              <a href="#forgot" style={styles.forgotLink}>Forgot password?</a>
            </div>

            <button 
              type="submit" 
              className="btn btn-cyan" 
              disabled={submitting}
              style={styles.submitBtn}
            >
              {submitting ? 'AUTHENTICATING...' : 'LOGIN'}
            </button>
          </form>

          {/* Social Logins */}
          <div style={styles.divider}>
            <span style={styles.dividerText}>OR CONTINUE WITH</span>
          </div>
          <div style={styles.socialRow}>
            <button style={styles.socialBtn} title="Google Pilot Login">G</button>
            <button style={styles.socialBtn} title="GitHub Pilot Login">GH</button>
            <button style={styles.socialBtn} title="Discord Pilot Login">DC</button>
          </div>

          {/* Quick Switch to Sign Up on Mobile */}
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setActiveTab('register');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--secondary-cyan)',
                fontWeight: '700',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Sign Up / Create Account
            </button>
          </div>
        </section>

        {/* ================= RIGHT CARD: REGISTER ================= */}
        <section 
          style={{
            ...styles.authCard,
            display: !isMobile || activeTab === 'register' ? 'flex' : 'none'
          }} 
          className="glass-panel"
        >
          <div style={styles.cardHeader}>
            <span className="badge badge-purple">JOIN THE FLEET</span>
            <h2 className="font-heading" style={styles.cardTitle}>
              CREATE <span style={{ color: '#C084FC' }}>ACCOUNT</span>
            </h2>
            <p style={styles.cardSubtitle}>Join the mission. Become a legend.</p>
          </div>

          <form onSubmit={handleRegisterSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Callsign / Full Name</label>
              <div style={styles.inputWrapper}>
                <User size={18} style={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Kiran Commander"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} style={styles.inputIcon} />
                <input
                  type="email"
                  placeholder="commander@spacecommand.net"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrapper}>
                <Lock size={18} style={styles.inputIcon} />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={styles.input}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  style={styles.eyeBtn}
                >
                  {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.inputWrapper}>
                <Shield size={18} style={styles.inputIcon} />
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.rememberRow}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={styles.checkbox}
                />
                I agree to the Terms and Privacy Policy
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-purple" 
              disabled={submitting}
              style={styles.submitBtn}
            >
              {submitting ? 'COMMISSIONING PILOT...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          {/* Social Logins */}
          <div style={styles.divider}>
            <span style={styles.dividerText}>OR SIGN UP WITH</span>
          </div>
          <div style={styles.socialRow}>
            <button style={styles.socialBtn} title="Google Pilot Signup">G</button>
            <button style={styles.socialBtn} title="GitHub Pilot Signup">GH</button>
            <button style={styles.socialBtn} title="Discord Pilot Signup">DC</button>
          </div>

          {/* Quick Switch to Login */}
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setErrorMsg('');
                setActiveTab('login');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--secondary-cyan)',
                fontWeight: '700',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Login to Command Deck
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: 'clamp(14px, 3vw, 24px) clamp(12px, 3vw, 32px)',
    background: 'radial-gradient(ellipse at center, rgba(124, 58, 237, 0.12) 0%, rgba(10, 15, 44, 0.98) 80%)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  logoImg: {
    width: '44px',
    height: '44px',
    filter: 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.5))'
  },
  brandTitle: {
    fontSize: '1.4rem',
    fontWeight: '900',
    letterSpacing: '0.08em',
    background: 'linear-gradient(90deg, #FFFFFF 0%, #00E5FF 60%, #FF2DFF 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1.1
  },
  brandTagline: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase'
  },
  backButton: {
    fontSize: '0.75rem',
    padding: '8px 16px'
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 18px',
    marginBottom: '20px',
    background: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
    color: '#FCA5A5',
    fontSize: '0.875rem'
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 18px',
    marginBottom: '20px',
    background: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
    color: '#6EE7B7',
    fontSize: '0.875rem'
  },
  mobileTabs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px'
  },
  tabBtn: {
    flex: 1,
    padding: '10px',
    background: 'rgba(10, 15, 44, 0.6)',
    border: '1px solid var(--border-glass)',
    color: 'var(--text-muted)',
    borderRadius: '6px',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.8rem',
    cursor: 'pointer'
  },
  activeTabBtn: {
    background: 'rgba(0, 229, 255, 0.15)',
    borderColor: 'var(--secondary-cyan)',
    color: 'var(--secondary-cyan)'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    maxWidth: '1080px',
    margin: 'auto',
    width: '100%'
  },
  authCard: {
    flexDirection: 'column',
    padding: 'clamp(24px, 4vw, 36px) clamp(16px, 4vw, 32px)',
    borderRadius: '16px',
    border: '1px solid rgba(0, 229, 255, 0.22)',
    boxShadow: '0 0 35px rgba(0, 0, 0, 0.6)'
  },
  cardHeader: {
    marginBottom: '24px'
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    marginTop: '10px',
    marginBottom: '4px'
  },
  cardSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.75rem',
    fontFamily: 'var(--font-heading)',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)'
  },
  input: {
    width: '100%',
    padding: '11px 40px',
    background: 'rgba(6, 9, 25, 0.85)',
    border: '1px solid rgba(124, 58, 237, 0.3)',
    borderRadius: '6px',
    color: 'var(--text-light)',
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer'
  },
  rememberRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginTop: '2px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  checkbox: {
    accentColor: 'var(--secondary-cyan)',
    cursor: 'pointer'
  },
  forgotLink: {
    color: 'var(--secondary-cyan)',
    textDecoration: 'none'
  },
  submitBtn: {
    width: '100%',
    marginTop: '10px',
    padding: '12px'
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    margin: '24px 0 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  dividerText: {
    position: 'relative',
    top: '9px',
    background: '#0B112E',
    padding: '0 12px',
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-heading)'
  },
  socialRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '16px'
  },
  socialBtn: {
    width: '42px',
    height: '42px',
    borderRadius: '8px',
    background: 'rgba(10, 15, 44, 0.8)',
    border: '1px solid var(--border-glass)',
    color: 'var(--text-light)',
    fontWeight: '700',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

export default AuthPage;
