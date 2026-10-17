import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api.js';
import soundManager from '../game/managers/SoundManager.js';
import { MISSIONS_CATALOG } from '../data/missionsData.js';
import { 
  Play, Compass, Shield, Award, ChevronRight, 
  Coins, Zap, Star, Flame, Trophy, Crosshair, 
  CheckCircle2, Clock, Sparkles, ArrowRight, RefreshCw
} from 'lucide-react';

export const DashboardPage = ({ onNavigate, onLaunchQuickCombat, selectedShip: propSelectedShip }) => {
  const { user, profile, refreshProfile } = useAuth();

  // Real backend-driven state
  const [activeShip, setActiveShip] = useState(null);
  const [dailyQuests, setDailyQuests] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const handleNav = (screenName) => {
    soundManager.playLaser();
    if (onNavigate) onNavigate(screenName);
  };

  const completedCount = profile?.stats?.missionsCompleted || 0;
  const currentMissionNumber = Math.min(50, completedCount + 1);

  // Sector title calculation
  const getSectorInfo = (num) => {
    if (num <= 10) return { sector: 'SECTOR 1', name: 'NEBULA OUTPOST', desc: 'Secure forward recon outposts against Void Vanguard advance scouts.' };
    if (num <= 20) return { sector: 'SECTOR 2', name: 'DARK ORBIT', desc: 'Navigate dense planetary orbital defenses and intercept stealth strike craft.' };
    if (num <= 30) return { sector: 'SECTOR 3', name: 'ASTEROID BELT', desc: 'Navigate through dangerous asteroid fields and eliminate hostile vanguard forces.' };
    if (num <= 40) return { sector: 'SECTOR 4', name: 'VOID RIFT', desc: 'Penetrate deep dimensional anomalies and survive multi-wave heavy cruisers.' };
    return { sector: 'SECTOR 5', name: 'FINAL FRONTIER', desc: 'Assault the sovereign flagship citadel and defeat the apex Void Overlord.' };
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
      const ledgerRes = await api.get('/wallet/ledger?limit=3');
      if (ledgerRes.data?.success && ledgerRes.data.transactions) {
        setRecentTransactions(ledgerRes.data.transactions.slice(0, 3));
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

  // If at mission 50, show the final 3 missions
  const displayedMissions = upcomingMissions.length > 0 
    ? upcomingMissions 
    : MISSIONS_CATALOG.slice(-3);

  // Real unlocked achievements count
  const unlockedAchievementsCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div style={styles.container}>
      {/* ================= TOP SECTION: 2 COLUMNS (JOURNEY HERO + SHIP CARD) ================= */}
      <div style={styles.topGrid}>
        {/* LEFT: CONTINUE YOUR JOURNEY (HERO) */}
        <div style={styles.journeyCard} className="glass-panel cyber-box">
          <div style={styles.journeyHeader}>
            <span className="badge badge-cyan">CONTINUE YOUR JOURNEY</span>
            <span style={styles.missionProgressTag}>
              MISSION {String(currentMissionNumber).padStart(2, '0')} / 50
            </span>
          </div>

          <div style={styles.journeyBody}>
            <div className="font-heading" style={styles.sectorSubTitle}>
              {activeSector.sector}
            </div>
            <h1 className="font-heading text-glow-cyan" style={styles.sectorTitle}>
              {activeSector.name}
            </h1>
            <p style={styles.sectorDesc}>
              {activeSector.desc}
            </p>
          </div>

          <div style={styles.journeyFooter}>
            <button
              id="dashboard-btn-continue"
              onClick={() => onLaunchQuickCombat ? onLaunchQuickCombat() : handleNav('gameplay')}
              className="btn btn-cyan animate-pulse-glow"
              style={styles.continueBtn}
            >
              <Play size={18} fill="currentColor" />
              <span>CONTINUE MISSION</span>
            </button>
            <button
              onClick={() => handleNav('missions')}
              className="btn btn-outline"
              style={styles.sectorMapBtn}
            >
              <Compass size={16} />
              <span>SECTOR MAP</span>
            </button>
          </div>
        </div>

        {/* RIGHT: YOUR CURRENT SHIP (PODIUM & STATS) */}
        <div style={styles.currentShipCard} className="glass-panel cyber-box">
          <div style={styles.shipCardHeader}>
            <div>
              <span className="badge badge-purple" style={{ fontSize: '0.62rem' }}>YOUR CURRENT SHIP</span>
              <h2 className="font-heading text-glow-cyan" style={styles.shipName}>
                {currentShipName}
              </h2>
              <span style={styles.shipClass}>{currentShipClass}</span>
            </div>
            <button
              onClick={() => handleNav('hangar')}
              style={styles.goToHangarBtn}
              className="btn btn-outline"
            >
              <span>HANGAR</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Rendered Spaceship Graphic */}
          <div style={styles.shipPreviewContainer}>
            <div style={styles.holoRing} />
            <div className="animate-float" style={styles.shipWrapper}>
              <svg width="150" height="150" viewBox="0 0 64 64" style={{ filter: 'drop-shadow(0 0 16px rgba(0, 229, 255, 0.7))' }}>
                <polygon points="32,6 44,28 60,52 48,56 38,48 32,58 26,48 16,56 4,52 20,28" fill="#00E5FF" />
                <polygon points="32,10 42,32 52,50 40,48 32,54 24,48 12,50 22,32" fill="#0A1232" />
                <ellipse cx="32" cy="26" rx="4" ry="10" fill="#FFFFFF" />
                <circle cx="28" cy="56" r="3" fill="#FF2DFF" />
                <circle cx="36" cy="56" r="3" fill="#FF2DFF" />
              </svg>
            </div>
          </div>

          {/* 4 Stat Tracks - Powered by Real Module Upgrades */}
          <div style={styles.shipStatsList}>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>FIREPOWER (LVL {upgrades.weapon || 1})</span>
              <div style={styles.statBarTrack}>
                <div style={{ ...styles.statBarFill, width: `${liveFirepower}%`, background: 'linear-gradient(90deg, #6D28D9, #A855F7)' }} />
              </div>
              <span style={styles.statVal}>{liveFirepower}</span>
            </div>

            <div style={styles.statRow}>
              <span style={styles.statLabel}>SHIELD (LVL {upgrades.shield || 1})</span>
              <div style={styles.statBarTrack}>
                <div style={{ ...styles.statBarFill, width: `${liveShield}%`, background: 'linear-gradient(90deg, #0099FF, #00E5FF)' }} />
              </div>
              <span style={styles.statVal}>{liveShield}</span>
            </div>

            <div style={styles.statRow}>
              <span style={styles.statLabel}>SPEED (LVL {upgrades.engine || 1})</span>
              <div style={styles.statBarTrack}>
                <div style={{ ...styles.statBarFill, width: `${liveSpeed}%`, background: 'linear-gradient(90deg, #D97706, #FBBF24)' }} />
              </div>
              <span style={styles.statVal}>{liveSpeed}</span>
            </div>

            <div style={styles.statRow}>
              <span style={styles.statLabel}>MANEUVER (LVL {upgrades.special || 1})</span>
              <div style={styles.statBarTrack}>
                <div style={{ ...styles.statBarFill, width: `${liveManeuver}%`, background: 'linear-gradient(90deg, #059669, #10B981)' }} />
              </div>
              <span style={styles.statVal}>{liveManeuver}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM SECTION: 3 PANELS ================= */}
      <div style={styles.bottomGrid}>
        {/* PANEL 1: UPCOMING MISSIONS (Real Data-Driven Catalog) */}
        <div style={styles.panelCard} className="glass-panel cyber-box">
          <div style={styles.panelHeader}>
            <span className="font-heading" style={styles.panelTitle}>UPCOMING MISSIONS</span>
            <button onClick={() => handleNav('missions')} style={styles.panelLink}>VIEW ALL &rarr;</button>
          </div>

          <div style={styles.missionsList}>
            {displayedMissions.map((m) => (
              <div 
                key={m.id} 
                style={styles.missionItem} 
                className="glass-card"
                onClick={() => handleNav('missions')}
              >
                <div style={styles.missionItemLeft}>
                  <div style={styles.missionItemIcon}>
                    <Crosshair size={14} color="var(--secondary-cyan)" />
                  </div>
                  <div>
                    <div className="font-heading" style={styles.missionItemTitle}>
                      {m.name || `MISSION ${String(m.globalSequence).padStart(2, '0')}`}
                    </div>
                    <div style={styles.missionItemSub}>
                      {m.sectorName || 'Nebula Outpost'} • {m.objectiveType?.replace('_', ' ').toUpperCase() || 'COMBAT'}
                    </div>
                  </div>
                </div>

                <div style={styles.missionItemRight}>
                  <div style={styles.rewardTag}>
                    <Coins size={12} color="var(--currency-gold)" />
                    <span>+{m.rewards?.credits || 100}</span>
                  </div>
                  <div style={styles.arrowIcon}>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 2: DAILY MISSIONS & ACHIEVEMENTS (Real User Quests) */}
        <div style={styles.panelCard} className="glass-panel cyber-box">
          <div style={styles.panelHeader}>
            <span className="font-heading" style={styles.panelTitle}>DAILY MISSIONS</span>
            <button onClick={() => handleNav('quests')} style={styles.panelLink}>QUESTS &rarr;</button>
          </div>

          <div style={styles.dailyTasksList}>
            {dailyQuests.length === 0 ? (
              <div style={styles.emptyNotice}>Loading active daily mission telemetry...</div>
            ) : (
              dailyQuests.slice(0, 3).map((q) => {
                const pct = Math.min(100, Math.round(((q.progress || 0) / (q.target || 1)) * 100));
                return (
                  <div key={q.id} style={styles.taskItem}>
                    <div style={styles.taskItemHeader}>
                      <span style={styles.taskName}>{q.title}</span>
                      <span style={styles.taskReward}>
                        +{q.rewardCredits || 100}{' '}
                        <Coins size={11} color="var(--currency-gold)" style={{ verticalAlign: 'middle' }} />
                      </span>
                    </div>
                    <div style={styles.taskProgressRow}>
                      <div style={styles.taskBarTrack}>
                        <div 
                          style={{ 
                            ...styles.taskBarFill, 
                            width: `${pct}%`, 
                            background: q.isClaimed 
                              ? 'var(--status-green)' 
                              : 'linear-gradient(90deg, #00E5FF, #0099FF)' 
                          }} 
                        />
                      </div>
                      <span style={styles.taskProgressText}>
                        {q.isClaimed ? 'CLAIMED' : `${q.progress || 0} / ${q.target}`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Achievement Badges Row (Live Unlocks) */}
          <div style={styles.achievementRow}>
            <span style={styles.achieveLabel}>
              ACHIEVEMENTS ({unlockedAchievementsCount} / {achievements.length || 10})
            </span>
            <div style={styles.badgeIconsGroup}>
              {achievements.slice(0, 5).map((a) => (
                <div 
                  key={a.id} 
                  style={{
                    ...styles.achieveBadgeIcon,
                    background: a.isUnlocked ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                    borderColor: a.isUnlocked ? 'var(--secondary-cyan)' : 'rgba(255, 255, 255, 0.08)'
                  }} 
                  title={`${a.title} - ${a.description} (${a.isUnlocked ? 'UNLOCKED' : 'LOCKED'})`}
                  onClick={() => handleNav('quests')}
                >
                  <Award size={14} color={a.isUnlocked ? 'var(--secondary-cyan)' : 'var(--text-muted)'} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL 3: RECENT REWARDS & LEDGER (Real Transactions) */}
        <div style={styles.panelCard} className="glass-panel cyber-box">
          <div style={styles.panelHeader}>
            <span className="font-heading" style={styles.panelTitle}>RECENT REWARDS</span>
            <button onClick={() => handleNav('wallet')} style={styles.panelLink}>WALLET &rarr;</button>
          </div>

          <div style={styles.rewardsFeed}>
            {recentTransactions.length === 0 ? (
              <div style={styles.emptyNotice}>
                No wallet transactions recorded yet. Complete sorties or claim daily supplies to earn rewards.
              </div>
            ) : (
              recentTransactions.map((tx) => {
                const isCredit = tx.transactionType === 'CREDIT';
                return (
                  <div key={tx._id} style={styles.rewardFeedItem} className="glass-card" onClick={() => handleNav('wallet')}>
                    <div style={isCredit ? styles.feedIconBoxGold : styles.feedIconBoxPurple}>
                      {tx.currencyType === 'ENERGY_CORES' ? (
                        <Zap size={14} color="#C084FC" />
                      ) : (
                        <Coins size={14} color={isCredit ? 'var(--currency-gold)' : '#EF4444'} />
                      )}
                    </div>
                    <div style={styles.feedInfo}>
                      <div style={styles.feedTitle}>{tx.description || tx.source || 'Wallet Adjustment'}</div>
                      <div style={styles.feedSub}>{new Date(tx.createdAt).toLocaleTimeString()}</div>
                    </div>
                    <span 
                      className="font-heading" 
                      style={{
                        ...(isCredit ? styles.feedAmountGold : styles.feedAmountPurple),
                        color: isCredit ? 'var(--currency-gold)' : '#EF4444'
                      }}
                    >
                      {isCredit ? `+${tx.amount}` : `-${tx.amount}`} {tx.currencyType}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '1440px',
    margin: '0 auto',
    width: '100%'
  },
  topGrid: {
    display: 'grid',
    gridTemplateColumns: '1.45fr 1fr',
    gap: '20px',
    alignItems: 'stretch'
  },
  journeyCard: {
    padding: '32px 36px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '320px',
    background: 'radial-gradient(circle at 10% 20%, rgba(0, 229, 255, 0.12) 0%, rgba(8, 12, 32, 0.95) 70%)',
    position: 'relative',
    overflow: 'hidden'
  },
  journeyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  missionProgressTag: {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em'
  },
  journeyBody: {
    margin: '20px 0'
  },
  sectorSubTitle: {
    fontSize: '0.88rem',
    color: 'var(--secondary-cyan)',
    letterSpacing: '0.12em',
    marginBottom: '6px'
  },
  sectorTitle: {
    fontSize: '2.4rem',
    fontWeight: '900',
    letterSpacing: '0.06em',
    lineHeight: 1.1,
    marginBottom: '12px'
  },
  sectorDesc: {
    fontSize: '0.92rem',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
    maxWidth: '540px'
  },
  journeyFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginTop: '12px'
  },
  continueBtn: {
    padding: '14px 28px',
    fontSize: '0.92rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  sectorMapBtn: {
    padding: '14px 22px',
    fontSize: '0.92rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  currentShipCard: {
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: 'radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.15) 0%, rgba(8, 12, 32, 0.95) 75%)',
    position: 'relative',
    overflow: 'hidden'
  },
  shipCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  shipName: {
    fontSize: '1.35rem',
    marginTop: '4px',
    letterSpacing: '0.06em'
  },
  shipClass: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)'
  },
  goToHangarBtn: {
    padding: '6px 12px',
    fontSize: '0.74rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  shipPreviewContainer: {
    position: 'relative',
    height: '140px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px 0'
  },
  holoRing: {
    position: 'absolute',
    width: '160px',
    height: '40px',
    borderRadius: '50%',
    border: '1.5px solid rgba(0, 229, 255, 0.35)',
    boxShadow: '0 0 20px rgba(0, 229, 255, 0.25)',
    transform: 'rotateX(65deg)',
    bottom: '15px'
  },
  shipWrapper: {
    zIndex: 2
  },
  shipStatsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  statRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  statLabel: {
    width: '130px',
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '0.05em'
  },
  statBarTrack: {
    flex: 1,
    height: '6px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  statBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.4s ease'
  },
  statVal: {
    width: '28px',
    fontSize: '0.74rem',
    fontWeight: '700',
    color: 'var(--text-light)',
    textAlign: 'right'
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px'
  },
  panelCard: {
    padding: '22px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    minHeight: '280px',
    background: 'rgba(8, 12, 32, 0.92)'
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '10px'
  },
  panelTitle: {
    fontSize: '0.84rem',
    letterSpacing: '0.08em',
    color: 'var(--text-light)'
  },
  panelLink: {
    background: 'none',
    border: 'none',
    color: 'var(--secondary-cyan)',
    fontSize: '0.72rem',
    fontFamily: 'var(--font-heading)',
    cursor: 'pointer',
    padding: '2px 4px'
  },
  missionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  missionItem: {
    padding: '12px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.06)'
  },
  missionItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  missionItemIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: 'rgba(0, 229, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  missionItemTitle: {
    fontSize: '0.82rem',
    color: 'var(--text-light)'
  },
  missionItemSub: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)'
  },
  missionItemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  rewardTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.74rem',
    color: 'var(--currency-gold)',
    fontWeight: '700'
  },
  arrowIcon: {
    color: 'var(--text-muted)'
  },
  dailyTasksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    flex: 1
  },
  taskItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  taskItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.78rem'
  },
  taskName: {
    color: 'var(--text-light)'
  },
  taskReward: {
    color: 'var(--currency-gold)',
    fontWeight: '700',
    fontSize: '0.74rem'
  },
  taskProgressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  taskBarTrack: {
    flex: 1,
    height: '6px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  taskBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  },
  taskProgressText: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    minWidth: '45px',
    textAlign: 'right'
  },
  achievementRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '12px',
    marginTop: 'auto'
  },
  achieveLabel: {
    fontSize: '0.68rem',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '0.06em',
    color: 'var(--text-muted)'
  },
  badgeIconsGroup: {
    display: 'flex',
    gap: '6px'
  },
  achieveBadgeIcon: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'transform 0.15s ease'
  },
  rewardsFeed: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  rewardFeedItem: {
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  feedIconBoxGold: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: 'rgba(251, 191, 36, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  feedIconBoxPurple: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: 'rgba(168, 85, 247, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  feedInfo: {
    flex: 1
  },
  feedTitle: {
    fontSize: '0.8rem',
    color: 'var(--text-light)',
    fontWeight: '600'
  },
  feedSub: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)'
  },
  feedAmountGold: {
    fontSize: '0.8rem',
    fontWeight: '700'
  },
  feedAmountPurple: {
    fontSize: '0.8rem',
    fontWeight: '700'
  },
  emptyNotice: {
    padding: '24px 10px',
    textAlign: 'center',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4'
  }
};

export default DashboardPage;
