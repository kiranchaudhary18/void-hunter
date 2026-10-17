import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import { 
  Play, Compass, Shield, Award, ChevronRight, 
  Coins, Zap, Star, Flame, Trophy, Crosshair, 
  CheckCircle2, Clock, Sparkles, ArrowRight
} from 'lucide-react';

export const DashboardPage = ({ onNavigate, onLaunchQuickCombat, selectedShip }) => {
  const { user, profile } = useAuth();

  const handleNav = (screenName) => {
    soundManager.playLaser();
    if (onNavigate) onNavigate(screenName);
  };

  const currentShipName = selectedShip?.name || profile?.selectedShipId?.toUpperCase() || 'V-01 ORBITRON';
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
              <span style={styles.shipClass}>Balanced Fighter • All-Rounder</span>
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

          {/* 4 Stat Tracks */}
          <div style={styles.shipStatsList}>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>FIREPOWER</span>
              <div style={styles.statBarTrack}>
                <div style={{ ...styles.statBarFill, width: '78%', background: 'linear-gradient(90deg, #6D28D9, #A855F7)' }} />
              </div>
              <span style={styles.statVal}>78</span>
            </div>

            <div style={styles.statRow}>
              <span style={styles.statLabel}>SHIELD</span>
              <div style={styles.statBarTrack}>
                <div style={{ ...styles.statBarFill, width: '64%', background: 'linear-gradient(90deg, #0099FF, #00E5FF)' }} />
              </div>
              <span style={styles.statVal}>64</span>
            </div>

            <div style={styles.statRow}>
              <span style={styles.statLabel}>SPEED</span>
              <div style={styles.statBarTrack}>
                <div style={{ ...styles.statBarFill, width: '82%', background: 'linear-gradient(90deg, #D97706, #FBBF24)' }} />
              </div>
              <span style={styles.statVal}>82</span>
            </div>

            <div style={styles.statRow}>
              <span style={styles.statLabel}>MANEUVER</span>
              <div style={styles.statBarTrack}>
                <div style={{ ...styles.statBarFill, width: '76%', background: 'linear-gradient(90deg, #059669, #10B981)' }} />
              </div>
              <span style={styles.statVal}>76</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BOTTOM SECTION: 3 PANELS ================= */}
      <div style={styles.bottomGrid}>
        {/* PANEL 1: UPCOMING MISSIONS */}
        <div style={styles.panelCard} className="glass-panel cyber-box">
          <div style={styles.panelHeader}>
            <span className="font-heading" style={styles.panelTitle}>UPCOMING MISSIONS</span>
            <button onClick={() => handleNav('missions')} style={styles.panelLink}>VIEW ALL &rarr;</button>
          </div>

          <div style={styles.missionsList}>
            {[
              { id: currentMissionNumber, name: `Mission ${String(currentMissionNumber).padStart(2, '0')}`, type: 'Recon Patrol', reward: 300 },
              { id: currentMissionNumber + 1, name: `Mission ${String(currentMissionNumber + 1).padStart(2, '0')}`, type: 'Space Minefield', reward: 350 },
              { id: currentMissionNumber + 2, name: `Mission ${String(currentMissionNumber + 2).padStart(2, '0')}`, type: 'Elite Squadron', reward: 400 }
            ].map((m) => (
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
                    <div className="font-heading" style={styles.missionItemTitle}>{m.name}</div>
                    <div style={styles.missionItemSub}>{m.type}</div>
                  </div>
                </div>

                <div style={styles.missionItemRight}>
                  <div style={styles.rewardTag}>
                    <Coins size={12} color="var(--currency-gold)" />
                    <span>+{m.reward}</span>
                  </div>
                  <div style={styles.arrowIcon}>
                    <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 2: DAILY MISSIONS & ACHIEVEMENTS */}
        <div style={styles.panelCard} className="glass-panel cyber-box">
          <div style={styles.panelHeader}>
            <span className="font-heading" style={styles.panelTitle}>DAILY MISSIONS</span>
            <button onClick={() => handleNav('quests')} style={styles.panelLink}>QUESTS &rarr;</button>
          </div>

          <div style={styles.dailyTasksList}>
            {/* Task 1 */}
            <div style={styles.taskItem}>
              <div style={styles.taskItemHeader}>
                <span style={styles.taskName}>Destroy 50 enemies</span>
                <span style={styles.taskReward}>+200 <Coins size={11} color="var(--currency-gold)" style={{ verticalAlign: 'middle' }} /></span>
              </div>
              <div style={styles.taskProgressRow}>
                <div style={styles.taskBarTrack}>
                  <div style={{ ...styles.taskBarFill, width: '64%', background: 'linear-gradient(90deg, #00E5FF, #0099FF)' }} />
                </div>
                <span style={styles.taskProgressText}>32 / 50</span>
              </div>
            </div>

            {/* Task 2 */}
            <div style={styles.taskItem}>
              <div style={styles.taskItemHeader}>
                <span style={styles.taskName}>Collect 5 power-ups</span>
                <span style={styles.taskReward}>+100 <Coins size={11} color="var(--currency-gold)" style={{ verticalAlign: 'middle' }} /></span>
              </div>
              <div style={styles.taskProgressRow}>
                <div style={styles.taskBarTrack}>
                  <div style={{ ...styles.taskBarFill, width: '40%', background: 'linear-gradient(90deg, #A855F7, #C084FC)' }} />
                </div>
                <span style={styles.taskProgressText}>2 / 5</span>
              </div>
            </div>

            {/* Task 3 */}
            <div style={styles.taskItem}>
              <div style={styles.taskItemHeader}>
                <span style={styles.taskName}>Complete 1 campaign mission</span>
                <span style={styles.taskReward}>+150 <Coins size={11} color="var(--currency-gold)" style={{ verticalAlign: 'middle' }} /></span>
              </div>
              <div style={styles.taskProgressRow}>
                <div style={styles.taskBarTrack}>
                  <div style={{ ...styles.taskBarFill, width: '0%', background: 'linear-gradient(90deg, #10B981, #059669)' }} />
                </div>
                <span style={styles.taskProgressText}>0 / 1</span>
              </div>
            </div>
          </div>

          {/* Achievement Badges Row */}
          <div style={styles.achievementRow}>
            <span style={styles.achieveLabel}>ACHIEVEMENT PROGRESS</span>
            <div style={styles.badgeIconsGroup}>
              {['First Blood', 'Sharp Shooter', 'Survivor', 'Explorer', 'Legend'].map((name, i) => (
                <div key={name} style={styles.achieveBadgeIcon} title={name}>
                  <Award size={14} color={i < 2 ? 'var(--secondary-cyan)' : 'var(--text-muted)'} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL 3: RECENT REWARDS & LEDGER */}
        <div style={styles.panelCard} className="glass-panel cyber-box">
          <div style={styles.panelHeader}>
            <span className="font-heading" style={styles.panelTitle}>RECENT REWARDS</span>
            <button onClick={() => handleNav('wallet')} style={styles.panelLink}>WALLET &rarr;</button>
          </div>

          <div style={styles.rewardsFeed}>
            <div style={styles.rewardFeedItem} className="glass-card">
              <div style={styles.feedIconBoxGold}>
                <Coins size={14} color="var(--currency-gold)" />
              </div>
              <div style={styles.feedInfo}>
                <div style={styles.feedTitle}>Mission Completed</div>
                <div style={styles.feedSub}>Sector Sortie Cleared</div>
              </div>
              <span className="font-heading text-glow-gold" style={styles.feedAmountGold}>+350 CREDITS</span>
            </div>

            <div style={styles.rewardFeedItem} className="glass-card">
              <div style={styles.feedIconBoxPurple}>
                <Zap size={14} color="#C084FC" />
              </div>
              <div style={styles.feedInfo}>
                <div style={styles.feedTitle}>Daily Mission Reward</div>
                <div style={styles.feedSub}>Hostile Recon Routine</div>
              </div>
              <span className="font-heading text-glow-purple" style={styles.feedAmountPurple}>+50 CREDITS</span>
            </div>

            <div style={styles.rewardFeedItem} className="glass-card">
              <div style={styles.feedIconBoxCyan}>
                <Trophy size={14} color="var(--secondary-cyan)" />
              </div>
              <div style={styles.feedInfo}>
                <div style={styles.feedTitle}>Achievement Unlocked</div>
                <div style={styles.feedSub}>Sharp Shooter Pilot</div>
              </div>
              <span className="font-heading text-glow-cyan" style={styles.feedAmountCyan}>+5 GEMS</span>
            </div>

            <div style={styles.rewardFeedItem} className="glass-card">
              <div style={styles.feedIconBoxGold}>
                <Star size={14} color="var(--currency-gold)" fill="var(--currency-gold)" />
              </div>
              <div style={styles.feedInfo}>
                <div style={styles.feedTitle}>Star Hunter Badge</div>
                <div style={styles.feedSub}>3 Stars Secured</div>
              </div>
              <span className="font-heading text-glow-gold" style={styles.feedAmountGold}>BADGE UNLOCKED</span>
            </div>
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
    gap: '24px'
  },
  journeyCard: {
    padding: '28px 32px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '280px',
    background: 'radial-gradient(circle at 10% 20%, rgba(0, 229, 255, 0.12) 0%, rgba(10, 16, 42, 0.9) 75%)',
    borderColor: 'rgba(0, 229, 255, 0.3)',
    boxShadow: '0 0 30px rgba(0, 229, 255, 0.12)'
  },
  journeyHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  missionProgressTag: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '0.08em'
  },
  journeyBody: {
    margin: '18px 0'
  },
  sectorSubTitle: {
    fontSize: '0.85rem',
    color: 'var(--secondary-cyan)',
    letterSpacing: '0.12em',
    marginBottom: '4px'
  },
  sectorTitle: {
    fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
    letterSpacing: '0.08em',
    lineHeight: 1.1,
    marginBottom: '10px'
  },
  sectorDesc: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    maxWidth: '540px'
  },
  journeyFooter: {
    display: 'flex',
    gap: '14px',
    alignItems: 'center'
  },
  continueBtn: {
    padding: '14px 28px',
    fontSize: '0.92rem'
  },
  sectorMapBtn: {
    padding: '14px 22px',
    fontSize: '0.88rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  currentShipCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: 'radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.15) 0%, rgba(10, 16, 42, 0.9) 80%)',
    borderColor: 'rgba(124, 58, 237, 0.35)',
    boxShadow: '0 0 30px rgba(124, 58, 237, 0.12)'
  },
  shipCardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  shipName: {
    fontSize: '1.25rem',
    letterSpacing: '0.08em',
    marginTop: '6px'
  },
  shipClass: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    display: 'block',
    marginTop: '2px'
  },
  goToHangarBtn: {
    padding: '6px 12px',
    fontSize: '0.72rem',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  shipPreviewContainer: {
    position: 'relative',
    height: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px 0'
  },
  holoRing: {
    position: 'absolute',
    width: '130px',
    height: '40px',
    borderRadius: '50%',
    border: '1.5px solid rgba(0, 229, 255, 0.4)',
    boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)',
    bottom: '10px'
  },
  shipWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  shipStatsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  statRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  statLabel: {
    fontSize: '0.65rem',
    fontFamily: 'var(--font-heading)',
    color: 'var(--text-muted)',
    width: '75px',
    letterSpacing: '0.06em'
  },
  statBarTrack: {
    flex: 1,
    height: '6px',
    borderRadius: '3px',
    background: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden'
  },
  statBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.4s ease'
  },
  statVal: {
    fontSize: '0.72rem',
    fontFamily: 'var(--font-ui)',
    fontWeight: '700',
    color: 'var(--text-light)',
    width: '24px',
    textAlign: 'right'
  },
  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px'
  },
  panelCard: {
    padding: '22px',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '280px',
    background: 'rgba(10, 16, 42, 0.85)'
  },
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    marginBottom: '14px'
  },
  panelTitle: {
    fontSize: '0.85rem',
    color: 'var(--text-light)',
    letterSpacing: '0.08em'
  },
  panelLink: {
    fontSize: '0.68rem',
    color: 'var(--secondary-cyan)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '0.06em'
  },
  missionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  missionItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
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
    border: '1px solid rgba(0, 229, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  missionItemTitle: {
    fontSize: '0.8rem',
    color: 'var(--text-light)'
  },
  missionItemSub: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)'
  },
  missionItemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  rewardTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.72rem',
    color: 'var(--currency-gold)',
    fontFamily: 'var(--font-heading)',
    background: 'rgba(251, 191, 36, 0.1)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
    padding: '3px 8px',
    borderRadius: '12px'
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
    fontSize: '0.74rem'
  },
  taskName: {
    color: 'var(--text-light)'
  },
  taskReward: {
    color: 'var(--currency-gold)',
    fontSize: '0.72rem',
    fontFamily: 'var(--font-heading)'
  },
  taskProgressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  taskBarTrack: {
    flex: 1,
    height: '6px',
    borderRadius: '3px',
    background: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden'
  },
  taskBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.4s ease'
  },
  taskProgressText: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    width: '38px',
    textAlign: 'right'
  },
  achievementRow: {
    marginTop: '14px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)'
  },
  achieveLabel: {
    fontSize: '0.62rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-heading)',
    display: 'block',
    marginBottom: '8px'
  },
  badgeIconsGroup: {
    display: 'flex',
    gap: '8px'
  },
  achieveBadgeIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rewardsFeed: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  rewardFeedItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px'
  },
  feedIconBoxGold: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    background: 'rgba(251, 191, 36, 0.12)',
    border: '1px solid rgba(251, 191, 36, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px'
  },
  feedIconBoxPurple: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    background: 'rgba(168, 85, 247, 0.12)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px'
  },
  feedIconBoxCyan: {
    width: '26px',
    height: '26px',
    borderRadius: '6px',
    background: 'rgba(0, 229, 255, 0.12)',
    border: '1px solid rgba(0, 229, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px'
  },
  feedInfo: {
    flex: 1
  },
  feedTitle: {
    fontSize: '0.72rem',
    color: 'var(--text-light)',
    fontWeight: '600'
  },
  feedSub: {
    fontSize: '0.58rem',
    color: 'var(--text-muted)'
  },
  feedAmountGold: {
    fontSize: '0.68rem',
    color: 'var(--currency-gold)'
  },
  feedAmountPurple: {
    fontSize: '0.68rem',
    color: '#C084FC'
  },
  feedAmountCyan: {
    fontSize: '0.68rem',
    color: 'var(--secondary-cyan)'
  }
};

export default DashboardPage;
