import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api.js';
import { getRandomAdCampaign } from '../data/adCampaigns.js';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, Coins, Zap, Award, Video, ShieldCheck, 
  RefreshCw, Clock, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownLeft 
} from 'lucide-react';

export const WalletPage = ({ onBack }) => {
  const { profile, refreshProfile } = useAuth();
  const [balance, setBalance] = useState({
    credits: profile?.credits || 500,
    energyCores: profile?.energyCores || 10,
    rewardCoins: profile?.rewardCoins || 0,
    xp: profile?.xp || 0,
    level: profile?.level || 1,
    xpToNextLevel: profile?.xpToNextLevel || 100,
    pilotRank: profile?.pilotRank || 'Star Cadet'
  });

  const [ledger, setLedger] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Rewarded Ad Modal State
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adSessionData, setAdSessionData] = useState(null);
  const [adCountdown, setAdCountdown] = useState(5);
  const [isAdAudioMuted, setIsAdAudioMuted] = useState(true);
  const [activeAdCampaign, setActiveAdCampaign] = useState(() => getRandomAdCampaign());
  const adTimerRef = useRef(null);
  const [adVerifying, setAdVerifying] = useState(false);

  // Fetch balances and double-entry transaction ledger
  const fetchWalletData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [balRes, ledRes, sumRes] = await Promise.all([
        api.get('/wallet/balance'),
        api.get(`/wallet/ledger?currency=${activeFilter}`),
        api.get('/wallet/summary')
      ]);

      if (balRes.data?.success) setBalance(balRes.data.balance);
      if (ledRes.data?.success) setLedger(ledRes.data.transactions);
      if (sumRes.data?.success) setSummary(sumRes.data.summary);
      if (refreshProfile) refreshProfile();
    } catch (err) {
      console.warn('Failed to fetch wallet data:', err.message);
      setErrorMessage('Could not load ledger from backend. Showing local cache.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
    return () => {
      if (adTimerRef.current) clearInterval(adTimerRef.current);
    };
  }, [activeFilter]);

  // Launch Simulated Rewarded Ad
  const handleWatchAd = async () => {
    soundManager.playPowerUp();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const campaign = getRandomAdCampaign();
      setActiveAdCampaign(campaign);

      const res = await api.post('/ads/offer', {
        placement: 'DAILY_SUPPLY',
        expectedReward: { currencyType: 'CREDITS', amount: 150 },
        durationSeconds: 10
      });

      if (res.data?.success) {
        setAdSessionData(res.data);
        setAdCountdown(10);
        setAdModalOpen(true);

        let currentSec = 10;
        if (adTimerRef.current) clearInterval(adTimerRef.current);
        adTimerRef.current = setInterval(async () => {
          currentSec -= 1;
          setAdCountdown(currentSec);

          try {
            await api.post(`/ads/${res.data.adId}/heartbeat`, {
              elapsedSeconds: 10 - currentSec
            });
          } catch {
            // Heartbeat non-blocking
          }

          if (currentSec <= 0) {
            clearInterval(adTimerRef.current);
          }
        }, 1000);
      } else {
        setErrorMessage(res.data?.message || 'Ad session rejected');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Rewarded ads currently cooling down.');
    }
  };

  const handleAbortAd = () => {
    if (adTimerRef.current) clearInterval(adTimerRef.current);
    setAdModalOpen(false);
    setAdSessionData(null);
  };

  // Claim Rewarded Ad after countdown (Strict 10s enforcement)
  const handleClaimAdReward = async () => {
    if (!adSessionData || adCountdown > 0) return;
    setAdVerifying(true);

    try {
      const res = await api.post(`/ads/${adSessionData.adId}/verify`);
      if (res.data?.success) {
        soundManager.playPickup('credit');
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setSuccessMessage(`Reward claimed! +${res.data.grantedReward.amount} ${res.data.grantedReward.currencyType} added to ledger.`);
        setAdModalOpen(false);
        setAdSessionData(null);
        fetchWalletData();
      } else {
        setErrorMessage(res.data?.message || 'Verification failed');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error verifying ad reward');
    } finally {
      setAdVerifying(false);
    }
  };

  return (
    <div className="page-responsive-container">
      {/* ================= TOP HEADER BAR ================= */}
      <header style={styles.header} className="glass-panel cyber-box">
        <div style={styles.headerLeft}>
          <button onClick={onBack} style={styles.backBtn} className="btn-secondary">
            <ArrowLeft size={18} />
            <span>COMMAND DECK</span>
          </button>
          <div>
            <h1 className="font-heading text-glow-cyan" style={styles.pageTitle}>REWARDS WALLET</h1>
            <p style={styles.subTitle}>Track your credits, gems and reward history</p>
          </div>
        </div>

        <div style={styles.headerRight}>
          <button 
            onClick={fetchWalletData} 
            style={styles.refreshBtn} 
            className="btn-secondary"
            title="Refresh Ledger"
          >
            <RefreshCw size={16} />
            <span>SYNC LEDGER</span>
          </button>
        </div>
      </header>

      {/* Notifications */}
      {errorMessage && (
        <div style={styles.errorAlert} className="glass-panel animate-pulse-glow">
          <AlertCircle size={18} color="#EF4444" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div style={styles.successAlert} className="glass-panel animate-pulse-glow">
          <CheckCircle2 size={18} color="var(--status-green)" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ================= 4 CURRENCY & PROGRESS CARDS ================= */}
      <div style={styles.balanceGrid}>
        {/* 1. In-Game Credits */}
        <div 
          style={{ 
            ...styles.balanceCard, 
            border: '1px solid rgba(251, 191, 36, 0.4)', 
            boxShadow: '0 0 18px rgba(251, 191, 36, 0.15)',
            background: 'radial-gradient(circle at top left, rgba(251, 191, 36, 0.08) 0%, rgba(10, 15, 40, 0.8) 100%)'
          }} 
          className="glass-card cyber-box"
        >
          <div style={styles.balanceCardHeader}>
            <div style={styles.iconCircleGold}>
              <Coins size={22} color="var(--currency-gold)" style={{ filter: 'drop-shadow(0 0 4px #FBBF24)' }} />
            </div>
            <button 
              onClick={handleWatchAd}
              style={styles.watchAdBtn}
              className="btn btn-cyan animate-pulse-glow"
              title="Watch 5-second simulated ad for +150 Credits"
            >
              <Video size={14} />
              <span>+150 (AD)</span>
            </button>
          </div>
          <div style={styles.balanceCardBody}>
            <div style={{ ...styles.balanceLabel, color: 'var(--currency-gold)' }}>IN-GAME CREDITS</div>
            <div className="font-heading text-glow-gold" style={styles.balanceValGold}>
              {balance.credits?.toLocaleString() || 0}
            </div>
            <div style={styles.balanceSubtext}>Standard combat & upgrade tender</div>
          </div>
        </div>

        {/* 2. Energy Cores */}
        <div 
          style={{ 
            ...styles.balanceCard, 
            border: '1px solid rgba(168, 85, 247, 0.4)', 
            boxShadow: '0 0 18px rgba(168, 85, 247, 0.15)',
            background: 'radial-gradient(circle at top left, rgba(168, 85, 247, 0.08) 0%, rgba(10, 15, 40, 0.8) 100%)'
          }} 
          className="glass-card cyber-box"
        >
          <div style={styles.balanceCardHeader}>
            <div style={styles.iconCirclePurple}>
              <Zap size={22} color="#C084FC" style={{ filter: 'drop-shadow(0 0 4px #A855F7)' }} />
            </div>
            <span style={styles.hardCurrencyBadge}>HARD CURRENCY</span>
          </div>
          <div style={styles.balanceCardBody}>
            <div style={{ ...styles.balanceLabel, color: '#C084FC' }}>ENERGY CORES</div>
            <div className="font-heading text-glow-purple" style={styles.balanceValPurple}>
              {balance.energyCores || 0}
            </div>
            <div style={styles.balanceSubtext}>Used for ship unlocks & boss surges</div>
          </div>
        </div>

        {/* 3. VELOOP Reward Coins (Simulated Web3) */}
        <div 
          style={{ 
            ...styles.balanceCard, 
            border: '1px solid rgba(255, 45, 255, 0.4)', 
            boxShadow: '0 0 18px rgba(255, 45, 255, 0.15)',
            background: 'radial-gradient(circle at top left, rgba(255, 45, 255, 0.08) 0%, rgba(10, 15, 40, 0.8) 100%)'
          }} 
          className="glass-card cyber-box"
        >
          <div style={styles.balanceCardHeader}>
            <div style={styles.iconCircleMagenta}>
              <Award size={22} color="var(--accent-magenta)" style={{ filter: 'drop-shadow(0 0 4px #FF2DFF)' }} />
            </div>
            <span style={styles.networkBadge}>VEL-CHAIN 2.0</span>
          </div>
          <div style={styles.balanceCardBody}>
            <div style={{ ...styles.balanceLabel, color: 'var(--accent-magenta)' }}>VELOP REWARD COINS</div>
            <div className="font-heading text-glow-magenta" style={styles.balanceValMagenta}>
              {(balance.rewardCoins || 0).toFixed(2)} VEL
            </div>
            <div style={styles.balanceSubtext}>Cross-game simulated reward currency</div>
          </div>
        </div>

        {/* 4. Pilot Level & XP */}
        <div 
          style={{ 
            ...styles.balanceCard, 
            border: '1px solid rgba(0, 229, 255, 0.4)', 
            boxShadow: '0 0 18px rgba(0, 229, 255, 0.15)',
            background: 'radial-gradient(circle at top left, rgba(0, 229, 255, 0.08) 0%, rgba(10, 15, 40, 0.8) 100%)'
          }} 
          className="glass-card cyber-box"
        >
          <div style={styles.balanceCardHeader}>
            <div style={styles.iconCircleCyan}>
              <ShieldCheck size={22} color="var(--secondary-cyan)" style={{ filter: 'drop-shadow(0 0 4px #00E5FF)' }} />
            </div>
            <span style={styles.levelBadge}>LV. {balance.level} {balance.pilotRank}</span>
          </div>
          <div style={styles.balanceCardBody}>
            <div style={{ ...styles.balanceLabel, color: 'var(--secondary-cyan)' }}>EXPERIENCE (XP)</div>
            <div className="font-heading text-glow-cyan" style={styles.balanceValCyan}>
              {balance.xp} / {balance.xpToNextLevel} XP
            </div>
            <div style={styles.xpTrack}>
              <div 
                style={{
                  ...styles.xpFill,
                  width: `${Math.min(100, (balance.xp / balance.xpToNextLevel) * 100)}%`
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= LEDGER CONTROLS & FILTER TABS ================= */}
      <div style={styles.ledgerHeaderRow}>
        <div style={styles.ledgerTitleGroup}>
          <h2 className="font-heading" style={styles.ledgerTitle}>IMMUTABLE TRANSACTION LEDGER</h2>
          <span style={styles.ledgerSubtitle}>CRYPTOGRAPHICALLY LINKED DOUBLE-ENTRY RECORDS</span>
        </div>

        <div style={styles.filterTabs}>
          {['ALL', 'CREDITS', 'ENERGY_CORES', 'REWARD_COINS'].map((cur) => (
            <button
              key={cur}
              onClick={() => {
                soundManager.playPickup('core');
                setActiveFilter(cur);
              }}
              style={{
                ...styles.filterTab,
                background: activeFilter === cur ? 'var(--secondary-cyan)' : 'rgba(255, 255, 255, 0.05)',
                color: activeFilter === cur ? '#060919' : 'var(--text-light)',
                fontWeight: activeFilter === cur ? 'bold' : 'normal'
              }}
            >
              {cur.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ================= TRANSACTION LEDGER TABLE ================= */}
      <div style={styles.tableCard} className="glass-card">
        {loading ? (
          <div style={styles.loadingBox}>
            <div className="spinner" />
            <p className="font-heading" style={{ marginTop: '16px', color: 'var(--secondary-cyan)' }}>
              AUDITING WALLET TRANSACTIONS...
            </p>
          </div>
        ) : ledger.length === 0 ? (
          <div style={styles.emptyBox}>
            <Clock size={36} color="var(--text-muted)" />
            <h3 className="font-heading" style={{ marginTop: '12px' }}>NO TRANSACTIONS FOUND</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Launch combat missions or watch rewarded ads to generate ledger entries.
            </p>
          </div>
        ) : (
          <div className="responsive-table-scroll">
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>TIMESTAMP</th>
                  <th style={styles.th}>REFERENCE / TX ID</th>
                  <th style={styles.th}>TYPE & SOURCE</th>
                  <th style={styles.th}>AMOUNT</th>
                  <th style={styles.th}>BALANCE DELTA</th>
                  <th style={styles.th}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((tx) => {
                  const isCredit = tx.transactionType === 'CREDIT';
                  const dateStr = new Date(tx.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  return (
                    <tr key={tx._id} style={styles.tableRow}>
                      {/* Timestamp */}
                      <td style={styles.tdTime}>{dateStr}</td>

                      {/* Reference ID */}
                      <td style={styles.tdRef}>
                        <code>{tx.referenceId ? tx.referenceId.substring(0, 18) + '...' : 'N/A'}</code>
                      </td>

                      {/* Type & Source */}
                      <td style={styles.td}>
                        <div style={styles.sourceGroup}>
                          <span style={{
                            ...styles.typeBadge,
                            background: isCredit ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: isCredit ? 'var(--status-green)' : '#EF4444',
                            border: `1px solid ${isCredit ? 'var(--status-green)' : '#EF4444'}`
                          }}>
                            {isCredit ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                            {tx.transactionType}
                          </span>
                          <span style={styles.sourceText}>{tx.source?.replace(/_/g, ' ')}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td style={styles.td}>
                        <span style={{
                          ...styles.amountText,
                          color: isCredit ? 'var(--status-green)' : '#EF4444'
                        }}>
                          {isCredit ? '+' : '-'}{tx.amount?.toLocaleString()} {tx.currencyType}
                        </span>
                      </td>

                      {/* Balance Delta */}
                      <td style={styles.tdDelta}>
                        <span style={{ color: 'var(--text-muted)' }}>{tx.balanceBefore?.toLocaleString()}</span>
                        <span style={{ margin: '0 6px', color: 'var(--secondary-cyan)' }}>→</span>
                        <span style={{ color: 'var(--text-light)', fontWeight: 'bold' }}>{tx.balanceAfter?.toLocaleString()}</span>
                      </td>

                      {/* Status */}
                      <td style={styles.td}>
                        <span style={styles.statusBadge}>
                          <CheckCircle2 size={12} color="var(--status-green)" />
                          <span>VERIFIED</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= SUMMARY METRICS FOOTER ================= */}
      {summary && (
        <div style={styles.summaryBar} className="glass-panel">
          <div style={styles.summaryItem}>
            <div style={styles.summaryVal}>{summary.totalTransactions}</div>
            <div style={styles.summaryLabel}>TOTAL TRANSACTIONS</div>
          </div>
          <div style={styles.summaryDivider} />
          <div style={styles.summaryItem}>
            <div style={{ ...styles.summaryVal, color: 'var(--status-green)' }}>
              +{summary.totalCreditsEarned?.toLocaleString()}
            </div>
            <div style={styles.summaryLabel}>TOTAL CREDITS CREDITED</div>
          </div>
          <div style={styles.summaryDivider} />
          <div style={styles.summaryItem}>
            <div style={{ ...styles.summaryVal, color: '#EF4444' }}>
              -{summary.totalCreditsSpent?.toLocaleString()}
            </div>
            <div style={styles.summaryLabel}>TOTAL CREDITS DEBITED</div>
          </div>
          <div style={styles.summaryDivider} />
          <div style={styles.summaryItem}>
            <div style={{ ...styles.summaryVal, color: 'var(--secondary-cyan)' }}>
              {summary.totalAdsClaimed}
            </div>
            <div style={styles.summaryLabel}>REWARDED ADS CLAIMED</div>
          </div>
        </div>
      )}

      {/* ================= SIMULATED REWARDED AD MODAL ================= */}
      {adModalOpen && (
        <div style={styles.adModalBackdrop}>
          <div style={styles.adBox} className="glass-panel animate-scale-up">
            <div style={styles.adHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-cyan" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Video size={13} /> {activeAdCampaign?.sponsor || 'VELOP SPONSORED TRANSMISSION'}
                </span>
                <span style={{ fontSize: '0.70rem', color: 'var(--currency-gold)', fontFamily: 'var(--font-heading)' }}>
                  {activeAdCampaign?.badge || 'AD • 1 OF 1'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  ...styles.countdownPill,
                  background: adCountdown > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: adCountdown > 0 ? '#FCA5A5' : '#6EE7B7',
                  border: `1px solid ${adCountdown > 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                }}>
                  {adCountdown > 0 ? `REWARD IN: ${adCountdown}s` : '✓ REWARD READY!'}
                </span>

                {/* Abort Ad Button */}
                <button
                  onClick={handleAbortAd}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: '26px',
                    height: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#AAA',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    lineHeight: 1
                  }}
                  title="Close Ad (Reward will be forfeited)"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Actual Commercial Video Player Container */}
            <div style={{
              ...styles.adVideoScreen,
              position: 'relative',
              overflow: 'hidden',
              padding: 0,
              background: '#02040A',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)'
            }}>
              <video
                key={activeAdCampaign?.videoSrc || 'ad-video'}
                src={activeAdCampaign?.videoSrc || '/videos/ad_commercial.mp4'}
                autoPlay
                playsInline
                muted={isAdAudioMuted}
                loop
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />

              {/* Video Cyberpunk Overlay Controls */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(6, 9, 25, 0.6) 0%, transparent 40%, rgba(6, 9, 25, 0.85) 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '14px',
                pointerEvents: 'none'
              }}>
                {/* Top overlay line */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'auto' }}>
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '2px 8px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    border: '1px solid rgba(0, 229, 255, 0.4)',
                    borderRadius: '4px',
                    color: 'var(--secondary-cyan)',
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '0.08em'
                  }}>
                    4K ULTRA HD STREAM
                  </span>
                  <button
                    onClick={() => setIsAdAudioMuted(!isAdAudioMuted)}
                    style={{
                      background: 'rgba(0, 0, 0, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#FFF',
                      transition: 'all 0.2s'
                    }}
                    title={isAdAudioMuted ? 'Click to Unmute' : 'Click to Mute'}
                  >
                    {isAdAudioMuted ? <VolumeX size={15} color="#EF4444" /> : <Volume2 size={15} color="#10B981" />}
                  </button>
                </div>

                {/* Bottom overlay info & scrubber */}
                <div style={{ pointerEvents: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="font-heading" style={{ fontSize: '0.78rem', color: '#FFF', letterSpacing: '0.04em' }}>
                      {activeAdCampaign?.title || 'CYBERNETIC WEAPONS EXPO'} // {activeAdCampaign?.tagline || 'SPECIAL PROMO'}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--secondary-cyan)', fontFamily: 'var(--font-heading)' }}>
                      0:${(10 - adCountdown) < 10 ? '0' : ''}${Math.min(10, 10 - adCountdown)} / 0:10
                    </span>
                  </div>
                  {/* Real-time Video Scrubber */}
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(100, ((10 - adCountdown) / 10) * 100)}%`,
                      background: 'linear-gradient(90deg, var(--secondary-cyan) 0%, #C084FC 100%)',
                      transition: 'width 0.8s ease'
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Notice if watching */}
            {adCountdown > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '-8px' }}>
                ⚠️ Notice: Watching the full 10-second broadcast is required by Velop anti-cheat to earn rewards.
              </div>
            )}

            <button
              onClick={handleClaimAdReward}
              disabled={adCountdown > 0 || adVerifying}
              style={{
                ...styles.claimAdBtn,
                opacity: (adCountdown > 0 || adVerifying) ? 0.5 : 1,
                cursor: (adCountdown > 0 || adVerifying) ? 'not-allowed' : 'pointer'
              }}
              className={adCountdown === 0 ? 'animate-pulse-glow' : ''}
            >
              {adVerifying ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px' }} />
                  <span>VERIFYING CRYPTOGRAPHIC PROOF...</span>
                </>
              ) : adCountdown > 0 ? (
                <span>LOCKED (WATCH FULL BROADCAST: ${adCountdown}S)</span>
              ) : (
                <>
                  <Award size={18} />
                  <span>CLAIM VERIFIED REWARD (+150 CREDITS)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
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
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    fontSize: '0.8rem',
    borderRadius: '10px'
  },
  errorAlert: {
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
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    borderRadius: '10px',
    border: '1px solid rgba(16, 185, 129, 0.5)',
    background: 'rgba(6, 78, 59, 0.85)',
    color: '#A7F3D0',
    fontSize: '0.88rem'
  },
  balanceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px'
  },
  balanceCard: {
    padding: '20px',
    borderRadius: '14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '140px'
  },
  balanceCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  iconCircleGold: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'rgba(251, 191, 36, 0.12)',
    border: '1px solid rgba(251, 191, 36, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconCirclePurple: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'rgba(168, 85, 247, 0.12)',
    border: '1px solid rgba(168, 85, 247, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconCircleMagenta: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'rgba(255, 45, 255, 0.12)',
    border: '1px solid rgba(255, 45, 255, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconCircleCyan: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'rgba(0, 229, 255, 0.12)',
    border: '1px solid rgba(0, 229, 255, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  watchAdBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    fontSize: '0.72rem',
    borderRadius: '8px'
  },
  hardCurrencyBadge: {
    fontSize: '0.62rem',
    padding: '3px 8px',
    borderRadius: '6px',
    background: 'rgba(168, 85, 247, 0.2)',
    color: '#C084FC',
    border: '1px solid rgba(168, 85, 247, 0.4)',
    fontFamily: 'var(--font-heading)'
  },
  networkBadge: {
    fontSize: '0.62rem',
    padding: '3px 8px',
    borderRadius: '6px',
    background: 'rgba(255, 45, 255, 0.2)',
    color: 'var(--electric-magenta)',
    border: '1px solid rgba(255, 45, 255, 0.4)',
    fontFamily: 'var(--font-heading)'
  },
  levelBadge: {
    fontSize: '0.62rem',
    padding: '3px 8px',
    borderRadius: '6px',
    background: 'rgba(0, 229, 255, 0.2)',
    color: 'var(--secondary-cyan)',
    border: '1px solid rgba(0, 229, 255, 0.4)',
    fontFamily: 'var(--font-heading)'
  },
  balanceCardBody: {},
  balanceLabel: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-heading)'
  },
  balanceValGold: {
    fontSize: '1.75rem',
    color: 'var(--currency-gold)',
    margin: '4px 0'
  },
  balanceValPurple: {
    fontSize: '1.75rem',
    color: '#C084FC',
    margin: '4px 0'
  },
  balanceValMagenta: {
    fontSize: '1.75rem',
    color: 'var(--electric-magenta)',
    margin: '4px 0'
  },
  balanceValCyan: {
    fontSize: '1.45rem',
    color: 'var(--secondary-cyan)',
    margin: '4px 0'
  },
  balanceSubtext: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)'
  },
  xpTrack: {
    width: '100%',
    height: '6px',
    background: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '8px',
    border: '1px solid rgba(0, 229, 255, 0.2)'
  },
  xpFill: {
    height: '100%',
    background: 'linear-gradient(90deg, var(--secondary-cyan) 0%, var(--cosmic-purple) 100%)',
    borderRadius: '4px'
  },
  ledgerHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginTop: '10px'
  },
  ledgerTitleGroup: {},
  ledgerTitle: {
    fontSize: '1.25rem',
    color: 'var(--text-light)',
    margin: '0 0 4px 0'
  },
  ledgerSubtitle: {
    fontSize: '0.68rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-heading)'
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  },
  filterTab: {
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border-glass)',
    fontSize: '0.74rem',
    fontFamily: 'var(--font-heading)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
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
  tdTime: {
    padding: '14px 18px',
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-ui)',
    whiteSpace: 'nowrap'
  },
  tdRef: {
    padding: '14px 18px',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontFamily: 'monospace'
  },
  tdDelta: {
    padding: '14px 18px',
    fontSize: '0.82rem',
    fontFamily: 'var(--font-heading)',
    whiteSpace: 'nowrap'
  },
  sourceGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  typeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '0.65rem',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '0.06em'
  },
  sourceText: {
    fontSize: '0.82rem',
    color: 'var(--text-light)',
    fontFamily: 'var(--font-heading)'
  },
  amountText: {
    fontFamily: 'var(--font-heading)',
    fontWeight: 'bold',
    fontSize: '0.92rem'
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.68rem',
    color: 'var(--status-green)',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '0.06em'
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
  },
  summaryBar: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '16px 24px',
    borderRadius: '14px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  summaryItem: {
    textAlign: 'center'
  },
  summaryVal: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.25rem',
    color: 'var(--text-light)'
  },
  summaryLabel: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    marginTop: '2px'
  },
  summaryDivider: {
    width: '1px',
    height: '32px',
    background: 'rgba(255, 255, 255, 0.08)'
  },
  adModalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.88)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '20px'
  },
  adBox: {
    maxWidth: '520px',
    width: '100%',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    borderRadius: '16px',
    border: '1px solid var(--border-glass)'
  },
  adHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  countdownPill: {
    fontSize: '0.75rem',
    padding: '4px 10px',
    background: 'rgba(0, 229, 255, 0.15)',
    border: '1px solid var(--secondary-cyan)',
    borderRadius: '12px',
    color: 'var(--secondary-cyan)',
    fontFamily: 'var(--font-heading)'
  },
  adVideoScreen: {
    height: '240px',
    background: 'radial-gradient(circle at center, rgba(124, 58, 237, 0.25) 0%, rgba(6, 9, 25, 0.95) 80%)',
    borderRadius: '12px',
    border: '1px solid var(--border-glass)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px'
  },
  claimAdBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, var(--secondary-cyan) 0%, #0099FF 100%)',
    color: '#060919',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    letterSpacing: '0.08em',
    border: 'none',
    transition: 'all 0.2s ease'
  }
};

export default WalletPage;
