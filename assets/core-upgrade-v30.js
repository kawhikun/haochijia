
const V30_CORE = {
  version: 'v30-core-upgrade-20260421',
  appName: '好吃家',
  githubConfigKey: 'haochijia.v30.github.config',
  mirrorDb: 'haochijia-v30-local-mirror',
  mirrorStore: 'kv',
  mirrorSnapshotKey: 'snapshot',
  restoreFlag: 'haochijia.v30.mirror.restore.once',
  storagePrefixes: ['haochijia.'],
  coreKeys: ['haochijia.profile.v4', 'haochijia.logs.v4', 'haochijia.body.history.v1'],
};

const BODY_FIELD_ALIASES = {
  recordedAt: ['recordedat', 'recorded_at', 'date', 'datetime', 'time', 'timestamp', '日期', '时间', '记录时间', '测量时间'],
  heightCm: ['heightcm', 'height', 'height_cm', '身高', '身高cm', '身高(cm)'],
  weightKg: ['weightkg', 'weight', 'weight_kg', '体重', '体重kg', '体重(kg)'],
  bodyFat: ['bodyfat', 'body_fat', 'fat', 'fatpercent', '体脂', '体脂率', '体脂%'],
  neck: ['neck', '颈围'],
  shoulder: ['shoulder', 'shoulderwidth', '肩宽', '肩围'],
  chest: ['chest', 'bust', '胸围'],
  underbust: ['underbust', '下胸围', '下胸'],
  waist: ['waist', 'waistline', '腰围'],
  abdomen: ['abdomen', 'belly', 'stomach', '腹围', '腹部', '肚脐围'],
  hip: ['hip', 'hips', '臀围'],
  upperArmL: ['upperarml', 'leftupperarm', 'leftarm', '左上臂', '左大臂', '左臂围'],
  upperArmR: ['upperarmr', 'rightupperarm', 'rightarm', '右上臂', '右大臂', '右臂围'],
  forearmL: ['forearml', 'leftforearm', '左前臂', '左小臂'],
  forearmR: ['forearmr', 'rightforearm', '右前臂', '右小臂'],
  thighL: ['thighl', 'leftthigh', '左大腿', '左腿围'],
  thighR: ['thighr', 'rightthigh', '右大腿', '右腿围'],
  calfL: ['calfl', 'leftcalf', '左小腿', '左小腿围'],
  calfR: ['calfr', 'rightcalf', '右小腿', '右小腿围'],
  ankleL: ['anklel', 'leftankle', '左脚踝', '左踝围'],
  ankleR: ['ankler', 'rightankle', '右脚踝', '右踝围'],
  stageTag: ['stagetag', 'stage', 'phase', '阶段', '阶段标签', '目标阶段'],
  note: ['note', 'memo', 'comment', '备注', '说明', '记录'],
};

const ORBIT_MODES = [
  {
    id: 'bone',
    when: (profile) => Boolean(profile.boneRisk),
    title: '骨关节支持',
    rings: ['钙', '维生素 D', '维生素 K'],
    detail: '如果你勾选了骨关节 / 骨量关注，6 环中的后 3 环会优先突出骨支持相关营养。',
  },
  {
    id: 'anemia',
    when: (profile) => Boolean(profile.anemiaRisk),
    title: '造血支持',
    rings: ['铁', '叶酸', '维生素 B12'],
    detail: '贫血或疲劳倾向会把铁、叶酸和维生素 B12 提到重点位置。',
  },
  {
    id: 'pressure',
    when: (profile) => Boolean(profile.hypertension),
    title: '血压管理',
    rings: ['钠', '钾', '饮水'],
    detail: '血压管理会优先显示钠、钾和饮水的实时状态。',
  },
  {
    id: 'lipid',
    when: (profile) => Boolean(profile.dyslipidemia),
    title: '血脂管理',
    rings: ['饱和脂肪', '膳食纤维', 'Omega-3'],
    detail: '血脂管理会把饱和脂肪、膳食纤维与 Omega-3 拉成重点环。',
  },
  {
    id: 'glucose',
    when: (profile) => ['prediabetes', 'type1', 'type2', 'gestational'].includes(String(profile.glucoseStatus || '')),
    title: '血糖平衡',
    rings: ['膳食纤维', '蛋白质', '碳水'],
    detail: '血糖关注时，会用纤维 / 蛋白质 / 碳水分配来辅助理解。',
  },
  {
    id: 'default',
    when: () => true,
    title: '基础均衡',
    rings: ['膳食纤维', '饮水', '钙'],
    detail: '默认保持三大营养素 + 纤维 / 饮水 / 钙 的基础观察。',
  },
];

