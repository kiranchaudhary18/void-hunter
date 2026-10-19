import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import { SECTORS_LIST, MISSIONS_CATALOG, BOSS_ENCOUNTERS } from '../data/missionsData.js';
import EnlistPromptModal from './EnlistPromptModal.jsx';
import { 
  Star, Lock, Play, Shield, Award, 
  Coins, Zap, Compass, Crosshair, Skull, 
  Search, X, RotateCcw, Sparkles, AlertCircle, FileText, ChevronRight
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

const SECTOR_DESCRIPTIONS = {
  'sector-1': 'Ionized gas fields and forward recon outposts under siege by Void Vanguard scout fleets.',
  'sector-2': 'Fortified planetary orbital grids with heavy gun platforms and cloaked strike craft.',
  'sector-3': 'High-velocity kinetic asteroid hazards and pirate staging bases requiring agile maneuvering.',
  'sector-4': 'Spacetime rift anomalies with hyper-velocity interceptors and quantum distortion shielding.',
  'sector-5': 'The sovereign flagship citadel of the Void Vanguard. Multi-phase apex dreadnought encounters.'
};

export const MissionsView = ({ 
  isPublic = false, 
  onNavigate, 
  onLaunchMission, 
  selectedShip = { id: 'v01-orbitron', name: 'V-01 ORBITRON', speed: 380, damage: 25 } 
}) => {
  const { user, profile, isAuthenticated } = useAuth();
  const [activeSectorId, setActiveSectorId] = useState('sector-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [diffFilter, setDiffFilter] = useState('ALL');
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [launchingId, setLaunchingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [briefingMission, setBriefingMission] = useState(null);
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
  const totalStars = missions.reduce((sum, m) => sum + (m.stars || 0), 0);
  const totalAvailable = missions.filter((m) => m.isUnlocked).length;

  // Sector Level Progress
  const sectorMissions = useMemo(() => {
    return missions.filter((m) => m.sectorId === activeSectorId);
  }, [missions, activeSectorId]);

  const sectorCompletedCount = sectorMissions.filter((m) => m.isCompleted).length;
  const sectorStarsCount = sectorMissions.reduce((sum, m) => sum + (m.stars || 0), 0);

  // Filtered Missions within the active sector
  const filteredMissions = useMemo(() => {
    return sectorMissions.filter((m) => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = m.name?.toLowerCase().includes(q);
        const matchesObjective = m.objective?.label?.toLowerCase().includes(q);
        const matchesSeq = String(m.sequence).includes(q) || String(m.globalSequence).includes(q);
        if (!matchesName && !matchesObjective && !matchesSeq) return false;
      }

      // Status Filter
      if (statusFilter === 'AVAILABLE' && !m.isUnlocked) return false;
      if (statusFilter === 'COMPLETED' && !m.isCompleted) return false;
      if (statusFilter === 'BOSS' && m.sequence !== 10) return false;

      // Difficulty Filter
      if (diffFilter !== 'ALL' && m.difficulty?.toUpperCase() !== diffFilter) return false;

      return true;
    });
  }, [sectorMissions, searchQuery, statusFilter, diffFilter]);

  // Mission Launch Handler
  const handleLaunch = async (mission) => {
    if (!isAuthenticated) {
      soundManager.playLaser();
      setBriefingMission(mission);
      setEnlistModalOpen(true);
      return;
    }

    if (!mission.isUnlocked) {
      soundManager.playShieldHit();
      setErrorMessage(`Mission ${mission.name} is locked. Complete previous sorties to decrypt flight coordinates.`);
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

  const handleOpenBriefing = (mission, e) => {
    if (e) e.stopPropagation();
    soundManager.playLaser();
    setBriefingMission(mission);
  };

  return (
    <div className="missions-container">
      {/* ==========================================================================
          1. MISSION HERO COMMAND-CENTER
          ========================================================================== */}
      <section className="missions-hero">
        <div className="hero-text-col">
          {/* Eyebrow Label */}
          <div className="hero-eyebrow">
            <span className="eyebrow-beacon" />
            <span>MISSION ARCHIVE // SECTOR OPERATIONS</span>
          </div>

          {/* Main Heading */}
          <h1 className="hero-heading">
            CHOOSE YOUR <span className="hero-heading-highlight">NEXT SORTIE</span>
          </h1>

          {/* Supporting Description */}
          <p className="hero-description">
            Review tactical reconnaissance across 5 contested deep-space sectors. Evaluate enemy battle groups, 
            objective parameters, and sector hazards before initiating combat sortie deployment.
          </p>

          {/* Hero Summary Metrics */}
          <div className="hero-metrics-strip">
            <div className="hero-metric-item">
              <span className="metric-val metric-val-cyan">{totalMissionsCount}</span>
              <span className="metric-lbl">TOTAL SORTIES</span>
            </div>
            <div className="metric-divider" />
            <div className="hero-metric-item">
              <span className="metric-val">{SECTORS_LIST.length}</span>
              <span className="metric-lbl">CONTESTED SECTORS</span>
            </div>
            <div className="metric-divider" />
            <div className="hero-metric-item">
              <span className="metric-val metric-val-purple">5</span>
              <span className="metric-lbl">APEX BOSSES</span>
            </div>
            <div className="metric-divider" />
            <div className="hero-metric-item">
              <span className="metric-val metric-val-gold">
                {isAuthenticated ? `${totalStars}/150` : '150'}
              </span>
              <span className="metric-lbl">{isAuthenticated ? 'STARS EARNED' : 'SECTOR STARS'}</span>
            </div>
            <div className="metric-divider" />
            <div className="hero-metric-item">
              <span className="metric-val">
                {isAuthenticated ? `${totalCompleted}/${totalMissionsCount}` : `${totalAvailable} READY`}
              </span>
              <span className="metric-lbl">{isAuthenticated ? 'SORTIES CLEARED' : 'ACCESSIBLE'}</span>
            </div>
          </div>
        </div>

        {/* Hero Right: Active Sector Telemetry Preview */}
        <div className="hero-sector-card">
          <img 
            src={SECTOR_ARTWORKS[activeSectorId] || '/assets/sectors/sector_1_nebula.jpg'} 
            alt={currentSector.name}
            className="sector-card-bg-img"
          />
          <div className="sector-card-vignette" />
          
          <div className="sector-card-content">
            <span className="sector-card-eyebrow">ACTIVE SECTOR TELEMETRY</span>
            <h2 className="sector-card-title">{currentSector.name}</h2>
            <p className="sector-card-desc">{SECTOR_DESCRIPTIONS[activeSectorId]}</p>
          </div>

          <div className="sector-card-footer">
            <span className="sector-boss-tag">
              <Skull size={15} />
              <span>APEX: {currentSector.boss.toUpperCase()}</span>
            </span>
            <span style={{ fontFamily: 'Orbitron', fontSize: '0.72rem', color: '#00E5FF', fontWeight: '700' }}>
              {isAuthenticated ? `${sectorCompletedCount}/10 CLEARED` : 'SORTIES 01 - 10'}
            </span>
          </div>
        </div>
      </section>

      {/* Guest Exploration Banner */}
      {!isAuthenticated && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'rgba(11, 18, 48, 0.85)',
          border: '1px solid rgba(0, 229, 255, 0.35)',
          borderRadius: '10px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="#00E5FF" />
            <span style={{ fontSize: '0.84rem', color: '#EAF1FF' }}>
              <strong>PUBLIC MISSION ARCHIVE //</strong> All 50 sorties and 5 sectors are open for tactical inspection. Enlist pilot credentials to deploy and log combat rewards.
            </span>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('auth')}
            style={{
              background: '#00E5FF',
              color: '#05091B',
              fontFamily: 'Orbitron',
              fontWeight: '800',
              fontSize: '0.78rem',
              letterSpacing: '0.1em',
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
          fontSize: '0.82rem'
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ==========================================================================
          2. 5 RICH SECTOR SELECTOR CARDS
          ========================================================================== */}
      <section className="sectors-selector-grid" aria-label="Sector Selection">
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
              className={`sector-btn-card ${isSelected ? 'active' : ''}`}
              aria-selected={isSelected}
              title={`Inspect ${sector.name} operations`}
            >
              <img 
                src={SECTOR_ARTWORKS[sector.id] || '/assets/sectors/sector_1_nebula.jpg'} 
                alt={sector.name}
                className="sector-btn-thumb"
              />
              <div className="sector-btn-overlay" />

              <div className="sector-btn-top">
                <span className="sector-num-badge">SECTOR 0{idx + 1}</span>
                <span className="sector-range-lbl">{sector.range}</span>
              </div>

              <div className="sector-btn-mid">
                <h3 className="sector-btn-name">{sector.name}</h3>
              </div>

              <div className="sector-btn-bottom">
                <span className="sector-progress-text">
                  {isAuthenticated ? (
                    <>
                      <span>{sCompleted}/10</span>
                      <Star size={11} color="#FBBF24" fill="#FBBF24" />
                      <span>{sStars}</span>
                    </>
                  ) : (
                    <span>10 SORTIES</span>
                  )}
                </span>
                {isSelected && <span className="sector-active-indicator" />}
              </div>
            </button>
          );
        })}
      </section>

      {/* ==========================================================================
          3. MISSION CONTROL TOOLBAR (Filters & Search)
          ========================================================================== */}
      <div className="missions-toolbar">
        <div className="toolbar-left-group">
          {/* Search Input */}
          <div className="mission-search-wrapper">
            <Search size={15} className="search-icon-pos" />
            <input 
              type="text"
              placeholder="Search sorties by title or objective..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mission-search-input"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="toolbar-filter-tabs">
            {['ALL', 'AVAILABLE', 'COMPLETED', 'BOSS'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  soundManager.playPickup('core');
                  setStatusFilter(tab);
                }}
                className={`filter-tab-btn ${statusFilter === tab ? 'active' : ''}`}
              >
                {tab === 'BOSS' ? 'APEX BOSS' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="toolbar-right-group">
          <div className="diff-select-wrapper">
            <span className="diff-select-label">DIFFICULTY:</span>
            <select
              value={diffFilter}
              onChange={(e) => {
                soundManager.playPickup('core');
                setDiffFilter(e.target.value);
              }}
              className="diff-select-dropdown"
            >
              <option value="ALL">ALL TIERS</option>
              <option value="NORMAL">NORMAL</option>
              <option value="HARD">HARD</option>
              <option value="EXPERT">EXPERT</option>
            </select>
          </div>
          <span style={{ fontFamily: 'Orbitron', fontSize: '0.7rem', color: '#9AA9C7', paddingLeft: '8px' }}>
            SHOWING {filteredMissions.length} OF {sectorMissions.length}
          </span>
        </div>
      </div>

      {/* ==========================================================================
          4. MISSION CARDS GRID
          ========================================================================== */}
      <section className="missions-cards-grid" aria-label="Sorties List">
        {filteredMissions.map((m) => {
          const isBoss = m.sequence === 10;
          const starsEarned = m.stars || 0;

          return (
            <div 
              key={m.id}
              className={`mission-card ${isBoss ? 'boss-card' : ''} ${m.isCompleted ? 'completed-card' : ''} ${!m.isUnlocked && isAuthenticated ? 'locked-card' : ''}`}
              onClick={(e) => handleOpenBriefing(m, e)}
            >
              {/* Header: Sortie Number & Difficulty */}
              <div className="card-header-row">
                <span className="sortie-code-badge">
                  {isBoss ? (
                    <span className="boss-flag-badge">
                      <Skull size={13} />
                      <span>APEX BOSS // SORTIE {m.sequence < 10 ? '0' + m.sequence : m.sequence}</span>
                    </span>
                  ) : (
                    `SORTIE ${m.sequence < 10 ? '0' + m.sequence : m.sequence}`
                  )}
                </span>
                <span className={`difficulty-pill diff-${m.difficulty || 'normal'}`}>
                  {m.difficulty || 'NORMAL'}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="card-title-group">
                <h3 className="mission-card-title">{m.name}</h3>
                <div className="mission-card-subtitle">{m.subtitle || `${m.sectorName} // SORTIE ${m.sequence}`}</div>
              </div>

              {/* Objective Box */}
              <div className="card-objective-box">
                <div className="objective-item">
                  <Crosshair size={14} color="#00E5FF" style={{ flexShrink: 0 }} />
                  <span>{m.objective?.label || 'Defend sector perimeter'}</span>
                </div>
                <div className="telemetry-item">
                  <span>{m.wavesCount ? `Waves: ${m.wavesCount}` : 'Waves: Standard'}</span>
                  <span>•</span>
                  <span>{isBoss ? 'Boss Threat: Critical' : 'Enemy Hull: Combat Ready'}</span>
                </div>
              </div>

              {/* Rewards Preview & Stars */}
              <div className="card-rewards-row">
                <div className="rewards-pills-list">
                  <span className="reward-tag tag-credits" title="Credits Payout">
                    <Coins size={13} />
                    <span>+{m.rewards?.credits || 100}</span>
                  </span>
                  <span className="reward-tag tag-xp" title="Pilot XP">
                    <Zap size={13} />
                    <span>+{m.rewards?.xp || 50}</span>
                  </span>
                  {m.rewards?.energyCores > 0 && (
                    <span className="reward-tag tag-cores" title="Energy Cores">
                      <Award size={13} />
                      <span>+{m.rewards.energyCores}</span>
                    </span>
                  )}
                </div>

                {/* Stars Indicator */}
                <div className="card-stars-row" title={`${starsEarned} of 3 Stars`}>
                  {[1, 2, 3].map((starIdx) => (
                    <Star
                      key={starIdx}
                      size={15}
                      color={starIdx <= starsEarned ? '#FBBF24' : 'rgba(255, 255, 255, 0.18)'}
                      fill={starIdx <= starsEarned ? '#FBBF24' : 'none'}
                    />
                  ))}
                </div>
              </div>

              {/* Card Actions */}
              <div className="card-actions-wrapper" onClick={(e) => e.stopPropagation()}>
                {isAuthenticated ? (
                  m.isUnlocked ? (
                    <button
                      onClick={() => handleLaunch(m)}
                      disabled={launchingId === m.id}
                      className={m.isCompleted ? "btn-card-replay" : "btn-card-primary"}
                    >
                      {launchingId === m.id ? (
                        <span>DEPLOYING...</span>
                      ) : (
                        <>
                          <Play size={15} fill="currentColor" />
                          <span>{m.isCompleted ? 'REPLAY SORTIE' : 'DEPLOY SORTIE'}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLaunch(m)}
                      className="btn-card-locked"
                    >
                      <Lock size={14} />
                      <span>LOCKED [CLEAR PRIOR]</span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={(e) => handleOpenBriefing(m, e)}
                    className="btn-card-primary"
                  >
                    <Play size={15} fill="currentColor" />
                    <span>BRIEFING & DEPLOY</span>
                  </button>
                )}

                {/* Tactical Briefing Button */}
                <button
                  onClick={(e) => handleOpenBriefing(m, e)}
                  className="btn-card-briefing"
                  title="Open Tactical Sortie Briefing"
                >
                  <FileText size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* ==========================================================================
          5. PRE-DEPLOYMENT BRIEFING MODAL
          ========================================================================== */}
      {briefingMission && (
        <div className="briefing-modal-overlay" onClick={() => setBriefingMission(null)}>
          <div className="briefing-modal-card" onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Banner */}
            <div className="briefing-banner">
              <img 
                src={SECTOR_ARTWORKS[briefingMission.sectorId] || '/assets/sectors/sector_1_nebula.jpg'} 
                alt={briefingMission.name} 
                className="briefing-banner-img"
              />
              <div className="briefing-banner-vignette" />
              <button 
                onClick={() => setBriefingMission(null)}
                className="briefing-close-btn"
                title="Close Briefing"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="briefing-body">
              <div>
                <span className="briefing-eyebrow">
                  TACTICAL SORTIE BRIEFING // {briefingMission.subtitle || `SECTOR OPERATIONS`}
                </span>
                <h2 className="briefing-title">{briefingMission.name}</h2>
              </div>

              {/* Briefing Grid */}
              <div className="briefing-grid">
                {/* Panel 1: Mission Parameters */}
                <div className="briefing-panel">
                  <span className="briefing-panel-title">MISSION PARAMETERS</span>
                  <div style={{ fontSize: '0.84rem', color: '#EAF1FF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Crosshair size={15} color="#00E5FF" />
                    <span>{briefingMission.objective?.label || 'Neutralize hostile battle group'}</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#9AA9C7', marginTop: '4px' }}>
                    Target Count: {briefingMission.objective?.target || 12} • Hull Threshold: 100%
                  </div>
                </div>

                {/* Panel 2: Hostile Intelligence */}
                <div className="briefing-panel">
                  <span className="briefing-panel-title">HOSTILE RECONNAISSANCE</span>
                  <div style={{ fontSize: '0.84rem', color: '#FF5577', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Skull size={15} />
                    <span>
                      {briefingMission.boss ? `Apex Boss: ${briefingMission.boss.name}` : 'Void Vanguard Strike Wing'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#9AA9C7', marginTop: '4px' }}>
                    {briefingMission.boss ? `Phases: ${briefingMission.boss.phases} • Boss Armor: Heavy` : `Waves: ${briefingMission.wavesCount || 3} • Interceptors & Corvettes`}
                  </div>
                </div>

                {/* Panel 3: Rewards Payout */}
                <div className="briefing-panel">
                  <span className="briefing-panel-title">COMPLETION BOUNTY</span>
                  <div style={{ display: 'flex', gap: '14px', marginTop: '4px' }}>
                    <span style={{ color: '#FBBF24', fontFamily: 'Orbitron', fontSize: '0.82rem', fontWeight: '700' }}>
                      +{briefingMission.rewards?.credits || 100} CREDITS
                    </span>
                    <span style={{ color: '#00E5FF', fontFamily: 'Orbitron', fontSize: '0.82rem', fontWeight: '700' }}>
                      +{briefingMission.rewards?.xp || 50} XP
                    </span>
                    {briefingMission.rewards?.energyCores > 0 && (
                      <span style={{ color: '#8B5CF6', fontFamily: 'Orbitron', fontSize: '0.82rem', fontWeight: '700' }}>
                        +{briefingMission.rewards.energyCores} CORES
                      </span>
                    )}
                  </div>
                </div>

                {/* Panel 4: Authorization State */}
                <div className="briefing-panel">
                  <span className="briefing-panel-title">AUTHORIZATION STATUS</span>
                  <div style={{ fontSize: '0.82rem', color: isAuthenticated ? (briefingMission.isUnlocked ? '#20D6A0' : '#FFB84D') : '#00E5FF' }}>
                    {isAuthenticated ? (
                      briefingMission.isUnlocked ? '● FLIGHT ENVELOPE CLEARED' : '● ENCRYPTED: CLEAR PRIOR SORTIES'
                    ) : (
                      '● PUBLIC RECONNAISSANCE PREVIEW'
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="briefing-actions-row">
                <button
                  onClick={() => setBriefingMission(null)}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#9AA9C7',
                    fontFamily: 'Orbitron',
                    fontSize: '0.78rem',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  DISMISS
                </button>

                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      setBriefingMission(null);
                      handleLaunch(briefingMission);
                    }}
                    disabled={!briefingMission.isUnlocked}
                    className="btn-card-primary"
                    style={{ minWidth: '200px' }}
                  >
                    <Play size={16} fill="currentColor" />
                    <span>{briefingMission.isCompleted ? 'REPLAY SORTIE' : 'ENGAGE HYPERDRIVE'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setBriefingMission(null);
                      if (onNavigate) onNavigate('auth');
                    }}
                    className="btn-card-primary"
                    style={{ minWidth: '200px' }}
                  >
                    <span>ENLIST PILOT TO DEPLOY</span>
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Guest Enlist Prompt Modal */}
      {enlistModalOpen && (
        <EnlistPromptModal 
          isOpen={enlistModalOpen}
          onClose={() => setEnlistModalOpen(false)}
          onEnlist={() => {
            setEnlistModalOpen(false);
            if (onNavigate) onNavigate('auth');
          }}
          title="PILOT ENLISTMENT REQUIRED"
          subtitle="Enlist your pilot credentials to launch combat sorties, record flight telemetry, and claim sector bounties."
        />
      )}
    </div>
  );
};

export default MissionsView;
