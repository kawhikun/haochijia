const BODY_STORAGE = {
  history: 'haochijia.body.history.v1',
  unit: 'haochijia.body.unit.v1',
  view: 'haochijia.body.view.v1',
};

const BODY_TEXTS = {
  zh: {
    heroKicker: '身体变化',
    heroTitle: '3D 体型变化中心',
    heroEmptyTitle: '先记一次身体数据',
    heroEmptySub: '记录体重、胸围、腰围、臀围和腿围后，这里会生成你的身体模型与变化对比。',
    recordDate: '最近记录',
    compare: '对比上一次',
    stage: '阶段',
    topChanges: '变化最明显',
    stable: '变化较平稳',
    addRecord: '新增身体记录',
    openHistory: '看历史趋势',
    currentWeight: '当前体重',
    bodyFat: '体脂',
    noBodyFat: '未记录体脂',
    front: '正面',
    side: '侧面',
    back: '背面',
    overlayOn: '显示上次轮廓',
    overlayOff: '隐藏上次轮廓',
    trend30: '30 天趋势',
    trend7: '7 天趋势',
    historyTitle: '身体记录',
    panelTitle: '身体围度与趋势',
    panelSummary: '支持局部补记、复制上一次、cm / inch 切换、本地保存和导出。',
    unitLabel: '围度单位',
    unitCm: '厘米 cm',
    unitIn: '英寸 in',
    copyLast: '复制上一次',
    saveRecord: '保存记录',
    clearForm: '清空表单',
    exportJson: '导出身体 JSON',
    exportCsv: '导出身体 CSV',
    noHistory: '还没有身体记录。',
    latestRecord: '最新记录',
    previousRecord: '上一次',
    emptyHistoryHint: '建议先记录体重、胸围、腰围、臀围、大腿和小腿。',
    quickCompare: '对比摘要',
    fieldsCore: '核心',
    fieldsTorso: '躯干',
    fieldsArms: '上肢',
    fieldsLegs: '下肢',
    fieldsMeta: '备注',
    fieldRecordedAt: '记录时间',
    fieldHeightCm: '身高',
    fieldWeightKg: '体重',
    fieldBodyFat: '体脂率',
    fieldNeck: '颈围',
    fieldShoulder: '肩宽 / 肩围感知',
    fieldChest: '胸围',
    fieldUnderbust: '下胸围',
    fieldWaist: '腰围',
    fieldAbdomen: '腹围 / 脐围',
    fieldHip: '臀围',
    fieldUpperArmL: '左上臂围',
    fieldUpperArmR: '右上臂围',
    fieldForearmL: '左前臂围',
    fieldForearmR: '右前臂围',
    fieldThighL: '左大腿围',
    fieldThighR: '右大腿围',
    fieldCalfL: '左小腿围',
    fieldCalfR: '右小腿围',
    fieldAnkleL: '左脚踝围',
    fieldAnkleR: '右脚踝围',
    fieldStageTag: '阶段标签',
    fieldNote: '备注',
    stageFatLoss: '减脂',
    stageGain: '增肌',
    stageMaintain: '维持',
    stageRecovery: '恢复',
    stageAuto: '跟随目标',
    placeholderNote: '例如：经期、浮肿、恢复差、训练泵感明显',
    saveOk: '身体记录已保存。',
    saveNeedAny: '至少填 1 项身体数据再保存。',
    copied: '已复制上一次记录。',
    cleared: '表单已清空。',
    deleted: '这条身体记录已删除。',
    delete: '删除',
    useThis: '载入',
    localOnly: '本地保存，不上传',
    fromLast: '相较上一次',
    deltaUp: '+{value}',
    deltaDown: '{value}',
    deltaFlat: '≈ 0',
    notEnough: '至少需要两次记录，才能显示变化。',
    noRecord: '暂无记录',
    historyList: '历史记录',
    latestHeroSub: '把身体变化放到首页第一视觉层，随时看到自己和上一次的差异。',
    dragTip: '拖动模型可切换视角',
    inferredStageFatLoss: '减脂推进中',
    inferredStageGain: '增肌推进中',
    inferredStageMaintain: '维持节奏',
    inferredStageRecovery: '恢复阶段',
    trendDown: '下降',
    trendUp: '上升',
    trendFlat: '基本持平',
    bodyModelLabel: '3D 体型',
    ghostLabel: '上次',
    currentLabel: '当前',
    summaryMissing: '有些部位这次没填，我已自动用最近记录补齐展示。',
  },
  en: {
    heroKicker: 'Body change',
    heroTitle: '3D body change center',
    heroEmptyTitle: 'Add your first body entry',
    heroEmptySub: 'Log weight, chest, waist, hips, and legs to generate your body model and change comparison.',
    recordDate: 'Latest record',
    compare: 'Compared with previous',
    stage: 'Stage',
    topChanges: 'Most visible changes',
    stable: 'Mostly stable',
    addRecord: 'Add body record',
    openHistory: 'View history',
    currentWeight: 'Current weight',
    bodyFat: 'Body fat',
    noBodyFat: 'Body fat not logged',
    front: 'Front',
    side: 'Side',
    back: 'Back',
    overlayOn: 'Show previous outline',
    overlayOff: 'Hide previous outline',
    trend30: '30-day trend',
    trend7: '7-day trend',
    historyTitle: 'Body records',
    panelTitle: 'Body measurements and trends',
    panelSummary: 'Supports partial entries, copy-last, cm/in switch, local save, and export.',
    unitLabel: 'Measurement unit',
    unitCm: 'Centimeter cm',
    unitIn: 'Inch in',
    copyLast: 'Copy previous',
    saveRecord: 'Save record',
    clearForm: 'Clear form',
    exportJson: 'Export body JSON',
    exportCsv: 'Export body CSV',
    noHistory: 'No body records yet.',
    latestRecord: 'Latest',
    previousRecord: 'Previous',
    emptyHistoryHint: 'A good start is weight, chest, waist, hips, thigh, and calf.',
    quickCompare: 'Comparison',
    fieldsCore: 'Core',
    fieldsTorso: 'Torso',
    fieldsArms: 'Arms',
    fieldsLegs: 'Legs',
    fieldsMeta: 'Notes',
    fieldRecordedAt: 'Record time',
    fieldHeightCm: 'Height',
    fieldWeightKg: 'Weight',
    fieldBodyFat: 'Body fat',
    fieldNeck: 'Neck',
    fieldShoulder: 'Shoulder width / span',
    fieldChest: 'Chest',
    fieldUnderbust: 'Underbust',
    fieldWaist: 'Waist',
    fieldAbdomen: 'Abdomen / navel',
    fieldHip: 'Hips',
    fieldUpperArmL: 'Left upper arm',
    fieldUpperArmR: 'Right upper arm',
    fieldForearmL: 'Left forearm',
    fieldForearmR: 'Right forearm',
    fieldThighL: 'Left thigh',
    fieldThighR: 'Right thigh',
    fieldCalfL: 'Left calf',
    fieldCalfR: 'Right calf',
    fieldAnkleL: 'Left ankle',
    fieldAnkleR: 'Right ankle',
    fieldStageTag: 'Stage tag',
    fieldNote: 'Notes',
    stageFatLoss: 'Fat loss',
    stageGain: 'Muscle gain',
    stageMaintain: 'Maintain',
    stageRecovery: 'Recovery',
    stageAuto: 'Follow goal',
    placeholderNote: 'For example: cycle, bloating, poor recovery, strong pump',
    saveOk: 'Body record saved.',
    saveNeedAny: 'Add at least one body metric before saving.',
    copied: 'Copied the previous record.',
    cleared: 'Form cleared.',
    deleted: 'Body record deleted.',
    delete: 'Delete',
    useThis: 'Load',
    localOnly: 'Saved locally only',
    fromLast: 'vs previous',
    deltaUp: '+{value}',
    deltaDown: '{value}',
    deltaFlat: '≈ 0',
    notEnough: 'At least two records are needed to show changes.',
    noRecord: 'No records yet',
    historyList: 'History',
    latestHeroSub: 'Put body change at the top of the home screen so the difference from last time is always visible.',
    dragTip: 'Drag the model to change the view',
    inferredStageFatLoss: 'Fat loss moving',
    inferredStageGain: 'Muscle gain moving',
    inferredStageMaintain: 'Maintenance rhythm',
    inferredStageRecovery: 'Recovery phase',
    trendDown: 'down',
    trendUp: 'up',
    trendFlat: 'flat',
    bodyModelLabel: '3D body',
    ghostLabel: 'Previous',
    currentLabel: 'Current',
    summaryMissing: 'Some parts were not filled this time, so the display is completed from your recent history.',
  },
  es: {
    heroKicker: 'Cambio corporal',
    heroTitle: 'Centro 3D del cuerpo',
    heroEmptyTitle: 'Añade tu primer registro corporal',
    heroEmptySub: 'Registra peso, pecho, cintura, cadera y piernas para generar el modelo corporal y la comparación.',
    recordDate: 'Último registro',
    compare: 'Comparado con el anterior',
    stage: 'Etapa',
    topChanges: 'Cambios más visibles',
    stable: 'Bastante estable',
    addRecord: 'Añadir registro corporal',
    openHistory: 'Ver historial',
    currentWeight: 'Peso actual',
    bodyFat: 'Grasa corporal',
    noBodyFat: 'Sin dato de grasa corporal',
    front: 'Frente',
    side: 'Lado',
    back: 'Espalda',
    overlayOn: 'Mostrar contorno previo',
    overlayOff: 'Ocultar contorno previo',
    trend30: 'Tendencia 30 días',
    trend7: 'Tendencia 7 días',
    historyTitle: 'Registros corporales',
    panelTitle: 'Medidas corporales y tendencias',
    panelSummary: 'Admite registros parciales, copiar el anterior, cambiar cm/in, guardado local y exportación.',
    unitLabel: 'Unidad',
    unitCm: 'Centímetros cm',
    unitIn: 'Pulgadas in',
    copyLast: 'Copiar anterior',
    saveRecord: 'Guardar registro',
    clearForm: 'Limpiar formulario',
    exportJson: 'Exportar JSON corporal',
    exportCsv: 'Exportar CSV corporal',
    noHistory: 'Todavía no hay registros corporales.',
    latestRecord: 'Último',
    previousRecord: 'Anterior',
    emptyHistoryHint: 'Buen comienzo: peso, pecho, cintura, cadera, muslo y pantorrilla.',
    quickCompare: 'Comparación',
    fieldsCore: 'Núcleo',
    fieldsTorso: 'Torso',
    fieldsArms: 'Brazos',
    fieldsLegs: 'Piernas',
    fieldsMeta: 'Notas',
    fieldRecordedAt: 'Momento del registro',
    fieldHeightCm: 'Altura',
    fieldWeightKg: 'Peso',
    fieldBodyFat: 'Grasa corporal',
    fieldNeck: 'Cuello',
    fieldShoulder: 'Hombros / amplitud',
    fieldChest: 'Pecho',
    fieldUnderbust: 'Bajo pecho',
    fieldWaist: 'Cintura',
    fieldAbdomen: 'Abdomen / ombligo',
    fieldHip: 'Cadera',
    fieldUpperArmL: 'Brazo izq.',
    fieldUpperArmR: 'Brazo der.',
    fieldForearmL: 'Antebrazo izq.',
    fieldForearmR: 'Antebrazo der.',
    fieldThighL: 'Muslo izq.',
    fieldThighR: 'Muslo der.',
    fieldCalfL: 'Pantorrilla izq.',
    fieldCalfR: 'Pantorrilla der.',
    fieldAnkleL: 'Tobillo izq.',
    fieldAnkleR: 'Tobillo der.',
    fieldStageTag: 'Etiqueta de etapa',
    fieldNote: 'Notas',
    stageFatLoss: 'Pérdida de grasa',
    stageGain: 'Ganancia muscular',
    stageMaintain: 'Mantener',
    stageRecovery: 'Recuperación',
    stageAuto: 'Seguir objetivo',
    placeholderNote: 'Por ejemplo: ciclo, hinchazón, mala recuperación, gran congestión',
    saveOk: 'Registro corporal guardado.',
    saveNeedAny: 'Añade al menos una medida corporal antes de guardar.',
    copied: 'Se copió el registro anterior.',
    cleared: 'Formulario limpiado.',
    deleted: 'Registro corporal eliminado.',
    delete: 'Eliminar',
    useThis: 'Cargar',
    localOnly: 'Guardado local',
    fromLast: 'vs anterior',
    deltaUp: '+{value}',
    deltaDown: '{value}',
    deltaFlat: '≈ 0',
    notEnough: 'Se necesitan al menos dos registros para mostrar cambios.',
    noRecord: 'Aún no hay registros',
    historyList: 'Historial',
    latestHeroSub: 'Lleva el cambio corporal a la primera capa visual de la portada para ver siempre la diferencia con la vez anterior.',
    dragTip: 'Arrastra el modelo para cambiar la vista',
    inferredStageFatLoss: 'Pérdida de grasa en marcha',
    inferredStageGain: 'Ganancia muscular en marcha',
    inferredStageMaintain: 'Ritmo de mantenimiento',
    inferredStageRecovery: 'Fase de recuperación',
    trendDown: 'baja',
    trendUp: 'sube',
    trendFlat: 'estable',
    bodyModelLabel: 'Cuerpo 3D',
    ghostLabel: 'Anterior',
    currentLabel: 'Actual',
    summaryMissing: 'Algunas partes no se registraron hoy; la visualización se completó con tu historial reciente.',
  },
};

const BODY_FIELDS = [
  { id: 'recordedAt', type: 'datetime-local', group: 'core' },
  { id: 'heightCm', type: 'number', group: 'core', step: '0.1', unit: 'cm' },
  { id: 'weightKg', type: 'number', group: 'core', step: '0.1', unit: 'kg' },
  { id: 'bodyFat', type: 'number', group: 'core', step: '0.1', unit: '%' },
  { id: 'neck', type: 'number', group: 'torso', step: '0.1', unit: 'measure' },
  { id: 'shoulder', type: 'number', group: 'torso', step: '0.1', unit: 'measure' },
  { id: 'chest', type: 'number', group: 'torso', step: '0.1', unit: 'measure' },
  { id: 'underbust', type: 'number', group: 'torso', step: '0.1', unit: 'measure' },
  { id: 'waist', type: 'number', group: 'torso', step: '0.1', unit: 'measure' },
  { id: 'abdomen', type: 'number', group: 'torso', step: '0.1', unit: 'measure' },
  { id: 'hip', type: 'number', group: 'torso', step: '0.1', unit: 'measure' },
  { id: 'upperArmL', type: 'number', group: 'arms', step: '0.1', unit: 'measure' },
  { id: 'upperArmR', type: 'number', group: 'arms', step: '0.1', unit: 'measure' },
  { id: 'forearmL', type: 'number', group: 'arms', step: '0.1', unit: 'measure' },
  { id: 'forearmR', type: 'number', group: 'arms', step: '0.1', unit: 'measure' },
  { id: 'thighL', type: 'number', group: 'legs', step: '0.1', unit: 'measure' },
  { id: 'thighR', type: 'number', group: 'legs', step: '0.1', unit: 'measure' },
  { id: 'calfL', type: 'number', group: 'legs', step: '0.1', unit: 'measure' },
  { id: 'calfR', type: 'number', group: 'legs', step: '0.1', unit: 'measure' },
  { id: 'ankleL', type: 'number', group: 'legs', step: '0.1', unit: 'measure' },
  { id: 'ankleR', type: 'number', group: 'legs', step: '0.1', unit: 'measure' },
  { id: 'stageTag', type: 'select', group: 'meta' },
  { id: 'note', type: 'text', group: 'meta' },
];

const DELTA_FIELDS = [
  'waist', 'abdomen', 'hip', 'chest', 'upperArmL', 'upperArmR', 'thighL', 'thighR', 'calfL', 'calfR', 'weightKg', 'bodyFat',
];

const HERO_HTML = `
  <section class="card body-hero-card" id="bodyHeroCard">
    <div class="body-hero-head section-head compact">
      <div>
        <p class="section-kicker" data-body-text="heroKicker"></p>
        <h2 data-body-text="heroTitle"></h2>
        <p class="fold-summary-text body-hero-copy" id="bodyHeroCopy"></p>
      </div>
      <span class="top-pill subtle body-local-pill" id="bodyLocalPill"></span>
    </div>
    <div class="body-hero-grid">
      <div class="body-model-panel">
        <div class="body-model-stage-wrap">
          <div class="body-model-labels">
            <span class="body-model-label current" id="bodyCurrentLabel"></span>
            <span class="body-model-label ghost" id="bodyGhostLabel"></span>
          </div>
          <canvas id="bodySceneCanvas" class="body-scene-canvas" width="680" height="880"></canvas>
          <div class="body-stage-empty" id="bodyStageEmpty" hidden></div>
        </div>
        <div class="body-model-controls">
          <div class="body-view-switch" id="bodyViewSwitch">
            <button type="button" class="ghost-btn compact-btn" data-body-view="0">前视图</button>
            <button type="button" class="ghost-btn compact-btn" data-body-view="90">侧视图</button>
            <button type="button" class="ghost-btn compact-btn" data-body-view="180">后视图</button>
          </div>
          <button type="button" class="ghost-btn compact-btn" id="bodyOverlayToggle">对比层</button>
        </div>
        <div class="muted small body-drag-tip" id="bodyDragTip"></div>
      </div>
      <div class="body-summary-panel">
        <div class="body-summary-grid">
          <article class="body-summary-tile emphasis">
            <span class="body-tile-label" data-body-text="recordDate"></span>
            <strong id="bodyLatestDate"></strong>
            <span id="bodyStageText"></span>
          </article>
          <article class="body-summary-tile">
            <span class="body-tile-label" data-body-text="currentWeight"></span>
            <strong id="bodyCurrentWeight"></strong>
            <span id="bodyCurrentFat"></span>
          </article>
          <article class="body-summary-tile">
            <span class="body-tile-label" data-body-text="trend30"></span>
            <strong id="bodyTrendText"></strong>
            <span id="bodyTrendSub"></span>
          </article>
        </div>
        <div class="body-compare-block">
          <div class="body-compare-head">
            <div>
              <div class="mini-title" data-body-text="quickCompare"></div>
              <div class="muted small" id="bodyCompareHint"></div>
            </div>
            <span class="top-pill subtle" id="bodyComparePill"></span>
          </div>
          <div class="body-delta-chips" id="bodyDeltaChips"></div>
        </div>
        <div class="body-cta-row">
          <button type="button" class="primary-btn" id="bodyAddRecordBtn">记录新围度</button>
          <button type="button" class="ghost-btn" id="bodyViewHistoryBtn">查看历史记录</button>
        </div>
        <div class="body-inline-note" id="bodyMissingHint" hidden></div>
      </div>
    </div>
  </section>
`;

