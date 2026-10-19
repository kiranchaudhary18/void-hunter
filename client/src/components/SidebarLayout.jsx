import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import { GAME_NAME } from '../config/gameConfig.js';
import { 
  LayoutDashboard, Compass, Shield, Wallet, 
  Award, BarChart3, Settings, Coins, Zap, 
  User, LogOut, Play, ShieldCheck, Menu, X, ChevronRight
} from 'lucide-react';

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

  const baseNavItems = [
    { id: 'dashboard', label: isAuthenticated ? 'DASHBOARD' : 'MAIN MENU', icon: LayoutDashboard },
    { id: 'missions', label: 'MISSIONS', icon: Compass },
    { id: 'hangar', label: 'HANGAR', icon: Shield },
    { id: 'wallet', label: 'REWARDS', icon: Wallet },
    { id: 'quests', label: 'ACHIEVEMENTS', icon: Award },
    { id: 'leaderboard', label: 'LEADERBOARD', icon: BarChart3 },
  ];

  if (user?.role?.toLowerCase() === 'admin') {
    baseNavItems.push({ id: 'admin', label: 'AUDIT LEDGER', icon: ShieldCheck });
  }

  baseNavItems.push({ id: 'settings', label: 'SETTINGS', icon: Settings, isAction: true });
  const navItems = baseNavItems;

  const handleNavClick = (item) => {
    soundManager.playLaser();
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

  return (
    <div style={styles.shell}>
      {/* Mobile Drawer Backdrop */}
      {isMobileScreen && isMobileMenuOpen && (
        <div 
          className="mobile-drawer-backdrop" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* ================= LEFT CYBER SIDEBAR / MOBILE DRAWER ================= */}
      <aside 
        style={{
          ...styles.sidebar,
          ...(isMobileScreen ? {
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: '280px',
            minWidth: '280px',
            transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1100,
            boxShadow: isMobileMenuOpen ? '10px 0 35px rgba(0, 0, 0, 0.8)' : 'none'
          } : {})
        }}
      >
        {/* Brand Logo Header */}
        <div style={styles.logoBox}>
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: 'pointer' }}
            onClick={() => {
              if (isMobileScreen) setIsMobileMenuOpen(false);
              onNavigate(isAuthenticated ? 'dashboard' : 'landing');
            }} 
            title={isAuthenticated ? "Return to Command Deck" : "Return to Main Menu"}
          >
            <img src="/favicon.svg" alt="Void Hunter" style={styles.logoIcon} />
            <div style={styles.logoTextGroup}>
              <span className="font-heading text-glow-cyan" style={styles.brandTitle}>{GAME_NAME}</span>
              <span style={styles.brandTag}>SPACE COMBAT BEYOND LIMITS</span>
            </div>
          </div>

          {/* Close button on mobile drawer */}
          {isMobileScreen && (
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              style={styles.closeDrawerBtn}
              title="Close Menu"
            >
              <X size={18} color="var(--secondary-cyan)" />
            </button>
          )}
        </div>

        {/* Navigation Rail */}
        <nav style={styles.navRail}>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = isNavActive(item.id);

            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item)}
                style={{
                  ...styles.navButton,
                  ...(isActive ? styles.navButtonActive : {})
                }}
                className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                {/* Active Indicator Bar */}
                {isActive && <div style={styles.activeBar} />}

                <IconComponent 
                  size={18} 
                  color={isActive ? 'var(--secondary-cyan)' : 'var(--text-muted)'} 
                  style={isActive ? { filter: 'drop-shadow(0 0 6px #00E5FF)' } : {}}
                />
                <span 
                  className="font-heading" 
                  style={{
                    ...styles.navLabel,
                    color: isActive ? 'var(--secondary-cyan)' : 'var(--text-muted)',
                    fontWeight: isActive ? '700' : '500',
                    ...(isActive ? { textShadow: '0 0 8px rgba(0, 229, 255, 0.7)' } : {})
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Quick Launch Combat Button on Sidebar Footer */}
        <div style={styles.sidebarFooter}>
          <button
            id="sidebar-quick-combat"
            onClick={() => {
              if (isMobileScreen) setIsMobileMenuOpen(false);
              isAuthenticated ? onNavigate('gameplay') : onNavigate('auth');
            }}
            style={styles.quickCombatBtn}
            className="btn btn-cyan animate-pulse-glow"
            title="Launch Quick Sortie"
          >
            <Play size={16} fill="currentColor" />
            <span>SORTIE COMBAT</span>
          </button>
        </div>
      </aside>

      {/* ================= RIGHT MAIN APPLICATION COLUMN ================= */}
      <div 
        style={{
          ...styles.mainColumn,
          marginLeft: isMobileScreen ? '0' : '230px',
          width: isMobileScreen ? '100%' : 'calc(100% - 230px)',
          paddingBottom: isMobileScreen && currentScreen !== 'gameplay' ? '70px' : '0'
        }}
      >
        {/* Top Floating Cyber Navigation & Currency Bar (FIXED at Top) */}
        <header 
          style={{
            ...styles.topHeader,
            left: isMobileScreen ? '0' : '230px',
            padding: isMobileScreen ? '0 14px' : '0 28px'
          }} 
          className="glass-panel"
        >
          {/* Left: Mobile Hamburger Toggle + Quick Nav Links */}
          <div style={styles.headerLeft}>
            {isMobileScreen && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={styles.hamburgerBtn}
                title="Toggle Menu"
              >
                <Menu size={22} color="var(--secondary-cyan)" />
              </button>
            )}

            {isMobileScreen ? (
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
              >
                <img src="/favicon.svg" alt="Void Hunter" style={{ width: '24px', height: '24px' }} />
                <span className="font-heading text-glow-cyan" style={{ fontSize: '0.92rem', fontWeight: 'bold' }}>
                  {GAME_NAME}
                </span>
              </div>
            ) : (
              <div style={styles.topNavLinks}>
                <button 
                  onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')} 
                  style={{ ...styles.topNavLink, color: isNavActive('dashboard') ? 'var(--secondary-cyan)' : 'var(--text-muted)' }}
                >
                  HOME
                </button>
                <button 
                  onClick={() => onNavigate('missions')} 
                  style={{ ...styles.topNavLink, color: currentScreen === 'missions' ? 'var(--secondary-cyan)' : 'var(--text-muted)' }}
                >
                  MISSIONS
                </button>
                <button 
                  onClick={() => onNavigate('hangar')} 
                  style={{ ...styles.topNavLink, color: currentScreen === 'hangar' ? 'var(--secondary-cyan)' : 'var(--text-muted)' }}
                >
                  HANGAR
                </button>
                <button 
                  onClick={() => onNavigate('leaderboard')} 
                  style={{ ...styles.topNavLink, color: currentScreen === 'leaderboard' ? 'var(--secondary-cyan)' : 'var(--text-muted)' }}
                >
                  LEADERBOARD
                </button>
              </div>
            )}
          </div>

          {/* Right: Currencies & Pilot Profile */}
          {isAuthenticated ? (
            <div style={styles.headerRight}>
              {/* In-Game Credits */}
              <div 
                style={styles.currencyPill} 
                className="glass-card"
                onClick={() => onNavigate('wallet')}
                title="Credits Ledger Balance"
              >
                <div style={styles.currencyIconBoxGold}>
                  <Coins size={14} color="var(--currency-gold)" style={{ filter: 'drop-shadow(0 0 4px #FBBF24)' }} />
                </div>
                <span className="font-heading text-glow-gold" style={styles.currencyValGold}>
                  {credits}
                </span>
              </div>

              {/* Energy Cores / Gems */}
              <div 
                style={styles.currencyPill} 
                className="glass-card"
                onClick={() => onNavigate('wallet')}
                title="Energy Cores (Gems)"
              >
                <div style={styles.currencyIconBoxPurple}>
                  <Zap size={14} color="#C084FC" style={{ filter: 'drop-shadow(0 0 4px #A855F7)' }} />
                </div>
                <span className="font-heading text-glow-purple" style={styles.currencyValPurple}>
                  {energyCores}
                </span>
              </div>

              {/* Pilot Profile Badge */}
              <div style={styles.profileBadge} className="glass-card">
                <div style={styles.avatarCircle}>
                  <User size={15} color="var(--secondary-cyan)" />
                </div>
                {!isMobileScreen && (
                  <div style={styles.profileInfo}>
                    <div className="font-heading" style={styles.profileName}>{pilotName}</div>
                    <div style={styles.profileLevel}>LVL {pilotLevel} • {pilotRank}</div>
                  </div>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); logout(); onNavigate('landing'); }}
                  style={styles.logoutBtn}
                  title="Sign Out Pilot"
                >
                  <LogOut size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.headerRight}>
              <button 
                onClick={() => onNavigate('auth')} 
                className="btn btn-cyan animate-pulse-glow"
                style={{ padding: isMobileScreen ? '6px 14px' : '8px 24px', fontSize: isMobileScreen ? '0.74rem' : '0.82rem', fontWeight: 'bold' }}
              >
                LOGIN
              </button>
            </div>
          )}
        </header>

        {/* Page Content Viewport */}
        <main style={styles.contentViewport}>
          {children}
        </main>
      </div>

      {/* ================= MOBILE BOTTOM NAVIGATION BAR ================= */}
      {isMobileScreen && currentScreen !== 'gameplay' && (
        <nav className="mobile-bottom-nav">
          {/* 1. Home / Dashboard */}
          <button 
            className={`mobile-nav-item ${isNavActive('dashboard') ? 'active' : ''}`}
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
          >
            <LayoutDashboard size={18} />
            <span>HOME</span>
          </button>

          {/* 2. Missions */}
          <button 
            className={`mobile-nav-item ${currentScreen === 'missions' ? 'active' : ''}`}
            onClick={() => onNavigate('missions')}
          >
            <Compass size={18} />
            <span>MISSIONS</span>
          </button>

          {/* 3. Center Action: Sortie Combat */}
          <button 
            className="mobile-nav-center-btn animate-pulse-glow"
            onClick={() => isAuthenticated ? onNavigate('gameplay') : onNavigate('auth')}
            title="Sortie Combat"
          >
            <Play size={20} fill="#FFFFFF" />
            <span style={{ fontSize: '0.48rem', fontWeight: 'bold', marginTop: '1px' }}>SORTIE</span>
          </button>

          {/* 4. Hangar */}
          <button 
            className={`mobile-nav-item ${currentScreen === 'hangar' ? 'active' : ''}`}
            onClick={() => onNavigate('hangar')}
          >
            <Shield size={18} />
            <span>HANGAR</span>
          </button>

          {/* 5. More / Drawer Trigger */}
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

const styles = {
  shell: {
    display: 'flex',
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#060919',
    backgroundImage: `
      radial-gradient(circle at 20% 15%, rgba(124, 58, 237, 0.12) 0%, transparent 50%),
      radial-gradient(circle at 80% 85%, rgba(0, 229, 255, 0.08) 0%, transparent 50%),
      radial-gradient(2px 2px at 40px 60px, rgba(255, 255, 255, 0.8), transparent),
      radial-gradient(1.5px 1.5px at 150px 200px, rgba(0, 229, 255, 0.8), transparent),
      radial-gradient(1.5px 1.5px at 280px 120px, rgba(255, 45, 255, 0.6), transparent)
    `,
    backgroundSize: '100% 100%, 100% 100%, 450px 450px, 350px 350px, 500px 500px',
    color: 'var(--text-light)',
    position: 'relative',
    overflowX: 'hidden'
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '230px',
    minWidth: '230px',
    height: '100vh',
    background: 'rgba(8, 12, 32, 0.96)',
    backdropFilter: 'blur(16px)',
    borderRight: '1px solid rgba(0, 229, 255, 0.18)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    zIndex: 100,
    boxShadow: '4px 0 25px rgba(0, 0, 0, 0.6)',
    overflowY: 'auto'
  },
  logoBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
  },
  logoIcon: {
    width: '30px',
    height: '30px',
    filter: 'drop-shadow(0 0 8px rgba(0, 229, 255, 0.8))'
  },
  logoTextGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  brandTitle: {
    fontSize: '1.02rem',
    fontWeight: '900',
    letterSpacing: '0.08em',
    lineHeight: 1.1,
    background: 'linear-gradient(90deg, #FFFFFF 0%, #00E5FF 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  brandTag: {
    fontSize: '0.50rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    marginTop: '2px'
  },
  closeDrawerBtn: {
    background: 'rgba(0, 229, 255, 0.1)',
    border: '1px solid rgba(0, 229, 255, 0.3)',
    borderRadius: '6px',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  navRail: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '14px 10px'
  },
  navButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '8px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    width: '100%'
  },
  navButtonActive: {
    background: 'rgba(0, 229, 255, 0.12)',
    boxShadow: 'inset 0 0 14px rgba(0, 229, 255, 0.15)'
  },
  activeBar: {
    position: 'absolute',
    left: '-10px',
    top: '15%',
    height: '70%',
    width: '4px',
    borderRadius: '0 4px 4px 0',
    background: 'var(--secondary-cyan)',
    boxShadow: '0 0 10px var(--secondary-cyan)'
  },
  navLabel: {
    fontSize: '0.76rem',
    letterSpacing: '0.08em',
    transition: 'color 0.2s ease'
  },
  sidebarFooter: {
    padding: '14px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)'
  },
  quickCombatBtn: {
    width: '100%',
    padding: '11px',
    fontSize: '0.80rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  mainColumn: {
    flex: 1,
    minWidth: 0,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    transition: 'margin-left 0.25s ease'
  },
  topHeader: {
    position: 'fixed',
    top: 0,
    right: 0,
    height: '62px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid rgba(0, 229, 255, 0.18)',
    background: 'rgba(8, 12, 32, 0.96)',
    backdropFilter: 'blur(16px)',
    zIndex: 90,
    transition: 'left 0.25s ease'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  hamburgerBtn: {
    background: 'rgba(0, 229, 255, 0.08)',
    border: '1px solid rgba(0, 229, 255, 0.25)',
    borderRadius: '8px',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  topNavLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  topNavLink: {
    background: 'none',
    border: 'none',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.80rem',
    letterSpacing: '0.08em',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    padding: '4px 6px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  currencyPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 10px',
    borderRadius: '16px',
    cursor: 'pointer',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.2s ease'
  },
  currencyIconBoxGold: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  currencyValGold: {
    fontSize: '0.82rem',
    color: 'var(--currency-gold)',
    fontWeight: '700'
  },
  currencyIconBoxPurple: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  currencyValPurple: {
    fontSize: '0.82rem',
    color: '#C084FC',
    fontWeight: '700'
  },
  profileBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 10px',
    borderRadius: '18px',
    border: '1px solid rgba(0, 229, 255, 0.3)',
    background: 'rgba(10, 16, 42, 0.8)'
  },
  avatarCircle: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: 'rgba(0, 229, 255, 0.15)',
    border: '1px solid var(--secondary-cyan)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  profileName: {
    fontSize: '0.78rem',
    color: 'var(--text-light)',
    fontWeight: '700',
    lineHeight: 1.1
  },
  profileLevel: {
    fontSize: '0.60rem',
    color: 'var(--text-muted)'
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease'
  },
  contentViewport: {
    flex: 1,
    minHeight: 0,
    paddingTop: '62px'
  }
};

export default SidebarLayout;
