import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Shield, CheckCircle2, AlertCircle, ArrowLeft, Loader2, Sparkles, Key } from 'lucide-react';
import soundManager from '../game/managers/SoundManager.js';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import './ResetPasswordPage.css';

export const ResetPasswordPage = ({ token, onNavigate, onAuthSuccess }) => {
  const { refreshProfile, setAuthenticatedSession } = useAuth();
  
  // Extract token from URL parameter if not passed as prop
  const activeToken = token || (() => {
    const parts = window.location.pathname.split('/reset-password/');
    if (parts[1]) return parts[1].split('?')[0].split('#')[0];
    const queryToken = new URLSearchParams(window.location.search).get('token');
    return queryToken || '';
  })();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [updatedUser, setUpdatedUser] = useState(null);

  // Password Strength Calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'NONE', color: '#64748B' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'WEAK', color: '#EF4444' };
    if (score === 2) return { score: 2, label: 'MODERATE', color: '#FBBF24' };
    if (score === 3 || score === 4) return { score: 3, label: 'STRONG', color: '#00E5FF' };
    return { score: 4, label: 'CYBER-SHIELDED', color: '#10B981' };
  };

  const pwdStrength = getPasswordStrength(password);
  const isConfirmFilled = confirmPassword.length > 0;
  const isPasswordMismatch = isConfirmFilled && password !== confirmPassword;
  const isPasswordMatch = isConfirmFilled && password === confirmPassword && password.length >= 6;

  // Execute safe transition to dashboard / admin deck
  const handleProceed = React.useCallback(() => {
    const target = updatedUser?.role?.toLowerCase() === 'admin' ? 'admin' : 'dashboard';
    if (onAuthSuccess) {
      onAuthSuccess(updatedUser);
    } else if (onNavigate) {
      onNavigate(target);
    } else {
      window.location.href = '/' + target;
    }
  }, [updatedUser, onAuthSuccess, onNavigate]);

  // Countdown timer on successful password reset
  useEffect(() => {
    let timer;
    if (successMsg && redirectCountdown > 0) {
      timer = setTimeout(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);
    } else if (successMsg && redirectCountdown === 0) {
      handleProceed();
    }
    return () => clearTimeout(timer);
  }, [successMsg, redirectCountdown, handleProceed]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!activeToken) {
      setErrorMsg('No recovery token detected. Please request a new recovery link from the login portal.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Security protocol requires a password of at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.auth.resetPassword(activeToken, password);

      if (response.success) {
        if (response.user) {
          setUpdatedUser(response.user);
        }
        if (response.token) {
          localStorage.setItem('void_hunter_token', response.token);
        }
        if (setAuthenticatedSession) {
          setAuthenticatedSession(response.token, response.user, response.profile);
        }
        soundManager.playPowerUp();
        setSuccessMsg(response.message || 'Security credentials successfully updated!');
        if (refreshProfile) {
          refreshProfile();
        }
      } else {
        soundManager.playLaser();
        setErrorMsg(response.message || 'Failed to update security credentials.');
      }
    } catch (err) {
      soundManager.playLaser();
      setErrorMsg(err.message || 'Transmission error communicating with quantum recovery server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-viewport" id="reset-password-page-root">
      {/* Background Ambience */}
      <div className="reset-backdrop-glow" aria-hidden="true" />
      <div className="reset-grid-pattern" aria-hidden="true" />

      {/* Top Header */}
      <header className="reset-top-nav">
        <button
          type="button"
          onClick={() => onNavigate ? onNavigate('auth') : (window.location.href = '/auth')}
          className="reset-back-btn"
          title="Return to Login Portal"
        >
          <ArrowLeft size={16} />
          <span>RETURN TO LOGIN</span>
        </button>

        <div className="reset-header-brand">
          <span className="reset-brand-tag">
            <Sparkles size={12} color="#00E5FF" />
            SECURITY PROTOCOL // FLEET DIRECTIVE
          </span>
          <span className="reset-brand-title">VOID HUNTER</span>
        </div>
      </header>

      {/* Main Form Center Card */}
      <main className="reset-main-container">
        <div className="cyber-panel reset-card">
          <span className="hud-corner hud-tl" aria-hidden="true" />
          <span className="hud-corner hud-tr" aria-hidden="true" />
          <span className="hud-corner hud-bl" aria-hidden="true" />
          <span className="hud-corner hud-br" aria-hidden="true" />

          {/* Card Header Bar */}
          <div className="reset-card-header">
            <div className="reset-header-icon-box">
              <Key size={22} color="#00E5FF" />
            </div>
            <div>
              <h1 className="reset-title">RECONFIGURE PILOT PASSWORD</h1>
              <p className="reset-subtitle">
                Establish new quantum security credentials to re-activate your starship command clearance.
              </p>
            </div>
          </div>

          {/* Token Status Badge */}
          <div className="token-status-bar">
            <span className="token-status-lbl">SECURITY CLEARANCE STATUS:</span>
            {activeToken ? (
              <span className="token-status-val token-valid">
                <CheckCircle2 size={12} />
                <span>TOKEN VERIFIED // ENCRYPTED</span>
              </span>
            ) : (
              <span className="token-status-val token-invalid">
                <AlertCircle size={12} />
                <span>MISSING RECOVERY TOKEN</span>
              </span>
            )}
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="reset-alert-banner alert-error" role="alert">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Banner & Redirection Card */}
          {successMsg ? (
            <div className="reset-success-block">
              <div className="reset-success-icon-wrap">
                <CheckCircle2 size={44} color="#20D6A0" />
              </div>
              <h2 className="reset-success-title">CREDENTIALS RECONFIGURED</h2>
              <p className="reset-success-text">
                Your pilot password has been updated in the galactic database. Quantum link restored.
              </p>
              <div className="reset-redirect-countdown">
                <span>WARPING TO COMMAND DECK IN <strong>{redirectCountdown}s</strong>...</span>
              </div>
              <button
                type="button"
                onClick={handleProceed}
                className="cyber-action-btn-primary btn-enter-command"
              >
                <span>ENTER COMMAND DECK NOW</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="reset-form-grid">
              
              {/* Field 1: New Password */}
              <div className="reset-field-row">
                <label htmlFor="reset-new-password" className="reset-field-label">
                  NEW PILOT PASSWORD
                </label>
                <div className="reset-input-container">
                  <Lock size={16} className="reset-field-icon" aria-hidden="true" />
                  <input
                    id="reset-new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="reset-input-element"
                    required
                    autoFocus
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="reset-eye-btn"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {password.length > 0 && (
                  <div className="pwd-strength-container">
                    <div className="pwd-strength-meter-row">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className="pwd-strength-bar"
                          style={{
                            background: step <= pwdStrength.score ? pwdStrength.color : 'rgba(255, 255, 255, 0.1)',
                            boxShadow: step <= pwdStrength.score ? `0 0 8px ${pwdStrength.color}` : 'none'
                          }}
                        />
                      ))}
                    </div>
                    <span className="pwd-strength-label" style={{ color: pwdStrength.color }}>
                      STRENGTH: {pwdStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Field 2: Confirm Password */}
              <div className="reset-field-row">
                <div className="reset-label-flex">
                  <label htmlFor="reset-confirm-password" className="reset-field-label">
                    CONFIRM NEW PASSWORD
                  </label>
                  {isPasswordMismatch && (
                    <span className="reset-match-text text-error">Passwords do not match</span>
                  )}
                  {isPasswordMatch && (
                    <span className="reset-match-text text-success">Passwords match</span>
                  )}
                </div>
                <div className={`reset-input-container ${isPasswordMismatch ? 'input-error-state' : ''}`}>
                  <Lock size={16} className="reset-field-icon" aria-hidden="true" />
                  <input
                    id="reset-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="reset-input-element"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="reset-eye-btn"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !activeToken || !password || isPasswordMismatch}
                className="cyber-action-btn-primary btn-commit-password"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="spin-icon" />
                    <span>ENCRYPTING & COMMITTING CREDENTIALS...</span>
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    <span>COMMIT NEW SECURITY PASSWORD</span>
                  </>
                )}
              </button>

            </form>
          )}

          {/* Footer Back Link */}
          {!successMsg && (
            <div className="reset-card-footer">
              <span className="reset-footer-hint">Remembered your credentials?</span>
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate('auth') : (window.location.href = '/auth')}
                className="btn-back-to-login"
              >
                SIGN IN AS PILOT
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;
