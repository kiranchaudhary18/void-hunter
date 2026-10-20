import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import soundManager from '../game/managers/SoundManager.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  ArrowLeft, RefreshCw, AlertTriangle, TrendingUp, 
  Video, Award, Database, Activity, CheckCircle2,
  Sliders, Filter, Search, ChevronLeft, ChevronRight, Lock, Save,
  Clock
} from 'lucide-react';

export const AdminDashboardPage = ({ onBack }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, rewards, ledger, ads, config

  // Shared state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Tab 1: Overview
  const [overviewData, setOverviewData] = useState(null);

  // Tab 2: Reward Audit Log
  const [rewardLogs, setRewardLogs] = useState([]);
  const [rewardTotalCount, setRewardTotalCount] = useState(0);
  const [rewardTotalPages, setRewardTotalPages] = useState(1);
  const [rewardPage, setRewardPage] = useState(1);
  const [rewardFilters, setRewardFilters] = useState({
    search: '',
    rewardType: 'ALL',
    verificationStatus: 'ALL',
    source: 'ALL'
  });

  // Tab 3: Wallet Ledger
  const [ledgerLogs, setLedgerLogs] = useState([]);
  const [ledgerTotalCount, setLedgerTotalCount] = useState(0);
  const [ledgerTotalPages, setLedgerTotalPages] = useState(1);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerFilters, setLedgerFilters] = useState({
    search: '',
    transactionType: 'ALL',
    currencyType: 'ALL',
    source: 'ALL'
  });

  // Tab 4: Ad Opportunities
  const [adSessions, setAdSessions] = useState([]);
  const [adSummary, setAdSummary] = useState(null);
  const [adTotalCount, setAdTotalCount] = useState(0);
  const [adTotalPages, setAdTotalPages] = useState(1);
  const [adPage, setAdPage] = useState(1);
  const [adFilters, setAdFilters] = useState({
    search: '',
    placement: 'ALL',
    status: 'ALL',
    provider: 'ALL'
  });

  // Tab 5: Economy Configuration
  const [configForm, setConfigForm] = useState({
    maxDailyAds: 10,
    maxSessionAds: 5,
    minSecondsBetweenAds: 60,
    maxDailyRevives: 3,
    standardMissionCredits: 100,
    bossDefeatCredits: 250,
    dailyMissionCredits: 150,
    reviveEnabled: true,
    doubleScoreEnabled: true,
    doubleCreditsEnabled: true,
    extraShieldEnabled: true,
    reason: ''
  });
  const [configAuditLog, setConfigAuditLog] = useState([]);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Check Role
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  // Fetch Overview Data
  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/overview');
      if (res.data?.success) {
        setOverviewData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching admin overview');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Reward Audit Logs
  const fetchRewardLogs = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 15,
        ...rewardFilters
      };
      const res = await api.get('/admin/rewards', { params });
      if (res.data?.success) {
        setRewardLogs(res.data.transactions || []);
        setRewardTotalCount(res.data.totalCount || 0);
        setRewardTotalPages(res.data.totalPages || 1);
        setRewardPage(res.data.currentPage || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching reward audit logs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Wallet Ledger
  const fetchLedgerLogs = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 15,
        ...ledgerFilters
      };
      const res = await api.get('/admin/wallet-ledger', { params });
      if (res.data?.success) {
        setLedgerLogs(res.data.transactions || []);
        setLedgerTotalCount(res.data.totalCount || 0);
        setLedgerTotalPages(res.data.totalPages || 1);
        setLedgerPage(res.data.currentPage || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching wallet ledger');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Ad Opportunities
  const fetchAdOpportunities = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 15,
        ...adFilters
      };
      const res = await api.get('/admin/ad-opportunities', { params });
      if (res.data?.success) {
        setAdSessions(res.data.sessions || []);
        setAdSummary(res.data.summary || null);
        setAdTotalCount(res.data.totalCount || 0);
        setAdTotalPages(res.data.totalPages || 1);
        setAdPage(res.data.currentPage || 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching ad opportunities');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Economy Config
  const fetchEconomyConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/economy-config');
      if (res.data?.success && res.data.config) {
        const c = res.data.config;
        setConfigForm({
          maxDailyAds: c.maxDailyAds ?? 10,
          maxSessionAds: c.maxSessionAds ?? 5,
          minSecondsBetweenAds: c.minSecondsBetweenAds ?? 60,
          maxDailyRevives: c.maxDailyRevives ?? 3,
          standardMissionCredits: c.standardMissionCredits ?? 100,
          bossDefeatCredits: c.bossDefeatCredits ?? 250,
          dailyMissionCredits: c.dailyMissionCredits ?? 150,
          reviveEnabled: c.reviveEnabled ?? true,
          doubleScoreEnabled: c.doubleScoreEnabled ?? true,
          doubleCreditsEnabled: c.doubleCreditsEnabled ?? true,
          extraShieldEnabled: c.extraShieldEnabled ?? true,
          reason: ''
        });
        setConfigAuditLog(c.auditLog || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching economy configuration');
    } finally {
      setLoading(false);
    }
  };

  // Handle Economy Config Save
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setError(null);
    setSuccessMsg(null);
    soundManager.playLaser();
    try {
      const res = await api.put('/admin/economy-config', configForm);
      if (res.data?.success) {
        setSuccessMsg('Economy configuration safely updated and audited.');
        if (res.data.config) {
          setConfigAuditLog(res.data.config.auditLog || []);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating economy configuration');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Initial tab loading
  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'overview') fetchOverview();
    else if (activeTab === 'rewards') fetchRewardLogs(1);
    else if (activeTab === 'ledger') fetchLedgerLogs(1);
    else if (activeTab === 'ads') fetchAdOpportunities(1);
    else if (activeTab === 'config') fetchEconomyConfig();
  }, [activeTab, isAdmin]);

  const handleTabSwitch = (tab) => {
    soundManager.playLaser();
    setActiveTab(tab);
    setError(null);
    setSuccessMsg(null);
  };

  const handleRefresh = () => {
    soundManager.playLaser();
    if (activeTab === 'overview') fetchOverview();
    else if (activeTab === 'rewards') fetchRewardLogs(rewardPage);
    else if (activeTab === 'ledger') fetchLedgerLogs(ledgerPage);
    else if (activeTab === 'ads') fetchAdOpportunities(adPage);
    else if (activeTab === 'config') fetchEconomyConfig();
  };

  // Guard: Unauthorized Non-Admin Access Screen
  if (!isAdmin) {
    return (
      <div style={styles.accessDeniedContainer}>
        <div style={styles.accessDeniedCard} className="glass-panel">
          <Lock size={48} color="#EF4444" style={{ marginBottom: '16px' }} />
          <h2 className="font-heading" style={{ color: '#EF4444', fontSize: '1.6rem', marginBottom: '8px' }}>
            ACCESS DENIED • CLEARANCE 403
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '480px', marginBottom: '24px', textAlign: 'center' }}>
            This terminal requires administrator privileges. Your authenticated role ({user?.role || 'PLAYER'}) does not have permission to view sensitive economy ledgers or execute system configuration commands.
          </p>
          <button onClick={onBack} className="btn btn-outline" style={{ padding: '10px 24px' }}>
            <ArrowLeft size={16} /> RETURN TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Top Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={onBack} className="btn btn-outline" style={styles.backBtn}>
            <ArrowLeft size={16} /> BACK TO COMMAND
          </button>
          <div>
            <div style={styles.topBadge}>SECURITY LEVEL 5 • ADMINISTRATOR CLEARANCE</div>
            <h1 className="font-heading" style={styles.title}>VOID HUNTER ADMIN PANEL</h1>
            <p style={styles.subtitle}>Authoritative Economy Monitoring • Multi-Currency Ledger Audits • Anti-Cheat Diagnostics</p>
          </div>
        </div>

        <button onClick={handleRefresh} className="btn btn-cyan" disabled={loading} style={styles.refreshBtn}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> REFRESH DATA
        </button>
      </div>

      {/* Navigation Tab Bar */}
      <div style={styles.tabBar} className="glass-panel">
        <button
          onClick={() => handleTabSwitch('overview')}
          style={{ ...styles.tabBtn, ...(activeTab === 'overview' ? styles.tabBtnActive : {}) }}
        >
          <Activity size={16} /> OVERVIEW
        </button>
        <button
          onClick={() => handleTabSwitch('rewards')}
          style={{ ...styles.tabBtn, ...(activeTab === 'rewards' ? styles.tabBtnActive : {}) }}
        >
          <Award size={16} /> REWARD AUDIT LOG
        </button>
        <button
          onClick={() => handleTabSwitch('ledger')}
          style={{ ...styles.tabBtn, ...(activeTab === 'ledger' ? styles.tabBtnActive : {}) }}
        >
          <Database size={16} /> WALLET LEDGER
        </button>
        <button
          onClick={() => handleTabSwitch('ads')}
          style={{ ...styles.tabBtn, ...(activeTab === 'ads' ? styles.tabBtnActive : {}) }}
        >
          <Video size={16} /> AD OPPORTUNITIES
        </button>
        <button
          onClick={() => handleTabSwitch('config')}
          style={{ ...styles.tabBtn, ...(activeTab === 'config' ? styles.tabBtnActive : {}) }}
        >
          <Sliders size={16} /> ECONOMY CONFIG
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div style={styles.errorBanner} className="glass-panel">
          <AlertTriangle size={18} color="#EF4444" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div style={styles.successBanner} className="glass-panel">
          <CheckCircle2 size={18} color="var(--status-green)" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div style={styles.tabContent}>
          {loading && !overviewData ? (
            <div style={styles.loadingBox}>
              <RefreshCw size={32} color="var(--secondary-cyan)" className="animate-spin" />
              <p style={{ marginTop: '14px', color: 'var(--text-muted)' }}>Calculating live ledger metrics...</p>
            </div>
          ) : overviewData ? (
            <div style={styles.overviewGrid}>
              {/* Status Header Banner */}
              <div style={styles.statusCard} className="glass-panel">
                <div style={styles.statusLeft}>
                  <CheckCircle2 size={32} color="var(--status-green)" />
                  <div>
                    <div style={styles.statusLabel}>DOUBLE-ENTRY SYSTEM HEALTH</div>
                    <div className="font-heading" style={styles.statusVal}>OPTIMAL & VERIFIED</div>
                  </div>
                </div>
                <div style={styles.statusStats}>
                  <div style={styles.statusStatItem}>
                    <span style={styles.statLabel}>Enlisted Pilots</span>
                    <span style={styles.statVal}>{overviewData.overview?.totalPilots || 0}</span>
                  </div>
                  <div style={styles.statusStatItem}>
                    <span style={styles.statLabel}>Total Transactions</span>
                    <span style={styles.statVal}>{overviewData.overview?.totalTransactions || 0}</span>
                  </div>
                  <div style={styles.statusStatItem}>
                    <span style={styles.statLabel}>Flagged Cheat Sessions</span>
                    <span style={{ ...styles.statVal, color: overviewData.overview?.flaggedCheatSessions > 0 ? '#EF4444' : 'var(--status-green)' }}>
                      {overviewData.overview?.flaggedCheatSessions || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 75 Economy Metrics Grid */}
              <h2 className="font-heading" style={styles.sectionHeading}>
                <TrendingUp size={18} color="var(--secondary-cyan)" /> REWARDED AD ECONOMY METRICS (SECTION 75)
              </h2>
              <div style={styles.metricsRow}>
                <div style={styles.metricCard} className="glass-card">
                  <span style={styles.metricLabel}>Total Ad Opportunities</span>
                  <span className="font-heading" style={styles.metricNumber}>{overviewData.metrics?.totalAdOpportunities || 0}</span>
                  <span style={styles.metricHint}>Ad offers initiated across all sessions</span>
                </div>
                <div style={styles.metricCard} className="glass-card">
                  <span style={styles.metricLabel}>Completed Rewarded Ads</span>
                  <span className="font-heading" style={{ ...styles.metricNumber, color: 'var(--secondary-cyan)' }}>
                    {overviewData.metrics?.completedAds || 0}
                  </span>
                  <span style={styles.metricHint}>Verified video view events</span>
                </div>
                <div style={styles.metricCard} className="glass-card">
                  <span style={styles.metricLabel}>Failed / Expired Ads</span>
                  <span className="font-heading" style={{ ...styles.metricNumber, color: '#F59E0B' }}>
                    {overviewData.metrics?.failedAds || 0}
                  </span>
                  <span style={styles.metricHint}>Dropped or timed out sessions</span>
                </div>
                <div style={styles.metricCard} className="glass-card">
                  <span style={styles.metricLabel}>Rejected Reward Claims</span>
                  <span className="font-heading" style={{ ...styles.metricNumber, color: overviewData.metrics?.rejectedClaims > 0 ? '#EF4444' : 'var(--status-green)' }}>
                    {overviewData.metrics?.rejectedClaims || 0}
                  </span>
                  <span style={styles.metricHint}>Anti-fraud / unverified denials</span>
                </div>
              </div>

              {/* Conversion Rates Row */}
              <div style={styles.metricsRow}>
                <div style={styles.metricCard} className="glass-card">
                  <span style={styles.metricLabel}>Ad Completion Rate</span>
                  <span className="font-heading" style={{ ...styles.metricNumber, color: 'var(--secondary-cyan)' }}>
                    {overviewData.metrics?.adCompletionRate || '0%'}
                  </span>
                  <span style={styles.metricHint}>Completed vs Offered opportunities</span>
                </div>
                <div style={styles.metricCard} className="glass-card">
                  <span style={styles.metricLabel}>Revive Conversion Rate</span>
                  <span className="font-heading" style={{ ...styles.metricNumber, color: '#A855F7' }}>
                    {overviewData.metrics?.reviveConversionRate || '0%'}
                  </span>
                  <span style={styles.metricHint}>Granted combat revives</span>
                </div>
                <div style={styles.metricCard} className="glass-card">
                  <span style={styles.metricLabel}>Double-Score Conversion</span>
                  <span className="font-heading" style={{ ...styles.metricNumber, color: '#3B82F6' }}>
                    {overviewData.metrics?.doubleScoreConversionRate || '0%'}
                  </span>
                  <span style={styles.metricHint}>Mission score multipliers</span>
                </div>
                <div style={styles.metricCard} className="glass-card">
                  <span style={styles.metricLabel}>Double-Credits Conversion</span>
                  <span className="font-heading" style={{ ...styles.metricNumber, color: 'var(--currency-gold)' }}>
                    {overviewData.metrics?.doubleCreditsConversionRate || '0%'}
                  </span>
                  <span style={styles.metricHint}>Post-mission credits 2x claims</span>
                </div>
              </div>

              {/* Credits Minted vs Spent Conservation (Section 36 & 74) */}
              <h2 className="font-heading" style={styles.sectionHeading}>
                <Database size={18} color="var(--currency-gold)" /> CURRENCY CONSERVATION & LEDGER TOTALS
              </h2>
              <div style={styles.twoColumnGrid}>
                <div style={styles.panelCard} className="glass-panel">
                  <h3 className="font-heading" style={styles.panelTitle}>CREDITS LEDGER CONSERVATION</h3>
                  <div style={styles.ledgerRow}>
                    <span>Total Credits Minted (Granted):</span>
                    <b style={{ color: 'var(--status-green)' }}>+{overviewData.metrics?.totalCreditsGranted?.toLocaleString() || 0}</b>
                  </div>
                  <div style={styles.ledgerRow}>
                    <span>Total Credits Sunk (Spent on Ships/Upgrades):</span>
                    <b style={{ color: '#EF4444' }}>-{overviewData.metrics?.totalCreditsSpent?.toLocaleString() || 0}</b>
                  </div>
                  <div style={styles.ledgerDivider} />
                  <div style={styles.ledgerRow}>
                    <span>Net Currency in Circulation:</span>
                    <b style={{ color: 'var(--currency-gold)' }}>
                      {(overviewData.metrics?.totalCreditsGranted - overviewData.metrics?.totalCreditsSpent)?.toLocaleString() || 0}
                    </b>
                  </div>
                  <div style={styles.ledgerRow}>
                    <span>Average Reward per Enlisted User:</span>
                    <b style={{ color: 'var(--secondary-cyan)' }}>
                      {overviewData.metrics?.averageRewardPerUser?.toLocaleString() || 0} Credits
                    </b>
                  </div>
                </div>

                <div style={styles.panelCard} className="glass-panel">
                  <h3 className="font-heading" style={styles.panelTitle}>CURRENT CURRENCY RESERVES</h3>
                  <div style={styles.ledgerRow}>
                    <span>Credits (In Player Wallets):</span>
                    <b style={{ color: 'var(--currency-gold)' }}>{overviewData.circulation?.credits?.toLocaleString() || 0}</b>
                  </div>
                  <div style={styles.ledgerRow}>
                    <span>Energy Cores (Gems):</span>
                    <b style={{ color: '#C084FC' }}>{overviewData.circulation?.energyCores?.toLocaleString() || 0}</b>
                  </div>
                  <div style={styles.ledgerRow}>
                    <span>VELoop Reward Coins:</span>
                    <b style={{ color: 'var(--secondary-cyan)' }}>{overviewData.circulation?.velopRewardCoins?.toLocaleString() || 0}</b>
                  </div>
                  <div style={styles.ledgerDivider} />
                  <div style={styles.ledgerRow}>
                    <span>Total Missions Completed:</span>
                    <b>{overviewData.overview?.totalGameSessions || 0}</b>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ================= TAB 2: REWARD AUDIT LOG ================= */}
      {activeTab === 'rewards' && (
        <div style={styles.tabContent}>
          {/* Filter Bar */}
          <div style={styles.filterBar} className="glass-panel">
            <div style={styles.searchBox}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search event ID, session ID, user..."
                value={rewardFilters.search}
                onChange={(e) => setRewardFilters({ ...rewardFilters, search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && fetchRewardLogs(1)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Type:</label>
              <select
                value={rewardFilters.rewardType}
                onChange={(e) => setRewardFilters({ ...rewardFilters, rewardType: e.target.value })}
                style={styles.selectInput}
              >
                <option value="ALL">ALL TYPES</option>
                <option value="CREDITS">CREDITS</option>
                <option value="ENERGY_CORES">ENERGY CORES</option>
                <option value="VEL_COINS">VEL COINS</option>
                <option value="REVIVE">REVIVE</option>
                <option value="MULTIPLIER">MULTIPLIER</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Status:</label>
              <select
                value={rewardFilters.verificationStatus}
                onChange={(e) => setRewardFilters({ ...rewardFilters, verificationStatus: e.target.value })}
                style={styles.selectInput}
              >
                <option value="ALL">ALL STATUSES</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="PENDING">PENDING</option>
                <option value="REJECTED">REJECTED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>

            <button onClick={() => fetchRewardLogs(1)} className="btn btn-outline" style={styles.filterBtn}>
              <Filter size={14} /> FILTER
            </button>
          </div>

          {/* Table */}
          <div style={styles.tableContainer} className="glass-panel">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>TIMESTAMP</th>
                  <th style={styles.th}>PILOT</th>
                  <th style={styles.th}>REWARD TYPE</th>
                  <th style={styles.th}>SOURCE</th>
                  <th style={styles.th}>AMOUNT</th>
                  <th style={styles.th}>STATUS</th>
                  <th style={styles.th}>PROVIDER / REF</th>
                  <th style={styles.th}>SESSION / MISSION</th>
                </tr>
              </thead>
              <tbody>
                {rewardLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={styles.emptyTd}>
                      No reward audit transactions recorded matching criteria.
                    </td>
                  </tr>
                ) : (
                  rewardLogs.map((tx) => (
                    <tr key={tx._id} style={styles.tr}>
                      <td style={styles.tdTime}>{new Date(tx.createdAt).toLocaleString()}</td>
                      <td style={styles.td}>
                        <div style={styles.pilotName}>{tx.user?.name || 'Unknown Pilot'}</div>
                        <div style={styles.pilotEmail}>{tx.user?.email || 'N/A'}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.typeBadge}>{tx.rewardType}</span>
                      </td>
                      <td style={styles.td}>{tx.source}</td>
                      <td style={{ ...styles.td, fontWeight: '700', color: 'var(--currency-gold)' }}>
                        {tx.grantedAmount > 0 ? `+${tx.grantedAmount}` : tx.requestedAmount || 0}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: tx.verificationStatus === 'VERIFIED' ? 'rgba(16, 185, 129, 0.2)' :
                                      tx.verificationStatus === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: tx.verificationStatus === 'VERIFIED' ? 'var(--status-green)' :
                                 tx.verificationStatus === 'REJECTED' ? '#EF4444' : '#F59E0B'
                        }}>
                          {tx.verificationStatus}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontSize: '0.78rem' }}>{tx.adProvider || 'INTERNAL'}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{tx.adEventId || tx.referenceId || 'N/A'}</div>
                      </td>
                      <td style={styles.td}>
                        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{tx.sessionId ? tx.sessionId.slice(0, 16) + '...' : tx.missionId || 'N/A'}</div>
                        {tx.rejectionReason && (
                          <div style={{ fontSize: '0.7rem', color: '#EF4444' }}>Reason: {tx.rejectionReason}</div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={styles.paginationBar}>
            <span style={styles.pageInfo}>
              Showing page {rewardPage} of {rewardTotalPages} ({rewardTotalCount} total transactions)
            </span>
            <div style={styles.paginationBtns}>
              <button
                disabled={rewardPage <= 1}
                onClick={() => fetchRewardLogs(rewardPage - 1)}
                className="btn btn-outline"
                style={styles.pageBtn}
              >
                <ChevronLeft size={16} /> PREV
              </button>
              <button
                disabled={rewardPage >= rewardTotalPages}
                onClick={() => fetchRewardLogs(rewardPage + 1)}
                className="btn btn-outline"
                style={styles.pageBtn}
              >
                NEXT <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: WALLET LEDGER ================= */}
      {activeTab === 'ledger' && (
        <div style={styles.tabContent}>
          {/* Filter Bar */}
          <div style={styles.filterBar} className="glass-panel">
            <div style={styles.searchBox}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search reference ID, user, description..."
                value={ledgerFilters.search}
                onChange={(e) => setLedgerFilters({ ...ledgerFilters, search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && fetchLedgerLogs(1)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Type:</label>
              <select
                value={ledgerFilters.transactionType}
                onChange={(e) => setLedgerFilters({ ...ledgerFilters, transactionType: e.target.value })}
                style={styles.selectInput}
              >
                <option value="ALL">ALL (CREDIT/DEBIT)</option>
                <option value="CREDIT">CREDIT (+)</option>
                <option value="DEBIT">DEBIT (-)</option>
                <option value="REVERSAL">REVERSAL</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Currency:</label>
              <select
                value={ledgerFilters.currencyType}
                onChange={(e) => setLedgerFilters({ ...ledgerFilters, currencyType: e.target.value })}
                style={styles.selectInput}
              >
                <option value="ALL">ALL CURRENCIES</option>
                <option value="CREDITS">CREDITS</option>
                <option value="ENERGY_CORES">ENERGY CORES</option>
                <option value="VEL_REWARD_COINS">VEL COINS</option>
              </select>
            </div>

            <button onClick={() => fetchLedgerLogs(1)} className="btn btn-outline" style={styles.filterBtn}>
              <Filter size={14} /> FILTER
            </button>
          </div>

          {/* Table */}
          <div style={styles.tableContainer} className="glass-panel">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>TIMESTAMP</th>
                  <th style={styles.th}>PILOT</th>
                  <th style={styles.th}>TYPE</th>
                  <th style={styles.th}>CURRENCY</th>
                  <th style={styles.th}>AMOUNT</th>
                  <th style={styles.th}>BEFORE / AFTER</th>
                  <th style={styles.th}>SOURCE</th>
                  <th style={styles.th}>REFERENCE / DETAILS</th>
                </tr>
              </thead>
              <tbody>
                {ledgerLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={styles.emptyTd}>
                      No wallet transactions recorded matching criteria.
                    </td>
                  </tr>
                ) : (
                  ledgerLogs.map((tx) => (
                    <tr key={tx._id} style={styles.tr}>
                      <td style={styles.tdTime}>{new Date(tx.createdAt).toLocaleString()}</td>
                      <td style={styles.td}>
                        <div style={styles.pilotName}>{tx.user?.name || 'Unknown Pilot'}</div>
                        <div style={styles.pilotEmail}>{tx.user?.email || 'N/A'}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: tx.transactionType === 'CREDIT' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: tx.transactionType === 'CREDIT' ? 'var(--status-green)' : '#EF4444'
                        }}>
                          {tx.transactionType}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.typeBadge}>{tx.currencyType}</span>
                      </td>
                      <td style={{
                        ...styles.td,
                        fontWeight: '700',
                        color: tx.transactionType === 'CREDIT' ? 'var(--status-green)' : '#EF4444'
                      }}>
                        {tx.transactionType === 'CREDIT' ? `+${tx.amount}` : `-${tx.amount}`}
                      </td>
                      <td style={styles.td}>
                        <span style={{ color: 'var(--text-muted)' }}>{tx.balanceBefore?.toLocaleString()}</span>
                        {' → '}
                        <b style={{ color: 'var(--text-light)' }}>{tx.balanceAfter?.toLocaleString()}</b>
                      </td>
                      <td style={styles.td}>{tx.source}</td>
                      <td style={styles.td}>
                        <div style={{ fontSize: '0.78rem' }}>{tx.description || 'Transaction'}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          Ref: {tx.referenceId ? tx.referenceId.slice(0, 16) + '...' : 'N/A'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={styles.paginationBar}>
            <span style={styles.pageInfo}>
              Showing page {ledgerPage} of {ledgerTotalPages} ({ledgerTotalCount} total transactions)
            </span>
            <div style={styles.paginationBtns}>
              <button
                disabled={ledgerPage <= 1}
                onClick={() => fetchLedgerLogs(ledgerPage - 1)}
                className="btn btn-outline"
                style={styles.pageBtn}
              >
                <ChevronLeft size={16} /> PREV
              </button>
              <button
                disabled={ledgerPage >= ledgerTotalPages}
                onClick={() => fetchLedgerLogs(ledgerPage + 1)}
                className="btn btn-outline"
                style={styles.pageBtn}
              >
                NEXT <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: AD OPPORTUNITIES ================= */}
      {activeTab === 'ads' && (
        <div style={styles.tabContent}>
          {/* Ad Summary Bar */}
          {adSummary && (
            <div style={styles.metricsRow}>
              <div style={styles.metricCard} className="glass-card">
                <span style={styles.metricLabel}>Opportunities Created</span>
                <span className="font-heading" style={styles.metricNumber}>{adSummary.totalCreated || 0}</span>
                <span style={styles.metricHint}>Ad offers generated</span>
              </div>
              <div style={styles.metricCard} className="glass-card">
                <span style={styles.metricLabel}>Granted & Verified</span>
                <span className="font-heading" style={{ ...styles.metricNumber, color: 'var(--status-green)' }}>
                  {adSummary.totalGranted || 0}
                </span>
                <span style={styles.metricHint}>Rewards successfully issued</span>
              </div>
              <div style={styles.metricCard} className="glass-card">
                <span style={styles.metricLabel}>Rejected Claims</span>
                <span className="font-heading" style={{ ...styles.metricNumber, color: adSummary.totalRejected > 0 ? '#EF4444' : 'var(--status-green)' }}>
                  {adSummary.totalRejected || 0}
                </span>
                <span style={styles.metricHint}>Denied or fraudulent claims</span>
              </div>
              <div style={styles.metricCard} className="glass-card">
                <span style={styles.metricLabel}>Simulated Sessions</span>
                <span className="font-heading" style={{ ...styles.metricNumber, color: '#F59E0B' }}>
                  {adSummary.activeSimulatedCount || 0}
                </span>
                <span style={styles.metricHint}>Development adapter mock ads</span>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div style={styles.filterBar} className="glass-panel">
            <div style={styles.searchBox}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                placeholder="Search ad ID, game session ID, user..."
                value={adFilters.search}
                onChange={(e) => setAdFilters({ ...adFilters, search: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && fetchAdOpportunities(1)}
                style={styles.searchInput}
              />
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Placement:</label>
              <select
                value={adFilters.placement}
                onChange={(e) => setAdFilters({ ...adFilters, placement: e.target.value })}
                style={styles.selectInput}
              >
                <option value="ALL">ALL PLACEMENTS</option>
                <option value="REVIVE">REVIVE</option>
                <option value="DOUBLE_SCORE">DOUBLE SCORE</option>
                <option value="DOUBLE_CREDITS">DOUBLE CREDITS</option>
                <option value="SUPPLY_DROP">SUPPLY DROP</option>
                <option value="EXTRA_SHIELD">EXTRA SHIELD</option>
              </select>
            </div>

            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Status:</label>
              <select
                value={adFilters.status}
                onChange={(e) => setAdFilters({ ...adFilters, status: e.target.value })}
                style={styles.selectInput}
              >
                <option value="ALL">ALL STATUSES</option>
                <option value="INITIATED">INITIATED</option>
                <option value="AD_STARTED">AD STARTED</option>
                <option value="VIDEO_COMPLETED">VIDEO COMPLETED</option>
                <option value="VERIFIED">VERIFIED</option>
                <option value="GRANTED">GRANTED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="EXPIRED">EXPIRED</option>
              </select>
            </div>

            <button onClick={() => fetchAdOpportunities(1)} className="btn btn-outline" style={styles.filterBtn}>
              <Filter size={14} /> FILTER
            </button>
          </div>

          {/* Table */}
          <div style={styles.tableContainer} className="glass-panel">
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>AD SESSION ID</th>
                  <th style={styles.th}>PILOT</th>
                  <th style={styles.th}>PLACEMENT</th>
                  <th style={styles.th}>PROVIDER</th>
                  <th style={styles.th}>STATUS</th>
                  <th style={styles.th}>REWARD VALUE</th>
                  <th style={styles.th}>CREATED AT</th>
                  <th style={styles.th}>EXPIRES AT</th>
                </tr>
              </thead>
              <tbody>
                {adSessions.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={styles.emptyTd}>
                      No ad opportunities recorded matching criteria.
                    </td>
                  </tr>
                ) : (
                  adSessions.map((s) => (
                    <tr key={s._id} style={styles.tr}>
                      <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        {s.adId || s._id}
                      </td>
                      <td style={styles.td}>
                        <div style={styles.pilotName}>{s.user?.name || 'Unknown Pilot'}</div>
                        <div style={styles.pilotEmail}>{s.user?.email || 'N/A'}</div>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.typeBadge}>{s.placement}</span>
                      </td>
                      <td style={styles.td}>
                        {s.isSimulated ? (
                          <span style={{ ...styles.badge, background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B' }}>
                            SIMULATED DEV
                          </span>
                        ) : (
                          <span style={{ ...styles.badge, background: 'rgba(0, 229, 255, 0.2)', color: 'var(--secondary-cyan)' }}>
                            {s.provider || 'LIVE PROVIDER'}
                          </span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          background: s.status === 'GRANTED' ? 'rgba(16, 185, 129, 0.2)' :
                                      s.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                          color: s.status === 'GRANTED' ? 'var(--status-green)' :
                                 s.status === 'REJECTED' ? '#EF4444' : '#60A5FA'
                        }}>
                          {s.status}
                        </span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: '700', color: 'var(--currency-gold)' }}>
                        {s.rewardResult?.value ? `+${s.rewardResult.value} ${s.rewardResult.type}` : 'PENDING'}
                      </td>
                      <td style={styles.tdTime}>{new Date(s.createdAt).toLocaleTimeString()}</td>
                      <td style={styles.tdTime}>{s.expiresAt ? new Date(s.expiresAt).toLocaleTimeString() : 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={styles.paginationBar}>
            <span style={styles.pageInfo}>
              Showing page {adPage} of {adTotalPages} ({adTotalCount} total sessions)
            </span>
            <div style={styles.paginationBtns}>
              <button
                disabled={adPage <= 1}
                onClick={() => fetchAdOpportunities(adPage - 1)}
                className="btn btn-outline"
                style={styles.pageBtn}
              >
                <ChevronLeft size={16} /> PREV
              </button>
              <button
                disabled={adPage >= adTotalPages}
                onClick={() => fetchAdOpportunities(adPage + 1)}
                className="btn btn-outline"
                style={styles.pageBtn}
              >
                NEXT <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: ECONOMY CONFIG ================= */}
      {activeTab === 'config' && (
        <div style={styles.tabContent}>
          <div style={styles.twoColumnGrid}>
            {/* Configuration Form */}
            <div style={styles.panelCard} className="glass-panel">
              <div style={styles.panelHeaderRow}>
                <Sliders size={20} color="var(--secondary-cyan)" />
                <h3 className="font-heading" style={styles.panelTitle}>
                  SERVER-CONTROLLED ECONOMY LIMITS (SECTION 35)
                </h3>
              </div>
              <p style={styles.configNotice}>
                Adjustments are strictly validated on the backend, logged with administrator identity in an immutable audit ledger, and enforced server-side.
              </p>

              <form onSubmit={handleSaveConfig} style={styles.configForm}>
                <div style={styles.formSectionTitle}>REWARDED AD RATE LIMITS</div>
                <div style={styles.formRow}>
                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Max Daily Ads Cap (1-100)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={configForm.maxDailyAds}
                      onChange={(e) => setConfigForm({ ...configForm, maxDailyAds: Number(e.target.value) })}
                      style={styles.numberInput}
                    />
                  </div>
                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Max Session Ads (1-50)</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={configForm.maxSessionAds}
                      onChange={(e) => setConfigForm({ ...configForm, maxSessionAds: Number(e.target.value) })}
                      style={styles.numberInput}
                    />
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Ad Cooldown (Seconds, 5-3600)</label>
                    <input
                      type="number"
                      min="5"
                      max="3600"
                      value={configForm.minSecondsBetweenAds}
                      onChange={(e) => setConfigForm({ ...configForm, minSecondsBetweenAds: Number(e.target.value) })}
                      style={styles.numberInput}
                    />
                  </div>
                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Max Daily Revives (1-20)</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={configForm.maxDailyRevives}
                      onChange={(e) => setConfigForm({ ...configForm, maxDailyRevives: Number(e.target.value) })}
                      style={styles.numberInput}
                    />
                  </div>
                </div>

                <div style={styles.formSectionTitle}>MISSION REWARD PAYOUTS (CREDITS)</div>
                <div style={styles.formRow}>
                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Standard Mission Credits (10-5000)</label>
                    <input
                      type="number"
                      min="10"
                      max="5000"
                      value={configForm.standardMissionCredits}
                      onChange={(e) => setConfigForm({ ...configForm, standardMissionCredits: Number(e.target.value) })}
                      style={styles.numberInput}
                    />
                  </div>
                  <div style={styles.formField}>
                    <label style={styles.formLabel}>Boss Defeat Bounty (50-20000)</label>
                    <input
                      type="number"
                      min="50"
                      max="20000"
                      value={configForm.bossDefeatCredits}
                      onChange={(e) => setConfigForm({ ...configForm, bossDefeatCredits: Number(e.target.value) })}
                      style={styles.numberInput}
                    />
                  </div>
                </div>

                <div style={styles.formSectionTitle}>FEATURE TOGGLES</div>
                <div style={styles.togglesGrid}>
                  <label style={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={configForm.reviveEnabled}
                      onChange={(e) => setConfigForm({ ...configForm, reviveEnabled: e.target.checked })}
                      style={styles.checkbox}
                    />
                    Revives Enabled
                  </label>
                  <label style={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={configForm.doubleCreditsEnabled}
                      onChange={(e) => setConfigForm({ ...configForm, doubleCreditsEnabled: e.target.checked })}
                      style={styles.checkbox}
                    />
                    Double Credits Enabled
                  </label>
                  <label style={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={configForm.doubleScoreEnabled}
                      onChange={(e) => setConfigForm({ ...configForm, doubleScoreEnabled: e.target.checked })}
                      style={styles.checkbox}
                    />
                    Double Score Enabled
                  </label>
                  <label style={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={configForm.extraShieldEnabled}
                      onChange={(e) => setConfigForm({ ...configForm, extraShieldEnabled: e.target.checked })}
                      style={styles.checkbox}
                    />
                    Extra Shield Enabled
                  </label>
                </div>

                <div style={styles.formField}>
                  <label style={styles.formLabel}>Administrative Reason (Mandatory Audit Note):</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Economic balance patch v1.4"
                    value={configForm.reason}
                    onChange={(e) => setConfigForm({ ...configForm, reason: e.target.value })}
                    style={styles.textInput}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingConfig}
                  className="btn btn-cyan"
                  style={styles.saveBtn}
                >
                  <Save size={16} /> {isSavingConfig ? 'VALIDATING & AUDITING...' : 'SAVE ECONOMY CONFIGURATION'}
                </button>
              </form>
            </div>

            {/* Audit Trail of Previous Changes */}
            <div style={styles.panelCard} className="glass-panel">
              <div style={styles.panelHeaderRow}>
                <Clock size={20} color="var(--currency-gold)" />
                <h3 className="font-heading" style={styles.panelTitle}>
                  IMMUTABLE CONFIGURATION AUDIT TRAIL
                </h3>
              </div>
              <p style={styles.configNotice}>
                Chronological ledger of all administrative modifications to economy limits.
              </p>

              <div style={styles.auditLogList}>
                {configAuditLog.length === 0 ? (
                  <div style={styles.emptyTd}>No administrative modifications recorded yet.</div>
                ) : (
                  [...configAuditLog].reverse().map((entry, idx) => (
                    <div key={idx} style={styles.auditEntryCard} className="glass-card">
                      <div style={styles.auditEntryHeader}>
                        <span style={styles.auditAdminName}>{entry.changedByName || 'Administrator'}</span>
                        <span style={styles.auditTime}>{new Date(entry.changedAt).toLocaleString()}</span>
                      </div>
                      <div style={styles.auditReason}>
                        <b>Reason:</b> {entry.reason || 'Manual economy adjustment'}
                      </div>
                      <div style={styles.auditFields}>
                        <b>Modifications:</b>
                        <pre style={styles.auditJson}>
                          {JSON.stringify(entry.changedFields, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    padding: 'clamp(14px, 3vw, 30px) clamp(10px, 3vw, 36px) 84px', boxSizing: 'border-box',
    background: 'radial-gradient(circle at 50% 10%, #0d153a 0%, #060919 90%)',
    color: '#E6F1FF'
  },
  accessDeniedContainer: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
  },
  accessDeniedCard: {
    padding: '48px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    boxShadow: '0 0 40px rgba(239, 68, 68, 0.2)',
    maxWidth: '540px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  topBadge: {
    fontSize: '0.68rem',
    letterSpacing: '0.12em',
    color: 'var(--secondary-cyan)',
    fontFamily: 'var(--font-heading)',
    marginBottom: '2px'
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px'
  },
  refreshBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px'
  },
  title: {
    fontSize: '1.8rem',
    color: 'var(--secondary-cyan)',
    letterSpacing: '0.06em',
    marginBottom: '4px'
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
  },
  tabBar: {
    display: 'flex',
    gap: '6px',
    padding: '6px 10px',
    marginBottom: '24px',
    borderRadius: '10px',
    border: '1px solid rgba(0, 229, 255, 0.15)', overflowX: 'auto', WebkitOverflowScrolling: 'touch'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.82rem',
    letterSpacing: '0.06em',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  tabBtnActive: {
    background: 'rgba(0, 229, 255, 0.15)',
    color: 'var(--secondary-cyan)',
    fontWeight: '700',
    boxShadow: 'inset 0 0 10px rgba(0, 229, 255, 0.2)'
  },
  errorBanner: {
    padding: '12px 20px',
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #EF4444',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#EF4444',
    marginBottom: '20px',
    fontSize: '0.88rem'
  },
  successBanner: {
    padding: '12px 20px',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid var(--status-green)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: 'var(--status-green)',
    marginBottom: '20px',
    fontSize: '0.88rem'
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '300px'
  },
  overviewGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  statusCard: {
    padding: '24px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid rgba(16, 185, 129, 0.4)',
    boxShadow: '0 0 35px rgba(16, 185, 129, 0.15)'
  },
  statusLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  statusLabel: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em'
  },
  statusVal: {
    fontSize: '1.5rem',
    color: 'var(--status-green)',
    letterSpacing: '0.06em'
  },
  statusStats: {
    display: 'flex',
    gap: '32px'
  },
  statusStatItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px'
  },
  statLabel: {
    fontSize: '0.76rem',
    color: 'var(--text-muted)'
  },
  statVal: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.25rem',
    fontWeight: '700'
  },
  sectionHeading: {
    fontSize: '1.1rem',
    letterSpacing: '0.08em',
    color: 'var(--text-light)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px'
  },
  metricCard: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  metricLabel: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em'
  },
  metricNumber: {
    fontSize: '1.8rem',
    color: 'var(--text-light)',
    letterSpacing: '0.04em'
  },
  metricHint: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)'
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  panelCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  panelHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  panelTitle: {
    fontSize: '1rem',
    color: 'var(--text-light)',
    letterSpacing: '0.06em'
  },
  ledgerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.88rem',
    color: 'var(--text-light)'
  },
  ledgerDivider: {
    height: '1px',
    background: 'var(--border-glass)',
    margin: '4px 0'
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '14px 20px',
    flexWrap: 'wrap'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '8px 12px',
    flex: '1 1 240px'
  },
  searchInput: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-light)',
    fontSize: '0.85rem',
    width: '100%',
    outline: 'none'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  filterLabel: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)'
  },
  selectInput: {
    background: 'rgba(10, 16, 42, 0.8)',
    border: '1px solid rgba(0, 229, 255, 0.2)',
    color: 'var(--text-light)',
    fontSize: '0.8rem',
    padding: '6px 10px',
    borderRadius: '6px',
    outline: 'none'
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    fontSize: '0.8rem'
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '8px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    padding: '12px 16px',
    fontSize: '0.72rem',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    fontFamily: 'var(--font-heading)'
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    transition: 'background 0.15s ease'
  },
  td: {
    padding: '14px 16px',
    fontSize: '0.85rem'
  },
  tdTime: {
    padding: '14px 16px',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap'
  },
  pilotName: {
    fontWeight: '600',
    color: 'var(--text-light)'
  },
  pilotEmail: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)'
  },
  typeBadge: {
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    fontFamily: 'monospace'
  },
  badge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.72rem',
    fontWeight: '700',
    letterSpacing: '0.04em'
  },
  emptyTd: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.9rem'
  },
  paginationBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 6px'
  },
  pageInfo: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
  },
  paginationBtns: {
    display: 'flex',
    gap: '8px'
  },
  pageBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    fontSize: '0.78rem'
  },
  configNotice: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4'
  },
  configForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formSectionTitle: {
    fontSize: '0.75rem',
    fontFamily: 'var(--font-heading)',
    letterSpacing: '0.08em',
    color: 'var(--secondary-cyan)',
    borderBottom: '1px solid rgba(0, 229, 255, 0.2)',
    paddingBottom: '4px',
    marginTop: '6px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px'
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  formLabel: {
    fontSize: '0.76rem',
    color: 'var(--text-muted)'
  },
  numberInput: {
    background: 'rgba(10, 16, 42, 0.8)',
    border: '1px solid rgba(0, 229, 255, 0.2)',
    color: 'var(--text-light)',
    fontSize: '0.9rem',
    padding: '8px 12px',
    borderRadius: '6px',
    outline: 'none'
  },
  textInput: {
    background: 'rgba(10, 16, 42, 0.8)',
    border: '1px solid rgba(0, 229, 255, 0.2)',
    color: 'var(--text-light)',
    fontSize: '0.88rem',
    padding: '10px 14px',
    borderRadius: '6px',
    outline: 'none'
  },
  togglesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    background: 'rgba(0, 0, 0, 0.2)',
    padding: '12px',
    borderRadius: '6px'
  },
  toggleLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.82rem',
    color: 'var(--text-light)',
    cursor: 'pointer'
  },
  checkbox: {
    accentColor: 'var(--secondary-cyan)',
    cursor: 'pointer'
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 20px',
    marginTop: '8px',
    fontSize: '0.88rem'
  },
  auditLogList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '480px',
    overflowY: 'auto'
  },
  auditEntryCard: {
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  auditEntryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  auditAdminName: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--secondary-cyan)'
  },
  auditTime: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)'
  },
  auditReason: {
    fontSize: '0.78rem',
    color: 'var(--text-light)'
  },
  auditFields: {
    fontSize: '0.74rem',
    color: 'var(--text-muted)'
  },
  auditJson: {
    background: 'rgba(0, 0, 0, 0.4)',
    padding: '6px 10px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    color: 'var(--currency-gold)',
    overflowX: 'auto',
    margin: '4px 0 0 0'
  }
};

export default AdminDashboardPage;
