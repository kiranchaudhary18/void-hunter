import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import soundManager from '../game/managers/SoundManager.js';
import confetti from 'canvas-confetti';
import { 
  X, Calendar, Flame, Gift, CheckCircle2, Lock, 
  Coins, Zap, Award, Sparkles, Clock, AlertCircle, Package, Shield, 
  Trophy, ArrowRight, Star
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

  const [loading, setLoading] = useState(true);
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

  return (
    <>
      <div className="streak-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
        <div 
          className="streak-modal-panel cyber-panel" 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tech HUD Corner Accents */}
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
                  <Flame size={26} color="#FBBF24" />
                </div>
              </div>
              <div>
                <div className="streak-modal-badge-row">
                  <span className="streak-modal-eyebrow">// FLEET RETENTION PROTOCOL</span>
                  <span className="streak-modal-counter">
                    DAY {currentDay} OF 7 ACTIVE
                  </span>
                  <span className="streak-consecutive-chip">
                    {streakData.currentStreak} CONSECUTIVE {streakData.currentStreak === 1 ? 'DAY' : 'DAYS'}
                  </span>
                </div>
                <h2 className="streak-modal-heading">DAILY DEPLOYMENT STREAK</h2>
                <p className="streak-modal-subtext">
                  Report for daily combat duty to claim escalating tactical credits, energy cores, and unlock the Day 7 Imperial Mystery Crate.
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="streak-modal-close-btn" 
              title="Close Daily Streak"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Energy Pipeline Progress Bar */}
          <div className="streak-pipeline-container" aria-label="7-Day Energy Pipeline">
            <div className="streak-pipeline-track">
              <div 
                className="streak-pipeline-fill"
                style={{ 
                  width: `${Math.min(100, Math.round(((currentDay - (streakData.canClaimToday ? 1 : 0)) / 7) * 100))}%` 
                }} 
              />
            </div>
            <div className="streak-pipeline-nodes">
              {rewardsList.map((tier) => {
                const isPassed = tier.day < currentDay || (tier.day === currentDay && !streakData.canClaimToday);
                const isCurrent = tier.day === currentDay;
                return (
                  <div 
                    key={tier.day} 
                    className={`pipeline-node ${isPassed ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}
                    title={`Day ${tier.day}`}
                  >
                    {isPassed ? <CheckCircle2 size={10} /> : <span>{tier.day}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="streak-modal-feedback error">
              <AlertCircle size={16} color="#EF4444" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 7-Day Interactive Grid */}
          <div className="streak-days-grid">
            {rewardsList.map((tier) => {
              const isToday = tier.day === currentDay;
              const isClaimed = tier.day < currentDay || (isToday && !streakData.canClaimToday);
              const isAvailable = isToday && streakData.canClaimToday;
              const isLocked = tier.day > currentDay;
              const isMystery = !!tier.isMysteryCrate || tier.day === 7;

              return (
                <div 
                  key={tier.day}
                  onClick={() => isClaimed && handleInspectReward(tier)}
                  className={`streak-day-card ${isMystery ? 'mystery-card' : ''} ${isAvailable ? 'available' : ''} ${isClaimed ? 'claimed' : ''} ${isLocked ? 'locked' : ''}`}
                  title={isClaimed ? 'Click to inspect secured airdrop' : undefined}
                >
                  {/* Subtle Tech Corner Brackets */}
                  <span className="card-bracket bracket-tl" />
                  <span className="card-bracket bracket-tr" />
                  <span className="card-bracket bracket-bl" />
                  <span className="card-bracket bracket-br" />

                  {isMystery && <div className="mystery-aurora" aria-hidden="true" />}
                  {isAvailable && <div className="available-scanline" aria-hidden="true" />}

                  <div className="streak-day-card-header">
                    <span className="streak-day-number">DAY 0{tier.day}</span>
                    {isClaimed && <span className="streak-status-pill claimed"><CheckCircle2 size={10} /> CLAIMED</span>}
                    {isAvailable && <span className="streak-status-pill ready"><Sparkles size={10} /> READY</span>}
                    {isLocked && <span className="streak-status-pill locked"><Lock size={10} /> LOCKED</span>}
                  </div>

                  {/* Icon Slot with 3D Crate Glow */}
                  <div className="streak-day-icon-slot">
                    {isMystery ? (
                      <div className="mystery-crate-icon-box">
                        <Gift size={36} className="mystery-crate-svg" />
                        <div className="mystery-sparkle-halo" />
                      </div>
                    ) : (
                      <div className={`crate-icon-bubble ${isAvailable ? 'pulsing' : ''}`}>
                        {tier.cores > 0 ? (
                          <Zap size={28} color={isClaimed ? '#20D6A0' : '#C084FC'} />
                        ) : (
                          <Coins size={28} color={isClaimed ? '#20D6A0' : '#FBBF24'} />
                        )}
                      </div>
                    )}
                  </div>

                  <div className="streak-day-label">
                    {isMystery ? 'MYSTERY CRATE' : tier.label?.split(':')[1]?.trim() || `Tier ${tier.day}`}
                  </div>

                  {/* Rewards Breakdown Chips */}
                  <div className="streak-day-rewards-list">
                    <div className="streak-reward-pill gold">
                      <Coins size={12} />
                      <span>+{tier.credits.toLocaleString()} CR</span>
                    </div>
                    {tier.cores > 0 && (
                      <div className="streak-reward-pill purple">
                        <Zap size={12} />
                        <span>+{tier.cores} {tier.cores === 1 ? 'CORE' : 'CORES'}</span>
                      </div>
                    )}
                    {tier.coins > 0 && (
                      <div className="streak-reward-pill cyan">
                        <Award size={12} />
                        <span>+{tier.coins} VELOOP</span>
                      </div>
                    )}
                  </div>

                  {/* Click to inspect hint if claimed */}
                  {isClaimed && (
                    <div className="claimed-inspect-hint">
                      <span>INSPECT LOOT</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Modal Footer & Actions */}
          <div className="streak-modal-footer">
            <div className="streak-footer-timer">
              <div className="timer-icon-wrap">
                <Clock size={18} color="#00E5FF" />
              </div>
              <div>
                <span className="timer-label">NEXT AIRDROP RESET IN</span>
                <span className="timer-value">{countdown}</span>
              </div>
            </div>

            <div className="streak-footer-action">
              {streakData.canClaimToday ? (
                <button 
                  id="btn-claim-daily-streak"
                  onClick={handleClaim}
                  disabled={claiming}
                  className="streak-claim-btn ready-btn"
                >
                  <Sparkles size={18} />
                  <span>{claiming ? 'AUTHORIZING LEDGER...' : `CLAIM DAY ${currentDay} AIRDROP`}</span>
                </button>
              ) : (
                <button 
                  onClick={() => {
                    const currentRewardTier = rewardsList.find((r) => r.day === currentDay) || rewardsList[0];
                    handleInspectReward(currentRewardTier);
                  }}
                  className="streak-claim-btn view-secured-btn"
                  title="Click to view celebration & rewards secured today"
                >
                  <CheckCircle2 size={16} />
                  <span>TODAY'S AIRDROP SECURED (VIEW LOOT)</span>
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
            <span className="hud-corner hud-tl" style={{ borderColor: '#FBBF24' }} aria-hidden="true" />
            <span className="hud-corner hud-tr" style={{ borderColor: '#FBBF24' }} aria-hidden="true" />
            <span className="hud-corner hud-bl" style={{ borderColor: '#FBBF24' }} aria-hidden="true" />
            <span className="hud-corner hud-br" style={{ borderColor: '#FBBF24' }} aria-hidden="true" />

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
                // COMBAT AIRDROP SECURED //
              </span>
              <span className="celebration-sparkle-dot" />
            </div>

            {/* Floating Crate with Particle Ring */}
            <div className="celebration-crate-stage">
              <div className="celebration-aura-ring" />
              <div className="celebration-crate-box">
                {celebrationReward.isMysteryCrate || celebrationReward.day === 7 ? (
                  <Gift size={72} className="celebration-crate-icon gold" />
                ) : (
                  <Package size={72} className="celebration-crate-icon cyan" />
                )}
              </div>
            </div>

            <h2 className="celebration-title">
              {celebrationReward.label || `DAY ${celebrationReward.day} COMBAT CRATE`}
            </h2>
            <p className="celebration-subtitle">
              Supply authorization verified on double-entry ledger. All tactical assets have been deposited into your pilot wallet.
            </p>

            {/* Rewarded Asset Tiles */}
            <div className="celebration-assets-grid">
              {/* Credits Tile */}
              <div className="celebration-asset-card gold">
                <div className="asset-icon-box gold">
                  <Coins size={28} />
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
                    <Zap size={28} />
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
                    <Award size={28} />
                  </div>
                  <div className="asset-info">
                    <span className="asset-type">VELOP COINS</span>
                    <span className="asset-amount">+{celebrationReward.coins} VELOOP</span>
                  </div>
                </div>
              )}
            </div>

            {/* Collect Button */}
            <div className="celebration-action-row">
              <button 
                className="celebration-collect-btn"
                onClick={() => {
                  soundManager.playLaser();
                  setCelebrationReward(null);
                }}
              >
                <Sparkles size={18} />
                <span>COLLECT & RETURN TO COMMAND DECK</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DailyStreakModal;
