export const MUSIC_GENRES = [
  {
    id: 'ambientTechno',
    bpm: 114,
    labels: { zh: '氛围 Techno', en: 'Ambient Techno', es: 'Techno ambiental' },
    note: { zh: '材质和空间感更突出，适合慢慢浏览。', en: 'Leans into texture and space for slower browsing.', es: 'Resalta textura y espacio para explorar con calma.' },
    root: 45,
    scale: [0, 2, 3, 7, 10],
    kick: [0, 4, 8, 12],
    snare: [4, 12],
    hats: [2, 6, 10, 14],
    bass: [0, 7, 10, 7],
    pad: [[0, 3, 7], [2, 5, 9], [0, 3, 7], [5, 8, 12]],
    leadDensity: 0.16,
    swing: 0.03,
    pulseBias: 0.35,
    textureBias: 0.88,
    brightnessBias: 0.42,
    bassBias: 0.48,
  },
  {
    id: 'deepHouse',
    bpm: 122,
    labels: { zh: 'Deep House', en: 'Deep House', es: 'Deep House' },
    note: { zh: '四拍稳定、身体感温暖，适合边记边搜。', en: 'Steady four-on-the-floor warmth for logging while you search.', es: 'Cuatro por cuatro cálido para registrar mientras buscas.' },
    root: 43,
    scale: [0, 3, 5, 7, 10],
    kick: [0, 4, 8, 12],
    snare: [4, 12],
    hats: [2, 6, 10, 14],
    bass: [0, 0, 3, 7],
    pad: [[0, 3, 7], [3, 7, 10], [5, 8, 12], [3, 7, 10]],
    leadDensity: 0.26,
    swing: 0.04,
    pulseBias: 0.52,
    textureBias: 0.5,
    brightnessBias: 0.48,
    bassBias: 0.62,
  },
  {
    id: 'acidRave',
    bpm: 128,
    labels: { zh: 'Acid Rave', en: 'Acid Rave', es: 'Acid Rave' },
    note: { zh: '更冲、更会挑起注意力，适合快速录入。', en: 'Sharper and more provocative for fast logging.', es: 'Más punzante y provocador para registrar rápido.' },
    root: 46,
    scale: [0, 3, 5, 7, 10],
    kick: [0, 4, 8, 12],
    snare: [4, 12],
    hats: [2, 3, 6, 7, 10, 11, 14, 15],
    bass: [0, 7, 10, 7],
    pad: [[0, 3, 7], [3, 7, 10], [5, 8, 12], [0, 3, 7]],
    leadDensity: 0.48,
    swing: 0.02,
    pulseBias: 0.72,
    textureBias: 0.42,
    brightnessBias: 0.62,
    bassBias: 0.58,
  },
  {
    id: 'progressiveTrance',
    bpm: 132,
    labels: { zh: 'Progressive Trance', en: 'Progressive Trance', es: 'Progressive Trance' },
    note: { zh: '推进感明显，适合想一路做完的人。', en: 'Clear forward motion for users who want to power through.', es: 'Empuja con claridad para quien quiere terminar del tirón.' },
    root: 50,
    scale: [0, 2, 4, 7, 9],
    kick: [0, 4, 8, 12],
    snare: [4, 12],
    hats: [2, 6, 10, 14],
    bass: [0, 4, 7, 11],
    pad: [[0, 4, 7], [2, 5, 9], [4, 7, 11], [5, 9, 12]],
    leadDensity: 0.44,
    swing: 0,
    pulseBias: 0.58,
    textureBias: 0.54,
    brightnessBias: 0.72,
    bassBias: 0.56,
  },
  {
    id: 'ukGarage',
    bpm: 130,
    labels: { zh: 'UK Garage', en: 'UK Garage', es: 'UK Garage' },
    note: { zh: '更会摆、更会错拍，适合想让页面更有弹性的用户。', en: 'Looser and more syncopated if you want more swing.', es: 'Más suelto y sincopado para dar más rebote a la experiencia.' },
    root: 44,
    scale: [0, 2, 5, 7, 10],
    kick: [0, 5, 8, 13],
    snare: [4, 12],
    hats: [1, 3, 6, 7, 9, 11, 14, 15],
    bass: [0, 3, 7, 10],
    pad: [[0, 3, 7], [2, 5, 9], [0, 5, 9], [3, 7, 10]],
    leadDensity: 0.36,
    swing: 0.08,
    pulseBias: 0.8,
    textureBias: 0.46,
    brightnessBias: 0.56,
    bassBias: 0.72,
  },
  {
    id: 'drumBass',
    bpm: 170,
    labels: { zh: 'Drum & Bass', en: 'Drum & Bass', es: 'Drum & Bass' },
    note: { zh: '最快也最碎，适合没耐心时直接冲。', en: 'Fastest and most fractured for impatient moments.', es: 'La más rápida y fragmentada para momentos sin paciencia.' },
    root: 38,
    scale: [0, 2, 3, 7, 10],
    kick: [0, 6, 8, 14],
    snare: [4, 12],
    hats: [1, 3, 5, 7, 9, 11, 13, 15],
    bass: [0, 10, 7, 3],
    pad: [[0, 3, 7], [3, 7, 10], [5, 8, 12], [3, 7, 10]],
    leadDensity: 0.54,
    swing: 0.01,
    pulseBias: 0.92,
    textureBias: 0.44,
    brightnessBias: 0.62,
    bassBias: 0.84,
  },
  {
    id: 'minimalTechno',
    bpm: 126,
    labels: { zh: 'Minimal Techno', en: 'Minimal Techno', es: 'Minimal Techno' },
    note: { zh: '结构清晰、干扰少，适合专注记录。', en: 'Clean structure with less distraction for focused logging.', es: 'Estructura limpia y menos distracción para registrar con foco.' },
    root: 41,
    scale: [0, 3, 5, 7, 10],
    kick: [0, 4, 8, 12],
    snare: [4, 12],
    hats: [2, 6, 10, 14],
    bass: [0, 3, 0, 7],
    pad: [[0, 3, 7], [0, 3, 7], [3, 7, 10], [0, 3, 7]],
    leadDensity: 0.12,
    swing: 0.03,
    pulseBias: 0.44,
    textureBias: 0.38,
    brightnessBias: 0.36,
    bassBias: 0.52,
  },
  {
    id: 'synthwave',
    bpm: 108,
    labels: { zh: 'Synthwave', en: 'Synthwave', es: 'Synthwave' },
    note: { zh: '更有霓虹感和旋律感，适合边看边逛。', en: 'More neon and melodic for relaxed browsing.', es: 'Más neón y melódico para explorar con calma.' },
    root: 48,
    scale: [0, 2, 4, 7, 9],
    kick: [0, 4, 8, 12],
    snare: [4, 12],
    hats: [2, 6, 10, 14],
    bass: [0, 7, 4, 7],
    pad: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [5, 9, 12]],
    leadDensity: 0.24,
    swing: 0,
    pulseBias: 0.34,
    textureBias: 0.66,
    brightnessBias: 0.68,
    bassBias: 0.44,
  },
  {
    id: 'chillstep',
    bpm: 142,
    labels: { zh: 'Chillstep', en: 'Chillstep', es: 'Chillstep' },
    note: { zh: '低频更柔，但情绪感更明显。', en: 'Softer low-end but more emotional motion.', es: 'Subgrave más suave pero con más emoción.' },
    root: 46,
    scale: [0, 2, 3, 7, 9],
    kick: [0, 8],
    snare: [4, 12],
    hats: [2, 6, 10, 14],
    bass: [0, 7, 9, 7],
    pad: [[0, 3, 7], [2, 5, 9], [0, 3, 7], [4, 7, 11]],
    leadDensity: 0.28,
    swing: 0.02,
    pulseBias: 0.42,
    textureBias: 0.72,
    brightnessBias: 0.58,
    bassBias: 0.64,
  },
];

