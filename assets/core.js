import {
  defaultProfile,
  sanitizeProfile,
  calculateTargets,
  createEmptyTotals,
  mergeTotals,
  normalizedFoodNutrients,
  scaleNutrients,
  formatNumber,
  round1,
  round0,
  clamp,
  NUTRIENT_DEFS,
  OCR_FIELD_MAP,
} from './nutrition-refs.js';
import { createBodyModelController } from './model-scene.js';

const STORAGE_KEY = 'haochijia.core.v31.snapshot';
const DB_NAME = 'haochijia-core-v31';
const DB_STORE = 'kv';
const IDB_SNAPSHOT_KEY = 'snapshot';
const IDB_PHOTO_KEY = 'photoRef';
const MAX_BODY_HISTORY = 60;
const MAX_LOG_ITEMS_PER_DAY = 300;
const FOOD_SEARCH_LIMIT = 20;
const RING_FIELD_MAP = {
  protein: 'chest',
  fat: 'hip',
  carbs: 'thighL',
  calcium: 'hip',
  vitaminD: 'chest',
  vitaminK: 'hip',
  iron: 'chest',
  folate: 'abdomen',
  vitaminB12: 'neck',
  fiber: 'abdomen',
  water: 'waist',
  omega3: 'chest',
  potassium: 'calfL',
  magnesium: 'waist',
  vitaminC: 'chest',
};
const DISPLAY_LABELS = {
  vitaminD: '维生素 D3',
  vitaminK: '维生素 K',
  vitaminB12: '维生素 B12',
  omega3: 'Omega-3',
  water: '水分',
};
const BODY_IMPORT_ALIASES = {
  recordedAt: ['recordedAt', 'recorded_at', 'date', 'datetime', '时间', '记录时间'],
  heightCm: ['heightCm', 'height', '身高'],
  weightKg: ['weightKg', 'weight', '体重'],
  bodyFat: ['bodyFat', 'fat', 'body_fat', '体脂', '体脂率'],
  neck: ['neck', '颈围'],
  shoulder: ['shoulder', '肩宽'],
  chest: ['chest', '胸围'],
  underbust: ['underbust', '下胸围'],
  waist: ['waist', '腰围'],
  abdomen: ['abdomen', '腹围'],
  hip: ['hip', '臀围'],
  upperArm: ['upperArm', 'upper_arm', '上臂'],
  forearm: ['forearm', '前臂'],
  thigh: ['thigh', '大腿'],
  calf: ['calf', '小腿'],
  ankle: ['ankle', '脚踝'],
};
const NUTRIENT_HINTS = {
  protein: ['鸡胸', '鸡蛋', '豆腐', '希腊酸奶'],
  fat: ['坚果', '牛油果', '橄榄油', '三文鱼'],
  carbs: ['燕麦', '米饭', '土豆', '全麦面'],
  fiber: ['燕麦', '豆类', '苹果', '西兰花'],
  calcium: ['牛奶', '酸奶', '北豆腐', '沙丁鱼'],
  vitaminD: ['三文鱼', '鸡蛋', '强化奶', '蘑菇'],
  vitaminK: ['菠菜', '羽衣甘蓝', '西兰花', '生菜'],
  iron: ['牛肉', '动物肝', '蛤蜊', '菠菜'],
  folate: ['菠菜', '芦笋', '鹰嘴豆', '牛油果'],
  vitaminB12: ['鱼类', '鸡蛋', '牛奶', '贝类'],
  potassium: ['香蕉', '土豆', '牛油果', '酸奶'],
  magnesium: ['南瓜籽', '杏仁', '黑巧', '燕麦'],
  omega3: ['三文鱼', '沙丁鱼', '亚麻籽', '核桃'],
  vitaminC: ['奇异果', '草莓', '彩椒', '橙子'],
  water: ['饮水', '清汤', '高含水水果', '淡茶'],
};
const RING_COLORS = {
  protein: '#8db4ff',
  fat: '#ffb781',
  carbs: '#85e0ff',
  fiber: '#86d7a6',
  water: '#7bdcff',
  calcium: '#c9b3ff',
  vitaminD: '#ffd27f',
  vitaminK: '#8fe2c1',
  iron: '#ff8ba4',
  folate: '#94f0ba',
  vitaminB12: '#b5c5ff',
  potassium: '#94e6ff',
  magnesium: '#b5a2ff',
  omega3: '#98d6ff',
  vitaminC: '#ffd16f',
};
const DEFAULT_GITHUB = {
  owner: '',
  repo: '',
  branch: 'main',
  path: 'data/haochijia-user.json',
  token: '',
  autoSync: false,
};

const DOM = {};
const state = {
  version: 'v31',
  platform: detectPlatform(),
  profile: { ...defaultProfile(), bodyFat: 22, focusNote: '' },
  bodyHistory: [],
  logs: {},
  customFoods: [],
  foods: [],
  foodsLoaded: false,
  foodsLoading: false,
  foodsPromise: null,
  searchResults: [],
  searchQuery: '',
  activeTab: 'body',
  activeDate: todayString(),
  calc: null,
  totals: createEmptyTotals(),
  focusMode: null,
  activeRing: 'protein',
  github: { ...DEFAULT_GITHUB },
  captureParsed: null,
  photoShape: {
    shoulder: 1,
    waist: 1,
    hip: 1,
    leg: 1,
    hasPhoto: false,
  },
  photoRefUrl: '',
  model: null,
  persistGranted: false,
  githubSyncTimer: null,
};

window.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => {
  window.clearTimeout(window.__haochijiaRingResizeTimer);
  window.__haochijiaRingResizeTimer = window.setTimeout(renderHeroRings, 90);
}, { passive: true });

async function init() {
  bindDom();
  document.body.dataset.platform = state.platform.key;
  DOM.platformBadge.textContent = state.platform.label;
  await loadState();
  fillFormsFromState();
  bindEvents();
  state.model = createBodyModelController(DOM.bodyCanvas, {
    onLongPress: () => activateTab('body'),
    onViewReset: () => {
      DOM.focusModeText.textContent = `${state.focusMode?.label || '基础模式'} · 已回正`;
      window.setTimeout(() => renderHeroMeta(), 900);
    },
  });
  await state.model.ready;
  registerServiceWorker();
  requestIdleLoadFoods();
  renderAll();
  await updatePersistStatus();
}

function bindDom() {
  const ids = [
    'appShell', 'platformBadge', 'menuBtn', 'bodyCanvas', 'stagePhotoRef', 'focusModePill', 'focusModeText', 'ringOrbit',
    'profileForm', 'bodyForm', 'bodyStatusHint', 'importBodyBtn', 'saveBodyBtn', 'photoShapeBtn', 'suggestionSummary', 'suggestionCards',
    'bodyHistoryList', 'bodyHistoryMeta', 'foodSearchStatus', 'foodSearchInput', 'foodAmountInput', 'foodSearchResults', 'captureInput',
    'runBarcodeBtn', 'runOcrBtn', 'capturePreview', 'captureStatus', 'captureResult', 'captureFoodName', 'captureBasis', 'captureServingSize',
    'captureServings', 'captureNutrients', 'addCaptureFoodBtn', 'saveCaptureFoodBtn', 'progressList', 'dayTotalBadge', 'logList', 'clearDayBtn',
    'photoDialog', 'photoInput', 'photoPreview', 'shapeShoulder', 'shapeWaist', 'shapeHip', 'shapeLeg', 'photoResetBtn', 'photoApplyBtn',
    'dataDialog', 'persistStatus', 'importAllBtn', 'exportAllBtn', 'bodyCsvBtn', 'persistBtn', 'githubStatus', 'ghOwner', 'ghRepo', 'ghBranch',
    'ghPath', 'ghToken', 'ghAutoSync', 'ghRestoreBtn', 'ghSyncBtn', 'importInput'
  ];
  ids.forEach((id) => { DOM[id] = document.getElementById(id); });
}