const TEXTS = {
  zh: {
    dockKicker: '核心首页',
    dockTitle: '好吃家 v30 核心控制台',
    dockHint: '主文件只保留身体数据与营养摄入两条主线；音乐已拆成独立实验室。',
    body: '身体数据',
    intake: '营养摄入',
    capture: '拍照分析',
    importBody: '导入维度',
    exportAll: '导出全部',
    cloud: 'GitHub 备份',
    musicLab: '打开音乐实验室',
    intakeKicker: '核心功能',
    intakeTitle: '营养摄入分析',
    intakeHint: '食品库、营养进度与拍照分析都保留在主站。',
    intakeOpen: '打开食品库',
    intakeManual: '手动录入',
    intakeCapture: '拍照分析',
    focusLead: '当前 6 环 = 蛋白质 / 脂肪 / 碳水 + {rings}',
    focusMode: '当前模式：{title}',
    saveStatus: '本地镜像已开启',
    saveStatusFull: '本地镜像 + 浏览器持久化已开启',
    saveStatusBasic: '本地镜像已开启，可随时导出或云端备份',
    stageHint: '双击人体回到正视图，长按直达身体数据。',
    stageHintAction: '拖动 3D 模型可旋转，双指可缩放。',
    importOk: '已导入 {count} 条身体记录，正在刷新界面。',
    importFail: '导入失败：{message}',
    exportOk: '已导出全部记录快照。',
    exportName: 'haochijia-v30-all-records',
    cloudTitle: 'GitHub 云端备份',
    cloudHint: '把本地全部记录保存到 GitHub 仓库，或从仓库恢复。',
    owner: '仓库拥有者',
    repo: '仓库名',
    branch: '分支',
    path: '备份路径',
    token: '令牌（本次会话使用）',
    upload: '上传备份',
    restore: '恢复备份',
    close: '关闭',
    cloudIdle: '填完仓库信息后即可上传 / 恢复。',
    cloudUploadDone: 'GitHub 备份上传成功。',
    cloudRestoreDone: '已从 GitHub 恢复备份，正在刷新界面。',
    cloudNeedConfig: '请先填完整的仓库信息和令牌。',
    cloudTokenNote: '建议使用仅授予 Contents 写入权限的细粒度令牌。',
    cloudRepoNote: '推荐路径：backups/haochijia/latest.json',
    bodyHubSound: '音乐实验室',
    bodyHubProfile: '营养建议',
    bodyHubToday: '导出记录',
    gestureToast: '已回到正视图',
  },
  en: {
    dockKicker: 'Core home',
    dockTitle: 'Haochijia v30 core console',
    dockHint: 'Main file keeps body data and nutrition intake only. Music now lives in its own lab.',
    body: 'Body data',
    intake: 'Nutrition intake',
    capture: 'Photo analysis',
    importBody: 'Import body data',
    exportAll: 'Export all',
    cloud: 'GitHub backup',
    musicLab: 'Open music lab',
    intakeKicker: 'Core features',
    intakeTitle: 'Nutrition intake analysis',
    intakeHint: 'Food library, nutrition progress and photo analysis stay in the main app.',
    intakeOpen: 'Open food library',
    intakeManual: 'Manual entry',
    intakeCapture: 'Photo analysis',
    focusLead: '6 rings = protein / fat / carbs + {rings}',
    focusMode: 'Mode: {title}',
    saveStatus: 'Local mirror enabled',
    saveStatusFull: 'Local mirror + persistent storage enabled',
    saveStatusBasic: 'Local mirror enabled. Export or cloud backup anytime.',
    stageHint: 'Double-tap to reset the front view. Long-press to open body data.',
    stageHintAction: 'Drag to orbit and pinch to zoom.',
    importOk: 'Imported {count} body records. Refreshing now.',
    importFail: 'Import failed: {message}',
    exportOk: 'All records exported.',
    exportName: 'haochijia-v30-all-records',
    cloudTitle: 'GitHub cloud backup',
    cloudHint: 'Save all local records to a GitHub repository or restore from one.',
    owner: 'Owner',
    repo: 'Repository',
    branch: 'Branch',
    path: 'Backup path',
    token: 'Token (session only)',
    upload: 'Upload backup',
    restore: 'Restore backup',
    close: 'Close',
    cloudIdle: 'Fill the repo details to upload or restore.',
    cloudUploadDone: 'GitHub backup uploaded.',
    cloudRestoreDone: 'Backup restored from GitHub. Refreshing now.',
    cloudNeedConfig: 'Please complete the repo fields and token.',
    cloudTokenNote: 'Use a fine-grained token with Contents write access.',
    cloudRepoNote: 'Suggested path: backups/haochijia/latest.json',
    bodyHubSound: 'Music lab',
    bodyHubProfile: 'Nutrition',
    bodyHubToday: 'Export',
    gestureToast: 'Front view restored',
  },
  es: {
    dockKicker: 'Inicio central',
    dockTitle: 'Consola central Haochijia v30',
    dockHint: 'El archivo principal mantiene solo cuerpo y nutrición. La música va aparte.',
    body: 'Datos corporales',
    intake: 'Ingesta nutricional',
    capture: 'Análisis por foto',
    importBody: 'Importar medidas',
    exportAll: 'Exportar todo',
    cloud: 'Respaldo GitHub',
    musicLab: 'Abrir laboratorio musical',
    intakeKicker: 'Funciones clave',
    intakeTitle: 'Análisis de ingesta',
    intakeHint: 'Biblioteca, progreso nutricional y análisis por foto siguen aquí.',
    intakeOpen: 'Abrir biblioteca',
    intakeManual: 'Entrada manual',
    intakeCapture: 'Análisis por foto',
    focusLead: '6 anillos = proteína / grasa / carbohidratos + {rings}',
    focusMode: 'Modo: {title}',
    saveStatus: 'Espejo local activo',
    saveStatusFull: 'Espejo local + almacenamiento persistente activos',
    saveStatusBasic: 'Espejo local activo. Puedes exportar o respaldar en la nube.',
    stageHint: 'Doble toque para volver al frente. Mantén pulsado para abrir el cuerpo.',
    stageHintAction: 'Arrastra para orbitar y pellizca para hacer zoom.',
    importOk: 'Se importaron {count} registros corporales. Recargando.',
    importFail: 'Error de importación: {message}',
    exportOk: 'Se exportaron todos los registros.',
    exportName: 'haochijia-v30-all-records',
    cloudTitle: 'Respaldo en GitHub',
    cloudHint: 'Guarda todos los registros locales en GitHub o recupéralos.',
    owner: 'Propietario',
    repo: 'Repositorio',
    branch: 'Rama',
    path: 'Ruta del respaldo',
    token: 'Token (solo esta sesión)',
    upload: 'Subir respaldo',
    restore: 'Restaurar respaldo',
    close: 'Cerrar',
    cloudIdle: 'Completa el repositorio para subir o restaurar.',
    cloudUploadDone: 'Respaldo subido a GitHub.',
    cloudRestoreDone: 'Respaldo restaurado desde GitHub. Recargando.',
    cloudNeedConfig: 'Completa repositorio y token.',
    cloudTokenNote: 'Usa un token fino con permiso de escritura en Contents.',
    cloudRepoNote: 'Ruta sugerida: backups/haochijia/latest.json',
    bodyHubSound: 'Laboratorio',
    bodyHubProfile: 'Nutrición',
    bodyHubToday: 'Exportar',
    gestureToast: 'Vista frontal restaurada',
  },
};

