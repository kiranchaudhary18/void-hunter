import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import soundManager from '../game/managers/SoundManager.js';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, Award, Clock, Zap, Coins, 
  CheckCircle2, Lock, Calendar, Gift, AlertCircle, Package, Flame 
} from 'lucide-react';

export const QuestsPage = ({ onBack }) => {
  const { refreshProfile } = useAuth();
  const [questsData, setQuestsData] = useState({
    dailyQuests: [],
    achievements: [],
    streak: { currentStreak: 1, streakDay: 1, canClaimToday: false, rewardsTable: [] }
  });
  const [supplyDrop, setSupplyDrop] = useState({ canClaim: false, nextAvailableAt: null, rewardTiers: [] });
  const [supplyDropLoading, setSupplyDropLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('QUESTS'); // 'QUESTS', 'ACHIEVEMENTS', or 'EVENTS'
  const [achievementFilter, setAchievementFilter] = useState('ALL');
  const [_loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [countdown, setCountdown] = useState('');

  // 24h Countdown to midnight UTC
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diff = tomorrow - now;

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

  // Fetch quests, achievements, login streak, supply drops, and events
  const fetchQuestsData = async () => {
    setLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await api.get('/quests');
      if (res.data?.success) {
        setQuestsData(res.data);
      }
    } catch (err) {
      console.warn('Quests API error:', err.message);
    }

    try {
      const dropRes = await api.get('/supply-drop/status');
      if (dropRes.data?.success) {
        setSupplyDrop(dropRes.data);
      }
    } catch (err) {
      console.warn('Supply drop status error:', err.message);
    }

    try {
      const evRes = await api.get('/events');
      if (evRes.data?.success) {
        setEvents(evRes.data.events || []);
      }
    } catch (err) {
      console.warn('Events API error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestsData();
  }, []);

  // Claim Daily Login Streak
  const handleClaimStreak = async () => {
    soundManager.playPickup('core');
    setClaimingId('streak');
    try {
      const res = await api.post('/quests/streak/claim');
      if (res.data?.success) {
        soundManager.playPowerUp();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        setFeedbackMessage({ type: 'success', text: res.data.message });
        fetchQuestsData();
        if (refreshProfile) refreshProfile();
      }
    } catch (err) {
      setFeedbackMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to claim daily streak bonus' 
      });
    } finally {
      setClaimingId(null);
    }
  };

  // Section 57: Claim Orbital Supply Drop
  const handleClaimSupplyDrop = async () => {
    soundManager.playPowerUp();
    setSupplyDropLoading(true);
    try {
      const res = await api.post('/supply-drop/claim');
      if (res.data?.success) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setFeedbackMessage({ type: 'success', text: res.data.message });
        fetchQuestsData();
        if (refreshProfile) refreshProfile();
      }
    } catch (err) {
      setFeedbackMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to claim orbital supply drop' 
      });
    } finally {
      setSupplyDropLoading(false);
    }
  };

  // Section 58: Claim Limited-Time Event Reward
  const handleClaimEvent = async (eventId) => {
    soundManager.playPowerUp();
    setClaimingId(eventId);
    try {
      const res = await api.post(`/events/${eventId}/claim`);
      if (res.data?.success) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setFeedbackMessage({ type: 'success', text: res.data.message });
        fetchQuestsData();
        if (refreshProfile) refreshProfile();
      }
    } catch (err) {
      setFeedbackMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Error claiming event reward' 
      });
    } finally {
      setClaimingId(null);
    }
  };

  // Claim Daily Quest Reward
  const handleClaimQuest = async (questId) => {
    soundManager.playPickup('credit');
    setClaimingId(questId);
    try {
      const res = await api.post(`/quests/${questId}/claim`);
      if (res.data?.success) {
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
        setFeedbackMessage({ type: 'success', text: res.data.message });
        fetchQuestsData();
        if (refreshProfile) refreshProfile();
      }
    } catch (err) {
      setFeedbackMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Error claiming quest reward' 
      });
    } finally {
      setClaimingId(null);
    }
  };

  // Claim Achievement Reward
  const handleClaimAchievement = async (achievementId) => {
    soundManager.playPowerUp();
    setClaimingId(achievementId);
    try {
      const res = await api.post(`/quests/achievements/${achievementId}/claim`);
      if (res.data?.success) {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        setFeedbackMessage({ type: 'success', text: res.data.message });
        fetchQuestsData();
        if (refreshProfile) refreshProfile();
      }
    } catch (err) {
      setFeedbackMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Error claiming achievement reward' 
      });
    } finally {
      setClaimingId(null);
    }
  };

  const filteredAchievements = questsData.achievements.filter((a) => {
    if (achievementFilter === 'ALL') return true;
    return a.category === achievementFilter;
  });

  return (
    <div style={styles.pageContainer}>
      {/* ================= HEADER BAR ================= */}
      <header style={styles.header} className="glass-panel cyber-box">
        <div style={styles.headerLeft}>
          <button onClick={onBack} style={styles.backBtn} className="btn-secondary">
            <ArrowLeft size={18} />
            <span>COMMAND DECK</span>
          </button>
          <div>
            <h1 className="font-heading text-glow-cyan" style={styles.pageTitle}>QUESTS & ACHIEVEMENTS</h1>
            <p style={styles.subTitle}>DAILY 24H REWARDS & REPUTATION MERIT LEDGER</p>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.countdownBadge} className="glass-card cyber-box">
            <Clock size={16} color="var(--secondary-cyan)" style={{ filter: 'drop-shadow(0 0 4px #00E5FF)' }} />
            <div>
              <div style={styles.countdownVal} className="text-glow-cyan">{countdown}</div>
              <div style={styles.countdownLabel}>DAILY ROTATION RESET</div>
            </div>
          </div>
        </div>
      </header>

      {/* Feedback Alert */}
      {feedbackMessage && (
        <div style={{
          ...styles.feedbackAlert,
          borderColor: feedbackMessage.type === 'success' ? 'var(--status-green)' : '#EF4444',
          background: feedbackMessage.type === 'success' ? 'rgba(6, 78, 59, 0.85)' : 'rgba(69, 10, 10, 0.85)',
          color: feedbackMessage.type === 'success' ? '#A7F3D0' : '#FCA5A5'
        }} className="glass-panel animate-pulse-glow">
          {feedbackMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* ================= 7-DAY LOGIN STREAK REWARDS ================= */}
      <div style={styles.streakCard} className="glass-panel cyber-box">
        <div style={styles.streakHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={20} color="var(--currency-gold)" style={{ filter: 'drop-shadow(0 0 4px #FBBF24)' }} />
            <div>
              <h2 className="font-heading text-glow-gold" style={styles.streakTitle}>
                7-DAY DEPLOYMENT STREAK // DAY {questsData.streak.streakDay}
              </h2>
              <p style={styles.streakSubtitle}>
                Consecutive daily logins grant escalating credits & energy core caches.
              </p>
            </div>
          </div>

          <button
            onClick={handleClaimStreak}
            disabled={!questsData.streak.canClaimToday || claimingId === 'streak'}
            style={{
              ...styles.streakClaimBtn,
              opacity: questsData.streak.canClaimToday ? 1 : 0.5,
              cursor: questsData.streak.canClaimToday ? 'pointer' : 'not-allowed'
            }}
            className={questsData.streak.canClaimToday ? 'btn btn-cyan animate-pulse-glow' : 'btn-secondary'}
          >
            <Gift size={16} />
            <span>
              {questsData.streak.canClaimToday ? 'CLAIM TODAY\'S SUPPLY' : 'CLAIMED FOR TODAY'}
            </span>
          </button>
        </div>

        {/* 7 Days Row */}
        <div style={styles.streakDaysGrid}>
          {questsData.streak.rewardsTable.map((tier) => {
            const isToday = tier.day === questsData.streak.streakDay;
            const isPast = tier.day < questsData.streak.streakDay;

            return (
              <div
                key={tier.day}
                style={{
                  ...styles.streakDayBox,
                  borderColor: isToday ? 'var(--secondary-cyan)' : 'var(--border-glass)',
                  background: isToday 
                    ? 'linear-gradient(180deg, rgba(0, 229, 255, 0.16) 0%, rgba(10, 15, 44, 0.85) 100%)' 
                    : 'rgba(6, 9, 25, 0.6)'
                }}
                className="glass-card"
              >
                <div style={styles.streakDayNum}>DAY 0{tier.day}</div>
                <div style={styles.streakDayRewards}>
                  <div style={styles.streakRewardRow}>
                    <Coins size={12} color="var(--currency-gold)" />
                    <span>+{tier.credits}</span>
                  </div>
                  {tier.cores > 0 && (
                    <div style={styles.streakRewardRow}>
                      <Zap size={12} color="#C084FC" />
                      <span>+{tier.cores} CORES</span>
                    </div>
                  )}
                </div>
                {isPast ? (
                  <span style={styles.checkedPill}>COMPLETED</span>
                ) : isToday ? (
                  <span style={styles.todayPill}>TODAY</span>
                ) : (
                  <span style={styles.lockedPill}>UPCOMING</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= SECTION 57: ORBITAL SUPPLY DROP CRATE ================= */}
      <div style={styles.supplyDropCard} className="glass-panel">
        <div style={styles.supplyDropHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={styles.crateIconContainer} className="animate-pulse-glow">
              <Package size={26} color="var(--secondary-cyan)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 className="font-heading" style={styles.streakTitle}>ORBITAL SUPPLY DROP</h2>
                <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>SECTION 57</span>
              </div>
              <p style={styles.streakSubtitle}>
                Orbital cargo drops deliver randomized resources every 4 hours. Probabilities disclosed transparently below.
              </p>
            </div>
          </div>

          <button
            onClick={handleClaimSupplyDrop}
            disabled={!supplyDrop.canClaim || supplyDropLoading}
            style={{
              ...styles.supplyClaimBtn,
              opacity: supplyDrop.canClaim ? 1 : 0.6,
              cursor: supplyDrop.canClaim ? 'pointer' : 'not-allowed'
            }}
            className={supplyDrop.canClaim ? "btn btn-cyan animate-pulse-glow" : "btn btn-secondary"}
          >
            <Gift size={16} />
            <span>
              {supplyDropLoading ? 'OPENING ORBITAL CRATE...' : supplyDrop.canClaim ? 'OPEN SUPPLY DROP' : 'REFUELING ORBITAL DROP'}
            </span>
          </button>
        </div>

        {/* Probability Tables Disclosed (Section 57 mandate: Do not describe a random reward as guaranteed) */}
        <div style={styles.probGrid}>
          {supplyDrop.rewardTiers?.map((tier, idx) => (
            <div key={idx} style={styles.probPill} className="glass-card">
              <span style={{ color: 'var(--currency-gold)', fontWeight: 'bold' }}>{tier.probability}</span>
              <span style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>{tier.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= PRIMARY TABS: QUESTS, ACHIEVEMENTS & EVENTS ================= */}
      <div style={styles.primaryTabs}>
        <button
          onClick={() => setActiveTab('QUESTS')}
          style={{
            ...styles.primaryTabBtn,
            borderColor: activeTab === 'QUESTS' ? 'var(--secondary-cyan)' : 'var(--border-glass)',
            background: activeTab === 'QUESTS' ? 'rgba(0, 229, 255, 0.15)' : 'rgba(10, 15, 40, 0.5)',
            color: activeTab === 'QUESTS' ? 'var(--secondary-cyan)' : 'var(--text-muted)'
          }}
          className="font-heading"
        >
          DAILY ROTATING QUESTS ({questsData.dailyQuests.length})
        </button>
        <button
          onClick={() => setActiveTab('ACHIEVEMENTS')}
          style={{
            ...styles.primaryTabBtn,
            borderColor: activeTab === 'ACHIEVEMENTS' ? 'var(--electric-magenta)' : 'var(--border-glass)',
            background: activeTab === 'ACHIEVEMENTS' ? 'rgba(255, 45, 255, 0.15)' : 'rgba(10, 15, 40, 0.5)',
            color: activeTab === 'ACHIEVEMENTS' ? 'var(--electric-magenta)' : 'var(--text-muted)'
          }}
          className="font-heading"
        >
          LIFETIME MERIT ACHIEVEMENTS ({questsData.achievements.length})
        </button>
        <button
          onClick={() => setActiveTab('EVENTS')}
          style={{
            ...styles.primaryTabBtn,
            borderColor: activeTab === 'EVENTS' ? 'var(--currency-gold)' : 'var(--border-glass)',
            background: activeTab === 'EVENTS' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(10, 15, 40, 0.5)',
            color: activeTab === 'EVENTS' ? 'var(--currency-gold)' : 'var(--text-muted)'
          }}
          className="font-heading"
        >
          LIMITED-TIME EVENTS ({events.length})
        </button>
      </div>

      {/* ================= TAB 1: DAILY QUESTS ================= */}
      {activeTab === 'QUESTS' && (
        <div style={styles.questsGrid}>
          {questsData.dailyQuests.map((q) => {
            const isCompleted = q.completed;
            const isClaimed = q.claimed;
            const pct = Math.min(100, (q.progress / q.target) * 100);

            return (
              <div key={q.id} style={styles.questCard} className="glass-card glass-card-hover">
                <div style={styles.questHeader}>
                  <div>
                    <h3 className="font-heading" style={styles.questTitle}>{q.title}</h3>
                    <p style={styles.questDesc}>{q.description}</p>
                  </div>
                  <div style={styles.questRewards}>
                    <div style={styles.questRewardPill}>
                      <Coins size={13} color="var(--currency-gold)" />
                      <span>+{q.rewards?.credits}</span>
                    </div>
                    <div style={styles.questRewardPill}>
                      <Zap size={13} color="var(--secondary-cyan)" />
                      <span>+{q.rewards?.xp} XP</span>
                    </div>
                    {q.rewards?.energyCores > 0 && (
                      <div style={styles.questRewardPill}>
                        <Zap size={13} color="#C084FC" />
                        <span>+{q.rewards?.energyCores} CORE</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar Track */}
                <div style={styles.questProgressSection}>
                  <div style={styles.progressInfo}>
                    <span style={styles.progressLabel}>OBJECTIVE PROGRESS</span>
                    <span style={styles.progressNums}>
                      {q.progress.toLocaleString()} / {q.target.toLocaleString()}
                    </span>
                  </div>
                  <div style={styles.questProgressBarTrack}>
                    <div 
                      style={{
                        ...styles.questProgressBarFill,
                        width: `${pct}%`,
                        background: isCompleted ? 'var(--status-green)' : 'var(--secondary-cyan)'
                      }} 
                    />
                  </div>
                </div>

                {/* Quest Action Button */}
                <div style={styles.questFooter}>
                  {isClaimed ? (
                    <div style={styles.claimedBadge}>
                      <CheckCircle2 size={15} color="var(--status-green)" />
                      <span>REWARD CLAIMED</span>
                    </div>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaimQuest(q.id)}
                      disabled={claimingId === q.id}
                      style={styles.claimQuestBtn}
                      className="btn btn-cyan animate-pulse-glow"
                    >
                      {claimingId === q.id ? 'CLAIMING...' : 'CLAIM REWARD'}
                    </button>
                  ) : (
                    <div style={styles.inProgressBadge}>
                      <span>IN PROGRESS ({Math.round(pct)}%)</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= TAB 2: ACHIEVEMENTS ================= */}
      {activeTab === 'ACHIEVEMENTS' && (
        <div style={styles.achievementsContainer}>
          {/* Category Filter Pills */}
          <div style={styles.achFilterRow}>
            {['ALL', 'COMBAT', 'HANGAR', 'BOSS', 'CAMPAIGN', 'APEX'].map((cat) => (
              <button
                key={cat}
                onClick={() => setAchievementFilter(cat)}
                style={{
                  ...styles.achFilterBtn,
                  background: achievementFilter === cat ? 'var(--electric-magenta)' : 'rgba(255, 255, 255, 0.05)',
                  color: achievementFilter === cat ? '#060919' : 'var(--text-light)',
                  fontWeight: achievementFilter === cat ? 'bold' : 'normal'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={styles.achievementsGrid}>
            {filteredAchievements.map((ach) => {
              const isUnlocked = ach.unlocked;
              const isClaimed = ach.claimed;

              return (
                <div
                  key={ach.id}
                  style={{
                    ...styles.achCard,
                    borderColor: isUnlocked ? 'rgba(255, 45, 255, 0.4)' : 'var(--border-glass)',
                    opacity: isUnlocked ? 1 : 0.65
                  }}
                  className="glass-card"
                >
                  <div style={styles.achCardHeader}>
                    <div style={{
                      ...styles.achIconBox,
                      background: isUnlocked ? 'rgba(255, 45, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      borderColor: isUnlocked ? 'var(--electric-magenta)' : 'var(--border-glass)'
                    }}>
                      <Award size={22} color={isUnlocked ? 'var(--electric-magenta)' : 'var(--text-muted)'} />
                    </div>
                    <span style={styles.achCategoryBadge}>{ach.category}</span>
                  </div>

                  <div style={styles.achBody}>
                    <h3 className="font-heading" style={styles.achTitle}>{ach.name}</h3>
                    <p style={styles.achDesc}>{ach.description}</p>

                    <div style={styles.achRewardsRow}>
                      <div style={styles.questRewardPill}>
                        <Coins size={12} color="var(--currency-gold)" />
                        <span>+{ach.rewards?.credits}</span>
                      </div>
                      {ach.rewards?.energyCores > 0 && (
                        <div style={styles.questRewardPill}>
                          <Zap size={12} color="#C084FC" />
                          <span>+{ach.rewards?.energyCores} CORES</span>
                        </div>
                      )}
                      <div style={styles.questRewardPill}>
                        <Zap size={12} color="var(--secondary-cyan)" />
                        <span>+{ach.rewards?.xp} XP</span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.achFooter}>
                    {isClaimed ? (
                      <div style={styles.claimedBadge}>
                        <CheckCircle2 size={15} color="var(--status-green)" />
                        <span>MERIT GRANTED</span>
                      </div>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => handleClaimAchievement(ach.id)}
                        disabled={claimingId === ach.id}
                        style={styles.claimAchBtn}
                        className="animate-pulse-glow"
                      >
                        {claimingId === ach.id ? 'AUTHORIZING...' : 'CLAIM MERIT'}
                      </button>
                    ) : (
                      <div style={styles.lockedBadge}>
                        <Lock size={14} color="var(--text-muted)" />
                        <span>LOCKED CRITERIA</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: LIMITED-TIME EVENTS (SECTION 58) ================= */}
      {activeTab === 'EVENTS' && (
        <div style={styles.questsGrid}>
          {events.length === 0 ? (
            <div style={{ ...styles.questCard, textAlign: 'center', padding: '36px' }} className="glass-card">
              <p style={{ color: 'var(--text-muted)' }}>No active limited-time campaigns at this moment. Stand by for fleet transmissions.</p>
            </div>
          ) : (
            events.map((ev) => {
              const pct = Math.min(100, (ev.currentProgress / ev.objective.target) * 100);
              return (
                <div key={ev.id} style={styles.questCard} className="glass-card glass-card-hover">
                  <div style={styles.questHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.15)', border: '1px solid var(--currency-gold)' }}>
                        <Flame size={24} color="var(--currency-gold)" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 className="font-heading" style={styles.questTitle}>{ev.name}</h3>
                          <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>SPECIAL EVENT</span>
                        </div>
                        <p style={styles.questDesc}>{ev.description}</p>
                      </div>
                    </div>

                    <div style={styles.questRewards}>
                      <div style={styles.questRewardPill}>
                        <Coins size={13} color="var(--currency-gold)" />
                        <span>+{ev.reward?.credits}</span>
                      </div>
                      <div style={styles.questRewardPill}>
                        <Zap size={13} color="#C084FC" />
                        <span>+{ev.reward?.energyCores} CORES</span>
                      </div>
                      <div style={styles.questRewardPill}>
                        <Award size={13} color="var(--electric-magenta)" />
                        <span>+{ev.reward?.velopRewardCoins} VELOOP COINS</span>
                      </div>
                    </div>
                  </div>

                  {/* Objective Progress Bar Track */}
                  <div style={styles.questProgressSection}>
                    <div style={styles.progressInfo}>
                      <span style={styles.progressLabel}>OBJECTIVE PROGRESS</span>
                      <span style={styles.progressNums}>
                        {ev.currentProgress} / {ev.objective.target}
                      </span>
                    </div>
                    <div style={styles.questProgressBarTrack}>
                      <div 
                        style={{
                          ...styles.questProgressBarFill,
                          width: `${pct}%`,
                          background: ev.isCompleted ? 'var(--status-green)' : 'var(--currency-gold)'
                        }} 
                      />
                    </div>
                  </div>

                  {/* Event Claim Action Button */}
                  <div style={styles.questFooter}>
                    {ev.isClaimed ? (
                      <div style={styles.claimedBadge}>
                        <CheckCircle2 size={15} color="var(--status-green)" />
                        <span>EVENT REWARDS CLAIMED</span>
                      </div>
                    ) : ev.isCompleted ? (
                      <button
                        onClick={() => handleClaimEvent(ev.id)}
                        disabled={claimingId === ev.id}
                        style={{ ...styles.claimQuestBtn, background: 'linear-gradient(135deg, var(--currency-gold) 0%, #D97706 100%)', color: '#000' }}
                        className="animate-pulse-glow"
                      >
                        {claimingId === ev.id ? 'AUTHORIZING...' : 'CLAIM OPERATION REWARD'}
                      </button>
                    ) : (
                      <div style={styles.inProgressBadge}>
                        <span>IN PROGRESS ({Math.round(pct)}%)</span>
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

const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% 12%, #0F1738 0%, #060919 75%)',
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
  countdownBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 16px',
    borderRadius: '10px',
    border: '1px solid var(--secondary-cyan)'
  },
  countdownVal: {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.95rem',
    color: 'var(--secondary-cyan)',
    letterSpacing: '0.06em'
  },
  countdownLabel: {
    fontSize: '0.62rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em'
  },
  feedbackAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    borderRadius: '10px',
    border: '1px solid',
    fontSize: '0.88rem'
  },
  streakCard: {
    padding: '20px 24px',
    borderRadius: '16px',
    border: '1px solid var(--border-glass)'
  },
  streakHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '16px'
  },
  streakTitle: {
    fontSize: '1.15rem',
    color: 'var(--text-light)',
    margin: 0
  },
  streakSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    margin: '2px 0 0 0'
  },
  streakClaimBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    fontSize: '0.82rem',
    fontWeight: 'bold',
    borderRadius: '10px'
  },
  streakDaysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '10px'
  },
  streakDayBox: {
    padding: '14px 12px',
    borderRadius: '12px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    border: '1px solid var(--border-glass)'
  },
  streakDayNum: {
    fontSize: '0.7rem',
    fontFamily: 'var(--font-heading)',
    color: 'var(--secondary-cyan)',
    letterSpacing: '0.08em'
  },
  streakDayRewards: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px'
  },
  streakRewardRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.72rem',
    fontFamily: 'var(--font-heading)'
  },
  todayPill: {
    fontSize: '0.62rem',
    padding: '2px 8px',
    borderRadius: '6px',
    background: 'rgba(0, 229, 255, 0.25)',
    border: '1px solid var(--secondary-cyan)',
    color: 'var(--secondary-cyan)',
    fontFamily: 'var(--font-heading)'
  },
  checkedPill: {
    fontSize: '0.62rem',
    padding: '2px 8px',
    borderRadius: '6px',
    background: 'rgba(16, 185, 129, 0.2)',
    border: '1px solid var(--status-green)',
    color: 'var(--status-green)',
    fontFamily: 'var(--font-heading)'
  },
  lockedPill: {
    fontSize: '0.62rem',
    padding: '2px 8px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-heading)'
  },
  primaryTabs: {
    display: 'flex',
    gap: '12px',
    marginTop: '6px'
  },
  primaryTabBtn: {
    flex: 1,
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid',
    cursor: 'pointer',
    fontSize: '0.92rem',
    letterSpacing: '0.08em',
    transition: 'all 0.2s ease'
  },
  questsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '16px'
  },
  questCard: {
    padding: '20px',
    borderRadius: '14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '200px',
    border: '1px solid var(--border-glass)'
  },
  questHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px'
  },
  questTitle: {
    fontSize: '1.05rem',
    color: 'var(--text-light)',
    margin: '0 0 4px 0'
  },
  questDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    margin: 0,
    lineHeight: 1.4
  },
  questRewards: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px'
  },
  questRewardPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 8px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.06)',
    fontSize: '0.72rem',
    fontFamily: 'var(--font-heading)'
  },
  questProgressSection: {
    margin: '16px 0'
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.72rem',
    marginBottom: '6px'
  },
  progressLabel: {
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-heading)'
  },
  progressNums: {
    color: 'var(--secondary-cyan)',
    fontFamily: 'var(--font-heading)'
  },
  questProgressBarTrack: {
    width: '100%',
    height: '8px',
    background: 'rgba(0, 0, 0, 0.5)',
    borderRadius: '4px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  },
  questProgressBarFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.25s ease'
  },
  questFooter: {},
  claimQuestBtn: {
    width: '100%',
    padding: '10px',
    fontSize: '0.85rem'
  },
  claimedBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    borderRadius: '10px',
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid var(--status-green)',
    color: 'var(--status-green)',
    fontSize: '0.78rem',
    fontFamily: 'var(--font-heading)'
  },
  inProgressBadge: {
    textAlign: 'center',
    padding: '10px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-heading)'
  },
  achievementsContainer: {},
  achFilterRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  },
  achFilterBtn: {
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border-glass)',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-heading)',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  achievementsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px'
  },
  achCard: {
    padding: '18px',
    borderRadius: '14px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '220px',
    border: '1px solid var(--border-glass)'
  },
  achCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  achIconBox: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    border: '1px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  achCategoryBadge: {
    fontSize: '0.62rem',
    padding: '2px 8px',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.06)',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-heading)'
  },
  achBody: {
    margin: '12px 0'
  },
  achTitle: {
    fontSize: '1.05rem',
    color: 'var(--text-light)',
    margin: '0 0 4px 0'
  },
  achDesc: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    margin: 0,
    lineHeight: 1.4
  },
  achRewardsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '12px',
    flexWrap: 'wrap'
  },
  achFooter: {},
  claimAchBtn: {
    width: '100%',
    padding: '10px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, var(--electric-magenta) 0%, #A855F7 100%)',
    color: '#FFFFFF',
    fontFamily: 'var(--font-heading)',
    fontSize: '0.82rem',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer'
  },
  lockedBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'var(--text-muted)',
    fontSize: '0.72rem',
    fontFamily: 'var(--font-heading)'
  },
  supplyDropCard: {
    padding: '20px 24px',
    borderRadius: '16px',
    border: '1px solid var(--secondary-cyan)',
    background: 'radial-gradient(circle at 15% 50%, rgba(0, 229, 255, 0.12) 0%, rgba(10, 15, 44, 0.85) 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  supplyDropHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  },
  crateIconContainer: {
    padding: '12px',
    borderRadius: '12px',
    background: 'rgba(0, 229, 255, 0.15)',
    border: '1px solid var(--secondary-cyan)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  supplyClaimBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    fontSize: '0.85rem'
  },
  probGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '10px'
  },
  probPill: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '10px',
    background: 'rgba(6, 9, 25, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  }
};

export default QuestsPage;
