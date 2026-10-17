import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import MainMenuPage from './pages/MainMenuPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import HangarPage from './pages/HangarPage.jsx';
import MissionsPage from './pages/MissionsPage.jsx';
import WalletPage from './pages/WalletPage.jsx';
import QuestsPage from './pages/QuestsPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import GameContainer from './game/GameContainer.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import api from './services/api.js';
import { MISSIONS_CATALOG } from './data/missionsData.js';
import { GAME_NAME, GAME_TAGLINE } from './config/gameConfig.js';
import { Coins, Zap, User, LogOut, Play, Compass, Shield, Award, BarChart3, Wallet, Settings } from 'lucide-react';
import './App.css';

function MainAppContent() {
  const { user, profile, isAuthenticated, logout, refreshProfile } = useAuth();
  const [currentScreen, setCurrentScreen] = useState(() => {
    return localStorage.getItem('void_hunter_token') ? 'dashboard' : 'landing';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeMission, setActiveMission] = useState({
    id: 'sector-1-mission-1',
    name: 'MISSION 01: RECON PATROL',
    sector: 'Nebula Outpost',
    globalSequence: 1
  });

  // Automatically transition to Dashboard upon authentication
  React.useEffect(() => {
    if (isAuthenticated && currentScreen === 'landing') {
      setCurrentScreen('dashboard');
    }
  }, [isAuthenticated]);

  // Map selectedShipId to texture and stats (hoisted at top to prevent ReferenceError)
  const getSelectedShipData = () => {
    const id = profile?.selectedShipId || 'v01-orbitron';
    const textures = {
      'v01-orbitron': 'ship_orbitron',
      's02-phoenix': 'ship_phoenix',
      'x03-shadow': 'ship_shadow',
      'r04-titan': 'ship_titan',
      'z05-nova': 'ship_nova'
    };
    const speeds = {
      'v01-orbitron': 390,
      's02-phoenix': 370,
      'x03-shadow': 460,
      'r04-titan': 320,
      'z05-nova': 420
    };
    const damages = {
      'v01-orbitron': 28,
      's02-phoenix': 45,
      'x03-shadow': 26,
      'r04-titan': 34,
      'z05-nova': 40
    };
    return {
      id,
      name: id.toUpperCase(),
      textureKey: textures[id] || 'ship_orbitron',
      speed: speeds[id] || 390,
      damage: damages[id] || 28
    };
  };

  // Launch next sequential campaign mission directly
  const handleNextMission = async (currentMission) => {
    const nextSeq = (currentMission?.globalSequence || 1) + 1;
    const nextMission = MISSIONS_CATALOG.find((m) => m.globalSequence === nextSeq);
    if (nextMission) {
      try {
        const ship = getSelectedShipData();
        const res = await api.post(`/missions/${nextMission.id}/start`, {
          shipId: ship?.id || 'v01-orbitron'
        });
        const newSessionId = res.data?.sessionId || res.data?.session?.id || `local-${Date.now()}`;
        setActiveMission(nextMission);
        setActiveSessionId(newSessionId);
        setCurrentScreen('gameplay');
      } catch (e) {
        console.warn('Could not start next mission online:', e.message);
        setActiveMission(nextMission);
        setActiveSessionId(`local-${Date.now()}`);
        setCurrentScreen('gameplay');
      }
    } else {
      // Completed all 50 missions! Return to campaign map
      setCurrentScreen('missions');
    }
  };

  // Handle Mission Completion callback from Game Engine & post to backend ledger
  const handleMissionCompleted = async (result) => {
    console.log('[COMBAT ENGINE] Mission Complete Result:', result);
    try {
      if (activeSessionId && !activeSessionId.startsWith('local-')) {
        await api.post(`/missions/${activeSessionId}/complete`, {
          finalScore: result.score || 0,
          durationSeconds: 45,
          telemetry: {
            enemiesDestroyed: result.enemiesKilled || 0,
            accuracyPercentage: 85
          }
        });
      }
    } catch (err) {
      console.warn('Could not post mission completion telemetry:', err.message);
    }
    if (refreshProfile) refreshProfile();
  };

  // Protected Route Guards (Section 60)
  const protectedScreens = ['dashboard', 'missions', 'hangar', 'wallet', 'quests', 'leaderboard', 'admin'];
  if (!isAuthenticated && protectedScreens.includes(currentScreen)) {
    return (
      <AuthPage 
        onBackToGame={() => setCurrentScreen('landing')} 
        onAuthSuccess={() => setCurrentScreen('dashboard')} 
      />
    );
  }

  // Screen 1: Cinematic Main Menu Landing (Only for unauthenticated guests)
  if (currentScreen === 'landing' && !isAuthenticated) {
    return (
      <MainMenuPage 
        onNavigate={(screen) => setCurrentScreen(screen)}
      />
    );
  }

  // Screen 2: Login / Signup
  if (currentScreen === 'auth') {
    return (
      <AuthPage 
        onBackToGame={() => setCurrentScreen(isAuthenticated ? 'dashboard' : 'landing')} 
        onAuthSuccess={() => setCurrentScreen('dashboard')} 
      />
    );
  }

  // Screen 6: Real-time 60 FPS Combat Game Engine (Full Screen Arcade Mode)
  if (currentScreen === 'gameplay') {
    return (
      <GameContainer
        key={`${activeMission?.id || 'mission'}-${activeSessionId || 'sess'}`}
        mission={activeMission}
        ship={getSelectedShipData()}
        onExit={(target = 'missions') => setCurrentScreen(target)}
        onCompleteMission={handleMissionCompleted}
        onNextMission={handleNextMission}
      />
    );
  }

  // Active Screen Content Renderer
  const renderScreenContent = () => {
    switch (currentScreen) {
      case 'missions':
        return (
          <MissionsPage 
            onBack={() => setCurrentScreen('dashboard')}
            selectedShip={getSelectedShipData()}
            onLaunchMission={(mission, sessionId) => {
              setActiveMission(mission);
              setActiveSessionId(sessionId);
              setCurrentScreen('gameplay');
            }}
          />
        );
      case 'hangar':
        return (
          <HangarPage 
            onBack={() => setCurrentScreen('dashboard')}
            onLaunchMission={() => setCurrentScreen('missions')}
          />
        );
      case 'wallet':
        return (
          <WalletPage 
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      case 'quests':
        return (
          <QuestsPage 
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      case 'leaderboard':
        return (
          <LeaderboardPage 
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      case 'admin':
        return (
          <AdminDashboardPage 
            onBack={() => setCurrentScreen('dashboard')}
          />
        );
      case 'dashboard':
      default:
        return (
          <DashboardPage 
            onNavigate={(screen) => setCurrentScreen(screen)}
            onLaunchQuickCombat={() => setCurrentScreen('gameplay')}
            selectedShip={getSelectedShipData()}
          />
        );
    }
  };

  // Universal Authenticated App Shell with Cyber Top Navigation
  return (
    <div style={styles.appShell}>
      {/* Top Universal Navbar */}
      <nav style={styles.navBar} className="glass-panel cyber-box">
        <div style={styles.navLeft}>
          <div 
            style={{ ...styles.logoGroup, cursor: 'pointer' }} 
            onClick={() => setCurrentScreen(isAuthenticated ? 'dashboard' : 'landing')}
            title={isAuthenticated ? "Command Deck Dashboard" : "Return to Main Menu"}
          >
            <img src="/favicon.svg" alt="Void Hunter Logo" style={styles.navLogo} />
            <div>
              <span className="font-heading text-glow-cyan" style={styles.navBrandTitle}>{GAME_NAME}</span>
              <span className="font-ui" style={styles.navBrandTag}>{GAME_TAGLINE}</span>
            </div>
          </div>

          <div style={styles.navLinks}>
            {!isAuthenticated && (
              <button 
                id="nav-btn-home"
                style={{ ...styles.navLink, ...(currentScreen === 'landing' ? styles.navLinkActive : {}) }}
                onClick={() => setCurrentScreen('landing')}
              >
                HOME
              </button>
            )}
            <button 
              id="nav-btn-dashboard"
              style={{ ...styles.navLink, ...(currentScreen === 'dashboard' ? styles.navLinkActive : {}) }}
              onClick={() => setCurrentScreen('dashboard')}
            >
              DASHBOARD
            </button>
            <button 
              id="nav-btn-missions"
              style={{ ...styles.navLink, ...(currentScreen === 'missions' ? styles.navLinkActive : {}) }}
              onClick={() => setCurrentScreen('missions')}
            >
              MISSIONS (50)
            </button>
            <button 
              id="nav-btn-hangar"
              style={{ ...styles.navLink, ...(currentScreen === 'hangar' ? styles.navLinkActive : {}) }}
              onClick={() => setCurrentScreen('hangar')}
            >
              HANGAR
            </button>
            <button 
              id="nav-btn-quests"
              style={{ ...styles.navLink, ...(currentScreen === 'quests' ? styles.navLinkActive : {}) }}
              onClick={() => setCurrentScreen('quests')}
            >
              QUESTS
            </button>
            <button 
              id="nav-btn-leaderboard"
              style={{ ...styles.navLink, ...(currentScreen === 'leaderboard' ? styles.navLinkActive : {}) }}
              onClick={() => setCurrentScreen('leaderboard')}
            >
              LEADERBOARD
            </button>
            <button 
              id="nav-btn-wallet"
              style={{ ...styles.navLink, ...(currentScreen === 'wallet' ? styles.navLinkActive : {}) }}
              onClick={() => setCurrentScreen('wallet')}
            >
              WALLET
            </button>
            <button 
              id="nav-btn-admin"
              style={{ ...styles.navLink, ...(currentScreen === 'admin' ? styles.navLinkActive : {}) }}
              onClick={() => setCurrentScreen('admin')}
              title="VELoop Rewards Administrative Audit & Fraud Dashboard (Section 75)"
            >
              ADMIN AUDIT
            </button>
            <button 
              id="nav-btn-combat"
              style={{ 
                ...styles.navLink, 
                color: 'var(--secondary-cyan)',
                border: '1px solid rgba(0, 229, 255, 0.4)',
                background: 'rgba(0, 229, 255, 0.1)',
                boxShadow: '0 0 10px rgba(0, 229, 255, 0.25)'
              }}
              onClick={() => setCurrentScreen('gameplay')}
            >
              COMBAT (PLAY)
            </button>
          </div>
        </div>

        {/* Top Right: Currencies & User Pilot Profile */}
        <div style={styles.navRight}>
          {/* Settings Audio & Keybinds Trigger */}
          <button 
            id="nav-btn-settings"
            onClick={() => setIsSettingsOpen(true)}
            style={{
              background: 'rgba(0, 229, 255, 0.08)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              padding: '8px 10px',
              color: 'var(--secondary-cyan)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            title="Audio & Control Settings (Section 73)"
          >
            <Settings size={16} />
          </button>

          {isAuthenticated && profile ? (
            <>
              {/* Credits Counter - Click to open Wallet */}
              <div 
                className="currency-pill credits" 
                title="In-Game Credits (Click to View Ledger)"
                onClick={() => setCurrentScreen('wallet')}
                style={{ cursor: 'pointer', border: '1px solid rgba(251, 191, 36, 0.4)', boxShadow: '0 0 10px rgba(251, 191, 36, 0.2)' }}
              >
                <Coins size={16} color="var(--currency-gold)" style={{ filter: 'drop-shadow(0 0 4px #FBBF24)' }} />
                <span className="font-heading" style={{ color: 'var(--currency-gold)' }}>{profile.credits?.toLocaleString() || 500}</span>
              </div>

              {/* Energy Cores Counter - Click to open Wallet */}
              <div 
                className="currency-pill cores" 
                title="Energy Cores (Click to View Ledger)"
                onClick={() => setCurrentScreen('wallet')}
                style={{ cursor: 'pointer', border: '1px solid rgba(168, 85, 247, 0.4)', boxShadow: '0 0 10px rgba(168, 85, 247, 0.2)' }}
              >
                <Zap size={16} color="#C084FC" style={{ filter: 'drop-shadow(0 0 4px #A855F7)' }} />
                <span className="font-heading" style={{ color: '#C084FC' }}>{profile.energyCores || 10}</span>
              </div>

              {/* Pilot Card */}
              <div 
                style={{ ...styles.pilotBadge, cursor: 'pointer', border: '1px solid rgba(0, 229, 255, 0.35)', borderRadius: '10px' }} 
                className="glass-card"
                onClick={() => setCurrentScreen('dashboard')}
              >
                <div style={styles.pilotAvatar}>
                  <User size={16} color="var(--secondary-cyan)" />
                </div>
                <div>
                  <div style={styles.pilotName}>{user?.name || 'Commander'}</div>
                  <div style={styles.pilotLevel}>LV. {profile.level || 1} • {profile.pilotRank || 'Star Cadet'}</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); logout(); setCurrentScreen('landing'); }} 
                  style={styles.logoutBtn} 
                  title="Logout Pilot"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </>
          ) : (
            <button 
              onClick={() => setCurrentScreen('auth')} 
              className="btn btn-cyan"
              style={{ padding: '8px 18px', fontSize: '0.8rem' }}
            >
              LOGIN / REGISTER
            </button>
          )}
        </div>
      </nav>

      {/* Screen Content */}
      {renderScreenContent()}

      {/* Audio & Controls Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

const styles = {
  appShell: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#060919'
  },
  navBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 28px',
    borderRadius: '0',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: '1px solid rgba(0, 229, 255, 0.3)',
    background: 'rgba(6, 9, 25, 0.94)',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(0, 229, 255, 0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px'
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer'
  },
  navLogo: {
    width: '38px',
    height: '38px',
    filter: 'drop-shadow(0 0 10px rgba(0, 229, 255, 0.8))'
  },
  navBrandTitle: {
    display: 'block',
    fontSize: '1.2rem',
    fontWeight: '900',
    letterSpacing: '0.08em',
    background: 'linear-gradient(90deg, #FFFFFF 0%, #00E5FF 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1
  },
  navBrandTag: {
    display: 'block',
    fontSize: '0.62rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.1em'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  navLink: {
    background: 'transparent',
    border: '1px solid transparent',
    color: 'var(--text-muted)',
    padding: '8px 14px',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.78rem',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    borderRadius: '6px',
    transition: 'all 0.2s ease'
  },
  navLinkActive: {
    color: 'var(--secondary-cyan)',
    background: 'rgba(0, 229, 255, 0.14)',
    borderColor: 'rgba(0, 229, 255, 0.45)',
    boxShadow: '0 0 14px rgba(0, 229, 255, 0.35)',
    textShadow: '0 0 8px rgba(0, 229, 255, 0.7)'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  pilotBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 12px',
    background: 'rgba(10, 15, 44, 0.85)'
  },
  pilotAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'rgba(0, 229, 255, 0.15)',
    border: '1px solid var(--secondary-cyan)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pilotName: {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-light)',
    lineHeight: 1.1
  },
  pilotLevel: {
    fontFamily: 'var(--font-ui)',
    fontSize: '0.68rem',
    color: 'var(--text-muted)'
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
    marginLeft: '6px'
  },
  contentContainer: {
    flex: 1,
    padding: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px'
  },
  heroCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '48px 40px',
    borderRadius: '16px',
    border: '1px solid rgba(0, 229, 255, 0.3)',
    boxShadow: '0 0 40px rgba(0, 229, 255, 0.15)'
  },
  heroLeft: {
    maxWidth: '650px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  heroHeading: {
    fontSize: '2.2rem',
    fontWeight: '900',
    lineHeight: 1.2
  },
  heroDesc: {
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6
  },
  heroActions: {
    display: 'flex',
    gap: '16px',
    marginTop: '12px'
  },
  heroRight: {
    paddingRight: '20px'
  },
  floatingEmblem: {
    width: '180px',
    height: '180px',
    filter: 'drop-shadow(0 0 30px rgba(0, 229, 255, 0.7))'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  infoCard: {
    padding: '24px'
  },
  infoCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px'
  },
  infoTitle: {
    fontSize: '0.95rem',
    color: 'var(--text-light)',
    letterSpacing: '0.06em'
  },
  infoText: {
    fontSize: '1.1rem',
    color: 'var(--text-light)',
    marginBottom: '4px'
  },
  infoSubtext: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
  }
};

export default App;
