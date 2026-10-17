/**
 * WebAudio Arcade Sound Synthesizer & Procedural BGM Engine
 * Generates authentic retro-modern sci-fi sound effects and dynamic synthwave music
 * with zero external asset loading dependencies.
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.sfxVolume = 0.7;
    this.bgmVolume = 0.45;
    this.muted = false;
    this.bgmPlaying = false;
    this.bgmMode = null; // 'combat' | 'menu'
    this.bgmGainNode = null;
    this.bgmTimer = null;
    this.nextNoteTime = 0;
    this.currentStep = 0;
    this.activeNodes = new Set();
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.bgmGainNode = this.ctx.createGain();
        this.updateBgmGain();
        this.bgmGainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  updateBgmGain() {
    if (!this.bgmGainNode || !this.ctx) return;
    const targetGain = this.muted ? 0 : this.bgmVolume * 0.35;
    this.bgmGainNode.gain.cancelScheduledValues(this.ctx.currentTime);
    this.bgmGainNode.gain.setValueAtTime(this.bgmGainNode.gain.value, this.ctx.currentTime);
    this.bgmGainNode.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.1);
  }

  setVolumes(sfx, bgm) {
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    this.bgmVolume = Math.max(0, Math.min(1, bgm));
    this.updateBgmGain();
  }

  toggleMute() {
    this.muted = !this.muted;
    this.updateBgmGain();
    return this.muted;
  }

  // ==================== PROCEDURAL SYNTH BGM ENGINE ====================
  startBGM(mode = 'combat') {
    this.init();
    if (!this.ctx) return;

    // Autoplay resumption hook
    if (this.ctx.state === 'suspended') {
      const resumeOnGesture = () => {
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        window.removeEventListener('pointerdown', resumeOnGesture);
        window.removeEventListener('keydown', resumeOnGesture);
      };
      window.addEventListener('pointerdown', resumeOnGesture, { once: true });
      window.addEventListener('keydown', resumeOnGesture, { once: true });
    }

    if (this.bgmPlaying && this.bgmMode === mode) return;

    this.stopBGM();
    this.bgmPlaying = true;
    this.bgmMode = mode;
    this.updateBgmGain();

    this.currentStep = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;

    // Precision Lookahead Web Audio Scheduler
    const tempo = mode === 'combat' ? 124 : 76; // BPM
    const secondsPerBeat = 60.0 / tempo;
    const stepDuration = secondsPerBeat / 4; // 16th notes
    const scheduleAheadTime = 0.12;

    this.bgmTimer = setInterval(() => {
      if (!this.bgmPlaying || !this.ctx) return;

      while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
        if (mode === 'combat') {
          this.scheduleCombatStep(this.currentStep, this.nextNoteTime, stepDuration);
        } else {
          this.scheduleMenuStep(this.currentStep, this.nextNoteTime, stepDuration);
        }
        this.nextNoteTime += stepDuration;
        this.currentStep = (this.currentStep + 1) % 64; // 4-bar 64-step loop
      }
    }, 35);
  }

  stopBGM() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.bgmPlaying = false;
    this.bgmMode = null;

    // Terminate all actively playing oscillator nodes smoothly
    this.activeNodes.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch {
        // Node already stopped
      }
    });
    this.activeNodes.clear();
  }

  // Combat Mode: 124 BPM Cyber Synthwave Pulse (Bass, Arp, Snare/HiHat)
  scheduleCombatStep(step, time, duration) {
    if (!this.ctx || !this.bgmGainNode) return;

    // 4-Bar Chord Progression: Dm -> Bb -> C -> Am (8 beats / 32 steps each bar pair)
    const bar = Math.floor(step / 16);
    const chords = [
      { root: 73.42, name: 'Dm', triad: [293.66, 349.23, 440.00] }, // D2, D4, F4, A4
      { root: 58.27, name: 'Bb', triad: [233.08, 293.66, 349.23] }, // Bb1, Bb3, D4, F4
      { root: 65.41, name: 'C',  triad: [261.63, 329.63, 392.00] }, // C2, C4, E4, G4
      { root: 55.00, name: 'Am', triad: [220.00, 261.63, 329.63] }  // A1, A3, C4, E4
    ];
    const currentChord = chords[bar % 4];

    // 1. Driving Synth Bass (16th note octave bounce)
    const isStepOn = step % 2 === 0;
    if (isStepOn) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      const octaveMultiplier = (step % 4 === 2) ? 2 : 1;
      osc.frequency.setValueAtTime(currentChord.root * octaveMultiplier, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, time);
      filter.frequency.exponentialRampToValueAtTime(160, time + duration * 1.6);
      filter.Q.setValueAtTime(3.5, time);

      gain.gain.setValueAtTime(0.24, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration * 1.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGainNode);

      osc.start(time);
      osc.stop(time + duration * 1.6);

      this.activeNodes.add(osc);
      osc.onended = () => this.activeNodes.delete(osc);
    }

    // 2. High-Tech Arpeggio (Plays on 8th notes)
    if (step % 2 === 1) {
      const arpNotes = currentChord.triad;
      const noteIdx = Math.floor(step / 2) % arpNotes.length;
      const freq = arpNotes[noteIdx] * (step % 8 >= 4 ? 2 : 1);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, time);
      filter.Q.setValueAtTime(2.0, time);

      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration * 1.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGainNode);

      osc.start(time);
      osc.stop(time + duration * 1.8);

      this.activeNodes.add(osc);
      osc.onended = () => this.activeNodes.delete(osc);
    }

    // 3. Cybernetic Hi-Hat / Snare Pulse (Synthetic Percussion)
    const isSnare = (step % 16 === 4 || step % 16 === 12);
    const isHiHat = (step % 2 === 0);

    if (isSnare || isHiHat) {
      const bufferSize = Math.floor(this.ctx.sampleRate * (isSnare ? 0.08 : 0.025));
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = isSnare ? 'bandpass' : 'highpass';
      filter.frequency.setValueAtTime(isSnare ? 1200 : 7000, time);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(isSnare ? 0.16 : 0.05, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + (isSnare ? 0.08 : 0.025));

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGainNode);

      noise.start(time);
      noise.stop(time + (isSnare ? 0.08 : 0.025));
    }
  }

  // Menu Mode: Atmospheric Deep Space Ambient Pad
  scheduleMenuStep(step, time, duration) {
    if (!this.ctx || !this.bgmGainNode) return;

    // Ambient chords every 16 steps (bar)
    if (step % 16 === 0) {
      const chordIdx = Math.floor(step / 16) % 4;
      const chords = [
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [146.83, 174.61, 220.00, 293.66], // Dm7
        [130.81, 164.81, 196.00, 246.94], // Cmaj7
        [110.00, 130.81, 164.81, 220.00]  // Am7
      ];
      const notes = chords[chordIdx];

      notes.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, time);

        const padDuration = duration * 15;
        gain.gain.setValueAtTime(0.001, time);
        gain.gain.linearRampToValueAtTime(0.06, time + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.001, time + padDuration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGainNode);

        osc.start(time);
        osc.stop(time + padDuration);

        this.activeNodes.add(osc);
        osc.onended = () => this.activeNodes.delete(osc);
      });
    }
  }

  // ==================== ARCADE SOUND EFFECTS ====================
  // Player Laser Shot (Dual Energy Blaster)
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

  // Heavy Rocket Launch Sound
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

  // Enemy Laser Shot (Lower, aggressive tone)
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

  // Enemy Destruction Explosion
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

  // Shield Deflection / Hit Sound
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

  // Pickup Collect Chime
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

  // Power-Up Activated
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

  // Boss Warning Siren
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

  // Heavy Boss Cannon
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
