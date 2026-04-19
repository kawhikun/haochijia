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