function bindEvents() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab || 'body'));
  });

  DOM.menuBtn.addEventListener('click', () => DOM.dataDialog.showModal());
  DOM.photoShapeBtn.addEventListener('click', () => {
    fillPhotoDialog();
    DOM.photoDialog.showModal();
  });
  DOM.importBodyBtn.addEventListener('click', () => {
    DOM.importInput.dataset.mode = 'body';
    DOM.importInput.click();
  });
  DOM.importAllBtn.addEventListener('click', () => {
    DOM.importInput.dataset.mode = 'all';
    DOM.importInput.click();
  });
  DOM.importInput.addEventListener('change', onImportSelected);

  DOM.profileForm.addEventListener('input', onProfileInput);
  DOM.profileForm.addEventListener('change', onProfileInput);
  DOM.bodyForm.addEventListener('input', onBodyInput);
  DOM.bodyForm.addEventListener('change', onBodyInput);
  DOM.saveBodyBtn.addEventListener('click', saveBodyRecord);

  DOM.foodSearchInput.addEventListener('input', onFoodSearchInput);
  DOM.foodSearchInput.addEventListener('focus', async () => {
    await ensureFoodsLoaded();
    renderFoodSearchResults();
  });
  DOM.foodAmountInput.addEventListener('input', renderFoodSearchResults);
  DOM.foodSearchResults.addEventListener('click', onFoodResultsClick);

  DOM.captureInput.addEventListener('change', updateCapturePreview);
  DOM.runBarcodeBtn.addEventListener('click', runBarcodeSearch);
  DOM.runOcrBtn.addEventListener('click', runOcrSearch);
  DOM.captureBasis.addEventListener('change', renderCaptureResult);
  DOM.addCaptureFoodBtn.addEventListener('click', addCaptureFoodToToday);
  DOM.saveCaptureFoodBtn.addEventListener('click', saveCaptureFoodToLibrary);

  DOM.logList.addEventListener('click', onLogListClick);
  DOM.bodyHistoryList.addEventListener('click', onBodyHistoryClick);
  DOM.clearDayBtn.addEventListener('click', clearTodayLog);

  DOM.photoInput.addEventListener('change', onPhotoSelected);
  ['shapeShoulder', 'shapeWaist', 'shapeHip', 'shapeLeg'].forEach((id) => {
    DOM[id].addEventListener('input', renderPhotoPreviewMeta);
  });
  DOM.photoResetBtn.addEventListener('click', resetPhotoShape);
  DOM.photoApplyBtn.addEventListener('click', applyPhotoShape);

  DOM.exportAllBtn.addEventListener('click', exportAllData);
  DOM.bodyCsvBtn.addEventListener('click', exportBodyCsv);
  DOM.persistBtn.addEventListener('click', requestPersistentStorage);
  DOM.ghSyncBtn.addEventListener('click', () => syncToGitHub(true));
  DOM.ghRestoreBtn.addEventListener('click', restoreFromGitHub);
  ['ghOwner', 'ghRepo', 'ghBranch', 'ghPath', 'ghToken', 'ghAutoSync'].forEach((id) => {
    DOM[id].addEventListener('input', onGitHubFieldChange);
    DOM[id].addEventListener('change', onGitHubFieldChange);
  });

  DOM.ringOrbit.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-ring-id]');
    if (!btn) return;
    state.activeRing = btn.dataset.ringId || state.activeRing;
    state.model?.setFocusField(RING_FIELD_MAP[state.activeRing] || '');
    renderHeroRings();
  });
}

async function loadState() {
  const localSnapshot = safeJsonParse(localStorage.getItem(STORAGE_KEY), null);
  const idbSnapshot = await idbGet(IDB_SNAPSHOT_KEY).catch(() => null);
  const snapshot = pickNewestSnapshot(localSnapshot, idbSnapshot) || createDefaultSnapshot();
  applySnapshot(snapshot);
  const photoRef = await idbGet(IDB_PHOTO_KEY).catch(() => '');
  state.photoRefUrl = typeof photoRef === 'string' ? photoRef : '';
}

function createDefaultSnapshot() {
  return {
    version: state.version,
    updatedAt: new Date().toISOString(),
    profile: { ...defaultProfile(), bodyFat: 22, focusNote: '' },
    bodyHistory: [],
    logs: {},
    customFoods: [],
    photoShape: { shoulder: 1, waist: 1, hip: 1, leg: 1, hasPhoto: false },
    github: { ...DEFAULT_GITHUB },
  };
}

function applySnapshot(snapshot) {
  state.profile = normalizeProfileSnapshot(snapshot.profile);
  state.bodyHistory = normalizeBodyHistory(snapshot.bodyHistory || []);
  state.logs = normalizeLogs(snapshot.logs || {});
  state.customFoods = normalizeCustomFoods(snapshot.customFoods || []);
  state.photoShape = normalizePhotoShape(snapshot.photoShape || {});
  if (typeof snapshot.photoRefUrl === 'string') state.photoRefUrl = snapshot.photoRefUrl;
  state.github = { ...DEFAULT_GITHUB, ...(snapshot.github || {}) };
  state.focusMode = inferFocusMode(state.profile);
  state.activeRing = state.focusMode.nutrientIds[0];
}

function normalizeProfileSnapshot(raw = {}) {
  const profile = sanitizeProfile(raw);
  return {
    ...profile,
    bodyFat: clamp(Number(raw.bodyFat) || 22, 2, 60),
    focusNote: String(raw.focusNote || '').slice(0, 120),
  };
}

function normalizeBodyHistory(list) {
  return Array.isArray(list)
    ? list.map(normalizeBodyRecord).filter(Boolean).sort((a, b) => String(b.recordedAt).localeCompare(String(a.recordedAt))).slice(0, MAX_BODY_HISTORY)
    : [];
}

function normalizeBodyRecord(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const upperArm = Number.isFinite(Number(raw.upperArm)) ? Number(raw.upperArm) : averageOrNull(raw.upperArmL, raw.upperArmR);
  const forearm = Number.isFinite(Number(raw.forearm)) ? Number(raw.forearm) : averageOrNull(raw.forearmL, raw.forearmR);
  const thigh = Number.isFinite(Number(raw.thigh)) ? Number(raw.thigh) : averageOrNull(raw.thighL, raw.thighR);
  const calf = Number.isFinite(Number(raw.calf)) ? Number(raw.calf) : averageOrNull(raw.calfL, raw.calfR);
  const ankle = Number.isFinite(Number(raw.ankle)) ? Number(raw.ankle) : averageOrNull(raw.ankleL, raw.ankleR);
  return {
    recordedAt: raw.recordedAt || new Date().toISOString(),
    heightCm: finiteOrNull(raw.heightCm),
    weightKg: finiteOrNull(raw.weightKg),
    bodyFat: finiteOrNull(raw.bodyFat),
    neck: finiteOrNull(raw.neck),
    shoulder: finiteOrNull(raw.shoulder),
    chest: finiteOrNull(raw.chest),
    underbust: finiteOrNull(raw.underbust),
    waist: finiteOrNull(raw.waist),
    abdomen: finiteOrNull(raw.abdomen),
    hip: finiteOrNull(raw.hip),
    upperArm: finiteOrNull(upperArm),
    forearm: finiteOrNull(forearm),
    thigh: finiteOrNull(thigh),
    calf: finiteOrNull(calf),
    ankle: finiteOrNull(ankle),
  };
}

function normalizeLogs(logs) {
  const out = {};
  Object.entries(logs || {}).forEach(([date, entry]) => {
    const items = Array.isArray(entry?.items) ? entry.items.map(normalizeLogItem).filter(Boolean).slice(0, MAX_LOG_ITEMS_PER_DAY) : [];
    if (items.length) out[date] = { items };
  });
  return out;
}

function normalizeLogItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  return {
    id: raw.id || uid('log'),
    createdAt: raw.createdAt || new Date().toISOString(),
    label: String(raw.label || raw.name || '未命名食品'),
    grams: finiteOrNull(raw.grams),
    code: String(raw.code || ''),
    nutrients: normalizeNutrientObject(raw.nutrients || {}),
    source: String(raw.source || 'library'),
  };
}

function normalizeCustomFoods(list) {
  return Array.isArray(list) ? list.map(normalizeCustomFood).filter(Boolean).slice(0, 120) : [];
}

function normalizeCustomFood(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const name = String(raw.name || raw.label || raw.n || '').trim();
  if (!name) return null;
  return {
    id: String(raw.id || uid('custom')),
    name,
    code: String(raw.code || ''),
    basis: raw.basis === 'serving' ? 'serving' : raw.basis === '100ml' ? '100ml' : '100g',
    servingSize: finiteOrNull(raw.servingSize),
    customPer100: normalizeNutrientObject(raw.customPer100 || raw.customNutrients || {}),
    labels: {
      zh: name,
      original: name,
    },
  };
}

function normalizePhotoShape(raw = {}) {
  return {
    shoulder: clamp(Number(raw.shoulder) || 1, 0.8, 1.25),
    waist: clamp(Number(raw.waist) || 1, 0.8, 1.25),
    hip: clamp(Number(raw.hip) || 1, 0.8, 1.25),
    leg: clamp(Number(raw.leg) || 1, 0.85, 1.2),
    hasPhoto: Boolean(raw.hasPhoto),
  };
}

function normalizeNutrientObject(obj) {
  const out = {};
  Object.entries(obj || {}).forEach(([key, value]) => {
    if (Number.isFinite(Number(value))) out[key] = Number(value);
  });
  return out;
}

function pickNewestSnapshot(a, b) {
  const ta = Date.parse(a?.updatedAt || 0) || 0;
  const tb = Date.parse(b?.updatedAt || 0) || 0;
  return tb > ta ? b : a;
}

