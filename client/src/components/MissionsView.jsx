import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import { SECTORS_LIST, MISSIONS_CATALOG } from '../data/missionsData.js';
import EnlistPromptModal from './EnlistPromptModal.jsx';
import { 
  Star, Lock, Play, Award, 
  Coins, Zap, Compass, Skull, 
  Check, AlertCircle, Target, RotateCcw,
  Clock, CheckCircle, Trophy
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
  { seq: 10, x: 88, y: 36 } // Boss encounter node
];

// Smooth Bezier Curve Path Connectors for viewBox="0 0 1000 600"
const MAP_CONNECTORS = [
  { from: 1, to: 2, d: "M 100 468 C 140 415, 175 380, 210 348", wp: { x: 155, y: 408 } },
  { from: 2, to: 3, d: "M 210 348 C 225 270, 140 220, 160 168", wp: { x: 185, y: 258 } },
  { from: 3, to: 4, d: "M 160 168 C 185 125, 255 100, 310 108", wp: { x: 235, y: 138 } },
  { from: 4, to: 5, d: "M 310 108 C 370 120, 410 180, 450 228", wp: { x: 380, y: 168 } },
  { from: 5, to: 6, d: "M 450 228 C 485 275, 335 390, 380 444", wp: { x: 415, y: 336 } },
  { from: 6, to: 7, d: "M 380 444 C 430 485, 520 490, 580 468", wp: { x: 480, y: 468 } },
  { from: 7, to: 8, d: "M 580 468 C 640 440, 680 380, 720 330", wp: { x: 650, y: 399 } },
  { from: 8, to: 9, d: "M 720 330 C 750 270, 635 190, 660 144", wp: { x: 690, y: 237 } },
  { from: 9, to: 10, d: "M 660 144 C 700 95, 820 160, 880 216", wp: { x: 770, y: 180 }, isBossRoute: true }
];

