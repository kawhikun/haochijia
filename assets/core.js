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
} from './nutrition-refs.js?v=20260426c';
import { createBodyModelController } from './model-scene.js?v=20260426c';

const STORAGE_KEY = 'haochijia.core.v36.snapshot';
const DB_NAME = 'haochijia-core-v36';
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
  version: 'v36',
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
  customFoodEditingId: '',
  photoRefUrl: '',
  model: null,
  persistGranted: false,
  githubSyncTimer: null,
};

const V32_BUILD_VERSION = 'v36-comprehensive-nourishnest';
const V32_STORAGE_KEYS = [STORAGE_KEY, 'haochijia.core.v34.snapshot', 'haochijia.core.v33.snapshot', 'haochijia.core.v32.snapshot', 'haochijia.core.v31.snapshot'];
const V32_IDB_SNAPSHOT_KEYS = ['snapshot-v36', 'snapshot-v34', 'snapshot-v33', 'snapshot-v32', 'snapshot'];
const V32_IDB_BACKUP_KEY = 'snapshot-history-v36';
const LOCAL_BACKUP_LIMIT = 18;
const FOOD_REGION_OPTIONS = new Set(['all', 'cn', 'intl']);
const FOOD_NAME_MODE_OPTIONS = new Set(['zh', 'en', 'original']);
const V32_FOOD_BANK_FILES = Object.freeze({
  cn: ['./data/foods-cn.min.json?v=20260426c'],
  intl: ['./data/foods-global.part01.min.json?v=20260426c', './data/foods-global.part02.min.json?v=20260426c'],
});
const FOOD_LIBRARY_AUDIT = Object.freeze({
  cn: { label: '中文库', file: 'foods-cn.min.json', rows: 36793, missingZh: 0, missingEn: 0, missingOriginal: 0, missingCode: 0 },
  intl01: { label: '国际库 01', file: 'foods-global.part01.min.json', rows: 59704, missingZh: 0, missingEn: 0, missingOriginal: 0, missingCode: 15 },
  intl02: { label: '国际库 02', file: 'foods-global.part02.min.json', rows: 13413, missingZh: 0, missingEn: 0, missingOriginal: 0, missingCode: 0 },
});
const CUSTOM_FOOD_LIMIT = 180;
const CUSTOM_NUTRIENT_FIELDS = ['kcal', 'protein', 'carbs', 'fat', 'fiber', 'calcium', 'iron', 'vitaminD', 'vitaminK'];

Object.assign(DEFAULT_GITHUB, {
  owner: 'kawhikun',
  repo: 'haochijia',
  branch: 'main',
  path: 'data/haochijia-user.json',
});
Object.assign(RING_COLORS, {
  protein: '#6c8fa9',
  fat: '#fec187',
  carbs: '#99c4cf',
  fiber: '#a7c190',
  water: '#cddae2',
  calcium: '#b484b0',
  vitaminD: '#f4796a',
  vitaminK: '#6b8857',
  iron: '#d85b72',
  folate: '#a6d3b1',
  vitaminB12: '#795f9c',
  potassium: '#518463',
  magnesium: '#6c4d7e',
  omega3: '#4c697a',
  vitaminC: '#f4796a',
});
DISPLAY_LABELS.vitaminD = '维生素 D3';
DISPLAY_LABELS.vitaminK = '维生素 K1/K2';
state.version = V32_BUILD_VERSION;
state.foodLibrary = state.foodLibrary || 'all';
state.foodNameMode = state.foodNameMode || 'zh';
state.localBackupMeta = Array.isArray(state.localBackupMeta) ? state.localBackupMeta : [];
state.photoShape = normalizePhotoShape(state.photoShape || {});
state.github = resolveGitHubSnapshot(state.github || {});
state.foodBanks = state.foodBanks && typeof state.foodBanks === 'object' ? state.foodBanks : { cn: [], intl: [] };
state.foodBankLoaded = state.foodBankLoaded && typeof state.foodBankLoaded === 'object' ? state.foodBankLoaded : { cn: false, intl: false };
state.foodBankPromises = state.foodBankPromises && typeof state.foodBankPromises === 'object' ? state.foodBankPromises : { cn: null, intl: null };
state.foodBankCounts = state.foodBankCounts && typeof state.foodBankCounts === 'object' ? state.foodBankCounts : { cn: 0, intl: 0 };

function showDialogSafe(dialog) {
  if (!dialog) return;
  if (typeof dialog.showModal === 'function') {
    if (!dialog.open) dialog.showModal();
    return;
  }
  dialog.setAttribute('open', 'open');
}

function closeDialogSafe(dialog) {
  if (!dialog) return;
  if (typeof dialog.close === 'function') {
    if (dialog.open) dialog.close();
    return;
  }
  dialog.removeAttribute('open');
}


window.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', () => {
  window.clearTimeout(window.__haochijiaRingResizeTimer);
  window.__haochijiaRingResizeTimer = window.setTimeout(renderHeroRings, 90);
}, { passive: true });

async function init() {
  bindDom();
  document.body.dataset.platform = state.platform.key;
  if (DOM.platformBadge) DOM.platformBadge.textContent = state.platform.label;
  try {
    await loadState();
  } catch (error) {
    console.warn('[haochijia] loadState failed, fallback snapshot used.', error);
    applySnapshot(createDefaultSnapshot());
    state.localBackupMeta = [];
  }
  fillFormsFromState();
  bindEvents();
  try {
    state.model = createBodyModelController(DOM.bodyCanvas, {
      platformKey: state.platform.key,
      onLongPress: () => activateTab('body'),
      onViewReset: () => {
        DOM.focusModeText.textContent = `${nutrientDisplayName(state.activeRing)} 高亮 · 视角已回正`;
        window.setTimeout(() => renderHeroMeta(), 900);
      },
    });
    state.model.ready
      .then(() => {
        if (state.model) renderAll();
      })
      .catch((error) => console.warn('[haochijia] async model ready skipped.', error));
  } catch (error) {
    console.warn('[haochijia] model bootstrap failed, app continues in data-first mode.', error);
    DOM.bodyStatusHint.textContent = '3D 模型加载受阻，已切换到数据优先模式';
    state.model = {
      setSnapshot() {},
      setFocusField() {},
      setAccentColor() {},
      resetView() {},
      dispose() {},
      ready: Promise.resolve(),
    };
  }
  try {
    await registerServiceWorker();
  } catch (error) {
    console.warn('[haochijia] service worker register skipped.', error);
  }
  requestIdleLoadFoods();
  renderAll();
  await updatePersistStatus().catch(() => false);
  renderLocalBackupMeta();
  DOM.appShell?.classList?.add('is-ready');
}

function bindDom() {
  const ids = [
    'appShell', 'platformBadge', 'menuBtn', 'heroStage', 'bodyCanvas', 'stagePhotoRef', 'focusModePill', 'focusModeText', 'ringOrbit',
    'profileForm', 'bodyForm', 'bodyStatusHint', 'importBodyBtn', 'quickExportBtn', 'saveBodyBtn', 'photoShapeBtn', 'suggestionSummary', 'suggestionCards', 'featureAuditList',
    'bodyHistoryList', 'bodyHistoryMeta', 'foodSearchStatus', 'foodAuditStrip', 'foodSearchInput', 'foodAmountInput', 'foodSearchResults', 'customFoodForm', 'customFoodName', 'customFoodNameEn', 'customFoodCode', 'customFoodBrand', 'customFoodServing', 'saveCustomFoodBtn', 'clearCustomFoodFormBtn', 'customFoodList', 'captureInput',
    'runBarcodeBtn', 'runOcrBtn', 'capturePreview', 'captureStatus', 'captureResult', 'captureFoodName', 'captureBasis', 'captureServingSize',
    'captureServings', 'captureNutrients', 'addCaptureFoodBtn', 'saveCaptureFoodBtn', 'progressList', 'dayTotalBadge', 'logList', 'clearDayBtn',
    'photoDialog', 'photoInput', 'photoPreview', 'photoAutoBtn', 'photoShapeMeta', 'shapeShoulder', 'shapeChest', 'shapeWaist', 'shapeHip', 'shapeArm', 'shapeLeg', 'photoResetBtn', 'photoApplyBtn',
    'dataDialog', 'persistStatus', 'localBackupMeta', 'restoreLocalBtn', 'importAllBtn', 'exportAllBtn', 'bodyJsonBtn', 'bodyCsvBtn', 'intakeCsvBtn', 'persistBtn', 'githubStatus', 'ghOwner', 'ghRepo', 'ghBranch',
    'ghPath', 'ghToken', 'ghAutoSync', 'ghRestoreBtn', 'ghSyncBtn', 'importInput', 'foodRegionGroup', 'foodLanguageGroup'
  ];
  ids.forEach((id) => { DOM[id] = document.getElementById(id); });
}