function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(min, max, t) {
  return min + (max - min) * t;
}

function choose(values, index) {
  return values[index % values.length];
}

function createNoiseBuffer(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

class ElectronicMusicController {
  constructor(initial = {}) {
    this.genreId = initial.genreId || MUSIC_GENRES[1].id;
    this.volume = clamp(Number(initial.volume) || 72, 0, 100);
    this.energy = clamp(Number(initial.energy) || 4, 1, 5);
    this.intensity = clamp(Number(initial.intensity) || 3, 1, 5);
    this.pulse = clamp(Number(initial.pulse) || 3, 1, 5);
    this.bass = clamp(Number(initial.bass) || 4, 1, 5);
    this.brightness = clamp(Number(initial.brightness) || 3, 1, 5);
    this.tempo = clamp(Number(initial.tempo) || 3, 1, 5);
    this.variation = clamp(Number(initial.variation) || 3, 1, 5);
    this.autoMorph = initial.autoMorph !== false;
    this.persistent = initial.persistent !== false;
    this.isPlaying = false;
    this.ctx = null;
    this.master = null;
    this.bassShelf = null;
    this.brightShelf = null;
    this.compressor = null;
    this.outputGain = null;
    this.noiseBuffer = null;
    this.lookaheadMs = 60;
    this.scheduleAhead = 0.36;
    this.currentStep = 0;
    this.nextStepTime = 0;
    this.barCount = 0;
    this.timer = null;
    this.listeners = new Set();
    this.lastTapError = false;
    this._visibilityBound = false;
  }

  get genre() {
    return MUSIC_GENRES.find((item) => item.id === this.genreId) || MUSIC_GENRES[0];
  }

  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit() {
    const snapshot = this.getState();
    this.listeners.forEach((fn) => {
      try { fn(snapshot); } catch (err) { console.warn(err); }
    });
  }

  getState() {
    return {
      genreId: this.genreId,
      genre: this.genre,
      volume: this.volume,
      energy: this.energy,
      intensity: this.intensity,
      pulse: this.pulse,
      bass: this.bass,
      brightness: this.brightness,
      tempo: this.tempo,
      variation: this.variation,
      autoMorph: this.autoMorph,
      persistent: this.persistent,
      isPlaying: this.isPlaying,
      needsTap: this.lastTapError,
      effectiveBpm: this.effectiveBpm(),
    };
  }

  async ensureContext() {
    if (this.ctx) return this.ctx;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) throw new Error('Web Audio API is not supported.');
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.bassShelf = this.ctx.createBiquadFilter();
    this.bassShelf.type = 'lowshelf';
    this.bassShelf.frequency.value = 118;
    this.brightShelf = this.ctx.createBiquadFilter();
    this.brightShelf.type = 'highshelf';
    this.brightShelf.frequency.value = 2500;
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -22;
    this.compressor.knee.value = 18;
    this.compressor.ratio.value = 4;
    this.compressor.attack.value = 0.01;
    this.compressor.release.value = 0.18;
    this.outputGain = this.ctx.createGain();
    this.outputGain.gain.value = 0;
    this.master.connect(this.bassShelf);
    this.bassShelf.connect(this.brightShelf);
    this.brightShelf.connect(this.compressor);
    this.compressor.connect(this.outputGain);
    this.outputGain.connect(this.ctx.destination);
    this.noiseBuffer = createNoiseBuffer(this.ctx);
    this.bindVisibilityWatcher();
    this.updateTone();
    this.updateMasterGain();
    this.updateSchedulingMode();
    this.updateSessionIntegration();
    return this.ctx;
  }

  bindVisibilityWatcher() {
    if (typeof document === 'undefined' || this._visibilityBound) return;
    this._visibilityBound = true;
    document.addEventListener('visibilitychange', () => {
      this.updateSchedulingMode();
      if (!this.isPlaying) return;
      if (!document.hidden) {
        void this.resumeAudioContext().then(() => this.scheduler()).catch(() => null);
        return;
      }
      this.scheduler();
    });
  }

  async resumeAudioContext() {
    const ctx = await this.ensureContext();
    const maxAttempts = 3;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (ctx?.state === 'running') return ctx;
      try {
        if (typeof ctx?.resume === 'function') await ctx.resume();
      } catch (err) {
        if (attempt >= maxAttempts - 1) throw err;
      }
      if (ctx?.state === 'running') return ctx;
      await new Promise((resolve) => window.setTimeout(resolve, 24 * (attempt + 1)));
    }
    if (ctx?.state !== 'running') throw new Error(`AudioContext not running (${ctx?.state || 'unknown'})`);
    return ctx;
  }

  shiftGenre(direction = 1) {
    const currentIndex = Math.max(0, MUSIC_GENRES.findIndex((item) => item.id === this.genreId));
    const nextIndex = (currentIndex + direction + MUSIC_GENRES.length) % MUSIC_GENRES.length;
    this.setGenre(MUSIC_GENRES[nextIndex].id);
  }

  updateSessionIntegration() {
    if (typeof navigator === 'undefined') return;
    try {
      if (navigator.audioSession && 'type' in navigator.audioSession) {
        navigator.audioSession.type = this.persistent ? 'playback' : 'ambient';
      }
    } catch (err) {
      console.warn(err);
    }
    if (!('mediaSession' in navigator)) return;
    try {
      if (typeof MediaMetadata !== 'undefined') {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: '好吃家背景音乐',
          artist: this.genre.labels.en || this.genre.labels.zh,
          album: this.genre.labels.zh || 'Haochijia Web',
        });
      }
      navigator.mediaSession.playbackState = this.isPlaying ? 'playing' : 'paused';
      navigator.mediaSession.setActionHandler('play', () => { void this.start(); });
      navigator.mediaSession.setActionHandler('pause', () => { this.stop(); });
      navigator.mediaSession.setActionHandler('nexttrack', () => { this.shiftGenre(1); });
      navigator.mediaSession.setActionHandler('previoustrack', () => { this.shiftGenre(-1); });
    } catch (err) {
      console.warn(err);
    }
  }

  updateSchedulingMode() {
    const hidden = typeof document !== 'undefined' && document.hidden;
    if (hidden && this.persistent) {
      this.lookaheadMs = 900;
      this.scheduleAhead = 12;
    } else if (hidden) {
      this.lookaheadMs = 280;
      this.scheduleAhead = 4.5;
    } else {
      this.lookaheadMs = 60;
      this.scheduleAhead = 0.36;
    }
    if (this.isPlaying) this.startScheduler();
  }

  updateTone() {
    if (!this.ctx || !this.bassShelf || !this.brightShelf || !this.compressor) return;
    const now = this.ctx.currentTime;
    const genre = this.genre;
    const bassNorm = (this.bass - 1) / 4;
    const brightNorm = (this.brightness - 1) / 4;
    const intensityNorm = (this.intensity - 1) / 4;
    this.bassShelf.gain.setTargetAtTime(lerp(-4, 9, bassNorm * 0.85 + genre.bassBias * 0.15), now, 0.05);
    this.brightShelf.gain.setTargetAtTime(lerp(-4, 7, brightNorm * 0.8 + genre.brightnessBias * 0.2), now, 0.05);
    this.compressor.threshold.setTargetAtTime(lerp(-28, -16, intensityNorm), now, 0.05);
    this.compressor.ratio.setTargetAtTime(lerp(2.8, 5.8, intensityNorm), now, 0.05);
    this.compressor.release.setTargetAtTime(lerp(0.25, 0.12, intensityNorm), now, 0.05);
  }

  updateMasterGain() {
    if (!this.outputGain || !this.ctx) return;
    const normalized = Math.pow(this.volume / 100, 1.18);
    const target = normalized * 0.58;
    const now = this.ctx.currentTime;
    this.outputGain.gain.cancelScheduledValues(now);
    this.outputGain.gain.linearRampToValueAtTime(this.isPlaying ? target : 0, now + 0.08);
  }

  effectiveBpm() {
    const bias = (this.tempo - 3) / 2;
    return Math.round(this.genre.bpm * (1 + bias * 0.12));
  }

  setVolume(value) {
    this.volume = clamp(Number(value) || 0, 0, 100);
    this.updateMasterGain();
    this.emit();
  }

  setEnergy(value) {
    this.energy = clamp(Number(value) || 3, 1, 5);
    this.emit();
  }

  setIntensity(value) {
    this.intensity = clamp(Number(value) || 3, 1, 5);
    this.updateTone();
    this.emit();
  }

  setPulse(value) {
    this.pulse = clamp(Number(value) || 3, 1, 5);
    this.emit();
  }

  setBass(value) {
    this.bass = clamp(Number(value) || 3, 1, 5);
    this.updateTone();
    this.emit();
  }

  setBrightness(value) {
    this.brightness = clamp(Number(value) || 3, 1, 5);
    this.updateTone();
    this.emit();
  }

  setTempo(value) {
    this.tempo = clamp(Number(value) || 3, 1, 5);
    this.emit();
  }

  setVariation(value) {
    this.variation = clamp(Number(value) || 3, 1, 5);
    this.emit();
  }

  setAutoMorph(value) {
    this.autoMorph = Boolean(value);
    this.emit();
  }

  setPersistent(value) {
    this.persistent = Boolean(value);
    this.updateSchedulingMode();
    this.updateSessionIntegration();
    this.emit();
  }

  setGenre(id) {
    if (!MUSIC_GENRES.some((item) => item.id === id)) return;
    this.genreId = id;
    this.currentStep = 0;
    this.barCount = 0;
    if (this.ctx) this.nextStepTime = this.ctx.currentTime + 0.06;
    this.updateTone();
    this.updateSessionIntegration();
    this.emit();
  }

  async toggle() {
    if (this.isPlaying) {
      this.stop();
      return true;
    }
    return this.start();
  }

  async play() {
    return this.start();
  }

  pause() {
    this.stop();
    return true;
  }

  async start() {
    try {
      const ctx = await this.resumeAudioContext();
      this.lastTapError = false;
      this.isPlaying = true;
      this.currentStep = 0;
      this.barCount = 0;
      this.nextStepTime = ctx.currentTime + 0.08;
      this.updateTone();
      this.updateMasterGain();
      this.updateSchedulingMode();
      this.scheduler();
      this.updateSessionIntegration();
      this.emit();
      return true;
    } catch (err) {
      console.warn(err);
      this.lastTapError = true;
      this.isPlaying = false;
      this.updateSessionIntegration();
      this.emit();
      return false;
    }
  }

  stop() {
    this.isPlaying = false;
    this.updateMasterGain();
    this.stopScheduler();
    this.updateSessionIntegration();
    this.emit();
  }

  stopScheduler() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  startScheduler() {
    this.stopScheduler();
    this.timer = window.setInterval(() => this.scheduler(), this.lookaheadMs);
  }

  stepDuration() {
    return 60 / this.effectiveBpm() / 4;
  }

  scheduler() {
    if (!this.isPlaying || !this.ctx) return;
    while (this.nextStepTime < this.ctx.currentTime + this.scheduleAhead) {
      this.scheduleStep(this.currentStep, this.nextStepTime);
      this.advanceStep();
    }
  }

  advanceStep() {
    const baseSwing = this.genre.swing || 0;
    const pulseSwing = lerp(0, 0.08, (this.pulse - 1) / 4);
    const duration = this.stepDuration();
    const odd = this.currentStep % 2 === 1 ? duration * (baseSwing + pulseSwing * 0.55) : 0;
    this.nextStepTime += duration + odd;
    const nextStep = (this.currentStep + 1) % 16;
    const wrapped = nextStep === 0;
    this.currentStep = nextStep;
    if (wrapped) this.onBarBoundary();
  }

  onBarBoundary() {
    this.barCount += 1;
    if (!this.autoMorph) return;
    const interval = Math.max(2, 7 - this.variation);
    if (this.barCount % interval !== 0) return;
    this.applyAutoMorph();
  }

  applyAutoMorph() {
    const depth = Math.max(0, (this.variation - 1) / 4);
    const axes = ['energy', 'intensity', 'pulse', 'bass', 'brightness', 'tempo'];
    const edits = Math.max(1, Math.round(1 + depth * 2));
    for (let i = 0; i < edits; i += 1) {
      const axis = axes[(this.barCount + i) % axes.length];
      const delta = Math.random() < 0.55 ? 1 : -1;
      this[axis] = clamp(this[axis] + delta, 1, 5);
    }
    if (depth > 0.72 && this.barCount % 16 === 0 && Math.random() < 0.18) {
      this.shiftGenre(Math.random() < 0.5 ? -1 : 1);
      return;
    }
    this.updateTone();
    this.emit();
  }

  scheduleStep(step, time) {
    const genre = this.genre;
    const energyNorm = (this.energy - 1) / 4;
    const intensityNorm = (this.intensity - 1) / 4;
    const pulseNorm = (this.pulse - 1) / 4;
    const bassNorm = (this.bass - 1) / 4;
    const brightNorm = (this.brightness - 1) / 4;

    const kickAmount = 0.68 + intensityNorm * 0.22 + bassNorm * 0.1;
    const bassAmount = 0.16 + bassNorm * 0.12 + intensityNorm * 0.05;
    const hatAmount = 0.03 + pulseNorm * 0.03 + brightNorm * 0.02;
    const leadDensity = genre.leadDensity * (0.55 + energyNorm * 0.85 + brightNorm * 0.35);

    if (genre.kick.includes(step)) this.playKick(time, kickAmount);
    if (intensityNorm > 0.58 && step % 8 === 6) this.playGhostKick(time + this.stepDuration() * 0.18, 0.14 + intensityNorm * 0.08);
    if (genre.snare.includes(step)) this.playSnare(time, 0.12 + intensityNorm * 0.07);

    if (genre.hats.includes(step) || pulseNorm > 0.5 && step % 2 === 1) {
      const open = step % 4 === 2 || pulseNorm > 0.72 && step % 4 === 3;
      this.playHat(time, hatAmount, open);
    }
    if (pulseNorm > 0.65 && (step === 3 || step === 11)) this.playHat(time, hatAmount * 0.65, false);

    if (step % 4 === 0) this.playBass(step, time, bassAmount);
    if (genre.pulseBias > 0.7 && (step === 6 || step === 14)) this.playBass(step + 1, time, bassAmount * 0.62);

    if (step === 0 || step === 8) this.playPad(step, time, 0.08 + energyNorm * 0.04 + genre.textureBias * 0.03);
    if (genre.textureBias > 0.7 && step === 12) this.playAtmos(time, 0.02 + brightNorm * 0.02);

    if (Math.random() < leadDensity && step % 2 === 0) this.playLead(step, time, 0.04 + energyNorm * 0.04 + brightNorm * 0.02);
    if (energyNorm > 0.55 && (step === 7 || step === 15)) this.playPerc(time, 0.025 + pulseNorm * 0.02);
    if (this.energy >= 4 && step % 8 === 7) this.playRiser(time, 0.03 + intensityNorm * 0.025 + brightNorm * 0.015);
  }

  connectWithEnvelope(source, destination, time, attack, sustain, release, amount) {
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, amount), time + attack);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.00016, amount * 0.65), time + attack + sustain);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + attack + sustain + release);
    source.connect(gain);
    gain.connect(destination);
    return gain;
  }

  createVoice(type, freq, time, duration, gainAmount, options = {}) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const panner = this.ctx.createStereoPanner();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    if (options.detune) osc.detune.setValueAtTime(options.detune, time);
    filter.type = options.filterType || 'lowpass';
    filter.frequency.setValueAtTime(options.filterFreq || 1800, time);
    filter.Q.value = options.q || 0.7;
    panner.pan.value = options.pan || 0;
    osc.connect(filter);
    filter.connect(panner);
    this.connectWithEnvelope(
      panner,
      this.master,
      time,
      options.attack || 0.01,
      Math.max(0.01, duration * 0.6),
      options.release || 0.08,
      gainAmount,
    );
    osc.start(time);
    osc.stop(time + duration + 0.12);
  }

  playKick(time, amount) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(118, time);
    osc.frequency.exponentialRampToValueAtTime(46, time + 0.14);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(720, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(amount, time + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    osc.start(time);
    osc.stop(time + 0.24);
  }

  playGhostKick(time, amount) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(92, time);
    osc.frequency.exponentialRampToValueAtTime(54, time + 0.08);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(amount, time + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.11);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(time);
    osc.stop(time + 0.14);
  }

  playSnare(time, amount) {
    if (!this.ctx || !this.master || !this.noiseBuffer) return;
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const band = this.ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.setValueAtTime(1900 + (this.brightness - 3) * 120, time);
    band.Q.value = 0.8;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(amount, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);
    source.connect(band);
    band.connect(gain);
    gain.connect(this.master);
    source.start(time);
    source.stop(time + 0.16);
    this.createVoice('triangle', midiToFreq(this.genre.root + 12), time, 0.08, amount * 0.32, { filterFreq: 1400, attack: 0.003, release: 0.05 });
  }

  playHat(time, amount, open = false) {
    if (!this.ctx || !this.master || !this.noiseBuffer) return;
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(open ? 6200 : 7600 + (this.brightness - 3) * 180, time);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(amount, time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + (open ? 0.12 : 0.05));
    source.connect(hp);
    hp.connect(gain);
    gain.connect(this.master);
    source.start(time);
    source.stop(time + (open ? 0.13 : 0.055));
  }

  playBass(step, time, amount) {
    const genre = this.genre;
    const barStep = Math.floor(step / 4) % genre.bass.length;
    const note = genre.root + choose(genre.bass, barStep) - 12;
    const pulseNorm = (this.pulse - 1) / 4;
    const bassNorm = (this.bass - 1) / 4;
    const duration = this.stepDuration() * lerp(1.4, 2.5, 1 - pulseNorm * 0.55 + bassNorm * 0.2);
    const filter = lerp(280, 760, bassNorm * 0.75 + (this.brightness - 1) / 4 * 0.25);
    this.createVoice('sawtooth', midiToFreq(note), time, duration, amount, {
      filterFreq: filter,
      attack: 0.01,
      release: 0.09,
      q: 1.1,
    });
    if (bassNorm > 0.62) this.createVoice('sine', midiToFreq(note - 12), time, duration * 0.92, amount * 0.45, { filterFreq: 220, attack: 0.01, release: 0.1 });
  }

  playPad(step, time, amount) {
    if (!this.ctx || !this.master) return;
    const genre = this.genre;
    const bar = Math.floor(step / 4) % genre.pad.length;
    const chord = choose(genre.pad, bar);
    const duration = this.stepDuration() * 8;
    const brightNorm = (this.brightness - 1) / 4;
    chord.forEach((offset, idx) => {
      this.createVoice(idx === 0 ? 'triangle' : 'sine', midiToFreq(genre.root + offset), time, duration, amount / (1.5 + idx * 0.28), {
        filterFreq: lerp(1100, 2600, brightNorm),
        attack: 0.05,
        release: 0.18,
        pan: idx === 0 ? -0.2 : idx === 1 ? 0.2 : 0,
      });
    });
  }

  playLead(step, time, amount) {
    const genre = this.genre;
    const noteOffset = choose(genre.scale, step + this.energy + this.pulse);
    const freq = midiToFreq(genre.root + 12 + noteOffset);
    const brightNorm = (this.brightness - 1) / 4;
    const wave = brightNorm > 0.55 ? 'square' : brightNorm < 0.28 ? 'triangle' : 'sawtooth';
    this.createVoice(wave, freq, time, 0.16 + this.stepDuration() * 0.45, amount, {
      filterFreq: lerp(1700, 3600, brightNorm),
      attack: 0.008,
      release: 0.09,
      pan: step % 4 === 0 ? -0.16 : 0.16,
      detune: step % 4 === 0 ? -4 : 4,
    });
  }

  playPerc(time, amount) {
    if (!this.ctx || !this.master || !this.noiseBuffer) return;
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(3400, time);
    bp.Q.value = 1.2;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(amount, time + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    source.connect(bp);
    bp.connect(gain);
    gain.connect(this.master);
    source.start(time);
    source.stop(time + 0.06);
  }

  playAtmos(time, amount) {
    if (!this.ctx || !this.master || !this.noiseBuffer) return;
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(980 + (this.brightness - 3) * 110, time);
    filter.Q.value = 0.45;
    const panner = this.ctx.createStereoPanner();
    panner.pan.value = -0.18;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(amount, time + 0.12);
    gain.gain.linearRampToValueAtTime(0.0001, time + 0.54);
    source.connect(filter);
    filter.connect(panner);
    panner.connect(gain);
    gain.connect(this.master);
    source.start(time);
    source.stop(time + 0.6);
  }

  playRiser(time, amount) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(600 + (this.brightness - 3) * 90, time);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, time);
    osc.frequency.exponentialRampToValueAtTime(880, time + 0.28);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(amount, time + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    osc.start(time);
    osc.stop(time + 0.32);
  }
}

