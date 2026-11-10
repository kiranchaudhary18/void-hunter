import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import soundManager from '../game/managers/SoundManager.js';
import confetti from 'canvas-confetti';
import { 
  X, Flame, CheckCircle2, Lock, 
  Coins, Zap, Award, Sparkles, Clock, AlertCircle 
} from 'lucide-react';
import { DAILY_LOGIN_STREAK_REWARDS } from '../data/questsData.js';
import './DailyStreakModal.css';

// Multi-stage confetti fireworks celebration
const triggerCelebrationConfetti = () => {
  try {
    // Wave 1: Center blast
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.55 },
      colors: ['#00E5FF', '#FBBF24', '#8B5CF6', '#20D6A0', '#FF2DFF']
    });

    // Wave 2: Left cannon
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 60,
        origin: { x: 0.1, y: 0.65 },
        colors: ['#FBBF24', '#F59E0B', '#FFFBEB', '#00E5FF']
      });
    }, 250);

    // Wave 3: Right cannon
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 60,
        origin: { x: 0.9, y: 0.65 },
        colors: ['#8B5CF6', '#C084FC', '#00E5FF', '#FBBF24']
      });
    }, 450);
  } catch (err) {
    console.warn('Confetti trigger error:', err);
  }
};

export const DailyStreakModal = ({ isOpen, onClose, onRewardClaimed, initialData }) => {
  const [streakData, setStreakData] = useState({
    currentStreak: initialData?.currentStreak || 1,
    streakDay: initialData?.streakDay || 1,
    canClaimToday: initialData?.canClaimToday ?? false,
    rewardsTable: initialData?.rewardsTable || DAILY_LOGIN_STREAK_REWARDS
  });

  const [, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [countdown, setCountdown] = useState('24:00:00');
  const [errorMsg, setErrorMsg] = useState(null);

  // Epic Celebration Overlay State
  const [celebrationReward, setCelebrationReward] = useState(null);

  useEffect(() => {
    if (initialData) {
      setStreakData((prev) => ({
        ...prev,
        currentStreak: initialData.currentStreak || prev.currentStreak,
        streakDay: initialData.streakDay || prev.streakDay,
        canClaimToday: initialData.canClaimToday ?? prev.canClaimToday,
        rewardsTable: initialData.rewardsTable || prev.rewardsTable
      }));
    }
  }, [initialData]);

  // Fetch live streak data from server
  const fetchStreakStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/quests');
      const payload = res.data || res;
      if (payload?.success && payload.streak) {
        setStreakData({
          currentStreak: payload.streak.currentStreak || 1,
          streakDay: payload.streak.streakDay || 1,
          canClaimToday: !!payload.streak.canClaimToday,
          rewardsTable: payload.streak.rewardsTable || DAILY_LOGIN_STREAK_REWARDS
        });
      }
    } catch (err) {
      console.warn('Daily streak fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStreakStatus();
      setErrorMsg(null);
    }
  }, [isOpen]);

  // Midnight countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const diff = Math.max(0, tomorrow.getTime() - now.getTime());
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setCountdown(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = async () => {
    if (!streakData.canClaimToday || claiming) return;
    try {
      setClaiming(true);
      setErrorMsg(null);
      soundManager.playLaser();

      const res = await api.post('/quests/streak/claim');
      const payload = res.data || res;
      if (payload?.success || res.success) {
        // Trigger multi-stage audio
        soundManager.playPowerUp();
        setTimeout(() => soundManager.playPickup('core'), 300);

        // Fire multi-stage fireworks
        triggerCelebrationConfetti();

        // Open Grand Celebration Modal
        const currentRewardTier = rewardsList.find((r) => r.day === currentDay) || rewardsList[0];
        setCelebrationReward(payload.reward || currentRewardTier);

        // Update local streak state
        setStreakData((prev) => ({
          ...prev,
          canClaimToday: false,
          currentStreak: payload.updatedBalances?.streak || prev.currentStreak
        }));

        if (onRewardClaimed) {
          onRewardClaimed(payload);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to claim daily deployment reward';
      setErrorMsg(msg);
      soundManager.playShieldHit();
    } finally {
      setClaiming(false);
    }
  };

  // Inspect or replay celebration for any day
  const handleInspectReward = (tier) => {
    soundManager.playLaser();
    triggerCelebrationConfetti();
    setCelebrationReward(tier);
  };

  if (!isOpen) return null;

  const currentDay = streakData.streakDay || 1;
  const rewardsList = streakData.rewardsTable?.length ? streakData.rewardsTable : DAILY_LOGIN_STREAK_REWARDS;

  // Rarity tier mapping matching Option 2 AAA Holographic Supply Drop design
  const getTierVisual = (day, isMystery) => {
    if (isMystery || day === 7) {
      return {
        rarityKey: 'apex',
        rarityTitle: 'GOLDEN APEX CRATE',
        crateImg: '/assets/rewards/crate_golden_apex.jpg'
      };
    }
    if (day === 2 || day === 3 || day === 6) {
      return {
        rarityKey: 'epic',
        rarityTitle: 'AMETHYST EPIC',
        crateImg: '/assets/rewards/crate_amethyst_epic.jpg'
      };
    }
    return {
      rarityKey: 'rare',
      rarityTitle: 'CYAN RARE',
      crateImg: '/assets/rewards/crate_cyan_rare.jpg'
    };
  };

  const celebrationVisual = celebrationReward
    ? getTierVisual(celebrationReward.day || 1, celebrationReward.isMysteryCrate)
    : null;

  return (
    <>
      <div className="streak-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
        <div 
          className="streak-modal-panel cyber-panel aaa-supply-modal" 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Option 2 Top Energy Notch */}
          <span className="aaa-modal-top-notch" aria-hidden="true" />
          <span className="hud-corner hud-tl" aria-hidden="true" />
          <span className="hud-corner hud-tr" aria-hidden="true" />
          <span className="hud-corner hud-bl" aria-hidden="true" />
          <span className="hud-corner hud-br" aria-hidden="true" />

          {/* Modal Header */}
          <div className="streak-modal-header">
            <div className="streak-modal-title-wrap">
              <div className="streak-flame-wrapper">
                <div className="streak-flame-glow" />
                <div className="streak-modal-flame-icon">
                  <Flame size={24} color="#FACC15" />
                </div>
              </div>
              <div>
                <div className="streak-modal-badge-row">
                  <span className="streak-modal-eyebrow">TACTICAL REWARDS</span>
                  <span className="streak-modal-counter">
                    DAY {currentDay} / 7
                  </span>
                  <span className="streak-consecutive-chip">
                    {streakData.currentStreak} DAY STREAK
                  </span>
                </div>
                <h2 className="streak-modal-heading">7-DAY SUPPLY DROP</h2>
                <p className="streak-modal-subtext">
                  Claim escalating Cryo Canisters, Amethyst Crates, and unlock the Day 7 Golden Apex Mystery Crate.
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="streak-modal-close-btn" 
              title="Close Supply Drop"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="streak-modal-feedback error">
              <AlertCircle size={16} color="#FF4D5A" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 7-Day Interactive 3D Loot Crate Grid */}
          <div className="streak-days-grid">
            {rewardsList.map((tier) => {
              const isToday = tier.day === currentDay;
              const isClaimed = tier.day < currentDay || (isToday && !streakData.canClaimToday);
              const isAvailable = isToday && streakData.canClaimToday;
              const isLocked = tier.day > currentDay;
              const isMystery = !!tier.isMysteryCrate || tier.day === 7;
              const visual = getTierVisual(tier.day, isMystery);

              return (
                <div 
                  key={tier.day}
                  onClick={() => {
                    if (isAvailable) {
                      handleClaim();
                    } else if (isClaimed) {
                      handleInspectReward(tier);
                    }
                  }}
                  className={`streak-day-card rarity-${visual.rarityKey} ${isMystery ? 'mystery-card' : ''} ${isAvailable ? 'available' : ''} ${isClaimed ? 'claimed' : ''} ${isLocked ? 'locked' : ''}`}
                  title={
                    isAvailable
                      ? `Click to claim Day ${tier.day} Supply Drop`
                      : isClaimed
                        ? 'Click to inspect secured crate loot'
                        : `Unlocks on Day ${tier.day}`
                  }
                >
                  {isMystery && <div className="mystery-aurora" aria-hidden="true" />}
                  {isAvailable && <div className="available-shimmer" aria-hidden="true" />}

                  {/* Rarity Header Banner */}
                  <div className={`crate-rarity-banner rarity-${visual.rarityKey}`}>
                    <span>{visual.rarityTitle}</span>
                  </div>

                  {/* 3D Illustrated Crate Stage */}
                  <div className="streak-day-icon-slot">
                    <div className={`crate-aura-glow rarity-${visual.rarityKey}`} aria-hidden="true" />
                    <img
                      src={visual.crateImg}
                      alt={visual.rarityTitle}
                      className={`crate-render-img ${isAvailable ? 'floating' : ''}`}
                      loading="eager"
                    />
                    {isLocked && (
                      <div className="crate-lock-badge" title="Locked">
                        <Lock size={11} />
                      </div>
                    )}
                    {isClaimed && (
                      <div className="crate-claimed-check" title="Claimed">
                        <CheckCircle2 size={13} />
                      </div>
                    )}
                  </div>

                  {/* Day Marker */}
                  <div className="streak-day-marker-row">
                    <span className="streak-day-number">DAY {tier.day}</span>
                    {isAvailable && <span className="streak-status-pill ready"><Sparkles size={9} /> READY</span>}
                    {isClaimed && <span className="streak-status-pill claimed">SECURED</span>}
                  </div>

                  {/* Clean Compact Reward Chips */}
                  <div className="streak-day-rewards-list">
                    <div className="streak-reward-pill gold">
                      <Coins size={11} />
                      <span>+{tier.credits.toLocaleString()}</span>
                    </div>
                    {tier.cores > 0 && (
                      <div className="streak-reward-pill purple">
                        <Zap size={11} />
                        <span>+{tier.cores} {tier.cores === 1 ? 'CORE' : 'CORES'}</span>
                      </div>
                    )}
                    {tier.coins > 0 && (
                      <div className="streak-reward-pill cyan">
                        <Award size={11} />
                        <span>+{tier.coins} VELOOP</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 7-Segment Holographic Day Progress Track (Option 2 Style) */}
          <div className="aaa-day-progress-section" aria-label="7-Day Supply Drop Progress">
            <div className="aaa-day-progress-label-row">
              <span className="aaa-day-progress-title">DAY PROGRESS</span>
              <span className="aaa-day-progress-meta">
                {streakData.canClaimToday ? `${Math.max(0, currentDay - 1)} / 7 CLAIMED` : `${currentDay} / 7 CLAIMED`}
              </span>
            </div>
            <div className="aaa-day-segments">
              {rewardsList.map((tier) => {
                const isCompleted = tier.day < currentDay || (tier.day === currentDay && !streakData.canClaimToday);
                const isActiveSegment = tier.day === currentDay && streakData.canClaimToday;
                return (
                  <div
                    key={tier.day}
                    className={`aaa-day-seg ${isCompleted ? 'completed' : ''} ${isActiveSegment ? 'active' : ''}`}
                    title={`Day ${tier.day}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Modal Footer & Primary CTA */}
          <div className="streak-modal-footer">
            <div className="streak-footer-timer">
              <div className="timer-icon-wrap">
                <Clock size={17} color="#00F0FF" />
              </div>
              <div>
                <span className="timer-label">NEXT DROP RESET</span>
                <span className="timer-value">{countdown}</span>
              </div>
            </div>

            <div className="streak-footer-action">
              {streakData.canClaimToday ? (
                <button 
                  id="btn-claim-daily-streak"
                  onClick={handleClaim}
                  disabled={claiming}
                  className="aaa-btn-claim streak-claim-primary-cta"
                >
                  <Sparkles size={18} />
                  <span>{claiming ? 'UNLOCKING CRATE...' : 'CLAIM SUPPLY DROP'}</span>
                </button>
              ) : (
                <button 
                  onClick={() => {
                    const currentRewardTier = rewardsList.find((r) => r.day === currentDay) || rewardsList[0];
                    handleInspectReward(currentRewardTier);
                  }}
                  className="streak-claim-btn view-secured-btn"
                  title="Inspect rewards secured today"
                >
                  <CheckCircle2 size={16} />
                  <span>DROP SECURED • VIEW LOOT</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= GRAND CELEBRATION SHOWCASE MODAL ================= */}
      {celebrationReward && (
        <div 
          className="celebration-overlay-backdrop" 
          onClick={() => setCelebrationReward(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="celebration-rays-bg" aria-hidden="true" />

          <div 
            className="celebration-showcase-card cyber-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tech Corners */}
            <span className="hud-corner hud-tl" style={{ borderColor: '#FACC15' }} aria-hidden="true" />
            <span className="hud-corner hud-tr" style={{ borderColor: '#FACC15' }} aria-hidden="true" />
            <span className="hud-corner hud-bl" style={{ borderColor: '#FACC15' }} aria-hidden="true" />
            <span className="hud-corner hud-br" style={{ borderColor: '#FACC15' }} aria-hidden="true" />

            {/* Glowing Close Button */}
            <button 
              className="celebration-close-btn" 
              onClick={() => setCelebrationReward(null)}
              aria-label="Close Celebration"
            >
              <X size={20} />
            </button>

            {/* Top Eyebrow & Starburst */}
            <div className="celebration-badge-row">
              <span className="celebration-sparkle-dot" />
              <span className="celebration-eyebrow">
                {'// SUPPLY DROP UNLOCKED //'}
              </span>
              <span className="celebration-sparkle-dot" />
            </div>

            {/* Floating 3D Crate Showcase */}
            <div className="celebration-crate-stage">
              <div className="celebration-aura-ring" />
              <div className="celebration-crate-box">
                <img
                  src={celebrationVisual?.crateImg || '/assets/rewards/crate_golden_apex.jpg'}
                  alt="Unlocked Supply Crate"
                  className="celebration-crate-3d-img"
                />
              </div>
            </div>

            <h2 className="celebration-title">
              {celebrationReward.label || `DAY ${celebrationReward.day} SUPPLY CRATE`}
            </h2>
            <p className="celebration-subtitle">
              Loot telemetry verified. All combat credits, energy cores, and tokens have been added to your hangar vault!
            </p>

            {/* Rewarded Asset Tiles */}
            <div className="celebration-assets-grid">
              {/* Credits Tile */}
              <div className="celebration-asset-card gold">
                <div className="asset-icon-box gold">
                  <Coins size={26} />
                </div>
                <div className="asset-info">
                  <span className="asset-type">TACTICAL CREDITS</span>
                  <span className="asset-amount">+{celebrationReward.credits.toLocaleString()} CR</span>
                </div>
              </div>

              {/* Energy Cores Tile */}
              {celebrationReward.cores > 0 && (
                <div className="celebration-asset-card purple">
                  <div className="asset-icon-box purple">
                    <Zap size={26} />
                  </div>
                  <div className="asset-info">
                    <span className="asset-type">ENERGY CORES</span>
                    <span className="asset-amount">+{celebrationReward.cores} CORES</span>
                  </div>
                </div>
              )}

              {/* VELOOP Coins Tile (Day 7 / Bonus) */}
              {celebrationReward.coins > 0 && (
                <div className="celebration-asset-card cyan">
                  <div className="asset-icon-box cyan">
                    <Award size={26} />
                  </div>
                  <div className="asset-info">
                    <span className="asset-type">VELOOP TOKENS</span>
                    <span className="asset-amount">+{celebrationReward.coins} VELOOP</span>
                  </div>
                </div>
              )}
            </div>

            {/* Collect Button */}
            <div className="celebration-action-row">
              <button 
                className="cyber-action-btn-primary"
                style={{ width: '100%' }}
                onClick={() => {
                  soundManager.playLaser();
                  setCelebrationReward(null);
                }}
              >
                <Sparkles size={18} />
                <span>COLLECT &amp; DEPLOY</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DailyStreakModal;