function fillFormsFromState() {
  const p = state.profile;
  DOM.profileForm.sex.value = p.sex;
  DOM.profileForm.age.value = p.age;
  DOM.profileForm.heightCm.value = p.heightCm;
  DOM.profileForm.weightKg.value = p.weightKg;
  DOM.profileForm.bodyFat.value = p.bodyFat || '';
  DOM.profileForm.activity.value = p.activity;
  DOM.profileForm.goal.value = p.goal;
  DOM.profileForm.training.value = p.training;
  DOM.profileForm.trainingHoursWeek.value = p.trainingHoursWeek;
  DOM.profileForm.diet.value = p.diet;
  DOM.profileForm.physiology.value = p.physiology;
  DOM.profileForm.glucoseStatus.value = p.glucoseStatus;
  DOM.profileForm.focusNote.value = p.focusNote || '';
  DOM.profileForm.boneRisk.checked = Boolean(p.conditions?.boneRisk);
  DOM.profileForm.anemiaRisk.checked = Boolean(p.conditions?.anemiaRisk);
  DOM.profileForm.hypertension.checked = Boolean(p.conditions?.hypertension);
  DOM.profileForm.dyslipidemia.checked = Boolean(p.conditions?.dyslipidemia);
  DOM.profileForm.smoker.checked = Boolean(p.smoker);

  const latest = state.bodyHistory[0] || {};
  fillBodyForm(latest);
  fillGitHubForm();
  fillPhotoDialog();
}

function fillBodyForm(record = {}) {
  const fields = ['neck', 'shoulder', 'chest', 'underbust', 'waist', 'abdomen', 'hip', 'upperArm', 'forearm', 'thigh', 'calf', 'ankle'];
  fields.forEach((field) => {
    const value = record[field] ?? averageOrNull(record[`${field}L`], record[`${field}R`]);
    DOM.bodyForm[field].value = Number.isFinite(Number(value)) ? Number(value) : '';
  });
}

function fillGitHubForm() {
  DOM.ghOwner.value = state.github.owner || '';
  DOM.ghRepo.value = state.github.repo || '';
  DOM.ghBranch.value = state.github.branch || 'main';
  DOM.ghPath.value = state.github.path || 'data/haochijia-user.json';
  DOM.ghToken.value = state.github.token || '';
  DOM.ghAutoSync.checked = Boolean(state.github.autoSync);
}

function fillPhotoDialog() {
  DOM.shapeShoulder.value = Math.round((state.photoShape.shoulder || 1) * 100);
  DOM.shapeWaist.value = Math.round((state.photoShape.waist || 1) * 100);
  DOM.shapeHip.value = Math.round((state.photoShape.hip || 1) * 100);
  DOM.shapeLeg.value = Math.round((state.photoShape.leg || 1) * 100);
  if (state.photoRefUrl) {
    DOM.photoPreview.src = state.photoRefUrl;
    DOM.photoPreview.hidden = false;
  } else {
    DOM.photoPreview.hidden = true;
    DOM.photoPreview.removeAttribute('src');
  }
}

function renderAll() {
  recomputeState();
  renderHeroMeta();
  renderHeroRings();
  renderSuggestions();
  renderBodyHistory();
  renderFoodSearchResults();
  renderProgressList();
  renderLogList();
  renderCaptureResult();
  renderPhotoRef();
  renderGitHubStatus();
  if (state.model) {
    state.model.setSnapshot(buildModelSnapshot());
    state.model.setFocusField(RING_FIELD_MAP[state.activeRing] || '');
  }
}

function recomputeState() {
  state.profile = readProfileForm();
  state.calc = calculateTargets(state.profile);
  state.totals = computeTotalsForDate(state.activeDate);
  state.focusMode = inferFocusMode(state.profile);
  if (!state.focusMode.nutrientIds.includes(state.activeRing)) {
    state.activeRing = state.focusMode.nutrientIds[0];
  }
}

function readProfileForm() {
  return sanitizeProfile({
    sex: DOM.profileForm.sex.value,
    age: Number(DOM.profileForm.age.value),
    heightCm: Number(DOM.profileForm.heightCm.value),
    weightKg: Number(DOM.profileForm.weightKg.value),
    activity: DOM.profileForm.activity.value,
    goal: DOM.profileForm.goal.value,
    training: DOM.profileForm.training.value,
    trainingHoursWeek: Number(DOM.profileForm.trainingHoursWeek.value),
    diet: DOM.profileForm.diet.value,
    physiology: DOM.profileForm.physiology.value,
    smoker: DOM.profileForm.smoker.checked,
    glucoseStatus: DOM.profileForm.glucoseStatus.value,
    conditions: {
      boneRisk: DOM.profileForm.boneRisk.checked,
      anemiaRisk: DOM.profileForm.anemiaRisk.checked,
      hypertension: DOM.profileForm.hypertension.checked,
      dyslipidemia: DOM.profileForm.dyslipidemia.checked,
    },
    bodyFat: Number(DOM.profileForm.bodyFat.value),
    focusNote: DOM.profileForm.focusNote.value,
  });
}

function readBodyForm() {
  return {
    neck: finiteOrNull(DOM.bodyForm.neck.value),
    shoulder: finiteOrNull(DOM.bodyForm.shoulder.value),
    chest: finiteOrNull(DOM.bodyForm.chest.value),
    underbust: finiteOrNull(DOM.bodyForm.underbust.value),
    waist: finiteOrNull(DOM.bodyForm.waist.value),
    abdomen: finiteOrNull(DOM.bodyForm.abdomen.value),
    hip: finiteOrNull(DOM.bodyForm.hip.value),
    upperArm: finiteOrNull(DOM.bodyForm.upperArm.value),
    forearm: finiteOrNull(DOM.bodyForm.forearm.value),
    thigh: finiteOrNull(DOM.bodyForm.thigh.value),
    calf: finiteOrNull(DOM.bodyForm.calf.value),
    ankle: finiteOrNull(DOM.bodyForm.ankle.value),
  };
}

function buildCurrentBodyRecord() {
  const body = readBodyForm();
  return normalizeBodyRecord({
    recordedAt: new Date().toISOString(),
    heightCm: state.profile.heightCm,
    weightKg: state.profile.weightKg,
    bodyFat: finiteOrNull(DOM.profileForm.bodyFat.value),
    ...body,
  });
}

function buildModelRecord() {
  const record = buildCurrentBodyRecord();
  return {
    ...record,
    upperArmL: record.upperArm,
    upperArmR: record.upperArm,
    forearmL: record.forearm,
    forearmR: record.forearm,
    thighL: record.thigh,
    thighR: record.thigh,
    calfL: record.calf,
    calfR: record.calf,
    ankleL: record.ankle,
    ankleR: record.ankle,
    shapeShoulder: state.photoShape.shoulder,
    shapeWaist: state.photoShape.waist,
    shapeHip: state.photoShape.hip,
    shapeLeg: state.photoShape.leg,
  };
}

function buildModelSnapshot() {
  const current = buildModelRecord();
  const latest = state.bodyHistory[0] ? expandHistoryRecord(state.bodyHistory[0]) : null;
  const previous = state.bodyHistory[1] ? expandHistoryRecord(state.bodyHistory[1]) : null;
  return {
    current,
    previous: latest && bodyRecordsSame(current, latest) ? previous : latest,
  };
}

function expandHistoryRecord(record) {
  return {
    ...record,
    upperArmL: record.upperArm,
    upperArmR: record.upperArm,
    forearmL: record.forearm,
    forearmR: record.forearm,
    thighL: record.thigh,
    thighR: record.thigh,
    calfL: record.calf,
    calfR: record.calf,
    ankleL: record.ankle,
    ankleR: record.ankle,
    shapeShoulder: state.photoShape.shoulder,
    shapeWaist: state.photoShape.waist,
    shapeHip: state.photoShape.hip,
    shapeLeg: state.photoShape.leg,
  };
}

function bodyRecordsSame(a, b) {
  if (!a || !b) return false;
  const keys = ['heightCm', 'weightKg', 'bodyFat', 'neck', 'shoulder', 'chest', 'underbust', 'waist', 'abdomen', 'hip', 'upperArm', 'forearm', 'thigh', 'calf', 'ankle'];
  return keys.every((key) => round1(Number(a[key] || 0)) === round1(Number(b[key] || 0)));
}

function activateTab(tab) {
  state.activeTab = tab === 'intake' ? 'intake' : 'body';
  document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.toggle('is-active', btn.dataset.tab === state.activeTab));
  document.querySelectorAll('.panel').forEach((panel) => panel.classList.toggle('is-active', panel.dataset.panel === state.activeTab));
  if (state.activeTab === 'intake') ensureFoodsLoaded();
}

function renderHeroMeta() {
  DOM.focusModePill.textContent = state.focusMode.label;
  DOM.focusModeText.textContent = state.focusMode.summary;
}

