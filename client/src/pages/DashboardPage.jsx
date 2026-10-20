import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import soundManager from '../game/managers/SoundManager.js';
import { MISSIONS_CATALOG } from '../data/missionsData.js';
import './DashboardPage.css';
import { 
  Play, Compass, Award, ChevronRight, 
  Coins, Zap, Crosshair, Shield, Activity, 
  Flame, Gauge, ShieldCheck, Target, ArrowRight
} from 'lucide-react';

export const DashboardPage = ({ onNavigate, onLaunchQuickCombat, selectedShip }) => {
  const { profile } = useAuth();

  // Real backend-driven state
  const [activeShip, setActiveShip] = useState(null);
  const [dailyQuests, setDailyQuests] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

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

      // 2. Fetch real daily quests and achievements
      const questsRes = await api.get('/quests');
      if (questsRes.data?.success) {
        setDailyQuests(questsRes.data.dailyQuests || []);
        setAchievements(questsRes.data.achievements || []);
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

  // Authentic ship artwork mapping
  const getShipIllustration = (shipId, shipCode) => {
    const combined = `${shipId || ''} ${shipCode || ''}`.toLowerCase();
    if (combined.includes('nova') || combined.includes('z05') || combined.includes('z-05')) return '/assets/ships/ship_nova.jpg';
    if (combined.includes('phoenix') || combined.includes('s02') || combined.includes('s-02')) return '/assets/ships/ship_phoenix.jpg';
    if (combined.includes('shadow') || combined.includes('x03') || combined.includes('x-03')) return '/assets/ships/ship_shadow.jpg';
    if (combined.includes('titan') || combined.includes('r04') || combined.includes('r-04')) return '/assets/ships/ship_titan.jpg';
    return '/assets/ships/ship_orbitron.jpg';
  };

  const shipImage = getShipIllustration(activeShip?.id || profile?.selectedShipId, activeShip?.code);
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

  return (
    <div className="dashboard-root">
      {/* ================= 1. TOP HERO SECTION (2 BALANCED COLUMNS) ================= */}
      <div className="dashboard-top-hero-grid">
        {/* LEFT: CINEMATIC MISSION BRIEFING (HERO) */}
        <section className="cyber-panel hero-mission-briefing" aria-label="Current Mission Briefing">
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
                // {activeSector.sector} OVERWATCH
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
                  <span>SECTOR GATE: RECON READY</span>
                </span>
              </div>
            </div>

            {/* Primary & Secondary Action Buttons */}
            <div className="hero-actions-row">
              <button
                id="dashboard-btn-continue"
                onClick={() => onLaunchQuickCombat ? onLaunchQuickCombat() : handleNav('gameplay')}
                className="btn-continue-mission"
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
          <span className="hud-corner hud-tl" style={{ borderColor: '#8B5CF6' }} aria-hidden="true" />
          <span className="hud-corner hud-tr" style={{ borderColor: '#8B5CF6' }} aria-hidden="true" />
          <span className="hud-corner hud-bl" style={{ borderColor: '#8B5CF6' }} aria-hidden="true" />
          <span className="hud-corner hud-br" style={{ borderColor: '#8B5CF6' }} aria-hidden="true" />

          {/* Panel Header */}
          <div>
            <div className="starfighter-panel-header">
              <div>
                <span className="starfighter-eyebrow">// ACTIVE STARFIGHTER</span>
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

            {/* Holographic Ship Viewport Card with Authentic Render */}
            <div className="starfighter-viewport">
              <div className="hologram-grid-floor" aria-hidden="true" />
              <img 
                src={shipImage} 
                alt={currentShipName}
                className="starfighter-render-image"
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

          {/* 4 Tactical Module Stat Tracks */}
          <div className="starfighter-stats-list">
            <div className="ship-stat-track-row">
              <span className="ship-stat-label">FIREPOWER (LVL {upgrades.weapon || 1})</span>
              <div className="ship-stat-bar-slot">
                <div 
                  className="ship-stat-bar-fill" 
                  style={{ width: `${liveFirepower}%`, background: 'linear-gradient(90deg, #6D28D9, #A855F7)' }} 
                />
              </div>
              <span className="ship-stat-value">{liveFirepower}</span>
            </div>

            <div className="ship-stat-track-row">
              <span className="ship-stat-label">SHIELD (LVL {upgrades.shield || 1})</span>
              <div className="ship-stat-bar-slot">
                <div 
                  className="ship-stat-bar-fill" 
                  style={{ width: `${liveShield}%`, background: 'linear-gradient(90deg, #0088FF, #00E5FF)' }} 
                />
              </div>
              <span className="ship-stat-value">{liveShield}</span>
            </div>

            <div className="ship-stat-track-row">
              <span className="ship-stat-label">SPEED (LVL {upgrades.engine || 1})</span>
              <div className="ship-stat-bar-slot">
                <div 
                  className="ship-stat-bar-fill" 
                  style={{ width: `${liveSpeed}%`, background: 'linear-gradient(90deg, #D97706, #FBBF24)' }} 
                />
              </div>
              <span className="ship-stat-value">{liveSpeed}</span>
            </div>

            <div className="ship-stat-track-row">
              <span className="ship-stat-label">MANEUVER (LVL {upgrades.special || 1})</span>
              <div className="ship-stat-bar-slot">
                <div 
                  className="ship-stat-bar-fill" 
                  style={{ width: `${liveManeuver}%`, background: 'linear-gradient(90deg, #059669, #20D6A0)' }} 
                />
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
          <div className="module-header">
            <div className="module-title-group">
              <Target size={15} color="#00E5FF" />
              <h3 className="module-title">DAILY DIRECTIVES</h3>
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
                return (
                  <div key={q.id} className="contract-card">
                    <div className="contract-header">
                      <span className="contract-title">{q.title}</span>
                      <span className="contract-reward">
                        +{q.rewardCredits || 100} <Coins size={11} />
                      </span>
                    </div>
                    <div className="contract-bar-row">
                      <div className="contract-bar-slot">
                        <div 
                          className="contract-bar-fill" 
                          style={{ 
                            width: `${pct}%`, 
                            background: q.isClaimed 
                              ? '#20D6A0' 
                              : 'linear-gradient(90deg, #00E5FF, #8B5CF6)' 
                          }} 
                        />
                      </div>
                      <span className={`contract-progress-text ${q.isClaimed ? 'contract-claimed-badge' : ''}`}>
                        {q.isClaimed ? 'CLAIMED' : `${q.progress || 0} / ${q.target}`}
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
          <div className="module-header">
            <div className="module-title-group">
              <Award size={15} color="#FBBF24" />
              <h3 className="module-title">REWARDS & LEDGER</h3>
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
                  No recent ledger transactions recorded. Complete sorties to earn credits.
                </div>
              ) : (
                recentTransactions.slice(0, 3).map((tx) => {
                  const isCredit = tx.transactionType === 'CREDIT';
                  return (
                    <div 
                      key={tx._id || tx.id || Math.random()} 
                      className="reward-feed-row"
                      onClick={() => handleNav('wallet')}
                    >
                      <div className="reward-feed-left">
                        <div className={`feed-icon-box ${tx.currencyType === 'ENERGY_CORES' ? 'feed-icon-purple' : 'feed-icon-gold'}`}>
                          {tx.currencyType === 'ENERGY_CORES' ? <Zap size={12} /> : <Coins size={12} />}
                        </div>
                        <div>
                          <div className="feed-source-text">{tx.description || tx.source || 'Flight Reward'}</div>
                          <div className="feed-time-text">{new Date(tx.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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
    </div>
  );
};

export default DashboardPage;
