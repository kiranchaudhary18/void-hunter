import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import { SECTORS_LIST, MISSIONS_CATALOG } from '../data/missionsData.js';
import EnlistPromptModal from './EnlistPromptModal.jsx';
import { 
  Star, Lock, Play, Shield, Award, 
  Coins, Zap, Compass, Crosshair, Skull, 
  Check, AlertCircle, FileText, ChevronRight, Activity, Target
} from 'lucide-react';
import '../pages/MissionsPage.css';

// Sector Artwork Maps
const SECTOR_ARTWORKS = {
  'sector-1': '/assets/sectors/sector_1_nebula.jpg',
  'sector-2': '/assets/sectors/sector_2_orbit.jpg',
  'sector-3': '/assets/sectors/sector_3_asteroid.jpg',
  'sector-4': '/assets/sectors/sector_4_rift.jpg',
  'sector-5': '/assets/sectors/sector_5_citadel.jpg'
};

// 10 Strategic Mission Map Coordinates (normalized % for 1000x600 SVG canvas)
const MAP_NODES_CONFIG = [
  { seq: 1, x: 10, y: 78 },
  { seq: 2, x: 21, y: 58 },
  { seq: 3, x: 16, y: 28 },
  { seq: 4, x: 31, y: 18 },
  { seq: 5, x: 45, y: 38 },
  { seq: 6, x: 38, y: 74 },
  { seq: 7, x: 58, y: 78 },
  { seq: 8, x: 72, y: 55 },
  { seq: 9, x: 66, y: 24 },
  { seq: 10, x: 88, y: 36 } // Boss node
];

// Smooth Bezier Curve Path Connectors for viewBox="0 0 1000 600"
const MAP_CONNECTORS = [
  { from: 1, to: 2, d: "M 100 468 C 140 415, 175 380, 210 348" },
  { from: 2, to: 3, d: "M 210 348 C 225 270, 140 220, 160 168" },
  { from: 3, to: 4, d: "M 160 168 C 185 125, 255 100, 310 108" },
  { from: 4, to: 5, d: "M 310 108 C 370 120, 410 180, 450 228" },
  { from: 5, to: 6, d: "M 450 228 C 485 275, 335 390, 380 444" },
  { from: 6, to: 7, d: "M 380 444 C 430 485, 520 490, 580 468" },
  { from: 7, to: 8, d: "M 580 468 C 640 440, 680 380, 720 330" },
  { from: 8, to: 9, d: "M 720 330 C 750 270, 635 190, 660 144" },
  { from: 9, to: 10, d: "M 660 144 C 700 95, 820 160, 880 216" }
];

