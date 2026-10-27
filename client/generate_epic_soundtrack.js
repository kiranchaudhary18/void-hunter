/**
 * High-Energy Studio Synthwave Soundtrack Synthesizer
 * Generates two punchy, adrenaline-pumping tracks:
 * 1. ambient_theme.wav (Menu Anthem - 122 BPM Cyberpunk Synthwave)
 * 2. combat_theme.wav (Combat Overdrive - 136 BPM High-Octane Arcade Battle)
 */

import fs from 'fs';
import path from 'path';

const SAMPLE_RATE = 44100;

function createWavHeader(numChannels, sampleRate, bitsPerSample, totalDataBytes) {
  const buffer = Buffer.alloc(44);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + totalDataBytes, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
  buffer.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(totalDataBytes, 40);
  return buffer;
}

// Convert note name to frequency
const NOTE_FREQS = {
  'C1': 32.70, 'D1': 36.71, 'E1': 41.20, 'F1': 43.65, 'G1': 49.00, 'A1': 55.00, 'B1': 61.74,
  'C2': 65.41, 'D2': 73.42, 'Eb2': 77.78, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'Bb2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'D3': 146.83, 'Eb3': 155.56, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'Eb4': 311.13, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'Bb5': 932.33, 'B5': 987.77,
  'C6': 1046.50
};

// Soft clipper / limiter to give punch without digital distortion
function softClip(x) {
  if (x > 1.0) return 1.0 - Math.exp(-x);
  if (x < -1.0) return -1.0 + Math.exp(x);
  return x * 0.95;
}

// Quick bandpass noise generator for snares and hats
/* NoiseGen removed */