function renderHeroRings() {
  if (!DOM.ringOrbit) return;
  const ringData = buildRingData();
  const rect = DOM.heroStage?.getBoundingClientRect?.() || DOM.ringOrbit.getBoundingClientRect();
  const width = rect.width || 360;
  const height = rect.height || 520;
  const centerX = width * 0.5;
  const centerY = height * 0.44;
  const radius = Math.min(width, height) * (width < 390 ? 0.34 : 0.36);
  const angles = [-94, -30, 24, 90, 154, 214];

  DOM.ringOrbit.innerHTML = '';
  ringData.forEach((ring, index) => {
    const angle = angles[index] * Math.PI / 180;
    const focus = ring.id === state.activeRing;
    const size = focus ? (width < 390 ? 96 : 104) : (ring.focus ? (width < 390 ? 90 : 98) : (width < 390 ? 84 : 92));
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `nutri-ring${ring.focus ? ' is-focus' : ''}${focus ? ' is-active' : ''}`;
    button.dataset.ringId = ring.id;
    button.style.left = `${x}px`;
    button.style.top = `${y}px`;
    button.style.transform = 'translate(-50%, -50%)';
    button.style.width = `${size}px`;
    button.style.height = `${size}px`;
    button.style.setProperty('--ring-color', ring.color);
    button.style.setProperty('--ring-pct', `${Math.max(0, Math.min(100, ring.percent))}%`);
    button.innerHTML = `
      <span class="ring-inner">
        <span>
          <strong>${escapeHtml(ring.label)}</strong>
          <span class="ring-percent">${Math.round(ring.percent)}%</span>
          <span class="ring-meta">${escapeHtml(ring.meta)}</span>
        </span>
      </span>`;
    DOM.ringOrbit.appendChild(button);
  });
}

function buildRingData() {
  const targets = state.calc.targets;
  return state.focusMode.nutrientIds.map((id, index) => {
    const target = targets[id];
    const current = Number(state.totals[id] || 0);
    const progress = progressForTarget(target, current);
    return {
      id,
      focus: index >= 3,
      label: nutrientDisplayName(id),
      current,
      targetValue: targetValue(target),
      percent: clamp(progress * 100, 0, 199),
      meta: `${formatCompactNutrient(id, current)} / ${formatCompactNutrient(id, targetValue(target))}`,
      color: RING_COLORS[id] || '#80a9ff',
    };
  });
}

function renderSuggestions() {
  const cards = buildSuggestionCards();
  DOM.suggestionSummary.textContent = `${state.focusMode.label} · ${cards.length} 条建议`;
  if (!cards.length) {
    DOM.suggestionCards.innerHTML = '<div class="empty-state">暂无建议</div>';
    return;
  }
  DOM.suggestionCards.innerHTML = cards.map((card) => `
    <article class="suggestion-card">
      <strong>${escapeHtml(card.title)}</strong>
      <div class="history-meta">${escapeHtml(card.subtitle)}</div>
      <div class="suggestion-foods">${escapeHtml(card.foods.join(' · '))}</div>
    </article>
  `).join('');
}

function buildSuggestionCards() {
  const dynamicIds = state.focusMode.nutrientIds.slice(3);
  const cards = dynamicIds.map((id) => {
    const target = state.calc.targets[id];
    const current = Number(state.totals[id] || 0);
    const pct = Math.round(progressForTarget(target, current) * 100);
    const targetText = formatCompactNutrient(id, targetValue(target));
    return {
      title: `${nutrientDisplayName(id)} ${pct}%`,
      subtitle: `${state.focusMode.tipMap[id] || '当前优先'} · 目标 ${targetText}`,
      foods: NUTRIENT_HINTS[id] || ['优先真实食物', '均衡搭配', '连续记录'],
    };
  });
  return cards;
}

function renderBodyHistory() {
  DOM.bodyHistoryMeta.textContent = `${state.bodyHistory.length} 条`;
  if (!state.bodyHistory.length) {
    DOM.bodyHistoryList.innerHTML = '<div class="empty-state">先保存第一条身体记录</div>';
    return;
  }
  DOM.bodyHistoryList.innerHTML = state.bodyHistory.slice(0, 10).map((item, index) => `
    <article class="history-item">
      <strong>${escapeHtml(formatDateTime(item.recordedAt))}</strong>
      <div class="history-meta">${escapeHtml(bodyRecordSummary(item))}</div>
      <button type="button" class="ghost-btn tiny-btn" data-load-body-index="${index}">载入</button>
    </article>
  `).join('');
}

function renderFoodSearchResults() {
  if (!state.searchQuery.trim()) {
    DOM.foodSearchResults.innerHTML = renderSearchPlaceholder();
    return;
  }
  if (state.foodsLoading && !state.foodsLoaded) {
    DOM.foodSearchResults.innerHTML = '<div class="empty-state">食品库加载中…</div>';
    return;
  }
  if (!state.searchResults.length) {
    DOM.foodSearchResults.innerHTML = '<div class="empty-state">没有找到匹配项</div>';
    return;
  }
  const amount = clamp(Number(DOM.foodAmountInput.value) || 100, 1, 3000);
  DOM.foodSearchResults.innerHTML = state.searchResults.map((food, index) => {
    const per100 = nutrientsForFood(food);
    return `
      <article class="food-item">
        <strong>${escapeHtml(foodDisplayName(food))}</strong>
        <div class="food-meta">每 100：${escapeHtml(formatCompactNutrient('kcal', per100.kcal || 0))} · ${escapeHtml(formatCompactNutrient('protein', per100.protein || 0))} · ${escapeHtml(formatCompactNutrient('carbs', per100.carbs || 0))} · ${escapeHtml(formatCompactNutrient('fat', per100.fat || 0))}</div>
        <div class="food-actions">
          <button type="button" class="primary-btn tiny-btn" data-add-food-index="${index}" data-add-food-amount="${amount}">加入 ${amount}g</button>
          ${food.code ? `<button type="button" class="ghost-btn tiny-btn" data-search-code="${escapeHtml(food.code)}">${escapeHtml(food.code)}</button>` : ''}
        </div>
      </article>
    `;
  }).join('');
}

function renderSearchPlaceholder() {
  const recent = recentFoods(6);
  if (!recent.length) return '<div class="empty-state">输入食品名、品牌或条码</div>';
  return recent.map((food, index) => `
    <article class="food-item">
      <strong>${escapeHtml(foodDisplayName(food))}</strong>
      <div class="food-meta">最近使用</div>
      <div class="food-actions">
        <button type="button" class="ghost-btn tiny-btn" data-recent-food-index="${index}">再次加入</button>
      </div>
    </article>
  `).join('');
}

function renderProgressList() {
  const ids = Array.from(new Set([...state.focusMode.nutrientIds, 'kcal', 'fiber', 'water', 'sodium'])).filter((id) => state.calc.targets[id]);
  DOM.dayTotalBadge.textContent = state.activeDate.replace(/-/g, '.');
  DOM.progressList.innerHTML = ids.map((id) => {
    const target = state.calc.targets[id];
    const current = Number(state.totals[id] || 0);
    const progress = progressForTarget(target, current);
    const tone = toneForProgress(target, progress);
    return `
      <article class="progress-item">
        <div class="progress-head">
          <strong>${escapeHtml(nutrientDisplayName(id))}</strong>
          <span class="progress-values ${tone}">${escapeHtml(formatCompactNutrient(id, current))} / ${escapeHtml(formatCompactNutrient(id, targetValue(target)))}</span>
        </div>
        <div class="progress-bar" style="--bar-pct:${Math.max(0, Math.min(100, progress * 100))}%; --bar-color:${RING_COLORS[id] || '#80a9ff'};"><span></span></div>
      </article>
    `;
  }).join('');
}

function renderLogList() {
  const items = getDayLog(state.activeDate).items;
  if (!items.length) {
    DOM.logList.innerHTML = '<div class="empty-state">今天还没有记录</div>';
    return;
  }
  DOM.logList.innerHTML = items.map((item, index) => `
    <article class="log-item">
      <strong>${escapeHtml(item.label)}</strong>
      <div class="log-meta">${escapeHtml(formatTime(item.createdAt))}${item.grams ? ` · ${item.grams}g` : ''} · ${escapeHtml(formatCompactNutrient('kcal', item.nutrients.kcal || 0))}</div>
      <div class="log-actions">
        <button type="button" class="ghost-btn tiny-btn" data-remove-log-index="${index}">删除</button>
      </div>
    </article>
  `).join('');
}

function renderCaptureResult() {
  if (!state.captureParsed) {
    DOM.captureResult.hidden = true;
    DOM.captureNutrients.innerHTML = '';
    return;
  }
  DOM.captureResult.hidden = false;
  DOM.captureFoodName.value = state.captureParsed.name || DOM.captureFoodName.value || '';
  DOM.captureBasis.value = state.captureParsed.basis || '100g';
  DOM.captureServingSize.value = Number.isFinite(state.captureParsed.servingSize) ? state.captureParsed.servingSize : '';
  DOM.captureServings.value = DOM.captureServings.value || '1';
  const nutrientIds = Object.keys(state.captureParsed.nutrients || {}).slice(0, 12);
  DOM.captureNutrients.innerHTML = nutrientIds.map((id) => `
    <span class="nutrient-pill"><strong>${escapeHtml(nutrientDisplayName(id))}</strong><span>${escapeHtml(formatCompactNutrient(id, state.captureParsed.nutrients[id]))}</span></span>
  `).join('');
}

