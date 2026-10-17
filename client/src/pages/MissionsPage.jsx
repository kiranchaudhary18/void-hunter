import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import { SECTORS_LIST, MISSIONS_CATALOG, BOSS_ENCOUNTERS } from '../data/missionsData.js';
import { 
  ArrowLeft, Star, Lock, Play, ShieldAlert, Award, 
  Coins, Zap, Compass, Crosshair, Skull, ChevronRight, RefreshCw 
} from 'lucide-react';

export const MissionsPage = ({ onBack, onLaunchMission, selectedShip = { name: 'V-01 ORBITRON', speed: 380, damage: 25 } }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [activeSectorId, setActiveSectorId] = useState('sector-1');
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [launchingId, setLaunchingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Load mission progress from backend API
  const fetchMissionsProgress = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.get('/missions');
      const missionList = res.missions || res.data?.missions;
      if (missionList && missionList.length > 0) {
        setMissions(missionList);
      } else {
        // Fallback to client catalog with mission 1 unlocked
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
  }, []);

  // Filter missions for the currently active sector
  const currentSector = SECTORS_LIST.find((s) => s.id === activeSectorId) || SECTORS_LIST[0];
  const sectorMissions = missions.filter((m) => m.sectorId === activeSectorId);

  // Total stars calculated across all 50 missions
  const totalStars = missions.reduce((sum, m) => sum + (m.stars || 0), 0);
  const totalCompleted = missions.filter((m) => m.isCompleted).length;

  const handleLaunch = async (mission) => {
    if (!mission.isUnlocked) {
      soundManager.playShieldHit();
      setErrorMessage(`Mission ${mission.name} is locked. Complete previous missions first.`);
      setTimeout(() => setErrorMessage(null), 3500);
      return;
    }

    soundManager.playLaser();
    setLaunchingId(mission.id);
    setErrorMessage(null);

    try {
      // Start session on backend
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
        setErrorMessage(res.message || res.data?.message || 'Failed to initialize mission session');
      }
    } catch (err) {
      console.error('Launch mission error:', err);
      // If server route fails or offline, still launch for uninterrupted play
      if (onLaunchMission) {
        onLaunchMission(mission, `local-session-${Date.now()}`);
      }
    } finally {
      setLaunchingId(null);
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* ================= TOP NAVIGATION & STATS BAR ================= */}
      <header style={styles.header} className="glass-panel">
        <div style={styles.headerLeft}>
          <button onClick={onBack} style={styles.backBtn} className="btn-secondary">
            <ArrowLeft size={18} />
            <span>BACK TO BASE</span>
          </button>
          <div>
            <h1 className="font-heading" style={styles.pageTitle}>MISSION COMMAND</h1>
            <p style={styles.subTitle}>50 STRATEGIC DEPLOYMENTS • 5 SECTOR CAMPAIGNS</p>
          </div>
        </div>

        <div style={styles.headerRight}>
          {/* Total Stars Pill */}
          <div style={styles.metricPill} className="glass-card">
            <Star size={16} color="var(--currency-gold)" fill="var(--currency-gold)" />
            <div>
              <div style={styles.metricVal}>{totalStars} / 150</div>
              <div style={styles.metricLabel}>TOTAL STARS</div>
            </div>
          </div>

          {/* Cleared Missions Pill */}
          <div style={styles.metricPill} className="glass-card">
            <Award size={16} color="var(--secondary-cyan)" />
            <div>
              <div style={styles.metricVal}>{totalCompleted} / 50</div>
              <div style={styles.metricLabel}>COMPLETED</div>
            </div>
          </div>

          {/* Active Ship Indicator */}
          <div style={styles.shipPill} className="glass-card">
            <Crosshair size={15} color="var(--electric-magenta)" />
            <div>
              <div style={styles.shipVal}>{selectedShip?.name || 'V-01 ORBITRON'}</div>
              <div style={styles.metricLabel}>DEPLOYED FIGHTER</div>
            </div>
          </div>
        </div>
      </header>

      {/* Error / Locked Alert */}
      {errorMessage && (
        <div style={styles.alertBanner} className="glass-panel animate-pulse-glow">
          <ShieldAlert size={18} color="#EF4444" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ================= 5 SECTOR TABS ================= */}
      <div style={styles.sectorsContainer}>
        {SECTORS_LIST.map((sector, idx) => {
          const isActive = sector.id === activeSectorId;
          const sectorMissionsList = missions.filter((m) => m.sectorId === sector.id);
          const sectorStars = sectorMissionsList.reduce((s, m) => s + (m.stars || 0), 0);
          const isSectorUnlocked = sectorMissionsList.some((m) => m.isUnlocked);

          return (
            <button
              key={sector.id}
              onClick={() => {
                soundManager.playPickup('core');
                setActiveSectorId(sector.id);
              }}
              style={{
                ...styles.sectorTab,
                borderColor: isActive ? 'var(--secondary-cyan)' : 'var(--border-glass)',
                background: isActive 
                  ? 'linear-gradient(180deg, rgba(0, 229, 255, 0.16) 0%, rgba(10, 15, 44, 0.85) 100%)' 
                  : 'rgba(6, 9, 25, 0.6)',
                transform: isActive ? 'translateY(-2px)' : 'none',
                boxShadow: isActive ? '0 0 18px rgba(0, 229, 255, 0.25)' : 'none'
              }}
              className="glass-card"
            >
              <div style={styles.sectorHeaderRow}>
                <span style={styles.sectorIndex}>SECTOR 0{idx + 1}</span>
                <span style={styles.sectorRange}>M {sector.range}</span>
              </div>
              <div className="font-heading" style={styles.sectorName}>
                {sector.name}
              </div>
              <div style={styles.sectorMetaRow}>
                <div style={styles.sectorStars}>
                  <Star size={12} color="var(--currency-gold)" fill="var(--currency-gold)" />
                  <span>{sectorStars} / 30</span>
                </div>
                <div style={styles.bossPreview}>
                  <Skull size={12} color="#EF4444" />
                  <span>{sector.boss}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ================= SECTOR BANNER ================= */}
      <div style={styles.sectorBanner} className="glass-panel">
        <div style={styles.bannerInfo}>
          <div style={styles.sectorTag}>ACTIVE THEATER: {currentSector.name.toUpperCase()}</div>
          <h2 className="font-heading" style={styles.bannerHeading}>
            SECTOR CAMPAIGN: MISSIONS {currentSector.range}
          </h2>
          <p style={styles.bannerDesc}>
            Eliminate hostile Void Vanguard outposts, secure tactical jump points, and defeat the flagship apex encounter: <strong style={{ color: '#EF4444' }}>{currentSector.boss}</strong>.
          </p>
        </div>

        <button 
          onClick={fetchMissionsProgress} 
          style={styles.refreshBtn} 
          title="Refresh Progress"
          className="btn-secondary"
        >
          <RefreshCw size={16} />
          <span>SYNC PROGRESS</span>
        </button>
      </div>

      {/* ================= 10 MISSION CARDS GRID ================= */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div className="spinner" />
          <p className="font-heading" style={{ marginTop: '16px', color: 'var(--secondary-cyan)' }}>
            CALIBRATING SECTOR TELEMETRY...
          </p>
        </div>
      ) : (
        <div style={styles.gridContainer}>
          {sectorMissions.map((m) => {
            const isBossMission = !!m.boss;
            const isUnlocked = m.isUnlocked;
            const isLaunching = launchingId === m.id;

            return (
              <div
                key={m.id}
                style={{
                  ...styles.missionCard,
                  borderColor: isBossMission 
                    ? 'rgba(239, 68, 68, 0.7)' 
                    : isUnlocked 
                      ? 'var(--border-glass)' 
                      : 'rgba(255, 255, 255, 0.05)',
                  background: isBossMission
                    ? 'radial-gradient(circle at top, rgba(239, 68, 68, 0.12) 0%, rgba(6, 9, 25, 0.95) 75%)'
                    : isUnlocked
                      ? 'linear-gradient(180deg, rgba(14, 23, 50, 0.8) 0%, rgba(6, 9, 25, 0.95) 100%)'
                      : 'rgba(10, 15, 30, 0.5)',
                  opacity: isUnlocked ? 1 : 0.65
                }}
                className={`glass-card ${isUnlocked ? 'glass-card-hover' : ''}`}
              >
                {/* Card Top: Number & Objective Badge */}
                <div style={styles.cardHeader}>
                  <div style={styles.missionSeqBadge}>
                    <span className="font-heading">{String(m.sequence).padStart(2, '0')}</span>
                  </div>

                  <div style={styles.badgeGroup}>
                    {isBossMission && (
                      <span style={styles.bossBadge}>
                        <Skull size={11} /> BOSS APEX
                      </span>
                    )}
                    <span style={styles.objectiveBadge}>
                      {m.objectiveType?.replace('_', ' ')?.toUpperCase() || 'COMBAT'}
                    </span>
                  </div>
                </div>

                {/* Card Body: Mission Name & Subtitle */}
                <div style={styles.cardBody}>
                  <div style={styles.cardSubtitle}>{m.subtitle}</div>
                  <h3 className="font-heading" style={{
                    ...styles.cardTitle,
                    color: isBossMission ? '#FCA5A5' : 'var(--text-light)'
                  }}>
                    {m.name}
                  </h3>

                  {/* Star Rating Display */}
                  <div style={styles.starsRow}>
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        size={16}
                        color={starIdx <= (m.stars || 0) ? 'var(--currency-gold)' : 'rgba(255, 255, 255, 0.18)'}
                        fill={starIdx <= (m.stars || 0) ? 'var(--currency-gold)' : 'transparent'}
                      />
                    ))}
                    {m.highScore > 0 && (
                      <span style={styles.highScoreText}>
                        HIGH: {m.highScore.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Rewards Preview */}
                <div style={styles.rewardsRow}>
                  <div style={styles.rewardPill}>
                    <Coins size={13} color="var(--currency-gold)" />
                    <span>+{m.rewards?.credits || 100}</span>
                  </div>
                  <div style={styles.rewardPill}>
                    <Zap size={13} color="var(--secondary-cyan)" />
                    <span>+{m.rewards?.xp || 50} XP</span>
                  </div>
                  {m.rewards?.energyCores > 0 && (
                    <div style={styles.rewardPill}>
                      <Compass size={13} color="var(--cosmic-purple)" />
                      <span>+{m.rewards?.energyCores} CORES</span>
                    </div>
                  )}
                </div>

                {/* Card Action Button */}
                <div style={styles.cardFooter}>
                  {isUnlocked ? (
                    <button
                      onClick={() => handleLaunch(m)}
                      disabled={isLaunching}
                      style={{
                        ...styles.launchBtn,
                        background: isBossMission
                          ? 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)'
                          : 'linear-gradient(135deg, var(--secondary-cyan) 0%, #0099FF 100%)'
                      }}
                      className={isBossMission ? 'animate-pulse-glow' : ''}
                    >
                      {isLaunching ? (
                        <>
                          <div className="spinner" style={{ width: '14px', height: '14px' }} />
                          <span>DEPLOYING...</span>
                        </>
                      ) : (
                        <>
                          <Play size={14} fill="currentColor" />
                          <span>{m.isCompleted ? 'REPLAY MISSION' : 'LAUNCH COMBAT'}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div style={styles.lockedBtn}>
                      <Lock size={14} color="var(--text-muted)" />
                      <span>LOCKED (COMPLETE M{String(m.sequence - 1).padStart(2, '0')})</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% 15%, #0F1738 0%, #060919 70%)',
    color: 'var(--text-light)',
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderRadius: '16px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    fontSize: '0.82rem',
    fontWeight: 'bold',
    borderRadius: '10px'
  },
  pageTitle: {
    fontSize: '1.45rem',
    letterSpacing: '0.08em',
    color: 'var(--secondary-cyan)',
    margin: 0
  },
  subTitle: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    margin: 0
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  metricPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 14px',
    borderRadius: '10px'
  },
  metricVal: {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.95rem',
    color: 'var(--text-light)',
    lineHeight: 1
  },
  metricLabel: {
    fontSize: '0.62rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.06em'
  },
  shipPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 45, 255, 0.3)'
  },
  shipVal: {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.85rem',
    color: 'var(--electric-magenta)',
    lineHeight: 1
  },
  alertBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    borderRadius: '10px',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    background: 'rgba(69, 10, 10, 0.85)',
    color: '#FCA5A5',
    fontSize: '0.88rem'
  },
  sectorsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '12px'
  },
  sectorTab: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '14px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    border: '1px solid var(--border-glass)'
  },
  sectorHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectorIndex: {
    fontSize: '0.65rem',
    color: 'var(--secondary-cyan)',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '0.08em'
  },
  sectorRange: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-heading)'
  },
  sectorName: {
    fontSize: '0.95rem',
    color: 'var(--text-light)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  sectorMetaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px'
  },
  sectorStars: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.72rem',
    color: 'var(--currency-gold)',
    fontFamily: 'var(--font-heading)'
  },
  bossPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.68rem',
    color: 'var(--text-muted)'
  },
  sectorBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 24px',
    borderRadius: '14px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  bannerInfo: {
    maxWidth: '780px'
  },
  sectorTag: {
    fontSize: '0.72rem',
    fontFamily: 'var(--font-heading)',
    color: 'var(--secondary-cyan)',
    letterSpacing: '0.1em'
  },
  bannerHeading: {
    fontSize: '1.25rem',
    margin: '4px 0 6px 0',
    color: 'var(--text-light)'
  },
  bannerDesc: {
    fontSize: '0.84rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    margin: 0
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    fontSize: '0.8rem',
    borderRadius: '10px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 0'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px'
  },
  missionCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '18px',
    borderRadius: '14px',
    border: '1px solid var(--border-glass)',
    minHeight: '230px',
    transition: 'all 0.25s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  missionSeqBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(0, 229, 255, 0.12)',
    border: '1px solid rgba(0, 229, 255, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--secondary-cyan)',
    fontSize: '0.9rem'
  },
  badgeGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  bossBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '3px 8px',
    borderRadius: '6px',
    background: 'rgba(239, 68, 68, 0.25)',
    border: '1px solid #EF4444',
    color: '#FCA5A5',
    fontSize: '0.62rem',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '0.06em'
  },
  objectiveBadge: {
    padding: '3px 8px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.08)',
    color: 'var(--text-muted)',
    fontSize: '0.62rem',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '0.06em'
  },
  cardBody: {
    margin: '12px 0 8px 0'
  },
  cardSubtitle: {
    fontSize: '0.68rem',
    color: 'var(--secondary-cyan)',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '0.08em'
  },
  cardTitle: {
    fontSize: '1.05rem',
    margin: '4px 0 8px 0',
    letterSpacing: '0.04em'
  },
  starsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  highScoreText: {
    marginLeft: '8px',
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-heading)'
  },
  rewardsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    padding: '8px 0',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
  },
  rewardPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.72rem',
    fontFamily: 'var(--font-heading)',
    color: 'var(--text-light)'
  },
  cardFooter: {
    marginTop: '12px'
  },
  launchBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '10px',
    color: '#060919',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.82rem',
    fontWeight: 'bold',
    letterSpacing: '0.08em',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  lockedBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-muted)',
    fontSize: '0.72rem',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '0.06em'
  }
};

export default MissionsPage;