function currentLangV30() {
  try {
    const stored = localStorage.getItem('haochijia.lang.v1') || document.documentElement.lang || 'zh';
    if (stored.startsWith('es')) return 'es';
    if (stored.startsWith('en')) return 'en';
    return 'zh';
  } catch {
    return 'zh';
  }
}

function textV30(key, params = {}) {
  const lang = currentLangV30();
  const dictionary = TEXTS[lang] || TEXTS.zh;
  const template = dictionary[key] || TEXTS.zh[key] || key;
  return Object.entries(params).reduce((out, [token, value]) => out.replaceAll(`{${token}}`, String(value)), template);
}

function onReadyV30(task) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', task, { once: true });
  } else {
    task();
  }
}

function tryJsonParse(raw, fallback = null) {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeAlias(source) {
  return String(source || '')
    .trim()
    .toLowerCase()
    .replace(/[%()\[\]{}]/g, '')
    .replace(/厘米|公分/g, 'cm')
    .replace(/公斤|千克/g, 'kg')
    .replace(/维生素/g, 'vitamin')
    .replace(/[\s_\-:/]+/g, '');
}

function downloadText(name, text, type = 'application/json;charset=utf-8') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 0);
}

function showToastV30(message) {
  const rack = document.getElementById('toastRack');
  if (!rack) return;
  const toast = document.createElement('div');
  toast.className = 'toast-pill';
  toast.textContent = message;
  rack.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => toast.classList.remove('show'), 1850);
  setTimeout(() => toast.remove(), 2200);
}

function collectStorageSnapshotV30() {
  const out = {};
  try {
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !V30_CORE.storagePrefixes.some((prefix) => key.startsWith(prefix))) continue;
      out[key] = localStorage.getItem(key);
    }
  } catch (error) {
    console.warn(error);
  }
  return out;
}

function openMirrorDbV30() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(V30_CORE.mirrorDb, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(V30_CORE.mirrorStore)) {
        db.createObjectStore(V30_CORE.mirrorStore, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB unavailable'));
  });
}

async function mirrorSnapshotV30() {
  const db = await openMirrorDbV30().catch(() => null);
  if (!db) return false;
  const snapshot = collectStorageSnapshotV30();
  const record = { key: V30_CORE.mirrorSnapshotKey, value: snapshot, updatedAt: Date.now() };
  await new Promise((resolve, reject) => {
    const tx = db.transaction(V30_CORE.mirrorStore, 'readwrite');
    tx.objectStore(V30_CORE.mirrorStore).put(record);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error('Mirror write failed'));
  }).catch((error) => {
    console.warn(error);
    return false;
  });
  return true;
}

async function readMirrorSnapshotV30() {
  const db = await openMirrorDbV30().catch(() => null);
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(V30_CORE.mirrorStore, 'readonly');
    const request = tx.objectStore(V30_CORE.mirrorStore).get(V30_CORE.mirrorSnapshotKey);
    request.onsuccess = () => resolve(request.result?.value || null);
    request.onerror = () => reject(request.error || new Error('Mirror read failed'));
  }).catch((error) => {
    console.warn(error);
    return null;
  });
}

async function restoreMirrorIfNeededV30() {
  if (sessionStorage.getItem(V30_CORE.restoreFlag) === '1') return false;
  const hasCurrentCore = V30_CORE.coreKeys.some((key) => {
    try { return localStorage.getItem(key) != null; }
    catch { return false; }
  });
  if (hasCurrentCore) return false;
  const snapshot = await readMirrorSnapshotV30();
  if (!snapshot || typeof snapshot !== 'object') return false;
  const hasMirrorCore = V30_CORE.coreKeys.some((key) => snapshot[key] != null);
  if (!hasMirrorCore) return false;
  try {
    Object.entries(snapshot).forEach(([key, value]) => {
      if (!V30_CORE.storagePrefixes.some((prefix) => key.startsWith(prefix))) return;
      if (typeof value !== 'string') return;
      localStorage.setItem(key, value);
    });
    sessionStorage.setItem(V30_CORE.restoreFlag, '1');
    return true;
  } catch (error) {
    console.warn(error);
    return false;
  }
}

let mirrorTimerV30 = 0;
function queueMirrorV30(delay = 120) {
  window.clearTimeout(mirrorTimerV30);
  mirrorTimerV30 = window.setTimeout(() => {
    mirrorSnapshotV30().catch((error) => console.warn(error));
  }, delay);
}

async function requestPersistentStorageV30() {
  if (!navigator.storage?.persist) return false;
  try {
    return Boolean(await navigator.storage.persist());
  } catch {
    return false;
  }
}

