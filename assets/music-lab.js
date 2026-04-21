
import { MUSIC_GENRES, createMusicController } from './music.js';

const STORAGE_KEY = 'haochijia.music.v3';
const BRIDGE_KEY = 'haochijia.music-bridge.v1';
const LANG = (() => {
  try {
    const stored = localStorage.getItem('haochijia.lang.v1') || document.documentElement.lang || 'zh';
    if (stored.startsWith('es')) return 'es';
    if (stored.startsWith('en')) return 'en';
    return 'zh';
  } catch {
    return 'zh';
  }
})();

const LABELS = {
  volume: { zh: '音量', en: 'Volume', es: 'Volumen' },
  energy: { zh: '能量', en: 'Energy', es: 'Energía' },
  intensity: { zh: '力度', en: 'Intensity', es: 'Intensidad' },
  pulse: { zh: '脉冲', en: 'Pulse', es: 'Pulso' },
  bass: { zh: '低频', en: 'Bass', es: 'Bajos' },
  brightness: { zh: '亮度', en: 'Brightness', es: 'Brillo' },
  tempo: { zh: '速度', en: 'Tempo', es: 'Tempo' },
  variation: { zh: '变化', en: 'Variation', es: 'Variación' },
};

const CONTROL_DEFS = [
  { id: 'volume', min: 0, max: 100, step: 1 },
  { id: 'energy', min: 1, max: 5, step: 1 },
  { id: 'intensity', min: 1, max: 5, step: 1 },
  { id: 'pulse', min: 1, max: 5, step: 1 },
  { id: 'bass', min: 1, max: 5, step: 1 },
  { id: 'brightness', min: 1, max: 5, step: 1 },
  { id: 'tempo', min: 1, max: 5, step: 1 },
  { id: 'variation', min: 1, max: 5, step: 1 },
];

const DOM = {};
let controller = null;

function textOf(item) {
  return item?.[LANG] || item?.zh || item?.en || '';
}

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function saveSettings(snapshot) {
  if (!snapshot) return;
  const safe = {
    genreId: snapshot.genreId,
    volume: snapshot.volume,
    energy: snapshot.energy,
    intensity: snapshot.intensity,
    pulse: snapshot.pulse,
    bass: snapshot.bass,
    brightness: snapshot.brightness,
    tempo: snapshot.tempo,
    variation: snapshot.variation,
    autoMorph: snapshot.autoMorph,
    persistent: snapshot.persistent,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
}

function $(id) {
  return document.getElementById(id);
}

function bindNodes() {
  ['musicLabSavedPill', 'musicLabToggleBtn', 'musicLabSummary', 'musicLabStatus', 'musicLabGenreGrid', 'musicLabGenreCount', 'musicLabControlGrid', 'musicLabExportBtn', 'musicLabPersistent', 'musicLabAutoMorph', 'musicLabNote'].forEach((id) => {
    DOM[id] = $(id);
  });
}

function renderGenres(snapshot) {
  DOM.musicLabGenreCount.textContent = `${MUSIC_GENRES.length} 个流派`;
  DOM.musicLabGenreGrid.innerHTML = MUSIC_GENRES.map((genre) => `
    <button type="button" class="music-lab-genre-btn ${snapshot.genreId === genre.id ? 'is-active' : ''}" data-genre="${genre.id}">
      <strong>${textOf(genre.labels)}</strong>
      <span>${textOf(genre.note)}</span>
    </button>
  `).join('');
}

function renderControls(snapshot) {
  DOM.musicLabControlGrid.innerHTML = CONTROL_DEFS.map((def) => `
    <label class="music-lab-control">
      <div class="music-lab-control-head">
        <strong>${textOf(LABELS[def.id])}</strong>
        <span>${snapshot[def.id]}</span>
      </div>
      <input type="range" min="${def.min}" max="${def.max}" step="${def.step}" value="${snapshot[def.id]}" data-control="${def.id}">
    </label>
  `).join('');
}

function renderSummary(snapshot) {
  const genreName = textOf(snapshot.genre?.labels);
  const summaryCards = [
    { title: '当前流派', value: genreName },
    { title: '速度 / Tempo', value: `${snapshot.genre?.bpm || 0} BPM · 速度档 ${snapshot.tempo}` },
    { title: '氛围', value: `能量 ${snapshot.energy} · 变化 ${snapshot.variation}` },
    { title: '状态', value: snapshot.isPlaying ? '正在播放' : '待机中' },
  ];
  DOM.musicLabSummary.innerHTML = summaryCards.map((item) => `
    <article class="music-lab-summary-card">
      <strong>${item.title}</strong>
      <span>${item.value}</span>
    </article>
  `).join('');
  DOM.musicLabToggleBtn.textContent = snapshot.isPlaying ? '暂停音乐' : '开启音乐';
  DOM.musicLabSavedPill.textContent = snapshot.persistent ? '本地保存 / 持续播放' : '本地保存';
  DOM.musicLabStatus.textContent = snapshot.lastTapError
    ? '浏览器还没允许音频输出，先再点一下页面或按钮。'
    : snapshot.isPlaying
      ? `正在播放 ${genreName}。你可以继续微调 8 个参数。`
      : '点一下开启，本地生成循环节奏。';
  DOM.musicLabPersistent.checked = snapshot.persistent;
  DOM.musicLabAutoMorph.checked = snapshot.autoMorph;
  DOM.musicLabNote.textContent = textOf(snapshot.genre?.note) || '选择一个风格开始。';
}

function renderAll(snapshot) {
  renderGenres(snapshot);
  renderControls(snapshot);
  renderSummary(snapshot);
}

function exportBridge() {
  const snapshot = controller.getState();
  const payload = {
    exportedAt: new Date().toISOString(),
    source: 'haochijia-music-lab-v30',
    settings: {
      genreId: snapshot.genreId,
      genreLabel: textOf(snapshot.genre?.labels),
      volume: snapshot.volume,
      energy: snapshot.energy,
      intensity: snapshot.intensity,
      pulse: snapshot.pulse,
      bass: snapshot.bass,
      brightness: snapshot.brightness,
      tempo: snapshot.tempo,
      variation: snapshot.variation,
      autoMorph: snapshot.autoMorph,
      persistent: snapshot.persistent,
    },
  };
  localStorage.setItem(BRIDGE_KEY, JSON.stringify(payload));
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `haochijia-music-bridge-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 0);
}

function bindEvents() {
  DOM.musicLabGenreGrid.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-genre]');
    if (!btn) return;
    controller.setGenre(btn.dataset.genre);
  });
  DOM.musicLabControlGrid.addEventListener('input', (event) => {
    const input = event.target.closest('[data-control]');
    if (!input) return;
    const control = input.dataset.control;
    const method = `set${control.slice(0, 1).toUpperCase()}${control.slice(1)}`;
    if (typeof controller[method] === 'function') controller[method](input.value);
  });
  DOM.musicLabToggleBtn.addEventListener('click', async () => {
    await controller.toggle();
  });
  DOM.musicLabPersistent.addEventListener('change', () => controller.setPersistent(DOM.musicLabPersistent.checked));
  DOM.musicLabAutoMorph.addEventListener('change', () => controller.setAutoMorph(DOM.musicLabAutoMorph.checked));
  DOM.musicLabExportBtn.addEventListener('click', exportBridge);
}

function init() {
  bindNodes();
  controller = createMusicController(loadSettings());
  const initial = controller.getState();
  renderAll(initial);
  controller.onChange((snapshot) => {
    saveSettings(snapshot);
    renderAll(snapshot);
  });
  bindEvents();
}

document.addEventListener('DOMContentLoaded', init);
