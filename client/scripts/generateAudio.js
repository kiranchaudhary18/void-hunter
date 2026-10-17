import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SAMPLE_RATE = 44100;

function createWavHeader(numSamples, numChannels = 2, sampleRate = SAMPLE_RATE, bitsPerSample = 16) {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = numSamples * numChannels * (bitsPerSample / 8);
  const buffer = Buffer.alloc(44);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size
  buffer.writeUInt16LE(1, 20);  // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

// Clamp float -1.0..1.0 to 16-bit signed integer
function floatTo16Bit(val) {
  const s = Math.max(-1, Math.min(1, val));
  return s < 0 ? Math.floor(s * 32768) : Math.floor(s * 32767);
}

// 1. Generate Ambient Cosmic Exploration Theme (32 Seconds Seamless Loop)
function generateAmbientTheme() {
  const duration = 32.0;
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const pcmData = Buffer.alloc(numSamples * 2 * 2); // 2 channels, 2 bytes/sample

  // Chord Progression: Dm9 (8s) -> Bbmaj7 (8s) -> C9 (8s) -> Am7 (8s)
  const chords = [
    // Dm9: D2, A2, F3, A3, C4, E4
    [73.42, 110.00, 174.61, 220.00, 261.63, 329.63],
    // Bbmaj7: Bb1, F2, D3, F3, A3, D4
    [58.27, 87.31, 146.83, 174.61, 220.00, 293.66],
    // C9: C2, G2, E3, G3, B3, D4
    [65.41, 98.00, 164.81, 196.00, 246.94, 293.66],
    // Am7: A1, E2, C3, E3, G3, C4
    [55.00, 82.41, 130.81, 164.81, 196.00, 261.63]
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const chordIdx = Math.floor((t / 8) % 4);
    const chord = chords[chordIdx];
    const chordProgress = (t % 8) / 8; // 0..1 inside the 8-second chord

    // Smooth envelope for chord changes
    const chordFade = Math.sin(chordProgress * Math.PI);

    let left = 0;
    let right = 0;

    // Sub-bass rumble (Root note + 5th)
    const root = chord[0];
    const fifth = chord[1];
    const sub = Math.sin(2 * Math.PI * root * t) * 0.28 +
                Math.sin(2 * Math.PI * fifth * t * 0.999) * 0.16;
    left += sub;
    right += sub;

    // Lush warm analog pads (detuned stereo chorus)
    for (let c = 2; c < chord.length; c++) {
      const f = chord[c];
      // Subtle pitch detuning & slow cosmic LFO
      const lfo = 1 + 0.003 * Math.sin(2 * Math.PI * 0.25 * t + c);
      const lfoPan = 0.5 + 0.35 * Math.sin(2 * Math.PI * 0.18 * t + c);

      // Warm layered sine + soft triangle
      const osc1 = Math.sin(2 * Math.PI * f * lfo * t);
      const osc2 = (Math.asin(Math.sin(2 * Math.PI * (f * 1.002) * t)) * (2 / Math.PI)) * 0.5;
      const padVoice = (osc1 + osc2) * 0.08 * (0.4 + 0.6 * chordFade);

      left += padVoice * (1 - lfoPan);
      right += padVoice * lfoPan;
    }

    // Gentle high celestial shimmer / arpeggio twinkle
    const arpSpeed = 2.0; // 2 notes per second
    const arpIdx = Math.floor(t * arpSpeed) % chord.length;
    const arpFreq = chord[arpIdx] * 2.0;
    const arpPhase = (t * arpSpeed) % 1;
    const arpEnv = Math.exp(-arpPhase * 6.5);
    const arpOsc = Math.sin(2 * Math.PI * arpFreq * t) * 0.07 * arpEnv;
    const arpPan = (Math.sin(t * 1.5) + 1) * 0.5;

    left += arpOsc * arpPan;
    right += arpOsc * (1 - arpPan);

    // Master Soft Limiting & Stereo Pan Normalization
    const masterGain = 0.75;
    left = Math.tanh(left * masterGain);
    right = Math.tanh(right * masterGain);

    const offset = i * 4;
    pcmData.writeInt16LE(floatTo16Bit(left), offset);
    pcmData.writeInt16LE(floatTo16Bit(right), offset + 2);
  }

  const header = createWavHeader(numSamples);
  return Buffer.concat([header, pcmData]);
}

// 2. Generate High-Octane Space Combat Anthem (126 BPM, 30.47 Seconds Seamless Loop)
function generateCombatTheme() {
  const bpm = 126;
  const beatDuration = 60.0 / bpm;
  const barDuration = beatDuration * 4;
  const numBars = 16;
  const duration = barDuration * numBars; // ~30.47 seconds (exact integer loop)
  const numSamples = Math.floor(SAMPLE_RATE * duration);
  const pcmData = Buffer.alloc(numSamples * 2 * 2);

  // 4-Bar Chord Loop repeated 4 times:
  // Dm (Bars 1-4) -> Bb (Bars 5-8) -> C (Bars 9-12) -> Am (Bars 13-16)
  const rootFreqs = [73.42, 58.27, 65.41, 55.00]; // D2, Bb1, C2, A1
  const melodyNotes = [
    // Bars 1-4 (Dm): Heroic driving melody
    [293.66, 349.23, 440.00, 523.25, 440.00, 349.23, 392.00, 293.66],
    // Bars 5-8 (Bb): Soaring lift
    [233.08, 293.66, 349.23, 466.16, 349.23, 293.66, 349.23, 233.08],
    // Bars 9-12 (C): Triumphant surge
    [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 392.00, 261.63],
    // Bars 13-16 (Am): Dramatic resolution
    [220.00, 261.63, 329.63, 440.00, 329.63, 261.63, 220.00, 164.81]
  ];

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const currentBar = Math.floor(t / barDuration) % 4;
    const currentRoot = rootFreqs[currentBar];

    let left = 0;
    let right = 0;

    // 1. Electronic Kick Drum (Punch on every quarter beat)
    const beatPos = (t % beatDuration) / beatDuration;
    const kickEnv = Math.exp(-beatPos * 18);
    const kickFreq = 140 * Math.exp(-beatPos * 25) + 45;
    const kick = Math.sin(2 * Math.PI * kickFreq * t) * kickEnv * 0.75;
    left += kick;
    right += kick;

    // 2. Snare / Cyber Clap on beats 2 and 4
    const barBeat = (t % barDuration) / beatDuration; // 0..4
    const isSnareBeat = (barBeat >= 1.0 && barBeat < 2.0) || (barBeat >= 3.0 && barBeat < 4.0);
    const snarePos = barBeat % 1.0;
    if (isSnareBeat) {
      const snareEnv = Math.exp(-snarePos * 16);
      const whiteNoise = (Math.random() * 2 - 1) * snareEnv * 0.28;
      const snareTone = Math.sin(2 * Math.PI * 190 * t) * snareEnv * 0.22;
      left += (whiteNoise + snareTone);
      right += (whiteNoise + snareTone);
    }

    // 3. Crisp Hi-Hats on 16th notes (with open hat on offbeats)
    const sixteenthPos = (t % (beatDuration / 4)) / (beatDuration / 4);
    const hatEnv = Math.exp(-sixteenthPos * 32);
    const hatNoise = (Math.random() * 2 - 1) * hatEnv * 0.12;
    left += hatNoise * 0.8;
    right += hatNoise * 1.2;

    // 4. Pumping 16th-Note Cyber Synth Bass (Octave Sawtooth Bounce)
    const bass16th = Math.floor(t / (beatDuration / 4)) % 16;
    const bassOctave = (bass16th % 4 === 2) ? 2.0 : 1.0;
    const bassPhase = (t % (beatDuration / 4)) / (beatDuration / 4);
    const bassEnv = Math.exp(-bassPhase * 5.0);

    // Bandlimited resonant sawtooth
    const bFreq = currentRoot * bassOctave;
    let saw = 0;
    for (let h = 1; h <= 6; h++) {
      saw += (Math.sin(2 * Math.PI * (bFreq * h) * t) / h);
    }
    const bass = saw * 0.22 * bassEnv;
    left += bass * 0.95;
    right += bass * 1.05;

    // 5. Heroic Lead Synth Melody (Soaring Cyber Anthem)
    const melodyArray = melodyNotes[currentBar];
    const notePos = Math.floor(t / (beatDuration / 2)) % melodyArray.length;
    const mFreq = melodyArray[notePos];
    const mPhase = (t % (beatDuration / 2)) / (beatDuration / 2);
    const mEnv = Math.min(1.0, mPhase * 25.0) * Math.exp(-mPhase * 3.5);

    // Warm square + pulse lead with stereo ping-pong delay
    const leadOsc = (Math.sin(2 * Math.PI * mFreq * t) > 0 ? 0.6 : -0.6) +
                    Math.sin(2 * Math.PI * (mFreq * 1.003) * t) * 0.4;
    const lead = leadOsc * 0.18 * mEnv;

    const panL = 0.5 + 0.3 * Math.sin(t * 2.5);
    left += lead * panL;
    right += lead * (1 - panL);

    // Master limiting & saturation
    const masterGain = 0.68;
    left = Math.tanh(left * masterGain);
    right = Math.tanh(right * masterGain);

    const offset = i * 4;
    pcmData.writeInt16LE(floatTo16Bit(left), offset);
    pcmData.writeInt16LE(floatTo16Bit(right), offset + 2);
  }

  const header = createWavHeader(numSamples);
  return Buffer.concat([header, pcmData]);
}

// Generate files into client/public/audio
const outputDir = path.join(__dirname, '../public/audio');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Generating ambient space theme...');
const ambientWav = generateAmbientTheme();
fs.writeFileSync(path.join(outputDir, 'ambient_theme.wav'), ambientWav);
console.log(`✅ Saved ambient_theme.wav (${(ambientWav.length / 1024 / 1024).toFixed(2)} MB)`);

console.log('Generating space combat anthem...');
const combatWav = generateCombatTheme();
fs.writeFileSync(path.join(outputDir, 'combat_theme.wav'), combatWav);
console.log(`✅ Saved combat_theme.wav (${(combatWav.length / 1024 / 1024).toFixed(2)} MB)`);