function readProfileV30() {
  const form = document.getElementById('profileForm');
  if (form) {
    const data = new FormData(form);
    return {
      glucoseStatus: data.get('glucoseStatus') || '',
      smoker: form.querySelector('[name="smoker"]')?.checked || false,
      hypertension: form.querySelector('[name="hypertension"]')?.checked || false,
      dyslipidemia: form.querySelector('[name="dyslipidemia"]')?.checked || false,
      boneRisk: form.querySelector('[name="boneRisk"]')?.checked || false,
      anemiaRisk: form.querySelector('[name="anemiaRisk"]')?.checked || false,
    };
  }
  const stored = tryJsonParse(localStorage.getItem('haochijia.profile.v4'), {}) || {};
  return {
    glucoseStatus: stored.glucoseStatus || '',
    smoker: Boolean(stored.smoker),
    hypertension: Boolean(stored.conditions?.hypertension || stored.hypertension),
    dyslipidemia: Boolean(stored.conditions?.dyslipidemia || stored.dyslipidemia),
    boneRisk: Boolean(stored.conditions?.boneRisk || stored.boneRisk),
    anemiaRisk: Boolean(stored.conditions?.anemiaRisk || stored.anemiaRisk),
  };
}

function resolveOrbitModeV30() {
  const profile = readProfileV30();
  return ORBIT_MODES.find((mode) => mode.when(profile)) || ORBIT_MODES[ORBIT_MODES.length - 1];
}

function renderAdaptiveFocusV30() {
  const mode = resolveOrbitModeV30();
  const focusLead = document.getElementById('v30AdaptiveFocusLead');
  const focusMode = document.getElementById('v30AdaptiveFocusMode');
  const focusHint = document.getElementById('v30AdaptiveFocusHint');
  const orbitInsight = document.getElementById('v30OrbitInsight');
  const rings = mode.rings.join(' / ');
  if (focusLead) focusLead.textContent = textV30('focusLead', { rings });
  if (focusMode) focusMode.textContent = textV30('focusMode', { title: mode.title });
  if (focusHint) focusHint.textContent = mode.detail;
  if (orbitInsight) {
    orbitInsight.innerHTML = `
      <strong>${textV30('focusMode', { title: mode.title })}</strong>
      <span>${textV30('focusLead', { rings })}</span>`;
  }
}

function ensureCoreDockV30() {
  const hero = document.getElementById('bodyHeroCard');
  if (!hero || document.getElementById('v30CoreDock')) return;
  const dock = document.createElement('section');
  dock.id = 'v30CoreDock';
  dock.className = 'card v30-core-dock';
  dock.innerHTML = `
    <div class="section-head compact">
      <div>
        <p class="section-kicker" id="v30CoreDockKicker"></p>
        <h2 id="v30CoreDockTitle"></h2>
        <p class="fold-summary-text" id="v30CoreDockHint"></p>
      </div>
      <span class="top-pill subtle" id="v30SaveStatus"></span>
    </div>
    <div class="v30-core-grid">
      <button type="button" class="primary-btn" data-v30-action="body"></button>
      <button type="button" class="primary-btn" data-v30-action="intake"></button>
      <button type="button" class="ghost-btn" data-v30-action="capture"></button>
      <button type="button" class="ghost-btn" data-v30-action="import-body"></button>
      <button type="button" class="ghost-btn" data-v30-action="export-all"></button>
      <button type="button" class="ghost-btn" data-v30-action="cloud"></button>
    </div>
    <div class="v30-core-foot">
      <div class="v30-adaptive-focus" id="v30AdaptiveFocus">
        <strong id="v30AdaptiveFocusLead"></strong>
        <span id="v30AdaptiveFocusMode"></span>
        <small id="v30AdaptiveFocusHint"></small>
      </div>
      <a class="ghost-btn compact-btn v30-music-link" href="./music-lab.html" id="v30MusicLabLink"></a>
    </div>
    <input id="v30BodyImportInput" type="file" accept=".json,.csv,application/json,text/csv" hidden>
  `;
  hero.insertAdjacentElement('afterend', dock);
}

function enhanceHomeSearchCardV30() {
  const card = document.getElementById('v22HomeSearchCard');
  if (!card) return;
  card.classList.add('v30-intake-card');
  const set = (id, value, attr) => {
    const node = document.getElementById(id);
    if (!node) return;
    if (attr) node.setAttribute(attr, value);
    else node.textContent = value;
  };
  set('v22HomeSearchKicker', textV30('intakeKicker'));
  set('v22HomeSearchTitle', textV30('intakeTitle'));
  set('v22HomeSearchHint', textV30('intakeHint'));
  set('v22HomeSearchLabel', textV30('intakeOpen'));
  set('v22HomeSearchBtn', textV30('intakeOpen'));
  set('v22HomeManualBtn', textV30('intakeManual'));
  set('v22HomeUploadBtn', textV30('intakeCapture'));
  const input = document.getElementById('v22HomeSearchInput');
  if (input) input.placeholder = currentLangV30() === 'zh' ? '输入食品、品牌或条码' : currentLangV30() === 'es' ? 'Escribe alimento, marca o código de barras' : 'Type food, brand or barcode';
  ['v22HomeMusicBtn', 'v22HomeComboBtn', 'v22HomeDataBtn', 'v22HomeBodyBtn', 'v26HomeExploreCard'].forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.classList.add('v30-hidden-node');
    if (node.tagName === 'DETAILS') node.open = false;
  });
}

function bindCoreActionsV30() {
  const dock = document.getElementById('v30CoreDock');
  if (!dock || dock.dataset.boundV30) return;
  dock.dataset.boundV30 = '1';
  dock.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-v30-action]');
    if (!btn) return;
    const action = btn.dataset.v30Action;
    if (action === 'body') {
      window.__haochijiaOpenPanel?.('profile');
      setTimeout(() => document.querySelector('#profilePanel input, #profilePanel select')?.focus?.(), 180);
      return;
    }
    if (action === 'intake') {
      window.__haochijiaOpenPanel?.('food');
      return;
    }
    if (action === 'capture') {
      window.__haochijiaOpenPanel?.('capture');
      return;
    }
    if (action === 'import-body') {
      document.getElementById('v30BodyImportInput')?.click();
      return;
    }
    if (action === 'export-all') {
      exportAllRecordsV30();
      return;
    }
    if (action === 'cloud') {
      openCloudModalV30();
    }
  });
  document.getElementById('v30BodyImportInput')?.addEventListener('change', handleBodyImportFileV30);
}

