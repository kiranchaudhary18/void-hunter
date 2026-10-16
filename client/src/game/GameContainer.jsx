import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import SpaceCombatScene from './scenes/SpaceCombatScene.js';
import soundManager from './managers/SoundManager.js';
import api from '../services/api.js';
import { 
  Shield, Heart, Zap, Pause, Play, RotateCcw, ArrowLeft, Video, Award, Coins, 
  Volume2, VolumeX, AlertTriangle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const GameContainer = ({ 
  mission = { id: 'sector-1-mission-1', name: 'MISSION 01: RECON PATROL', sector: 'Nebula Outpost' },
  ship = { name: 'V-01 ORBITRON', speed: 380, damage: 25 },
  onExit,
  onCompleteMission
}) => {
  const gameRef = useRef(null);
  const phaserGameInstance = useRef(null);

  // Live In-Game HUD State (Screen 6)
  const [stats, setStats] = useState({
    health: 100,
    maxHealth: 100,
    shield: 100,
    maxShield: 100,
    score: 0,
    credits: 0,
    enemiesKilled: 0,
    currentWave: 1,
    maxWaves: 4
  });

  const [isPaused, setIsPaused] = useState(false);
  const [isAbortModalOpen, setIsAbortModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.muted);
  const [waveAnnouncement, setWaveAnnouncement] = useState(null);
  const [gameOverData, setGameOverData] = useState(null);
  const [victoryData, setVictoryData] = useState(null);
  const [adModalOpen, setAdModalOpen] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [adTargetAction, setAdTargetAction] = useState(null); // 'revive' or 'double_credits'
  const [adSessionData, setAdSessionData] = useState(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 800,
      height: 900,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      backgroundColor: '#060919',
      scene: [BootScene, SpaceCombatScene]
    };

    const game = new Phaser.Game(config);
    phaserGameInstance.current = game;

    // Listen to wave announcements
    game.events.on('wave-announcement', (data) => {
      setWaveAnnouncement(`WAVE ${data.wave} OF ${data.maxWaves} INCOMING`);
      setTimeout(() => setWaveAnnouncement(null), 2500);
    });

    // Pass mission and callbacks to SpaceCombatScene when ready
    game.events.on('ready', () => {
      const combatScene = game.scene.getScene('SpaceCombatScene');
      if (combatScene) {
        combatScene.scene.restart({
          missionId: mission.id,
          missionName: mission.name,
          mission: mission,
          ship: ship,
          callbacks: {
            onStatsUpdate: (newStats) => setStats(newStats),
            onGameOver: (result) => setGameOverData(result),
            onVictory: (result) => {
              setVictoryData(result);
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            }
          }
        });
      }
    });

    return () => {
      if (phaserGameInstance.current) {
        phaserGameInstance.current.destroy(true);
      }
    };
  }, [mission.id]);

  // Global Keyboard Shortcuts (Esc or P to Pause/Resume)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (!gameOverData && !victoryData && !adModalOpen) {
          handleTogglePause();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, gameOverData, victoryData, adModalOpen]);

  const handleTogglePause = () => {
    if (!phaserGameInstance.current) return;
    const scene = phaserGameInstance.current.scene.getScene('SpaceCombatScene');
    if (!scene) return;

    if (isPaused) {
      scene.scene.resume();
      setIsPaused(false);
      setIsAbortModalOpen(false);
    } else {
      scene.scene.pause();
      setIsPaused(true);
    }
  };

  const handleToggleMute = () => {
    const m = soundManager.toggleMute();
    setIsMuted(m);
  };

  const handleRestart = () => {
    setGameOverData(null);
    setVictoryData(null);
    setIsPaused(false);
    setIsAbortModalOpen(false);
    if (phaserGameInstance.current) {
      const scene = phaserGameInstance.current.scene.getScene('SpaceCombatScene');
      if (scene) scene.scene.restart();
    }
  };

  const handleConfirmAbort = () => {
    if (phaserGameInstance.current) {
      phaserGameInstance.current.destroy(true);
    }
    onExit();
  };

  // Watch Rewarded Ad flow (Simulated Provider connected to backend 9-state machine)
  const triggerRewardedAd = async (action) => {
    setAdTargetAction(action);
    setAdCountdown(5);
    setAdModalOpen(true);

    try {
      const placement = action === 'revive' ? 'REVIVE' : 'DOUBLE_CREDITS';
      const expectedReward = action === 'revive' 
        ? { currencyType: 'REVIVE', amount: 1 }
        : { currencyType: 'CREDITS', amount: victoryData?.creditsEarned || 200 };

      const res = await api.post('/ads/offer', { placement, expectedReward });
      if (res.data?.success) {
        setAdSessionData(res.data);
      }
    } catch (e) {
      console.warn('Backend ad session fallback:', e.message);
    }

    const timer = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const claimAdReward = async () => {
    // If backend adSession is active, verify and credit ledger
    if (adSessionData?.adId) {
      try {
        await api.post(`/ads/${adSessionData.adId}/verify`);
      } catch (e) {
        console.warn('Ad verify fallback:', e.message);
      }
    }

    setAdModalOpen(false);
    if (adTargetAction === 'revive') {
      setGameOverData(null);
      if (phaserGameInstance.current) {
        const scene = phaserGameInstance.current.scene.getScene('SpaceCombatScene');
        if (scene) scene.revivePlayer();
      }
    } else if (adTargetAction === 'double_credits') {
      if (victoryData) {
        setVictoryData({
          ...victoryData,
          creditsEarned: victoryData.creditsEarned * 2,
          doubled: true
        });
      }
    }
  };

  const [cooldowns, setCooldowns] = useState({});
  const [activeBuffNotification, setActiveBuffNotification] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCooldowns((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach((k) => {
          if (next[k] > 0) {
            next[k] -= 1;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activateAbility = (abilityId, cdDuration = 20) => {
    if (cooldowns[abilityId] > 0) return;
    if (!phaserGameInstance.current) return;
    const scene = phaserGameInstance.current.scene.getScene('SpaceCombatScene');
    if (scene) {
      scene.activatePowerUp(abilityId);
      setCooldowns((prev) => ({ ...prev, [abilityId]: cdDuration }));
      setActiveBuffNotification(abilityId.replace('_', ' ').toUpperCase() + ' ACTIVATED');
      setTimeout(() => setActiveBuffNotification(null), 3000);
    }
  };

  return (
    <div style={styles.gameWrapper}>
      {/* ================= SCREEN 6: TOP HUD OVERLAY ================= */}
      <div style={styles.hudTop} className="glass-panel">
        <div style={styles.hudLeft}>
          <button 
            onClick={() => {
              if (!isPaused) handleTogglePause();
              setIsAbortModalOpen(true);
            }} 
            style={styles.iconBtn} 
            title="Abort Mission & Return to Missions"
          >
            <ArrowLeft size={18} color="var(--text-light)" />
          </button>

          <button 
            onClick={handleTogglePause} 
            style={styles.iconBtn} 
            title={isPaused ? "Resume Combat (Esc/P)" : "Pause Combat (Esc/P)"}
          >
            {isPaused ? <Play size={18} color="var(--secondary-cyan)" /> : <Pause size={18} color="var(--secondary-cyan)" />}
          </button>

          {/* Dual Health & Shield Gauges */}
          <div style={styles.gaugesContainer}>
            {/* Health Bar */}
            <div style={styles.gaugeRow}>
              <Heart size={14} color="var(--status-green)" />
              <div style={styles.barTrack}>
                <div 
                  style={{ ...styles.barFill, width: `${(stats.health / stats.maxHealth) * 100}%`, background: 'var(--status-green)' }} 
                />
              </div>
              <span style={styles.gaugeVal}>{Math.round(stats.health)}</span>
            </div>

            {/* Shield Bar */}
            <div style={styles.gaugeRow}>
              <Shield size={14} color="var(--secondary-cyan)" />
              <div style={styles.barTrack}>
                <div 
                  style={{ ...styles.barFill, width: `${(stats.shield / stats.maxShield) * 100}%`, background: 'var(--secondary-cyan)' }} 
                />
              </div>
              <span style={styles.gaugeVal}>{Math.round(stats.shield)}</span>
            </div>
          </div>
        </div>

        {/* Center: Mission Objective Tracker */}
        <div style={styles.hudCenter}>
          <div className="font-heading" style={styles.missionTitle}>{mission.name}</div>
          <div style={styles.missionWave}>WAVE {stats.currentWave} / {stats.maxWaves} • DESTROY ALL FLEET UNITS</div>
        </div>

        {/* Right: Score & Credits Counters */}
        <div style={styles.hudRight}>
          <div style={styles.scoreCounter}>
            <span style={styles.scoreLabel}>SCORE</span>
            <span className="font-heading" style={styles.scoreNum}>{stats.score.toLocaleString()}</span>
          </div>

          <div className="currency-pill credits" style={{ padding: '4px 10px' }}>
            <Coins size={14} color="var(--currency-gold)" />
            <span>+{stats.credits}</span>
          </div>
        </div>
      </div>

      {/* Sector Boss Dynamic Health Bar Overlay */}
      {stats.boss && (
        <div style={styles.bossHealthBarWrapper} className="glass-panel animate-pulse-glow">
          <div style={styles.bossHealthInfo}>
            <span className="font-heading" style={{ color: '#EF4444', fontWeight: 'bold', letterSpacing: '0.1em' }}>
              💀 {stats.boss.name} [PHASE {stats.boss.phase}]
            </span>
            <span style={{ fontSize: '0.85rem', color: '#E6F1FF', fontFamily: 'var(--font-heading)' }}>
              {Math.round(stats.boss.hp)} / {stats.boss.maxHp} HP
            </span>
          </div>
          <div style={styles.bossTrack}>
            <div 
              style={{
                ...styles.bossFill,
                width: `${Math.max(0, (stats.boss.hp / stats.boss.maxHp) * 100)}%`
              }} 
            />
          </div>
        </div>
      )}

      {/* Phaser Canvas Mount */}
      <div ref={gameRef} style={styles.canvasContainer} />

      {/* Active Buff Notification Banner */}
      {activeBuffNotification && (
        <div style={styles.buffBanner} className="glass-panel animate-pulse-glow">
          <Zap size={16} color="var(--secondary-cyan)" />
          <span className="font-heading" style={{ fontSize: '0.82rem', letterSpacing: '0.08em' }}>
            {activeBuffNotification}
          </span>
        </div>
      )}

      {/* ================= SCREEN 6: MOBILE / ACTION HUD BUTTONS ================= */}
      <div style={styles.actionHud}>
        {/* 1. Spread Shot */}
        <button 
          onClick={() => activateAbility('spread_shot', 22)}
          disabled={cooldowns['spread_shot'] > 0}
          className="glass-card" 
          style={{
            ...styles.abilityBtn,
            opacity: cooldowns['spread_shot'] > 0 ? 0.5 : 1
          }}
          title="Spread Shot (HotKey: 1)"
        >
          {cooldowns['spread_shot'] > 0 ? (
            <span style={styles.cdNum}>{cooldowns['spread_shot']}s</span>
          ) : (
            <>
              <Zap size={20} color="var(--secondary-cyan)" />
              <span style={styles.abilityLabel}>SPREAD</span>
              <span style={styles.hotkeyBadge}>1</span>
            </>
          )}
        </button>

        {/* 2. Shield Pulse */}
        <button 
          onClick={() => activateAbility('shield_pulse', 25)}
          disabled={cooldowns['shield_pulse'] > 0}
          className="glass-card" 
          style={{
            ...styles.abilityBtn,
            opacity: cooldowns['shield_pulse'] > 0 ? 0.5 : 1
          }}
          title="Shield Pulse (HotKey: 2)"
        >
          {cooldowns['shield_pulse'] > 0 ? (
            <span style={styles.cdNum}>{cooldowns['shield_pulse']}s</span>
          ) : (
            <>
              <Shield size={20} color="#C084FC" />
              <span style={styles.abilityLabel}>SHIELD</span>
              <span style={styles.hotkeyBadge}>2</span>
            </>
          )}
        </button>

        {/* 3. Homing Missiles */}
        <button 
          onClick={() => activateAbility('homing_missiles', 30)}
          disabled={cooldowns['homing_missiles'] > 0}
          className="glass-card" 
          style={{
            ...styles.abilityBtn,
            opacity: cooldowns['homing_missiles'] > 0 ? 0.5 : 1
          }}
          title="Homing Missiles (HotKey: 3)"
        >
          {cooldowns['homing_missiles'] > 0 ? (
            <span style={styles.cdNum}>{cooldowns['homing_missiles']}s</span>
          ) : (
            <>
              <Zap size={20} color="#F97316" />
              <span style={styles.abilityLabel}>MISSILES</span>
              <span style={styles.hotkeyBadge}>3</span>
            </>
          )}
        </button>

        {/* 4. EMP Blast */}
        <button 
          onClick={() => activateAbility('emp_blast', 35)}
          disabled={cooldowns['emp_blast'] > 0}
          className="glass-card" 
          style={{
            ...styles.abilityBtn,
            opacity: cooldowns['emp_blast'] > 0 ? 0.5 : 1
          }}
          title="EMP Blast (HotKey: 4)"
        >
          {cooldowns['emp_blast'] > 0 ? (
            <span style={styles.cdNum}>{cooldowns['emp_blast']}s</span>
          ) : (
            <>
              <Zap size={20} color="var(--accent-magenta)" />
              <span style={styles.abilityLabel}>EMP</span>
              <span style={styles.hotkeyBadge}>4</span>
            </>
          )}
        </button>
      </div>

      {/* ================= DEFEAT / REVIVE MODAL ================= */}
      {gameOverData && (
        <div style={styles.modalBackdrop}>
          <div className="glass-panel" style={styles.defeatModal}>
            <span className="badge badge-magenta">HULL INTEGRITY COMPROMISED</span>
            <h2 className="font-heading" style={styles.defeatTitle}>MISSION FAILED</h2>
            <p style={styles.defeatSubtitle}>Your ship was overwhelmed by enemy interceptors.</p>

            <div style={styles.statsSummaryBox} className="glass-card">
              <div>Score: <b>{gameOverData.score.toLocaleString()}</b></div>
              <div>Enemies Destroyed: <b>{gameOverData.enemiesKilled}</b></div>
              <div>Credits Recovered: <b>{gameOverData.creditsCollected}</b></div>
            </div>

            <div style={styles.modalActions}>
              <button 
                onClick={() => triggerRewardedAd('revive')} 
                className="btn btn-cyan"
                style={{ width: '100%', padding: '14px' }}
              >
                <Video size={18} /> WATCH AD TO REVIVE (FULL SHIELDS)
              </button>

              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button onClick={handleRestart} className="btn btn-purple" style={{ flex: 1 }}>
                  <RotateCcw size={16} /> RESTART
                </button>
                <button onClick={onExit} className="btn btn-outline" style={{ flex: 1 }}>
                  <ArrowLeft size={16} /> HANGAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SCREEN 7: VICTORY & REWARDS MODAL ================= */}
      {victoryData && (
        <div style={styles.modalBackdrop}>
          <div className="glass-panel" style={styles.victoryModal}>
            <div style={styles.starsRow}>
              <Award size={36} color="var(--currency-gold)" />
              <Award size={48} color="var(--currency-gold)" style={{ margin: '0 4px' }} />
              <Award size={36} color={victoryData.stars >= 3 ? 'var(--currency-gold)' : 'rgba(255,255,255,0.2)'} />
            </div>

            <h2 className="font-heading" style={styles.victoryTitle}>MISSION COMPLETE!</h2>
            <p style={styles.victorySub}>Sector patrol verified. Airspace secured.</p>

            <div style={styles.rewardsBox} className="glass-card">
              <div style={styles.rewardItem}>
                <Coins size={22} color="var(--currency-gold)" />
                <div>
                  <div style={styles.rewardVal}>+{victoryData.creditsEarned}</div>
                  <div style={styles.rewardLabel}>CREDITS</div>
                </div>
              </div>

              <div style={styles.rewardItem}>
                <Zap size={22} color="#C084FC" />
                <div>
                  <div style={styles.rewardVal}>+5</div>
                  <div style={styles.rewardLabel}>ENERGY CORES</div>
                </div>
              </div>

              <div style={styles.rewardItem}>
                <Award size={22} color="var(--secondary-cyan)" />
                <div>
                  <div style={styles.rewardVal}>+350</div>
                  <div style={styles.rewardLabel}>PILOT XP</div>
                </div>
              </div>
            </div>

            {/* Rewarded Ad Option: 2x Credits */}
            {!victoryData.doubled && (
              <button 
                onClick={() => triggerRewardedAd('double_credits')}
                className="btn btn-magenta"
                style={{ width: '100%', marginBottom: '16px', padding: '12px' }}
              >
                <Video size={18} /> WATCH AD: DOUBLE CREDITS (+{victoryData.creditsEarned * 2})
              </button>
            )}

            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button 
                onClick={() => {
                  if (onCompleteMission) onCompleteMission(victoryData);
                  onExit();
                }} 
                className="btn btn-cyan" 
                style={{ flex: 1, padding: '14px' }}
              >
                CLAIM & CONTINUE
              </button>
              <button onClick={onExit} className="btn btn-outline" style={{ flex: 1 }}>
                CAMPAIGN MAP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SIMULATED REWARDED AD MODAL ================= */}
      {adModalOpen && (
        <div style={styles.adModalBackdrop}>
          <div className="glass-panel" style={styles.adBox}>
            <div style={styles.adHeader}>
              <span className="badge badge-cyan">VELOP SPONSORED TRANSMISSION</span>
              <span style={styles.countdownPill}>
                {adCountdown > 0 ? `Reward in ${adCountdown}s` : 'Reward Ready!'}
              </span>
            </div>

            <div style={styles.adVideoScreen}>
              <Video size={64} color="var(--secondary-cyan)" className="animate-float" />
              <h3 className="font-heading" style={{ marginTop: '16px', fontSize: '1.2rem' }}>
                SUPERCHARGE YOUR FLEET
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '380px', textAlign: 'center' }}>
                Simulating verified Velop advertising partner transmission. Complete playback to claim in-game multiplier.
              </p>
            </div>

            <button 
              onClick={claimAdReward}
              className="btn btn-cyan"
              disabled={adCountdown > 0}
              style={{ width: '100%', padding: '14px' }}
            >
              {adCountdown > 0 ? `REWARD AVAILABLE IN ${adCountdown}S` : 'CLAIM VERIFIED REWARD'}
            </button>
          </div>
        </div>
      )}

      {/* ================= WAVE ANNOUNCEMENT BANNER ================= */}
      {waveAnnouncement && (
        <div style={styles.waveBanner} className="glass-panel animate-pulse-glow">
          <span className="font-heading" style={styles.waveBannerText}>
            ⚡ {waveAnnouncement} ⚡
          </span>
        </div>
      )}

      {/* ================= PAUSE MODAL ================= */}
      {isPaused && !gameOverData && !victoryData && !adModalOpen && !isAbortModalOpen && (
        <div style={styles.modalBackdrop}>
          <div className="glass-panel" style={styles.pauseModal}>
            <span className="badge badge-cyan">SYSTEM PAUSED</span>
            <h2 className="font-heading" style={styles.pauseTitle}>COMBAT SUSPENDED</h2>
            <div style={styles.pauseSub}>
              {mission.name} • WAVE {stats.currentWave} / {stats.maxWaves}
            </div>

            <div style={styles.statsSummaryBox} className="glass-card">
              <div>Score: <b style={{ color: 'var(--secondary-cyan)' }}>{stats.score.toLocaleString()}</b></div>
              <div>Hostiles Neutralized: <b style={{ color: 'var(--text-light)' }}>{stats.enemiesKilled}</b></div>
              <div>Credits: <b style={{ color: 'var(--currency-gold)' }}>+{stats.credits}</b></div>
            </div>

            {/* Quick Controls Reminder */}
            <div style={styles.controlsCheatSheet} className="glass-card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.05em' }}>FLIGHT CONTROLS</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', display: 'flex', justifyContent: 'space-around' }}>
                <span>WASD / Drag : Move</span>
                <span>Space / Click : Laser</span>
                <span>1-4 : Tactical Buffs</span>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button onClick={handleTogglePause} className="btn btn-cyan" style={{ width: '100%', padding: '12px' }}>
                <Play size={18} /> RESUME FLIGHT (ESC / P)
              </button>
              <button onClick={handleRestart} className="btn btn-purple" style={{ width: '100%', padding: '12px' }}>
                <RotateCcw size={18} /> RESTART MISSION
              </button>
              <button onClick={handleToggleMute} className="btn btn-outline" style={{ width: '100%', padding: '12px' }}>
                {isMuted ? <VolumeX size={18} color="#EF4444" /> : <Volume2 size={18} color="var(--secondary-cyan)" />}
                AUDIO SFX: {isMuted ? 'MUTED' : 'ENABLED'}
              </button>
              <button 
                onClick={() => setIsAbortModalOpen(true)} 
                className="btn btn-outline" 
                style={{ width: '100%', padding: '12px', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#EF4444' }}
              >
                <ArrowLeft size={18} /> ABORT TO MISSIONS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ABORT CONFIRMATION MODAL ================= */}
      {isAbortModalOpen && (
        <div style={styles.modalBackdrop}>
          <div className="glass-panel" style={styles.abortModal}>
            <AlertTriangle size={42} color="#EF4444" className="animate-pulse-glow" />
            <h2 className="font-heading" style={{ color: '#EF4444', fontSize: '1.6rem', marginTop: '4px' }}>ABORT MISSION?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '360px', textAlign: 'center', lineHeight: '1.5' }}>
              Are you sure you want to retreat to the hangar? Any unverified telemetry and mid-battle credits from this sortie will be forfeited.
            </p>

            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '12px' }}>
              <button 
                onClick={handleConfirmAbort} 
                className="btn btn-outline" 
                style={{ flex: 1, padding: '12px', borderColor: 'rgba(239, 68, 68, 0.6)', color: '#EF4444' }}
              >
                CONFIRM ABORT
              </button>
              <button 
                onClick={() => {
                  setIsAbortModalOpen(false);
                  if (isPaused) handleTogglePause();
                }} 
                className="btn btn-cyan" 
                style={{ flex: 1, padding: '12px' }}
              >
                RESUME COMBAT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  gameWrapper: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#060919',
    overflow: 'hidden'
  },
  hudTop: {
    position: 'absolute',
    top: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '94%',
    maxWidth: '1000px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    zIndex: 20
  },
  hudLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  iconBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'rgba(0, 229, 255, 0.1)',
    border: '1px solid var(--border-glass)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  gaugesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  gaugeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  barTrack: {
    width: '120px',
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    transition: 'width 0.2s ease'
  },
  gaugeVal: {
    fontSize: '0.72rem',
    fontFamily: 'var(--font-ui)',
    fontWeight: '700',
    width: '24px'
  },
  hudCenter: {
    textAlign: 'center'
  },
  missionTitle: {
    fontSize: '0.95rem',
    color: 'var(--text-light)',
    letterSpacing: '0.08em'
  },
  missionWave: {
    fontSize: '0.68rem',
    color: 'var(--secondary-cyan)',
    letterSpacing: '0.06em',
    marginTop: '2px'
  },
  hudRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  scoreCounter: {
    textAlign: 'right'
  },
  scoreLabel: {
    display: 'block',
    fontSize: '0.6rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.08em',
    fontFamily: 'var(--font-heading)'
  },
  scoreNum: {
    fontSize: '1.1rem',
    color: 'var(--text-light)'
  },
  canvasContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionHud: {
    position: 'absolute',
    bottom: 24,
    right: 28,
    display: 'flex',
    gap: '12px',
    zIndex: 20
  },
  buffBanner: {
    position: 'absolute',
    top: 80,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    borderRadius: '20px',
    border: '1px solid var(--secondary-cyan)',
    color: 'var(--secondary-cyan)',
    zIndex: 25,
    background: 'rgba(6, 9, 25, 0.9)'
  },
  abilityBtn: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    cursor: 'pointer',
    background: 'rgba(10, 15, 44, 0.85)',
    border: '1px solid var(--border-glass)'
  },
  abilityLabel: {
    fontSize: '0.62rem',
    fontFamily: 'var(--font-heading)',
    color: 'var(--text-light)',
    marginTop: '3px'
  },
  hotkeyBadge: {
    position: 'absolute',
    top: '3px',
    right: '5px',
    fontSize: '0.58rem',
    fontFamily: 'var(--font-heading)',
    color: 'var(--text-muted)'
  },
  cdNum: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1rem',
    color: '#EF4444',
    fontWeight: '700'
  },
  modalBackdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(6, 9, 25, 0.85)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: '20px'
  },
  defeatModal: {
    maxWidth: '460px',
    width: '100%',
    padding: '36px 32px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    boxShadow: '0 0 40px rgba(239, 68, 68, 0.25)'
  },
  defeatTitle: {
    fontSize: '1.8rem',
    color: '#EF4444'
  },
  defeatSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
  },
  statsSummaryBox: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    fontSize: '0.85rem',
    padding: '14px'
  },
  modalActions: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '8px'
  },
  victoryModal: {
    maxWidth: '480px',
    width: '100%',
    padding: '36px 32px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
    border: '1px solid rgba(0, 229, 255, 0.4)',
    boxShadow: '0 0 45px rgba(0, 229, 255, 0.25)'
  },
  starsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '6px'
  },
  victoryTitle: {
    fontSize: '2rem',
    color: 'var(--secondary-cyan)'
  },
  victorySub: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
  },
  rewardsBox: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-around',
    padding: '16px',
    margin: '8px 0'
  },
  rewardItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textAlign: 'left'
  },
  rewardVal: {
    fontFamily: 'var(--font-heading)',
    fontSize: '1.05rem',
    color: 'var(--text-light)',
    lineHeight: 1
  },
  rewardLabel: {
    fontSize: '0.62rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.06em'
  },
  adModalBackdrop: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.92)',
    backdropFilter: 'blur(12px)',
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
    gap: '20px'
  },
  adHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  countdownPill: {
    fontSize: '0.75rem',
    padding: '4px 10px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    fontFamily: 'var(--font-heading)'
  },
  adVideoScreen: {
    height: '240px',
    background: 'radial-gradient(circle at center, rgba(124, 58, 237, 0.3) 0%, rgba(6, 9, 25, 0.95) 80%)',
    borderRadius: '12px',
    border: '1px solid var(--border-glass)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px'
  },
  bossHealthBarWrapper: {
    position: 'absolute',
    top: '72px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '90%',
    maxWidth: '560px',
    padding: '10px 18px',
    zIndex: 25,
    border: '1px solid rgba(239, 68, 68, 0.4)',
    background: 'rgba(69, 10, 10, 0.75)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  bossHealthInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  bossTrack: {
    width: '100%',
    height: '10px',
    background: 'rgba(0, 0, 0, 0.6)',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1px solid rgba(239, 68, 68, 0.5)'
  },
  bossFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #DC2626 0%, #EF4444 60%, #FF2DFF 100%)',
    borderRadius: '6px',
    transition: 'width 0.15s ease'
  },
  pauseModal: {
    maxWidth: '480px',
    width: '100%',
    padding: '32px 28px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
    border: '1px solid rgba(0, 229, 255, 0.4)',
    boxShadow: '0 0 45px rgba(0, 229, 255, 0.2)'
  },
  pauseTitle: {
    fontSize: '1.8rem',
    color: 'var(--secondary-cyan)',
    letterSpacing: '0.08em'
  },
  pauseSub: {
    fontSize: '0.88rem',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-heading)'
  },
  controlsCheatSheet: {
    width: '100%',
    padding: '10px 14px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px'
  },
  abortModal: {
    maxWidth: '420px',
    width: '100%',
    padding: '32px 28px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    boxShadow: '0 0 40px rgba(239, 68, 68, 0.25)'
  },
  waveBanner: {
    position: 'absolute',
    top: '90px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '10px 24px',
    border: '1px solid var(--currency-gold)',
    boxShadow: '0 0 25px rgba(251, 191, 36, 0.3)',
    zIndex: 25,
    pointerEvents: 'none',
    borderRadius: '8px'
  },
  waveBannerText: {
    color: 'var(--currency-gold)',
    fontSize: '0.95rem',
    letterSpacing: '0.12em',
    fontWeight: '700'
  }
};

export default GameContainer;