// ==================== TRACK 1: MENU ANTHEM (124 BPM) ====================
// "Cyberpunk Neon Drive" - Driving bass, punchy drums, uplifting synth arps
function generateMenuTrack() {
  const bpm = 124;
  const beatDuration = 60 / bpm;
  const bars = 16;
  const beats = bars * 4;
  const totalDuration = beats * beatDuration;
  const totalSamples = Math.floor(totalDuration * SAMPLE_RATE);

  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  // Chord progression: Dm -> Bb -> C -> Am (4 bars each)
  const rootChords = [
    { root: 'D2', chord: ['D4', 'F4', 'A4', 'C5'], bass: 'D2' },
    { root: 'Bb2', chord: ['Bb3', 'D4', 'F4', 'Bb4'], bass: 'Bb2' },
    { root: 'C2', chord: ['C4', 'E4', 'G4', 'C5'], bass: 'C2' },
    { root: 'A2', chord: ['A3', 'C4', 'E4', 'A4'], bass: 'A2' }
  ];

  // Arp patterns (16th notes)
  const arpNotes = [
    ['D4', 'F4', 'A4', 'C5', 'D5', 'C5', 'A4', 'F4', 'D4', 'A4', 'F4', 'D5', 'C5', 'A4', 'F4', 'E4'],
    ['Bb3', 'D4', 'F4', 'Bb4', 'D5', 'Bb4', 'F4', 'D4', 'Bb3', 'F4', 'D4', 'F5', 'D5', 'Bb4', 'F4', 'D4'],
    ['C4', 'E4', 'G4', 'C5', 'E5', 'C5', 'G4', 'E4', 'C4', 'G4', 'E4', 'G5', 'E5', 'C5', 'G4', 'E4'],
    ['A3', 'C4', 'E4', 'A4', 'C5', 'A4', 'E4', 'C4', 'A3', 'E4', 'C4', 'E5', 'C5', 'A4', 'E4', 'G4']
  ];

  // Melodic Lead Hook (Plays on bars 9-16)
  const leadHook = [
    { bar: 8, beat: 0, note: 'D5', dur: 1.5 },
    { bar: 8, beat: 1.5, note: 'F5', dur: 0.5 },
    { bar: 8, beat: 2, note: 'E5', dur: 1.0 },
    { bar: 8, beat: 3, note: 'D5', dur: 1.0 },
    { bar: 9, beat: 0, note: 'A4', dur: 2.0 },
    { bar: 9, beat: 2.5, note: 'C5', dur: 1.5 },
    { bar: 10, beat: 0, note: 'G4', dur: 1.5 },
    { bar: 10, beat: 1.5, note: 'A4', dur: 0.5 },
    { bar: 10, beat: 2, note: 'Bb4', dur: 1.0 },
    { bar: 10, beat: 3, note: 'C5', dur: 1.0 },
    { bar: 11, beat: 0, note: 'A4', dur: 3.5 },
    // Second half of lead hook
    { bar: 12, beat: 0, note: 'D5', dur: 1.5 },
    { bar: 12, beat: 1.5, note: 'F5', dur: 0.5 },
    { bar: 12, beat: 2, note: 'G5', dur: 1.0 },
    { bar: 12, beat: 3, note: 'A5', dur: 1.0 },
    { bar: 13, beat: 0, note: 'F5', dur: 2.0 },
    { bar: 13, beat: 2.5, note: 'D5', dur: 1.5 },
    { bar: 14, beat: 0, note: 'E5', dur: 1.5 },
    { bar: 14, beat: 1.5, note: 'F5', dur: 0.5 },
    { bar: 14, beat: 2, note: 'E5', dur: 1.0 },
    { bar: 14, beat: 3, note: 'C5', dur: 1.0 },
    { bar: 15, beat: 0, note: 'D5', dur: 3.5 }
  ];

  console.log(`Generating Menu Anthem: ${totalDuration.toFixed(1)}s, ${totalSamples} samples...`);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const currentBeat = t / beatDuration;
    const currentBar = Math.floor(currentBeat / 4);
    const _beatInBar = currentBeat % 4;
    const sixteenthInBar = Math.floor((currentBeat % 4) * 4);
    const chordIdx = Math.floor(currentBar / 4) % 4;
    const chordInfo = rootChords[chordIdx];

    let mixL = 0;
    let mixR = 0;

    // 1. PUNCHY KICK DRUM (Every quarter note beat: 0, 1, 2, 3)
    const kickTime = (currentBeat % 1) * beatDuration;
    if (kickTime < 0.22) {
      const kickFreq = 160 * Math.exp(-kickTime * 35) + 48;
      const kickAmp = Math.exp(-kickTime * 18);
      const kick = Math.sin(2 * Math.PI * kickFreq * kickTime) * kickAmp * 0.95;
      mixL += kick;
      mixR += kick;
    }

    // 2. CRISP RETRO SNARE (Beats 1 and 3 in 0-indexed: 2nd and 4th beats)
    const snareOffset = (currentBeat - 1) % 2;
    const snareTime = snareOffset * beatDuration;
    if (snareOffset >= 0 && snareTime < 0.24) {
      const noise = (Math.random() * 2 - 1) * Math.exp(-snareTime * 22);
      const tone = Math.sin(2 * Math.PI * 185 * snareTime) * Math.exp(-snareTime * 28);
      const snare = (noise * 0.7 + tone * 0.3) * 0.75;
      mixL += snare;
      mixR += snare;
    }

    // 3. HI-HATS (16th notes with accent on offbeats)
    const hatStep = (currentBeat * 4) % 1;
    const hatTime = hatStep * (beatDuration / 4);
    if (hatTime < 0.06) {
      const isOffbeat = (Math.floor(currentBeat * 4) % 2) === 1;
      const hatAmp = (isOffbeat ? 0.35 : 0.18) * Math.exp(-hatTime * 85);
      const hat = (Math.random() * 2 - 1) * hatAmp;
      mixL += hat * 0.9;
      mixR += hat * 1.1; // subtle stereo
    }

    // 4. ROLLING 16th-NOTE SYNTHWAVE BASSLINE
    const bassStep = Math.floor(currentBeat * 4);
    const bassTime = (currentBeat * 4 % 1) * (beatDuration / 4);
    const bassFreq = NOTE_FREQS[chordInfo.bass];
    if (bassTime < beatDuration / 4) {
      // Octave bounce: every 2nd 16th note jumps up an octave
      const octaveMult = (bassStep % 2 === 1) ? 2.0 : 1.0;
      const f = bassFreq * octaveMult;
      const bassEnv = Math.exp(-bassTime * 14);
      // Sawtooth + Sub Sine
      const saw = (((f * t) % 1) * 2 - 1);
      const sub = Math.sin(2 * Math.PI * bassFreq * t);
      const bass = (saw * 0.55 + sub * 0.45) * bassEnv * 0.75;
      mixL += bass * 0.95;
      mixR += bass * 0.95;
    }

    // 5. ENERGETIC 16th-NOTE SYNTH ARPEGGIO
    const arpSeq = arpNotes[chordIdx];
    const arpNoteName = arpSeq[sixteenthInBar % arpSeq.length];
    const arpFreq = NOTE_FREQS[arpNoteName];
    const arpStepTime = (currentBeat * 4 % 1) * (beatDuration / 4);
    if (arpStepTime < beatDuration / 4) {
      const arpEnv = Math.exp(-arpStepTime * 12);
      // Dual detuned saw for lush chorus
      const saw1 = (((arpFreq * t) % 1) * 2 - 1);
      const saw2 = ((((arpFreq * 1.006) * t) % 1) * 2 - 1);
      const arp = (saw1 * 0.5 + saw2 * 0.5) * arpEnv * 0.32;
      // Stereo panning ping-pong
      const pan = Math.sin(currentBeat * Math.PI * 0.5) * 0.35;
      mixL += arp * (0.5 - pan);
      mixR += arp * (0.5 + pan);
    }

    // 6. ATMOSPHERIC WARM PAD CHORDS
    chordInfo.chord.forEach((noteName, idx) => {
      const cf = NOTE_FREQS[noteName];
      const padWave = Math.sin(2 * Math.PI * cf * t) + 0.3 * Math.sin(2 * Math.PI * cf * 1.004 * t);
      const padAmp = 0.08 * (0.8 + 0.2 * Math.sin(t * 1.5));
      mixL += padWave * padAmp * (idx % 2 === 0 ? 0.6 : 0.4);
      mixR += padWave * padAmp * (idx % 2 === 0 ? 0.4 : 0.6);
    });

    // 7. HEROIC LEAD MELODY (Bars 8 to 16)
    for (const lead of leadHook) {
      const noteStart = lead.bar * 4 + lead.beat;
      const noteEnd = noteStart + lead.dur;
      if (currentBeat >= noteStart && currentBeat < noteEnd) {
        const noteTime = (currentBeat - noteStart) * beatDuration;
        const lf = NOTE_FREQS[lead.note];
        // Supersaw lead
        const l1 = (((lf * t) % 1) * 2 - 1);
        const l2 = ((((lf * 1.008) * t) % 1) * 2 - 1);
        const l3 = ((((lf * 0.992) * t) % 1) * 2 - 1);
        const leadEnv = Math.min(1.0, noteTime * 25) * Math.exp(-(noteTime / (lead.dur * beatDuration)) * 0.6);
        const leadSound = (l1 * 0.4 + l2 * 0.3 + l3 * 0.3) * leadEnv * 0.42;
        mixL += leadSound * 0.7;
        mixR += leadSound * 0.7;
        break;
      }
    }

    // Master Soft Limiter & Normalization
    left[i] = softClip(mixL * 0.88);
    right[i] = softClip(mixR * 0.88);
  }

  return { left, right, totalSamples };
}

