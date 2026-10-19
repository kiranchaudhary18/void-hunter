import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import SpaceCombatScene from './scenes/SpaceCombatScene.js';
import soundManager from './managers/SoundManager.js';
import api from '../services/api.js';
import { 
  Shield, Heart, Zap, Pause, Play, RotateCcw, ArrowLeft, Video, Award, Coins, 
  Volume2, VolumeX, AlertTriangle, Compass, Star, Crosshair, Target, Timer, Rocket, Flame 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const formatCombatTimer = (seconds = 0) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const GameContainer = ({ 
  mission = { id: 'sector-1-mission-1', name: 'MISSION 01: RECON PATROL', sector: 'Nebula Outpost', globalSequence: 1 },
  ship = { name: 'V-01 ORBITRON', speed: 380, damage: 25 },
  onExit,
  onCompleteMission,
  onNextMission
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

    // Start Procedural Synth Combat BGM
    soundManager.startBGM('combat');

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
            onGameOver: (result) => {
              soundManager.stopBGM();
              setGameOverData(result);
            },
            onVictory: (result) => {
              soundManager.stopBGM();
              setVictoryData(result);
              confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              if (onCompleteMission) onCompleteMission(result);
            }
          }
        });
      }
    });

    return () => {
      soundManager.startBGM('menu');
      if (phaserGameInstance.current) {
        phaserGameInstance.current.destroy(true);
      }
    };
  }, [mission.id]);

  const handleTogglePause = React.useCallback(() => {
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
  }, [isPaused]);

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
  }, [handleTogglePause, gameOverData, victoryData, adModalOpen]);

  const handleToggleMute = () => {
    const m = soundManager.toggleMute();
    setIsMuted(m);
  };

  const handleRestart = () => {
    setGameOverData(null);
    setVictoryData(null);
    setIsPaused(false);
    setIsAbortModalOpen(false);
    soundManager.startBGM('combat');
    if (phaserGameInstance.current) {
      const scene = phaserGameInstance.current.scene.getScene('SpaceCombatScene');
      if (scene) scene.scene.restart();
    }
  };

  const handleConfirmAbort = () => {
    soundManager.startBGM('menu');
    if (phaserGameInstance.current) {
      phaserGameInstance.current.destroy(true);
    }
    onExit('missions');
  };

  // Watch Rewarded Ad flow (Simulated Provider connected to backend 9-state machine)
  const triggerRewardedAd = async (action) => {
    setAdTargetAction(action);
    setAdCountdown(5);
    setAdModalOpen(true);

    try {
      let placement = 'DOUBLE_CREDITS';
      let expectedReward = { currencyType: 'CREDITS', amount: victoryData?.creditsEarned || 200 };

      if (action === 'revive') {
        placement = 'REVIVE';
        expectedReward = { currencyType: 'REVIVE', amount: 1 };
      } else if (action === 'double_score') {
        placement = 'DOUBLE_SCORE';
        expectedReward = { currencyType: 'SCORE', amount: victoryData?.score || 1000 };
      } else if (action === 'emergency_shield') {
        placement = 'POWER_UP';
        expectedReward = { currencyType: 'SHIELD', amount: 100 };
      }

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
        setVictoryData((prev) => ({
          ...prev,
          creditsEarned: prev.creditsEarned * 2,
          doubledCredits: true
        }));
      }
    } else if (adTargetAction === 'double_score') {
      if (victoryData) {
        setVictoryData((prev) => ({
          ...prev,
          score: prev.score * 2,
          doubledScore: true
        }));
      }
    } else if (adTargetAction === 'emergency_shield') {
      if (phaserGameInstance.current) {
        const scene = phaserGameInstance.current.scene.getScene('SpaceCombatScene');
        if (scene) {
          scene.playerShield = scene.playerMaxShield;
          scene.emitStats();
        }
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
      <div className="glass-panel cyber-box game-hud-top-bar" style={styles.hudTop}>
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

          <button 
            onClick={handleToggleMute} 
            style={styles.iconBtn} 
            title={isMuted ? "Unmute Audio & Music" : "Mute Audio & Music"}
          >
            {isMuted ? <VolumeX size={18} color="#EF4444" /> : <Volume2 size={18} color="var(--secondary-cyan)" />}
          </button>

          {/* Dual Health & Shield Gauges */}
          <div style={styles.gaugesContainer}>
            {/* Health Bar */}
            <div style={styles.gaugeRow}>
              <Heart size={14} color="var(--status-green)" style={{ filter: 'drop-shadow(0 0 4px #10B981)' }} />
              <div className="game-hud-bar-track" style={styles.barTrack}>
                <div 
                  style={{ 
                    ...styles.barFill, 
                    width: `${Math.max(0, Math.min(100, (stats.health / stats.maxHealth) * 100))}%`, 
                    background: 'linear-gradient(90deg, #059669 0%, #10B981 60%, #00E5FF 100%)',
                    boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
                  }} 
                />
              </div>
              <span style={{ ...styles.gaugeVal, color: '#10B981' }}>{Math.round(stats.health)}</span>
            </div>

            {/* Shield Bar */}
            <div style={styles.gaugeRow}>
              <Shield size={14} color="var(--secondary-cyan)" style={{ filter: 'drop-shadow(0 0 4px #00E5FF)' }} />
              <div className="game-hud-bar-track" style={styles.barTrack}>
                <div 
                  style={{ 
                    ...styles.barFill, 
                    width: `${Math.max(0, Math.min(100, (stats.shield / stats.maxShield) * 100))}%`, 
                    background: 'linear-gradient(90deg, #0099FF 0%, #00E5FF 60%, #C084FC 100%)',
                    boxShadow: '0 0 8px rgba(0, 229, 255, 0.6)'
                  }} 
                />
              </div>
              <span style={{ ...styles.gaugeVal, color: 'var(--secondary-cyan)' }}>{Math.round(stats.shield)}</span>
            </div>
          </div>
        </div>

        {/* Center: Mission Objective & Live Combat Timer */}
        <div style={styles.hudCenter}>
          <div className="font-heading text-glow-cyan" style={styles.missionTitle}>{mission.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
            <span className="badge badge-cyan" style={{ fontSize: '0.64rem', padding: '2px 8px' }}>
              WAVE {stats.currentWave} / {stats.maxWaves}
            </span>
            <span className="badge badge-gold" style={{ fontSize: '0.66rem', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace' }}>
              <Timer size={11} color="var(--currency-gold)" />
              {formatCombatTimer(stats.elapsedTime || 0)}
            </span>
            <span className="game-hud-hide-mobile" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              HOSTILE FLEET ENGAGEMENT
            </span>
          </div>
        </div>

        {/* Right: Score & Credits Counters */}
        <div style={styles.hudRight}>
          <div style={styles.scoreCounter}>
            <span style={styles.scoreLabel}>COMBAT SCORE</span>
            <span className="font-heading text-glow-gold" style={styles.scoreNum}>{stats.score.toLocaleString()}</span>
          </div>

          <div className="currency-pill credits" style={{ padding: '5px 12px' }}>
            <Coins size={14} color="var(--currency-gold)" />
            <span>+{stats.credits}</span>
          </div>
        </div>
      </div>

      {/* Sector Boss Dynamic Health Bar Overlay */}
      {stats.boss && (
        <div style={styles.bossHealthBarWrapper} className="glass-panel cyber-box animate-pulse-glow">
          <div style={styles.bossHealthInfo}>
            <span className="font-heading text-glow-magenta" style={{ color: '#EF4444', fontWeight: 'bold', letterSpacing: '0.1em' }}>
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

      {/* Phaser Canvas Mount with Arcade Viewport Enclosure */}
      <div className="combat-hud-enclosure" style={styles.canvasEnclosure}>
        <div ref={gameRef} style={styles.canvasContainer} />
      </div>

      {/* Active Buff Notification Banner */}
      {activeBuffNotification && (
        <div style={styles.buffBanner} className="glass-panel animate-pulse-glow">
          <Zap size={16} color="var(--secondary-cyan)" />
          <span className="font-heading text-glow-cyan" style={{ fontSize: '0.82rem', letterSpacing: '0.08em' }}>
            {activeBuffNotification}
          </span>
        </div>
      )}

      {/* ================= SCREEN 6: TOUCH JOYSTICK & ARCADE TRIGGER BUTTONS ================= */}
      {/* Bottom-Left Tactical Bomb / Missile Launcher Button (Matching Reference Game) */}
      <div className="game-tactical-bomb">
        <button
          onClick={() => activateAbility('homing_missiles', 12)}
          disabled={cooldowns['homing_missiles'] > 0}
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: cooldowns['homing_missiles'] > 0 
              ? 'radial-gradient(circle, #27272a 0%, #09090b 100%)' 
              : 'radial-gradient(circle, #854d0e 0%, #451a03 60%, #1c1917 100%)',
            border: cooldowns['homing_missiles'] > 0 ? '3px solid #52525b' : '3px solid #f59e0b',
            boxShadow: cooldowns['homing_missiles'] > 0 ? 'none' : '0 0 22px rgba(245, 158, 11, 0.7), inset 0 0 10px rgba(251, 191, 36, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: cooldowns['homing_missiles'] > 0 ? 'not-allowed' : 'pointer',
            position: 'relative',
            transition: 'all 0.2s ease',
            outline: 'none'
          }}
          title="Tactical Missile Salvo (Key B / 3)"
        >
          <div style={{
            position: 'absolute',
            top: '-5px',
            left: '-5px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#09090b',
            border: '2px solid #f59e0b',
            color: '#fef08a',
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'monospace'
          }}>
            B
          </div>
          <Rocket size={24} color={cooldowns['homing_missiles'] > 0 ? '#71717a' : '#fef08a'} />
          <span style={{
            fontSize: '10px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            color: cooldowns['homing_missiles'] > 0 ? '#ef4444' : '#fde047',
            marginTop: '2px'
          }}>
            {cooldowns['homing_missiles'] > 0 ? `${cooldowns['homing_missiles']}s` : 'READY'}
          </span>
        </button>
      </div>

      {/* Bottom-Right Tactile Circular Arcade Ability Buttons (Screen 6) */}
      <div className="game-action-hud-cluster">
        {/* Ability 1: Spread */}
        <button
          onClick={() => activateAbility('spread_shot', 20)}
          disabled={cooldowns['spread_shot'] > 0}
          className="circular-ability-btn"
          style={{
            ...styles.circularAbilityBtn,
            borderColor: 'var(--secondary-cyan)',
            boxShadow: cooldowns['spread_shot'] > 0 ? 'none' : '0 0 15px rgba(0, 229, 255, 0.4)'
          }}
          title="Spread Laser (1)"
        >
          {cooldowns['spread_shot'] > 0 ? (
            <span style={styles.cdNum}>{cooldowns['spread_shot']}s</span>
          ) : (
            <Crosshair size={22} color="var(--secondary-cyan)" />
          )}
        </button>

        {/* Ability 2: Shield */}
        <button
          onClick={() => activateAbility('shield_pulse', 25)}
          disabled={cooldowns['shield_pulse'] > 0}
          className="circular-ability-btn"
          style={{
            ...styles.circularAbilityBtn,
            borderColor: '#C084FC',
            boxShadow: cooldowns['shield_pulse'] > 0 ? 'none' : '0 0 15px rgba(192, 132, 252, 0.4)'
          }}
          title="Shield Pulse (2)"
        >
          {cooldowns['shield_pulse'] > 0 ? (
            <span style={styles.cdNum}>{cooldowns['shield_pulse']}s</span>
          ) : (
            <Shield size={22} color="#C084FC" />
          )}
        </button>

        {/* Ability 3: Warp */}
        <button
          onClick={() => activateAbility('emergency_warp', 30)}
          disabled={cooldowns['emergency_warp'] > 0}
          className="circular-ability-btn"
          style={{
            ...styles.circularAbilityBtn,
            borderColor: '#38BDF8',
            boxShadow: cooldowns['emergency_warp'] > 0 ? 'none' : '0 0 15px rgba(56, 189, 248, 0.4)'
          }}
          title="Emergency Warp (3)"
        >
          {cooldowns['emergency_warp'] > 0 ? (
            <span style={styles.cdNum}>{cooldowns['emergency_warp']}s</span>
          ) : (
            <Zap size={22} color="#38BDF8" />
          )}
        </button>

        {/* Primary Fire Arcade Button (Large Circle) */}
        <button
          onClick={() => activateAbility('homing_missiles', 15)}
          className="circular-fire-btn animate-pulse-glow"
          style={{
            ...styles.circularPrimaryFireBtn,
            boxShadow: '0 0 25px rgba(0, 229, 255, 0.6)'
          }}
          title="Primary Sortie Fire / Missiles (Space)"
        >
          <Target size={28} color="#060919" />
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
                <button onClick={() => onExit('missions')} className="btn btn-outline" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Compass size={16} /> MISSIONS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SCREEN 7: VICTORY & REWARDS MODAL ================= */}
      {victoryData && (
        <div style={styles.modalBackdrop}>
          <div className="glass-panel cyber-box animate-pulse-glow" style={styles.screen7VictoryModal}>
            {/* 3 Golden Stars */}
            <div style={styles.screen7StarsRow}>
              <Star size={44} color="#FBBF24" fill="#FBBF24" style={{ filter: 'drop-shadow(0 0 12px #FBBF24)' }} />
              <Star size={58} color="#FBBF24" fill="#FBBF24" style={{ filter: 'drop-shadow(0 0 20px #F59E0B)', margin: '0 8px', transform: 'translateY(-4px)' }} />
              <Star size={44} color="#FBBF24" fill="#FBBF24" style={{ filter: 'drop-shadow(0 0 12px #FBBF24)' }} />
            </div>

            <h2 className="font-heading text-glow-cyan" style={styles.screen7Title}>MISSION COMPLETE</h2>
            <div style={{ height: '4px' }} />

            {/* Twin Panels: Left Telemetry vs Right Rewards */}
            <div style={styles.screen7TwinGrid}>
              {/* Left Box: Mission Telemetry */}
              <div style={styles.screen7TelemetryBox} className="glass-card">
                <div style={styles.screen7TelemetryHeader}>
                  <div className="font-heading text-glow-cyan" style={{ fontSize: '0.98rem' }}>
                    {mission.name || 'MISSION 12'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {mission.sector || 'Asteroid Belt'} • Difficulty: Normal
                  </div>
                </div>

                <div style={styles.screen7TelemetryList}>
                  <div style={styles.screen7TelemRow}>
                    <span style={styles.screen7TelemLabel}>TIME TAKEN</span>
                    <span style={styles.screen7TelemVal}>02:35</span>
                  </div>
                  <div style={styles.screen7TelemRow}>
                    <span style={styles.screen7TelemLabel}>ENEMIES DESTROYED</span>
                    <span style={styles.screen7TelemVal}>{victoryData.enemiesKilled || 48}</span>
                  </div>
                  <div style={styles.screen7TelemRow}>
                    <span style={styles.screen7TelemLabel}>ACCURACY</span>
                    <span style={styles.screen7TelemVal}>92%</span>
                  </div>
                  <div style={styles.screen7TelemRow}>
                    <span style={styles.screen7TelemLabel}>DAMAGE TAKEN</span>
                    <span style={styles.screen7TelemVal}>12%</span>
                  </div>
                </div>
              </div>

              {/* Right Box: Rewards */}
              <div style={styles.screen7RewardsBox} className="glass-card">
                <div className="font-heading text-glow-gold" style={{ fontSize: '0.92rem', marginBottom: '14px', letterSpacing: '0.08em' }}>
                  REWARDS
                </div>

                <div style={styles.screen7RewardItemsRow}>
                  <div style={styles.screen7RewardItem}>
                    <div style={styles.screen7RewardIconGold}>
                      <Coins size={24} color="var(--currency-gold)" />
                    </div>
                    <div className="font-heading text-glow-gold" style={styles.screen7RewardValGold}>
                      {victoryData.creditsEarned || 350}
                    </div>
                    <div style={styles.screen7RewardLabel}>Credits</div>
                  </div>

                  <div style={styles.screen7RewardItem}>
                    <div style={styles.screen7RewardIconPurple}>
                      <Zap size={24} color="#C084FC" />
                    </div>
                    <div className="font-heading text-glow-purple" style={styles.screen7RewardValPurple}>
                      5
                    </div>
                    <div style={styles.screen7RewardLabel}>Gems</div>
                  </div>

                  <div style={styles.screen7RewardItem}>
                    <div style={styles.screen7RewardIconCyan}>
                      <Award size={24} color="var(--secondary-cyan)" />
                    </div>
                    <div className="font-heading text-glow-cyan" style={styles.screen7RewardValCyan}>
                      500
                    </div>
                    <div style={styles.screen7RewardLabel}>Experience</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rewarded Multipliers */}
            <div style={{ display: 'flex', gap: '10px', width: '100%', margin: '14px 0 10px 0' }}>
              {!victoryData.doubledCredits && (
                <button 
                  onClick={() => triggerRewardedAd('double_credits')}
                  className="btn btn-magenta"
                  style={{ flex: 1, padding: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Video size={15} /> 2X CREDITS (+{(victoryData.creditsEarned || 350) * 2})
                </button>
              )}
              {!victoryData.doubledScore && (
                <button 
                  onClick={() => triggerRewardedAd('double_score')}
                  className="btn btn-purple"
                  style={{ flex: 1, padding: '10px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Video size={15} /> 2X SCORE (+{(victoryData.score || 12450).toLocaleString()})
                </button>
              )}
            </div>

            {/* Screen 7 Bottom Buttons: RETRY MISSION / NEXT MISSION (Cyan) / BACK TO MAP */}
            <div style={styles.screen7ActionsRow}>
              <button 
                onClick={handleRestart} 
                className="btn btn-outline" 
                style={styles.screen7SecondaryBtn}
              >
                RETRY MISSION
              </button>

              <button 
                onClick={async () => {
                  setVictoryData(null);
                  if (onCompleteMission) {
                    await onCompleteMission(victoryData);
                  }
                  if (onNextMission) {
                    onNextMission(mission);
                  } else {
                    onExit('missions');
                  }
                }} 
                className="btn btn-cyan animate-pulse-glow" 
                style={styles.screen7PrimaryBtn}
              >
                <Play size={16} fill="currentColor" />
                <span>NEXT MISSION</span>
              </button>

              <button 
                onClick={async () => {
                  setVictoryData(null);
                  if (onCompleteMission) {
                    await onCompleteMission(victoryData);
                  }
                  onExit('missions');
                }} 
                className="btn btn-outline" 
                style={styles.screen7SecondaryBtn}
              >
                <Compass size={16} />
                <span>BACK TO MAP</span>
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
    maxWidth: '1020px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    borderRadius: '14px',
    zIndex: 20
  },
  hudLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  iconBtn: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    background: 'rgba(0, 229, 255, 0.12)',
    border: '1px solid var(--border-glass)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  gaugesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  gaugeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  barTrack: {
    width: '140px',
    height: '8px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '4px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.12)'
  },
  barFill: {
    height: '100%',
    transition: 'width 0.2s ease',
    borderRadius: '4px'
  },
  gaugeVal: {
    fontSize: '0.75rem',
    fontFamily: 'var(--font-ui)',
    fontWeight: '700',
    width: '28px'
  },
  hudCenter: {
    textAlign: 'center'
  },
  missionTitle: {
    fontSize: '1rem',
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
    fontSize: '1.15rem',
    color: 'var(--currency-gold)'
  },
  canvasEnclosure: {
    position: 'relative',
    width: '800px',
    height: '900px',
    maxWidth: '100vw',
    maxHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px'
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
    maxHeight: '90vh',
    overflowY: 'auto',
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
  screen6Joystick: {
    position: 'absolute',
    bottom: '28px',
    left: '28px',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    border: '2px dashed rgba(0, 229, 255, 0.35)',
    background: 'rgba(0, 229, 255, 0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 20
  },
  screen6JoystickInner: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'radial-gradient(circle at center, rgba(0, 229, 255, 0.6) 0%, rgba(0, 229, 255, 0.1) 80%)',
    border: '1px solid rgba(0, 229, 255, 0.8)',
    boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)'
  },
  screen6ActionHud: {
    position: 'absolute',
    bottom: '24px',
    right: '28px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    zIndex: 20
  },
  circularAbilityBtn: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: 'rgba(6, 9, 25, 0.85)',
    border: '2px solid rgba(0, 229, 255, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  circularPrimaryFireBtn: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00E5FF 0%, #0099FF 100%)',
    border: '2px solid #FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  screen7VictoryModal: {
    maxWidth: '620px',
    width: '92%',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '32px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid rgba(0, 229, 255, 0.4)',
    boxShadow: '0 0 50px rgba(0, 229, 255, 0.25)',
    borderRadius: '18px'
  },
  screen7StarsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    marginBottom: '2px'
  },
  screen7Title: {
    fontSize: '1.9rem',
    color: 'var(--secondary-cyan)',
    letterSpacing: '0.08em',
    margin: 0
  },
  screen7TwinGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
    width: '100%',
    marginTop: '12px'
  },
  screen7TelemetryBox: {
    padding: '16px',
    borderRadius: '12px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  screen7TelemetryHeader: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '8px'
  },
  screen7TelemetryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  screen7TelemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.78rem'
  },
  screen7TelemLabel: {
    color: 'var(--text-muted)',
    fontSize: '0.68rem',
    letterSpacing: '0.06em'
  },
  screen7TelemVal: {
    color: 'var(--text-light)',
    fontFamily: 'var(--font-heading)',
    fontWeight: '700'
  },
  screen7RewardsBox: {
    padding: '16px',
    borderRadius: '12px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  screen7RewardItemsRow: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    gap: '8px'
  },
  screen7RewardItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },
  screen7RewardIconGold: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: 'rgba(251, 191, 36, 0.15)',
    border: '1px solid rgba(251, 191, 36, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  screen7RewardIconPurple: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: 'rgba(192, 132, 252, 0.15)',
    border: '1px solid rgba(192, 132, 252, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  screen7RewardIconCyan: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    background: 'rgba(0, 229, 255, 0.15)',
    border: '1px solid rgba(0, 229, 255, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  screen7RewardValGold: {
    color: 'var(--currency-gold)',
    fontSize: '1.05rem',
    fontWeight: 'bold'
  },
  screen7RewardValPurple: {
    color: '#C084FC',
    fontSize: '1.05rem',
    fontWeight: 'bold'
  },
  screen7RewardValCyan: {
    color: 'var(--secondary-cyan)',
    fontSize: '1.05rem',
    fontWeight: 'bold'
  },
  screen7RewardLabel: {
    fontSize: '0.66rem',
    color: 'var(--text-muted)'
  },
  screen7ActionsRow: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    marginTop: '6px'
  },
  screen7PrimaryBtn: {
    flex: 1.4,
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '0.86rem',
    fontWeight: 'bold'
  },
  screen7SecondaryBtn: {
    flex: 1,
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '0.78rem'
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
