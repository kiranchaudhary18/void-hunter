/**
 * WebAudio & HTML5 Dual-Engine Arcade Sound Synthesizer & BGM Player
 * Provides cinematic, rich soundtrack playback and authentic retro-modern sci-fi SFX.
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.sfxVolume = 0.8;
    this.bgmVolume = 0.85;
    this.muted = false;
    this.bgmPlaying = false;
    this.bgmMode = null; // 'menu' | 'combat'
    this.desiredBgmMode = 'menu';
    this.autoplayBlocked = false;
    this.audioUnlocked = false;
    this.listeners = new Set();

    // Purely instrumental AAA sci-fi electronic soundtrack catalog (Zero vocal / zero narration)
    this.playlist = [
      { id: 'menu', title: 'VOID HUNTER // CYBER DRIVE', subtitle: 'SYNTHWAVE BEAT (124 BPM)', bpm: 124, hasLyrics: false },
      { id: 'combat', title: 'SECTOR OVERDRIVE', subtitle: 'COMBAT FRENZY (138 BPM)', bpm: 138, hasLyrics: false }
    ];

    // HTML5 Audio Elements for Studio-Quality Instrumental Playback
    this.tracks = {
      menu: null,
      combat: null
    };

    if (typeof window !== 'undefined') {
      try {
        const menuAudio = new Audio('/audio/ambient_theme.wav');
        menuAudio.loop = true;
        menuAudio.preload = 'auto';

        const combatAudio = new Audio('/audio/combat_theme.wav');
        combatAudio.loop = true;
        combatAudio.preload = 'auto';

        this.tracks.menu = menuAudio;
        this.tracks.combat = combatAudio;
      } catch (e) {
        console.warn('Audio element initialization notice:', e);
      }

      // Universal user gesture handler to unlock audio context & play BGM smoothly
      const handleUserGesture = () => {
        this.unlockAudio();
      };

      window.addEventListener('pointerdown', handleUserGesture, { capture: true });
      window.addEventListener('mousedown', handleUserGesture, { capture: true });
      window.addEventListener('click', handleUserGesture, { capture: true });
      window.addEventListener('keydown', handleUserGesture, { capture: true });
      window.addEventListener('touchstart', handleUserGesture, { capture: true });
    }
  }

  getState() {
    return {
      bgmPlaying: this.bgmPlaying,
      bgmMode: this.bgmMode || this.desiredBgmMode || 'vocal',
      muted: this.muted,
      bgmVolume: this.bgmVolume,
      sfxVolume: this.sfxVolume,
      autoplayBlocked: this.autoplayBlocked,
      playlist: this.playlist || []
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach((fn) => {
      try {
        fn({
          bgmPlaying: this.bgmPlaying,
          bgmMode: this.bgmMode || this.desiredBgmMode,
          muted: this.muted,
          bgmVolume: this.bgmVolume,
          sfxVolume: this.sfxVolume,
          autoplayBlocked: this.autoplayBlocked,
          playlist: this.playlist
        });
      } catch (err) {
        console.error(err);
      }
    });
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  unlockAudio() {
    this.audioUnlocked = true;
    this.init();

    if (!this.muted && (!this.bgmPlaying || this.autoplayBlocked)) {
      const isCombat = typeof window !== 'undefined' && 
        (window.location.pathname.includes('combat') || window.location.pathname.includes('gameplay'));
      const target = this.desiredBgmMode || (isCombat ? 'combat' : 'menu');
      this.startBGM(target);
    }
  }

  setVolumes(sfx, bgm) {
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    this.bgmVolume = Math.max(0, Math.min(1, bgm));
    this.updateVolumes();
    this.notifyListeners();
  }

  toggleMute() {
    this.muted = !this.muted;
    this.updateVolumes();
    if (!this.muted && !this.bgmPlaying) {
      const isCombat = typeof window !== 'undefined' && 
        (window.location.pathname.includes('combat') || window.location.pathname.includes('gameplay'));
      this.startBGM(this.desiredBgmMode || (isCombat ? 'combat' : 'menu'));
    }
    this.notifyListeners();
    return this.muted;
  }

  updateVolumes() {
    const activeVolume = this.muted ? 0 : this.bgmVolume;
    ['menu', 'combat'].forEach((key) => {
      if (this.tracks[key]) {
        this.tracks[key].volume = this.bgmMode === key ? activeVolume : 0;
      }
    });
  }

  nextTrack() {
    const ids = this.playlist.map((p) => p.id);
    const currentIdx = ids.indexOf(this.bgmMode || this.desiredBgmMode);
    const nextIdx = (currentIdx + 1) % ids.length;
    this.startBGM(ids[nextIdx]);
  }

  prevTrack() {
    const ids = this.playlist.map((p) => p.id);
    const currentIdx = ids.indexOf(this.bgmMode || this.desiredBgmMode);
    const prevIdx = (currentIdx - 1 + ids.length) % ids.length;
    this.startBGM(ids[prevIdx]);
  }

  setTrack(trackId) {
    if (this.tracks[trackId]) {
      this.startBGM(trackId);
    }
  }

  // ==================== BACKGROUND SOUNDTRACK CONTROLLER ====================
  startBGM(mode = 'menu') {
    this.init();
    this.desiredBgmMode = mode;

    if (this.bgmPlaying && this.bgmMode === mode) return;

    const targetTrack = this.tracks[mode] || this.tracks.menu || this.tracks.combat;

    // Pause all other tracks
    ['menu', 'combat'].forEach((key) => {
      if (key !== mode && this.tracks[key]) {
        try {
          this.tracks[key].pause();
          this.tracks[key].currentTime = 0;
        } catch {}
      }
    });

    // Play active track
    if (targetTrack) {
      targetTrack.volume = this.muted ? 0 : this.bgmVolume;
      const playPromise = targetTrack.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.bgmPlaying = true;
            this.bgmMode = mode;
            this.autoplayBlocked = false;
            this.notifyListeners();
          })
          .catch((err) => {
            // Blocked by browser autoplay policy awaiting user gesture
            console.log('[SoundManager] Autoplay waiting for user gesture:', err.message);
            this.bgmPlaying = false;
            this.autoplayBlocked = true;
            this.notifyListeners();
          });
      }
    }
  }

  stopBGM() {
    this.bgmPlaying = false;
    ['menu', 'combat'].forEach((key) => {
      if (this.tracks[key]) {
        try { this.tracks[key].pause(); } catch {}
      }
    });
    this.notifyListeners();
  }

  // Electrical shield shatter sound when shield drops to 0
  playShieldBreak() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.28);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(900, this.ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.24 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.28);
      osc2.stop(this.ctx.currentTime + 0.28);
    } catch {}
  }

  // Deep metallic impact thud when direct hull damage is sustained
  playHullImpact() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(170, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(32, this.ctx.currentTime + 0.22);

      gain.gain.setValueAtTime(0.32 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch {}
  }

  // Rising high-tech harmonic tone when shields start regenerating
  playShieldRecharge() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, this.ctx.currentTime + 0.22);

      gain.gain.setValueAtTime(0.09 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch {}
  }

  // ==================== SFX GENERATORS ====================
  playLaser() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(920, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.11);

    gain.gain.setValueAtTime(0.18 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.11);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.11);
  }

  playRocketLaunch() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  playEnemyLaser() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.14);

    gain.gain.setValueAtTime(0.12 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.14);
  }

  playExplosion(isLarge = false) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const duration = isLarge ? 0.48 : 0.26;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isLarge ? 380 : 750, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime((isLarge ? 0.38 : 0.22) * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + duration);
  }

  playShieldHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(640, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playPickup(type = 'credit') {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = type === 'core' 
      ? [523.25, 659.25, 783.99, 1046.50] 
      : [659.25, 880.00, 1174.66];
      
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.05);

      gain.gain.setValueAtTime(0.18 * this.sfxVolume, this.ctx.currentTime + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.05 + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.05);
      osc.stop(this.ctx.currentTime + idx * 0.05 + 0.09);
    });
  }

  playPowerUp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playBossAlarm() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    for (let i = 0; i < 2; i++) {
      const startTime = this.ctx.currentTime + i * 0.45;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, startTime);
      osc.frequency.linearRampToValueAtTime(140, startTime + 0.35);

      gain.gain.setValueAtTime(0.3 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    }
  }

  playBossLaser() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.35 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  // ==================== ADVANCED MOBILE SFX & HAPTICS ====================
  playEmpBlast() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Sub-bass resonance + electrical static discharge
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.38);

    gain.gain.setValueAtTime(0.35 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.38);
    this.playHaptic('emp');
  }

  playBombDetonate() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Seismic Charge sub-bass boom + heavy shockwave
    this.playExplosion(true);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(28, this.ctx.currentTime + 0.55);

    gain.gain.setValueAtTime(0.45 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.55);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.55);
    this.playHaptic('bomb');
  }

  playWarpJump() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Ascending futuristic dimensional phase-shift sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1250, this.ctx.currentTime + 0.28);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.28);
    this.playHaptic('warp');
  }

  playHomingMissiles() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Quad rapid micro-rocket launch sequence
    [0, 0.06, 0.12, 0.18].forEach((offset) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime + offset);
      osc.frequency.exponentialRampToValueAtTime(1100, this.ctx.currentTime + offset + 0.09);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume, this.ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + offset + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + offset);
      osc.stop(this.ctx.currentTime + offset + 0.09);
    });
    this.playHaptic('powerup');
  }

  playCriticalAlarm() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Pulsing tactical danger alert for low hull
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.setValueAtTime(440, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
    this.playHaptic('hit');
  }

  playVictoryFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // 5-chord heroic cyber arpeggio
    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    chord.forEach((freq, idx) => {
      const startTime = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
    this.playHaptic('victory');
  }

  // Precision Aerospace UI Feedback (Clean, non-intrusive micro-audio)
  playUiClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2200, this.ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.08 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    } catch {
      // Audio context safety fallback
    }
  }

  playUiHover() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(980, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1250, this.ctx.currentTime + 0.015);

      gain.gain.setValueAtTime(0.03 * this.sfxVolume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.015);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.015);
    } catch {
      // Audio context safety fallback
    }
  }

  // Cross-device haptic feedback engine (navigator.vibrate)
  playHaptic(profile = 'light') {
    if (typeof window === 'undefined' || !window.navigator || !window.navigator.vibrate) return;
    try {
      const profiles = {
        light: 12,
        fire: 10,
        hit: 38,
        powerup: [25, 35, 45],
        bomb: [90, 40, 120, 40, 160],
        emp: [60, 30, 90],
        warp: [40, 50, 70],
        bossAlarm: [90, 70, 90],
        bossDefeat: [60, 60, 90, 60, 180],
        victory: [50, 70, 50, 70, 160],
        defeat: [140, 70, 180]
      };
      const pattern = profiles[profile] || (Array.isArray(profile) ? profile : 15);
      window.navigator.vibrate(pattern);
    } catch {
      // Ignored if user settings or device block vibration
    }
  }

}

export const soundManager = new SoundManager();
export default soundManager;
