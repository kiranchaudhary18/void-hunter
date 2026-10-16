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
import api from './services/api.js';
import { GAME_NAME, GAME_TAGLINE } from './config/gameConfig.js';
import { Coins, Zap, User, LogOut, Play, Compass, Shield, Award, BarChart3, Wallet, Settings } from 'lucide-react';
import './App.css';

function MainAppContent() {
  const { user, profile, isAuthenticated, logout, refreshProfile } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('landing'); // Screens: 'landing', 'auth', 'dashboard', 'missions', 'hangar', 'wallet', 'quests', 'leaderboard', 'gameplay'
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeMission, setActiveMission] = useState({
    id: 'sector-1-mission-1',
    name: 'MISSION 01: RECON PATROL',
    sector: 'Nebula Outpost'
  });

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

  // Screen 1: Cinematic Main Menu Landing
  if (currentScreen === 'landing') {
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
        onBackToGame={() => setCurrentScreen('dashboard')} 
        onAuthSuccess={() => setCurrentScreen('dashboard')} 
      />
    );
  }

  // Screen 4: 50 Strategic Campaign Missions & Boss Battles
  if (currentScreen === 'missions') {
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
  }

  // Screen 5: Ship Hangar & Upgrades
  if (currentScreen === 'hangar') {
    return (
      <HangarPage 
        onBack={() => setCurrentScreen('dashboard')}
        onLaunchMission={() => setCurrentScreen('missions')}
      />
    );
  }

  // Screen 8: VELOOP Rewards & Double-Entry Transaction Ledger
  if (currentScreen === 'wallet') {
    return (
      <WalletPage 
        onBack={() => setCurrentScreen('dashboard')}
      />
    );
  }

  // Screen 9: Daily Rotating Quests & 10 Achievements
  if (currentScreen === 'quests') {
    return (
      <QuestsPage 
        onBack={() => setCurrentScreen('dashboard')}
      />
    );
  }

  // Screen 10: Global Pilot Leaderboard
  if (currentScreen === 'leaderboard') {
    return (
      <LeaderboardPage 
        onBack={() => setCurrentScreen('dashboard')}
      />
    );
  }

  // Map selectedShipId to texture and stats
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

  // Screen 6: Real-time 60 FPS Combat Game Engine
  if (currentScreen === 'gameplay') {
    return (
      <GameContainer
        mission={activeMission}
        ship={getSelectedShipData()}
        onExit={() => setCurrentScreen('dashboard')}
        onCompleteMission={handleMissionCompleted}
      />
    );
  }

  // Screen 3: Player Dashboard / Command Center Shell
  return (
    <div style={styles.appShell}>
      {/* Top Universal Navbar */}
      <nav style={styles.navBar} className="glass-panel">
        <div style={styles.navLeft}>
          <div 
            style={{ ...styles.logoGroup, cursor: 'pointer' }} 
            onClick={() => setCurrentScreen('landing')}
            title="Return to Main Menu"
          >
            <img src="/favicon.svg" alt="Void Hunter Logo" style={styles.navLogo} />
            <div>
              <span className="font-heading" style={styles.navBrandTitle}>{GAME_NAME}</span>
              <span className="font-ui" style={styles.navBrandTag}>{GAME_TAGLINE}</span>
            </div>
          </div>

          <div style={styles.navLinks}>
            <button 
              style={{ ...styles.navLink, ...(currentScreen === 'landing' ? styles.navLinkActive : {}) }}
              onClick={() => setCurrentScreen('landing')}
            >
              HOME
            </button>
            <button 
              style={{ ...styles.navLink, ...(currentScreen === 'dashboard' ? styles.navLinkActive : {}) }}
              onClick={() => setCurrentScreen('dashboard')}
            >
              DASHBOARD
            </button>
            <button 
              style={{ ...styles.navLink, ...(currentScreen === 'missions' ? styles.navLinkActive : {}) }}
              onClick={() => setCurrentScreen('missions')}
            >
              MISSIONS (50)
            </button>
            <button 
              style={{ ...styles.navLink, ...(currentScreen === 'hangar' ? styles.navLinkActive : {}) }}
              onClick={() => setCurrentScreen('hangar')}
            >
              HANGAR
            </button>
            <button 
              style={{ ...styles.navLink, ...(currentScreen === 'quests' ? styles.navLinkActive : {}) }}
              onClick={() => setCurrentScreen('quests')}
            >
              QUESTS
            </button>
            <button 
              style={{ ...styles.navLink, ...(currentScreen === 'leaderboard' ? styles.navLinkActive : {}) }}
              onClick={() => setCurrentScreen('leaderboard')}
            >
              LEADERBOARD
            </button>
            <button 
              style={{ ...styles.navLink, ...(currentScreen === 'wallet' ? styles.navLinkActive : {}) }}
              onClick={() => setCurrentScreen('wallet')}
            >
              WALLET
            </button>
            <button 
              style={{ ...styles.navLink, ...(currentScreen === 'gameplay' ? styles.navLinkActive : {}) }}
              onClick={() => setCurrentScreen('gameplay')}
            >
              COMBAT (PLAY)
            </button>
          </div>
        </div>

        {/* Top Right: Currencies & User Pilot Profile */}
        <div style={styles.navRight}>
          {isAuthenticated && profile ? (
            <>
              {/* Credits Counter - Click to open Wallet */}
              <div 
                className="currency-pill credits" 
                title="In-Game Credits (Click to View Ledger)"
                onClick={() => setCurrentScreen('wallet')}
                style={{ cursor: 'pointer' }}
              >
                <Coins size={16} color="var(--currency-gold)" />
                <span>{profile.credits?.toLocaleString() || 500}</span>
              </div>

              {/* Energy Cores Counter - Click to open Wallet */}
              <div 
                className="currency-pill cores" 
                title="Energy Cores (Click to View Ledger)"
                onClick={() => setCurrentScreen('wallet')}
                style={{ cursor: 'pointer' }}
              >
                <Zap size={16} color="#C084FC" />
                <span>{profile.energyCores || 10}</span>
              </div>

              {/* Pilot Card */}
              <div 
                style={{ ...styles.pilotBadge, cursor: 'pointer' }} 
                className="glass-card"
                onClick={() => setCurrentScreen('dashboard')}
              >
                <div style={styles.pilotAvatar}>
                  <User size={16} color="var(--secondary-cyan)" />
                </div>
                <div>
                  <div style={styles.pilotName}>{user?.name || 'Commander'}</div>
                  <div style={styles.pilotLevel}>LV. {profile.level || 1} {profile.pilotRank || 'Star Cadet'}</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); logout(); }} 
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

      {/* Screen 3 Full Pilot Command Deck */}
      <DashboardPage 
        onNavigate={(screen) => setCurrentScreen(screen)}
        onLaunchQuickCombat={() => setCurrentScreen('gameplay')}
        selectedShip={getSelectedShipData()}
      />
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
    flexDirection: 'column'
  },
  navBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 28px',
    borderRadius: '0',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: '1px solid rgba(0, 229, 255, 0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  navLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '36px'
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer'
  },
  navLogo: {
    width: '36px',
    height: '36px',
    filter: 'drop-shadow(0 0 8px rgba(0, 229, 255, 0.6))'
  },
  navBrandTitle: {
    display: 'block',
    fontSize: '1.15rem',
    fontWeight: '900',
    letterSpacing: '0.08em',
    background: 'linear-gradient(90deg, #FFFFFF, #00E5FF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1
  },
  navBrandTag: {
    display: 'block',
    fontSize: '0.65rem',
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
    border: 'none',
    color: 'var(--text-muted)',
    padding: '8px 14px',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.78rem',
    letterSpacing: '0.06em',
    cursor: 'pointer',
    borderRadius: '4px',
    transition: 'all 0.2s ease'
  },
  navLinkActive: {
    color: 'var(--secondary-cyan)',
    background: 'rgba(0, 229, 255, 0.1)',
    boxShadow: '0 0 10px rgba(0, 229, 255, 0.2)'
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