export function createMusicController(initial = {}) {
  return new ElectronicMusicController(initial);
}


/* ===== v28 genre separation / stable style switching ===== */
function genreRefV28(id) {
  return MUSIC_GENRES.find((item) => item.id === id);
}

const ambientTechnoV28 = genreRefV28('ambientTechno');
if (ambientTechnoV28) {
  Object.assign(ambientTechnoV28, {
    bpm: 104,
    labels: { zh: 'Ambient / Chill', en: 'Ambient / Chill', es: 'Ambient / Chill' },
    note: { zh: '更慢、更松、更有空气感。', en: 'Slower, softer and airier.', es: 'Más lento, suave y espacioso.' },
    kick: [0, 8],
    snare: [12],
    hats: [3, 7, 11, 15],
    bass: [0, 5, 7, 5],
    pad: [[0, 3, 7], [0, 5, 9], [2, 5, 9], [0, 3, 7]],
    leadDensity: 0.08,
    swing: 0.01,
    pulseBias: 0.22,
    textureBias: 0.96,
    brightnessBias: 0.28,
    bassBias: 0.36,
  });
}
const deepHouseV28 = genreRefV28('deepHouse');
if (deepHouseV28) {
  Object.assign(deepHouseV28, {
    bpm: 120,
    labels: { zh: 'Warm House', en: 'Warm House', es: 'Warm House' },
    note: { zh: '更暖、更稳，更适合边搜边记。', en: 'Warmer and steadier for search-and-log flow.', es: 'Más cálido y estable para buscar y registrar.' },
    bass: [0, 0, 3, 5],
    pad: [[0, 3, 7], [3, 7, 10], [5, 8, 12], [2, 5, 9]],
    leadDensity: 0.22,
    swing: 0.045,
    pulseBias: 0.5,
    textureBias: 0.46,
    brightnessBias: 0.44,
    bassBias: 0.64,
  });
}
const synthwaveV28 = genreRefV28('synthwave');
if (synthwaveV28) {
  Object.assign(synthwaveV28, {
    bpm: 108,
    labels: { zh: 'Synthwave / Neon', en: 'Synthwave / Neon', es: 'Synthwave / Neon' },
    note: { zh: '更亮、更有霓虹旋律，明显不是 techno。', en: 'More neon melody and clearly not techno.', es: 'Más neón y melodía; claramente no es techno.' },
    kick: [0, 8],
    snare: [4, 12],
    hats: [2, 6, 10, 14],
    bass: [0, 7, 4, 2],
    pad: [[0, 4, 7], [5, 9, 12], [7, 11, 14], [4, 7, 11]],
    leadDensity: 0.34,
    swing: 0,
    pulseBias: 0.3,
    textureBias: 0.74,
    brightnessBias: 0.78,
    bassBias: 0.4,
  });
}
const chillstepV28 = genreRefV28('chillstep');
if (chillstepV28) {
  Object.assign(chillstepV28, {
    bpm: 138,
    labels: { zh: 'Chill / Float', en: 'Chill / Float', es: 'Chill / Float' },
    note: { zh: '低频柔一点，情绪层更明显。', en: 'Softer bass with a more emotional lift.', es: 'Grave más suave y una capa emocional más clara.' },
    kick: [0, 8],
    snare: [4, 12],
    hats: [6, 10, 14],
    bass: [0, 7, 9, 7],
    pad: [[0, 3, 7], [2, 5, 9], [0, 3, 7], [4, 7, 11]],
    leadDensity: 0.2,
    swing: 0.02,
    pulseBias: 0.34,
    textureBias: 0.82,
    brightnessBias: 0.5,
    bassBias: 0.58,
  });
}
const ukGarageV28 = genreRefV28('ukGarage');
if (ukGarageV28) {
  Object.assign(ukGarageV28, {
    bpm: 132,
    labels: { zh: 'Broken / UKG', en: 'Broken / UKG', es: 'Broken / UKG' },
    note: { zh: '更碎、更弹，明显带 broken groove。', en: 'Bouncier and more broken-groove forward.', es: 'Más roto y con más rebote.' },
    kick: [0, 5, 8, 13],
    snare: [4, 12],
    hats: [1, 3, 6, 7, 9, 11, 14, 15],
    bass: [0, 3, 7, 10],
    leadDensity: 0.32,
    swing: 0.09,
    pulseBias: 0.86,
    textureBias: 0.42,
    brightnessBias: 0.52,
    bassBias: 0.72,
  });
}
const drumBassV28 = genreRefV28('drumBass');
if (drumBassV28) {
  Object.assign(drumBassV28, {
    bpm: 168,
    labels: { zh: 'Drum & Bass', en: 'Drum & Bass', es: 'Drum & Bass' },
    note: { zh: '最快、最碎、最有冲击。', en: 'Fastest, most fractured and most urgent.', es: 'La más rápida, rota y urgente.' },
    kick: [0, 6, 8, 14],
    snare: [4, 12],
    hats: [1, 3, 5, 7, 9, 11, 13, 15],
    bass: [0, 10, 7, 3],
    leadDensity: 0.5,
    swing: 0.01,
    pulseBias: 0.94,
    textureBias: 0.34,
    brightnessBias: 0.68,
    bassBias: 0.84,
  });
}
const progressiveTranceV28 = genreRefV28('progressiveTrance');
if (progressiveTranceV28) {
  Object.assign(progressiveTranceV28, {
    bpm: 130,
    labels: { zh: 'Melodic Drive', en: 'Melodic Drive', es: 'Melodic Drive' },
    note: { zh: '更抬头、更旋律、更像长线推进。', en: 'More uplifting and melodic with a longer arc.', es: 'Más melódico y ascendente.' },
    leadDensity: 0.46,
    swing: 0,
    pulseBias: 0.54,
    textureBias: 0.58,
    brightnessBias: 0.8,
    bassBias: 0.54,
  });
}
const minimalTechnoV28 = genreRefV28('minimalTechno');
if (minimalTechnoV28) {
  Object.assign(minimalTechnoV28, {
    bpm: 124,
    labels: { zh: 'Minimal Pulse', en: 'Minimal Pulse', es: 'Minimal Pulse' },
    note: { zh: '更干净、更留白，用来专注。', en: 'Cleaner and sparer for focus.', es: 'Más limpio y minimal para concentrarse.' },
    leadDensity: 0.1,
    swing: 0.025,
    pulseBias: 0.36,
    textureBias: 0.34,
    brightnessBias: 0.3,
    bassBias: 0.48,
  });
}