function bindEvents() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab || 'body'));
  });

  DOM.menuBtn.addEventListener('click', () => showDialogSafe(DOM.dataDialog));
  DOM.photoShapeBtn.addEventListener('click', () => {
    fillPhotoDialog();
    showDialogSafe(DOM.photoDialog);
  });
  DOM.importBodyBtn.addEventListener('click', () => {
    DOM.importInput.dataset.mode = 'body';
    DOM.importInput.click();
  });
  DOM.importAllBtn.addEventListener('click', () => {
    DOM.importInput.dataset.mode = 'all';
    DOM.importInput.click();
  });
  DOM.quickExportBtn?.addEventListener('click', exportAllData);
  DOM.importInput.addEventListener('change', onImportSelected);

  DOM.profileForm.addEventListener('input', onProfileInput);
  DOM.profileForm.addEventListener('change', onProfileInput);
  DOM.bodyForm.addEventListener('input', onBodyInput);
  DOM.bodyForm.addEventListener('change', onBodyInput);
  DOM.saveBodyBtn.addEventListener('click', saveBodyRecord);

  DOM.foodSearchInput.addEventListener('input', onFoodSearchInput);
  DOM.foodSearchInput.addEventListener('focus', () => {
    ensureFoodsLoaded().then(renderFoodSearchResults).catch(() => null);
  });
  DOM.foodAmountInput.addEventListener('input', renderFoodSearchResults);
  DOM.foodSearchResults.addEventListener('click', onFoodResultsClick);
  DOM.saveCustomFoodBtn?.addEventListener('click', saveCustomFoodFromForm);
  DOM.clearCustomFoodFormBtn?.addEventListener('click', clearCustomFoodForm);
  DOM.customFoodForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    saveCustomFoodFromForm();
  });
  DOM.customFoodList?.addEventListener('click', onCustomFoodListClick);
  DOM.foodRegionGroup?.addEventListener('click', async (event) => {
    const btn = event.target.closest('[data-food-region]');
    if (!btn) return;
    const nextLibrary = FOOD_REGION_OPTIONS.has(btn.dataset.foodRegion) ? btn.dataset.foodRegion : 'all';
    if (state.foodLibrary === nextLibrary) return;
    state.foodLibrary = nextLibrary;
    persistState({ syncEligible: false });
    await ensureFoodsLoaded().catch(() => null);
    if (state.searchQuery.trim()) state.searchResults = searchFoods(state.searchQuery).slice(0, FOOD_SEARCH_LIMIT);
    renderAll();
  });
  DOM.foodLanguageGroup?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-food-lang]');
    if (!btn) return;
    state.foodNameMode = FOOD_NAME_MODE_OPTIONS.has(btn.dataset.foodLang) ? btn.dataset.foodLang : 'zh';
    if (state.searchQuery.trim()) state.searchResults = searchFoods(state.searchQuery).slice(0, FOOD_SEARCH_LIMIT);
    persistState({ syncEligible: false });
    renderAll();
  });

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
  ['shapeShoulder', 'shapeChest', 'shapeWaist', 'shapeHip', 'shapeArm', 'shapeLeg'].forEach((id) => {
    DOM[id].addEventListener('input', renderPhotoPreviewMeta);
  });
  DOM.photoAutoBtn?.addEventListener('click', autoEstimatePhotoShape);
  DOM.photoResetBtn.addEventListener('click', resetPhotoShape);
  DOM.photoApplyBtn.addEventListener('click', applyPhotoShape);

  DOM.exportAllBtn.addEventListener('click', exportAllData);
  DOM.bodyJsonBtn?.addEventListener('click', exportBodyJson);
  DOM.bodyCsvBtn.addEventListener('click', exportBodyCsv);
  DOM.intakeCsvBtn?.addEventListener('click', exportIntakeCsv);
  DOM.restoreLocalBtn?.addEventListener('click', restoreLatestLocalBackup);
  DOM.persistBtn.addEventListener('click', requestPersistentStorage);
  DOM.ghSyncBtn.addEventListener('click', () => syncToGitHub(true).catch(() => null));
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
    state.model?.setAccentColor?.(RING_COLORS[state.activeRing] || '#6c8fa9');
    renderHeroRings();
    renderHeroMeta();
  });
}


async function loadState() {
  const localSnapshots = V32_STORAGE_KEYS.map((key) => safeJsonParse(localStorage.getItem(key), null)).filter(Boolean);
  const idbSnapshots = (await Promise.all(V32_IDB_SNAPSHOT_KEYS.map((key) => idbGet(key).catch(() => null)))).filter(Boolean);
  const snapshot = [...localSnapshots, ...idbSnapshots].reduce((best, current) => pickNewestSnapshot(best, current), null) || createDefaultSnapshot();
  applySnapshot(snapshot);
  const photoRef = snapshot.photoRefUrl || await idbGet(IDB_PHOTO_KEY).catch(() => '');
  state.photoRefUrl = typeof photoRef === 'string' ? photoRef : '';
  state.localBackupMeta = await idbGet(V32_IDB_BACKUP_KEY).catch(() => []);
}


function createDefaultSnapshot() {
  return {
    version: V32_BUILD_VERSION,
    updatedAt: new Date().toISOString(),
    profile: { ...defaultProfile(), bodyFat: 22, focusNote: '' },
    bodyHistory: [],
    logs: {},
    customFoods: [],
    photoShape: { shoulder: 1, chest: 1, waist: 1, hip: 1, arm: 1, leg: 1, hasPhoto: false },
    preferences: { foodLibrary: 'all', foodNameMode: 'zh' },
    github: resolveGitHubSnapshot({}),
  };
}


function applySnapshot(snapshot) {
  state.profile = normalizeProfileSnapshot(snapshot.profile);
  state.bodyHistory = normalizeBodyHistory(snapshot.bodyHistory || []);
  state.logs = normalizeLogs(snapshot.logs || {});
  state.customFoods = normalizeCustomFoods(snapshot.customFoods || []);
  state.customFoodEditingId = '';
  state.photoShape = normalizePhotoShape(snapshot.photoShape || {});
  if (typeof snapshot.photoRefUrl === 'string') state.photoRefUrl = snapshot.photoRefUrl;
  state.foodLibrary = FOOD_REGION_OPTIONS.has(snapshot.preferences?.foodLibrary) ? snapshot.preferences.foodLibrary : 'all';
  state.foodNameMode = FOOD_NAME_MODE_OPTIONS.has(snapshot.preferences?.foodNameMode) ? snapshot.preferences.foodNameMode : 'zh';
  state.github = resolveGitHubSnapshot(snapshot.github || {});
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
  const labels = normalizeFoodLabels(raw);
  return {
    id: raw.id || uid('log'),
    createdAt: raw.createdAt || new Date().toISOString(),
    label: String(raw.label || raw.name || labels.zh || '未命名食品'),
    labels,
    grams: finiteOrNull(raw.grams),
    code: String(raw.code || ''),
    nutrients: normalizeNutrientObject(raw.nutrients || {}),
    source: String(raw.source || 'library'),
    library: String(raw.library || classifyFoodLibrary({ labels })),
  };
}


function normalizeCustomFoods(list) {
  return Array.isArray(list) ? list.map(normalizeCustomFood).filter(Boolean).slice(0, CUSTOM_FOOD_LIMIT) : [];
}