export const MissionsView = ({ 
  _isPublic = false, 
  onNavigate, 
  onLaunchMission, 
  selectedShip = { id: 'v01-orbitron', name: 'V-01 ORBITRON', speed: 380, damage: 25 } 
}) => {
  const { isAuthenticated } = useAuth();
  const [activeSectorId, setActiveSectorId] = useState('sector-1');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [, setLoading] = useState(true);
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
  }, [activeSectorId, sectorMissions]);

  // Mission Launch Handler
  const handleLaunch = async (mission) => {
    // If not authenticated, allow immediate guest combat deployment
    if (!isAuthenticated) {
      soundManager.playLaser();
      if (onLaunchMission) {
        onLaunchMission(mission, `guest-${Date.now()}`);
      }
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

  // 1-Click Quick Deploy: Compute active recommended mission
  const recommendedMission = useMemo(() => {
    if (selectedMission && selectedMission.isUnlocked) {
      return selectedMission;
    }
    const activeSectorMissions = missions.filter((m) => m.sectorId === activeSectorId);
    const firstAvailable = activeSectorMissions.find((m) => m.isUnlocked && !m.isCompleted);
    if (firstAvailable) return firstAvailable;
    return activeSectorMissions[0] || missions[0] || null;
  }, [selectedMission, missions, activeSectorId]);

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

  // Find next mission in sequence relative to selectedMission
  const nextMissionInSector = useMemo(() => {
    if (!selectedMission) return null;
    const nextSeq = selectedMission.sequence + 1;
    return sectorMissions.find((m) => m.sequence === nextSeq) || null;
  }, [selectedMission, sectorMissions]);

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
            <Compass size={18} color="#00E5FF" />
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

            {/* ================= 1B. 1-CLICK INSTANT DEPLOY HERO COMMAND ================= */}
      {recommendedMission && (
        <section className="missions-quick-deploy-card" aria-label="Instant Mission Deploy">
          <div className="quick-deploy-left">
            <div className="quick-deploy-tag-row">
              <span className="quick-deploy-status-dot" />
              <span className="quick-deploy-tag-text">
                RECOMMENDED SORTIE // SECTOR {currentSector?.name?.toUpperCase() || '01'}
              </span>
              <span className="quick-deploy-hazard-pill">
                {recommendedMission.sequence === 10 ? 'APEX HAZARD' : 'STANDARD HAZARD'}
              </span>
            </div>
            <h2 className="quick-deploy-title">
              SORTIE 0{recommendedMission.sequence}: {recommendedMission.name.toUpperCase()}
            </h2>
            <div className="quick-deploy-objective">
              <Target size={14} color="#00E5FF" />
              <span>{typeof recommendedMission.objective === 'string' ? recommendedMission.objective : (recommendedMission.objective?.label || 'Neutralize hostile void fighter wings and secure airspace.')}</span>
            </div>
          </div>

          <div className="quick-deploy-right">
            <button
              id="instant-sortie-deploy-btn"
              onClick={() => handleLaunch(recommendedMission)}
              disabled={launchingId === recommendedMission.id}
              className="btn-quick-deploy-cta"
              title="Launch directly into combat sortie"
            >
              <Play size={18} fill="currentColor" />
              <span>{launchingId === recommendedMission.id ? 'INITIALIZING COMBAT...' : '⚡ INSTANT DEPLOY'}</span>
            </button>
          </div>
        </section>
      )}

      {/* ================= 2. SECTOR NAVIGATION SYSTEM ================= */}
      <nav className="sector-selector-bar" aria-label="Campaign Sector Selector">
        {SECTORS_LIST.map((sector, idx) => {
          const isSelected = sector.id === activeSectorId;
          const sMissions = missions.filter((m) => m.sectorId === sector.id);
          const sCompleted = sMissions.filter((m) => m.isCompleted).length;
          const sStars = sMissions.reduce((sum, m) => sum + (m.stars || 0), 0);

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

            {/* Path Connectors between Consecutive Nodes */}
            {MAP_CONNECTORS.map((c) => {
              const fromMission = sectorMissions[c.from - 1];
              const toMission = sectorMissions[c.to - 1];
              const isFromCompleted = fromMission?.isCompleted;
              const isToCompleted = toMission?.isCompleted;
              const isToCurrent = toMission?.isUnlocked && !toMission?.isCompleted;

              let pathClass = 'connector-locked';
              if (c.isBossRoute) {
                if (isFromCompleted && toMission?.isUnlocked) {
                  pathClass = 'connector-boss-route';
                } else {
                  pathClass = 'connector-boss-locked';
                }
              } else if (isFromCompleted && isToCompleted) {
                pathClass = 'connector-completed';
              } else if (isFromCompleted && isToCurrent) {
                pathClass = 'connector-active';
              }

              return (
                <g key={`conn-group-${c.from}-${c.to}`}>
                  <path 
                    d={c.d}
                    className={`route-connector-path ${pathClass}`}
                  />
                  {/* Route Direction Waypoint Marker */}
                  {c.wp && (
                    <circle 
                      cx={c.wp.x} 
                      cy={c.wp.y} 
                      r="2.8" 
                      className={c.isBossRoute ? "route-waypoint-boss" : "route-waypoint-arrow"} 
                    />
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive Circular Nodes Positioning Layer */}
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

              const unlockReqText = isLocked 
                ? (idx > 0 ? `Locked: Clear Sortie 0${idx} first` : 'Locked') 
                : isCompleted ? 'Completed' : 'Available';

              return (
                <div
                  key={mission.id}
                  className={`mission-node-anchor ${stateClass} ${isSelected ? 'selected' : ''}`}
                  style={{
                    left: `${nodeCfg.x}%`,
                    top: `${nodeCfg.y}%`,
                    opacity: matchesFilter ? 1 : 0.22,
                    pointerEvents: matchesFilter ? 'auto' : 'none'
                  }}
                  onClick={() => {
                    try { soundManager.playLaser(); } catch {}
                    setSelectedMission(mission);
                  }}
                  title={`${mission.name} (${unlockReqText})`}
                >
                  {/* Selected Reticle Target Ring */}
                  {isSelected && <span className="node-selected-halo" />}

                  {/* Current Available Mission: Rotating Orbital Segmented Ring & NEXT SORTIE Badge */}
                  {isCurrent && (
                    <>
                      <span className="node-orbital-ring" />
                      <span className="node-current-sortie-badge">NEXT SORTIE</span>
                    </>
                  )}

                  {/* Completed Mission: Double Ring */}
                  {isCompleted && <span className="node-double-ring-completed" />}

                  {/* Boss Encounter Node: Danger Outer Ring & Apex Badge */}
                  {isBoss && (
                    <>
                      <span className="boss-outer-ring" />
                      <span className="boss-label-tag">APEX ENCOUNTER</span>
                    </>
                  )}

                  {/* Circular Node Button */}
                  <button type="button" className="node-circle-btn">
                    {isCompleted ? (
                      <Check size={16} strokeWidth={3} />
                    ) : isBoss ? (
                      <Skull size={18} />
                    ) : isLocked ? (
                      <Lock size={13} />
                    ) : (
                      <span>{String(mission.sequence).padStart(2, '0')}</span>
                    )}
                  </button>

                  {/* Star Rating Badge beneath completed nodes */}
                  {isCompleted && (
                    <div className="node-stars-badge">
                      {[1, 2, 3].map((s) => (
                        <Star 
                          key={s} 
                          size={8} 
                          color={s <= (mission.stars || 0) ? "#FFC247" : "rgba(150, 166, 200, 0.4)"} 
                          fill={s <= (mission.stars || 0) ? "#FFC247" : "none"} 
                        />
                      ))}
                    </div>
                  )}

                  {/* Hover Tooltip Label */}
                  <div className="node-mini-name">
                    {mission.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: UPGRADED TACTICAL SORTIE BRIEFING / DEBRIEF PANEL */}
        {selectedMission ? (
          <aside className="tactical-briefing-panel" aria-label="Sortie Briefing Panel">
            {/* Dedicated Cinematic Mission Image Banner */}
            <div className="briefing-artwork-banner">
              <img 
                src={SECTOR_ARTWORKS[selectedMission.sectorId] || '/assets/sectors/sector_1_nebula.jpg'} 
                alt={selectedMission.name}
                className="briefing-banner-img"
              />
              <div className="briefing-banner-vignette" />
              <div className="briefing-banner-tags">
                <span className="banner-sortie-code">
                  SORTIE {String(selectedMission.sequence).padStart(2, '0')} // {selectedMission.isCompleted ? 'COMBAT DEBRIEF' : 'MISSION INTEL'}
                </span>
                <span className={`banner-status-pill ${
                  selectedMission.isCompleted 
                    ? 'status-completed' 
                    : selectedMission.isUnlocked 
                      ? 'status-ready' 
                      : 'status-locked'
                }`}>
                  {selectedMission.isCompleted 
                    ? '✓ COMPLETED' 
                    : selectedMission.isUnlocked 
                      ? 'READY TO LAUNCH' 
                      : 'LOCKED'}
                </span>
              </div>
            </div>

            {/* Briefing Panel Body */}
            <div className="briefing-panel-body">
              {/* Boss Encounter Hazard Alert */}
              {selectedMission.sequence === 10 && (
                <div className="boss-hazard-alert-banner">
                  <div className="boss-hazard-pulse-dot" />
                  <Skull size={18} className="boss-hazard-skull-icon" />
                  <div className="boss-hazard-text">
                    <span className="boss-hazard-title">APEX FLAGSHIP DETECTED // PROTOCOL OMEGA</span>
                    <span className="boss-hazard-sub">Class-S Dreadnought with multi-phase shields and hyper-kinetic beam cannons.</span>
                  </div>
                </div>
              )}

              {/* Mission Title Area */}
              <div className="briefing-title-area">
                <h2 className="briefing-mission-title">{selectedMission.name}</h2>
                <div className="briefing-sector-line">
                  <span>{selectedMission.sectorName || currentSector.name} • DEEP SPACE SORTIE</span>
                  <span className={`briefing-diff-pill diff-${(selectedMission.difficulty || 'normal').toLowerCase()}`}>
                    {selectedMission.difficulty || 'NORMAL'}
                  </span>
                </div>
              </div>

              {/* Distinct Objective / Debrief Card */}
              {selectedMission.isCompleted ? (
                <div className="briefing-objective-card debrief-completed-card">
                  <div className="objective-card-header">
                    <CheckCircle size={13} color="#10B981" />
                    <span style={{ color: '#10B981', fontWeight: 800 }}>SORTIE RECORD ARCHIVE</span>
                  </div>
                  <p className="objective-card-text">
                    Combat sortie successfully neutralized. Hostile sector telemetry verified and all bounties secured.
                  </p>
                </div>
              ) : (
                <div className="briefing-objective-card">
                  <div className="objective-card-header">
                    <Target size={13} />
                    <span>MISSION OBJECTIVE</span>
                  </div>
                  <p className="objective-card-text">
                    {selectedMission.objective?.label || 'Infiltrate hostile sector and neutralize all Void Vanguard strike forces.'}
                  </p>
                </div>
              )}

              {/* Tactical Intelligence / Debrief 2-Column Grid */}
              <div className="briefing-telemetry-grid">
                {selectedMission.isCompleted ? (
                  <>
                    <div className="telemetry-tile tile-highlight-cyan">
                      <span className="tile-label">CLEAR TIME</span>
                      <span className="tile-val tile-val-cyan">
                        <Clock size={11} style={{ marginRight: 4, verticalAlign: 'middle', display: 'inline-block' }} />
                        {selectedMission.bestTimeSeconds ? `${selectedMission.bestTimeSeconds}s` : '29s'}
                      </span>
                    </div>
                    <div className="telemetry-tile tile-highlight-gold">
                      <span className="tile-label">RECORD SCORE</span>
                      <span className="tile-val tile-val-gold">
                        <Trophy size={11} style={{ marginRight: 4, verticalAlign: 'middle', display: 'inline-block' }} />
                        {(selectedMission.highScore || 5610).toLocaleString()} PTS
                      </span>
                    </div>
                    <div className="telemetry-tile">
                      <span className="tile-label">ENEMY WAVES</span>
                      <span className="tile-val">
                        {selectedMission.wavesCount ? `${selectedMission.wavesCount} Waves Cleared` : 'All Waves Cleared'}
                      </span>
                    </div>
                    <div className="telemetry-tile">
                      <span className="tile-label">COMBAT STATUS</span>
                      <span className="tile-val" style={{ color: '#10B981', fontWeight: 800 }}>
                        VICTORY CONFIRMED
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="telemetry-tile">
                      <span className="tile-label">ENEMY WAVES</span>
                      <span className="tile-val">
                        {selectedMission.wavesCount ? `${selectedMission.wavesCount} Waves` : '3 Combat Waves'}
                      </span>
                    </div>
                    <div className="telemetry-tile">
                      <span className="tile-label">TARGET CLASS</span>
                      <span className="tile-val">
                        {selectedMission.sequence === 10 ? currentSector.boss : 'Void Strike Wings'}
                      </span>
                    </div>
                    <div className="telemetry-tile">
                      <span className="tile-label">ESTIMATED TIME</span>
                      <span className="tile-val">~45 - 60s</span>
                    </div>
                    <div className="telemetry-tile">
                      <span className="tile-label">THREAT TIER</span>
                      <span className="tile-val" style={{ color: selectedMission.sequence === 10 ? '#FF4568' : '#00E5FF' }}>
                        {selectedMission.sequence === 10 ? 'CRITICAL BOSS' : 'STANDARD HAZARD'}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Combat Rewards / Claimed Rewards Section */}
              <div className="briefing-rewards-section">
                {selectedMission.isCompleted ? (
                  <>
                    <div className="rewards-header-row">
                      <span className="rewards-label" style={{ color: '#10B981' }}>// REWARDS CLAIMED & SECURED</span>
                      <span className="rewards-status-badge">
                        <Check size={10} /> CLAIMED
                      </span>
                    </div>
                    <div className="rewards-tokens-row">
                      <div className="reward-token token-gold token-claimed">
                        <Coins size={12} />
                        <span>+{selectedMission.claimedRewards?.credits || selectedMission.rewards?.credits || 100} CR</span>
                        <Check size={10} className="token-check" />
                      </div>
                      {((selectedMission.claimedRewards?.energyCores ?? selectedMission.rewards?.energyCores) > 0) && (
                        <div className="reward-token token-purple token-claimed">
                          <Award size={12} />
                          <span>+{selectedMission.claimedRewards?.energyCores || selectedMission.rewards?.energyCores} CORES</span>
                          <Check size={10} className="token-check" />
                        </div>
                      )}
                      <div className="reward-token token-cyan token-claimed">
                        <Zap size={12} />
                        <span>+{selectedMission.claimedRewards?.xp || selectedMission.rewards?.xp || 50} XP</span>
                        <Check size={10} className="token-check" />
                      </div>
                    </div>
                    <div className="rewards-secured-note">
                      <CheckCircle size={11} color="#10B981" />
                      <span>Combat credits and XP deposited into Pilot Wallet</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="rewards-label">// ESTIMATED COMBAT REWARDS</span>
                    <div className="rewards-tokens-row">
                      <div className="reward-token token-gold">
                        <Coins size={12} />
                        <span>+{selectedMission.rewards?.credits || 100} CR</span>
                      </div>
                      {selectedMission.rewards?.energyCores > 0 && (
                        <div className="reward-token token-purple">
                          <Award size={12} />
                          <span>+{selectedMission.rewards.energyCores} CORES</span>
                        </div>
                      )}
                      <div className="reward-token token-cyan">
                        <Zap size={12} />
                        <span>+{selectedMission.rewards?.xp || 50} XP</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Star Evaluation */}
              <div className={`briefing-stars-box ${selectedMission.isCompleted ? 'stars-box-completed' : ''}`}>
                <div className="stars-meta-left">
                  <span className="stars-box-label">STAR EVALUATION</span>
                  <span className="stars-sublabel">
                    {selectedMission.isCompleted 
                      ? `(${selectedMission.stars || 3} of 3 Stars Earned)` 
                      : '(Potential: 3 Stars)'}
                  </span>
                </div>
                <div className="stars-icons-row">
                  {[1, 2, 3].map((starIdx) => {
                    const isFilled = starIdx <= (selectedMission.stars || 0);
                    return (
                      <Star 
                        key={starIdx}
                        size={15}
                        color={isFilled ? '#FFC247' : 'rgba(150, 166, 200, 0.35)'}
                        fill={isFilled ? '#FFC247' : 'none'}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Dedicated Next-Mission Progression Strip */}
              <div className="campaign-progression-strip">
                <div className="progression-strip-header">
                  <span>CAMPAIGN PROGRESSION</span>
                  <span className="progression-strip-status">
                    {selectedMission.isCompleted 
                      ? 'SORTIE COMPLETE' 
                      : selectedMission.isUnlocked 
                        ? 'READY FOR DEPLOYMENT' 
                        : 'RESTRICTED'}
                  </span>
                </div>
                <div className="progression-strip-info">
                  {selectedMission.isCompleted ? (
                    nextMissionInSector ? (
                      <span>
                        Clear Record: {selectedMission.bestTimeSeconds || 29}s • Score: {(selectedMission.highScore || 5610).toLocaleString()} PTS • Next: Sortie 0{nextMissionInSector.sequence} - {nextMissionInSector.name}
                      </span>
                    ) : (
                      <span>Sector Cleared! Apex encounter neutralized.</span>
                    )
                  ) : selectedMission.isUnlocked ? (
                    selectedMission.sequence === 10 ? (
                      <span style={{ color: '#FF4568', fontWeight: 'bold' }}>
                        APEX ENCOUNTER // Hostile Flagship: {currentSector.boss}
                      </span>
                    ) : (
                      <span>Next Milestone: Apex Boss {currentSector.boss} in {10 - selectedMission.sequence} Sorties</span>
                    )
                  ) : (
                    <span style={{ color: '#96A6C8' }}>
                      Prerequisite: Complete Sortie 0{selectedMission.sequence - 1} to decrypt flight coordinates.
                    </span>
                  )}
                </div>
              </div>

              {/* Launch & Progression Action Controls */}
              <div className="briefing-actions-group">
                {isAuthenticated ? (
                  selectedMission.isUnlocked ? (
                    selectedMission.isCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleLaunch(selectedMission)}
                        disabled={launchingId === selectedMission.id}
                        className="btn-briefing-replay"
                      >
                        <RotateCcw size={15} />
                        <span>
                          {launchingId === selectedMission.id 
                            ? 'PREPARING REPLAY...' 
                            : 'REPLAY SORTIE'}
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleLaunch(selectedMission)}
                        disabled={launchingId === selectedMission.id}
                        className="btn-briefing-launch"
                      >
                        <Play size={16} fill="currentColor" />
                        <span>
                          {launchingId === selectedMission.id 
                            ? 'DEPLOYING SORTIE...' 
                            : selectedMission.sequence === 10 
                              ? 'ENGAGE APEX BOSS' 
                              : 'LAUNCH MISSION'}
                        </span>
                      </button>
                    )
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
                    onClick={() => handleLaunch(selectedMission)}
                    className="btn-quick-deploy-cta"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Play size={16} fill="currentColor" />
                    <span>⚡ INSTANT DEPLOY</span>
                  </button>
                )}
              </div>
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
