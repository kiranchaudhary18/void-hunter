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

// Load and resample mono 22050Hz 16-bit WAV to Float32Array at 44100Hz
function loadVocalWav(filePath) {
  const buf = fs.readFileSync(filePath);
  // Find 'data' chunk
  let dataOffset = 12;
  while (dataOffset < buf.length - 8) {
    const chunkId = buf.toString('ascii', dataOffset, dataOffset + 4);
    const chunkSize = buf.readUInt32LE(dataOffset + 4);
    if (chunkId === 'data') {
      dataOffset += 8;
      break;
    }
    dataOffset += 8 + chunkSize;
  }

  const num16Samples = Math.floor((buf.length - dataOffset) / 2);
  const rawMono22k = new Float32Array(num16Samples);
  for (let i = 0; i < num16Samples; i++) {
    rawMono22k[i] = buf.readInt16LE(dataOffset + i * 2) / 32768.0;
  }

  // Resample from 22050 Hz to 44100 Hz (2x upsampling with linear interpolation)
  const upsampled = new Float32Array(num16Samples * 2);
  for (let i = 0; i < upsampled.length; i++) {
    const srcIdx = i / 2;
    const i0 = Math.floor(srcIdx);
    const i1 = Math.min(rawMono22k.length - 1, i0 + 1);
    const frac = srcIdx - i0;
    upsampled[i] = rawMono22k[i0] * (1 - frac) + rawMono22k[i1] * frac;
  }

  return upsampled;
}

const NOTE_FREQS = {
  'D1': 36.71, 'E1': 41.20, 'F1': 43.65, 'G1': 49.00, 'A1': 55.00, 'Bb1': 58.27, 'C2': 65.41,
  'D2': 73.42, 'E2': 82.41, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'Bb2': 116.54, 'C3': 130.81,
  'D3': 146.83, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'Bb3': 233.08, 'C4': 261.63,
  'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'C5': 523.25,
  'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'A5': 880.00
};

function softClip(x) {
  if (x > 1.0) return 1.0 - Math.exp(-x);
  if (x < -1.0) return -1.0 + Math.exp(x);
  return x * 0.95;
}

