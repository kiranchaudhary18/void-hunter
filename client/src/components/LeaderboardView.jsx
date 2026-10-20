import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import '../pages/Leaderboard.css';
import { 
  Trophy, Star, Crown, Medal, User, RefreshCw, 
  Search, Shield, ArrowRight, Zap, ArrowLeft, CheckCircle2,
  X, Crosshair, Sparkles, Flame, Target
} from 'lucide-react';

// Ship Roster metadata with human-readable classes and codes
const SHIP_METADATA = {
  'v01-orbitron': { code: 'V-01', name: 'Orbitron Vanguard', shipClass: 'Interceptor' },
  's02-phoenix': { code: 'S-02', name: 'Phoenix Striker', shipClass: 'Striker' },
  'x03-shadow': { code: 'X-03', name: 'Shadow Phantom', shipClass: 'Support' },
  'r04-titan': { code: 'R-04', name: 'Titan Dreadnought', shipClass: 'Guardian' },
  'z05-nova': { code: 'Z-05', name: 'Nova Crusader', shipClass: 'Experimental' }
};

export const LeaderboardView = ({ isPublic = false, onNavigate, onBack }) => {
  const { user, isAuthenticated } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [timeFrame, setTimeFrame] = useState('ALL_TIME');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncSuccessToast, setSyncSuccessToast] = useState(false);

  // Fetch verified leaderboard rankings from server
  const fetchLeaderboard = useCallback(async (period = timeFrame, isManualSync = false) => {
    if (isManualSync) {
      setSyncing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await api.get(`/leaderboard?timeFrame=${period}`);
      const payload = res.data || res;
      if (payload.success && Array.isArray(payload.leaderboard)) {
        setLeaderboard(payload.leaderboard);
        if (payload.userRank) {
          setUserRank(payload.userRank);
        }
        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(formattedTime);

        if (isManualSync) {
          setSyncSuccessToast(true);
          setTimeout(() => setSyncSuccessToast(false), 2400);
        }
      }
    } catch (err) {
      console.warn('Leaderboard API fetch error:', err.message);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [timeFrame]);

  useEffect(() => {
    fetchLeaderboard(timeFrame, false);
  }, [fetchLeaderboard, timeFrame]);

  // Sound & Filter handler
  const handleFilterChange = (newPeriod) => {
    if (timeFrame === newPeriod) return;
    try { soundManager.playLaser(); } catch {}
    setTimeFrame(newPeriod);
  };

  const handleManualSync = () => {
    try { soundManager.playLaser(); } catch {}
    fetchLeaderboard(timeFrame, true);
  };

  const handleAuthNavigation = (targetTab = 'register') => {
    try { soundManager.playLaser(); } catch {}
    if (onNavigate) {
      onNavigate('auth');
    }
  };

  // Helper to format ship display
  const getShipInfo = (shipId, fallbackName) => {
    const meta = SHIP_METADATA[shipId];
    if (meta) return meta;
    return { code: 'S-01', name: fallbackName || 'Orbitron Vanguard', shipClass: 'Interceptor' };
  };

  // Top 3 Podium Ranks
  const top1 = leaderboard[0] || null;
  const top2 = leaderboard[1] || null;
  const top3 = leaderboard[2] || null;

  // Filter remaining rows (Rank 4+) by search query
  const remainingRows = useMemo(() => {
    const list = leaderboard.slice(3);
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.callsign && p.callsign.toLowerCase().includes(q)) ||
        (p.shipName && p.shipName.toLowerCase().includes(q)) ||
        (p.pilotRank && p.pilotRank.toLowerCase().includes(q))
    );
  }, [leaderboard, searchQuery]);

  // Next competitor above authenticated player (Requirement 8)
  const nextCompetitorInfo = useMemo(() => {
    if (!userRank || !leaderboard.length) return null;
    const currentRank = userRank.rank;
    if (currentRank <= 1) {
      return { isChampion: true };
    }
    const competitor = leaderboard.find((p) => p.rank === currentRank - 1);
    if (!competitor) return null;
    const gap = Math.max(1, (competitor.totalScore - userRank.totalScore) + 1);
    return {
      isChampion: false,
      competitor,
      gap
    };
  }, [userRank, leaderboard]);

  return (
    <div className="leaderboard-root">
      {/* Background Ambience */}
      <div className="leaderboard-backdrop" aria-hidden="true" />
      <div className="leaderboard-stars" aria-hidden="true" />
      <div className="leaderboard-nebula-glow" aria-hidden="true" />

      <main className="leaderboard-content">
        {/* Authenticated Command Deck Back Bar */}
        {!isPublic && onBack && (
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => {
                try { soundManager.playLaser(); } catch {}
                onBack();
              }}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-heading, Orbitron)',
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(0, 229, 255, 0.3)',
                background: 'rgba(16, 26, 58, 0.7)',
                color: '#EAF1FF',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={16} color="#00E5FF" />
              <span>COMMAND DECK</span>
            </button>
          </div>
        )}

        {/* ================= 1. CURRENT PLAYER COMBAT RECORD PANEL ================= */}
        {!isPublic && userRank && (
          <section className="leaderboard-user-pin-banner" role="region" aria-label="Personal Combat Standing">
            <div className="leaderboard-user-pin-left">
              <div className="leaderboard-user-pin-rank">
                #{userRank.rank}
              </div>
              <div>
                <div className="leaderboard-user-pin-name">
                  <span>{userRank.callsign || userRank.name?.toUpperCase()}</span>
                  <span style={{ color: '#00E5FF', opacity: 0.6 }}>//</span>
                  <span style={{ color: '#00E5FF' }}>{userRank.pilotRank}</span>
                </div>
                <div className="leaderboard-user-pin-sub">
                  <Shield size={13} color="#00E5FF" />
                  <span>ACTIVE COMBAT PROFILE · {getShipInfo(userRank.shipId, userRank.shipName).name} ({getShipInfo(userRank.shipId, userRank.shipName).shipClass})</span>
                </div>
              </div>
            </div>

            <div className="leaderboard-user-pin-metrics">
              <div className="leaderboard-user-pin-metric">
                <span className="leaderboard-user-pin-metric-lbl">TOTAL COMBAT SCORE</span>
                <span className="leaderboard-user-pin-metric-val">
                  {(userRank.totalScore || 0).toLocaleString()} PTS
                </span>
              </div>
              <div className="leaderboard-user-pin-metric">
                <span className="leaderboard-user-pin-metric-lbl">CAMPAIGN STARS</span>
                <span className="leaderboard-user-pin-metric-val" style={{ color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Star size={14} fill="#FBBF24" color="#FBBF24" />
                  <span>{userRank.stars || 0} / 150</span>
                </span>
              </div>
            </div>

            {/* Competitive Next Objective Bar (Requirement 8) */}
            {nextCompetitorInfo && (
              <div className="leaderboard-next-objective-strip">
                {nextCompetitorInfo.isChampion ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FBBF24' }}>
                    <Crown size={15} color="#FBBF24" />
                    <strong>SUPREME FLEET CHAMPION // DEFEND YOUR #1 THRONE IN ACTIVE SORTIES</strong>
                  </div>
                ) : nextCompetitorInfo.competitor ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        ADVANCEMENT OBJECTIVE:
                      </span>
                      <span className="objective-target-pill">
                        <Target size={13} />
                        RANK #{nextCompetitorInfo.competitor.rank} · {nextCompetitorInfo.competitor.callsign}
                      </span>
                      <span style={{ color: '#00E5FF', fontWeight: '700' }}>
                        +{nextCompetitorInfo.gap.toLocaleString()} PTS TO OVERTAKE
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        try { soundManager.playLaser(); } catch {}
                        if (onNavigate) onNavigate('missions');
                      }}
                      className="objective-launch-btn"
                    >
                      <Zap size={13} />
                      <span>DEPLOY SORTIE</span>
                      <ArrowRight size={13} />
                    </button>
                  </>
                ) : null}
              </div>
            )}
          </section>
        )}

        {/* ================= 2. CINEMATIC HALL OF FAME HEADER ================= */}
        <header className="leaderboard-header">
          <div className="leaderboard-status-badge" role="status">
            <span className="leaderboard-status-dot" aria-hidden="true" />
            <span>SERVER LEDGER ACTIVE · {leaderboard.length} PILOTS RANKED</span>
          </div>

          <div className="leaderboard-eyebrow">GLOBAL COMBAT RANKINGS</div>
          <h1 className="leaderboard-title">
            INTERGALACTIC <span className="leaderboard-title-highlight">HALL OF FAME</span>
          </h1>
          <p className="leaderboard-description">
            The galaxy's elite pilots, ranked by verified combat performance.
          </p>
        </header>

        {/* ================= 3. TIME FILTERS & LIVE SYNC TOOLBAR ================= */}
        <div className="leaderboard-toolbar" role="toolbar" aria-label="Ranking period selection">
          <div className="leaderboard-filter-group" role="radiogroup" aria-label="Ranking period">
            <button
              type="button"
              role="radio"
              aria-checked={timeFrame === 'ALL_TIME'}
              className={`leaderboard-filter-btn ${timeFrame === 'ALL_TIME' ? 'active' : ''}`}
              onClick={() => handleFilterChange('ALL_TIME')}
            >
              ALL TIME
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={timeFrame === 'WEEKLY'}
              className={`leaderboard-filter-btn ${timeFrame === 'WEEKLY' ? 'active' : ''}`}
              onClick={() => handleFilterChange('WEEKLY')}
            >
              THIS WEEK
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={timeFrame === 'DAILY'}
              className={`leaderboard-filter-btn ${timeFrame === 'DAILY' ? 'active' : ''}`}
              onClick={() => handleFilterChange('DAILY')}
            >
              TODAY 24H
            </button>
          </div>

          <div className="leaderboard-actions">
            {lastSyncTime && (
              <span className="leaderboard-meta-tag">
                {syncSuccessToast ? (
                  <span style={{ color: '#20D6A0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} color="#20D6A0" /> SYNCED
                  </span>
                ) : (
                  <span>UPDATED {lastSyncTime}</span>
                )}
              </span>
            )}

            <button
              type="button"
              onClick={handleManualSync}
              disabled={syncing}
              className={`leaderboard-sync-btn ${syncing ? 'syncing' : ''}`}
              title="Synchronize rankings with authoritative server ledger"
              aria-label="Refresh leaderboard"
            >
              <RefreshCw size={14} className={`leaderboard-sync-icon ${syncing ? 'spin' : ''}`} />
              <span>{syncing ? 'SYNCING...' : 'SYNC LIVE'}</span>
            </button>
          </div>
        </div>

        {/* ================= 4. SPECTACULAR TOP THREE PODIUM ================= */}
        <section className="leaderboard-podium" aria-label="Top 3 Galactic Champions">
          {/* Rank #2: Silver Ace (Left) */}
          <div className="podium-pedestal-platform">
            {top2 ? (
              <article className="podium-card podium-card-silver" aria-label={`Rank 2: ${top2.callsign}`}>
                <div className="podium-icon-wrapper">
                  <Medal size={34} color="#E2E8F0" aria-hidden="true" />
                </div>
                <div className="podium-badge podium-badge-silver">#2 ACE</div>
                <div className="podium-callsign" title={top2.callsign}>
                  {top2.callsign}
                </div>
                <div className="podium-pilot-rank">
                  {top2.pilotRank || 'Elite Wing Commander'}
                </div>

                <div className="podium-ship-chip">
                  <span>{getShipInfo(top2.shipId, top2.shipName).name}</span>
                </div>

                <div className="podium-score-block">
                  <span className="podium-score-label">COMBAT SCORE</span>
                  <span className="podium-score-val silver">
                    {(top2.totalScore || 0).toLocaleString()}
                  </span>
                  <div className="podium-stars-row">
                    <Star size={13} fill="#FBBF24" color="#FBBF24" />
                    <span>{top2.stars || 0} Stars</span>
                  </div>
                </div>
              </article>
            ) : (
              <article className="podium-card podium-card-silver podium-vacant">
                <div className="podium-icon-wrapper">
                  <Medal size={28} color="#94A3B8" />
                </div>
                <div className="podium-badge podium-badge-silver">#2 ACE</div>
                <div className="podium-callsign" style={{ color: '#94A3B8' }}>VACANT SECTOR</div>
                <p className="podium-vacant-text">Awaiting combat telemetry</p>
                <div className="podium-score-block">
                  <span className="podium-score-label">MINIMUM SCORE</span>
                  <span className="podium-score-val silver" style={{ opacity: 0.4 }}>-</span>
                </div>
              </article>
            )}
            <div className="podium-pedestal-base silver" />
          </div>

          {/* Rank #1: Gold Champion (Center, Elevated & Visually Dominant) */}
          <div className="podium-pedestal-platform">
            {top1 ? (
              <article className="podium-card podium-card-gold" aria-label={`Rank 1 Champion: ${top1.callsign}`}>
                <div className="podium-icon-wrapper">
                  <Crown size={42} color="#FBBF24" style={{ filter: 'drop-shadow(0 0 14px rgba(251, 191, 36, 0.85))' }} aria-hidden="true" />
                </div>
                <div className="podium-badge podium-badge-gold">
                  <Trophy size={13} /> #1 CHAMPION
                </div>
                <div className="podium-callsign" title={top1.callsign}>
                  {top1.callsign}
                </div>
                <div className="podium-pilot-rank" style={{ color: '#FBBF24' }}>
                  {top1.pilotRank || 'Supreme Star Defender'}
                </div>

                <div className="podium-ship-chip" style={{ borderColor: 'rgba(251, 191, 36, 0.35)', color: '#FBBF24' }}>
                  <Zap size={11} color="#FBBF24" />
                  <span>{getShipInfo(top1.shipId, top1.shipName).name}</span>
                </div>

                <div className="podium-score-block" style={{ background: 'rgba(251, 191, 36, 0.08)', borderColor: 'rgba(251, 191, 36, 0.3)' }}>
                  <span className="podium-score-label" style={{ color: '#FBBF24' }}>CHAMPION SCORE</span>
                  <span className="podium-score-val gold">
                    {(top1.totalScore || 0).toLocaleString()}
                  </span>
                  <div className="podium-stars-row">
                    <Star size={14} fill="#FBBF24" color="#FBBF24" />
                    <span style={{ fontWeight: 800 }}>{top1.stars || 0} Campaign Stars</span>
                  </div>
                </div>
              </article>
            ) : (
              <article className="podium-card podium-card-gold podium-vacant">
                <div className="podium-icon-wrapper">
                  <Crown size={38} color="#94A3B8" />
                </div>
                <div className="podium-badge podium-badge-gold">#1 CHAMPION</div>
                <div className="podium-callsign" style={{ color: '#94A3B8' }}>UNCLAIMED CROWN</div>
                <p className="podium-vacant-text">Be the first pilot to claim #1 rank</p>
                <div className="podium-score-block">
                  <span className="podium-score-label">CHAMPION SCORE</span>
                  <span className="podium-score-val gold" style={{ opacity: 0.4 }}>-</span>
                </div>
              </article>
            )}
            <div className="podium-pedestal-base gold" />
          </div>

          {/* Rank #3: Bronze Ace (Right) */}
          <div className="podium-pedestal-platform">
            {top3 ? (
              <article className="podium-card podium-card-bronze" aria-label={`Rank 3: ${top3.callsign}`}>
                <div className="podium-icon-wrapper">
                  <Medal size={34} color="#F59E0B" aria-hidden="true" />
                </div>
                <div className="podium-badge podium-badge-bronze">#3 ACE</div>
                <div className="podium-callsign" title={top3.callsign}>
                  {top3.callsign}
                </div>
                <div className="podium-pilot-rank">
                  {top3.pilotRank || 'Veteran Squadron Lead'}
                </div>

                <div className="podium-ship-chip">
                  <span>{getShipInfo(top3.shipId, top3.shipName).name}</span>
                </div>

                <div className="podium-score-block">
                  <span className="podium-score-label">COMBAT SCORE</span>
                  <span className="podium-score-val bronze">
                    {(top3.totalScore || 0).toLocaleString()}
                  </span>
                  <div className="podium-stars-row">
                    <Star size={13} fill="#F59E0B" color="#F59E0B" />
                    <span>{top3.stars || 0} Stars</span>
                  </div>
                </div>
              </article>
            ) : (
              <article className="podium-card podium-card-bronze podium-vacant">
                <div className="podium-icon-wrapper">
                  <Medal size={28} color="#94A3B8" />
                </div>
                <div className="podium-badge podium-badge-bronze">#3 ACE</div>
                <div className="podium-callsign" style={{ color: '#94A3B8' }}>VACANT SECTOR</div>
                <p className="podium-vacant-text">Awaiting combat telemetry</p>
                <div className="podium-score-block">
                  <span className="podium-score-label">MINIMUM SCORE</span>
                  <span className="podium-score-val bronze" style={{ opacity: 0.4 }}>-</span>
                </div>
              </article>
            )}
            <div className="podium-pedestal-base bronze" />
          </div>
        </section>

        {/* ================= 5. GLOBAL COMBAT ROSTER TABLE PANEL ================= */}
        <section className="leaderboard-panel" aria-label="Global Pilot Combat Roster">
          <div className="leaderboard-panel-header">
            <h2 className="leaderboard-panel-title">
              <Trophy size={18} color="#00E5FF" aria-hidden="true" />
              <span>GLOBAL COMBAT ROSTER</span>
              <span className="leaderboard-panel-count">
                {leaderboard.length} PILOTS
              </span>
            </h2>

            {/* Tactical Scanner Search Bar */}
            <div className="leaderboard-search-wrapper">
              <Search 
                size={14} 
                color="#94A3B8" 
                style={{ position: 'absolute', left: '11px', pointerEvents: 'none' }} 
              />
              <input
                type="text"
                placeholder="Search pilot, callsign, or ship..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="leaderboard-search-input"
                aria-label="Filter pilots by name, callsign, or starship"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="leaderboard-search-clear"
                  title="Clear search query"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="leaderboard-table-wrapper">
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th scope="col" className="leaderboard-thead-th" style={{ width: '80px', textAlign: 'center' }}>RANK</th>
                  <th scope="col" className="leaderboard-thead-th">PILOT / CALLSIGN</th>
                  <th scope="col" className="leaderboard-thead-th">STARSHIP</th>
                  <th scope="col" className="leaderboard-thead-th">CAMPAIGN STARS</th>
                  <th scope="col" className="leaderboard-thead-th" style={{ textAlign: 'right' }}>COMBAT SCORE</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="leaderboard-td">
                      <div className="leaderboard-empty-state">
                        <RefreshCw size={26} color="#00E5FF" className="leaderboard-sync-icon spin" />
                        <p className="leaderboard-empty-title">FETCHING COMBAT TELEMETRY...</p>
                        <p className="leaderboard-empty-desc">Querying authoritative server ledger records...</p>
                      </div>
                    </td>
                  </tr>
                ) : remainingRows.length > 0 ? (
                  remainingRows.map((pilot, idx) => {
                    const actualRank = idx + 4;
                    const shipMeta = getShipInfo(pilot.shipId, pilot.shipName);
                    const isCurrentUser = user && pilot.userId && (user.id === pilot.userId || user._id === pilot.userId);

                    return (
                      <tr 
                        key={pilot.userId || actualRank}
                        className={`leaderboard-row ${isCurrentUser ? 'user-highlight' : ''}`}
                      >
                        {/* Rank */}
                        <td className="leaderboard-td" style={{ textAlign: 'center' }}>
                          <span className={`rank-pill ${actualRank <= 10 ? 'cyan' : ''}`}>
                            #{actualRank}
                          </span>
                        </td>

                        {/* Pilot / Callsign */}
                        <td className="leaderboard-td">
                          <div className="pilot-cell">
                            <div className="pilot-avatar" aria-hidden="true">
                              <User size={16} />
                            </div>
                            <div className="pilot-info">
                              <div className="pilot-name-row">
                                <span className="pilot-callsign">{pilot.callsign || pilot.name}</span>
                                {isCurrentUser && (
                                  <span className="pilot-you-badge">YOU</span>
                                )}
                              </div>
                              <span className="pilot-rank-sub">{pilot.pilotRank || 'Star Cadet'}</span>
                            </div>
                          </div>
                        </td>

                        {/* Starship */}
                        <td className="leaderboard-td">
                          <div className="ship-chip">
                            <span>{shipMeta.name}</span>
                            <span className="ship-class-tag">· {shipMeta.shipClass}</span>
                          </div>
                        </td>

                        {/* Campaign Stars */}
                        <td className="leaderboard-td">
                          <div className="stars-cell">
                            <Star size={13} fill="#FBBF24" color="#FBBF24" />
                            <span>{pilot.stars || 0} / 150</span>
                          </div>
                        </td>

                        {/* Combat Score */}
                        <td className="leaderboard-td" style={{ textAlign: 'right' }}>
                          <span className="score-cell">
                            {(pilot.totalScore || 0).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : leaderboard.length <= 3 && !searchQuery ? (
                  <tr>
                    <td colSpan={5} className="leaderboard-td">
                      <div className="leaderboard-empty-state">
                        <Trophy size={32} color="#C084FC" />
                        <p className="leaderboard-empty-title">ALL ACTIVE PILOTS DISPLAYED ON THE PODIUM</p>
                        <p className="leaderboard-empty-desc">
                          Ranks #1 through #{leaderboard.length} are currently displayed in the championship podium above. Complete missions to register additional pilots into rank #4+.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={5} className="leaderboard-td">
                      <div className="leaderboard-empty-state">
                        <Search size={30} color="#94A3B8" />
                        <p className="leaderboard-empty-title">NO MATCHING PILOTS FOUND</p>
                        <p className="leaderboard-empty-desc">
                          No pilot callsign or starship matching "{searchQuery}" was found in the current roster.
                        </p>
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="btn btn-secondary"
                          style={{
                            marginTop: '8px',
                            padding: '6px 14px',
                            fontSize: '0.76rem',
                            fontFamily: 'var(--font-heading)'
                          }}
                        >
                          Clear Search
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ================= 6. CALL TO ACTION PANELS ================= */}
        {/* Unauthenticated Visitor Enlistment CTA */}
        {isPublic && !isAuthenticated && (
          <section className="leaderboard-cta-panel" aria-label="Pilot Enlistment">
            <div className="leaderboard-cta-content">
              <div className="leaderboard-cta-eyebrow">
                <Shield size={14} color="#00E5FF" aria-hidden="true" />
                <span>YOUR LEGEND STARTS HERE</span>
              </div>
              <h2 className="leaderboard-cta-heading">
                READY TO ENTER THE RANKINGS?
              </h2>
              <p className="leaderboard-cta-desc">
                Enlist as an authorized pilot, command sector missions, and build your verified combat record on the global ledger.
              </p>
            </div>

            <div className="leaderboard-cta-actions">
              <button
                type="button"
                onClick={() => handleAuthNavigation('register')}
                className="leaderboard-cta-btn-primary"
                id="leaderboard-create-account-btn"
              >
                <span>CREATE PILOT ACCOUNT</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => handleAuthNavigation('login')}
                className="leaderboard-cta-link-secondary"
                id="leaderboard-signin-link"
              >
                Already enlisted? Sign in
              </button>
            </div>
          </section>
        )}

        {/* Authenticated Quick Launch Banner */}
        {isAuthenticated && (
          <section className="leaderboard-cta-panel" aria-label="Mission Launch Deck">
            <div className="leaderboard-cta-content">
              <div className="leaderboard-cta-eyebrow">
                <Zap size={14} color="#00E5FF" aria-hidden="true" />
                <span>PILOT COMBAT LINK ACTIVE</span>
              </div>
              <h2 className="leaderboard-cta-heading">
                DEPLOY TO CLIMB THE HALL OF FAME
              </h2>
              <p className="leaderboard-cta-desc">
                Launch sector missions, defeat alien bosses, and earn stars to improve your combat standing.
              </p>
            </div>

            <div className="leaderboard-cta-actions">
              <button
                type="button"
                onClick={() => {
                  try { soundManager.playLaser(); } catch {}
                  if (onNavigate) onNavigate('missions');
                }}
                className="leaderboard-cta-btn-primary"
              >
                <span>LAUNCH MISSIONS</span>
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default LeaderboardView;
