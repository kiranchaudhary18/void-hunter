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
import PublicMissionsPage from './pages/PublicMissionsPage.jsx';
import PublicHangarPage from './pages/PublicHangarPage.jsx';
import PublicLeaderboardPage from './pages/PublicLeaderboardPage.jsx';
import GameContainer from './game/GameContainer.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import SidebarLayout from './components/SidebarLayout.jsx';
import api from './services/api.js';
import { MISSIONS_CATALOG } from './data/missionsData.js';
import { GAME_NAME, GAME_TAGLINE } from './config/gameConfig.js';
import { Coins, Zap, User, LogOut, Play, Compass, Shield, Award, BarChart3, Wallet, Settings } from 'lucide-react';
import './App.css';

// Map URL pathname to internal screen identifier
export const getScreenFromPath = (pathname, isAuthenticated = false) => {
  const cleanPath = (pathname || window.location.pathname || '/').toLowerCase().replace(/\/+$/, '') || '/';
  
  switch (cleanPath) {
    case '/missions':
      return 'missions';
    case '/hangar':
    case '/ships':
      return 'hangar';
    case '/leaderboard':
    case '/ranks':
      return 'leaderboard';
    case '/dashboard':
      return 'dashboard';
    case '/wallet':
    case '/rewards':
    case '/ledger':
      return 'wallet';
    case '/quests':
    case '/achievements':
      return 'quests';
    case '/admin':
    case '/audit':
      return 'admin';
    case '/auth':
    case '/login':
    case '/signup':
    case '/register':
      return 'auth';
    case '/gameplay':
    case '/combat':
    case '/game':
      return 'gameplay';
    case '/':
    case '/landing':
    case '/home':
    default:
      return isAuthenticated ? 'dashboard' : 'landing';
  }
};

// Map screen identifier to URL pathname
export const getPathFromScreen = (screen) => {
  switch (screen) {
    case 'missions':
      return '/missions';
    case 'hangar':
      return '/hangar';
    case 'leaderboard':
      return '/leaderboard';
    case 'dashboard':
      return '/dashboard';
    case 'wallet':
      return '/wallet';
    case 'quests':
      return '/quests';
    case 'admin':
      return '/admin';
    case 'auth':
      return '/auth';
    case 'gameplay':
      return '/gameplay';
    case 'landing':
    default:
      return '/';
  }
};

