/**
 * WebAudio & HTML5 Dual-Engine Arcade Sound Synthesizer & BGM Player
 * Provides cinematic, rich soundtrack playback and authentic retro-modern sci-fi SFX.
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.sfxVolume = 0.7;
    this.bgmVolume = 0.55;
    this.muted = false;
    this.bgmPlaying = false;
    this.bgmMode = null; // 'menu' | 'combat'
    this.listeners = new Set();

    // HTML5 Audio Elements for Studio-Quality Soundtrack Playback
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

      // Auto-start BGM on very first user interaction anywhere on the website
      const initAudioOnGesture = () => {
        this.init();
        if (!this.muted && !this.bgmPlaying) {
          const isCombat = window.location.pathname.includes('combat') || window.location.pathname.includes('gameplay');
          this.startBGM(isCombat ? 'combat' : 'menu');
        }
        window.removeEventListener('pointerdown', initAudioOnGesture);
        window.removeEventListener('mousedown', initAudioOnGesture);
        window.removeEventListener('click', initAudioOnGesture);
        window.removeEventListener('keydown', initAudioOnGesture);
        window.removeEventListener('touchstart', initAudioOnGesture);
      };

      window.addEventListener('pointerdown', initAudioOnGesture, { once: true });
      window.addEventListener('mousedown', initAudioOnGesture, { once: true });
      window.addEventListener('click', initAudioOnGesture, { once: true });
      window.addEventListener('keydown', initAudioOnGesture, { once: true });
      window.addEventListener('touchstart', initAudioOnGesture, { once: true });
    }
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
          bgmMode: this.bgmMode,
          muted: this.muted,
          bgmVolume: this.bgmVolume,
          sfxVolume: this.sfxVolume
        });
      } catch (e) {
        console.error(e);
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
      this.startBGM(isCombat ? 'combat' : 'menu');
    }
    this.notifyListeners();
    return this.muted;
  }

  updateVolumes() {
    const activeVolume = this.muted ? 0 : this.bgmVolume;
    if (this.tracks.menu) {
      this.tracks.menu.volume = this.bgmMode === 'menu' ? activeVolume * 0.75 : 0;
    }
    if (this.tracks.combat) {
      this.tracks.combat.volume = this.bgmMode === 'combat' ? activeVolume * 0.85 : 0;
    }
  }

  // ==================== BACKGROUND SOUNDTRACK CONTROLLER ====================
  startBGM(mode = 'menu') {
    this.init();
    if (this.bgmPlaying && this.bgmMode === mode) return;

    this.bgmMode = mode;
    this.bgmPlaying = true;

    const targetTrack = mode === 'combat' ? this.tracks.combat : this.tracks.menu;
    const fadeTrack = mode === 'combat' ? this.tracks.menu : this.tracks.combat;

    // Fade out inactive track
    if (fadeTrack) {
      try {
        fadeTrack.pause();
        fadeTrack.currentTime = 0;
      } catch {}
    }

    // Play active track
    if (targetTrack) {
      targetTrack.volume = this.muted ? 0 : this.bgmVolume * (mode === 'combat' ? 0.85 : 0.75);
      const playPromise = targetTrack.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // If blocked by browser autoplay policy, it will resume on next click
          console.log('Audio autoplay awaiting user gesture:', err.message);
        });
      }
    }

    this.notifyListeners();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.tracks.menu) {
      try { this.tracks.menu.pause(); } catch {}
    }
    if (this.tracks.combat) {
      try { this.tracks.combat.pause(); } catch {}
    }
    this.notifyListeners();
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
}

export const soundManager = new SoundManager();
export default soundManager;
