import {
  ACTIVITY_LEVELS,
  GOALS,
  TRAINING_MODES,
  PHYSIOLOGY_STATES,
  GLUCOSE_STATUSES,
  NUTRIENT_DEFS,
  DASHBOARD_ORDER,
  OCR_FIELD_MAP,
  defaultProfile,
  sanitizeProfile,
  calculateTargets,
  createEmptyTotals,
  mergeTotals,
  foodKnownNutrientIds,
  normalizedFoodNutrients,
  scaleNutrients,
  parseServingSizeGrams,
  formatNumber,
  targetToText,
  round1,
  round0,
  clamp,
} from './nutrition-refs.js';
import {
  TEXTS,
  PRESETS,
  applyDomTranslations,
  detectBestLanguage,
  t,
  nutrientLabel,
  enumLabel,
  statusLabel,
  targetTypeLabel,
  platformText,
  presetLabel,
  presetHint,
  translateBasisRow,
  translateNote,
  buildFoodLabels,
  buildFoodSearchText,
  foodLabelForLang,
  prefersOriginalAsSubtitle,
} from './i18n.js';
import {
  MUSIC_GENRES,
  createMusicController,
} from './music.js';
import {
  buildSmartFoodLabels,
} from './food-label-upgrade.js';

const STORAGE = {
  profile: 'haochijia.profile.v4',
  logs: 'haochijia.logs.v4',
  folds: 'haochijia.folds.v4',
  favorites: 'haochijia.favorites.v5',
};

const FOLD_DEFAULTS = {
  profile: true,
  food: true,
  today: false,
  capture: false,
  reference: false,
  data: false,
};

const DOM = {};
const IDS = [
  'datasetStat', 'todayBadge', 'platformBadge', 'summaryHint', 'summaryCards', 'gapList', 'riskList', 'doneList', 'deficitSummary', 'nutrientGrid',
  'profileForm', 'profileSummary', 'saveCollapseProfileBtn', 'foodPanelSummary', 'logDate', 'dayCount', 'waterCount', 'daySummary', 'logList',
  'foodSearchInput', 'foodSearchResults', 'foodDataStatus', 'searchHint', 'recentList', 'liveGapChips', 'liveRiskChips', 'favoritesList',
  'quickAddWater', 'clearDayBtn', 'exportJsonBtn', 'exportCsvBtn',
  'ocrImageInput', 'ocrPreviewImg', 'ocrLang', 'ocrMode', 'ocrRunBtn', 'barcodeBtn', 'ocrStatus', 'ocrMetaHint', 'ocrRawText', 'scanPreviewName',
  'manualFields', 'manualName', 'manualBasis', 'manualServingSize', 'manualAmount', 'manualServings', 'manualStatus', 'manualSaveBtn', 'manualClearBtn',
  'referenceSummary', 'basisList', 'notesList', 'targetsTableBody', 'metaNote', 'datasetCoverage', 'datasetAudit'
];

const state = {
  meta: null,
  foods: null,
  foodsLoaded: false,
  foodsLoading: false,
  foodsPromise: null,
  foodMap: new Map(),
  lastResults: [],
  favorites: loadFavorites(),
  profile: loadProfile(),
  logs: loadLogs(),
  folds: loadFolds(),
  date: todayString(),
  calc: null,
  ocrParsed: null,
  platform: detectPlatform(),
};

window.addEventListener('DOMContentLoaded', init);

function safeInitStep(label, task) {
  try {
    const result = task();
    if (result && typeof result.catch === 'function') {
      result.catch((err) => console.error(`[haochijia:init] ${label} failed`, err));
    }
    return result;
  } catch (err) {
    console.error(`[haochijia:init] ${label} failed`, err);
    return null;
  }
}

function recalc() {
  state.profile = sanitizeProfile(readProfileForm());
  state.calc = calculateTargets(state.profile);
  saveProfile();
  markExploreDirty();
}



















function onWaterClick(e) {
  const btn = e.target.closest('[data-water-add]');
  if (!btn) return;
  const amountMl = Number(btn.dataset.waterAdd);
  getDayLog(state.date).items.unshift({
    type: 'water',
    amountMl,
    label: `${amountMl} mL`,
    createdAt: new Date().toISOString(),
  });
  saveLogs();
  markExploreDirty();
  renderAll();
  flashUpdate();
  showToast(`${amountMl} mL`);
}

function onRecentClick(e) {
  const btn = e.target.closest('[data-recent-idx]');
  if (!btn) return;
  const idx = Number(btn.dataset.recentIdx);
  const item = state.recentItems?.[idx];
  if (!item) return;
  const clone = JSON.parse(JSON.stringify(item));
  clone.createdAt = new Date().toISOString();
  getDayLog(state.date).items.unshift(clone);
  saveLogs();
  markExploreDirty();
  renderAll();
  flashUpdate();
  showToast(clone.type === 'water' ? L('water') : preferredFoodName(clone));
}



function favoriteKeyFromFood(food) {
  if (food?.c) return `code:${food.c}`;
  const labels = labelsForFood(food);
  return `name:${normalizeSearch(labels?.original || food?.originalName || food?.n || food?.name || '').slice(0, 80)}`;
}



function isFavoriteFood(food) {
  const key = favoriteKeyFromFood(food);
  return state.favorites.some((item) => item.key === key);
}

function toggleFavoriteFood(food) {
  const key = favoriteKeyFromFood(food);
  if (state.favorites.some((item) => item.key === key)) {
    state.favorites = state.favorites.filter((item) => item.key !== key);
  } else {
    state.favorites = [serializeFavoriteFood(food), ...state.favorites.filter((item) => item.key !== key)].slice(0, 30);
  }
  saveFavorites();
  markExploreDirty();
  renderSuggestions();
}

function collectRecentItems(limit = 8) {
  const out = [];
  const seen = new Set();
  const dates = Object.keys(state.logs).sort((a, b) => b.localeCompare(a));
  for (const date of dates) {
    const items = [...(state.logs[date]?.items || [])].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    for (const item of items) {
      const key = item.type === 'water'
        ? `water:${item.amountMl || item.label}`
        : `food:${item.code || ''}:${normalizeSearch(item.originalName || item.name || '')}:${item.amountText || ''}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

function compactDashboardIds() {
  const base = ['kcal', 'protein', 'carbs', 'fat', 'fiber', 'water', 'sodium', 'calcium', 'iron', 'potassium'];
  if (state.profile.conditions.boneRisk || (state.profile.sex === 'female' && state.profile.age >= 50)) base.push('vitaminD');
  if (state.profile.glucoseStatus !== 'normal') base.push('magnesium');
  if (state.profile.glucoseStatus === 'prediabetes' || state.profile.glucoseStatus === 'type2' || state.profile.glucoseStatus === 'gestational') base.push('satFat');
  if (state.profile.diet !== 'omnivore' || state.profile.age >= 50) base.push('vitaminB12');
  if (state.profile.conditions.anemiaRisk || state.profile.physiology.startsWith('pregnant')) base.push('folate');
  if (state.profile.training !== 'none' || state.profile.diet === 'pescetarian') base.push('omega3');
  return [...new Set(base)].filter((id) => NUTRIENT_DEFS[id] && state.calc.targets[id]).slice(0, 12);
}


function searchFoods(query, foods) {
  const q = normalizeSearch(query);
  const isCode = /^\d{6,14}$/.test(q);
  const tokens = q.split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const hits = [];
  for (const food of foods) {
    let score = 0;
    if (isCode) {
      if (food.c === q) score += 100;
      else if ((food.c || '').startsWith(q)) score += 60;
      else continue;
    } else {
      const hay = food._search;
      if (hay.includes(q)) score += 26;
      let matched = 0;
      for (const token of tokens) {
        if (hay.includes(token)) {
          matched += 1;
          if (normalizeSearch(food._displayName).startsWith(token)) score += 12;
          else if (normalizeSearch(food._displayName).includes(token)) score += 8;
          else score += 4;
        }
      }
      if (matched < tokens.length) continue;
      if (tokens.length === 1 && ['虾', 'shrimp', 'prawn', 'prawns', 'crevette', 'crevettes', 'gamba', 'gambas'].includes(q)) {
        const display = String(food._displayName || '');
        const originalText = normalizeSearch([food.n || '', food.g || ''].join(' '));
        if (/(shrimp|prawn|crevette|gamba|gambas|crustac|seafood|homard|lobster)/.test(originalText)) score += 10;
        if (/虾$|大虾$|对虾$|龙虾$|红虾$/.test(display)) score += 14;
        if (/野生|阿根廷|大西洋|太平洋|去壳|带壳|冷冻|特大|粉红/.test(display)) score += 8;
        if (/虾味|方便面|面虾|虾片|虾饺|春卷|沙拉|汤|酱|饭/.test(display) || /(noodle|nouille|soup|salad|wrap|cracker|chip|dumpling|nems|cocktail|pate|pâté|riz|rice|sauce)/.test(originalText)) score -= 10;
      }
    }
    score += food._norm.protein > 10 ? 1 : 0;
    score -= food._norm.sodium > 1000 ? 2 : 0;
    hits.push({ food, score });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 20).map((hit) => hit.food);
}

function readProfileForm() {
  const form = DOM.profileForm.elements;
  return {
    sex: form.sex.value,
    age: form.age.value,
    heightCm: form.heightCm.value,
    weightKg: form.weightKg.value,
    activity: form.activity.value,
    goal: form.goal.value,
    training: form.training.value,
    trainingHoursWeek: form.trainingHoursWeek.value,
    diet: form.diet.value,
    physiology: form.physiology.value,
    smoker: form.smoker.checked,
    glucoseStatus: form.glucoseStatus.value,
    conditions: {
      hypertension: form.hypertension.checked,
      dyslipidemia: form.dyslipidemia.checked,
      boneRisk: form.boneRisk.checked,
      anemiaRisk: form.anemiaRisk.checked,
    },
  };
}

function writeProfileToForm(profile) {
  const p = sanitizeProfile(profile || defaultProfile());
  const form = DOM.profileForm.elements;
  form.sex.value = p.sex;
  form.age.value = p.age;
  form.heightCm.value = p.heightCm;
  form.weightKg.value = p.weightKg;
  form.activity.value = p.activity;
  form.goal.value = p.goal;
  form.training.value = p.training;
  form.trainingHoursWeek.value = p.trainingHoursWeek;
  form.diet.value = p.diet;
  form.physiology.value = p.physiology;
  form.smoker.checked = p.smoker;
  form.glucoseStatus.value = p.glucoseStatus;
  form.hypertension.checked = p.conditions.hypertension;
  form.dyslipidemia.checked = p.conditions.dyslipidemia;
  form.boneRisk.checked = p.conditions.boneRisk;
  form.anemiaRisk.checked = p.conditions.anemiaRisk;
  syncManualBasisUi();
}


function syncManualBasisUi() {
  const basis = DOM.manualBasis.value;
  const showServing = basis === 'serving';
  DOM.manualServingSize.closest('.field').style.display = showServing ? 'grid' : 'none';
  DOM.manualServings.closest('.field').style.display = showServing ? 'grid' : 'none';
  DOM.manualAmount.closest('.field').style.display = showServing ? 'none' : 'grid';
  syncRealtimeNutritionV24();
}




async function loadImageForCanvas(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片读取失败'));
    };
    img.src = url;
  });
}

async function prepareRecognitionImage(file, mode = 'smart') {
  if (!file || mode === 'original') return file;
  const { img, url } = await loadImageForCanvas(file);
  try {
    const maxSide = 1800;
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth || img.width || 1, img.naturalHeight || img.height || 1));
    const width = Math.max(1, Math.round((img.naturalWidth || img.width || 1) * scale));
    const height = Math.max(1, Math.round((img.naturalHeight || img.height || 1) * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const contrast = mode === 'highContrast' ? 1.65 : 1.25;
    const threshold = mode === 'highContrast' ? 168 : null;
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      let next = (gray - 128) * contrast + 128;
      if (threshold !== null) {
        if (next > threshold) next = 255;
        else if (next < threshold - 48) next = 0;
      } else {
        if (next > 236) next = 255;
        if (next < 16) next = 0;
      }
      const value = clamp(Math.round(next), 0, 255);
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
    }
    ctx.putImageData(imageData, 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.92));
    return blob || file;
  } finally {
    URL.revokeObjectURL(url);
  }
}


async function detectBarcodeNative(source) {
  if (!('BarcodeDetector' in window) || !window.isSecureContext) return '';
  const preferred = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'];
  const supported = typeof window.BarcodeDetector.getSupportedFormats === 'function'
    ? await window.BarcodeDetector.getSupportedFormats().catch(() => [])
    : [];
  const formats = supported.length ? preferred.filter((format) => supported.includes(format)) : preferred;
  const detector = formats.length ? new window.BarcodeDetector({ formats }) : new window.BarcodeDetector();
  const bitmap = await createImageBitmap(source);
  try {
    const codes = await detector.detect(bitmap);
    return codes?.[0]?.rawValue || '';
  } finally {
    bitmap.close?.();
  }
}

async function blobToImage(source) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('无法读取图片以识别条码'));
    };
    img.src = url;
  });
}

async function ensureZXing() {
  if (window.ZXingBrowser) return window.ZXingBrowser;
  await loadScript('https://unpkg.com/@zxing/browser@0.1.5/umd/index.min.js');
  return window.ZXingBrowser;
}

async function detectBarcodeZXing(source) {
  const ZXingBrowser = await ensureZXing();
  if (!ZXingBrowser?.BrowserMultiFormatReader) return '';
  const reader = new ZXingBrowser.BrowserMultiFormatReader();
  const { img, url } = await blobToImage(source);
  try {
    const result = await reader.decodeFromImageElement(img);
    return result?.getText?.() || result?.text || '';
  } finally {
    URL.revokeObjectURL(url);
  }
}


async function ensureTesseract() {
  if (window.Tesseract) return window.Tesseract;
  await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
  return window.Tesseract;
}

function parseNutritionText(text) {
  const raw = String(text || '');
  if (!raw.trim()) return null;
  const clean = raw
    .replace(/[，、；：]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/Ｏ/g, '0')
    .replace(/o(?=\d)/gi, '0');
  const basis = /每\s*100\s*m?l|per\s*100\s*m?l|pour\s*100\s*m?l/i.test(clean)
    ? '100ml'
    : (/(?:每\s*份|per\s*serving|serving\s*size|portion\s*size|par\s*portion)/i.test(clean) ? 'serving' : '100g');
  const serveMatch = clean.match(/(?:serving\s*size|portion\s*size|每份|份量|par\s*portion)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*(g|ml|克|毫升)/i);
  const servingSize = serveMatch ? Number(serveMatch[1]) : null;
  const specs = [
    ['kcal', ['calories', 'calorie', 'energy', '热量', '能量', 'energie', 'énergie']],
    ['protein', ['protein', '蛋白质', 'proteines', 'protéines']],
    ['carbs', ['total carbohydrate', 'carbohydrate', 'carbohydrates', '碳水化合物', '碳水', 'glucides']],
    ['fat', ['total fat', 'fat', '脂肪', 'matieres grasses', 'matières grasses', 'lipides']],
    ['satFat', ['saturated fat', '饱和脂肪', 'acides gras saturés', 'satures', 'saturés']],
    ['transFat', ['trans fat', '反式脂肪']],
    ['sugar', ['total sugars', 'sugars', '糖', 'dont sucres', 'sucres']],
    ['fiber', ['dietary fiber', 'fiber', '膳食纤维', '纤维', 'fibres', 'fibres alimentaires']],
    ['sodium', ['sodium', '钠']],
    ['calcium', ['calcium', '钙']],
    ['iron', ['iron', '铁', 'fer']],
    ['magnesium', ['magnesium', '镁']],
    ['potassium', ['potassium', '钾']],
    ['zinc', ['zinc', '锌']],
    ['vitaminA', ['vitamin a', '维生素 a', '维生素a']],
    ['vitaminC', ['vitamin c', '维生素 c', '维生素c']],
    ['vitaminD', ['vitamin d', '维生素 d', '维生素d']],
    ['folate', ['folate', 'folic acid', '叶酸']],
    ['vitaminB12', ['vitamin b12', '维生素 b12', '维生素b12']],
    ['cholesterol', ['cholesterol', '胆固醇']],
  ];
  const nutrients = {};
  for (const [id, keys] of specs) {
    const value = extractFieldValue(clean, keys, id);
    if (Number.isFinite(value)) nutrients[id] = value;
  }
  if (!Number.isFinite(nutrients.sodium)) {
    const saltValue = extractFieldValue(clean, ['salt', 'sel', '食盐', '盐'], 'salt');
    if (Number.isFinite(saltValue)) nutrients.sodium = saltValue * 393.4;
  }
  return Object.keys(nutrients).length ? { basis, servingSize, nutrients } : null;
}

function extractFieldValue(text, keywords, id) {
  for (const key of keywords) {
    const re = new RegExp(`${escapeReg(key)}[^\\d]{0,12}(\\d+(?:\\.\\d+)?)\\s*(kcal|kj|g|mg|mcg|µg|ug|千卡|千焦|克|毫克|微克)?`, 'i');
    const match = text.match(re);
    if (!match) continue;
    return convertOCRValue(Number(match[1]), (match[2] || '').toLowerCase(), id);
  }
  return null;
}

function convertOCRValue(value, unit, id) {
  if (!unit) return value;
  if (id === 'kcal') return /kj|千焦/.test(unit) ? value / 4.184 : value;
  const targetUnit = OCR_FIELD_MAP[id]?.unit || '';
  if (/克|^g$/.test(unit)) {
    if (targetUnit === 'mg') return value * 1000;
    if (targetUnit === 'µg') return value * 1e6;
    return value;
  }
  if (/mg|毫克/.test(unit)) {
    if (targetUnit === 'g') return value / 1000;
    if (targetUnit === 'µg') return value * 1000;
    return value;
  }
  if (/mcg|µg|ug|微克/.test(unit)) {
    if (targetUnit === 'g') return value / 1e6;
    if (targetUnit === 'mg') return value / 1000;
    return value;
  }
  return value;
}


function onLogListClick(e) {
  const btn = e.target.closest('[data-remove-log]');
  if (!btn) return;
  const idx = Number(btn.dataset.removeLog);
  const log = getDayLog(state.date);
  if (idx >= 0 && idx < log.items.length) {
    log.items.splice(idx, 1);
    saveLogs();
    markExploreDirty();
    renderAll();
  }
}


function currentSnapshot() {
  const totals = createEmptyTotals();
  const coverageWeight = {};
  const items = getDayLog(state.date).items;
  let totalFoodCount = 0;
  let totalWeight = 0;
  for (const item of items) {
    if (item.type === 'water') {
      totals.water += Number(item.amountMl) || 0;
      continue;
    }
    if (item.type !== 'food') continue;
    totalFoodCount += 1;
    mergeTotals(totals, item.nutrients || {});
    const itemWeight = Math.max(60, Number(item.nutrients?.kcal) || 0);
    totalWeight += itemWeight;
    const knownIds = Array.isArray(item.knownIds) && item.knownIds.length ? item.knownIds : Object.keys(item.nutrients || {});
    for (const id of knownIds) coverageWeight[id] = (coverageWeight[id] || 0) + itemWeight;
  }
  const coverage = {};
  for (const id of Object.keys(NUTRIENT_DEFS)) {
    coverage[id] = totalFoodCount === 0 ? 1 : ((coverageWeight[id] || 0) / Math.max(totalWeight, 1));
  }
  return { totals, coverage, totalFoodCount, totalWeight };
}

function currentTotals() {
  return currentSnapshot().totals;
}

function readPendingManualNutrientsV24() {
  if (!state.v24ManualPreviewDirty) return null;
  if (!DOM.manualFields || !DOM.manualBasis) return null;
  const nutrients = {};
  DOM.manualFields.querySelectorAll('[data-manual-field]').forEach((input) => {
    const key = input.dataset.manualField;
    const value = Number(input.value);
    if (key && Number.isFinite(value) && value >= 0) nutrients[key] = value;
  });
  const keys = Object.keys(nutrients);
  if (!keys.length) return null;
  const basis = DOM.manualBasis.value;
  const amount = clamp(Number(DOM.manualAmount?.value) || 0, 1, 5000);
  const servings = clamp(Number(DOM.manualServings?.value) || 1, 0.1, 50);
  const scaled = {};
  if (basis === 'serving') {
    for (const [key, value] of Object.entries(nutrients)) scaled[key] = value * servings;
  } else {
    const factor = amount / 100;
    for (const [key, value] of Object.entries(nutrients)) scaled[key] = value * factor;
  }
  return { nutrients: scaled, knownIds: keys };
}

function realtimeNutritionSnapshotV24() {
  const snapshot = currentSnapshot();
  const pending = readPendingManualNutrientsV24();
  if (!pending) return snapshot;
  const totals = { ...snapshot.totals };
  mergeTotals(totals, pending.nutrients || {});
  return {
    ...snapshot,
    totals,
    totalFoodCount: (snapshot.totalFoodCount || 0) + 1,
    totalWeight: (snapshot.totalWeight || 0) + Math.max(60, Number(pending.nutrients?.kcal) || 0),
    previewSource: 'manual',
  };
}

function syncRealtimeNutritionV24() {
  try { renderFoodRealtimeBoardV20(); } catch {}
  try { decorateV22BodyStage(); } catch {}
  try { refreshV22HomeMeta(); } catch {}
}

function bindRealtimeNutritionPreviewV24() {
  if (document.body.dataset.v24RealtimeNutritionBound) return;
  document.body.dataset.v24RealtimeNutritionBound = '1';
  const markDirty = () => {
    state.v24ManualPreviewDirty = true;
    syncRealtimeNutritionV24();
  };
  DOM.manualFields?.addEventListener('input', markDirty);
  DOM.manualFields?.addEventListener('change', markDirty);
  [DOM.manualBasis, DOM.manualAmount, DOM.manualServings, DOM.manualServingSize, DOM.manualName].forEach((node) => {
    node?.addEventListener('input', markDirty);
    node?.addEventListener('change', markDirty);
  });
}

function shouldShowCoverage(id, totalFoodCount = 0) {
  if (!totalFoodCount) return false;
  return ['vitaminA', 'vitaminD', 'vitaminE', 'vitaminK', 'folate', 'vitaminB12', 'iodine', 'selenium', 'zinc', 'copper', 'manganese', 'omega3', 'omega6', 'phosphorus'].includes(id);
}


function computeBalanceScore(snapshot, targets) {
  const ids = ['protein', 'carbs', 'fat', 'fiber', 'water', 'sodium', 'calcium', 'iron', 'potassium'];
  const scores = ids.map((id) => {
    const target = targets[id];
    if (!target) return null;
    const intake = snapshot.totals[id] || 0;
    if (target.type === 'min') return Math.max(0, Math.min(intake / target.target, 1));
    if (target.type === 'max') {
      if (intake <= target.target * 0.85) return 1;
      if (intake <= target.target) return 0.85;
      return Math.max(0, 1 - ((intake - target.target) / Math.max(target.target, 1)));
    }
    if (target.type === 'range') {
      if (intake < target.min) return Math.max(0, Math.min(intake / Math.max(target.min, 1), 1));
      if (intake > target.max) return Math.max(0, 1 - ((intake - target.max) / Math.max(target.max, 1)));
      const pref = target.preferred || ((target.min + target.max) / 2);
      return Math.max(0.78, 1 - Math.abs(intake - pref) / Math.max(pref, 1));
    }
    if (target.type === 'target') return Math.max(0, 1 - Math.abs(intake - target.target) / Math.max(target.target, 1));
    return null;
  }).filter((v) => Number.isFinite(v));
  if (!scores.length) return 0;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
}

function computeStreak() {
  const dates = Object.keys(state.logs).filter((date) => (state.logs[date]?.items || []).length).sort();
  if (!dates.length) return 0;
  const set = new Set(dates);
  let streak = 0;
  let cursor = new Date(`${todayString()}T00:00:00`);
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!set.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}


function getDayLog(date) {
  if (!state.logs[date]) state.logs[date] = { items: [] };
  if (!Array.isArray(state.logs[date].items)) state.logs[date].items = [];
  return state.logs[date];
}

function evaluateTarget(target, intake) {
  intake = Number(intake) || 0;
  if (!target) return null;
  if (target.type === 'min') {
    const fill = target.target > 0 ? intake / target.target : 1;
    return intake >= target.target
      ? { status: 'good', fill: Math.min(fill, 1), delta: intake - target.target }
      : { status: 'low', fill: Math.max(0, Math.min(fill, 1)), delta: target.target - intake };
  }
  if (target.type === 'max') {
    const fill = target.target > 0 ? intake / target.target : 0;
    if (intake > target.target) return { status: 'high', fill: 1, delta: intake - target.target };
    return { status: fill >= 0.85 ? 'warn' : 'good', fill: Math.max(0, Math.min(fill, 1)), delta: target.target - intake };
  }
  if (target.type === 'range') {
    if (intake < target.min) return { status: 'low', fill: target.min > 0 ? Math.max(0, Math.min(intake / target.min, 1)) : 1, delta: target.min - intake };
    if (intake > target.max) return { status: 'high', fill: 1, delta: intake - target.max };
    return { status: 'good', fill: Math.max(0.55, Math.min(intake / target.max, 1)), delta: Math.min(intake - target.min, target.max - intake) };
  }
  if (target.type === 'target') {
    const diff = intake - target.target;
    if (Math.abs(diff) <= target.target * 0.1) return { status: 'good', fill: Math.max(0, Math.min(intake / target.target, 1)), delta: Math.abs(diff) };
    if (intake < target.target) return { status: 'low', fill: Math.max(0, Math.min(intake / target.target, 1)), delta: target.target - intake };
    return { status: 'high', fill: 1, delta: intake - target.target };
  }
  return null;
}

function getTopGaps(snapshotOrTotals, targets, limit = 5) {
  const snapshot = snapshotOrTotals?.totals ? snapshotOrTotals : { totals: snapshotOrTotals || {}, coverage: {}, totalFoodCount: 0 };
  const items = Object.entries(targets).map(([id, target]) => {
    const ev = evaluateTarget(target, snapshot.totals[id] || 0);
    if (!ev || ev.status !== 'low') return null;
    const base = target.type === 'range' ? (target.preferred || target.min) : target.target;
    const confidence = snapshot.coverage?.[id] ?? 1;
    if (shouldShowCoverage(id, snapshot.totalFoodCount) && confidence < 0.22) return null;
    return { id, delta: ev.delta, relative: base ? ev.delta / base : 0, confidence };
  }).filter(Boolean);
  return items.sort((a, b) => (b.relative * Math.max(b.confidence, 0.4)) - (a.relative * Math.max(a.confidence, 0.4))).slice(0, limit);
}

function getTopRisks(snapshotOrTotals, targets, limit = 5) {
  const snapshot = snapshotOrTotals?.totals ? snapshotOrTotals : { totals: snapshotOrTotals || {}, coverage: {}, totalFoodCount: 0 };
  return Object.entries(targets).map(([id, target]) => {
    const ev = evaluateTarget(target, snapshot.totals[id] || 0);
    if (!ev || ev.status !== 'high') return null;
    const base = target.type === 'range' ? target.max : target.target;
    return { id, delta: ev.delta, relative: base ? ev.delta / base : 0, confidence: snapshot.coverage?.[id] ?? 1 };
  }).filter(Boolean).sort((a, b) => b.relative - a.relative).slice(0, limit);
}

function getDoneItems(snapshotOrTotals, targets, limit = 3) {
  const snapshot = snapshotOrTotals?.totals ? snapshotOrTotals : { totals: snapshotOrTotals || {}, coverage: {}, totalFoodCount: 0 };
  const preferred = ['protein', 'fiber', 'water', 'calcium', 'iron', 'potassium', 'kcal'];
  return preferred.map((id) => {
    const target = targets[id];
    const ev = target ? evaluateTarget(target, snapshot.totals[id] || 0) : null;
    return ev?.status === 'good' ? { id } : null;
  }).filter(Boolean).slice(0, limit);
}


function metric(value, id) {
  const digits = ['kcal', 'water', 'sodium', 'potassium', 'calcium', 'phosphorus', 'magnesium', 'cholesterol', 'vitaminA', 'folate', 'selenium', 'iodine'].includes(id) ? 0 : 1;
  return formatNumber(value, NUTRIENT_DEFS[id]?.unit || '', digits);
}

function tone(ev) {
  if (!ev) return 'muted';
  return ev.status === 'good' ? 'good' : ev.status === 'warn' ? 'warn' : ev.status === 'high' ? 'danger' : 'warn';
}



function flashUpdate() {
  DOM.summaryCards.classList.add('flash');
  setTimeout(() => DOM.summaryCards.classList.remove('flash'), 300);
}

function applyFoldStates() {
  for (const [id, isOpen] of Object.entries(state.folds)) setPanelState(id, isOpen, false);
}

function togglePanel(id) {
  setPanelState(id, !state.folds[id]);
}

function openPanel(id) {
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  setPanelState(id, true);
  const el = document.querySelector(`[data-fold-id="${id}"]`);
  if (el?.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


function detectPlatform() {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}



function normalizeSearch(value) {
  return stripAccents(String(value || ''))
    .toLowerCase()
    .replace(/[^0-9a-z\u4e00-\u9fff]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripAccents(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function exportDayJson() {
  const payload = {
    date: state.date,
    profile: state.profile,
    targets: state.calc.targets,
    totals: currentTotals(),
    log: getDayLog(state.date),
  };
  downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `nutrition-log-${state.date}.json`);
}

function exportDayCsv() {
  const rows = [
    ['date', 'type', 'name', 'source', 'amount', 'kcal', 'protein_g', 'sodium_mg'].join(','),
    ...getDayLog(state.date).items.map((item) => [
      csv(state.date),
      csv(item.type),
      csv(item.name || item.label || ''),
      csv(item.sourceLabel || item.source || ''),
      csv(item.amountText || (item.amountMl ? `${item.amountMl} mL` : '')),
      item.type === 'food' ? round1(item.nutrients?.kcal || 0) : '',
      item.type === 'food' ? round1(item.nutrients?.protein || 0) : '',
      item.type === 'food' ? round0(item.nutrients?.sodium || 0) : '',
    ].join(',')),
  ];
  downloadBlob(new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' }), `nutrition-log-${state.date}.csv`);
}

function loadProfile() {
  try { return sanitizeProfile(JSON.parse(localStorage.getItem(STORAGE.profile) || 'null') || defaultProfile()); }
  catch { return defaultProfile(); }
}
function saveProfile() { localStorage.setItem(STORAGE.profile, JSON.stringify(state.profile)); }
function loadLogs() { try { return JSON.parse(localStorage.getItem(STORAGE.logs) || '{}') || {}; } catch { return {}; } }
function saveLogs() { localStorage.setItem(STORAGE.logs, JSON.stringify(state.logs)); }
function loadFolds() { try { return { ...FOLD_DEFAULTS, ...(JSON.parse(localStorage.getItem(STORAGE.folds) || '{}') || {}) }; } catch { return { ...FOLD_DEFAULTS }; } }
function saveFolds() { localStorage.setItem(STORAGE.folds, JSON.stringify(state.folds)); }

function loadFavorites() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE.favorites) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.filter((item) => item && typeof item === 'object' && item.key && item.name && item.nutrients);
  } catch {
    return [];
  }
}
function saveFavorites() {
  localStorage.setItem(STORAGE.favorites, JSON.stringify(state.favorites));
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function csv(value) { return `"${String(value ?? '').replaceAll('"', '""')}"`; }
function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`无法加载脚本：${src}`));
    document.head.appendChild(s);
  });
}
function debounce(fn, wait = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
function escapeReg(value) { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
async function registerServiceWorker() { if (!('serviceWorker' in navigator)) return; try { await navigator.serviceWorker.register('./sw.js'); } catch (err) { console.warn(err); } }



/* v6 i18n + music enhancements */
STORAGE.lang = 'haochijia.lang.v1';
STORAGE.music = 'haochijia.music.v3';
STORAGE.region = 'haochijia.region.v1';
FOLD_DEFAULTS.sound = false;
[
  'languageSelect',
  'profilePresetList',
  'presetHint',
  'questStrip',
  'exploreHint',
  'exploreCards',
  'exploreResults',
  'soundSummary',
  'musicGenreList',
  'musicToggleBtn',
  'musicVolume',
  'musicEnergy',
  'musicStatus',
  'musicGuideList',
  'chefFab',
  'quickSheet',
  'quickSheetBackdrop',
  'quickSheetClose',
  'quickSheetSearchInput',
  'quickSheetSearchBtn',
  'quickSheetRecentList',
  'quickSheetFavoriteList',
  'sheetWaterRow',
  'toastRack',
].forEach((id) => { if (!IDS.includes(id)) IDS.push(id); });
[
  'regionSelect',
  'regionHint',
  'soundReadingGrid',
  'musicIntensity',
  'musicPulse',
  'musicBass',
  'musicBrightness',
  'musicTempo',
  'musicVariation',
  'musicAutoMorph',
  'musicPersistent',
  'musicExportBridgeBtn',
  'musicBridgeHint',
].forEach((id) => { if (!IDS.includes(id)) IDS.push(id); });
state.language = loadLanguage();
state.musicPrefs = loadMusicPrefs();
state.folds = loadFolds();
state.recentItems = [];
state.favoriteItems = [];
state.activeExploreMode = 'quick';
state.musicController = null;
state.regionPreference = loadRegionPreference();
state.autoFoodRegion = detectAutoFoodRegion();
state.activeFoodRegion = resolvedFoodRegion();
state.foodBanks = Object.create(null);
state.foodMaps = Object.create(null);
state.foodPromises = Object.create(null);
state.lastExploreResults = [];
state.lastExploreMode = '';
state.exploreDirty = true;
state.toastTimer = null;

function loadLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE.lang);
    return saved === 'zh' || saved === 'en' || saved === 'es' ? saved : detectBestLanguage();
  } catch {
    return detectBestLanguage();
  }
}
function saveLanguage() {
  try { localStorage.setItem(STORAGE.lang, state.language); } catch {}
}

function loadMusicPrefs() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE.music) || '{}') || {};
    return {
      genreId: raw.genreId || MUSIC_GENRES[0].id,
      volume: clamp(Number(raw.volume) || 72, 0, 100),
      energy: clamp(Number(raw.energy) || 4, 1, 5),
      intensity: clamp(Number(raw.intensity) || 3, 1, 5),
      pulse: clamp(Number(raw.pulse) || 3, 1, 5),
      bass: clamp(Number(raw.bass) || 4, 1, 5),
      brightness: clamp(Number(raw.brightness) || 3, 1, 5),
      tempo: clamp(Number(raw.tempo) || 3, 1, 5),
      variation: clamp(Number(raw.variation) || 3, 1, 5),
      autoMorph: raw.autoMorph !== false,
      persistent: raw.persistent !== false,
      styleId: String(raw.styleId || ''),
    };
  } catch {
    return { genreId: MUSIC_GENRES[0].id, volume: 72, energy: 4, intensity: 3, pulse: 3, bass: 4, brightness: 3, tempo: 3, variation: 3, autoMorph: true, persistent: true, styleId: '' };
  }
}
function saveMusicPrefs() {
  try {
    const snapshot = state.musicController?.getState?.() || {};
    localStorage.setItem(STORAGE.music, JSON.stringify({
      genreId: snapshot.genreId || state.musicPrefs.genreId,
      volume: snapshot.volume ?? state.musicPrefs.volume,
      energy: snapshot.energy ?? state.musicPrefs.energy,
      intensity: snapshot.intensity ?? state.musicPrefs.intensity,
      pulse: snapshot.pulse ?? state.musicPrefs.pulse,
      bass: snapshot.bass ?? state.musicPrefs.bass,
      brightness: snapshot.brightness ?? state.musicPrefs.brightness,
      tempo: snapshot.tempo ?? state.musicPrefs.tempo,
      variation: snapshot.variation ?? state.musicPrefs.variation,
      autoMorph: snapshot.autoMorph ?? state.musicPrefs.autoMorph,
      persistent: snapshot.persistent ?? state.musicPrefs.persistent,
      styleId: state.musicPrefs?.styleId || '',
    }));
  } catch {}
}
function loadRegionPreference() {
  try {
    const saved = localStorage.getItem(STORAGE.region);
    return saved === 'cn' || saved === 'global' || saved === 'auto' ? saved : 'auto';
  } catch {
    return 'auto';
  }
}
function saveRegionPreference() {
  try { localStorage.setItem(STORAGE.region, state.regionPreference || 'auto'); } catch {}
}
function parseLocaleRegion(locale) {
  try {
    if (!locale) return '';
    if (typeof Intl !== 'undefined' && Intl.Locale) {
      const region = new Intl.Locale(locale).region;
      if (region) return String(region).toUpperCase();
    }
  } catch {}
  const match = String(locale || '').match(/[-_]([A-Za-z]{2})\b/);
  return match ? match[1].toUpperCase() : '';
}
function detectAutoFoodRegion() {
  try {
    const tz = Intl.DateTimeFormat?.().resolvedOptions?.().timeZone || '';
    const langs = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
    const regionHints = langs.map(parseLocaleRegion).filter(Boolean);
    const langBlob = langs.join('|');
    if (/Asia\/(Shanghai|Urumqi|Chongqing|Harbin|Kashgar)/i.test(tz)) return 'cn';
    if (regionHints.includes('CN')) return 'cn';
    if (/zh-Hans-CN|zh-CN/i.test(langBlob)) return 'cn';
  } catch {}
  return 'global';
}
function resolvedFoodRegion() {
  return (state.regionPreference || 'auto') === 'auto' ? (state.autoFoodRegion || 'global') : state.regionPreference;
}
function regionDataUrl(regionKey = resolvedFoodRegion()) {
  return regionKey === 'cn' ? './data/foods-cn.min.json' : './data/foods.min.json';
}
function regionDataFiles(regionKey = resolvedFoodRegion()) {
  const files = state.meta?.region_sets?.[regionKey]?.delivery?.files;
  if (Array.isArray(files) && files.length) {
    return files
      .map((entry) => (typeof entry === 'string' ? entry : (entry?.name || entry?.file || '')))
      .filter(Boolean)
      .map((name) => `./data/${name}`);
  }
  return [regionDataUrl(regionKey)];
}
async function ensureFoodMeta() {
  if (state.meta?.region_sets) return state.meta;
  await loadMeta();
  return state.meta;
}
async function fetchFoodsPayload(regionKey = resolvedFoodRegion()) {
  await ensureFoodMeta();
  const files = regionDataFiles(regionKey);
  if (!files.length) throw new Error('No food data files configured');
  if (files.length === 1) {
    const res = await fetch(files[0]);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
  const foods = [];
  for (let i = 0; i < files.length; i += 1) {
    if (DOM.foodDataStatus) {
      DOM.foodDataStatus.textContent = `${L('foodLibLoading')} · ${regionName(regionKey)} · ${i + 1}/${files.length}`;
    }
    const res = await fetch(files[i]);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const chunk = await res.json();
    if (!Array.isArray(chunk)) throw new Error('Chunk payload is not an array');
    foods.push(...chunk);
  }
  return foods;
}
function regionMeta() {
  const key = resolvedFoodRegion();
  return state.meta?.region_sets?.[key] || null;
}
function regionName(regionKey = resolvedFoodRegion()) {
  return regionKey === 'cn' ? L('regionChina') : L('regionGlobal');
}
function regionHintText() {
  const active = resolvedFoodRegion();
  const auto = (state.regionPreference || 'auto') === 'auto';
  if (auto) return active === 'cn' ? L('regionHintAutoCN') : L('regionHintAutoGlobal');
  return active === 'cn' ? L('regionHintManualCN') : L('regionHintManualGlobal');
}
function syncActiveFoodBank() {
  const key = resolvedFoodRegion();
  state.activeFoodRegion = key;
  state.foods = state.foodBanks[key] || null;
  state.foodMap = state.foodMaps[key] || new Map();
  state.foodsLoaded = Boolean(state.foods);
  state.foodsPromise = state.foodPromises[key] || null;
  return key;
}
function renderRegionControls() {
  syncActiveFoodBank();
  if (DOM.regionSelect) DOM.regionSelect.value = state.regionPreference || 'auto';
  if (DOM.regionHint) DOM.regionHint.textContent = regionHintText();
}
async function setFoodRegion(nextPreference, { rerender = true, search = true } = {}) {
  state.regionPreference = nextPreference === 'cn' || nextPreference === 'global' || nextPreference === 'auto' ? nextPreference : 'auto';
  saveRegionPreference();
  renderRegionControls();
  renderDatasetMeta();
  if (search && (DOM.foodSearchInput?.value.trim() || DOM.quickSheetSearchInput?.value.trim())) {
    await doSearch(DOM.foodSearchInput?.value.trim() || DOM.quickSheetSearchInput?.value.trim());
  } else if (rerender) {
    renderAll();
  }
}
function renderDatasetMeta() {
  const meta = regionMeta();
  if (!meta) return;
  const stats = meta.stats || {};
  const count = stats.rows_kept || 0;
  const totalRows = stats.total_rows_seen || count || 0;
  const rowsWithName = stats.rows_with_name ?? count;
  const rowsWithEnergy = stats.rows_with_energy ?? count;
  const rowsWithNameAndEnergy = stats.rows_with_name_and_energy ?? count;
  const zhCount = stats.rows_with_zh_name || 0;
  const dt = meta?.source?.tsv_zip_datetime_iso?.slice?.(0, 10) || meta?.source?.dataset_date || '';
  const active = resolvedFoodRegion();
  if (DOM.datasetStat) {
    DOM.datasetStat.textContent = active === 'cn'
      ? (uiLang() === 'zh' ? `中国库 ${fmtInt(count)} 条` : uiLang() === 'es' ? `China ${fmtInt(count)} alimentos` : `China ${fmtInt(count)} foods`)
      : (uiLang() === 'zh' ? `国际库 ${fmtInt(count)} 条` : uiLang() === 'es' ? `Global ${fmtInt(count)} alimentos` : `Global ${fmtInt(count)} foods`);
  }
  if (DOM.metaNote) {
    if (active === 'cn') {
      DOM.metaNote.textContent = uiLang() === 'zh'
        ? `当前优先使用中国常见食材库${dt ? ` · 数据日期 ${dt}` : ''}。这套数据更适合家常食材；品牌包装食品和条码可手动切到国际库。`
        : uiLang() === 'es'
          ? `Ahora se usa primero la biblioteca china de alimentos comunes${dt ? ` · fecha ${dt}` : ''}. Sirve mejor para ingredientes cotidianos; para productos envasados y códigos de barras, cambia a Global.`
          : `The China common-food set is active${dt ? ` · date ${dt}` : ''}. It works better for staple ingredients; switch to Global for packaged products and barcodes.`;
    } else {
      DOM.metaNote.textContent = uiLang() === 'zh'
        ? `当前优先使用国际包装食品库${dt ? ` · 数据日期 ${dt}` : ''}。已有中文显示名 ${fmtInt(zhCount)} 条；也支持中 / 英 / 西三语界面。`
        : uiLang() === 'es'
          ? `La biblioteca global de alimentos envasados está activa${dt ? ` · fecha ${dt}` : ''}. Ya hay ${fmtInt(zhCount)} nombres visibles en chino y la interfaz soporta chino / inglés / español.`
          : `The global packaged-food library is active${dt ? ` · date ${dt}` : ''}. ${fmtInt(zhCount)} items already have Chinese display names, and the UI supports Chinese / English / Spanish.`;
    }
  }
  if (DOM.datasetCoverage) {
    DOM.datasetCoverage.textContent = active === 'cn'
      ? (uiLang() === 'zh'
        ? `当前中国库可直接搜索与统计 ${fmtInt(count)} 条，并优先显示中文友好名称。`
        : uiLang() === 'es'
          ? `La biblioteca China ofrece ${fmtInt(count)} alimentos y prioriza nombres fáciles de leer en chino.`
          : `The China set offers ${fmtInt(count)} items and prioritizes Chinese-friendly display names.`)
      : (uiLang() === 'zh'
        ? `原始 ${fmtInt(totalRows)} 行，网页内可直接搜索与统计 ${fmtInt(count)} 条。`
        : uiLang() === 'es'
          ? `Filas originales: ${fmtInt(totalRows)}; se pueden buscar y contar ${fmtInt(count)} alimentos en la web.`
          : `Original rows: ${fmtInt(totalRows)}; ${fmtInt(count)} items are directly searchable in the web app.`);
  }
  if (DOM.datasetAudit) {
    DOM.datasetAudit.textContent = active === 'cn'
      ? (uiLang() === 'zh'
        ? `中国库当前共有 ${fmtInt(rowsWithName)} 条可用条目；均带名称与能量字段。`
        : uiLang() === 'es'
          ? `La biblioteca China actual contiene ${fmtInt(rowsWithName)} entradas utilizables, todas con nombre y energía.`
          : `The current China set contains ${fmtInt(rowsWithName)} usable items, all with names and energy values.`)
      : (uiLang() === 'zh'
        ? `其中有名称 ${fmtInt(rowsWithName)} 行；有能量值 ${fmtInt(rowsWithEnergy)} 行；同时有名称且有能量值 ${fmtInt(rowsWithNameAndEnergy)} 行。`
        : uiLang() === 'es'
          ? `Con nombre: ${fmtInt(rowsWithName)} filas; con energía: ${fmtInt(rowsWithEnergy)}; con nombre y energía: ${fmtInt(rowsWithNameAndEnergy)}.`
          : `Rows with names: ${fmtInt(rowsWithName)}; with energy: ${fmtInt(rowsWithEnergy)}; with both name and energy: ${fmtInt(rowsWithNameAndEnergy)}.`);
  }
}
function localeTag() {
  return state.language === 'en' ? 'en-US' : state.language === 'es' ? 'es-ES' : 'zh-CN';
}
function fmtInt(value) {
  return Number(value || 0).toLocaleString(localeTag());
}
function uiLang() { return state.language || 'zh'; }
function L(key, vars) { return t(uiLang(), key, vars); }
function nutrientName(id) { return nutrientLabel(uiLang(), id) || NUTRIENT_DEFS[id]?.label || id; }
function labelsForFood(item) {
  if (!item) return null;
  if (item._labels) return item._labels;
  if (item.labels) return item.labels;
  const labels = buildFoodLabels({
    n: item.originalName || item.n || item.name || item.z || '',
    z: item.name || item.z || '',
  });
  if ('_norm' in item || 'c' in item || 'b' in item || 'q' in item) item._labels = labels;
  else item.labels = labels;
  return labels;
}
function preferredFoodName(item) {
  if (!item) return L('unknownFood');
  const labels = labelsForFood(item);
  return labels?.[uiLang()] || labels?.zh || item.name || item._displayName || item.z || item.n || L('unknownFood');
}
function preferredOriginalName(item) {
  if (!item) return '';
  if (uiLang() === 'zh') return '';
  const labels = labelsForFood(item);
  const original = labels?.original || item.originalName || item.n || '';
  return normalizeSearch(preferredFoodName(item)) !== normalizeSearch(original) ? original : '';
}
const FOOD_TAG_RULES = [
  { re: /wild|sauvage|sauvages/, zh: '野生', en: 'wild', es: 'salvaje' },
  { re: /\braw\b|\bcru\b|crues|crude/, zh: '生', en: 'raw', es: 'crudo' },
  { re: /\bcooked\b|\bcuit\b|cuite|cuites/, zh: '熟', en: 'cooked', es: 'cocido' },
  { re: /frozen|surgel/, zh: '冷冻', en: 'frozen', es: 'congelado' },
  { re: /peeled|decortiqu|décortiqu/, zh: '去壳', en: 'peeled', es: 'pelado' },
  { re: /shell[\s-]?on|avec carapace|entier|entiere|entiers|entieres/, zh: '带壳', en: 'shell-on', es: 'con cáscara' },
  { re: /\bjumbo\b|\bxxl\b|extra large/, zh: '特大', en: 'jumbo', es: 'jumbo' },
  { re: /\bking\b/, zh: '大虾', en: 'king prawn', es: 'gamba grande' },
  { re: /\bred\b/, zh: '红', en: 'red', es: 'roja' },
  { re: /argentin/, zh: '阿根廷', en: 'Argentinian', es: 'argentina' },
  { re: /madagascar/, zh: '马达加斯加', en: 'Madagascar', es: 'Madagascar' },
  { re: /atlantic|atlantique/, zh: '大西洋', en: 'Atlantic', es: 'Atlántico' },
  { re: /pacific|pacifique/, zh: '太平洋', en: 'Pacific', es: 'Pacífico' },
  { re: /queue|queues|tail|tails/, zh: '虾尾', en: 'tails', es: 'colas' },
  { re: /breaded|beignet|panko|pane|tempura/, zh: '裹粉', en: 'breaded', es: 'rebozado' },
  { re: /nems|spring roll/, zh: '春卷', en: 'spring roll', es: 'rollito' },
  { re: /dumpling|gyoza|ravioli/, zh: '饺子', en: 'dumpling', es: 'dumpling' },
  { re: /soup|bouillon/, zh: '汤', en: 'soup', es: 'sopa' },
  { re: /salad|salade/, zh: '沙拉', en: 'salad', es: 'ensalada' },
  { re: /noodle|nouille/, zh: '面', en: 'noodles', es: 'fideos' },
  { re: /\brice\b|\briz\b/, zh: '饭', en: 'rice', es: 'arroz' },
  { re: /curry|makhani/, zh: '咖喱', en: 'curry', es: 'curry' },
  { re: /sesame|sésame/, zh: '芝麻', en: 'sesame', es: 'sésamo' },
  { re: /teriyaki/, zh: '照烧', en: 'teriyaki', es: 'teriyaki' },
  { re: /proven[cs]al/, zh: '普罗旺斯风味', en: 'Provençal', es: 'provenzal' },
  { re: /nature|plain/, zh: '原味', en: 'plain', es: 'natural' },
  { re: /garlic|\bail\b/, zh: '蒜香', en: 'garlic', es: 'ajo' },
  { re: /ginger|gingembre/, zh: '姜味', en: 'ginger', es: 'jengibre' },
  { re: /ap[eé]rit/, zh: '开胃小食', en: 'aperitif', es: 'aperitivo' },
  { re: /cracker|crisp/, zh: '脆片', en: 'crispy', es: 'crujiente' },
];
function uniqueValue(list, value) {
  if (value && !list.includes(value)) list.push(value);
}
function brandTagText(brand, lang = uiLang()) {
  return lang === 'en' ? `brand ${brand}` : lang === 'es' ? `marca ${brand}` : `品牌 ${brand}`;
}
function foodHintTags(item, lang = uiLang()) {
  if (!item) return [];
  const raw = normalizeSearch([preferredOriginalName(item) || item.n || '', item.g || '', item.q || '', item.b || ''].join(' '));
  const tags = [];
  FOOD_TAG_RULES.forEach((rule) => {
    if (rule.re.test(raw)) uniqueValue(tags, rule[lang] || rule.zh);
  });
  const sizeMatch = raw.match(/(\d{2,3}\s*\/\s*\d{2,3})/);
  if (sizeMatch) uniqueValue(tags, lang === 'zh' ? `${sizeMatch[1].replace(/\s+/g, '')}规格` : sizeMatch[1].replace(/\s+/g, ''));
  return tags.slice(0, 5);
}
function renderFoodTagRow(item) {
  const tags = foodHintTags(item, uiLang());
  const sourceTag = foodResultSourceTagV22(item);
  const list = sourceTag ? [sourceTag, ...tags] : tags;
  if (!list.length) return '';
  return `<div class="food-tag-row">${list.map((tag, index) => typeof tag === 'string'
    ? `<span class="food-tag">${escapeHtml(tag)}</span>`
    : `<span class="food-tag food-tag-source food-tag-source-${escapeHtml(tag.kind || 'db')}">${escapeHtml(tag.label)}</span>`).join('')}</div>`;
}
function foodMetaLine(item) {
  const bits = [];
  if (item?.q) bits.push(String(item.q).trim().replace(/\s+/g, ' '));
  const primaryBrand = String(item?.b || '').split(',').map((value) => value.trim()).filter(Boolean)[0];
  if (primaryBrand && uiLang() !== 'zh') bits.push(brandTagText(primaryBrand, uiLang()));
  return bits.join(' · ');
}
function updateLoadedFoodDisplayNames() {
  const visible = [
    ...(state.lastResults || []),
    ...(state.favoriteItems || []),
    ...(state.recentItems || []),
    ...((state.lastExploreResults || []).map((entry) => entry.food || entry.item || entry).filter(Boolean)),
  ];
  visible.forEach((item) => labelsForFood(item));
}
function markExploreDirty() {
  state.exploreDirty = true;
}
function toastSnippets() {
  return uiLang() === 'en'
    ? ['Saved. Nice.', 'Logged and updated.', 'Good move.', 'Quick win.']
    : uiLang() === 'es'
      ? ['Guardado.', 'Anotado y actualizado.', 'Buen movimiento.', 'Rápido y listo.']
      : ['记下了。', '已更新营养面板。', '这口安排上了。', '快记成功。'];
}
function showToast(message) {
  if (!DOM.toastRack) return;
  const extra = toastSnippets()[Math.floor(Math.random() * toastSnippets().length)];
  const node = document.createElement('div');
  node.className = 'toast-pill';
  node.textContent = `${message} ${extra}`.trim();
  DOM.toastRack.innerHTML = '';
  DOM.toastRack.appendChild(node);
  const raf = window.requestAnimationFrame || ((fn) => setTimeout(fn, 16));
  raf(() => node.classList.add('show'));
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => {
    node.classList.remove('show');
    setTimeout(() => node.remove(), 220);
  }, 1800);
}
function openQuickSheet() {
  if (!DOM.quickSheet || !DOM.quickSheetBackdrop) return;
  renderQuickSheet();
  document.body.classList.add('sheet-open');
  DOM.quickSheet.classList.add('open');
  DOM.quickSheet.setAttribute('aria-hidden', 'false');
  DOM.quickSheetBackdrop.hidden = false;
  const raf = window.requestAnimationFrame || ((fn) => setTimeout(fn, 16));
  raf(() => DOM.quickSheetBackdrop.classList.add('show'));
}
function closeQuickSheet() {
  if (!DOM.quickSheet || !DOM.quickSheetBackdrop) return;
  document.body.classList.remove('sheet-open');
  DOM.quickSheet.classList.remove('open');
  DOM.quickSheet.setAttribute('aria-hidden', 'true');
  DOM.quickSheetBackdrop.classList.remove('show');
  setTimeout(() => { DOM.quickSheetBackdrop.hidden = true; }, 180);
}
function renderQuickSheet() {
  if (!DOM.quickSheetRecentList || !DOM.quickSheetFavoriteList) return;
  const recentFoods = collectRecentItems(6);
  DOM.quickSheetRecentList.innerHTML = recentFoods.length ? recentFoods.map((item, idx) => `
    <button class="sheet-mini-item" type="button" data-sheet-recent-idx="${idx}">
      <strong>${escapeHtml(item.type === 'water' ? L('water') : preferredFoodName(item))}</strong>
      <span>${escapeHtml(item.type === 'water' ? `${item.amountMl} mL` : (item.amountText || L('addBtn')))}</span>
    </button>
  `).join('') : `<div class="empty-state">${escapeHtml(L('recentEmpty'))}</div>`;
  const favorites = state.favorites.slice(0, 6);
  DOM.quickSheetFavoriteList.innerHTML = favorites.length ? favorites.map((item, idx) => `
    <button class="sheet-mini-item" type="button" data-sheet-favorite-idx="${idx}">
      <strong>${escapeHtml(preferredFoodName(item))}</strong>
      <span>${escapeHtml(item.servingGram ? L('favoriteDefaultServing', { gram: round0(item.servingGram) }) : L('favoriteDefault100'))}</span>
    </button>
  `).join('') : `<div class="empty-state">${escapeHtml(L('favoritesEmpty'))}</div>`;
}
function onQuickSheetClick(e) {
  const recentBtn = e.target.closest('[data-sheet-recent-idx]');
  const favoriteBtn = e.target.closest('[data-sheet-favorite-idx]');
  const waterBtn = e.target.closest('[data-sheet-water-add]');
  if (waterBtn) {
    const amountMl = Number(waterBtn.dataset.sheetWaterAdd);
    getDayLog(state.date).items.unshift({ type: 'water', amountMl, label: `${amountMl} mL`, createdAt: new Date().toISOString() });
    saveLogs();
    markExploreDirty();
    renderAll();
    showToast(`${amountMl} mL`);
    return;
  }
  if (recentBtn) {
    const item = collectRecentItems(6)[Number(recentBtn.dataset.sheetRecentIdx)];
    if (!item) return;
    const clone = JSON.parse(JSON.stringify(item));
    clone.createdAt = new Date().toISOString();
    getDayLog(state.date).items.unshift(clone);
    saveLogs();
    markExploreDirty();
    renderAll();
    showToast(item.type === 'water' ? L('water') : preferredFoodName(item));
    closeQuickSheet();
    return;
  }
  if (favoriteBtn) {
    const item = state.favorites.slice(0, 6)[Number(favoriteBtn.dataset.sheetFavoriteIdx)];
    if (!item) return;
    addFoodLog(hydrateFavoriteFood(item), item.servingGram || 100, L('favoriteSource'));
    closeQuickSheet();
  }
}

function initMusicController() {
  if (state.musicController) return state.musicController;
  state.musicController = createMusicController(state.musicPrefs);
  state.musicController.onChange((snapshot) => {
    state.musicPrefs = {
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
      styleId: state.musicPrefs?.styleId || '',
    };
    saveMusicPrefs();
    renderSoundPanel();
  });
  return state.musicController;
}
function applyLanguage() {
  document.documentElement.lang = uiLang() === 'zh' ? 'zh-CN' : uiLang();
  applyDomTranslations(uiLang(), document);
  if (DOM.languageSelect) DOM.languageSelect.value = uiLang();
  renderRegionControls();
  renderDatasetMeta();
  renderManualFields();
  renderPresetChips();
}
function keywordForNutrient(id) {
  const map = {
    protein: { zh: '鸡胸 酸奶 豆腐 鸡蛋 蛋白', en: 'chicken yogurt tofu egg protein', es: 'pollo yogur tofu huevo proteína' },
    fiber: { zh: '燕麦 豆 蔬菜 全麦 纤维', en: 'oats beans vegetables wholegrain fiber', es: 'avena frijoles verduras integral fibra' },
    potassium: { zh: '香蕉 土豆 豆 菠菜 钾', en: 'banana potato beans spinach potassium', es: 'banana patata frijoles espinaca potasio' },
    calcium: { zh: '牛奶 酸奶 奶酪 豆腐 钙', en: 'milk yogurt cheese tofu calcium', es: 'leche yogur queso tofu calcio' },
    iron: { zh: '牛肉 豆 菠菜 铁', en: 'beef beans spinach iron', es: 'ternera frijoles espinaca hierro' },
    water: { zh: '', en: '', es: '' },
    sodium: { zh: '低盐 原味', en: 'low sodium plain', es: 'bajo sodio natural' },
  };
  return map[id]?.[uiLang()] || map[id]?.zh || '';
}
function questItems() {
  const snapshot = currentSnapshot();
  const log = getDayLog(state.date).items;
  const foodCount = log.filter((item) => item.type === 'food').length;
  const topGap = getTopGaps(snapshot, state.calc.targets, 1)[0];
  const items = [];
  if (!foodCount) items.push({ id: 'record', label: L('questRecord'), sub: L('quickActionLog'), action: 'open-food' });
  if ((snapshot.totals.water || 0) < Math.max((state.calc.targets.water?.target || 2000) * 0.35, 800)) {
    items.push({ id: 'hydrate', label: L('questHydrate'), sub: '+350 mL', action: 'water-350' });
  }
  if (topGap) items.push({ id: 'gap', label: L('questStart'), sub: `${nutrientName(topGap.id)} · ${L('needMore', { value: metric(topGap.delta, topGap.id) })}`, action: 'search-gap', nutrientId: topGap.id });
  items.push({ id: 'scan', label: L('questScan'), sub: L('captureTitle'), action: 'open-capture' });
  items.push({ id: 'tune', label: L('questTune'), sub: state.musicController?.genre?.labels?.[uiLang()] || MUSIC_GENRES[0].labels[uiLang()] || MUSIC_GENRES[0].labels.zh, action: 'open-sound' });
  return items.slice(0, 3);
}
function quickSearch(text) {
  if (!text) return;
  openPanel('food');
  DOM.foodSearchInput.value = text;
  doSearch(text);
  DOM.foodSearchInput.focus();
}
function renderQuestStrip() {
  if (!DOM.questStrip) return;
  const items = questItems();
  DOM.questStrip.innerHTML = items.map((item) => `
    <button class="quest-card" type="button" data-quest-action="${escapeHtml(item.action)}" ${item.nutrientId ? `data-quest-nutrient="${escapeHtml(item.nutrientId)}"` : ''}>
      <strong>${escapeHtml(item.label)}</strong>
      <span>${escapeHtml(item.sub)}</span>
    </button>
  `).join('');
}
function onQuestStripClick(e) {
  const btn = e.target.closest('[data-quest-action]');
  if (!btn) return;
  const action = btn.dataset.questAction;
  if (action === 'open-food') openPanel('food');
  else if (action === 'open-capture') openPanel('capture');
  else if (action === 'open-sound') openPanel('sound');
  else if (action === 'water-350') {
    getDayLog(state.date).items.unshift({ type: 'water', amountMl: 350, label: '350 mL', createdAt: new Date().toISOString() });
    saveLogs(); renderAll(); flashUpdate();
  } else if (action === 'search-gap') {
    quickSearch(keywordForNutrient(btn.dataset.questNutrient));
  }
}
function buildExploreModes() {
  const topGap = getTopGaps(currentSnapshot(), state.calc.targets, 1)[0];
  const modes = [
    { id: 'quick', title: L('exploreQuick'), note: L('recentTitle') },
    { id: 'gap', title: L('exploreGap'), note: topGap ? `${nutrientName(topGap.id)} · ${L('needMore', { value: metric(topGap.delta, topGap.id) })}` : L('exploreHint') },
    { id: 'protein', title: L('exploreProtein'), note: `${nutrientName('protein')} · ${nutrientName('carbs')}` },
    { id: 'fiber', title: L('exploreFiber'), note: `${nutrientName('fiber')} · ${nutrientName('potassium')}` },
    { id: 'lowSodium', title: L('exploreLowSodium'), note: `${nutrientName('sodium')} ↓` },
    { id: 'plant', title: L('explorePlant'), note: state.profile.diet === 'omnivore' ? `${nutrientName('fiber')} + ${nutrientName('protein')}` : `${nutrientName('iron')} + ${nutrientName('vitaminB12')}` },
  ];
  if (state.profile.diet === 'omnivore') return modes;
  return [modes[0], modes[1], modes[3], modes[5]];
}
function renderExploreEmpty(message, options = []) {
  const actions = options.length ? `<div class="inline-action-row top-gap">${options.map((opt) => `<button class="ghost-btn" type="button" ${opt.load ? 'data-explore-load="1"' : ''} ${opt.open ? `data-explore-open="${escapeHtml(opt.open)}"` : ''}>${escapeHtml(opt.label)}</button>`).join('')}</div>` : '';
  DOM.exploreResults.innerHTML = `<div class="empty-state">${escapeHtml(message)}${actions}</div>`;
}
function recentExploreSeed(item) {
  const gramMatch = String(item?.amountText || '').match(/(\d+(?:\.\d+)?)\s*g/i);
  const grams = gramMatch ? clamp(Number(gramMatch[1]) || 100, 1, 5000) : null;
  const factor = grams ? (100 / grams) : 1;
  const norm = {};
  for (const [key, value] of Object.entries(item?.nutrients || {})) norm[key] = value * factor;
  const pseudo = {
    n: item?.originalName || item?.name || L('unknownFood'),
    labels: labelsForFood(item),
    _norm: norm,
    _servingGram: grams,
    _metaLine: item?.sourceLabel || item?.source || L('recentTitle'),
    _presentIds: Array.isArray(item?.knownIds) ? [...item.knownIds] : Object.keys(item?.nutrients || {}),
  };
  return { food: pseudo, portionGram: grams || 100, reason: item?.amountText || L('recentTitle'), reuseItem: item };
}
function buildQuickExploreResults() {
  const out = [];
  const seen = new Set();
  for (const favorite of state.favorites.slice(0, 4)) {
    const key = favorite.key || normalizeSearch(favorite.code || favorite.originalName || favorite.name).slice(0, 40);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      food: hydrateFavoriteFood(favorite),
      portionGram: favorite.servingGram || 100,
      reason: L('favoritesTitle'),
    });
  }
  for (const recent of collectRecentItems(8)) {
    if (recent.type !== 'food') continue;
    const key = `${recent.code || ''}:${normalizeSearch(recent.originalName || recent.name || '')}`.slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(recentExploreSeed(recent));
    if (out.length >= 6) break;
  }
  return out.slice(0, 6);
}
function computeExploreResults(mode) {
  if (mode === 'quick') return buildQuickExploreResults();
  if (mode === 'gap') {
    return buildSuggestions().map((item) => ({
      food: item.food,
      portionGram: item.portionGram,
      reason: item.reason || L('exploreHint'),
    }));
  }
  if (!Array.isArray(state.foods)) return [];
  return state.foods
    .map((food) => modeFoodScore(food, mode))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
}
function renderExploreCards() {
  if (!DOM.exploreCards) return;
  const modes = buildExploreModes();
  DOM.exploreCards.innerHTML = modes.map((mode) => `
    <button class="explore-card ${state.activeExploreMode === mode.id ? 'active' : ''}" type="button" data-explore-mode="${escapeHtml(mode.id)}">
      <strong>${escapeHtml(mode.title)}</strong>
      <span>${escapeHtml(mode.note)}</span>
    </button>
  `).join('');
  if (DOM.exploreHint) DOM.exploreHint.textContent = L('exploreHint');
  renderExploreResults();
}
function badFoodPenalty(food) {
  const hay = normalizeSearch([food._labels?.original || food.n || '', food._displayName || ''].join(' '));
  return /(cake|cookie|biscuit|chocolate|candy|cola|soda|beer|wine|ice cream|dessert|chips|crisps|sweet)/i.test(hay) ? 0.9 : 0;
}
function modeFoodScore(food, mode) {
  const portionGram = clamp(food._servingGram || 100, 40, 180);
  const portion = scaleNutrients(food._norm, portionGram);
  const hay = normalizeSearch([food._labels?.original || '', preferredFoodName(food), food.g || '', food.b || ''].join(' '));
  const plantLike = !/(beef|pork|ham|bacon|sausage|chicken|fish|tuna|salmon|duck|turkey|boeuf|porc|jambon|poulet|thon|saumon|pollo|jamon|cerdo|ternera)/i.test(hay);
  const junk = badFoodPenalty(food);
  let score = 0;
  let reason = '';
  if (mode === 'protein') {
    score = portion.protein * 1.6 + portion.fiber * 0.35 - portion.sodium / 420 - portion.sugar / 18 - portion.satFat * 0.5 - junk;
    reason = `${nutrientName('protein')} +${metric(portion.protein, 'protein')}`;
  } else if (mode === 'fiber') {
    score = portion.fiber * 2.4 + portion.potassium / 900 + portion.protein * 0.15 - portion.sodium / 500 - portion.sugar / 20 - junk;
    reason = `${nutrientName('fiber')} +${metric(portion.fiber, 'fiber')}`;
  } else if (mode === 'lowSodium') {
    if (portion.sodium > 420) return null;
    score = portion.protein * 0.65 + portion.fiber * 0.7 + Math.max(0, 420 - portion.sodium) / 120 + portion.potassium / 1200 - junk;
    reason = `${nutrientName('sodium')} ${metric(portion.sodium, 'sodium')}`;
  } else if (mode === 'plant') {
    if (!plantLike) return null;
    score = portion.fiber * 1.8 + portion.protein * 1.0 + portion.iron * 0.25 + portion.calcium * 0.002 - portion.sodium / 600 - junk;
    reason = `${nutrientName('fiber')} / ${nutrientName('protein')}`;
  } else if (mode === 'quick') {
    score = portion.protein * 0.9 + portion.fiber * 0.8 + (portionGram <= 160 ? 1.4 : 0.3) + (food._servingGram ? 0.8 : 0) - portion.sodium / 650 - portion.sugar / 22 - junk;
    reason = food._servingGram ? L('exploreUseServing') : L('addByGramsBtn');
  } else {
    return null;
  }
  if (score <= 0.4) return null;
  return { food, score, portionGram, reason };
}
function buildSuggestions() {
  const snapshot = currentSnapshot();
  const gaps = getTopGaps(snapshot, state.calc.targets, 8);
  if (!gaps.length || !Array.isArray(state.foods)) return [];
  const weights = Object.fromEntries(gaps.map((gap) => [gap.id, gap.relative]));
  if (state.profile.conditions.boneRisk) {
    weights.calcium = (weights.calcium || 0) + 0.45;
    weights.vitaminD = (weights.vitaminD || 0) + 0.3;
  }
  if (state.profile.diet !== 'omnivore') {
    weights.iron = (weights.iron || 0) + 0.2;
    weights.vitaminB12 = (weights.vitaminB12 || 0) + 0.28;
  }
  if (state.profile.glucoseStatus !== 'normal') {
    weights.fiber = (weights.fiber || 0) + 0.25;
    weights.magnesium = (weights.magnesium || 0) + 0.12;
  }
  if (state.profile.training !== 'none') {
    weights.protein = (weights.protein || 0) + 0.18;
    weights.carbs = (weights.carbs || 0) + 0.15;
  }
  const scored = [];
  for (const food of state.foods) {
    const portionGram = clamp(food._servingGram || 100, 50, 180);
    const portion = scaleNutrients(food._norm, portionGram);
    let score = 0;
    const reasons = [];
    for (const [id, weight] of Object.entries(weights)) {
      if (!weight) continue;
      const target = state.calc.targets[id];
      const base = target ? (target.type === 'range' ? (target.preferred || target.min) : target.target) : 0;
      const value = portion[id] || 0;
      if (base > 0 && value > 0) {
        const contribution = Math.min(value / base, 0.65) * weight;
        score += contribution;
        if (contribution > 0.08) reasons.push({ id, value, contribution });
      }
    }
    score -= (portion.sodium || 0) / (state.profile.conditions.hypertension ? 1000 : 1800);
    score -= (portion.satFat || 0) / (state.profile.conditions.dyslipidemia ? 7 : 15);
    score -= (portion.transFat || 0) * 2.2;
    score -= (portion.sugar || 0) / (state.profile.glucoseStatus === 'normal' ? 28 : 18);
    score -= Math.max(0, (portion.kcal || 0) - 420) / 850;
    score -= badFoodPenalty(food);
    if (score <= 0.12) continue;
    reasons.sort((a, b) => b.contribution - a.contribution);
    scored.push({
      food,
      score,
      portionGram,
      reason: reasons.slice(0, 2).map((reason) => `${nutrientName(reason.id)} +${metric(reason.value, reason.id)}`).join(' · '),
    });
  }
  const seen = new Set();
  return scored.sort((a, b) => b.score - a.score).filter((item) => {
    const key = (item.food.c || normalizeSearch(item.food._labels?.original || preferredFoodName(item.food)).slice(0, 40));
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 6);
}
async function renderExploreResults() {
  if (!DOM.exploreResults) return;
  const mode = state.activeExploreMode || 'quick';
  if (mode !== 'quick' && !state.foodsLoaded) {
    renderExploreEmpty(L('searchLoading'), [
      { label: L('foodSearchTitle'), open: 'food' },
      { label: L('quickActionScan'), open: 'capture' },
      { label: L('exploreTitle'), load: true },
    ]);
    return;
  }
  const shouldReuse = !state.exploreDirty && state.lastExploreMode === mode && Array.isArray(state.lastExploreResults) && state.lastExploreResults.length;
  const results = shouldReuse ? state.lastExploreResults : computeExploreResults(mode);
  state.lastExploreResults = results;
  state.lastExploreMode = mode;
  state.exploreDirty = false;
  if (!results.length) {
    renderExploreEmpty(L('exploreResultEmpty'), [
      { label: L('quickActionLog'), open: 'food' },
      { label: L('quickActionScan'), open: 'capture' },
    ]);
    return;
  }
  DOM.exploreResults.innerHTML = results.map((item, idx) => {
    const displayName = preferredFoodName(item.food);
    const original = preferredOriginalName(item.food);
    const metaLine = foodMetaLine(item.food);
    const pillText = item.reuseItem?.amountText
      ? item.reuseItem.amountText
      : (item.food._servingGram ? L('servingApprox', { gram: round0(item.portionGram) }) : L('baseline100g'));
    return `
      <article class="explore-result-card">
        <div class="explore-result-head">
          <div>
            <h4>${escapeHtml(displayName)}</h4>
            ${original ? `<div class="food-origin">${escapeHtml(L('originalNameLabel'))} ${escapeHtml(original)}</div>` : ''}
            ${metaLine ? `<div class="food-origin">${escapeHtml(metaLine)}</div>` : ''}
            <div class="food-origin">${escapeHtml(item.reason || '')}</div>
          </div>
          <span class="top-pill subtle">${escapeHtml(pillText)}</span>
        </div>
        <div class="food-meta">
          <span>${escapeHtml(metric(item.food._norm.kcal, 'kcal'))}</span>
          <span>${escapeHtml(nutrientName('protein'))} ${escapeHtml(metric(item.food._norm.protein, 'protein'))}</span>
          <span>${escapeHtml(nutrientName('fiber'))} ${escapeHtml(metric(item.food._norm.fiber, 'fiber'))}</span>
          <span>${escapeHtml(nutrientName('sodium'))} ${escapeHtml(metric(item.food._norm.sodium, 'sodium'))}</span>
        </div>
        <div class="food-actions">
          <button class="ghost-btn" type="button" data-explore-add="${idx}" data-explore-grams="${round0(item.portionGram || item.food._servingGram || 100)}">${escapeHtml(item.reuseItem ? L('addBtn') : L('exploreUseServing'))}</button>
          <button class="ghost-btn" type="button" data-explore-search="${escapeHtml(displayName)}">${escapeHtml(L('foodSearchTitle'))}</button>
        </div>
      </article>
    `;
  }).join('');
}
function onExploreCardClick(e) {
  const card = e.target.closest('[data-explore-mode]');
  if (!card) return;
  state.activeExploreMode = card.dataset.exploreMode;
  markExploreDirty();
  renderExploreCards();
}
function onExploreResultClick(e) {
  const loadBtn = e.target.closest('[data-explore-load]');
  const openBtn = e.target.closest('[data-explore-open]');
  const addBtn = e.target.closest('[data-explore-add]');
  const searchBtn = e.target.closest('[data-explore-search]');
  if (openBtn) {
    openPanel(openBtn.dataset.exploreOpen);
    return;
  }
  if (loadBtn) {
    loadFoods().then(() => {
      markExploreDirty();
      renderExploreResults();
    });
    return;
  }
  if (searchBtn) {
    quickSearch(searchBtn.dataset.exploreSearch);
    return;
  }
  if (!addBtn) return;
  const idx = Number(addBtn.dataset.exploreAdd);
  const item = state.lastExploreResults[idx];
  if (!item) return;
  if (item.reuseItem) {
    const clone = JSON.parse(JSON.stringify(item.reuseItem));
    clone.createdAt = new Date().toISOString();
    getDayLog(state.date).items.unshift(clone);
    saveLogs();
    markExploreDirty();
    renderAll();
    flashUpdate();
    return;
  }
  if (!item.food) return;
  addFoodLog(item.food, Number(addBtn.dataset.exploreGrams) || item.portionGram || 100, L('dbSource'));
}
function renderPresetChips() {
  if (!DOM.profilePresetList) return;
  DOM.profilePresetList.innerHTML = PRESETS.map((preset) => `
    <button class="preset-chip" type="button" data-preset-id="${escapeHtml(preset.id)}">${escapeHtml(presetLabel(uiLang(), preset.id))}</button>
  `).join('');
  if (DOM.presetHint) DOM.presetHint.textContent = L('presetHint');
}
function onPresetClick(e) {
  const btn = e.target.closest('[data-preset-id]');
  if (!btn) return;
  const preset = PRESETS.find((item) => item.id === btn.dataset.presetId);
  if (!preset) return;
  writeProfileToForm(sanitizeProfile(preset.profile));
  recalc();
  renderAll();
  if (DOM.presetHint) DOM.presetHint.textContent = presetHint(uiLang(), preset.id);
}

function soundLevelText(axis, value) {
  const levels = {
    zh: {
      volume: ['耳语', '轻', '适中', '偏大', '很大'],
      energy: ['很松', '松弛', '均衡', '有冲劲', '高峰'],
      intensity: ['漂浮', '柔推', '稳定推进', '明显 build-up', 'peak time'],
      pulse: ['直稳', '轻摆', '有 groove', '碎步切分', '强跳感'],
      bass: ['轻底', '偏轻', '适中', '厚低频', '胸腔推力'],
      brightness: ['暖暗', '柔和', '通透', '偏亮', '颗粒闪'],
      tempo: ['慢', '偏慢', '中速', '偏快', '快'],
      variation: ['极轻', '轻', '中', '明显', '大胆'],
    },
    en: {
      volume: ['whisper', 'light', 'balanced', 'loud', 'very loud'],
      energy: ['loose', 'relaxed', 'balanced', 'driving', 'peak'],
      intensity: ['floating', 'soft push', 'steady build', 'clear build-up', 'peak time'],
      pulse: ['straight', 'sway', 'groove', 'syncopated', 'jumpier'],
      bass: ['lean', 'light', 'balanced', 'thick low end', 'chest push'],
      brightness: ['dark', 'soft', 'clear', 'bright', 'sparkly'],
      tempo: ['slow', 'lower', 'mid', 'faster', 'fast'],
      variation: ['minimal', 'light', 'medium', 'clear', 'bold'],
    },
    es: {
      volume: ['susurro', 'ligero', 'equilibrado', 'alto', 'muy alto'],
      energy: ['suelto', 'relajado', 'equilibrado', 'impulso', 'pico'],
      intensity: ['flotante', 'empuje suave', 'subida estable', 'build-up claro', 'hora pico'],
      pulse: ['recto', 'balanceo', 'groove', 'sincopado', 'más salto'],
      bass: ['ligero', 'poco grave', 'equilibrado', 'grave pesado', 'empuje en pecho'],
      brightness: ['oscuro', 'suave', 'claro', 'brillante', 'chispeante'],
      tempo: ['lento', 'algo lento', 'medio', 'más rápido', 'rápido'],
      variation: ['mínima', 'ligera', 'media', 'clara', 'atrevida'],
    },
  };
  const list = levels[uiLang()]?.[axis] || levels.zh[axis] || [];
  return list[Math.max(0, Math.min(list.length - 1, Number(value || 1) - 1))] || `${value}/5`;
}
function soundAxisHint(axis, value) {
  const lang = uiLang();
  const isZh = lang === 'zh';
  const isEs = lang === 'es';
  if (axis === 'pulse') return isZh
    ? (value >= 4 ? '更接近 UK garage / jungle 的切分与碎步感。' : value <= 2 ? '更靠近 house / techno 的直稳落点。' : 'groove 与直拍之间，适合边做饭边点按。')
    : isEs
      ? (value >= 4 ? 'Más cerca de la síncopa y el paso roto de UK garage / jungle.' : value <= 2 ? 'Más recto, entre house y techno.' : 'Entre groove y pulso recto; cómodo para cocinar y registrar.')
      : (value >= 4 ? 'Closer to the syncopated footwork of UK garage / jungle.' : value <= 2 ? 'Straighter, more house / techno-like.' : 'Between groove and straight time; easy while cooking.');
  if (axis === 'bass') return isZh
    ? (value >= 4 ? '低频更像胸腔推动，身体更容易跟着同步。' : '低频更轻，适合长时间挂在背景里。')
    : isEs
      ? (value >= 4 ? 'Los graves empujan más el pecho y sincronizan el cuerpo.' : 'Graves más ligeros para dejarlo de fondo mucho tiempo.')
      : (value >= 4 ? 'Bass pushes the chest more and pulls the body into sync.' : 'Lighter bass for longer background listening.');
  if (axis === 'brightness') return isZh
    ? (value >= 4 ? '更亮的 hi-hat 与颗粒，会把空间感打开。' : '更暗更暖，适合专注和稳态。')
    : isEs
      ? (value >= 4 ? 'Más brillo y hat abren el espacio.' : 'Más oscuro y cálido para foco y estabilidad.')
      : (value >= 4 ? 'Brighter hats and grains open the space.' : 'Darker and warmer for focus and steadiness.');
  if (axis === 'tempo') return isZh
    ? (value >= 4 ? '速度更快，适合短时提神和快节奏记录。' : value <= 2 ? '速度更慢，更像 ambient / deep house 的悬浮。' : '中速最适合长期挂着。')
    : isEs
      ? (value >= 4 ? 'Más velocidad para activar y registrar rápido.' : value <= 2 ? 'Más lento, con sensación ambient / deep house.' : 'Tempo medio para dejarlo puesto más tiempo.')
      : (value >= 4 ? 'Faster for a quick lift and rapid logging.' : value <= 2 ? 'Slower, more ambient / deep-house-like.' : 'Mid tempo is easiest to keep running.');
  if (axis === 'intensity') return isZh
    ? (value >= 4 ? '更像 build-up 和 peak time，会更有冲顶感。' : value <= 2 ? '更柔，适合边做饭边轻松记。' : '维持持续推进，不会太吵。')
    : isEs
      ? (value >= 4 ? 'Más build-up y hora pico.' : value <= 2 ? 'Más suave para cocinar y registrar con calma.' : 'Empuje continuo sin ser invasivo.')
      : (value >= 4 ? 'More like build-up and peak time.' : value <= 2 ? 'Softer for cooking and calm logging.' : 'Steady drive without getting too pushy.');
  if (axis === 'variation') return isZh
    ? (value >= 4 ? '参数会更明显地自己流动，适合一直挂着当背景。' : value <= 2 ? '变化更轻，适合稳定地陪伴。' : '会有缓慢自动变化，但不会乱跳。')
    : isEs
      ? (value >= 4 ? 'Los parámetros se moverán más solos, ideal para dejarlo de fondo.' : value <= 2 ? 'Cambios suaves para acompañar con estabilidad.' : 'Habrá variaciones lentas sin volverse caótico.')
      : (value >= 4 ? 'Parameters drift more on their own, great for leaving it in the background.' : value <= 2 ? 'Lighter movement for steady companionship.' : 'Slow auto-variation without getting messy.');
  return isZh
    ? (value >= 4 ? '能量更高，更像舞池推进。' : value <= 2 ? '更松，更像空间氛围层。' : '能量居中，适合日常探索。')
    : isEs
      ? (value >= 4 ? 'Más energía, más empuje de pista.' : value <= 2 ? 'Más suelto, como capa ambiental.' : 'Energía media para exploración diaria.')
      : (value >= 4 ? 'Higher energy, more dance-floor drive.' : value <= 2 ? 'Looser, more atmospheric.' : 'Mid energy for day-to-day exploration.');
}
function toggleShortText(value) {
  return uiLang() === 'en' ? (value ? 'on' : 'off') : uiLang() === 'es' ? (value ? 'activo' : 'apagado') : (value ? '已开' : '已关');
}
function renderSoundReadings(snapshot) {
  if (!DOM.soundReadingGrid) return;
  const cards = [
    { label: L('musicVolumeLabel'), value: `${snapshot.volume}%`, sub: soundLevelText('volume', Math.max(1, Math.min(5, Math.round(snapshot.volume / 20) || 1))) },
    { label: L('musicEnergyLabel'), value: `${snapshot.energy}/5`, sub: soundAxisHint('energy', snapshot.energy) },
    { label: L('musicIntensityLabel'), value: soundLevelText('intensity', snapshot.intensity), sub: soundAxisHint('intensity', snapshot.intensity) },
    { label: L('musicPulseLabel'), value: soundLevelText('pulse', snapshot.pulse), sub: soundAxisHint('pulse', snapshot.pulse) },
    { label: L('musicBassLabel'), value: soundLevelText('bass', snapshot.bass), sub: soundAxisHint('bass', snapshot.bass) },
    { label: L('musicBrightnessLabel'), value: soundLevelText('brightness', snapshot.brightness), sub: soundAxisHint('brightness', snapshot.brightness) },
    { label: L('musicTempoLabel'), value: `${snapshot.effectiveBpm || snapshot.genre?.bpm || 0} BPM`, sub: soundAxisHint('tempo', snapshot.tempo) },
    { label: L('musicVariationLabel'), value: soundLevelText('variation', snapshot.variation || 3), sub: soundAxisHint('variation', snapshot.variation || 3) },
    { label: L('musicPersistentLabel'), value: toggleShortText(snapshot.persistent), sub: snapshot.persistent ? (uiLang() === 'zh' ? '会尽量提前排程，让切后台更稳。' : uiLang() === 'es' ? 'Programa audio por adelantado para aguantar mejor en segundo plano.' : 'Schedules farther ahead for steadier background playback.') : (uiLang() === 'zh' ? '更偏前台互动模式。' : uiLang() === 'es' ? 'Más orientado al uso en primer plano.' : 'More foreground-oriented.') },
    { label: L('musicAutoMorphLabel'), value: toggleShortText(snapshot.autoMorph), sub: snapshot.autoMorph ? (uiLang() === 'zh' ? '会慢慢自己换气口与纹理。' : uiLang() === 'es' ? 'Cambia poco a poco respiración y textura.' : 'Slowly shifts breath and texture on its own.') : (uiLang() === 'zh' ? '保持你手动设定的静态版本。' : uiLang() === 'es' ? 'Mantiene una versión fija de tus ajustes.' : 'Keeps your manual settings stable.') },
  ];
  DOM.soundReadingGrid.innerHTML = cards.map((card) => `
    <article class="sound-reading-chip">
      <strong>${escapeHtml(card.label)} · ${escapeHtml(card.value)}</strong>
      <span>${escapeHtml(card.sub)}</span>
    </article>
  `).join('');
}


const MUSIC_STYLE_PRESETS_V24 = [
  { id: 'hypnotic', labels: { zh: '催眠循环', en: 'Hypnotic Loop', es: 'Bucle hipnótico' }, note: { zh: '更少旋律、更长呼吸，适合长时间盯着模型和数据。', en: 'Less melody, longer breathing loops for extended focus.', es: 'Menos melodía y respiración más larga para concentrarse.' }, genreId: 'minimalTechno', energy: 3, intensity: 2, pulse: 3, bass: 3, brightness: 2, tempo: 2, variation: 2 },
  { id: 'warehouse', labels: { zh: '仓库重压', en: 'Warehouse Push', es: 'Empuje warehouse' }, note: { zh: '更黑、更重、更直给，低频和驱动感明显拉满。', en: 'Darker, heavier, and more direct with stronger low-end drive.', es: 'Más oscuro, pesado y directo con graves más marcados.' }, genreId: 'minimalTechno', energy: 4, intensity: 4, pulse: 3, bass: 5, brightness: 2, tempo: 3, variation: 2 },
  { id: 'acidline', labels: { zh: 'Acid 线条', en: 'Acid Line', es: 'Línea acid' }, note: { zh: '带尖锐起伏和更多咬感，适合快速录入。', en: 'Sharper motion and bite for rapid logging.', es: 'Más filo y mordida para registrar rápido.' }, genreId: 'acidRave', energy: 4, intensity: 5, pulse: 4, bass: 4, brightness: 4, tempo: 4, variation: 5 },
  { id: 'dubmist', labels: { zh: 'Dub 雾面', en: 'Dub Mist', es: 'Niebla dub' }, note: { zh: '空间更深、低频更软，适合夜间和长时间浏览。', en: 'Deeper space and softer subs for night sessions.', es: 'Más espacio y subgrave suave para sesiones largas.' }, genreId: 'ambientTechno', energy: 2, intensity: 2, pulse: 2, bass: 4, brightness: 1, tempo: 2, variation: 3 },
  { id: 'melodic', labels: { zh: '旋律推进', en: 'Melodic Lift', es: 'Impulso melódico' }, note: { zh: '更亮、更抬头，适合把节奏推起来。', en: 'Brighter and more uplifting when you want momentum.', es: 'Más brillante y ascendente para ganar impulso.' }, genreId: 'progressiveTrance', energy: 4, intensity: 3, pulse: 3, bass: 3, brightness: 5, tempo: 4, variation: 4 },
  { id: 'broken', labels: { zh: '碎拍弹性', en: 'Broken Swing', es: 'Swing roto' }, note: { zh: '切分和弹性更强，想要更活的时候用它。', en: 'More syncopation and bounce when you want movement.', es: 'Más síncopa y rebote cuando quieres más movimiento.' }, genreId: 'ukGarage', energy: 4, intensity: 4, pulse: 5, bass: 4, brightness: 3, tempo: 4, variation: 5 },
];

function musicStyleTextV24(style, field) {
  const lang = uiLang();
  return style?.[field]?.[lang] || style?.[field]?.zh || '';
}

function ensureMusicStyleBoardV24() {
  const genreList = DOM.musicGenreList;
  if (!genreList?.parentElement) return null;
  let wrap = document.getElementById('musicStyleBoardV24');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'musicStyleBoardV24';
    wrap.className = 'sound-style-board-v24';
    wrap.innerHTML = `
      <div class="mini-title" id="musicStyleBoardTitleV24"></div>
      <div class="sound-style-list-v24" id="musicStyleListV24"></div>
      <div class="muted small" id="musicStyleHintV24"></div>`;
    genreList.insertAdjacentElement('afterend', wrap);
  }
  return wrap;
}

function renderMusicStyleBoardV24(snapshot) {
  const wrap = ensureMusicStyleBoardV24();
  if (!wrap) return;
  const list = document.getElementById('musicStyleListV24');
  const title = document.getElementById('musicStyleBoardTitleV24');
  const hint = document.getElementById('musicStyleHintV24');
  if (title) title.textContent = uiLang() === 'zh' ? 'Techno / 电子风格强化器' : uiLang() === 'es' ? 'Moldeador de estilo electrónico' : 'Electronic style shaper';
  if (hint) hint.textContent = uiLang() === 'zh' ? '先选流派，再点一个风格模板；模板只是一键起点，下面 8 个参数还能继续细抠。' : uiLang() === 'es' ? 'Elige un género y luego una macro. La macro solo es el punto de partida; abajo sigues afinando los 8 parámetros.' : 'Pick a genre, then a style macro. The macro is only a starting point; the 8 controls below still let you fine-tune everything.';
  if (!list) return;
  const activeStyle = state.musicPrefs?.styleId || '';
  list.innerHTML = MUSIC_STYLE_PRESETS_V24.map((style) => `
    <button class="sound-style-chip-v24 ${activeStyle === style.id ? 'active' : ''}" type="button" data-music-style-id="${escapeHtml(style.id)}">
      <strong>${escapeHtml(musicStyleTextV24(style, 'labels'))}</strong>
      <span>${escapeHtml(musicStyleTextV24(style, 'note'))}</span>
    </button>`).join('');
}

function applyMusicStylePresetV24(styleId) {
  const style = MUSIC_STYLE_PRESETS_V24.find((item) => item.id === styleId);
  if (!style) return;
  const controller = initMusicController();
  state.musicPrefs = { ...(state.musicPrefs || {}), styleId: styleId };
  if (style.genreId) controller.setGenre(style.genreId);
  if (Number.isFinite(style.energy)) controller.setEnergy(style.energy);
  if (Number.isFinite(style.intensity)) controller.setIntensity(style.intensity);
  if (Number.isFinite(style.pulse)) controller.setPulse(style.pulse);
  if (Number.isFinite(style.bass)) controller.setBass(style.bass);
  if (Number.isFinite(style.brightness)) controller.setBrightness(style.brightness);
  if (Number.isFinite(style.tempo)) controller.setTempo(style.tempo);
  if (Number.isFinite(style.variation)) controller.setVariation(style.variation);
  saveMusicPrefs();
  renderSoundPanel();
}

function onMusicStylePanelClickV24(e) {
  const btn = e.target.closest('[data-music-style-id]');
  if (!btn) return;
  applyMusicStylePresetV24(btn.dataset.musicStyleId || '');
}

function renderSoundPanel() {
  if (!DOM.musicGenreList) return;
  const controller = initMusicController();
  const snapshot = controller.getState();
  if (DOM.musicVolume) DOM.musicVolume.value = String(snapshot.volume);
  if (DOM.musicEnergy) DOM.musicEnergy.value = String(snapshot.energy);
  if (DOM.musicIntensity) DOM.musicIntensity.value = String(snapshot.intensity);
  if (DOM.musicPulse) DOM.musicPulse.value = String(snapshot.pulse);
  if (DOM.musicBass) DOM.musicBass.value = String(snapshot.bass);
  if (DOM.musicBrightness) DOM.musicBrightness.value = String(snapshot.brightness);
  if (DOM.musicTempo) DOM.musicTempo.value = String(snapshot.tempo);
  if (DOM.musicVariation) DOM.musicVariation.value = String(snapshot.variation || 3);
  if (DOM.musicAutoMorph) DOM.musicAutoMorph.checked = Boolean(snapshot.autoMorph);
  if (DOM.musicPersistent) DOM.musicPersistent.checked = Boolean(snapshot.persistent);
  DOM.musicGenreList.innerHTML = MUSIC_GENRES.map((genre) => `
    <button class="genre-chip ${snapshot.genreId === genre.id ? 'active' : ''}" type="button" data-genre-id="${escapeHtml(genre.id)}">
      <strong>${escapeHtml(genre.labels[uiLang()] || genre.labels.zh)}</strong>
      <span>${escapeHtml(genre.note[uiLang()] || genre.note.zh)}</span>
    </button>
  `).join('');
  renderMusicStyleBoardV24(snapshot);
  if (DOM.musicToggleBtn) DOM.musicToggleBtn.textContent = snapshot.isPlaying ? L('musicToggleStop') : L('musicToggleStart');
  if (DOM.soundSummary) {
    DOM.soundSummary.textContent = snapshot.isPlaying
      ? L('musicSummaryPlaying', { genre: snapshot.genre.labels[uiLang()] || snapshot.genre.labels.zh, bpm: snapshot.effectiveBpm || snapshot.genre.bpm })
      : L('musicSummaryStopped');
  }
  if (DOM.musicStatus) {
    const modeBits = [];
    if (snapshot.persistent) modeBits.push(L('musicPersistentLabel'));
    if (snapshot.autoMorph) modeBits.push(L('musicAutoMorphLabel'));
    const modeText = modeBits.length ? ` · ${modeBits.join(' · ')}` : '';
    DOM.musicStatus.textContent = snapshot.needsTap
      ? L('musicStatusNeedTap')
      : snapshot.isPlaying
        ? `${L('musicStatusPlaying', { genre: snapshot.genre.labels[uiLang()] || snapshot.genre.labels.zh, energy: snapshot.energy })} · ${snapshot.effectiveBpm || snapshot.genre.bpm} BPM${modeText}`
        : `${L('musicStatusIdle')}${modeText}`;
  }
  renderSoundReadings(snapshot);
  if (DOM.musicGuideList) {
    DOM.musicGuideList.innerHTML = [L('musicGuide1'), L('musicGuide2'), L('musicGuide3'), L('musicGuide4'), L('musicGuide5')]
      .filter(Boolean)
      .map((line) => `<li>${escapeHtml(line)}</li>`).join('');
  }
}
function buildMusicBridgePayload() {
  const controller = initMusicController();
  const snapshot = controller.getState();
  const overview = currentSnapshot();
  const targets = state.calc.targets;
  const topGap = getTopGaps(overview, targets, 1)[0];
  const topRisk = getTopRisks(overview, targets, 1)[0];
  return {
    schema: 'haochijia.music-bridge.v1',
    generatedAt: new Date().toISOString(),
    source: {
      app: '好吃家 / Haochijia Web',
      platform: state.platform,
      language: uiLang(),
      regionMode: state.regionMode || 'auto',
    },
    context: {
      date: state.date,
      balanceScore: computeBalanceScore(overview, targets),
      topGap: topGap ? { id: topGap.id, label: nutrientName(topGap.id), delta: round1(topGap.delta || 0) } : null,
      topRisk: topRisk ? { id: topRisk.id, label: nutrientName(topRisk.id), delta: round1(topRisk.delta || 0) } : null,
    },
    music: {
      genreId: snapshot.genreId,
      genreLabel: snapshot.genre.labels[uiLang()] || snapshot.genre.labels.zh,
      bpm: snapshot.effectiveBpm || snapshot.genre.bpm,
      volume: snapshot.volume,
      energy: snapshot.energy,
      intensity: snapshot.intensity,
      pulse: snapshot.pulse,
      bass: snapshot.bass,
      brightness: snapshot.brightness,
      tempo: snapshot.tempo,
      variation: snapshot.variation || 3,
      autoMorph: Boolean(snapshot.autoMorph),
      persistent: Boolean(snapshot.persistent),
    },
    bridge: {
      targetApp: 'TriSense Music',
      inputs: ['audio', 'nutrition summary', 'interaction rhythm'],
      outputs: ['remix guidance', 'visual palette', 'XR scene nodes'],
      futureTargets: ['AR overlays', 'VR scenes', 'interactive installation controllers', 'biofeedback mapping'],
    },
  };
}
function exportMusicBridgePack() {
  const payload = buildMusicBridgePayload();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, `haochijia-music-bridge-${state.date}.json`);
  showToast(L('musicBridgeDownloaded'));
}
function onMusicPanelClick(e) {
  const btn = e.target.closest('[data-genre-id]');
  if (!btn) return;
  const controller = initMusicController();
  controller.setGenre(btn.dataset.genreId);
  state.musicPrefs = { ...(state.musicPrefs || {}), styleId: '' };
  saveMusicPrefs();
  renderSoundPanel();
}


function init() {
  IDS.forEach((id) => { DOM[id] = document.getElementById(id); });
  document.body.dataset.platform = state.platform;
  if (DOM.logDate) DOM.logDate.value = state.date;
  safeInitStep('renderRegionControls', () => renderRegionControls());
  safeInitStep('initMusicController', () => initMusicController());
  safeInitStep('writeProfileToForm', () => writeProfileToForm(state.profile));
  safeInitStep('syncManualBasisUi', () => syncManualBasisUi());
  safeInitStep('recalc', () => recalc());
  safeInitStep('applyLanguage', () => applyLanguage());
  safeInitStep('applyFoldStates', () => applyFoldStates());
  safeInitStep('bindEvents', () => bindEvents());
  safeInitStep('loadMeta', () => loadMeta());
  safeInitStep('renderAll', () => renderAll());
  safeInitStep('registerServiceWorker', () => registerServiceWorker());
}

function bindEvents() {
  const profileChange = debounce(() => {
    recalc();
    renderAll();
  }, 120);
  DOM.profileForm?.addEventListener('input', profileChange);
  DOM.profileForm?.addEventListener('change', profileChange);
  DOM.saveCollapseProfileBtn?.addEventListener('click', () => {
    recalc();
    renderAll();
    setPanelState('profile', false);
  });

  document.querySelectorAll('[data-fold-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => togglePanel(btn.dataset.foldToggle));
  });
  document.querySelectorAll('[data-open-panel]').forEach((btn) => {
    btn.addEventListener('click', () => openPanel(btn.dataset.openPanel));
  });

  DOM.languageSelect?.addEventListener('change', () => {
    state.language = DOM.languageSelect.value || detectBestLanguage();
    saveLanguage();
    applyLanguage();
    renderAll();
  });
  DOM.regionSelect?.addEventListener('change', () => {
    setFoodRegion(DOM.regionSelect.value || 'auto');
  });

  DOM.profilePresetList?.addEventListener('click', onPresetClick);
  DOM.questStrip?.addEventListener('click', onQuestStripClick);
  DOM.exploreCards?.addEventListener('click', onExploreCardClick);
  DOM.exploreResults?.addEventListener('click', onExploreResultClick);

  DOM.musicGenreList?.addEventListener('click', onMusicPanelClick);
  document.getElementById('soundPanel')?.addEventListener('click', onMusicStylePanelClickV24);
  DOM.musicToggleBtn?.addEventListener('click', async () => {
    const controller = initMusicController();
    await controller.toggle();
    saveMusicPrefs();
    renderSoundPanel();
  });
  DOM.musicVolume?.addEventListener('input', () => {
    const controller = initMusicController();
    controller.setVolume(DOM.musicVolume.value);
    saveMusicPrefs();
  });
  DOM.musicEnergy?.addEventListener('input', () => {
    const controller = initMusicController();
    controller.setEnergy(DOM.musicEnergy.value);
    saveMusicPrefs();
  });
  DOM.musicIntensity?.addEventListener('input', () => {
    const controller = initMusicController();
    controller.setIntensity(DOM.musicIntensity.value);
    saveMusicPrefs();
  });
  DOM.musicPulse?.addEventListener('input', () => {
    const controller = initMusicController();
    controller.setPulse(DOM.musicPulse.value);
    saveMusicPrefs();
  });
  DOM.musicBass?.addEventListener('input', () => {
    const controller = initMusicController();
    controller.setBass(DOM.musicBass.value);
    saveMusicPrefs();
  });
  DOM.musicBrightness?.addEventListener('input', () => {
    const controller = initMusicController();
    controller.setBrightness(DOM.musicBrightness.value);
    saveMusicPrefs();
  });
  DOM.musicTempo?.addEventListener('input', () => {
    const controller = initMusicController();
    controller.setTempo(DOM.musicTempo.value);
    saveMusicPrefs();
  });
  DOM.musicVariation?.addEventListener('input', () => {
    const controller = initMusicController();
    controller.setVariation(DOM.musicVariation.value);
    saveMusicPrefs();
  });
  DOM.musicAutoMorph?.addEventListener('change', () => {
    const controller = initMusicController();
    controller.setAutoMorph(Boolean(DOM.musicAutoMorph.checked));
    saveMusicPrefs();
    renderSoundPanel();
  });
  DOM.musicPersistent?.addEventListener('change', () => {
    const controller = initMusicController();
    controller.setPersistent(Boolean(DOM.musicPersistent.checked));
    saveMusicPrefs();
    renderSoundPanel();
  });
  DOM.musicExportBridgeBtn?.addEventListener('click', exportMusicBridgePack);

  DOM.chefFab?.addEventListener('click', openQuickSheet);
  DOM.quickSheetClose?.addEventListener('click', closeQuickSheet);
  DOM.quickSheetBackdrop?.addEventListener('click', closeQuickSheet);
  DOM.sheetWaterRow?.addEventListener('click', onQuickSheetClick);
  DOM.quickSheetRecentList?.addEventListener('click', onQuickSheetClick);
  DOM.quickSheetFavoriteList?.addEventListener('click', onQuickSheetClick);
  DOM.quickSheetSearchBtn?.addEventListener('click', () => {
    const value = DOM.quickSheetSearchInput?.value.trim();
    if (!value) {
      openPanel('food');
      closeQuickSheet();
      return;
    }
    quickSearch(value);
    closeQuickSheet();
  });
  DOM.quickSheetSearchInput?.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    DOM.quickSheetSearchBtn?.click();
  });

  DOM.logDate?.addEventListener('change', () => {
    state.date = DOM.logDate.value || todayString();
    markExploreDirty();
    renderAll();
  });

  DOM.quickAddWater?.addEventListener('click', onWaterClick);
  document.querySelector('.mobile-dock')?.addEventListener('click', (e) => {
    if (e.target.closest('[data-water-add]')) onWaterClick(e);
  });

  DOM.foodSearchInput?.addEventListener('focus', () => loadFoods());
  DOM.foodSearchInput?.addEventListener('input', debounce(() => doSearch(DOM.foodSearchInput.value.trim()), 150));
  DOM.foodSearchResults?.addEventListener('click', onFoodResultClick);
  DOM.recentList?.addEventListener('click', onRecentClick);
  DOM.favoritesList?.addEventListener('click', onFavoriteClick);

  DOM.logList?.addEventListener('click', onLogListClick);
  DOM.clearDayBtn?.addEventListener('click', clearDay);
  DOM.exportJsonBtn?.addEventListener('click', exportDayJson);
  DOM.exportCsvBtn?.addEventListener('click', exportDayCsv);

  DOM.manualBasis?.addEventListener('change', syncManualBasisUi);
  DOM.manualSaveBtn?.addEventListener('click', saveManualEntry);
  DOM.manualClearBtn?.addEventListener('click', clearManualForm);
  DOM.ocrImageInput?.addEventListener('change', updateOcrPreview);
  DOM.ocrRunBtn?.addEventListener('click', runOCR);
  DOM.barcodeBtn?.addEventListener('click', detectBarcodeFromImage);
}
function renderAll() {
  if (DOM.todayBadge) DOM.todayBadge.textContent = state.date;
  renderOverview();
  renderCompactNutrients();
  renderProfileSummary();
  renderReference();
  renderDayLog();
  renderRecentList();
  renderLiveChips();
  renderSuggestions();
  renderPanelSummaries();
  renderQuestStrip();
  renderExploreCards();
  renderSoundPanel();
  renderQuickSheet();
}

function renderOverview() {
  const snapshot = currentSnapshot();
  const totals = snapshot.totals;
  const targets = state.calc.targets;
  const topGap = getTopGaps(snapshot, targets, 1)[0];
  const topRisk = getTopRisks(snapshot, targets, 1)[0];
  const score = computeBalanceScore(snapshot, targets);
  const cards = [
    {
      label: L('balanceScore'),
      value: `${score}`,
      sub: summaryMessage(score, topGap, topRisk),
      tone: score >= 82 ? 'good' : score >= 62 ? 'warn' : 'danger',
    },
    {
      label: L('energyShort'),
      value: metric(totals.kcal, 'kcal'),
      sub: L('recommended', { text: targetToText(targets.kcal) }),
      tone: tone(evaluateTarget(targets.kcal, totals.kcal)),
    },
    {
      label: L('proteinShort'),
      value: metric(totals.protein, 'protein'),
      sub: `${statusText(evaluateTarget(targets.protein, totals.protein))} · ${L('recommended', { text: targetToText(targets.protein) })}`,
      tone: tone(evaluateTarget(targets.protein, totals.protein)),
    },
    {
      label: topGap ? L('currentPriority') : (topRisk ? L('currentReminder') : L('todayStatusCard')),
      value: topGap ? nutrientName(topGap.id) : (topRisk ? nutrientName(topRisk.id) : L('basicStable')),
      sub: topGap
        ? L('needMore', { value: metric(topGap.delta, topGap.id) })
        : (topRisk ? L('tooMuch', { value: metric(topRisk.delta, topRisk.id) }) : L('keepGoing')),
      tone: topGap ? 'warn' : (topRisk ? 'danger' : 'good'),
    },
  ];
  DOM.summaryCards.innerHTML = cards.map((card) => `
    <article class="summary-card tone-${card.tone}">
      <div class="summary-label">${escapeHtml(card.label)}</div>
      <div class="summary-value">${escapeHtml(card.value)}</div>
      <div class="summary-sub">${escapeHtml(card.sub)}</div>
    </article>
  `).join('');

  renderFocusList(DOM.gapList, getTopGaps(snapshot, targets, 3), 'low');
  renderFocusList(DOM.riskList, getTopRisks(snapshot, targets, 3), 'high');
  renderDoneList(getDoneItems(snapshot, targets, 3));

  const streak = computeStreak();
  const hintBits = [
    `${L('energyShort')} ${state.calc.calories} kcal`,
    `BMI ${state.calc.bmi}`,
    streak > 0 ? `${L('localSaved')} · ${streak}` : L('localSaved'),
  ];
  DOM.summaryHint.textContent = hintBits.join(' · ');
  if (DOM.platformBadge) DOM.platformBadge.textContent = streak > 0 ? `${platformText(uiLang(), state.platform)} · ${streak}` : platformText(uiLang(), state.platform);
  DOM.deficitSummary.textContent = topGap
    ? `${nutrientName(topGap.id)}`
    : (topRisk ? `${nutrientName(topRisk.id)}` : L('continueRhythm'));
}

function renderFocusList(container, items, mode) {
  if (!container) return;
  if (!items.length) {
    container.innerHTML = `<li class="focus-empty">${escapeHtml(mode === 'low' ? L('emptyGap') : L('emptyRisk'))}</li>`;
    return;
  }
  container.innerHTML = items.map((item) => {
    const suffix = Number.isFinite(item.confidence) && item.confidence < 0.55 ? ` · ${L('coverageLabel')}` : '';
    return `
      <li>
        <div class="focus-label">${escapeHtml(nutrientName(item.id))}</div>
        <div class="focus-value">${escapeHtml(metric(item.delta, item.id))}${escapeHtml(suffix)}</div>
      </li>
    `;
  }).join('');
}

function renderDoneList(items) {
  if (!items.length) {
    DOM.doneList.innerHTML = `<li class="focus-empty">${escapeHtml(L('emptyDone'))}</li>`;
    return;
  }
  DOM.doneList.innerHTML = items.map((item) => `
    <li>
      <div class="focus-label">${escapeHtml(nutrientName(item.id))}</div>
      <div class="focus-value">${escapeHtml(statusText({ status: 'good' }))}</div>
    </li>
  `).join('');
}

function renderCompactNutrients() {
  const snapshot = currentSnapshot();
  const totals = snapshot.totals;
  const ids = compactDashboardIds();
  DOM.nutrientGrid.innerHTML = ids.map((id) => {
    const target = state.calc.targets[id];
    const intake = totals[id] || 0;
    const ev = target ? evaluateTarget(target, intake) : null;
    const coverage = snapshot.coverage[id] ?? 1;
    const showCoverage = shouldShowCoverage(id, snapshot.totalFoodCount);
    const coverageText = showCoverage ? confidenceLabel(coverage) : '';
    return `
      <article class="nutrient-card state-${ev ? tone(ev) : 'muted'}">
        <div class="nutrient-top">
          <div>
            <h3>${escapeHtml(nutrientName(id))}</h3>
            <div class="muted small">${escapeHtml(target ? targetToText(target) : L('statusOnlyTrack'))}</div>
          </div>
          <span class="top-pill subtle">${escapeHtml(ev ? statusText(ev) : '—')}</span>
        </div>
        <div class="nutrient-main">
          <div class="metric-box">
            <span class="metric-label">${escapeHtml(L('metricIntake'))}</span>
            <strong>${escapeHtml(metric(intake, id))}</strong>
          </div>
          <div class="metric-box">
            <span class="metric-label">${escapeHtml(L('metricTarget'))}</span>
            <strong>${escapeHtml(target ? targetToText(target) : '—')}</strong>
          </div>
          <div class="metric-box">
            <span class="metric-label">${escapeHtml(L('metricState'))}</span>
            <strong>${escapeHtml(detailText(ev, id))}</strong>
          </div>
        </div>
        ${showCoverage ? `<div class="muted small coverage-note">${escapeHtml(coverageText)}</div>` : ''}
        ${target ? `<div class="progress-track"><div class="progress-bar ${tone(ev)}" style="width:${Math.round((ev.fill || 0) * 100)}%"></div></div>` : ''}
      </article>
    `;
  }).join('');
}

function renderProfileSummary() {
  const p = state.profile;
  DOM.profileSummary.textContent = `${enumLabel(uiLang(), 'sex', p.sex)} · ${p.age} · ${round0(p.heightCm)} cm · ${round1(p.weightKg)} kg · ${enumLabel(uiLang(), 'goal', p.goal)} · ${enumLabel(uiLang(), 'activity', p.activity)} · ${enumLabel(uiLang(), 'physiology', p.physiology)} · ${enumLabel(uiLang(), 'glucose', p.glucoseStatus)}`;
}

function translateTargetNote(target) {
  if (!target?.note) return '—';
  return translateNote(uiLang(), target.note);
}

function renderReference() {
  const proteinText = targetToText(state.calc.targets.protein);
  DOM.referenceSummary.textContent = `EER ${state.calc.eer} kcal · ${L('recommended', { text: targetToText(state.calc.targets.kcal) })} · ${nutrientName('protein')} ${proteinText}`;
  DOM.basisList.innerHTML = state.calc.basisRows.map((row) => {
    const translated = translateBasisRow(uiLang(), row);
    return `<div class="key-row"><span>${escapeHtml(translated.label)}</span><strong>${escapeHtml(translated.value)}</strong></div>`;
  }).join('');
  const notes = state.calc.notes.length ? state.calc.notes : ['已按默认营养逻辑计算。'];
  DOM.notesList.innerHTML = notes.map((note) => `<li>${escapeHtml(translateNote(uiLang(), note))}</li>`).join('');
  DOM.targetsTableBody.innerHTML = Object.entries(state.calc.targets).map(([id, target]) => `
    <tr>
      <td>${escapeHtml(nutrientName(id))}</td>
      <td>${escapeHtml(targetToText(target))}</td>
      <td>${escapeHtml(targetTypeText(target.type))}</td>
      <td>${escapeHtml(translateTargetNote(target))}</td>
    </tr>
  `).join('');
}

function renderDayLog() {
  const log = getDayLog(state.date).items;
  const totals = currentTotals();
  const foodCount = log.filter((item) => item.type === 'food').length;
  DOM.dayCount.textContent = L('dayCount', { count: foodCount });
  DOM.waterCount.textContent = L('waterCount', { amount: metric(totals.water, 'water') });
  if (!log.length) {
    DOM.logList.innerHTML = `<div class="empty-state">${escapeHtml(L('dayEmpty'))}</div>`;
    return;
  }
  DOM.logList.innerHTML = log.map((item, idx) => renderLogCard(item, idx)).join('');
}

function renderLogCard(item, idx) {
  if (item.type === 'water') {
    return `
      <article class="log-card">
        <div class="log-card-head">
          <div>
            <h3 class="log-name">${escapeHtml(L('water'))}</h3>
            <div class="log-source">${escapeHtml(item.label || `${item.amountMl} mL`)}</div>
          </div>
          <button class="ghost-btn danger" type="button" data-remove-log="${idx}">${escapeHtml(L('deleteBtn'))}</button>
        </div>
        <div class="log-metrics"><span>${escapeHtml(item.amountMl)} mL</span></div>
      </article>
    `;
  }
  const displayName = preferredFoodName(item);
  const original = preferredOriginalName(item);
  const originalLine = original && normalizeSearch(original) !== normalizeSearch(displayName) ? `<div class="log-source">${escapeHtml(L('originalNameLabel'))} ${escapeHtml(original)}</div>` : '';
  return `
    <article class="log-card">
      <div class="log-card-head">
        <div>
          <h3 class="log-name">${escapeHtml(displayName)}</h3>
          <div class="log-source">${escapeHtml(item.sourceLabel || item.source || '')} · ${escapeHtml(item.amountText || '—')}</div>
          ${originalLine}
        </div>
        <button class="ghost-btn danger" type="button" data-remove-log="${idx}">${escapeHtml(L('deleteBtn'))}</button>
      </div>
      <div class="log-metrics">
        <span>${escapeHtml(nutrientName('kcal'))} ${escapeHtml(metric(item.nutrients?.kcal || 0, 'kcal'))}</span>
        <span>${escapeHtml(nutrientName('protein'))} ${escapeHtml(metric(item.nutrients?.protein || 0, 'protein'))}</span>
        <span>${escapeHtml(nutrientName('carbs'))} ${escapeHtml(metric(item.nutrients?.carbs || 0, 'carbs'))}</span>
        <span>${escapeHtml(nutrientName('fat'))} ${escapeHtml(metric(item.nutrients?.fat || 0, 'fat'))}</span>
        <span>${escapeHtml(nutrientName('sodium'))} ${escapeHtml(metric(item.nutrients?.sodium || 0, 'sodium'))}</span>
      </div>
    </article>
  `;
}

function renderRecentList() {
  const items = collectRecentItems(8);
  if (!items.length) {
    DOM.recentList.innerHTML = `<div class="empty-state">${escapeHtml(L('recentEmpty'))}</div>`;
    return;
  }
  DOM.recentList.innerHTML = items.map((item, idx) => `
    <button class="recent-item" type="button" data-recent-idx="${idx}">
      <div class="recent-label">
        <div class="recent-name">${escapeHtml(item.type === 'water' ? L('water') : preferredFoodName(item))}</div>
        <div class="recent-sub">${escapeHtml(item.type === 'water' ? `${item.amountMl} mL` : (item.amountText || L('addBtn')))}</div>
      </div>
      <span class="top-pill subtle">+1</span>
    </button>
  `).join('');
  state.recentItems = items;
}

function renderLiveChips() {
  const snapshot = currentSnapshot();
  const gaps = getTopGaps(snapshot, state.calc.targets, 4);
  const risks = getTopRisks(snapshot, state.calc.targets, 4);
  DOM.liveGapChips.innerHTML = gaps.length ? gaps.map((item) => `
    <div class="chip"><strong>${escapeHtml(nutrientName(item.id))}</strong><span>${escapeHtml(L('needMore', { value: metric(item.delta, item.id) }))}</span></div>
  `).join('') : `<div class="empty-state">${escapeHtml(L('emptyGap'))}</div>`;
  DOM.liveRiskChips.innerHTML = risks.length ? risks.map((item) => `
    <div class="chip"><strong>${escapeHtml(nutrientName(item.id))}</strong><span>${escapeHtml(L('tooMuch', { value: metric(item.delta, item.id) }))}</span></div>
  `).join('') : `<div class="empty-state">${escapeHtml(L('emptyRisk'))}</div>`;
}

function renderPanelSummaries() {
  const snapshot = currentSnapshot();
  const totals = snapshot.totals;
  const topGap = getTopGaps(snapshot, state.calc.targets, 1)[0];
  const foodCount = getDayLog(state.date).items.filter((item) => item.type === 'food').length;
  DOM.foodPanelSummary.textContent = topGap
    ? L('panelFoodNeedMore', { name: nutrientName(topGap.id) })
    : L('panelFoodFallback');
  DOM.daySummary.textContent = `${state.date} · ${L('dayCount', { count: foodCount })} · ${L('waterCount', { amount: metric(totals.water, 'water') })}`;
}


async function loadMeta() {
  try {
    const res = await fetch('./data/foods-regions.meta.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.meta = await res.json();
    renderRegionControls();
    renderDatasetMeta();
    if (DOM.foodDataStatus) DOM.foodDataStatus.textContent = L('searchLoading');
  } catch (err) {
    console.error(err);
    DOM.datasetStat.textContent = L('metaError');
    DOM.metaNote.textContent = L('metaErrorHint');
    DOM.datasetCoverage.textContent = L('metaError');
    DOM.datasetAudit.textContent = L('refreshAndRetry');
  }
}

async function loadFoods(force = false) {
  const regionKey = syncActiveFoodBank();
  if (state.foodBanks[regionKey] && !force) {
    state.foods = state.foodBanks[regionKey];
    state.foodMap = state.foodMaps[regionKey] || new Map();
    state.foodsLoaded = true;
    return state.foods;
  }
  if (state.foodPromises[regionKey] && !force) return state.foodPromises[regionKey];

  state.foodsLoading = true;
  if (DOM.foodDataStatus) {
    DOM.foodDataStatus.textContent = force
      ? L('foodLibReloading')
      : `${L('foodLibLoading')} · ${regionName(regionKey)}`;
  }
  state.foodPromises[regionKey] = (async () => {
    try {
      const foods = await fetchFoodsPayload(regionKey);
      const foodMap = new Map();
      for (const food of foods) {
        food._regionKey = key;
        food._norm = normalizedFoodNutrients(food);
        food._servingGram = parseServingSizeGrams(food.s || food.serving || food.q || '') || null;
        food._labels = food.labels || buildFoodLabels(food);
        food._displayName = foodLabelForLang(food, uiLang());
        food._originalName = prefersOriginalAsSubtitle(food, uiLang()) ? (food._labels.original || food.n || '') : '';
        food._metaLine = [food.b, food.g, food.q].filter(Boolean).join(' · ');
        food._search = buildFoodSearchText(food, food._labels);
        food._presentIds = foodKnownNutrientIds(food);
        if (food.c) foodMap.set(food.c, food);
      }
      state.foodBanks[regionKey] = foods;
      state.foodMaps[regionKey] = foodMap;
      syncActiveFoodBank();
      markExploreDirty();
      if (DOM.foodDataStatus) DOM.foodDataStatus.textContent = `${L('searchReady', { count: fmtInt(foods.length) })} · ${regionName(regionKey)}`;
      if (DOM.foodSearchInput?.value.trim()) doSearch(DOM.foodSearchInput.value.trim());
      return foods;
    } catch (err) {
      console.error(err);
      if (DOM.foodDataStatus) DOM.foodDataStatus.textContent = L('foodLibError', { message: err.message });
      return null;
    } finally {
      state.foodsLoading = false;
      state.foodPromises[regionKey] = null;
      if (resolvedFoodRegion() === regionKey) syncActiveFoodBank();
    }
  })();

  return state.foodPromises[regionKey];
}

async function doSearch(query) {
  if (!query) {
    state.lastResults = [];
    if (DOM.searchHint) DOM.searchHint.textContent = `${L('searchIdleHint')} · ${regionName()}`;
    DOM.foodSearchResults.innerHTML = `<div class="empty-state">${escapeHtml(L('searchPlaceholderResult'))}</div>`;
    return;
  }
  const foods = await loadFoods();
  if (!foods) return;
  state.lastResults = searchFoods(query, foods);
  if (DOM.searchHint) DOM.searchHint.textContent = `${L('searchFound', { count: state.lastResults.length })} · ${regionName()}`;
  if (state.lastResults.length) {
    DOM.foodSearchResults.innerHTML = state.lastResults.map((food, idx) => renderSearchItem(food, idx)).join('');
    return;
  }
  const active = resolvedFoodRegion();
  const switchTo = active === 'cn' ? 'global' : 'cn';
  const noResultText = active === 'cn' ? L('searchNoResultsCN') : L('searchNoResultsGlobal');
  const switchLabel = switchTo === 'cn' ? L('switchToChina') : L('switchToGlobal');
  DOM.foodSearchResults.innerHTML = `
    <div class="empty-state search-empty-state">
      <p>${escapeHtml(noResultText)}</p>
      <button class="ghost-btn" type="button" data-region-switch-to="${escapeHtml(switchTo)}">${escapeHtml(switchLabel)}</button>
    </div>`;
}
function renderSearchItem(food, idx) {
  const defaultGram = food._servingGram || 100;
  const displayName = preferredFoodName(food);
  const original = preferredOriginalName(food);
  const originalLine = original ? `<div class="food-origin">${escapeHtml(L('originalNameLabel'))} ${escapeHtml(original)}</div>` : '';
  const isFavorite = isFavoriteFood(food);
  return `
    <article class="food-card">
      <div class="food-card-head">
        <div class="food-title-wrap">
          <h3 class="food-title">${escapeHtml(displayName)}</h3>
          ${originalLine}
          ${foodMetaLine(food) ? `<div class="food-origin">${escapeHtml(foodMetaLine(food))}</div>` : ''}
          ${renderFoodTagRow(food)}
        </div>
        <span class="top-pill subtle">${escapeHtml(food._servingGram ? L('servingApprox', { gram: round0(food._servingGram) }) : L('baseline100g'))}</span>
      </div>
      <div class="food-meta">
        <span>${escapeHtml(L('manualBasis100g'))} ${escapeHtml(metric(food._norm.kcal, 'kcal'))}</span>
        <span>${escapeHtml(nutrientName('protein'))} ${escapeHtml(metric(food._norm.protein, 'protein'))}</span>
        <span>${escapeHtml(nutrientName('carbs'))} ${escapeHtml(metric(food._norm.carbs, 'carbs'))}</span>
        <span>${escapeHtml(nutrientName('fat'))} ${escapeHtml(metric(food._norm.fat, 'fat'))}</span>
        <span>${escapeHtml(nutrientName('sodium'))} ${escapeHtml(metric(food._norm.sodium, 'sodium'))}</span>
      </div>
      <div class="food-actions">
        <input type="number" min="1" max="5000" step="1" value="${defaultGram}" data-grams-input="${idx}">
        <button class="primary-btn" type="button" data-add-food="${idx}">${escapeHtml(L('addByGramsBtn'))}</button>
        ${food._servingGram ? `<button class="ghost-btn" type="button" data-add-serving="${idx}">${escapeHtml(L('addServingBtn'))}</button>` : ''}
        <button class="ghost-btn" type="button" data-toggle-favorite="${idx}">${escapeHtml(isFavorite ? L('unsetFavoriteBtn') : L('setFavoriteBtn'))}</button>
      </div>
      <div class="quick-grams-row">
        <button class="ghost-btn" type="button" data-add-quick="${idx}" data-quick-grams="50">+50 g</button>
        <button class="ghost-btn" type="button" data-add-quick="${idx}" data-quick-grams="100">+100 g</button>
        <button class="ghost-btn" type="button" data-add-quick="${idx}" data-quick-grams="250">+250 g</button>
      </div>
    </article>
  `;
}


function onFoodResultClick(e) {
  const regionBtn = e.target.closest('[data-region-switch-to]');
  const addFoodBtn = e.target.closest('[data-add-food]');
  const addServingBtn = e.target.closest('[data-add-serving]');
  const favoriteBtn = e.target.closest('[data-toggle-favorite]');
  const quickBtn = e.target.closest('[data-add-quick]');
  if (regionBtn) {
    setFoodRegion(regionBtn.dataset.regionSwitchTo || 'auto');
    return;
  }
  if (!addFoodBtn && !addServingBtn && !favoriteBtn && !quickBtn) return;
  const idx = Number(addFoodBtn?.dataset.addFood ?? addServingBtn?.dataset.addServing ?? favoriteBtn?.dataset.toggleFavorite ?? quickBtn?.dataset.addQuick);
  const food = state.lastResults[idx];
  if (!food) return;
  if (favoriteBtn) {
    toggleFavoriteFood(food);
    doSearch(DOM.foodSearchInput.value.trim());
    return;
  }
  if (addServingBtn) {
    addFoodLog(food, food._servingGram || 100, L('dbSource'));
    return;
  }
  if (quickBtn) {
    addFoodLog(food, clamp(Number(quickBtn.dataset.quickGrams) || 100, 1, 5000), L('dbSource'));
    return;
  }
  const input = DOM.foodSearchResults.querySelector(`[data-grams-input="${idx}"]`);
  addFoodLog(food, clamp(Number(input?.value) || 100, 1, 5000), L('dbSource'));
}
function addFoodLog(food, grams, label = L('dbSource')) {
  const amount = clamp(Number(grams) || 0, 1, 5000);
  getDayLog(state.date).items.unshift({
    type: 'food',
    source: food?.source || 'db',
    sourceLabel: label,
    code: food.c || '',
    labels: { ...(food?._labels || food?.labels || buildFoodLabels(food)) },
    name: preferredFoodName(food),
    originalName: food._labels?.original || food._originalName || food.n || '',
    amountText: `${round0(amount)} g`,
    nutrients: scaleNutrients(food._norm, amount),
    knownIds: Array.isArray(food._presentIds) ? [...food._presentIds] : Object.keys(food._norm || {}),
    createdAt: new Date().toISOString(),
  });
  saveLogs();
  markExploreDirty();
  renderAll();
  flashUpdate();
  showToast(preferredFoodName(food));
}

function onFavoriteClick(e) {
  const addBtn = e.target.closest('[data-favorite-add]');
  const removeBtn = e.target.closest('[data-favorite-remove]');
  if (!addBtn && !removeBtn) return;
  const idx = Number(addBtn?.dataset.favoriteAdd ?? removeBtn?.dataset.favoriteRemove);
  const favorite = state.favoriteItems?.[idx];
  if (!favorite) return;
  if (removeBtn) {
    state.favorites = state.favorites.filter((item) => item.key !== favorite.key);
    saveFavorites();
    renderSuggestions();
    if (DOM.foodSearchInput.value.trim()) doSearch(DOM.foodSearchInput.value.trim());
    return;
  }
  addFoodLog(hydrateFavoriteFood(favorite), favorite.servingGram || 100, L('favoriteSource'));
}

function renderSuggestions() {
  const items = state.favorites.slice(0, 8);
  state.favoriteItems = items;
  DOM.favoritesList.innerHTML = items.length ? items.map((item, idx) => {
    const displayName = preferredFoodName(item);
    const original = preferredOriginalName(item);
    return `
      <li>
        <div>
          <strong>${escapeHtml(displayName)}</strong>
          <div class="muted small">${escapeHtml(item.servingGram ? L('favoriteDefaultServing', { gram: round0(item.servingGram) }) : L('favoriteDefault100'))}${original && normalizeSearch(original) !== normalizeSearch(displayName) ? ` · ${escapeHtml(L('originalNameLabel'))} ${escapeHtml(original)}` : ''}</div>
        </div>
        <div class="inline-action-row">
          <button class="ghost-btn" type="button" data-favorite-add="${idx}">${escapeHtml(L('addBtn'))}</button>
          <button class="ghost-btn danger" type="button" data-favorite-remove="${idx}">${escapeHtml(L('removeBtn'))}</button>
        </div>
      </li>
    `;
  }).join('') : `<li class="empty-state">${escapeHtml(L('favoritesEmpty'))}</li>`;
}

function serializeFavoriteFood(food) {
  const labels = food?._labels || food?.labels || buildFoodLabels(food);
  return {
    key: favoriteKeyFromFood(food),
    code: food?.c || '',
    labels: { ...labels },
    name: labels[uiLang()] || food?._displayName || food?.name || food?.n || L('unknownFood'),
    originalName: labels.original || food?._originalName || food?.originalName || food?.n || '',
    servingGram: food?._servingGram || null,
    metaLine: food?._metaLine || '',
    nutrients: { ...(food?._norm || food?.nutrients || {}) },
    presentIds: Array.isArray(food?._presentIds) ? [...food._presentIds] : Object.keys(food?._norm || food?.nutrients || {}),
    source: 'db',
  };
}

function hydrateFavoriteFood(item) {
  const labels = item.labels || buildFoodLabels({ n: item.originalName || item.name || L('unknownFood'), z: item.name || '' });
  return {
    source: item.source || 'db',
    c: item.code || '',
    n: labels.original || item.originalName || item.name || L('unknownFood'),
    _labels: labels,
    _displayName: labels[uiLang()] || item.name || item.originalName || L('unknownFood'),
    _originalName: labels.original || item.originalName || '',
    _servingGram: Number.isFinite(item.servingGram) ? item.servingGram : null,
    _metaLine: item.metaLine || '',
    _norm: { ...(item.nutrients || {}) },
    _presentIds: Array.isArray(item.presentIds) ? [...item.presentIds] : Object.keys(item.nutrients || {}),
  };
}

function renderManualFields() {
  DOM.manualFields.innerHTML = Object.entries(OCR_FIELD_MAP).map(([key, meta]) => `
    <label class="field">
      <span>${escapeHtml(nutrientName(key))} (${escapeHtml(meta.unit)})</span>
      <input type="number" step="0.1" inputmode="decimal" data-manual-field="${key}" placeholder="0">
    </label>
  `).join('');
}

function clearManualForm() {
  DOM.manualName.value = '';
  DOM.manualBasis.value = '100g';
  DOM.manualServingSize.value = '';
  DOM.manualAmount.value = 100;
  DOM.manualServings.value = 1;
  DOM.manualFields.querySelectorAll('[data-manual-field]').forEach((input) => input.value = '');
  DOM.manualStatus.textContent = L('manualCleared');
  DOM.ocrRawText.textContent = L('ocrRawPlaceholder');
  DOM.ocrMetaHint.textContent = L('ocrMetaIdle');
  DOM.scanPreviewName.textContent = uiLang() === 'zh' ? '无' : uiLang() === 'es' ? 'Ninguno' : 'None';
  state.ocrParsed = null;
  state.v24ManualPreviewDirty = false;
  syncManualBasisUi();
  syncRealtimeNutritionV24();
}

function saveManualEntry() {
  const nutrients = {};
  DOM.manualFields.querySelectorAll('[data-manual-field]').forEach((input) => {
    const key = input.dataset.manualField;
    const value = Number(input.value);
    if (Number.isFinite(value) && value >= 0) nutrients[key] = value;
  });
  if (!Object.keys(nutrients).length) {
    DOM.manualStatus.textContent = L('manualNeedField');
    return;
  }
  const name = DOM.manualName.value.trim() || L('manualCustomFood');
  const basis = DOM.manualBasis.value;
  const amount = clamp(Number(DOM.manualAmount.value) || 0, 1, 5000);
  const servings = clamp(Number(DOM.manualServings.value) || 1, 0.1, 50);
  const scaled = {};
  if (basis === 'serving') {
    for (const [key, value] of Object.entries(nutrients)) scaled[key] = value * servings;
  } else {
    const factor = amount / 100;
    for (const [key, value] of Object.entries(nutrients)) scaled[key] = value * factor;
  }
  const labels = buildFoodLabels({ n: name, z: uiLang() === 'zh' ? name : '' });
  getDayLog(state.date).items.unshift({
    type: 'food',
    source: state.ocrParsed ? 'ocr' : 'manual',
    sourceLabel: state.ocrParsed ? L('ocrSource') : L('manualSource'),
    labels,
    name,
    amountText: basis === 'serving' ? `${round1(servings)}×` : `${round0(amount)} ${basis === '100ml' ? 'mL' : 'g'}`,
    nutrients: scaled,
    knownIds: Object.keys(nutrients),
    createdAt: new Date().toISOString(),
  });
  saveLogs();
  markExploreDirty();
  state.v24ManualPreviewDirty = false;
  DOM.manualStatus.textContent = L('manualSaved', { name });
  renderAll();
  flashUpdate();
  showToast(name);
}

function updateOcrPreview() {
  const file = DOM.ocrImageInput.files?.[0];
  if (!file) {
    if (DOM.ocrPreviewImg?.dataset.objectUrl) URL.revokeObjectURL(DOM.ocrPreviewImg.dataset.objectUrl);
    if (DOM.ocrPreviewImg) {
      DOM.ocrPreviewImg.hidden = true;
      DOM.ocrPreviewImg.removeAttribute('src');
      delete DOM.ocrPreviewImg.dataset.objectUrl;
    }
    DOM.ocrStatus.textContent = L('ocrStatusWaitImage');
    return;
  }
  if (DOM.ocrPreviewImg?.dataset.objectUrl) URL.revokeObjectURL(DOM.ocrPreviewImg.dataset.objectUrl);
  const url = URL.createObjectURL(file);
  DOM.ocrPreviewImg.src = url;
  DOM.ocrPreviewImg.hidden = false;
  DOM.ocrPreviewImg.dataset.objectUrl = url;
  DOM.ocrStatus.textContent = L('ocrPreviewReady');
  DOM.ocrMetaHint.textContent = L('ocrPreviewHint');
}

async function runOCR() {
  const file = DOM.ocrImageInput.files?.[0];
  if (!file) {
    DOM.ocrStatus.textContent = L('ocrNeedImage');
    return;
  }
  const mode = DOM.ocrMode?.value || 'smart';
  DOM.ocrStatus.textContent = L('ocrPreparing');
  try {
    const prepared = await prepareRecognitionImage(file, mode);
    const Tesseract = await ensureTesseract();
    const worker = await Tesseract.createWorker(DOM.ocrLang.value || 'eng+chi_sim');
    let bestText = '';
    let bestParsed = null;
    const attempts = prepared === file ? [file] : [prepared, file];
    for (let i = 0; i < attempts.length; i += 1) {
      DOM.ocrStatus.textContent = i === 0 ? L('ocrRunning') : L('ocrRetryOriginal');
      const { data } = await worker.recognize(attempts[i]);
      const text = data?.text || '';
      const parsed = parseNutritionText(text);
      const parsedCount = Object.keys(parsed?.nutrients || {}).length;
      const bestCount = Object.keys(bestParsed?.nutrients || {}).length;
      if (!bestText || parsedCount > bestCount || (!bestParsed && text.length > bestText.length)) {
        bestText = text;
        bestParsed = parsed;
      }
      if (parsedCount >= 4) break;
    }
    await worker.terminate();
    DOM.ocrRawText.textContent = bestText || L('ocrRawPlaceholder');
    state.ocrParsed = bestParsed;
    applyParsedToForm(state.ocrParsed);
    DOM.ocrStatus.textContent = state.ocrParsed
      ? L('ocrParsed', { count: Object.keys(state.ocrParsed.nutrients || {}).length })
      : L('ocrNoFieldMatched');
  } catch (err) {
    console.error(err);
    DOM.ocrStatus.textContent = L('ocrFailed', { message: err.message });
  }
}

async function detectBarcodeFromImage() {
  const file = DOM.ocrImageInput.files?.[0];
  if (!file) {
    DOM.ocrStatus.textContent = L('barcodeNeedImage');
    return;
  }
  await loadFoods();
  DOM.ocrStatus.textContent = L('barcodeDetecting');
  try {
    const prepared = await prepareRecognitionImage(file, DOM.ocrMode?.value || 'smart');
    let code = '';
    let sourceText = '';
    try {
      code = await detectBarcodeNative(prepared) || (prepared === file ? '' : await detectBarcodeNative(file));
      if (code) sourceText = uiLang() === 'zh' ? '（原生）' : uiLang() === 'es' ? ' (nativo)' : ' (native)';
    } catch (err) {
      console.warn(err);
    }
    if (!code) {
      DOM.ocrStatus.textContent = L('barcodeFallback');
      code = await detectBarcodeZXing(prepared).catch(() => '') || (prepared === file ? '' : await detectBarcodeZXing(file).catch(() => ''));
      if (code) sourceText = uiLang() === 'zh' ? '（兼容）' : uiLang() === 'es' ? ' (compatible)' : ' (compat)';
    }
    if (!code) {
      DOM.ocrStatus.textContent = L('barcodeNoResult');
      return;
    }
    DOM.scanPreviewName.textContent = code;
    DOM.foodSearchInput.value = code;
    DOM.ocrStatus.textContent = L('barcodeFound', { code, source: sourceText });
    openPanel('food');
    const results = await doSearch(code);
    const hit = (results || state.lastResults || []).find((item) => String(item?.c || '').trim() === code) || await findFoodByCodeAcrossBanksV22(code);
    DOM.ocrMetaHint.textContent = hit
      ? L('barcodeHit', { name: hit._displayName || preferredFoodName(hit) })
      : `${L('barcodeMiss')}${resolvedFoodRegion() === 'cn' ? ` · ${L('switchToGlobal')}` : ''}`;
  } catch (err) {
    console.error(err);
    DOM.ocrStatus.textContent = L('foodLibError', { message: err.message });
  }
}

function applyParsedToForm(parsed) {
  DOM.manualFields.querySelectorAll('[data-manual-field]').forEach((input) => input.value = '');
  if (!parsed) return;
  DOM.manualName.value = DOM.manualName.value.trim() || L('ocrFoodName');
  DOM.manualBasis.value = parsed.basis;
  if (Number.isFinite(parsed.servingSize)) DOM.manualServingSize.value = parsed.servingSize;
  if (parsed.basis === 'serving') DOM.manualServings.value = 1;
  if (parsed.basis !== 'serving') DOM.manualAmount.value = 100;
  for (const [key, value] of Object.entries(parsed.nutrients || {})) {
    const input = DOM.manualFields.querySelector(`[data-manual-field="${key}"]`);
    if (input) input.value = round1(value);
  }
  state.v24ManualPreviewDirty = true;
  syncManualBasisUi();
  syncRealtimeNutritionV24();
  DOM.ocrMetaHint.textContent = parsed.basis === 'serving'
    ? `${L('manualBasis100g')} / ${L('manualBasisServing')}`
    : (parsed.basis === '100ml' ? L('manualBasis100ml') : L('manualBasis100g'));
}

function clearDay() {
  const log = getDayLog(state.date);
  if (!log.items.length) return;
  if (!window.confirm(L('confirmClearDay', { date: state.date }))) return;
  log.items = [];
  saveLogs();
  markExploreDirty();
  renderAll();
  showToast(state.date);
}

function confidenceLabel(value) {
  if (!Number.isFinite(value)) return L('coverageMid');
  if (value >= 0.75) return L('coverageHigh');
  if (value >= 0.45) return L('coverageMid');
  return L('coverageLow');
}

function summaryMessage(score, topGap, topRisk) {
  if (score >= 88) return L('summaryGreat');
  if (topGap) return L('summaryTopGap', { name: nutrientName(topGap.id) });
  if (topRisk) return L('summaryTopRisk', { name: nutrientName(topRisk.id) });
  if (score >= 72) return L('summaryNear');
  return L('summaryKeep');
}

function targetTypeText(type) {
  return targetTypeLabel(uiLang(), type);
}

function statusText(ev) {
  if (!ev) return '—';
  return statusLabel(uiLang(), ev.status);
}

function detailText(ev, id) {
  if (!ev) return '—';
  if (ev.status === 'low') return L('needMore', { value: metric(ev.delta, id) });
  if (ev.status === 'high') return L('tooMuch', { value: metric(ev.delta, id) });
  if (ev.status === 'warn') return statusText({ status: 'warn' });
  return L('statusWithin');
}

function setPanelState(id, isOpen, persist = true) {
  const panel = document.querySelector(`[data-fold-id="${id}"]`);
  if (!panel) return;
  panel.classList.toggle('collapsed', !isOpen);
  const btn = panel.querySelector(`[data-fold-toggle="${id}"]`);
  if (btn) btn.textContent = isOpen ? L('collapse') : L('expand');
  state.folds[id] = isOpen;
  if (persist) saveFolds();
}

function platformLabel(platform) {
  return platformText(uiLang(), platform);
}

function activityShort(activity) {
  return enumLabel(uiLang(), 'activity', activity);
}


/* ===== v13 extreme search intent / Chinese dining priority upgrade ===== */
const SEARCH_V13_TEXTS = {
  zh: {
    hintIdle: '支持中文意图搜索：减脂早餐 / 高蛋白加餐 / 火锅食材 / 麻辣烫配菜 / 夜宵少负担 / 低钠午餐',
    hintActive: '已启用中文意图理解与中国饮食场景优先排序。',
    deckTitle: '一搜就懂你的吃法',
    deckSubtitle: '不是只匹配字面词，还会理解减脂、早餐、火锅、便利店、麻辣烫、夜宵等场景。',
    summaryIdle: '试试这些：减脂早餐、高蛋白加餐、火锅食材、麻辣烫配菜、夜宵少负担、低钠午餐。',
    summaryPrefix: '已识别',
    summaryRegion: '中国饮食场景优先',
    summaryNone: '当前按关键词匹配，但仍会优先照顾中国饮食语境。',
    chipPrefix: '中文意图',
    matchPrefix: '匹配理由：',
    quickQueries: ['减脂早餐', '高蛋白加餐', '火锅食材', '麻辣烫配菜', '夜宵少负担', '低钠午餐'],
  },
  en: {
    hintIdle: 'Intent search is live: fat-loss breakfast / high-protein snack / hotpot ingredients / lighter late-night foods.',
    hintActive: 'Intent search and China-first dining scenes are active.',
    deckTitle: 'Search by intent, not only keywords',
    deckSubtitle: 'The app now understands fat loss, breakfast, hotpot, convenience-store, late-night and similar food contexts.',
    summaryIdle: 'Try: fat loss breakfast, high protein snack, hotpot ingredients, lighter late-night foods.',
    summaryPrefix: 'Detected',
    summaryRegion: 'China dining priority',
    summaryNone: 'Keyword matching is still on, with China dining context weighted higher.',
    chipPrefix: 'Intent',
    matchPrefix: 'Why it matched: ',
    quickQueries: ['fat loss breakfast', 'high protein snack', 'hotpot ingredients', 'malatang toppings', 'lighter late night snack', 'low sodium lunch'],
  },
  es: {
    hintIdle: 'La búsqueda por intención ya funciona: desayuno para bajar grasa / snack alto en proteína / ingredientes para hotpot / cena ligera.',
    hintActive: 'La búsqueda por intención y la prioridad de escenas chinas ya están activas.',
    deckTitle: 'Busca por intención, no solo por palabras',
    deckSubtitle: 'Ahora entiende contextos como bajar grasa, desayuno, hotpot, tienda, comida nocturna y más.',
    summaryIdle: 'Prueba: desayuno para bajar grasa, snack alto en proteína, ingredientes para hotpot, cena ligera.',
    summaryPrefix: 'Detectado',
    summaryRegion: 'Prioridad de comida china',
    summaryNone: 'La coincidencia por palabras sigue activa, con mayor peso para escenarios de comida china.',
    chipPrefix: 'Intención',
    matchPrefix: 'Razón: ',
    quickQueries: ['desayuno para bajar grasa', 'snack alto en proteína', 'ingredientes para hotpot', 'acompañamientos para malatang', 'cena ligera nocturna', 'almuerzo bajo en sodio'],
  },
};

const SEARCH_V13_INTENT_RULES = [
  { id: 'fatLoss', kind: 'goal', labels: { zh: '减脂', en: 'fat loss', es: 'bajar grasa' }, re: /减脂|控卡|低卡|低热量|轻食|减肥|瘦身|减重|刷脂|fat loss|cut\b|lean cut|low calorie|low cal|bajar grasa|baja caloria|bajar de peso/ },
  { id: 'highProtein', kind: 'goal', labels: { zh: '高蛋白', en: 'high protein', es: 'alta proteína' }, re: /高蛋白|补蛋白|蛋白质|健身|增肌|训练后|练后|protein|high protein|post workout|muscle gain|alto en proteina|alta proteina/ },
  { id: 'lowSodium', kind: 'goal', labels: { zh: '低钠', en: 'low sodium', es: 'bajo sodio' }, re: /低钠|控钠|少盐|清淡|盐少|low sodium|reduced sodium|bajo sodio/ },
  { id: 'satiety', kind: 'goal', labels: { zh: '饱腹', en: 'satiety', es: 'saciedad' }, re: /饱腹|抗饿|耐饿|顶饱|饱得久|satiat|filling|stay full|saciedad|llenador/ },
  { id: 'lowSugar', kind: 'goal', labels: { zh: '低糖', en: 'low sugar', es: 'bajo azúcar' }, re: /低糖|控糖|少糖|无糖|零糖|不升糖|控碳|low sugar|sugar free|no sugar|sin azucar|bajo azucar/ },
  { id: 'lightNight', kind: 'goal', labels: { zh: '夜宵少负担', en: 'lighter late night', es: 'cena ligera nocturna' }, re: /夜宵|宵夜|少负担|轻负担|睡前|晚点吃|late night|light night|midnight snack|late snack|cena ligera|noche ligera/ },
  { id: 'breakfast', kind: 'scene', labels: { zh: '早餐', en: 'breakfast', es: 'desayuno' }, re: /早餐|早饭|晨间|morning|breakfast|desayuno/ },
  { id: 'lunch', kind: 'scene', labels: { zh: '午餐', en: 'lunch', es: 'almuerzo' }, re: /午餐|中饭|午饭|中午|lunch|almuerzo|comida/ },
  { id: 'dinner', kind: 'scene', labels: { zh: '晚餐', en: 'dinner', es: 'cena' }, re: /晚餐|晚饭|dinner|cena/ },
  { id: 'snack', kind: 'scene', labels: { zh: '加餐', en: 'snack', es: 'snack' }, re: /加餐|零食|嘴馋|snack|snacking|tentempie|colacion/ },
  { id: 'convenience', kind: 'scene', labels: { zh: '便利店', en: 'convenience store', es: 'tienda rápida' }, re: /便利店|商超|全家|罗森|7\s*11|711|便当|随手买|konbini|convenience|ready to eat|grab and go|tienda|para llevar/ },
  { id: 'hotpot', kind: 'scene', labels: { zh: '火锅', en: 'hotpot', es: 'hotpot' }, re: /火锅|涮锅|锅底|hotpot|hot pot/ },
  { id: 'malatang', kind: 'scene', labels: { zh: '麻辣烫', en: 'malatang', es: 'malatang' }, re: /麻辣烫|串串|冒菜|malatang|mala tang/ },
  { id: 'soupNoodle', kind: 'scene', labels: { zh: '汤面粉面', en: 'soup noodles', es: 'fideos en sopa' }, re: /汤面|汤粉|米线|拉面|粉面|面汤|soup noodle|ramen|noodle soup|fideos.*sopa/ },
  { id: 'homeCook', kind: 'scene', labels: { zh: '家常下饭', en: 'home-style with rice', es: 'casero para comer con arroz' }, re: /下饭|家常|配饭|拌饭|盖饭|家里吃|home style|with rice|casero|para arroz/ },
];

const SEARCH_V13_PROFILE_RULES = {
  breakfast: /燕麦|麦片|鸡蛋|蛋饼|牛奶|酸奶|豆奶|豆浆|吐司|面包|三明治|饭团|粥|包子|馒头|玉米|oat|cereal|egg|milk|yogurt|toast|bread|sandwich|porridge|soy milk|desayuno/,
  lunch: /便当|盒饭|套餐|盖饭|米饭|鸡肉饭|牛肉饭|炒饭|面条|米线|沙拉|rice bowl|meal|lunch|almuerzo|set meal|bento/,
  dinner: /米饭|面条|汤|豆腐|肉片|牛肉|鸡肉|鱼|饺子|馄饨|煲|炖|炒|rice|noodle|soup|tofu|fish|dumpling|dinner|cena/,
  snack: /坚果|酸奶|奶酪|水果|蛋白棒|能量棒|棒|代餐|奶昔|布丁|nuts|yogurt|cheese|fruit|bar|shake|pudding|snack/,
  lightNight: /酸奶|牛奶|豆腐|水果|燕麦|粥|汤|蒸蛋|优格|牛乳|yogurt|milk|tofu|fruit|oat|porridge|soup|egg custard/,
  convenience: /三明治|饭团|便当|卷饼|即食|即饮|代餐|能量棒|蛋白棒|酸奶|牛奶|咖啡|冷萃|ready|cup|wrap|bar|sandwich|onigiri|bento|instant|grab and go|drink/,
  hotpot: /火锅|锅底|肥牛|肥羊|羊肉片|牛肉片|虾滑|丸子|鱼丸|鸭血|午餐肉|海带|海带结|豆腐|豆皮|腐竹|金针菇|蘑菇|土豆片|藕片|宽粉|粉丝|魔芋|毛肚|黄喉|贡菜|fish ball|hotpot|beef slice|lamb slice|tofu|seaweed|mushroom|vermicelli/,
  malatang: /麻辣烫|冒菜|串串|鸭血|午餐肉|海带|豆皮|腐竹|金针菇|木耳|藕片|土豆片|鹌鹑蛋|鱼豆腐|牛肉片|丸子|宽粉|粉丝|魔芋|虾滑|麻辣|spicy soup|malatang|mala/,
  soupNoodle: /汤面|拉面|米线|面条|粉丝|面|粥|馄饨|soup noodle|ramen|noodle|vermicelli|porridge|wonton soup/,
  homeCook: /下饭|家常|炒饭|炒面|盖饭|拌饭|炖|烧|焖|煮|卤|炒|番茄|豆腐|鸡蛋|鱼香|宫保|家常菜|with rice|home style|stir fry|braised/,
  chineseDining: /米饭|粥|面|粉|饺|包|馄饨|烧卖|豆腐|腐竹|海带|金针菇|木耳|午餐肉|鸭血|牛肉片|羊肉片|青菜|黄喉|宽粉|魔芋|土豆片|丸子|虾滑|鱼豆腐|炒|炖|煮|汤|辣|卤|火锅|麻辣烫|米线|拉面|饭团|包子|馒头|盖饭|便当/,
  proteinSource: /鸡胸|鸡肉|鸡蛋|蛋白|虾|鱼|三文鱼|金枪鱼|牛肉|牛排|火鸡|酸奶|希腊酸奶|豆腐|豆干|豆浆|牛奶|奶酪|乳清|蛋白棒|protein|chicken|egg|shrimp|fish|salmon|tuna|beef|yogurt|greek yogurt|tofu|whey|protein bar/,
  lowSugarText: /无糖|零糖|低糖|sugar free|no sugar|low sugar|sin azucar|bajo azucar/,
  lowSodiumText: /低钠|少盐|无盐|原味|low sodium|reduced sodium|bajo sodio|sin sal/,
  satietyText: /燕麦|全麦|玉米|土豆|红薯|南瓜|豆类|糙米|藜麦|全谷|高纤|fiber|whole grain|oat|bean|potato|sweet potato|pumpkin|quinoa/,
  lightText: /轻食|沙拉|原味酸奶|魔芋|蒟蒻|海带|番茄|黄瓜|蔬菜|鸡胸|沙拉鸡|light|salad|konjac|seaweed|vegetable|cucumber|tomato/,
  highSodiumHeavy: /泡面|方便面|辣条|薯片|炸鸡|香肠|腊肠|咸菜|酱菜|火腿|培根|instant noodle|chips|fried chicken|sausage|bacon|pickle/,
};

function searchV13Lang() {
  return SEARCH_V13_TEXTS[uiLang()] ? uiLang() : 'zh';
}

function searchV13Text(key) {
  return SEARCH_V13_TEXTS[searchV13Lang()][key] || SEARCH_V13_TEXTS.zh[key] || '';
}

function intentRuleLabel(id) {
  const rule = SEARCH_V13_INTENT_RULES.find((item) => item.id === id);
  return rule?.labels?.[searchV13Lang()] || rule?.labels?.zh || id;
}

function scoreLiteralFoodMatch(query, food) {
  const q = normalizeSearch(query);
  const isCode = /^\d{6,14}$/.test(q);
  const tokens = q.split(/\s+/).filter(Boolean);
  if (!tokens.length) return { include: false, score: 0, matched: 0 };
  let score = 0;
  let matched = 0;
  if (isCode) {
    if (food.c === q) score += 100;
    else if ((food.c || '').startsWith(q)) score += 60;
    else return { include: false, score: 0, matched: 0 };
    return { include: true, score, matched: 1 };
  }
  const hay = food._search;
  if (hay.includes(q)) score += 26;
  for (const token of tokens) {
    if (hay.includes(token)) {
      matched += 1;
      if (normalizeSearch(food._displayName).startsWith(token)) score += 12;
      else if (normalizeSearch(food._displayName).includes(token)) score += 8;
      else score += 4;
    }
  }
  if (matched < tokens.length) return { include: false, score: 0, matched };
  if (tokens.length === 1 && ['虾', 'shrimp', 'prawn', 'prawns', 'crevette', 'crevettes', 'gamba', 'gambas'].includes(q)) {
    const display = String(food._displayName || '');
    const originalText = normalizeSearch([food.n || '', food.g || ''].join(' '));
    if (/(shrimp|prawn|crevette|gamba|gambas|crustac|seafood|homard|lobster)/.test(originalText)) score += 10;
    if (/虾$|大虾$|对虾$|龙虾$|红虾$/.test(display)) score += 14;
    if (/野生|阿根廷|大西洋|太平洋|去壳|带壳|冷冻|特大|粉红/.test(display)) score += 8;
    if (/虾味|方便面|面虾|虾片|虾饺|春卷|沙拉|汤|酱|饭/.test(display) || /(noodle|nouille|soup|salad|wrap|cracker|chip|dumpling|nems|cocktail|pate|pâté|riz|rice|sauce)/.test(originalText)) score -= 10;
  }
  return { include: true, score, matched };
}

function buildFoodIntentProfile(food) {
  if (food._intentProfile) return food._intentProfile;
  const labels = labelsForFood(food);
  const text = normalizeSearch([
    labels?.zh || '',
    labels?.en || '',
    labels?.es || '',
    labels?.original || '',
    food.n || '',
    food.b || '',
    food.g || '',
    food.q || '',
    food.s || '',
    food._metaLine || '',
    foodHintTags(food, 'zh').join(' '),
    foodHintTags(food, 'en').join(' '),
    foodHintTags(food, 'es').join(' '),
  ].join(' '));
  const norm = food._norm || normalizedFoodNutrients(food);
  const sceneTags = [];
  const goalTags = [];
  const tags = [];
  const pushTag = (bucket, value) => { if (value && !bucket.includes(value)) bucket.push(value); };

  Object.entries({
    breakfast: SEARCH_V13_PROFILE_RULES.breakfast,
    lunch: SEARCH_V13_PROFILE_RULES.lunch,
    dinner: SEARCH_V13_PROFILE_RULES.dinner,
    snack: SEARCH_V13_PROFILE_RULES.snack,
    lightNight: SEARCH_V13_PROFILE_RULES.lightNight,
    convenience: SEARCH_V13_PROFILE_RULES.convenience,
    hotpot: SEARCH_V13_PROFILE_RULES.hotpot,
    malatang: SEARCH_V13_PROFILE_RULES.malatang,
    soupNoodle: SEARCH_V13_PROFILE_RULES.soupNoodle,
    homeCook: SEARCH_V13_PROFILE_RULES.homeCook,
  }).forEach(([id, re]) => {
    if (re.test(text)) pushTag(sceneTags, id);
  });

  if (SEARCH_V13_PROFILE_RULES.chineseDining.test(text)) pushTag(tags, 'chineseDining');
  if (SEARCH_V13_PROFILE_RULES.proteinSource.test(text)) pushTag(tags, 'proteinSource');
  if (SEARCH_V13_PROFILE_RULES.lowSugarText.test(text)) pushTag(tags, 'lowSugarText');
  if (SEARCH_V13_PROFILE_RULES.lowSodiumText.test(text)) pushTag(tags, 'lowSodiumText');
  if (SEARCH_V13_PROFILE_RULES.satietyText.test(text)) pushTag(tags, 'satietyText');
  if (SEARCH_V13_PROFILE_RULES.lightText.test(text)) pushTag(tags, 'lightText');
  if (SEARCH_V13_PROFILE_RULES.highSodiumHeavy.test(text)) pushTag(tags, 'heavySalty');

  if (norm.protein >= 18 || (norm.protein >= 12 && norm.kcal <= 220) || tags.includes('proteinSource')) pushTag(goalTags, 'highProtein');
  if ((norm.kcal > 0 && norm.kcal <= 140 && norm.fat <= 8) || tags.includes('lightText')) pushTag(goalTags, 'fatLoss');
  if (norm.sodium > 0 && norm.sodium <= 220 || tags.includes('lowSodiumText')) pushTag(goalTags, 'lowSodium');
  if ((norm.fiber >= 4) || (norm.protein >= 10 && norm.kcal <= 240) || tags.includes('satietyText')) pushTag(goalTags, 'satiety');
  if ((norm.carbs > 0 && norm.carbs <= 12 && norm.kcal <= 180) || tags.includes('lowSugarText')) pushTag(goalTags, 'lowSugar');
  if ((norm.kcal > 0 && norm.kcal <= 170 && norm.fat <= 9 && norm.sodium <= 420) || sceneTags.includes('lightNight')) pushTag(goalTags, 'lightNight');

  const profile = {
    text,
    norm,
    sceneTags,
    goalTags,
    tags,
    chineseWeight: tags.includes('chineseDining') ? 1 : 0,
    convenienceWeight: sceneTags.includes('convenience') ? 1 : 0,
  };
  food._intentProfile = profile;
  return profile;
}

function dedupe(list) {
  return [...new Set((list || []).filter(Boolean))];
}

function analyzeFoodIntentQuery(query) {
  const normalized = normalizeSearch(query);
  const result = {
    raw: String(query || '').trim(),
    normalized,
    goals: [],
    scenes: [],
    stripped: normalized,
    plain: normalized,
    tokens: [],
    active: false,
    labels: [],
    chinaPriority: uiLang() === 'zh' || /[\u4e00-\u9fff]/.test(String(query || '')),
  };
  if (!normalized) return result;
  let stripped = ` ${normalized} `;
  SEARCH_V13_INTENT_RULES.forEach((rule) => {
    if (rule.re.test(normalized)) {
      if (rule.kind === 'goal') result.goals.push(rule.id);
      if (rule.kind === 'scene') result.scenes.push(rule.id);
      stripped = stripped.replace(new RegExp(rule.re.source, 'g'), ' ');
    }
  });
  result.goals = dedupe(result.goals);
  result.scenes = dedupe(result.scenes);
  result.active = result.goals.length > 0 || result.scenes.length > 0;
  result.stripped = normalizeSearch(stripped);
  result.plain = result.stripped;
  result.tokens = result.plain ? result.plain.split(/\s+/).filter(Boolean) : [];
  result.labels = [...result.goals, ...result.scenes].map((id) => intentRuleLabel(id));
  if (result.scenes.some((id) => ['hotpot', 'malatang', 'homeCook', 'soupNoodle', 'breakfast', 'lunch', 'dinner'].includes(id))) {
    result.chinaPriority = true;
  }
  return result;
}

function sceneScoreForFood(intent, profile) {
  let score = 0;
  const reasons = [];
  const add = (value, label) => {
    if (value > 0) score += value;
    if (label) reasons.push(label);
  };
  intent.scenes.forEach((scene) => {
    if (profile.sceneTags.includes(scene)) {
      add(scene === 'hotpot' || scene === 'malatang' ? 34 : 22, intentRuleLabel(scene));
      return;
    }
    if (scene === 'hotpot' && profile.tags.includes('chineseDining') && /(豆腐|蘑菇|海带|腐竹|午餐肉|牛肉片|丸)/.test(profile.text)) add(14, intentRuleLabel(scene));
    if (scene === 'malatang' && profile.tags.includes('chineseDining') && /(鸭血|海带|豆皮|宽粉|魔芋|牛肉片|丸)/.test(profile.text)) add(14, intentRuleLabel(scene));
    if (scene === 'breakfast' && (profile.sceneTags.includes('snack') || /燕麦|酸奶|鸡蛋|面包|粥|饭团/.test(profile.text))) add(10, intentRuleLabel(scene));
    if (scene === 'lunch' && /(米饭|便当|面|鸡肉|牛肉|沙拉|套餐)/.test(profile.text)) add(10, intentRuleLabel(scene));
    if (scene === 'dinner' && /(米饭|面|汤|豆腐|鱼|鸡肉|饺子)/.test(profile.text)) add(10, intentRuleLabel(scene));
    if (scene === 'snack' && (profile.sceneTags.includes('breakfast') || /酸奶|坚果|水果|棒|奶酪|布丁/.test(profile.text))) add(10, intentRuleLabel(scene));
    if (scene === 'convenience' && /(三明治|饭团|便当|卷饼|咖啡|酸奶|即食|bar|sandwich|wrap|bento|onigiri)/.test(profile.text)) add(16, intentRuleLabel(scene));
    if (scene === 'soupNoodle' && /(面|粉|米线|汤|粥|ramen|noodle)/.test(profile.text)) add(18, intentRuleLabel(scene));
    if (scene === 'homeCook' && /(下饭|家常|豆腐|番茄|炒|炖|盖饭|拌饭)/.test(profile.text)) add(16, intentRuleLabel(scene));
  });
  return { score, reasons: dedupe(reasons) };
}

function goalScoreForFood(intent, profile) {
  let score = 0;
  const reasons = [];
  const add = (value, label) => {
    if (value > 0) score += value;
    if (label) reasons.push(label);
  };
  intent.goals.forEach((goal) => {
    if (profile.goalTags.includes(goal)) add(18, intentRuleLabel(goal));
    if (goal === 'highProtein') {
      if (profile.norm.protein >= 24) add(16, intentRuleLabel(goal));
      else if (profile.norm.protein >= 16) add(12, intentRuleLabel(goal));
      else if (profile.norm.protein >= 10) add(8, intentRuleLabel(goal));
      if (profile.tags.includes('proteinSource')) add(6, intentRuleLabel(goal));
    }
    if (goal === 'fatLoss') {
      if (profile.norm.kcal > 0 && profile.norm.kcal <= 120) add(14, intentRuleLabel(goal));
      else if (profile.norm.kcal <= 180) add(9, intentRuleLabel(goal));
      if (profile.norm.fat <= 7) add(4, intentRuleLabel(goal));
      if (profile.tags.includes('lightText')) add(6, intentRuleLabel(goal));
    }
    if (goal === 'lowSodium') {
      if (profile.norm.sodium > 0 && profile.norm.sodium <= 120) add(16, intentRuleLabel(goal));
      else if (profile.norm.sodium <= 260) add(10, intentRuleLabel(goal));
      if (profile.tags.includes('lowSodiumText')) add(8, intentRuleLabel(goal));
      if (profile.tags.includes('heavySalty')) score -= 16;
    }
    if (goal === 'satiety') {
      if (profile.norm.fiber >= 5) add(12, intentRuleLabel(goal));
      if (profile.norm.protein >= 10) add(8, intentRuleLabel(goal));
      if (profile.tags.includes('satietyText')) add(6, intentRuleLabel(goal));
    }
    if (goal === 'lowSugar') {
      if (profile.tags.includes('lowSugarText')) add(14, intentRuleLabel(goal));
      else if (profile.norm.carbs > 0 && profile.norm.carbs <= 12) add(10, intentRuleLabel(goal));
      if (profile.norm.kcal > 0 && profile.norm.kcal <= 180) add(4, intentRuleLabel(goal));
    }
    if (goal === 'lightNight') {
      if (profile.norm.kcal > 0 && profile.norm.kcal <= 160) add(10, intentRuleLabel(goal));
      if (profile.norm.fat <= 8) add(4, intentRuleLabel(goal));
      if (profile.norm.sodium > 550 || profile.tags.includes('heavySalty')) score -= 12;
      if (profile.sceneTags.includes('lightNight') || /酸奶|牛奶|豆腐|粥|水果|汤/.test(profile.text)) add(10, intentRuleLabel(goal));
    }
  });
  return { score, reasons: dedupe(reasons) };
}

function regionBiasScore(intent, profile) {
  let score = 0;
  const reasons = [];
  const wantsChina = intent.chinaPriority || resolvedFoodRegion() === 'cn';
  if (wantsChina && profile.tags.includes('chineseDining')) {
    score += resolvedFoodRegion() === 'cn' ? 12 : 8;
    reasons.push(searchV13Text('summaryRegion'));
  }
  if (intent.scenes.includes('hotpot') || intent.scenes.includes('malatang')) {
    if (profile.tags.includes('chineseDining')) score += 10;
  }
  return { score, reasons: dedupe(reasons) };
}

function setFoodMatchReason(food, reasons) {
  food._matchReason = dedupe(reasons).slice(0, 4).join(' / ');
}

function searchFoodsV13(query, foods) {
  const q = String(query || '').trim();
  const normalized = normalizeSearch(q);
  const intent = analyzeFoodIntentQuery(q);
  state.lastSearchIntent = normalized ? intent : null;
  const plainQuery = intent.active ? intent.plain : normalized;
  const isCode = /^\d{6,14}$/.test(normalized);
  const hits = [];
  if (!normalized) return [];
  for (const food of foods) {
    const profile = buildFoodIntentProfile(food);
    const literal = scoreLiteralFoodMatch(plainQuery || normalized, food);
    const scene = intent.active ? sceneScoreForFood(intent, profile) : { score: 0, reasons: [] };
    const goal = intent.active ? goalScoreForFood(intent, profile) : { score: 0, reasons: [] };
    const region = intent.active ? regionBiasScore(intent, profile) : { score: 0, reasons: [] };
    let score = literal.score + scene.score + goal.score + region.score;

    if (isCode) {
      if (!literal.include) continue;
    } else if (intent.active) {
      if (plainQuery) {
        if (!literal.include && score < 24) continue;
      } else if (scene.score + goal.score + region.score <= 0) {
        continue;
      }
    } else if (!literal.include) {
      continue;
    }

    score += food._norm.protein > 10 ? 1 : 0;
    score -= food._norm.sodium > 1000 ? 2 : 0;
    if (intent.active && intent.scenes.includes('hotpot') && /(丸|肥牛|羊肉片|虾滑|豆腐|腐竹|海带|金针菇|宽粉)/.test(profile.text)) score += 8;
    if (intent.active && intent.scenes.includes('malatang') && /(鸭血|魔芋|海带|豆皮|木耳|藕片|宽粉|丸|牛肉片)/.test(profile.text)) score += 8;
    if (intent.active && intent.scenes.includes('breakfast') && /(燕麦|鸡蛋|酸奶|吐司|面包|粥|饭团)/.test(profile.text)) score += 4;
    if (intent.active && intent.goals.includes('highProtein') && food._norm.protein >= 15) score += 6;
    if (intent.active && intent.goals.includes('lowSodium') && food._norm.sodium > 600) score -= 10;
    setFoodMatchReason(food, [...scene.reasons, ...goal.reasons, ...region.reasons]);
    hits.push({ food, score });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 24).map((hit) => hit.food);
}

function ensureIntentSearchUi() {
  const card = DOM.foodSearchInput?.closest('.sub-card');
  if (!card) return null;
  let wrap = document.getElementById('intentSearchWrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'intentSearchWrap';
    wrap.className = 'intent-search-wrap';
    wrap.innerHTML = `
      <div class="intent-query-head">
        <div>
          <div class="mini-title" id="intentQueryTitle"></div>
          <div class="muted small" id="intentQuerySub"></div>
        </div>
      </div>
      <div class="intent-query-deck" id="intentQueryDeck"></div>
      <div class="search-intent-summary" id="searchIntentSummary"></div>
    `;
    const metaRow = card.querySelector('.search-meta-row');
    if (metaRow) metaRow.insertAdjacentElement('afterend', wrap);
    else card.appendChild(wrap);
    wrap.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-intent-query]');
      if (!btn) return;
      const value = btn.dataset.intentQuery || '';
      if (!value) return;
      DOM.foodSearchInput.value = value;
      state.lastSearchIntent = analyzeFoodIntentQuery(value);
      syncIntentSearchUi();
      doSearch(value);
      DOM.foodSearchInput.focus();
    });
  }
  return {
    wrap,
    deck: document.getElementById('intentQueryDeck'),
    title: document.getElementById('intentQueryTitle'),
    sub: document.getElementById('intentQuerySub'),
    summary: document.getElementById('searchIntentSummary'),
  };
}

function renderIntentQueryDeck() {
  const ui = ensureIntentSearchUi();
  if (!ui) return;
  ui.title.textContent = searchV13Text('deckTitle');
  ui.sub.textContent = searchV13Text('deckSubtitle');
  const activeQuery = String(DOM.foodSearchInput?.value || '').trim();
  ui.deck.innerHTML = searchV13Text('quickQueries').map((query) => `
    <button class="intent-chip${activeQuery === query ? ' is-active' : ''}" type="button" data-intent-query="${escapeHtml(query)}">${escapeHtml(query)}</button>
  `).join('');
}

function formatIntentSummary(intent) {
  if (!intent?.active) return searchV13Text('summaryNone');
  const labels = intent.labels.length ? intent.labels.join(' / ') : searchV13Text('summaryNone');
  const chinaLine = intent.chinaPriority ? ` · ${searchV13Text('summaryRegion')}` : '';
  return `${searchV13Text('summaryPrefix')}：${labels}${chinaLine}`;
}

function syncIntentSearchUi() {
  const ui = ensureIntentSearchUi();
  if (!ui) return;
  renderIntentQueryDeck();
  const raw = String(DOM.foodSearchInput?.value || '').trim();
  const intent = raw ? analyzeFoodIntentQuery(raw) : null;
  state.lastSearchIntent = raw ? intent : null;
  ui.summary.textContent = raw ? formatIntentSummary(intent) : searchV13Text('summaryIdle');
  ui.summary.classList.toggle('is-active', Boolean(intent?.active));
}

const legacySearchFoodsV13 = searchFoods;
const legacyDoSearchV13 = doSearch;
const legacyRenderSearchItemV13 = renderSearchItem;
const legacyRenderAllV13 = renderAll;
const legacyApplyLanguageV13 = applyLanguage;
state.lastSearchIntent = state.lastSearchIntent || null;

searchFoods = function searchFoods(query, foods) {
  return searchFoodsV13(query, foods);
};

doSearch = async function doSearch(query) {
  const raw = String(query || '').trim();
  state.lastSearchIntent = raw ? analyzeFoodIntentQuery(raw) : null;
  syncIntentSearchUi();
  if (!raw) {
    state.lastResults = [];
    if (DOM.searchHint) DOM.searchHint.textContent = `${searchV13Text('hintIdle')} · ${regionName()}`;
    DOM.foodSearchResults.innerHTML = `<div class="empty-state">${escapeHtml(L('searchPlaceholderResult'))}</div>`;
    return;
  }
  const foods = await loadFoods();
  if (!foods) return;
  state.lastResults = searchFoods(raw, foods);
  if (DOM.searchHint) {
    const prefix = state.lastSearchIntent?.active ? searchV13Text('hintActive') : searchV13Text('hintIdle');
    DOM.searchHint.textContent = `${prefix} · ${L('searchFound', { count: state.lastResults.length })} · ${regionName()}`;
  }
  if (state.lastResults.length) {
    DOM.foodSearchResults.innerHTML = state.lastResults.map((food, idx) => renderSearchItem(food, idx)).join('');
    syncIntentSearchUi();
    return;
  }
  const active = resolvedFoodRegion();
  const switchTo = active === 'cn' ? 'global' : 'cn';
  const noResultText = active === 'cn' ? L('searchNoResultsCN') : L('searchNoResultsGlobal');
  const switchLabel = switchTo === 'cn' ? L('switchToChina') : L('switchToGlobal');
  DOM.foodSearchResults.innerHTML = `
    <div class="empty-state search-empty-state">
      <p>${escapeHtml(noResultText)}</p>
      <button class="ghost-btn" type="button" data-region-switch-to="${escapeHtml(switchTo)}">${escapeHtml(switchLabel)}</button>
    </div>`;
  syncIntentSearchUi();
};

renderSearchItem = function renderSearchItem(food, idx) {
  const defaultGram = food._servingGram || 100;
  const displayName = preferredFoodName(food);
  const original = preferredOriginalName(food);
  const originalLine = original ? `<div class="food-origin">${escapeHtml(L('originalNameLabel'))} ${escapeHtml(original)}</div>` : '';
  const isFavorite = isFavoriteFood(food);
  const reasonLine = food._matchReason
    ? `<div class="food-match-reason">${escapeHtml(searchV13Text('matchPrefix'))}${escapeHtml(food._matchReason)}</div>`
    : '';
  return `
    <article class="food-card">
      <div class="food-card-head">
        <div class="food-title-wrap">
          <h3 class="food-title">${escapeHtml(displayName)}</h3>
          ${originalLine}
          ${reasonLine}
          ${foodMetaLine(food) ? `<div class="food-origin">${escapeHtml(foodMetaLine(food))}</div>` : ''}
          ${renderFoodTagRow(food)}
        </div>
        <span class="top-pill subtle">${escapeHtml(food._servingGram ? L('servingApprox', { gram: round0(food._servingGram) }) : L('baseline100g'))}</span>
      </div>
      <div class="food-meta food-meta--stacked">
        <span>${escapeHtml(L('manualBasis100g'))} ${escapeHtml(metric(food._norm.kcal, 'kcal'))}</span>
        <span>${escapeHtml(nutrientName('protein'))} ${escapeHtml(metric(food._norm.protein, 'protein'))}</span>
        <span>${escapeHtml(nutrientName('carbs'))} ${escapeHtml(metric(food._norm.carbs, 'carbs'))}</span>
        <span>${escapeHtml(nutrientName('fat'))} ${escapeHtml(metric(food._norm.fat, 'fat'))}</span>
        <span>${escapeHtml(nutrientName('sodium'))} ${escapeHtml(metric(food._norm.sodium, 'sodium'))}</span>
      </div>
      <div class="food-actions">
        <input type="number" min="1" max="5000" step="1" value="${defaultGram}" data-grams-input="${idx}">
        <button class="primary-btn" type="button" data-add-food="${idx}">${escapeHtml(L('addByGramsBtn'))}</button>
        ${food._servingGram ? `<button class="ghost-btn" type="button" data-add-serving="${idx}">${escapeHtml(L('addServingBtn'))}</button>` : ''}
        <button class="ghost-btn" type="button" data-toggle-favorite="${idx}">${escapeHtml(isFavorite ? L('unsetFavoriteBtn') : L('setFavoriteBtn'))}</button>
      </div>
      <div class="quick-grams-row">
        <button class="ghost-btn" type="button" data-add-quick="${idx}" data-quick-grams="50">+50 g</button>
        <button class="ghost-btn" type="button" data-add-quick="${idx}" data-quick-grams="100">+100 g</button>
        <button class="ghost-btn" type="button" data-add-quick="${idx}" data-quick-grams="250">+250 g</button>
      </div>
    </article>
  `;
};

applyLanguage = function applyLanguage() {
  legacyApplyLanguageV13();
  renderIntentQueryDeck();
  syncIntentSearchUi();
};

renderAll = function renderAll() {
  legacyRenderAllV13();
  renderIntentQueryDeck();
  syncIntentSearchUi();
};

window.addEventListener('DOMContentLoaded', () => {
  renderIntentQueryDeck();
  syncIntentSearchUi();
  if (DOM.searchHint && !String(DOM.foodSearchInput?.value || '').trim()) {
    DOM.searchHint.textContent = `${searchV13Text('hintIdle')} · ${regionName()}`;
  }
});

/* ===== v15 folded flagship home / onboarding / combo lab / translation precision ===== */
Object.assign(TEXTS.zh, {
  moduleHubKicker: '折叠模块',
  moduleHubTitle: '把次要界面优雅收起来',
  moduleHubHint: '主界面只保留身体模型、身体参数入口、每日饮食输入与营养进度。',
  moduleBodyTitle: '身体围度编辑',
  moduleSoundTitle: '背景音乐',
  moduleCaptureTitle: '拍照 / 扫码',
  moduleComboTitle: '组合餐设计',
  moduleTodayTitle: '每日记录',
  moduleDataTitle: '食品库说明',
  moduleBodyEmpty: '先补身高、体重和围度',
  moduleBodyReady: '最近记录：{text}',
  moduleBodyHot: '点开继续改身体围度',
  moduleSoundEmpty: '先选一个节奏',
  moduleSoundReady: '当前节奏：{text}',
  moduleCaptureIdle: '营养表 OCR 与条码识别',
  moduleComboEmpty: '例如汉堡组合、早餐组合',
  moduleComboReady: '已存 {count} 个组合',
  moduleTodayReady: '今天已记 {food} 条食品 · 饮水 {water}',
  moduleDataReady: '当前食品库：{text}',
  comboKicker: '组合餐',
  comboTitle: '把常吃搭配存成一个组合',
  comboDraftKicker: '组合草稿',
  comboDraftTitle: '把搜索到的食物装进一个套餐',
  comboLibraryKicker: '组合库',
  comboLibraryTitle: '一键复用你喜欢的搭配',
  comboNameLabel: '组合名称',
  comboNamePlaceholder: '例如：汉堡快乐套餐 / 高蛋白早餐 / 火锅固定搭配',
  comboNoteLabel: '组合备注',
  comboNotePlaceholder: '例如：汉堡 + 薯条 + 可乐 / 鸡胸 + 玉米 + 酸奶',
  comboSaveBtn: '保存这个组合',
  comboClearBtn: '清空组合草稿',
  comboAddBtn: '加入组合',
  comboUseBtn: '整套加入今天',
  comboDeleteBtn: '删除组合',
  comboRemoveItemBtn: '移出',
  comboDraftEmpty: '先在食品搜索结果里点“加入组合”，就能开始拼套餐。',
  comboSaved: '组合已保存：{name}',
  comboNeedName: '先给组合起个名字。',
  comboNeedItem: '组合里至少要有 1 个食物。',
  comboCleared: '组合草稿已清空。',
  comboAddedToDraft: '已加入组合草稿：{name}',
  comboUsed: '已把组合加入今天：{name}',
  comboDeleted: '已删除组合：{name}',
  comboItemsCount: '{count} 项',
  comboSource: '组合 · {name}',
  onboardingSkipBtn: '先跳过',
  onboardingPrevBtn: '上一步',
  onboardingNextBtn: '下一步',
  onboardingDoneBtn: '完成并收起模块',
  onboardingSoundKicker: '第一步 · 音乐',
  onboardingSoundTitle: '先选一个背景节奏',
  onboardingSoundText: '选好音乐后，音乐界面就缩回一个按钮。你随时还能再点开细调。',
  onboardingSoundStart: '直接开始播放',
  onboardingProfileKicker: '第二步 · 身体基线',
  onboardingProfileTitle: '先填身高、体重这些关键身体参数',
  onboardingProfileText: '这一步主要是给营养建议和身体模型打底。填完就把编辑界面收起来，首页只留最重要的主视觉。',
  onboardingBodyKicker: '第三步 · 3D 模型',
  onboardingBodyTitle: '3D 模型会放在首页最显眼的位置',
  onboardingBodyText: '后面每次记身体围度，模型都会对比上一次变化；围度编辑则收在按钮里，需要时再点开。',
  onboardingFoodKicker: '第四步 · 每日饮食',
  onboardingFoodTitle: '每日饮食输入是首页第二主舞台',
  onboardingFoodText: '搜索食物、快速加水、看营养进度都放在主界面。历史记录会收成按钮，需要时再展开。',
  onboardingCaptureKicker: '第五步 · 拍照识别',
  onboardingCaptureTitle: '营养表拍照与扫码默认收成按钮',
  onboardingCaptureText: '做饭或看包装时再点开就行，平时不会占住首页。',
  onboardingComboKicker: '第六步 · 组合餐',
  onboardingComboTitle: '把你喜欢的搭配存成一个组合',
  onboardingComboText: '比如汉堡套餐、火锅固定搭配、高蛋白早餐，都可以一键加入今天。',
  onboardingStep: '第 {index} / {count} 步',
  buttonMeaning: '按钮都必须说人话，不再只靠颜色表达。',
  buttonOpenModule: '点开模块',
  bodyOpenEditor: '展开身体围度编辑',
  bodyCloseEditor: '收起身体围度编辑',
  bodySummaryHeader: '最近：{text}',
  addByGramsBtnStrong: '按输入克数加入今天',
  addServingBtnStrong: '按一份加入今天',
  setFavoriteBtnStrong: '收藏到我的常吃',
  unsetFavoriteBtnStrong: '取消收藏',
});
Object.assign(TEXTS.en, {
  moduleHubKicker: 'Folded modules',
  moduleHubTitle: 'Keep the secondary surfaces tucked away',
  moduleHubHint: 'The main screen keeps the body stage, body-entry access, daily food input, and nutrition progress in focus.',
  moduleBodyTitle: 'Body measurements',
  moduleSoundTitle: 'Background music',
  moduleCaptureTitle: 'Photo / barcode',
  moduleComboTitle: 'Meal combos',
  moduleTodayTitle: 'Daily history',
  moduleDataTitle: 'Food library notes',
  moduleBodyEmpty: 'Add height, weight, and measurements first',
  moduleBodyReady: 'Latest entry: {text}',
  moduleBodyHot: 'Open to keep editing measurements',
  moduleSoundEmpty: 'Pick a rhythm first',
  moduleSoundReady: 'Current rhythm: {text}',
  moduleCaptureIdle: 'Nutrition-label OCR and barcode scan',
  moduleComboEmpty: 'For example: burger combo or breakfast combo',
  moduleComboReady: '{count} combos saved',
  moduleTodayReady: '{food} foods today · water {water}',
  moduleDataReady: 'Current library: {text}',
  comboKicker: 'Meal combos',
  comboTitle: 'Save repeated food stacks as one combo',
  comboDraftKicker: 'Combo draft',
  comboDraftTitle: 'Drop search results into one meal set',
  comboLibraryKicker: 'Combo library',
  comboLibraryTitle: 'Reuse the stacks you actually like',
  comboNameLabel: 'Combo name',
  comboNamePlaceholder: 'For example: burger set / high-protein breakfast / hotpot default mix',
  comboNoteLabel: 'Combo note',
  comboNotePlaceholder: 'For example: burger + fries + cola / chicken breast + corn + yogurt',
  comboSaveBtn: 'Save this combo',
  comboClearBtn: 'Clear combo draft',
  comboAddBtn: 'Add to combo',
  comboUseBtn: 'Add whole combo today',
  comboDeleteBtn: 'Delete combo',
  comboRemoveItemBtn: 'Remove',
  comboDraftEmpty: 'Use “Add to combo” in food search results to start building a set.',
  comboSaved: 'Combo saved: {name}',
  comboNeedName: 'Name the combo first.',
  comboNeedItem: 'Add at least one food to the combo.',
  comboCleared: 'Combo draft cleared.',
  comboAddedToDraft: 'Added to combo draft: {name}',
  comboUsed: 'Combo added today: {name}',
  comboDeleted: 'Combo deleted: {name}',
  comboItemsCount: '{count} items',
  comboSource: 'Combo · {name}',
  onboardingSkipBtn: 'Skip for now',
  onboardingPrevBtn: 'Back',
  onboardingNextBtn: 'Next',
  onboardingDoneBtn: 'Finish and fold modules',
  onboardingSoundKicker: 'Step 1 · Music',
  onboardingSoundTitle: 'Pick a background rhythm first',
  onboardingSoundText: 'Once the music is chosen, the full music lab folds back into a button. You can still reopen it later.',
  onboardingSoundStart: 'Start playback now',
  onboardingProfileKicker: 'Step 2 · Body baseline',
  onboardingProfileTitle: 'Fill the key body inputs first',
  onboardingProfileText: 'This gives both nutrition targets and the body stage a solid baseline. The editor folds away after that.',
  onboardingBodyKicker: 'Step 3 · 3D body stage',
  onboardingBodyTitle: 'The 3D body model stays as the visual hero',
  onboardingBodyText: 'Every new body entry compares against the previous one. The detailed editor stays tucked away until you need it.',
  onboardingFoodKicker: 'Step 4 · Daily food logging',
  onboardingFoodTitle: 'Daily food input is the second main stage',
  onboardingFoodText: 'Search, quick water, and nutrient progress stay visible. History folds back into a button.',
  onboardingCaptureKicker: 'Step 5 · Capture',
  onboardingCaptureTitle: 'Photo OCR and barcode scan stay folded by default',
  onboardingCaptureText: 'Open them only when you are facing a label or package.',
  onboardingComboKicker: 'Step 6 · Meal combos',
  onboardingComboTitle: 'Turn favorite stacks into reusable combos',
  onboardingComboText: 'Burger sets, hotpot defaults, and high-protein breakfasts can all be added in one tap.',
  onboardingStep: 'Step {index} / {count}',
  buttonMeaning: 'Buttons must speak clearly instead of relying on color only.',
  buttonOpenModule: 'Open module',
  bodyOpenEditor: 'Open body editor',
  bodyCloseEditor: 'Close body editor',
  bodySummaryHeader: 'Latest: {text}',
  addByGramsBtnStrong: 'Add this many grams today',
  addServingBtnStrong: 'Add one serving today',
  setFavoriteBtnStrong: 'Save to favorites',
  unsetFavoriteBtnStrong: 'Remove from favorites',
});
Object.assign(TEXTS.es, {
  moduleHubKicker: 'Módulos plegados',
  moduleHubTitle: 'Guardar lo secundario en botones elegantes',
  moduleHubHint: 'La pantalla principal mantiene el cuerpo, la entrada corporal, el registro diario y el progreso nutricional al frente.',
  moduleBodyTitle: 'Medidas corporales',
  moduleSoundTitle: 'Música de fondo',
  moduleCaptureTitle: 'Foto / código',
  moduleComboTitle: 'Combos',
  moduleTodayTitle: 'Historial diario',
  moduleDataTitle: 'Notas de la base de alimentos',
  moduleBodyEmpty: 'Primero añade altura, peso y medidas',
  moduleBodyReady: 'Último registro: {text}',
  moduleBodyHot: 'Ábrelo para seguir ajustando medidas',
  moduleSoundEmpty: 'Primero elige un ritmo',
  moduleSoundReady: 'Ritmo actual: {text}',
  moduleCaptureIdle: 'OCR de etiquetas y escaneo de código',
  moduleComboEmpty: 'Por ejemplo: combo de hamburguesa o desayuno',
  moduleComboReady: '{count} combos guardados',
  moduleTodayReady: '{food} alimentos hoy · agua {water}',
  moduleDataReady: 'Biblioteca actual: {text}',
  comboKicker: 'Combos',
  comboTitle: 'Guarda tus combinaciones repetidas como un solo combo',
  comboDraftKicker: 'Borrador',
  comboDraftTitle: 'Mete los resultados de búsqueda en un solo set',
  comboLibraryKicker: 'Biblioteca',
  comboLibraryTitle: 'Reutiliza las combinaciones que de verdad te gustan',
  comboNameLabel: 'Nombre del combo',
  comboNamePlaceholder: 'Por ejemplo: combo burger / desayuno alto en proteína / mezcla fija para hotpot',
  comboNoteLabel: 'Nota del combo',
  comboNotePlaceholder: 'Por ejemplo: hamburguesa + patatas + cola / pechuga + maíz + yogur',
  comboSaveBtn: 'Guardar este combo',
  comboClearBtn: 'Limpiar borrador',
  comboAddBtn: 'Añadir al combo',
  comboUseBtn: 'Añadir combo hoy',
  comboDeleteBtn: 'Borrar combo',
  comboRemoveItemBtn: 'Quitar',
  comboDraftEmpty: 'Usa “Añadir al combo” en los resultados para empezar a construir un set.',
  comboSaved: 'Combo guardado: {name}',
  comboNeedName: 'Ponle nombre al combo.',
  comboNeedItem: 'Añade al menos un alimento al combo.',
  comboCleared: 'Borrador limpiado.',
  comboAddedToDraft: 'Añadido al borrador: {name}',
  comboUsed: 'Combo añadido hoy: {name}',
  comboDeleted: 'Combo borrado: {name}',
  comboItemsCount: '{count} elementos',
  comboSource: 'Combo · {name}',
  onboardingSkipBtn: 'Saltar',
  onboardingPrevBtn: 'Atrás',
  onboardingNextBtn: 'Siguiente',
  onboardingDoneBtn: 'Terminar y plegar módulos',
  onboardingSoundKicker: 'Paso 1 · Música',
  onboardingSoundTitle: 'Primero elige un ritmo de fondo',
  onboardingSoundText: 'Después la pantalla completa de música se pliega y queda como botón.',
  onboardingSoundStart: 'Empezar a reproducir ahora',
  onboardingProfileKicker: 'Paso 2 · Base corporal',
  onboardingProfileTitle: 'Rellena primero altura, peso y lo esencial',
  onboardingProfileText: 'Esto prepara tanto los objetivos nutricionales como la escena corporal.',
  onboardingBodyKicker: 'Paso 3 · Modelo 3D',
  onboardingBodyTitle: 'El modelo 3D queda como la gran escena principal',
  onboardingBodyText: 'Cada registro nuevo se compara con el anterior; el editor detallado queda escondido hasta que lo necesites.',
  onboardingFoodKicker: 'Paso 4 · Registro diario',
  onboardingFoodTitle: 'La comida diaria es el segundo escenario principal',
  onboardingFoodText: 'Búsqueda, agua rápida y progreso nutricional se quedan visibles. El historial se pliega.',
  onboardingCaptureKicker: 'Paso 5 · Captura',
  onboardingCaptureTitle: 'OCR y código de barras plegados por defecto',
  onboardingCaptureText: 'Ábrelos solo cuando tengas delante una etiqueta o un envase.',
  onboardingComboKicker: 'Paso 6 · Combos',
  onboardingComboTitle: 'Convierte tus combinaciones favoritas en combos reutilizables',
  onboardingComboText: 'Combos de hamburguesa, hotpot o desayunos altos en proteína se añaden con un toque.',
  onboardingStep: 'Paso {index} / {count}',
  buttonMeaning: 'Los botones deben explicar su función sin depender solo del color.',
  buttonOpenModule: 'Abrir módulo',
  bodyOpenEditor: 'Abrir editor corporal',
  bodyCloseEditor: 'Cerrar editor corporal',
  bodySummaryHeader: 'Último: {text}',
  addByGramsBtnStrong: 'Añadir hoy con estos gramos',
  addServingBtnStrong: 'Añadir una ración hoy',
  setFavoriteBtnStrong: 'Guardar en favoritos',
  unsetFavoriteBtnStrong: 'Quitar de favoritos',
});

Object.assign(STORAGE, {
  combos: 'haochijia.combos.v15',
  comboDraft: 'haochijia.comboDraft.v15',
  onboarding: 'haochijia.onboarding.v15',
});
FOLD_DEFAULTS.combo = false;
['moduleHub','moduleHubGrid','moduleHubHint','moduleBodyBtn','moduleBodyStatus','moduleSoundBtn','moduleSoundStatus','moduleCaptureBtn','moduleCaptureStatus','moduleComboBtn','moduleComboStatus','moduleTodayBtn','moduleTodayStatus','moduleDataBtn','moduleDataStatus','comboPanelSummary','comboDraftCount','comboDraftList','comboNameInput','comboNoteInput','comboSaveBtn','comboClearBtn','comboDraftStatus','comboLibraryCount','comboLibraryList','onboardingBackdrop','onboardingModal','onboardingProgress','onboardingKicker','onboardingTitle','onboardingText','onboardingBody','onboardingPrevBtn','onboardingNextBtn','onboardingSkipBtn'].forEach((id) => { if (!IDS.includes(id)) IDS.push(id); });

state.combos = loadComboPresets();
state.comboDraft = loadComboDraft();
state.onboarding = loadOnboarding();
state.onboardingShown = false;

function loadComboPresets() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE.combos) || '[]');
    return Array.isArray(raw) ? raw.filter((item) => item && typeof item === 'object') : [];
  } catch {
    return [];
  }
}
function saveComboPresets() { localStorage.setItem(STORAGE.combos, JSON.stringify(state.combos || [])); }
function loadComboDraft() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE.comboDraft) || '[]');
    return Array.isArray(raw) ? raw.filter((item) => item && typeof item === 'object') : [];
  } catch {
    return [];
  }
}
function saveComboDraft() { localStorage.setItem(STORAGE.comboDraft, JSON.stringify(state.comboDraft || [])); }
function loadOnboarding() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE.onboarding) || '{}') || {};
  } catch {
    return {};
  }
}
function saveOnboarding() { localStorage.setItem(STORAGE.onboarding, JSON.stringify(state.onboarding || {})); }

function smartBuildLabels(food) {
  return buildSmartFoodLabels(food, buildFoodLabels);
}

const legacyLabelsForFoodV15 = labelsForFood;
labelsForFood = function labelsForFoodV15(item) {
  if (!item) return null;
  if (item._labels && item._labels.__v15) return item._labels;
  if (item.labels && item.labels.__v15) return item.labels;
  const labels = smartBuildLabels({
    ...item,
    n: item.originalName || item.n || item.name || item.z || '',
    z: item.z || item.name || '',
    labels: item.labels || item._labels,
  });
  labels.__v15 = true;
  if ('_norm' in item || 'c' in item || 'b' in item || 'q' in item || '_displayName' in item) item._labels = labels;
  else item.labels = labels;
  return labels;
};

const legacyLoadFoodsV15 = loadFoods;
loadFoods = async function loadFoodsV15(force = false) {
  const regionKey = syncActiveFoodBank();
  if (state.foodBanks[regionKey] && !force) {
    state.foods = state.foodBanks[regionKey];
    state.foodMap = state.foodMaps[regionKey] || new Map();
    state.foodsLoaded = true;
    return state.foods;
  }
  if (state.foodPromises[regionKey] && !force) return state.foodPromises[regionKey];
  state.foodsLoading = true;
  if (DOM.foodDataStatus) {
    DOM.foodDataStatus.textContent = force
      ? L('foodLibReloading')
      : `${L('foodLibLoading')} · ${regionName(regionKey)}`;
  }
  state.foodPromises[regionKey] = (async () => {
    try {
      const foods = await fetchFoodsPayload(regionKey);
      const foodMap = new Map();
      for (const food of foods) {
        food._norm = normalizedFoodNutrients(food);
        food._servingGram = parseServingSizeGrams(food.s || food.serving || food.q || '') || null;
        food._labels = labelsForFood(food);
        food._displayName = food._labels[uiLang()] || food._labels.zh || food.z || food.n || L('unknownFood');
        food._originalName = uiLang() === 'zh' ? '' : (normalizeSearch(food._displayName) !== normalizeSearch(food._labels.original || food.n || '') ? (food._labels.original || food.n || '') : '');
        food._metaLine = [food.b, food.g, food.q].filter(Boolean).join(' · ');
        food._search = buildFoodSearchText(food, food._labels);
        food._presentIds = foodKnownNutrientIds(food);
        if (food.c) foodMap.set(food.c, food);
      }
      state.foodBanks[regionKey] = foods;
      state.foodMaps[regionKey] = foodMap;
      syncActiveFoodBank();
      markExploreDirty();
      if (DOM.foodDataStatus) DOM.foodDataStatus.textContent = `${L('searchReady', { count: fmtInt(foods.length) })} · ${regionName(regionKey)}`;
      if (DOM.foodSearchInput?.value.trim()) doSearch(DOM.foodSearchInput.value.trim());
      return foods;
    } catch (err) {
      console.error(err);
      if (DOM.foodDataStatus) DOM.foodDataStatus.textContent = L('foodLibError', { message: err.message });
      return null;
    } finally {
      state.foodsLoading = false;
      state.foodPromises[regionKey] = null;
      if (resolvedFoodRegion() === regionKey) syncActiveFoodBank();
    }
  })();
  return state.foodPromises[regionKey];
};

function serializeComboFood(food, grams) {
  const labels = labelsForFood(food);
  return {
    code: food?.c || '',
    grams: clamp(Number(grams) || 100, 1, 5000),
    labels: { ...labels },
    name: labels[uiLang()] || food?._displayName || food?.name || food?.n || L('unknownFood'),
    originalName: labels.original || food?._originalName || food?.originalName || food?.n || '',
    servingGram: food?._servingGram || null,
    metaLine: food?._metaLine || '',
    nutrients: { ...(food?._norm || food?.nutrients || {}) },
    presentIds: Array.isArray(food?._presentIds) ? [...food._presentIds] : Object.keys(food?._norm || food?.nutrients || {}),
    source: 'db',
  };
}

function hydrateComboFood(item) {
  const labels = item.labels || smartBuildLabels({ n: item.originalName || item.name || L('unknownFood'), z: item.name || '' });
  return {
    source: item.source || 'db',
    c: item.code || '',
    n: labels.original || item.originalName || item.name || L('unknownFood'),
    _labels: labels,
    _displayName: labels[uiLang()] || item.name || item.originalName || L('unknownFood'),
    _originalName: labels.original || item.originalName || '',
    _servingGram: Number.isFinite(item.servingGram) ? item.servingGram : null,
    _metaLine: item.metaLine || '',
    _norm: { ...(item.nutrients || {}) },
    _presentIds: Array.isArray(item.presentIds) ? [...item.presentIds] : Object.keys(item.nutrients || {}),
  };
}

function bodyLatestSummary() {
  try {
    const raw = JSON.parse(localStorage.getItem('haochijia.body.history.v1') || '[]');
    const latest = Array.isArray(raw) ? raw[0] : null;
    if (!latest) return '';
    const bits = [];
    if (Number.isFinite(Number(latest.weightKg))) bits.push(`${round1(latest.weightKg)} kg`);
    if (Number.isFinite(Number(latest.waist))) bits.push(`${uiLang() === 'zh' ? '腰' : uiLang() === 'es' ? 'cintura' : 'waist'} ${round1(latest.waist)} cm`);
    if (Number.isFinite(Number(latest.hip))) bits.push(`${uiLang() === 'zh' ? '臀' : uiLang() === 'es' ? 'cadera' : 'hips'} ${round1(latest.hip)} cm`);
    return bits.join(' · ');
  } catch {
    return '';
  }
}

function renderModuleHub() {
  if (!DOM.moduleHubGrid) return;
  const day = getDayLog(state.date).items || [];
  const foodCount = day.filter((item) => item.type === 'food').length;
  const water = currentTotals().water || 0;
  const bodyText = bodyLatestSummary();
  if (DOM.moduleBodyStatus) DOM.moduleBodyStatus.textContent = bodyText ? L('moduleBodyReady', { text: bodyText }) : L('moduleBodyEmpty');
  const genreText = state.musicController?.genre?.labels?.[uiLang()] || MUSIC_GENRES[0]?.labels?.[uiLang()] || MUSIC_GENRES[0]?.labels?.zh || '—';
  if (DOM.moduleSoundStatus) DOM.moduleSoundStatus.textContent = L('moduleSoundReady', { text: genreText });
  if (DOM.moduleCaptureStatus) DOM.moduleCaptureStatus.textContent = L('moduleCaptureIdle');
  if (DOM.moduleComboStatus) DOM.moduleComboStatus.textContent = state.combos?.length ? L('moduleComboReady', { count: state.combos.length }) : L('moduleComboEmpty');
  if (DOM.moduleTodayStatus) DOM.moduleTodayStatus.textContent = L('moduleTodayReady', { food: foodCount, water: metric(water, 'water') });
  if (DOM.moduleDataStatus) DOM.moduleDataStatus.textContent = L('moduleDataReady', { text: regionName() });
}

function renderComboPanel() {
  if (!DOM.comboDraftList || !DOM.comboLibraryList) return;
  const draft = state.comboDraft || [];
  const presets = state.combos || [];
  if (DOM.comboDraftCount) DOM.comboDraftCount.textContent = L('comboItemsCount', { count: draft.length });
  if (DOM.comboLibraryCount) DOM.comboLibraryCount.textContent = uiLang() === 'zh' ? `${presets.length} 个` : uiLang() === 'es' ? `${presets.length} combos` : `${presets.length} combos`;
  if (DOM.comboPanelSummary) DOM.comboPanelSummary.textContent = presets.length ? (uiLang() === 'zh' ? `已存 ${presets.length} 个组合，支持一键整套加入今天。` : uiLang() === 'es' ? `${presets.length} combos guardados y listos para usar.` : `${presets.length} combos saved and ready to add.`) : (uiLang() === 'zh' ? '搜索结果可以直接加入组合草稿，再一键保存和复用。' : uiLang() === 'es' ? 'Los resultados pueden pasar al borrador del combo y reutilizarse después.' : 'Search results can be dropped into the combo draft and reused later.');
  DOM.comboDraftList.innerHTML = draft.length ? draft.map((item, idx) => `
    <article class="combo-row">
      <div class="combo-row-main">
        <strong>${escapeHtml(item.labels?.[uiLang()] || item.name || item.originalName || L('unknownFood'))}</strong>
        <div class="muted small">${escapeHtml(`${round0(item.grams || 100)} g`)}${item.originalName && uiLang() !== 'zh' ? ` · ${escapeHtml(item.originalName)}` : ''}</div>
      </div>
      <div class="combo-row-actions">
        <input type="number" min="1" max="5000" step="1" value="${round0(item.grams || 100)}" data-combo-draft-grams="${idx}">
        <button class="ghost-btn compact-btn danger" type="button" data-combo-draft-remove="${idx}">${escapeHtml(L('comboRemoveItemBtn'))}</button>
      </div>
    </article>
  `).join('') : `<div class="empty-state">${escapeHtml(L('comboDraftEmpty'))}</div>`;
  DOM.comboLibraryList.innerHTML = presets.length ? presets.map((combo, idx) => `
    <article class="combo-library-item">
      <div class="combo-library-main">
        <strong>${escapeHtml(combo.name || L('comboTitle'))}</strong>
        <div class="muted small">${escapeHtml(combo.note || '')}${combo.note ? ' · ' : ''}${escapeHtml(L('comboItemsCount', { count: combo.items?.length || 0 }))}</div>
      </div>
      <div class="inline-action-row combo-library-actions">
        <button class="primary-btn compact-btn" type="button" data-combo-use="${idx}">${escapeHtml(L('comboUseBtn'))}</button>
        <button class="ghost-btn compact-btn danger" type="button" data-combo-delete="${idx}">${escapeHtml(L('comboDeleteBtn'))}</button>
      </div>
    </article>
  `).join('') : `<div class="empty-state">${escapeHtml(L('moduleComboEmpty'))}</div>`;
}

function addFoodToComboDraft(food, grams) {
  const item = serializeComboFood(food, grams);
  state.comboDraft = [...(state.comboDraft || []), item];
  saveComboDraft();
  renderComboPanel();
  renderModuleHub();
  if (DOM.comboDraftStatus) DOM.comboDraftStatus.textContent = L('comboAddedToDraft', { name: item.labels?.[uiLang()] || item.name || L('unknownFood') });
  showToast(L('comboAddedToDraft', { name: item.labels?.[uiLang()] || item.name || L('unknownFood') }));
}

function clearComboDraft() {
  state.comboDraft = [];
  saveComboDraft();
  if (DOM.comboNameInput) DOM.comboNameInput.value = '';
  if (DOM.comboNoteInput) DOM.comboNoteInput.value = '';
  if (DOM.comboDraftStatus) DOM.comboDraftStatus.textContent = L('comboCleared');
  renderComboPanel();
}

function saveComboPresetFromDraft() {
  const name = String(DOM.comboNameInput?.value || '').trim();
  if (!name) {
    if (DOM.comboDraftStatus) DOM.comboDraftStatus.textContent = L('comboNeedName');
    return;
  }
  if (!state.comboDraft?.length) {
    if (DOM.comboDraftStatus) DOM.comboDraftStatus.textContent = L('comboNeedItem');
    return;
  }
  const combo = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    note: String(DOM.comboNoteInput?.value || '').trim(),
    items: state.comboDraft.map((item) => ({ ...item })),
    createdAt: new Date().toISOString(),
  };
  state.combos = [combo, ...(state.combos || [])].slice(0, 40);
  saveComboPresets();
  clearComboDraft();
  renderComboPanel();
  renderModuleHub();
  if (DOM.comboDraftStatus) DOM.comboDraftStatus.textContent = L('comboSaved', { name });
  showToast(L('comboSaved', { name }));
}

function addComboToToday(combo) {
  const dayLog = getDayLog(state.date).items;
  [...(combo.items || [])].reverse().forEach((item) => {
    const food = hydrateComboFood(item);
    dayLog.unshift({
      type: 'food',
      source: 'combo',
      sourceLabel: L('comboSource', { name: combo.name || L('comboTitle') }),
      code: food.c || '',
      labels: { ...(food._labels || food.labels || smartBuildLabels(food)) },
      name: food._labels?.[uiLang()] || food._displayName || item.name || L('unknownFood'),
      originalName: food._labels?.original || item.originalName || '',
      amountText: `${round0(item.grams || 100)} g`,
      nutrients: scaleNutrients(food._norm, item.grams || 100),
      knownIds: Array.isArray(food._presentIds) ? [...food._presentIds] : Object.keys(food._norm || {}),
      createdAt: new Date().toISOString(),
    });
  });
  saveLogs();
  markExploreDirty();
  renderAll();
  flashUpdate();
  showToast(L('comboUsed', { name: combo.name || L('comboTitle') }));
}

function onComboPanelClick(event) {
  const gramsInput = event.target.closest('[data-combo-draft-grams]');
  const removeBtn = event.target.closest('[data-combo-draft-remove]');
  const useBtn = event.target.closest('[data-combo-use]');
  const deleteBtn = event.target.closest('[data-combo-delete]');
  if (gramsInput) {
    const idx = Number(gramsInput.dataset.comboDraftGrams);
    if (state.comboDraft?.[idx]) {
      state.comboDraft[idx].grams = clamp(Number(gramsInput.value) || state.comboDraft[idx].grams || 100, 1, 5000);
      saveComboDraft();
      renderComboPanel();
    }
    return;
  }
  if (removeBtn) {
    const idx = Number(removeBtn.dataset.comboDraftRemove);
    state.comboDraft = (state.comboDraft || []).filter((_, index) => index !== idx);
    saveComboDraft();
    renderComboPanel();
    return;
  }
  if (useBtn) {
    const combo = state.combos?.[Number(useBtn.dataset.comboUse)];
    if (combo) addComboToToday(combo);
    return;
  }
  if (deleteBtn) {
    const idx = Number(deleteBtn.dataset.comboDelete);
    const combo = state.combos?.[idx];
    state.combos = (state.combos || []).filter((_, index) => index !== idx);
    saveComboPresets();
    renderComboPanel();
    renderModuleHub();
    if (combo) showToast(L('comboDeleted', { name: combo.name || L('comboTitle') }));
  }
}

const ONBOARDING_STEPS_V15 = ['sound', 'profile', 'body', 'food', 'capture', 'combo'];
function onboardingStepIndex() {
  return clamp(Number(state.onboarding?.step) || 0, 0, ONBOARDING_STEPS_V15.length - 1);
}
function setOnboardingStep(index) {
  state.onboarding.step = clamp(index, 0, ONBOARDING_STEPS_V15.length - 1);
  saveOnboarding();
  renderOnboardingModal();
}
function shouldShowOnboarding() {
  return !state.onboarding?.done;
}
function openOnboarding() {
  if (!DOM.onboardingModal || !DOM.onboardingBackdrop) return;
  renderOnboardingModal();
  DOM.onboardingBackdrop.hidden = false;
  DOM.onboardingModal.hidden = false;
  DOM.onboardingModal.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => {
    DOM.onboardingBackdrop.classList.add('show');
    DOM.onboardingModal.classList.add('show');
  });
}
function closeOnboarding() {
  if (!DOM.onboardingModal || !DOM.onboardingBackdrop) return;
  DOM.onboardingModal.classList.remove('show');
  DOM.onboardingBackdrop.classList.remove('show');
  DOM.onboardingModal.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    if (!DOM.onboardingModal.classList.contains('show')) DOM.onboardingModal.hidden = true;
    if (!DOM.onboardingBackdrop.classList.contains('show')) DOM.onboardingBackdrop.hidden = true;
  }, 180);
}
function finishOnboarding() {
  state.onboarding = { ...state.onboarding, done: true, completedAt: new Date().toISOString(), step: ONBOARDING_STEPS_V15.length - 1 };
  saveOnboarding();
  ['profile', 'sound', 'capture', 'combo', 'today', 'data'].forEach((id) => setPanelState(id, false));
  openPanel('food');
  window.__haochijiaToggleBodyPanel?.(false);
  closeOnboarding();
  renderModuleHub();
}
function syncOnboardingProfileIntoMainForm() {
  const values = {
    sex: DOM.onboardingBodySex?.value || state.profile.sex,
    age: DOM.onboardingBodyAge?.value || state.profile.age,
    heightCm: DOM.onboardingBodyHeight?.value || state.profile.heightCm,
    weightKg: DOM.onboardingBodyWeight?.value || state.profile.weightKg,
    activity: DOM.onboardingBodyActivity?.value || state.profile.activity,
    goal: DOM.onboardingBodyGoal?.value || state.profile.goal,
  };
  Object.entries(values).forEach(([key, value]) => {
    const input = DOM.profileForm?.elements?.[key];
    if (input) input.value = value;
  });
  recalc();
  renderAll();
}
function renderOnboardingStepBody(step) {
  const lang = uiLang();
  if (step === 'sound') {
    const currentGenre = state.musicController?.genre?.id || state.musicPrefs?.genreId || MUSIC_GENRES[0]?.id;
    return `
      <div class="onboarding-card-grid onboarding-music-grid">
        ${MUSIC_GENRES.slice(0, 6).map((genre) => `
          <button type="button" class="onboarding-choice${genre.id === currentGenre ? ' is-active' : ''}" data-onboarding-genre="${escapeHtml(genre.id)}">
            <strong>${escapeHtml(genre.labels?.[lang] || genre.labels?.zh || genre.id)}</strong>
            <span>${escapeHtml(`${genre.bpm} BPM`)}</span>
          </button>
        `).join('')}
      </div>
      <label class="toggle-chip onboarding-toggle" for="onboardingPlayNow">
        <input id="onboardingPlayNow" type="checkbox" ${state.musicController?.playing ? 'checked' : ''}>
        <span>${escapeHtml(L('onboardingSoundStart'))}</span>
      </label>`;
  }
  if (step === 'profile') {
    return `
      <div class="onboarding-form-grid">
        <label class="field"><span>${escapeHtml(L('fieldSex'))}</span><select id="onboardingBodySex"><option value="female">${escapeHtml(L('sexFemale'))}</option><option value="male">${escapeHtml(L('sexMale'))}</option></select></label>
        <label class="field"><span>${escapeHtml(L('fieldAge'))}</span><input id="onboardingBodyAge" type="number" min="14" max="95" step="1" value="${escapeHtml(state.profile.age)}"></label>
        <label class="field"><span>${escapeHtml(L('fieldHeight'))}</span><input id="onboardingBodyHeight" type="number" min="120" max="230" step="1" value="${escapeHtml(state.profile.heightCm)}"></label>
        <label class="field"><span>${escapeHtml(L('fieldWeight'))}</span><input id="onboardingBodyWeight" type="number" min="30" max="250" step="0.1" value="${escapeHtml(state.profile.weightKg)}"></label>
        <label class="field"><span>${escapeHtml(L('fieldActivity'))}</span><select id="onboardingBodyActivity">${Object.keys(ACTIVITY_LEVELS).map((key) => `<option value="${escapeHtml(key)}" ${state.profile.activity === key ? 'selected' : ''}>${escapeHtml(enumLabel(uiLang(), 'activity', key))}</option>`).join('')}</select></label>
        <label class="field"><span>${escapeHtml(L('fieldGoal'))}</span><select id="onboardingBodyGoal">${Object.keys(GOALS).map((key) => `<option value="${escapeHtml(key)}" ${state.profile.goal === key ? 'selected' : ''}>${escapeHtml(enumLabel(uiLang(), 'goal', key))}</option>`).join('')}</select></label>
      </div>`;
  }
  if (step === 'body') {
    return `<div class="onboarding-spotlight"><strong>${escapeHtml(L('buttonMeaning'))}</strong><span>${escapeHtml(L('moduleBodyHot'))}</span><button type="button" class="ghost-btn" data-onboarding-open="body-edit">${escapeHtml(L('bodyOpenEditor'))}</button></div>`;
  }
  if (step === 'food') {
    return `<div class="onboarding-spotlight"><strong>${escapeHtml(L('moduleTodayTitle'))}</strong><span>${escapeHtml(L('moduleHubHint'))}</span><button type="button" class="ghost-btn" data-onboarding-open="food">${escapeHtml(L('buttonOpenModule'))}</button></div>`;
  }
  if (step === 'capture') {
    return `<div class="onboarding-spotlight"><strong>${escapeHtml(L('moduleCaptureTitle'))}</strong><span>${escapeHtml(L('moduleCaptureIdle'))}</span><button type="button" class="ghost-btn" data-onboarding-open="capture">${escapeHtml(L('buttonOpenModule'))}</button></div>`;
  }
  return `<div class="onboarding-spotlight"><strong>${escapeHtml(L('moduleComboTitle'))}</strong><span>${escapeHtml(L('moduleComboEmpty'))}</span><button type="button" class="ghost-btn" data-onboarding-open="combo">${escapeHtml(L('buttonOpenModule'))}</button></div>`;
}
function renderOnboardingModal() {
  if (!DOM.onboardingBody) return;
  const idx = onboardingStepIndex();
  const step = ONBOARDING_STEPS_V15[idx];
  const prefix = `onboarding${step.charAt(0).toUpperCase()}${step.slice(1)}`;
  if (DOM.onboardingKicker) DOM.onboardingKicker.textContent = `${L('onboardingStep', { index: idx + 1, count: ONBOARDING_STEPS_V15.length })} · ${L(`${prefix}Kicker`).replace(/^.*?·\s*/, '')}`;
  if (DOM.onboardingTitle) DOM.onboardingTitle.textContent = L(`${prefix}Title`);
  if (DOM.onboardingText) DOM.onboardingText.textContent = L(`${prefix}Text`);
  if (DOM.onboardingProgress) DOM.onboardingProgress.innerHTML = ONBOARDING_STEPS_V15.map((id, index) => `<span class="onboarding-dot ${index <= idx ? 'is-active' : ''}"></span>`).join('');
  DOM.onboardingBody.innerHTML = renderOnboardingStepBody(step);
  if (DOM.onboardingPrevBtn) DOM.onboardingPrevBtn.disabled = idx === 0;
  if (DOM.onboardingNextBtn) DOM.onboardingNextBtn.textContent = idx === ONBOARDING_STEPS_V15.length - 1 ? L('onboardingDoneBtn') : L('onboardingNextBtn');
  if (step === 'profile') {
    requestAnimationFrame(() => {
      const sexEl = document.getElementById('onboardingBodySex');
      const activityEl = document.getElementById('onboardingBodyActivity');
      const goalEl = document.getElementById('onboardingBodyGoal');
      if (sexEl) sexEl.value = state.profile.sex;
      if (activityEl) activityEl.value = state.profile.activity;
      if (goalEl) goalEl.value = state.profile.goal;
    });
  }
}
function maybeLaunchOnboarding() {
  if (state.onboardingShown || !shouldShowOnboarding()) return;
  state.onboardingShown = true;
  setTimeout(() => openOnboarding(), 220);
}

const legacyOpenPanelV15 = openPanel;
openPanel = function openPanelV15(id) {
  if (id === 'body-edit') {
    window.__haochijiaOpenBodyPanel?.(true);
    return;
  }
  legacyOpenPanelV15(id);
};

const legacyRenderSearchItemV15 = renderSearchItem;
renderSearchItem = function renderSearchItemV15(food, idx) {
  const defaultGram = food._servingGram || 100;
  const displayName = preferredFoodName(food);
  const original = preferredOriginalName(food);
  const originalLine = original ? `<div class="food-origin">${escapeHtml(L('originalNameLabel'))} ${escapeHtml(original)}</div>` : '';
  const isFavorite = isFavoriteFood(food);
  const reasonLine = food._matchReason ? `<div class="food-match-reason">${escapeHtml(searchV13Text('matchPrefix'))}${escapeHtml(food._matchReason)}</div>` : '';
  return `
    <article class="food-card">
      <div class="food-card-head">
        <div class="food-title-wrap">
          <h3 class="food-title">${escapeHtml(displayName)}</h3>
          ${originalLine}
          ${reasonLine}
          ${foodMetaLine(food) ? `<div class="food-origin">${escapeHtml(foodMetaLine(food))}</div>` : ''}
          ${renderFoodTagRow(food)}
        </div>
        <span class="top-pill subtle">${escapeHtml(food._servingGram ? L('servingApprox', { gram: round0(food._servingGram) }) : L('baseline100g'))}</span>
      </div>
      <div class="food-meta food-meta--stacked">
        <span>${escapeHtml(L('manualBasis100g'))} ${escapeHtml(metric(food._norm.kcal, 'kcal'))}</span>
        <span>${escapeHtml(nutrientName('protein'))} ${escapeHtml(metric(food._norm.protein, 'protein'))}</span>
        <span>${escapeHtml(nutrientName('carbs'))} ${escapeHtml(metric(food._norm.carbs, 'carbs'))}</span>
        <span>${escapeHtml(nutrientName('fat'))} ${escapeHtml(metric(food._norm.fat, 'fat'))}</span>
        <span>${escapeHtml(nutrientName('sodium'))} ${escapeHtml(metric(food._norm.sodium, 'sodium'))}</span>
      </div>
      <div class="food-actions food-actions-v15">
        <input type="number" min="1" max="5000" step="1" value="${defaultGram}" data-grams-input="${idx}" aria-label="grams for ${escapeHtml(displayName)}">
        <button class="primary-btn" type="button" data-add-food="${idx}">${escapeHtml(L('addByGramsBtnStrong'))}</button>
        ${food._servingGram ? `<button class="ghost-btn" type="button" data-add-serving="${idx}">${escapeHtml(L('addServingBtnStrong'))}</button>` : ''}
        <button class="ghost-btn" type="button" data-toggle-favorite="${idx}">${escapeHtml(isFavorite ? L('unsetFavoriteBtnStrong') : L('setFavoriteBtnStrong'))}</button>
        <button class="ghost-btn" type="button" data-combo-add="${idx}">${escapeHtml(L('comboAddBtn'))}</button>
      </div>
      <div class="quick-grams-row">
        <button class="ghost-btn" type="button" data-add-quick="${idx}" data-quick-grams="50">+50 g</button>
        <button class="ghost-btn" type="button" data-add-quick="${idx}" data-quick-grams="100">+100 g</button>
        <button class="ghost-btn" type="button" data-add-quick="${idx}" data-quick-grams="250">+250 g</button>
      </div>
    </article>
  `;
};

const legacyOnFoodResultClickV15 = onFoodResultClick;
onFoodResultClick = function onFoodResultClickV15(e) {
  const comboBtn = e.target.closest('[data-combo-add]');
  if (comboBtn) {
    const idx = Number(comboBtn.dataset.comboAdd);
    const food = state.lastResults?.[idx];
    if (!food) return;
    const input = DOM.foodSearchResults?.querySelector(`[data-grams-input="${idx}"]`);
    addFoodToComboDraft(food, clamp(Number(input?.value) || food._servingGram || 100, 1, 5000));
    openPanel('combo');
    return;
  }
  legacyOnFoodResultClickV15(e);
};

const legacyRenderSuggestionsV15 = renderSuggestions;
renderSuggestions = function renderSuggestionsV15() {
  const items = state.favorites.slice(0, 8);
  state.favoriteItems = items;
  DOM.favoritesList.innerHTML = items.length ? items.map((item, idx) => {
    const displayName = preferredFoodName(item);
    const original = preferredOriginalName(item);
    return `
      <li>
        <div>
          <strong>${escapeHtml(displayName)}</strong>
          <div class="muted small">${escapeHtml(item.servingGram ? L('favoriteDefaultServing', { gram: round0(item.servingGram) }) : L('favoriteDefault100'))}${original && normalizeSearch(original) !== normalizeSearch(displayName) ? ` · ${escapeHtml(L('originalNameLabel'))} ${escapeHtml(original)}` : ''}</div>
        </div>
        <div class="inline-action-row">
          <button class="ghost-btn" type="button" data-favorite-add="${idx}">${escapeHtml(L('addBtn'))}</button>
          <button class="ghost-btn" type="button" data-favorite-combo="${idx}">${escapeHtml(L('comboAddBtn'))}</button>
          <button class="ghost-btn danger" type="button" data-favorite-remove="${idx}">${escapeHtml(L('removeBtn'))}</button>
        </div>
      </li>
    `;
  }).join('') : `<li class="empty-state">${escapeHtml(L('favoritesEmpty'))}</li>`;
};

const legacyOnFavoriteClickV15 = onFavoriteClick;
onFavoriteClick = function onFavoriteClickV15(e) {
  const comboBtn = e.target.closest('[data-favorite-combo]');
  if (comboBtn) {
    const idx = Number(comboBtn.dataset.favoriteCombo);
    const favorite = state.favoriteItems?.[idx];
    if (!favorite) return;
    addFoodToComboDraft(hydrateFavoriteFood(favorite), favorite.servingGram || 100);
    openPanel('combo');
    return;
  }
  legacyOnFavoriteClickV15(e);
};

const legacyRenderAllV15 = renderAll;
renderAll = function renderAllV15() {
  legacyRenderAllV15();
  renderComboPanel();
  renderModuleHub();
  if (shouldShowOnboarding()) maybeLaunchOnboarding();
};

const legacyApplyLanguageV15 = applyLanguage;
applyLanguage = function applyLanguageV15() {
  legacyApplyLanguageV15();
  renderComboPanel();
  renderModuleHub();
  renderOnboardingModal();
};

const legacyBindEventsV15 = bindEvents;
bindEvents = function bindEventsV15() {
  legacyBindEventsV15();
  DOM.comboDraftList?.addEventListener('click', onComboPanelClick);
  DOM.comboDraftList?.addEventListener('change', onComboPanelClick);
  DOM.comboLibraryList?.addEventListener('click', onComboPanelClick);
  DOM.comboSaveBtn?.addEventListener('click', saveComboPresetFromDraft);
  DOM.comboClearBtn?.addEventListener('click', clearComboDraft);
  DOM.moduleHubGrid?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-open-panel]');
    if (!btn) return;
    openPanel(btn.dataset.openPanel || 'top');
  });
  DOM.onboardingPrevBtn?.addEventListener('click', () => setOnboardingStep(onboardingStepIndex() - 1));
  DOM.onboardingSkipBtn?.addEventListener('click', finishOnboarding);
  DOM.onboardingBackdrop?.addEventListener('click', finishOnboarding);
  DOM.onboardingNextBtn?.addEventListener('click', async () => {
    const step = ONBOARDING_STEPS_V15[onboardingStepIndex()];
    if (step === 'sound') {
      const playNow = document.getElementById('onboardingPlayNow')?.checked;
      if (playNow) {
        const controller = initMusicController();
        await controller.play();
        saveMusicPrefs();
        renderSoundPanel();
      }
    }
    if (step === 'profile') syncOnboardingProfileIntoMainForm();
    if (onboardingStepIndex() >= ONBOARDING_STEPS_V15.length - 1) finishOnboarding();
    else setOnboardingStep(onboardingStepIndex() + 1);
  });
  DOM.onboardingBody?.addEventListener('click', async (event) => {
    const genreBtn = event.target.closest('[data-onboarding-genre]');
    if (genreBtn) {
      const controller = initMusicController();
      controller.setGenre(genreBtn.dataset.onboardingGenre || MUSIC_GENRES[0].id);
      saveMusicPrefs();
      renderSoundPanel();
      renderOnboardingModal();
      renderModuleHub();
      return;
    }
    const openBtn = event.target.closest('[data-onboarding-open]');
    if (openBtn) {
      openPanel(openBtn.dataset.onboardingOpen || 'top');
    }
  });
};

window.addEventListener('haochijia:body-ready', () => {
  renderModuleHub();
  if (shouldShowOnboarding()) maybeLaunchOnboarding();
});

window.addEventListener('DOMContentLoaded', () => {
  renderComboPanel();
  renderModuleHub();
  if (window.__haochijiaBodyReady && shouldShowOnboarding()) maybeLaunchOnboarding();
});

/* ===== v19 non-blocking startup guide + full music lab visibility + visual boards ===== */
[
  'startupGuide','startupGuideProgress','startupGuideKicker','startupGuideTitle','startupGuideText','startupGuideBody',
  'startupGuidePrevBtn','startupGuideNextBtn','startupGuideSkipBtn','startupGuideOpenBtn','startupGuideModePill',
  'soundLabCallout','soundVisualBoard','targetsVisualGrid','datasetVisualBoard','translationVisualBoard'
].forEach((id) => { if (!IDS.includes(id)) IDS.push(id); });

function startupGuideStepKey() {
  return ONBOARDING_STEPS_V15[onboardingStepIndex()] || 'sound';
}
function startupGuideStepLabel(step) {
  const labels = {
    sound: uiLang() === 'zh' ? '音乐实验室' : uiLang() === 'es' ? 'Laboratorio musical' : 'Music lab',
    profile: uiLang() === 'zh' ? '个人营养参数' : uiLang() === 'es' ? 'Perfil nutricional' : 'Nutrition profile',
    body: uiLang() === 'zh' ? '身体模型' : uiLang() === 'es' ? 'Modelo corporal' : 'Body model',
    food: uiLang() === 'zh' ? '饮食记录' : uiLang() === 'es' ? 'Registro de comida' : 'Food logging',
    capture: uiLang() === 'zh' ? '拍照 / 扫码' : uiLang() === 'es' ? 'Foto / código' : 'Capture / barcode',
    combo: uiLang() === 'zh' ? '组合餐' : uiLang() === 'es' ? 'Combos' : 'Combos',
  };
  return labels[step] || step;
}
function startupGuideOpenLabel(step) {
  if (uiLang() === 'zh') {
    return {
      sound: '打开 8 参数音乐实验室',
      profile: '打开个人设置',
      body: '打开 3D 身体模型',
      food: '打开饮食记录',
      capture: '打开拍照 / 扫码',
      combo: '打开组合餐设计',
    }[step] || '打开当前模块';
  }
  if (uiLang() === 'es') {
    return {
      sound: 'Abrir laboratorio musical',
      profile: 'Abrir perfil',
      body: 'Abrir modelo corporal',
      food: 'Abrir registro',
      capture: 'Abrir foto / código',
      combo: 'Abrir combos',
    }[step] || 'Abrir módulo';
  }
  return {
    sound: 'Open music lab',
    profile: 'Open profile',
    body: 'Open body model',
    food: 'Open food log',
    capture: 'Open capture',
    combo: 'Open combos',
  }[step] || 'Open module';
}
function startupGuidePanel(step) {
  return {
    sound: 'sound',
    profile: 'profile',
    body: 'body-edit',
    food: 'food',
    capture: 'capture',
    combo: 'combo',
  }[step] || 'top';
}
function startupGuideStepStrings(step) {
  const prefix = `onboarding${step.charAt(0).toUpperCase()}${step.slice(1)}`;
  return {
    kicker: L(`${prefix}Kicker`) || startupGuideStepLabel(step),
    title: L(`${prefix}Title`) || startupGuideStepLabel(step),
    text: L(`${prefix}Text`) || '',
  };
}
function startupGuidePillsForSound(snapshot) {
  const axes = [
    ['volume', L('musicVolumeLabel'), `${snapshot.volume}%`],
    ['energy', L('musicEnergyLabel'), `${snapshot.energy}/5`],
    ['intensity', L('musicIntensityLabel'), `${snapshot.intensity}/5`],
    ['pulse', L('musicPulseLabel'), `${snapshot.pulse}/5`],
    ['bass', L('musicBassLabel'), `${snapshot.bass}/5`],
    ['brightness', L('musicBrightnessLabel'), `${snapshot.brightness}/5`],
    ['tempo', L('musicTempoLabel'), `${snapshot.effectiveBpm || snapshot.genre?.bpm || 0} BPM`],
    ['variation', L('musicVariationLabel'), `${snapshot.variation || 3}/5`],
  ];
  return `<div class="startup-guide-pill-row">${axes.map((item) => `<span class="startup-guide-pill">${escapeHtml(item[1])} · ${escapeHtml(item[2])}</span>`).join('')}</div>`;
}
function startupGuideBodyHtml(step) {
  if (step === 'sound') {
    const snapshot = initMusicController().getState();
    const genreText = snapshot.genre?.labels?.[uiLang()] || snapshot.genre?.labels?.zh || '—';
    const sideNotesZh = [
      ['不再锁屏', '音乐引导改成了行内卡片，不再用整层模态把主页挡死。'],
      ['参数全可见', '音量、能量、强度、步态、低频、亮度、速度、变化幅度仍然都在背景音乐模块里。'],
      ['失败也可继续', '即使浏览器这次没让声音立刻响起，也不会卡住后续身体数据和饮食记录。'],
    ];
    const sideNotesEn = [
      ['No more lock screen', 'The first-run music step is now inline, so it no longer blocks the whole page.'],
      ['All parameters stay visible', 'Volume, energy, intensity, pulse, bass, brightness, tempo, and variation are still fully editable in the music module.'],
      ['Failure no longer traps the flow', 'Even if the browser does not start audio immediately, body and food logging still remain usable.'],
    ];
    const sideNotesEs = [
      ['Ya no bloquea', 'La guía musical inicial ahora va en una tarjeta en línea y no tapa toda la página.'],
      ['Parámetros completos', 'Volumen, energía, intensidad, pulso, graves, brillo, tempo y variación siguen disponibles.'],
      ['Sin encierro', 'Aunque el navegador no inicie el audio al instante, el resto de la app sigue utilizable.'],
    ];
    const notes = uiLang() === 'zh' ? sideNotesZh : uiLang() === 'es' ? sideNotesEs : sideNotesEn;
    return `
      <div class="startup-guide-card">
        <article class="startup-guide-main">
          <h3>${escapeHtml(uiLang() === 'zh' ? `当前音乐：${genreText}` : uiLang() === 'es' ? `Música actual: ${genreText}` : `Current sound: ${genreText}`)}</h3>
          <p>${escapeHtml(uiLang() === 'zh' ? '音乐原来的那些参数没有被删，只是之前首屏只显示了简化版“选风格”，把完整实验室藏到了折叠模块里。现在我把它明确标出来，而且不再锁屏。' : uiLang() === 'es' ? 'Los controles musicales no se borraron; antes la primera pantalla solo mostraba una versión simplificada y escondía el laboratorio completo. Ahora queda explícito y no bloquea la app.' : 'The music controls were not removed; the old first-run screen only exposed a simplified picker and hid the full lab. Now it stays explicit and non-blocking.')}</p>
          ${startupGuidePillsForSound(snapshot)}
          <div class="startup-guide-pill-row">
            <span class="startup-guide-pill">${escapeHtml(uiLang() === 'zh' ? '持续背景模式' : uiLang() === 'es' ? 'Modo de fondo' : 'Background mode')} · ${escapeHtml(toggleShortText(snapshot.persistent))}</span>
            <span class="startup-guide-pill">${escapeHtml(uiLang() === 'zh' ? '自动变化' : uiLang() === 'es' ? 'Auto variación' : 'Auto morph')} · ${escapeHtml(toggleShortText(snapshot.autoMorph))}</span>
          </div>
        </article>
        <aside class="startup-guide-sidecard">
          <div class="target-pill-row"><span class="target-pill">${escapeHtml(uiLang() === 'zh' ? '避免整页失灵感' : uiLang() === 'es' ? 'Evitar sensación de bloqueo' : 'Avoid full-page freeze feel')}</span></div>
          <div class="startup-guide-note-list">${notes.map((item) => `<div class="startup-guide-note"><strong>${escapeHtml(item[0])}</strong><span>${escapeHtml(item[1])}</span></div>`).join('')}</div>
        </aside>
      </div>`;
  }
  if (step === 'profile') {
    const p = state.profile || defaultProfile();
    const detail = `${enumLabel(uiLang(), 'sex', p.sex)} · ${p.age} · ${round0(p.heightCm)} cm · ${round1(p.weightKg)} kg · ${enumLabel(uiLang(), 'goal', p.goal)}`;
    return `
      <div class="startup-guide-card">
        <article class="startup-guide-main">
          <h3>${escapeHtml(uiLang() === 'zh' ? '你现在的基础档案' : uiLang() === 'es' ? 'Tu perfil base actual' : 'Your current baseline')}</h3>
          <p>${escapeHtml(detail)}</p>
          <div class="startup-guide-pill-row">
            <span class="startup-guide-pill">${escapeHtml(enumLabel(uiLang(), 'activity', p.activity))}</span>
            <span class="startup-guide-pill">${escapeHtml(enumLabel(uiLang(), 'physiology', p.physiology))}</span>
            <span class="startup-guide-pill">${escapeHtml(enumLabel(uiLang(), 'glucose', p.glucoseStatus))}</span>
          </div>
          <p>${escapeHtml(uiLang() === 'zh' ? '这里的改动会直接影响热量、蛋白质、碳水、脂肪以及重点营养项的建议值。' : uiLang() === 'es' ? 'Esto afecta calorías, proteína, carbohidratos, grasas y objetivos nutricionales clave.' : 'This directly changes calories, protein, carbs, fat, and the key nutrient targets.')}</p>
        </article>
        <aside class="startup-guide-sidecard">
          <div class="startup-guide-note-list">
            <div class="startup-guide-note"><strong>${escapeHtml(uiLang() === 'zh' ? '先套预设再微调' : uiLang() === 'es' ? 'Empieza con un preset' : 'Start from a preset')}</strong><span>${escapeHtml(uiLang() === 'zh' ? '这样比从零填所有字段更快。' : uiLang() === 'es' ? 'Es mucho más rápido que llenar todo desde cero.' : 'Faster than filling every field from scratch.')}</span></div>
            <div class="startup-guide-note"><strong>${escapeHtml(uiLang() === 'zh' ? '保存后会自动折叠' : uiLang() === 'es' ? 'Se guarda y se pliega' : 'Save then fold away')}</strong><span>${escapeHtml(uiLang() === 'zh' ? '主舞台只保留你最常用的身体与饮食任务。' : uiLang() === 'es' ? 'El escenario principal se queda para cuerpo y comida.' : 'The main stage stays focused on body and food tasks.')}</span></div>
          </div>
        </aside>
      </div>`;
  }
  if (step === 'body') {
    const latest = bodyLatestSummary() || (uiLang() === 'zh' ? '还没有身体记录' : uiLang() === 'es' ? 'Aún no hay registro corporal' : 'No body record yet');
    return `
      <div class="startup-guide-card">
        <article class="startup-guide-main">
          <h3>${escapeHtml(uiLang() === 'zh' ? '3D 身体模型是主舞台' : uiLang() === 'es' ? 'El modelo corporal 3D es el escenario principal' : 'The 3D body model is the main stage')}</h3>
          <p>${escapeHtml(uiLang() === 'zh' ? '这里要看的是“相比上一次记录”怎么变，而不是只看一个静态体型。' : uiLang() === 'es' ? 'La idea es ver el cambio frente al registro anterior, no solo una forma estática.' : 'This is meant to show change versus the previous record, not just a static body shape.')}</p>
          <div class="startup-guide-pill-row">
            <span class="startup-guide-pill">${escapeHtml(latest)}</span>
            <span class="startup-guide-pill">${escapeHtml(uiLang() === 'zh' ? '支持前 / 侧 / 后' : uiLang() === 'es' ? 'Frente / lado / espalda' : 'Front / side / back')}</span>
            <span class="startup-guide-pill">${escapeHtml(uiLang() === 'zh' ? '支持热力变化层' : uiLang() === 'es' ? 'Capa de calor' : 'Heatmap layer')}</span>
          </div>
        </article>
        <aside class="startup-guide-sidecard">
          <div class="startup-guide-note-list">
            <div class="startup-guide-note"><strong>${escapeHtml(uiLang() === 'zh' ? '围度先行' : uiLang() === 'es' ? 'Primero medidas' : 'Measurements first')}</strong><span>${escapeHtml(uiLang() === 'zh' ? '胸、腰、臀、大腿、上臂等越完整，模型变化越直观。' : uiLang() === 'es' ? 'Cuanto más completas sean las medidas, más clara será la diferencia del modelo.' : 'The fuller the measurements, the clearer the model changes become.')}</span></div>
            <div class="startup-guide-note"><strong>${escapeHtml(uiLang() === 'zh' ? '回放感很重要' : uiLang() === 'es' ? 'Importa la sensación de replay' : 'Replay matters')}</strong><span>${escapeHtml(uiLang() === 'zh' ? '后面我已经把这块继续往可视化方向抬高。' : uiLang() === 'es' ? 'Ya está orientado a una lectura mucho más visual.' : 'This is now pushed further toward a more visual readout.')}</span></div>
          </div>
        </aside>
      </div>`;
  }
  if (step === 'food') {
    const snapshot = currentSnapshot();
    const gap = getTopGaps(snapshot, state.calc.targets, 1)[0];
    const gapText = gap ? `${nutrientName(gap.id)} ${L('needMore', { value: metric(gap.delta, gap.id) })}` : (uiLang() === 'zh' ? '核心目标已基本覆盖' : uiLang() === 'es' ? 'Objetivos principales bastante cubiertos' : 'Core targets mostly covered');
    return `
      <div class="startup-guide-card">
        <article class="startup-guide-main">
          <h3>${escapeHtml(uiLang() === 'zh' ? '饮食记录必须快' : uiLang() === 'es' ? 'Registrar comida debe ser rápido' : 'Food logging must stay fast')}</h3>
          <p>${escapeHtml(uiLang() === 'zh' ? '首页核心就是吃了什么、摄入多少、今天还差什么。搜索、收藏、快捷克重、组合餐都应该减少操作次数。' : uiLang() === 'es' ? 'El núcleo es qué comiste, cuánto fue y qué te falta hoy. Buscar, favoritos, gramos rápidos y combos deben ahorrar toques.' : 'The core is what you ate, how much, and what is still missing today. Search, favorites, quick grams, and combos should reduce taps.')}</p>
          <div class="startup-guide-pill-row">
            <span class="startup-guide-pill">${escapeHtml(L('dayCount', { count: getDayLog(state.date).items.filter((item) => item.type === 'food').length }))}</span>
            <span class="startup-guide-pill">${escapeHtml(L('waterCount', { amount: metric(snapshot.totals.water || 0, 'water') }))}</span>
            <span class="startup-guide-pill">${escapeHtml(gapText)}</span>
          </div>
        </article>
        <aside class="startup-guide-sidecard">
          <div class="startup-guide-note-list">
            <div class="startup-guide-note"><strong>${escapeHtml(uiLang() === 'zh' ? '搜索升级点' : uiLang() === 'es' ? 'Mejora de búsqueda' : 'Search upgrade')}</strong><span>${escapeHtml(uiLang() === 'zh' ? '我继续把中文场景、意图匹配和翻译细度往上推。' : uiLang() === 'es' ? 'Sigo empujando intención en chino, contexto y finura de traducción.' : 'I kept pushing Chinese intent, scenario matching, and translation precision further.')}</span></div>
            <div class="startup-guide-note"><strong>${escapeHtml(uiLang() === 'zh' ? '视觉化进度' : uiLang() === 'es' ? 'Progreso visual' : 'Visual progress')}</strong><span>${escapeHtml(uiLang() === 'zh' ? '下面的参考表现在已经变成更直观的卡片和条形模型。' : uiLang() === 'es' ? 'La referencia inferior ahora también se ve en tarjetas y barras.' : 'The reference section below now also has card and bar models.')}</span></div>
          </div>
        </aside>
      </div>`;
  }
  if (step === 'capture') {
    return `
      <div class="startup-guide-card">
        <article class="startup-guide-main">
          <h3>${escapeHtml(uiLang() === 'zh' ? '拍照 / OCR / 条码都要快进快出' : uiLang() === 'es' ? 'Foto / OCR / código debe entrar y salir rápido' : 'Capture, OCR, and barcode should stay quick in and quick out')}</h3>
          <p>${escapeHtml(uiLang() === 'zh' ? '这部分已经折叠收纳，但入口始终可见，避免占满首页。识别失败也可以直接手动修正后保存。' : uiLang() === 'es' ? 'Permanece plegado para no ocupar el inicio, pero la entrada siempre está visible. Si falla el reconocimiento, puedes corregir y guardar.' : 'This stays folded so it does not crowd the home screen, but the entry remains visible. Even if recognition fails, you can still edit and save manually.')}</p>
          <div class="startup-guide-pill-row">
            <span class="startup-guide-pill">OCR</span>
            <span class="startup-guide-pill">Barcode</span>
            <span class="startup-guide-pill">${escapeHtml(uiLang() === 'zh' ? '手动确认回写' : uiLang() === 'es' ? 'Confirmación manual' : 'Manual confirmation')}</span>
          </div>
        </article>
        <aside class="startup-guide-sidecard">
          <div class="startup-guide-note-list">
            <div class="startup-guide-note"><strong>${escapeHtml(uiLang() === 'zh' ? '不抢主舞台' : uiLang() === 'es' ? 'No roba el escenario principal' : 'Does not steal the main stage')}</strong><span>${escapeHtml(uiLang() === 'zh' ? '保持折叠，但点开后要立刻能用。' : uiLang() === 'es' ? 'Sigue plegado, pero al abrirlo debe servir enseguida.' : 'It stays folded, but should become immediately usable when opened.')}</span></div>
          </div>
        </aside>
      </div>`;
  }
  return `
    <div class="startup-guide-card">
      <article class="startup-guide-main">
        <h3>${escapeHtml(uiLang() === 'zh' ? '组合餐是高频复用层' : uiLang() === 'es' ? 'Los combos son la capa de reutilización' : 'Combos are the reuse layer')}</h3>
        <p>${escapeHtml(uiLang() === 'zh' ? '比如早餐组合、汉堡套餐、健身加餐、火锅常用搭配，都应该一键整套加入。' : uiLang() === 'es' ? 'Desayunos, combos de hamburguesa, snack post-entreno o hotpot deberían poder entrar de una vez.' : 'Breakfasts, burger sets, gym snacks, or hotpot combos should all be addable in one shot.')}</p>
        <div class="startup-guide-pill-row">
          <span class="startup-guide-pill">${escapeHtml(uiLang() === 'zh' ? `已存 ${state.combos?.length || 0} 个组合` : uiLang() === 'es' ? `${state.combos?.length || 0} combos guardados` : `${state.combos?.length || 0} combos saved`)}</span>
          <span class="startup-guide-pill">${escapeHtml(uiLang() === 'zh' ? '支持草稿 → 保存 → 复用' : uiLang() === 'es' ? 'Borrador → guardar → reutilizar' : 'Draft → save → reuse')}</span>
        </div>
      </article>
      <aside class="startup-guide-sidecard">
        <div class="startup-guide-note-list">
          <div class="startup-guide-note"><strong>${escapeHtml(uiLang() === 'zh' ? '真正减少点击' : uiLang() === 'es' ? 'Menos toques de verdad' : 'Actually reduce taps')}</strong><span>${escapeHtml(uiLang() === 'zh' ? '这块不是装饰，而是为了把高频饮食场景压成一键动作。' : uiLang() === 'es' ? 'No es decorativo: sirve para convertir escenarios repetidos en una sola acción.' : 'This is not decoration; it turns repeated eating scenarios into one action.')}</span></div>
        </div>
      </aside>
    </div>`;
}
function renderStartupGuideInline() {
  if (!DOM.startupGuide) return;
  if (!shouldShowOnboarding()) {
    DOM.startupGuide.hidden = true;
    return;
  }
  closeOnboarding();
  DOM.startupGuide.hidden = false;
  const idx = onboardingStepIndex();
  const step = startupGuideStepKey();
  const text = startupGuideStepStrings(step);
  if (DOM.startupGuideKicker) DOM.startupGuideKicker.textContent = `${uiLang() === 'zh' ? '首次引导' : uiLang() === 'es' ? 'Guía inicial' : 'First-run guide'} · ${startupGuideStepLabel(step)}`;
  if (DOM.startupGuideTitle) DOM.startupGuideTitle.textContent = text.title || startupGuideStepLabel(step);
  if (DOM.startupGuideText) DOM.startupGuideText.textContent = text.text || '';
  if (DOM.startupGuideModePill) DOM.startupGuideModePill.textContent = uiLang() === 'zh' ? '非阻塞引导 · 不锁屏' : uiLang() === 'es' ? 'Guía sin bloqueo' : 'Non-blocking guide';
  if (DOM.startupGuideProgress) {
    DOM.startupGuideProgress.innerHTML = ONBOARDING_STEPS_V15.map((_, i) => `<span class="startup-guide-dot ${i <= idx ? 'is-active' : ''}"></span>`).join('');
  }
  if (DOM.startupGuideBody) DOM.startupGuideBody.innerHTML = startupGuideBodyHtml(step);
  if (DOM.startupGuidePrevBtn) DOM.startupGuidePrevBtn.disabled = idx === 0;
  if (DOM.startupGuideNextBtn) DOM.startupGuideNextBtn.textContent = idx >= ONBOARDING_STEPS_V15.length - 1 ? (uiLang() === 'zh' ? '完成并开始使用' : uiLang() === 'es' ? 'Terminar y usar' : 'Finish and use') : (uiLang() === 'zh' ? '下一步' : uiLang() === 'es' ? 'Siguiente' : 'Next');
  if (DOM.startupGuideOpenBtn) DOM.startupGuideOpenBtn.textContent = startupGuideOpenLabel(step);
}
function startupGuideOpenCurrent() {
  openPanel(startupGuidePanel(startupGuideStepKey()));
}
function startupGuideNext() {
  if (onboardingStepIndex() >= ONBOARDING_STEPS_V15.length - 1) {
    finishOnboarding();
    renderStartupGuideInline();
    return;
  }
  setOnboardingStep(onboardingStepIndex() + 1);
  renderStartupGuideInline();
}
function startupGuidePrev() {
  setOnboardingStep(onboardingStepIndex() - 1);
  renderStartupGuideInline();
}
function handleStartupGuideKeys(event) {
  if (!shouldShowOnboarding()) return;
  const tag = String(event.target?.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select' || event.target?.isContentEditable) return;
  if (event.key === 'ArrowRight' || event.key === 'Enter') {
    event.preventDefault();
    startupGuideNext();
  } else if (event.key === 'ArrowLeft') {
    event.preventDefault();
    startupGuidePrev();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    finishOnboarding();
    renderStartupGuideInline();
  }
}
function radarPointString(values, radius = 78, center = 96) {
  const n = values.length;
  return values.map((value, idx) => {
    const angle = (-Math.PI / 2) + (Math.PI * 2 * idx / n);
    const r = radius * (clamp(Number(value) || 0, 0, 5) / 5);
    const x = center + Math.cos(angle) * r;
    const y = center + Math.sin(angle) * r;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}
function radarAxisMarks(count, radius = 78, center = 96) {
  return Array.from({ length: count }).map((_, idx) => {
    const angle = (-Math.PI / 2) + (Math.PI * 2 * idx / count);
    const x = center + Math.cos(angle) * radius;
    const y = center + Math.sin(angle) * radius;
    return `<line x1="${center}" y1="${center}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(15,23,42,0.10)" stroke-width="1" />`;
  }).join('');
}
function radarRings(count, radius = 78, center = 96) {
  return Array.from({ length: count }).map((_, idx) => {
    const v = ((idx + 1) / count) * 5;
    return `<polygon points="${radarPointString(Array.from({ length: 7 }).map(() => v), radius, center)}" fill="none" stroke="rgba(15,23,42,0.08)" stroke-width="1" />`;
  }).join('');
}
function soundFillClassFromValue(value) {
  return Number(value) >= 4 ? 'risk' : Number(value) >= 3 ? 'warn' : 'safe';
}
function renderSoundVisualBoard(snapshot = initMusicController().getState()) {
  if (!DOM.soundVisualBoard) return;
  const axes = [
    { key: 'energy', label: L('musicEnergyLabel'), value: Number(snapshot.energy) || 3 },
    { key: 'intensity', label: L('musicIntensityLabel'), value: Number(snapshot.intensity) || 3 },
    { key: 'pulse', label: L('musicPulseLabel'), value: Number(snapshot.pulse) || 3 },
    { key: 'bass', label: L('musicBassLabel'), value: Number(snapshot.bass) || 3 },
    { key: 'brightness', label: L('musicBrightnessLabel'), value: Number(snapshot.brightness) || 3 },
    { key: 'tempo', label: L('musicTempoLabel'), value: Number(snapshot.tempo) || 3 },
    { key: 'variation', label: L('musicVariationLabel'), value: Number(snapshot.variation) || 3 },
  ];
  const dataPoints = radarPointString(axes.map((axis) => axis.value));
  const framePoints = radarPointString(axes.map(() => 5));
  const bars = axes.map((axis) => {
    const width = Math.round((axis.value / 5) * 100);
    return `
      <div class="sound-meter-item">
        <div class="sound-meter-head"><span>${escapeHtml(axis.label)}</span><span>${escapeHtml(axis.value + '/5')}</span></div>
        <div class="sound-meter-track"><span class="sound-meter-fill" style="width:${width}%"></span></div>
        <div class="sound-meter-sub">${escapeHtml(soundAxisHint(axis.key, axis.value))}</div>
      </div>`;
  }).join('');
  const pills = [
    `${L('musicVolumeLabel')} ${snapshot.volume}%`,
    `${L('musicTempoLabel')} ${snapshot.effectiveBpm || snapshot.genre?.bpm || 0} BPM`,
    `${L('musicPersistentLabel')} ${toggleShortText(snapshot.persistent)}`,
    `${L('musicAutoMorphLabel')} ${toggleShortText(snapshot.autoMorph)}`,
  ];
  DOM.soundVisualBoard.innerHTML = `
    <div class="sound-visual-hero">
      <article class="sound-visual-card">
        <div class="sound-radar-wrap">
          <svg viewBox="0 0 192 192" aria-label="sound radar">
            ${radarAxisMarks(axes.length)}
            ${radarRings(5)}
            <polygon points="${framePoints}" fill="rgba(148,163,184,0.06)" stroke="rgba(15,23,42,0.08)" stroke-width="1"></polygon>
            <polygon points="${dataPoints}" fill="rgba(10,132,255,0.18)" stroke="rgba(10,132,255,0.92)" stroke-width="2.5"></polygon>
            ${axes.map((axis, idx) => {
              const angle = (-Math.PI / 2) + (Math.PI * 2 * idx / axes.length);
              const x = 96 + Math.cos(angle) * 90;
              const y = 96 + Math.sin(angle) * 90;
              return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="9" text-anchor="middle" fill="#475569">${escapeHtml(axis.label.slice(0, 4))}</text>`;
            }).join('')}
          </svg>
        </div>
        <div class="sound-radar-caption">${escapeHtml(uiLang() === 'zh' ? '把 7 条核心音色轴做成雷达图，方便一眼看当前节奏轮廓。' : uiLang() === 'es' ? 'Las 7 líneas sonoras principales se dibujan como radar para leer el perfil de un vistazo.' : 'The 7 main sonic axes are drawn as a radar so you can read the current profile at a glance.')}</div>
      </article>
      <article class="sound-visual-card">
        <div class="sound-meter-board">${bars}</div>
      </article>
    </div>
    <div class="sound-pill-row">${pills.map((pill) => `<span class="sound-pill">${escapeHtml(pill)}</span>`).join('')}</div>`;
}
function bytesToMiB(bytes) {
  return `${(Number(bytes || 0) / (1024 * 1024)).toFixed(2)} MiB`;
}
function targetFillToneClass(ev) {
  if (!ev) return 'muted';
  if (ev.status === 'good') return 'safe';
  if (ev.status === 'warn' || ev.status === 'low') return 'warn';
  return 'risk';
}
function renderTargetsVisualGrid() {
  if (!DOM.targetsVisualGrid || !state.calc?.targets) return;
  const totals = currentTotals();
  const priority = ['kcal', 'protein', 'carbs', 'fat', 'fiber', 'sodium', 'water', 'calcium', 'iron', 'vitaminC'];
  const ids = priority.filter((id) => state.calc.targets[id]).slice(0, 8);
  DOM.targetsVisualGrid.innerHTML = ids.map((id) => {
    const target = state.calc.targets[id];
    const intake = totals[id] || 0;
    const ev = evaluateTarget(target, intake);
    const width = Math.max(6, Math.round((ev?.fill || 0) * 100));
    return `
      <article class="target-visual-card">
        <div class="target-visual-head">
          <div>
            <h3>${escapeHtml(nutrientName(id))}</h3>
            <div class="target-visual-meta">${escapeHtml(targetToText(target))}</div>
          </div>
          <span class="top-pill subtle">${escapeHtml(statusText(ev))}</span>
        </div>
        <div class="target-pill-row">
          <span class="target-pill">${escapeHtml(uiLang() === 'zh' ? `当前 ${metric(intake, id)}` : uiLang() === 'es' ? `Actual ${metric(intake, id)}` : `Current ${metric(intake, id)}`)}</span>
          <span class="target-pill">${escapeHtml(targetTypeText(target.type))}</span>
        </div>
        <div class="target-track"><span class="target-fill ${targetFillToneClass(ev)}" style="width:${width}%"></span></div>
        <div class="target-visual-foot"><span>${escapeHtml(detailText(ev, id))}</span><span>${escapeHtml(translateTargetNote(target))}</span></div>
      </article>`;
  }).join('');
}
function renderDatasetVisualBoard() {
  const meta = regionMeta();
  if (!DOM.datasetVisualBoard || !DOM.translationVisualBoard || !meta) return;
  const stats = meta.stats || {};
  const deliveryFiles = meta.delivery?.files || [];
  const maxBytes = deliveryFiles.reduce((max, file) => Math.max(max, Number(file.size_bytes || 0)), 0);
  const browserLimit = 25 * 1024 * 1024;
  const active = resolvedFoodRegion();
  const totalRows = Number(stats.total_rows_seen || stats.rows_kept || 0);
  const rowsKept = Number(stats.rows_kept || 0);
  const rowsWithName = Number(stats.rows_with_name || stats.rows_kept || 0);
  const rowsWithEnergy = Number(stats.rows_with_energy || stats.rows_kept || 0);
  const zhCount = Number(stats.rows_with_zh_name || rowsKept || 0);
  const cards = [
    {
      title: uiLang() === 'zh' ? '当前激活库' : uiLang() === 'es' ? 'Biblioteca activa' : 'Active library',
      meta: active === 'cn' ? (uiLang() === 'zh' ? '中国优先' : uiLang() === 'es' ? 'China primero' : 'China first') : (uiLang() === 'zh' ? '国际优先' : uiLang() === 'es' ? 'Global primero' : 'Global first'),
      pills: [
        active === 'cn' ? (uiLang() === 'zh' ? '中文友好场景' : uiLang() === 'es' ? 'Escena china' : 'China-first scene') : (uiLang() === 'zh' ? '品牌 / 条码 / 包装食品' : uiLang() === 'es' ? 'Marcas / código / envasado' : 'Brands / barcode / packaged'),
        `${fmtInt(rowsKept)} ${uiLang() === 'zh' ? '条可搜' : uiLang() === 'es' ? 'buscables' : 'searchable'}`,
      ],
      width: Math.round((rowsKept / Math.max(totalRows || rowsKept || 1, 1)) * 100),
      footL: active === 'cn' ? (uiLang() === 'zh' ? '更适合中国食材和家常输入' : uiLang() === 'es' ? 'Mejor para ingredientes comunes' : 'Better for common ingredients') : (uiLang() === 'zh' ? '更适合品牌食品与国际搜索' : uiLang() === 'es' ? 'Mejor para marcas y búsqueda global' : 'Better for branded / global search'),
      footR: meta.translation_mode || '—',
    },
    {
      title: uiLang() === 'zh' ? '可搜索覆盖' : uiLang() === 'es' ? 'Cobertura usable' : 'Usable coverage',
      meta: totalRows ? `${fmtInt(rowsKept)} / ${fmtInt(totalRows)}` : fmtInt(rowsKept),
      pills: [
        `${uiLang() === 'zh' ? '名称' : uiLang() === 'es' ? 'Nombre' : 'Name'} ${fmtInt(rowsWithName)}`,
        `${uiLang() === 'zh' ? '能量' : uiLang() === 'es' ? 'Energía' : 'Energy'} ${fmtInt(rowsWithEnergy)}`,
        `${uiLang() === 'zh' ? '中文显示名' : uiLang() === 'es' ? 'Nombres chinos' : 'Chinese labels'} ${fmtInt(zhCount)}`,
      ],
      width: Math.round((rowsWithName / Math.max(totalRows || rowsWithName || 1, 1)) * 100),
      footL: uiLang() === 'zh' ? '把原始行压缩成网页里真正可用的部分' : uiLang() === 'es' ? 'Convierte filas brutas en una parte utilizable dentro de la web' : 'Compresses raw rows into the part that is actually usable on the web',
      footR: uiLang() === 'zh' ? '搜索与统计都基于这层' : uiLang() === 'es' ? 'Búsqueda y cálculo parten de aquí' : 'Search and stats are based on this layer',
    },
    {
      title: uiLang() === 'zh' ? '网页上传安全线' : uiLang() === 'es' ? 'Límite seguro web' : 'Web upload safety',
      meta: `${bytesToMiB(maxBytes)} / ${bytesToMiB(browserLimit)}`,
      pills: [
        `${uiLang() === 'zh' ? '分片数' : uiLang() === 'es' ? 'Partes' : 'Parts'} ${deliveryFiles.length}`,
        `${uiLang() === 'zh' ? '单文件上限' : uiLang() === 'es' ? 'Máx. por archivo' : 'Single-file cap'} 25 MiB`,
      ],
      width: Math.round((maxBytes / browserLimit) * 100),
      footL: uiLang() === 'zh' ? '控的是单文件，不是整个压缩包。' : uiLang() === 'es' ? 'Se controla el archivo individual, no el zip completo.' : 'The control is per file, not per whole zip.',
      footR: meta.delivery?.mode || '—',
    },
  ];
  DOM.datasetVisualBoard.innerHTML = cards.map((card) => `
    <article class="data-visual-card">
      <div class="data-visual-head"><div><h3>${escapeHtml(card.title)}</h3><div class="data-visual-meta">${escapeHtml(card.meta)}</div></div><span class="top-pill subtle">${escapeHtml(card.footR)}</span></div>
      <div class="data-pill-row">${(card.pills || []).map((pill) => `<span class="data-pill">${escapeHtml(pill)}</span>`).join('')}</div>
      <div class="data-track"><span class="data-fill" style="width:${Math.max(8, Math.min(100, Number(card.width) || 0))}%"></span></div>
      <div class="data-visual-foot"><span>${escapeHtml(card.footL)}</span><span>${escapeHtml(card.footR)}</span></div>
    </article>`).join('');

  const translationBoards = [
    {
      title: uiLang() === 'zh' ? '翻译细化优先级' : uiLang() === 'es' ? 'Prioridad de traducción' : 'Translation priorities',
      pills: [
        uiLang() === 'zh' ? '部位 / 状态 / 做法 / 风味' : uiLang() === 'es' ? 'Parte / estado / proceso / sabor' : 'Cut / state / process / flavor',
        uiLang() === 'zh' ? '避免只剩“大类名”' : uiLang() === 'es' ? 'Evitar nombres demasiado genéricos' : 'Avoid over-generic labels',
      ],
      items: [
        ['Goldfish', uiLang() === 'zh' ? '金鱼形饼干' : uiLang() === 'es' ? 'galletas Goldfish' : 'goldfish crackers'],
        ['Swedish Fish', uiLang() === 'zh' ? '瑞典鱼软糖' : uiLang() === 'es' ? 'gomitas Swedish Fish' : 'Swedish Fish candy'],
        ['Fruit Snacks', uiLang() === 'zh' ? '果味软糖' : uiLang() === 'es' ? 'snack gomoso de fruta' : 'fruit gummy snack'],
      ],
    },
    {
      title: uiLang() === 'zh' ? '奶酪 / 牛奶类去泛化' : uiLang() === 'es' ? 'Desambiguación de leche y queso' : 'De-genericizing milk and cheese',
      pills: [
        uiLang() === 'zh' ? '避免“牛奶 / 奶酪”一刀切' : uiLang() === 'es' ? 'Evitar “leche / queso” genérico' : 'Avoid one-size-fits-all milk / cheese',
        uiLang() === 'zh' ? '结合分类路径补主体名' : uiLang() === 'es' ? 'Usar categoría para recuperar el sustantivo' : 'Use category paths to recover the real noun',
      ],
      items: [
        ['Monterey Jack Whole Milk Cheese', uiLang() === 'zh' ? '蒙特利杰克全脂奶酪' : uiLang() === 'es' ? 'queso Monterey Jack entero' : 'Monterey Jack whole milk cheese'],
        ['fromage blanc', uiLang() === 'zh' ? '法式白奶酪' : uiLang() === 'es' ? 'fromage blanc' : 'fromage blanc cheese'],
        ['Peter Pan Creamy', uiLang() === 'zh' ? '顺滑花生酱' : uiLang() === 'es' ? 'mantequilla de cacahuate cremosa' : 'creamy peanut butter'],
      ],
    },
    {
      title: uiLang() === 'zh' ? '原味 / 有机回填主体' : uiLang() === 'es' ? 'Rellenar “natural / orgánico” con el sustantivo' : 'Backfilling nouns for plain / organic',
      pills: [
        uiLang() === 'zh' ? '原味薯片 / 原味酸奶 / 有机面包' : uiLang() === 'es' ? 'patatas naturales / yogur natural / pan orgánico' : 'plain chips / plain yogurt / organic bread',
        uiLang() === 'zh' ? '不再只剩“原味 / 有机”' : uiLang() === 'es' ? 'No dejar solo “natural / orgánico”' : 'No longer leaving just “plain / organic”',
      ],
      items: [
        [uiLang() === 'zh' ? '原味 chips' : 'Plain chips', uiLang() === 'zh' ? '原味薯片' : uiLang() === 'es' ? 'papas naturales' : 'plain potato chips'],
        [uiLang() === 'zh' ? '原味 yogurt' : 'Plain yogurt', uiLang() === 'zh' ? '原味酸奶' : uiLang() === 'es' ? 'yogur natural' : 'plain yogurt'],
        [uiLang() === 'zh' ? 'organic bread' : 'organic bread', uiLang() === 'zh' ? '有机面包' : uiLang() === 'es' ? 'pan orgánico' : 'organic bread'],
      ],
    },
    {
      title: uiLang() === 'zh' ? '上传与部署不再混淆' : uiLang() === 'es' ? 'Subida y despliegue sin confusión' : 'Upload and deploy without confusion',
      pills: [
        uiLang() === 'zh' ? '网页上传包 = 根目录可直接拖' : uiLang() === 'es' ? 'Paquete web = raíz lista para arrastrar' : 'Web upload package = root-ready drag upload',
        uiLang() === 'zh' ? '源码包 = docs / scripts / 说明' : uiLang() === 'es' ? 'Paquete fuente = docs / scripts / guías' : 'Source package = docs / scripts / docs',
      ],
      items: [
        [uiLang() === 'zh' ? 'root-ready' : 'root-ready', uiLang() === 'zh' ? '解压后直接是 index.html / assets / data' : uiLang() === 'es' ? 'al descomprimir queda index.html / assets / data' : 'unzips directly to index.html / assets / data'],
        [uiLang() === 'zh' ? 'full-source' : 'full-source', uiLang() === 'zh' ? '整仓推送时再配 Pages = main /docs' : uiLang() === 'es' ? 'para subir el repo completo, Pages = main /docs' : 'use Pages = main /docs when pushing the full source repo'],
      ],
    },
  ];
  DOM.translationVisualBoard.innerHTML = translationBoards.map((board) => `
    <article class="translation-visual-card">
      <h3>${escapeHtml(board.title)}</h3>
      <div class="translation-pill-row">${board.pills.map((pill) => `<span class="translation-pill">${escapeHtml(pill)}</span>`).join('')}</div>
      <div class="translation-list">${board.items.map((item) => `<div class="translation-example"><code>${escapeHtml(item[0])}</code><div class="translation-arrow">→</div><strong>${escapeHtml(item[1])}</strong></div>`).join('')}</div>
    </article>`).join('');
}

const legacyRenderSoundPanelV19 = renderSoundPanel;
renderSoundPanel = function renderSoundPanelV19() {
  legacyRenderSoundPanelV19();
  renderSoundVisualBoard();
};

const legacyRenderReferenceV19 = renderReference;
renderReference = function renderReferenceV19() {
  legacyRenderReferenceV19();
  renderTargetsVisualGrid();
};

const legacyRenderDatasetMetaV19 = renderDatasetMeta;
renderDatasetMeta = function renderDatasetMetaV19() {
  legacyRenderDatasetMetaV19();
  renderDatasetVisualBoard();
};

const legacyRenderModuleHubV19 = renderModuleHub;
renderModuleHub = function renderModuleHubV19() {
  legacyRenderModuleHubV19();
  const snapshot = initMusicController().getState();
  const genreText = snapshot.genre?.labels?.[uiLang()] || snapshot.genre?.labels?.zh || '—';
  if (DOM.moduleSoundStatus) {
    DOM.moduleSoundStatus.textContent = uiLang() === 'zh'
      ? `${genreText} · 8 参数实验室随时可调`
      : uiLang() === 'es'
        ? `${genreText} · 8 parámetros siempre visibles`
        : `${genreText} · 8 parameters always available`;
  }
};

const legacyRenderAllV19 = renderAll;
renderAll = function renderAllV19() {
  legacyRenderAllV19();
  renderStartupGuideInline();
  renderTargetsVisualGrid();
  renderDatasetVisualBoard();
};

const legacyApplyLanguageV19 = applyLanguage;
applyLanguage = function applyLanguageV19() {
  legacyApplyLanguageV19();
  renderStartupGuideInline();
  renderTargetsVisualGrid();
  renderDatasetVisualBoard();
};

const legacyBindEventsV19 = bindEvents;
bindEvents = function bindEventsV19() {
  legacyBindEventsV19();
  DOM.startupGuidePrevBtn?.addEventListener('click', startupGuidePrev);
  DOM.startupGuideNextBtn?.addEventListener('click', startupGuideNext);
  DOM.startupGuideSkipBtn?.addEventListener('click', () => {
    finishOnboarding();
    renderStartupGuideInline();
  });
  DOM.startupGuideOpenBtn?.addEventListener('click', startupGuideOpenCurrent);
  document.addEventListener('keydown', handleStartupGuideKeys);
};

maybeLaunchOnboarding = function maybeLaunchOnboardingV19() {
  closeOnboarding();
  renderStartupGuideInline();
};

window.addEventListener('DOMContentLoaded', () => {
  closeOnboarding();
  renderStartupGuideInline();
  renderTargetsVisualGrid();
  renderDatasetVisualBoard();
});


/* ===== v20 immersive hero home / stale-cache hardening / inline capture ===== */
Object.assign(TEXTS.zh, {
  headerEyebrow: '3D 主视觉 · 实时营养联动 · 本地保存',
  headerText: '先定音乐氛围，再录身体参数生成 3D 人体模型；接着在同一主界面里输入饮食、拍照上传，并实时查看营养进度。',
  quickActionProfile: '身体与参数',
  quickActionLog: '输入摄入',
  quickActionMusic: '音乐氛围',
  quickActionScan: '拍照上传',
  musicSaveCollapseBtn: '音乐调好了，收起来',
  musicCompactNote: '先定音乐，再进入身体参数与饮食记录。',
  foodRealtimeTitle: '实时联动进度',
  foodRealtimeHint: '每次加一条食物或饮水，下面进度会立刻联动刷新。',
  foodRealtimeEmpty: '先记一条食物或饮水，实时进度会出现在这里。',
  foodRealtimeReach: '已达目标',
  foodRealtimeNeed: '仍需补',
  foodRealtimeLess: '建议少一点',
  foodRealtimeStable: '当前平衡',
  foodCaptureInlineTitle: '拍照上传',
  foodCaptureInlineHint: '上传包装图后，可直接识别营养表或条码。',
  foodCaptureInlineReady: '图片已放入识别器：{name}',
  foodCaptureInlineIdle: '未选择图片',
  foodCaptureInlineUseOcr: '识别营养表',
  foodCaptureInlineUseBarcode: '识别条码',
  foodCaptureInlineOpenAdvanced: '打开高级识别区',
  foodCaptureInlineNeedImage: '请先选择图片。',
  soundSectionHint: '先把音乐参数定下来，保存后会自动折叠。',
  soundPanelSummaryReady: '音乐参数已设好，可随时再展开细调。',
  immersiveHubTitle: '点击人体，展开功能',
  immersiveHubHint: '首页聚焦 3D 人体、身体设置、营养进度与输入摄入；其余功能默认折叠。',
});
Object.assign(TEXTS.en, {
  headerEyebrow: '3D hero · real-time nutrition sync · local only',
  headerText: 'Set the music mood first, then enter body data to generate a 3D body model; after that, log foods, upload photos, and watch nutrition progress update in real time from the same home screen.',
  quickActionProfile: 'Body & profile',
  quickActionLog: 'Log intake',
  quickActionMusic: 'Music mood',
  quickActionScan: 'Upload photo',
  musicSaveCollapseBtn: 'Done with music, fold it',
  musicCompactNote: 'Set the music tone first, then move into body inputs and food logging.',
  foodRealtimeTitle: 'Real-time progress',
  foodRealtimeHint: 'Every added food or water entry updates this board instantly.',
  foodRealtimeEmpty: 'Add one food or water entry to light up the live board.',
  foodRealtimeReach: 'On target',
  foodRealtimeNeed: 'Still needed',
  foodRealtimeLess: 'Ease off a bit',
  foodRealtimeStable: 'Balanced now',
  foodCaptureInlineTitle: 'Photo upload',
  foodCaptureInlineHint: 'Upload a package photo to run OCR or barcode search directly.',
  foodCaptureInlineReady: 'Image ready in recognizer: {name}',
  foodCaptureInlineIdle: 'No image selected',
  foodCaptureInlineUseOcr: 'Run OCR',
  foodCaptureInlineUseBarcode: 'Read barcode',
  foodCaptureInlineOpenAdvanced: 'Open advanced capture',
  foodCaptureInlineNeedImage: 'Choose an image first.',
  soundSectionHint: 'Lock in the music settings first; it folds away after saving.',
  soundPanelSummaryReady: 'Music is set. Reopen any time for fine tuning.',
  immersiveHubTitle: 'Tap the body to open tools',
  immersiveHubHint: 'Home now focuses on the 3D body, body setup, nutrition progress, and food input; the rest stays folded.',
});
Object.assign(TEXTS.es, {
  headerEyebrow: 'Hero 3D · nutrición en tiempo real · guardado local',
  headerText: 'Primero ajusta la música; después introduce datos corporales para generar el modelo 3D. Luego registra comidas, sube fotos y ve el progreso nutricional en tiempo real desde la misma pantalla principal.',
  quickActionProfile: 'Cuerpo y perfil',
  quickActionLog: 'Registrar ingesta',
  quickActionMusic: 'Ambiente musical',
  quickActionScan: 'Subir foto',
  musicSaveCollapseBtn: 'Música lista, plegar',
  musicCompactNote: 'Primero fija el ambiente musical; luego sigue con cuerpo y comidas.',
  foodRealtimeTitle: 'Progreso en tiempo real',
  foodRealtimeHint: 'Cada comida o agua añadida actualiza esta vista al instante.',
  foodRealtimeEmpty: 'Añade una comida o agua para activar el panel en vivo.',
  foodRealtimeReach: 'Objetivo logrado',
  foodRealtimeNeed: 'Aún falta',
  foodRealtimeLess: 'Conviene bajar',
  foodRealtimeStable: 'Ahora equilibrado',
  foodCaptureInlineTitle: 'Subir foto',
  foodCaptureInlineHint: 'Sube una foto del envase para usar OCR o leer el código de barras al momento.',
  foodCaptureInlineReady: 'Imagen lista en el reconocedor: {name}',
  foodCaptureInlineIdle: 'No hay imagen seleccionada',
  foodCaptureInlineUseOcr: 'Usar OCR',
  foodCaptureInlineUseBarcode: 'Leer código',
  foodCaptureInlineOpenAdvanced: 'Abrir captura avanzada',
  foodCaptureInlineNeedImage: 'Elige primero una imagen.',
  soundSectionHint: 'Primero deja lista la música; después se pliega sola.',
  soundPanelSummaryReady: 'La música ya está lista. Puedes volver a abrirla cuando quieras.',
  immersiveHubTitle: 'Toca el cuerpo para abrir funciones',
  immersiveHubHint: 'La portada ahora se centra en el cuerpo 3D, la configuración corporal, el progreso nutricional y la ingesta; el resto queda plegado.',
});

Object.assign(FOLD_DEFAULTS, {
  profile: true,
  food: true,
  today: false,
  capture: false,
  reference: false,
  data: false,
  sound: true,
  combo: false,
});
STORAGE.folds = 'haochijia.folds.v20';
state.folds = loadFolds();

const HOME_V20_STORAGE = {
  musicDone: 'haochijia.v20.music.done',
  cacheCleanup: 'haochijia.v20.cache.cleanup',
  swReset: 'haochijia.v20.sw.reset',
};
let immersiveHomeReadyV20 = false;
let immersiveFoodBoardBuiltV20 = false;

function readFlagV20(key) {
  try { return localStorage.getItem(key) === '1'; } catch { return false; }
}
function writeFlagV20(key, value = true) {
  try { localStorage.setItem(key, value ? '1' : '0'); } catch {}
}
function markMusicSetupDoneV20() {
  writeFlagV20(HOME_V20_STORAGE.musicDone, true);
}
function isMusicSetupDoneV20() {
  return readFlagV20(HOME_V20_STORAGE.musicDone);
}

function ensureSoundToolsV20() {
  const soundActions = document.querySelector('#soundPanel .fold-actions');
  if (soundActions && !document.getElementById('musicSaveCollapseBtn')) {
    const btn = document.createElement('button');
    btn.className = 'ghost-btn compact-btn sound-save-collapse';
    btn.type = 'button';
    btn.id = 'musicSaveCollapseBtn';
    btn.textContent = L('musicSaveCollapseBtn');
    soundActions.prepend(btn);
  }
  const soundSummary = document.getElementById('soundSummary');
  if (soundSummary && !document.getElementById('soundPanelHint')) {
    const hint = document.createElement('div');
    hint.className = 'muted small sound-panel-hint';
    hint.id = 'soundPanelHint';
    hint.textContent = L('soundSectionHint');
    soundSummary.insertAdjacentElement('afterend', hint);
  }
}

function ensureDynamicFoodToolsV20() {
  if (immersiveFoodBoardBuiltV20) return;
  const quickMain = document.querySelector('#foodPanel .quick-main');
  const searchCard = document.querySelector('#foodPanel .sub-card .food-search-results')?.closest('.sub-card');
  if (searchCard) {
    const realtime = document.createElement('section');
    realtime.className = 'sub-card food-live-board-card';
    realtime.id = 'foodRealtimeBoardCard';
    realtime.innerHTML = `
      <div class="mini-title">${escapeHtml(L('foodRealtimeTitle'))}</div>
      <div class="muted small food-live-board-hint">${escapeHtml(L('foodRealtimeHint'))}</div>
      <div class="food-live-board" id="foodRealtimeBoard"></div>
    `;
    searchCard.insertAdjacentElement('beforebegin', realtime);
  }
  if (quickMain && !document.getElementById('foodCaptureInlineCard')) {
    const capture = document.createElement('section');
    capture.className = 'sub-card food-capture-inline-card';
    capture.id = 'foodCaptureInlineCard';
    capture.innerHTML = `
      <div class="capture-inline-head">
        <div>
          <div class="mini-title">${escapeHtml(L('foodCaptureInlineTitle'))}</div>
          <div class="muted small">${escapeHtml(L('foodCaptureInlineHint'))}</div>
        </div>
        <button class="ghost-btn compact-btn" type="button" id="foodCaptureInlineOpenAdvanced">${escapeHtml(L('foodCaptureInlineOpenAdvanced'))}</button>
      </div>
      <label class="field upload-field-inline">
        <span>${escapeHtml(L('foodCaptureInlineTitle'))}</span>
        <input id="foodCaptureInlineInput" type="file" accept="image/*" capture="environment">
      </label>
      <div class="capture-inline-actions">
        <button class="primary-btn compact-btn" type="button" id="foodCaptureInlineRunBtn">${escapeHtml(L('foodCaptureInlineUseOcr'))}</button>
        <button class="ghost-btn compact-btn" type="button" id="foodCaptureInlineBarcodeBtn">${escapeHtml(L('foodCaptureInlineUseBarcode'))}</button>
      </div>
      <div class="muted small" id="foodCaptureInlineStatus">${escapeHtml(L('foodCaptureInlineIdle'))}</div>
    `;
    const waterBlock = quickMain.querySelector('.water-block');
    if (waterBlock?.nextElementSibling) waterBlock.nextElementSibling.insertAdjacentElement('afterend', capture);
    else quickMain.appendChild(capture);
  }
  immersiveFoodBoardBuiltV20 = true;
}
function refreshDynamicNodesV20() {
  DOM.foodRealtimeBoard = document.getElementById('foodRealtimeBoard');
  DOM.foodCaptureInlineInput = document.getElementById('foodCaptureInlineInput');
  DOM.foodCaptureInlineStatus = document.getElementById('foodCaptureInlineStatus');
  DOM.foodCaptureInlineRunBtn = document.getElementById('foodCaptureInlineRunBtn');
  DOM.foodCaptureInlineBarcodeBtn = document.getElementById('foodCaptureInlineBarcodeBtn');
  DOM.foodCaptureInlineOpenAdvanced = document.getElementById('foodCaptureInlineOpenAdvanced');
  DOM.musicSaveCollapseBtn = document.getElementById('musicSaveCollapseBtn');
  DOM.soundPanelHint = document.getElementById('soundPanelHint');
}
function buildRealtimeMetricV20(id, label, snapshot, target) {
  const intake = snapshot.totals[id] || 0;
  const ev = target ? evaluateTarget(target, intake) : null;
  const fill = Math.max(0, Math.min(ev?.fill ?? 0, 1));
  const status = ev?.status || 'good';
  const value = metric(intake, id);
  let aside = L('foodRealtimeStable');
  if (status === 'low') aside = `${L('foodRealtimeNeed')} ${metric(ev.delta, id)}`;
  else if (status === 'high') aside = `${L('foodRealtimeLess')} ${metric(ev.delta, id)}`;
  else if (status === 'good') aside = target ? L('foodRealtimeReach') : L('foodRealtimeStable');
  else if (status === 'warn') aside = L('foodRealtimeStable');
  return `
    <article class="food-live-item status-${escapeHtml(status)}">
      <div class="food-live-item-head">
        <strong>${escapeHtml(label)}</strong>
        <span>${escapeHtml(value)}</span>
      </div>
      <div class="food-live-bar"><span style="width:${Math.round(fill * 100)}%"></span></div>
      <div class="food-live-meta">${escapeHtml(aside)}</div>
    </article>
  `;
}
function renderFoodRealtimeBoardV20() {
  if (!DOM.foodRealtimeBoard) return;
  const snapshot = realtimeNutritionSnapshotV24();
  const targets = state.calc?.targets || {};
  const foodCount = snapshot.totalFoodCount || 0;
  const waterMl = snapshot.totals.water || 0;
  if (!foodCount && !waterMl) {
    DOM.foodRealtimeBoard.innerHTML = `<div class="food-live-empty">${escapeHtml(L('foodRealtimeEmpty'))}</div>`;
    return;
  }
  DOM.foodRealtimeBoard.innerHTML = [
    buildRealtimeMetricV20('kcal', nutrientName('kcal'), snapshot, targets.kcal),
    buildRealtimeMetricV20('protein', nutrientName('protein'), snapshot, targets.protein),
    buildRealtimeMetricV20('fiber', nutrientName('fiber'), snapshot, targets.fiber),
    buildRealtimeMetricV20('water', nutrientName('water'), snapshot, targets.water),
  ].join('');
}
function transferInlineCaptureToMainInputV20(file) {
  if (!file || !DOM.ocrImageInput) return false;
  try {
    const dt = new DataTransfer();
    dt.items.add(file);
    DOM.ocrImageInput.files = dt.files;
    updateOcrPreview();
    if (DOM.foodCaptureInlineStatus) DOM.foodCaptureInlineStatus.textContent = L('foodCaptureInlineReady', { name: file.name });
    return true;
  } catch (err) {
    console.warn(err);
    if (DOM.foodCaptureInlineStatus) DOM.foodCaptureInlineStatus.textContent = file.name;
    return false;
  }
}
function inlineCaptureHasFileV20() {
  const file = DOM.foodCaptureInlineInput?.files?.[0];
  return Boolean(file);
}
async function runInlineCaptureActionV20(mode = 'ocr') {
  const file = DOM.foodCaptureInlineInput?.files?.[0];
  if (!file) {
    if (DOM.foodCaptureInlineStatus) DOM.foodCaptureInlineStatus.textContent = L('foodCaptureInlineNeedImage');
    return;
  }
  transferInlineCaptureToMainInputV20(file);
  setPanelState('capture', true, false);
  openPanel('capture');
  if (mode === 'barcode') await detectBarcodeFromImage();
  else await runOCR();
}
function bindDynamicFoodToolEventsV20() {
  refreshDynamicNodesV20();
  if (DOM.foodCaptureInlineInput && !DOM.foodCaptureInlineInput.dataset.boundV20) {
    DOM.foodCaptureInlineInput.dataset.boundV20 = '1';
    DOM.foodCaptureInlineInput.addEventListener('change', () => {
      const file = DOM.foodCaptureInlineInput.files?.[0];
      if (!file) {
        if (DOM.foodCaptureInlineStatus) DOM.foodCaptureInlineStatus.textContent = L('foodCaptureInlineIdle');
        return;
      }
      transferInlineCaptureToMainInputV20(file);
    });
  }
  if (DOM.foodCaptureInlineRunBtn && !DOM.foodCaptureInlineRunBtn.dataset.boundV20) {
    DOM.foodCaptureInlineRunBtn.dataset.boundV20 = '1';
    DOM.foodCaptureInlineRunBtn.addEventListener('click', () => { runInlineCaptureActionV20('ocr'); });
  }
  if (DOM.foodCaptureInlineBarcodeBtn && !DOM.foodCaptureInlineBarcodeBtn.dataset.boundV20) {
    DOM.foodCaptureInlineBarcodeBtn.dataset.boundV20 = '1';
    DOM.foodCaptureInlineBarcodeBtn.addEventListener('click', () => { runInlineCaptureActionV20('barcode'); });
  }
  if (DOM.foodCaptureInlineOpenAdvanced && !DOM.foodCaptureInlineOpenAdvanced.dataset.boundV20) {
    DOM.foodCaptureInlineOpenAdvanced.dataset.boundV20 = '1';
    DOM.foodCaptureInlineOpenAdvanced.addEventListener('click', () => {
      setPanelState('capture', true, false);
      openPanel('capture');
    });
  }
  if (DOM.musicSaveCollapseBtn && !DOM.musicSaveCollapseBtn.dataset.boundV20) {
    DOM.musicSaveCollapseBtn.dataset.boundV20 = '1';
    DOM.musicSaveCollapseBtn.addEventListener('click', () => {
      markMusicSetupDoneV20();
      setPanelState('sound', false);
      if (DOM.soundSummary) DOM.soundSummary.textContent = L('soundPanelSummaryReady');
      window.__haochijiaOpenBodyPanel?.(true);
    });
  }
}
function renderImmersiveHomeV20() {
  document.body.classList.add('v20-immersive-home');
  if (DOM.startupGuide) DOM.startupGuide.hidden = true;
  if (DOM.moduleHub) DOM.moduleHub.hidden = true;
  const main = document.querySelector('.main-stack');
  const overview = main?.querySelector('.overview-grid');
  const sound = document.getElementById('soundPanel');
  const bodyPanel = document.getElementById('bodyPanelCard');
  const profile = document.getElementById('profilePanel');
  const food = document.getElementById('foodPanel');
  const today = document.getElementById('todayPanel');
  const capture = document.getElementById('capturePanel');
  const combo = document.getElementById('comboPanel');
  const data = document.getElementById('dataPanel');
  if (main) {
    [sound, bodyPanel, profile, overview, food, today, capture, combo, data].filter(Boolean).forEach((node) => main.appendChild(node));
  }
  ensureSoundToolsV20();
  ensureDynamicFoodToolsV20();
  refreshDynamicNodesV20();
  const foodRealtimeTitleNode = document.querySelector('#foodRealtimeBoardCard .mini-title');
  if (foodRealtimeTitleNode) foodRealtimeTitleNode.textContent = L('foodRealtimeTitle');
  const foodRealtimeHintNode = document.querySelector('#foodRealtimeBoardCard .food-live-board-hint');
  if (foodRealtimeHintNode) foodRealtimeHintNode.textContent = L('foodRealtimeHint');
  const captureTitleNode = document.querySelector('#foodCaptureInlineCard .mini-title');
  if (captureTitleNode) captureTitleNode.textContent = L('foodCaptureInlineTitle');
  const captureHintNode = document.querySelector('#foodCaptureInlineCard .capture-inline-head .muted.small');
  if (captureHintNode) captureHintNode.textContent = L('foodCaptureInlineHint');
  const captureLabelNode = document.querySelector('#foodCaptureInlineCard .upload-field-inline span');
  if (captureLabelNode) captureLabelNode.textContent = L('foodCaptureInlineTitle');
  if (DOM.foodCaptureInlineRunBtn) DOM.foodCaptureInlineRunBtn.textContent = L('foodCaptureInlineUseOcr');
  if (DOM.foodCaptureInlineBarcodeBtn) DOM.foodCaptureInlineBarcodeBtn.textContent = L('foodCaptureInlineUseBarcode');
  if (DOM.foodCaptureInlineOpenAdvanced) DOM.foodCaptureInlineOpenAdvanced.textContent = L('foodCaptureInlineOpenAdvanced');
  if (DOM.foodCaptureInlineStatus && !inlineCaptureHasFileV20()) DOM.foodCaptureInlineStatus.textContent = L('foodCaptureInlineIdle');
  bindDynamicFoodToolEventsV20();
  renderFoodRealtimeBoardV20();
  if (DOM.soundPanelHint) DOM.soundPanelHint.textContent = L('soundSectionHint');
  const headerTextNodeV20 = document.querySelector('.header-text');
  if (headerTextNodeV20) headerTextNodeV20.textContent = L('headerText');
  if (DOM.summaryHint) DOM.summaryHint.textContent = L('immersiveHubHint');
  immersiveHomeReadyV20 = true;
}
async function cleanupCachesV20() {
  if (readFlagV20(HOME_V20_STORAGE.cacheCleanup)) return;
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => /^haochijia-/i.test(key) && key !== 'haochijia-v20-immersive-home').map((key) => caches.delete(key)));
    }
    writeFlagV20(HOME_V20_STORAGE.cacheCleanup, true);
  } catch (err) {
    console.warn(err);
  }
}
const legacyRegisterServiceWorkerV20 = registerServiceWorker;
registerServiceWorker = async function registerServiceWorkerV20() {
  await cleanupCachesV20();
  if (!('serviceWorker' in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    if (!readFlagV20(HOME_V20_STORAGE.swReset)) {
      await Promise.all(regs.map((reg) => reg.unregister().catch(() => false)));
      writeFlagV20(HOME_V20_STORAGE.swReset, true);
    } else {
      await Promise.all(regs.map((reg) => reg.update?.().catch(() => null)));
    }
    const registration = await navigator.serviceWorker.register('./sw.js?v=20260417-v20', { updateViaCache: 'none' });
    await registration.update?.();
  } catch (err) {
    console.warn(err);
  }
};
const legacyApplyLanguageV20 = applyLanguage;
applyLanguage = function applyLanguageV20() {
  legacyApplyLanguageV20();
  renderImmersiveHomeV20();
};
const legacyRenderAllV20 = renderAll;
renderAll = function renderAllV20() {
  legacyRenderAllV20();
  if (DOM.summaryHint) DOM.summaryHint.textContent = L('immersiveHubHint');
  if (immersiveHomeReadyV20) renderFoodRealtimeBoardV20();
};
const legacyRenderSoundPanelV20 = renderSoundPanel;
renderSoundPanel = function renderSoundPanelV20() {
  legacyRenderSoundPanelV20();
  refreshDynamicNodesV20();
  if (DOM.soundPanelHint) DOM.soundPanelHint.textContent = L('soundSectionHint');
  if (DOM.musicSaveCollapseBtn) DOM.musicSaveCollapseBtn.textContent = L('musicSaveCollapseBtn');
  if (DOM.soundSummary && isMusicSetupDoneV20() && !state.folds.sound) DOM.soundSummary.textContent = L('soundPanelSummaryReady');
};
shouldShowOnboarding = function shouldShowOnboardingV20() {
  return false;
};
window.addEventListener('haochijia:body-ready', renderImmersiveHomeV20);
window.addEventListener('DOMContentLoaded', () => {
  renderImmersiveHomeV20();
  const foldOverride = { sound: !isMusicSetupDoneV20(), profile: true, food: true, today: false, capture: false, combo: false, data: false };
  Object.entries(foldOverride).forEach(([id, isOpen]) => {
    if (typeof state.folds[id] !== 'boolean') return;
    setPanelState(id, isOpen, false);
  });
  if (DOM.soundPanelHint) DOM.soundPanelHint.textContent = L('soundSectionHint');
});
window.__haochijiaOpenPanel = (id) => openPanel(id);
window.__haochijiaSetPanelState = (id, next, persist = true) => setPanelState(id, next, persist);

/* ===== v21 layered workspace / persistent reopen / translation clarity ===== */
Object.assign(TEXTS.zh, {
  headerEyebrow: '3D 人体主页 · 分层操作 · 实时联动',
  headerText: '主页只保留 3D 人体与营养摘要；音乐、身体、饮食、数据分层打开。',
  immersiveHubHint: '主页只保留人体与摘要，其他功能分层打开。',
  workspaceHome: '主页',
  workspaceBody: '身体',
  workspaceIntake: '饮食',
  workspaceMusic: '音乐',
  workspaceData: '数据',
  workspaceHintHome: '3D 人体与今日摘要',
  workspaceHintBody: '基础参数与围度',
  workspaceHintIntake: '进度、食物与拍照',
  workspaceHintMusic: '先把氛围定好',
  workspaceHintData: '翻译状态与数据说明',
  workspaceBackHome: '回到主页',
  workspaceOpenCurrent: '分层入口',
  translationStateTitle: '翻译状态',
  translationStateIntro: '这些中文名称是离线预构建好的，不是打开页面后才现场翻译。',
  translationStatePending: '正在读取离线标签统计…',
  translationStateCurrent: '当前激活',
  translationStateChina: '中国库',
  translationStateGlobal: '国际库',
  translationStateMode: '构建版本',
  translationStateReady: '中文标签已就绪',
  translationStateDetailToggle: '查看翻译细节与示例',
  translationStateGlobalCount: '国际库中文显示名',
  translationStateChinaCount: '中国库中文友好条目',
  translationStateRuntimeNote: '页面里的“加载”只代表在读取统计或食品数据，不代表现场翻译。',
  translationStateActiveNote: '当前优先使用 {name}。',
  dataKicker: '数据与翻译',
  dataTitle: '数据与翻译状态',
});
Object.assign(TEXTS.en, {
  headerEyebrow: '3D body home · layered actions · live sync',
  headerText: 'Home now keeps only the 3D body and the nutrition summary. Music, body, intake, and data open on separate layers.',
  immersiveHubHint: 'The home view keeps only the body stage and summary. Everything else opens on separate layers.',
  workspaceHome: 'Home',
  workspaceBody: 'Body',
  workspaceIntake: 'Intake',
  workspaceMusic: 'Music',
  workspaceData: 'Data',
  workspaceHintHome: '3D body and today summary',
  workspaceHintBody: 'Profile and measurements',
  workspaceHintIntake: 'Progress, food, and photo input',
  workspaceHintMusic: 'Set the mood first',
  workspaceHintData: 'Translation status and data notes',
  workspaceBackHome: 'Back home',
  workspaceOpenCurrent: 'Layers',
  translationStateTitle: 'Translation status',
  translationStateIntro: 'These Chinese labels are prebuilt offline. They are not being translated live after the page opens.',
  translationStatePending: 'Reading offline label stats…',
  translationStateCurrent: 'Currently active',
  translationStateChina: 'China set',
  translationStateGlobal: 'Global set',
  translationStateMode: 'Build mode',
  translationStateReady: 'Chinese labels ready',
  translationStateDetailToggle: 'Show translation details and examples',
  translationStateGlobalCount: 'Global items with Chinese labels',
  translationStateChinaCount: 'China-localized entries',
  translationStateRuntimeNote: '“Loading” on the page means reading stats or food data, not doing live translation.',
  translationStateActiveNote: '{name} is currently preferred.',
  dataKicker: 'Data and translation',
  dataTitle: 'Data and translation status',
});
Object.assign(TEXTS.es, {
  headerEyebrow: 'Inicio corporal 3D · acciones por capas · sincronía en vivo',
  headerText: 'La portada ahora deja solo el cuerpo 3D y el resumen nutricional. Música, cuerpo, ingesta y datos se abren en capas separadas.',
  immersiveHubHint: 'La portada conserva solo el cuerpo y el resumen. El resto se abre por capas.',
  workspaceHome: 'Inicio',
  workspaceBody: 'Cuerpo',
  workspaceIntake: 'Ingesta',
  workspaceMusic: 'Música',
  workspaceData: 'Datos',
  workspaceHintHome: 'Cuerpo 3D y resumen de hoy',
  workspaceHintBody: 'Perfil y medidas',
  workspaceHintIntake: 'Progreso, comida y fotos',
  workspaceHintMusic: 'Primero define el ambiente',
  workspaceHintData: 'Estado de traducción y notas de datos',
  workspaceBackHome: 'Volver al inicio',
  workspaceOpenCurrent: 'Capas',
  translationStateTitle: 'Estado de traducción',
  translationStateIntro: 'Estos nombres en chino ya vienen preconstruidos fuera de línea. No se traducen en vivo al abrir la página.',
  translationStatePending: 'Leyendo estadísticas offline…',
  translationStateCurrent: 'Activo ahora',
  translationStateChina: 'Biblioteca China',
  translationStateGlobal: 'Biblioteca global',
  translationStateMode: 'Modo de construcción',
  translationStateReady: 'Etiquetas chinas listas',
  translationStateDetailToggle: 'Ver detalles y ejemplos de traducción',
  translationStateGlobalCount: 'Elementos globales con nombre chino',
  translationStateChinaCount: 'Entradas localizadas para China',
  translationStateRuntimeNote: '“Cargando” en la página significa leer estadísticas o datos de alimentos, no traducir en vivo.',
  translationStateActiveNote: 'Ahora se prioriza {name}.',
  dataKicker: 'Datos y traducción',
  dataTitle: 'Estado de datos y traducción',
});

const WORKSPACE_V21_STORAGE = {
  active: 'haochijia.v21.workspace',
  cacheCleanup: 'haochijia.v21.cache.cleanup',
  swReset: 'haochijia.v21.sw.reset',
};
const WORKSPACE_V21_ORDER = ['home', 'body', 'intake', 'music', 'data'];
const WORKSPACE_PANEL_MAP_V21 = {
  profile: 'body',
  'body-edit': 'body',
  food: 'intake',
  today: 'intake',
  capture: 'intake',
  sound: 'music',
  combo: 'data',
  data: 'data',
};
state.workspaceV21 = null;
state.workspaceReadyV21 = false;
state.workspaceBoundV21 = false;

function workspaceLabelV21(id) {
  return L(`workspace${id.charAt(0).toUpperCase()}${id.slice(1)}`);
}
function workspaceHintV21(id) {
  return L(`workspaceHint${id.charAt(0).toUpperCase()}${id.slice(1)}`);
}
function loadWorkspaceV21() {
  try {
    const raw = localStorage.getItem(WORKSPACE_V21_STORAGE.active);
    return WORKSPACE_V21_ORDER.includes(raw) ? raw : '';
  } catch {
    return '';
  }
}
function saveWorkspaceV21() {
  try {
    if (WORKSPACE_V21_ORDER.includes(state.workspaceV21)) localStorage.setItem(WORKSPACE_V21_STORAGE.active, state.workspaceV21);
  } catch {}
}
function bodyHistoryCountV21() {
  try {
    return (JSON.parse(localStorage.getItem('haochijia.body.history.v1') || '[]') || []).length;
  } catch {
    return 0;
  }
}
function inferWorkspaceV21() {
  if (!isMusicSetupDoneV20()) return 'music';
  if (!bodyHistoryCountV21()) return 'body';
  return 'home';
}
function ensureWorkspaceNavV21() {
  const header = document.querySelector('.app-header');
  if (!header) return;
  let nav = document.getElementById('workspaceNavV21');
  if (!nav) {
    nav = document.createElement('section');
    nav.className = 'workspace-nav-v21 card glass';
    nav.id = 'workspaceNavV21';
    nav.innerHTML = `
      <div class="workspace-nav-label">${escapeHtml(L('workspaceOpenCurrent'))}</div>
      <div class="workspace-nav-row" id="workspaceNavRowV21"></div>
    `;
    header.insertAdjacentElement('afterend', nav);
  }
  const row = document.getElementById('workspaceNavRowV21');
  if (!row) return;
  row.innerHTML = WORKSPACE_V21_ORDER.map((id) => `
    <button class="workspace-chip-v21" type="button" data-workspace-open="${escapeHtml(id)}">
      <strong>${escapeHtml(workspaceLabelV21(id))}</strong>
      <span>${escapeHtml(workspaceHintV21(id))}</span>
    </button>
  `).join('');
}
function ensureWorkspaceViewsV21() {
  const main = document.querySelector('.main-stack');
  if (!main) return null;
  const views = {};
  WORKSPACE_V21_ORDER.forEach((id) => {
    let view = main.querySelector(`.workspace-view-v21[data-workspace="${id}"]`);
    if (!view) {
      view = document.createElement('section');
      view.className = 'workspace-view-v21';
      view.dataset.workspace = id;
      view.hidden = true;
    }
    main.appendChild(view);
    views[id] = view;
  });
  return views;
}
function moveIntoViewV21(node, view) {
  if (!node || !view) return;
  if (node.parentElement !== view) view.appendChild(node);
}
function ensureWorkspaceBackButtonV21(view, id) {
  if (!view || id === 'home') return;
  let bar = view.querySelector('.workspace-view-topbar-v21');
  if (!bar) {
    bar = document.createElement('div');
    bar.className = 'workspace-view-topbar-v21';
    view.prepend(bar);
  }
  bar.innerHTML = `<button class="ghost-btn compact-btn" type="button" data-workspace-open="home">${escapeHtml(L('workspaceBackHome'))}</button>`;
}
function ensureTranslationStateCardV21() {
  const dataPanel = document.getElementById('dataPanel');
  const foldBody = dataPanel?.querySelector('.fold-body');
  if (!foldBody) return;
  if (!document.getElementById('translationStateCardV21')) {
    const card = document.createElement('article');
    card.className = 'sub-card translation-state-card-v21';
    card.id = 'translationStateCardV21';
    card.innerHTML = `
      <div class="section-head compact">
        <div>
          <p class="section-kicker">${escapeHtml(L('translationStateTitle'))}</p>
          <h2>${escapeHtml(L('translationStateReady'))}</h2>
        </div>
        <span class="top-pill subtle" id="translationStateActivePillV21">—</span>
      </div>
      <div class="muted small translation-state-copy-v21" id="translationStateLeadV21">${escapeHtml(L('translationStatePending'))}</div>
      <div class="translation-state-grid-v21" id="translationStateGridV21"></div>
      <div class="muted small translation-state-note-v21" id="translationStateNoteV21"></div>
    `;
    foldBody.prepend(card);
  }
  const board = document.getElementById('translationVisualBoard');
  if (board && !board.closest('.translation-details-v21')) {
    const details = document.createElement('details');
    details.className = 'details-card translation-details-v21';
    details.open = false;
    details.innerHTML = `<summary>${escapeHtml(L('translationStateDetailToggle'))}</summary>`;
    board.insertAdjacentElement('beforebegin', details);
    details.appendChild(board);
  } else if (board) {
    const summary = board.closest('.translation-details-v21')?.querySelector('summary');
    if (summary) summary.textContent = L('translationStateDetailToggle');
  }
}
function ensureWorkspaceStructureV21() {
  const views = ensureWorkspaceViewsV21();
  if (!views) return;
  const overview = document.querySelector('.overview-grid');
  const sideCard = overview?.querySelector('.side-card');
  if (sideCard) moveIntoViewV21(sideCard, views.intake);
  moveIntoViewV21(document.getElementById('bodyHeroCard'), views.home);
  moveIntoViewV21(overview, views.home);
  moveIntoViewV21(document.getElementById('profilePanel'), views.body);
  moveIntoViewV21(document.getElementById('bodyPanelCard'), views.body);
  moveIntoViewV21(document.getElementById('soundPanel'), views.music);
  moveIntoViewV21(document.getElementById('foodPanel'), views.intake);
  moveIntoViewV21(document.getElementById('todayPanel'), views.intake);
  moveIntoViewV21(document.getElementById('capturePanel'), views.intake);
  moveIntoViewV21(document.getElementById('dataPanel'), views.data);
  moveIntoViewV21(document.getElementById('comboPanel'), views.data);
  WORKSPACE_V21_ORDER.forEach((id) => ensureWorkspaceBackButtonV21(views[id], id));
  ensureTranslationStateCardV21();
}
function updateWorkspaceActiveButtonsV21() {
  document.querySelectorAll('[data-workspace-open]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.workspaceOpen === state.workspaceV21);
  });
}
function setWorkspaceV21(id, options = {}) {
  const { persist = true, reveal = false, scroll = true } = options;
  ensureWorkspaceStructureV21();
  const next = WORKSPACE_V21_ORDER.includes(id) ? id : 'home';
  state.workspaceV21 = next;
  if (persist) saveWorkspaceV21();
  document.body.classList.add('v21-layered-app');
  document.body.dataset.workspace = next;
  document.querySelectorAll('.workspace-view-v21').forEach((view) => {
    const active = view.dataset.workspace === next;
    view.hidden = !active;
    view.classList.toggle('is-active', active);
  });
  updateWorkspaceActiveButtonsV21();
  if (reveal) {
    if (next === 'music') setPanelState('sound', true, false);
    if (next === 'body') {
      setPanelState('profile', true, false);
      window.__haochijiaToggleBodyPanel?.(true);
    }
    if (next === 'intake') setPanelState('food', true, false);
    if (next === 'data') setPanelState('data', true, false);
  }
  if (scroll) {
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); }
    catch { window.scrollTo(0, 0); }
  }
  setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
}
function renderTranslationStateV21() {
  ensureTranslationStateCardV21();
  const lead = document.getElementById('translationStateLeadV21');
  const grid = document.getElementById('translationStateGridV21');
  const note = document.getElementById('translationStateNoteV21');
  const activePill = document.getElementById('translationStateActivePillV21');
  if (!lead || !grid || !note || !activePill) return;
  if (!state.meta?.region_sets) {
    lead.textContent = L('translationStatePending');
    grid.innerHTML = '';
    note.textContent = L('translationStateRuntimeNote');
    activePill.textContent = '—';
    return;
  }
  const sets = state.meta.region_sets || {};
  const cn = sets.cn || {};
  const global = sets.global || {};
  const active = resolvedFoodRegion();
  const activeName = active === 'cn' ? L('translationStateChina') : L('translationStateGlobal');
  const cnCount = Number(cn.stats?.rows_kept || 0);
  const globalZhCount = Number(global.stats?.rows_with_zh_name || global.stats?.rows_kept || 0);
  const cnMode = cn.translation_mode || '—';
  const globalMode = global.translation_mode || '—';
  lead.textContent = L('translationStateIntro');
  activePill.textContent = `${activeName} · ${L('translationStateReady')}`;
  grid.innerHTML = [
    { label: L('translationStateCurrent'), value: activeName, sub: L('translationStateActiveNote', { name: activeName }) },
    { label: L('translationStateChinaCount'), value: fmtInt(cnCount), sub: cnMode },
    { label: L('translationStateGlobalCount'), value: fmtInt(globalZhCount), sub: globalMode },
    { label: L('translationStateMode'), value: active === 'cn' ? cnMode : globalMode, sub: L('translationStateRuntimeNote') },
  ].map((item) => `
    <div class="translation-state-item-v21">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
      <small>${escapeHtml(item.sub)}</small>
    </div>
  `).join('');
  note.textContent = L('translationStateRuntimeNote');
}
function renderHeaderStatusV21() {
  if (DOM.datasetStat) {
    if (!state.meta?.region_sets) {
      DOM.datasetStat.textContent = uiLang() === 'zh' ? '离线标签库' : uiLang() === 'es' ? 'Biblioteca offline' : 'Offline label set';
    } else {
      const active = resolvedFoodRegion();
      const sets = state.meta.region_sets || {};
      const cnCount = Number(sets.cn?.stats?.rows_kept || 0);
      const globalZhCount = Number(sets.global?.stats?.rows_with_zh_name || sets.global?.stats?.rows_kept || 0);
      DOM.datasetStat.textContent = active === 'cn'
        ? `${L('translationStateChina')} ${fmtInt(cnCount)} · ${L('translationStateReady')}`
        : `${L('translationStateGlobal')} ${fmtInt(globalZhCount)} · ${L('translationStateReady')}`;
    }
  }
  if (DOM.summaryHint) DOM.summaryHint.textContent = L('immersiveHubHint');
}
function panelWorkspaceV21(id) {
  return WORKSPACE_PANEL_MAP_V21[id] || '';
}
function bindWorkspaceEventsV21() {
  if (state.workspaceBoundV21) return;
  state.workspaceBoundV21 = true;
  document.addEventListener('click', (event) => {
    const workspaceBtn = event.target.closest('[data-workspace-open]');
    if (workspaceBtn) {
      event.preventDefault();
      setWorkspaceV21(workspaceBtn.dataset.workspaceOpen || 'home', { persist: true, reveal: true, scroll: true });
      return;
    }
    if (event.target.closest('#bodyAddRecordBtn')) {
      setWorkspaceV21('body', { persist: true, reveal: true, scroll: true });
      setTimeout(() => window.__haochijiaOpenBodyPanel?.(true), 0);
      return;
    }
    if (event.target.closest('#bodyViewHistoryBtn')) {
      setWorkspaceV21('body', { persist: true, reveal: true, scroll: true });
      setTimeout(() => window.__haochijiaOpenBodyPanel?.(false), 0);
      return;
    }
    if (event.target.closest('#musicSaveCollapseBtn')) {
      setTimeout(() => setWorkspaceV21('body', { persist: true, reveal: true, scroll: true }), 40);
      return;
    }
    if (event.target.closest('#bodySaveBtn')) {
      const before = bodyHistoryCountV21();
      setTimeout(() => {
        if (bodyHistoryCountV21() > before) setWorkspaceV21('home', { persist: true, reveal: false, scroll: true });
      }, 120);
    }
  }, true);
}
function patchBodyOpenForWorkspaceV21() {
  const original = window.__haochijiaOpenBodyPanel;
  if (!original || original.__v21Wrapped) return;
  const wrapped = function wrappedOpenBodyPanelV21(focus = true) {
    setWorkspaceV21('body', { persist: true, reveal: false, scroll: false });
    return original(focus);
  };
  wrapped.__v21Wrapped = true;
  window.__haochijiaOpenBodyPanel = wrapped;
}
function renderWorkspaceLayoutV21(forceReveal = false) {
  ensureWorkspaceNavV21();
  ensureWorkspaceStructureV21();
  bindWorkspaceEventsV21();
  patchBodyOpenForWorkspaceV21();
  renderHeaderStatusV21();
  renderTranslationStateV21();
  if (!state.workspaceReadyV21) {
    state.workspaceV21 = loadWorkspaceV21() || inferWorkspaceV21();
    state.workspaceReadyV21 = true;
    setWorkspaceV21(state.workspaceV21, { persist: false, reveal: true, scroll: false });
    return;
  }
  setWorkspaceV21(state.workspaceV21 || 'home', { persist: false, reveal: forceReveal, scroll: false });
}

const legacyOpenPanelV21 = openPanel;
openPanel = function openPanelV21(id) {
  const workspace = panelWorkspaceV21(id);
  if (workspace) setWorkspaceV21(workspace, { persist: true, reveal: false, scroll: false });
  legacyOpenPanelV21(id);
};
window.__haochijiaOpenPanel = (id) => openPanel(id);
window.__haochijiaSetWorkspaceV21 = (id, options = {}) => setWorkspaceV21(id, options);

const legacyApplyLanguageV21 = applyLanguage;
applyLanguage = function applyLanguageV21() {
  legacyApplyLanguageV21();
  renderWorkspaceLayoutV21(false);
};
const legacyRenderAllV21 = renderAll;
renderAll = function renderAllV21() {
  legacyRenderAllV21();
  renderWorkspaceLayoutV21(false);
};
const legacyRenderDatasetMetaV21 = renderDatasetMeta;
renderDatasetMeta = function renderDatasetMetaV21() {
  legacyRenderDatasetMetaV21();
  renderHeaderStatusV21();
  renderTranslationStateV21();
};
async function cleanupCachesV21() {
  if (readFlagV20(WORKSPACE_V21_STORAGE.cacheCleanup)) return;
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => /^haochijia-/i.test(key) && key !== 'haochijia-v21-layered-home').map((key) => caches.delete(key)));
    }
    writeFlagV20(WORKSPACE_V21_STORAGE.cacheCleanup, true);
  } catch (err) {
    console.warn(err);
  }
}
registerServiceWorker = async function registerServiceWorkerV21() {
  await cleanupCachesV21();
  if (!('serviceWorker' in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    if (!readFlagV20(WORKSPACE_V21_STORAGE.swReset)) {
      await Promise.all(regs.map((reg) => reg.unregister().catch(() => false)));
      writeFlagV20(WORKSPACE_V21_STORAGE.swReset, true);
    } else {
      await Promise.all(regs.map((reg) => reg.update?.().catch(() => null)));
    }
    const registration = await navigator.serviceWorker.register('./sw.js?v=20260417-v21', { updateViaCache: 'none' });
    await registration.update?.();
  } catch (err) {
    console.warn(err);
  }
};

window.addEventListener('haochijia:body-ready', () => {
  patchBodyOpenForWorkspaceV21();
  renderWorkspaceLayoutV21(true);
});
window.addEventListener('DOMContentLoaded', () => {
  renderWorkspaceLayoutV21(true);
});

/* ===== v22 single-flow mobile home / device split / audio unlock / food fallback ===== */
Object.assign(TEXTS.zh, {
  headerEyebrow: '移动端 3D 人体营养台',
  headerText: '先选设备，再调音乐，再填身体，最后围绕 3D 人体完成摄入记录。',
  immersiveHubHint: '点人体展开功能；主界面只保留 3D 人体、营养进度和食品入口。',
  v22DeviceTitle: '先选择你的设备路线',
  v22DeviceText: 'Apple 路线优先适配 iPhone / iPad / Mac Safari 的音频与触感；Android 路线使用更紧凑的底部抽屉。',
  v22DeviceApple: 'Apple 设备',
  v22DeviceAppleNote: 'iPhone / iPad / Mac Safari',
  v22DeviceAndroid: 'Android 设备',
  v22DeviceAndroidNote: 'Android 手机 / 平板',
  v22DeviceDesktop: '桌面预览',
  v22DeviceDesktopNote: '大屏调试与演示',
  v22DeviceRecommend: '推荐路线',
  v22SheetClose: '关闭',
  v22SheetMusicKicker: '第一步 · 音乐',
  v22SheetMusicTitle: '先把背景音乐调好',
  v22SheetMusicNote: 'Mac / Safari 需要先有一次真实点击，Web Audio 才能稳定发声。',
  v22SheetBodyKicker: '第二步 · 身体参数',
  v22SheetBodyTitle: '录入完整身体参数表格',
  v22SheetBodyNote: '没填的部位会在 3D 模型周围显示为锁定状态。',
  v22SheetIntakeKicker: '第三步 · 摄入记录',
  v22SheetIntakeTitle: '围绕 3D 模型记录饮食摄入',
  v22SheetIntakeNote: '食品搜索、自动营养匹配、套餐与拍照上传都从这里进入。',
  v22SheetComboKicker: '套餐',
  v22SheetComboTitle: '保存你自己的固定套餐',
  v22SheetComboNote: '把常吃的搭配存起来，一次点击就能加入当天。',
  v22SheetDataKicker: '数据',
  v22SheetDataTitle: '食品库与翻译状态',
  v22SheetDataNote: '这里说明食品库覆盖、翻译构建版本和同步状态。',
  v22SheetTodayKicker: '今日',
  v22SheetTodayTitle: '当天记录与营养进度',
  v22SheetTodayNote: '专门查看今天吃了什么、喝了多少，以及实时营养差距。',
  v22HomeSearchKicker: '食品库入口',
  v22HomeSearchTitle: '围绕 3D 模型记录摄入',
  v22HomeSearchHint: '输入食品名、品牌、菜名或条码。搜不到时会自动切到另一套食品库继续找。',
  v22HomeSearchBtn: '搜索并记录',
  v22HomeBodyBtn: '身体表格',
  v22HomeMusicBtn: '音乐实验室',
  v22HomeComboBtn: '套餐',
  v22HomeUploadBtn: '拍照上传',
  v22HomeDataBtn: '数据说明',
  v22StageReady: '身体模型已准备好',
  v22StageLocked: '未录入',
  v22SearchFallback: '当前库没命中，已自动改用 {name} 继续匹配。',
  v22SearchBlend: '已联动 {primary} + {secondary} 双食品库，结果仍按当前库优先排序。',
  v22FoodBankCN: '中国库',
  v22FoodBankGlobal: '国际库',
  v22FoodMetaReady: '中国库 {cn} 条 · 国际库中文 {global} 条',
  v22FoodMetaPending: '正在读取食品库统计…',
  v22AudioPrimed: '音频已解锁',
  v22BodyZoneChest: '胸背',
  v22BodyZoneArms: '手臂',
  v22BodyZoneWaist: '腰腹',
  v22BodyZoneHip: '臀胯',
  v22BodyZoneLegs: '腿部',
  v22NutrientKcal: '热量',
  v22NutrientProtein: '蛋白',
  v22NutrientFiber: '纤维',
  v22NutrientWater: '饮水',
  v22ProgressDone: '已达标',
  v22ProgressNeed: '仍需补充',
  v22FlowBodyReady: '3D 主舞台已生成',
});
Object.assign(TEXTS.en, {
  headerEyebrow: 'Mobile-first 3D nutrition body stage',
  headerText: 'Choose device, tune music, fill body data, then log intake around the 3D body.',
  immersiveHubHint: 'Tap the body for tools. The home view keeps only the 3D body, nutrition progress, and the food entry point.',
  v22DeviceTitle: 'Choose your device route',
  v22DeviceText: 'The Apple route prioritizes iPhone / iPad / Mac Safari audio behavior. The Android route uses a tighter bottom sheet layout.',
  v22DeviceApple: 'Apple devices',
  v22DeviceAppleNote: 'iPhone / iPad / Mac Safari',
  v22DeviceAndroid: 'Android devices',
  v22DeviceAndroidNote: 'Android phones and tablets',
  v22DeviceDesktop: 'Desktop preview',
  v22DeviceDesktopNote: 'Large-screen testing',
  v22DeviceRecommend: 'Recommended',
  v22SheetClose: 'Close',
  v22SheetMusicKicker: 'Step 1 · Music',
  v22SheetMusicTitle: 'Tune the background music first',
  v22SheetMusicNote: 'Mac / Safari needs a real user tap before Web Audio can reliably play.',
  v22SheetBodyKicker: 'Step 2 · Body data',
  v22SheetBodyTitle: 'Fill the full body form',
  v22SheetBodyNote: 'Missing body zones stay visually locked around the 3D model.',
  v22SheetIntakeKicker: 'Step 3 · Intake',
  v22SheetIntakeTitle: 'Log intake around the 3D body',
  v22SheetIntakeNote: 'Food search, automatic nutrition matching, combos, and photo upload all start here.',
  v22SheetComboKicker: 'Combos',
  v22SheetComboTitle: 'Save your own meal combos',
  v22SheetComboNote: 'Store repeat meals so they can be added in one tap.',
  v22SheetDataKicker: 'Data',
  v22SheetDataTitle: 'Food library and translation status',
  v22SheetDataNote: 'This explains food coverage, translation build versions, and sync status.',
  v22SheetTodayKicker: 'Today',
  v22SheetTodayTitle: 'Today log and nutrition progress',
  v22SheetTodayNote: 'A focused sheet for what you ate, drank, and still need today.',
  v22HomeSearchKicker: 'Food library',
  v22HomeSearchTitle: 'Log intake around the 3D body',
  v22HomeSearchHint: 'Type a food name, brand, dish, or barcode. If the active bank misses, the other bank is searched automatically.',
  v22HomeSearchBtn: 'Search and log',
  v22HomeBodyBtn: 'Body form',
  v22HomeMusicBtn: 'Music lab',
  v22HomeComboBtn: 'Combos',
  v22HomeUploadBtn: 'Upload',
  v22HomeDataBtn: 'Data',
  v22StageReady: 'Body stage ready',
  v22StageLocked: 'Missing',
  v22SearchFallback: 'No hit in the current bank. Auto-switched to {name}.',
  v22SearchBlend: 'Both {primary} + {secondary} are now linked. Results still favor the current bank first.',
  v22FoodBankCN: 'China bank',
  v22FoodBankGlobal: 'Global bank',
  v22FoodMetaReady: 'China {cn} items · Global zh labels {global}',
  v22FoodMetaPending: 'Reading food library stats…',
  v22AudioPrimed: 'Audio unlocked',
  v22BodyZoneChest: 'Chest',
  v22BodyZoneArms: 'Arms',
  v22BodyZoneWaist: 'Waist',
  v22BodyZoneHip: 'Hips',
  v22BodyZoneLegs: 'Legs',
  v22NutrientKcal: 'Kcal',
  v22NutrientProtein: 'Protein',
  v22NutrientFiber: 'Fiber',
  v22NutrientWater: 'Water',
  v22ProgressDone: 'Reached',
  v22ProgressNeed: 'Still needed',
  v22FlowBodyReady: '3D stage generated',
});
Object.assign(TEXTS.es, {
  headerEyebrow: 'Escena corporal 3D móvil',
  headerText: 'Elige dispositivo, ajusta música, completa el cuerpo y luego registra la ingesta alrededor del cuerpo 3D.',
  immersiveHubHint: 'Toca el cuerpo para abrir funciones. La portada deja solo el cuerpo 3D, el progreso nutricional y la entrada al buscador.',
  v22DeviceTitle: 'Elige tu ruta de dispositivo',
  v22DeviceText: 'La ruta Apple prioriza iPhone / iPad / Mac Safari. La ruta Android usa una hoja inferior más compacta.',
  v22DeviceApple: 'Apple',
  v22DeviceAppleNote: 'iPhone / iPad / Mac Safari',
  v22DeviceAndroid: 'Android',
  v22DeviceAndroidNote: 'Teléfonos y tabletas Android',
  v22DeviceDesktop: 'Escritorio',
  v22DeviceDesktopNote: 'Pruebas en pantalla grande',
  v22DeviceRecommend: 'Recomendado',
  v22SheetClose: 'Cerrar',
  v22SheetMusicKicker: 'Paso 1 · Música',
  v22SheetMusicTitle: 'Ajusta primero la música',
  v22SheetMusicNote: 'Mac / Safari necesita un toque real para que Web Audio pueda sonar.',
  v22SheetBodyKicker: 'Paso 2 · Cuerpo',
  v22SheetBodyTitle: 'Completa el formulario corporal',
  v22SheetBodyNote: 'Las zonas sin datos quedan bloqueadas alrededor del modelo 3D.',
  v22SheetIntakeKicker: 'Paso 3 · Ingesta',
  v22SheetIntakeTitle: 'Registra la ingesta alrededor del cuerpo 3D',
  v22SheetIntakeNote: 'Búsqueda, coincidencia nutricional, combos y foto empiezan aquí.',
  v22SheetComboKicker: 'Combos',
  v22SheetComboTitle: 'Guarda tus combos',
  v22SheetComboNote: 'Tus combinaciones repetidas se añaden con un toque.',
  v22SheetDataKicker: 'Datos',
  v22SheetDataTitle: 'Estado de biblioteca y traducción',
  v22SheetDataNote: 'Aquí se explica la cobertura, la versión de traducción y el estado.',
  v22SheetTodayKicker: 'Hoy',
  v22SheetTodayTitle: 'Registro de hoy y progreso nutricional',
  v22SheetTodayNote: 'Una hoja enfocada para revisar lo que comiste, bebiste y lo que aún falta hoy.',
  v22HomeSearchKicker: 'Biblioteca',
  v22HomeSearchTitle: 'Registra la ingesta alrededor del cuerpo 3D',
  v22HomeSearchHint: 'Escribe comida, marca, plato o código. Si una biblioteca no acierta, se prueba la otra automáticamente.',
  v22HomeSearchBtn: 'Buscar y registrar',
  v22HomeBodyBtn: 'Formulario',
  v22HomeMusicBtn: 'Música',
  v22HomeComboBtn: 'Combos',
  v22HomeUploadBtn: 'Subir',
  v22HomeDataBtn: 'Datos',
  v22StageReady: 'Escena lista',
  v22StageLocked: 'Falta',
  v22SearchFallback: 'No hubo resultado en la biblioteca actual. Se probó con {name}.',
  v22SearchBlend: 'Se enlazaron {primary} + {secondary}. Los resultados siguen priorizando la biblioteca actual.',
  v22FoodBankCN: 'Biblioteca China',
  v22FoodBankGlobal: 'Biblioteca global',
  v22FoodMetaReady: 'China {cn} · Global con chino {global}',
  v22FoodMetaPending: 'Leyendo estadísticas de alimentos…',
  v22AudioPrimed: 'Audio desbloqueado',
  v22BodyZoneChest: 'Pecho',
  v22BodyZoneArms: 'Brazos',
  v22BodyZoneWaist: 'Cintura',
  v22BodyZoneHip: 'Cadera',
  v22BodyZoneLegs: 'Piernas',
  v22NutrientKcal: 'Kcal',
  v22NutrientProtein: 'Proteína',
  v22NutrientFiber: 'Fibra',
  v22NutrientWater: 'Agua',
  v22ProgressDone: 'Cumplido',
  v22ProgressNeed: 'Falta',
  v22FlowBodyReady: 'Escena 3D generada',
});

const V22_STORAGE = {
  deviceMode: 'haochijia.v22.device.mode',
};
const V22_SHEET_CONFIG = {
  music: { panels: ['soundPanel'], kicker: 'v22SheetMusicKicker', title: 'v22SheetMusicTitle', note: 'v22SheetMusicNote' },
  body: { panels: ['profilePanel', 'bodyPanelCard'], kicker: 'v22SheetBodyKicker', title: 'v22SheetBodyTitle', note: 'v22SheetBodyNote' },
  intake: { panels: ['foodPanel', 'comboPanel'], kicker: 'v22SheetIntakeKicker', title: 'v22SheetIntakeTitle', note: 'v22SheetIntakeNote' },
  combo: { panels: ['comboPanel'], kicker: 'v22SheetComboKicker', title: 'v22SheetComboTitle', note: 'v22SheetComboNote' },
  today: { panels: ['todayPanel'], kicker: 'v22SheetTodayKicker', title: 'v22SheetTodayTitle', note: 'v22SheetTodayNote' },
  data: { panels: ['dataPanel'], kicker: 'v22SheetDataKicker', title: 'v22SheetDataTitle', note: 'v22SheetDataNote' },
  upload: { panels: ['foodPanel', 'capturePanel'], kicker: 'v22SheetIntakeKicker', title: 'v22SheetIntakeTitle', note: 'v22SheetIntakeNote' },
};

state.v22DeviceMode = (() => {
  try { return localStorage.getItem(V22_STORAGE.deviceMode) || ''; }
  catch { return ''; }
})();
state.v22SheetPanels = [];
state.v22CurrentSheet = '';
state.v22AudioPrimed = false;
state.v22LastSearchStatus = '';
state.v22SearchFallbackRegion = '';
state.v22PrefetchTimer = null;
state.v24SearchToken = 0;
state.v24ManualPreviewDirty = false;

function detectRecommendedDeviceV22() {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod|Macintosh|Mac OS X/i.test(ua)) return 'apple';
  if (/Android/i.test(ua)) return 'android';
  return 'desktop';
}
function currentDeviceModeV22() {
  return ['apple', 'android', 'desktop'].includes(state.v22DeviceMode) ? state.v22DeviceMode : detectRecommendedDeviceV22();
}
function saveDeviceModeV22(mode) {
  try { localStorage.setItem(V22_STORAGE.deviceMode, mode); }
  catch {}
}
function applyDeviceModeV22(mode = currentDeviceModeV22()) {
  const next = ['apple', 'android', 'desktop'].includes(mode) ? mode : detectRecommendedDeviceV22();
  state.v22DeviceMode = next;
  document.body.dataset.deviceMode = next;
  saveDeviceModeV22(next);
  document.querySelectorAll('[data-v22-device]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.v22Device === next);
  });
}
function moveNodeV22(node, host) {
  if (!node || !host || node.parentElement === host) return;
  host.appendChild(node);
}
function v22PanelsStorage() {
  let host = document.getElementById('v22PanelStorage');
  if (!host) {
    host = document.createElement('div');
    host.id = 'v22PanelStorage';
    host.hidden = true;
    (document.querySelector('.main-stack') || document.body).appendChild(host);
  }
  return host;
}
function ensureV22SheetShell() {
  let backdrop = document.getElementById('v22SheetBackdrop');
  let host = document.getElementById('v22SheetHost');
  if (backdrop && host) return { backdrop, host, body: document.getElementById('v22SheetBody') };
  backdrop = document.createElement('div');
  backdrop.id = 'v22SheetBackdrop';
  backdrop.className = 'v22-sheet-backdrop';
  backdrop.hidden = true;
  host = document.createElement('section');
  host.id = 'v22SheetHost';
  host.className = 'v22-sheet-host';
  host.hidden = true;
  host.innerHTML = `
    <div class="v22-sheet-head">
      <div>
        <div class="v22-sheet-kicker" id="v22SheetKicker"></div>
        <h2 class="v22-sheet-title" id="v22SheetTitle"></h2>
        <p class="v22-sheet-note" id="v22SheetNote"></p>
      </div>
      <button type="button" class="v22-sheet-close" id="v22SheetCloseBtn">${escapeHtml(L('v22SheetClose'))}</button>
    </div>
    <div class="v22-sheet-body" id="v22SheetBody"></div>`;
  document.body.appendChild(backdrop);
  document.body.appendChild(host);
  backdrop.addEventListener('click', closeV22Sheet);
  host.querySelector('#v22SheetCloseBtn')?.addEventListener('click', closeV22Sheet);
  return { backdrop, host, body: document.getElementById('v22SheetBody') };
}
function ensureV22EntryModal() {
  let modal = document.getElementById('v22EntryModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'v22EntryModal';
    modal.className = 'v22-entry-modal';
    modal.innerHTML = `
      <section class="v22-entry-card">
        <span class="top-pill subtle v22-device-recommend" id="v22EntryRecommend"></span>
        <h2 id="v22EntryTitle"></h2>
        <p id="v22EntryText"></p>
        <div class="v22-device-grid">
          <button type="button" class="v22-device-btn" data-v22-device="apple">
            <strong id="v22EntryAppleTitle"></strong>
            <span id="v22EntryAppleNote"></span>
          </button>
          <button type="button" class="v22-device-btn" data-v22-device="android">
            <strong id="v22EntryAndroidTitle"></strong>
            <span id="v22EntryAndroidNote"></span>
          </button>
          <button type="button" class="v22-device-btn" data-v22-device="desktop">
            <strong id="v22EntryDesktopTitle"></strong>
            <span id="v22EntryDesktopNote"></span>
          </button>
        </div>
      </section>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', async (event) => {
      const btn = event.target.closest('[data-v22-device]');
      if (!btn) return;
      applyDeviceModeV22(btn.dataset.v22Device || detectRecommendedDeviceV22());
      await unlockMusicAudioV22('device');
      hideV22EntryModal();
      setTimeout(() => openV22Sheet('music'), 90);
    });
  }
  refreshV22EntryCopy();
  return modal;
}
function refreshV22EntryCopy() {
  const modal = document.getElementById('v22EntryModal');
  if (!modal) return;
  const recommended = currentDeviceModeV22();
  const map = { apple: L('v22DeviceApple'), android: L('v22DeviceAndroid'), desktop: L('v22DeviceDesktop') };
  const set = (id, text) => { const node = document.getElementById(id); if (node) node.textContent = text; };
  set('v22EntryRecommend', `${L('v22DeviceRecommend')} · ${map[recommended] || recommended}`);
  set('v22EntryTitle', L('v22DeviceTitle'));
  set('v22EntryText', L('v22DeviceText'));
  set('v22EntryAppleTitle', L('v22DeviceApple'));
  set('v22EntryAppleNote', L('v22DeviceAppleNote'));
  set('v22EntryAndroidTitle', L('v22DeviceAndroid'));
  set('v22EntryAndroidNote', L('v22DeviceAndroidNote'));
  set('v22EntryDesktopTitle', L('v22DeviceDesktop'));
  set('v22EntryDesktopNote', L('v22DeviceDesktopNote'));
  applyDeviceModeV22(recommended);
}
function showV22EntryModal() {
  const modal = ensureV22EntryModal();
  modal.hidden = false;
}
function hideV22EntryModal() {
  const modal = document.getElementById('v22EntryModal');
  if (modal) modal.hidden = true;
}
function ensureV22HomeSearchCard() {
  let card = document.getElementById('v22HomeSearchCard');
  if (!card) {
    card = document.createElement('section');
    card.id = 'v22HomeSearchCard';
    card.className = 'card v22-home-search-card';
    card.innerHTML = `
      <div class="section-head compact">
        <div>
          <p class="section-kicker" id="v22HomeSearchKicker"></p>
          <h2 id="v22HomeSearchTitle"></h2>
          <p class="fold-summary-text" id="v22HomeSearchHint"></p>
        </div>
        <span class="top-pill subtle" id="v22HomeSearchMeta"></span>
      </div>
      <div class="v22-home-search-row">
        <label class="field">
          <span id="v22HomeSearchLabel"></span>
          <input id="v22HomeSearchInput" type="search" enterkeyhint="search" autocomplete="off">
        </label>
        <button type="button" class="primary-btn" id="v22HomeSearchBtn"></button>
      </div>
      <div class="v22-home-search-actions">
        <button type="button" class="ghost-btn" id="v22HomeBodyBtn"></button>
        <button type="button" class="ghost-btn" id="v22HomeMusicBtn"></button>
        <button type="button" class="ghost-btn" id="v22HomeComboBtn"></button>
        <button type="button" class="ghost-btn" id="v22HomeUploadBtn"></button>
        <button type="button" class="ghost-btn" id="v22HomeDataBtn"></button>
      </div>
      <div class="v22-home-search-status" id="v22HomeSearchStatus"></div>`;
  }
  const shell = document.getElementById('v22HomeShell') || document.querySelector('.main-stack');
  if (shell) moveNodeV22(card, shell);
  refreshV22HomeSearchCopy();
  if (!card.dataset.boundV22) {
    card.dataset.boundV22 = '1';
    card.querySelector('#v22HomeSearchBtn')?.addEventListener('click', runV22HomeSearch);
    card.querySelector('#v22HomeSearchInput')?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      runV22HomeSearch();
    });
    card.querySelector('#v22HomeBodyBtn')?.addEventListener('click', () => openV22Sheet('body'));
    card.querySelector('#v22HomeMusicBtn')?.addEventListener('click', () => openV22Sheet('music'));
    card.querySelector('#v22HomeComboBtn')?.addEventListener('click', () => openV22Sheet('combo'));
    card.querySelector('#v22HomeUploadBtn')?.addEventListener('click', () => openV22Sheet('upload', { scrollTo: '#capturePanel' }));
    card.querySelector('#v22HomeDataBtn')?.addEventListener('click', () => openV22Sheet('data'));
  }
  return card;
}
function refreshV22HomeSearchCopy() {
  const set = (id, text) => { const node = document.getElementById(id); if (node) node.textContent = text; };
  set('v22HomeSearchKicker', L('v22HomeSearchKicker'));
  set('v22HomeSearchTitle', L('v22HomeSearchTitle'));
  set('v22HomeSearchHint', L('v22HomeSearchHint'));
  set('v22HomeSearchLabel', L('foodSearchPlaceholder'));
  set('v22HomeSearchBtn', L('v22HomeSearchBtn'));
  set('v22HomeBodyBtn', L('v22HomeBodyBtn'));
  set('v22HomeMusicBtn', L('v22HomeMusicBtn'));
  set('v22HomeComboBtn', L('v22HomeComboBtn'));
  set('v22HomeUploadBtn', L('v22HomeUploadBtn'));
  set('v22HomeDataBtn', L('v22HomeDataBtn'));
  const input = document.getElementById('v22HomeSearchInput');
  if (input) input.placeholder = L('foodSearchPlaceholder');
  refreshV22HomeMeta();
}
function refreshV22HomeMeta() {
  const metaNode = document.getElementById('v22HomeSearchMeta');
  const statusNode = document.getElementById('v22HomeSearchStatus');
  if (metaNode) {
    if (state.meta?.region_sets) {
      const cn = fmtInt(Number(state.meta.region_sets.cn?.stats?.rows_kept || 0));
      const global = fmtInt(Number(state.meta.region_sets.global?.stats?.rows_with_zh_name || state.meta.region_sets.global?.stats?.rows_kept || 0));
      metaNode.textContent = L('v22FoodMetaReady', { cn, global });
    } else {
      metaNode.textContent = L('v22FoodMetaPending');
    }
  }
  if (statusNode) {
    const activeLine = `${regionName()} · ${state.v22LastSearchStatus || L('immersiveHubHint')}`;
    statusNode.textContent = activeLine;
  }
}
function runV22HomeSearch() {
  const input = document.getElementById('v22HomeSearchInput');
  const value = input?.value.trim() || '';
  openV22Sheet('intake', { focusSelector: '#foodSearchInput' });
  if (DOM.foodSearchInput) DOM.foodSearchInput.value = value;
  if (!value) {
    DOM.foodSearchInput?.focus();
    return;
  }
  setTimeout(() => {
    doSearch(value);
    DOM.foodSearchInput?.focus();
  }, 40);
}
function ensureV22HomeStructure() {
  document.body.classList.add('v22-mobile-first');
  document.body.classList.add('v20-immersive-home');
  document.body.classList.remove('v21-layered-app');
  const main = document.querySelector('.main-stack');
  if (!main) return;
  let shell = document.getElementById('v22HomeShell');
  if (!shell) {
    shell = document.createElement('div');
    shell.id = 'v22HomeShell';
    shell.className = 'v22-home-shell';
    main.prepend(shell);
  }
  const hero = document.getElementById('bodyHeroCard');
  if (hero) moveNodeV22(hero, shell);
  ensureV22HomeSearchCard();
  const storage = v22PanelsStorage();
  const knownPanels = ['soundPanel', 'profilePanel', 'bodyPanelCard', 'foodPanel', 'comboPanel', 'todayPanel', 'capturePanel', 'dataPanel'];
  knownPanels.forEach((id) => {
    if (state.v22SheetPanels.includes(id)) return;
    const node = document.getElementById(id);
    if (node) moveNodeV22(node, storage);
  });
  if (DOM.summaryHint) DOM.summaryHint.textContent = L('immersiveHubHint');
  const headerTextNode = document.querySelector('.header-text');
  const headerEyebrowNode = document.querySelector('.eyebrow');
  if (headerTextNode) headerTextNode.textContent = L('headerText');
  if (headerEyebrowNode) headerEyebrowNode.textContent = L('headerEyebrow');
  closeQuickSheet?.();
  decorateV22BodyStage();
  refreshV22HomeMeta();
}
function closeV22Sheet() {
  const sheet = ensureV22SheetShell();
  const storage = v22PanelsStorage();
  state.v22SheetPanels.forEach((id) => {
    const node = document.getElementById(id);
    if (node) moveNodeV22(node, storage);
  });
  state.v22SheetPanels = [];
  state.v22CurrentSheet = '';
  document.body.classList.remove('v22-sheet-open');
  sheet.backdrop.classList.remove('show');
  sheet.host.classList.remove('open');
  sheet.backdrop.hidden = true;
  sheet.host.hidden = true;
}
function applyV22SheetHeader(config) {
  const kicker = document.getElementById('v22SheetKicker');
  const title = document.getElementById('v22SheetTitle');
  const note = document.getElementById('v22SheetNote');
  if (kicker) kicker.textContent = L(config.kicker);
  if (title) title.textContent = L(config.title);
  if (note) note.textContent = L(config.note);
  const closeBtn = document.getElementById('v22SheetCloseBtn');
  if (closeBtn) closeBtn.textContent = L('v22SheetClose');
}
function openV22Sheet(key, options = {}) {
  ensureV22HomeStructure();
  const config = V22_SHEET_CONFIG[key] || V22_SHEET_CONFIG.intake;
  const sheet = ensureV22SheetShell();
  const storage = v22PanelsStorage();
  state.v22SheetPanels.forEach((id) => {
    const node = document.getElementById(id);
    if (node) moveNodeV22(node, storage);
  });
  while (sheet.body.firstChild) sheet.body.removeChild(sheet.body.firstChild);
  config.panels.forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    moveNodeV22(node, sheet.body);
  });
  state.v22SheetPanels = [...config.panels];
  state.v22CurrentSheet = key;
  document.body.classList.add('v22-sheet-open');
  applyV22SheetHeader(config);
  sheet.backdrop.hidden = false;
  sheet.host.hidden = false;
  requestAnimationFrame(() => {
    sheet.backdrop.classList.add('show');
    sheet.host.classList.add('open');
  });
  if (config.panels.includes('soundPanel')) setPanelState('sound', true, false);
  if (config.panels.includes('profilePanel')) setPanelState('profile', true, false);
  if (config.panels.includes('foodPanel')) setPanelState('food', true, false);
  if (config.panels.includes('comboPanel')) setPanelState('combo', true, false);
  if (config.panels.includes('todayPanel')) setPanelState('today', true, false);
  if (config.panels.includes('dataPanel')) setPanelState('data', true, false);
  if (key === 'body') setTimeout(() => window.__haochijiaToggleBodyPanel?.(true), 10);
  if (key === 'upload') {
    setPanelState('capture', true, false);
    setTimeout(() => {
      const target = sheet.body.querySelector('#capturePanel') || sheet.body.querySelector('#foodCaptureInlineCard');
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }
  if (options.focusSelector) {
    setTimeout(() => sheet.body.querySelector(options.focusSelector)?.focus?.(), 70);
  }
  if (options.scrollTo) {
    setTimeout(() => sheet.body.querySelector(options.scrollTo)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }
}
async function unlockMusicAudioV22(trigger = 'gesture') {
  const controller = initMusicController();
  if (!controller?.ensureContext) return false;
  try {
    const ctx = await controller.ensureContext();
    const ready = await ensureRunningAudioContextV22(ctx);
    if (!ready || !ctx) throw new Error('Audio unlock failed');
    if (!state.v22AudioPrimed) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.00001;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.02);
    }
    state.v22AudioPrimed = true;
    controller.lastTapError = false;
    controller.emit?.();
    if (trigger === 'explicit' && DOM.musicStatus) {
      DOM.musicStatus.textContent = `${L('v22AudioPrimed')} · ${DOM.musicStatus.textContent || ''}`.replace(/\s+·\s*$/, '');
    }
    return true;
  } catch (err) {
    console.warn(err);
    return false;
  }
}
function bindV22AudioUnlock() {
  if (document.body.dataset.v22AudioUnlockBound) return;
  document.body.dataset.v22AudioUnlockBound = '1';
  const unlock = () => { void unlockMusicAudioV22('gesture'); };
  document.addEventListener('pointerdown', unlock, { capture: true, passive: true });
  document.addEventListener('touchstart', unlock, { capture: true, passive: true });
  DOM.musicToggleBtn?.addEventListener('click', () => { void unlockMusicAudioV22('explicit'); }, true);
}
function formatProgressStateV22(current, target, nutrientId) {
  const safeTarget = Math.max(Number(target) || 0, nutrientId === 'water' ? 100 : 1);
  const ratio = safeTarget > 0 ? clamp((Number(current) || 0) / safeTarget, 0, 1.2) : 0;
  return {
    ratio,
    fill: `${Math.round(ratio * 360)}deg`,
    currentText: metric(current, nutrientId),
    targetText: metric(target, nutrientId),
    stateText: ratio >= 1 ? L('v22ProgressDone') : L('v22ProgressNeed'),
  };
}
function zoneValueTextV22(value, unit = 'cm') {
  return Number.isFinite(value) ? `${round1(value)} ${unit}` : L('v22StageLocked');
}
function bodyZoneRecordsV22() {
  const latest = window.__haochijiaGetBodyLatestRecord?.() || {};
  return [
    { id: 'chest', label: L('v22BodyZoneChest'), className: 'zone-chest', value: latest.chest, hasValue: Number.isFinite(latest.chest) },
    { id: 'arms', label: L('v22BodyZoneArms'), className: 'zone-arms', value: averageOf(latest.upperArmL, latest.upperArmR, latest.forearmL, latest.forearmR), hasValue: [latest.upperArmL, latest.upperArmR, latest.forearmL, latest.forearmR].some(Number.isFinite) },
    { id: 'waist', label: L('v22BodyZoneWaist'), className: 'zone-waist', value: latest.waist ?? latest.abdomen, hasValue: Number.isFinite(latest.waist) || Number.isFinite(latest.abdomen) },
    { id: 'hip', label: L('v22BodyZoneHip'), className: 'zone-hip', value: latest.hip, hasValue: Number.isFinite(latest.hip) },
    { id: 'legs', label: L('v22BodyZoneLegs'), className: 'zone-legs', value: averageOf(latest.thighL, latest.thighR, latest.calfL, latest.calfR), hasValue: [latest.thighL, latest.thighR, latest.calfL, latest.calfR].some(Number.isFinite) },
  ];
}
function averageOf(...values) {
  const nums = values.filter((value) => Number.isFinite(value));
  if (!nums.length) return null;
  return nums.reduce((sum, value) => sum + value, 0) / nums.length;
}
function decorateV22BodyStage() {
  const wrap = document.querySelector('.body-model-stage-wrap-v13') || document.querySelector('.body-model-stage-wrap');
  if (!wrap) return;
  document.getElementById('v22NutritionOrbit')?.remove();
  const stageHost = wrap.parentElement || wrap;
  let dock = document.getElementById('v22NutritionDock');
  let zones = document.getElementById('v22BodyZoneOrbit');
  if (!dock) {
    dock = document.createElement('div');
    dock.id = 'v22NutritionDock';
    dock.className = 'v22-nutrition-dock';
    wrap.insertAdjacentElement('afterend', dock);
  } else if (dock.previousElementSibling !== wrap && stageHost.contains(dock)) {
    wrap.insertAdjacentElement('afterend', dock);
  }
  if (!zones) {
    zones = document.createElement('div');
    zones.id = 'v22BodyZoneOrbit';
    zones.className = 'v22-body-zone-orbit';
    wrap.appendChild(zones);
  }
  const snapshot = realtimeNutritionSnapshotV24();
  const targets = state.calc?.targets || {};
  const nutrients = [
    { id: 'kcal', label: L('v22NutrientKcal') },
    { id: 'protein', label: L('v22NutrientProtein') },
    { id: 'fiber', label: L('v22NutrientFiber') },
    { id: 'water', label: L('v22NutrientWater') },
  ].map((item) => ({
    ...item,
    ...formatProgressStateV22(snapshot.totals?.[item.id], targets[item.id], item.id),
  }));
  dock.innerHTML = nutrients.map((item) => `
    <button type="button" class="v22-nutrient-card" data-v22-nutrient="${escapeHtml(item.id)}">
      <div class="v22-nutrient-ring" style="--fill:${escapeHtml(item.fill)}"></div>
      <div class="v22-nutrient-copy">
        <strong>${escapeHtml(item.label)}</strong>
        <span>${escapeHtml(item.currentText)} / ${escapeHtml(item.targetText)}</span>
        <small>${escapeHtml(item.stateText)}${snapshot.previewSource === 'manual' ? ` · ${escapeHtml(uiLang() === 'zh' ? '包含未保存输入预览' : uiLang() === 'es' ? 'incluye vista previa sin guardar' : 'includes unsaved preview')}` : ''}</small>
      </div>
    </button>`).join('');
  zones.innerHTML = bodyZoneRecordsV22().map((zone) => `
    <button type="button" class="v22-body-zone-chip ${escapeHtml(zone.className)} ${zone.hasValue ? '' : 'is-locked'}" data-v22-zone="${escapeHtml(zone.id)}">
      <strong>${escapeHtml(zone.label)}</strong>
      <span>${escapeHtml(zoneValueTextV22(zone.value))}</span>
    </button>`).join('');
  if (!dock.dataset.boundV22) {
    dock.dataset.boundV22 = '1';
    dock.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-v22-nutrient]');
      if (!btn) return;
      const nutrient = btn.dataset.v22Nutrient;
      if (nutrient === 'water') {
        openV22Sheet('intake');
        return;
      }
      openV22Sheet('intake', { focusSelector: '#foodSearchInput' });
      const query = keywordForNutrient(nutrient);
      if (DOM.foodSearchInput) DOM.foodSearchInput.value = query;
      if (query) setTimeout(() => doSearch(query), 40);
    });
  }
  if (!zones.dataset.boundV22) {
    zones.dataset.boundV22 = '1';
    zones.addEventListener('click', () => openV22Sheet('body'));
  }
}
function foodResultSourceTagV22(item) {
  const region = item?._resultRegion || item?._regionKey || '';
  if (region === 'cn') return { label: L('v22FoodBankCN'), kind: 'cn' };
  if (region === 'global') return { label: L('v22FoodBankGlobal'), kind: 'global' };
  return null;
}
function resultIdentityV22(food) {
  const code = String(food?.c || '').trim();
  if (code) return `code:${code}`;
  const labels = [food?._displayName || '', food?._originalName || '', food?.n || '', food?.b || ''];
  return `name:${normalizeSearch(labels.join(' | '))}`;
}
function tagSearchResultsRegionV22(results, regionKey) {
  return (results || []).map((food, index) => {
    if (food) {
      food._resultRegion = regionKey;
      food._resultRank = index;
    }
    return food;
  });
}
function mergeSearchResultsV22(primaryResults, secondaryResults) {
  const seen = new Set();
  const merged = [];
  [primaryResults || [], secondaryResults || []].forEach((bucket) => {
    bucket.forEach((food) => {
      const key = resultIdentityV22(food);
      if (!key || seen.has(key)) return;
      seen.add(key);
      merged.push(food);
    });
  });
  return merged.slice(0, 24);
}
async function findFoodByCodeAcrossBanksV22(code) {
  const value = String(code || '').trim();
  if (!value) return null;
  const active = resolvedFoodRegion();
  const other = active === 'cn' ? 'global' : 'cn';
  await Promise.all([prepareFoodBankV22(active), prepareFoodBankV22(other)]);
  const direct = state.foodMaps[active]?.get(value);
  if (direct) {
    direct._resultRegion = active;
    return direct;
  }
  const fallback = state.foodMaps[other]?.get(value);
  if (fallback) fallback._resultRegion = other;
  return fallback || null;
}
async function ensureRunningAudioContextV22(ctx) {
  if (!ctx) return false;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (ctx.state === 'running') return true;
    try {
      if (typeof ctx.resume === 'function') await ctx.resume();
    } catch (err) {
      if (attempt >= 2) throw err;
    }
    if (ctx.state === 'running') return true;
    await new Promise((resolve) => window.setTimeout(resolve, 24 * (attempt + 1)));
  }
  return ctx.state === 'running';
}

function yieldToMainV24() {
  return new Promise((resolve) => window.setTimeout(resolve, 0));
}

async function decorateFoodBankBatchV24(foods, key) {
  const foodMap = new Map();
  const batchSize = 72;
  for (let index = 0; index < foods.length; index += 1) {
    const food = foods[index];
    food._regionKey = key;
    food._norm = normalizedFoodNutrients(food);
    food._servingGram = parseServingSizeGrams(food.s || food.serving || food.q || '') || null;
    food._labels = food.labels || buildFoodLabels(food);
    food._displayName = foodLabelForLang(food, uiLang());
    food._originalName = prefersOriginalAsSubtitle(food, uiLang()) ? (food._labels.original || food.n || '') : '';
    food._metaLine = [food.b, food.g, food.q].filter(Boolean).join(' · ');
    food._search = buildFoodSearchText(food, food._labels);
    food._presentIds = foodKnownNutrientIds(food);
    if (food.c) foodMap.set(food.c, food);
    if ((index + 1) % batchSize === 0) {
      if (DOM.foodDataStatus) DOM.foodDataStatus.textContent = `${L('foodLibLoading')} · ${regionName(key)} · ${fmtInt(Math.min(index + 1, foods.length))}/${fmtInt(foods.length)}`;
      await yieldToMainV24();
    }
  }
  return foodMap;
}

function renderV22SearchLoadingV24(raw, regionKey) {
  const prefix = state.lastSearchIntent?.active ? searchV13Text('hintActive') : searchV13Text('hintIdle');
  if (DOM.searchHint) DOM.searchHint.textContent = `${prefix} · ${L('foodLibLoading')} · ${regionName(regionKey)}`;
  if (DOM.foodSearchResults) DOM.foodSearchResults.innerHTML = `
    <div class="empty-state is-loading">
      <h3>${escapeHtml(L('foodLibLoading'))}</h3>
      <p>${escapeHtml(regionName(regionKey))} · ${escapeHtml(raw)}</p>
    </div>`;
}

function commitV22SearchResultsV24(raw, active, fallback, primaryResults, secondaryResults) {
  const mergedResults = mergeSearchResultsV22(primaryResults || [], secondaryResults || []);
  state.lastResults = mergedResults;
  const primaryCount = (primaryResults || []).length;
  const secondaryCount = (secondaryResults || []).length;
  const prefix = state.lastSearchIntent?.active ? searchV13Text('hintActive') : searchV13Text('hintIdle');
  if (mergedResults.length) {
    const notes = [];
    if (!primaryCount && secondaryCount) {
      state.v22SearchFallbackRegion = fallback;
      state.v22LastSearchStatus = L('v22SearchFallback', { name: regionName(fallback) });
      notes.push(state.v22LastSearchStatus);
    } else if (primaryCount && secondaryCount) {
      state.v22SearchFallbackRegion = fallback;
      state.v22LastSearchStatus = L('v22SearchBlend', { primary: regionName(active), secondary: regionName(fallback) });
      notes.push(state.v22LastSearchStatus);
    } else {
      state.v22SearchFallbackRegion = '';
      state.v22LastSearchStatus = '';
    }
    if (DOM.searchHint) {
      const banksText = primaryCount && secondaryCount
        ? `${regionName(active)} + ${regionName(fallback)}`
        : regionName(primaryCount ? active : fallback);
      DOM.searchHint.textContent = `${prefix} · ${L('searchFound', { count: mergedResults.length })} · ${banksText}`;
    }
    if (DOM.foodSearchResults) DOM.foodSearchResults.innerHTML = `${notes.length ? `<div class="v22-search-fallback-note">${escapeHtml(notes.join(' · '))}</div>` : ''}${mergedResults.map((food, idx) => renderSearchItem(food, idx)).join('')}`;
    try { syncIntentSearchUi(); } catch {}
    refreshV22HomeMeta();
    return mergedResults;
  }
  state.v22SearchFallbackRegion = '';
  state.v22LastSearchStatus = active === 'cn' ? L('searchNoResultsCN') : L('searchNoResultsGlobal');
  if (DOM.searchHint) DOM.searchHint.textContent = `${prefix} · ${state.v22LastSearchStatus}`;
  if (DOM.foodSearchResults) DOM.foodSearchResults.innerHTML = `
    <div class="empty-state">
      <h3>${escapeHtml(L('searchNoResultsTitle'))}</h3>
      <p>${escapeHtml(state.v22LastSearchStatus)}</p>
      <p>${escapeHtml(raw)}</p>
    </div>`;
  try { syncIntentSearchUi(); } catch {}
  refreshV22HomeMeta();
  return [];
}

function scheduleOtherBankPrefetchV22() {
  window.clearTimeout(state.v22PrefetchTimer);
  state.v22PrefetchTimer = window.setTimeout(() => {
    const other = resolvedFoodRegion() === 'cn' ? 'global' : 'cn';
    void prepareFoodBankV22(other).catch(() => null);
  }, 1200);
}
async function prepareFoodBankV22(regionKey, force = false) {
  const key = regionKey === 'cn' ? 'cn' : 'global';
  if (state.foodBanks[key] && !force) return state.foodBanks[key];
  if (state.foodPromises[key] && !force) return state.foodPromises[key];
  state.foodsLoading = true;
  if (DOM.foodDataStatus) DOM.foodDataStatus.textContent = `${L(force ? 'foodLibReloading' : 'foodLibLoading')} · ${regionName(key)}`;
  state.foodPromises[key] = (async () => {
    try {
      const foods = await fetchFoodsPayload(key);
      const foodMap = await decorateFoodBankBatchV24(foods, key);
      state.foodBanks[key] = foods;
      state.foodMaps[key] = foodMap;
      if (resolvedFoodRegion() === key) {
        state.foods = foods;
        state.foodMap = foodMap;
        state.foodsLoaded = true;
        syncActiveFoodBank();
        if (DOM.foodDataStatus) DOM.foodDataStatus.textContent = `${L('searchReady', { count: fmtInt(foods.length) })} · ${regionName(key)}`;
      }
      markExploreDirty();
      scheduleOtherBankPrefetchV22();
      return foods;
    } catch (err) {
      console.error(err);
      if (DOM.foodDataStatus) DOM.foodDataStatus.textContent = L('foodLibError', { message: err.message });
      return null;
    } finally {
      state.foodsLoading = false;
      state.foodPromises[key] = null;
    }
  })();
  return state.foodPromises[key];
}
const legacyLoadFoodsV22 = loadFoods;
loadFoods = async function loadFoodsV22(force = false) {
  return prepareFoodBankV22(resolvedFoodRegion(), force);
};
const legacyDoSearchV22 = doSearch;
doSearch = async function doSearchV22(query) {
  const raw = String(query || '').trim();
  state.lastSearchIntent = raw ? analyzeFoodIntentQuery(raw) : null;
  try { syncIntentSearchUi(); } catch {}
  if (!raw) {
    state.lastResults = [];
    state.v22SearchFallbackRegion = '';
    state.v22LastSearchStatus = '';
    refreshV22HomeMeta();
    return legacyDoSearchV22(raw);
  }
  const active = resolvedFoodRegion();
  const fallback = active === 'cn' ? 'global' : 'cn';
  const token = (state.v24SearchToken = (state.v24SearchToken || 0) + 1);

  renderV22SearchLoadingV24(raw, active);
  const foods = await prepareFoodBankV22(active);
  if (token !== state.v24SearchToken) return state.lastResults || [];

  const primaryResults = tagSearchResultsRegionV22(searchFoods(raw, foods || []), active);
  if (primaryResults.length) {
    const committed = commitV22SearchResultsV24(raw, active, fallback, primaryResults, []);
    if (primaryResults.length < 8) {
      void (async () => {
        const fallbackFoods = await prepareFoodBankV22(fallback);
        if (token !== state.v24SearchToken) return;
        const secondaryResults = tagSearchResultsRegionV22(searchFoods(raw, fallbackFoods || []), fallback);
        if (!secondaryResults.length) return;
        if (mergeSearchResultsV22(primaryResults, secondaryResults).length <= committed.length) return;
        commitV22SearchResultsV24(raw, active, fallback, primaryResults, secondaryResults);
      })().catch(() => null);
    }
    return committed;
  }

  renderV22SearchLoadingV24(raw, fallback);
  const fallbackFoods = await prepareFoodBankV22(fallback);
  if (token !== state.v24SearchToken) return state.lastResults || [];
  const secondaryResults = tagSearchResultsRegionV22(searchFoods(raw, fallbackFoods || []), fallback);
  return commitV22SearchResultsV24(raw, active, fallback, primaryResults, secondaryResults);
};

const legacyOpenPanelV22 = openPanel;
openPanel = function openPanelV22(id) {
  const map = {
    sound: 'music',
    profile: 'body',
    food: 'intake',
    combo: 'combo',
    data: 'data',
    today: 'today',
    capture: 'upload',
  };
  if (map[id]) {
    openV22Sheet(map[id], { focusSelector: id === 'food' ? '#foodSearchInput' : '' });
    return;
  }
  legacyOpenPanelV22(id);
};
window.__haochijiaOpenPanel = (id) => openPanel(id);

function patchOpenBodyPanelV22() {
  const original = window.__haochijiaOpenBodyPanel;
  if (!original || original.__v22Wrapped) return;
  const wrapped = function wrappedOpenBodyPanelV22(focus = true) {
    openV22Sheet('body');
    setTimeout(() => original(focus), 20);
  };
  wrapped.__v22Wrapped = true;
  window.__haochijiaOpenBodyPanel = wrapped;
}

const legacyRenderAllV22 = renderAll;
renderAll = function renderAllV22() {
  legacyRenderAllV22();
  ensureV22HomeStructure();
  refreshV22HomeMeta();
  decorateV22BodyStage();
};
const legacyApplyLanguageV22 = applyLanguage;
applyLanguage = function applyLanguageV22() {
  legacyApplyLanguageV22();
  refreshV22EntryCopy();
  refreshV22HomeSearchCopy();
  if (DOM.summaryHint) DOM.summaryHint.textContent = L('immersiveHubHint');
  ensureV22HomeStructure();
};
const legacyRenderDatasetMetaV22 = renderDatasetMeta;
renderDatasetMeta = function renderDatasetMetaV22() {
  legacyRenderDatasetMetaV22();
  refreshV22HomeMeta();
};
registerServiceWorker = async function registerServiceWorkerV22() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((reg) => reg.unregister().catch(() => false)));
    const registration = await navigator.serviceWorker.register('./sw.js?v=20260417-v22', { updateViaCache: 'none' });
    await registration.update?.();
  } catch (err) {
    console.warn(err);
  }
};

function bindV22FlowEvents() {
  if (document.body.dataset.v22FlowBound) return;
  document.body.dataset.v22FlowBound = '1';
  document.addEventListener('click', (event) => {
    if (event.target.closest('#musicSaveCollapseBtn')) {
      setTimeout(() => openV22Sheet('body'), 110);
      return;
    }
    if (event.target.closest('[data-region-switch-to]')) {
      state.v22LastSearchStatus = '';
      refreshV22HomeMeta();
    }
  }, true);
  window.addEventListener('haochijia:body-sync', (event) => {
    decorateV22BodyStage();
    refreshV22HomeMeta();
    if (event.detail?.saved) {
      closeV22Sheet();
      showToast(L('v22FlowBodyReady'));
    }
  });
  window.addEventListener('haochijia:body-ready', () => {
    patchOpenBodyPanelV22();
    ensureV22HomeStructure();
    decorateV22BodyStage();
  });
}
function bindV24MobileHeaderCollapse() {
  const header = document.querySelector('.app-header');
  if (!header || header.dataset.v24HeaderBound) return;
  header.dataset.v24HeaderBound = '1';
  let lastY = Math.max(0, window.scrollY || window.pageYOffset || 0);
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = Math.max(0, window.scrollY || window.pageYOffset || 0);
    const scrollingDown = y > lastY + 4;
    const mobile = document.body.classList.contains('v22-mobile-first');
    header.classList.toggle('is-condensed', mobile && y > 24);
    header.classList.toggle('is-hidden', mobile && y > 148 && scrollingDown && !document.body.classList.contains('v22-sheet-open'));
    lastY = y;
  };
  const queue = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue, { passive: true });
  queue();
}

function initV22Layout() {
  ensureV22HomeStructure();
  ensureV22SheetShell();
  ensureV22EntryModal();
  applyDeviceModeV22();
  bindV22AudioUnlock();
  bindV22FlowEvents();
  bindRealtimeNutritionPreviewV24();
  bindV24MobileHeaderCollapse();
  patchOpenBodyPanelV22();
  if (DOM.musicStatus && /Macintosh|Mac OS X/i.test(navigator.userAgent || '')) {
    DOM.musicStatus.textContent = `${L('v22SheetMusicNote')} · ${DOM.musicStatus.textContent || ''}`;
  }
  showV22EntryModal();
  void prepareFoodBankV22(resolvedFoodRegion()).catch(() => legacyLoadFoodsV22(false));
}

window.addEventListener('DOMContentLoaded', () => {
  initV22Layout();
  setTimeout(() => {
    ensureV22HomeStructure();
    decorateV22BodyStage();
  }, 180);
});
if (document.readyState !== 'loading') {
  setTimeout(() => {
    initV22Layout();
    ensureV22HomeStructure();
    decorateV22BodyStage();
  }, 0);
}