function renderCoreCopyV30() {
  const assignments = {
    v30CoreDockKicker: textV30('dockKicker'),
    v30CoreDockTitle: textV30('dockTitle'),
    v30CoreDockHint: textV30('dockHint'),
    v30MusicLabLink: textV30('musicLab'),
  };
  Object.entries(assignments).forEach(([id, value]) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.textContent = value;
  });
  const buttonLabels = {
    body: textV30('body'),
    intake: textV30('intake'),
    capture: textV30('capture'),
    'import-body': textV30('importBody'),
    'export-all': textV30('exportAll'),
    cloud: textV30('cloud'),
  };
  document.querySelectorAll('#v30CoreDock [data-v30-action]').forEach((btn) => {
    btn.textContent = buttonLabels[btn.dataset.v30Action] || btn.dataset.v30Action;
  });
}

function countExportStatsV30() {
  const bodyHistory = tryJsonParse(localStorage.getItem('haochijia.body.history.v1'), []) || [];
  const logs = tryJsonParse(localStorage.getItem('haochijia.logs.v4'), {}) || {};
  return {
    bodyCount: Array.isArray(bodyHistory) ? bodyHistory.length : 0,
    dayCount: Object.keys(logs || {}).length,
  };
}

let persistentGrantedV30 = false;
function updateSaveStatusV30() {
  const node = document.getElementById('v30SaveStatus');
  if (!node) return;
  const stats = countExportStatsV30();
  const label = persistentGrantedV30 ? textV30('saveStatusFull') : textV30('saveStatusBasic');
  node.textContent = `${label} · 身体 ${stats.bodyCount} 条 · 日记 ${stats.dayCount} 天`;
}

function ensureStageEnhancementsV30() {
  const wrap = document.querySelector('.body-model-stage-wrap-v13') || document.querySelector('.body-model-stage-wrap');
  if (!wrap) return;
  if (!document.getElementById('v30OrbitInsight')) {
    const insight = document.createElement('div');
    insight.id = 'v30OrbitInsight';
    insight.className = 'v30-orbit-insight';
    const heroCopy = document.getElementById('bodyHeroCopy');
    if (heroCopy) heroCopy.insertAdjacentElement('afterend', insight);
  }
  const dragTip = document.getElementById('bodyDragTip');
  if (dragTip) dragTip.textContent = `${textV30('stageHintAction')} ${textV30('stageHint')}`;
  if (!wrap.dataset.v30GestureBound) {
    wrap.dataset.v30GestureBound = '1';
    let lastTap = 0;
    let pressTimer = 0;
    let startX = 0;
    let startY = 0;
    const cancelPress = () => {
      window.clearTimeout(pressTimer);
      pressTimer = 0;
    };
    wrap.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button, a, input, select, textarea')) return;
      startX = event.clientX;
      startY = event.clientY;
      cancelPress();
      if (event.pointerType === 'touch' || event.pointerType === 'pen') {
        pressTimer = window.setTimeout(() => {
          window.__haochijiaOpenPanel?.('profile');
          cancelPress();
        }, 520);
      }
    }, { passive: true });
    wrap.addEventListener('pointermove', (event) => {
      if (Math.abs(event.clientX - startX) > 10 || Math.abs(event.clientY - startY) > 10) cancelPress();
    }, { passive: true });
    wrap.addEventListener('pointerup', (event) => {
      cancelPress();
      if (event.target.closest('button, a, input, select, textarea')) return;
      const now = Date.now();
      if (now - lastTap < 280) {
        const frontBtn = document.querySelector('[data-body-view="0"]');
        frontBtn?.click();
        showToastV30(textV30('gestureToast'));
        lastTap = 0;
        return;
      }
      lastTap = now;
    }, { passive: true });
    wrap.addEventListener('pointercancel', cancelPress, { passive: true });
    wrap.addEventListener('pointerleave', cancelPress, { passive: true });
  }
}

function patchBodyHubV30() {
  const hub = document.getElementById('bodyActionHub');
  if (!hub || hub.dataset.v30HubBound) {
    rewriteBodyHubLabelsV30();
    return;
  }
  hub.dataset.v30HubBound = '1';
  hub.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-body-hub-action]');
    if (!btn) return;
    const action = btn.dataset.bodyHubAction;
    if (!['sound', 'profile', 'today'].includes(action)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    if (action === 'sound') {
      window.location.href = './music-lab.html';
      return;
    }
    if (action === 'profile') {
      window.__haochijiaOpenPanel?.('profile');
      setTimeout(() => {
        const first = document.querySelector('#profilePanel input, #profilePanel select');
        first?.focus?.();
      }, 180);
      return;
    }
    if (action === 'today') {
      exportAllRecordsV30();
    }
  }, true);
  rewriteBodyHubLabelsV30();
}

function rewriteBodyHubLabelsV30() {
  const labelMap = {
    sound: textV30('bodyHubSound'),
    body: textV30('body'),
    profile: textV30('bodyHubProfile'),
    food: textV30('intake'),
    capture: textV30('capture'),
    today: textV30('bodyHubToday'),
  };
  document.querySelectorAll('#bodyActionHub [data-body-hub-action]').forEach((btn) => {
    btn.textContent = labelMap[btn.dataset.bodyHubAction] || btn.dataset.bodyHubAction;
  });
}

function repurposeHeaderButtonsV30() {
  document.querySelectorAll('[data-open-panel="sound"]').forEach((btn) => {
    if (btn.dataset.v30Patched === '1') return;
    btn.dataset.v30Patched = '1';
    btn.textContent = textV30('musicLab');
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      window.location.href = './music-lab.html';
    }, true);
  });
}