export const MissionsView = ({ 
  isPublic = false, 
  onNavigate, 
  onLaunchMission, 
  selectedShip = { id: 'v01-orbitron', name: 'V-01 ORBITRON', speed: 380, damage: 25 } 
}) => {
  const { user, profile, isAuthenticated } = useAuth();
  const [activeSectorId, setActiveSectorId] = useState('sector-1');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [launchingId, setLaunchingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [enlistModalOpen, setEnlistModalOpen] = useState(false);

  // Fetch real missions & pilot progress from backend API
  const fetchMissionsProgress = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.get('/missions');
      const missionList = res.missions || res.data?.missions;
      if (missionList && missionList.length > 0) {
        setMissions(missionList);
      } else {
        setMissions(MISSIONS_CATALOG.map((m) => ({
          ...m,
          isUnlocked: m.globalSequence === 1,
          isCompleted: false,
          stars: 0,
          highScore: 0
        })));
      }
    } catch (err) {
      console.warn('Backend missions API fallback to local catalog:', err.message);
      setMissions(MISSIONS_CATALOG.map((m) => ({
        ...m,
        isUnlocked: m.globalSequence === 1,
        isCompleted: false,
        stars: 0,
        highScore: 0
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissionsProgress();
  }, [isAuthenticated]);

  // Active Sector Object
  const currentSector = useMemo(() => {
    return SECTORS_LIST.find((s) => s.id === activeSectorId) || SECTORS_LIST[0];
  }, [activeSectorId]);

  // Overall Real Metrics
  const totalMissionsCount = missions.length || 50;
  const totalCompleted = missions.filter((m) => m.isCompleted).length;
  const campaignProgressPct = Math.min(100, Math.round((totalCompleted / totalMissionsCount) * 100));
  const currentCampaignSortieNum = Math.min(50, totalCompleted + 1);

  // Sector Level Missions (10 sequential sorties per sector)
  const sectorMissions = useMemo(() => {
    return missions.filter((m) => m.sectorId === activeSectorId);
  }, [missions, activeSectorId]);

  // Default selected mission on sector load or switch: the first available uncompleted mission, or node 1
  useEffect(() => {
    if (sectorMissions.length > 0) {
      const currentAvailable = sectorMissions.find((m) => m.isUnlocked && !m.isCompleted);
      setSelectedMission(currentAvailable || sectorMissions[0]);
    }
  }, [activeSectorId, sectorMissions.length]);

  // Mission Launch Handler
  const handleLaunch = async (mission) => {
    if (!isAuthenticated) {
      soundManager.playLaser();
      setEnlistModalOpen(true);
      return;
    }

    if (!mission.isUnlocked) {
      soundManager.playShieldHit();
      setErrorMessage(`Sortie ${mission.name} is locked. Decrypt prior combat coordinates first.`);
      setTimeout(() => setErrorMessage(null), 3500);
      return;
    }

    soundManager.playLaser();
    setLaunchingId(mission.id);
    setErrorMessage(null);

    try {
      const res = await api.post(`/missions/${mission.id}/start`, {
        shipId: selectedShip?.id || 'v01-orbitron'
      });

      const isSuccess = res.success || res.data?.success;
      const sessId = res.sessionId || res.data?.sessionId;

      if (isSuccess && sessId) {
        if (onLaunchMission) {
          onLaunchMission(mission, sessId);
        }
      } else {
        if (onLaunchMission) {
          onLaunchMission(mission, `local-${Date.now()}`);
        }
      }
    } catch (err) {
      console.warn('Mission launch online error, proceeding with local session:', err.message);
      if (onLaunchMission) {
        onLaunchMission(mission, `local-${Date.now()}`);
      }
    } finally {
      setLaunchingId(null);
    }
  };

  // Node State Evaluator
  const getNodeState = (mission, idx) => {
    const isCompleted = !!mission.isCompleted;
    const isBoss = mission.sequence === 10;
    const prevMission = idx > 0 ? sectorMissions[idx - 1] : null;
    const isCurrent = mission.isUnlocked && !isCompleted && (!prevMission || prevMission.isCompleted);
    const isLocked = !mission.isUnlocked;

    return { isCompleted, isCurrent, isLocked, isBoss };
  };

  // Check if a mission matches the current status filter
  const isMissionFiltered = (mission) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'AVAILABLE') return mission.isUnlocked && !mission.isCompleted;
    if (statusFilter === 'COMPLETED') return mission.isCompleted;
    if (statusFilter === 'BOSS') return mission.sequence === 10;
    return true;
  };

  return (
    <div className="missions-container">
      
      {/* ================= 1. MISSION-CONTROL PAGE HEADER ================= */}
      <section className="mission-control-header" aria-label="Mission Command Header">
        <div className="header-briefing-col">
          <div className="header-eyebrow">
            <span className="header-beacon-dot" />
            <span>TACTICAL MISSION COMMAND // SECTOR OVERWATCH</span>
          </div>
          <h1 className="header-main-title">
            CHOOSE YOUR <span className="header-title-highlight">NEXT SORTIE</span>
          </h1>
          <p className="header-support-text">
            Chart your route through hostile sectors. Complete missions, earn rewards, and prepare for apex encounters across the contested galaxy.
          </p>
        </div>

        {/* Compact Campaign Progress Tracker Pill */}
        <div className="header-progress-box">
          <div className="progress-header-row">
            <span className="progress-counter-label">
              MISSION {String(currentCampaignSortieNum).padStart(2, '0')} / 50
            </span>
            <span className="progress-status-badge">
              {campaignProgressPct === 100 ? 'CAMPAIGN COMPLETE' : `${campaignProgressPct}% ACTIVE`}
            </span>
          </div>

          <div className="progress-bar-slot">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${Math.max(4, campaignProgressPct)}%` }} 
            />
          </div>

          <div className="progress-footer-stats">
            <span>{totalCompleted} SORTIES CLEARED</span>
            <span>{missions.reduce((acc, m) => acc + (m.stars || 0), 0)} / 150 STARS</span>
          </div>
        </div>
      </section>

      {/* Guest Exploration Banner if not logged in */}
      {!isAuthenticated && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'rgba(10, 16, 40, 0.9)',
          border: '1px solid rgba(0, 229, 255, 0.35)',
          borderRadius: '10px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={18} color="#00E5FF" />
            <span style={{ fontSize: '0.82rem', color: '#EAF1FF' }}>
              <strong>TACTICAL FLIGHT ARCHIVE //</strong> All 5 sectors and 50 campaign sorties are visible. Sign in to initiate deployments and persist ledger earnings.
            </span>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('auth')}
            style={{
              background: '#00E5FF',
              color: '#04081E',
              fontFamily: 'Orbitron',
              fontWeight: '800',
              fontSize: '0.74rem',
              letterSpacing: '0.08em',
              padding: '8px 18px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            LOGIN / ENLIST
          </button>
        </div>
      )}

      {/* Error / Alert Message Banner */}
      {errorMessage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 18px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          borderRadius: '8px',
          color: '#FF5577',
          fontFamily: 'Orbitron',
          fontSize: '0.78rem'
        }}>
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ================= 2. SECTOR NAVIGATION SYSTEM ================= */}
      <nav className="sector-selector-bar" aria-label="Campaign Sector Selector">
        {SECTORS_LIST.map((sector, idx) => {
          const isSelected = sector.id === activeSectorId;
          const sMissions = missions.filter((m) => m.sectorId === sector.id);
          const sCompleted = sMissions.filter((m) => m.isCompleted).length;
          const sStars = sMissions.reduce((sum, m) => sum + (m.stars || 0), 0);
          const isSectorLocked = sMissions.length > 0 && !sMissions[0].isUnlocked && !isAuthenticated;

          return (
            <button
              key={sector.id}
              onClick={() => {
                soundManager.playLaser();
                setActiveSectorId(sector.id);
              }}
              className={`sector-nav-tab ${isSelected ? 'active' : ''}`}
              title={`Inspect Sector 0${idx + 1}: ${sector.name}`}
            >
              <span className="sector-nav-tag">SECTOR 0{idx + 1}</span>
              <span className="sector-nav-title">{sector.name}</span>
              <div className="sector-nav-meta">
                <span>{sCompleted} / 10 CLEARED</span>
                <span className="sector-nav-stars">
                  <Star size={10} fill="currentColor" />
                  <span>{sStars}</span>
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* ================= 3. MAP CONTROLS & COMPACT LEGEND TOOLBAR ================= */}
      <div className="map-controls-toolbar">
        {/* Filters */}
        <div className="filter-pills-row">
          {[
            { id: 'ALL', label: 'ALL SORTIES' },
            { id: 'AVAILABLE', label: 'AVAILABLE' },
            { id: 'COMPLETED', label: 'COMPLETED' },
            { id: 'BOSS', label: 'BOSS ENCOUNTERS' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => {
                try { soundManager.playPickup('core'); } catch {}
                setStatusFilter(f.id);
              }}
              className={`filter-pill-btn ${statusFilter === f.id ? 'active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Compact Legend */}
        <div className="map-legend-row">
          <div className="legend-item">
            <span className="legend-swatch swatch-completed" />
            <span>COMPLETED</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch swatch-available" />
            <span>AVAILABLE</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch swatch-locked" />
            <span>LOCKED</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch swatch-boss" />
            <span>BOSS ENCOUNTER</span>
          </div>
        </div>
      </div>

      {/* ================= 4. MAIN CAMPAIGN ARENA (MAP + BRIEFING PANEL) ================= */}
      <div className="campaign-arena-grid">
        
        {/* LEFT COLUMN: INTERACTIVE SECTOR PROGRESSION MAP */}
        <div className="sector-map-canvas-card">
          {/* Atmospheric Backdrop Artwork */}
          <div 
            className="sector-map-bg-artwork" 
            style={{ backgroundImage: `url(${SECTOR_ARTWORKS[activeSectorId] || '/assets/sectors/sector_1_nebula.jpg'})` }} 
          />
          <div className="sector-map-vignette" />

          {/* Radar Rings & Coordinate Overlay */}
          <div className="sector-map-overlay-layer">
            <div className="radar-circle-1" />
            <div className="radar-circle-2" />
            <div className="map-coords-badge">
              // TELEMETRY: {currentSector.name.toUpperCase()} • DEEP SPACE SECTOR MAP
            </div>
          </div>

          {/* SVG Progression Paths Layer */}
          <svg className="sector-svg-paths-layer" viewBox="0 0 1000 600" preserveAspectRatio="none">
            <defs>
              <linearGradient id="activeRouteGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#00E5FF" />
              </linearGradient>
            </defs>

            {MAP_CONNECTORS.map((c, i) => {
              const fromMission = sectorMissions[c.from - 1];
              const toMission = sectorMissions[c.to - 1];
              const isFromCompleted = fromMission?.isCompleted;
              const isToCompleted = toMission?.isCompleted;
              const isToCurrent = toMission?.isUnlocked && !toMission?.isCompleted;

              let pathClass = 'connector-locked';
              if (isFromCompleted && isToCompleted) {
                pathClass = 'connector-completed';
              } else if (isFromCompleted && isToCurrent) {
                pathClass = 'connector-active';
              }

              return (
                <path 
                  key={`conn-${c.from}-${c.to}`}
                  d={c.d}
                  className={`route-connector-path ${pathClass}`}
                />
              );
            })}
          </svg>

          {/* Interactive Nodes Positioning Layer */}
          <div className="sector-nodes-container">
            {sectorMissions.map((mission, idx) => {
              const nodeCfg = MAP_NODES_CONFIG[idx] || { seq: idx + 1, x: 10 + idx * 8, y: 50 };
              const { isCompleted, isCurrent, isLocked, isBoss } = getNodeState(mission, idx);
              const isSelected = selectedMission?.id === mission.id;
              const matchesFilter = isMissionFiltered(mission);

              let stateClass = 'node-state-locked';
              if (isCompleted) stateClass = 'node-state-completed';
              else if (isBoss) stateClass = 'node-state-boss';
              else if (isCurrent) stateClass = 'node-state-current';

              return (
                <div
                  key={mission.id}
                  className={`mission-node-anchor ${stateClass} ${isSelected ? 'selected' : ''}`}
                  style={{
                    left: `${nodeCfg.x}%`,
                    top: `${nodeCfg.y}%`,
                    opacity: matchesFilter ? 1 : 0.25,
                    pointerEvents: matchesFilter ? 'auto' : 'none'
                  }}
                  onClick={() => {
                    try { soundManager.playLaser(); } catch {}
                    setSelectedMission(mission);
                  }}
                  title={`${mission.name} (${isCompleted ? 'Completed' : isLocked ? 'Locked' : 'Available'})`}
                >
                  {/* Selected Reticle Target */}
                  {isSelected && <span className="node-selected-reticle" />}

                  {/* Pulsing Radar Ring for Current Mission */}
                  {isCurrent && <span className="node-radar-beacon" />}

                  {/* Boss Outer Danger Ring */}
                  {isBoss && (
                    <>
                      <span className="boss-outer-ring" />
                      <span className="boss-label-tag">APEX BOSS</span>
                    </>
                  )}

                  {/* Circular Node Button */}
                  <button type="button" className="node-circle-btn">
                    {isCompleted ? (
                      <Check size={16} strokeWidth={3} />
                    ) : isBoss ? (
                      <Skull size={18} />
                    ) : isLocked ? (
                      <Lock size={14} />
                    ) : (
                      <span>{String(mission.sequence).padStart(2, '0')}</span>
                    )}
                  </button>

                  {/* Star rating below completed nodes */}
                  {isCompleted && mission.stars > 0 && (
                    <div className="node-stars-badge">
                      {[...Array(mission.stars)].map((_, sIdx) => (
                        <Star key={sIdx} size={8} color="#FFC247" fill="#FFC247" />
                      ))}
                    </div>
                  )}

                  {/* Hover tooltip label */}
                  <div className="node-mini-name">
                    {mission.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: DEDICATED TACTICAL SORTIE BRIEFING PANEL */}
        {selectedMission ? (
          <aside className="tactical-briefing-panel" aria-label="Sortie Briefing Panel">
            <div className="briefing-top-group">
              {/* Sortie Tag & Difficulty Pill */}
              <div className="briefing-sortie-badge">
                <span className="briefing-tag">
                  // SORTIE {String(selectedMission.sequence).padStart(2, '0')} BRIEFING
                </span>
                <span className={`briefing-diff-pill diff-${(selectedMission.difficulty || 'normal').toLowerCase()}`}>
                  {selectedMission.difficulty || 'NORMAL'}
                </span>
              </div>

              {/* Title & Sector Info */}
              <div>
                <h2 className="briefing-mission-title">{selectedMission.name}</h2>
                <div className="briefing-sector-designation">
                  {selectedMission.sectorName || currentSector.name} • DEEP SPACE SORTIE
                </div>
              </div>

              {/* Mission Objective Box */}
              <div className="briefing-objective-box">
                <span className="objective-box-label">// SORTIE OBJECTIVE</span>
                <p className="objective-box-text">
                  {selectedMission.objective?.label || 'Infiltrate hostile sector and neutralize all Void Vanguard strike forces.'}
                </p>
              </div>

              {/* Combat Telemetry Parameters */}
              <div className="briefing-telemetry-grid">
                <div className="telemetry-tile">
                  <span className="tile-label">COMBAT WAVES</span>
                  <span className="tile-val">{selectedMission.wavesCount ? `${selectedMission.wavesCount} Waves` : '3 Waves'}</span>
                </div>
                <div className="telemetry-tile">
                  <span className="tile-label">TARGET HULL</span>
                  <span className="tile-val">{selectedMission.sequence === 10 ? 'Apex Flagship' : 'Standard Cruisers'}</span>
                </div>
                <div className="telemetry-tile">
                  <span className="tile-label">FLIGHT DURATION</span>
                  <span className="tile-val">~45 - 60s</span>
                </div>
                <div className="telemetry-tile">
                  <span className="tile-label">THREAT TIER</span>
                  <span className="tile-val" style={{ color: selectedMission.sequence === 10 ? '#FF4568' : '#00E5FF' }}>
                    {selectedMission.sequence === 10 ? 'APEX THREAT' : 'ACTIVE SORTIE'}
                  </span>
                </div>
              </div>

              {/* Rewards Payout Grid */}
              <div className="briefing-rewards-section">
                <span className="rewards-label">// COMBAT REWARDS</span>
                <div className="rewards-pills-row">
                  <div className="reward-pill reward-gold">
                    <Coins size={13} />
                    <span>+{selectedMission.rewards?.credits || 100} CR</span>
                  </div>
                  {selectedMission.rewards?.energyCores > 0 && (
                    <div className="reward-pill reward-purple">
                      <Award size={13} />
                      <span>+{selectedMission.rewards.energyCores} CORES</span>
                    </div>
                  )}
                  <div className="reward-pill" style={{ background: 'rgba(255,255,255,0.05)', color: '#96A6C8' }}>
                    <Zap size={13} />
                    <span>+{selectedMission.rewards?.xp || 50} XP</span>
                  </div>
                </div>
              </div>

              {/* Star Rating Progress */}
              <div className="briefing-stars-box">
                <span className="stars-box-label">STAR EVALUATION</span>
                <div className="stars-icons-row">
                  {[1, 2, 3].map((starIdx) => {
                    const isFilled = starIdx <= (selectedMission.stars || 0);
                    return (
                      <Star 
                        key={starIdx}
                        size={15}
                        color={isFilled ? '#FFC247' : '#5A6D96'}
                        fill={isFilled ? '#FFC247' : 'none'}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Launch Action Controls */}
            <div className="briefing-actions-group">
              {isAuthenticated ? (
                selectedMission.isUnlocked ? (
                  <button
                    type="button"
                    onClick={() => handleLaunch(selectedMission)}
                    disabled={launchingId === selectedMission.id}
                    className={selectedMission.isCompleted ? 'btn-briefing-replay' : 'btn-briefing-launch'}
                  >
                    <Play size={16} fill="currentColor" />
                    <span>
                      {launchingId === selectedMission.id 
                        ? 'DEPLOYING SORTIE...' 
                        : selectedMission.isCompleted 
                          ? 'REPLAY SORTIE' 
                          : 'DEPLOY SORTIE'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="btn-briefing-locked"
                  >
                    <Lock size={15} />
                    <span>LOCKED [CLEAR PRIOR SORTIE]</span>
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={() => setEnlistModalOpen(true)}
                  className="btn-briefing-launch"
                >
                  <Play size={16} fill="currentColor" />
                  <span>SIGN IN TO DEPLOY</span>
                </button>
              )}
            </div>
          </aside>
        ) : null}

      </div>

      {/* Guest Enlist Modal */}
      {enlistModalOpen && (
        <EnlistPromptModal 
          isOpen={enlistModalOpen}
          onClose={() => setEnlistModalOpen(false)}
          onNavigate={onNavigate}
        />
      )}

    </div>
  );
};

export default MissionsView;
