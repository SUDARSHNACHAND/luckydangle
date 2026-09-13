/**
 * Web Audio API Synthesizer for Lucky Dangle Sound Effects
 * Custom authentic audio for each charm:
 * - Ghanta: Brass temple bell
 * - Daruma: Ink brush stroke & Zen chime
 * - Himmeli: Nordic glass & wind chimes
 * - Chinese Knot: Resonant silk gong
 * - Maneki-Neko: Beckoning cat click
 * - Hamsa / Nazar: Glass eye ripple & mystic wave
 * - Nimbu-Mirchi: Crisp freshness sparkle
 */

export class DangleAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // 1. Ghanta (Temple Bell)
  playBell() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [523.25, 1046.5, 1567.98, 2093.0];
    const gains = [0.6, 0.35, 0.2, 0.1];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(gains[idx], t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 2.5);
    });
  }

  // 2. Daruma: Calligraphy ink stroke & wishing chime
  playDarumaWish() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Soft brush whoosh
    const oscBrush = this.ctx.createOscillator();
    const gainBrush = this.ctx.createGain();
    oscBrush.type = 'triangle';
    oscBrush.frequency.setValueAtTime(280, t);
    oscBrush.frequency.exponentialRampToValueAtTime(120, t + 0.25);
    gainBrush.gain.setValueAtTime(0.2, t);
    gainBrush.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    oscBrush.connect(gainBrush);
    gainBrush.connect(this.ctx.destination);
    oscBrush.start(t);
    oscBrush.stop(t + 0.25);

    // Zen wish chime (E & B notes)
    [659.25, 987.77, 1318.51].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + 0.1 + i * 0.08);
      gain.gain.setValueAtTime(0.25, t + 0.1 + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + 0.1 + i * 0.08);
      osc.stop(t + 1.8);
    });
  }

  // 2b. Daruma Goal Fulfilled: Glorious celebration chord (both eyes painted)
  playDarumaFulfilled() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Calligraphy brush flourish
    const oscBrush = this.ctx.createOscillator();
    const gainBrush = this.ctx.createGain();
    oscBrush.type = 'triangle';
    oscBrush.frequency.setValueAtTime(320, t);
    oscBrush.frequency.exponentialRampToValueAtTime(140, t + 0.3);
    gainBrush.gain.setValueAtTime(0.25, t);
    gainBrush.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    oscBrush.connect(gainBrush);
    gainBrush.connect(this.ctx.destination);
    oscBrush.start(t);
    oscBrush.stop(t + 0.3);

    // Celebratory pentatonic bell chords
    [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + 0.12 + i * 0.07);
      gain.gain.setValueAtTime(0.35 / (1 + i * 0.15), t + 0.12 + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + 0.12 + i * 0.07);
      osc.stop(t + 2.4);
    });
  }


  // 3. Himmeli: Nordic breeze & delicate geometric wind chimes
  playWindChime() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chimePitches = [1174.66, 1318.51, 1567.98, 1760.0, 2093.0];

    chimePitches.forEach((freq, idx) => {
      const noteTime = t + idx * 0.09;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 1.2);
    });
  }

  // 4. Chinese Knot: Resonant silk gong & good fortune chime
  playChineseGong() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Pentatonic gong fundamentals (G, D, A)
    const gongFreqs = [392.0, 587.33, 880.0];

    gongFreqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.4 / (i + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 2.2);
    });
  }

  // 5. Maneki-Neko: Beckoning paw click
  playCatPaw() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(850, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.07);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.07);
  }

  // 6. Nazar & Hamsa: Mystic protection ripple
  playMysticRipple() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.4);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.6);
  }

  // 7. General Sparkle / Garland refresh
  playSparkle() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [659.25, 783.99, 987.77, 1318.51, 1567.98];
    notes.forEach((freq, i) => {
      const t = this.ctx.currentTime + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  // 8. BMW Engine Rev & Turbo Spool Spinner
  playBmwEngine() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    // 1. Engine low-end twin-turbo cylinder rumble (sawtooth through low-pass)
    const oscEngine = this.ctx.createOscillator();
    const filterEngine = this.ctx.createBiquadFilter();
    const gainEngine = this.ctx.createGain();

    oscEngine.type = 'sawtooth';
    oscEngine.frequency.setValueAtTime(65, t);
    oscEngine.frequency.exponentialRampToValueAtTime(240, t + 0.35);
    oscEngine.frequency.exponentialRampToValueAtTime(95, t + 1.1);

    filterEngine.type = 'lowpass';
    filterEngine.frequency.setValueAtTime(180, t);
    filterEngine.frequency.exponentialRampToValueAtTime(750, t + 0.35);
    filterEngine.frequency.exponentialRampToValueAtTime(220, t + 1.1);
    filterEngine.Q.setValueAtTime(3.5, t);

    gainEngine.gain.setValueAtTime(0.001, t);
    gainEngine.gain.linearRampToValueAtTime(0.28, t + 0.08);
    gainEngine.gain.setValueAtTime(0.28, t + 0.38);
    gainEngine.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

    oscEngine.connect(filterEngine);
    filterEngine.connect(gainEngine);
    gainEngine.connect(this.ctx.destination);

    oscEngine.start(t);
    oscEngine.stop(t + 1.2);

    // 2. High-RPM Turbocharger Whistle / Turbine spool
    const oscTurbo = this.ctx.createOscillator();
    const gainTurbo = this.ctx.createGain();

    oscTurbo.type = 'sine';
    oscTurbo.frequency.setValueAtTime(1200, t + 0.05);
    oscTurbo.frequency.exponentialRampToValueAtTime(2900, t + 0.4);
    oscTurbo.frequency.exponentialRampToValueAtTime(1800, t + 0.9);

    gainTurbo.gain.setValueAtTime(0.001, t + 0.05);
    gainTurbo.gain.linearRampToValueAtTime(0.12, t + 0.25);
    gainTurbo.gain.exponentialRampToValueAtTime(0.0001, t + 1.0);

    oscTurbo.connect(gainTurbo);
    gainTurbo.connect(this.ctx.destination);

    oscTurbo.start(t + 0.05);
    oscTurbo.stop(t + 1.0);

    // 3. Blow-off valve air release burst
    const bufferSize = this.ctx.sampleRate * 0.3;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filterNoise = this.ctx.createBiquadFilter();
    filterNoise.type = 'bandpass';
    filterNoise.frequency.setValueAtTime(3200, t + 0.38);
    filterNoise.Q.setValueAtTime(2.0, t + 0.38);

    const gainNoise = this.ctx.createGain();
    gainNoise.gain.setValueAtTime(0.18, t + 0.38);
    gainNoise.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);

    whiteNoise.connect(filterNoise);
    filterNoise.connect(gainNoise);
    gainNoise.connect(this.ctx.destination);

    whiteNoise.start(t + 0.38);
    whiteNoise.stop(t + 0.7);
  }

  // Cord sway sound
  playSway() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.25);

    gain.gain.setValueAtTime(0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }
}

