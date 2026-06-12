let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Check if player is muted from Zustand store (we'll read the store dynamically/lazily)
const getIsMuted = (): boolean => {
  try {
    // Dynamically retrieve the store state
    // To avoid circular dependency during imports, we use dynamic import
    // Since we are compiling in ESModules, we can read localStorage directly
    const stored = localStorage.getItem('kak4510-store-v1');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.isMuted ?? false;
    }
    return false;
  } catch (e) {
    return false;
  }
};

export const playTap = () => {
  if (getIsMuted()) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Snappy pitch slide down
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (err) {
    console.warn('Audio synthesis failed:', err);
  }
};

export const playFlip = () => {
  if (getIsMuted()) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

    // Add a tiny bit of white-noise burst using simple programmatic noise
    const bufferSize = ctx.sampleRate * 0.04; // 40ms noise burst
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.03, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch (err) {
    console.warn('Audio synthesis failed:', err);
  }
};

export const playCoin = () => {
  if (getIsMuted()) return;
  try {
    const ctx = getAudioContext();
    
    // Play two rapid sweet retro tones (arpeggio)
    const playTone = (freq: number, startDelay: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime + startDelay);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startDelay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startDelay);
      osc.stop(ctx.currentTime + startDelay + duration);
    };

    // Standard chime arpeggio: C6 -> G6
    playTone(1046.50, 0, 0.12);
    playTone(1567.98, 0.08, 0.2);
  } catch (err) {
    console.warn('Audio playCoin failed:', err);
  }
};

export const playUpgrade = () => {
  if (getIsMuted()) return;
  try {
    const ctx = getAudioContext();
    const playTone = (freq: number, startDelay: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime + startDelay);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startDelay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startDelay);
      osc.stop(ctx.currentTime + startDelay + duration);
    };

    // Play ascending major chord: E5 -> G#5 -> B5 -> E6
    playTone(659.25, 0, 0.12);
    playTone(830.61, 0.06, 0.12);
    playTone(987.77, 0.12, 0.12);
    playTone(1318.51, 0.18, 0.25);
  } catch (err) {
    console.warn('Audio playUpgrade failed:', err);
  }
};

export const playVictory = () => {
  if (getIsMuted()) return;
  try {
    const ctx = getAudioContext();
    const playTone = (freq: number, startDelay: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + startDelay);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startDelay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startDelay);
      osc.stop(ctx.currentTime + startDelay + duration);
    };

    // Melodic fanfare: C5 (0s) -> E5 (0.1s) -> G5 (0.2s) -> C6 (0.3s)
    playTone(523.25, 0, 0.15);
    playTone(659.25, 0.1, 0.15);
    playTone(783.99, 0.2, 0.15);
    playTone(1046.50, 0.3, 0.5);
  } catch (err) {
    console.warn('Audio playVictory failed:', err);
  }
};

export const playDefeat = () => {
  if (getIsMuted()) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // Ominous slide downwards
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

    // Apply lowpass filter to make it sound muffled/retro
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.51);
  } catch (err) {
    console.warn('Audio playDefeat failed:', err);
  }
};