const PANEL_HTML = `
  <section class="fold-card card body-panel-card" id="bodyPanelCard">
    <header class="fold-header body-panel-head">
      <div>
        <p class="section-kicker" data-body-text="historyTitle"></p>
        <h2 data-body-text="panelTitle"></h2>
        <p class="fold-summary-text" data-body-text="panelSummary"></p>
      </div>
      <div class="body-panel-top-actions">
        <label class="header-select body-unit-select">
          <span data-body-text="unitLabel"></span>
          <select id="bodyUnitSelect">
            <option value="cm"></option>
            <option value="in"></option>
          </select>
        </label>
        <button type="button" class="ghost-btn" id="bodyCopyBtn">复制上一次记录</button>
      </div>
    </header>
    <div class="fold-body body-panel-body">
      <form id="bodyRecordForm" class="body-form-grid" autocomplete="off"></form>
      <div class="body-form-actions">
        <button type="button" class="primary-btn" id="bodySaveBtn">保存这次身体记录</button>
        <button type="button" class="ghost-btn" id="bodyClearBtn">清空当前输入</button>
        <button type="button" class="ghost-btn" id="bodyExportJsonBtn">导出 JSON</button>
        <button type="button" class="ghost-btn" id="bodyExportCsvBtn">导出 CSV</button>
      </div>
      <div class="muted small body-form-status" id="bodyFormStatus"></div>
      <div class="body-history-shell">
        <div class="mini-title" data-body-text="historyList"></div>
        <div class="body-history-list" id="bodyHistoryList"></div>
      </div>
    </div>
  </section>
`;

const bodyState = {
  history: loadBodyHistory(),
  unit: loadBodyUnit(),
  view: loadBodyView(),
  overlay: true,
  scene: null,
  nodes: {},
  initialized: false,
};

document.addEventListener('DOMContentLoaded', initBodyModule);

function initBodyModule() {
  if (bodyState.initialized) return;
  const main = document.querySelector('.main-stack');
  if (!main) return;
  const firstSection = main.querySelector('.overview-grid');
  if (firstSection && !document.getElementById('bodyHeroCard')) {
    firstSection.insertAdjacentHTML('beforebegin', HERO_HTML);
  }
  const profilePanel = document.getElementById('profilePanel');
  if (profilePanel && !document.getElementById('bodyPanelCard')) {
    profilePanel.insertAdjacentHTML('beforebegin', PANEL_HTML);
  }
  bindBodyNodes();
  renderBodyForm();
  bindBodyEvents();
  applyBodyTexts();
  bodyState.scene = createBodyScene(bodyState.nodes.canvas);
  renderBodyModule();
  bodyState.initialized = true;
}

function bindBodyNodes() {
  bodyState.nodes = {
    hero: document.getElementById('bodyHeroCard'),
    panel: document.getElementById('bodyPanelCard'),
    canvas: document.getElementById('bodySceneCanvas'),
    stageEmpty: document.getElementById('bodyStageEmpty'),
    localPill: document.getElementById('bodyLocalPill'),
    heroCopy: document.getElementById('bodyHeroCopy'),
    currentLabel: document.getElementById('bodyCurrentLabel'),
    ghostLabel: document.getElementById('bodyGhostLabel'),
    latestDate: document.getElementById('bodyLatestDate'),
    stageText: document.getElementById('bodyStageText'),
    currentWeight: document.getElementById('bodyCurrentWeight'),
    currentFat: document.getElementById('bodyCurrentFat'),
    trendText: document.getElementById('bodyTrendText'),
    trendSub: document.getElementById('bodyTrendSub'),
    compareHint: document.getElementById('bodyCompareHint'),
    comparePill: document.getElementById('bodyComparePill'),
    deltaChips: document.getElementById('bodyDeltaChips'),
    addBtn: document.getElementById('bodyAddRecordBtn'),
    viewHistoryBtn: document.getElementById('bodyViewHistoryBtn'),
    missingHint: document.getElementById('bodyMissingHint'),
    overlayToggle: document.getElementById('bodyOverlayToggle'),
    viewSwitch: document.getElementById('bodyViewSwitch'),
    dragTip: document.getElementById('bodyDragTip'),
    form: document.getElementById('bodyRecordForm'),
    formStatus: document.getElementById('bodyFormStatus'),
    unitSelect: document.getElementById('bodyUnitSelect'),
    copyBtn: document.getElementById('bodyCopyBtn'),
    saveBtn: document.getElementById('bodySaveBtn'),
    clearBtn: document.getElementById('bodyClearBtn'),
    exportJsonBtn: document.getElementById('bodyExportJsonBtn'),
    exportCsvBtn: document.getElementById('bodyExportCsvBtn'),
    historyList: document.getElementById('bodyHistoryList'),
  };
}

function bindBodyEvents() {
  const { addBtn, viewHistoryBtn, saveBtn, clearBtn, exportJsonBtn, exportCsvBtn, copyBtn, unitSelect, viewSwitch, overlayToggle, historyList } = bodyState.nodes;
  addBtn?.addEventListener('click', () => scrollToBodyPanel(true));
  viewHistoryBtn?.addEventListener('click', () => scrollToBodyPanel(false));
  saveBtn?.addEventListener('click', saveBodyRecord);
  clearBtn?.addEventListener('click', clearBodyForm);
  exportJsonBtn?.addEventListener('click', exportBodyJson);
  exportCsvBtn?.addEventListener('click', exportBodyCsv);
  copyBtn?.addEventListener('click', copyLastBodyRecord);
  unitSelect?.addEventListener('change', onUnitChange);
  overlayToggle?.addEventListener('click', () => {
    bodyState.overlay = !bodyState.overlay;
    renderBodyModule();
  });
  viewSwitch?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-body-view]');
    if (!btn) return;
    bodyState.view = Number(btn.dataset.bodyView) || 0;
    saveBodyView();
    bodyState.scene?.setAngle(bodyState.view);
    updateBodyViewButtons();
  });
  historyList?.addEventListener('click', onHistoryListClick);
  document.getElementById('languageSelect')?.addEventListener('change', () => {
    applyBodyTexts();
    renderBodyModule();
  });
  window.addEventListener('resize', () => bodyState.scene?.draw(bodyState.scene?.snapshot || null), { passive: true });
  const headerRow = document.querySelector('.header-quick-row');
  if (headerRow && !headerRow.querySelector('[data-body-open]')) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ghost-btn compact-btn';
    btn.setAttribute('data-body-open', 'panel');
    btn.textContent = currentLang() === 'zh' ? '记身体' : currentLang() === 'es' ? 'Cuerpo' : 'Body log';
    btn.addEventListener('click', () => scrollToBodyPanel(true));
    headerRow.prepend(btn);
  }
}

function onHistoryListClick(event) {
  const useBtn = event.target.closest('[data-body-load]');
  const deleteBtn = event.target.closest('[data-body-delete]');
  if (!useBtn && !deleteBtn) return;
  const idx = Number(useBtn?.dataset.bodyLoad ?? deleteBtn?.dataset.bodyDelete);
  const record = bodyState.history[idx];
  if (!record) return;
  if (deleteBtn) {
    bodyState.history.splice(idx, 1);
    saveBodyHistory();
    renderBodyModule();
    setBodyStatus(T('deleted'));
    return;
  }
  fillBodyForm(record);
  scrollToBodyPanel(true);
}

function renderBodyForm() {
  const groups = ['core', 'torso', 'arms', 'legs', 'meta'];
  const titles = {
    core: T('fieldsCore'),
    torso: T('fieldsTorso'),
    arms: T('fieldsArms'),
    legs: T('fieldsLegs'),
    meta: T('fieldsMeta'),
  };
  bodyState.nodes.form.innerHTML = groups.map((group) => {
    const fields = BODY_FIELDS.filter((field) => field.group === group);
    return `
      <section class="body-field-group ${group === 'meta' ? 'body-field-group-wide' : ''}">
        <div class="group-title">${escapeHtml(titles[group])}</div>
        <div class="body-field-group-grid ${group === 'meta' ? 'body-field-group-grid-wide' : ''}">
          ${fields.map(renderBodyField).join('')}
        </div>
      </section>`;
  }).join('');
  bodyState.nodes.unitSelect.innerHTML = `
    <option value="cm">${escapeHtml(T('unitCm'))}</option>
    <option value="in">${escapeHtml(T('unitIn'))}</option>`;
  bodyState.nodes.unitSelect.value = bodyState.unit;
  fillBodyForm(bodyState.history[0] || seedRecordFromProfile());
}

function renderBodyField(field) {
  const label = escapeHtml(T(`field${field.id.charAt(0).toUpperCase()}${field.id.slice(1)}`));
  const unitLabel = field.unit === 'measure'
    ? (bodyState.unit === 'in' ? 'in' : 'cm')
    : (field.unit || '');
  if (field.type === 'select') {
    return `
      <label class="field body-field ${field.id === 'note' ? 'full-span' : ''}">
        <span>${label}</span>
        <select data-body-field="${field.id}">
          <option value="auto">${escapeHtml(T('stageAuto'))}</option>
          <option value="fatLoss">${escapeHtml(T('stageFatLoss'))}</option>
          <option value="gain">${escapeHtml(T('stageGain'))}</option>
          <option value="maintain">${escapeHtml(T('stageMaintain'))}</option>
          <option value="recovery">${escapeHtml(T('stageRecovery'))}</option>
        </select>
      </label>`;
  }
  if (field.type === 'text') {
    return `
      <label class="field body-field full-span">
        <span>${label}</span>
        <input type="text" data-body-field="${field.id}" placeholder="${escapeHtml(T('placeholderNote'))}">
      </label>`;
  }
  return `
    <label class="field body-field ${field.id === 'recordedAt' ? 'full-span' : ''}">
      <span>${label}${unitLabel ? ` <em>${escapeHtml(unitLabel)}</em>` : ''}</span>
      <input type="${field.type}" step="${field.step || '1'}" data-body-field="${field.id}">
    </label>`;
}

function renderBodyModule() {
  applyBodyTexts();
  updateBodyViewButtons();
  const snapshot = buildBodySnapshot();
  renderBodyHero(snapshot);
  renderBodyHistory(snapshot);
  bodyState.scene?.draw(snapshot);
}

function renderBodyHero(snapshot) {
  const lang = currentLang();
  bodyState.nodes.localPill.textContent = T('localOnly');
  bodyState.nodes.currentLabel.textContent = T('currentLabel');
  bodyState.nodes.ghostLabel.textContent = T('ghostLabel');
  bodyState.nodes.dragTip.textContent = T('dragTip');
  bodyState.nodes.addBtn.textContent = T('addRecord');
  bodyState.nodes.viewHistoryBtn.textContent = T('openHistory');
  bodyState.nodes.overlayToggle.textContent = bodyState.overlay ? T('overlayOff') : T('overlayOn');

  if (!snapshot.current) {
    bodyState.nodes.heroCopy.textContent = T('heroEmptySub');
    bodyState.nodes.latestDate.textContent = T('noRecord');
    bodyState.nodes.stageText.textContent = '';
    bodyState.nodes.currentWeight.textContent = '—';
    bodyState.nodes.currentFat.textContent = T('noBodyFat');
    bodyState.nodes.trendText.textContent = '—';
    bodyState.nodes.trendSub.textContent = T('emptyHistoryHint');
    bodyState.nodes.compareHint.textContent = T('notEnough');
    bodyState.nodes.comparePill.textContent = T('stable');
    bodyState.nodes.deltaChips.innerHTML = `<span class="body-empty-chip">${escapeHtml(T('heroEmptyTitle'))}</span>`;
    bodyState.nodes.stageEmpty.hidden = false;
    bodyState.nodes.stageEmpty.textContent = T('heroEmptyTitle');
    bodyState.nodes.missingHint.hidden = true;
    return;
  }
  bodyState.nodes.stageEmpty.hidden = true;
  bodyState.nodes.heroCopy.textContent = T('latestHeroSub');
  bodyState.nodes.latestDate.textContent = formatBodyDate(snapshot.current.recordedAt, lang);
  bodyState.nodes.stageText.textContent = stageLabel(snapshot.current.stageTag || snapshot.inferredStage);
  bodyState.nodes.currentWeight.textContent = snapshot.current.weightKg ? `${round1(snapshot.current.weightKg)} kg` : '—';
  bodyState.nodes.currentFat.textContent = snapshot.current.bodyFat ? `${T('bodyFat')} ${round1(snapshot.current.bodyFat)}%` : T('noBodyFat');
  bodyState.nodes.comparePill.textContent = snapshot.previous ? T('compare') : T('stable');
  bodyState.nodes.compareHint.textContent = snapshot.previous ? `${T('fromLast')} · ${formatBodyDate(snapshot.previous.recordedAt, lang)}` : T('notEnough');
  bodyState.nodes.trendText.textContent = trendText(snapshot.trend30);
  bodyState.nodes.trendSub.textContent = snapshot.trend30 ? trendSubText(snapshot.trend30) : T('emptyHistoryHint');
  bodyState.nodes.deltaChips.innerHTML = renderDeltaChips(snapshot);
  const hasMissing = Boolean(snapshot.missingFields?.length);
  bodyState.nodes.missingHint.hidden = !hasMissing;
  bodyState.nodes.missingHint.textContent = hasMissing ? T('summaryMissing') : '';
}

function renderDeltaChips(snapshot) {
  const deltas = topBodyDeltas(snapshot.current, snapshot.previous, 6);
  if (!deltas.length) return `<span class="body-empty-chip">${escapeHtml(T('stable'))}</span>`;
  return deltas.map((item) => {
    const tone = item.delta > 0 ? 'up' : item.delta < 0 ? 'down' : 'flat';
    return `<button type="button" class="body-delta-chip tone-${tone}" data-body-focus="${escapeHtml(item.id)}"><strong>${escapeHtml(fieldShortLabel(item.id))}</strong><span>${escapeHtml(formatDelta(item.delta, item.unit))}</span></button>`;
  }).join('');
}

function renderBodyHistory(snapshot) {
  if (!bodyState.nodes.historyList) return;
  if (!bodyState.history.length) {
    bodyState.nodes.historyList.innerHTML = `<div class="empty-state">${escapeHtml(T('noHistory'))}</div>`;
    return;
  }
  bodyState.nodes.historyList.innerHTML = bodyState.history.slice(0, 8).map((record, idx) => {
    const summary = summarizeHistoryItem(record, idx === 0 ? snapshot.previous : bodyState.history[idx + 1]);
    return `
      <article class="body-history-item ${idx === 0 ? 'latest' : ''}">
        <div class="body-history-main">
          <div class="body-history-top">
            <strong>${escapeHtml(formatBodyDate(record.recordedAt, currentLang()))}</strong>
            <span class="top-pill subtle">${escapeHtml(idx === 0 ? T('latestRecord') : T('previousRecord'))}</span>
          </div>
          <div class="body-history-summary">${escapeHtml(summary)}</div>
          ${record.note ? `<div class="body-history-note">${escapeHtml(record.note)}</div>` : ''}
        </div>
        <div class="body-history-actions">
          <button type="button" class="ghost-btn compact-btn" data-body-load="${idx}">${escapeHtml(T('useThis'))}</button>
          <button type="button" class="ghost-btn compact-btn danger" data-body-delete="${idx}">${escapeHtml(T('delete'))}</button>
        </div>
      </article>`;
  }).join('');
}

function summarizeHistoryItem(record, previous) {
  const parts = [];
  if (record.weightKg) parts.push(`${T('currentWeight')} ${round1(record.weightKg)} kg`);
  if (record.waist) parts.push(`${fieldShortLabel('waist')} ${formatMeasure(record.waist)}`);
  if (record.hip) parts.push(`${fieldShortLabel('hip')} ${formatMeasure(record.hip)}`);
  if (previous) {
    const biggest = topBodyDeltas(record, previous, 1)[0];
    if (biggest && Math.abs(biggest.delta) >= 0.3) parts.push(`${fieldShortLabel(biggest.id)} ${formatDelta(biggest.delta, biggest.unit)}`);
  }
  return parts.join(' · ') || T('emptyHistoryHint');
}

function updateBodyViewButtons() {
  bodyState.nodes.viewSwitch?.querySelectorAll('[data-body-view]').forEach((btn) => {
    const value = Number(btn.dataset.bodyView);
    btn.textContent = value === 0 ? T('front') : value === 90 ? T('side') : T('back');
    btn.classList.toggle('is-active', value === bodyState.view);
  });
  bodyState.nodes.overlayToggle?.classList.toggle('is-active', bodyState.overlay);
}

function applyBodyTexts() {
  document.querySelectorAll('[data-body-text]').forEach((node) => {
    node.textContent = T(node.getAttribute('data-body-text'));
  });
  const headerBodyBtn = document.querySelector('[data-body-open]');
  if (headerBodyBtn) headerBodyBtn.textContent = currentLang() === 'zh' ? '记身体' : currentLang() === 'es' ? 'Cuerpo' : 'Body log';
}

function scrollToBodyPanel(focusFirst) {
  bodyState.nodes.panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (focusFirst) {
    setTimeout(() => bodyState.nodes.form?.querySelector('[data-body-field="weightKg"]')?.focus(), 220);
  }
}