function renderPhotoRef() {
  if (state.photoRefUrl) {
    const safeUrl = String(state.photoRefUrl);
    DOM.stagePhotoRef.style.backgroundImage = `url('${safeUrl}')`;
    DOM.stagePhotoRef.classList.add('has-photo');
  } else {
    DOM.stagePhotoRef.style.backgroundImage = 'none';
    DOM.stagePhotoRef.classList.remove('has-photo');
  }
}

function renderGitHubStatus() {
  const ok = state.github.owner && state.github.repo && state.github.path;
  DOM.githubStatus.textContent = ok ? `${state.github.owner}/${state.github.repo}` : '未配置';
}

function onProfileInput() {
  state.profile = {
    ...readProfileForm(),
    bodyFat: clamp(Number(DOM.profileForm.bodyFat.value) || 22, 2, 60),
    focusNote: String(DOM.profileForm.focusNote.value || '').trim().slice(0, 120),
  };
  persistState({ syncEligible: false });
  renderAll();
}

function onBodyInput() {
  persistState({ syncEligible: false });
  renderAll();
}

function onFoodSearchInput() {
  state.searchQuery = String(DOM.foodSearchInput.value || '').trim();
  if (!state.searchQuery) {
    state.searchResults = [];
    DOM.foodSearchStatus.textContent = '待输入';
    renderFoodSearchResults();
    return;
  }
  ensureFoodsLoaded().then(() => {
    state.searchResults = searchFoods(state.searchQuery).slice(0, FOOD_SEARCH_LIMIT);
    DOM.foodSearchStatus.textContent = `找到 ${state.searchResults.length} 项`;
    renderFoodSearchResults();
  }).catch((error) => {
    DOM.foodSearchStatus.textContent = `食品库失败：${error.message}`;
  });
}

async function ensureFoodsLoaded() {
  if (state.foodsLoaded) return state.foods;
  if (state.foodsPromise) return state.foodsPromise;
  state.foodsLoading = true;
  DOM.foodSearchStatus.textContent = '食品库加载中…';
  state.foodsPromise = fetch('./data/foods.min.json', { cache: 'force-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((foods) => {
      state.foods = Array.isArray(foods) ? foods.map(prepareFood) : [];
      state.foodsLoaded = true;
      state.foodsLoading = false;
      DOM.foodSearchStatus.textContent = `食品库 ${state.foods.length.toLocaleString('zh-CN')} 条`;
      return state.foods;
    })
    .catch((error) => {
      state.foodsLoading = false;
      state.foodsPromise = null;
      throw error;
    });
  return state.foodsPromise;
}

function requestIdleLoadFoods() {
  const run = () => ensureFoodsLoaded().catch(() => null);
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 2400 });
  else window.setTimeout(run, 900);
}

function prepareFood(food) {
  const name = foodDisplayName(food);
  const original = String(food.labels?.original || food.n || '').trim();
  food._displayName = name;
  food._search = normalizeText([name, original, food.code || food.c || '', food.z || '', food.labels?.en || '', food.labels?.es || ''].join(' '));
  food.code = food.code || food.c || '';
  return food;
}

function searchFoods(query) {
  const q = normalizeText(query);
  const isCode = /^\d{6,14}$/.test(q);
  const tokens = q.split(/\s+/).filter(Boolean);
  const results = [];
  const pool = [...state.customFoods.map(prepareFood), ...state.foods];
  for (const food of pool) {
    const hay = food._search || normalizeText(foodDisplayName(food));
    let score = 0;
    if (isCode) {
      if ((food.code || '').startsWith(q)) score += food.code === q ? 120 : 70;
      else continue;
    } else {
      if (hay.includes(q)) score += 40;
      let matched = 0;
      for (const token of tokens) {
        if (hay.includes(token)) {
          matched += 1;
          score += normalizeText(foodDisplayName(food)).startsWith(token) ? 12 : 6;
        }
      }
      if (matched < tokens.length) continue;
    }
    if (food.customPer100) score += 6;
    results.push({ food, score });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, FOOD_SEARCH_LIMIT).map((item) => item.food);
}

function recentFoods(limit = 6) {
  const seen = new Map();
  Object.values(state.logs).forEach((day) => {
    (day.items || []).forEach((item) => {
      if (!seen.has(item.label)) {
        const customHit = state.customFoods.find((food) => food.name === item.label);
        if (customHit) seen.set(item.label, customHit);
      }
    });
  });
  return Array.from(seen.values()).slice(0, limit);
}

function onFoodResultsClick(event) {
  const addBtn = event.target.closest('[data-add-food-index]');
  if (addBtn) {
    const food = state.searchResults[Number(addBtn.dataset.addFoodIndex)] || recentFoods()[Number(addBtn.dataset.recentFoodIndex)];
    if (!food) return;
    const grams = clamp(Number(DOM.foodAmountInput.value) || 100, 1, 3000);
    addFoodToToday(food, grams);
    return;
  }
  const recentBtn = event.target.closest('[data-recent-food-index]');
  if (recentBtn) {
    const food = recentFoods()[Number(recentBtn.dataset.recentFoodIndex)];
    if (!food) return;
    addFoodToToday(food, clamp(Number(DOM.foodAmountInput.value) || 100, 1, 3000));
    return;
  }
  const codeBtn = event.target.closest('[data-search-code]');
  if (codeBtn) {
    DOM.foodSearchInput.value = codeBtn.dataset.searchCode || '';
    onFoodSearchInput();
  }
}

function addFoodToToday(food, grams) {
  const nutrients = foodNutrientsForAmount(food, grams);
  const item = {
    id: uid('log'),
    createdAt: new Date().toISOString(),
    label: foodDisplayName(food),
    grams: round1(grams),
    code: food.code || '',
    nutrients,
    source: food.customPer100 ? 'custom' : 'library',
  };
  getDayLog(state.activeDate).items.unshift(item);
  getDayLog(state.activeDate).items = getDayLog(state.activeDate).items.slice(0, MAX_LOG_ITEMS_PER_DAY);
  persistState({ syncEligible: true });
  renderAll();
  DOM.foodSearchStatus.textContent = `${item.label} 已加入`;
}

function nutrientsForFood(food) {
  return food.customPer100 ? food.customPer100 : normalizedFoodNutrients(food);
}

function foodNutrientsForAmount(food, grams) {
  return scaleNutrients(nutrientsForFood(food), grams);
}

function onLogListClick(event) {
  const removeBtn = event.target.closest('[data-remove-log-index]');
  if (!removeBtn) return;
  const idx = Number(removeBtn.dataset.removeLogIndex);
  const items = getDayLog(state.activeDate).items;
  if (idx >= 0 && idx < items.length) {
    items.splice(idx, 1);
    persistState({ syncEligible: true });
    renderAll();
  }
}

function onBodyHistoryClick(event) {
  const loadBtn = event.target.closest('[data-load-body-index]');
  if (!loadBtn) return;
  const record = state.bodyHistory[Number(loadBtn.dataset.loadBodyIndex)];
  if (!record) return;
  DOM.profileForm.heightCm.value = record.heightCm || DOM.profileForm.heightCm.value;
  DOM.profileForm.weightKg.value = record.weightKg || DOM.profileForm.weightKg.value;
  DOM.profileForm.bodyFat.value = record.bodyFat || DOM.profileForm.bodyFat.value;
  fillBodyForm(record);
  DOM.bodyStatusHint.textContent = '已载入历史记录';
  activateTab('body');
  renderAll();
}

function saveBodyRecord() {
  const record = buildCurrentBodyRecord();
  const hasAny = ['weightKg', 'bodyFat', 'neck', 'shoulder', 'chest', 'underbust', 'waist', 'abdomen', 'hip', 'upperArm', 'forearm', 'thigh', 'calf', 'ankle'].some((key) => Number.isFinite(record[key]));
  if (!hasAny) {
    DOM.bodyStatusHint.textContent = '请先填至少一项';
    return;
  }
  state.bodyHistory.unshift(record);
  state.bodyHistory = normalizeBodyHistory(state.bodyHistory);
  DOM.bodyStatusHint.textContent = '身体记录已保存';
  persistState({ syncEligible: true });
  renderAll();
}

function clearTodayLog() {
  getDayLog(state.activeDate).items = [];
  persistState({ syncEligible: true });
  renderAll();
}

function getDayLog(date) {
  if (!state.logs[date]) state.logs[date] = { items: [] };
  return state.logs[date];
}

function computeTotalsForDate(date) {
  const totals = createEmptyTotals();
  const items = getDayLog(date).items;
  items.forEach((item) => mergeTotals(totals, item.nutrients || {}));
  return totals;
}

function targetValue(target) {
  if (!target) return 0;
  if (target.type === 'range') return Number(target.preferred || target.min || target.max || 0);
  return Number(target.target || 0);
}

function progressForTarget(target, current) {
  const value = Number(current || 0);
  if (!target) return 0;
  if (target.type === 'range') {
    const preferred = Number(target.preferred || target.min || 0);
    return preferred > 0 ? value / preferred : 0;
  }
  const goal = Number(target.target || 0);
  return goal > 0 ? value / goal : 0;
}

