import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../services/api.js';
import { getRandomAdCampaign } from '../data/adCampaigns.js';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, Coins, Zap, Award, Video, ShieldCheck, 
  RefreshCw, Clock, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownLeft,
  Search, Copy, Check, Eye, X, Volume2, VolumeX, Shield, ChevronRight, Activity, Crosshair, Sparkles
} from 'lucide-react';
import './WalletPage.css';
import { getNextRankInfo } from '../utils/pilotUtils.js';

export const WalletPage = ({ onBack }) => {
  const { profile, refreshProfile } = useAuth();
  
  // Real Balances
  const [balance, setBalance] = useState({
    credits: profile?.credits || 500,
    energyCores: profile?.energyCores || 10,
    rewardCoins: profile?.velopRewardCoins || profile?.rewardCoins || 0,
    xp: profile?.xp || 0,
    level: profile?.level || 1,
    xpToNextLevel: profile?.xpToNextLevel || 100,
    pilotRank: profile?.pilotRank || 'Star Cadet'
  });

  const [ledger, setLedger] = useState([]);
  const [summary, setSummary] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('NEWEST');
  const [selectedTx, setSelectedTx] = useState(null);
  const [copiedRefId, setCopiedRefId] = useState(null);
  const [lastSyncedTime, setLastSyncedTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('IDLE');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Rewarded Ad Modal State
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adSessionData, setAdSessionData] = useState(null);
  const [adCountdown, setAdCountdown] = useState(10);
  const [isAdAudioMuted, setIsAdAudioMuted] = useState(true);
  const [activeAdCampaign, setActiveAdCampaign] = useState(() => getRandomAdCampaign());
  const adTimerRef = useRef(null);
  const [adVerifying, setAdVerifying] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedTx) setSelectedTx(null);
        if (adModalOpen && adCountdown === 0) setAdModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTx, adModalOpen, adCountdown]);

  const fetchWalletData = async () => {
    setLoading(true);
    setSyncStatus('SYNCING');
    setErrorMessage(null);
    try {
      const [balRes, ledRes, sumRes] = await Promise.all([
        api.get('/wallet/balance'),
        api.get(`/wallet/ledger?currency=${activeFilter}&limit=100`),
        api.get('/wallet/summary')
      ]);

      if (balRes.data?.success) setBalance(balRes.data.balance);
      if (ledRes.data?.success) setLedger(ledRes.data.transactions || []);
      if (sumRes.data?.success) setSummary(sumRes.data.summary);
      if (refreshProfile) await refreshProfile();

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncedTime(timeStr);
      setSyncStatus('SUCCESS');
    } catch (err) {
      console.warn('Failed to fetch wallet data:', err.message);
      setSyncStatus('ERROR');
      setErrorMessage('Could not synchronize live ledger from command link. Showing cached records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
    return () => {
      if (adTimerRef.current) clearInterval(adTimerRef.current);
    };
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  const handleCopy = (text, e) => {
    if (e) e.stopPropagation();
    try {
      if (navigator.clipboard) navigator.clipboard.writeText(text);
      setCopiedRefId(text);
      setTimeout(() => setCopiedRefId(null), 2000);
    } catch (err) {
      console.warn('Copy error:', err);
    }
  };

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
        setErrorMessage(res.data?.message || 'Ad session rejected by anti-cheat');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Rewarded sponsor transmissions currently cooling down.');
    }
  };

  const handleAbortAd = () => {
    if (adTimerRef.current) clearInterval(adTimerRef.current);
    setAdModalOpen(false);
    setAdSessionData(null);
  };

  const handleClaimAdReward = async () => {
    if (!adSessionData || adCountdown > 0) return;
    setAdVerifying(true);

    try {
      const res = await api.post(`/ads/${adSessionData.adId}/verify`);
      if (res.data?.success) {
        soundManager.playPickup('credit');
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setSuccessMessage(`Reward claimed! +${res.data.grantedReward.amount} ${res.data.grantedReward.currencyType} deposited into Galactic Treasury.`);
        setAdModalOpen(false);
        setAdSessionData(null);
        await fetchWalletData();
      } else {
        setErrorMessage(res.data?.message || 'Verification failed');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error verifying ad reward');
    } finally {
      setAdVerifying(false);
    }
  };

  const latestMissionTx = useMemo(() => {
    return ledger.find((tx) => tx.source === 'MISSION_COMPLETION' || tx.source === 'BOSS_DEFEAT');
  }, [ledger]);

  const latestCreditTx = useMemo(() => {
    return ledger.find((tx) => tx.transactionType === 'CREDIT');
  }, [ledger]);

  const processedTransactions = useMemo(() => {
    let result = [...ledger];

    if (activeFilter === 'CREDITS') {
      result = result.filter((tx) => tx.currencyType === 'CREDITS');
    } else if (activeFilter === 'ENERGY_CORES') {
      result = result.filter((tx) => tx.currencyType === 'ENERGY_CORES');
    } else if (activeFilter === 'REWARD_COINS') {
      result = result.filter((tx) => tx.currencyType === 'VELOP_COINS' || tx.currencyType === 'REWARD_COINS');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((tx) => {
        const refMatch = tx.referenceId?.toLowerCase().includes(q);
        const descMatch = tx.description?.toLowerCase().includes(q);
        const srcMatch = tx.source?.toLowerCase().includes(q);
        const amtMatch = String(tx.amount).includes(q);
        return refMatch || descMatch || srcMatch || amtMatch;
      });
    }

    if (sortOption === 'NEWEST') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === 'OLDEST') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortOption === 'AMOUNT_DESC') {
      result.sort((a, b) => (b.amount || 0) - (a.amount || 0));
    }

    return result;
  }, [ledger, activeFilter, searchQuery, sortOption]);

  const filteredTotals = useMemo(() => {
    let creditsCredited = 0;
    let creditsDebited = 0;
    processedTransactions.forEach((tx) => {
      if (tx.currencyType === 'CREDITS') {
        if (tx.transactionType === 'CREDIT') creditsCredited += tx.amount || 0;
        if (tx.transactionType === 'DEBIT') creditsDebited += tx.amount || 0;
      }
    });
    return {
      count: processedTransactions.length,
      creditsCredited,
      creditsDebited
    };
  }, [processedTransactions]);

  const nextRankInfo = getNextRankInfo(balance.level);
  const xpPercent = Math.min(100, Math.round(((balance.xp || 0) / (balance.xpToNextLevel || 100)) * 100));

  return (
    <div className="treasury-shell" role="main" aria-label="Galactic Treasury">
      {/* ================= 1. GALACTIC TREASURY HEADER ================= */}
      <header className="treasury-header-shell">
        <div className="treasury-header-left">
          {onBack && (
            <button 
              onClick={onBack} 
              className="treasury-back-btn"
              title="Return to Command Deck"
            >
              <ArrowLeft size={16} />
              <span>COMMAND DECK</span>
            </button>
          )}
          <div className="treasury-title-group">
            <span className="treasury-pretitle-tag">
              <Sparkles size={11} />
              PILOT FINANCIAL COMMAND // SECURE LEDGER
            </span>
            <h1 className="treasury-main-title">GALACTIC TREASURY</h1>
            <p className="treasury-subtitle">
              Track your combat earnings, energy reserves, experience, and verified reward activity.
            </p>
          </div>
        </div>

        <div className="treasury-header-right">
          {syncStatus === 'SUCCESS' && (
            <div className="treasury-sync-badge sync-success" title="All double-entry ledger transactions verified">
              <span className="sync-pulse-dot" />
              <span className="sync-text">LEDGER SYNCHRONIZED</span>
              {lastSyncedTime && <span className="sync-timestamp">({lastSyncedTime})</span>}
            </div>
          )}
          {syncStatus === 'SYNCING' && (
            <div className="treasury-sync-badge sync-syncing">
              <RefreshCw size={12} className="sync-spinning" />
              <span className="sync-text">AUDITING LEDGER...</span>
            </div>
          )}
          {syncStatus === 'ERROR' && (
            <div className="treasury-sync-badge sync-error">
              <AlertCircle size={12} />
              <span className="sync-text">OFFLINE CACHE</span>
            </div>
          )}

          <button 
            onClick={fetchWalletData} 
            disabled={loading}
            className="treasury-sync-btn"
            title="Perform server-authoritative wallet synchronization"
          >
            <RefreshCw size={13} className={loading ? 'sync-spinning' : ''} />
            <span>{loading ? 'AUDITING...' : 'SYNC LEDGER'}</span>
          </button>
        </div>
      </header>

      {/* Notifications Alerts */}
      {errorMessage && (
        <div className="error-alert-banner" role="alert" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 18px', background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '8px', color: '#FCA5A5', fontSize: '0.8rem'
        }}>
          <AlertCircle size={16} color="#EF4444" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="success-alert-banner" role="alert" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 18px', background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '8px', color: '#6EE7B7', fontSize: '0.8rem'
        }}>
          <CheckCircle2 size={16} color="#10B981" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ================= 2. FOUR RESOURCE & PROGRESS CARDS ================= */}
      <section className="treasury-cards-grid" aria-label="Currencies and Progress">
        {/* Card A: Combat Credits */}
        <div className="treasury-card card-credits cyber-interactive-card">
          <div className="card-header-row">
            <div className="card-icon-container icon-box-gold">
              <Coins size={22} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="card-tag-pill">STANDARD TENDER</span>
              <button 
                onClick={handleWatchAd}
                className="btn-mini-watch-ad"
                title="Watch simulated 10-second sponsor broadcast for +150 Credits"
              >
                <Video size={11} />
                <span>+150 CR</span>
              </button>
            </div>
          </div>
          <div className="card-content-body">
            <span className="resource-label-tag">COMBAT CREDITS</span>
            <div className="resource-value-text text-gold">
              {(balance.credits || 0).toLocaleString()} CR
            </div>
            <p className="resource-desc-text">
              Earned through combat and mission completion. Standard currency for ship upgrades.
            </p>
            {latestCreditTx && (
              <div className="resource-delta-tag tag-gold">
                <ArrowUpRight size={11} />
                <span>+{latestCreditTx.amount} CR in latest transaction</span>
              </div>
            )}
          </div>
        </div>

        {/* Card B: Energy Cores */}
        <div className="treasury-card card-cores cyber-interactive-card">
          <div className="card-header-row">
            <div className="card-icon-container icon-box-purple">
              <Zap size={22} />
            </div>
            <span className="card-tag-pill">REACTOR GRADE</span>
          </div>
          <div className="card-content-body">
            <span className="resource-label-tag">ENERGY CORES</span>
            <div className="resource-value-text text-purple">
              {balance.energyCores || 0} CORES
            </div>
            <p className="resource-desc-text">
              Advanced energy reserves for fleet upgrades and special operations.
            </p>
            <div className="resource-delta-tag tag-purple">
              <ShieldCheck size={11} />
              <span>Hard Currency • High-Tier Modules</span>
            </div>
          </div>
        </div>

        {/* Card C: VELOOP Reward Coins */}
        <div className="treasury-card card-velop cyber-interactive-card">
          <div className="card-header-row">
            <div className="card-icon-container icon-box-magenta">
              <Award size={22} />
            </div>
            <span className="card-tag-pill">SIMULATED UTILITY</span>
          </div>
          <div className="card-content-body">
            <span className="resource-label-tag">VELOP REWARD COINS</span>
            <div className="resource-value-text text-magenta">
              {(balance.rewardCoins || 0).toFixed(2)} VEL
            </div>
            <p className="resource-desc-text">
              Simulated cross-game reward currency. Non-withdrawable in-game test tokens.
            </p>
            <div className="resource-delta-tag tag-magenta">
              <Activity size={11} />
              <span>Simulated Web3 Ledger Testnet</span>
            </div>
          </div>
        </div>

        {/* Card D: Pilot XP & Military Rank */}
        <div className="treasury-card card-xp cyber-interactive-card">
          <div className="card-header-row">
            <div className="card-icon-container icon-box-cyan">
              <Shield size={22} />
            </div>
            <span className="card-tag-pill" style={{ color: '#00E5FF', borderColor: 'rgba(0, 229, 255, 0.4)' }}>
              {balance.pilotRank?.toUpperCase()}
            </span>
          </div>
          <div className="card-content-body">
            <span className="resource-label-tag">PILOT EXPERIENCE & RANK</span>
            <div className="resource-value-text text-cyan">
              LVL {balance.level}
            </div>
            <div className="treasury-xp-bar-track" title={`${balance.xp} / ${balance.xpToNextLevel} XP`}>
              <div 
                className="treasury-xp-bar-fill"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <p className="resource-desc-text">
              {balance.xp} / {balance.xpToNextLevel} XP ({xpPercent}% to Level {balance.level + 1})
            </p>
            <div className="resource-delta-tag tag-cyan">
              <ChevronRight size={11} />
              <span>Next: {nextRankInfo.title}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. COMBAT EARNINGS OVERVIEW ================= */}
      <section className="treasury-overview-section" aria-label="Combat Earnings Overview">
        <div className="overview-header-row">
          <div className="overview-heading-group">
            <Activity size={16} color="#00E5FF" />
            <div>
              <h3 className="overview-heading-title">COMBAT EARNINGS OVERVIEW</h3>
              <span className="overview-heading-subtitle">
                Aggregated lifetime yield from hostile engagements and campaign sorties.
              </span>
            </div>
          </div>
        </div>

        <div className="treasury-overview-grid">
          <div className="overview-metric-card">
            <div className="overview-metric-icon-box" style={{ background: 'rgba(255, 194, 71, 0.12)', color: '#FFC247' }}>
              <Coins size={18} />
            </div>
            <div className="metric-meta">
              <span className="metric-label">TOTAL CREDITS EARNED</span>
              <span className="metric-value" style={{ color: '#FFC247' }}>
                +{(summary?.totalCreditsEarned || balance.credits || 0).toLocaleString()} CR
              </span>
            </div>
          </div>

          <div className="overview-metric-card">
            <div className="overview-metric-icon-box" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#C084FC' }}>
              <Zap size={18} />
            </div>
            <div className="metric-meta">
              <span className="metric-label">TOTAL CORES SECURED</span>
              <span className="metric-value" style={{ color: '#E9D5FF' }}>
                {balance.energyCores || 0} CORES
              </span>
            </div>
          </div>

          <div className="overview-metric-card">
            <div className="overview-metric-icon-box" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
              <ShieldCheck size={18} />
            </div>
            <div className="metric-meta">
              <span className="metric-label">VERIFIED TRANSACTIONS</span>
              <span className="metric-value" style={{ color: '#10B981' }}>
                {summary?.totalTransactions || ledger.length} AUDITED
              </span>
            </div>
          </div>

          <div className="overview-metric-card">
            <div className="overview-metric-icon-box" style={{ background: 'rgba(0, 229, 255, 0.12)', color: '#00E5FF' }}>
              <Crosshair size={18} />
            </div>
            <div className="metric-meta">
              <span className="metric-label">LATEST SORTIE REWARD</span>
              <span className="metric-value" style={{ color: '#00E5FF' }}>
                {latestMissionTx ? `+${latestMissionTx.amount} CR` : 'READY TO DEPLOY'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. SECURE TRANSACTION LEDGER ================= */}
      <section className="treasury-ledger-section" aria-label="Transaction Ledger">
        <div className="ledger-top-bar">
          <div className="ledger-heading-area">
            <h2 className="ledger-main-heading">SECURE TRANSACTION LEDGER</h2>
            <span className="ledger-main-subtitle">
              A transparent history of your pilot economy and reward activity.
            </span>
          </div>

          <div className="ledger-controls-row">
            <div className="ledger-filter-tabs">
              {[
                { id: 'ALL', label: 'ALL ACTIVITY' },
                { id: 'CREDITS', label: 'CREDITS' },
                { id: 'ENERGY_CORES', label: 'ENERGY CORES' },
                { id: 'REWARD_COINS', label: 'REWARD COINS' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundManager.playLaser();
                    setActiveFilter(tab.id);
                  }}
                  className={`ledger-tab-btn ${activeFilter === tab.id ? 'ledger-tab-active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="ledger-search-sort-group">
              <div className="ledger-search-box">
                <Search size={14} className="ledger-search-icon" />
                <input
                  type="text"
                  placeholder="Search reference or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ledger-search-input"
                />
              </div>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="ledger-sort-select"
                aria-label="Sort Transactions"
              >
                <option value="NEWEST">NEWEST FIRST</option>
                <option value="OLDEST">OLDEST FIRST</option>
                <option value="AMOUNT_DESC">HIGHEST AMOUNT</option>
              </select>
            </div>
          </div>
        </div>

        <div className="treasury-table-wrap">
          {loading ? (
            <div className="ledger-state-box">
              <RefreshCw size={28} className="sync-spinning" color="#00E5FF" />
              <h4 className="ledger-state-title">AUDITING CRYPTOGRAPHIC LEDGER...</h4>
              <p className="ledger-state-sub">Fetching verified double-entry transactions from command network.</p>
            </div>
          ) : processedTransactions.length === 0 ? (
            <div className="ledger-state-box">
              <Clock size={32} color="#7B8CAE" />
              <h4 className="ledger-state-title">NO TRANSACTIONS FOUND</h4>
              <p className="ledger-state-sub">
                {searchQuery 
                  ? 'No ledger records matched your search filter.' 
                  : 'Complete combat sorties or claim daily supply drops to generate ledger entries.'}
              </p>
            </div>
          ) : (
            <table className="treasury-table">
              <thead>
                <tr>
                  <th>TIMESTAMP</th>
                  <th>REFERENCE ID</th>
                  <th>SOURCE & TYPE</th>
                  <th>AMOUNT</th>
                  <th>BALANCE DELTA</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {processedTransactions.map((tx) => {
                  const isCredit = tx.transactionType === 'CREDIT';
                  const dateStr = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString([], {
                    month: 'short', day: '2-digit', year: 'numeric'
                  }) : 'N/A';
                  const timeStr = tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], {
                    hour: '2-digit', minute: '2-digit'
                  }) : '';
                  const shortRef = tx.referenceId ? `${tx.referenceId.slice(0, 16)}...` : 'N/A';
                  const isCopied = copiedRefId === tx.referenceId;

                  return (
                    <tr 
                      key={tx._id} 
                      onClick={() => setSelectedTx(tx)}
                      title="Click to view complete transaction telemetry"
                    >
                      <td className="td-time">
                        <div>{dateStr}</div>
                        <div style={{ fontSize: '0.62rem', color: '#5A6D96' }}>{timeStr}</div>
                      </td>

                      <td>
                        <div className="td-ref-box">
                          <code>{shortRef}</code>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(tx.referenceId, e)}
                            className="btn-copy-ref"
                            title={isCopied ? 'Copied to clipboard!' : 'Copy complete reference ID'}
                          >
                            {isCopied ? <Check size={11} color="#10B981" /> : <Copy size={11} />}
                          </button>
                        </div>
                      </td>

                      <td>
                        <div className="source-badge-wrap">
                          <span className={`tx-type-pill ${isCredit ? 'pill-credit' : 'pill-debit'}`}>
                            {isCredit ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                            {tx.transactionType} • {tx.source?.replace(/_/g, ' ')}
                          </span>
                          <span className="source-title-text" title={tx.description}>
                            {tx.description || tx.source}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className={`amount-text ${isCredit ? 'amount-positive' : 'amount-negative'}`}>
                          {isCredit ? '+' : '-'}{(tx.amount || 0).toLocaleString()} {tx.currencyType || 'CR'}
                        </span>
                      </td>

                      <td>
                        <div className="delta-wrap">
                          <span className="delta-before">{(tx.balanceBefore ?? 0).toLocaleString()}</span>
                          <span className="delta-arrow">→</span>
                          <span className="delta-after">{(tx.balanceAfter ?? 0).toLocaleString()}</span>
                        </div>
                      </td>

                      <td>
                        <span className="verified-pill">
                          <CheckCircle2 size={11} />
                          <span>VERIFIED</span>
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); setSelectedTx(tx); }}
                          className="btn-inspect-tx"
                        >
                          <Eye size={11} />
                          <span>INSPECT</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ================= 5. FINANCIAL SUMMARY FOOTER ================= */}
        <footer className="treasury-summary-footer" aria-label="Treasury Totals">
          <div className="summary-stat-box">
            <span className="summary-stat-label">AUDITED TRANSACTIONS</span>
            <span className="summary-stat-num">{filteredTotals.count} ENTRIES</span>
          </div>
          <div className="summary-stat-box">
            <span className="summary-stat-label">FILTERED CREDITS CREDITED</span>
            <span className="summary-stat-num" style={{ color: '#10B981' }}>
              +{filteredTotals.creditsCredited.toLocaleString()} CR
            </span>
          </div>
          <div className="summary-stat-box">
            <span className="summary-stat-label">FILTERED CREDITS DEBITED</span>
            <span className="summary-stat-num" style={{ color: filteredTotals.creditsDebited > 0 ? '#EF4444' : '#7B8CAE' }}>
              -{filteredTotals.creditsDebited.toLocaleString()} CR
            </span>
          </div>
          <div className="summary-stat-box">
            <span className="summary-stat-label">VERIFIED VAULT BALANCE</span>
            <span className="summary-stat-num" style={{ color: '#FFC247' }}>
              {(balance.credits || 0).toLocaleString()} CREDITS
            </span>
          </div>
        </footer>
      </section>

      {/* ================= 6. TRANSACTION DETAILS SIDE DRAWER ================= */}
      {selectedTx && (
        <div className="drawer-backdrop" onClick={() => setSelectedTx(null)}>
          <aside 
            className="drawer-panel" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Transaction Telemetry Audit"
          >
            <div className="drawer-header">
              <div>
                <span className="drawer-pretag">AUDIT LOG // TRANSACTION TELEMETRY</span>
                <h3 className="drawer-title">TRANSACTION DETAILS</h3>
              </div>
              <button 
                onClick={() => setSelectedTx(null)}
                className="drawer-close-btn"
                title="Close Drawer (ESC)"
              >
                <X size={16} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-amount-card">
                <div>
                  <div className="drawer-field-label">TOTAL TRANSACTION VALUE</div>
                  <div 
                    className="amount-text" 
                    style={{ 
                      fontSize: '1.45rem',
                      color: selectedTx.transactionType === 'CREDIT' ? '#10B981' : '#EF4444' 
                    }}
                  >
                    {selectedTx.transactionType === 'CREDIT' ? '+' : '-'}
                    {(selectedTx.amount || 0).toLocaleString()} {selectedTx.currencyType}
                  </div>
                </div>
                <span className={`tx-type-pill ${selectedTx.transactionType === 'CREDIT' ? 'pill-credit' : 'pill-debit'}`}>
                  {selectedTx.transactionType}
                </span>
              </div>

              <div className="drawer-field-item">
                <span className="drawer-field-label">IMMUTABLE REFERENCE ID</span>
                <div className="drawer-ref-box">
                  <code>{selectedTx.referenceId || 'N/A'}</code>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedTx.referenceId)}
                    className="btn-drawer-copy"
                    title="Copy full reference ID"
                  >
                    {copiedRefId === selectedTx.referenceId ? (
                      <>
                        <Check size={11} color="#10B981" />
                        <span>COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>COPY</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="drawer-fields-list">
                <div className="drawer-field-item">
                  <span className="drawer-field-label">TIMESTAMP</span>
                  <span className="drawer-field-val">
                    {selectedTx.createdAt ? new Date(selectedTx.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>

                <div className="drawer-field-item">
                  <span className="drawer-field-label">SOURCE CLASSIFICATION</span>
                  <span className="drawer-field-val" style={{ color: '#00E5FF', fontWeight: 'bold' }}>
                    {selectedTx.source?.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="drawer-field-item">
                  <span className="drawer-field-label">MEMO / DESCRIPTION</span>
                  <span className="drawer-field-val">
                    {selectedTx.description || 'Verified system automated entry'}
                  </span>
                </div>

                <div className="drawer-field-item">
                  <span className="drawer-field-label">BALANCE AUDIT TRAIL</span>
                  <div className="delta-wrap" style={{ marginTop: '4px' }}>
                    <span className="delta-before">Before: {(selectedTx.balanceBefore ?? 0).toLocaleString()}</span>
                    <span className="delta-arrow">→</span>
                    <span className="delta-after">After: {(selectedTx.balanceAfter ?? 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="drawer-field-item">
                  <span className="drawer-field-label">SERVER VERIFICATION</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span className="verified-pill">
                      <CheckCircle2 size={12} />
                      <span>{selectedTx.status || 'COMPLETED'}</span>
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#10B981', fontFamily: 'Inter, sans-serif' }}>
                      Double-entry cryptographic ledger balanced (HTTP 200)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ================= 7. SIMULATED REWARDED AD MODAL ================= */}
      {adModalOpen && (
        <div className="ad-modal-backdrop" onClick={adCountdown === 0 ? handleAbortAd : undefined}>
          <div 
            className="ad-modal-box" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Sponsor Broadcast"
          >
            <div className="ad-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="ad-sponsor-pill">
                  <Video size={13} /> {activeAdCampaign?.sponsor || 'VELOP SPONSORED TRANSMISSION'}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#FFC247', fontFamily: 'Orbitron, monospace' }}>
                  {activeAdCampaign?.badge || 'BROADCAST 1 OF 1'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`ad-timer-pill ${adCountdown > 0 ? 'ad-timer-active' : 'ad-timer-ready'}`}>
                  {adCountdown > 0 ? `REWARD IN: ${adCountdown}S` : '✓ REWARD READY'}
                </span>

                <button
                  onClick={handleAbortAd}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#AAA',
                    cursor: 'pointer'
                  }}
                  title="Close Ad (Reward will be forfeited)"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className="ad-video-container">
              <video
                key={activeAdCampaign?.videoSrc || 'ad-video'}
                src={activeAdCampaign?.videoSrc || '/videos/ad_commercial.mp4'}
                autoPlay
                playsInline
                muted={isAdAudioMuted}
                loop
                className="ad-video-element"
              />

              <div className="ad-video-overlay">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'auto' }}>
                  <span style={{
                    fontSize: '0.62rem',
                    padding: '2px 8px',
                    background: 'rgba(0, 0, 0, 0.75)',
                    border: '1px solid rgba(0, 229, 255, 0.4)',
                    borderRadius: '4px',
                    color: '#00E5FF',
                    fontFamily: 'Orbitron, monospace',
                    letterSpacing: '0.08em'
                  }}>
                    4K ULTRA HD TRANSMISSION
                  </span>
                  <button
                    onClick={() => setIsAdAudioMuted(!isAdAudioMuted)}
                    className="ad-sound-toggle-btn"
                    title={isAdAudioMuted ? 'Click to Unmute' : 'Click to Mute'}
                  >
                    {isAdAudioMuted ? <VolumeX size={15} color="#EF4444" /> : <Volume2 size={15} color="#10B981" />}
                  </button>
                </div>

                <div style={{ pointerEvents: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#FFF', fontFamily: 'Orbitron, monospace', letterSpacing: '0.04em' }}>
                      {activeAdCampaign?.title || 'CYBERNETIC FLEET EXPO'} // {activeAdCampaign?.tagline || 'SPECIAL PROMOTION'}
                    </span>
                    <span style={{ fontSize: '0.70rem', color: '#00E5FF', fontFamily: 'Orbitron, monospace' }}>
                      0:${(10 - adCountdown) < 10 ? '0' : ''}${Math.min(10, 10 - adCountdown)} / 0:10
                    </span>
                  </div>
                  <div className="ad-scrubber-track">
                    <div 
                      className="ad-scrubber-fill"
                      style={{ width: `${Math.min(100, ((10 - adCountdown) / 10) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {adCountdown > 0 && (
              <div style={{ fontSize: '0.72rem', color: '#7B8CAE', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
                ⚡ Anti-cheat telemetry: Watching the full 10-second sponsor broadcast is required to credit bounty.
              </div>
            )}

            <button
              onClick={handleClaimAdReward}
              disabled={adCountdown > 0 || adVerifying}
              className="ad-claim-action-btn"
            >
              {adVerifying ? (
                <>
                  <RefreshCw size={16} className="sync-spinning" />
                  <span>VERIFYING CRYPTOGRAPHIC PROOF...</span>
                </>
              ) : adCountdown > 0 ? (
                <span>WATCH TRANSMISSION TO UNLOCK ({adCountdown}S)</span>
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

export default WalletPage;