function copyLastBodyRecord() {
  const latest = bodyState.history[0];
  if (!latest) {
    setBodyStatus(T('noHistory'));
    return;
  }
  fillBodyForm({ ...latest, recordedAt: toLocalDateTimeInput(new Date()) });
  setBodyStatus(T('copied'));
}

function clearBodyForm() {
  fillBodyForm(seedRecordFromProfile());
  setBodyStatus(T('cleared'));
}

function onUnitChange() {
  const oldUnit = bodyState.unit;
  const nextUnit = bodyState.nodes.unitSelect.value === 'in' ? 'in' : 'cm';
  if (oldUnit === nextUnit) return;
  const draft = readBodyForm();
  bodyState.unit = nextUnit;
  saveBodyUnit();
  renderBodyForm();
  fillBodyForm({ ...seedRecordFromProfile(), ...draft });
  setBodyStatus(nextUnit === 'in' ? T('unitIn') : T('unitCm'));
}

function convertVisibleMeasureInputs(oldUnit, nextUnit) {
  if (!bodyState.nodes.form) return;
  const factor = oldUnit === 'cm' && nextUnit === 'in' ? 1 / 2.54 : 2.54;
  bodyState.nodes.form.querySelectorAll('[data-body-field]').forEach((input) => {
    const field = BODY_FIELDS.find((item) => item.id === input.dataset.bodyField);
    if (!field || field.unit !== 'measure' || !input.value) return;
    const value = Number(input.value);
    if (!Number.isFinite(value)) return;
    input.value = round1(value * factor);
  });
}

function saveBodyRecord() {
  const draft = readBodyForm();
  const hasAny = BODY_FIELDS.some((field) => ['select', 'text', 'datetime-local'].includes(field.type) ? false : Number.isFinite(draft[field.id]));
  if (!hasAny) {
    setBodyStatus(T('saveNeedAny'));
    return;
  }
  draft.id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  if (!draft.recordedAt) draft.recordedAt = new Date().toISOString();
  else draft.recordedAt = new Date(draft.recordedAt).toISOString();
  bodyState.history.unshift(draft);
  bodyState.history = bodyState.history.sort((a, b) => String(b.recordedAt).localeCompare(String(a.recordedAt)));
  saveBodyHistory();
  fillBodyForm({ ...draft, recordedAt: toLocalDateTimeInput(new Date()) });
  renderBodyModule();
  setBodyStatus(T('saveOk'));
}

function readBodyForm() {
  const out = {};
  bodyState.nodes.form.querySelectorAll('[data-body-field]').forEach((input) => {
    const id = input.dataset.bodyField;
    const meta = BODY_FIELDS.find((field) => field.id === id);
    if (!meta) return;
    if (meta.type === 'select') {
      out[id] = input.value || 'auto';
      return;
    }
    if (meta.type === 'text') {
      if (String(input.value || '').trim()) out[id] = String(input.value).trim();
      return;
    }
    if (meta.type === 'datetime-local') {
      if (input.value) out[id] = input.value;
      return;
    }
    const num = Number(input.value);
    if (!Number.isFinite(num) || num <= 0) return;
    if (meta.unit === 'measure') {
      out[id] = bodyState.unit === 'in' ? round1(num * 2.54) : round1(num);
    } else {
      out[id] = round1(num);
    }
  });
  return out;
}

function fillBodyForm(record) {
  bodyState.nodes.form?.querySelectorAll('[data-body-field]').forEach((input) => {
    const id = input.dataset.bodyField;
    const meta = BODY_FIELDS.find((field) => field.id === id);
    if (!meta) return;
    if (meta.type === 'select') {
      input.value = record?.[id] || 'auto';
      return;
    }
    if (meta.type === 'text') {
      input.value = record?.[id] || '';
      return;
    }
    if (meta.type === 'datetime-local') {
      input.value = toLocalDateTimeInput(record?.[id] || new Date());
      return;
    }
    const value = record?.[id];
    if (!Number.isFinite(value)) {
      input.value = '';
      return;
    }
    input.value = meta.unit === 'measure' && bodyState.unit === 'in'
      ? round1(value / 2.54)
      : round1(value);
  });
}

function seedRecordFromProfile() {
  const profile = readProfile();
  const goal = String(profile?.goal || 'maintain');
  return {
    recordedAt: toLocalDateTimeInput(new Date()),
    heightCm: Number.isFinite(Number(profile?.heightCm)) ? Number(profile.heightCm) : undefined,
    weightKg: Number.isFinite(Number(profile?.weightKg)) ? Number(profile.weightKg) : undefined,
    stageTag: goal === 'fatLoss' ? 'fatLoss' : goal === 'muscleGain' ? 'gain' : goal === 'maintain' ? 'maintain' : 'auto',
  };
}

function buildBodySnapshot() {
  const current = resolveBodyRecord(bodyState.history, 0);
  const previous = resolveBodyRecord(bodyState.history, 1);
  const missingFields = current ? BODY_FIELDS.filter((field) => field.unit === 'measure' && !Number.isFinite(bodyState.history[0]?.[field.id]) && Number.isFinite(current[field.id])).map((field) => field.id) : [];
  return {
    current,
    previous,
    inferredStage: inferStage(current),
    trend30: computeTrend(bodyState.history, 30),
    trend7: computeTrend(bodyState.history, 7),
    missingFields,
    overlay: bodyState.overlay,
  };
}

function resolveBodyRecord(history, startIndex = 0) {
  if (!Array.isArray(history) || !history[startIndex]) return null;
  const base = {};
  for (let i = startIndex; i < history.length; i += 1) {
    const record = history[i];
    BODY_FIELDS.forEach((field) => {
      if (base[field.id] == null && record[field.id] != null && record[field.id] !== '') base[field.id] = record[field.id];
    });
    if (base.recordedAt == null && record.recordedAt) base.recordedAt = record.recordedAt;
    if (Object.keys(base).length >= 14) break;
  }
  const profile = readProfile();
  if (!Number.isFinite(base.heightCm) && Number.isFinite(Number(profile?.heightCm))) base.heightCm = Number(profile.heightCm);
  if (!Number.isFinite(base.weightKg) && Number.isFinite(Number(profile?.weightKg))) base.weightKg = Number(profile.weightKg);
  return withBodyDefaults(base);
}

function withBodyDefaults(record) {
  if (!record) return null;
  const weight = Number.isFinite(record.weightKg) ? record.weightKg : 58;
  const height = Number.isFinite(record.heightCm) ? record.heightCm : 165;
  const chest = Number.isFinite(record.chest) ? record.chest : round1(weight * 1.05 + height * 0.22);
  const waist = Number.isFinite(record.waist) ? record.waist : round1(chest * 0.82);
  const abdomen = Number.isFinite(record.abdomen) ? record.abdomen : round1(waist + 2.6);
  const hip = Number.isFinite(record.hip) ? record.hip : round1(chest * 1.02);
  const upperArm = averageOf(record.upperArmL, record.upperArmR) || round1(chest * 0.32);
  const forearm = averageOf(record.forearmL, record.forearmR) || round1(upperArm * 0.82);
  const thigh = averageOf(record.thighL, record.thighR) || round1(hip * 0.57);
  const calf = averageOf(record.calfL, record.calfR) || round1(thigh * 0.63);
  const ankle = averageOf(record.ankleL, record.ankleR) || round1(calf * 0.63);
  const shoulder = Number.isFinite(record.shoulder) ? record.shoulder : round1(chest * 0.48);
  const neck = Number.isFinite(record.neck) ? record.neck : round1(chest * 0.39);
  return {
    ...record,
    heightCm: height,
    weightKg: weight,
    chest,
    waist,
    abdomen,
    hip,
    upperArmL: Number.isFinite(record.upperArmL) ? record.upperArmL : upperArm,
    upperArmR: Number.isFinite(record.upperArmR) ? record.upperArmR : upperArm,
    forearmL: Number.isFinite(record.forearmL) ? record.forearmL : forearm,
    forearmR: Number.isFinite(record.forearmR) ? record.forearmR : forearm,
    thighL: Number.isFinite(record.thighL) ? record.thighL : thigh,
    thighR: Number.isFinite(record.thighR) ? record.thighR : thigh,
    calfL: Number.isFinite(record.calfL) ? record.calfL : calf,
    calfR: Number.isFinite(record.calfR) ? record.calfR : calf,
    ankleL: Number.isFinite(record.ankleL) ? record.ankleL : ankle,
    ankleR: Number.isFinite(record.ankleR) ? record.ankleR : ankle,
    shoulder,
    neck,
    stageTag: record.stageTag || 'auto',
  };
}

function averageOf(...values) {
  const valid = values.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value > 0);
  return valid.length ? round1(valid.reduce((sum, value) => sum + value, 0) / valid.length) : null;
}

function topBodyDeltas(current, previous, limit = 3) {
  if (!current || !previous) return [];
  return DELTA_FIELDS.map((id) => {
    const a = Number(current[id]);
    const b = Number(previous[id]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
    return {
      id,
      delta: round1(a - b),
      unit: id === 'weightKg' ? 'kg' : id === 'bodyFat' ? '%' : 'cm',
    };
  }).filter(Boolean).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, limit);
}

function computeTrend(history, days = 30) {
  if (!Array.isArray(history) || history.length < 2) return null;
  const latest = resolveBodyRecord(history, 0);
  const cutoff = Date.now() - days * 86400000;
  const olderIndex = history.findIndex((record, idx) => idx > 0 && Date.parse(record.recordedAt || 0) <= cutoff);
  const reference = olderIndex > 0 ? resolveBodyRecord(history, olderIndex) : resolveBodyRecord(history, Math.min(history.length - 1, 1));
  if (!latest || !reference) return null;
  const waistDelta = round1((latest.waist || 0) - (reference.waist || 0));
  const weightDelta = round1((latest.weightKg || 0) - (reference.weightKg || 0));
  const hipDelta = round1((latest.hip || 0) - (reference.hip || 0));
  const chestDelta = round1((latest.chest || 0) - (reference.chest || 0));
  return {
    days,
    waistDelta,
    weightDelta,
    hipDelta,
    chestDelta,
  };
}

function trendText(trend) {
  if (!trend) return '—';
  const waist = Math.abs(trend.waistDelta);
  const weight = Math.abs(trend.weightDelta);
  if (waist < 0.4 && weight < 0.3) return T('trendFlat');
  if (trend.waistDelta < -0.4 || trend.weightDelta < -0.3) return T('trendDown');
  if (trend.waistDelta > 0.4 || trend.weightDelta > 0.3) return T('trendUp');
  return T('trendFlat');
}

function trendSubText(trend) {
  if (!trend) return T('emptyHistoryHint');
  const parts = [];
  if (Math.abs(trend.waistDelta) >= 0.2) parts.push(`${fieldShortLabel('waist')} ${formatDelta(trend.waistDelta, 'cm')}`);
  if (Math.abs(trend.weightDelta) >= 0.1) parts.push(`${fieldShortLabel('weightKg')} ${formatDelta(trend.weightDelta, 'kg')}`);
  if (Math.abs(trend.hipDelta) >= 0.2) parts.push(`${fieldShortLabel('hip')} ${formatDelta(trend.hipDelta, 'cm')}`);
  if (Math.abs(trend.chestDelta) >= 0.2) parts.push(`${fieldShortLabel('chest')} ${formatDelta(trend.chestDelta, 'cm')}`);
  return parts.join(' · ') || T('trendFlat');
}

function inferStage(record) {
  if (!record) return 'maintain';
  if (record.stageTag && record.stageTag !== 'auto') return record.stageTag;
  const profile = readProfile();
  const goal = String(profile?.goal || 'maintain');
  if (goal === 'fatLoss') return 'fatLoss';
  if (goal === 'muscleGain') return 'gain';
  if (goal === 'recomposition') return 'maintain';
  return 'maintain';
}

function stageLabel(stage) {
  const id = stage === 'fatLoss' ? 'stageFatLoss' : stage === 'gain' ? 'stageGain' : stage === 'recovery' ? 'stageRecovery' : 'stageMaintain';
  return T(id);
}

function fieldShortLabel(id) {
  const map = {
    waist: currentLang() === 'zh' ? '腰围' : currentLang() === 'es' ? 'Cintura' : 'Waist',
    abdomen: currentLang() === 'zh' ? '腹围' : currentLang() === 'es' ? 'Abdomen' : 'Abdomen',
    hip: currentLang() === 'zh' ? '臀围' : currentLang() === 'es' ? 'Cadera' : 'Hips',
    chest: currentLang() === 'zh' ? '胸围' : currentLang() === 'es' ? 'Pecho' : 'Chest',
    upperArmL: currentLang() === 'zh' ? '左上臂' : currentLang() === 'es' ? 'Brazo izq.' : 'L upper arm',
    upperArmR: currentLang() === 'zh' ? '右上臂' : currentLang() === 'es' ? 'Brazo der.' : 'R upper arm',
    thighL: currentLang() === 'zh' ? '左大腿' : currentLang() === 'es' ? 'Muslo izq.' : 'L thigh',
    thighR: currentLang() === 'zh' ? '右大腿' : currentLang() === 'es' ? 'Muslo der.' : 'R thigh',
    calfL: currentLang() === 'zh' ? '左小腿' : currentLang() === 'es' ? 'Pant. izq.' : 'L calf',
    calfR: currentLang() === 'zh' ? '右小腿' : currentLang() === 'es' ? 'Pant. der.' : 'R calf',
    weightKg: currentLang() === 'zh' ? '体重' : currentLang() === 'es' ? 'Peso' : 'Weight',
    bodyFat: T('bodyFat'),
  };
  return map[id] || id;
}

function formatDelta(value, unit) {
  if (!Number.isFinite(value)) return T('deltaFlat');
  const rounded = round1(value);
  if (Math.abs(rounded) < 0.05) return T('deltaFlat');
  const shown = `${rounded > 0 ? '+' : ''}${round1(rounded)} ${unit}`;
  return shown;
}

function formatMeasure(valueCm) {
  if (!Number.isFinite(valueCm)) return '—';
  return bodyState.unit === 'in' ? `${round1(valueCm / 2.54)} in` : `${round1(valueCm)} cm`;
}

function formatBodyDate(value, lang = currentLang()) {
  if (!value) return T('noRecord');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const locale = lang === 'en' ? 'en-US' : lang === 'es' ? 'es-ES' : 'zh-CN';
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

function toLocalDateTimeInput(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (num) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function exportBodyJson() {
  downloadBlob(new Blob([JSON.stringify(bodyState.history, null, 2)], { type: 'application/json' }), `haochijia-body-history.json`);
}

function exportBodyCsv() {
  const header = ['recorded_at', ...BODY_FIELDS.filter((field) => !['text', 'select', 'datetime-local'].includes(field.type)).map((field) => field.id), 'stageTag', 'note'];
  const rows = [header.join(',')];
  bodyState.history.forEach((record) => {
    rows.push(header.map((key) => csvEscape(record[key])).join(','));
  });
  downloadBlob(new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' }), `haochijia-body-history.csv`);
}

function loadBodyHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(BODY_STORAGE.history) || '[]');
    return Array.isArray(raw) ? raw.filter((item) => item && typeof item === 'object') : [];
  } catch {
    return [];
  }
}

function saveBodyHistory() {
  localStorage.setItem(BODY_STORAGE.history, JSON.stringify(bodyState.history));
}

function loadBodyUnit() {
  try {
    return localStorage.getItem(BODY_STORAGE.unit) === 'in' ? 'in' : 'cm';
  } catch {
    return 'cm';
  }
}

function saveBodyUnit() {
  localStorage.setItem(BODY_STORAGE.unit, bodyState.unit);
}

function loadBodyView() {
  try {
    const raw = Number(localStorage.getItem(BODY_STORAGE.view));
    return [0, 90, 180].includes(raw) ? raw : 0;
  } catch {
    return 0;
  }
}

function saveBodyView() {
  localStorage.setItem(BODY_STORAGE.view, String(bodyState.view));
}

function readProfile() {
  try {
    return JSON.parse(localStorage.getItem('haochijia.profile.v4') || 'null') || {};
  } catch {
    return {};
  }
}

function currentLang() {
  const select = document.getElementById('languageSelect');
  const value = select?.value || localStorage.getItem('haochijia.lang.v1') || 'zh';
  return ['zh', 'en', 'es'].includes(value) ? value : 'zh';
}

function T(key) {
  return BODY_TEXTS[currentLang()]?.[key] || BODY_TEXTS.zh[key] || key;
}