function buildExportPayloadV30() {
  return {
    app: V30_CORE.appName,
    version: V30_CORE.version,
    exportedAt: new Date().toISOString(),
    url: window.location.href,
    storage: collectStorageSnapshotV30(),
    bodySnapshot: window.__haochijiaGetBodySnapshot?.() || null,
    bodyHistoryCount: window.__haochijiaGetBodyHistoryCount?.() || 0,
  };
}

function exportAllRecordsV30() {
  const payload = buildExportPayloadV30();
  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  downloadText(`${textV30('exportName')}-${dateStamp}.json`, JSON.stringify(payload, null, 2));
  showToastV30(textV30('exportOk'));
}

function normalizeImportedNumberV30(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const raw = String(value).trim();
  if (!raw) return null;
  const cleaned = raw.replace(/,/g, '').replace(/[^0-9.+-]/g, '');
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function normalizeImportedDateV30(value, fallbackIndex = 0) {
  if (value == null || value === '') return new Date(Date.now() - fallbackIndex * 60000).toISOString();
  if (typeof value === 'number' && Number.isFinite(value) && value > 30000 && value < 80000) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    const dt = new Date(epoch.getTime() + value * 86400000);
    return dt.toISOString();
  }
  const raw = String(value).trim();
  const direct = new Date(raw);
  if (!Number.isNaN(direct.getTime())) return direct.toISOString();
  const fromNumeric = Number(raw);
  if (Number.isFinite(fromNumeric) && fromNumeric > 30000 && fromNumeric < 80000) {
    const epoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(epoch.getTime() + fromNumeric * 86400000).toISOString();
  }
  return new Date(Date.now() - fallbackIndex * 60000).toISOString();
}

function aliasToFieldV30(sourceKey) {
  const normalized = normalizeAlias(sourceKey);
  return Object.entries(BODY_FIELD_ALIASES).find(([, aliases]) => aliases.includes(normalized))?.[0] || null;
}

function normalizeImportedRecordV30(input, index = 0) {
  if (!input || typeof input !== 'object') return null;
  const record = {};
  for (const [key, value] of Object.entries(input)) {
    const field = aliasToFieldV30(key);
    if (!field) continue;
    if (field === 'recordedAt') record.recordedAt = normalizeImportedDateV30(value, index);
    else if (field === 'stageTag' || field === 'note') record[field] = String(value || '').trim();
    else {
      const numeric = normalizeImportedNumberV30(value);
      if (numeric != null) record[field] = numeric;
    }
  }
  if (!record.recordedAt) record.recordedAt = normalizeImportedDateV30(null, index);
  const hasAnyMeasure = Object.keys(record).some((key) => !['recordedAt', 'stageTag', 'note'].includes(key));
  return hasAnyMeasure ? record : null;
}

function parseCsvV30(text) {
  const rows = [];
  let current = '';
  let row = [];
  let insideQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"') {
      if (insideQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }
    if (char === ',' && !insideQuotes) {
      row.push(current);
      current = '';
      continue;
    }
    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(current);
      if (row.some((cell) => String(cell || '').trim() !== '')) rows.push(row);
      row = [];
      current = '';
      continue;
    }
    current += char;
  }
  row.push(current);
  if (row.some((cell) => String(cell || '').trim() !== '')) rows.push(row);
  if (!rows.length) return [];
  const headers = rows[0].map((cell) => String(cell || '').trim());
  return rows.slice(1).map((cells) => {
    const out = {};
    headers.forEach((header, index) => {
      out[header] = cells[index] ?? '';
    });
    return out;
  });
}