const GENRE_META_V28 = {
  ambientTechno: { family: 'ambient', kickStart: 100, kickEnd: 40, kickDuration: 0.18, kickFilter: 560, kickWave: 'sine', bassWave: 'sine', bassSub: 0.28, bassFilterMin: 220, bassFilterMax: 420, bassQ: 0.8, padWaves: ['sine', 'triangle', 'sine'], padAttack: 0.12, padRelease: 0.32, padFilterMin: 620, padFilterMax: 1500, leadWave: 'sine', leadDuration: 0.26, leadFilterMin: 900, leadFilterMax: 2200, hatClosedFreq: 8800, hatOpenFreq: 5600, closedHatDecay: 0.036, openHatDecay: 0.11, snareBand: 1600, snareToneWave: 'triangle', snareToneOffset: 5, atmosBand: 640, atmosDuration: 0.9, riserWave: 'triangle', kickPunch: 0.88, leadBoost: -0.08, padBoost: 0.05 },
  deepHouse: { family: 'house', kickStart: 112, kickEnd: 46, kickDuration: 0.24, kickFilter: 720, kickWave: 'sine', bassWave: 'triangle', bassSub: 0.38, bassFilterMin: 260, bassFilterMax: 620, bassQ: 1.0, padWaves: ['triangle', 'sine', 'triangle'], padAttack: 0.04, padRelease: 0.18, padFilterMin: 900, padFilterMax: 2200, leadWave: 'triangle', leadDuration: 0.2, leadFilterMin: 1200, leadFilterMax: 2600, hatClosedFreq: 7600, hatOpenFreq: 5200, closedHatDecay: 0.05, openHatDecay: 0.12, snareBand: 1850, snareToneWave: 'triangle', snareToneOffset: 7, atmosBand: 880, atmosDuration: 0.48, riserWave: 'triangle', kickPunch: 1.0, leadBoost: 0.02, padBoost: 0.03 },
  acidRave: { family: 'acid', kickStart: 122, kickEnd: 48, kickDuration: 0.22, kickFilter: 820, kickWave: 'triangle', bassWave: 'sawtooth', bassSub: 0.28, bassFilterMin: 560, bassFilterMax: 1500, bassQ: 2.0, padWaves: ['triangle', 'sine', 'sine'], padAttack: 0.025, padRelease: 0.12, padFilterMin: 1200, padFilterMax: 2200, leadWave: 'square', leadDuration: 0.14, leadFilterMin: 2200, leadFilterMax: 4200, hatClosedFreq: 9000, hatOpenFreq: 6000, closedHatDecay: 0.045, openHatDecay: 0.1, snareBand: 2200, snareToneWave: 'square', snareToneOffset: 12, atmosBand: 1200, atmosDuration: 0.32, riserWave: 'sawtooth', kickPunch: 1.08, leadBoost: 0.08, padBoost: -0.02 },
  progressiveTrance: { family: 'trance', kickStart: 118, kickEnd: 46, kickDuration: 0.24, kickFilter: 760, kickWave: 'sine', bassWave: 'sawtooth', bassSub: 0.42, bassFilterMin: 320, bassFilterMax: 860, bassQ: 1.2, padWaves: ['sawtooth', 'triangle', 'sine'], padAttack: 0.03, padRelease: 0.22, padFilterMin: 1500, padFilterMax: 3200, leadWave: 'square', leadDuration: 0.26, leadFilterMin: 2400, leadFilterMax: 4200, hatClosedFreq: 8200, hatOpenFreq: 5600, closedHatDecay: 0.048, openHatDecay: 0.14, snareBand: 2100, snareToneWave: 'triangle', snareToneOffset: 9, atmosBand: 1100, atmosDuration: 0.46, riserWave: 'sawtooth', kickPunch: 1.0, leadBoost: 0.1, padBoost: 0.04 },
  ukGarage: { family: 'broken', kickStart: 108, kickEnd: 48, kickDuration: 0.22, kickFilter: 680, kickWave: 'triangle', bassWave: 'square', bassSub: 0.44, bassFilterMin: 320, bassFilterMax: 940, bassQ: 1.4, padWaves: ['triangle', 'sine', 'triangle'], padAttack: 0.025, padRelease: 0.16, padFilterMin: 900, padFilterMax: 2000, leadWave: 'triangle', leadDuration: 0.17, leadFilterMin: 1300, leadFilterMax: 2400, hatClosedFreq: 8400, hatOpenFreq: 5800, closedHatDecay: 0.04, openHatDecay: 0.09, snareBand: 1700, snareToneWave: 'triangle', snareToneOffset: 5, atmosBand: 980, atmosDuration: 0.42, riserWave: 'triangle', kickPunch: 0.96, leadBoost: 0.04, padBoost: -0.01 },
  drumBass: { family: 'dnb', kickStart: 124, kickEnd: 50, kickDuration: 0.19, kickFilter: 860, kickWave: 'triangle', bassWave: 'square', bassSub: 0.62, bassFilterMin: 420, bassFilterMax: 1200, bassQ: 1.6, padWaves: ['triangle', 'sine', 'sine'], padAttack: 0.02, padRelease: 0.12, padFilterMin: 1200, padFilterMax: 2400, leadWave: 'square', leadDuration: 0.12, leadFilterMin: 1800, leadFilterMax: 3200, hatClosedFreq: 9800, hatOpenFreq: 6600, closedHatDecay: 0.032, openHatDecay: 0.08, snareBand: 2500, snareToneWave: 'triangle', snareToneOffset: 10, atmosBand: 1400, atmosDuration: 0.32, riserWave: 'square', kickPunch: 1.08, leadBoost: 0.06, padBoost: -0.02 },
  minimalTechno: { family: 'minimal', kickStart: 116, kickEnd: 44, kickDuration: 0.2, kickFilter: 680, kickWave: 'sine', bassWave: 'sawtooth', bassSub: 0.26, bassFilterMin: 280, bassFilterMax: 620, bassQ: 1.2, padWaves: ['triangle', 'sine', 'sine'], padAttack: 0.03, padRelease: 0.14, padFilterMin: 850, padFilterMax: 1800, leadWave: 'triangle', leadDuration: 0.14, leadFilterMin: 1100, leadFilterMax: 2200, hatClosedFreq: 7600, hatOpenFreq: 5000, closedHatDecay: 0.042, openHatDecay: 0.095, snareBand: 1700, snareToneWave: 'triangle', snareToneOffset: 5, atmosBand: 780, atmosDuration: 0.42, riserWave: 'triangle', kickPunch: 0.94, leadBoost: -0.06, padBoost: -0.03 },
  synthwave: { family: 'synthwave', kickStart: 104, kickEnd: 44, kickDuration: 0.22, kickFilter: 640, kickWave: 'triangle', bassWave: 'square', bassSub: 0.3, bassFilterMin: 300, bassFilterMax: 760, bassQ: 0.9, padWaves: ['sawtooth', 'triangle', 'sawtooth'], padAttack: 0.06, padRelease: 0.26, padFilterMin: 1400, padFilterMax: 3000, leadWave: 'triangle', leadDuration: 0.3, leadFilterMin: 2100, leadFilterMax: 3600, hatClosedFreq: 7300, hatOpenFreq: 4800, closedHatDecay: 0.05, openHatDecay: 0.13, snareBand: 1900, snareToneWave: 'square', snareToneOffset: 7, atmosBand: 1250, atmosDuration: 0.56, riserWave: 'sawtooth', kickPunch: 0.92, leadBoost: 0.08, padBoost: 0.08 },
  chillstep: { family: 'chill', kickStart: 92, kickEnd: 38, kickDuration: 0.24, kickFilter: 520, kickWave: 'sine', bassWave: 'sine', bassSub: 0.48, bassFilterMin: 220, bassFilterMax: 520, bassQ: 0.75, padWaves: ['triangle', 'sine', 'sine'], padAttack: 0.1, padRelease: 0.34, padFilterMin: 780, padFilterMax: 1600, leadWave: 'triangle', leadDuration: 0.22, leadFilterMin: 1200, leadFilterMax: 2400, hatClosedFreq: 7000, hatOpenFreq: 5000, closedHatDecay: 0.046, openHatDecay: 0.11, snareBand: 1800, snareToneWave: 'triangle', snareToneOffset: 7, atmosBand: 760, atmosDuration: 0.72, riserWave: 'triangle', kickPunch: 0.86, leadBoost: 0.02, padBoost: 0.06 },
};