function setBodyStatus(message) {
  if (!bodyState.nodes.formStatus) return;
  bodyState.nodes.formStatus.textContent = message;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function round1(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}

function csvEscape(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function createBodyScene(canvas) {
  if (!canvas?.getContext) return { setAngle() {}, draw() {} };
  const ctx = canvas.getContext('2d');
  const scene = {
    canvas,
    ctx,
    angle: bodyState.view || 0,
    snapshot: null,
    pointerDown: false,
    pointerX: 0,
    setAngle(next) {
      scene.angle = next;
      scene.draw(scene.snapshot);
    },
    draw(snapshot) {
      scene.snapshot = snapshot;
      drawBodyScene(ctx, canvas, snapshot, scene.angle, bodyState.overlay);
    },
  };
  attachSceneDrag(scene);
  return scene;
}

function attachSceneDrag(scene) {
  const start = (clientX) => {
    scene.pointerDown = true;
    scene.pointerX = clientX;
  };
  const move = (clientX) => {
    if (!scene.pointerDown) return;
    const dx = clientX - scene.pointerX;
    scene.pointerX = clientX;
    let next = scene.angle + dx * 0.45;
    if (next < 0) next = 0;
    if (next > 180) next = 180;
    scene.angle = next;
    scene.draw(scene.snapshot);
  };
  const end = () => {
    if (!scene.pointerDown) return;
    scene.pointerDown = false;
    const snap = scene.angle < 45 ? 0 : scene.angle < 135 ? 90 : 180;
    scene.angle = snap;
    bodyState.view = snap;
    saveBodyView();
    updateBodyViewButtons();
    scene.draw(scene.snapshot);
  };
  scene.canvas.addEventListener('pointerdown', (event) => start(event.clientX));
  window.addEventListener('pointermove', (event) => move(event.clientX));
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
}

function drawBodyScene(ctx, canvas, snapshot, angle, overlay) {
  const dpr = Math.max(window.devicePixelRatio || 1, 1);
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  drawSceneBackdrop(ctx, width, height);
  if (!snapshot?.current) return;
  const profile = figureProfile(snapshot.current, angle, width, height);
  const previousProfile = snapshot?.previous ? figureProfile(snapshot.previous, angle, width, height) : null;
  if (overlay && previousProfile) drawGhostFigure(ctx, previousProfile, width, height);
  drawCurrentFigure(ctx, profile, snapshot, width, height);
}

function drawSceneBackdrop(ctx, width, height) {
  const halo = ctx.createRadialGradient(width * 0.52, height * 0.24, 8, width * 0.52, height * 0.24, width * 0.42);
  halo.addColorStop(0, 'rgba(134, 184, 255, 0.22)');
  halo.addColorStop(0.55, 'rgba(137, 123, 255, 0.10)');
  halo.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.06)';
  ctx.beginPath();
  ctx.ellipse(width * 0.52, height * 0.92, width * 0.22, height * 0.032, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function figureProfile(record, angle, width, height) {
  const blend = Math.abs(Math.sin((angle * Math.PI) / 180));
  const bodyHeight = Math.min(height * 0.82, Math.max(height * 0.74, (record.heightCm / 175) * height * 0.78));
  const centerX = width * 0.52;
  const topY = height * 0.08;
  const shoulderHalf = mix(record.shoulder * 0.78, record.shoulder * 0.48, blend);
  const chestHalf = mix(record.chest * 0.44, record.chest * 0.28, blend);
  const waistHalf = mix(record.waist * 0.38, record.waist * 0.26 + (record.bodyFat || 0) * 0.25, blend);
  const abdomenHalf = mix(record.abdomen * 0.39, record.abdomen * 0.3 + (record.bodyFat || 0) * 0.28, blend);
  const hipHalf = mix(record.hip * 0.42, record.hip * 0.32, blend);
  const thighHalf = mix(averageOf(record.thighL, record.thighR) * 0.26, averageOf(record.thighL, record.thighR) * 0.2, blend);
  const calfHalf = mix(averageOf(record.calfL, record.calfR) * 0.22, averageOf(record.calfL, record.calfR) * 0.17, blend);
  const ankleHalf = mix(averageOf(record.ankleL, record.ankleR) * 0.16, averageOf(record.ankleL, record.ankleR) * 0.12, blend);
  const armHalf = mix(averageOf(record.upperArmL, record.upperArmR) * 0.17, averageOf(record.upperArmL, record.upperArmR) * 0.14, blend);
  const forearmHalf = mix(averageOf(record.forearmL, record.forearmR) * 0.15, averageOf(record.forearmL, record.forearmR) * 0.12, blend);
  return {
    centerX,
    topY,
    bodyHeight,
    headR: record.neck * 0.42,
    neckW: record.neck * 0.22,
    shoulderHalf,
    chestHalf,
    waistHalf,
    abdomenHalf,
    hipHalf,
    thighHalf,
    calfHalf,
    ankleHalf,
    armHalf,
    forearmHalf,
    angle,
  };
}

function drawGhostFigure(ctx, p, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.36;
  ctx.strokeStyle = 'rgba(122, 139, 175, 0.65)';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  drawHead(ctx, p, true);
  drawBodySilhouette(ctx, p, true);
  drawLimbSet(ctx, p, true);
  ctx.restore();
}

function drawCurrentFigure(ctx, p, snapshot, width, height) {
  const fill = ctx.createLinearGradient(p.centerX - p.hipHalf * 1.45, p.topY, p.centerX + p.hipHalf * 1.45, p.topY + p.bodyHeight);
  fill.addColorStop(0, 'rgba(213, 227, 255, 0.92)');
  fill.addColorStop(0.46, 'rgba(255, 255, 255, 0.98)');
  fill.addColorStop(1, 'rgba(196, 214, 255, 0.90)');
  ctx.save();
  ctx.shadowColor = 'rgba(94, 128, 204, 0.18)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 18;
  drawHead(ctx, p, false, fill);
  drawBodySilhouette(ctx, p, false, fill);
  drawLimbSet(ctx, p, false, fill);
  ctx.restore();
  drawHighlights(ctx, p, snapshot);
}

function drawHead(ctx, p, ghost, fill) {
  const headX = p.centerX;
  const headY = p.topY + p.headR + 6;
  ctx.beginPath();
  ctx.ellipse(headX, headY, p.headR, p.headR * 1.12, 0, 0, Math.PI * 2);
  if (ghost) {
    ctx.stroke();
    return;
  }
  const g = ctx.createRadialGradient(headX - p.headR * 0.35, headY - p.headR * 0.45, 5, headX, headY, p.headR * 1.1);
  g.addColorStop(0, 'rgba(255,255,255,0.95)');
  g.addColorStop(0.65, 'rgba(214,227,255,0.92)');
  g.addColorStop(1, 'rgba(183,199,240,0.82)');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(120, 143, 193, 0.35)';
  ctx.stroke();
}

function drawBodySilhouette(ctx, p, ghost, fill) {
  const y0 = p.topY + p.headR * 2.18;
  const y1 = y0 + p.bodyHeight * 0.06;
  const y2 = y0 + p.bodyHeight * 0.14;
  const y3 = y0 + p.bodyHeight * 0.28;
  const y4 = y0 + p.bodyHeight * 0.4;
  const y5 = y0 + p.bodyHeight * 0.52;
  const y6 = y0 + p.bodyHeight * 0.62;
  const y7 = y0 + p.bodyHeight * 0.78;
  const y8 = y0 + p.bodyHeight * 0.96;
  const left = [
    [p.centerX - p.neckW, y0],
    [p.centerX - p.shoulderHalf, y1],
    [p.centerX - p.chestHalf, y2],
    [p.centerX - p.waistHalf, y3],
    [p.centerX - p.abdomenHalf, y4],
    [p.centerX - p.hipHalf, y5],
    [p.centerX - p.thighHalf, y6],
    [p.centerX - p.calfHalf, y7],
    [p.centerX - p.ankleHalf, y8],
  ];
  const right = left.map(([x, y]) => [p.centerX + (p.centerX - x), y]).reverse();
  ctx.beginPath();
  ctx.moveTo(left[0][0], left[0][1]);
  drawSmoothSide(ctx, left);
  drawLegBridge(ctx, p, y8);
  drawSmoothSide(ctx, right);
  ctx.closePath();
  if (ghost) {
    ctx.stroke();
    return;
  }
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = 'rgba(122, 143, 186, 0.3)';
  ctx.stroke();
}

function drawLimbSet(ctx, p, ghost, fill) {
  const shoulderY = p.topY + p.headR * 2.55;
  const elbowY = shoulderY + p.bodyHeight * 0.18;
  const wristY = elbowY + p.bodyHeight * 0.14;
  const armOffset = p.shoulderHalf * 0.92;
  drawLimb(ctx, p.centerX - armOffset, shoulderY, p.centerX - armOffset - p.armHalf * 1.2, elbowY, p.armHalf, ghost, fill);
  drawLimb(ctx, p.centerX - armOffset - p.armHalf * 1.1, elbowY, p.centerX - armOffset - p.forearmHalf * 1.35, wristY, p.forearmHalf, ghost, fill);
  drawLimb(ctx, p.centerX + armOffset, shoulderY, p.centerX + armOffset + p.armHalf * 1.2, elbowY, p.armHalf, ghost, fill);
  drawLimb(ctx, p.centerX + armOffset + p.armHalf * 1.1, elbowY, p.centerX + armOffset + p.forearmHalf * 1.35, wristY, p.forearmHalf, ghost, fill);
  const hipY = p.topY + p.headR * 2.18 + p.bodyHeight * 0.48;
  const kneeY = hipY + p.bodyHeight * 0.24;
  const ankleY = hipY + p.bodyHeight * 0.48;
  const legGap = Math.max(10, p.hipHalf * 0.18);
  drawLimb(ctx, p.centerX - legGap, hipY, p.centerX - legGap - p.thighHalf * 0.12, kneeY, p.thighHalf, ghost, fill);
  drawLimb(ctx, p.centerX - legGap - p.thighHalf * 0.08, kneeY, p.centerX - legGap - p.calfHalf * 0.05, ankleY, p.calfHalf, ghost, fill);
  drawLimb(ctx, p.centerX + legGap, hipY, p.centerX + legGap + p.thighHalf * 0.12, kneeY, p.thighHalf, ghost, fill);
  drawLimb(ctx, p.centerX + legGap + p.thighHalf * 0.08, kneeY, p.centerX + legGap + p.calfHalf * 0.05, ankleY, p.calfHalf, ghost, fill);
}

function drawLimb(ctx, x1, y1, x2, y2, halfWidth, ghost, fill) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const length = Math.hypot(x2 - x1, y2 - y1);
  ctx.save();
  ctx.translate(x1, y1);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.roundRect(0, -halfWidth, length, halfWidth * 2, halfWidth);
  if (ghost) {
    ctx.stroke();
    ctx.restore();
    return;
  }
  const g = ctx.createLinearGradient(0, -halfWidth, length, halfWidth);
  g.addColorStop(0, 'rgba(218,228,255,0.96)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.98)');
  g.addColorStop(1, 'rgba(199,214,250,0.90)');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 1.1;
  ctx.strokeStyle = 'rgba(122, 143, 186, 0.22)';
  ctx.stroke();
  ctx.restore();
}

function drawSmoothSide(ctx, points) {
  for (let i = 1; i < points.length; i += 1) {
    const [prevX, prevY] = points[i - 1];
    const [x, y] = points[i];
    const cx = (prevX + x) / 2;
    const cy = (prevY + y) / 2;
    ctx.quadraticCurveTo(prevX, prevY, cx, cy);
  }
  const [lastX, lastY] = points[points.length - 1];
  ctx.lineTo(lastX, lastY);
}

function drawLegBridge(ctx, p, y) {
  ctx.bezierCurveTo(p.centerX - p.ankleHalf * 0.85, y + 16, p.centerX + p.ankleHalf * 0.85, y + 16, p.centerX + p.ankleHalf, y);
}

function drawHighlights(ctx, p, snapshot) {
  const deltas = topBodyDeltas(snapshot.current, snapshot.previous, 5);
  if (!deltas.length) return;
  const map = {
    chest: p.topY + p.bodyHeight * 0.24,
    waist: p.topY + p.bodyHeight * 0.42,
    abdomen: p.topY + p.bodyHeight * 0.48,
    hip: p.topY + p.bodyHeight * 0.56,
    upperArmL: p.topY + p.bodyHeight * 0.26,
    upperArmR: p.topY + p.bodyHeight * 0.26,
    thighL: p.topY + p.bodyHeight * 0.68,
    thighR: p.topY + p.bodyHeight * 0.68,
    calfL: p.topY + p.bodyHeight * 0.82,
    calfR: p.topY + p.bodyHeight * 0.82,
  };
  deltas.forEach((entry) => {
    const y = map[entry.id];
    if (!y || Math.abs(entry.delta) < 0.35) return;
    const glow = Math.min(0.28, Math.abs(entry.delta) * 0.05);
    ctx.save();
    ctx.globalAlpha = glow;
    const grad = ctx.createLinearGradient(p.centerX - p.hipHalf * 1.15, y, p.centerX + p.hipHalf * 1.15, y);
    grad.addColorStop(0, 'rgba(120,180,255,0)');
    grad.addColorStop(0.3, entry.delta < 0 ? 'rgba(87,190,134,0.95)' : 'rgba(90,146,255,0.95)');
    grad.addColorStop(0.7, entry.delta < 0 ? 'rgba(87,190,134,0.95)' : 'rgba(90,146,255,0.95)');
    grad.addColorStop(1, 'rgba(120,180,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(p.centerX - p.hipHalf * 1.25, y - 18, p.hipHalf * 2.5, 36);
    ctx.restore();
  });
}

function mix(a, b, t) {
  return a * (1 - t) + b * t;
}


/* ===== v13 ultra body hero / WebGL mesh upgrade ===== */
Object.assign(BODY_TEXTS.zh, {
  timelineTitle: '时间轴回放',
  timelineHintEmpty: '至少两次记录，时间轴才更有意思。',
  timelineHintReady: '拖动时间轴，回放每一次围度变化。',
  play: '播放',
  pause: '暂停',
  prev: '上一条',
  next: '下一条',
  heatOn: '热力层开',
  heatOff: '热力层关',
  heatTitle: '部位热力变化',
  heatLegendReduce: '收紧 / 下降',
  heatLegendIncrease: '增加 / 扩张',
  meshMode: 'WebGL mesh',
  fallbackMode: '轮廓回退',
  timelineLatest: '最新帧',
  timelineFrame: '第 {index} / {count} 次',
  floatingWaist: '腰',
  floatingHip: '臀',
  floatingWeight: '重',
  jumpModel: '看模型',
  dragTip: '单指拖动旋转，双指缩放，按钮可一键切回正 / 侧 / 背。',
  stageLoading: '正在切到 WebGL mesh…',
  focusTip: '点变化标签可把热区聚焦到模型上。',
  timeRange: '{start} → {end}',
  modelMain: '首页主视觉',
  noCompareDate: '暂无对比基线',
});
Object.assign(BODY_TEXTS.en, {
  timelineTitle: 'Timeline playback',
  timelineHintEmpty: 'Two body records make the timeline much more useful.',
  timelineHintReady: 'Drag the timeline to replay every visible measurement change.',
  play: 'Play',
  pause: 'Pause',
  prev: 'Prev',
  next: 'Next',
  heatOn: 'Heat on',
  heatOff: 'Heat off',
  heatTitle: 'Body heat map',
  heatLegendReduce: 'tightening / down',
  heatLegendIncrease: 'growth / up',
  meshMode: 'WebGL mesh',
  fallbackMode: 'outline fallback',
  timelineLatest: 'Latest frame',
  timelineFrame: 'Record {index} / {count}',
  floatingWaist: 'Waist',
  floatingHip: 'Hips',
  floatingWeight: 'Weight',
  jumpModel: 'Model',
  dragTip: 'Drag to orbit, pinch to zoom, and tap the view buttons to snap front / side / back.',
  stageLoading: 'Loading the WebGL mesh…',
  focusTip: 'Tap a delta chip to focus that body zone on the model.',
  timeRange: '{start} → {end}',
  modelMain: 'Hero stage',
  noCompareDate: 'No comparison baseline yet',
});
Object.assign(BODY_TEXTS.es, {
  timelineTitle: 'Reproducción en la línea de tiempo',
  timelineHintEmpty: 'Con dos registros corporales la línea de tiempo cobra sentido.',
  timelineHintReady: 'Arrastra la línea de tiempo para revisar cada cambio visible.',
  play: 'Reproducir',
  pause: 'Pausar',
  prev: 'Anterior',
  next: 'Siguiente',
  heatOn: 'Mapa activo',
  heatOff: 'Mapa oculto',
  heatTitle: 'Mapa de calor corporal',
  heatLegendReduce: 'reduce / baja',
  heatLegendIncrease: 'crece / sube',
  meshMode: 'malla WebGL',
  fallbackMode: 'modo contorno',
  timelineLatest: 'Último fotograma',
  timelineFrame: 'Registro {index} / {count}',
  floatingWaist: 'Cintura',
  floatingHip: 'Cadera',
  floatingWeight: 'Peso',
  jumpModel: 'Modelo',
  dragTip: 'Arrastra para orbitar, pellizca para acercar y usa los botones para volver a frente / lado / espalda.',
  stageLoading: 'Cargando la malla WebGL…',
  focusTip: 'Pulsa un cambio para enfocar esa zona del cuerpo.',
  timeRange: '{start} → {end}',
  modelMain: 'Escena principal',
  noCompareDate: 'Todavía no hay referencia',
});

const BODY_V13_HERO_HTML = `
  <section class="card body-hero-card body-hero-card-v13" id="bodyHeroCard">
    <div class="body-stage-orb body-stage-orb-a"></div>
    <div class="body-stage-orb body-stage-orb-b"></div>
    <div class="body-hero-head section-head compact">
      <div>
        <p class="section-kicker" data-body-text="heroKicker"></p>
        <h2 data-body-text="heroTitle"></h2>
        <p class="fold-summary-text body-hero-copy" id="bodyHeroCopy"></p>
      </div>
      <div class="body-hero-pill-stack">
        <span class="top-pill subtle body-local-pill" id="bodyLocalPill"></span>
        <span class="top-pill subtle body-mode-pill" id="bodyModePill"></span>
      </div>
    </div>
    <div class="body-hero-grid body-hero-grid-v13">
      <div class="body-model-panel body-model-panel-v13">
        <div class="body-model-stage-wrap body-model-stage-wrap-v13">
          <div class="body-model-labels">
            <span class="body-model-label current" id="bodyCurrentLabel"></span>
            <span class="body-model-label ghost" id="bodyGhostLabel"></span>
          </div>
          <div class="body-floating-panel" id="bodyFloatingPanel">
            <div class="body-floating-top">
              <span class="body-floating-badge" data-body-text="modelMain"></span>
              <strong id="bodyFloatingDate"></strong>
            </div>
            <div class="body-floating-metrics">
              <span><em data-body-text="floatingWaist"></em><strong id="bodyFloatWaist"></strong></span>
              <span><em data-body-text="floatingHip"></em><strong id="bodyFloatHip"></strong></span>
              <span><em data-body-text="floatingWeight"></em><strong id="bodyFloatWeight"></strong></span>
            </div>
          </div>
          <div class="body-heat-legend body-heat-legend-overlay" id="bodyHeatLegend"></div>
          <canvas id="bodySceneCanvas" class="body-scene-canvas body-scene-canvas-v13" width="860" height="980"></canvas>
          <div class="body-stage-empty" id="bodyStageEmpty" hidden></div>
        </div>
        <div class="body-timeline-card">
          <div class="body-timeline-head">
            <div>
              <div class="mini-title" data-body-text="timelineTitle"></div>
              <div class="muted small" id="bodyTimelineHint"></div>
            </div>
            <div class="body-timeline-actions">
              <button type="button" class="ghost-btn compact-btn" id="bodyTimelinePrevBtn">上一帧</button>
              <button type="button" class="primary-btn compact-btn" id="bodyTimelinePlayBtn">播放</button>
              <button type="button" class="ghost-btn compact-btn" id="bodyTimelineNextBtn">下一帧</button>
            </div>
          </div>
          <input type="range" id="bodyTimelineRange" class="body-timeline-range" min="0" max="0" step="1" value="0">
          <div class="body-timeline-marks" id="bodyTimelineMarks"></div>
        </div>
        <div class="body-model-controls">
          <div class="body-view-switch" id="bodyViewSwitch">
            <button type="button" class="ghost-btn compact-btn" data-body-view="0">前视图</button>
            <button type="button" class="ghost-btn compact-btn" data-body-view="90">侧视图</button>
            <button type="button" class="ghost-btn compact-btn" data-body-view="180">后视图</button>
          </div>
          <div class="body-control-cluster">
            <button type="button" class="ghost-btn compact-btn" id="bodyOverlayToggle">对比层</button>
            <button type="button" class="ghost-btn compact-btn" id="bodyHeatToggle">热力层</button>
          </div>
        </div>
        <div class="muted small body-drag-tip" id="bodyDragTip"></div>
      </div>
      <div class="body-summary-panel body-summary-panel-v13">
        <div class="body-summary-grid body-summary-grid-v13">
          <article class="body-summary-tile emphasis">
            <span class="body-tile-label" data-body-text="recordDate"></span>
            <strong id="bodyLatestDate"></strong>
            <span id="bodyStageText"></span>
          </article>
          <article class="body-summary-tile">
            <span class="body-tile-label" data-body-text="currentWeight"></span>
            <strong id="bodyCurrentWeight"></strong>
            <span id="bodyCurrentFat"></span>
          </article>
          <article class="body-summary-tile">
            <span class="body-tile-label" data-body-text="trend30"></span>
            <strong id="bodyTrendText"></strong>
            <span id="bodyTrendSub"></span>
          </article>
        </div>
        <div class="body-heat-card">
          <div class="body-compare-head">
            <div>
              <div class="mini-title" data-body-text="heatTitle"></div>
              <div class="muted small" id="bodyCompareHint"></div>
            </div>
            <span class="top-pill subtle" id="bodyComparePill"></span>
          </div>
          <div class="body-heat-list" id="bodyHeatList"></div>
        </div>
        <div class="body-compare-block">
          <div class="body-compare-head">
            <div>
              <div class="mini-title" data-body-text="quickCompare"></div>
              <div class="muted small" data-body-text="focusTip"></div>
            </div>
            <span class="top-pill subtle" id="bodyTimelineFramePill"></span>
          </div>
          <div class="body-delta-chips" id="bodyDeltaChips"></div>
        </div>
        <div class="body-cta-row">
          <button type="button" class="primary-btn" id="bodyAddRecordBtn">记录新围度</button>
          <button type="button" class="ghost-btn" id="bodyViewHistoryBtn">查看历史记录</button>
        </div>
        <div class="body-inline-note" id="bodyMissingHint" hidden></div>
      </div>
    </div>
  </section>
`;

const BODY_V13_REMOTE = {
  three: 'https://unpkg.com/three@0.180.0/build/three.module.js?module',
  orbit: 'https://unpkg.com/three@0.180.0/examples/jsm/controls/OrbitControls.js?module',
};

const legacyBodyInit = initBodyModule;
const legacyBodyCreateScene = createBodyScene;
document.removeEventListener('DOMContentLoaded', legacyBodyInit);

bodyState.timelineIndex = 0;
bodyState.heat = true;
bodyState.playing = false;
bodyState.playTimer = null;
bodyState.focusField = '';
bodyState.webglReady = false;
bodyState.sceneMode = 'loading';
bodyState.webglLoadStarted = false;

initBodyModule = function initBodyModuleV13() {
  if (bodyState.initialized) return;
  const main = document.querySelector('.main-stack');
  if (!main) return;
  const firstSection = main.querySelector('.overview-grid');
  if (firstSection) {
    const existing = document.getElementById('bodyHeroCard');
    if (existing) existing.remove();
    firstSection.insertAdjacentHTML('beforebegin', BODY_V13_HERO_HTML);
  }
  const profilePanel = document.getElementById('profilePanel');
  if (profilePanel && !document.getElementById('bodyPanelCard')) {
    profilePanel.insertAdjacentHTML('beforebegin', PANEL_HTML);
  }
  bindBodyNodes();
  renderBodyForm();
  bindBodyEvents();
  applyBodyTexts();
  bodyState.scene = createBodyScene(bodyState.nodes.canvas);
  renderBodyModule();
  bodyState.initialized = true;
};

document.addEventListener('DOMContentLoaded', initBodyModule);

bindBodyNodes = function bindBodyNodesV13() {
  bodyState.nodes = {
    hero: document.getElementById('bodyHeroCard'),
    panel: document.getElementById('bodyPanelCard'),
    canvas: document.getElementById('bodySceneCanvas'),
    stageEmpty: document.getElementById('bodyStageEmpty'),
    localPill: document.getElementById('bodyLocalPill'),
    modePill: document.getElementById('bodyModePill'),
    heroCopy: document.getElementById('bodyHeroCopy'),
    currentLabel: document.getElementById('bodyCurrentLabel'),
    ghostLabel: document.getElementById('bodyGhostLabel'),
    latestDate: document.getElementById('bodyLatestDate'),
    stageText: document.getElementById('bodyStageText'),
    currentWeight: document.getElementById('bodyCurrentWeight'),
    currentFat: document.getElementById('bodyCurrentFat'),
    trendText: document.getElementById('bodyTrendText'),
    trendSub: document.getElementById('bodyTrendSub'),
    compareHint: document.getElementById('bodyCompareHint'),
    comparePill: document.getElementById('bodyComparePill'),
    timelineFramePill: document.getElementById('bodyTimelineFramePill'),
    deltaChips: document.getElementById('bodyDeltaChips'),
    heatList: document.getElementById('bodyHeatList'),
    heatLegend: document.getElementById('bodyHeatLegend'),
    addBtn: document.getElementById('bodyAddRecordBtn'),
    viewHistoryBtn: document.getElementById('bodyViewHistoryBtn'),
    missingHint: document.getElementById('bodyMissingHint'),
    overlayToggle: document.getElementById('bodyOverlayToggle'),
    heatToggle: document.getElementById('bodyHeatToggle'),
    viewSwitch: document.getElementById('bodyViewSwitch'),
    dragTip: document.getElementById('bodyDragTip'),
    floatingPanel: document.getElementById('bodyFloatingPanel'),
    floatingDate: document.getElementById('bodyFloatingDate'),
    floatWaist: document.getElementById('bodyFloatWaist'),
    floatHip: document.getElementById('bodyFloatHip'),
    floatWeight: document.getElementById('bodyFloatWeight'),
    timelineRange: document.getElementById('bodyTimelineRange'),
    timelineHint: document.getElementById('bodyTimelineHint'),
    timelineMarks: document.getElementById('bodyTimelineMarks'),
    timelinePlayBtn: document.getElementById('bodyTimelinePlayBtn'),
    timelinePrevBtn: document.getElementById('bodyTimelinePrevBtn'),
    timelineNextBtn: document.getElementById('bodyTimelineNextBtn'),
    form: document.getElementById('bodyRecordForm'),
    formStatus: document.getElementById('bodyFormStatus'),
    unitSelect: document.getElementById('bodyUnitSelect'),
    copyBtn: document.getElementById('bodyCopyBtn'),
    saveBtn: document.getElementById('bodySaveBtn'),
    clearBtn: document.getElementById('bodyClearBtn'),
    exportJsonBtn: document.getElementById('bodyExportJsonBtn'),
    exportCsvBtn: document.getElementById('bodyExportCsvBtn'),
    historyList: document.getElementById('bodyHistoryList'),
  };
};

bindBodyEvents = function bindBodyEventsV13() {
  const nodes = bodyState.nodes;
  nodes.addBtn?.addEventListener('click', () => scrollToBodyPanel(true));
  nodes.viewHistoryBtn?.addEventListener('click', () => scrollToBodyPanel(false));
  nodes.saveBtn?.addEventListener('click', saveBodyRecord);
  nodes.clearBtn?.addEventListener('click', clearBodyForm);
  nodes.exportJsonBtn?.addEventListener('click', exportBodyJson);
  nodes.exportCsvBtn?.addEventListener('click', exportBodyCsv);
  nodes.copyBtn?.addEventListener('click', copyLastBodyRecord);
  nodes.unitSelect?.addEventListener('change', onUnitChange);
  nodes.overlayToggle?.addEventListener('click', () => {
    bodyState.overlay = !bodyState.overlay;
    renderBodyModule();
  });
  nodes.heatToggle?.addEventListener('click', () => {
    bodyState.heat = !bodyState.heat;
    renderBodyModule();
  });
  nodes.viewSwitch?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-body-view]');
    if (!btn) return;
    bodyState.view = Number(btn.dataset.bodyView) || 0;
    saveBodyView();
    bodyState.scene?.setAngle?.(bodyState.view);
    updateBodyViewButtons();
  });
  nodes.deltaChips?.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-body-focus]');
    if (!chip) return;
    bodyState.focusField = chip.dataset.bodyFocus || '';
    bodyState.scene?.focusField?.(bodyState.focusField);
    nodes.deltaChips.querySelectorAll('[data-body-focus]').forEach((node) => node.classList.toggle('is-focused', node === chip));
  });
  nodes.timelineRange?.addEventListener('input', () => {
    stopBodyPlayback();
    bodyState.timelineIndex = sliderValueToBodyIndex(nodes.timelineRange.value);
    renderBodyModule();
  });
  nodes.timelinePlayBtn?.addEventListener('click', toggleBodyPlayback);
  nodes.timelinePrevBtn?.addEventListener('click', () => {
    stopBodyPlayback();
    bodyState.timelineIndex = clampBodyTimeline(bodyState.timelineIndex + 1);
    renderBodyModule();
  });
  nodes.timelineNextBtn?.addEventListener('click', () => {
    stopBodyPlayback();
    bodyState.timelineIndex = clampBodyTimeline(bodyState.timelineIndex - 1);
    renderBodyModule();
  });
  nodes.historyList?.addEventListener('click', onHistoryListClick);
  document.getElementById('languageSelect')?.addEventListener('change', () => {
    applyBodyTexts();
    renderBodyModule();
  });
  window.addEventListener('resize', () => bodyState.scene?.draw?.(bodyState.scene?.snapshot || null), { passive: true });
  const headerRow = document.querySelector('.header-quick-row');
  if (headerRow && !headerRow.querySelector('[data-body-open]')) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ghost-btn compact-btn';
    btn.setAttribute('data-body-open', 'panel');
    btn.textContent = currentLang() === 'zh' ? '记身体' : currentLang() === 'es' ? 'Cuerpo' : 'Body log';
    btn.addEventListener('click', () => scrollToBodyPanel(true));
    headerRow.prepend(btn);
  }
};

