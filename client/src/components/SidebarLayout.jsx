import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import { GAME_NAME } from '../config/gameConfig.js';
import './SidebarLayout.css';
import { 
  LayoutDashboard, Compass, Shield, Wallet, 
  Award, BarChart3, Settings, Coins, Zap, 
  User, LogOut, Play, ShieldCheck, Menu, X, ChevronRight, Crosshair
} from 'lucide-react';

// Brand SVG Delta Logo
const DeltaLogo = () => (
  <svg viewBox="0 0 36 36" width="30" height="30" fill="none" className="sidebar-brand-logo" aria-hidden="true">
    <polygon points="18,3 34,32 23,32 18,20 13,32 2,32" fill="url(#sidebarDeltaGrad)" />
    <polygon points="18,9 29,29 23,29 18,19 13,29 7,29" fill="#04081E" />
    <defs>
      <linearGradient id="sidebarDeltaGrad" x1="2" y1="3" x2="34" y2="32" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#00E5FF" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
  </svg>
);

export const SidebarLayout = ({ 
  currentScreen, 
  onNavigate, 
  onOpenSettings, 
  children 
}) => {
  const { user, profile, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileScreen, setIsMobileScreen] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 1024 : false
  );

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 1024;
      setIsMobileScreen(isMobile);
      if (!isMobile) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Distinct groups: Flight Operations vs Pilot Profile
  const flightOpsItems = [
    { id: 'dashboard', label: isAuthenticated ? 'DASHBOARD' : 'MAIN MENU', icon: LayoutDashboard },
    { id: 'missions', label: 'MISSIONS', icon: Compass },
    { id: 'hangar', label: 'HANGAR', icon: Shield },
    { id: 'wallet', label: 'REWARDS', icon: Wallet },
  ];

  const pilotProfileItems = [
    { id: 'quests', label: 'ACHIEVEMENTS', icon: Award },
    { id: 'leaderboard', label: 'LEADERBOARD', icon: BarChart3 },
  ];

  if (user?.role?.toLowerCase() === 'admin') {
    pilotProfileItems.push({ id: 'admin', label: 'AUDIT LEDGER', icon: ShieldCheck });
  }

  pilotProfileItems.push({ id: 'settings', label: 'SETTINGS', icon: Settings, isAction: true });

  const handleNavClick = (item) => {
    try { soundManager.playLaser(); } catch {}
    if (isMobileScreen) {
      setIsMobileMenuOpen(false);
    }
    if (item.isAction) {
      if (item.id === 'settings' && onOpenSettings) onOpenSettings();
    } else {
      if (!isAuthenticated && item.id === 'dashboard') {
        if (onNavigate) onNavigate('landing');
      } else {
        const authRequired = ['wallet', 'quests', 'admin'];
        if (!isAuthenticated && authRequired.includes(item.id)) {
          if (onNavigate) onNavigate('auth');
        } else {
          if (onNavigate) onNavigate(item.id);
        }
      }
    }
  };

  const pilotName = user?.name || 'Commander';
  const pilotLevel = profile?.level || 1;
  const pilotRank = profile?.pilotRank || 'Star Cadet';
  const credits = profile?.credits?.toLocaleString() || '0';
  const energyCores = profile?.energyCores ?? 0;

  const isNavActive = (id) => {
    if (id === 'dashboard') return currentScreen === 'dashboard' || currentScreen === 'landing';
    return currentScreen === id;
  };

  // Location display subtitle for the header HUD
  const getLocationName = () => {
    switch (currentScreen) {
      case 'missions': return 'MISSION CONTROL CATALOG';
      case 'hangar': return 'STARFIGHTER FLEET HANGAR';
      case 'wallet': return 'CREDITS & REWARDS LEDGER';
      case 'quests': return 'ACHIEVEMENTS & DIRECTIVES';
      case 'leaderboard': return 'GALACTIC ACES LEADERBOARD';
      case 'admin': return 'AUTHORITATIVE AUDIT LEDGER';
      case 'dashboard':
      default: return 'ORBITAL OVERWATCH DECK';
    }
  };

  return (
    <div className="command-deck-shell">
      {/* Mobile Drawer Backdrop */}
      {isMobileScreen && isMobileMenuOpen && (
        <div 
          className="sidebar-drawer-backdrop" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* ================= 1. SPACECRAFT NAVIGATION CONSOLE ================= */}
      <aside 
        className="spacecraft-sidebar"
        style={isMobileScreen ? {
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '280px',
          minWidth: '280px',
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1100,
          boxShadow: isMobileMenuOpen ? '10px 0 35px rgba(0, 0, 0, 0.85)' : 'none'
        } : {}}
      >
        {/* Brand Header */}
        <div className="sidebar-brand-box">
          <div 
            className="sidebar-brand-interactive"
            onClick={() => {
              if (isMobileScreen) setIsMobileMenuOpen(false);
              onNavigate(isAuthenticated ? 'dashboard' : 'landing');
            }} 
            title={isAuthenticated ? "Return to Command Deck" : "Return to Main Menu"}
          >
            <DeltaLogo />
            <div className="sidebar-brand-meta">
              <span className="sidebar-brand-title">{GAME_NAME}</span>
              <span className="sidebar-brand-tag">SPACE COMBAT BEYOND LIMITS</span>
            </div>
            {isMobileScreen && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMobileMenuOpen(false); }}
                className="sidebar-close-btn"
                title="Close Navigation"
                style={{ marginLeft: 'auto' }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Tasteful Status Indicator */}
          <div className="sidebar-status-pill">
            <span className="sidebar-status-dot" />
            <span>COMMAND LINK ONLINE</span>
          </div>
        </div>

        {/* Navigation Rail with Structured Flight Ops vs Pilot Profile */}
        <nav className="sidebar-nav-container">
          {/* Section 1: Flight Operations */}
          <div className="sidebar-nav-group">
            <div className="sidebar-group-label">// FLIGHT OPERATIONS</div>
            {flightOpsItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item.id);
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => handleNavClick(item)}
                  className={`sidebar-nav-item ${active ? 'active' : ''}`}
                >
                  {active && <span className="sidebar-active-indicator" />}
                  <Icon size={17} className="sidebar-item-icon" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section 2: Pilot Profile */}
          <div className="sidebar-nav-group">
            <div className="sidebar-group-label">// PILOT PROFILE</div>
            {pilotProfileItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item.id);
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => handleNavClick(item)}
                  className={`sidebar-nav-item ${active ? 'active' : ''}`}
                >
                  {active && <span className="sidebar-active-indicator" />}
                  <Icon size={17} className="sidebar-item-icon" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer: LAUNCH COMBAT Action */}
        <div className="sidebar-footer-action">
          <button
            id="sidebar-quick-combat"
            onClick={() => {
              if (isMobileScreen) setIsMobileMenuOpen(false);
              isAuthenticated ? onNavigate('gameplay') : onNavigate('auth');
            }}
            className="sidebar-launch-combat-btn"
            title="Launch Combat Sortie"
          >
            <Play size={16} fill="currentColor" />
            <span>LAUNCH COMBAT</span>
          </button>
        </div>
      </aside>

      {/* ================= 2. MAIN APPLICATION COLUMN ================= */}
      <div 
        className="command-viewport-main"
        style={{
          marginLeft: isMobileScreen ? '0' : '250px',
          width: isMobileScreen ? '100%' : 'calc(100% - 250px)',
          paddingBottom: isMobileScreen && currentScreen !== 'gameplay' ? '70px' : '0'
        }}
      >
        {/* Top Command Bar HUD (Fixed Header) */}
        <header 
          className="command-top-hud"
          style={{
            left: isMobileScreen ? '0' : '250px',
            padding: isMobileScreen ? '0 14px' : '0 28px'
          }}
        >
          {/* Left: Mobile Toggle & Deck Location */}
          <div className="hud-left-group">
            {isMobileScreen && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="hud-hamburger-btn"
                title="Toggle Menu"
              >
                <Menu size={22} />
              </button>
            )}

            <div className="hud-location-badge">
              <span className="hud-location-sub">// COMMAND CENTER</span>
              <span className="hud-location-title">{getLocationName()}</span>
            </div>

            {/* Quick Navigation Pills on Wide Displays */}
            <div className="hud-quick-nav">
              <button 
                onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')} 
                className={`hud-quick-link ${isNavActive('dashboard') ? 'active' : ''}`}
              >
                HOME
              </button>
              <button 
                onClick={() => onNavigate('missions')} 
                className={`hud-quick-link ${currentScreen === 'missions' ? 'active' : ''}`}
              >
                MISSIONS
              </button>
              <button 
                onClick={() => onNavigate('hangar')} 
                className={`hud-quick-link ${currentScreen === 'hangar' ? 'active' : ''}`}
              >
                HANGAR
              </button>
              <button 
                onClick={() => onNavigate('leaderboard')} 
                className={`hud-quick-link ${currentScreen === 'leaderboard' ? 'active' : ''}`}
              >
                LEADERBOARD
              </button>
            </div>
          </div>

          {/* Right: Real Currencies & Pilot HUD Profile */}
          {isAuthenticated ? (
            <div className="hud-right-group">
              {/* In-Game Credits */}
              <div 
                className="hud-currency-pill pill-gold" 
                onClick={() => onNavigate('wallet')}
                title="Credits Ledger Balance"
              >
                <div className="hud-currency-icon-box">
                  <Coins size={14} color="#FBBF24" style={{ filter: 'drop-shadow(0 0 4px #FBBF24)' }} />
                </div>
                <span className="hud-currency-text-gold">
                  {credits} CREDITS
                </span>
              </div>

              {/* Energy Cores */}
              <div 
                className="hud-currency-pill pill-purple" 
                onClick={() => onNavigate('wallet')}
                title="Energy Cores (Dark Matter)"
              >
                <div className="hud-currency-icon-box">
                  <Zap size={14} color="#C084FC" style={{ filter: 'drop-shadow(0 0 4px #8B5CF6)' }} />
                </div>
                <span className="hud-currency-text-purple">
                  {energyCores} CORES
                </span>
              </div>

              {/* Pilot Profile HUD Badge */}
              <div className="hud-pilot-badge">
                <div className="hud-pilot-avatar">
                  <User size={15} />
                </div>
                <div className="hud-pilot-meta">
                  <span className="hud-pilot-name">{pilotName}</span>
                  <span className="hud-pilot-rank">LVL {pilotLevel} • {pilotRank}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); logout(); onNavigate('landing'); }}
                  className="hud-logout-btn"
                  title="Sign Out Pilot"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div className="hud-right-group">
              <button 
                onClick={() => onNavigate('auth')} 
                className="sidebar-launch-combat-btn"
                style={{ height: '36px', padding: '0 18px', fontSize: '0.74rem' }}
              >
                LOGIN
              </button>
            </div>
          )}
        </header>

        {/* Page Content Viewport */}
        <main className="command-content-viewport">
          {children}
        </main>
      </div>

      {/* ================= 3. MOBILE BOTTOM NAVIGATION ================= */}
      {isMobileScreen && currentScreen !== 'gameplay' && (
        <nav className="mobile-bottom-nav">
          <button 
            className={`mobile-nav-item ${isNavActive('dashboard') ? 'active' : ''}`}
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
          >
            <LayoutDashboard size={18} />
            <span>HOME</span>
          </button>

          <button 
            className={`mobile-nav-item ${currentScreen === 'missions' ? 'active' : ''}`}
            onClick={() => onNavigate('missions')}
          >
            <Compass size={18} />
            <span>MISSIONS</span>
          </button>

          <button 
            className="mobile-nav-center-btn animate-pulse-glow"
            onClick={() => isAuthenticated ? onNavigate('gameplay') : onNavigate('auth')}
            title="Launch Combat"
          >
            <Play size={20} fill="#04081E" />
            <span style={{ fontSize: '0.48rem', fontWeight: 'bold', marginTop: '1px' }}>COMBAT</span>
          </button>

          <button 
            className={`mobile-nav-item ${currentScreen === 'hangar' ? 'active' : ''}`}
            onClick={() => onNavigate('hangar')}
          >
            <Shield size={18} />
            <span>HANGAR</span>
          </button>

          <button 
            className="mobile-nav-item"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={18} />
            <span>MORE</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default SidebarLayout;