const protoV28 = ElectronicMusicController.prototype;
protoV28.genreMetaV28 = function genreMetaV28() {
  return GENRE_META_V28[this.genreId] || {};
};

const legacySetGenreV28 = protoV28.setGenre;
protoV28.setGenre = function setGenreV28(id, options = {}) {
  legacySetGenreV28.call(this, id);
  if (options.manual === false) return;
  this.userPinnedGenre = this.genreId;
  this.manualGenreLockUntilBar = (this.barCount || 0) + 48;
};

protoV28.applyAutoMorph = function applyAutoMorphV28() {
  const depth = Math.max(0, (this.variation - 1) / 4);
  const locked = Number.isFinite(this.manualGenreLockUntilBar) && (this.barCount || 0) < this.manualGenreLockUntilBar;
  const axes = locked ? ['brightness', 'bass', 'pulse'] : ['energy', 'intensity', 'pulse', 'bass', 'brightness', 'tempo'];
  const edits = Math.max(1, Math.min(2, Math.round(1 + depth * 0.8)));
  for (let i = 0; i < edits; i += 1) {
    const axis = axes[(this.barCount + i) % axes.length];
    const delta = Math.random() < 0.6 ? 1 : -1;
    this[axis] = clamp(Number(this[axis] || 3) + delta, 1, 5);
  }
  if (this.userPinnedGenre && MUSIC_GENRES.some((item) => item.id === this.userPinnedGenre)) this.genreId = this.userPinnedGenre;
  this.updateTone();
  this.emit();
};

