import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import { GAME_NAME } from '../config/gameConfig.js';
import { 
  LayoutDashboard, Compass, Shield, Wallet, 
  Award, BarChart3, Settings, Coins, Zap, 
  User, LogOut, Crosshair, ChevronRight, Play, ShieldCheck
} from 'lucide-react';

export const SidebarLayout = ({ 
  currentScreen, 
  onNavigate, 
  onOpenSettings, 
  children 
}) => {
  const { user, profile, logout } = useAuth();

  const baseNavItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
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
    if (item.isAction) {
      if (item.id === 'settings' && onOpenSettings) onOpenSettings();
    } else {
      if (onNavigate) onNavigate(item.id);
    }
  };

  const pilotName = user?.name || 'Kiran';
  const pilotLevel = profile?.level || 1;
  const pilotRank = profile?.pilotRank || 'Star Cadet';
  const credits = profile?.credits?.toLocaleString() || '500';
  const energyCores = profile?.energyCores || 10;

  return (
    <div style={styles.shell}>
      {/* ================= LEFT CYBER SIDEBAR ================= */}
      <aside style={styles.sidebar}>
        {/* Brand Logo Header */}
        <div 
          style={styles.logoBox} 
          onClick={() => onNavigate('dashboard')} 
          title="Return to Command Deck"
        >
          <img src="/favicon.svg" alt="Void Hunter" style={styles.logoIcon} />
          <div style={styles.logoTextGroup}>
            <span className="font-heading text-glow-cyan" style={styles.brandTitle}>{GAME_NAME}</span>
            <span style={styles.brandTag}>SPACE COMBAT BEYOND LIMITS</span>
          </div>
        </div>

        {/* Navigation Rail */}
        <nav style={styles.navRail}>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentScreen === item.id;

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
            onClick={() => onNavigate('gameplay')}
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
      <div style={styles.mainColumn}>
        {/* Top Floating Cyber Navigation & Currency Bar */}
        <header style={styles.topHeader} className="glass-panel">
          {/* Left: Quick Nav Links matching Mockup Top Bar */}
          <div style={styles.headerLeft}>
            <div style={styles.topNavLinks}>
              <button 
                onClick={() => onNavigate('dashboard')} 
                style={{ ...styles.topNavLink, color: currentScreen === 'dashboard' ? 'var(--secondary-cyan)' : 'var(--text-muted)' }}
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
          </div>

          {/* Right: Currencies & Pilot Profile */}
          <div style={styles.headerRight}>
            {/* In-Game Credits */}
            <div 
              style={styles.currencyPill} 
              className="glass-card"
              onClick={() => onNavigate('wallet')}
              title="Credits Ledger Balance"
            >
              <div style={styles.currencyIconBoxGold}>
                <Coins size={15} color="var(--currency-gold)" style={{ filter: 'drop-shadow(0 0 4px #FBBF24)' }} />
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
                <Zap size={15} color="#C084FC" style={{ filter: 'drop-shadow(0 0 4px #A855F7)' }} />
              </div>
              <span className="font-heading text-glow-purple" style={styles.currencyValPurple}>
                {energyCores}
              </span>
            </div>

            {/* Pilot Profile Badge */}
            <div style={styles.profileBadge} className="glass-card">
              <div style={styles.avatarCircle}>
                <User size={16} color="var(--secondary-cyan)" />
              </div>
              <div style={styles.profileInfo}>
                <div className="font-heading" style={styles.profileName}>{pilotName}</div>
                <div style={styles.profileLevel}>LEVEL {pilotLevel} • {pilotRank}</div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); logout(); onNavigate('landing'); }}
                style={styles.logoutBtn}
                title="Sign Out Pilot"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main style={styles.contentViewport}>
          {children}
        </main>
      </div>
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
    background: 'rgba(8, 12, 32, 0.94)',
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
    gap: '12px',
    padding: '20px 18px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    cursor: 'pointer'
  },
  logoIcon: {
    width: '32px',
    height: '32px',
    filter: 'drop-shadow(0 0 8px rgba(0, 229, 255, 0.8))'
  },
  logoTextGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  brandTitle: {
    fontSize: '1.05rem',
    fontWeight: '900',
    letterSpacing: '0.08em',
    lineHeight: 1.1,
    background: 'linear-gradient(90deg, #FFFFFF 0%, #00E5FF 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  brandTag: {
    fontSize: '0.52rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    marginTop: '2px'
  },
  navRail: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '16px 10px'
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
    fontSize: '0.78rem',
    letterSpacing: '0.08em',
    transition: 'color 0.2s ease'
  },
  sidebarFooter: {
    padding: '16px 14px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)'
  },
  quickCombatBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '0.82rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  mainColumn: {
    flex: 1,
    marginLeft: '230px',
    width: 'calc(100% - 230px)',
    minWidth: 0,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column'
  },
  topHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 28px',
    borderRadius: '0',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: '1px solid rgba(0, 229, 255, 0.18)',
    background: 'rgba(8, 12, 32, 0.88)',
    backdropFilter: 'blur(16px)',
    position: 'sticky',
    top: 0,
    zIndex: 90
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  topNavLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },
  topNavLink: {
    background: 'none',
    border: 'none',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.82rem',
    letterSpacing: '0.08em',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
    padding: '4px 8px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  currencyPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: '20px',
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
    fontSize: '0.88rem',
    color: 'var(--currency-gold)',
    fontWeight: '700'
  },
  currencyIconBoxPurple: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  currencyValPurple: {
    fontSize: '0.88rem',
    color: '#C084FC',
    fontWeight: '700'
  },
  profileBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid rgba(0, 229, 255, 0.3)',
    background: 'rgba(10, 16, 42, 0.8)'
  },
  avatarCircle: {
    width: '28px',
    height: '28px',
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
    fontSize: '0.8rem',
    color: 'var(--text-light)',
    fontWeight: '700',
    lineHeight: 1.1
  },
  profileLevel: {
    fontSize: '0.62rem',
    color: 'var(--text-muted)'
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '4px',
    transition: 'color 0.2s ease'
  },
  contentViewport: {
    flex: 1,
    minHeight: 0
  }
};

export default SidebarLayout;