function generateVocalSong() {
  const bpm = 130;
  const beatDuration = 60 / bpm;
  const bars = 32; // ~59 seconds loop
  const totalBeats = bars * 4;
  const totalDuration = totalBeats * beatDuration;
  const totalSamples = Math.floor(totalDuration * SAMPLE_RATE);

  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  console.log(`Generating English Vocal Anthem: ${totalDuration.toFixed(1)}s (${bars} bars at ${bpm} BPM)...`);

  // Load Vocal stems
  const vocalsDir = 'd:/void-hunter/client/public/audio/temp_vocals';
  const vocals = {
    intro: loadVocalWav(path.join(vocalsDir, 'v_intro.wav')),
    verse1: loadVocalWav(path.join(vocalsDir, 'v_verse1.wav')),
    verse2: loadVocalWav(path.join(vocalsDir, 'v_verse2.wav')),
    prechorus: loadVocalWav(path.join(vocalsDir, 'v_prechorus.wav')),
    chorus1: loadVocalWav(path.join(vocalsDir, 'v_chorus1.wav')),
    chorus2: loadVocalWav(path.join(vocalsDir, 'v_chorus2.wav')),
    bridge: loadVocalWav(path.join(vocalsDir, 'v_bridge.wav')),
    outro: loadVocalWav(path.join(vocalsDir, 'v_outro.wav'))
  };

  // Timeline for vocals (in beats):
  const vocalPlacements = [
    { startBeat: 2, samples: vocals.intro },
    { startBeat: 16, samples: vocals.verse1 },
    { startBeat: 32, samples: vocals.verse2 },
    { startBeat: 48, samples: vocals.prechorus },
    { startBeat: 64, samples: vocals.chorus1 },
    { startBeat: 80, samples: vocals.chorus2 },
    { startBeat: 96, samples: vocals.bridge },
    { startBeat: 112, samples: vocals.outro }
  ];

  // Chord progression (Dm -> F -> C -> G, 4 bars each, repeating)
  const progression = [
    { root: 'D2', chord: ['D3', 'F3', 'A3', 'D4'], bass: 'D2' },
    { root: 'F2', chord: ['F3', 'A3', 'C4', 'F4'], bass: 'F2' },
    { root: 'C2', chord: ['C3', 'E3', 'G3', 'C4'], bass: 'C2' },
    { root: 'G2', chord: ['G3', 'Bb3', 'D4', 'G4'], bass: 'G2' }
  ];

  // Fast 16th arp sequence
  const arpNotes = ['D4', 'F4', 'A4', 'D5', 'A4', 'F4', 'D4', 'A4', 'F4', 'D5', 'C5', 'A4', 'G4', 'F4', 'E4', 'C4'];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const currentBeat = t / beatDuration;
    const currentBar = Math.floor(currentBeat / 4);
    const beatInBar = currentBeat % 4;
    const sixteenthInBar = Math.floor((currentBeat % 4) * 4);
    const chord = progression[Math.floor(currentBar / 2) % progression.length];

    let mixL = 0;
    let mixR = 0;

    // 1. DRUMS: PUNCHY KICK
    const kickTime = (currentBeat % 1) * beatDuration;
    if (kickTime < 0.22) {
      const kickFreq = 180 * Math.exp(-kickTime * 38) + 48;
      const kickAmp = Math.exp(-kickTime * 19);
      const kick = Math.sin(2 * Math.PI * kickFreq * kickTime) * kickAmp * 1.0;
      mixL += kick;
      mixR += kick;
    }

    // 2. DRUMS: CRISP SNARE & CLAP (Beats 1 & 3 in 0-indexed)
    const snareOffset = (currentBeat - 1) % 2;
    const snareTime = snareOffset * beatDuration;
    if (snareOffset >= 0 && snareTime < 0.22) {
      const noise = (Math.random() * 2 - 1) * Math.exp(-snareTime * 24);
      const tone = Math.sin(2 * Math.PI * 200 * snareTime) * Math.exp(-snareTime * 30);
      const snare = (noise * 0.72 + tone * 0.28) * 0.85;
      mixL += snare;
      mixR += snare;
    }

    // 3. HI-HATS (16th notes with accent)
    const hatStep = (currentBeat * 4) % 1;
    const hatTime = hatStep * (beatDuration / 4);
    if (hatTime < 0.055) {
      const isOffbeat = (Math.floor(currentBeat * 4) % 2) === 1;
      const hatAmp = (isOffbeat ? 0.38 : 0.2) * Math.exp(-hatTime * 90);
      const hat = (Math.random() * 2 - 1) * hatAmp;
      mixL += hat * 0.9;
      mixR += hat * 1.1;
    }

    // 4. POWER BASSLINE (Saturated 16th-note galloping bass)
    const bassStep = Math.floor(currentBeat * 4);
    const bassTime = (currentBeat * 4 % 1) * (beatDuration / 4);
    const bf = NOTE_FREQS[chord.bass] || 73.42;
    if (bassTime < beatDuration / 4) {
      const oct = (bassStep % 4 === 2) ? 2.0 : 1.0;
      const f = bf * oct;
      const saw = (((f * t) % 1) * 2 - 1);
      const sq = (Math.sin(2 * Math.PI * f * t) > 0 ? 0.4 : -0.4);
      let bWave = Math.tanh((saw * 0.6 + sq * 0.4) * 2.0);
      const bassEnv = Math.exp(-bassTime * 15);
      const bass = bWave * bassEnv * 0.75;
      mixL += bass * 0.95;
      mixR += bass * 0.95;
    }

    // 5. ELECTRONIC ROCK GUITAR / POWER SYNTH CHORDS
    chord.chord.forEach((noteName, idx) => {
      const cf = NOTE_FREQS[noteName] || 220;
      const cSaw = (((cf * t) % 1) * 2 - 1);
      const cDist = Math.tanh(cSaw * 1.8);
      const chordAmp = 0.09 * (1.0 + 0.15 * Math.sin(t * 2.0));
      mixL += cDist * chordAmp * (idx % 2 === 0 ? 0.7 : 0.4);
      mixR += cDist * chordAmp * (idx % 2 === 0 ? 0.4 : 0.7);
    });

    // 6. SYNTH ARP
    const arpNote = arpNotes[sixteenthInBar % arpNotes.length];
    const af = NOTE_FREQS[arpNote] || 440;
    const arpStepTime = (currentBeat * 4 % 1) * (beatDuration / 4);
    if (arpStepTime < beatDuration / 4) {
      const aEnv = Math.exp(-arpStepTime * 14);
      const aSaw = (((af * t) % 1) * 2 - 1) * aEnv * 0.22;
      const pan = Math.sin(currentBeat * 0.8) * 0.4;
      mixL += aSaw * (0.5 - pan);
      mixR += aSaw * (0.5 + pan);
    }

    // 7. VOCALS WITH ROBOTIC STEREO CHORUS & DELAY ECHO
    for (const v of vocalPlacements) {
      const startSample = Math.floor(v.startBeat * beatDuration * SAMPLE_RATE);
      const sampleOffset = i - startSample;
      if (sampleOffset >= 0 && sampleOffset < v.samples.length) {
        const rawVoc = v.samples[sampleOffset];
        // Robotic saturation
        const vocSat = Math.tanh(rawVoc * 1.6) * 1.15;

        // Stereo chorus / doubler (+5ms delay on right channel)
        const dR = Math.max(0, sampleOffset - Math.floor(0.006 * SAMPLE_RATE));
        const vocR = Math.tanh(v.samples[dR] * 1.6) * 1.15;

        // Sidechain compression on music bed (duck music when vocal is present)
        const duck = Math.min(1.0, Math.abs(rawVoc) * 2.5);
        mixL = mixL * (1.0 - duck * 0.4) + vocSat * 0.95;
        mixR = mixR * (1.0 - duck * 0.4) + vocR * 0.95;

        // Delay echo (+230ms delay)
        const delaySamples = Math.floor(0.23 * SAMPLE_RATE);
        if (sampleOffset > delaySamples) {
          const echoL = v.samples[sampleOffset - delaySamples] * 0.28;
          mixL += echoL;
          mixR += echoL * 0.7;
        }
        break;
      }
    }

    // Master Soft Limiter & Loudness Normalization
    left[i] = softClip(mixL * 0.88);
    right[i] = softClip(mixR * 0.88);
  }

  // Write to destination WAV
  const numChannels = 2;
  const bitsPerSample = 16;
  const totalDataBytes = totalSamples * numChannels * 2;
  const header = createWavHeader(numChannels, SAMPLE_RATE, bitsPerSample, totalDataBytes);
  const data = Buffer.alloc(totalDataBytes);

  for (let i = 0; i < totalSamples; i++) {
    let sL = Math.max(-1.0, Math.min(1.0, left[i]));
    let sR = Math.max(-1.0, Math.min(1.0, right[i]));
    data.writeInt16LE(Math.floor(sL * 32767), i * 4);
    data.writeInt16LE(Math.floor(sR * 32767), i * 4 + 2);
  }

  const outPath = 'd:/void-hunter/client/public/audio/vocal_anthem.wav';
  fs.writeFileSync(outPath, Buffer.concat([header, data]));
  console.log(`Saved Vocal Track: ${outPath} (${(fs.statSync(outPath).size / (1024 * 1024)).toFixed(2)} MB)`);
}

generateVocalSong();
