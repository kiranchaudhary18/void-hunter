import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import soundManager from '../game/managers/SoundManager.js';
import { MISSIONS_CATALOG } from '../data/missionsData.js';
import './DashboardPage.css';
import StarfighterCanvas from '../components/StarfighterCanvas.jsx';
import { DailyStreakModal } from '../components/DailyStreakModal.jsx';
import { 
  Play, Compass, Award, ChevronRight, 
  Coins, Zap, Crosshair, Shield, Activity, 
  ShieldCheck, Target, User, Flame, Sparkles, CheckCircle2
} from 'lucide-react';

export const DashboardPage = ({ onNavigate, onLaunchQuickCombat, _selectedShip }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [streakInfo, setStreakInfo] = useState({ currentStreak: 1, streakDay: 1, canClaimToday: false });

  // Real backend-driven state
  const [activeShip, setActiveShip] = useState(null);
  const [dailyQuests, setDailyQuests] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [, setLoadingStats] = useState(true);

  const handleNav = (screenName) => {
    try { soundManager.playLaser(); } catch {}
    if (onNavigate) onNavigate(screenName);
  };

  const completedCount = profile?.stats?.missionsCompleted || 0;
  const currentMissionNumber = Math.min(50, completedCount + 1);

  // Sector title, briefing, and background artwork mapping
  const getSectorInfo = (num) => {
    if (num <= 10) {
      return { 
        sector: 'SECTOR 1', 
        name: 'NEBULA OUTPOST', 
        desc: 'Secure forward recon outposts against Void Vanguard advance scouts in the ionized gaseous borderlands.',
        image: '/assets/sectors/sector_1_nebula.jpg',
        threat: 'CLASS-D RECON',
        reward: '+100 CREDITS'
      };
    }
    if (num <= 20) {
      return { 
        sector: 'SECTOR 2', 
        name: 'DARK ORBIT', 
        desc: 'Navigate dense planetary orbital defenses and intercept stealth strike craft attempting to infiltrate low-orbit satellites.',
        image: '/assets/sectors/sector_2_orbit.jpg',
        threat: 'CLASS-C ESCALATION',
        reward: '+150 CREDITS'
      };
    }
    if (num <= 30) {
      return { 
        sector: 'SECTOR 3', 
        name: 'ASTEROID BELT', 
        desc: 'Navigate through dangerous asteroid debris fields and eliminate hostile vanguard raiders establishing hidden jump relays.',
        image: '/assets/sectors/sector_3_asteroid.jpg',
        threat: 'CLASS-B HAZARD',
        reward: '+200 CREDITS'
      };
    }
    if (num <= 40) {
      return { 
        sector: 'SECTOR 4', 
        name: 'VOID RIFT', 
        desc: 'Penetrate deep dimensional anomalies and survive multi-wave heavy cruisers operating with experimental hyper-weaponry.',
        image: '/assets/sectors/sector_4_rift.jpg',
        threat: 'CLASS-A CRITICAL',
        reward: '+300 CREDITS'
      };
    }
    return { 
      sector: 'SECTOR 5', 
      name: 'FINAL FRONTIER', 
      desc: 'Assault the sovereign flagship citadel and defeat the apex Void Overlord to liberate the outer star systems.',
      image: '/assets/sectors/sector_5_citadel.jpg',
      threat: 'APEX OVERLORD',
      reward: '+500 CREDITS'
    };
  };

  const activeSector = getSectorInfo(currentMissionNumber);

  const pilotCallsign = user?.name || profile?.pilotName || profile?.callsign || 'VIPER-01';
  const pilotAvatarUrl = user?.avatarUrl || profile?.avatarUrl || '';
  const pilotRank = profile?.pilotRank || 'Star Cadet';
  const pilotLevel = Math.max(profile?.level || 1, 1 + completedCount);
  const credits = profile?.credits ?? 0;
  const energyCores = profile?.energyCores ?? 0;

  const renderPowerPips = (score, activeClass = 'active') => {
    const activeCount = Math.max(1, Math.min(10, Math.round((score / 100) * 10)));
    return (
      <div className="cyber-pip-track">
        {Array.from({ length: 10 }).map((_, i) => (
          <span 
            key={i} 
            className={`cyber-pip ${i < activeCount ? activeClass : ''}`} 
          />
        ))}
      </div>
    );
  };

  // Fetch real data: ships, daily quests, and wallet transactions
  const fetchDashboardData = async () => {
    setLoadingStats(true);
    try {
      // 1. Fetch real ship ownership and upgrades
      const shipsRes = await api.get('/ships');
      if (shipsRes.data?.success && shipsRes.data.ships) {
        const equipped = shipsRes.data.ships.find((s) => s.isEquipped) || shipsRes.data.ships[0];
        setActiveShip(equipped);
      }

      // 2. Fetch real daily quests, achievements, and daily streak
      const questsRes = await api.get('/quests');
      if (questsRes.data?.success) {
        setDailyQuests(questsRes.data.dailyQuests || []);
        setAchievements(questsRes.data.achievements || []);
        if (questsRes.data.streak) {
          setStreakInfo(questsRes.data.streak);
          if (questsRes.data.streak.canClaimToday && typeof window !== 'undefined') {
            const hasSeen = sessionStorage.getItem('streak_modal_auto_opened');
            if (!hasSeen) {
              setIsStreakModalOpen(true);
              sessionStorage.setItem('streak_modal_auto_opened', 'true');
            }
          }
        }
      }

      // 3. Fetch real recent wallet ledger transactions
      const ledgerRes = await api.get('/wallet/ledger?limit=4');
      if (ledgerRes.data?.success && ledgerRes.data.transactions) {
        setRecentTransactions(ledgerRes.data.transactions.slice(0, 4));
      }
    } catch (err) {
      console.warn('Dashboard real-time data sync error:', err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [profile?.selectedShipId, profile?.credits]);

  // Compute live ship stats from real upgrades
  const baseStats = activeShip?.baseStats || { firepower: 78, shield: 64, speed: 82, maneuver: 76 };
  const upgrades = activeShip?.upgrades || { weapon: 1, shield: 1, engine: 1, special: 1 };

  const liveFirepower = Math.min(100, (baseStats.firepower || 78) + ((upgrades.weapon || 1) - 1) * 6);
  const liveShield = Math.min(100, (baseStats.shield || 64) + ((upgrades.shield || 1) - 1) * 6);
  const liveSpeed = Math.min(100, (baseStats.speed || 82) + ((upgrades.engine || 1) - 1) * 4);
  const liveManeuver = Math.min(100, (baseStats.maneuver || 76) + ((upgrades.special || 1) - 1) * 4);

  const currentShipName = activeShip?.name ? `${activeShip.code || 'V-01'} ${activeShip.name}` : (profile?.selectedShipId?.toUpperCase() || 'V-01 ORBITRON');
  const currentShipClass = activeShip?.classType ? `${activeShip.classType} • ${activeShip.tagline || 'Combat Ready'}` : 'Balanced Fighter • All-Rounder';

  // Compute 3 upcoming sequential missions from real MISSIONS_CATALOG
  const upcomingMissions = MISSIONS_CATALOG.filter(
    (m) => m.globalSequence >= currentMissionNumber
  ).slice(0, 3);

  const displayedMissions = upcomingMissions.length > 0 
    ? upcomingMissions 
    : MISSIONS_CATALOG.slice(-3);

  // Real unlocked achievements count
  const unlockedAchievementsCount = achievements.filter((a) => a.isUnlocked).length;

  const currentStreakDay = streakInfo.streakDay || 1;
  const currentBannerCrate =
    currentStreakDay === 7
      ? '/assets/rewards/crate_golden_apex.jpg'
      : [2, 3, 6].includes(currentStreakDay)
      ? '/assets/rewards/crate_amethyst_epic.jpg'
      : '/assets/rewards/crate_cyan_rare.jpg';

  return (
    <div className="dashboard-root">
      {/* ================= PILOT CALLSIGN DOSSIER & CURRENCY BAR ================= */}
      <section className="cyber-panel pilot-dossier-bar cyber-interactive-card" aria-label="Pilot Command Dossier">
        <span className="aaa-top-notch" aria-hidden="true" />
        <span className="hud-corner hud-tl" aria-hidden="true" />
        <span className="hud-corner hud-tr" aria-hidden="true" />
        <span className="hud-corner hud-bl" aria-hidden="true" />
        <span className="hud-corner hud-br" aria-hidden="true" />

        <div className="dossier-left-meta">
          <div 
            className="dossier-avatar-box" 
            onClick={() => handleNav('settings')}
            title="Edit Callsign & Photo in Settings"
          >
            {pilotAvatarUrl ? (
              <img src={pilotAvatarUrl} alt={pilotCallsign} className="dossier-avatar-img" />
            ) : (
              <User size={16} color="#00F0FF" />
            )}
          </div>
          <div className="dossier-identity-stack">
            <div className="dossier-callsign-box">
              <span className="dossier-bracket">[</span>
              <span className="dossier-label">PILOT</span>
              <span className="dossier-callsign-name">{pilotCallsign}</span>
              <span className="dossier-bracket">]</span>
            </div>
            <div className="dossier-tick-strip" aria-hidden="true">
              <span className="dossier-tick tick-cyan" />
              <span className="dossier-tick tick-coral" />
              <span className="dossier-tick tick-muted" />
            </div>
          </div>
          <div className="dossier-rank-badge">
            <Shield size={13} color="#00F0FF" />
            <span>LVL {pilotLevel} • {pilotRank.toUpperCase()}</span>
          </div>
          <div className="dossier-sorties-badge">
            <Target size={13} color="#FACC15" />
            <span>{completedCount} / 50 CLEARED</span>
          </div>
        </div>

        <div className="dossier-currencies-group">
          <div className="dossier-currency-pill pill-gold" onClick={() => handleNav('wallet')} title="Combat Credits Balance">
            <span className="cyber-pulse-dot" style={{ color: '#FACC15' }} />
            <Coins size={14} color="#FACC15" />
            <span className="currency-val">{credits.toLocaleString()}</span>
            <span className="currency-lbl">CR</span>
          </div>

          <div className="dossier-currency-pill pill-purple" onClick={() => handleNav('wallet')} title="Energy Cores">
            <span className="cyber-pulse-dot" style={{ color: '#C084FC' }} />
            <Zap size={14} color="#C084FC" />
            <span className="currency-val">{energyCores}</span>
            <span className="currency-lbl">CORES</span>
          </div>
        </div>

        <div className="dossier-action-wrap">
          <button
            id="dossier-instant-sortie"
            onClick={() => onLaunchQuickCombat ? onLaunchQuickCombat() : handleNav('gameplay')}
            className="cyber-action-btn-primary dossier-sortie-btn"
            title="Instant Combat Sortie Deployment"
          >
            <Play size={14} fill="currentColor" />
            <span>PLAY MISSION</span>
          </button>
        </div>
      </section>

      {/* ================= 1B. 7-DAY SUPPLY DROP LIVE BANNER ================= */}
      <div 
        className={`dashboard-streak-banner cyber-panel cyber-interactive-card ${streakInfo.canClaimToday ? 'is-claimable' : ''}`}
        onClick={() => {
          try { soundManager.playLaser(); } catch {}
          setIsStreakModalOpen(true);
        }}
        title="Open 7-Day Supply Drop & Mystery Crate Calendar"
      >
        <span className="aaa-top-notch aaa-top-notch-gold" aria-hidden="true" />
        <span className="hud-corner hud-tl" style={{ borderColor: '#FACC15' }} aria-hidden="true" />
        <span className="hud-corner hud-tr" style={{ borderColor: '#FACC15' }} aria-hidden="true" />
        <span className="hud-corner hud-bl" style={{ borderColor: '#FACC15' }} aria-hidden="true" />
        <span className="hud-corner hud-br" style={{ borderColor: '#FACC15' }} aria-hidden="true" />

        <div className="streak-banner-left">
          <div className={`streak-crate-pedestal ${currentStreakDay === 7 ? 'pedestal-gold' : 'pedestal-cyan'}`}>
            <img
              src={currentBannerCrate}
              alt="Daily Supply Crate"
              className="streak-banner-crate-img aaa-crate-blend"
            />
          </div>
          <div className="streak-banner-text">
            <div className="streak-banner-title">
              <span>7-DAY SUPPLY DROP</span>
              <span className="streak-consecutive-tag">
                <Flame size={11} />
                DAY {currentStreakDay} / 7 • {streakInfo.currentStreak || 1}D STREAK
              </span>
            </div>
            <div className="streak-banner-progress-row">
              <div className="aaa-segment-track">
                {Array.from({ length: 7 }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const filled =
                    dayNum < currentStreakDay ||
                    (dayNum === currentStreakDay && !streakInfo.canClaimToday);
                  const isTodayReady = dayNum === currentStreakDay && streakInfo.canClaimToday;
                  const cellClass =
                    dayNum === 7 && filled
                      ? 'gold'
                      : isTodayReady
                      ? 'current'
                      : filled
                      ? 'filled'
                      : '';
                  return <span key={dayNum} className={`aaa-segment-cell ${cellClass}`} />;
                })}
              </div>
              <span className="streak-banner-submeta">Day 7 Golden Apex Crate</span>
            </div>
          </div>
        </div>

        <div className="streak-banner-right">
          {streakInfo.canClaimToday ? (
            <button 
              className="aaa-btn-claim streak-aaa-claim-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsStreakModalOpen(true);
              }}
            >
              <Sparkles size={14} />
              <span>CLAIM SUPPLY DROP</span>
            </button>
          ) : (
            <div className="streak-claimed-badge">
              <CheckCircle2 size={14} color="#20D6A0" />
              <span>SUPPLY SECURED</span>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-top-hero-grid">
        {/* LEFT: CINEMATIC MISSION BRIEFING (HERO) */}
        <section className="cyber-panel hero-mission-briefing" aria-label="Current Mission Briefing">
          <span className="aaa-top-notch aaa-top-notch-coral" aria-hidden="true" />
          {/* Tactical Corner HUD Brackets */}
          <span className="hud-corner hud-tl" aria-hidden="true" />
          <span className="hud-corner hud-tr" aria-hidden="true" />
          <span className="hud-corner hud-bl" aria-hidden="true" />
          <span className="hud-corner hud-br" aria-hidden="true" />

          {/* Deep Space / Asteroid Field Sector Artwork */}
          <div 
            className="hero-backdrop-artwork" 
            style={{ backgroundImage: `url(${activeSector.image})` }} 
            aria-hidden="true"
          />
          <div className="hero-backdrop-overlay" aria-hidden="true" />

          <div className="hero-content-layer">
            {/* Header row */}
            <div className="hero-header-row">
              <div className="hero-eyebrow-badge">
                <Target size={13} />
                <span>CONTINUE YOUR JOURNEY</span>
              </div>
              <div className="hero-mission-counter">
                MISSION {String(currentMissionNumber).padStart(2, '0')} / 50
              </div>
            </div>

            {/* Mission Briefing Body */}
            <div className="hero-body">
              <div className="hero-sector-subtitle">
                {activeSector.sector.toUpperCase()} REGION
              </div>
              <h1 className="hero-sector-title">
                {activeSector.name}
              </h1>
              <p className="hero-sector-desc">
                {activeSector.desc}
              </p>

              {/* Tactical Telemetry Chips */}
              <div className="hero-telemetry-row">
                <span className="hero-telemetry-chip chip-cyan">
                  <Activity size={12} />
                  <span>THREAT: {activeSector.threat}</span>
                </span>
                <span className="hero-telemetry-chip chip-gold">
                  <Coins size={12} />
                  <span>ESTIMATED: {activeSector.reward}</span>
                </span>
                <span className="hero-telemetry-chip">
                  <ShieldCheck size={12} />
                  <span>MISSION READY</span>
                </span>
              </div>
            </div>

            {/* Primary & Secondary Action Buttons */}
            <div className="hero-actions-row">
              <button
                id="dashboard-btn-continue"
                onClick={() => onLaunchQuickCombat ? onLaunchQuickCombat() : handleNav('gameplay')}
                className="cyber-action-btn-primary btn-continue-mission"
                title="Launch Combat Sortie"
              >
                <Play size={16} fill="currentColor" />
                <span>CONTINUE MISSION</span>
              </button>

              <button
                onClick={() => handleNav('missions')}
                className="btn-sector-map"
                title="Open Galactic Campaign Map"
              >
                <Compass size={15} />
                <span>SECTOR MAP</span>
              </button>
            </div>
          </div>
        </section>

        {/* RIGHT: ACTIVE STARFIGHTER PANEL */}
        <section className="cyber-panel starfighter-panel" aria-label="Active Starfighter Viewport">
          <span className="aaa-top-notch" aria-hidden="true" />
          <span className="hud-corner hud-tl" style={{ borderColor: '#00F0FF' }} aria-hidden="true" />
          <span className="hud-corner hud-tr" style={{ borderColor: '#00F0FF' }} aria-hidden="true" />
          <span className="hud-corner hud-bl" style={{ borderColor: '#00F0FF' }} aria-hidden="true" />
          <span className="hud-corner hud-br" style={{ borderColor: '#00F0FF' }} aria-hidden="true" />

          {/* Panel Header */}
          <div>
            <div className="starfighter-panel-header">
              <div>
                <span className="starfighter-eyebrow">MY ACTIVE STARFIGHTER</span>
                <h2 className="starfighter-name">{currentShipName}</h2>
                <span className="starfighter-class-tag">{currentShipClass}</span>
              </div>
              <button
                onClick={() => handleNav('hangar')}
                className="btn-open-hangar"
                title="Go to Hangar"
              >
                <span>OPEN HANGAR</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Holographic Ship Viewport Card with Illuminated Launch Deck */}
            <div className="starfighter-viewport">
              <div className="hologram-deck-runway" aria-hidden="true" />
              <div className="hologram-grid-floor" aria-hidden="true" />
              <StarfighterCanvas 
                shipId={activeShip?.id || profile?.selectedShipId || 's02-phoenix'}
                shipCode={activeShip?.code}
                size={148}
                animated={true}
                className="starfighter-render-canvas"
              />
            </div>

            {/* Equipment Loadout Chips */}
            <div className="starfighter-loadout-chips">
              <div className="loadout-chip">
                <span className="loadout-chip-label">PRIMARY WEAPON</span>
                <span className="loadout-chip-name">{activeShip?.primaryWeapon || 'Plasma Cannon'}</span>
              </div>
              <div className="loadout-chip">
                <span className="loadout-chip-label">DEFLECTOR</span>
                <span className="loadout-chip-name">{activeShip?.defensiveSystem || 'Kinetic Shield'}</span>
              </div>
              <div className="loadout-chip">
                <span className="loadout-chip-label">ENGINE</span>
                <span className="loadout-chip-name">{activeShip?.propulsion || 'Hyper-Ion Drive'}</span>
              </div>
            </div>
          </div>

          {/* 4 Segmented Tactical Power Gauges */}
          <div className="starfighter-stats-list">
            <div className="ship-stat-track-row">
              <span className="ship-stat-label">FIREPOWER (LVL {upgrades.weapon || 1})</span>
              <div className="ship-stat-pips-wrap">
                {renderPowerPips(liveFirepower, 'active-purple')}
              </div>
              <span className="ship-stat-value">{liveFirepower}</span>
            </div>

            <div className="ship-stat-track-row">
              <span className="ship-stat-label">SHIELD (LVL {upgrades.shield || 1})</span>
              <div className="ship-stat-pips-wrap">
                {renderPowerPips(liveShield, 'active')}
              </div>
              <span className="ship-stat-value">{liveShield}</span>
            </div>

            <div className="ship-stat-track-row">
              <span className="ship-stat-label">SPEED (LVL {upgrades.engine || 1})</span>
              <div className="ship-stat-pips-wrap">
                {renderPowerPips(liveSpeed, 'active-gold')}
              </div>
              <span className="ship-stat-value">{liveSpeed}</span>
            </div>

            <div className="ship-stat-track-row">
              <span className="ship-stat-label">MANEUVER (LVL {upgrades.special || 1})</span>
              <div className="ship-stat-pips-wrap">
                {renderPowerPips(liveManeuver, 'active')}
              </div>
              <span className="ship-stat-value">{liveManeuver}</span>
            </div>
          </div>
        </section>
      </div>

      {/* ================= 2. LOWER DASHBOARD MODULES (3 BALANCED COLUMNS) ================= */}
      <div className="dashboard-lower-grid">
        
        {/* MODULE 1: UPCOMING MISSIONS */}
        <section className="cyber-panel module-card" aria-label="Upcoming Missions Module">
          <span className="aaa-top-notch" aria-hidden="true" />
          <div className="module-header">
            <div className="module-title-group">
              <Crosshair size={15} color="#00E5FF" />
              <h3 className="module-title">UPCOMING MISSIONS</h3>
            </div>
            <button onClick={() => handleNav('missions')} className="module-action-link">
              ALL MISSIONS &rarr;
            </button>
          </div>

          <div className="missions-stack">
            {displayedMissions.map((m) => (
              <div 
                key={m.id} 
                className="mission-row-card"
                onClick={() => handleNav('missions')}
                title={`Launch ${m.name || 'Mission'}`}
              >
                <div className="mission-row-left">
                  <div className="mission-row-icon-box">
                    <Crosshair size={14} />
                  </div>
                  <div>
                    <div className="mission-row-name">
                      {m.name || `MISSION ${String(m.globalSequence).padStart(2, '0')}`}
                    </div>
                    <div className="mission-row-sub">
                      {m.sectorName || 'Nebula Outpost'} • {m.objectiveType?.replace('_', ' ').toUpperCase() || 'COMBAT'}
                    </div>
                  </div>
                </div>

                <div className="mission-row-right">
                  <div className="mission-reward-badge">
                    <Coins size={12} />
                    <span>+{m.rewards?.credits || 100}</span>
                  </div>
                  <ChevronRight size={14} color="#96A6C8" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MODULE 2: DAILY MISSIONS & CONTRACTS */}
        <section className="cyber-panel module-card" aria-label="Daily Directives Module">
          <span className="aaa-top-notch" aria-hidden="true" />
          <div className="module-header">
            <div className="module-title-group">
              <Target size={15} color="#00E5FF" />
              <h3 className="module-title">DAILY TASKS</h3>
            </div>
            <button onClick={() => handleNav('quests')} className="module-action-link">
              DIRECTIVES &rarr;
            </button>
          </div>

          <div className="daily-contracts-stack">
            {dailyQuests.length === 0 ? (
              <div className="module-empty-notice">
                Synchronizing daily flight contracts with fleet server...
              </div>
            ) : (
              dailyQuests.slice(0, 3).map((q) => {
                const pct = Math.min(100, Math.round(((q.progress || 0) / (q.target || 1)) * 100));
                const claimed = Boolean(q.isClaimed || q.claimed);
                const rewardAmt = q.rewards?.credits ?? q.rewardCredits ?? 100;
                return (
                  <div key={q.id} className="contract-card">
                    <div className="contract-header">
                      <span className="contract-title">{q.title}</span>
                      <span className="contract-reward">
                        +{rewardAmt} <Coins size={11} />
                      </span>
                    </div>
                    <div className="contract-bar-row">
                      <div className="contract-bar-slot">
                        <div 
                          className="contract-bar-fill" 
                          style={{ 
                            width: `${pct}%`, 
                            background: claimed 
                              ? 'linear-gradient(90deg, #10B981, #20D6A0)' 
                              : 'linear-gradient(90deg, #FF4D5A, #FF8A4C, #00F0FF)' 
                          }} 
                        />
                      </div>
                      <span className={`contract-progress-text ${claimed ? 'contract-claimed-badge' : ''}`}>
                        {claimed ? 'CLAIMED' : `${q.progress || 0} / ${q.target}`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* MODULE 3: RECENT REWARDS & ACHIEVEMENTS */}
        <section className="cyber-panel module-card" aria-label="Rewards and Achievements Module">
          <span className="aaa-top-notch aaa-top-notch-gold" aria-hidden="true" />
          <div className="module-header">
            <div className="module-title-group">
              <Award size={15} color="#FBBF24" />
              <h3 className="module-title">RECENT REWARDS</h3>
            </div>
            <button onClick={() => handleNav('wallet')} className="module-action-link">
              VIEW WALLET &rarr;
            </button>
          </div>

          <div className="telemetry-module-body">
            {/* Recent Ledger Transactions */}
            <div className="recent-rewards-feed">
              {recentTransactions.length === 0 ? (
                <div className="module-empty-notice" style={{ padding: '10px 0' }}>
                  No recent transactions recorded. Complete missions to earn credits.
                </div>
              ) : (
                recentTransactions.slice(0, 3).map((tx, idx) => {
                  const isCredit = tx.transactionType === 'CREDIT';
                  const formattedTime = tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent';
                  return (
                    <div 
                      key={tx._id || tx.id || `tx-${idx}`} 
                      className="reward-feed-row"
                      onClick={() => handleNav('wallet')}
                    >
                      <div className="reward-feed-left">
                        <div className={`feed-icon-box ${tx.currencyType === 'ENERGY_CORES' ? 'feed-icon-purple' : 'feed-icon-gold'}`}>
                          {tx.currencyType === 'ENERGY_CORES' ? <Zap size={12} /> : <Coins size={12} />}
                        </div>
                        <div>
                          <div className="feed-source-text">{tx.description || tx.source || 'Flight Reward'}</div>
                          <div className="feed-time-text">{formattedTime}</div>
                        </div>
                      </div>
                      <span className={`feed-amount-badge ${tx.currencyType === 'ENERGY_CORES' ? 'amount-purple' : 'amount-gold'}`}>
                        {isCredit ? `+${tx.amount}` : `-${tx.amount}`} {tx.currencyType === 'ENERGY_CORES' ? 'CORES' : 'CR'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Achievements Preview Rack */}
            <div className="achievements-preview-rack">
              <div className="achievements-rack-header">
                <span>ACHIEVEMENTS PREVIEW</span>
                <span style={{ color: '#00E5FF' }}>{unlockedAchievementsCount} / {achievements.length || 10}</span>
              </div>
              <div className="achievements-icons-grid">
                {achievements.slice(0, 6).map((a) => (
                  <div 
                    key={a.id} 
                    className={`achievement-icon-slot ${a.isUnlocked ? 'unlocked' : 'locked'}`}
                    title={`${a.title}: ${a.description} (${a.isUnlocked ? 'UNLOCKED' : 'LOCKED'})`}
                    onClick={() => handleNav('quests')}
                  >
                    <Award size={16} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* 7-DAY DAILY DEPLOYMENT STREAK & MYSTERY CRATE MODAL */}
      <DailyStreakModal 
        isOpen={isStreakModalOpen}
        initialData={streakInfo}
        onClose={() => setIsStreakModalOpen(false)}
        onRewardClaimed={(payload) => {
          if (refreshProfile) refreshProfile();
          setStreakInfo((prev) => ({
            ...prev,
            canClaimToday: false,
            currentStreak: payload.updatedBalances?.streak || prev.currentStreak
          }));
          fetchDashboardData();
        }}
      />
    </div>
  );
};

export default DashboardPage;