function dedupeHistoryV30(records) {
  const seen = new Set();
  return records
    .filter(Boolean)
    .sort((a, b) => String(b.recordedAt || '').localeCompare(String(a.recordedAt || '')))
    .filter((record) => {
      const key = `${record.recordedAt || ''}|${record.heightCm || ''}|${record.weightKg || ''}|${record.waist || ''}|${record.hip || ''}|${record.note || ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function mergeBodyHistoryV30(imported) {
  const existing = tryJsonParse(localStorage.getItem('haochijia.body.history.v1'), []) || [];
  const merged = dedupeHistoryV30([...(Array.isArray(imported) ? imported : []), ...(Array.isArray(existing) ? existing : [])]);
  localStorage.setItem('haochijia.body.history.v1', JSON.stringify(merged));
  const latest = merged[0];
  if (latest) {
    const profile = tryJsonParse(localStorage.getItem('haochijia.profile.v4'), {}) || {};
    if (latest.heightCm != null) profile.heightCm = latest.heightCm;
    if (latest.weightKg != null) profile.weightKg = latest.weightKg;
    localStorage.setItem('haochijia.profile.v4', JSON.stringify(profile));
  }
  return merged;
}

async function handleBodyImportFileV30(event) {
  const file = event.target?.files?.[0];
  if (!file) return;
  try {
    const raw = await file.text();
    let rows;
    const trimmed = raw.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      const parsed = JSON.parse(trimmed);
      rows = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.history)
          ? parsed.history
          : Array.isArray(parsed.records)
            ? parsed.records
            : Array.isArray(parsed.items)
              ? parsed.items
              : [parsed];
    } else {
      rows = parseCsvV30(trimmed);
    }
    const normalized = rows.map((item, index) => normalizeImportedRecordV30(item, index)).filter(Boolean);
    if (!normalized.length) throw new Error('未识别到可导入的身体维度字段');
    mergeBodyHistoryV30(normalized);
    queueMirrorV30(0);
    showToastV30(textV30('importOk', { count: normalized.length }));
    setTimeout(() => window.location.reload(), 640);
  } catch (error) {
    console.warn(error);
    showToastV30(textV30('importFail', { message: error?.message || 'unknown error' }));
  } finally {
    if (event.target) event.target.value = '';
  }
}

function base64EncodeUtf8V30(input) {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function base64DecodeUtf8V30(input) {
  const binary = atob(input);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function loadGithubConfigV30() {
  return tryJsonParse(localStorage.getItem(V30_CORE.githubConfigKey), {}) || {};
}

function saveGithubConfigV30(config) {
  const snapshot = {
    owner: String(config.owner || '').trim(),
    repo: String(config.repo || '').trim(),
    branch: String(config.branch || '').trim() || 'main',
    path: String(config.path || '').trim() || 'backups/haochijia/latest.json',
  };
  localStorage.setItem(V30_CORE.githubConfigKey, JSON.stringify(snapshot));
  queueMirrorV30();
}

function ensureCloudModalV30() {
  if (document.getElementById('v30CloudModal')) return;
  const modal = document.createElement('div');
  modal.id = 'v30CloudModal';
  modal.className = 'v30-cloud-modal';
  modal.hidden = true;
  modal.innerHTML = `
    <div class="v30-cloud-backdrop" data-v30-cloud-close></div>
    <section class="card v30-cloud-panel" aria-modal="true" aria-labelledby="v30CloudTitle">
      <div class="section-head compact">
        <div>
          <p class="section-kicker">GitHub</p>
          <h2 id="v30CloudTitle"></h2>
          <p class="fold-summary-text" id="v30CloudHint"></p>
        </div>
        <button type="button" class="icon-btn" data-v30-cloud-close aria-label="close">×</button>
      </div>
      <div class="v30-cloud-grid">
        <label class="field"><span id="v30CloudOwnerLabel"></span><input id="v30GhOwner" type="text" autocomplete="off"></label>
        <label class="field"><span id="v30CloudRepoLabel"></span><input id="v30GhRepo" type="text" autocomplete="off"></label>
        <label class="field"><span id="v30CloudBranchLabel"></span><input id="v30GhBranch" type="text" autocomplete="off"></label>
        <label class="field full-span"><span id="v30CloudPathLabel"></span><input id="v30GhPath" type="text" autocomplete="off"></label>
        <label class="field full-span"><span id="v30CloudTokenLabel"></span><input id="v30GhToken" type="password" autocomplete="off"></label>
      </div>
      <div class="v30-cloud-actions">
        <button type="button" class="primary-btn" id="v30GhUploadBtn"></button>
        <button type="button" class="ghost-btn" id="v30GhRestoreBtn"></button>
        <button type="button" class="ghost-btn" data-v30-cloud-close id="v30GhCloseBtn"></button>
      </div>
      <div class="muted small v30-cloud-note" id="v30CloudTokenNote"></div>
      <div class="muted small v30-cloud-note" id="v30CloudRepoNote"></div>
      <div class="muted small v30-cloud-status" id="v30CloudStatus"></div>
    </section>
  `;
  document.body.appendChild(modal);
  renderCloudCopyV30();
  const config = loadGithubConfigV30();
  const owner = document.getElementById('v30GhOwner');
  const repo = document.getElementById('v30GhRepo');
  const branch = document.getElementById('v30GhBranch');
  const path = document.getElementById('v30GhPath');
  if (owner) owner.value = config.owner || '';
  if (repo) repo.value = config.repo || '';
  if (branch) branch.value = config.branch || 'main';
  if (path) path.value = config.path || 'backups/haochijia/latest.json';
  modal.addEventListener('click', (event) => {
    if (event.target.closest('[data-v30-cloud-close]')) closeCloudModalV30();
  });
  document.getElementById('v30GhUploadBtn')?.addEventListener('click', () => uploadGithubBackupV30());
  document.getElementById('v30GhRestoreBtn')?.addEventListener('click', () => restoreGithubBackupV30());
  ['v30GhOwner', 'v30GhRepo', 'v30GhBranch', 'v30GhPath'].forEach((id) => {
    document.getElementById(id)?.addEventListener('change', persistCloudConfigV30);
    document.getElementById(id)?.addEventListener('input', persistCloudConfigV30);
  });
}

function renderCloudCopyV30() {
  const map = {
    v30CloudTitle: textV30('cloudTitle'),
    v30CloudHint: textV30('cloudHint'),
    v30CloudOwnerLabel: textV30('owner'),
    v30CloudRepoLabel: textV30('repo'),
    v30CloudBranchLabel: textV30('branch'),
    v30CloudPathLabel: textV30('path'),
    v30CloudTokenLabel: textV30('token'),
    v30GhUploadBtn: textV30('upload'),
    v30GhRestoreBtn: textV30('restore'),
    v30GhCloseBtn: textV30('close'),
    v30CloudTokenNote: textV30('cloudTokenNote'),
    v30CloudRepoNote: textV30('cloudRepoNote'),
    v30CloudStatus: textV30('cloudIdle'),
  };
  Object.entries(map).forEach(([id, value]) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  });
}

function persistCloudConfigV30() {
  saveGithubConfigV30({
    owner: document.getElementById('v30GhOwner')?.value || '',
    repo: document.getElementById('v30GhRepo')?.value || '',
    branch: document.getElementById('v30GhBranch')?.value || 'main',
    path: document.getElementById('v30GhPath')?.value || 'backups/haochijia/latest.json',
  });
}

function openCloudModalV30() {
  ensureCloudModalV30();
  const modal = document.getElementById('v30CloudModal');
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add('v30-cloud-open');
}

function closeCloudModalV30() {
  const modal = document.getElementById('v30CloudModal');
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove('v30-cloud-open');
}

function githubConfigFromDomV30() {
  const config = {
    owner: document.getElementById('v30GhOwner')?.value?.trim() || '',
    repo: document.getElementById('v30GhRepo')?.value?.trim() || '',
    branch: document.getElementById('v30GhBranch')?.value?.trim() || 'main',
    path: document.getElementById('v30GhPath')?.value?.trim() || 'backups/haochijia/latest.json',
    token: document.getElementById('v30GhToken')?.value?.trim() || '',
  };
  saveGithubConfigV30(config);
  return config;
}

function setCloudStatusV30(message) {
  const node = document.getElementById('v30CloudStatus');
  if (node) node.textContent = message;
}

function githubApiUrlV30(config) {
  const path = String(config.path || '').split('/').map(encodeURIComponent).join('/');
  return `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${path}`;
}

function githubHeadersV30(token) {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function fetchGithubFileV30(config, mode = 'metadata') {
  const url = `${githubApiUrlV30(config)}?ref=${encodeURIComponent(config.branch || 'main')}`;
  const response = await fetch(url, { headers: githubHeadersV30(config.token) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub ${response.status}`);
  const json = await response.json();
  if (mode === 'content') {
    return { ...json, decoded: base64DecodeUtf8V30(String(json.content || '').replace(/\n/g, '')) };
  }
  return json;
}

async function uploadGithubBackupV30() {
  const config = githubConfigFromDomV30();
  if (!config.owner || !config.repo || !config.branch || !config.path || !config.token) {
    setCloudStatusV30(textV30('cloudNeedConfig'));
    return;
  }
  try {
    setCloudStatusV30('Uploading…');
    const existing = await fetchGithubFileV30(config).catch((error) => {
      if (/404/.test(String(error?.message || ''))) return null;
      throw error;
    });
    const payload = buildExportPayloadV30();
    const body = {
      message: `backup: ${V30_CORE.version} ${new Date().toISOString()}`,
      content: base64EncodeUtf8V30(JSON.stringify(payload, null, 2)),
      branch: config.branch,
    };
    if (existing?.sha) body.sha = existing.sha;
    const response = await fetch(githubApiUrlV30(config), {
      method: 'PUT',
      headers: githubHeadersV30(config.token),
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`GitHub ${response.status}`);
    setCloudStatusV30(textV30('cloudUploadDone'));
    showToastV30(textV30('cloudUploadDone'));
  } catch (error) {
    console.warn(error);
    setCloudStatusV30(String(error?.message || error));
  }
}

async function restoreGithubBackupV30() {
  const config = githubConfigFromDomV30();
  if (!config.owner || !config.repo || !config.branch || !config.path) {
    setCloudStatusV30(textV30('cloudNeedConfig'));
    return;
  }
  try {
    setCloudStatusV30('Restoring…');
    const file = await fetchGithubFileV30(config, 'content');
    if (!file?.decoded) throw new Error('GitHub backup file is empty');
    const payload = JSON.parse(file.decoded);
    const storage = payload?.storage;
    if (!storage || typeof storage !== 'object') throw new Error('Backup file format not recognized');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('haochijia.') && key !== V30_CORE.githubConfigKey) localStorage.removeItem(key);
    });
    Object.entries(storage).forEach(([key, value]) => {
      if (!key.startsWith('haochijia.')) return;
      if (typeof value !== 'string') return;
      localStorage.setItem(key, value);
    });
    queueMirrorV30(0);
    setCloudStatusV30(textV30('cloudRestoreDone'));
    showToastV30(textV30('cloudRestoreDone'));
    setTimeout(() => window.location.reload(), 680);
  } catch (error) {
    console.warn(error);
    setCloudStatusV30(String(error?.message || error));
  }
}

