import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import { 
  ArrowLeft, Trophy, Star, Award, Shield, User, 
  Crown, Medal, RefreshCw, Crosshair, ChevronRight 
} from 'lucide-react';

export const LeaderboardPage = ({ onBack, onNavigate }) => {
  const { user, profile, isAuthenticated } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [timeFrame, setTimeFrame] = useState('ALL_TIME');
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/leaderboard?timeFrame=${timeFrame}`);
      if (res.data?.success) {
        setLeaderboard(res.data.leaderboard);
        setUserRank(res.data.userRank);
      }
    } catch (err) {
      console.warn('Leaderboard API error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFrame]);

  // Top 3 Podium Aces
  const top1 = leaderboard[0];
  const top2 = leaderboard[1];
  const top3 = leaderboard[2];

  return (
    <div className="page-responsive-container">
      {/* ================= HEADER BAR ================= */}
      <header style={styles.header} className="glass-panel cyber-box">
        <div style={styles.headerLeft}>
          <button onClick={onBack} style={styles.backBtn} className="btn-secondary">
            <ArrowLeft size={18} />
            <span>COMMAND DECK</span>
          </button>
          <div>
            <h1 className="font-heading text-glow-cyan" style={styles.pageTitle}>GLOBAL LEADERBOARD</h1>
            <p style={styles.subTitle}>INTERGALACTIC COMBAT ACES & SECTOR DEFENDERS</p>
          </div>
        </div>

        <div style={styles.headerRight}>
          <button 
            onClick={() => {
              soundManager.playLaser();
              fetchLeaderboard();
            }} 
            style={styles.refreshBtn} 
            className="btn-secondary"
            title="Refresh Rankings"
          >
            <RefreshCw size={16} />
            <span>SYNC RANKS</span>
          </button>
        </div>
      </header>

      {/* ================= PINNED USER RANK BANNER ================= */}
      {userRank ? (
        <div style={styles.userRankBanner} className="glass-panel cyber-box animate-pulse-glow">
          <div style={styles.userRankLeft}>
            <div style={styles.userRankNumberBadge} className="text-glow-cyan">
              #{userRank.rank}
            </div>
            <div>
              <div style={styles.userRankName} className="text-glow-cyan">
                {userRank.name?.toUpperCase()} // {userRank.pilotRank}
              </div>
              <div style={styles.userRankSub}>
                YOUR ACTIVE COMBAT STANDING
              </div>
            </div>
          </div>

          <div style={styles.userRankMetrics}>
            <div style={styles.userMetricItem}>
              <span style={styles.userMetricLabel}>TOTAL SCORE</span>
              <span className="font-heading text-glow-cyan" style={styles.userMetricValCyan}>
                {userRank.totalScore?.toLocaleString()}
              </span>
            </div>
            <div style={styles.userMetricItem}>
              <span style={styles.userMetricLabel}>CAMPAIGN STARS</span>
              <span style={styles.userMetricValGold} className="text-glow-gold">
                <Star size={14} color="var(--currency-gold)" fill="var(--currency-gold)" style={{ filter: 'drop-shadow(0 0 3px #FBBF24)' }} />
                {userRank.stars} / 150
              </span>
            </div>
            <div style={styles.userMetricItem}>
              <span style={styles.userMetricLabel}>FIGHTER</span>
              <span style={styles.userMetricValShip}>
                {userRank.shipId?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.userRankBanner} className="glass-panel cyber-box">
          <div style={styles.userRankLeft}>
            <div style={{ ...styles.userRankNumberBadge, color: 'var(--text-muted)', borderColor: 'rgba(255,255,255,0.2)' }}>
              --
            </div>
            <div>
              <div style={styles.userRankName} className="text-glow-cyan">
                GUEST PILOT // UNENLISTED
              </div>
              <div style={styles.userRankSub}>
                Log in or enlist to record combat scores and claim your leaderboard rank!
              </div>
            </div>
          </div>
          <button 
            onClick={() => onNavigate && onNavigate('auth')} 
            className="btn btn-cyan animate-pulse-glow"
            style={{ padding: '8px 24px', fontSize: '0.82rem', fontWeight: 'bold' }}
          >
            LOGIN / ENLIST
          </button>
        </div>
      )}

      {/* ================= TIMEFRAME FILTERS ================= */}
      <div style={styles.filtersRow}>
        <div style={styles.filtersGroup}>
          {[
            { id: 'ALL_TIME', label: 'GLOBAL' },
            { id: 'WEEKLY', label: 'FRIENDS' },
            { id: 'DAILY', label: 'DAILY' }
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => {
                soundManager.playPickup('core');
                setTimeFrame(tf.id);
              }}
              style={{
                ...styles.filterBtn,
                background: timeFrame === tf.id ? 'var(--secondary-cyan)' : 'rgba(255, 255, 255, 0.05)',
                color: timeFrame === tf.id ? '#060919' : 'var(--text-light)',
                fontWeight: timeFrame === tf.id ? 'bold' : 'normal',
                boxShadow: timeFrame === tf.id ? '0 0 12px rgba(0, 229, 255, 0.4)' : 'none'
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= TOP 3 PODIUM ================= */}
      {!loading && leaderboard.length >= 3 && (
        <div className="leaderboard-podium-grid">
          {/* Rank 2 (Silver) */}
          <div style={{ ...styles.podiumCard, order: 1 }} className="glass-card cyber-box">
            <div style={styles.podiumRankSilver}>
              <Medal size={24} color="#94A3B8" />
              <span>#2</span>
            </div>
            <div className="font-heading" style={styles.podiumName}>{top2.name}</div>
            <div style={styles.podiumScore}>{top2.totalScore?.toLocaleString()} PTS</div>
            <div style={styles.podiumSub}>LV. {top2.level} {top2.pilotRank}</div>
          </div>

          {/* Rank 1 (Gold - Elevated) */}
          <div style={{ ...styles.podiumCardGold, order: 2 }} className="glass-panel cyber-box animate-pulse-glow">
            <Crown size={32} color="var(--currency-gold)" style={{ filter: 'drop-shadow(0 0 6px #FBBF24)' }} />
            <div style={styles.podiumRankGold} className="text-glow-gold">#1 CHAMPION</div>
            <div className="font-heading text-glow-gold" style={styles.podiumNameGold}>{top1.name}</div>
            <div style={styles.podiumScoreGold}>{top1.totalScore?.toLocaleString()} PTS</div>
            <div style={styles.podiumSubGold}>LV. {top1.level} {top1.pilotRank} • {top1.stars} ⭐</div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div style={{ ...styles.podiumCard, order: 3 }} className="glass-card cyber-box">
            <div style={styles.podiumRankBronze}>
              <Medal size={24} color="#F59E0B" />
              <span>#3</span>
            </div>
            <div className="font-heading" style={styles.podiumName}>{top3.name}</div>
            <div style={styles.podiumScore}>{top3.totalScore?.toLocaleString()} PTS</div>
            <div style={styles.podiumSub}>LV. {top3.level} {top3.pilotRank}</div>
          </div>
        </div>
      )}

      {/* ================= FULL LEADERBOARD TABLE ================= */}
      <div style={styles.tableCard} className="glass-card">
        {loading ? (
          <div style={styles.loadingBox}>
            <div className="spinner" />
            <p className="font-heading" style={{ marginTop: '16px', color: 'var(--secondary-cyan)' }}>
              COMPILING GLOBAL FLIGHT TELEMETRY...
            </p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={styles.emptyBox}>
            <Trophy size={40} color="var(--text-muted)" />
            <h3 className="font-heading" style={{ marginTop: '12px' }}>NO PILOT RECORDS REGISTERED</h3>
          </div>
        ) : (
          <div className="responsive-table-scroll">
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>RANK</th>
                  <th style={styles.th}>PILOT CALLSIGN</th>
                  <th style={styles.th}>RANK LEVEL</th>
                  <th style={styles.th}>TOTAL SCORE</th>
                  <th style={styles.th}>CAMPAIGN STARS</th>
                  <th style={styles.th}>MISSIONS</th>
                  <th style={styles.th}>DEPLOYED SHIP</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((pilot) => {
                  const isTop3 = pilot.rank <= 3;
                  const isCurrentUser = userRank && pilot.userId === user?.id;

                  return (
                    <tr 
                      key={pilot.rank} 
                      style={{
                        ...styles.tableRow,
                        background: isCurrentUser ? 'rgba(0, 229, 255, 0.12)' : 'transparent'
                      }}
                    >
                      {/* Rank */}
                      <td style={styles.tdRank}>
                        <span style={{
                          ...styles.rankBadge,
                          color: pilot.rank === 1 ? 'var(--currency-gold)' : pilot.rank === 2 ? '#94A3B8' : pilot.rank === 3 ? '#F59E0B' : 'var(--text-muted)'
                        }}>
                          {pilot.rank === 1 ? '👑 #1' : `#${pilot.rank}`}
                        </span>
                      </td>

                      {/* Pilot Name */}
                      <td style={styles.tdName}>
                        <div style={styles.pilotNameGroup}>
                          <span className="font-heading" style={{
                            color: isCurrentUser ? 'var(--secondary-cyan)' : 'var(--text-light)',
                            fontWeight: isTop3 ? 'bold' : 'normal'
                          }}>
                            {pilot.name}
                          </span>
                          {isCurrentUser && <span style={styles.youBadge}>YOU</span>}
                        </div>
                      </td>

                      {/* Level */}
                      <td style={styles.td}>
                        <span style={styles.levelText}>LV. {pilot.level}</span>
                        <span style={styles.rankText}>{pilot.pilotRank}</span>
                      </td>

                      {/* Total Score */}
                      <td style={styles.tdScore}>
                        <span className="font-heading" style={{
                          color: isTop3 ? 'var(--secondary-cyan)' : 'var(--text-light)',
                          fontSize: '1rem'
                        }}>
                          {pilot.totalScore?.toLocaleString()}
                        </span>
                      </td>

                      {/* Stars */}
                      <td style={styles.td}>
                        <div style={styles.starsGroup}>
                          <Star size={13} color="var(--currency-gold)" fill="var(--currency-gold)" />
                          <span>{pilot.stars} / 150</span>
                        </div>
                      </td>

                      {/* Missions Completed */}
                      <td style={styles.td}>
                        <span style={styles.missionsVal}>{pilot.missionsCompleted}</span>
                      </td>

                      {/* Deployed Ship */}
                      <td style={styles.td}>
                        <span style={styles.shipTag}>{pilot.shipId?.toUpperCase()}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% 10%, #0F1738 0%, #060919 75%)',
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
  headerRight: {},
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    fontSize: '0.8rem',
    borderRadius: '10px'
  },
  userRankBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderRadius: '14px',
    border: '1px solid var(--secondary-cyan)',
    background: 'linear-gradient(90deg, rgba(0, 229, 255, 0.15) 0%, rgba(10, 15, 44, 0.85) 100%)',
    flexWrap: 'wrap',
    gap: '16px'
  },
  userRankLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  userRankNumberBadge: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.6rem',
    color: 'var(--secondary-cyan)',
    padding: '6px 14px',
    borderRadius: '10px',
    background: 'rgba(0, 229, 255, 0.15)',
    border: '1px solid var(--secondary-cyan)'
  },
  userRankName: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.05rem',
    color: 'var(--text-light)',
    letterSpacing: '0.06em'
  },
  userRankSub: {
    fontSize: '0.65rem',
    color: 'var(--secondary-cyan)',
    letterSpacing: '0.08em',
    marginTop: '2px'
  },
  userRankMetrics: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap'
  },
  userMetricItem: {
    textAlign: 'right'
  },
  userMetricLabel: {
    display: 'block',
    fontSize: '0.62rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-heading)'
  },
  userMetricValCyan: {
    fontSize: '1.15rem',
    color: 'var(--secondary-cyan)'
  },
  userMetricValGold: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '1rem',
    color: 'var(--currency-gold)',
    fontFamily: 'var(--font-heading)'
  },
  userMetricValShip: {
    fontSize: '0.85rem',
    color: 'var(--electric-magenta)',
    fontFamily: 'var(--font-heading)'
  },
  filtersRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  filtersGroup: {
    display: 'flex',
    gap: '8px'
  },
  filterBtn: {
    padding: '8px 16px',
    borderRadius: '10px',
    border: '1px solid var(--border-glass)',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-heading)',
    cursor: 'pointer',
    letterSpacing: '0.06em',
    transition: 'all 0.2s ease'
  },
  podiumContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    alignItems: 'flex-end',
    margin: '10px 0'
  },
  podiumCard: {
    padding: '24px 20px',
    borderRadius: '16px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px'
  },
  podiumCardGold: {
    padding: '32px 20px',
    borderRadius: '16px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid var(--currency-gold)',
    background: 'radial-gradient(circle at top, rgba(251, 191, 36, 0.15) 0%, rgba(10, 15, 44, 0.9) 80%)'
  },
  podiumRankSilver: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-heading)',
    color: '#94A3B8',
    fontSize: '1.1rem'
  },
  podiumRankGold: {
    fontFamily: 'var(--font-heading)',
    color: 'var(--currency-gold)',
    fontSize: '0.85rem',
    letterSpacing: '0.1em'
  },
  podiumRankBronze: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-heading)',
    color: '#F59E0B',
    fontSize: '1.1rem'
  },
  podiumName: {
    fontSize: '1.1rem',
    color: 'var(--text-light)'
  },
  podiumNameGold: {
    fontSize: '1.4rem',
    color: 'var(--text-light)'
  },
  podiumScore: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.15rem',
    color: 'var(--secondary-cyan)'
  },
  podiumScoreGold: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.35rem',
    color: 'var(--currency-gold)'
  },
  podiumSub: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)'
  },
  podiumSubGold: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)'
  },
  tableCard: {
    padding: '0',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '1px solid var(--border-glass)'
  },
  tableResponsive: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  tableHeaderRow: {
    background: 'rgba(10, 15, 40, 0.8)',
    borderBottom: '1px solid var(--border-glass)'
  },
  th: {
    padding: '14px 18px',
    fontSize: '0.68rem',
    color: 'var(--secondary-cyan)',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '0.08em'
  },
  tableRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    transition: 'background 0.15s ease'
  },
  td: {
    padding: '14px 18px',
    fontSize: '0.84rem'
  },
  tdRank: {
    padding: '14px 18px'
  },
  rankBadge: {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.92rem',
    fontWeight: 'bold'
  },
  tdName: {
    padding: '14px 18px'
  },
  pilotNameGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  youBadge: {
    fontSize: '0.62rem',
    padding: '2px 6px',
    borderRadius: '4px',
    background: 'var(--secondary-cyan)',
    color: '#060919',
    fontWeight: 'bold',
    fontFamily: 'var(--font-heading)'
  },
  tdScore: {
    padding: '14px 18px'
  },
  levelText: {
    display: 'block',
    fontSize: '0.8rem',
    fontFamily: 'var(--font-heading)',
    color: 'var(--text-light)'
  },
  rankText: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)'
  },
  starsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.78rem',
    fontFamily: 'var(--font-heading)',
    color: 'var(--currency-gold)'
  },
  missionsVal: {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.85rem'
  },
  shipTag: {
    fontSize: '0.7rem',
    padding: '2px 8px',
    borderRadius: '6px',
    background: 'rgba(255, 45, 255, 0.12)',
    border: '1px solid rgba(255, 45, 255, 0.3)',
    color: 'var(--electric-magenta)',
    fontFamily: 'var(--font-heading)'
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0'
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0'
  }
};

export default LeaderboardPage;