renderBodyModule = function renderBodyModuleV13() {
  applyBodyTexts();
  updateBodyViewButtons();
  const snapshot = buildBodySnapshot();
  renderBodyHero(snapshot);
  renderBodyTimeline(snapshot);
  renderBodyHistory(snapshot);
  bodyState.scene?.draw?.(snapshot);
};

renderBodyHero = function renderBodyHeroV13(snapshot) {
  const lang = currentLang();
  const nodes = bodyState.nodes;
  nodes.currentLabel.textContent = T('currentLabel');
  nodes.ghostLabel.textContent = T('ghostLabel');
  nodes.addBtn.textContent = T('addRecord');
  nodes.viewHistoryBtn.textContent = T('openHistory');
  nodes.dragTip.textContent = T('dragTip');
  nodes.overlayToggle.textContent = bodyState.overlay ? T('overlayOff') : T('overlayOn');
  nodes.heatToggle.textContent = bodyState.heat ? T('heatOff') : T('heatOn');
  nodes.timelinePlayBtn.textContent = bodyState.playing ? T('pause') : T('play');
  nodes.timelinePrevBtn.textContent = `← ${T('prev')}`;
  nodes.timelineNextBtn.textContent = `${T('next')} →`;
  nodes.localPill.textContent = T('localOnly');
  nodes.modePill.textContent = bodyState.sceneMode === 'webgl' ? T('meshMode') : bodyState.sceneMode === 'fallback' ? T('fallbackMode') : T('stageLoading');
  nodes.modePill.classList.toggle('is-webgl', bodyState.sceneMode === 'webgl');
  nodes.comparePill.textContent = snapshot.selectedIndex === 0 ? T('timelineLatest') : t(currentLang(), 'timelineFrame', { index: snapshot.totalCount - snapshot.selectedIndex, count: snapshot.totalCount });
  nodes.timelineFramePill.textContent = snapshot.previous ? `${T('compare')} · ${formatBodyDate(snapshot.previous.recordedAt, lang)}` : T('noCompareDate');

  if (!snapshot.current) {
    nodes.heroCopy.textContent = T('heroEmptySub');
    nodes.latestDate.textContent = T('noRecord');
    nodes.stageText.textContent = '';
    nodes.currentWeight.textContent = '—';
    nodes.currentFat.textContent = T('noBodyFat');
    nodes.trendText.textContent = '—';
    nodes.trendSub.textContent = T('emptyHistoryHint');
    nodes.compareHint.textContent = T('timelineHintEmpty');
    nodes.deltaChips.innerHTML = `<span class="body-empty-chip">${escapeHtml(T('heroEmptyTitle'))}</span>`;
    nodes.heatList.innerHTML = `<div class="body-heat-empty">${escapeHtml(T('timelineHintEmpty'))}</div>`;
    nodes.heatLegend.innerHTML = '';
    nodes.floatingDate.textContent = T('heroEmptyTitle');
    nodes.floatWaist.textContent = '—';
    nodes.floatHip.textContent = '—';
    nodes.floatWeight.textContent = '—';
    nodes.stageEmpty.hidden = false;
    nodes.stageEmpty.textContent = T('heroEmptyTitle');
    nodes.missingHint.hidden = true;
    return;
  }

  nodes.stageEmpty.hidden = true;
  nodes.heroCopy.textContent = snapshot.selectedIndex === 0 ? T('latestHeroSub') : T('timelineHintReady');
  nodes.latestDate.textContent = formatBodyDate(snapshot.current.recordedAt, lang);
  nodes.stageText.textContent = stageLabel(snapshot.current.stageTag || snapshot.inferredStage);
  nodes.currentWeight.textContent = snapshot.current.weightKg ? `${round1(snapshot.current.weightKg)} kg` : '—';
  nodes.currentFat.textContent = snapshot.current.bodyFat ? `${T('bodyFat')} ${round1(snapshot.current.bodyFat)}%` : T('noBodyFat');
  nodes.trendText.textContent = trendText(snapshot.trend30);
  nodes.trendSub.textContent = snapshot.trend30 ? trendSubText(snapshot.trend30) : T('emptyHistoryHint');
  nodes.compareHint.textContent = snapshot.previous
    ? `${T('fromLast')} · ${formatBodyDate(snapshot.previous.recordedAt, lang)}`
    : T('notEnough');
  nodes.deltaChips.innerHTML = renderDeltaChips(snapshot);
  renderBodyHeatList(snapshot);
  renderBodyHeatLegend(snapshot);
  nodes.floatingDate.textContent = formatBodyDate(snapshot.current.recordedAt, lang);
  nodes.floatWaist.textContent = snapshot.current.waist ? `${round1(snapshot.current.waist)} cm` : '—';
  nodes.floatHip.textContent = snapshot.current.hip ? `${round1(snapshot.current.hip)} cm` : '—';
  nodes.floatWeight.textContent = snapshot.current.weightKg ? `${round1(snapshot.current.weightKg)} kg` : '—';
  const hasMissing = Boolean(snapshot.missingFields?.length);
  nodes.missingHint.hidden = !hasMissing;
  nodes.missingHint.textContent = hasMissing ? T('summaryMissing') : '';
  nodes.deltaChips.querySelectorAll('[data-body-focus]').forEach((node) => {
    node.classList.toggle('is-focused', node.dataset.bodyFocus === bodyState.focusField);
  });
};

function renderBodyHeatList(snapshot) {
  const nodes = bodyState.nodes;
  const groups = bodyHeatGroups(snapshot.current, snapshot.previous);
  if (!groups.length) {
    nodes.heatList.innerHTML = `<div class="body-heat-empty">${escapeHtml(T('stable'))}</div>`;
    return;
  }
  nodes.heatList.innerHTML = groups.map((item) => {
    const mag = Math.min(100, Math.round(Math.abs(item.delta) * 13 + 8));
    const tone = item.delta < 0 ? 'down' : item.delta > 0 ? 'up' : 'flat';
    return `
      <button type="button" class="body-heat-row tone-${tone}" data-body-focus="${escapeHtml(item.id)}">
        <span class="body-heat-name">${escapeHtml(item.label)}</span>
        <span class="body-heat-bar"><span style="width:${mag}%"></span></span>
        <span class="body-heat-value">${escapeHtml(formatDelta(item.delta, item.unit))}</span>
      </button>`;
  }).join('');
  nodes.heatList.querySelectorAll('[data-body-focus]').forEach((btn) => {
    btn.addEventListener('click', () => {
      bodyState.focusField = btn.dataset.bodyFocus || '';
      bodyState.scene?.focusField?.(bodyState.focusField);
      renderBodyModule();
    });
  });
}

