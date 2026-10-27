import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, Award, Clock, Zap, Coins, 
  CheckCircle2, Lock, Calendar, Gift, AlertCircle, Package, Flame,
  Crosshair, Compass, Target, Radio, Star, Shield, Trophy, RefreshCw, X,
  Sparkles, Check, CheckCheck, Skull
} from 'lucide-react';
import './QuestsPage.css';

// Fallback reward tiers for 7-Day Streak
const DEFAULT_STREAK_TIERS = [
  { day: 1, credits: 100, cores: 0, label: 'Day 1: Scout Supply' },
  { day: 2, credits: 150, cores: 1, label: 'Day 2: Core Infusion' },
  { day: 3, credits: 200, cores: 1, label: 'Day 3: Weapon Battery' },
  { day: 4, credits: 250, cores: 2, label: 'Day 4: Shield Booster' },
  { day: 5, credits: 350, cores: 2, label: 'Day 5: Plasma Crate' },
  { day: 6, credits: 500, cores: 3, label: 'Day 6: Apex Shipment' },
  { day: 7, credits: 1000, cores: 5, label: 'Day 7: Imperial Jackpot' }
];

// Fallback reward probabilities for Orbital Supply Drop (Section 57)
const DEFAULT_SUPPLY_DROP_TIERS = [
  { type: 'CREDITS', amount: 250, label: 'Standard Credits Cache', probability: '45%', color: '#FBBF24', barWidth: '45%' },
  { type: 'CREDITS', amount: 600, label: 'Heavy Credits Vault', probability: '25%', color: '#F59E0B', barWidth: '25%' },
  { type: 'ENERGY_CORES', amount: 3, label: 'Energy Core Cluster', probability: '18%', color: '#A855F7', barWidth: '18%' },
  { type: 'ENERGY_CORES', amount: 8, label: 'Supercharged Cores', probability: '8%', color: '#C084FC', barWidth: '8%' },
  { type: 'VELOP_COINS', amount: 50, label: 'Jackpot: 50 VELOOP Coins', probability: '4%', color: '#FF2DFF', barWidth: '4%' }
];