// ==================== TRACK 2: COMBAT OVERDRIVE (138 BPM) ====================
// "Hyper-Speed Void Combat" - Heavy distortion bass, aggressive 138 BPM beats, sirens & action leads
function generateCombatTrack() {
  const bpm = 138;
  const beatDuration = 60 / bpm;
  const bars = 16;
  const beats = bars * 4;
  const totalDuration = beats * beatDuration;
  const totalSamples = Math.floor(totalDuration * SAMPLE_RATE);

  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  // High-tension dark combat chords: Em -> C -> D -> Bm
  const combatChords = [
    { root: 'E2', notes: ['E4', 'G4', 'B4', 'E5'], bass: 'E2' },
    { root: 'C2', notes: ['C4', 'E4', 'G4', 'C5'], bass: 'C2' },
    { root: 'D2', notes: ['D4', 'F#4', 'A4', 'D5'], bass: 'D2' },
    { root: 'B1', notes: ['B3', 'D4', 'F#4', 'B4'], bass: 'B2' }
  ];

  // Combat fast battle riff
  const combatRiff = [
    'E4', 'E4', 'G4', 'E4', 'B4', 'A4', 'G4', 'F4',
    'E4', 'E4', 'G4', 'E4', 'D5', 'B4', 'G4', 'A4',
    'C4', 'C4', 'E4', 'C4', 'G4', 'E4', 'C5', 'B4',
    'D4', 'D4', 'F4', 'D4', 'A4', 'G4', 'F4', 'D4'
  ];

  console.log(`Generating Combat Anthem: ${totalDuration.toFixed(1)}s, ${totalSamples} samples at 138 BPM...`);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const currentBeat = t / beatDuration;
    const currentBar = Math.floor(currentBeat / 4);
    const _beatInBar = currentBeat % 4;
    const sixteenthInBar = Math.floor((currentBeat % 4) * 4);
    const chordIdx = Math.floor(currentBar / 4) % 4;
    const chordInfo = combatChords[chordIdx];

    let mixL = 0;
    let mixR = 0;

    // 1. HARD-HITTING COMBAT KICK (4-on-the-floor + double kick fills on beats 3.5 & 3.75 of every 4th bar)
    const kickTime = (currentBeat % 1) * beatDuration;
    const isFillBar = (currentBar % 4 === 3);
    const isDoubleKick = isFillBar && (beatInBar >= 3.5);
    const effectiveKickTime = isDoubleKick ? ((currentBeat * 2) % 1) * (beatDuration / 2) : kickTime;

    if (effectiveKickTime < 0.20) {
      const kickFreq = 200 * Math.exp(-effectiveKickTime * 42) + 52;
      const kickAmp = Math.exp(-effectiveKickTime * 20);
      const kick = Math.sin(2 * Math.PI * kickFreq * effectiveKickTime) * kickAmp * 1.05;
      mixL += kick;
      mixR += kick;
    }

    // 2. AGGRESSIVE CRACKING SNARE + CLAP
    const snareOffset = (currentBeat - 1) % 2;
    const snareTime = snareOffset * beatDuration;
    if (snareOffset >= 0 && snareTime < 0.22) {
      const noise = (Math.random() * 2 - 1) * Math.exp(-snareTime * 26);
      const body = Math.sin(2 * Math.PI * 220 * snareTime) * Math.exp(-snareTime * 32);
      const snap = Math.sin(2 * Math.PI * 880 * snareTime) * Math.exp(-snareTime * 70);
      const snare = (noise * 0.75 + body * 0.35 + snap * 0.2) * 0.9;
      mixL += snare;
      mixR += snare;
    }

    // 3. FAST 16th-NOTE HI-HATS + OPEN HATS
    const hatStep = (currentBeat * 4) % 1;
    const hatTime = hatStep * (beatDuration / 4);
    if (hatTime < 0.055) {
      const isOffbeat = (Math.floor(currentBeat * 4) % 2) === 1;
      const hatAmp = (isOffbeat ? 0.42 : 0.22) * Math.exp(-hatTime * 95);
      const hat = (Math.random() * 2 - 1) * hatAmp;
      mixL += hat * 0.85;
      mixR += hat * 1.15;
    }

    // 4. DISTORTED GROWLING BASS (Galloping 16th notes: Sawtooth + Square with overdrive)
    const bassStep = Math.floor(currentBeat * 4);
    const bassTime = (currentBeat * 4 % 1) * (beatDuration / 4);
    const bassFreq = NOTE_FREQS[chordInfo.bass] || 82.41;
    if (bassTime < beatDuration / 4) {
      const isHighOct = (bassStep % 4 === 2);
      const f = bassFreq * (isHighOct ? 2.0 : 1.0);
      const bassEnv = Math.exp(-bassTime * 16);
      // Saturated square + saw
      let rawBass = (((f * t) % 1) * 2 - 1) * 0.6 + (Math.sin(2 * Math.PI * f * t) > 0 ? 0.4 : -0.4);
      // Overdrive distortion
      rawBass = Math.tanh(rawBass * 2.2);
      const bass = rawBass * bassEnv * 0.8;
      mixL += bass * 0.95;
      mixR += bass * 0.95;
    }

    // 5. HIGH-SPEED COMBAT SYNTH RIFF
    const riffNote = combatRiff[sixteenthInBar % combatRiff.length];
    const riffFreq = NOTE_FREQS[riffNote] || 329.63;
    const riffStepTime = (currentBeat * 4 % 1) * (beatDuration / 4);
    if (riffStepTime < beatDuration / 4) {
      const riffEnv = Math.exp(-riffStepTime * 15);
      // Hard synced square wave
      const sq = (Math.sin(2 * Math.PI * riffFreq * t) > 0 ? 0.5 : -0.5);
      const saw = (((riffFreq * 1.005 * t) % 1) * 2 - 1) * 0.5;
      const riffSound = (sq + saw) * riffEnv * 0.38;
      mixL += riffSound * 0.45;
      mixR += riffSound * 0.65;
    }

    // 6. SCI-FI LASER ALARM / SIREN SWEEPS (Every 8 bars)
    if (currentBar >= 8 && currentBar < 12) {
      const sirenTime = (currentBeat % 4) * beatDuration;
      const sirenFreq = 700 + 400 * Math.sin(sirenTime * 8);
      const siren = Math.sin(2 * Math.PI * sirenFreq * t) * 0.08;
      mixL += siren * 0.8;
      mixR += siren * 0.2;
    }

    // Master Soft Limiter & Normalization
    left[i] = softClip(mixL * 0.92);
    right[i] = softClip(mixR * 0.92);
  }

  return { left, right, totalSamples };
}