function renderBodyHeatLegend(snapshot) {
  if (!bodyState.nodes.heatLegend) return;
  bodyState.nodes.heatLegend.innerHTML = `
    <span class="body-heat-key down">${escapeHtml(T('heatLegendReduce'))}</span>
    <span class="body-heat-key up">${escapeHtml(T('heatLegendIncrease'))}</span>`;
}

function renderBodyTimeline(snapshot) {
  const nodes = bodyState.nodes;
  const count = bodyState.history.length;
  nodes.timelineRange.max = String(Math.max(0, count - 1));
  nodes.timelineRange.value = String(bodyIndexToSliderValue(snapshot.selectedIndex));
  nodes.timelinePrevBtn.disabled = count < 2 || snapshot.selectedIndex >= count - 1;
  nodes.timelineNextBtn.disabled = count < 2 || snapshot.selectedIndex <= 0;
  nodes.timelineHint.textContent = count < 2
    ? T('timelineHintEmpty')
    : t(currentLang(), 'timeRange', {
        start: formatBodyDate(bodyState.history[count - 1]?.recordedAt, currentLang()),
        end: formatBodyDate(bodyState.history[0]?.recordedAt, currentLang()),
      });
  nodes.timelineMarks.innerHTML = count
    ? bodyState.history.slice().reverse().map((record, reverseIdx) => {
        const idx = count - 1 - reverseIdx;
        return `<button type="button" class="body-timeline-mark ${idx === snapshot.selectedIndex ? 'active' : ''}" data-body-jump="${idx}">${escapeHtml(formatBodyTimelineLabel(record.recordedAt))}</button>`;
      }).join('')
    : '';
  nodes.timelineMarks.querySelectorAll('[data-body-jump]').forEach((btn) => {
    btn.addEventListener('click', () => {
      stopBodyPlayback();
      bodyState.timelineIndex = clampBodyTimeline(Number(btn.dataset.bodyJump));
      renderBodyModule();
    });
  });
}

renderBodyHistory = function renderBodyHistoryV13(snapshot) {
  const nodes = bodyState.nodes;
  if (!nodes.historyList) return;
  if (!bodyState.history.length) {
    nodes.historyList.innerHTML = `<div class="empty-state">${escapeHtml(T('noHistory'))}</div>`;
    return;
  }
  nodes.historyList.innerHTML = bodyState.history.slice(0, 12).map((record, idx) => {
    const summary = summarizeHistoryItem(record, bodyState.history[idx + 1]);
    return `
      <article class="body-history-item ${idx === 0 ? 'latest' : ''} ${idx === snapshot.selectedIndex ? 'is-active' : ''}">
        <div class="body-history-main">
          <div class="body-history-top">
            <strong>${escapeHtml(formatBodyDate(record.recordedAt, currentLang()))}</strong>
            <span class="top-pill subtle">${escapeHtml(idx === 0 ? T('latestRecord') : T('previousRecord'))}</span>
          </div>
          <div class="body-history-summary">${escapeHtml(summary)}</div>
          ${record.note ? `<div class="body-history-note">${escapeHtml(record.note)}</div>` : ''}
        </div>
        <div class="body-history-actions">
          <button type="button" class="ghost-btn compact-btn" data-body-jump="${idx}">${escapeHtml(T('jumpModel'))}</button>
          <button type="button" class="ghost-btn compact-btn" data-body-load="${idx}">${escapeHtml(T('useThis'))}</button>
          <button type="button" class="ghost-btn compact-btn danger" data-body-delete="${idx}">${escapeHtml(T('delete'))}</button>
        </div>
      </article>`;
  }).join('');
};

onHistoryListClick = function onHistoryListClickV13(event) {
  const jumpBtn = event.target.closest('[data-body-jump]');
  const useBtn = event.target.closest('[data-body-load]');
  const deleteBtn = event.target.closest('[data-body-delete]');
  if (!jumpBtn && !useBtn && !deleteBtn) return;
  const idx = Number(jumpBtn?.dataset.bodyJump ?? useBtn?.dataset.bodyLoad ?? deleteBtn?.dataset.bodyDelete);
  const record = bodyState.history[idx];
  if (!record) return;
  if (deleteBtn) {
    bodyState.history.splice(idx, 1);
    bodyState.timelineIndex = clampBodyTimeline(bodyState.timelineIndex > idx ? bodyState.timelineIndex - 1 : bodyState.timelineIndex);
    saveBodyHistory();
    stopBodyPlayback();
    renderBodyModule();
    setBodyStatus(T('deleted'));
    return;
  }
  if (jumpBtn) {
    stopBodyPlayback();
    bodyState.timelineIndex = clampBodyTimeline(idx);
    bodyState.focusField = topBodyDeltas(resolveBodyRecord(bodyState.history, idx), resolveBodyRecord(bodyState.history, idx + 1), 1)[0]?.id || '';
    renderBodyModule();
    bodyState.nodes.hero?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  fillBodyForm(record);
  scrollToBodyPanel(true);
};

saveBodyRecord = function saveBodyRecordV13() {
  const draft = readBodyForm();
  const hasAny = BODY_FIELDS.some((field) => ['select', 'text', 'datetime-local'].includes(field.type) ? false : Number.isFinite(draft[field.id]));
  if (!hasAny) {
    setBodyStatus(T('saveNeedAny'));
    return;
  }
  draft.id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  if (!draft.recordedAt) draft.recordedAt = new Date().toISOString();
  else draft.recordedAt = new Date(draft.recordedAt).toISOString();
  bodyState.history.unshift(draft);
  bodyState.history = bodyState.history.sort((a, b) => String(b.recordedAt).localeCompare(String(a.recordedAt)));
  bodyState.timelineIndex = 0;
  bodyState.focusField = topBodyDeltas(resolveBodyRecord(bodyState.history, 0), resolveBodyRecord(bodyState.history, 1), 1)[0]?.id || bodyState.focusField || 'waist';
  saveBodyHistory();
  fillBodyForm({ ...draft, recordedAt: toLocalDateTimeInput(new Date()) });
  stopBodyPlayback();
  renderBodyModule();
  setBodyStatus(T('saveOk'));
};

buildBodySnapshot = function buildBodySnapshotV13() {
  const selectedIndex = clampBodyTimeline(bodyState.timelineIndex);
  const current = resolveBodyRecord(bodyState.history, selectedIndex);
  const previous = resolveBodyRecord(bodyState.history, selectedIndex + 1);
  const inferredStage = inferStage(current);
  const missingFields = current
    ? BODY_FIELDS.filter((field) => current[field.id] != null && !Number.isFinite(bodyState.history[selectedIndex]?.[field.id]) && field.type === 'number')
        .map((field) => field.id)
    : [];
  return {
    current,
    previous,
    inferredStage,
    trend30: computeTrend(bodyState.history, 30),
    trend7: computeTrend(bodyState.history, 7),
    missingFields,
    overlay: bodyState.overlay,
    selectedIndex,
    totalCount: bodyState.history.length,
  };
};

updateBodyViewButtons = function updateBodyViewButtonsV13() {
  bodyState.nodes.viewSwitch?.querySelectorAll('[data-body-view]').forEach((btn) => {
    const value = Number(btn.dataset.bodyView);
    btn.textContent = value === 0 ? T('front') : value === 90 ? T('side') : T('back');
    btn.classList.toggle('is-active', value === bodyState.view);
  });
  bodyState.nodes.overlayToggle?.classList.toggle('is-active', bodyState.overlay);
  bodyState.nodes.heatToggle?.classList.toggle('is-active', bodyState.heat);
};

createBodyScene = function createBodySceneV13(canvas) {
  const proxy = {
    impl: null,
    snapshot: null,
    mode: 'loading',
    focusField(field) {
      bodyState.focusField = field || '';
      proxy.impl?.focusField?.(bodyState.focusField);
    },
    setAngle(angle) {
      proxy.impl?.setAngle?.(angle);
    },
    draw(snapshot) {
      proxy.snapshot = snapshot;
      proxy.impl?.draw?.(snapshot);
      if (!bodyState.webglLoadStarted) loadBodySceneModules(proxy, canvas);
    },
    dispose() {
      proxy.impl?.dispose?.();
    },
  };
  loadBodySceneModules(proxy, canvas);
  return proxy;
};

function loadBodySceneModules(proxy, canvas) {
  if (bodyState.webglLoadStarted) return;
  bodyState.webglLoadStarted = true;
  Promise.all([
    import(BODY_V13_REMOTE.three),
    import(BODY_V13_REMOTE.orbit),
  ]).then(([THREE, orbitModule]) => {
    if (!canvas?.isConnected) return;
    const webglScene = createWebGLBodyScene(canvas, THREE, orbitModule.OrbitControls);
    if (!webglScene) throw new Error('webgl scene unavailable');
    proxy.impl = webglScene;
    proxy.mode = 'webgl';
    bodyState.webglReady = true;
    bodyState.sceneMode = 'webgl';
    if (proxy.snapshot) proxy.impl.draw(proxy.snapshot);
    renderBodyModule();
  }).catch((error) => {
    console.warn('[body] WebGL mesh unavailable, falling back to canvas silhouette.', error);
    proxy.impl = legacyBodyCreateScene(canvas);
    proxy.mode = 'fallback';
    bodyState.webglReady = false;
    bodyState.sceneMode = 'fallback';
    if (proxy.snapshot) proxy.impl.draw(proxy.snapshot);
    renderBodyModule();
  });
}

function toggleBodyPlayback() {
  if (bodyState.playing) {
    stopBodyPlayback();
    renderBodyModule();
    return;
  }
  if (bodyState.history.length < 2) return;
  if (bodyState.timelineIndex === 0) bodyState.timelineIndex = bodyState.history.length - 1;
  bodyState.playing = true;
  renderBodyModule();
  bodyState.playTimer = window.setInterval(() => {
    if (bodyState.timelineIndex > 0) {
      bodyState.timelineIndex -= 1;
      renderBodyModule();
      return;
    }
    stopBodyPlayback();
    renderBodyModule();
  }, 920);
}

function stopBodyPlayback() {
  bodyState.playing = false;
  if (bodyState.playTimer) {
    window.clearInterval(bodyState.playTimer);
    bodyState.playTimer = null;
  }
}

function clampBodyTimeline(index) {
  const max = Math.max(0, bodyState.history.length - 1);
  const value = Number(index);
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(0, Math.round(value)));
}

function bodyIndexToSliderValue(index) {
  return Math.max(0, bodyState.history.length - 1 - clampBodyTimeline(index));
}

function sliderValueToBodyIndex(value) {
  return clampBodyTimeline(bodyState.history.length - 1 - Number(value || 0));
}

function formatBodyTimelineLabel(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const locale = currentLang() === 'en' ? 'en-US' : currentLang() === 'es' ? 'es-ES' : 'zh-CN';
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(date);
}

function bodyHeatGroups(current, previous) {
  if (!current || !previous) return [];
  const groups = [
    { id: 'chest', label: fieldShortLabel('chest'), delta: round1((current.chest || 0) - (previous.chest || 0)), unit: 'cm' },
    { id: 'waist', label: fieldShortLabel('waist'), delta: round1((current.waist || 0) - (previous.waist || 0)), unit: 'cm' },
    { id: 'hip', label: fieldShortLabel('hip'), delta: round1((current.hip || 0) - (previous.hip || 0)), unit: 'cm' },
    { id: 'upperArmL', label: currentLang() === 'zh' ? '上臂' : currentLang() === 'es' ? 'Brazo' : 'Arms', delta: round1((averageOf(current.upperArmL, current.upperArmR) || 0) - (averageOf(previous.upperArmL, previous.upperArmR) || 0)), unit: 'cm' },
    { id: 'thighL', label: currentLang() === 'zh' ? '大腿' : currentLang() === 'es' ? 'Muslo' : 'Thighs', delta: round1((averageOf(current.thighL, current.thighR) || 0) - (averageOf(previous.thighL, previous.thighR) || 0)), unit: 'cm' },
    { id: 'calfL', label: currentLang() === 'zh' ? '小腿' : currentLang() === 'es' ? 'Pantorrilla' : 'Calves', delta: round1((averageOf(current.calfL, current.calfR) || 0) - (averageOf(previous.calfL, previous.calfR) || 0)), unit: 'cm' },
  ];
  return groups.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).filter((item) => Number.isFinite(item.delta));
}

function heatPropsForDelta(delta) {
  if (!bodyState.heat) {
    return {
      color: 0xecf3ff,
      emissive: 0x618bff,
      emissiveIntensity: 0.04,
      opacity: 0.98,
    };
  }
  const magnitude = Math.min(1, Math.abs(delta || 0) / 4.6);
  if ((delta || 0) < -0.12) {
    return {
      color: mixHex(0xecf9f0, 0x9ae2b8, magnitude),
      emissive: mixHex(0x7de2a3, 0x2fc97b, magnitude),
      emissiveIntensity: 0.12 + magnitude * 0.38,
      opacity: 0.98,
    };
  }
  if ((delta || 0) > 0.12) {
    return {
      color: mixHex(0xf0f4ff, 0x9db7ff, magnitude),
      emissive: mixHex(0x8fb0ff, 0x587fff, magnitude),
      emissiveIntensity: 0.14 + magnitude * 0.42,
      opacity: 0.98,
    };
  }
  return {
    color: 0xf7fbff,
    emissive: 0x8eabff,
    emissiveIntensity: 0.06,
    opacity: 0.98,
  };
}

function createWebGLBodyScene(canvas, THREE, OrbitControls) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (error) {
    console.error(error);
    return null;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf4f7ff, 5.8, 10.8);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 30);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 3.3;
  controls.maxDistance = 7.2;
  controls.minPolarAngle = 0.96;
  controls.maxPolarAngle = 2.08;
  controls.target.set(0, 0.08, 0);
  controls.zoomSpeed = 0.9;
  controls.rotateSpeed = 0.84;

  const hemi = new THREE.HemisphereLight(0xebf2ff, 0x2b3647, 1.48);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(3.2, 4.6, 3.8);
  key.castShadow = true;
  key.shadow.mapSize.width = 1024;
  key.shadow.mapSize.height = 1024;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 16;
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4;
  scene.add(key);

  const rim = new THREE.DirectionalLight(0x92a8ff, 1.18);
  rim.position.set(-3.4, 2.7, -3.6);
  scene.add(rim);

  const fill = new THREE.PointLight(0xe5f0ff, 1.15, 12, 2);
  fill.position.set(0, 1.7, 2.4);
  scene.add(fill);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(2.06, 72),
    new THREE.ShadowMaterial({ transparent: true, opacity: 0.16, color: 0x8aa2d6 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.18;
  floor.receiveShadow = true;
  scene.add(floor);

  const glowRing = new THREE.Mesh(
    new THREE.RingGeometry(1.02, 1.76, 72),
    new THREE.MeshBasicMaterial({ color: 0x8aa7ff, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
  );
  glowRing.rotation.x = -Math.PI / 2;
  glowRing.position.y = -1.17;
  scene.add(glowRing);

  const focusHalo = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.015, 12, 80),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
  );
  focusHalo.rotation.x = Math.PI / 2;
  focusHalo.position.y = 0.12;
  scene.add(focusHalo);

  let currentGroup = null;
  let ghostGroup = null;
  let disposed = false;

  function updateSize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.round(rect.width || canvas.clientWidth || 320));
    const height = Math.max(420, Math.round(rect.height || canvas.clientHeight || 420));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  updateSize();
  let resizeObserver = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(canvas);
  }

  function alignCamera(angle) {
    const radius = 4.8;
    const rad = (angle || 0) * Math.PI / 180;
    camera.position.set(Math.sin(rad) * radius, 1.26, Math.cos(rad) * radius);
    controls.target.set(0, 0.1, 0);
    controls.update();
  }

  function setGroup(snapshot) {
    if (currentGroup) {
      scene.remove(currentGroup);
      disposeThreeGroup(currentGroup, THREE);
      currentGroup = null;
    }
    if (ghostGroup) {
      scene.remove(ghostGroup);
      disposeThreeGroup(ghostGroup, THREE);
      ghostGroup = null;
    }
    if (!snapshot?.current) return;
    currentGroup = buildWebglBodyGroup(THREE, snapshot.current, snapshot.previous, false);
    scene.add(currentGroup);
    if (snapshot.previous && bodyState.overlay) {
      ghostGroup = buildWebglBodyGroup(THREE, snapshot.previous, null, true);
      scene.add(ghostGroup);
    }
    updateFocus(snapshot);
  }

  function updateFocus(snapshot) {
    const dims = buildBodyMeshDims(snapshot?.current);
    const yMap = dims?.focusY || {};
    const targetY = yMap[bodyState.focusField] ?? 0.02;
    focusHalo.position.set(0, targetY, 0);
    focusHalo.scale.setScalar((dims?.haloRadiusMap?.[bodyState.focusField] || 1) * 1.02);
    focusHalo.material.opacity = bodyState.focusField ? 0.22 : 0.02;
  }

  function animate(time) {
    if (disposed) return;
    requestAnimationFrame(animate);
    controls.update();
    glowRing.material.opacity = 0.1 + Math.sin(time / 950) * 0.024;
    focusHalo.material.opacity = bodyState.focusField ? 0.15 + Math.sin(time / 210) * 0.07 : 0.02;
    if (currentGroup) {
      currentGroup.position.y = Math.sin(time / 980) * 0.012;
      const mats = currentGroup.userData?.heatMaterials || [];
      mats.forEach((entry, idx) => {
        entry.material.emissiveIntensity = entry.baseIntensity * (0.9 + Math.sin(time / 260 + idx) * 0.15);
      });
    }
    renderer.render(scene, camera);
  }

  alignCamera(bodyState.view || 0);
  requestAnimationFrame(animate);

  return {
    mode: 'webgl',
    snapshot: null,
    setAngle(angle) {
      bodyState.view = Number(angle) || 0;
      alignCamera(bodyState.view);
    },
    focusField(field) {
      bodyState.focusField = field || '';
      if (this.snapshot) updateFocus(this.snapshot);
    },
    draw(snapshot) {
      this.snapshot = snapshot;
      updateSize();
      setGroup(snapshot);
      alignCamera(bodyState.view || 0);
    },
    dispose() {
      disposed = true;
      resizeObserver?.disconnect();
      controls.dispose();
      if (currentGroup) disposeThreeGroup(currentGroup, THREE);
      if (ghostGroup) disposeThreeGroup(ghostGroup, THREE);
      renderer.dispose();
    },
  };
}