export const QuestsPage = ({ onBack }) => {
  const { user, profile, refreshProfile } = useAuth();
  
  const [questsData, setQuestsData] = useState({
    dailyQuests: [],
    achievements: [],
    streak: { currentStreak: 1, streakDay: 1, canClaimToday: false, rewardsTable: DEFAULT_STREAK_TIERS }
  });
  
  const [supplyDrop, setSupplyDrop] = useState({ 
    canClaim: false, 
    nextAvailableAt: null, 
    rewardTiers: DEFAULT_SUPPLY_DROP_TIERS 
  });
  
  const [supplyDropLoading, setSupplyDropLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('QUESTS'); // 'QUESTS', 'ACHIEVEMENTS', or 'EVENTS'
  const [achievementFilter, setAchievementFilter] = useState('ALL');
  const [, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [claimingId, setClaimingId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [countdown, setCountdown] = useState('24:00:00');
  const [supplyCountdown, setSupplyCountdown] = useState('');
  const feedbackTimeoutRef = useRef(null);

  // 1. 24h Countdown to Midnight UTC (Daily Reset Clock)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrowUTC = new Date(Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() + 1,
        0, 0, 0
      ));
      const diff = tomorrowUTC - now;

      if (diff <= 0) {
        setCountdown('00H 00M 00S');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown(
        `${String(hours).padStart(2, '0')}H ${String(mins).padStart(2, '0')}M ${String(secs).padStart(2, '0')}S`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Supply Drop Cooldown Countdown
  useEffect(() => {
    const updateSupplyTimer = () => {
      if (supplyDrop.canClaim) {
        setSupplyCountdown('READY');
        return;
      }

      if (!supplyDrop.nextAvailableAt) {
        setSupplyCountdown('STANDBY');
        return;
      }

      const target = new Date(supplyDrop.nextAvailableAt).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setSupplyCountdown('READY');
        setSupplyDrop(prev => ({ ...prev, canClaim: true }));
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setSupplyCountdown(
        `${String(hours).padStart(2, '0')}H ${String(mins).padStart(2, '0')}M ${String(secs).padStart(2, '0')}S`
      );
    };

    updateSupplyTimer();
    const interval = setInterval(updateSupplyTimer, 1000);
    return () => clearInterval(interval);
  }, [supplyDrop.canClaim, supplyDrop.nextAvailableAt]);

  // Show Feedback Toast with Auto-Dismiss
  const showFeedback = (type, text) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setFeedbackMessage({ type, text });
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedbackMessage(null);
    }, 6000);
  };

  // Fetch all Quests, Achievements, Supply Drop, and Events
  const fetchQuestsData = async (isManualSync = false) => {
    if (isManualSync) setIsSyncing(true);
    else setLoading(true);

    try {
      const res = await api.get('/quests');
      if (res.data?.success || res.success) {
        const payload = res.data || res;
        setQuestsData({
          dailyQuests: payload.dailyQuests || [],
          achievements: payload.achievements || [],
          streak: {
            currentStreak: payload.streak?.currentStreak || 1,
            streakDay: payload.streak?.streakDay || 1,
            canClaimToday: !!payload.streak?.canClaimToday,
            rewardsTable: (payload.streak?.rewardsTable?.length) ? payload.streak.rewardsTable : DEFAULT_STREAK_TIERS
          }
        });
      }
    } catch (err) {
      console.warn('Quests API retrieval error:', err.message);
    }

    try {
      const dropRes = await api.get('/supply-drop/status');
      if (dropRes.data?.success || dropRes.success) {
        const payload = dropRes.data || dropRes;
        setSupplyDrop({
          canClaim: !!payload.canClaim,
          nextAvailableAt: payload.nextAvailableAt || null,
          rewardTiers: (payload.rewardTiers?.length) ? payload.rewardTiers : DEFAULT_SUPPLY_DROP_TIERS
        });
      }
    } catch (err) {
      console.warn('Supply drop status error:', err.message);
    }

    try {
      const evRes = await api.get('/events');
      if (evRes.data?.success || evRes.success) {
        const payload = evRes.data || evRes;
        setEvents(payload.events || []);
      }
    } catch (err) {
      console.warn('Events API error:', err.message);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchQuestsData();
  }, []);

  // 1. Claim Daily Login Streak
  const handleClaimStreak = async () => {
    soundManager.playPickup('core');
    setClaimingId('streak');
    try {
      const res = await api.post('/quests/streak/claim');
      if (res.data?.success || res.success) {
        const payload = res.data || res;
        soundManager.playPowerUp();
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
        showFeedback('success', payload.message || '7-Day Deployment reward secured!');
        fetchQuestsData();
        if (refreshProfile) refreshProfile();
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || err.message || 'Failed to claim daily streak bonus');
    } finally {
      setClaimingId(null);
    }
  };

  // 2. Claim Orbital Supply Drop
  const handleClaimSupplyDrop = async () => {
    soundManager.playPowerUp();
    setSupplyDropLoading(true);
    setClaimingId('supplyDrop');
    try {
      const res = await api.post('/supply-drop/claim');
      if (res.data?.success || res.success) {
        const payload = res.data || res;
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.55 } });
        showFeedback('success', payload.message || 'Orbital Supply Drop extracted successfully!');
        fetchQuestsData();
        if (refreshProfile) refreshProfile();
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || err.message || 'Orbital cargo drop is refueling');
    } finally {
      setSupplyDropLoading(false);
      setClaimingId(null);
    }
  };

  // 3. Claim Daily Quest
  const handleClaimQuest = async (questId) => {
    soundManager.playPickup('credit');
    setClaimingId(questId);
    try {
      const res = await api.post(`/quests/${questId}/claim`);
      if (res.data?.success || res.success) {
        const payload = res.data || res;
        confetti({ particleCount: 65, spread: 55, origin: { y: 0.6 } });
        showFeedback('success', payload.message || 'Combat objective bounty authorized!');
        fetchQuestsData();
        if (refreshProfile) refreshProfile();
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || err.message || 'Failed to claim quest bounty');
    } finally {
      setClaimingId(null);
    }
  };

  // 4. Claim Lifetime Merit Achievement
  const handleClaimAchievement = async (achievementId) => {
    soundManager.playPowerUp();
    setClaimingId(achievementId);
    try {
      const res = await api.post(`/quests/achievements/${achievementId}/claim`);
      if (res.data?.success || res.success) {
        const payload = res.data || res;
        confetti({ particleCount: 95, spread: 75, origin: { y: 0.6 } });
        showFeedback('success', payload.message || 'Military merit commendation officially granted!');
        fetchQuestsData();
        if (refreshProfile) refreshProfile();
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || err.message || 'Failed to claim merit reward');
    } finally {
      setClaimingId(null);
    }
  };

  // 5. Claim Limited-Time Event Reward
  const handleClaimEvent = async (eventId) => {
    soundManager.playPowerUp();
    setClaimingId(eventId);
    try {
      const res = await api.post(`/events/${eventId}/claim`);
      if (res.data?.success || res.success) {
        const payload = res.data || res;
        confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
        showFeedback('success', payload.message || 'Special operation campaign reward secured!');
        fetchQuestsData();
        if (refreshProfile) refreshProfile();
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || err.message || 'Failed to claim event reward');
    } finally {
      setClaimingId(null);
    }
  };

  // Pilot Career Progress Telemetry
  const pilotLevel = user?.level || profile?.level || 1;
  const pilotRank = user?.pilotRank || profile?.pilotRank || 'Flight Cadet';
  const pilotXp = user?.xp || profile?.xp || 0;
  const xpThreshold = pilotLevel * 250;
  const xpCurrentLevel = pilotXp % xpThreshold;
  const xpPct = Math.min(100, Math.round((xpCurrentLevel / xpThreshold) * 100));

  const unlockedAchCount = questsData.achievements.filter(a => a.unlocked).length;
  const totalAchCount = questsData.achievements.length || 10;
  const achCompletionPct = Math.round((unlockedAchCount / totalAchCount) * 100);

  // Total unclaimed rewards available right now
  const readyToClaimCount = useMemo(() => {
    let count = 0;
    if (questsData.streak.canClaimToday) count++;
    if (supplyDrop.canClaim) count++;
    count += questsData.dailyQuests.filter(q => q.completed && !q.claimed).length;
    count += questsData.achievements.filter(a => a.unlocked && !a.claimed).length;
    count += events.filter(e => e.isCompleted && !e.isClaimed).length;
    return count;
  }, [questsData, supplyDrop.canClaim, events]);

  // Filtered Achievements
  const filteredAchievements = useMemo(() => {
    return questsData.achievements.filter(ach => {
      if (achievementFilter === 'ALL') return true;
      if (achievementFilter === 'UNLOCKED') return ach.unlocked;
      if (achievementFilter === 'LOCKED') return !ach.unlocked;
      return ach.category === achievementFilter;
    });
  }, [questsData.achievements, achievementFilter]);

  // Quest Icon Resolver
  const getQuestIcon = (metric, title = '') => {
    if (metric === 'enemiesDestroyed' || title.toLowerCase().includes('annihilation')) {
      return <Crosshair size={22} color="#00E5FF" />;
    }
    if (metric === 'missionsCompleted' || title.toLowerCase().includes('patrol')) {
      return <Compass size={22} color="#00E5FF" />;
    }
    if (metric === 'adsWatched' || title.toLowerCase().includes('comms')) {
      return <Radio size={22} color="#00E5FF" />;
    }
    if (metric === 'highestScore' || title.toLowerCase().includes('ace')) {
      return <Target size={22} color="#FBBF24" />;
    }
    return <Award size={22} color="#00E5FF" />;
  };

  // Achievement Icon Resolver
  const getAchievementIcon = (ach) => {
    if (ach.category === 'BOSS' || ach.id.includes('boss') || ach.id.includes('apex')) {
      return <Skull size={22} color={ach.unlocked ? '#FF2DFF' : '#64748B'} />;
    }
    if (ach.category === 'HANGAR' || ach.id.includes('fleet')) {
      return <Shield size={22} color={ach.unlocked ? '#C084FC' : '#64748B'} />;
    }
    if (ach.category === 'CAMPAIGN' || ach.id.includes('conqueror')) {
      return <Compass size={22} color={ach.unlocked ? '#00E5FF' : '#64748B'} />;
    }
    if (ach.category === 'STARS' || ach.id.includes('star')) {
      return <Star size={22} color={ach.unlocked ? '#FBBF24' : '#64748B'} />;
    }
    if (ach.category === 'ECONOMY' || ach.id.includes('credit')) {
      return <Coins size={22} color={ach.unlocked ? '#FBBF24' : '#64748B'} />;
    }
    if (ach.category === 'UPGRADES' || ach.id.includes('overdrive')) {
      return <Zap size={22} color={ach.unlocked ? '#C084FC' : '#64748B'} />;
    }
    if (ach.category === 'APEX' || ach.id.includes('sovereign')) {
      return <Trophy size={22} color={ach.unlocked ? '#FBBF24' : '#64748B'} />;
    }
    return <Award size={22} color={ach.unlocked ? '#C084FC' : '#64748B'} />;
  };

  return (
    <div className="quests-shell">
      {/* ================= TOAST NOTIFICATION ================= */}
      {feedbackMessage && (
        <div className={`quests-feedback-toast ${feedbackMessage.type}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 size={18} color="#20D6A0" />
            ) : (
              <AlertCircle size={18} color="#EF4444" />
            )}
            <span style={{ fontWeight: 600 }}>{feedbackMessage.text}</span>
          </div>
          <button 
            onClick={() => setFeedbackMessage(null)} 
            className="toast-close-btn"
            title="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ================= 1. COMMAND CONSOLE HEADER ================= */}
      <header className="quests-header-shell">
        <div className="quests-header-left">
          {onBack && (
            <button onClick={onBack} className="quests-back-btn">
              <ArrowLeft size={16} />
              <span>COMMAND DECK</span>
            </button>
          )}
          <div>
            <div className="quests-eyebrow">
              <span className="quests-eyebrow-blip" />
              <span>PILOT OPERATIONS // REWARD PROTOCOL</span>
            </div>
            <h1 className="quests-title">QUESTS & ACHIEVEMENTS</h1>
            <p className="quests-subtitle">
              Complete tactical objectives, maintain your deployment streak, and earn rewards across the galaxy.
            </p>
          </div>
        </div>

        <div className="quests-header-right">
          <div className="quests-reset-badge">
            <Clock size={18} color="#00E5FF" />
            <div>
              <div className="quests-reset-time">{countdown}</div>
              <div className="quests-reset-label">DAILY ROTATION RESET</div>
            </div>
          </div>

          <button 
            onClick={() => fetchQuestsData(true)} 
            disabled={isSyncing}
            className={`quests-refresh-btn ${isSyncing ? 'rotating' : ''}`}
            title="Sync Protocols & Validate Ledger"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {/* ================= 2. PILOT CAREER PROGRESSION PANEL ================= */}
      <section className="career-progress-panel">
        <div className="career-stat-card">
          <div className="career-stat-icon">
            <Shield size={20} color="#00E5FF" />
          </div>
          <div className="career-stat-info">
            <span className="career-stat-label">PILOT RANK // LEVEL</span>
            <span className="career-stat-val">{pilotRank} · LVL {pilotLevel}</span>
          </div>
        </div>

        <div className="career-stat-card">
          <div className="career-stat-icon">
            <Zap size={20} color="#C084FC" />
          </div>
          <div className="career-stat-info" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="career-stat-label">PILOT XP PROGRESS</span>
              <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-heading)', color: '#00E5FF' }}>
                {xpCurrentLevel} / {xpThreshold} XP
              </span>
            </div>
            <div className="career-xp-track">
              <div className="career-xp-fill" style={{ width: `${xpPct}%` }} />
            </div>
          </div>
        </div>

        <div className="career-stat-card">
          <div className="career-stat-icon">
            <Flame size={20} color="#FBBF24" />
          </div>
          <div className="career-stat-info">
            <span className="career-stat-label">DEPLOYMENT STREAK</span>
            <span className="career-stat-val" style={{ color: '#FBBF24' }}>
              {questsData.streak.currentStreak} CONSECUTIVE {questsData.streak.currentStreak === 1 ? 'DAY' : 'DAYS'}
            </span>
          </div>
        </div>

        <div className="career-stat-card">
          <div className="career-stat-icon">
            <Award size={20} color="#FF2DFF" />
          </div>
          <div className="career-stat-info">
            <span className="career-stat-label">COMMENDATIONS UNLOCKED</span>
            <span className="career-stat-val">
              {unlockedAchCount} / {totalAchCount} ({achCompletionPct}%)
            </span>
          </div>
        </div>

        {readyToClaimCount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <span className="career-badge-ready">
              <Sparkles size={14} />
              <span>{readyToClaimCount} REWARD{readyToClaimCount > 1 ? 'S' : ''} READY TO CLAIM</span>
            </span>
          </div>
        )}
      </section>

      {/* ================= 3. 7-DAY GALACTIC LOGIN STREAK ================= */}
      <section className="streak-command-panel cyber-interactive-card">
        <div className="streak-panel-header">
          <div className="streak-header-info">
            <div className="streak-flame-icon">
              <Calendar size={22} color="#FBBF24" />
            </div>
            <div>
              <div className="streak-title-row">
                <h2 className="streak-title">GALACTIC DEPLOYMENT STREAK</h2>
                <span className="streak-tag">DAY 0{questsData.streak.streakDay} ACTIVE</span>
              </div>
              <p className="streak-subtitle">
                Consecutive daily sorties deliver escalating combat credits and high-density plasma energy cores.
              </p>
            </div>
          </div>

          <button
            onClick={handleClaimStreak}
            disabled={!questsData.streak.canClaimToday || claimingId === 'streak'}
            className={`streak-claim-action ${questsData.streak.canClaimToday ? 'claimable' : 'claimed'}`}
          >
            {questsData.streak.canClaimToday ? (
              <>
                <Gift size={16} />
                <span>{claimingId === 'streak' ? 'SECURING SUPPLY...' : "CLAIM TODAY'S CACHE"}</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>TODAY'S CACHE SECURED</span>
              </>
            )}
          </button>
        </div>

        {/* 7 Connected Capsule Nodes Track */}
        <div className="streak-timeline-wrapper">
          <div className="streak-timeline-conduit" />
          <div className="streak-nodes-grid">
            {questsData.streak.rewardsTable.map((tier) => {
              const isToday = tier.day === questsData.streak.streakDay;
              const isCompleted = tier.day < questsData.streak.streakDay || (isToday && !questsData.streak.canClaimToday);
              const isClaimableToday = isToday && questsData.streak.canClaimToday;
              const isUpcoming = tier.day > questsData.streak.streakDay;
              const isDay7 = tier.day === 7;

              let nodeClass = 'streak-capsule-node';
              if (isDay7) nodeClass += ' day-7';
              if (isClaimableToday) nodeClass += ' today';
              else if (isCompleted) nodeClass += ' completed';
              else if (isUpcoming) nodeClass += ' upcoming';

              return (
                <div key={tier.day} className={nodeClass}>
                  <div className="streak-day-badge">
                    {isDay7 ? <Trophy size={12} color="#FBBF24" /> : null}
                    <span>DAY 0{tier.day}</span>
                  </div>

                  <div className="streak-capsule-icon-wrap">
                    {isCompleted ? (
                      <Check size={20} color="#20D6A0" />
                    ) : isClaimableToday ? (
                      <Gift size={20} color="#00E5FF" />
                    ) : isDay7 ? (
                      <Sparkles size={20} color="#FBBF24" />
                    ) : (
                      <Package size={20} color="#94A3B8" />
                    )}
                  </div>

                  <div className="streak-rewards-stack">
                    <div className="streak-reward-chip credits">
                      <Coins size={11} />
                      <span>+{tier.credits}</span>
                    </div>
                    {tier.cores > 0 ? (
                      <div className="streak-reward-chip cores">
                        <Zap size={11} />
                        <span>+{tier.cores} CORES</span>
                      </div>
                    ) : (
                      <div style={{ height: '22px' }} />
                    )}
                  </div>

                  {isClaimableToday ? (
                    <span className="streak-status-tag today">CLAIMABLE</span>
                  ) : isCompleted ? (
                    <span className="streak-status-tag completed">SECURED</span>
                  ) : (
                    <span className="streak-status-tag upcoming">SCHEDULED</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 4. ORBITAL SUPPLY DROP CENTERPIECE ================= */}
      <section className="orbital-supply-panel cyber-interactive-card">
        {/* Left Column: Holographic Cargo Pod Stage & Action */}
        <div className="supply-pod-stage">
          <div className="hologram-crate-visual">
            <div className="orbital-ring-outer" />
            <div className="orbital-ring-inner" />
            <div className="orbital-laser-sweep" />
            <div className="central-crate-core">
              <Package size={38} color="#00E5FF" />
            </div>
          </div>

          <div className="supply-stage-meta">
            <h2 className="supply-stage-heading">
              <span>ORBITAL SUPPLY DROP</span>
              <span className="badge badge-cyan" style={{ fontSize: '0.62rem' }}>SECTION 57</span>
            </h2>
            <p className="supply-stage-desc">
              Automated high-altitude supply shuttles deliver randomized resource caches every 4 hours.
            </p>

            <div className={`supply-cooldown-timer ${supplyDrop.canClaim ? 'ready' : ''}`}>
              <Clock size={14} />
              <span>
                {supplyDrop.canClaim ? 'ORBITAL POD READY FOR EXTRACTION' : `REFUELING SHUTTLE // ${supplyCountdown}`}
              </span>
            </div>
          </div>

          <button
            onClick={handleClaimSupplyDrop}
            disabled={!supplyDrop.canClaim || supplyDropLoading}
            className={`supply-claim-btn ${supplyDrop.canClaim ? 'ready' : 'cooldown'}`}
          >
            {supplyDropLoading ? (
              <>
                <RefreshCw size={18} className="rotating" />
                <span>OPENING ORBITAL POD...</span>
              </>
            ) : supplyDrop.canClaim ? (
              <>
                <Gift size={18} />
                <span>OPEN ORBITAL SUPPLY DROP</span>
              </>
            ) : (
              <>
                <Lock size={16} />
                <span>REFUELING ORBITAL DROP</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Transparent Probability Distribution Matrix */}
        <div className="probability-matrix-wrap">
          <div className="prob-matrix-header">
            <span className="prob-matrix-title">TRANSPARENT REWARD PROBABILITIES</span>
            <span className="prob-matrix-note">Server-Authoritative Weights</span>
          </div>

          <div className="prob-tier-list">
            {(supplyDrop.rewardTiers?.length ? supplyDrop.rewardTiers : DEFAULT_SUPPLY_DROP_TIERS).map((tier, idx) => {
              const isCredits = tier.type === 'CREDITS';
              const isCores = tier.type === 'ENERGY_CORES';
              const isVelop = tier.type === 'VELOP_COINS';

              const barColor = isVelop ? '#FF2DFF' : isCores ? '#C084FC' : '#FBBF24';
              const rateNum = tier.probability || `${tier.weight}%`;

              return (
                <div key={idx} className="prob-tier-card">
                  <div className="prob-tier-top">
                    <div className="prob-tier-identity">
                      <div className="prob-tier-icon" style={{ background: `${barColor}18`, color: barColor }}>
                        {isCredits ? <Coins size={14} /> : isCores ? <Zap size={14} /> : <Sparkles size={14} />}
                      </div>
                      <span className="prob-tier-label">{tier.label}</span>
                    </div>
                    <span className="prob-tier-rate" style={{ color: barColor }}>{rateNum}</span>
                  </div>

                  <div className="prob-tier-bar-track">
                    <div 
                      className="prob-tier-bar-fill" 
                      style={{ 
                        width: rateNum, 
                        background: `linear-gradient(90deg, ${barColor} 0%, #00E5FF 100%)` 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="prob-simulated-notice">
            <strong>NOTICE:</strong> VELOOP Coins in supply drops are simulated testnet assets for gameplay progression and upgrades. Not redeemable for fiat currency.
          </div>
        </div>
      </section>

      {/* ================= 5. TACTICAL SECTION NAVIGATION TABS ================= */}
      <nav className="quests-nav-tabs">
        <button
          onClick={() => setActiveTab('QUESTS')}
          className={`quests-tab-btn tab-quests ${activeTab === 'QUESTS' ? 'active' : ''}`}
        >
          <Target size={16} />
          <span>DAILY QUESTS</span>
          <span className="quests-tab-count">{questsData.dailyQuests.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('ACHIEVEMENTS')}
          className={`quests-tab-btn tab-achievements ${activeTab === 'ACHIEVEMENTS' ? 'active' : ''}`}
        >
          <Award size={16} />
          <span>LIFETIME ACHIEVEMENTS</span>
          <span className="quests-tab-count">{unlockedAchCount}/{totalAchCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('EVENTS')}
          className={`quests-tab-btn tab-events ${activeTab === 'EVENTS' ? 'active' : ''}`}
        >
          <Flame size={16} />
          <span>LIMITED-TIME EVENTS</span>
          <span className="quests-tab-count">{events.length}</span>
        </button>
      </nav>

      {/* ================= TAB 1: DAILY QUESTS ================= */}
      {activeTab === 'QUESTS' && (
        <div className="quests-cards-grid">
          {questsData.dailyQuests.map((q) => {
            const isCompleted = q.completed;
            const isClaimed = q.claimed;
            const pct = Math.min(100, Math.round(((q.progress || 0) / (q.target || 1)) * 100));
            const isReadyToClaim = isCompleted && !isClaimed;

            let cardClass = 'tactical-quest-card';
            if (isReadyToClaim) cardClass += ' ready-to-claim';
            else if (isClaimed) cardClass += ' claimed';

            return (
              <div key={q.id} className={cardClass}>
                <div className="quest-card-header">
                  <div className="quest-category-icon">
                    {getQuestIcon(q.metric, q.title)}
                  </div>
                  <div className="quest-card-info">
                    <h3 className="quest-title-text">{q.title}</h3>
                    <p className="quest-desc-text">{q.description}</p>
                  </div>
                </div>

                <div className="quest-rewards-row">
                  {q.rewards?.credits > 0 && (
                    <div className="quest-reward-pill credits">
                      <Coins size={12} />
                      <span>+{q.rewards.credits} CREDITS</span>
                    </div>
                  )}
                  {q.rewards?.xp > 0 && (
                    <div className="quest-reward-pill xp">
                      <Zap size={12} />
                      <span>+{q.rewards.xp} XP</span>
                    </div>
                  )}
                  {q.rewards?.energyCores > 0 && (
                    <div className="quest-reward-pill cores">
                      <Zap size={12} />
                      <span>+{q.rewards.energyCores} CORES</span>
                    </div>
                  )}
                </div>

                {/* Progress Bar Track */}
                <div className="quest-progress-section">
                  <div className="quest-progress-meta">
                    <span className="quest-progress-label">OBJECTIVE PROGRESS</span>
                    <span className="quest-progress-val">
                      {(q.progress || 0).toLocaleString()} / {(q.target || 0).toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="quest-meter-track">
                    <div 
                      className={`quest-meter-fill ${isCompleted ? 'completed' : ''}`}
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>

                {/* Quest Card Footer Action */}
                <div className="quest-card-footer">
                  {isClaimed ? (
                    <div className="quest-status-badge claimed">
                      <CheckCircle2 size={14} color="#20D6A0" />
                      <span>REWARD CLAIMED</span>
                    </div>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaimQuest(q.id)}
                      disabled={claimingId === q.id}
                      className="quest-claim-btn"
                    >
                      <Sparkles size={14} />
                      <span>{claimingId === q.id ? 'AUTHORIZING...' : 'CLAIM REWARD'}</span>
                    </button>
                  ) : (
                    <div className="quest-status-badge in-progress">
                      <Clock size={13} color="#94A3B8" />
                      <span>IN PROGRESS ({pct}%)</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= TAB 2: LIFETIME ACHIEVEMENTS ================= */}
      {activeTab === 'ACHIEVEMENTS' && (
        <div className="achievements-shell">
          {/* Commendation Summary Meter */}
          <div className="achievements-summary-bar">
            <div className="ach-summary-top">
              <div className="ach-summary-title">
                <Trophy size={18} color="#C084FC" />
                <span>PILOT COMMENDATION MATRIX</span>
              </div>
              <span className="ach-summary-score">
                {unlockedAchCount} OF {totalAchCount} COMMENDATIONS EARNED ({achCompletionPct}%)
              </span>
            </div>
            <div className="ach-summary-meter">
              <div className="ach-summary-fill" style={{ width: `${achCompletionPct}%` }} />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="ach-filter-pills">
            {['ALL', 'UNLOCKED', 'LOCKED', 'COMBAT', 'HANGAR', 'BOSS', 'CAMPAIGN', 'APEX', 'ECONOMY'].map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setAchievementFilter(filterKey)}
                className={`ach-pill-btn ${achievementFilter === filterKey ? 'active' : ''}`}
              >
                {filterKey}
              </button>
            ))}
          </div>

          {/* Achievements Cards Grid */}
          <div className="achievements-cards-grid">
            {filteredAchievements.map((ach) => {
              const isUnlocked = ach.unlocked;
              const isClaimed = ach.claimed;
              const isApex = ach.category === 'APEX' || ach.id.includes('sovereign');

              let cardClass = 'ach-commendation-card';
              if (isApex) cardClass += ' apex';
              if (isUnlocked) cardClass += ' unlocked';
              else cardClass += ' locked';

              return (
                <div key={ach.id} className={cardClass}>
                  <div className="ach-card-top">
                    <div className="medal-insignia-frame">
                      {getAchievementIcon(ach)}
                    </div>
                    <span className="medal-category-tag">{ach.category}</span>
                  </div>

                  <div className="ach-card-body">
                    <h3 className="ach-title-text">{ach.name}</h3>
                    <p className="ach-desc-text">{ach.description}</p>

                    <div className="ach-rewards-row">
                      {ach.rewards?.credits > 0 && (
                        <div className="quest-reward-pill credits">
                          <Coins size={11} />
                          <span>+{ach.rewards.credits}</span>
                        </div>
                      )}
                      {ach.rewards?.energyCores > 0 && (
                        <div className="quest-reward-pill cores">
                          <Zap size={11} />
                          <span>+{ach.rewards.energyCores} CORES</span>
                        </div>
                      )}
                      {ach.rewards?.xp > 0 && (
                        <div className="quest-reward-pill xp">
                          <Zap size={11} />
                          <span>+{ach.rewards.xp} XP</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto' }}>
                    {isClaimed ? (
                      <div className="quest-status-badge claimed" style={{ width: '100%', justifyContent: 'center' }}>
                        <CheckCheck size={14} color="#20D6A0" />
                        <span>MERIT GRANTED</span>
                      </div>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => handleClaimAchievement(ach.id)}
                        disabled={claimingId === ach.id}
                        className="ach-claim-btn"
                      >
                        <Sparkles size={14} />
                        <span>{claimingId === ach.id ? 'AUTHORIZING...' : 'CLAIM MERIT'}</span>
                      </button>
                    ) : (
                      <div className="quest-status-badge in-progress" style={{ width: '100%', justifyContent: 'center' }}>
                        <Lock size={13} color="#64748B" />
                        <span>CRITERIA LOCKED</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: LIMITED-TIME EVENTS ================= */}
      {activeTab === 'EVENTS' && (
        <div className="events-container">
          {events.length === 0 ? (
            <div style={{ 
              background: 'rgba(8, 14, 40, 0.7)', 
              borderRadius: '14px', 
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '48px 24px', 
              textAlign: 'center' 
            }}>
              <Flame size={36} color="#64748B" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontFamily: 'var(--font-heading)', color: '#FFFFFF', margin: 0 }}>
                NO ACTIVE CAMPAIGN TRANSMISSIONS
              </h3>
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '6px' }}>
                All special sector operations are currently concluded. Stand by for high-command fleet dispatches.
              </p>
            </div>
          ) : (
            events.map((ev) => {
              const currentProg = ev.currentProgress || 0;
              const targetProg = ev.objective?.target || 1;
              const pct = Math.min(100, Math.round((currentProg / targetProg) * 100));

              return (
                <div key={ev.id} className="event-campaign-card">
                  <div className="event-header-row">
                    <div>
                      <div className="event-badge-group">
                        <span className="event-type-badge">LIMITED-TIME SORTIE</span>
                        <div className="event-timer-pill">
                          <Clock size={13} />
                          <span>ACTIVE FLEET CAMPAIGN</span>
                        </div>
                      </div>
                      <h2 className="event-title-text">{ev.name}</h2>
                      <p className="event-desc-text">{ev.description}</p>
                    </div>

                    <div className="quest-rewards-row" style={{ alignSelf: 'flex-start' }}>
                      {ev.reward?.credits > 0 && (
                        <div className="quest-reward-pill credits">
                          <Coins size={12} />
                          <span>+{ev.reward.credits} CREDITS</span>
                        </div>
                      )}
                      {ev.reward?.energyCores > 0 && (
                        <div className="quest-reward-pill cores">
                          <Zap size={12} />
                          <span>+{ev.reward.energyCores} CORES</span>
                        </div>
                      )}
                      {ev.reward?.velopRewardCoins > 0 && (
                        <div className="quest-reward-pill" style={{ color: '#FF2DFF', borderColor: 'rgba(255, 45, 255, 0.3)' }}>
                          <Award size={12} />
                          <span>+{ev.reward.velopRewardCoins} VELOOP COINS</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Objective Progress Bar Track */}
                  <div className="quest-progress-section">
                    <div className="quest-progress-meta">
                      <span className="quest-progress-label">TACTICAL TARGET ELIMINATIONS</span>
                      <span className="quest-progress-val">
                        {currentProg.toLocaleString()} / {targetProg.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="quest-meter-track">
                      <div 
                        className={`quest-meter-fill ${ev.isCompleted ? 'completed' : ''}`}
                        style={{ width: `${pct}%`, background: ev.isCompleted ? 'linear-gradient(90deg, #20D6A0, #059669)' : 'linear-gradient(90deg, #FBBF24, #D97706)' }} 
                      />
                    </div>
                  </div>

                  {/* Event Claim Action Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {ev.isClaimed ? (
                      <div className="quest-status-badge claimed">
                        <CheckCircle2 size={16} color="#20D6A0" />
                        <span>EVENT REWARDS SECURED</span>
                      </div>
                    ) : ev.isCompleted ? (
                      <button
                        onClick={() => handleClaimEvent(ev.id)}
                        disabled={claimingId === ev.id}
                        className="event-claim-btn"
                      >
                        <Sparkles size={16} />
                        <span>{claimingId === ev.id ? 'AUTHORIZING...' : 'CLAIM OPERATION REWARD'}</span>
                      </button>
                    ) : (
                      <div className="quest-status-badge in-progress">
                        <Crosshair size={14} color="#94A3B8" />
                        <span>IN ACTIVE SORTIE ({pct}%)</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default QuestsPage;