function toneForProgress(target, progress) {
  if (!target) return '';
  if (target.type === 'max') {
    if (progress > 1) return 'badge-bad';
    if (progress > 0.85) return 'badge-warn';
    return 'badge-good';
  }
  if (progress >= 1) return 'badge-good';
  if (progress >= 0.65) return 'badge-warn';
  return 'badge-bad';
}

function inferFocusMode(profile) {
  const note = normalizeText(profile.focusNote || '');
  if (profile.conditions?.boneRisk || hasKeyword(note, ['骨', '关节', '膝', '跟骨', '骨密度', 'joint', 'bone'])) {
    return {
      id: 'bone',
      label: '骨关节模式',
      summary: '前置 钙 · 维生素 D3 · 维生素 K',
      nutrientIds: ['protein', 'fat', 'carbs', 'calcium', 'vitaminD', 'vitaminK'],
      tipMap: {
        calcium: '骨骼优先',
        vitaminD: '吸收协同',
        vitaminK: '骨代谢协同',
      },
    };
  }
  if (profile.conditions?.anemiaRisk || hasKeyword(note, ['贫血', '缺铁', '铁', 'anemia'])) {
    return {
      id: 'anemia',
      label: '贫血关注',
      summary: '前置 铁 · 叶酸 · 维生素 B12',
      nutrientIds: ['protein', 'fat', 'carbs', 'iron', 'folate', 'vitaminB12'],
      tipMap: {
        iron: '先补铁',
        folate: '造血支持',
        vitaminB12: '红细胞支持',
      },
    };
  }
  if (profile.glucoseStatus !== 'normal' || hasKeyword(note, ['血糖', '糖', '胰岛', 'glucose'])) {
    return {
      id: 'glucose',
      label: '血糖平衡',
      summary: '前置 纤维 · 镁 · 钾',
      nutrientIds: ['protein', 'fat', 'carbs', 'fiber', 'magnesium', 'potassium'],
      tipMap: {
        fiber: '稳血糖先纤维',
        magnesium: '代谢支持',
        potassium: '电解质平衡',
      },
    };
  }
  if (profile.conditions?.hypertension || profile.conditions?.dyslipidemia || hasKeyword(note, ['血压', '血脂', '心血管', '心脏', 'cardio'])) {
    return {
      id: 'cardio',
      label: '心血管模式',
      summary: '前置 Omega-3 · 钾 · 镁',
      nutrientIds: ['protein', 'fat', 'carbs', 'omega3', 'potassium', 'magnesium'],
      tipMap: {
        omega3: '脂质结构优化',
        potassium: '钠钾平衡',
        magnesium: '节律支持',
      },
    };
  }
  if (profile.training !== 'none' || profile.goal === 'muscleGain' || hasKeyword(note, ['恢复', '训练', '增肌', '肌肉'])) {
    return {
      id: 'performance',
      label: '训练恢复',
      summary: '前置 水分 · 镁 · Omega-3',
      nutrientIds: ['protein', 'fat', 'carbs', 'water', 'magnesium', 'omega3'],
      tipMap: {
        water: '补水恢复',
        magnesium: '肌肉神经',
        omega3: '炎症管理',
      },
    };
  }
  return {
    id: 'default',
    label: '基础模式',
    summary: '基础 6 环：蛋白 · 脂肪 · 碳水 · 纤维 · 维生素 C · 水分',
    nutrientIds: ['protein', 'fat', 'carbs', 'fiber', 'vitaminC', 'water'],
    tipMap: {
      fiber: '把纤维补够',
      vitaminC: '抗氧化支持',
      water: '水分别掉线',
    },
  };
}

function nutrientDisplayName(id) {
  return DISPLAY_LABELS[id] || NUTRIENT_DEFS[id]?.label || id;
}

function formatCompactNutrient(id, value) {
  const unit = NUTRIENT_DEFS[id]?.unit || '';
  const digits = /mg|µg|mcg|mL/.test(unit) ? 0 : 1;
  return formatNumber(Number(value || 0), unit, digits);
}

function bodyRecordSummary(record) {
  const parts = [];
  if (Number.isFinite(record.weightKg)) parts.push(`体重 ${formatNumber(record.weightKg, 'kg', 1)}`);
  if (Number.isFinite(record.waist)) parts.push(`腰围 ${formatNumber(record.waist, 'cm', 1)}`);
  if (Number.isFinite(record.hip)) parts.push(`臀围 ${formatNumber(record.hip, 'cm', 1)}`);
  if (Number.isFinite(record.bodyFat)) parts.push(`体脂 ${formatNumber(record.bodyFat, '%', 1)}`);
  return parts.join(' · ') || '已记录';
}

async function updateCapturePreview() {
  const file = DOM.captureInput.files?.[0];
  state.captureParsed = null;
  renderCaptureResult();
  if (!file) {
    DOM.capturePreview.hidden = true;
    DOM.capturePreview.removeAttribute('src');
    DOM.captureStatus.textContent = '未选择图片';
    return;
  }
  const url = URL.createObjectURL(file);
  DOM.capturePreview.src = url;
  DOM.capturePreview.hidden = false;
  DOM.captureStatus.textContent = '图片已准备';
}

async function runBarcodeSearch() {
  const file = DOM.captureInput.files?.[0];
  if (!file) {
    DOM.captureStatus.textContent = '请先选择图片';
    return;
  }
  DOM.captureStatus.textContent = '条码识别中…';
  try {
    const prepared = await prepareRecognitionImage(file, 'smart');
    let code = await detectBarcodeNative(prepared).catch(() => '');
    if (!code) code = await detectBarcodeZXing(prepared).catch(() => '');
    if (!code) {
      DOM.captureStatus.textContent = '没有识别到条码';
      return;
    }
    DOM.captureStatus.textContent = `条码 ${code}`;
    await ensureFoodsLoaded();
    const hit = state.customFoods.find((food) => food.code === code) || state.foods.find((food) => String(food.code || '') === String(code));
    if (hit) {
      state.captureParsed = {
        name: foodDisplayName(hit),
        basis: '100g',
        servingSize: hit.servingSize || '',
        nutrients: nutrientsForFood(hit),
        code,
        sourceFood: hit,
      };
      renderCaptureResult();
    } else {
      state.captureParsed = {
        name: code,
        basis: '100g',
        servingSize: '',
        nutrients: {},
        code,
      };
      renderCaptureResult();
    }
  } catch (error) {
    DOM.captureStatus.textContent = `条码失败：${error.message}`;
  }
}

async function runOcrSearch() {
  const file = DOM.captureInput.files?.[0];
  if (!file) {
    DOM.captureStatus.textContent = '请先选择图片';
    return;
  }
  DOM.captureStatus.textContent = 'OCR 识别中…';
  try {
    const prepared = await prepareRecognitionImage(file, 'smart');
    const Tesseract = await ensureTesseract();
    const worker = await Tesseract.createWorker('eng+chi_sim');
    const { data } = await worker.recognize(prepared);
    await worker.terminate();
    const parsed = parseNutritionText(data?.text || '');
    if (!parsed) {
      DOM.captureStatus.textContent = '没有匹配到营养字段';
      return;
    }
    state.captureParsed = {
      name: DOM.captureFoodName.value || '拍照识别食品',
      basis: parsed.basis,
      servingSize: parsed.servingSize || '',
      nutrients: parsed.nutrients,
    };
    DOM.captureStatus.textContent = `识别到 ${Object.keys(parsed.nutrients).length} 项`; 
    renderCaptureResult();
  } catch (error) {
    DOM.captureStatus.textContent = `OCR 失败：${error.message}`;
  }
}

function addCaptureFoodToToday() {
  if (!state.captureParsed) return;
  if (state.captureParsed.sourceFood) {
    addFoodToToday(state.captureParsed.sourceFood, clamp(Number(DOM.foodAmountInput.value) || 100, 1, 3000));
    DOM.captureStatus.textContent = '已加入今天';
    return;
  }
  const name = String(DOM.captureFoodName.value || '').trim() || '拍照识别食品';
  const basis = DOM.captureBasis.value;
  const servings = Math.max(0.1, Number(DOM.captureServings.value) || 1);
  const baseNutrients = state.captureParsed.nutrients || {};
  const factor = servings;
  const nutrients = {};
  Object.entries(baseNutrients).forEach(([id, value]) => { nutrients[id] = Number(value) * factor; });
  getDayLog(state.activeDate).items.unshift({
    id: uid('log'),
    createdAt: new Date().toISOString(),
    label: name,
    grams: basis === 'serving' && Number(DOM.captureServingSize.value) ? round1(Number(DOM.captureServingSize.value) * servings) : (basis === '100g' ? round1(100 * servings) : null),
    nutrients,
    source: 'capture',
    code: state.captureParsed.code || '',
  });
  persistState({ syncEligible: true });
  renderAll();
  DOM.captureStatus.textContent = '拍照结果已加入今天';
}