protoV28.scheduleStep = function scheduleStepV28(step, time) {
  const genre = this.genre;
  const meta = this.genreMetaV28();
  const family = meta.family || '';
  const energyNorm = (this.energy - 1) / 4;
  const intensityNorm = (this.intensity - 1) / 4;
  const pulseNorm = (this.pulse - 1) / 4;
  const bassNorm = (this.bass - 1) / 4;
  const brightNorm = (this.brightness - 1) / 4;

  const kickAmount = (0.64 + intensityNorm * 0.22 + bassNorm * 0.1) * (meta.kickPunch || 1);
  const bassAmount = 0.16 + bassNorm * 0.14 + intensityNorm * 0.05;
  const hatAmount = 0.024 + pulseNorm * 0.03 + brightNorm * 0.025;
  const leadDensity = Math.max(0.03, genre.leadDensity * (0.45 + energyNorm * 0.9 + brightNorm * 0.34) + (meta.leadBoost || 0));
  const padAmount = Math.max(0.04, 0.075 + energyNorm * 0.03 + genre.textureBias * 0.03 + (meta.padBoost || 0));

  if (genre.kick.includes(step)) this.playKick(time, kickAmount);
  if (family === 'broken' && (step === 5 || step === 13)) this.playGhostKick(time + this.stepDuration() * 0.08, 0.12 + intensityNorm * 0.06);
  else if (family === 'dnb' && (step === 2 || step === 10 || step === 15)) this.playGhostKick(time + this.stepDuration() * 0.06, 0.12 + intensityNorm * 0.06);
  else if (intensityNorm > 0.62 && step % 8 === 6) this.playGhostKick(time + this.stepDuration() * 0.18, 0.13 + intensityNorm * 0.08);

  if (genre.snare.includes(step) || (family === 'ambient' && step === 12)) this.playSnare(time, 0.11 + intensityNorm * 0.07);

  const hatHit = genre.hats.includes(step)
    || (pulseNorm > 0.56 && step % 2 === 1)
    || (family === 'dnb' && step % 2 === 0 && step !== 0)
    || (family === 'ambient' && (step === 7 || step === 15));
  if (hatHit) {
    const open = step % 4 === 2 || (family === 'house' && step === 14) || (family === 'synthwave' && step === 6);
    this.playHat(time, hatAmount, open);
  }
  if (family === 'broken' && (step === 3 || step === 11)) this.playHat(time, hatAmount * 0.58, false);

  if (step % 4 === 0 || (family === 'broken' && (step === 5 || step === 13)) || (family === 'dnb' && (step === 6 || step === 14))) {
    this.playBass(step, time, bassAmount);
  }
  if (genre.pulseBias > 0.72 && (step === 6 || step === 14)) this.playBass(step + 1, time, bassAmount * 0.58);

  if (step === 0 || step === 8 || (family === 'ambient' && step === 4) || (family === 'synthwave' && step === 12)) {
    this.playPad(step, time, padAmount);
  }
  if ((family === 'ambient' && step === 12) || (family === 'synthwave' && step === 6) || (genre.textureBias > 0.74 && step === 12)) {
    this.playAtmos(time, 0.02 + brightNorm * 0.022);
  }

  const leadAllowed = family === 'ambient' ? step % 4 === 0 : step % 2 === 0;
  if (leadAllowed && Math.random() < leadDensity) this.playLead(step, time, 0.034 + energyNorm * 0.04 + brightNorm * 0.024);

  if (energyNorm > 0.55 && (step === 7 || step === 15 || (family === 'broken' && step === 11))) this.playPerc(time, 0.022 + pulseNorm * 0.02);
  if (this.energy >= 4 && (step % 8 === 7 || (family === 'trance' && step === 3))) this.playRiser(time, 0.028 + intensityNorm * 0.026 + brightNorm * 0.016);
};