function MainAppContent() {
  const { user, profile, isAuthenticated, logout, refreshProfile } = useAuth();
  
  // Initialize current screen from actual browser URL path
  const [currentScreen, setCurrentScreen] = useState(() => {
    const hasToken = !!localStorage.getItem('void_hunter_token');
    return getScreenFromPath(window.location.pathname, hasToken);
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeMission, setActiveMission] = useState({
    id: 'sector-1-mission-1',
    name: 'MISSION 01: RECON PATROL',
    sector: 'Nebula Outpost',
    globalSequence: 1
  });

  // Master navigation handler syncing browser address bar via HTML5 History API
  const navigateTo = (screen, replace = false) => {
    let targetScreen = screen;
    if (targetScreen === 'main_menu' || targetScreen === 'home') {
      targetScreen = isAuthenticated ? 'dashboard' : 'landing';
    }

    const targetPath = getPathFromScreen(targetScreen);
    try {
      if (window.location.pathname !== targetPath) {
        if (replace) {
          window.history.replaceState({ screen: targetScreen }, '', targetPath);
        } else {
          window.history.pushState({ screen: targetScreen }, '', targetPath);
        }
      }
    } catch (e) {
      console.warn('History navigation error:', e);
    }

    setCurrentScreen(targetScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Popstate event listener for browser Back & Forward button navigation
  React.useEffect(() => {
    const handlePopState = () => {
      const targetScreen = getScreenFromPath(window.location.pathname, isAuthenticated);
      setCurrentScreen(targetScreen);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  // Synchronize initial URL address bar if user accessed root while authenticated
  React.useEffect(() => {
    const expectedPath = getPathFromScreen(currentScreen);
    const validAliases = ['/login', '/signup', '/register', '/ships', '/ranks', '/rewards', '/combat'];
    if (window.location.pathname !== expectedPath && !validAliases.includes(window.location.pathname)) {
      window.history.replaceState({ screen: currentScreen }, '', expectedPath);
    }
  }, []);

  // Automatically transition to Dashboard upon authentication if on root landing
  React.useEffect(() => {
    if (isAuthenticated && currentScreen === 'landing') {
      navigateTo('dashboard', true);
    }
  }, [isAuthenticated]);

  // Security Guard: Prevent non-administrators from accessing admin panel
  React.useEffect(() => {
    if (currentScreen === 'admin' && user?.role?.toLowerCase() !== 'admin') {
      navigateTo('dashboard', true);
    }
  }, [currentScreen, user]);

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
        navigateTo('gameplay');
      } catch (e) {
        console.warn('Could not start next mission online:', e.message);
        setActiveMission(nextMission);
        setActiveSessionId(`local-${Date.now()}`);
        navigateTo('gameplay');
      }
    } else {
      // Completed all 50 missions! Return to campaign map
      navigateTo('missions');
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

  // Screens that strictly require pilot login
  const strictlyAuthScreens = ['wallet', 'quests', 'admin', 'dashboard'];
  if (!isAuthenticated && strictlyAuthScreens.includes(currentScreen)) {
    return (
      <AuthPage 
        onBackToGame={() => navigateTo('landing')} 
        onAuthSuccess={() => navigateTo(currentScreen === 'admin' ? 'dashboard' : currentScreen)} 
      />
    );
  }

  // Combat gameplay requires authentication to save combat progress, telemetry, and rewards
  if (!isAuthenticated && currentScreen === 'gameplay') {
    return (
      <AuthPage 
        onBackToGame={() => navigateTo('missions')} 
        onAuthSuccess={() => navigateTo('gameplay')} 
      />
    );
  }

  // Dedicated Public Showcase Pages for Unauthenticated Guests (NO Sidebar, Top Cyber Header Only)
  if (!isAuthenticated) {
    if (currentScreen === 'landing') {
      return (
        <MainMenuPage 
          onNavigate={(screen) => navigateTo(screen)}
        />
      );
    }

    if (currentScreen === 'missions') {
      return (
        <PublicMissionsPage 
          onNavigate={(screen) => navigateTo(screen)}
        />
      );
    }

    if (currentScreen === 'hangar') {
      return (
        <PublicHangarPage 
          onNavigate={(screen) => navigateTo(screen)}
        />
      );
    }

    if (currentScreen === 'leaderboard') {
      return (
        <PublicLeaderboardPage 
          onNavigate={(screen) => navigateTo(screen)}
        />
      );
    }
  }

  // Screen 2: Login / Signup
  if (currentScreen === 'auth') {
    return (
      <AuthPage 
        onBackToGame={() => navigateTo(isAuthenticated ? 'dashboard' : 'landing')} 
        onAuthSuccess={() => navigateTo('dashboard')} 
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
        onExit={(target = 'missions') => navigateTo(target)}
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
            onBack={() => navigateTo(isAuthenticated ? 'dashboard' : 'landing')}
            onNavigate={(screen) => navigateTo(screen)}
            selectedShip={getSelectedShipData()}
            onLaunchMission={(mission, sessionId) => {
              if (!isAuthenticated) {
                setActiveMission(mission);
                navigateTo('auth');
                return;
              }
              setActiveMission(mission);
              setActiveSessionId(sessionId);
              navigateTo('gameplay');
            }}
          />
        );
      case 'hangar':
        return (
          <HangarPage 
            onBack={() => navigateTo(isAuthenticated ? 'dashboard' : 'landing')}
            onNavigate={(screen) => navigateTo(screen)}
            onLaunchMission={() => {
              if (!isAuthenticated) {
                navigateTo('auth');
              } else {
                navigateTo('missions');
              }
            }}
          />
        );
      case 'wallet':
        return (
          <WalletPage 
            onBack={() => navigateTo('dashboard')}
          />
        );
      case 'quests':
        return (
          <QuestsPage 
            onBack={() => navigateTo('dashboard')}
          />
        );
      case 'leaderboard':
        return (
          <LeaderboardPage 
            onBack={() => navigateTo(isAuthenticated ? 'dashboard' : 'landing')}
            onNavigate={(screen) => navigateTo(screen)}
          />
        );
      case 'admin':
        return (
          <AdminDashboardPage 
            onBack={() => navigateTo('dashboard')}
          />
        );
      case 'dashboard':
      default:
        return (
          <DashboardPage 
            onNavigate={(screen) => navigateTo(screen)}
            onLaunchQuickCombat={() => {
              if (!isAuthenticated) {
                navigateTo('auth');
              } else {
                navigateTo('gameplay');
              }
            }}
            selectedShip={getSelectedShipData()}
          />
        );
    }
  };

  // Universal Authenticated App Shell with Cyber Sidebar & Top Navigation
  return (
    <SidebarLayout
      currentScreen={currentScreen}
      onNavigate={(screen) => navigateTo(screen)}
      onOpenSettings={() => setIsSettingsOpen(true)}
    >
      {renderScreenContent()}

      {/* Audio & Controls Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
    </SidebarLayout>
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