function buildWebglBodyGroup(THREE, recordInput, previousInput, ghost = false) {
  const record = withBodyDefaults(recordInput);
  const previous = previousInput ? withBodyDefaults(previousInput) : null;
  const dims = buildBodyMeshDims(record);
  const deltas = buildBodySegmentDeltaMap(record, previous);
  const group = new THREE.Group();
  group.userData = { heatMaterials: [], dims };

  const headMat = createBodyMaterial(THREE, ghost, 0.1);
  const torsoChestMat = createBodyMaterial(THREE, ghost, deltas.chest);
  const torsoMidMat = createBodyMaterial(THREE, ghost, deltas.waist || deltas.abdomen);
  const torsoHipMat = createBodyMaterial(THREE, ghost, deltas.hip);
  const armLMat = createBodyMaterial(THREE, ghost, deltas.upperArmL);
  const armRMat = createBodyMaterial(THREE, ghost, deltas.upperArmR);
  const foreLMat = createBodyMaterial(THREE, ghost, deltas.forearmL || deltas.upperArmL * 0.7);
  const foreRMat = createBodyMaterial(THREE, ghost, deltas.forearmR || deltas.upperArmR * 0.7);
  const thighLMat = createBodyMaterial(THREE, ghost, deltas.thighL);
  const thighRMat = createBodyMaterial(THREE, ghost, deltas.thighR);
  const calfLMat = createBodyMaterial(THREE, ghost, deltas.calfL);
  const calfRMat = createBodyMaterial(THREE, ghost, deltas.calfR);

  const rings = dims.torsoRings;
  const torsoSegments = [
    buildTorsoSegmentMesh(THREE, rings.slice(0, 4), torsoChestMat.material),
    buildTorsoSegmentMesh(THREE, rings.slice(3, 6), torsoMidMat.material),
    buildTorsoSegmentMesh(THREE, rings.slice(5, 8), torsoHipMat.material),
  ];
  torsoSegments.forEach((mesh) => {
    mesh.castShadow = !ghost;
    mesh.receiveShadow = !ghost;
    group.add(mesh);
  });
  collectHeatMat(group, torsoChestMat);
  collectHeatMat(group, torsoMidMat);
  collectHeatMat(group, torsoHipMat);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(dims.neck.x * 0.92, dims.neck.x, dims.neckHeight, 32, 1, false),
    torsoChestMat.material.clone()
  );
  neck.scale.z = dims.neck.z / dims.neck.x;
  neck.position.y = dims.neckCenterY;
  neck.castShadow = !ghost;
  group.add(neck);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(dims.headRadius, 32, 28),
    headMat.material
  );
  head.scale.set(1, 1.12, 0.98);
  head.position.y = dims.headCenterY;
  head.castShadow = !ghost;
  group.add(head);
  collectHeatMat(group, headMat);

  addLimbSet(THREE, group, dims, ghost, 'L', armLMat, foreLMat, thighLMat, calfLMat);
  addLimbSet(THREE, group, dims, ghost, 'R', armRMat, foreRMat, thighRMat, calfRMat);

  return group;
}

function addLimbSet(THREE, group, dims, ghost, sideKey, upperArmMat, forearmMat, thighMat, calfMat) {
  const side = sideKey === 'L' ? -1 : 1;
  const armAnchorX = side * dims.armAnchorX;
  const armUpper = makeCapsuleMesh(THREE, dims.upperArmRadius[sideKey], dims.upperArmLength, upperArmMat.material, ghost);
  armUpper.position.set(armAnchorX, dims.upperArmCenterY, 0);
  armUpper.rotation.z = side * 0.12;
  armUpper.rotation.x = 0.05;
  group.add(armUpper);
  collectHeatMat(group, upperArmMat);

  const forearm = makeCapsuleMesh(THREE, dims.forearmRadius[sideKey], dims.forearmLength, forearmMat.material, ghost);
  forearm.position.set(side * (dims.armAnchorX + dims.forearmOffsetX), dims.forearmCenterY, 0.02);
  forearm.rotation.z = side * 0.09;
  forearm.rotation.x = 0.03;
  group.add(forearm);
  collectHeatMat(group, forearmMat);

  const legUpper = makeCapsuleMesh(THREE, dims.thighRadius[sideKey], dims.thighLength, thighMat.material, ghost);
  legUpper.position.set(side * dims.legGap, dims.thighCenterY, 0);
  legUpper.rotation.z = side * 0.02;
  group.add(legUpper);
  collectHeatMat(group, thighMat);

  const legLower = makeCapsuleMesh(THREE, dims.calfRadius[sideKey], dims.calfLength, calfMat.material, ghost);
  legLower.position.set(side * dims.legGap, dims.calfCenterY, 0.01);
  legLower.rotation.z = side * 0.01;
  group.add(legLower);
  collectHeatMat(group, calfMat);
}

function collectHeatMat(group, entry) {
  if (!entry?.baseIntensity || !entry.material) return;
  group.userData.heatMaterials.push({ material: entry.material, baseIntensity: entry.baseIntensity });
}

function makeCapsuleMesh(THREE, radius, length, material, ghost) {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(Math.max(0.03, radius), Math.max(0.08, length), 6, 18), material);
  mesh.castShadow = !ghost;
  mesh.receiveShadow = !ghost;
  return mesh;
}

function buildTorsoSegmentMesh(THREE, rings, material) {
  const geometry = buildEllipticalStripGeometry(THREE, rings, 38);
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
}