function ensureBodyModeClassesV30() {
  document.body.classList.add('v30-core-home');
  document.documentElement.classList.add('v30-core-home-doc');
}

function renderCoreUiV30() {
  ensureBodyModeClassesV30();
  ensureCoreDockV30();
  renderCoreCopyV30();
  enhanceHomeSearchCardV30();
  bindCoreActionsV30();
  ensureStageEnhancementsV30();
  renderAdaptiveFocusV30();
  patchBodyHubV30();
  repurposeHeaderButtonsV30();
  updateSaveStatusV30();
}

let renderQueuedV30 = 0;
function queueRenderCoreUiV30() {
  if (renderQueuedV30) return;
  renderQueuedV30 = window.requestAnimationFrame(() => {
    renderQueuedV30 = 0;
    renderCoreUiV30();
  });
}

async function initLocalDurabilityV30() {
  const restored = await restoreMirrorIfNeededV30();
  if (restored) {
    window.location.reload();
    return;
  }
  persistentGrantedV30 = await requestPersistentStorageV30();
  queueMirrorV30(0);
  window.setInterval(() => queueMirrorV30(0), 10000);
  document.addEventListener('input', () => queueMirrorV30(240), true);
  document.addEventListener('change', () => queueMirrorV30(120), true);
  window.addEventListener('pagehide', () => queueMirrorV30(0));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) queueMirrorV30(0);
  });
}

function bindLiveRefreshV30() {
  window.addEventListener('haochijia:body-sync', () => {
    queueRenderCoreUiV30();
    queueMirrorV30(0);
  });
  window.addEventListener('storage', queueRenderCoreUiV30);
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-body-view], #bodyOverlayToggle, [data-v27-nutrient], [data-water-add], [data-open-panel], .ghost-btn, .primary-btn')) {
      queueRenderCoreUiV30();
    }
  }, true);
  const observer = new MutationObserver(() => queueRenderCoreUiV30());
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

onReadyV30(() => {
  ensureBodyModeClassesV30();
  initLocalDurabilityV30().catch((error) => console.warn(error));
  bindLiveRefreshV30();
  queueRenderCoreUiV30();
});
