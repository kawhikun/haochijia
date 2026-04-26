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
} from './nutrition-refs.js?v=20260426i';
import { buildSmartFoodLabels } from './food-label-upgrade.js?v=20260426i';
import { createBodyModelController } from './model-scene.js?v=20260426i';

const STORAGE_KEY = 'haochijia.core.v39.snapshot';
const DB_NAME = 'haochijia-core-v39';
const DB_STORE = 'kv';
const IDB_SNAPSHOT_KEY = 'snapshot';
const IDB_PHOTO_KEY = 'photoRef';
const MAX_BODY_HISTORY = Number.MAX_SAFE_INTEGER;
const MAX_LOG_ITEMS_PER_DAY = Number.MAX_SAFE_INTEGER;
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
const FOOD_TRANSLATION_PHRASES = Object.freeze([
  ['greek yogurt', '希腊酸奶'], ['plain yogurt', '原味酸奶'], ['whole milk yogurt', '全脂酸奶'], ['low fat yogurt', '低脂酸奶'],
  ['whole milk', '全脂牛奶'], ['skim milk', '脱脂牛奶'], ['low fat milk', '低脂牛奶'], ['soy milk', '豆奶'], ['oat milk', '燕麦奶'], ['almond milk', '杏仁奶'],
  ['chicken breast', '鸡胸肉'], ['chicken thigh', '鸡腿肉'], ['ground beef', '牛肉末'], ['beef steak', '牛排'], ['pork belly', '五花肉'], ['pork loin', '猪里脊'],
  ['salmon fillet', '三文鱼排'], ['tuna steak', '金枪鱼排'], ['cod fillet', '鳕鱼排'], ['shrimp', '虾仁'], ['prawn', '大虾'], ['sardine', '沙丁鱼'],
  ['sweet potato', '红薯'], ['potato chips', '薯片'], ['mashed potato', '土豆泥'], ['brown rice', '糙米饭'], ['white rice', '白米饭'], ['rice noodle', '米粉'],
  ['whole wheat bread', '全麦面包'], ['white bread', '白面包'], ['oatmeal', '燕麦粥'], ['rolled oats', '燕麦片'], ['granola', '格兰诺拉麦片'],
  ['apple juice', '苹果汁'], ['orange juice', '橙汁'], ['tomato sauce', '番茄酱'], ['peanut butter', '花生酱'], ['olive oil', '橄榄油'], ['canola oil', '菜籽油'],
  ['ice cream', '冰淇淋'], ['cream cheese', '奶油奶酪'], ['cheddar cheese', '切达奶酪'], ['mozzarella cheese', '马苏里拉奶酪'], ['cottage cheese', '茅屋奶酪'],
  ['protein powder', '蛋白粉'], ['whey protein', '乳清蛋白'], ['energy bar', '能量棒'], ['protein bar', '蛋白棒'], ['dark chocolate', '黑巧克力'],
  ['black beans', '黑豆'], ['kidney beans', '芸豆'], ['chickpeas', '鹰嘴豆'], ['lentils', '扁豆'], ['tofu', '豆腐'], ['firm tofu', '老豆腐'], ['silken tofu', '嫩豆腐'],
  ['broccoli', '西兰花'], ['spinach', '菠菜'], ['kale', '羽衣甘蓝'], ['lettuce', '生菜'], ['mushroom', '蘑菇'], ['blueberry', '蓝莓'], ['strawberry', '草莓'],
  ['banana', '香蕉'], ['apple', '苹果'], ['orange', '橙子'], ['avocado', '牛油果'], ['walnut', '核桃'], ['almond', '杏仁'], ['cashew', '腰果'],
  ['instant noodles', '方便面'], ['noodles', '面条'], ['dumpling', '饺子'], ['wonton', '馄饨'], ['pizza', '披萨'], ['hamburger', '汉堡'], ['sandwich', '三明治']
]);

const FOOD_TRANSLATION_TOKENS = Object.freeze({
  plain: '原味', unsweetened: '无糖', sweetened: '加糖', original: '原味', classic: '经典', roasted: '烘烤', baked: '烘焙', fried: '油炸', steamed: '清蒸', boiled: '水煮',
  smoked: '烟熏', grilled: '烤制', spicy: '辣味', hot: '辣味', mild: '微辣', fresh: '新鲜', frozen: '冷冻', canned: '罐装', dried: '干制', organic: '有机', natural: '天然',
  whole: '全', low: '低', skim: '脱脂', fat: '脂', reduced: '减', free: '无', sugar: '糖', salted: '含盐', unsalted: '无盐', light: '轻盈', premium: '优选',
  chicken: '鸡肉', beef: '牛肉', pork: '猪肉', lamb: '羊肉', fish: '鱼肉', salmon: '三文鱼', tuna: '金枪鱼', cod: '鳕鱼', turkey: '火鸡肉', egg: '鸡蛋', eggs: '鸡蛋',
  yogurt: '酸奶', milk: '牛奶', cheese: '奶酪', butter: '黄油', cream: '奶油', rice: '米饭', noodle: '面', noodles: '面条', pasta: '意面', bread: '面包', oats: '燕麦', oat: '燕麦', cereal: '谷物片',
  potato: '土豆', tomatoes: '番茄', tomato: '番茄', beans: '豆类', bean: '豆', peas: '豌豆', pea: '豌豆', lentils: '扁豆', chickpeas: '鹰嘴豆', tofu: '豆腐',
  broccoli: '西兰花', spinach: '菠菜', kale: '羽衣甘蓝', lettuce: '生菜', cabbage: '卷心菜', mushroom: '蘑菇', mushrooms: '蘑菇', carrot: '胡萝卜', carrots: '胡萝卜', onion: '洋葱', garlic: '大蒜',
  apple: '苹果', apples: '苹果', banana: '香蕉', bananas: '香蕉', blueberry: '蓝莓', blueberries: '蓝莓', strawberry: '草莓', strawberries: '草莓', orange: '橙子', oranges: '橙子', avocado: '牛油果',
  walnut: '核桃', walnuts: '核桃', almond: '杏仁', almonds: '杏仁', peanut: '花生', peanuts: '花生', sesame: '芝麻', chocolate: '巧克力', coffee: '咖啡', tea: '茶', juice: '果汁', water: '水',
  sauce: '酱', soup: '汤', powder: '粉', snack: '零食', bar: '棒', biscuit: '饼干', cookies: '曲奇', cookie: '曲奇', cracker: '薄脆饼', chips: '薯片'
});

const FOOD_TRANSLATION_STOPWORDS = new Set(['and', 'with', 'without', 'for', 'the', 'a', 'an', 'de', 'des', 'la', 'le', 'du', 'di', 'al', 'style']);
const OCR_PASS_MODES = ['smart', 'highContrast', 'original'];
const MEAL_BUCKETS = [
  { key: 'breakfast', label: '早餐', start: 5, end: 10.5 },
  { key: 'lunch', label: '午餐', start: 10.5, end: 14.5 },
  { key: 'afternoon', label: '加餐', start: 14.5, end: 18 },
  { key: 'dinner', label: '晚餐', start: 18, end: 22 },
  { key: 'night', label: '夜间', start: 22, end: 29 },
];

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
  version: 'v41',
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
  photoShapePreview: null,
  model: null,
  persistGranted: false,
  githubSyncTimer: null,
};