function saveCaptureFoodToLibrary() {
  if (!state.captureParsed) return;
  const name = String(DOM.captureFoodName.value || '').trim() || '拍照识别食品';
  const basis = DOM.captureBasis.value;
  const servingSize = Number(DOM.captureServingSize.value) || null;
  const per100 = convertParsedToPer100(state.captureParsed.nutrients || {}, basis, servingSize);
  const customFood = normalizeCustomFood({
    id: uid('custom'),
    name,
    code: state.captureParsed.code || '',
    basis: servingSize ? '100g' : basis,
    servingSize,
    customPer100: per100,
  });
  if (!customFood) return;
  state.customFoods = [customFood, ...state.customFoods.filter((item) => item.name !== customFood.name)].slice(0, 120);
  state.searchQuery = name;
  DOM.foodSearchInput.value = name;
  persistState({ syncEligible: true });
  renderAll();
  DOM.captureStatus.textContent = '已存入食品库';
}

function convertParsedToPer100(nutrients, basis, servingSize) {
  if (basis === '100g' || basis === '100ml') return { ...nutrients };
  if (basis === 'serving' && Number.isFinite(servingSize) && servingSize > 0) {
    const factor = 100 / servingSize;
    const out = {};
    Object.entries(nutrients || {}).forEach(([id, value]) => { out[id] = Number(value) * factor; });
    return out;
  }
  return { ...nutrients };
}

function onPhotoSelected() {
  const file = DOM.photoInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.photoRefUrl = String(reader.result || '');
    state.photoShape.hasPhoto = Boolean(state.photoRefUrl);
    DOM.photoPreview.src = state.photoRefUrl;
    DOM.photoPreview.hidden = false;
    renderPhotoRef();
    persistState({ syncEligible: false });
  };
  reader.readAsDataURL(file);
}

function renderPhotoPreviewMeta() {
  // Intentionally empty: sliders update live when applied.
}

function resetPhotoShape() {
  state.photoShape = { shoulder: 1, waist: 1, hip: 1, leg: 1, hasPhoto: Boolean(state.photoRefUrl) };
  fillPhotoDialog();
  renderAll();
}

function applyPhotoShape() {
  state.photoShape.shoulder = clamp(Number(DOM.shapeShoulder.value) / 100 || 1, 0.8, 1.25);
  state.photoShape.waist = clamp(Number(DOM.shapeWaist.value) / 100 || 1, 0.8, 1.25);
  state.photoShape.hip = clamp(Number(DOM.shapeHip.value) / 100 || 1, 0.8, 1.25);
  state.photoShape.leg = clamp(Number(DOM.shapeLeg.value) / 100 || 1, 0.85, 1.2);
  state.photoShape.hasPhoto = Boolean(state.photoRefUrl);
  DOM.photoDialog.close();
  persistState({ syncEligible: false });
  renderAll();
}

function onGitHubFieldChange() {
  state.github.owner = String(DOM.ghOwner.value || '').trim();
  state.github.repo = String(DOM.ghRepo.value || '').trim();
  state.github.branch = String(DOM.ghBranch.value || '').trim() || 'main';
  state.github.path = String(DOM.ghPath.value || '').trim() || 'data/haochijia-user.json';
  state.github.token = String(DOM.ghToken.value || '').trim();
  state.github.autoSync = Boolean(DOM.ghAutoSync.checked);
  persistState({ syncEligible: false });
  renderGitHubStatus();
}

function exportAllData() {
  const snapshot = makeSnapshot({ includeSecrets: false, includePhoto: true });
  downloadJson(snapshot, `haochijia-core-backup-${compactDateTime()}.json`);
}

function exportBodyCsv() {
  const header = ['recordedAt', 'heightCm', 'weightKg', 'bodyFat', 'neck', 'shoulder', 'chest', 'underbust', 'waist', 'abdomen', 'hip', 'upperArm', 'forearm', 'thigh', 'calf', 'ankle'];
  const rows = [header.join(',')].concat(state.bodyHistory.map((record) => header.map((key) => csvEscape(record[key] ?? '')).join(',')));
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `haochijia-body-${compactDateTime()}.csv`);
}

async function onImportSelected() {
  const file = DOM.importInput.files?.[0];
  if (!file) return;
  const mode = DOM.importInput.dataset.mode || 'all';
  try {
    const text = await file.text();
    if (/\.csv$/i.test(file.name)) {
      importBodyCsv(text);
      DOM.bodyStatusHint.textContent = '身体 CSV 已导入';
    } else {
      importJsonSnapshot(text, mode);
    }
    DOM.importInput.value = '';
  } catch (error) {
    DOM.bodyStatusHint.textContent = `导入失败：${error.message}`;
  }
}

function importJsonSnapshot(text, mode) {
  const data = safeJsonParse(text, null);
  if (!data) throw new Error('JSON 无法解析');
  if (Array.isArray(data)) {
    state.bodyHistory = normalizeBodyHistory(data);
    if (state.bodyHistory[0]) fillBodyForm(state.bodyHistory[0]);
    persistState({ syncEligible: true });
    renderAll();
    return;
  }
  if (mode === 'body' || (!data.profile && (data.bodyHistory || data.waist || data.weightKg))) {
    if (Array.isArray(data.bodyHistory)) {
      state.bodyHistory = normalizeBodyHistory(data.bodyHistory);
      if (state.bodyHistory[0]) fillBodyForm(state.bodyHistory[0]);
    } else {
      const record = normalizeBodyRecord(data);
      if (record) {
        fillBodyForm(record);
        if (Number.isFinite(record.heightCm)) DOM.profileForm.heightCm.value = record.heightCm;
        if (Number.isFinite(record.weightKg)) DOM.profileForm.weightKg.value = record.weightKg;
        if (Number.isFinite(record.bodyFat)) DOM.profileForm.bodyFat.value = record.bodyFat;
      }
    }
    persistState({ syncEligible: true });
    renderAll();
    return;
  }
  applySnapshot({ ...createDefaultSnapshot(), ...data, github: { ...DEFAULT_GITHUB, ...(data.github || {}), token: '' } });
  fillFormsFromState();
  persistState({ syncEligible: true });
  renderAll();
}

function importBodyCsv(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV 为空');
  const headers = parseCsvLine(lines[0]).map((header) => resolveBodyHeader(header));
  const records = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cols = parseCsvLine(lines[i]);
    const record = {};
    headers.forEach((key, index) => {
      if (!key) return;
      record[key] = cols[index];
    });
    const normalized = normalizeBodyRecord(record);
    if (normalized) records.push(normalized);
  }
  state.bodyHistory = normalizeBodyHistory(records);
  if (state.bodyHistory[0]) {
    fillBodyForm(state.bodyHistory[0]);
    if (Number.isFinite(state.bodyHistory[0].heightCm)) DOM.profileForm.heightCm.value = state.bodyHistory[0].heightCm;
    if (Number.isFinite(state.bodyHistory[0].weightKg)) DOM.profileForm.weightKg.value = state.bodyHistory[0].weightKg;
    if (Number.isFinite(state.bodyHistory[0].bodyFat)) DOM.profileForm.bodyFat.value = state.bodyHistory[0].bodyFat;
  }
  persistState({ syncEligible: true });
  renderAll();
}

function resolveBodyHeader(header) {
  const key = normalizeText(header).replace(/\s+/g, '');
  for (const [target, aliases] of Object.entries(BODY_IMPORT_ALIASES)) {
    if (aliases.some((alias) => normalizeText(alias).replace(/\s+/g, '') === key)) return target;
  }
  return header;
}

async function requestPersistentStorage() {
  if (!navigator.storage?.persist) {
    DOM.persistStatus.textContent = '浏览器不支持';
    return;
  }
  const granted = await navigator.storage.persist();
  state.persistGranted = granted;
  DOM.persistStatus.textContent = granted ? '更稳保存已开启' : '浏览器未授予';
}

async function updatePersistStatus() {
  if (!navigator.storage?.persisted) {
    DOM.persistStatus.textContent = '本地已保存';
    return false;
  }
  state.persistGranted = await navigator.storage.persisted();
  DOM.persistStatus.textContent = state.persistGranted ? '更稳保存已开启' : '本地已保存';
  return state.persistGranted;
}

async function syncToGitHub(manual = false) {
  try {
    const config = readGitHubConfig();
    ensureGitHubConfig(config, true);
    const snapshot = makeSnapshot({ includeSecrets: false, includePhoto: false });
    const existing = await githubReadFile(config).catch((error) => {
      if (error.status === 404) return null;
      throw error;
    });
    await githubWriteFile(config, snapshot, existing?.sha || '');
    DOM.githubStatus.textContent = 'GitHub 已同步';
  } catch (error) {
    DOM.githubStatus.textContent = `GitHub 失败：${error.message}`;
    if (manual) throw error;
  }
}

async function restoreFromGitHub() {
  try {
    const config = readGitHubConfig();
    ensureGitHubConfig(config, false);
    const existing = await githubReadFile(config);
    if (!existing?.content) throw new Error('云端没有数据');
    const json = decodeBase64Unicode(existing.content);
    importJsonSnapshot(json, 'all');
    DOM.githubStatus.textContent = '已从 GitHub 恢复';
  } catch (error) {
    DOM.githubStatus.textContent = `恢复失败：${error.message}`;
  }
}