function buildEllipticalStripGeometry(THREE, rings, radialSegments = 36) {
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let i = 0; i < rings.length; i += 1) {
    const ring = rings[i];
    for (let j = 0; j <= radialSegments; j += 1) {
      const theta = (j / radialSegments) * Math.PI * 2;
      positions.push(Math.cos(theta) * ring.x, ring.y, Math.sin(theta) * ring.z);
      uvs.push(j / radialSegments, i / Math.max(1, rings.length - 1));
    }
  }
  const row = radialSegments + 1;
  for (let i = 0; i < rings.length - 1; i += 1) {
    for (let j = 0; j < radialSegments; j += 1) {
      const a = i * row + j;
      const b = a + 1;
      const c = (i + 1) * row + j;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createBodyMaterial(THREE, ghost, delta) {
  if (ghost) {
    return {
      material: new THREE.MeshPhysicalMaterial({
        color: 0xcad7f4,
        transparent: true,
        opacity: 0.18,
        roughness: 0.72,
        metalness: 0.02,
        clearcoat: 0.12,
        side: THREE.DoubleSide,
      }),
      baseIntensity: 0,
    };
  }
  const heat = heatPropsForDelta(delta);
  return {
    material: new THREE.MeshPhysicalMaterial({
      color: heat.color,
      emissive: heat.emissive,
      emissiveIntensity: heat.emissiveIntensity,
      roughness: 0.34,
      metalness: 0.03,
      clearcoat: 0.68,
      clearcoatRoughness: 0.18,
      transparent: heat.opacity < 1,
      opacity: heat.opacity,
      side: THREE.DoubleSide,
    }),
    baseIntensity: heat.emissiveIntensity,
  };
}

function buildBodyMeshDims(record) {
  if (!record) return null;
  const height = clampNum(((record.heightCm || 165) / 165) * 2.18, 1.92, 2.42);
  const bodyFatAdj = clampNum(((record.bodyFat || 22) - 18) * 0.0018, -0.03, 0.05);
  const headRadius = height * 0.095;
  const bottom = -height * 0.5 + 0.02;
  const yAt = (p) => bottom + height * p;
  const ellipse = (cm, xFactor = 0.00315, zFactor = 0.00248) => ({ x: clampNum((cm || 80) * xFactor, 0.09, 0.42), z: clampNum((cm || 80) * zFactor, 0.08, 0.34) });
  const chest = ellipse(record.chest, 0.00328, 0.00266);
  const underbust = ellipse(record.underbust || record.chest * 0.92, 0.00318, 0.00252);
  const waist = ellipse(record.waist, 0.00292, 0.00244 + bodyFatAdj * 0.4);
  const abdomen = ellipse(record.abdomen, 0.00302, 0.00264 + bodyFatAdj * 0.55);
  const hip = ellipse(record.hip, 0.00322, 0.00282 + bodyFatAdj * 0.18);
  const thighTop = ellipse(averageOf(record.thighL, record.thighR) || 54, 0.00248, 0.00196);
  const shoulderX = clampNum((record.shoulder || 42) * 0.0086, 0.26, 0.45);
  const shoulderZ = clampNum(chest.z + 0.04, 0.16, 0.34);
  const neck = { x: clampNum((record.neck || 34) * 0.00328, 0.07, 0.16), z: clampNum((record.neck || 34) * 0.00262, 0.06, 0.13) };
  const armCircL = averageOf(record.upperArmL, record.upperArmL) || 28;
  const armCircR = averageOf(record.upperArmR, record.upperArmR) || 28;
  const foreCircL = averageOf(record.forearmL, record.forearmL) || 24;
  const foreCircR = averageOf(record.forearmR, record.forearmR) || 24;
  const thighCircL = averageOf(record.thighL, record.thighL) || 54;
  const thighCircR = averageOf(record.thighR, record.thighR) || 54;
  const calfCircL = averageOf(record.calfL, record.calfL) || 36;
  const calfCircR = averageOf(record.calfR, record.calfR) || 36;
  const upperArmRadius = { L: clampNum(armCircL * 0.00242, 0.05, 0.12), R: clampNum(armCircR * 0.00242, 0.05, 0.12) };
  const forearmRadius = { L: clampNum(foreCircL * 0.00218, 0.042, 0.094), R: clampNum(foreCircR * 0.00218, 0.042, 0.094) };
  const thighRadius = { L: clampNum(thighCircL * 0.00258, 0.1, 0.2), R: clampNum(thighCircR * 0.00258, 0.1, 0.2) };
  const calfRadius = { L: clampNum(calfCircL * 0.00238, 0.07, 0.14), R: clampNum(calfCircR * 0.00238, 0.07, 0.14) };
  const upperArmLength = height * 0.24;
  const forearmLength = height * 0.21;
  const thighLength = height * 0.28;
  const calfLength = height * 0.27;
  const torsoRings = [
    { y: yAt(0.81), x: neck.x, z: neck.z },
    { y: yAt(0.77), x: shoulderX, z: shoulderZ },
    { y: yAt(0.71), x: chest.x, z: chest.z },
    { y: yAt(0.64), x: underbust.x, z: underbust.z },
    { y: yAt(0.58), x: waist.x, z: waist.z },
    { y: yAt(0.53), x: abdomen.x, z: abdomen.z },
    { y: yAt(0.47), x: hip.x, z: hip.z },
    { y: yAt(0.41), x: thighTop.x, z: thighTop.z },
  ];
  const focusY = {
    chest: yAt(0.7),
    waist: yAt(0.58),
    abdomen: yAt(0.53),
    hip: yAt(0.47),
    upperArmL: yAt(0.63),
    upperArmR: yAt(0.63),
    forearmL: yAt(0.51),
    forearmR: yAt(0.51),
    thighL: yAt(0.31),
    thighR: yAt(0.31),
    calfL: yAt(0.15),
    calfR: yAt(0.15),
    weightKg: yAt(0.55),
  };
  const haloRadiusMap = {
    chest: chest.x * 2.35,
    waist: waist.x * 2.6,
    abdomen: abdomen.x * 2.7,
    hip: hip.x * 2.55,
    upperArmL: upperArmRadius.L * 2.8,
    upperArmR: upperArmRadius.R * 2.8,
    forearmL: forearmRadius.L * 2.8,
    forearmR: forearmRadius.R * 2.8,
    thighL: thighRadius.L * 2.4,
    thighR: thighRadius.R * 2.4,
    calfL: calfRadius.L * 2.5,
    calfR: calfRadius.R * 2.5,
    weightKg: waist.x * 2.8,
  };
  return {
    height,
    headRadius,
    headCenterY: yAt(0.92),
    neck,
    neckHeight: height * 0.045,
    neckCenterY: yAt(0.84),
    torsoRings,
    armAnchorX: shoulderX * 1.04,
    forearmOffsetX: shoulderX * 0.12,
    upperArmRadius,
    forearmRadius,
    upperArmLength,
    forearmLength,
    upperArmCenterY: yAt(0.64),
    forearmCenterY: yAt(0.5),
    legGap: hip.x * 0.32,
    thighRadius,
    calfRadius,
    thighLength,
    calfLength,
    thighCenterY: yAt(0.27),
    calfCenterY: yAt(0.1),
    focusY,
    haloRadiusMap,
  };
}

function buildBodySegmentDeltaMap(current, previous) {
  return {
    chest: round1((current?.chest || 0) - (previous?.chest || 0)),
    waist: round1((current?.waist || 0) - (previous?.waist || 0)),
    abdomen: round1((current?.abdomen || 0) - (previous?.abdomen || 0)),
    hip: round1((current?.hip || 0) - (previous?.hip || 0)),
    upperArmL: round1((current?.upperArmL || 0) - (previous?.upperArmL || 0)),
    upperArmR: round1((current?.upperArmR || 0) - (previous?.upperArmR || 0)),
    forearmL: round1((current?.forearmL || 0) - (previous?.forearmL || 0)),
    forearmR: round1((current?.forearmR || 0) - (previous?.forearmR || 0)),
    thighL: round1((current?.thighL || 0) - (previous?.thighL || 0)),
    thighR: round1((current?.thighR || 0) - (previous?.thighR || 0)),
    calfL: round1((current?.calfL || 0) - (previous?.calfL || 0)),
    calfR: round1((current?.calfR || 0) - (previous?.calfR || 0)),
  };
}

function mixHex(a, b, t) {
  const ar = (a >> 16) & 255; const ag = (a >> 8) & 255; const ab = a & 255;
  const br = (b >> 16) & 255; const bg = (b >> 8) & 255; const bb = b & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

function clampNum(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || 0));
}

function disposeThreeGroup(group, THREE) {
  group?.traverse?.((node) => {
    if (node.geometry) node.geometry.dispose?.();
    if (Array.isArray(node.material)) node.material.forEach((material) => material.dispose?.());
    else node.material?.dispose?.();
  });
}

/* ===== v15 body editor fold / explicit labels ===== */
const BODY_PANEL_STORAGE_KEY_V15 = 'haochijia.body.panel.open.v15';
Object.assign(BODY_TEXTS.zh, {
  panelTitle: '身体围度编辑器',
  panelSummary: '填写一次身体围度后，编辑器可以收成一个按钮，需要时再展开。',
  addRecord: '继续填写身体围度',
  openHistory: '查看历史与编辑',
  copyLast: '复制上一条围度',
  saveRecord: '保存这次身体记录',
  clearForm: '清空本次围度输入',
  exportJson: '导出身体 JSON',
  exportCsv: '导出身体 CSV',
  useThis: '载入这条记录',
  delete: '删除这条记录',
  panelOpen: '展开身体围度编辑',
  panelClose: '收起身体围度编辑',
});
Object.assign(BODY_TEXTS.en, {
  panelTitle: 'Body measurement editor',
  panelSummary: 'After the first entry, this editor can fold back into one clear button until you need it again.',
  addRecord: 'Keep editing body measurements',
  openHistory: 'History and editor',
  copyLast: 'Copy previous measurements',
  saveRecord: 'Save this body entry',
  clearForm: 'Clear this body draft',
  exportJson: 'Export body JSON',
  exportCsv: 'Export body CSV',
  useThis: 'Load this record',
  delete: 'Delete this record',
  panelOpen: 'Open body editor',
  panelClose: 'Close body editor',
});
Object.assign(BODY_TEXTS.es, {
  panelTitle: 'Editor corporal',
  panelSummary: 'Tras el primer registro, este editor puede plegarse y quedar como un único botón claro.',
  addRecord: 'Seguir editando medidas corporales',
  openHistory: 'Historial y editor',
  copyLast: 'Copiar medidas anteriores',
  saveRecord: 'Guardar este registro corporal',
  clearForm: 'Limpiar este borrador corporal',
  exportJson: 'Exportar JSON corporal',
  exportCsv: 'Exportar CSV corporal',
  useThis: 'Cargar este registro',
  delete: 'Borrar este registro',
  panelOpen: 'Abrir editor corporal',
  panelClose: 'Cerrar editor corporal',
});

const BODY_V15_PANEL_HTML = `
  <section class="fold-card card body-panel-card" id="bodyPanelCard">
    <header class="fold-header body-panel-head body-panel-head-v15">
      <div>
        <p class="section-kicker" data-body-text="historyTitle"></p>
        <h2 data-body-text="panelTitle"></h2>
        <p class="fold-summary-text" id="bodyPanelSummaryText"></p>
      </div>
      <div class="body-panel-top-actions body-panel-top-actions-v15">
        <label class="header-select body-unit-select">
          <span data-body-text="unitLabel"></span>
          <select id="bodyUnitSelect">
            <option value="cm"></option>
            <option value="in"></option>
          </select>
        </label>
        <button type="button" class="ghost-btn" id="bodyCopyBtn">复制上一次记录</button>
        <button type="button" class="icon-btn" id="bodyPanelToggleBtn">收起身体围度编辑</button>
      </div>
    </header>
    <div class="fold-body body-panel-body" id="bodyPanelBody">
      <form id="bodyRecordForm" class="body-form-grid" autocomplete="off"></form>
      <div class="body-form-actions">
        <button type="button" class="primary-btn" id="bodySaveBtn">保存这次身体记录</button>
        <button type="button" class="ghost-btn" id="bodyClearBtn">清空当前输入</button>
        <button type="button" class="ghost-btn" id="bodyExportJsonBtn">导出 JSON</button>
        <button type="button" class="ghost-btn" id="bodyExportCsvBtn">导出 CSV</button>
      </div>
      <div class="muted small body-form-status" id="bodyFormStatus"></div>
      <div class="body-history-shell">
        <div class="mini-title" data-body-text="historyList"></div>
        <div class="body-history-list" id="bodyHistoryList"></div>
      </div>
    </div>
  </section>
`;

function loadBodyPanelOpenV15() {
  try {
    const raw = localStorage.getItem(BODY_PANEL_STORAGE_KEY_V15);
    return raw == null ? false : raw !== '0';
  } catch {
    return false;
  }
}
function saveBodyPanelOpenV15() {
  try { localStorage.setItem(BODY_PANEL_STORAGE_KEY_V15, bodyState.panelOpen ? '1' : '0'); } catch {}
}
bodyState.panelOpen = loadBodyPanelOpenV15();

const legacyBodyInitV15 = initBodyModule;
if (typeof document !== 'undefined') document.removeEventListener('DOMContentLoaded', legacyBodyInitV15);

initBodyModule = function initBodyModuleV15() {
  if (bodyState.initialized) return;
  const main = document.querySelector('.main-stack');
  if (!main) return;
  const firstSection = main.querySelector('.overview-grid');
  if (firstSection) {
    const existing = document.getElementById('bodyHeroCard');
    if (existing) existing.remove();
    firstSection.insertAdjacentHTML('beforebegin', BODY_V13_HERO_HTML);
  }
  const profilePanel = document.getElementById('profilePanel');
  if (profilePanel) {
    const existingPanel = document.getElementById('bodyPanelCard');
    if (existingPanel) existingPanel.remove();
    profilePanel.insertAdjacentHTML('beforebegin', BODY_V15_PANEL_HTML);
  }
  bindBodyNodes();
  renderBodyForm();
  bindBodyEvents();
  applyBodyTexts();
  bodyState.scene = createBodyScene(bodyState.nodes.canvas);
  renderBodyModule();
  bodyState.initialized = true;
  bodyState.panelOpen = loadBodyPanelOpenV15();
  setBodyPanelState(bodyState.panelOpen, false);
  window.__haochijiaBodyReady = true;
  window.__haochijiaOpenBodyPanel = (focus = true) => {
    setBodyPanelState(true);
    bodyState.nodes.panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (focus) setTimeout(() => bodyState.nodes.form?.querySelector('[data-body-field="weightKg"]')?.focus(), 220);
  };
  window.__haochijiaToggleBodyPanel = (next) => setBodyPanelState(Boolean(next));
  window.dispatchEvent(new CustomEvent('haochijia:body-ready'));
};

document.addEventListener('DOMContentLoaded', initBodyModule);

const legacyBindBodyNodesV15 = bindBodyNodes;
bindBodyNodes = function bindBodyNodesV15() {
  legacyBindBodyNodesV15();
  bodyState.nodes.panelSummary = document.getElementById('bodyPanelSummaryText');
  bodyState.nodes.panelToggleBtn = document.getElementById('bodyPanelToggleBtn');
  bodyState.nodes.panelBody = document.getElementById('bodyPanelBody');
};

function setBodyPanelState(isOpen, persist = true) {
  bodyState.panelOpen = Boolean(isOpen);
  bodyState.nodes.panel?.classList.toggle('collapsed', !bodyState.panelOpen);
  if (bodyState.nodes.panelToggleBtn) bodyState.nodes.panelToggleBtn.textContent = bodyState.panelOpen ? T('panelClose') : T('panelOpen');
  if (persist) saveBodyPanelOpenV15();
}

const legacyBindBodyEventsV15 = bindBodyEvents;
bindBodyEvents = function bindBodyEventsV15() {
  legacyBindBodyEventsV15();
  bodyState.nodes.panelToggleBtn?.addEventListener('click', () => setBodyPanelState(!bodyState.panelOpen));
};

const legacyRenderBodyModuleV15 = renderBodyModule;
renderBodyModule = function renderBodyModuleV15() {
  legacyRenderBodyModuleV15();
  const latest = bodyState.history?.[0];
  const bits = [];
  if (Number.isFinite(Number(latest?.weightKg))) bits.push(`${round1(latest.weightKg)} kg`);
  if (Number.isFinite(Number(latest?.waist))) bits.push(`${currentLang() === 'zh' ? '腰' : currentLang() === 'es' ? 'cintura' : 'waist'} ${round1(latest.waist)} cm`);
  if (Number.isFinite(Number(latest?.hip))) bits.push(`${currentLang() === 'zh' ? '臀' : currentLang() === 'es' ? 'cadera' : 'hips'} ${round1(latest.hip)} cm`);
  if (bodyState.nodes.panelSummary) bodyState.nodes.panelSummary.textContent = bits.length ? `${T('panelSummary')} · ${bits.join(' · ')}` : T('panelSummary');
  setBodyPanelState(bodyState.panelOpen, false);
};

const legacyScrollToBodyPanelV15 = scrollToBodyPanel;
scrollToBodyPanel = function scrollToBodyPanelV15(focusFirst) {
  setBodyPanelState(true);
  legacyScrollToBodyPanelV15(focusFirst);
};


/* ===== v20 immersive body hero interactions ===== */
Object.assign(BODY_TEXTS.zh, {
  hubMusic: '音乐参数',
  hubBody: '身体围度',
  hubProfile: '营养参数',
  hubFood: '输入摄入',
  hubCapture: '拍照上传',
  hubToday: '今日记录',
  hubOpen: '点击人体展开功能',
  hubClose: '收起快捷入口',
  heroClickHint: '点击人体展开功能，拖动可全方位查看。',
});
Object.assign(BODY_TEXTS.en, {
  hubMusic: 'Music',
  hubBody: 'Measurements',
  hubProfile: 'Profile',
  hubFood: 'Log intake',
  hubCapture: 'Upload',
  hubToday: 'Today',
  hubOpen: 'Tap body for tools',
  hubClose: 'Hide quick tools',
  heroClickHint: 'Tap the body to open tools. Drag to inspect all angles.',
});
Object.assign(BODY_TEXTS.es, {
  hubMusic: 'Música',
  hubBody: 'Medidas',
  hubProfile: 'Perfil',
  hubFood: 'Registrar',
  hubCapture: 'Subir',
  hubToday: 'Hoy',
  hubOpen: 'Toca el cuerpo para abrir funciones',
  hubClose: 'Ocultar accesos rápidos',
  heroClickHint: 'Toca el cuerpo para abrir funciones. Arrastra para verlo desde todos los ángulos.',
});

const BODY_PANEL_STORAGE_KEY_V20 = 'haochijia.body.panel.open.v20';
function loadBodyPanelOpenV20() {
  try {
    const raw = localStorage.getItem(BODY_PANEL_STORAGE_KEY_V20);
    return raw == null ? true : raw !== '0';
  } catch {
    return true;
  }
}
function saveBodyPanelOpenV20() {
  try { localStorage.setItem(BODY_PANEL_STORAGE_KEY_V20, bodyState.panelOpen ? '1' : '0'); } catch {}
}
bodyState.panelOpen = loadBodyPanelOpenV20();

function ensureBodyActionHubV20() {
  const wrap = document.querySelector('.body-model-stage-wrap-v13') || document.querySelector('.body-model-stage-wrap');
  if (!wrap || document.getElementById('bodyActionHub')) return;
  wrap.insertAdjacentHTML('beforeend', `
    <button type="button" class="body-stage-action-trigger" id="bodyStageActionTrigger"></button>
    <div class="body-action-hub" id="bodyActionHub" hidden>
      <button type="button" class="body-action-hub-btn" data-body-hub-action="sound"></button>
      <button type="button" class="body-action-hub-btn" data-body-hub-action="body"></button>
      <button type="button" class="body-action-hub-btn" data-body-hub-action="profile"></button>
      <button type="button" class="body-action-hub-btn" data-body-hub-action="food"></button>
      <button type="button" class="body-action-hub-btn" data-body-hub-action="capture"></button>
      <button type="button" class="body-action-hub-btn" data-body-hub-action="today"></button>
    </div>
  `);
}
function refreshBodyActionHubCopyV20() {
  const trigger = document.getElementById('bodyStageActionTrigger');
  if (trigger) trigger.textContent = bodyState.hubOpen ? T('hubClose') : T('hubOpen');
  if (bodyState.nodes.dragTip) bodyState.nodes.dragTip.textContent = T('heroClickHint');
  const labelMap = {
    sound: T('hubMusic'),
    body: T('hubBody'),
    profile: T('hubProfile'),
    food: T('hubFood'),
    capture: T('hubCapture'),
    today: T('hubToday'),
  };
  document.querySelectorAll('#bodyActionHub [data-body-hub-action]').forEach((btn) => {
    btn.textContent = labelMap[btn.dataset.bodyHubAction] || btn.dataset.bodyHubAction;
  });
}
function setBodyHubOpenV20(next) {
  bodyState.hubOpen = Boolean(next);
  const hub = document.getElementById('bodyActionHub');
  if (!hub) return;
  hub.hidden = !bodyState.hubOpen;
  hub.classList.toggle('show', bodyState.hubOpen);
  refreshBodyActionHubCopyV20();
}
function handleBodyHubActionV20(action) {
  setBodyHubOpenV20(false);
  if (action === 'body') {
    window.__haochijiaOpenBodyPanel?.(true);
    return;
  }
  if (action === 'profile') {
    window.__haochijiaOpenPanel?.('profile');
    return;
  }
  if (action === 'sound') {
    window.__haochijiaOpenPanel?.('sound');
    return;
  }
  if (action === 'food') {
    window.__haochijiaOpenPanel?.('food');
    return;
  }
  if (action === 'capture') {
    window.__haochijiaOpenPanel?.('food');
    window.__haochijiaSetPanelState?.('capture', true, false);
    window.__haochijiaOpenPanel?.('capture');
    return;
  }
  if (action === 'today') {
    window.__haochijiaSetPanelState?.('today', true, false);
    window.__haochijiaOpenPanel?.('today');
  }
}
const legacyBindBodyNodesV20 = bindBodyNodes;
bindBodyNodes = function bindBodyNodesV20() {
  legacyBindBodyNodesV20();
  ensureBodyActionHubV20();
  bodyState.nodes.stageActionTrigger = document.getElementById('bodyStageActionTrigger');
  bodyState.nodes.actionHub = document.getElementById('bodyActionHub');
  bodyState.nodes.stageWrap = document.querySelector('.body-model-stage-wrap-v13') || document.querySelector('.body-model-stage-wrap');
};
const legacyBindBodyEventsV20 = bindBodyEvents;
bindBodyEvents = function bindBodyEventsV20() {
  legacyBindBodyEventsV20();
  if (bodyState.nodes.stageActionTrigger && !bodyState.nodes.stageActionTrigger.dataset.boundV20) {
    bodyState.nodes.stageActionTrigger.dataset.boundV20 = '1';
    bodyState.nodes.stageActionTrigger.addEventListener('click', () => setBodyHubOpenV20(!bodyState.hubOpen));
  }
  if (bodyState.nodes.actionHub && !bodyState.nodes.actionHub.dataset.boundV20) {
    bodyState.nodes.actionHub.dataset.boundV20 = '1';
    bodyState.nodes.actionHub.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-body-hub-action]');
      if (!btn) return;
      handleBodyHubActionV20(btn.dataset.bodyHubAction);
    });
  }
  if (bodyState.nodes.stageWrap && !bodyState.nodes.stageWrap.dataset.boundV20) {
    bodyState.nodes.stageWrap.dataset.boundV20 = '1';
    let startX = 0;
    let startY = 0;
    bodyState.nodes.stageWrap.addEventListener('pointerdown', (event) => {
      startX = event.clientX;
      startY = event.clientY;
    }, { passive: true });
    bodyState.nodes.stageWrap.addEventListener('pointerup', (event) => {
      const dx = Math.abs(event.clientX - startX);
      const dy = Math.abs(event.clientY - startY);
      if (dx <= 6 && dy <= 6 && !event.target.closest('button')) {
        setBodyHubOpenV20(!bodyState.hubOpen);
      }
    });
  }
  if (!document.body.dataset.bodyHubOutsideBound) {
    document.body.dataset.bodyHubOutsideBound = '1';
    document.addEventListener('click', (event) => {
      if (!bodyState.hubOpen) return;
      const inside = event.target.closest('#bodyActionHub, #bodyStageActionTrigger, .body-model-stage-wrap-v13, .body-model-stage-wrap');
      if (!inside) setBodyHubOpenV20(false);
    });
  }
};
const legacyRenderBodyModuleV20 = renderBodyModule;
renderBodyModule = function renderBodyModuleV20() {
  legacyRenderBodyModuleV20();
  refreshBodyActionHubCopyV20();
};
const legacySaveBodyRecordV20 = saveBodyRecord;
saveBodyRecord = function saveBodyRecordV20() {
  legacySaveBodyRecordV20();
  if ((bodyState.history || []).length) {
    setBodyPanelState(false);
    setBodyHubOpenV20(false);
  }
};
setBodyPanelState = function setBodyPanelStateV20(isOpen, persist = true) {
  bodyState.panelOpen = Boolean(isOpen);
  bodyState.nodes.panel?.classList.toggle('collapsed', !bodyState.panelOpen);
  if (bodyState.nodes.panelToggleBtn) bodyState.nodes.panelToggleBtn.textContent = bodyState.panelOpen ? T('panelClose') : T('panelOpen');
  if (persist) saveBodyPanelOpenV20();
};
window.addEventListener('haochijia:body-ready', () => {
  ensureBodyActionHubV20();
  refreshBodyActionHubCopyV20();
});

/* ===== v22 mobile-first body bridge / snapshot sync / simplified hub ===== */
Object.assign(BODY_TEXTS.zh, {
  hubMusic: '音乐',
  hubBody: '身体表格',
  hubProfile: '套餐',
  hubFood: '搜食品',
  hubCapture: '拍照',
  hubToday: '数据',
  hubOpen: '点人体展开',
  hubClose: '收起入口',
  heroClickHint: '点人体展开核心功能，拖动可环绕查看。',
});
Object.assign(BODY_TEXTS.en, {
  hubMusic: 'Music',
  hubBody: 'Body form',
  hubProfile: 'Combos',
  hubFood: 'Search food',
  hubCapture: 'Upload',
  hubToday: 'Data',
  hubOpen: 'Tap body',
  hubClose: 'Hide tools',
  heroClickHint: 'Tap the body for core tools. Drag to orbit around the model.',
});
Object.assign(BODY_TEXTS.es, {
  hubMusic: 'Música',
  hubBody: 'Formulario',
  hubProfile: 'Combos',
  hubFood: 'Buscar comida',
  hubCapture: 'Subir',
  hubToday: 'Datos',
  hubOpen: 'Tocar cuerpo',
  hubClose: 'Ocultar',
  heroClickHint: 'Toca el cuerpo para abrir las funciones centrales. Arrastra para verlo alrededor.',
});

handleBodyHubActionV20 = function handleBodyHubActionV22(action) {
  setBodyHubOpenV20(false);
  if (action === 'body') {
    window.__haochijiaOpenBodyPanel?.(true);
    return;
  }
  if (action === 'sound') {
    window.__haochijiaOpenPanel?.('sound');
    return;
  }
  if (action === 'food') {
    window.__haochijiaOpenPanel?.('food');
    return;
  }
  if (action === 'capture') {
    window.__haochijiaOpenPanel?.('capture');
    return;
  }
  if (action === 'profile') {
    window.__haochijiaOpenPanel?.('combo');
    return;
  }
  if (action === 'today') {
    window.__haochijiaOpenPanel?.('data');
  }
};

window.__haochijiaGetBodySnapshot = () => {
  try { return buildBodySnapshot(); }
  catch { return null; }
};
window.__haochijiaGetBodyLatestRecord = () => {
  try { return bodyState.history?.[0] ? { ...bodyState.history[0] } : null; }
  catch { return null; }
};
window.__haochijiaGetBodyHistoryCount = () => {
  try { return Array.isArray(bodyState.history) ? bodyState.history.length : 0; }
  catch { return 0; }
};
window.__haochijiaFocusBodyField = (fieldId = 'weightKg') => {
  try {
    const input = bodyState.nodes.form?.querySelector(`[data-body-field="${String(fieldId)}"]`);
    input?.focus?.();
  } catch {}
};
window.__haochijiaBodyFieldIds = BODY_FIELDS.map((field) => field.id);

function emitBodySyncV22(extra = {}) {
  try {
    window.dispatchEvent(new CustomEvent('haochijia:body-sync', {
      detail: {
        snapshot: buildBodySnapshot(),
        historyCount: Array.isArray(bodyState.history) ? bodyState.history.length : 0,
        latest: bodyState.history?.[0] ? { ...bodyState.history[0] } : null,
        ...extra,
      },
    }));
  } catch (err) {
    console.warn(err);
  }
}

const legacyRenderBodyModuleV22 = renderBodyModule;
renderBodyModule = function renderBodyModuleV22() {
  legacyRenderBodyModuleV22();
  emitBodySyncV22();
};

const legacySaveBodyRecordV22 = saveBodyRecord;
saveBodyRecord = function saveBodyRecordV22() {
  const before = Array.isArray(bodyState.history) ? bodyState.history.length : 0;
  legacySaveBodyRecordV22();
  const after = Array.isArray(bodyState.history) ? bodyState.history.length : 0;
  emitBodySyncV22({ saved: after > before });
};

window.addEventListener('haochijia:body-ready', () => {
  refreshBodyActionHubCopyV20();
  emitBodySyncV22({ ready: true });
});