function normalizeCustomFood(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const labelsInput = raw.labels || {};
  const name = String(raw.name || raw.label || labelsInput.zh || raw.z || raw.n || '').trim();
  if (!name) return null;
  const labels = buildCustomFoodLabels(name, raw);
  const brand = String(raw.brand || raw.b || '').trim().slice(0, 80);
  const category = String(raw.category || raw.g || '自定义常用').trim().slice(0, 120);
  const code = String(raw.code || raw.c || '').trim().slice(0, 32);
  return {
    id: String(raw.id || uid('custom')),
    name,
    code,
    c: code,
    b: brand,
    g: category,
    q: String(raw.q || raw.quantity || '').trim().slice(0, 40),
    basis: raw.basis === 'serving' ? 'serving' : raw.basis === '100ml' ? '100ml' : '100g',
    servingSize: finiteOrNull(raw.servingSize),
    customPer100: normalizeNutrientObject(raw.customPer100 || raw.customNutrients || {}),
    labels,
    library: raw.library || classifyFoodLibrary({ labels, b: brand, g: category }),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}


function normalizePhotoShape(raw = {}) {
  return {
    shoulder: clamp(Number(raw.shoulder) || 1, 0.8, 1.25),
    chest: clamp(Number(raw.chest) || 1, 0.82, 1.25),
    waist: clamp(Number(raw.waist) || 1, 0.78, 1.22),
    hip: clamp(Number(raw.hip) || 1, 0.82, 1.26),
    arm: clamp(Number(raw.arm) || 1, 0.8, 1.22),
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
  DOM.profileForm.cyclePhase.value = p.cyclePhase || 'none';
  DOM.profileForm.jointFocus.value = p.jointFocus || 'none';
  DOM.profileForm.glucoseStatus.value = p.glucoseStatus;
  DOM.profileForm.focusNote.value = p.focusNote || '';
  DOM.profileForm.boneRisk.checked = Boolean(p.conditions?.boneRisk);
  DOM.profileForm.anemiaRisk.checked = Boolean(p.conditions?.anemiaRisk);
  DOM.profileForm.hypertension.checked = Boolean(p.conditions?.hypertension);
  DOM.profileForm.dyslipidemia.checked = Boolean(p.conditions?.dyslipidemia);
  DOM.profileForm.jointPain.checked = Boolean(p.conditions?.jointPain);
  DOM.profileForm.lowSun.checked = Boolean(p.lowSun);
  DOM.profileForm.heavyFlow.checked = Boolean(p.heavyFlow);
  DOM.profileForm.periodCramps.checked = Boolean(p.periodCramps);
  DOM.profileForm.smoker.checked = Boolean(p.smoker);

  fillBodyForm(state.bodyHistory[0] || {});
  fillGitHubForm();
  fillPhotoDialog();
  renderFilterButtons();
}


function fillBodyForm(record = {}) {
  const fields = ['neck', 'shoulder', 'chest', 'underbust', 'waist', 'abdomen', 'hip', 'upperArm', 'forearm', 'thigh', 'calf', 'ankle'];
  fields.forEach((field) => {
    const value = record[field] ?? averageOrNull(record[`${field}L`], record[`${field}R`]);
    DOM.bodyForm[field].value = Number.isFinite(Number(value)) ? Number(value) : '';
  });
}

function fillGitHubForm() {
  DOM.ghOwner.value = state.github.owner || DEFAULT_GITHUB.owner || 'kawhikun';
  DOM.ghRepo.value = state.github.repo || DEFAULT_GITHUB.repo || 'haochijia';
  DOM.ghBranch.value = state.github.branch || 'main';
  DOM.ghPath.value = state.github.path || 'data/haochijia-user.json';
  DOM.ghToken.value = state.github.token || '';
  DOM.ghAutoSync.checked = Boolean(state.github.autoSync);
}


function fillPhotoDialog() {
  DOM.shapeShoulder.value = Math.round((state.photoShape.shoulder || 1) * 100);
  DOM.shapeChest.value = Math.round((state.photoShape.chest || 1) * 100);
  DOM.shapeWaist.value = Math.round((state.photoShape.waist || 1) * 100);
  DOM.shapeHip.value = Math.round((state.photoShape.hip || 1) * 100);
  DOM.shapeArm.value = Math.round((state.photoShape.arm || 1) * 100);
  DOM.shapeLeg.value = Math.round((state.photoShape.leg || 1) * 100);
  if (state.photoRefUrl) {
    DOM.photoPreview.src = state.photoRefUrl;
    DOM.photoPreview.hidden = false;
  } else {
    DOM.photoPreview.hidden = true;
    DOM.photoPreview.removeAttribute('src');
  }
  renderPhotoPreviewMeta();
}


function renderAll() {
  recomputeState();
  renderHeroMeta();
  renderHeroRings();
  renderSuggestions();
  renderFeatureAudit();
  renderBodyHistory();
  renderFoodAuditStrip();
  renderCustomFoodList();
  renderFoodSearchResults();
  renderProgressList();
  renderLogList();
  renderCaptureResult();
  renderPhotoRef();
  renderGitHubStatus();
  renderFilterButtons();
  renderLocalBackupMeta();
  if (state.model) {
    state.model.setSnapshot(buildModelSnapshot());
    state.model.setFocusField(RING_FIELD_MAP[state.activeRing] || '');
    state.model.setAccentColor?.(RING_COLORS[state.activeRing] || '#6c8fa9');
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
    cyclePhase: DOM.profileForm.cyclePhase.value,
    jointFocus: DOM.profileForm.jointFocus.value,
    heavyFlow: DOM.profileForm.heavyFlow.checked,
    periodCramps: DOM.profileForm.periodCramps.checked,
    lowSun: DOM.profileForm.lowSun.checked,
    smoker: DOM.profileForm.smoker.checked,
    glucoseStatus: DOM.profileForm.glucoseStatus.value,
    conditions: {
      boneRisk: DOM.profileForm.boneRisk.checked,
      anemiaRisk: DOM.profileForm.anemiaRisk.checked,
      hypertension: DOM.profileForm.hypertension.checked,
      dyslipidemia: DOM.profileForm.dyslipidemia.checked,
      jointPain: DOM.profileForm.jointPain.checked,
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
    shapeChest: state.photoShape.chest,
    shapeWaist: state.photoShape.waist,
    shapeHip: state.photoShape.hip,
    shapeArm: state.photoShape.arm,
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
    shapeChest: state.photoShape.chest,
    shapeWaist: state.photoShape.waist,
    shapeHip: state.photoShape.hip,
    shapeArm: state.photoShape.arm,
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
  if (state.activeTab === 'intake') {
    window.setTimeout(() => ensureFoodsLoaded().catch(() => null), 16);
  }
}


let softRefreshTimer = 0;
function scheduleSoftRefresh() {
  window.clearTimeout(softRefreshTimer);
  const scrollY = window.scrollY;
  softRefreshTimer = window.setTimeout(() => {
    persistState({ syncEligible: false });
    renderAll();
    window.requestAnimationFrame(() => window.scrollTo({ top: scrollY, behavior: 'auto' }));
  }, 110);
}

function renderHeroMeta() {
  const platformText = state.platform.key === 'ios' ? 'iPhone Body Core' : state.platform.key === 'android' ? 'Android Body Core' : 'Body Core';
  DOM.focusModePill.textContent = `${platformText} · 6 Nutrition Rings`;
  DOM.focusModeText.textContent = `${nutrientDisplayName(state.activeRing)} 高亮 · 拖旋 / 缩放 / 双击回正`;
}


function buildHeroRingData() {
  const targets = state.calc.targets;
  const dynamicIds = state.focusMode.nutrientIds.slice(3);
  const baseIds = state.focusMode.nutrientIds.slice(0, 3);
  const ordered = [...dynamicIds, ...baseIds];
  return ordered.map((id, index) => {
    const target = targets[id];
    const current = Number(state.totals[id] || 0);
    const progress = progressForTarget(target, current);
    return {
      id,
      focus: index < 3,
      label: nutrientDisplayName(id),
      percent: clamp(progress * 100, 0, 199),
      meta: `${formatCompactNutrient(id, current)} / ${formatCompactNutrient(id, targetValue(target))}`,
      color: RING_COLORS[id] || '#6c8fa9',
    };
  });
}



function renderHeroRings() {
  if (!DOM.ringOrbit) return;
  const ringData = buildHeroRingData();
  const rect = DOM.heroStage?.getBoundingClientRect?.() || DOM.ringOrbit.getBoundingClientRect();
  const width = rect.width || 360;
  const height = rect.height || 520;
  const points = ringLayoutPoints(width, height);
  DOM.ringOrbit.innerHTML = '';
  ringData.forEach((ring, index) => {
    const point = points[index] || points[points.length - 1];
    const active = ring.id === state.activeRing;
    const size = active ? (width < 390 ? 86 : 94) : (ring.focus ? (width < 390 ? 80 : 88) : (width < 390 ? 76 : 82));
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `nutri-ring${ring.focus ? ' is-focus' : ''}${active ? ' is-active' : ''}`;
    button.dataset.ringId = ring.id;
    button.style.left = `${point.x}px`;
    button.style.top = `${point.y}px`;
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
  DOM.suggestionSummary.textContent = `${state.focusMode.label} · ${cards.length} 条重点建议`;
  const cardsHtml = cards.map((card) => `
    <article class="suggestion-card">
      <strong>${escapeHtml(card.title)}</strong>
      <div class="history-meta">${escapeHtml(card.subtitle)}</div>
      <div class="suggestion-foods">${escapeHtml(card.foods.join(' · '))}</div>
    </article>
  `).join('');
  const adviceHtml = renderAdviceBasisPanel();
  DOM.suggestionCards.innerHTML = cardsHtml || adviceHtml ? `${cardsHtml}${adviceHtml}` : '<div class="empty-state">暂无建议</div>';
}

function renderAdviceBasisPanel() {
  const notes = Array.isArray(state.calc?.notes) ? state.calc.notes.slice(0, 7) : [];
  const basisRows = Array.isArray(state.calc?.basisRows)
    ? state.calc.basisRows.filter((row) => ['年龄分组', 'BMI', '生理状态', '生理周期', '关节关注', '糖代谢状态', '当前蛋白建议', '目标热量'].includes(row.label)).slice(0, 8)
    : [];
  if (!notes.length && !basisRows.length) return '';
  return `
    <article class="suggestion-card advice-basis-card">
      <strong>建议依据</strong>
      <div class="advice-basis-grid">
        ${basisRows.map((row) => `<span><b>${escapeHtml(row.label)}</b>${escapeHtml(row.value)}</span>`).join('')}
      </div>
      ${notes.length ? `<ul class="advice-note-list">${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}</ul>` : ''}
      <div class="dialog-note">营养建议用于日常记录和风险提示，不能替代诊断、治疗或个人化处方。</div>
    </article>`;
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
      <button type="button" class="ghost-btn tiny-btn" data-load-body-index="${index}">载入到模型</button>
    </article>
  `).join('');
}


function renderFoodSearchResults() {
  renderFilterButtons();
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
    const secondary = foodSecondaryName(food);
    const tags = [
      `<span class="food-tag ${food.library === 'cn' ? 'cn' : 'intl'}">${libraryTagLabel(food.library)}</span>`,
      food.customPer100 ? '<span class="food-tag custom">自定义</span>' : '',
      food.code ? `<span class="food-tag">${escapeHtml(food.code)}</span>` : '',
    ].filter(Boolean).join('');
    return `
      <article class="food-item">
        <strong>${escapeHtml(foodDisplayName(food))}</strong>
        <div class="food-meta">
          ${secondary ? `<div class="history-meta">${escapeHtml(secondary)}</div>` : ''}
          <div>每 100：${escapeHtml(formatCompactNutrient('kcal', per100.kcal || 0))} · ${escapeHtml(formatCompactNutrient('protein', per100.protein || 0))} · ${escapeHtml(formatCompactNutrient('carbs', per100.carbs || 0))} · ${escapeHtml(formatCompactNutrient('fat', per100.fat || 0))}</div>
          <div class="food-tags">${tags}</div>
        </div>
        <div class="food-actions">
          <button type="button" class="primary-btn tiny-btn" data-add-food-index="${index}" data-add-food-amount="${amount}">加入 ${amount}g</button>
          ${food.code ? `<button type="button" class="ghost-btn tiny-btn" data-search-code="${escapeHtml(food.code)}">${escapeHtml(food.code)}</button>` : ''}
        </div>
      </article>`;
  }).join('');
}


function renderSearchPlaceholder() {
  const recent = recentFoods(6);
  if (!recent.length) {
    const summary = state.foodBankLoaded.cn || state.foodBankLoaded.intl ? `\n${foodBankSummaryText()}` : '';
    return `<div class="empty-state">输入食品名 / EN / 原始名 / 品牌 / 条码${summary ? `<br><span class="history-meta">${escapeHtml(summary)}</span>` : ''}</div>`;
  }
  return recent.map((food, index) => {
    const secondary = foodSecondaryName(food);
    return `
      <article class="food-item">
        <strong>${escapeHtml(foodDisplayName(food))}</strong>
        <div class="food-meta">${secondary ? `<div class="history-meta">${escapeHtml(secondary)}</div>` : '最近使用'}</div>
        <div class="food-actions">
          <button type="button" class="ghost-btn tiny-btn" data-recent-food-index="${index}">再次加入</button>
        </div>
      </article>`;
  }).join('');
}



function renderFoodAuditStrip() {
  if (!DOM.foodAuditStrip) return;
  const totalIntl = FOOD_LIBRARY_AUDIT.intl01.rows + FOOD_LIBRARY_AUDIT.intl02.rows;
  const totalRows = FOOD_LIBRARY_AUDIT.cn.rows + totalIntl;
  const intlMissingCodes = FOOD_LIBRARY_AUDIT.intl01.missingCode + FOOD_LIBRARY_AUDIT.intl02.missingCode;
  DOM.foodAuditStrip.innerHTML = `
    <span>已核验 ${totalRows.toLocaleString('zh-CN')} 条</span>
    <span>中文 ${FOOD_LIBRARY_AUDIT.cn.rows.toLocaleString('zh-CN')}：中/英/原名 0 缺失</span>
    <span>国际 ${totalIntl.toLocaleString('zh-CN')}：中/英/原名 0 缺失，条码缺 ${intlMissingCodes}</span>
    <span>常用 ${state.customFoods.length}</span>`;
}

function renderFeatureAudit() {
  if (!DOM.featureAuditList) return;
  const loadedText = state.foodBankLoaded.cn || state.foodBankLoaded.intl ? foodBankSummaryText() : '待加载，分库文件已配置';
  const items = [
    { ok: true, title: '中文 / 国际双食品库', meta: `${loadedText}；名称字段核验通过` },
    { ok: true, title: '用户自定义常用食品', meta: `已支持新增、编辑、删除、搜索优先和一键加入；当前 ${state.customFoods.length} 个` },
    { ok: true, title: '状态化营养建议', meta: `${state.focusMode.label}：年龄、性别、活动、训练、目标、糖代谢、生理期、骨关节共同参与` },
    { ok: true, title: '生理期 / 骨关节建议', meta: '已增加周期、经量、经前不适、日晒、关节部位、关节不适入口' },
    { ok: true, title: '3D 初始形态与照片塑形', meta: '完整头部、颈肩、四肢、柔光材质、6 维照片塑形联动' },
    { ok: true, title: '数据安全', meta: 'localStorage + IndexedDB + 最近备份 + 全量导入导出 + GitHub 同步入口' },
  ];
  DOM.featureAuditList.innerHTML = items.map((item) => `
    <article class="feature-audit-item ${item.ok ? 'is-ok' : 'is-warn'}">
      <span>${item.ok ? '✓' : '!'}</span>
      <div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.meta)}</small></div>
    </article>`).join('');
}

function clearCustomFoodForm() {
  state.customFoodEditingId = '';
  DOM.customFoodForm?.reset();
  if (DOM.saveCustomFoodBtn) DOM.saveCustomFoodBtn.textContent = '保存为常用';
}

function readCustomFoodForm() {
  const name = String(DOM.customFoodName?.value || '').trim();
  if (!name) throw new Error('请填写食品名称');
  const nutrients = {};
  DOM.customFoodForm?.querySelectorAll('[data-custom-nutrient]').forEach((input) => {
    const id = input.dataset.customNutrient;
    if (!CUSTOM_NUTRIENT_FIELDS.includes(id)) return;
    const value = Number(input.value);
    if (Number.isFinite(value) && value > 0) nutrients[id] = value;
  });
  if (!Object.keys(nutrients).length) throw new Error('请至少填写一项每 100g 营养数据');
  const en = String(DOM.customFoodNameEn?.value || '').trim();
  const code = String(DOM.customFoodCode?.value || '').trim();
  const brand = String(DOM.customFoodBrand?.value || '').trim();
  const servingSize = finiteOrNull(DOM.customFoodServing?.value);
  return normalizeCustomFood({
    id: state.customFoodEditingId || uid('custom'),
    name,
    code,
    b: brand,
    g: '用户自定义常用食品',
    q: servingSize ? `${servingSize}g / 份` : '',
    servingSize,
    customPer100: nutrients,
    labels: { zh: name, en: en || name, original: name },
    updatedAt: new Date().toISOString(),
  });
}

function saveCustomFoodFromForm() {
  try {
    const food = readCustomFoodForm();
    const same = (item) => item.id === food.id || (food.code && item.code === food.code) || normalizeText(item.name) === normalizeText(food.name);
    state.customFoods = [food, ...state.customFoods.filter((item) => !same(item))].slice(0, CUSTOM_FOOD_LIMIT);
    persistState({ syncEligible: true });
    clearCustomFoodForm();
    state.searchQuery = DOM.foodSearchInput.value = food.name;
    state.searchResults = searchFoods(food.name).slice(0, FOOD_SEARCH_LIMIT);
    renderAll();
    DOM.foodSearchStatus.textContent = `${food.name} 已保存为常用食品`;
  } catch (error) {
    DOM.foodSearchStatus.textContent = `常用食品保存失败：${error.message}`;
  }
}

function fillCustomFoodForm(food) {
  if (!food || !DOM.customFoodForm) return;
  state.customFoodEditingId = food.id;
  const labels = normalizeFoodLabels(food);
  DOM.customFoodName.value = labels.zh || food.name || '';
  DOM.customFoodNameEn.value = labels.en || '';
  DOM.customFoodCode.value = food.code || '';
  DOM.customFoodBrand.value = food.b || '';
  DOM.customFoodServing.value = Number.isFinite(Number(food.servingSize)) ? Number(food.servingSize) : '';
  DOM.customFoodForm.querySelectorAll('[data-custom-nutrient]').forEach((input) => {
    input.value = Number.isFinite(Number(food.customPer100?.[input.dataset.customNutrient])) ? food.customPer100[input.dataset.customNutrient] : '';
  });
  DOM.saveCustomFoodBtn.textContent = '更新常用食品';
  DOM.customFoodName.focus();
}

function renderCustomFoodList() {
  if (!DOM.customFoodList) return;
  if (!state.customFoods.length) {
    DOM.customFoodList.innerHTML = '<div class="empty-state">还没有常用食品。保存后会优先出现在搜索里。</div>';
    return;
  }
  const amount = clamp(Number(DOM.foodAmountInput?.value) || 100, 1, 3000);
  DOM.customFoodList.innerHTML = state.customFoods.slice(0, 10).map((food) => {
    const per100 = nutrientsForFood(food);
    const labels = normalizeFoodLabels(food);
    return `
      <article class="food-item custom-food-row">
        <strong>${escapeHtml(labels.zh || food.name)}</strong>
        <div class="food-meta">
          ${labels.en && normalizeText(labels.en) !== normalizeText(labels.zh) ? `<div class="history-meta">${escapeHtml(labels.en)}</div>` : ''}
          <div>每 100：${escapeHtml(formatCompactNutrient('kcal', per100.kcal || 0))} · ${escapeHtml(formatCompactNutrient('protein', per100.protein || 0))} · ${escapeHtml(formatCompactNutrient('carbs', per100.carbs || 0))} · ${escapeHtml(formatCompactNutrient('fat', per100.fat || 0))}</div>
          <div class="food-tags"><span class="food-tag custom">常用</span>${food.code ? `<span class="food-tag">${escapeHtml(food.code)}</span>` : ''}${food.b ? `<span class="food-tag">${escapeHtml(food.b)}</span>` : ''}</div>
        </div>
        <div class="food-actions">
          <button type="button" class="primary-btn tiny-btn" data-custom-add-id="${escapeHtml(food.id)}">加入 ${amount}g</button>
          <button type="button" class="ghost-btn tiny-btn" data-custom-edit-id="${escapeHtml(food.id)}">编辑</button>
          <button type="button" class="ghost-btn tiny-btn" data-custom-delete-id="${escapeHtml(food.id)}">删除</button>
        </div>
      </article>`;
  }).join('');
}

function onCustomFoodListClick(event) {
  const addBtn = event.target.closest('[data-custom-add-id]');
  const editBtn = event.target.closest('[data-custom-edit-id]');
  const deleteBtn = event.target.closest('[data-custom-delete-id]');
  const id = addBtn?.dataset.customAddId || editBtn?.dataset.customEditId || deleteBtn?.dataset.customDeleteId || '';
  if (!id) return;
  const food = state.customFoods.find((item) => item.id === id);
  if (!food) return;
  if (addBtn) {
    addFoodToToday(food, clamp(Number(DOM.foodAmountInput.value) || Number(food.servingSize) || 100, 1, 3000));
    return;
  }
  if (editBtn) {
    fillCustomFoodForm(food);
    return;
  }
  if (deleteBtn) {
    state.customFoods = state.customFoods.filter((item) => item.id !== id);
    if (state.customFoodEditingId === id) clearCustomFoodForm();
    persistState({ syncEligible: true });
    renderAll();
    DOM.foodSearchStatus.textContent = `${food.name} 已删除`;
  }
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

function logItemDisplayName(item) {
  return foodDisplayNameForMode(item, state.foodNameMode);
}



function renderLogList() {
  const items = getDayLog(state.activeDate).items;
  if (!items.length) {
    DOM.logList.innerHTML = '<div class="empty-state">今天还没有记录</div>';
    return;
  }
  DOM.logList.innerHTML = items.map((item, index) => {
    const secondary = foodSecondaryName(item);
    return `
      <article class="log-item">
        <strong>${escapeHtml(logItemDisplayName(item))}</strong>
        ${secondary ? `<div class="history-meta">${escapeHtml(secondary)}</div>` : ''}
        <div class="log-meta">${escapeHtml(formatTime(item.createdAt))}${item.grams ? ` · ${item.grams}g` : ''} · ${escapeHtml(formatCompactNutrient('kcal', item.nutrients.kcal || 0))}</div>
        <div class="log-actions">
          <button type="button" class="ghost-btn tiny-btn" data-remove-log-index="${index}">删除</button>
        </div>
      </article>`;
  }).join('');
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
  if (!ok) {
    DOM.githubStatus.textContent = '未配置';
    return;
  }
  const synced = state.github.lastSyncStatus === 'success' && state.github.lastSyncAt
    ? `已同步 ${formatTime(state.github.lastSyncAt)}`
    : '未同步';
  DOM.githubStatus.textContent = `${state.github.owner}/${state.github.repo} · ${synced}`;
}


function onProfileInput() {
  state.profile = {
    ...readProfileForm(),
    bodyFat: clamp(Number(DOM.profileForm.bodyFat.value) || 22, 2, 60),
    focusNote: String(DOM.profileForm.focusNote.value || '').trim().slice(0, 120),
  };
  scheduleSoftRefresh();
}

function onBodyInput() {
  scheduleSoftRefresh();
}

function onFoodSearchInput() {
  state.searchQuery = String(DOM.foodSearchInput.value || '').trim();
  if (!state.searchQuery) {
    state.searchResults = [];
    DOM.foodSearchStatus.textContent = state.foodBankLoaded.cn || state.foodBankLoaded.intl ? foodBankSummaryText() : '待输入';
    renderFoodSearchResults();
    return;
  }
  ensureFoodsLoaded().then(() => {
    state.searchResults = searchFoods(state.searchQuery).slice(0, FOOD_SEARCH_LIMIT);
    DOM.foodSearchStatus.textContent = `找到 ${state.searchResults.length} 项 · ${foodBankSummaryText()}`;
    renderFoodSearchResults();
  }).catch((error) => {
    DOM.foodSearchStatus.textContent = `食品库失败：${error.message}`;
  });
}


async function ensureFoodsLoaded() {
  const libs = activeFoodLibraries();
  state.foodsLoading = true;
  if (DOM.foodSearchStatus) DOM.foodSearchStatus.textContent = '食品库加载中…';
  try {
    await Promise.all(libs.map((lib) => ensureFoodBankLoaded(lib)));
    mergeFoodBanks();
    state.foodsLoading = false;
    if (DOM.foodSearchStatus) DOM.foodSearchStatus.textContent = foodBankSummaryText();
    return state.foods;
  } catch (error) {
    state.foodsLoading = false;
    throw error;
  }
}


function requestIdleLoadFoods() {
  const run = async () => {
    const first = state.foodLibrary === 'intl' ? 'intl' : 'cn';
    const second = first === 'cn' ? 'intl' : 'cn';
    await ensureFoodBankLoaded(first).catch(() => null);
    window.setTimeout(() => ensureFoodBankLoaded(second).catch(() => null), 1200);
  };
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 2400 });
  else window.setTimeout(run, 900);
}


function prepareFood(food, libraryHint = '') {
  const labels = normalizeFoodLabels(food);
  food.labels = { ...(food.labels || {}), ...labels };
  food.code = String(food.code || food.c || '').trim();
  food.library = libraryHint || food.library || classifyFoodLibrary(food);
  food._displayName = labels.zh;
  food._search = buildFoodSearchText(food);
  return food;
}


function searchFoods(query) {
  const q = normalizeText(query);
  const isCode = /^\d{6,14}$/.test(q);
  const tokens = q.split(/\s+/).filter(Boolean);
  const results = [];
  for (const food of foodPool()) {
    const hay = food._search || buildFoodSearchText(food);
    let score = 0;
    if (isCode) {
      if ((food.code || '').startsWith(q)) score += food.code === q ? 140 : 90;
      else continue;
    } else {
      if (hay.includes(q)) score += 40;
      let matched = 0;
      for (const token of tokens) {
        if (hay.includes(token)) {
          matched += 1;
          score += normalizeText(foodDisplayNameForMode(food, state.foodNameMode)).startsWith(token) ? 18 : 8;
        }
      }
      if (matched < tokens.length) continue;
      if (normalizeText(foodDisplayNameForMode(food, state.foodNameMode)).startsWith(q)) score += 20;
      if (normalizeText(foodDisplayNameForMode(food, 'zh')).startsWith(q)) score += 10;
    }
    if (food.customPer100) score += 8;
    if (food.library === state.foodLibrary) score += 4;
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
  const labels = normalizeFoodLabels(food);
  const item = {
    id: uid('log'),
    createdAt: new Date().toISOString(),
    label: labels.zh || labels.original,
    labels,
    grams: round1(grams),
    code: food.code || '',
    nutrients,
    source: food.customPer100 ? 'custom' : 'library',
    library: food.library || classifyFoodLibrary(food),
  };
  getDayLog(state.activeDate).items.unshift(item);
  getDayLog(state.activeDate).items = getDayLog(state.activeDate).items.slice(0, MAX_LOG_ITEMS_PER_DAY);
  persistState({ syncEligible: true });
  renderAll();
  DOM.foodSearchStatus.textContent = `${foodDisplayName(food)} 已加入`;
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
  DOM.bodyStatusHint.textContent = '已载入历史记录，当前页不跳转';
  activateTab('body');
  renderAll();
}

function saveBodyRecord() {
  const record = buildCurrentBodyRecord();
  const hasAny = ['weightKg', 'bodyFat', 'neck', 'shoulder', 'chest', 'underbust', 'waist', 'abdomen', 'hip', 'upperArm', 'forearm', 'thigh', 'calf', 'ankle'].some((key) => Number.isFinite(record[key]));
  if (!hasAny) {
    DOM.bodyStatusHint.textContent = '请先填写至少一项身体数据';
    return;
  }
  state.bodyHistory.unshift(record);
  state.bodyHistory = normalizeBodyHistory(state.bodyHistory);
  DOM.bodyStatusHint.textContent = '身体记录已保存，模型与建议已更新';
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
  const jointMode = profile.conditions?.jointPain || profile.jointFocus !== 'none' || hasKeyword(note, ['关节', '膝', '跟骨', '足跟', '髋', '腰背', 'joint']);
  const boneMode = profile.conditions?.boneRisk || profile.cyclePhase === 'menopause' || profile.cyclePhase === 'perimenopause' || hasKeyword(note, ['骨', '骨密度', '骨质', 'bone']);
  if (boneMode || jointMode) {
    const nutrientIds = boneMode
      ? ['protein', 'fat', 'carbs', 'calcium', 'vitaminD', 'vitaminK']
      : ['protein', 'fat', 'carbs', 'omega3', 'vitaminC', 'magnesium'];
    return {
      id: boneMode ? 'bone' : 'joint',
      label: boneMode ? '骨关节模式' : '关节修复模式',
      summary: boneMode ? '前置 钙 · 维生素 D3 · 维生素 K' : '前置 Omega-3 · 维生素 C · 镁',
      nutrientIds,
      tipMap: {
        calcium: '骨骼优先',
        vitaminD: '吸收协同',
        vitaminK: '骨代谢协同',
        omega3: '炎症管理',
        vitaminC: '胶原合成支持',
        magnesium: '肌肉神经支持',
      },
    };
  }
  if (profile.sex === 'female' && (profile.cyclePhase !== 'none' || profile.heavyFlow || profile.periodCramps)) {
    const menstrual = profile.cyclePhase === 'menstruation' || profile.heavyFlow;
    const bloodFocus = profile.heavyFlow || profile.conditions?.anemiaRisk || hasKeyword(note, ['贫血', '缺铁', '铁', 'anemia']);
    const nutrientIds = bloodFocus
      ? ['protein', 'fat', 'carbs', 'iron', 'folate', 'vitaminB12']
      : menstrual
        ? ['protein', 'fat', 'carbs', 'iron', 'magnesium', 'water']
        : ['protein', 'fat', 'carbs', 'magnesium', 'calcium', 'omega3'];
    return {
      id: bloodFocus ? 'menstrual-blood' : menstrual ? 'menstrual' : 'cycle',
      label: bloodFocus ? '经期造血支持' : menstrual ? '经期支持' : '周期平衡',
      summary: bloodFocus ? '前置 铁 · 叶酸 · 维生素 B12' : menstrual ? '前置 铁 · 镁 · 水分' : '前置 镁 · 钙 · Omega-3',
      nutrientIds,
      tipMap: {
        iron: '经期造血关注',
        folate: '红细胞生成支持',
        vitaminB12: '红细胞与神经支持',
        magnesium: '经前 / 痛经支持',
        water: '水分与电解质',
        calcium: '周期波动支持',
        omega3: '炎症管理',
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
    await ensureAllFoodBanksLoaded();
    const allFoods = [
      ...state.customFoods.map((food) => prepareFood(food, food.library || classifyFoodLibrary(food))),
      ...(state.foodBanks.cn || []),
      ...(state.foodBanks.intl || []),
    ];
    const hit = allFoods.find((food) => String(food.code || '') === String(code));
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
  const labels = state.captureParsed.sourceFood ? normalizeFoodLabels(state.captureParsed.sourceFood) : buildCustomFoodLabels(name);
  const customFood = normalizeCustomFood({
    id: uid('custom'),
    name,
    code: state.captureParsed.code || '',
    basis: servingSize ? '100g' : basis,
    servingSize,
    customPer100: per100,
    labels,
    library: state.foodLibrary === 'all' ? classifyFoodLibrary({ labels }) : state.foodLibrary,
  });
  if (!customFood) return;
  state.customFoods = [customFood, ...state.customFoods.filter((item) => item.name !== customFood.name)].slice(0, CUSTOM_FOOD_LIMIT);
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
  const values = {
    shoulder: DOM.shapeShoulder.value,
    chest: DOM.shapeChest.value,
    waist: DOM.shapeWaist.value,
    hip: DOM.shapeHip.value,
    arm: DOM.shapeArm.value,
    leg: DOM.shapeLeg.value,
  };
  DOM.photoShapeMeta.textContent = state.photoRefUrl
    ? `6 维塑形 · 肩 ${values.shoulder}% · 胸 ${values.chest}% · 腰 ${values.waist}% · 臀 ${values.hip}% · 肢 ${values.arm}% · 腿 ${values.leg}%`
    : '上传正面全身照后会先自动估测，再保留 6 维手动微调。';
}


function resetPhotoShape() {
  state.photoShape = { shoulder: 1, chest: 1, waist: 1, hip: 1, arm: 1, leg: 1, hasPhoto: Boolean(state.photoRefUrl) };
  fillPhotoDialog();
  renderAll();
}


function applyPhotoShape() {
  state.photoShape.shoulder = clamp(Number(DOM.shapeShoulder.value) / 100 || 1, 0.8, 1.25);
  state.photoShape.chest = clamp(Number(DOM.shapeChest.value) / 100 || 1, 0.82, 1.25);
  state.photoShape.waist = clamp(Number(DOM.shapeWaist.value) / 100 || 1, 0.78, 1.22);
  state.photoShape.hip = clamp(Number(DOM.shapeHip.value) / 100 || 1, 0.82, 1.26);
  state.photoShape.arm = clamp(Number(DOM.shapeArm.value) / 100 || 1, 0.8, 1.22);
  state.photoShape.leg = clamp(Number(DOM.shapeLeg.value) / 100 || 1, 0.85, 1.2);
  state.photoShape.hasPhoto = Boolean(state.photoRefUrl);
  closeDialogSafe(DOM.photoDialog);
  persistState({ syncEligible: false });
  renderAll();
}


function onGitHubFieldChange() {
  state.github.owner = String(DOM.ghOwner.value || '').trim() || DEFAULT_GITHUB.owner || 'kawhikun';
  state.github.repo = String(DOM.ghRepo.value || '').trim() || DEFAULT_GITHUB.repo || 'haochijia';
  state.github.branch = String(DOM.ghBranch.value || '').trim() || 'main';
  state.github.path = String(DOM.ghPath.value || '').trim() || 'data/haochijia-user.json';
  state.github.token = String(DOM.ghToken.value || '').trim();
  state.github.autoSync = Boolean(DOM.ghAutoSync.checked);
  persistState({ syncEligible: false });
  renderGitHubStatus();
}


function exportAllData() {
  const snapshot = makeSnapshot({ includeSecrets: false, includePhoto: true });
  snapshot.version = V32_BUILD_VERSION;
  snapshot.exportMeta = {
    exportedAt: new Date().toISOString(),
    platform: state.platform.key,
    bodyRecords: state.bodyHistory.length,
    logDays: Object.keys(state.logs || {}).length,
    customFoods: state.customFoods.length,
    foodBanksLoaded: {
      cn: Boolean(state.foodBankLoaded?.cn),
      intl: Boolean(state.foodBankLoaded?.intl),
    },
  };
  downloadJson(snapshot, `haochijia-complete-backup-${compactDateTime()}.json`);
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
    DOM.persistStatus.textContent = 'localStorage + IndexedDB 已开启';
    return false;
  }
  state.persistGranted = await navigator.storage.persisted();
  DOM.persistStatus.textContent = state.persistGranted ? '本地三重保存已开启' : 'localStorage + IndexedDB 已开启';
  return state.persistGranted;
}

async function syncToGitHub(manual = false) {
  try {
    const config = readGitHubConfig();
    ensureGitHubConfig(config, true);
    const snapshot = makeSnapshot({ includeSecrets: false, includePhoto: true });
    const existing = await githubReadFile(config).catch((error) => {
      if (error.status === 404) return null;
      throw error;
    });
    await githubWriteFile(config, snapshot, existing?.sha || '');
    state.github.lastSyncAt = new Date().toISOString();
    state.github.lastSyncStatus = 'success';
    DOM.githubStatus.textContent = `已同步 ${formatTime(state.github.lastSyncAt)}`;
    persistState({ syncEligible: false });
  } catch (error) {
    state.github.lastSyncStatus = error.message;
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
    state.github.lastSyncStatus = 'success';
    DOM.githubStatus.textContent = '已从 GitHub 恢复';
  } catch (error) {
    state.github.lastSyncStatus = error.message;
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
    owner: String(state.github.owner || DEFAULT_GITHUB.owner || 'kawhikun').trim() || 'kawhikun',
    repo: String(state.github.repo || DEFAULT_GITHUB.repo || 'haochijia').trim() || 'haochijia',
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
  V32_STORAGE_KEYS.forEach((key) => {
    try {
      localStorage.setItem(key, JSON.stringify(snapshot));
    } catch {
      // Ignore quota errors here; IndexedDB remains the primary backup mirror.
    }
  });
  V32_IDB_SNAPSHOT_KEYS.forEach((key) => idbSet(key, snapshot).catch(() => null));
  if (state.photoRefUrl) idbSet(IDB_PHOTO_KEY, state.photoRefUrl).catch(() => null);
  else idbSet(IDB_PHOTO_KEY, '').catch(() => null);
  if (syncEligible) {
    pushLocalBackup(snapshot).catch(() => null);
    scheduleGitHubSync();
  }
}


function makeSnapshot({ includeSecrets = true, includePhoto = false } = {}) {
  const snapshot = {
    version: V32_BUILD_VERSION,
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
    preferences: {
      foodLibrary: state.foodLibrary,
      foodNameMode: state.foodNameMode,
    },
    github: {
      owner: state.github.owner,
      repo: state.github.repo,
      branch: state.github.branch,
      path: state.github.path,
      autoSync: state.github.autoSync,
      lastSyncAt: state.github.lastSyncAt || '',
      lastSyncStatus: state.github.lastSyncStatus || '',
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
  return foodDisplayNameForMode(food, state.foodNameMode);
}


function normalizeText(text) {
  return String(text || '').toLowerCase().replace(/[\u0300-\u036f]/g, '').replace(/[，。；：、()（）/_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function hasKeyword(text, keywords) {
  return keywords.some((keyword) => text.includes(normalizeText(keyword)));
}

function resolveGitHubSnapshot(raw = {}) {
  return {
    owner: String(raw.owner || DEFAULT_GITHUB.owner || 'kawhikun').trim() || 'kawhikun',
    repo: String(raw.repo || DEFAULT_GITHUB.repo || 'haochijia').trim() || 'haochijia',
    branch: String(raw.branch || DEFAULT_GITHUB.branch || 'main').trim() || 'main',
    path: String(raw.path || DEFAULT_GITHUB.path || 'data/haochijia-user.json').trim() || 'data/haochijia-user.json',
    token: String(raw.token || '').trim(),
    autoSync: Boolean(raw.autoSync),
    lastSyncAt: String(raw.lastSyncAt || ''),
    lastSyncStatus: String(raw.lastSyncStatus || ''),
  };
}



function normalizeFoodLabels(raw) {
  const source = raw?.labels ? raw.labels : raw || {};
  const name = String(raw?.name || raw?.label || raw?.z || raw?.n || '').trim();
  const original = String(source.original || raw?.n || raw?.name || raw?.label || name || '').trim();
  const zh = String(source.zh || raw?.z || raw?.name || raw?.label || original || '').trim();
  const explicitEn = String(source.en || '').trim();
  const en = explicitEn || (/[A-Za-z]/.test(original) ? original : (/[A-Za-z]/.test(name) ? name : ''));
  return {
    zh: zh || original || en || name || '未命名食品',
    en: en || original || zh || name || 'Unnamed food',
    original: original || zh || en || name || 'Unnamed food',
  };
}



function buildCustomFoodLabels(name, raw = {}) {
  const labels = normalizeFoodLabels({ ...raw, name, label: name, labels: raw.labels || {} });
  if (!labels.en && /[A-Za-z]/.test(name)) labels.en = name;
  return labels;
}



function classifyFoodLibrary(food) {
  const labels = normalizeFoodLabels(food);
  const raw = `${labels.original} ${food?.b || ''} ${food?.g || ''}`;
  if (/[ぁ-ゟ゠-ヿㇰ-ㇿ]/.test(raw) || /[\uac00-\ud7af]/.test(raw)) return 'intl';
  if (/[\u4e00-\u9fff]/.test(raw)) return 'cn';
  return 'intl';
}



function foodDisplayNameForMode(food, mode = state.foodNameMode) {
  const labels = normalizeFoodLabels(food);
  const safeMode = FOOD_NAME_MODE_OPTIONS.has(mode) ? mode : 'zh';
  return String(labels[safeMode] || labels.zh || labels.original || labels.en || food?.name || food?.n || '未命名食品');
}



function foodSecondaryName(food, mode = state.foodNameMode) {
  return foodAltNames(food, mode).join(' / ');
}



function buildFoodSearchText(food) {
  const labels = normalizeFoodLabels(food);
  return normalizeText([
    labels.zh,
    labels.en,
    labels.original,
    food?.code || food?.c || '',
    food?.b || '',
    food?.g || '',
    food?.q || '',
    food?.z || '',
    food?.n || '',
    food?.labels?.es || '',
  ].join(' '));
}



function foodPool() {
  const libs = activeFoodLibraries();
  const customFoods = state.customFoods
    .map((food) => prepareFood(food, food.library || classifyFoodLibrary(food)))
    .filter((food) => state.foodLibrary === 'all' || food.library === state.foodLibrary);
  const libraryFoods = libs.flatMap((lib) => state.foodBanks?.[lib] || []);
  return [...customFoods, ...libraryFoods];
}



function renderFilterButtons() {
  DOM.foodRegionGroup?.querySelectorAll('[data-food-region]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.foodRegion === state.foodLibrary);
  });
  DOM.foodLanguageGroup?.querySelectorAll('[data-food-lang]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.foodLang === state.foodNameMode);
  });
}



function renderLocalBackupMeta() {
  if (!DOM.localBackupMeta) return;
  const list = Array.isArray(state.localBackupMeta) ? state.localBackupMeta : [];
  if (!list.length) {
    DOM.localBackupMeta.textContent = '本地三重兜底：localStorage + IndexedDB + 最近备份';
    return;
  }
  DOM.localBackupMeta.textContent = `本地三重兜底 · 最近 ${list.length} 份 · 最新 ${formatDateTime(list[0].updatedAt)}`;
}



function ringLayoutPoints(width, height) {
  const small = width < 392;
  const midY = small ? 0.42 : 0.41;
  return [
    { x: width * (small ? 0.18 : 0.17), y: height * 0.17 },
    { x: width * (small ? 0.82 : 0.83), y: height * 0.17 },
    { x: width * (small ? 0.90 : 0.91), y: height * midY },
    { x: width * (small ? 0.82 : 0.83), y: height * 0.77 },
    { x: width * (small ? 0.18 : 0.17), y: height * 0.77 },
    { x: width * (small ? 0.10 : 0.09), y: height * midY },
  ];
}



function activeFoodLibraries() {
  return state.foodLibrary === 'cn' ? ['cn'] : state.foodLibrary === 'intl' ? ['intl'] : ['cn', 'intl'];
}



function libraryTagLabel(library) {
  return library === 'cn' ? '中文库' : '国际库';
}



function foodBankSummaryText() {
  const cnCount = state.foodBankCounts?.cn || 0;
  const intlCount = state.foodBankCounts?.intl || 0;
  const customCount = state.customFoods.length;
  if (state.foodLibrary === 'cn') return `中文库 ${cnCount.toLocaleString('zh-CN')} 条 · 常用 ${customCount}`;
  if (state.foodLibrary === 'intl') return `国际库 ${intlCount.toLocaleString('zh-CN')} 条 · 常用 ${customCount}`;
  return `双食品库 · 中文 ${cnCount.toLocaleString('zh-CN')} · 国际 ${intlCount.toLocaleString('zh-CN')} · 常用 ${customCount}`;
}



function mergeFoodBanks() {
  const libs = activeFoodLibraries();
  state.foods = libs.flatMap((lib) => state.foodBanks?.[lib] || []);
  state.foodsLoaded = libs.every((lib) => Boolean(state.foodBankLoaded?.[lib]));
  return state.foods;
}



async function ensureFoodBankLoaded(library) {
  const files = V32_FOOD_BANK_FILES[library];
  if (!files?.length) return [];
  if (state.foodBankLoaded?.[library]) return state.foodBanks[library] || [];
  if (state.foodBankPromises?.[library]) return state.foodBankPromises[library];
  state.foodBankPromises[library] = (async () => {
    const foods = [];
    for (let i = 0; i < files.length; i += 1) {
      if (DOM.foodSearchStatus) {
        DOM.foodSearchStatus.textContent = `${libraryTagLabel(library)}加载中 · ${i + 1}/${files.length}`;
      }
      const response = await fetch(files[i], { cache: 'force-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const chunk = await response.json();
      const list = Array.isArray(chunk) ? chunk : [];
      foods.push(...list.map((food) => prepareFood(food, library)));
    }
    state.foodBanks[library] = foods;
    state.foodBankCounts[library] = foods.length;
    state.foodBankLoaded[library] = true;
    state.foodBankPromises[library] = null;
    mergeFoodBanks();
    return foods;
  })().catch((error) => {
    state.foodBankPromises[library] = null;
    throw error;
  });
  return state.foodBankPromises[library];
}



async function ensureAllFoodBanksLoaded() {
  await Promise.all(['cn', 'intl'].map((lib) => ensureFoodBankLoaded(lib)));
  mergeFoodBanks();
  return [...(state.foodBanks.cn || []), ...(state.foodBanks.intl || [])];
}



function foodAltNames(food, mode = state.foodNameMode) {
  const labels = normalizeFoodLabels(food);
  const primary = normalizeText(foodDisplayNameForMode(food, mode));
  const candidates = mode === 'zh'
    ? [labels.en, labels.original]
    : mode === 'en'
      ? [labels.zh, labels.original]
      : [labels.zh, labels.en];
  const out = [];
  candidates.forEach((value) => {
    const text = String(value || '').trim();
    if (!text) return;
    if (normalizeText(text) === primary) return;
    if (out.some((item) => normalizeText(item) === normalizeText(text))) return;
    out.push(text);
  });
  return out.slice(0, 2);
}



function loadImageSource(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('图片读取失败'));
    img.src = src;
  });
}



async function estimatePhotoShapeFromDataUrl(dataUrl) {
  const img = await loadImageSource(dataUrl);
  const width = 240;
  const height = Math.max(360, Math.round((img.naturalHeight || img.height || 1) / (img.naturalWidth || img.width || 1) * width));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height).data;
  const gray = new Float32Array(width * height);
  for (let i = 0; i < gray.length; i += 1) {
    const idx = i * 4;
    gray[i] = imageData[idx] * 0.299 + imageData[idx + 1] * 0.587 + imageData[idx + 2] * 0.114;
  }
  const borderPixels = [];
  for (let x = 0; x < width; x += 1) {
    borderPixels.push(gray[x], gray[(height - 1) * width + x]);
  }
  for (let y = 0; y < height; y += 1) {
    borderPixels.push(gray[y * width], gray[y * width + width - 1]);
  }
  const borderAvg = borderPixels.reduce((sum, value) => sum + value, 0) / Math.max(1, borderPixels.length);
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < gray.length; i += 1) {
    mask[i] = Math.abs(gray[i] - borderAvg) > 18 ? 1 : 0;
  }
  const hit = (x, y) => {
    let sum = 0;
    for (let ry = -2; ry <= 2; ry += 1) {
      for (let rx = -1; rx <= 1; rx += 1) {
        const xx = clamp(Math.round(x + rx), 0, width - 1);
        const yy = clamp(Math.round(y + ry), 0, height - 1);
        sum += mask[yy * width + xx];
      }
    }
    return sum >= 4;
  };
  const centerX = Math.round(width / 2);
  const scanWidthAt = (ratio) => {
    const y = clamp(Math.round(height * ratio), 4, height - 4);
    let left = centerX;
    let right = centerX;
    while (left > 2 && !hit(left, y)) left -= 1;
    while (left > 2 && hit(left - 1, y)) left -= 1;
    while (right < width - 3 && !hit(right, y)) right += 1;
    while (right < width - 3 && hit(right + 1, y)) right += 1;
    return Math.max(10, right - left);
  };
  const rowMass = new Array(height).fill(0).map((_, y) => {
    let count = 0;
    for (let x = 0; x < width; x += 1) count += mask[y * width + x];
    return count;
  });
  const top = rowMass.findIndex((count) => count > width * 0.08);
  const bottom = (() => {
    for (let y = height - 1; y >= 0; y -= 1) if (rowMass[y] > width * 0.08) return y;
    return height - 1;
  })();
  const bodyHeight = Math.max(1, bottom - Math.max(0, top));
  const shoulderW = scanWidthAt(0.27);
  const chestW = scanWidthAt(0.38);
  const waistW = scanWidthAt(0.54);
  const hipW = scanWidthAt(0.66);
  const legW = scanWidthAt(0.82);
  const torsoBase = Math.max(chestW, hipW, 1);
  const mapRatio = (value, min, max) => clamp(Math.round(100 + (value - min) / Math.max(0.0001, max - min) * 18), 84, 122);
  const shoulder = mapRatio(shoulderW / torsoBase, 0.86, 1.12);
  const chest = mapRatio(chestW / torsoBase, 0.88, 1.08);
  const waist = clamp(Math.round(104 - ((waistW / torsoBase) - 0.76) * 40), 82, 118);
  const hip = mapRatio(hipW / torsoBase, 0.86, 1.12);
  const arm = clamp(Math.round(100 + ((shoulderW - chestW) / Math.max(1, torsoBase)) * 40), 84, 118);
  const leg = clamp(Math.round(92 + ((bottom - height * 0.58) / Math.max(1, bodyHeight)) * 28 + ((legW / torsoBase) - 0.44) * 20), 88, 118);
  if (![shoulder, chest, waist, hip, arm, leg].every((value) => Number.isFinite(value))) return null;
  return {
    shoulder: shoulder / 100,
    chest: chest / 100,
    waist: waist / 100,
    hip: hip / 100,
    arm: arm / 100,
    leg: leg / 100,
    hasPhoto: true,
  };
}



async function autoEstimatePhotoShape() {
  if (!state.photoRefUrl) {
    DOM.photoShapeMeta.textContent = '请先上传正面全身照';
    return;
  }
  DOM.photoShapeMeta.textContent = '正在估测轮廓…';
  try {
    const estimated = await estimatePhotoShapeFromDataUrl(state.photoRefUrl);
    if (!estimated) throw new Error('轮廓不足');
    state.photoShape = { ...normalizePhotoShape(state.photoShape), ...estimated };
    fillPhotoDialog();
    renderAll();
    DOM.photoShapeMeta.textContent = '已根据照片轮廓自动估测，可继续微调';
  } catch (error) {
    DOM.photoShapeMeta.textContent = `自动估测失败：${error.message}`;
  }
}



function exportBodyJson() {
  const payload = {
    version: V32_BUILD_VERSION,
    updatedAt: new Date().toISOString(),
    profile: {
      ...readProfileForm(),
      bodyFat: clamp(Number(DOM.profileForm.bodyFat.value) || 22, 2, 60),
      focusNote: String(DOM.profileForm.focusNote.value || '').trim().slice(0, 120),
    },
    photoShape: state.photoShape,
    bodyHistory: normalizeBodyHistory(state.bodyHistory),
  };
  downloadJson(payload, `haochijia-body-${compactDateTime()}.json`);
}



function exportIntakeCsv() {
  const rows = [[
    'date', 'time', 'label', 'zh', 'en', 'original', 'library', 'code', 'grams',
    'kcal', 'protein', 'carbs', 'fat', 'fiber', 'calcium', 'iron'
  ].join(',')];
  const days = Object.keys(state.logs || {}).sort();
  days.forEach((date) => {
    const items = state.logs?.[date]?.items || [];
    items.forEach((item) => {
      const labels = normalizeFoodLabels(item);
      rows.push([
        csvEscape(date),
        csvEscape(item.createdAt || ''),
        csvEscape(item.label || labels.zh || ''),
        csvEscape(labels.zh || ''),
        csvEscape(labels.en || ''),
        csvEscape(labels.original || ''),
        csvEscape(item.library || ''),
        csvEscape(item.code || ''),
        csvEscape(item.grams ?? ''),
        csvEscape(item.nutrients?.kcal ?? ''),
        csvEscape(item.nutrients?.protein ?? ''),
        csvEscape(item.nutrients?.carbs ?? ''),
        csvEscape(item.nutrients?.fat ?? ''),
        csvEscape(item.nutrients?.fiber ?? ''),
        csvEscape(item.nutrients?.calcium ?? ''),
        csvEscape(item.nutrients?.iron ?? ''),
      ].join(','));
    });
  });
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `haochijia-intake-${compactDateTime()}.csv`);
}



async function pushLocalBackup(snapshot) {
  const existing = await idbGet(V32_IDB_BACKUP_KEY).catch(() => []);
  const list = Array.isArray(existing) ? existing : [];
  const safe = {
    ...snapshot,
    ...(state.photoRefUrl ? { photoRefUrl: state.photoRefUrl } : {}),
    github: { ...(snapshot.github || {}), token: '' },
  };
  const next = [safe, ...list.filter((item) => item.updatedAt !== safe.updatedAt)].slice(0, LOCAL_BACKUP_LIMIT);
  state.localBackupMeta = next;
  await idbSet(V32_IDB_BACKUP_KEY, next).catch(() => null);
}


async function restoreLatestLocalBackup() {
  const list = Array.isArray(state.localBackupMeta) && state.localBackupMeta.length
    ? state.localBackupMeta
    : await idbGet(V32_IDB_BACKUP_KEY).catch(() => []);
  if (!Array.isArray(list) || !list.length) {
    DOM.bodyStatusHint.textContent = '没有可恢复的本地备份';
    return;
  }
  importJsonSnapshot(JSON.stringify(list[0]), 'all');
  DOM.bodyStatusHint.textContent = '已恢复最近本地备份';
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

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register(`./sw.js?v=${encodeURIComponent(V32_BUILD_VERSION)}`);
    reg.update?.().catch(() => null);
    return reg;
  } catch (error) {
    console.warn('[haochijia] service worker register failed.', error);
    return null;
  }
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