protoV28.playKick = function playKickV28(time, amount) {
  if (!this.ctx || !this.master) return;
  const meta = this.genreMetaV28();
  const osc = this.ctx.createOscillator();
  const gain = this.ctx.createGain();
  const filter = this.ctx.createBiquadFilter();
  osc.type = meta.kickWave || 'sine';
  osc.frequency.setValueAtTime(meta.kickStart || 118, time);
  osc.frequency.exponentialRampToValueAtTime(meta.kickEnd || 46, time + (meta.kickDuration || 0.2) * 0.62);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(meta.kickFilter || 720, time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(amount, time + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + (meta.kickDuration || 0.2));
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(this.master);
  osc.start(time);
  osc.stop(time + (meta.kickDuration || 0.2) + 0.03);
};

protoV28.playSnare = function playSnareV28(time, amount) {
  if (!this.ctx || !this.master || !this.noiseBuffer) return;
  const meta = this.genreMetaV28();
  const source = this.ctx.createBufferSource();
  source.buffer = this.noiseBuffer;
  const band = this.ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.setValueAtTime(meta.snareBand || (1900 + (this.brightness - 3) * 120), time);
  band.Q.value = meta.snareQ || 0.9;
  const gain = this.ctx.createGain();
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(amount, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.14);
  source.connect(band);
  band.connect(gain);
  gain.connect(this.master);
  source.start(time);
  source.stop(time + 0.16);
  this.createVoice(meta.snareToneWave || 'triangle', midiToFreq(this.genre.root + (meta.snareToneOffset || 12)), time, 0.08, amount * 0.32, {
    filterFreq: (meta.snareBand || 1800) * 0.78,
    attack: 0.003,
    release: 0.05,
  });
};

protoV28.playHat = function playHatV28(time, amount, open = false) {
  if (!this.ctx || !this.master || !this.noiseBuffer) return;
  const meta = this.genreMetaV28();
  const source = this.ctx.createBufferSource();
  source.buffer = this.noiseBuffer;
  const hp = this.ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.setValueAtTime(open ? (meta.hatOpenFreq || 6200) : (meta.hatClosedFreq || 7600), time);
  const gain = this.ctx.createGain();
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(amount, time + 0.002);
  const decay = open ? (meta.openHatDecay || 0.12) : (meta.closedHatDecay || 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + decay);
  source.connect(hp);
  hp.connect(gain);
  gain.connect(this.master);
  source.start(time);
  source.stop(time + decay + 0.01);
};

protoV28.playBass = function playBassV28(step, time, amount) {
  const meta = this.genreMetaV28();
  const genre = this.genre;
  const barStep = Math.floor(step / 4) % genre.bass.length;
  const note = genre.root + choose(genre.bass, barStep) - 12;
  const pulseNorm = (this.pulse - 1) / 4;
  const bassNorm = (this.bass - 1) / 4;
  const duration = this.stepDuration() * lerp(1.32, 2.4, 1 - pulseNorm * 0.5 + bassNorm * 0.2);
  const filter = lerp(meta.bassFilterMin || 280, meta.bassFilterMax || 760, bassNorm * 0.75 + (this.brightness - 1) / 4 * 0.25);
  this.createVoice(meta.bassWave || 'sawtooth', midiToFreq(note), time, duration, amount, {
    filterFreq: filter,
    attack: meta.family === 'acid' ? 0.004 : 0.01,
    release: meta.family === 'acid' ? 0.05 : 0.09,
    q: meta.bassQ || 1.1,
  });
  const subMix = meta.bassSub || 0.42;
  if (bassNorm > 0.42 || subMix > 0.5) this.createVoice('sine', midiToFreq(note - 12), time, duration * 0.92, amount * subMix, { filterFreq: 220, attack: 0.01, release: 0.1 });
};

protoV28.playPad = function playPadV28(step, time, amount) {
  if (!this.ctx || !this.master) return;
  const genre = this.genre;
  const meta = this.genreMetaV28();
  const bar = Math.floor(step / 4) % genre.pad.length;
  const chord = choose(genre.pad, bar);
  const duration = this.stepDuration() * 8;
  const brightNorm = (this.brightness - 1) / 4;
  const waves = meta.padWaves || ['triangle', 'sine', 'sine'];
  chord.forEach((offset, idx) => {
    this.createVoice(waves[idx] || waves[waves.length - 1] || 'triangle', midiToFreq(genre.root + offset), time, duration, amount / (1.45 + idx * 0.24), {
      filterFreq: lerp(meta.padFilterMin || 1100, meta.padFilterMax || 2600, brightNorm),
      attack: meta.padAttack || 0.05,
      release: meta.padRelease || 0.18,
      pan: idx === 0 ? -0.2 : idx === 1 ? 0.2 : 0,
    });
  });
};

protoV28.playLead = function playLeadV28(step, time, amount) {
  const genre = this.genre;
  const meta = this.genreMetaV28();
  const noteOffset = choose(genre.scale, step + this.energy + this.pulse);
  const freq = midiToFreq(genre.root + 12 + noteOffset);
  const brightNorm = (this.brightness - 1) / 4;
  const wave = meta.leadWave || (brightNorm > 0.55 ? 'square' : brightNorm < 0.28 ? 'triangle' : 'sawtooth');
  this.createVoice(wave, freq, time, meta.leadDuration || (0.16 + this.stepDuration() * 0.45), amount, {
    filterFreq: lerp(meta.leadFilterMin || 1700, meta.leadFilterMax || 3600, brightNorm),
    attack: 0.008,
    release: meta.family === 'synthwave' ? 0.14 : 0.09,
    pan: step % 4 === 0 ? -0.2 : 0.2,
    detune: step % 4 === 0 ? -4 : 4,
  });
};

protoV28.playPerc = function playPercV28(time, amount) {
  if (!this.ctx || !this.master || !this.noiseBuffer) return;
  const meta = this.genreMetaV28();
  const source = this.ctx.createBufferSource();
  source.buffer = this.noiseBuffer;
  const bp = this.ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(meta.percBand || 3400, time);
  bp.Q.value = 1.2;
  const gain = this.ctx.createGain();
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(amount, time + 0.003);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
  source.connect(bp);
  bp.connect(gain);
  gain.connect(this.master);
  source.start(time);
  source.stop(time + 0.06);
};

protoV28.playAtmos = function playAtmosV28(time, amount) {
  if (!this.ctx || !this.master || !this.noiseBuffer) return;
  const meta = this.genreMetaV28();
  const source = this.ctx.createBufferSource();
  source.buffer = this.noiseBuffer;
  const filter = this.ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(meta.atmosBand || (980 + (this.brightness - 3) * 110), time);
  filter.Q.value = 0.45;
  const panner = this.ctx.createStereoPanner();
  panner.pan.value = -0.18;
  const gain = this.ctx.createGain();
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(amount, time + 0.12);
  gain.gain.linearRampToValueAtTime(0.0001, time + (meta.atmosDuration || 0.54));
  source.connect(filter);
  filter.connect(panner);
  panner.connect(gain);
  gain.connect(this.master);
  source.start(time);
  source.stop(time + (meta.atmosDuration || 0.54) + 0.04);
};

protoV28.playRiser = function playRiserV28(time, amount) {
  if (!this.ctx || !this.master) return;
  const meta = this.genreMetaV28();
  const osc = this.ctx.createOscillator();
  const gain = this.ctx.createGain();
  const filter = this.ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(600 + (this.brightness - 3) * 90, time);
  osc.type = meta.riserWave || 'triangle';
  osc.frequency.setValueAtTime(meta.family === 'dnb' ? 320 : 220, time);
  osc.frequency.exponentialRampToValueAtTime(meta.family === 'dnb' ? 1200 : 880, time + 0.28);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(amount, time + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(this.master);
  osc.start(time);
  osc.stop(time + 0.32);
};