const V32_BUILD_VERSION = 'v41-lite-standard-body-performance-fix';
const V32_STORAGE_KEYS = [STORAGE_KEY, 'haochijia.core.v38.snapshot', 'haochijia.core.v37.snapshot', 'haochijia.core.v36.snapshot', 'haochijia.core.v34.snapshot', 'haochijia.core.v33.snapshot', 'haochijia.core.v32.snapshot', 'haochijia.core.v31.snapshot'];
const V32_IDB_SNAPSHOT_KEYS = ['snapshot-v39', 'snapshot-v38', 'snapshot-v37', 'snapshot-v36', 'snapshot-v34', 'snapshot-v33', 'snapshot-v32', 'snapshot'];
const V32_IDB_BACKUP_KEY = 'snapshot-history-v39';
const LOCAL_BACKUP_LIMIT = 18;
const FOOD_REGION_OPTIONS = new Set(['all', 'cn', 'intl']);
const FOOD_NAME_MODE_OPTIONS = new Set(['zh', 'en', 'original']);
const V32_FOOD_BANK_FILES = Object.freeze({
  cn: ['./data/foods-cn.min.json?v=20260426i'],
  intl: ['./data/foods-global.part01.min.json?v=20260426i', './data/foods-global.part02.min.json?v=20260426i'],
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
      onModelAssetReady: () => {
        if (DOM.bodyStatusHint) DOM.bodyStatusHint.textContent = '已接入内嵌标准人体网格；胸腰臀、四肢和体型输入会实时塑形';
        if (DOM.focusModePill) DOM.focusModePill.textContent = '标准人体模型 · 营养环联动';
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
  const ids = [    'appShell', 'platformBadge', 'menuBtn', 'heroStage', 'bodyCanvas', 'stagePhotoRef', 'focusModePill', 'focusModeText', 'ringOrbit',
    'profileCard', 'profileCardBody', 'toggleProfileCardBtn', 'measureCard', 'measureCardBody', 'toggleBodyCardBtn',
    'profileForm', 'bodyForm', 'bodyStatusHint', 'importBodyBtn', 'quickExportBtn', 'saveBodyBtn', 'photoShapeBtn', 'suggestionSummary', 'suggestionCards', 'featureAuditList',
    'bodyHistoryList', 'bodyHistoryMeta', 'foodSearchStatus', 'foodAuditStrip', 'foodSearchInput', 'foodAmountInput', 'foodSearchResults', 'customFoodForm', 'customFoodName', 'customFoodNameEn', 'customFoodCode', 'customFoodBrand', 'customFoodServing', 'saveCustomFoodBtn', 'clearCustomFoodFormBtn', 'customFoodList', 'captureInput',
    'runBarcodeBtn', 'runOcrBtn', 'runSmartCaptureBtn', 'capturePreview', 'captureStatus', 'captureResult', 'captureFoodName', 'captureBasis', 'captureServingSize',
    'captureServings', 'captureNutrients', 'addCaptureFoodBtn', 'saveCaptureFoodBtn', 'progressList', 'dayTotalBadge', 'activeDateInput', 'prevDayBtn', 'nextDayBtn', 'todayBtn', 'quickWaterBtn', 'logList', 'clearDayBtn',
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
  DOM.toggleProfileCardBtn?.addEventListener('click', () => toggleCollapseCard('profile'));
  DOM.toggleBodyCardBtn?.addEventListener('click', () => toggleCollapseCard('body'));

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
  DOM.runSmartCaptureBtn?.addEventListener('click', runSmartCapture);
  DOM.captureBasis.addEventListener('change', renderCaptureResult);
  DOM.addCaptureFoodBtn.addEventListener('click', addCaptureFoodToToday);
  DOM.saveCaptureFoodBtn.addEventListener('click', saveCaptureFoodToLibrary);

  DOM.logList.addEventListener('click', onLogListClick);
  DOM.bodyHistoryList.addEventListener('click', onBodyHistoryClick);
  DOM.activeDateInput?.addEventListener('change', () => setActiveDate(DOM.activeDateInput.value));
  DOM.prevDayBtn?.addEventListener('click', () => shiftActiveDate(-1));
  DOM.nextDayBtn?.addEventListener('click', () => shiftActiveDate(1));
  DOM.todayBtn?.addEventListener('click', () => setActiveDate(todayString()));
  DOM.quickWaterBtn?.addEventListener('click', () => addWaterToToday(250));
  DOM.clearDayBtn.addEventListener('click', clearTodayLog);

  DOM.photoInput.addEventListener('change', onPhotoSelected);
  ['shapeShoulder', 'shapeChest', 'shapeWaist', 'shapeHip', 'shapeArm', 'shapeLeg'].forEach((id) => {
    DOM[id].addEventListener('input', previewPhotoShapeFromDialog);
  });
  DOM.photoDialog?.addEventListener('close', () => {
    state.photoShapePreview = null;
    renderAll();
  });
  DOM.photoDialog?.addEventListener('cancel', () => {
    state.photoShapePreview = null;
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

function normalizeBodyHistory(history) {
  const seen = new Set();
  const records = Array.isArray(history)
    ? history.map(normalizeBodyRecord).filter(Boolean)
    : [];
  const deduped = [];
  records
    .sort((a, b) => String(b.recordDate || b.recordedAt).localeCompare(String(a.recordDate || a.recordedAt)))
    .forEach((record) => {
      const key = record.recordDate || dateKeyFromTimestamp(record.recordedAt) || String(record.recordedAt || '');
      if (seen.has(key)) return;
      seen.add(key);
      deduped.push(record);
    });
  return deduped;
}

function normalizeBodyRecord(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const recordDate = normalizeDateKey(raw.recordDate || raw.date || dateKeyFromTimestamp(raw.recordedAt), todayString());
  const boundary = dayBoundaryFor(recordDate);
  const upperArm = Number.isFinite(Number(raw.upperArm)) ? Number(raw.upperArm) : averageOrNull(raw.upperArmL, raw.upperArmR);
  const forearm = Number.isFinite(Number(raw.forearm)) ? Number(raw.forearm) : averageOrNull(raw.forearmL, raw.forearmR);
  const thigh = Number.isFinite(Number(raw.thigh)) ? Number(raw.thigh) : averageOrNull(raw.thighL, raw.thighR);
  const calf = Number.isFinite(Number(raw.calf)) ? Number(raw.calf) : averageOrNull(raw.calfL, raw.calfR);
  const ankle = Number.isFinite(Number(raw.ankle)) ? Number(raw.ankle) : averageOrNull(raw.ankleL, raw.ankleR);
  return {
    recordDate: boundary.recordDate,
    dayStart: raw.dayStart || boundary.dayStart,
    dayEnd: raw.dayEnd || boundary.dayEnd,
    recordedAt: raw.recordedAt || timestampForRecordDate(boundary.recordDate),
    updatedAt: raw.updatedAt || raw.recordedAt || timestampForRecordDate(boundary.recordDate),
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
    const key = normalizeDateKey(entry?.recordDate || date, todayString());
    const boundary = dayBoundaryFor(key);
    const items = Array.isArray(entry?.items)
      ? entry.items.map((item) => normalizeLogItem(item, key)).filter(Boolean)
      : [];
    if (!items.length) return;
    if (!out[key]) out[key] = { ...boundary, items: [] };
    out[key].items.push(...items);
  });
  Object.values(out).forEach((entry) => {
    entry.items.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  });
  return out;
}

function normalizeLogItem(raw, recordDateHint = '') {
  if (!raw || typeof raw !== 'object') return null;
  const labels = normalizeFoodLabels(raw);
  const key = normalizeDateKey(raw.recordDate || raw.date || recordDateHint || dateKeyFromTimestamp(raw.createdAt), todayString());
  const boundary = dayBoundaryFor(key);
  return {
    id: raw.id || uid('log'),
    createdAt: raw.createdAt || timestampForRecordDate(boundary.recordDate),
    recordDate: boundary.recordDate,
    dayStart: raw.dayStart || boundary.dayStart,
    dayEnd: raw.dayEnd || boundary.dayEnd,
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
  renderDailyToolbar();
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
  const recordDate = todayString();
  const boundary = dayBoundaryFor(recordDate);
  return normalizeBodyRecord({
    recordDate: boundary.recordDate,
    dayStart: boundary.dayStart,
    dayEnd: boundary.dayEnd,
    recordedAt: timestampForRecordDate(boundary.recordDate),
    updatedAt: new Date().toISOString(),
    heightCm: state.profile.heightCm,
    weightKg: state.profile.weightKg,
    bodyFat: finiteOrNull(DOM.profileForm.bodyFat.value),
    ...body,
  });
}

function getActivePhotoShape() {
  return normalizePhotoShape(state.photoShapePreview || state.photoShape || {});
}

function buildModelRecord() {
  const record = buildCurrentBodyRecord();
  const shape = getActivePhotoShape();
  return {
    ...record,
    sex: state.profile.sex,
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
    shapeShoulder: shape.shoulder,
    shapeChest: shape.chest,
    shapeWaist: shape.waist,
    shapeHip: shape.hip,
    shapeArm: shape.arm,
    shapeLeg: shape.leg,
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
  const shape = getActivePhotoShape();
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
    shapeShoulder: shape.shoulder,
    shapeChest: shape.chest,
    shapeWaist: shape.waist,
    shapeHip: shape.hip,
    shapeArm: shape.arm,
    shapeLeg: shape.leg,
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
  }, 55);
}

function renderHeroMeta() {
  const platformText = state.platform.key === 'ios' ? 'iPhone 标准模型' : state.platform.key === 'android' ? 'Android 标准模型' : '标准人体模型';
  DOM.focusModePill.textContent = `${platformText} · 营养环联动`;
  DOM.focusModeText.textContent = `${nutrientDisplayName(state.activeRing)} 高亮 · 标准人体网格实时塑形 · 拖旋 / 缩放 / 双击回正`;
}

function renderHeroTelemetry() {
  // v41: 模型界面不再显示体重、BMI、腰臀比、目标热量、蛋白、水分这 6 个指标浮层，避免遮挡营养环。
  if (DOM.heroTelemetry) {
    DOM.heroTelemetry.innerHTML = '';
    DOM.heroTelemetry.hidden = true;
  }
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
    button.style.transform = 'translate(-50%, -50%) scale(var(--ring-scale, 1))';
    button.style.width = `${size}px`;
    button.style.height = `${size}px`;
    button.style.setProperty('--ring-color', ring.color);
    button.style.setProperty('--ring-pct', `${Math.max(0, Math.min(100, ring.percent))}%`);
    button.style.setProperty('--float-delay', `${index * -2.1}s`);
    button.style.setProperty('--float-duration', `${18 + (index % 3) * 3}s`);
    button.style.setProperty('--ring-scale', active ? '1.12' : ring.focus ? '1.06' : '1');
    button.style.setProperty('--orbit-x', `${index % 2 === 0 ? 6 : -6}px`);
    button.style.setProperty('--orbit-y', `${index < 3 ? -5 : 5}px`);
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
  DOM.suggestionSummary.textContent = state.focusMode.label + ' · 科学建议 ' + cards.length + ' 条 · 基于今日与历史摄入参考更新';
  const cardsHtml = cards.map((card) =>
    '<article class="suggestion-card ' + escapeHtml(card.priorityClass || '') + '">' +
      '<strong>' + escapeHtml(card.title) + '</strong>' +
      '<div class="history-meta">' + escapeHtml(card.subtitle) + '</div>' +
      '<div class="suggestion-action"><span>行动</span>' + escapeHtml(card.action) + '</div>' +
      '<div class="suggestion-basis">' + escapeHtml(card.basis) + '</div>' +
      '<div class="suggestion-foods">' + escapeHtml(card.foods.join(' · ')) + '</div>' +
    '</article>'
  ).join('');
  const adviceHtml = renderAdviceBasisPanel();
  DOM.suggestionCards.innerHTML = cardsHtml || adviceHtml ? cardsHtml + adviceHtml : '<div class="empty-state">暂无建议</div>';
}

function renderAdviceBasisPanel() {
  const notes = Array.isArray(state.calc?.notes) ? state.calc.notes.slice(0, 7) : [];
  const basisRows = Array.isArray(state.calc?.basisRows)
    ? state.calc.basisRows.filter((row) => ['BMI', '生理状态', '生理周期', '关节关注', '糖代谢状态', '当前蛋白建议', '目标热量'].includes(row.label)).slice(0, 8)
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
  const ids = Array.from(new Set([...state.focusMode.nutrientIds.slice(3), 'protein', 'fiber', 'water', 'sodium', 'satFat'])).filter((id) => state.calc.targets[id]);
  const cards = ids.map((id) => {
    const target = state.calc.targets[id];
    const current = Number(state.totals[id] || 0);
    const goal = targetValue(target);
    const progress = progressForTarget(target, current);
    const deficit = target.type === 'max' ? Math.max(0, current - goal) : Math.max(0, goal - current);
    const relevance = target.type === 'max'
      ? (progress > 1 ? 130 + progress * 24 : Math.max(0, progress - 0.75) * 42)
      : ((1 - Math.min(progress, 1.35)) * 100 + (state.focusMode.nutrientIds.includes(id) ? 16 : 0));
    const hintFoods = NUTRIENT_HINTS[id] || ['优先真实食物', '分次摄入', '连续记录'];
    const historyReference = historicalIntakeReference(id, target, 7);
    const percent = Math.round(progress * 100);
    const title = nutrientDisplayName(id) + ' ' + percent + '%';
    let subtitle = '目标 ' + formatCompactNutrient(id, goal) + ' · 已摄入 ' + formatCompactNutrient(id, current);
    let action = '保持记录，下一餐按缺口微调。';
    let priorityClass = 'priority-watch';
    if (target.type === 'max') {
      if (progress > 1) {
        priorityClass = 'priority-high';
        subtitle = '当前偏高，约多出 ' + formatCompactNutrient(id, deficit) + '。';
        action = (id === 'sodium' || id === 'satFat') ? '后续餐次选择少盐少酱、少油炸加工食品。' : '后续餐次降低高负荷来源，优先清淡搭配。';
      } else {
        priorityClass = progress > 0.85 ? 'priority-watch' : 'priority-ok';
        subtitle = '当前在上限 ' + formatCompactNutrient(id, goal) + ' 内。';
        action = '继续维持，避免单餐集中摄入。';
      }
    } else if (progress < 0.55) {
      priorityClass = 'priority-high';
      subtitle = '明显不足，约差 ' + formatCompactNutrient(id, deficit) + '。';
      action = '优先用正餐补一部分，再用加餐补剩余，不建议靠单一食物猛补。';
    } else if (progress < 0.95) {
      priorityClass = 'priority-watch';
      subtitle = '接近目标，还差 ' + formatCompactNutrient(id, deficit) + '。';
      action = '下一餐小幅补齐，兼顾蛋白、纤维和水分。';
    } else if (progress <= 1.2) {
      priorityClass = 'priority-ok';
      subtitle = '已基本达标。';
      action = '今天后续保持均衡，避免过量叠加。';
    } else {
      priorityClass = 'priority-watch';
      subtitle = '已明显超过建议值。';
      action = '后续餐次转向清淡、低负荷、含蔬菜的组合。';
    }
    if (id === 'protein') action += ' 蛋白质尽量分配到 3-4 餐。';
    if (id === 'fiber') action += ' 纤维增加时同步饮水，避免肠胃不适。';
    if (id === 'water') action += ' 分时段小口补水，不需要集中猛喝。';
    const basis = target.type === 'range'
      ? '依据：个人资料、生理状态、活动量与目标计算；推荐区间 ' + formatCompactNutrient(id, Number(target.min || 0)) + '-' + formatCompactNutrient(id, Number(target.max || goal)) + '，当前按优先目标 ' + formatCompactNutrient(id, goal) + ' 评估。'
      : '依据：个人资料与今日已记录摄入；' + (target.type === 'max' ? '按上限控制' : '按推荐目标补足') + '，每次输入都会重算。';
    return { id, relevance, title, subtitle, action, basis: basis + ' ' + historyReference, foods: hintFoods, priorityClass };
  }).sort((a, b) => b.relevance - a.relevance).slice(0, 6);
  return cards;
}

function historicalIntakeReference(id, target, lookbackDays = 7) {
  const values = [];
  for (let i = 1; i <= lookbackDays; i += 1) {
    const key = offsetDateString(state.activeDate, -i);
    const entry = state.logs?.[key];
    if (!entry?.items?.length) continue;
    const totals = computeTotalsForDate(key, { create: false });
    values.push(Number(totals[id] || 0));
  }
  if (!values.length) return '历史参考：近 7 天暂无有效摄入记录。';
  const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
  const met = values.filter((value) => intakeMeetsTarget(value, target)).length;
  return `历史参考：近 ${values.length} 个有记录日平均 ${formatCompactNutrient(id, avg)}，达标 ${met}/${values.length} 天。`;
}

function intakeMeetsTarget(value, target) {
  const number = Number(value || 0);
  if (!target) return false;
  if (target.type === 'max') return number <= Number(target.target || 0);
  if (target.type === 'range') {
    const min = Number(target.min || 0);
    const max = Number(target.max || target.preferred || 0);
    return number >= min && (!max || number <= max);
  }
  return number >= Number(target.target || 0);
}

function formatDateWindow(dateKey) {
  const key = normalizeDateKey(dateKey, '');
  return key ? `${key} 0:00-23:59` : '未记录日期';
}

function renderBodyHistory() {
  DOM.bodyHistoryMeta.textContent = `${state.bodyHistory.length} 个自然日 · 可全量导出`;
  if (!state.bodyHistory.length) {
    DOM.bodyHistoryList.innerHTML = '<div class="empty-state">先保存第一条身体记录</div>';
    return;
  }
  DOM.bodyHistoryList.innerHTML = state.bodyHistory.slice(0, 10).map((item, index) => `
    <article class="history-item">
      <strong>${escapeHtml(formatDateWindow(item.recordDate || dateKeyFromTimestamp(item.recordedAt)))}</strong>
      <div class="history-meta">${escapeHtml(bodyRecordSummary(item))}</div>
      <div class="history-meta">更新时间：${escapeHtml(formatDateTime(item.updatedAt || item.recordedAt))}</div>
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
    { ok: true, title: '中文 / 国际双食品库', meta: `${loadedText}；中文界面下优先显示完整中文名，国际库增加自动翻译兜底` },
    { ok: true, title: '用户自定义常用食品', meta: `已支持新增、编辑、删除、搜索优先和一键加入；当前 ${state.customFoods.length} 个` },
    { ok: true, title: '状态化营养建议', meta: `${state.focusMode.label}：基础资料、活动、训练、目标、糖代谢、生理期、骨关节与历史摄入共同参与，并按缺口/超量实时排序` },
    { ok: true, title: '生理期 / 骨关节建议', meta: '已增加周期、经量、经前不适、日晒、关节部位、关节不适入口' },
    { ok: true, title: '上传标准人体模型与照片塑形', meta: '已接入上传的标准男/女体型网格；胸腰臀、肩和四肢维度实时驱动模型变形，并支持照片滑杆预览' },
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
  const met = ids.filter((id) => {
    const target = state.calc.targets[id];
    const progress = progressForTarget(target, Number(state.totals[id] || 0));
    return target.type === 'max' ? progress <= 1 : progress >= 1;
  }).length;
  const kcalNow = round0(Number(state.totals.kcal || 0));
  DOM.dayTotalBadge.textContent = `${state.activeDate.replace(/-/g, '.')} · 达标 ${met}/${ids.length} · ${kcalNow} kcal`;
  DOM.progressList.innerHTML = ids.map((id) => {
    const target = state.calc.targets[id];
    const current = Number(state.totals[id] || 0);
    const progress = progressForTarget(target, current);
    const tone = toneForProgress(target, progress);
    const helper = progressStatusText(target, current);
    return `
      <article class="progress-item">
        <div class="progress-head">
          <strong>${escapeHtml(nutrientDisplayName(id))}</strong>
          <span class="progress-values ${tone}">${escapeHtml(formatCompactNutrient(id, current))} / ${escapeHtml(formatCompactNutrient(id, targetValue(target)))}</span>
        </div>
        <div class="progress-bar" style="--bar-pct:${Math.max(0, Math.min(100, progress * 100))}%; --bar-color:${RING_COLORS[id] || '#80a9ff'};"><span></span></div>
        <div class="history-meta">${escapeHtml(helper)}</div>
      </article>
    `;
  }).join('');
}

function logItemDisplayName(item) {
  return foodDisplayNameForMode(item, state.foodNameMode);
}



function renderDailyToolbar() {
  if (DOM.activeDateInput) DOM.activeDateInput.value = state.activeDate;
  if (DOM.todayBtn) DOM.todayBtn.classList.toggle('is-active', state.activeDate === todayString());
}

function daySummaryForItems(items) {
  const totals = items.reduce((acc, item) => mergeTotals(acc, item.nutrients || {}), createEmptyTotals());
  const yesterday = offsetDateString(state.activeDate, -1);
  const yesterdayKcal = Number(computeTotalsForDate(yesterday, { create: false })?.kcal || 0);
  const kcal = Number(totals.kcal || 0);
  const delta = yesterdayKcal ? kcal - yesterdayKcal : 0;
  return { totals, kcal, delta, count: items.length };
}

function renderLogList() {
  const items = getDayLog(state.activeDate).items;
  const summary = daySummaryForItems(items);
  const deltaText = summary.delta ? (summary.delta > 0 ? '+' : '') + Math.round(summary.delta) : '—';
  const summaryHtml =
    '<div class="daily-summary-grid">' +
      '<span><b>' + summary.count + '</b><em>记录条目</em></span>' +
      '<span><b>' + escapeHtml(formatCompactNutrient('kcal', summary.kcal)) + '</b><em>总热量</em></span>' +
      '<span><b>' + escapeHtml(formatCompactNutrient('protein', summary.totals.protein || 0)) + '</b><em>蛋白质</em></span>' +
      '<span><b>' + escapeHtml(formatCompactNutrient('water', summary.totals.water || 0)) + '</b><em>水分</em></span>' +
      '<span><b>' + escapeHtml(deltaText) + '</b><em>较前日 kcal</em></span>' +
    '</div>';
  if (!items.length) {
    DOM.logList.innerHTML = summaryHtml + '<div class="empty-state">这一天还没有记录，可搜索食品、拍营养表或一键加水。</div>';
    return;
  }
  const groups = {};
  items.forEach((item, index) => {
    const bucket = mealBucketForTime(item.createdAt);
    if (!groups[bucket.key]) groups[bucket.key] = { ...bucket, items: [], kcal: 0 };
    groups[bucket.key].items.push({ ...item, _index: index });
    groups[bucket.key].kcal += Number(item.nutrients?.kcal || 0);
  });
  const groupsHtml = MEAL_BUCKETS.filter((bucket) => groups[bucket.key]?.items?.length).map((bucket) => {
    const group = groups[bucket.key];
    const itemsHtml = group.items.map((item) => {
      const secondary = foodSecondaryName(item);
      const chips = ['protein', 'carbs', 'fat', 'fiber']
        .filter((id) => Number(item.nutrients?.[id] || 0) > 0)
        .map((id) => '<span>' + escapeHtml(nutrientDisplayName(id)) + ' ' + escapeHtml(formatCompactNutrient(id, item.nutrients[id])) + '</span>')
        .join('');
      return '<article class="log-item">' +
        '<strong>' + escapeHtml(logItemDisplayName(item)) + '</strong>' +
        (secondary ? '<div class="history-meta">' + escapeHtml(secondary) + '</div>' : '') +
        '<div class="log-meta">' + escapeHtml(formatTime(item.createdAt)) + (item.grams ? ' · ' + item.grams + 'g' : '') + ' · ' + escapeHtml(formatCompactNutrient('kcal', item.nutrients?.kcal || 0)) + '</div>' +
        (chips ? '<div class="log-nutrient-chips">' + chips + '</div>' : '') +
        '<div class="log-actions">' +
          '<button type="button" class="ghost-btn tiny-btn" data-duplicate-log-index="' + item._index + '">再记一份</button>' +
          '<button type="button" class="ghost-btn tiny-btn" data-remove-log-index="' + item._index + '">删除</button>' +
        '</div>' +
      '</article>';
    }).join('');
    return '<section class="log-bucket">' +
      '<div class="log-bucket-head"><strong>' + escapeHtml(group.label) + '</strong><span class="history-meta">' + group.items.length + ' 条 · ' + escapeHtml(formatCompactNutrient('kcal', group.kcal || 0)) + '</span></div>' +
      itemsHtml +
    '</section>';
  }).join('');
  DOM.logList.innerHTML = summaryHtml + groupsHtml;
}

function renderCaptureResult() {
  if (!state.captureParsed) {
    DOM.captureResult.hidden = true;
    DOM.captureNutrients.innerHTML = '';
    return;
  }
  DOM.captureResult.hidden = false;
  if (document.activeElement !== DOM.captureFoodName) DOM.captureFoodName.value = state.captureParsed.name || DOM.captureFoodName.value || '拍照识别食品';
  if (document.activeElement !== DOM.captureBasis) DOM.captureBasis.value = state.captureParsed.basis || '100g';
  if (document.activeElement !== DOM.captureServingSize) DOM.captureServingSize.value = Number.isFinite(state.captureParsed.servingSize) ? state.captureParsed.servingSize : '';
  if (!DOM.captureServings.value) DOM.captureServings.value = '1';
  const nutrientIds = Object.keys(state.captureParsed.nutrients || {}).slice(0, 14);
  const sourceLabel = state.captureParsed.recognition === 'barcode-library' ? '条码命中食品库' : state.captureParsed.recognition === 'barcode-only' ? '识别到条码，需补营养' : '多通道 OCR 解析';
  const confidence = Math.round(Number(state.captureParsed.confidence || 0.55) * 100);
  const metaHtml = '<div class="capture-quality"><span>' + escapeHtml(sourceLabel) + '</span><span>可信度 ' + confidence + '%</span><span>' + nutrientIds.length + ' 项营养字段</span></div>';
  const nutrientsHtml = nutrientIds.map((id) => '<span class="nutrient-pill"><strong>' + escapeHtml(nutrientDisplayName(id)) + '</strong><span>' + escapeHtml(formatCompactNutrient(id, state.captureParsed.nutrients[id])) + '</span></span>').join('');
  DOM.captureNutrients.innerHTML = metaHtml + (nutrientsHtml || '<span class="history-meta">未识别出营养数值，可手动保存名称后补充。</span>');
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


function setCardCollapsed(cardName, collapsed) {
  const isProfile = cardName === 'profile';
  const card = isProfile ? DOM.profileCard : DOM.measureCard;
  const btn = isProfile ? DOM.toggleProfileCardBtn : DOM.toggleBodyCardBtn;
  if (!card || !btn) return;
  card.classList.toggle('is-collapsed', Boolean(collapsed));
  btn.setAttribute('aria-expanded', String(!collapsed));
  btn.textContent = collapsed ? '展开' : '收起';
}

function toggleCollapseCard(cardName) {
  const card = cardName === 'profile' ? DOM.profileCard : DOM.measureCard;
  if (!card) return;
  setCardCollapsed(cardName, !card.classList.contains('is-collapsed'));
}

function profileBasicsComplete() {
  const p = readProfileForm();
  return Number.isFinite(p.heightCm) && Number.isFinite(p.weightKg) && Boolean(p.sex);
}

function bodyDimensionsComplete() {
  const b = readBodyForm();
  return ['chest', 'waist', 'hip'].every((key) => Number.isFinite(b[key]));
}

function collapseCompletedCards() {
  if (profileBasicsComplete()) setCardCollapsed('profile', true);
  if (bodyDimensionsComplete()) setCardCollapsed('body', true);
}

function onProfileInput() {
  state.profile = {
    ...readProfileForm(),
    bodyFat: clamp(Number(DOM.profileForm.bodyFat.value) || 22, 2, 60),
    focusNote: String(DOM.profileForm.focusNote.value || '').trim().slice(0, 120),
  };
  if (DOM.bodyStatusHint) DOM.bodyStatusHint.textContent = '用户状态已实时联动模型、营养目标与建议';
  scheduleSoftRefresh();
}

function onBodyInput() {
  if (DOM.bodyStatusHint) DOM.bodyStatusHint.textContent = '身体维度已实时联动标准人体模型：胸腰臀、肩、四肢会同步塑形';
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
  const meta = recordMetaForDate(state.activeDate);
  const item = {
    id: uid('log'),
    ...meta,
    label: labels.zh || labels.original,
    labels,
    grams: round1(grams),
    code: food.code || '',
    nutrients,
    source: food.customPer100 ? 'custom' : 'library',
    library: food.library || classifyFoodLibrary(food),
  };
  getDayLog(meta.recordDate).items.unshift(item);
  persistState({ syncEligible: true });
  renderAll();
  DOM.foodSearchStatus.textContent = `${foodDisplayName(food)} 已加入 ${formatDateWindow(meta.recordDate)}`;
}

function nutrientsForFood(food) {
  return food.customPer100 ? food.customPer100 : normalizedFoodNutrients(food);
}

function foodNutrientsForAmount(food, grams) {
  return scaleNutrients(nutrientsForFood(food), grams);
}

function onLogListClick(event) {
  const duplicateBtn = event.target.closest('[data-duplicate-log-index]');
  if (duplicateBtn) {
    const idx = Number(duplicateBtn.dataset.duplicateLogIndex);
    const items = getDayLog(state.activeDate).items;
    const source = items[idx];
    if (source) {
      const meta = recordMetaForDate(state.activeDate);
      items.unshift({ ...source, id: uid('log'), ...meta, duplicatedFrom: source.id || '' });
      persistState({ syncEligible: true });
      renderAll();
    }
    return;
  }
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
  const recordKey = record.recordDate || todayString();
  const existingIndex = state.bodyHistory.findIndex((item) => normalizeDateKey(item.recordDate || dateKeyFromTimestamp(item.recordedAt), '') === recordKey);
  if (existingIndex >= 0) {
    state.bodyHistory[existingIndex] = normalizeBodyRecord({
      ...state.bodyHistory[existingIndex],
      ...record,
      recordedAt: state.bodyHistory[existingIndex].recordedAt || record.recordedAt,
      updatedAt: new Date().toISOString(),
    });
    DOM.bodyStatusHint.textContent = `已更新 ${formatDateWindow(recordKey)} 的身体维度，模型与建议已更新`;
  } else {
    state.bodyHistory.unshift(record);
    DOM.bodyStatusHint.textContent = `身体记录已保存到 ${formatDateWindow(recordKey)}，模型与建议已更新`;
  }
  state.bodyHistory = normalizeBodyHistory(state.bodyHistory);
  persistState({ syncEligible: true });
  renderAll();
  window.requestAnimationFrame(() => collapseCompletedCards());
}

function clearTodayLog() {
  getDayLog(state.activeDate).items = [];
  persistState({ syncEligible: true });
  renderAll();
}


function setActiveDate(value) {
  const next = normalizeDateKey(value, '');
  if (!next) return;
  state.activeDate = next;
  renderAll();
  persistState({ syncEligible: false });
}

function shiftActiveDate(delta) {
  setActiveDate(offsetDateString(state.activeDate, Number(delta) || 0));
}

function offsetDateString(value, deltaDays) {
  const key = normalizeDateKey(value, todayString());
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return todayString();
  date.setDate(date.getDate() + Number(deltaDays || 0));
  return localDateStringFromDate(date);
}

function addWaterToToday(ml = 250) {
  const amount = clamp(Number(ml) || 250, 50, 2000);
  const nutrients = createEmptyTotals();
  nutrients.water = amount;
  const meta = recordMetaForDate(state.activeDate);
  getDayLog(meta.recordDate).items.unshift({
    id: uid('log'),
    ...meta,
    label: '饮水 ' + Math.round(amount) + 'mL',
    labels: { zh: '饮水 ' + Math.round(amount) + 'mL', en: 'Water', original: 'Water' },
    grams: null,
    nutrients,
    source: 'quick-water',
  });
  persistState({ syncEligible: true });
  renderAll();
}

function getDayLog(date) {
  const key = normalizeDateKey(date, todayString());
  const boundary = dayBoundaryFor(key);
  if (!state.logs[key]) state.logs[key] = { ...boundary, items: [] };
  else {
    state.logs[key].recordDate = boundary.recordDate;
    state.logs[key].dayStart = state.logs[key].dayStart || boundary.dayStart;
    state.logs[key].dayEnd = state.logs[key].dayEnd || boundary.dayEnd;
    if (!Array.isArray(state.logs[key].items)) state.logs[key].items = [];
  }
  return state.logs[key];
}

function computeTotalsForDate(date, options = {}) {
  const totals = createEmptyTotals();
  const key = normalizeDateKey(date, todayString());
  const entry = options.create === false ? state.logs?.[key] : getDayLog(key);
  const items = entry?.items || [];
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
        recognition: 'barcode-library',
        confidence: 0.94,
      };
      renderCaptureResult();
    } else {
      state.captureParsed = {
        name: code,
        basis: '100g',
        servingSize: '',
        nutrients: {},
        code,
        recognition: 'barcode-only',
        confidence: 0.42,
      };
      renderCaptureResult();
    }
  } catch (error) {
    DOM.captureStatus.textContent = `条码失败：${error.message}`;
  }
}


async function runSmartCapture() {
  const file = DOM.captureInput.files?.[0];
  if (!file) {
    DOM.captureStatus.textContent = '请先选择图片';
    return;
  }
  DOM.captureStatus.textContent = '智能识别：先查条码，再跑增强 OCR…';
  await runBarcodeSearch();
  const nutrientCount = Object.keys(state.captureParsed?.nutrients || {}).length;
  if (nutrientCount > 0) {
    DOM.captureStatus.textContent = '智能识别完成：食品库命中 ' + nutrientCount + ' 项营养';
    return;
  }
  await runOcrSearch();
}

async function runOcrSearch() {
  const file = DOM.captureInput.files?.[0];
  if (!file) {
    DOM.captureStatus.textContent = '请先选择图片';
    return;
  }
  DOM.captureStatus.textContent = 'OCR 增强识别中…';
  try {
    const Tesseract = await ensureTesseract();
    const worker = await Tesseract.createWorker('eng+chi_sim+chi_tra');
    const candidates = [];
    for (const mode of OCR_PASS_MODES) {
      DOM.captureStatus.textContent = `OCR 识别中… ${mode}`;
      const prepared = await prepareRecognitionImage(file, mode);
      const { data } = await worker.recognize(prepared);
      const text = data?.text || '';
      const parsed = parseNutritionText(text);
      candidates.push({ mode, text, parsed, score: scoreParsedNutrition(parsed, text) });
    }
    await worker.terminate();
    const merged = mergeParsedNutritionCandidates(candidates);
    if (!merged) {
      DOM.captureStatus.textContent = '没有匹配到营养字段';
      return;
    }
    state.captureParsed = {
      name: merged.name || DOM.captureFoodName.value || '拍照识别食品',
      basis: merged.basis || '100g',
      servingSize: merged.servingSize || '',
      nutrients: merged.nutrients || {},
      recognition: 'ocr-multipass',
      confidence: Math.min(0.92, 0.52 + Object.keys(merged.nutrients || {}).length * 0.045),
    };
    DOM.captureStatus.textContent = `增强 OCR 完成：识别到 ${Object.keys(merged.nutrients || {}).length} 项营养`;
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
  const meta = recordMetaForDate(state.activeDate);
  getDayLog(meta.recordDate).items.unshift({
    id: uid('log'),
    ...meta,
    label: name,
    labels: buildCustomFoodLabels(name),
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
    renderPhotoPreviewMeta();
    DOM.photoShapeMeta.textContent = '图片已上传，正在自动估测肩腰臀比例，可继续手动微调。';
    window.setTimeout(() => autoEstimatePhotoShape().catch(() => null), 90);
    persistState({ syncEligible: false });
  };
  reader.readAsDataURL(file);
}

function previewPhotoShapeFromDialog() {
  state.photoShapePreview = {
    shoulder: clamp(Number(DOM.shapeShoulder.value) / 100 || 1, 0.8, 1.25),
    chest: clamp(Number(DOM.shapeChest.value) / 100 || 1, 0.82, 1.25),
    waist: clamp(Number(DOM.shapeWaist.value) / 100 || 1, 0.78, 1.22),
    hip: clamp(Number(DOM.shapeHip.value) / 100 || 1, 0.82, 1.26),
    arm: clamp(Number(DOM.shapeArm.value) / 100 || 1, 0.8, 1.22),
    leg: clamp(Number(DOM.shapeLeg.value) / 100 || 1, 0.85, 1.2),
    hasPhoto: Boolean(state.photoRefUrl),
  };
  renderPhotoPreviewMeta();
  state.model?.setSnapshot(buildModelSnapshot());
  state.model?.setFocusField(RING_FIELD_MAP[state.activeRing] || '');
  state.model?.setAccentColor?.(RING_COLORS[state.activeRing] || '#6c8fa9');
}

function renderPhotoPreviewMeta() {
  const active = getActivePhotoShape();
  const values = {
    shoulder: Math.round((active.shoulder || 1) * 100),
    chest: Math.round((active.chest || 1) * 100),
    waist: Math.round((active.waist || 1) * 100),
    hip: Math.round((active.hip || 1) * 100),
    arm: Math.round((active.arm || 1) * 100),
    leg: Math.round((active.leg || 1) * 100),
  };
  DOM.photoShapeMeta.textContent = state.photoRefUrl
    ? `6 维塑形实时预览 · 肩 ${values.shoulder}% · 胸 ${values.chest}% · 腰 ${values.waist}% · 臀 ${values.hip}% · 臂 ${values.arm}% · 腿 ${values.leg}%`
    : '上传正面全身照后会先自动估测，再保留 6 维手动微调。';
}


function resetPhotoShape() {
  state.photoShape = { shoulder: 1, chest: 1, waist: 1, hip: 1, arm: 1, leg: 1, hasPhoto: Boolean(state.photoRefUrl) };
  state.photoShapePreview = null;
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
  state.photoShapePreview = null;
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
    dayBoundaryRule: 'local natural day 00:00-23:59',
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
  const header = ['recordDate', 'dayStart', 'dayEnd', 'recordedAt', 'updatedAt', 'heightCm', 'weightKg', 'bodyFat', 'neck', 'shoulder', 'chest', 'underbust', 'waist', 'abdomen', 'hip', 'upperArm', 'forearm', 'thigh', 'calf', 'ankle'];
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
    logs: normalizeLogs(state.logs),
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
  return localDateStringFromDate(now);
}

function localDateStringFromDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function normalizeDateKey(value, fallback = todayString()) {
  const raw = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return localDateStringFromDate(parsed);
  }
  return fallback || '';
}

function dateKeyFromTimestamp(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? '' : localDateStringFromDate(parsed);
}

function dayBoundaryFor(value) {
  const recordDate = normalizeDateKey(value, todayString());
  return {
    recordDate,
    dayStart: `${recordDate}T00:00:00`,
    dayEnd: `${recordDate}T23:59:59.999`,
  };
}

function timestampForRecordDate(value) {
  const recordDate = normalizeDateKey(value, todayString());
  const [year, month, day] = recordDate.split('-').map(Number);
  const now = new Date();
  const local = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  return local.toISOString();
}

function recordMetaForDate(value) {
  const boundary = dayBoundaryFor(value);
  return {
    ...boundary,
    createdAt: timestampForRecordDate(boundary.recordDate),
  };
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



function hasChinese(text) {
  return /[一-鿿]/.test(String(text || ''));
}

function looksTranslatedWeak(zh, original) {
  const a = normalizeText(zh);
  const b = normalizeText(original);
  if (!a) return true;
  if (!hasChinese(zh) && a === b) return true;
  return false;
}

function translateFoodNameToZh(input) {
  const source = String(input || '').trim();
  if (!source) return '';
  if (hasChinese(source)) return source;
  let text = source
    .replace(/[®™]/g, '')
    .replace(/[()\[\]{}]/g, ' ')
    .replace(/[,:;|/+_-]+/g, ' ')
    .replace(/\b(oz|ounce|ounces|lb|lbs|g|kg|ml|l)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  if (!text) return '';
  const phrases = [...FOOD_TRANSLATION_PHRASES].sort((a, b) => b[0].length - a[0].length);
  phrases.forEach(([en, zh]) => {
    text = text.replace(new RegExp('\\b' + escapeReg(en) + '\\b', 'gi'), ' ' + zh + ' ');
  });
  const tokens = text.split(/\s+/).filter(Boolean);
  const out = [];
  tokens.forEach((token) => {
    if (!token || FOOD_TRANSLATION_STOPWORDS.has(token)) return;
    if (hasChinese(token)) { out.push(token); return; }
    if (/^\d+(\.\d+)?$/.test(token)) { out.push(token); return; }
    const mapped = FOOD_TRANSLATION_TOKENS[token] || FOOD_TRANSLATION_TOKENS[token.replace(/s$/, '')];
    if (mapped) { out.push(mapped); return; }
    if (token.length <= 2) return;
    out.push(token.replace(/^[a-z]/, (m) => m.toUpperCase()));
  });
  const deduped = [];
  out.forEach((part) => {
    if (!part) return;
    if (deduped[deduped.length - 1] === part) return;
    deduped.push(part);
  });
  const zhOnly = deduped.filter((part) => hasChinese(part)).join('');
  const residual = deduped.filter((part) => !hasChinese(part)).slice(0, 4).join(' ');
  return [zhOnly, residual].filter(Boolean).join(' · ').trim();
}

function cleanupFoodLabelText(value) {
  return String(value || '')
    .replace(/&quot;/g, '')
    .replace(/\s+/g, ' ')
    .replace(/([\u4e00-\u9fff])\s+([\u4e00-\u9fff])/g, '$1$2')
    .replace(/^[,.;:：、\s]+|[,.;:：、\s]+$/g, '')
    .trim();
}

function readableLatinFallback(value) {
  const clean = String(value || '').replace(/[^0-9A-Za-z &'.-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return clean.split(' ').slice(0, 5).join(' ');
}

function normalizeLatinFoodText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^0-9a-z\u4e00-\u9fff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function refineChineseFoodLabel(label, original = '', en = '') {
  const raw = normalizeLatinFoodText([original, en, label].join(' '));
  let value = cleanupFoodLabelText(label);
  if (/halls\s+extra\s+strong/.test(raw)) return 'HALLS 特强薄荷糖';
  if (/ovomaltine/.test(raw)) return '阿华田麦芽饮品';
  if (/chocolat\s+noir/.test(raw) || /dark\s+chocolate/.test(raw)) return /pepites|chips|chip/.test(raw) ? '黑巧克力碎片' : '黑巧克力';
  if (/blueberry\s+muffins?/.test(raw)) return '蓝莓松饼';
  if (/greek\s+yogurt/.test(raw)) return '希腊酸奶';
  if (/plain\s+yogurt/.test(raw)) return '原味酸奶';
  if (/peanut\s+butter/.test(raw)) return '花生酱';
  if (/almond\s+milk/.test(raw)) return '杏仁奶';
  if (/oat\s+milk/.test(raw)) return '燕麦奶';
  if (/coconut\s+milk/.test(raw)) return '椰奶';
  if (/protein\s+bar/.test(raw)) return '蛋白棒';
  if (/energy\s+bar/.test(raw)) return '能量棒';
  if (/granola/.test(raw)) return '格兰诺拉麦片';
  if (/muesli/.test(raw)) return '混合麦片';
  if (/bagel/.test(raw)) return /bites?/.test(raw) ? '迷你贝果' : '贝果';
  if (/le\s+paris/.test(raw) && /fleury\s+michon/.test(raw)) return '巴黎风味熟火腿';
  value = value
    .replace(/巧克力黑/g, '黑巧克力')
    .replace(/奶酪蓝/g, '蓝纹奶酪')
    .replace(/酸奶希腊/g, '希腊酸奶')
    .replace(/牛奶全脂/g, '全脂牛奶')
    .replace(/牛奶低脂/g, '低脂牛奶')
    .replace(/面包白/g, '白面包')
    .replace(/面包全麦/g, '全麦面包');
  return value;
}

function ensureChineseFoodLabel(label, original = '', en = '') {
  let value = refineChineseFoodLabel(cleanupFoodLabelText(label), original, en);
  if (hasChinese(value)) return value;
  value = refineChineseFoodLabel(cleanupFoodLabelText(translateFoodNameToZh(original || en || value)), original, en);
  if (hasChinese(value)) return value;
  const latin = readableLatinFallback(original || en || label);
  return latin ? '进口食品 · ' + latin : '未命名食品';
}

function chooseBestChineseLabel(rawZh, original, en) {
  const autoZh = translateFoodNameToZh(rawZh || en || original);
  if (!looksTranslatedWeak(rawZh, original)) return rawZh;
  return autoZh || rawZh || original || en || '未命名食品';
}

function mealBucketForTime(value) {
  const date = new Date(value);
  const hour = Number.isNaN(date.getTime()) ? 12 : date.getHours() + date.getMinutes() / 60;
  return MEAL_BUCKETS.find((bucket) => hour >= bucket.start && hour < bucket.end) || MEAL_BUCKETS[MEAL_BUCKETS.length - 1];
}

function progressStatusText(target, current) {
  const progress = progressForTarget(target, current);
  if (!target) return '—';
  if (target.type === 'max') {
    const excess = Math.max(0, Number(current || 0) - targetValue(target));
    return excess > 0 ? `已超上限 ${formatNumber(excess, excess >= 100 ? 0 : 1)}` : '控制良好';
  }
  if (progress >= 1) return '已达标';
  return `待补 ${Math.max(0, Math.round((1 - progress) * 100))}%`;
}

function mergeParsedNutritionCandidates(candidates) {
  const valid = candidates.filter((item) => item?.parsed?.nutrients && Object.keys(item.parsed.nutrients).length);
  if (!valid.length) return null;
  valid.sort((a, b) => (b.score || 0) - (a.score || 0));
  const best = valid[0].parsed;
  const merged = { nutrients: { ...(best.nutrients || {}) }, basis: best.basis || '100g', servingSize: best.servingSize || null, name: best.name || '' };
  valid.slice(1).forEach((candidate) => {
    const parsed = candidate.parsed;
    Object.entries(parsed.nutrients || {}).forEach(([id, value]) => {
      if (!(id in merged.nutrients)) merged.nutrients[id] = value;
    });
    if (!merged.servingSize && parsed.servingSize) merged.servingSize = parsed.servingSize;
    if (!merged.name && parsed.name) merged.name = parsed.name;
    if (merged.basis === '100g' && parsed.basis === 'serving') merged.basis = 'serving';
    if (merged.basis === '100g' && parsed.basis === '100ml') merged.basis = '100ml';
  });
  return merged;
}

function scoreParsedNutrition(parsed, rawText = '') {
  if (!parsed?.nutrients) return 0;
  const keys = Object.keys(parsed.nutrients);
  const text = String(rawText || '');
  return keys.length * 12 + (parsed.servingSize ? 5 : 0) + (parsed.name ? 4 : 0) + (/nutrition|营养|protein|蛋白质/i.test(text) ? 2 : 0);
}

function extractNameFromNutritionText(raw) {
  const lines = String(raw || '').split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const blocked = /(nutrition|营养|项目|参考值|每100|每份|serving|energy|protein|fat|carb|sugar|fiber|sodium|table|facts|nrv|每\s*100|配料|ingredients)/i;
  const candidate = lines.find((line) => !blocked.test(line) && line.length >= 2 && line.length <= 48 && !/[0-9]{2,}/.test(line));
  return candidate ? candidate.replace(/[：:]+$/, '').trim() : '';
}

function normalizeFoodLabels(raw) {
  const source = raw?.labels ? raw.labels : raw || {};
  const name = String(raw?.name || raw?.label || raw?.z || raw?.n || '').trim();
  const original = String(source.original || raw?.n || raw?.name || raw?.label || name || '').trim();
  const explicitEn = String(source.en || raw?.en || '').trim();
  const en = explicitEn || (/[A-Za-z]/.test(original) ? original : (/[A-Za-z]/.test(name) ? name : ''));
  const storedZh = String(source.zh || raw?.z || '').trim();
  const base = {
    zh: chooseBestChineseLabel(storedZh || name, original, en),
    en: en || original || name || '',
    original: original || name || en || '',
  };
  let smart = base;
  try {
    smart = buildSmartFoodLabels(raw || {}, () => base) || base;
  } catch (error) {
    smart = base;
  }
  const zh = ensureChineseFoodLabel(smart.zh || base.zh, smart.original || base.original, smart.en || base.en);
  return {
    zh,
    en: String(smart.en || base.en || smart.original || base.original || zh || 'Unnamed food').trim(),
    original: String(smart.original || base.original || base.en || zh || 'Unnamed food').trim(),
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
    exportMeta: {
      dayBoundaryRule: 'local natural day 00:00-23:59',
      bodyRecords: state.bodyHistory.length,
    },
  };
  downloadJson(payload, `haochijia-body-${compactDateTime()}.json`);
}

function exportIntakeCsv() {
  const rows = [[
    'recordDate', 'dayStart', 'dayEnd', 'createdAt', 'label', 'zh', 'en', 'original', 'library', 'code', 'grams',
    'kcal', 'protein', 'carbs', 'fat', 'fiber', 'calcium', 'iron', 'water', 'sodium'
  ].join(',')];
  const days = Object.keys(state.logs || {}).sort();
  days.forEach((date) => {
    const key = normalizeDateKey(date, todayString());
    const entry = state.logs?.[date] || {};
    const boundary = dayBoundaryFor(entry.recordDate || key);
    const items = entry.items || [];
    items.forEach((item) => {
      const labels = normalizeFoodLabels(item);
      rows.push([
        csvEscape(item.recordDate || boundary.recordDate),
        csvEscape(item.dayStart || boundary.dayStart),
        csvEscape(item.dayEnd || boundary.dayEnd),
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
        csvEscape(item.nutrients?.water ?? ''),
        csvEscape(item.nutrients?.sodium ?? ''),
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
  const lines = raw.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const clean = raw
    .replace(/[，、；：]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/Ｏ/g, '0')
    .replace(/o(?=\d)/gi, '0');
  let basis = /每\s*100\s*m?l|per\s*100\s*m?l/i.test(clean)
    ? '100ml'
    : (/(?:每\s*份|per\s*serving|serving\s*size|portion\s*size)/i.test(clean) ? 'serving' : '100g');
  const servingMatch = clean.match(/(?:serving\s*size|portion\s*size|每份|份量)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*(g|ml|克|毫升)/i);
  const servingSize = servingMatch ? Number(servingMatch[1]) : null;
  const nutrients = {};
  const aliasMap = {
    kcal: ['energy', 'kcal', 'calories', '热量', '能量'],
    protein: ['protein', '蛋白质'],
    carbs: ['carbohydrate', 'carbohydrates', 'carb', '碳水', '碳水化合物'],
    fat: ['fat', 'total fat', '脂肪'],
    satFat: ['saturated fat', 'sat fat', '饱和脂肪'],
    transFat: ['trans fat', '反式脂肪'],
    sugar: ['sugar', 'sugars', '糖'],
    fiber: ['fiber', 'dietary fiber', '膳食纤维'],
    sodium: ['sodium', '钠'],
    calcium: ['calcium', '钙'],
    iron: ['iron', '铁'],
    magnesium: ['magnesium', '镁'],
    potassium: ['potassium', '钾'],
    zinc: ['zinc', '锌'],
    vitaminA: ['vitamin a', '维生素a'],
    vitaminC: ['vitamin c', '维生素c'],
    vitaminD: ['vitamin d', '维生素d'],
    folate: ['folate', 'folic acid', '叶酸'],
    vitaminB12: ['vitamin b12', '维生素b12'],
    cholesterol: ['cholesterol', '胆固醇'],
  };
  Object.entries(aliasMap).forEach(([id, aliases]) => {
    const line = lines.find((row) => aliases.some((alias) => new RegExp(alias.replace(/[-/\^$*+?.()|[\]{}]/g, '\$&'), 'i').test(row)));
    if (!line) return;
    const value = extractFieldValue(line, aliases, id);
    if (Number.isFinite(value)) nutrients[id] = value;
  });
  if (!Object.keys(nutrients).length) {
    const specs = Object.entries(OCR_FIELD_MAP).map(([id, meta]) => [id, buildOcrKeywords(id, meta.label)]);
    specs.forEach(([id, keys]) => {
      const value = extractFieldValue(clean, keys, id);
      if (Number.isFinite(value) && !(id in nutrients)) nutrients[id] = value;
    });
  }
  if (!Object.keys(nutrients).length) return null;
  if (/每\s*份|per\s*serving|serving\s*size|portion\s*size/i.test(clean)) basis = 'serving';
  return {
    basis,
    servingSize,
    nutrients,
    name: extractNameFromNutritionText(raw),
  };
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
