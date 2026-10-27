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
import SettingsPage from './pages/SettingsPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import SidebarLayout from './components/SidebarLayout.jsx';
import GlobalAudioPlayer from './components/GlobalAudioPlayer.jsx';
import soundManager from './game/managers/SoundManager.js';
import api from './services/api.js';
import { MISSIONS_CATALOG } from './data/missionsData.js';
import './App.css';
import { getScreenFromPath, getPathFromScreen } from './utils/navigationUtils.js';

function MainAppContent() {
  const { user, profile, isAuthenticated, refreshProfile } = useAuth();
  
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

  // Seamless Global Background Music Synchronization across all pages & gameplay
  React.useEffect(() => {
    if (currentScreen === 'gameplay') {
      soundManager.startBGM('combat');
    } else {
      soundManager.startBGM(soundManager.bgmMode || soundManager.desiredBgmMode || 'vocal');
    }
  }, [currentScreen]);

  // Universal first-gesture unlock so soundtrack begins on any user click/tap/keypress
  React.useEffect(() => {
    const handleFirstGesture = () => {
      soundManager.unlockAudio();
    };
    window.addEventListener('click', handleFirstGesture, { capture: true });
    window.addEventListener('pointerdown', handleFirstGesture, { capture: true });
    window.addEventListener('keydown', handleFirstGesture, { capture: true });
    return () => {
      window.removeEventListener('click', handleFirstGesture, { capture: true });
      window.removeEventListener('pointerdown', handleFirstGesture, { capture: true });
      window.removeEventListener('keydown', handleFirstGesture, { capture: true });
    };
  }, []);

  // Master navigation handler syncing browser address bar via HTML5 History API
  const navigateTo = React.useCallback((screen, replace = false) => {
    let targetScreen = screen;
    if (targetScreen === 'main_menu' || targetScreen === 'home') {
      targetScreen = 'landing';
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

    setIsSettingsOpen(false);
    setCurrentScreen(targetScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Popstate event listener for browser Back & Forward button navigation
  React.useEffect(() => {
    const handlePopState = () => {
      const targetScreen = getScreenFromPath(window.location.pathname, isAuthenticated);
      setCurrentScreen(targetScreen);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  // Preserve Main Menu landing page accessibility for authenticated pilots

  // Security Guard: Prevent non-administrators from accessing admin panel
  React.useEffect(() => {
    if (currentScreen === 'admin' && user?.role?.toLowerCase() !== 'admin') {
      navigateTo('dashboard', true);
    }
  }, [currentScreen, user, navigateTo]);

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

  // Launch a specified mission directly from Main Menu or Campaign
  const handleStartMission = async (mission) => {
    if (!isAuthenticated) {
      setActiveMission(mission);
      navigateTo('auth');
      return;
    }
    try {
      const ship = getSelectedShipData();
      const res = await api.post(`/missions/${mission.id}/start`, {
        shipId: ship?.id || 'v01-orbitron'
      });
      const newSessionId = res.data?.sessionId || res.data?.session?.id || `local-${Date.now()}`;
      setActiveMission(mission);
      setActiveSessionId(newSessionId);
      navigateTo('gameplay');
    } catch (e) {
      console.warn('Could not start mission online:', e.message);
      setActiveMission(mission);
      setActiveSessionId(`local-${Date.now()}`);
      navigateTo('gameplay');
    }
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
      const sessionIdToUse = activeSessionId || `session-auto-${Date.now()}`;
      const res = await api.post(`/missions/${sessionIdToUse}/complete`, {
        missionId: activeMission?.id || 'sector-1-mission-1',
        finalScore: result.score || 0,
        durationSeconds: Math.max(12, result.durationSeconds || 45),
        damageTaken: Math.max(0, 100 - (result.healthRemaining !== undefined ? result.healthRemaining : 100)),
        telemetry: {
          enemiesDestroyed: result.enemiesKilled || 0,
          accuracyPercentage: result.enemiesKilled >= 10 ? 88 : 65,
          healthRemaining: result.healthRemaining !== undefined ? result.healthRemaining : 100,
          missionId: activeMission?.id || 'sector-1-mission-1'
        }
      });
      console.log('[COMBAT ENGINE] Mission Completion Server Response:', res);
    } catch (err) {
      console.warn('Could not post mission completion telemetry:', err.message);
    }
    if (refreshProfile) {
      await refreshProfile();
    }
  };

  // Helper to start the next recommended or active mission with a real backend session
  const handleQuickCombatLaunch = async () => {
    if (!isAuthenticated) {
      navigateTo('auth');
      return;
    }
    const completedCount = profile?.stats?.missionsCompleted || 0;
    const nextSeq = Math.min(50, completedCount + 1);
    const targetMission = MISSIONS_CATALOG.find((m) => m.globalSequence === nextSeq) || MISSIONS_CATALOG[0];
    await handleStartMission(targetMission);
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

  // Screen 1: Home / Main Menu Page (Full-width AAA sci-fi space layout)
  if (currentScreen === 'landing') {
    return (
      <MainMenuPage 
        onNavigate={(screen) => navigateTo(screen)}
        onLaunchMission={handleStartMission}
      />
    );
  }

  // Dedicated Public Showcase Pages for Unauthenticated Guests (NO Sidebar, Top Cyber Header Only)
  if (!isAuthenticated) {

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

  // Screen: Reset Password
  if (currentScreen === 'reset-password') {
    return (
      <ResetPasswordPage 
        onNavigate={(screen) => navigateTo(screen)} 
        onAuthSuccess={() => navigateTo('dashboard')} 
      />
    );
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
      case 'reset-password':
        return (
          <ResetPasswordPage 
            onNavigate={(screen) => navigateTo(screen)} 
            onAuthSuccess={() => navigateTo('dashboard')} 
          />
        );
      case 'settings':
        return (
          <SettingsPage 
            onBack={() => navigateTo('dashboard')}
            onNavigate={(screen) => navigateTo(screen)}
          />
        );
      case 'dashboard':
      default:
        return (
          <DashboardPage 
            onNavigate={(screen) => navigateTo(screen)}
            onLaunchQuickCombat={handleQuickCombatLaunch}
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
      onLaunchCombat={handleQuickCombatLaunch}
      onOpenSettings={() => setIsSettingsOpen((prev) => !prev)}
      onCloseSettings={() => setIsSettingsOpen(false)}
      isSettingsOpen={isSettingsOpen}
    >
      {renderScreenContent()}

      {/* Audio & Controls Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}

      {/* Global Audio Widget (Hidden during active combat sortie) */}
      {currentScreen !== 'gameplay' && <GlobalAudioPlayer />}
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

export default App;
