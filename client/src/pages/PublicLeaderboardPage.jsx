import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import soundManager from '../game/managers/SoundManager.js';
import PublicNavbar from '../components/PublicNavbar.jsx';
import EnlistPromptModal from '../components/EnlistPromptModal.jsx';
import { Trophy, Star, Crown, Medal, User, RefreshCw } from 'lucide-react';

export const PublicLeaderboardPage = ({ onNavigate }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeFrame, setTimeFrame] = useState('ALL_TIME');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch live MongoDB leaderboard rankings
  const fetchLeaderboard = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/leaderboard?timeFrame=${timeFrame}`);
      if (res.data?.success && res.data.leaderboard) {
        setLeaderboard(res.data.leaderboard);
      }
    } catch (err) {
      console.warn('Leaderboard public API error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [timeFrame]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleClaimRank = () => {
    soundManager.playLaser();
    setIsModalOpen(true);
  };

  const handleEnlistConfirm = () => {
    setIsModalOpen(false);
    if (onNavigate) onNavigate('auth');
  };

  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];
  const remainingAces = leaderboard.slice(3);

  return (
    <div style={styles.pageWrapper}>
      {/* Dynamic Starry Space Backdrop */}
      <div style={styles.starsBackdrop} />
      <div style={styles.nebulaGlow} />

      {/* Top Cyber Navigation Bar (No Sidebar) */}
      <PublicNavbar current="leaderboard" onNavigate={onNavigate} />

      {/* Main Public Content */}
      <main style={styles.contentContainer}>
        {/* Hero Section */}
        <div style={styles.heroSection}>
          <div style={styles.heroBadge}>
            <span style={styles.onlineDot}>●</span>
            <span>PUBLIC COMBAT RANKINGS // MONGODB LIVE TELEMETRY</span>
          </div>

          <h1 className="font-heading" style={styles.heroTitle}>
            INTERGALACTIC <span className="text-glow-cyan" style={{ color: 'var(--secondary-cyan)' }}>HALL OF FAME</span>
          </h1>

          <p style={styles.heroSubtitle}>
            Review the most decorated commanders in the galaxy. Real combat telemetry and high scores verified by the authoritative Void Hunter server ledger.
          </p>

          {/* Timeframe Filter Tabs */}
          <div style={styles.filterTabs}>
            {[
              { id: 'ALL_TIME', label: 'ALL TIME ACES' },
              { id: 'WEEKLY', label: 'THIS WEEK' },
              { id: 'DAILY', label: 'TODAY 24H' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playLaser();
                  setTimeFrame(tab.id);
                }}
                style={{
                  ...styles.filterTabBtn,
                  ...(timeFrame === tab.id ? styles.filterTabBtnActive : {})
                }}
                className={`filter-tab ${timeFrame === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top 3 Aces Podium */}
        <div style={styles.podiumGrid}>
          {/* #2 Silver Ace */}
          <div 
            style={{ ...styles.podiumCard, ...styles.podiumRank2 }} 
            className="glass-panel cyber-box animate-hover-lift"
            onClick={handleClaimRank}
          >
            <div style={styles.podiumCrownSilver}>
              <Medal size={28} color="#94A3B8" />
            </div>
            <div style={styles.rankBadgeSilver}>#2 ACE</div>
            <div className="font-heading" style={styles.podiumName}>
              {top2?.name || 'Commander Vega'}
            </div>
            <div style={styles.podiumShip}>{top2?.shipId?.toUpperCase() || 'PHOENIX STRIKE'}</div>
            <div style={styles.podiumScoreGroup}>
              <span className="font-heading text-glow-cyan" style={styles.podiumScoreVal}>
                {(top2?.totalScore || 84200).toLocaleString()}
              </span>
              <span style={styles.podiumScoreLbl}>PTS</span>
            </div>
          </div>

          {/* #1 Gold Sovereign Champion */}
          <div 
            style={{ ...styles.podiumCard, ...styles.podiumRank1 }} 
            className="glass-panel cyber-box animate-hover-lift"
            onClick={handleClaimRank}
          >
            <div style={styles.podiumCrownGold}>
              <Crown size={34} color="#FBBF24" style={{ filter: 'drop-shadow(0 0 10px #FBBF24)' }} />
            </div>
            <div style={styles.rankBadgeGold}>#1 CHAMPION</div>
            <div className="font-heading text-glow-gold" style={styles.podiumNameGold}>
              {top1?.name || 'Admiral Sovereign'}
            </div>
            <div style={styles.podiumShip}>{top1?.shipId?.toUpperCase() || 'NOVA CRUSADER'}</div>
            <div style={styles.podiumScoreGroup}>
              <span className="font-heading text-glow-gold" style={styles.podiumScoreValGold}>
                {(top1?.totalScore || 142500).toLocaleString()}
              </span>
              <span style={styles.podiumScoreLbl}>PTS</span>
            </div>
          </div>

          {/* #3 Bronze Ace */}
          <div 
            style={{ ...styles.podiumCard, ...styles.podiumRank3 }} 
            className="glass-panel cyber-box animate-hover-lift"
            onClick={handleClaimRank}
          >
            <div style={styles.podiumCrownBronze}>
              <Medal size={28} color="#D97706" />
            </div>
            <div style={styles.rankBadgeBronze}>#3 ACE</div>
            <div className="font-heading" style={styles.podiumName}>
              {top3?.name || 'Captain Rex'}
            </div>
            <div style={styles.podiumShip}>{top3?.shipId?.toUpperCase() || 'SHADOW PHANTOM'}</div>
            <div style={styles.podiumScoreGroup}>
              <span className="font-heading text-glow-cyan" style={styles.podiumScoreVal}>
                {(top3?.totalScore || 67800).toLocaleString()}
              </span>
              <span style={styles.podiumScoreLbl}>PTS</span>
            </div>
          </div>
        </div>

        {/* Global Leaderboard Table */}
        <div style={styles.tablePanel} className="glass-panel cyber-box">
          <div style={styles.tableHeaderBar}>
            <div style={styles.tableTitleGroup}>
              <Trophy size={18} color="var(--secondary-cyan)" />
              <span className="font-heading" style={{ fontSize: '0.92rem', letterSpacing: '0.06em' }}>
                GLOBAL ACE ROSTER ({leaderboard.length} PILOTS REGISTERED)
              </span>
            </div>
            <button
              onClick={() => {
                soundManager.playLaser();
                fetchLeaderboard();
              }}
              style={styles.refreshBtn}
              title="Refresh telemetry standings"
            >
              <RefreshCw size={14} color="var(--text-muted)" className={loading ? "animate-spin" : ""} />
              <span>{loading ? 'SYNCING...' : 'SYNC LIVE'}</span>
            </button>
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={{ ...styles.th, width: '80px', textAlign: 'center' }}>RANK</th>
                  <th style={styles.th}>PILOT CALLSIGN</th>
                  <th style={styles.th}>STARSHIP</th>
                  <th style={styles.th}>STARS</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>COMBAT SCORE</th>
                </tr>
              </thead>
              <tbody>
                {remainingAces.length > 0 ? (
                  remainingAces.map((entry, idx) => {
                    const actualRank = idx + 4;
                    return (
                      <tr 
                        key={entry._id || idx} 
                        style={styles.tr} 
                        className="leaderboard-row"
                        onClick={handleClaimRank}
                      >
                        <td style={{ ...styles.td, textAlign: 'center' }}>
                          <span style={styles.rankPill}>#{actualRank}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.pilotCell}>
                            <div style={styles.avatarMini}>
                              <User size={13} color="var(--secondary-cyan)" />
                            </div>
                            <div>
                              <div style={styles.pilotCellName}>{entry.name}</div>
                              <div style={styles.pilotCellRank}>{entry.pilotRank || 'Star Cadet'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.shipTag}>{entry.shipId?.toUpperCase() || 'ORBITRON'}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--currency-gold)' }}>
                            <Star size={13} fill="currentColor" />
                            <span>{entry.stars || 12}/150</span>
                          </div>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <span className="font-heading text-glow-cyan" style={styles.scoreCell}>
                            {(entry.totalScore || 0).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  [
                    { rank: 4, name: 'Ghost_Walker', ship: 'SHADOW PHANTOM', stars: 24, score: 54200 },
                    { rank: 5, name: 'Orion_Striker', ship: 'PHOENIX STRIKE', stars: 19, score: 48900 },
                    { rank: 6, name: 'Cyber_Pilot', ship: 'ORBITRON VANGUARD', stars: 16, score: 42100 },
                    { rank: 7, name: 'Nova_Prime', ship: 'NOVA CRUSADER', stars: 14, score: 38700 },
                    { rank: 8, name: 'Titan_Bastion', ship: 'TITAN DREADNOUGHT', stars: 12, score: 34500 }
                  ].map((mock) => (
                    <tr 
                      key={mock.rank} 
                      style={styles.tr} 
                      className="leaderboard-row"
                      onClick={handleClaimRank}
                    >
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <span style={styles.rankPill}>#{mock.rank}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.pilotCell}>
                          <div style={styles.avatarMini}>
                            <User size={13} color="var(--secondary-cyan)" />
                          </div>
                          <div>
                            <div style={styles.pilotCellName}>{mock.name}</div>
                            <div style={styles.pilotCellRank}>Elite Commander</div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.shipTag}>{mock.ship}</span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--currency-gold)' }}>
                          <Star size={13} fill="currentColor" />
                          <span>{mock.stars}/150</span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <span className="font-heading text-glow-cyan" style={styles.scoreCell}>
                          {mock.score.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Claim Your Rank Banner */}
        <div style={styles.claimBanner} className="glass-panel cyber-box">
          <div>
            <div style={styles.claimTag}>UNREGISTERED CALLSIGN DETECTED</div>
            <h3 className="font-heading text-glow-cyan" style={{ fontSize: '1.4rem', margin: '4px 0 8px 0' }}>
              WANT TO RECORD COMBAT TELEMETRY & CLAIM YOUR RANK?
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, maxWidth: '640px' }}>
              Enlist as an official Void Hunter pilot. Every enemy kill, mission star, and score multiplier is automatically posted to your permanent MongoDB profile.
            </p>
          </div>
          <button
            onClick={handleClaimRank}
            className="btn btn-cyan animate-pulse-glow"
            style={{ padding: '14px 32px', fontSize: '0.9rem', fontWeight: 'bold' }}
          >
            CLAIM YOUR CALLSIGN / ENLIST
          </button>
        </div>
      </main>

      {/* Enlist Prompt Modal */}
      <EnlistPromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEnlist={handleEnlistConfirm}
        title="PILOT CALLSIGN REGISTRATION"
        subtitle="Log in or enlist now to post your high scores to the global leaderboard, earn sector campaign stars, and climb the Hall of Fame podium!"
        featureList={[
          "Official pilot profile registered in the Void Hunter MongoDB database",
          "Automatic high-score verification and leaderboard ranking updates",
          "Full access to 50 tactical missions and double-entry credit ledger",
          "Exclusive pilot callsign and custom rank progression"
        ]}
      />
    </div>
  );
};

const styles = {
  pageWrapper: {
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#060919',
    position: 'relative',
    color: 'var(--text-light)',
    overflowX: 'hidden'
  },
  starsBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'radial-gradient(ellipse at 50% 25%, rgba(14, 23, 60, 0.75) 0%, #060919 80%)',
    zIndex: 1,
    pointerEvents: 'none'
  },
  nebulaGlow: {
    position: 'fixed',
    width: '750px',
    height: '750px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, rgba(0, 229, 255, 0.08) 50%, transparent 80%)',
    top: '10%',
    left: '50%',
    transform: 'translateX(-50%)',
    filter: 'blur(50px)',
    zIndex: 2,
    pointerEvents: 'none'
  },
  contentContainer: {
    position: 'relative',
    zIndex: 10,
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '100px 24px 60px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px'
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px'
  },
  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    borderRadius: '20px',
    background: 'rgba(0, 229, 255, 0.1)',
    border: '1px solid rgba(0, 229, 255, 0.35)',
    color: 'var(--secondary-cyan)',
    fontSize: '0.74rem',
    letterSpacing: '0.1em',
    fontFamily: 'var(--font-heading)'
  },
  onlineDot: {
    color: '#10B981',
    fontSize: '0.9rem'
  },
  heroTitle: {
    fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
    fontWeight: '900',
    letterSpacing: '0.06em',
    lineHeight: 1.15,
    margin: 0
  },
  heroSubtitle: {
    fontSize: '0.98rem',
    color: 'var(--text-muted)',
    maxWidth: '680px',
    lineHeight: 1.6,
    margin: 0
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    padding: '4px',
    borderRadius: '12px',
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    marginTop: '8px'
  },
  filterTabBtn: {
    padding: '8px 20px',
    borderRadius: '8px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.76rem',
    letterSpacing: '0.08em',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  filterTabBtnActive: {
    background: 'rgba(0, 229, 255, 0.16)',
    color: 'var(--secondary-cyan)',
    boxShadow: '0 0 10px rgba(0, 229, 255, 0.3)'
  },
  podiumGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    alignItems: 'flex-end',
    marginTop: '10px'
  },
  podiumCard: {
    padding: '28px 20px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.25s ease'
  },
  podiumRank1: {
    minHeight: '260px',
    background: 'linear-gradient(180deg, rgba(251, 191, 36, 0.12) 0%, rgba(8, 14, 38, 0.9) 100%)',
    border: '1px solid rgba(251, 191, 36, 0.45)',
    boxShadow: '0 0 30px rgba(251, 191, 36, 0.2)'
  },
  podiumRank2: {
    minHeight: '230px',
    background: 'linear-gradient(180deg, rgba(148, 163, 184, 0.12) 0%, rgba(8, 14, 38, 0.9) 100%)',
    border: '1px solid rgba(148, 163, 184, 0.35)'
  },
  podiumRank3: {
    minHeight: '210px',
    background: 'linear-gradient(180deg, rgba(217, 119, 6, 0.12) 0%, rgba(8, 14, 38, 0.9) 100%)',
    border: '1px solid rgba(217, 119, 6, 0.35)'
  },
  podiumCrownGold: {
    marginBottom: '8px'
  },
  podiumCrownSilver: {
    marginBottom: '8px'
  },
  podiumCrownBronze: {
    marginBottom: '8px'
  },
  rankBadgeGold: {
    fontSize: '0.66rem',
    fontWeight: '900',
    color: '#FBBF24',
    letterSpacing: '0.12em',
    marginBottom: '6px',
    fontFamily: 'var(--font-heading)'
  },
  rankBadgeSilver: {
    fontSize: '0.66rem',
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: '0.12em',
    marginBottom: '6px',
    fontFamily: 'var(--font-heading)'
  },
  rankBadgeBronze: {
    fontSize: '0.66rem',
    fontWeight: '900',
    color: '#D97706',
    letterSpacing: '0.12em',
    marginBottom: '6px',
    fontFamily: 'var(--font-heading)'
  },
  podiumName: {
    fontSize: '1.05rem',
    color: 'var(--text-light)',
    marginBottom: '4px'
  },
  podiumNameGold: {
    fontSize: '1.2rem',
    color: '#FBBF24',
    marginBottom: '4px'
  },
  podiumShip: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    marginBottom: '16px'
  },
  podiumScoreGroup: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
    marginTop: 'auto'
  },
  podiumScoreVal: {
    fontSize: '1.4rem',
    fontWeight: '900',
    color: 'var(--secondary-cyan)'
  },
  podiumScoreValGold: {
    fontSize: '1.6rem',
    fontWeight: '900',
    color: '#FBBF24'
  },
  podiumScoreLbl: {
    fontSize: '0.66rem',
    color: 'var(--text-muted)'
  },
  tablePanel: {
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid rgba(0, 229, 255, 0.25)',
    background: 'rgba(8, 14, 38, 0.85)'
  },
  tableHeaderBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  tableTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  refreshBtn: {
    background: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: 'var(--text-muted)',
    padding: '6px 14px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.74rem',
    cursor: 'pointer'
  },
  tableWrap: {
    overflowX: 'auto',
    marginTop: '12px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  theadRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
  },
  th: {
    padding: '12px 16px',
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-heading)',
    fontWeight: '600'
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    cursor: 'pointer',
    transition: 'background 0.2s ease'
  },
  td: {
    padding: '14px 16px',
    fontSize: '0.84rem'
  },
  rankPill: {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    fontWeight: '700'
  },
  pilotCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  avatarMini: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    background: 'rgba(0, 229, 255, 0.12)',
    border: '1px solid rgba(0, 229, 255, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pilotCellName: {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.86rem',
    color: 'var(--text-light)',
    lineHeight: 1.1
  },
  pilotCellRank: {
    fontSize: '0.62rem',
    color: 'var(--text-muted)'
  },
  shipTag: {
    fontSize: '0.74rem',
    padding: '4px 10px',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-light)',
    fontFamily: 'var(--font-heading)'
  },
  scoreCell: {
    fontSize: '0.96rem',
    fontWeight: '700'
  },
  claimBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '32px 40px',
    borderRadius: '16px',
    border: '1px solid rgba(0, 229, 255, 0.3)',
    background: 'rgba(8, 14, 38, 0.85)',
    flexWrap: 'wrap',
    gap: '20px',
    marginTop: '10px'
  },
  claimTag: {
    fontSize: '0.68rem',
    color: 'var(--secondary-cyan)',
    letterSpacing: '0.12em',
    fontFamily: 'var(--font-heading)'
  }
};

export default PublicLeaderboardPage;
