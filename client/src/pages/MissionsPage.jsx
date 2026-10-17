import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import { SECTORS_LIST, MISSIONS_CATALOG, BOSS_ENCOUNTERS } from '../data/missionsData.js';
import { 
  ArrowLeft, Star, Lock, Play, Shield, ShieldAlert, Award, 
  Coins, Zap, Compass, Crosshair, Skull, ChevronRight, RefreshCw, Sparkles 
} from 'lucide-react';

export const MissionsPage = ({ onBack, onNavigate, onLaunchMission, selectedShip = { name: 'V-01 ORBITRON', speed: 380, damage: 25 } }) => {
  const { user, profile, isAuthenticated, refreshProfile } = useAuth();
  const [activeSectorId, setActiveSectorId] = useState('sector-1');
  const [difficulty, setDifficulty] = useState('NORMAL');
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
    if (!isAuthenticated) {
      soundManager.playLaser();
      if (onLaunchMission) {
        onLaunchMission(mission, null);
      } else if (onNavigate) {
        onNavigate('auth');
      }
      return;
    }

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
      {/* ================= SCREEN 4 SUBHEADER & DIFFICULTY ================= */}
      <div style={styles.subHeaderBar} className="glass-panel cyber-box">
        <div>
          <h1 className="font-heading text-glow-cyan" style={styles.pageTitle}>MISSION SELECTION</h1>
          <p style={styles.subTitle}>Explore different sectors and complete 50 tactical missions</p>
        </div>

        <div style={styles.headerRightActions}>
          {/* Difficulty Tabs: NORMAL, HARD, EXPERT */}
          <div style={styles.diffGroup}>
            {['NORMAL', 'HARD', 'EXPERT'].map((diff) => (
              <button
                key={diff}
                onClick={() => {
                  soundManager.playPickup('core');
                  setDifficulty(diff);
                }}
                style={{
                  ...styles.diffBtn,
                  background: difficulty === diff ? 'var(--secondary-cyan)' : 'rgba(255, 255, 255, 0.05)',
                  color: difficulty === diff ? '#060919' : 'var(--text-muted)',
                  borderColor: difficulty === diff ? 'var(--secondary-cyan)' : 'rgba(255, 255, 255, 0.12)',
                  boxShadow: difficulty === diff ? '0 0 12px rgba(0, 229, 255, 0.4)' : 'none'
                }}
                className="font-heading"
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Quick Metrics */}
          <div style={styles.sectorStatsBadge} className="glass-card">
            <Star size={14} color="var(--currency-gold)" fill="var(--currency-gold)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--currency-gold)', fontWeight: '700' }}>{totalStars}/150</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
            <Award size={14} color="var(--secondary-cyan)" />
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary-cyan)', fontWeight: '700' }}>{totalCompleted}/50</span>
          </div>
        </div>
      </div>

      {/* Guest Mode Banner */}
      {!isAuthenticated && (
        <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', border: '1px solid rgba(0, 229, 255, 0.35)', background: 'rgba(0, 229, 255, 0.08)', borderRadius: '8px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="var(--secondary-cyan)" />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
              TACTICAL MISSIONS PREVIEW // Browse 50 campaign missions across 5 sectors. Enlist or login to launch combat sorties and log sector stars.
            </span>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('auth')} 
            className="btn btn-cyan animate-pulse-glow" 
            style={{ padding: '6px 18px', fontSize: '0.76rem', fontWeight: 'bold' }}
          >
            LOGIN / ENLIST
          </button>
        </div>
      )}

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
                    ? 'rgba(239, 68, 68, 0.8)' 
                    : m.isCompleted
                      ? 'rgba(0, 229, 255, 0.45)'
                      : isUnlocked 
                        ? 'rgba(0, 229, 255, 0.3)' 
                        : 'rgba(255, 255, 255, 0.05)',
                  background: isBossMission
                    ? 'radial-gradient(circle at top, rgba(239, 68, 68, 0.18) 0%, rgba(6, 9, 25, 0.95) 75%)'
                    : m.isCompleted
                      ? 'radial-gradient(circle at top, rgba(0, 229, 255, 0.1) 0%, rgba(6, 9, 25, 0.95) 100%)'
                      : isUnlocked
                        ? 'linear-gradient(180deg, rgba(14, 23, 50, 0.85) 0%, rgba(6, 9, 25, 0.95) 100%)'
                        : 'rgba(10, 15, 30, 0.5)',
                  opacity: isUnlocked ? 1 : 0.65,
                  boxShadow: isBossMission
                    ? '0 0 25px rgba(239, 68, 68, 0.25)'
                    : m.isCompleted
                      ? '0 0 20px rgba(0, 229, 255, 0.2)'
                      : 'none'
                }}
                className={`glass-card ${isUnlocked ? 'glass-card-hover cyber-box' : ''}`}
              >
                {/* Card Top: Sequence Number & Lock/Status Badge */}
                <div style={styles.cardHeader}>
                  <div style={{
                    ...styles.missionSeqBadge,
                    borderColor: isBossMission ? '#EF4444' : m.isCompleted ? 'var(--secondary-cyan)' : 'var(--border-glass)',
                    background: isBossMission ? 'rgba(239, 68, 68, 0.25)' : m.isCompleted ? 'rgba(0, 229, 255, 0.2)' : 'rgba(0, 229, 255, 0.08)'
                  }}>
                    <span className="font-heading" style={{ color: isBossMission ? '#FCA5A5' : m.isCompleted ? 'var(--secondary-cyan)' : 'var(--text-light)', fontWeight: '700' }}>
                      {String(m.sequence).padStart(2, '0')}
                    </span>
                  </div>

                  <div style={styles.badgeGroup}>
                    {isUnlocked ? (
                      m.isCompleted ? (
                        <span className="badge badge-cyan" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>CLEARED</span>
                      ) : (
                        <span className="badge badge-purple" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>READY</span>
                      )
                    ) : (
                      <span className="badge" style={{ fontSize: '0.6rem', padding: '2px 6px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
                        <Lock size={10} style={{ marginRight: '3px' }} /> LOCKED
                      </span>
                    )}
                  </div>
                </div>

                {/* Center Space Graphic / Thumbnail (Screen 4) */}
                <div style={styles.missionThumbnail}>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: isBossMission
                      ? 'radial-gradient(circle at center, rgba(239,68,68,0.3) 0%, transparent 70%)'
                      : m.isCompleted
                        ? 'radial-gradient(circle at center, rgba(0,229,255,0.2) 0%, transparent 70%)'
                        : 'radial-gradient(circle at center, rgba(168,85,247,0.2) 0%, transparent 70%)'
                  }} />
                  {isBossMission ? (
                    <Skull size={36} color="#EF4444" style={{ filter: 'drop-shadow(0 0 10px #EF4444)' }} className="animate-pulse-glow" />
                  ) : m.sequence % 3 === 1 ? (
                    <Compass size={32} color="var(--secondary-cyan)" style={{ filter: 'drop-shadow(0 0 8px #00E5FF)' }} />
                  ) : m.sequence % 3 === 2 ? (
                    <Crosshair size={32} color="#FBBF24" style={{ filter: 'drop-shadow(0 0 8px #FBBF24)' }} />
                  ) : (
                    <Shield size={32} color="#A855F7" style={{ filter: 'drop-shadow(0 0 8px #A855F7)' }} />
                  )}
                </div>

                {/* Card Body: Mission Name & Star Rating */}
                <div style={styles.cardBody}>
                  <h3 className={`font-heading ${isBossMission ? 'text-glow-magenta' : m.isCompleted ? 'text-glow-cyan' : ''}`} style={{
                    ...styles.cardTitle,
                    color: isBossMission ? '#FCA5A5' : m.isCompleted ? 'var(--secondary-cyan)' : 'var(--text-light)',
                    fontSize: '0.92rem',
                    textAlign: 'center',
                    margin: '6px 0 4px 0'
                  }}>
                    {m.name.replace(/MISSION \d+:\s*/i, '')}
                  </h3>

                  {/* Star Rating Display */}
                  <div style={{ ...styles.starsRow, justifyContent: 'center' }}>
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        size={15}
                        color={starIdx <= (m.stars || 0) ? 'var(--currency-gold)' : 'rgba(255, 255, 255, 0.18)'}
                        fill={starIdx <= (m.stars || 0) ? 'var(--currency-gold)' : 'transparent'}
                        style={starIdx <= (m.stars || 0) ? { filter: 'drop-shadow(0 0 4px #FBBF24)' } : {}}
                      />
                    ))}
                  </div>
                </div>

                {/* Card Footer: Action Button */}
                <div style={styles.cardFooter}>
                  {isUnlocked ? (
                    <button
                      onClick={() => handleLaunch(m)}
                      disabled={isLaunching}
                      style={{
                        ...styles.launchBtn,
                        padding: '8px 12px',
                        fontSize: '0.75rem',
                        background: isBossMission
                          ? 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)'
                          : m.isCompleted
                            ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.25) 0%, rgba(124, 58, 237, 0.25) 100%)'
                            : 'linear-gradient(135deg, #00E5FF 0%, #0099FF 100%)',
                        border: m.isCompleted ? '1px solid rgba(0, 229, 255, 0.5)' : 'none',
                        color: m.isCompleted ? 'var(--secondary-cyan)' : '#050B20'
                      }}
                      className={isBossMission ? 'animate-pulse-magenta' : (!m.isCompleted ? 'animate-pulse-glow' : '')}
                    >
                      {isLaunching ? (
                        <>
                          <div className="spinner" style={{ width: '12px', height: '12px' }} />
                          <span>LAUNCHING...</span>
                        </>
                      ) : (
                        <>
                          <Play size={13} fill="currentColor" />
                          <span>{m.isCompleted ? 'REPLAY' : 'LAUNCH'}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div style={{ ...styles.lockedBtn, padding: '8px 10px', fontSize: '0.68rem' }}>
                      <Lock size={12} color="var(--text-muted)" />
                      <span>LOCKED</span>
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
  subHeaderBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderRadius: '14px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  headerRightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  diffGroup: {
    display: 'flex',
    background: 'rgba(0, 0, 0, 0.4)',
    padding: '4px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    gap: '4px'
  },
  diffBtn: {
    padding: '6px 14px',
    borderRadius: '7px',
    fontSize: '0.72rem',
    fontWeight: '700',
    letterSpacing: '0.08em',
    border: '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  sectorStatsBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(251, 191, 36, 0.3)',
    background: 'rgba(251, 191, 36, 0.08)'
  },
  pageTitle: {
    fontSize: '1.45rem',
    letterSpacing: '0.08em',
    color: 'var(--secondary-cyan)',
    margin: 0
  },
  subTitle: {
    fontSize: '0.74rem',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px'
  },
  missionThumbnail: {
    height: '80px',
    borderRadius: '10px',
    background: 'rgba(0, 0, 0, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    margin: '10px 0 6px 0'
  },
  missionCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '14px',
    borderRadius: '14px',
    border: '1px solid var(--border-glass)',
    minHeight: '210px',
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