function scheduleGitHubSync() {
  if (!state.github.autoSync) return;
  if (state.githubSyncTimer) window.clearTimeout(state.githubSyncTimer);
  state.githubSyncTimer = window.setTimeout(() => syncToGitHub(false), 1600);
}

function readGitHubConfig() {
  return {
    owner: String(state.github.owner || '').trim(),
    repo: String(state.github.repo || '').trim(),
    branch: String(state.github.branch || 'main').trim() || 'main',
    path: String(state.github.path || 'data/haochijia-user.json').trim() || 'data/haochijia-user.json',
    token: String(state.github.token || '').trim(),
  };
}

function ensureGitHubConfig(config, requireWrite) {
  if (!config.owner || !config.repo || !config.path) throw new Error('owner / repo / path 未填');
  if (requireWrite && !config.token) throw new Error('需要 token');
}

async function githubReadFile(config) {
  const url = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${config.path}?ref=${encodeURIComponent(config.branch)}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
    },
  });
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

async function githubWriteFile(config, data, sha = '') {
  const url = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${config.path}`;
  const body = {
    message: `haochijia backup ${new Date().toISOString()}`,
    content: encodeBase64Unicode(JSON.stringify(data, null, 2)),
    branch: config.branch,
  };
  if (sha) body.sha = sha;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}${detail ? ` ${detail.slice(0, 120)}` : ''}`);
  }
  return response.json();
}

function persistState({ syncEligible = false } = {}) {
  const snapshot = makeSnapshot({ includeSecrets: true, includePhoto: false });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  idbSet(IDB_SNAPSHOT_KEY, snapshot).catch(() => null);
  if (state.photoRefUrl) idbSet(IDB_PHOTO_KEY, state.photoRefUrl).catch(() => null);
  else idbSet(IDB_PHOTO_KEY, '').catch(() => null);
  if (syncEligible) scheduleGitHubSync();
}

function makeSnapshot({ includeSecrets = true, includePhoto = false } = {}) {
  const snapshot = {
    version: state.version,
    updatedAt: new Date().toISOString(),
    profile: {
      ...readProfileForm(),
      bodyFat: clamp(Number(DOM.profileForm.bodyFat.value) || 22, 2, 60),
      focusNote: String(DOM.profileForm.focusNote.value || '').trim().slice(0, 120),
    },
    bodyHistory: normalizeBodyHistory(state.bodyHistory),
    logs: state.logs,
    customFoods: state.customFoods,
    photoShape: state.photoShape,
    github: {
      owner: state.github.owner,
      repo: state.github.repo,
      branch: state.github.branch,
      path: state.github.path,
      autoSync: state.github.autoSync,
      ...(includeSecrets ? { token: state.github.token } : {}),
    },
  };
  if (includePhoto && state.photoRefUrl) snapshot.photoRefUrl = state.photoRefUrl;
  return snapshot;
}

function detectPlatform() {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return { key: 'ios', label: 'iPhone / iPad 适配' };
  if (/Android/i.test(ua)) return { key: 'android', label: 'Android 适配' };
  return { key: 'other', label: '通用触屏适配' };
}

function todayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  const d = `${now.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function finiteOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function averageOrNull(...values) {
  const valid = values.map((value) => Number(value)).filter((value) => Number.isFinite(value));
  if (!valid.length) return null;
  return round1(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function compactDateTime() {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, '0');
  const d = `${now.getDate()}`.padStart(2, '0');
  const hh = `${now.getHours()}`.padStart(2, '0');
  const mm = `${now.getMinutes()}`.padStart(2, '0');
  return `${y}${m}${d}-${hh}${mm}`;
}

function csvEscape(value) {
  const str = String(value ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function parseCsvLine(line) {
  const out = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === ',' && !inQuotes) {
      out.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  out.push(current);
  return out;
}

function foodDisplayName(food) {
  return String(food?.name || food?.labels?.zh || food?.z || food?._displayName || food?.labels?.original || food?.n || '未命名食品');
}

function normalizeText(text) {
  return String(text || '').toLowerCase().replace(/[\u0300-\u036f]/g, '').replace(/[，。；：、()（）/_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function hasKeyword(text, keywords) {
  return keywords.some((keyword) => text.includes(normalizeText(keyword)));
}

function safeJsonParse(text, fallback) {
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function downloadJson(data, name) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  downloadBlob(blob, name);
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function encodeBase64Unicode(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function decodeBase64Unicode(base64) {
  const binary = atob(String(base64 || '').replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function prepareRecognitionImage(file, mode = 'smart') {
  if (!file || mode === 'original') return file;
  const { img, url } = await loadImage(file);
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
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      const next = clamp(Math.round((gray - 128) * contrast + 128), 0, 255);
      data[i] = next;
      data[i + 1] = next;
      data[i + 2] = next;
    }
    ctx.putImageData(imageData, 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.92));
    return blob || file;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(file) {
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

async function ensureZXing() {
  if (window.ZXingBrowser) return window.ZXingBrowser;
  await loadScript('https://unpkg.com/@zxing/browser@0.1.5/umd/index.min.js');
  return window.ZXingBrowser;
}

async function detectBarcodeZXing(source) {
  const ZXingBrowser = await ensureZXing();
  if (!ZXingBrowser?.BrowserMultiFormatReader) return '';
  const reader = new ZXingBrowser.BrowserMultiFormatReader();
  const { img, url } = await loadImage(source);
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

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', reject, { once: true });
      if (existing.dataset.loaded === 'true') resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => reject(new Error(`无法加载 ${src}`));
    document.head.appendChild(script);
  });
}

function parseNutritionText(text) {
  const raw = String(text || '');
  if (!raw.trim()) return null;
  const clean = raw
    .replace(/[，、；：]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/Ｏ/g, '0')
    .replace(/o(?=\d)/gi, '0');
  const basis = /每\s*100\s*m?l|per\s*100\s*m?l/i.test(clean)
    ? '100ml'
    : (/(?:每\s*份|per\s*serving|serving\s*size|portion\s*size)/i.test(clean) ? 'serving' : '100g');
  const servingMatch = clean.match(/(?:serving\s*size|portion\s*size|每份|份量)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*(g|ml|克|毫升)/i);
  const servingSize = servingMatch ? Number(servingMatch[1]) : null;
  const specs = Object.entries(OCR_FIELD_MAP).map(([id, meta]) => [id, buildOcrKeywords(id, meta.label)]);
  const nutrients = {};
  specs.forEach(([id, keys]) => {
    const value = extractFieldValue(clean, keys, id);
    if (Number.isFinite(value)) nutrients[id] = value;
  });
  return Object.keys(nutrients).length ? { basis, servingSize, nutrients } : null;
}

function buildOcrKeywords(id, label) {
  const base = [String(label || '').toLowerCase()];
  const map = {
    kcal: ['calories', 'calorie', 'energy', '热量', '能量'],
    protein: ['protein', '蛋白质'],
    carbs: ['carbohydrate', 'carbohydrates', 'total carbohydrate', '碳水', '碳水化合物'],
    fat: ['fat', 'total fat', '脂肪'],
    satFat: ['saturated fat', '饱和脂肪'],
    transFat: ['trans fat', '反式脂肪'],
    sugar: ['sugars', 'sugar', '糖'],
    fiber: ['fiber', 'dietary fiber', '膳食纤维'],
    sodium: ['sodium', '钠'],
    calcium: ['calcium', '钙'],
    iron: ['iron', '铁'],
    magnesium: ['magnesium', '镁'],
    potassium: ['potassium', '钾'],
    zinc: ['zinc', '锌'],
    vitaminA: ['vitamin a', '维生素 a', '维生素a'],
    vitaminC: ['vitamin c', '维生素 c', '维生素c'],
    vitaminD: ['vitamin d', '维生素 d', '维生素d'],
    folate: ['folate', 'folic acid', '叶酸'],
    vitaminB12: ['vitamin b12', '维生素 b12', '维生素b12'],
    cholesterol: ['cholesterol', '胆固醇'],
  };
  return [...new Set([...base, ...(map[id] || [])])].filter(Boolean);
}

function extractFieldValue(text, keywords, id) {
  for (const key of keywords) {
    const re = new RegExp(`${escapeReg(key)}[^\\d]{0,12}(\\d+(?:\\.\\d+)?)\\s*(kcal|kj|g|mg|mcg|µg|ug|千卡|千焦|克|毫克|微克)?`, 'i');
    const match = text.match(re);
    if (!match) continue;
    return convertOcrValue(Number(match[1]), (match[2] || '').toLowerCase(), id);
  }
  return null;
}

function convertOcrValue(value, unit, id) {
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

function escapeReg(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js').catch(() => null);
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(DB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB open failed'));
  });
}

async function idbGet(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const req = tx.objectStore(DB_STORE).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IndexedDB read failed'));
  });
}

async function idbSet(key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('IndexedDB write failed'));
  });
}