function writeTrackToWav(trackData, filePath) {
  const { left, right, totalSamples } = trackData;
  const numChannels = 2;
  const bitsPerSample = 16;
  const totalDataBytes = totalSamples * numChannels * 2;

  const header = createWavHeader(numChannels, SAMPLE_RATE, bitsPerSample, totalDataBytes);
  const data = Buffer.alloc(totalDataBytes);

  for (let i = 0; i < totalSamples; i++) {
    // 16-bit PCM conversion (-32768 to 32767)
    let sL = Math.max(-1.0, Math.min(1.0, left[i]));
    let sR = Math.max(-1.0, Math.min(1.0, right[i]));

    const intL = Math.floor(sL * 32767);
    const intR = Math.floor(sR * 32767);

    data.writeInt16LE(intL, i * 4);
    data.writeInt16LE(intR, i * 4 + 2);
  }

  const outDir = path.dirname(filePath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(filePath, Buffer.concat([header, data]));
  console.log(`Saved: ${filePath} (${(fs.statSync(filePath).size / (1024 * 1024)).toFixed(2)} MB)`);
}

// Generate both tracks
const clientAudioDir = 'd:/void-hunter/client/public/audio';
const menuTrack = generateMenuTrack();
writeTrackToWav(menuTrack, path.join(clientAudioDir, 'ambient_theme.wav'));

const combatTrack = generateCombatTrack();
writeTrackToWav(combatTrack, path.join(clientAudioDir, 'combat_theme.wav'));

console.log('Audio synthesis completed successfully!');
