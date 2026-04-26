export const APP_VERSION = '3.8.0';

export const ACTIVITY_LEVELS = {
  sedentary: { label: '久坐', short: '久坐', description: '日常走动少，几乎不安排运动' },
  lowActive: { label: '低活动', short: '低活动', description: '每周有少量步行或轻运动' },
  active: { label: '活跃', short: '活跃', description: '大多数日子会运动或通勤活动较多' },
  veryActive: { label: '高活动', short: '高活动', description: '训练量大或体力劳动较多' },
};

export const GOALS = {
  maintain: { label: '维持', multiplier: 1.0 },
  fatLoss: { label: '减脂', multiplier: 0.9 },
  recomposition: { label: '体成分优化', multiplier: 1.0 },
  muscleGain: { label: '增肌', multiplier: 1.06 },
};

export const TRAINING_MODES = {
  none: { label: '日常活动', proteinMinKg: 0.8, proteinMaxKg: 1.2 },
  general: { label: '规律健身', proteinMinKg: 1.2, proteinMaxKg: 1.6 },
  resistance: { label: '力量 / 增肌', proteinMinKg: 1.6, proteinMaxKg: 2.2 },
  mixed: { label: '球类 / 综合训练', proteinMinKg: 1.4, proteinMaxKg: 1.8 },
  endurance: { label: '耐力训练', proteinMinKg: 1.4, proteinMaxKg: 1.8 },
};

export const PHYSIOLOGY_STATES = {
  standard: { label: '常规状态', energyAdd: 0 },
  pregnantT1: { label: '孕早期', energyAdd: 0 },
  pregnantT2: { label: '孕中期', energyAdd: 340 },
  pregnantT3: { label: '孕晚期', energyAdd: 452 },
  lactation0_6: { label: '哺乳期（0–6 个月）', energyAdd: 330 },
  lactation7_12: { label: '哺乳期（7–12 个月）', energyAdd: 400 },
};

export const GLUCOSE_STATUSES = {
  normal: { label: '无特殊情况' },
  prediabetes: { label: '糖前期' },
  type1: { label: '1 型糖尿病' },
  type2: { label: '2 型糖尿病' },
  gestational: { label: '妊娠糖尿病' },
};

export const CYCLE_PHASES = {
  none: { label: '未记录 / 不适用' },
  menstruation: { label: '经期' },
  follicular: { label: '卵泡期' },
  ovulation: { label: '排卵期' },
  luteal: { label: '黄体期 / 经前' },
  perimenopause: { label: '围绝经期' },
  menopause: { label: '绝经后' },
};

export const JOINT_FOCUS_AREAS = {
  none: { label: '无特殊' },
  knee: { label: '膝' },
  heel: { label: '跟骨 / 足跟' },
  hip: { label: '髋' },
  spine: { label: '腰背 / 脊柱' },
  multi: { label: '多部位' },
};

const AGE_BANDS = [
  { key: '14_18', min: 14, max: 18 },
  { key: '19_30', min: 19, max: 30 },
  { key: '31_50', min: 31, max: 50 },
  { key: '51_70', min: 51, max: 70 },
  { key: '71_plus', min: 71, max: Infinity },
];

const DRI = {
  male: {
    '14_18': { waterMl: 3300, carbG: 130, fiberG: 38, proteinG: 52, alaG: 1.6, omega6G: 16, calciumMg: 1300, phosphorusMg: 1250, ironMg: 11, magnesiumMg: 410, zincMg: 11, copperMg: 0.89, manganeseMg: 2.2, seleniumMcg: 55, iodineMcg: 150, potassiumMg: 3000, vitaminAMcg: 900, vitaminCMg: 75, vitaminDMcg: 15, vitaminEMg: 15, vitaminKMcg: 75, vitaminB1Mg: 1.2, vitaminB2Mg: 1.3, niacinMg: 16, vitaminB6Mg: 1.3, folateMcg: 400, vitaminB12Mcg: 2.4, pantothenicMg: 5, biotinMcg: 25 },
    '19_30': { waterMl: 3700, carbG: 130, fiberG: 38, proteinG: 56, alaG: 1.6, omega6G: 17, calciumMg: 1000, phosphorusMg: 700, ironMg: 8, magnesiumMg: 400, zincMg: 11, copperMg: 0.9, manganeseMg: 2.3, seleniumMcg: 55, iodineMcg: 150, potassiumMg: 3400, vitaminAMcg: 900, vitaminCMg: 90, vitaminDMcg: 15, vitaminEMg: 15, vitaminKMcg: 120, vitaminB1Mg: 1.2, vitaminB2Mg: 1.3, niacinMg: 16, vitaminB6Mg: 1.3, folateMcg: 400, vitaminB12Mcg: 2.4, pantothenicMg: 5, biotinMcg: 30 },
    '31_50': { waterMl: 3700, carbG: 130, fiberG: 38, proteinG: 56, alaG: 1.6, omega6G: 17, calciumMg: 1000, phosphorusMg: 700, ironMg: 8, magnesiumMg: 420, zincMg: 11, copperMg: 0.9, manganeseMg: 2.3, seleniumMcg: 55, iodineMcg: 150, potassiumMg: 3400, vitaminAMcg: 900, vitaminCMg: 90, vitaminDMcg: 15, vitaminEMg: 15, vitaminKMcg: 120, vitaminB1Mg: 1.2, vitaminB2Mg: 1.3, niacinMg: 16, vitaminB6Mg: 1.3, folateMcg: 400, vitaminB12Mcg: 2.4, pantothenicMg: 5, biotinMcg: 30 },
    '51_70': { waterMl: 3700, carbG: 130, fiberG: 30, proteinG: 56, alaG: 1.6, omega6G: 14, calciumMg: 1000, phosphorusMg: 700, ironMg: 8, magnesiumMg: 420, zincMg: 11, copperMg: 0.9, manganeseMg: 2.3, seleniumMcg: 55, iodineMcg: 150, potassiumMg: 3400, vitaminAMcg: 900, vitaminCMg: 90, vitaminDMcg: 15, vitaminEMg: 15, vitaminKMcg: 120, vitaminB1Mg: 1.2, vitaminB2Mg: 1.3, niacinMg: 16, vitaminB6Mg: 1.7, folateMcg: 400, vitaminB12Mcg: 2.4, pantothenicMg: 5, biotinMcg: 30 },
    '71_plus': { waterMl: 3700, carbG: 130, fiberG: 30, proteinG: 56, alaG: 1.6, omega6G: 14, calciumMg: 1200, phosphorusMg: 700, ironMg: 8, magnesiumMg: 420, zincMg: 11, copperMg: 0.9, manganeseMg: 2.3, seleniumMcg: 55, iodineMcg: 150, potassiumMg: 3400, vitaminAMcg: 900, vitaminCMg: 90, vitaminDMcg: 20, vitaminEMg: 15, vitaminKMcg: 120, vitaminB1Mg: 1.2, vitaminB2Mg: 1.3, niacinMg: 16, vitaminB6Mg: 1.7, folateMcg: 400, vitaminB12Mcg: 2.4, pantothenicMg: 5, biotinMcg: 30 },
  },
  female: {
    '14_18': { waterMl: 2300, carbG: 130, fiberG: 26, proteinG: 46, alaG: 1.1, omega6G: 11, calciumMg: 1300, phosphorusMg: 1250, ironMg: 15, magnesiumMg: 360, zincMg: 9, copperMg: 0.89, manganeseMg: 1.6, seleniumMcg: 55, iodineMcg: 150, potassiumMg: 2300, vitaminAMcg: 700, vitaminCMg: 65, vitaminDMcg: 15, vitaminEMg: 15, vitaminKMcg: 75, vitaminB1Mg: 1.0, vitaminB2Mg: 1.0, niacinMg: 14, vitaminB6Mg: 1.2, folateMcg: 400, vitaminB12Mcg: 2.4, pantothenicMg: 5, biotinMcg: 25 },
    '19_30': { waterMl: 2700, carbG: 130, fiberG: 25, proteinG: 46, alaG: 1.1, omega6G: 12, calciumMg: 1000, phosphorusMg: 700, ironMg: 18, magnesiumMg: 310, zincMg: 8, copperMg: 0.9, manganeseMg: 1.8, seleniumMcg: 55, iodineMcg: 150, potassiumMg: 2600, vitaminAMcg: 700, vitaminCMg: 75, vitaminDMcg: 15, vitaminEMg: 15, vitaminKMcg: 90, vitaminB1Mg: 1.1, vitaminB2Mg: 1.1, niacinMg: 14, vitaminB6Mg: 1.3, folateMcg: 400, vitaminB12Mcg: 2.4, pantothenicMg: 5, biotinMcg: 30 },
    '31_50': { waterMl: 2700, carbG: 130, fiberG: 25, proteinG: 46, alaG: 1.1, omega6G: 12, calciumMg: 1000, phosphorusMg: 700, ironMg: 18, magnesiumMg: 320, zincMg: 8, copperMg: 0.9, manganeseMg: 1.8, seleniumMcg: 55, iodineMcg: 150, potassiumMg: 2600, vitaminAMcg: 700, vitaminCMg: 75, vitaminDMcg: 15, vitaminEMg: 15, vitaminKMcg: 90, vitaminB1Mg: 1.1, vitaminB2Mg: 1.1, niacinMg: 14, vitaminB6Mg: 1.3, folateMcg: 400, vitaminB12Mcg: 2.4, pantothenicMg: 5, biotinMcg: 30 },
    '51_70': { waterMl: 2700, carbG: 130, fiberG: 21, proteinG: 46, alaG: 1.1, omega6G: 11, calciumMg: 1200, phosphorusMg: 700, ironMg: 8, magnesiumMg: 320, zincMg: 8, copperMg: 0.9, manganeseMg: 1.8, seleniumMcg: 55, iodineMcg: 150, potassiumMg: 2600, vitaminAMcg: 700, vitaminCMg: 75, vitaminDMcg: 15, vitaminEMg: 15, vitaminKMcg: 90, vitaminB1Mg: 1.1, vitaminB2Mg: 1.1, niacinMg: 14, vitaminB6Mg: 1.5, folateMcg: 400, vitaminB12Mcg: 2.4, pantothenicMg: 5, biotinMcg: 30 },
    '71_plus': { waterMl: 2700, carbG: 130, fiberG: 21, proteinG: 46, alaG: 1.1, omega6G: 11, calciumMg: 1200, phosphorusMg: 700, ironMg: 8, magnesiumMg: 320, zincMg: 8, copperMg: 0.9, manganeseMg: 1.8, seleniumMcg: 55, iodineMcg: 150, potassiumMg: 2600, vitaminAMcg: 700, vitaminCMg: 75, vitaminDMcg: 20, vitaminEMg: 15, vitaminKMcg: 90, vitaminB1Mg: 1.1, vitaminB2Mg: 1.1, niacinMg: 14, vitaminB6Mg: 1.5, folateMcg: 400, vitaminB12Mcg: 2.4, pantothenicMg: 5, biotinMcg: 30 },
  },
};

const PREGNANCY_DRI = {
  '14_18': { waterMl: 3000, carbG: 175, fiberG: 28, proteinG: 71, alaG: 1.4, omega6G: 13, calciumMg: 1300, phosphorusMg: 1250, ironMg: 27, magnesiumMg: 400, zincMg: 12, copperMg: 1.0, manganeseMg: 2.0, seleniumMcg: 60, iodineMcg: 220, potassiumMg: 2600, vitaminAMcg: 750, vitaminCMg: 80, vitaminDMcg: 15, vitaminEMg: 15, vitaminKMcg: 75, vitaminB1Mg: 1.4, vitaminB2Mg: 1.4, niacinMg: 18, vitaminB6Mg: 1.9, folateMcg: 600, vitaminB12Mcg: 2.6, pantothenicMg: 6, biotinMcg: 30 },
  '19_30': { waterMl: 3000, carbG: 175, fiberG: 28, proteinG: 71, alaG: 1.4, omega6G: 13, calciumMg: 1000, phosphorusMg: 700, ironMg: 27, magnesiumMg: 350, zincMg: 11, copperMg: 1.0, manganeseMg: 2.0, seleniumMcg: 60, iodineMcg: 220, potassiumMg: 2900, vitaminAMcg: 770, vitaminCMg: 85, vitaminDMcg: 15, vitaminEMg: 15, vitaminKMcg: 90, vitaminB1Mg: 1.4, vitaminB2Mg: 1.4, niacinMg: 18, vitaminB6Mg: 1.9, folateMcg: 600, vitaminB12Mcg: 2.6, pantothenicMg: 6, biotinMcg: 30 },
  '31_50': { waterMl: 3000, carbG: 175, fiberG: 28, proteinG: 71, alaG: 1.4, omega6G: 13, calciumMg: 1000, phosphorusMg: 700, ironMg: 27, magnesiumMg: 360, zincMg: 11, copperMg: 1.0, manganeseMg: 2.0, seleniumMcg: 60, iodineMcg: 220, potassiumMg: 2900, vitaminAMcg: 770, vitaminCMg: 85, vitaminDMcg: 15, vitaminEMg: 15, vitaminKMcg: 90, vitaminB1Mg: 1.4, vitaminB2Mg: 1.4, niacinMg: 18, vitaminB6Mg: 1.9, folateMcg: 600, vitaminB12Mcg: 2.6, pantothenicMg: 6, biotinMcg: 30 },
  '51_70': { waterMl: 3000, carbG: 175, fiberG: 28, proteinG: 71, alaG: 1.4, omega6G: 13, calciumMg: 1000, phosphorusMg: 700, ironMg: 27, magnesiumMg: 360, zincMg: 11, copperMg: 1.0, manganeseMg: 2.0, seleniumMcg: 60, iodineMcg: 220, potassiumMg: 2900, vitaminAMcg: 770, vitaminCMg: 85, vitaminDMcg: 15, vitaminEMg: 15, vitaminKMcg: 90, vitaminB1Mg: 1.4, vitaminB2Mg: 1.4, niacinMg: 18, vitaminB6Mg: 1.9, folateMcg: 600, vitaminB12Mcg: 2.6, pantothenicMg: 6, biotinMcg: 30 },
  '71_plus': { waterMl: 3000, carbG: 175, fiberG: 28, proteinG: 71, alaG: 1.4, omega6G: 13, calciumMg: 1000, phosphorusMg: 700, ironMg: 27, magnesiumMg: 360, zincMg: 11, copperMg: 1.0, manganeseMg: 2.0, seleniumMcg: 60, iodineMcg: 220, potassiumMg: 2900, vitaminAMcg: 770, vitaminCMg: 85, vitaminDMcg: 15, vitaminEMg: 15, vitaminKMcg: 90, vitaminB1Mg: 1.4, vitaminB2Mg: 1.4, niacinMg: 18, vitaminB6Mg: 1.9, folateMcg: 600, vitaminB12Mcg: 2.6, pantothenicMg: 6, biotinMcg: 30 },
};

const LACTATION_DRI = {
  '14_18': { waterMl: 3800, carbG: 210, fiberG: 29, proteinG: 71, alaG: 1.3, omega6G: 13, calciumMg: 1300, phosphorusMg: 1250, ironMg: 10, magnesiumMg: 360, zincMg: 13, copperMg: 1.3, manganeseMg: 2.6, seleniumMcg: 70, iodineMcg: 290, potassiumMg: 2500, vitaminAMcg: 1200, vitaminCMg: 115, vitaminDMcg: 15, vitaminEMg: 19, vitaminKMcg: 75, vitaminB1Mg: 1.4, vitaminB2Mg: 1.6, niacinMg: 17, vitaminB6Mg: 2.0, folateMcg: 500, vitaminB12Mcg: 2.8, pantothenicMg: 7, biotinMcg: 35 },
  '19_30': { waterMl: 3800, carbG: 210, fiberG: 29, proteinG: 71, alaG: 1.3, omega6G: 13, calciumMg: 1000, phosphorusMg: 700, ironMg: 9, magnesiumMg: 310, zincMg: 12, copperMg: 1.3, manganeseMg: 2.6, seleniumMcg: 70, iodineMcg: 290, potassiumMg: 2800, vitaminAMcg: 1300, vitaminCMg: 120, vitaminDMcg: 15, vitaminEMg: 19, vitaminKMcg: 90, vitaminB1Mg: 1.4, vitaminB2Mg: 1.6, niacinMg: 17, vitaminB6Mg: 2.0, folateMcg: 500, vitaminB12Mcg: 2.8, pantothenicMg: 7, biotinMcg: 35 },
  '31_50': { waterMl: 3800, carbG: 210, fiberG: 29, proteinG: 71, alaG: 1.3, omega6G: 13, calciumMg: 1000, phosphorusMg: 700, ironMg: 9, magnesiumMg: 320, zincMg: 12, copperMg: 1.3, manganeseMg: 2.6, seleniumMcg: 70, iodineMcg: 290, potassiumMg: 2800, vitaminAMcg: 1300, vitaminCMg: 120, vitaminDMcg: 15, vitaminEMg: 19, vitaminKMcg: 90, vitaminB1Mg: 1.4, vitaminB2Mg: 1.6, niacinMg: 17, vitaminB6Mg: 2.0, folateMcg: 500, vitaminB12Mcg: 2.8, pantothenicMg: 7, biotinMcg: 35 },
  '51_70': { waterMl: 3800, carbG: 210, fiberG: 29, proteinG: 71, alaG: 1.3, omega6G: 13, calciumMg: 1000, phosphorusMg: 700, ironMg: 9, magnesiumMg: 320, zincMg: 12, copperMg: 1.3, manganeseMg: 2.6, seleniumMcg: 70, iodineMcg: 290, potassiumMg: 2800, vitaminAMcg: 1300, vitaminCMg: 120, vitaminDMcg: 15, vitaminEMg: 19, vitaminKMcg: 90, vitaminB1Mg: 1.4, vitaminB2Mg: 1.6, niacinMg: 17, vitaminB6Mg: 2.0, folateMcg: 500, vitaminB12Mcg: 2.8, pantothenicMg: 7, biotinMcg: 35 },
  '71_plus': { waterMl: 3800, carbG: 210, fiberG: 29, proteinG: 71, alaG: 1.3, omega6G: 13, calciumMg: 1000, phosphorusMg: 700, ironMg: 9, magnesiumMg: 320, zincMg: 12, copperMg: 1.3, manganeseMg: 2.6, seleniumMcg: 70, iodineMcg: 290, potassiumMg: 2800, vitaminAMcg: 1300, vitaminCMg: 120, vitaminDMcg: 15, vitaminEMg: 19, vitaminKMcg: 90, vitaminB1Mg: 1.4, vitaminB2Mg: 1.6, niacinMg: 17, vitaminB6Mg: 2.0, folateMcg: 500, vitaminB12Mcg: 2.8, pantothenicMg: 7, biotinMcg: 35 },
};

export const NUTRIENT_DEFS = {
  kcal: { label: '能量', unit: 'kcal', category: 'energy', priority: true },
  protein: { label: '蛋白质', unit: 'g', category: 'macro', priority: true },
  carbs: { label: '碳水', unit: 'g', category: 'macro', priority: true },
  fat: { label: '脂肪', unit: 'g', category: 'macro', priority: true },
  fiber: { label: '膳食纤维', unit: 'g', category: 'macro', priority: true },
  water: { label: '饮水 / 总水', unit: 'mL', category: 'hydration', priority: true },
  sugar: { label: '总糖', unit: 'g', category: 'observe', priority: false },
  starch: { label: '淀粉', unit: 'g', category: 'observe', priority: false },
  sodium: { label: '钠', unit: 'mg', category: 'risk', priority: true },
  salt: { label: '盐', unit: 'g', category: 'risk', priority: false },
  potassium: { label: '钾', unit: 'mg', category: 'micro', priority: true },
  calcium: { label: '钙', unit: 'mg', category: 'micro', priority: true },
  phosphorus: { label: '磷', unit: 'mg', category: 'micro', priority: false },
  iron: { label: '铁', unit: 'mg', category: 'micro', priority: true },
  magnesium: { label: '镁', unit: 'mg', category: 'micro', priority: true },
  zinc: { label: '锌', unit: 'mg', category: 'micro', priority: false },
  copper: { label: '铜', unit: 'mg', category: 'micro', priority: false },
  manganese: { label: '锰', unit: 'mg', category: 'micro', priority: false },
  selenium: { label: '硒', unit: 'µg', category: 'micro', priority: false },
  iodine: { label: '碘', unit: 'µg', category: 'micro', priority: false },
  vitaminA: { label: '维生素 A', unit: 'µg RAE', category: 'micro', priority: false },
  vitaminC: { label: '维生素 C', unit: 'mg', category: 'micro', priority: true },
  vitaminD: { label: '维生素 D', unit: 'µg', category: 'micro', priority: true },
  vitaminE: { label: '维生素 E', unit: 'mg', category: 'micro', priority: false },
  vitaminK: { label: '维生素 K', unit: 'µg', category: 'micro', priority: false },
  vitaminB1: { label: '维生素 B1', unit: 'mg', category: 'micro', priority: false },
  vitaminB2: { label: '维生素 B2', unit: 'mg', category: 'micro', priority: false },
  niacin: { label: '烟酸', unit: 'mg', category: 'micro', priority: false },
  vitaminB6: { label: '维生素 B6', unit: 'mg', category: 'micro', priority: false },
  folate: { label: '叶酸', unit: 'µg DFE', category: 'micro', priority: true },
  vitaminB12: { label: '维生素 B12', unit: 'µg', category: 'micro', priority: true },
  pantothenicAcid: { label: '泛酸', unit: 'mg', category: 'micro', priority: false },
  biotin: { label: '生物素', unit: 'µg', category: 'micro', priority: false },
  omega3: { label: 'Omega-3', unit: 'g', category: 'fatty', priority: true },
  omega6: { label: 'Omega-6', unit: 'g', category: 'fatty', priority: false },
  monoFat: { label: '单不饱和脂肪', unit: 'g', category: 'fatty', priority: false },
  polyFat: { label: '多不饱和脂肪', unit: 'g', category: 'fatty', priority: false },
  satFat: { label: '饱和脂肪', unit: 'g', category: 'risk', priority: true },
  transFat: { label: '反式脂肪', unit: 'g', category: 'risk', priority: false },
  cholesterol: { label: '胆固醇', unit: 'mg', category: 'risk', priority: false },
};

export const DASHBOARD_ORDER = [
  'kcal', 'protein', 'carbs', 'fat', 'fiber', 'water',
  'sodium', 'potassium', 'calcium', 'iron', 'magnesium', 'zinc',
  'vitaminC', 'vitaminD', 'folate', 'vitaminB12', 'omega3', 'satFat'
];

export const OCR_FIELD_MAP = {
  kcal: { label: '能量 / 热量', unit: 'kcal' },
  protein: { label: '蛋白质', unit: 'g' },
  carbs: { label: '碳水', unit: 'g' },
  fat: { label: '脂肪', unit: 'g' },
  satFat: { label: '饱和脂肪', unit: 'g' },
  transFat: { label: '反式脂肪', unit: 'g' },
  sugar: { label: '糖', unit: 'g' },
  fiber: { label: '膳食纤维', unit: 'g' },
  sodium: { label: '钠', unit: 'mg' },
  calcium: { label: '钙', unit: 'mg' },
  iron: { label: '铁', unit: 'mg' },
  magnesium: { label: '镁', unit: 'mg' },
  potassium: { label: '钾', unit: 'mg' },
  zinc: { label: '锌', unit: 'mg' },
  vitaminA: { label: '维生素 A', unit: 'µg' },
  vitaminC: { label: '维生素 C', unit: 'mg' },
  vitaminD: { label: '维生素 D', unit: 'µg' },
  folate: { label: '叶酸', unit: 'µg' },
  vitaminB12: { label: '维生素 B12', unit: 'µg' },
  cholesterol: { label: '胆固醇', unit: 'mg' },
};

const OFF_TO_APP_IDS = {
  e: 'kcal',
  f: 'fat',
  sf: 'satFat',
  tf: 'transFat',
  mf: 'monoFat',
  pf: 'polyFat',
  o3: 'omega3',
  o6: 'omega6',
  ch: 'cholesterol',
  cb: 'carbs',
  sg: 'sugar',
  st: 'starch',
  fb: 'fiber',
  p: 'protein',
  sa: 'salt',
  na: 'sodium',
  k: 'potassium',
  ca: 'calcium',
  ph: 'phosphorus',
  fe: 'iron',
  mg: 'magnesium',
  zn: 'zinc',
  cu: 'copper',
  mn: 'manganese',
  se: 'selenium',
  id: 'iodine',
  va: 'vitaminA',
  vc: 'vitaminC',
  vd: 'vitaminD',
  ve: 'vitaminE',
  vk: 'vitaminK',
  b1: 'vitaminB1',
  b2: 'vitaminB2',
  b3: 'niacin',
  b6: 'vitaminB6',
  b9: 'folate',
  b12: 'vitaminB12',
  b5: 'pantothenicAcid',
  b7: 'biotin',
};

const DIGITS_0 = new Set(['kcal', 'water', 'sodium', 'potassium', 'calcium', 'phosphorus', 'magnesium', 'cholesterol', 'vitaminA', 'folate', 'selenium', 'iodine']);

function getPalValue(profile, bmi) {
  const adult = profile.age >= 19;
  const higherBmi = bmi > 25;
  const sex = profile.sex === 'male' ? 'male' : 'female';
  const map = adult
    ? {
        male: higherBmi ? { sedentary: 1, lowActive: 1.12, active: 1.29, veryActive: 1.59 } : { sedentary: 1, lowActive: 1.11, active: 1.25, veryActive: 1.48 },
        female: higherBmi ? { sedentary: 1, lowActive: 1.16, active: 1.27, veryActive: 1.44 } : { sedentary: 1, lowActive: 1.12, active: 1.27, veryActive: 1.45 },
      }
    : {
        male: higherBmi ? { sedentary: 1, lowActive: 1.12, active: 1.24, veryActive: 1.45 } : { sedentary: 1, lowActive: 1.13, active: 1.26, veryActive: 1.42 },
        female: higherBmi ? { sedentary: 1, lowActive: 1.18, active: 1.35, veryActive: 1.6 } : { sedentary: 1, lowActive: 1.16, active: 1.31, veryActive: 1.56 },
      };
  return map[sex][profile.activity] || 1;
}

function calculateEER(profile, bmi) {
  const h = profile.heightCm / 100;
  const w = profile.weightKg;
  const a = profile.age;
  const pal = getPalValue(profile, bmi);
  const overweight = bmi > 25;
  if (profile.age < 19) {
    if (profile.sex === 'male') {
      return overweight
        ? (-114.1 - 50.9 * a) + pal * (19.5 * w + 1161.4 * h)
        : (113.5 - 61.9 * a) + pal * (26.7 * w + 903 * h);
    }
    return overweight
      ? (389.2 - 41.2 * a) + pal * (15 * w + 701.6 * h)
      : (160.3 - 30.8 * a) + pal * (10 * w + 934 * h);
  }
  if (profile.sex === 'male') {
    return overweight
      ? (1085.6 - 10.08 * a) + pal * (13.7 * w + 416 * h)
      : (661.8 - 9.53 * a) + pal * (15.91 * w + 539.6 * h);
  }
  return overweight
    ? (447.6 - 7.95 * a) + pal * (11.4 * w + 619 * h)
    : (354.1 - 6.91 * a) + pal * (9.36 * w + 726 * h);
}

function driForProfile(profile, ageBand) {
  const isPregnant = profile.physiology.startsWith('pregnant');
  const isLactating = profile.physiology.startsWith('lactation');
  if (profile.sex === 'female' && isPregnant) return PREGNANCY_DRI[ageBand] || PREGNANCY_DRI['19_30'];
  if (profile.sex === 'female' && isLactating) return LACTATION_DRI[ageBand] || LACTATION_DRI['19_30'];
  return DRI[profile.sex][ageBand];
}

function carbRdaForProfile(profile, dri) {
  return dri.carbG || 130;
}

function trainingCarbRange(profile) {
  const kg = profile.weightKg;
  const hours = profile.trainingHoursWeek || 0;
  switch (profile.training) {
    case 'resistance': {
      const min = Math.max(3 * kg, 0);
      const max = Math.max(min + 20, (profile.goal === 'muscleGain' ? 6 : 5.5) * kg);
      return { min, max, note: '力量训练优先围绕训练前后补碳水。' };
    }
    case 'mixed': {
      const min = 4 * kg;
      const max = (hours >= 8 ? 7 : 6) * kg;
      return { min, max, note: '综合训练适合中高碳水配置。' };
    }
    case 'endurance': {
      if (hours <= 3) return { min: 4 * kg, max: 6 * kg, note: '轻至中等耐力训练。' };
      if (hours <= 6) return { min: 5 * kg, max: 7 * kg, note: '中等耐力训练。' };
      if (hours <= 10) return { min: 6 * kg, max: 10 * kg, note: '较大耐力训练量。' };
      return { min: 8 * kg, max: 12 * kg, note: '极高耐力训练量。' };
    }
    case 'general': {
      return { min: 3 * kg, max: 5 * kg, note: '规律健身常见配置。' };
    }
    default:
      return null;
  }
}

function proteinRange(profile, dri) {
  const kg = profile.weightKg;
  const mode = TRAINING_MODES[profile.training];
  let min = Math.max(dri.proteinG, mode.proteinMinKg * kg);
  let max = Math.max(min + 10, mode.proteinMaxKg * kg);
  if (profile.age >= 60) min = Math.max(min, 1.0 * kg);
  if (profile.age >= 70) min = Math.max(min, 1.1 * kg);
  if ((profile.goal === 'fatLoss' || profile.goal === 'recomposition') && ['resistance', 'mixed', 'general'].includes(profile.training)) {
    min = Math.max(min, 1.8 * kg);
    max = Math.max(max, 2.4 * kg);
  }
  if (profile.sex === 'female' && profile.physiology !== 'standard') {
    min = Math.max(min, Math.max(dri.proteinG, 1.1 * kg));
    max = Math.max(max, min + 18);
  }
  return { min, max, preferred: (min + max) / 2 };
}

function proteinTargetNote(profile, dri, range) {
  const floor = round1(Math.max(dri.proteinG, 0.8 * profile.weightKg));
  if (profile.training === 'none') {
    return `一般成年人最低参考约 ${floor} g / 天（约 0.8 g/kg）；当前给出 ${round1(range.min)}–${round1(range.max)} g / 天的实用区间。`;
  }
  let trainingText = '有训练时蛋白建议通常高于一般人群。';
  if (profile.training === 'general') trainingText = '规律健身常见约 1.2–1.6 g/kg / 天。';
  if (profile.training === 'resistance') trainingText = '力量 / 增肌常见约 1.6–2.2 g/kg / 天。';
  if (profile.training === 'mixed' || profile.training === 'endurance') trainingText = '综合 / 耐力训练常见约 1.4–1.8 g/kg / 天。';
  const deficitText = (profile.goal === 'fatLoss' || profile.goal === 'recomposition')
    ? '减脂 / 体成分优化期会进一步抬高下限。'
    : '';
  return `${trainingText} 一般成年人最低参考约 ${floor} g / 天。${deficitText}`.trim();
}

function carbRange(profile, dri, calories, proteinTarget, fatTarget) {
  const carbRda = carbRdaForProfile(profile, dri);
  const sportRange = trainingCarbRange(profile);
  const centerFromEnergy = Math.max(carbRda, (calories - proteinTarget * 4 - fatTarget * 9) / 4);
  let min = Math.max(carbRda, centerFromEnergy * 0.88);
  let max = Math.max(min + 20, centerFromEnergy * 1.12);
  let note = '按热量分配与训练模式综合估算。';

  if (sportRange) {
    min = Math.max(min, sportRange.min);
    max = Math.max(max, sportRange.max);
    note = sportRange.note;
  }

  const lowLimit = (calories * 0.45) / 4;
  const highLimit = (calories * 0.65) / 4;
  min = Math.max(min, Math.min(lowLimit, carbRda));
  max = Math.min(Math.max(max, carbRda), Math.max(highLimit, min + 20));

  if (profile.glucoseStatus === 'prediabetes' || profile.glucoseStatus === 'type2') {
    max = Math.min(max, Math.max(min + 15, calories * 0.5 / 4));
    note = '糖代谢风险模式更建议落在区间下半段，并优先高纤维碳水。';
  }
  if (profile.glucoseStatus === 'gestational') {
    min = Math.max(min, 175);
    max = Math.min(Math.max(min + 20, max), Math.max(min + 25, calories * 0.45 / 4));
    note = '妊娠糖尿病模式保留最低 175 g 碳水，并强调分餐与监测。';
  }
  if (profile.glucoseStatus === 'type1') {
    note = '1 型糖尿病模式保留个体化碳水范围，并强调碳水计数。';
  }
  return { min, max, preferred: clamp(centerFromEnergy, min, max), note };
}

function fatRange(profile, calories) {
  let ratioMin = 0.25;
  let ratioMax = 0.35;
  if (profile.goal === 'fatLoss') ratioMax = 0.30;
  if (profile.training === 'endurance' && profile.trainingHoursWeek >= 6) {
    ratioMin = 0.20;
    ratioMax = 0.30;
  }
  if (profile.conditions.dyslipidemia || profile.glucoseStatus === 'prediabetes' || profile.glucoseStatus === 'type2' || profile.glucoseStatus === 'gestational') {
    ratioMin = Math.max(ratioMin, 0.25);
    ratioMax = Math.min(ratioMax, 0.30);
  }
  const min = (calories * ratioMin) / 9;
  const max = (calories * ratioMax) / 9;
  return { min, max, preferred: (calories * ((ratioMin + ratioMax) / 2)) / 9 };
}

function waterTarget(profile, dri) {
  let extra = 0;
  if (profile.activity === 'lowActive') extra += 200;
  if (profile.activity === 'active') extra += 450;
  if (profile.activity === 'veryActive') extra += 800;
  if (profile.trainingHoursWeek > 0) extra += Math.min(1400, Math.round((profile.trainingHoursWeek / 7) * 250));
  return dri.waterMl + extra;
}

function glucoseStatusNote(profile) {
  switch (profile.glucoseStatus) {
    case 'prediabetes':
      return '糖前期模式会提高纤维优先级，并把碳水建议更偏向区间下半段。';
    case 'type1':
      return '1 型糖尿病模式强调碳水计数与胰岛素匹配，不使用单一固定碳水上限。';
    case 'type2':
      return '2 型糖尿病模式强调碳水质量、进餐节律与纤维密度。';
    case 'gestational':
      return '妊娠糖尿病模式会保留孕期最低碳水需求，并强调分餐和监测。';
    default:
      return null;
  }
}

function femalePhysiologyConflictNote(profile) {
  if (profile.glucoseStatus === 'gestational' && profile.physiology === 'standard') {
    return '已选择妊娠糖尿病，但生理状态仍是常规状态；建议同步改为孕期。';
  }
  return null;
}

export function getAgeBand(age) {
  const n = Number(age) || 0;
  return AGE_BANDS.find((band) => n >= band.min && n <= band.max)?.key ?? '19_30';
}

export function round1(value) {
  return Math.round(value * 10) / 10;
}

export function round0(value) {
  return Math.round(value);
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function sanitizeProfile(raw = {}) {
  const sex = raw.sex === 'male' ? 'male' : 'female';
  const age = clamp(Number(raw.age) || 30, 14, 95);
  const heightCm = clamp(Number(raw.heightCm) || 165, 120, 230);
  const weightKg = clamp(Number(raw.weightKg) || 60, 30, 250);
  const activity = ACTIVITY_LEVELS[raw.activity] ? raw.activity : 'lowActive';
  const goal = GOALS[raw.goal] ? raw.goal : 'maintain';
  const training = TRAINING_MODES[raw.training] ? raw.training : 'none';
  const diet = ['vegan', 'vegetarian', 'pescetarian', 'omnivore'].includes(raw.diet) ? raw.diet : 'omnivore';
  const physiology = PHYSIOLOGY_STATES[raw.physiology] ? raw.physiology : 'standard';
  const glucoseStatus = GLUCOSE_STATUSES[raw.glucoseStatus] ? raw.glucoseStatus : 'normal';
  const cyclePhaseRaw = CYCLE_PHASES[raw.cyclePhase] ? raw.cyclePhase : 'none';
  const jointFocus = JOINT_FOCUS_AREAS[raw.jointFocus] ? raw.jointFocus : 'none';
  const isFemale = sex === 'female';
  return {
    sex,
    age,
    heightCm,
    weightKg,
    activity,
    goal,
    training,
    trainingHoursWeek: clamp(Number(raw.trainingHoursWeek) || 0, 0, 40),
    diet,
    physiology: isFemale ? physiology : 'standard',
    cyclePhase: isFemale ? cyclePhaseRaw : 'none',
    heavyFlow: isFemale && Boolean(raw.heavyFlow),
    periodCramps: isFemale && Boolean(raw.periodCramps),
    lowSun: Boolean(raw.lowSun),
    jointFocus,
    bodyFat: clamp(Number(raw.bodyFat) || 22, 2, 60),
    focusNote: String(raw.focusNote || '').slice(0, 180),
    smoker: Boolean(raw.smoker),
    glucoseStatus,
    conditions: {
      hypertension: Boolean(raw.conditions?.hypertension),
      dyslipidemia: Boolean(raw.conditions?.dyslipidemia || raw.conditions?.hyperlipidemia),
      boneRisk: Boolean(raw.conditions?.boneRisk),
      anemiaRisk: Boolean(raw.conditions?.anemiaRisk),
      jointPain: Boolean(raw.conditions?.jointPain || raw.jointPain),
    },
  };
}

export function calculateTargets(rawProfile = {}) {
  const profile = sanitizeProfile(rawProfile);
  const ageBand = getAgeBand(profile.age);
  const bmi = round1(profile.weightKg / ((profile.heightCm / 100) ** 2));
  const dri = driForProfile(profile, ageBand);
  const eer = calculateEER(profile, bmi);
  const physiologyAdd = profile.sex === 'female' && profile.physiology !== 'standard' ? (PHYSIOLOGY_STATES[profile.physiology]?.energyAdd || 0) : 0;
  const useGoalMultiplier = profile.physiology === 'standard';
  const calories = (eer * (useGoalMultiplier ? GOALS[profile.goal].multiplier : 1)) + physiologyAdd;

  const proteinRangeVal = proteinRange(profile, dri);
  const proteinPreferred = round1(proteinRangeVal.preferred);
  const fatRangeVal = fatRange(profile, calories);
  const carbRangeVal = carbRange(profile, dri, calories, proteinPreferred, fatRangeVal.preferred);

  let fiberGoal = Math.max(dri.fiberG, round1((calories / 1000) * 14));
  if (profile.glucoseStatus === 'prediabetes' || profile.glucoseStatus === 'type2' || profile.glucoseStatus === 'gestational') {
    fiberGoal = Math.max(fiberGoal, profile.sex === 'male' ? 30 : 28);
  }

  let vitaminCMg = dri.vitaminCMg;
  if (profile.smoker) vitaminCMg += 35;

  let ironMg = dri.ironMg;
  if (profile.diet === 'vegetarian' || profile.diet === 'vegan') ironMg *= 1.8;
  if (profile.conditions.anemiaRisk || profile.heavyFlow || profile.cyclePhase === 'menstruation') ironMg = Math.max(ironMg, dri.ironMg);

  let calciumMg = dri.calciumMg;
  let vitaminDMcg = dri.vitaminDMcg;
  const menopauseBoneMode = profile.sex === 'female' && (profile.cyclePhase === 'perimenopause' || profile.cyclePhase === 'menopause');
  if (profile.conditions.boneRisk || profile.conditions.jointPain || menopauseBoneMode || (profile.sex === 'female' && profile.age >= 50)) {
    calciumMg = Math.max(calciumMg, profile.sex === 'female' && (profile.age >= 50 || menopauseBoneMode) ? 1200 : dri.calciumMg);
    vitaminDMcg = Math.max(vitaminDMcg, profile.age >= 70 || profile.lowSun ? 20 : 15);
  }
  if (profile.lowSun) vitaminDMcg = Math.max(vitaminDMcg, profile.age >= 70 ? 20 : 15);

  const sodiumMax = profile.conditions.hypertension ? 1500 : 2300;
  const satFatMax = (calories * (profile.conditions.dyslipidemia ? 0.06 : 0.10)) / 9;
  const sugarWatch = (calories * 0.10) / 4;
  const waterMl = waterTarget(profile, dri);

  const targets = {
    kcal: { id: 'kcal', type: 'target', target: round0(calories), unit: 'kcal', label: '能量', note: '按 EER 公式、PAL、生理状态与目标综合估算。' },
    protein: { id: 'protein', type: 'range', min: round1(proteinRangeVal.min), max: round1(proteinRangeVal.max), preferred: round1(proteinRangeVal.preferred), unit: 'g', label: '蛋白质', note: proteinTargetNote(profile, dri, proteinRangeVal) },
    carbs: { id: 'carbs', type: 'range', min: round1(carbRangeVal.min), max: round1(carbRangeVal.max), preferred: round1(carbRangeVal.preferred), unit: 'g', label: '碳水', note: carbRangeVal.note },
    fat: { id: 'fat', type: 'range', min: round1(fatRangeVal.min), max: round1(fatRangeVal.max), preferred: round1(fatRangeVal.preferred), unit: 'g', label: '脂肪', note: '更偏向脂肪质量，而不是单纯越低越好。' },
    fiber: { id: 'fiber', type: 'min', target: round1(fiberGoal), unit: 'g', label: '膳食纤维', note: '糖代谢风险模式会提高纤维下限。' },
    water: { id: 'water', type: 'min', target: round0(waterMl), unit: 'mL', label: '饮水 / 总水', note: '已按活动量和训练时长额外上调。' },
    sodium: { id: 'sodium', type: 'max', target: round0(sodiumMax), unit: 'mg', label: '钠', note: profile.conditions.hypertension ? '高血压模式按 1500 mg / 天更严格控制。' : '建议尽量不超过 2300 mg / 天。' },
    satFat: { id: 'satFat', type: 'max', target: round1(satFatMax), unit: 'g', label: '饱和脂肪', note: profile.conditions.dyslipidemia ? '血脂风险模式采用更严格上限。' : '按总热量约 10% 估算。' },
    potassium: { id: 'potassium', type: 'min', target: round0(dri.potassiumMg), unit: 'mg', label: '钾', note: '长期偏低比单日波动更值得关注。' },
    calcium: { id: 'calcium', type: 'min', target: round0(calciumMg), unit: 'mg', label: '钙', note: profile.conditions.boneRisk || profile.conditions.jointPain || menopauseBoneMode ? '骨关节 / 围绝经模式会优先保证钙。' : '' },
    phosphorus: { id: 'phosphorus', type: 'min', target: round0(dri.phosphorusMg), unit: 'mg', label: '磷', note: '' },
    iron: { id: 'iron', type: 'min', target: round1(ironMg), unit: 'mg', label: '铁', note: (profile.conditions.anemiaRisk || profile.heavyFlow || profile.cyclePhase === 'menstruation') ? '经期 / 经量偏多 / 贫血风险会把铁放到优先提醒。' : profile.diet !== 'omnivore' ? '素食模式按更高铁参考值估算。' : '' },
    magnesium: { id: 'magnesium', type: 'min', target: round0(dri.magnesiumMg), unit: 'mg', label: '镁', note: '' },
    zinc: { id: 'zinc', type: 'min', target: round1(dri.zincMg), unit: 'mg', label: '锌', note: '' },
    copper: { id: 'copper', type: 'min', target: round1(dri.copperMg), unit: 'mg', label: '铜', note: '' },
    manganese: { id: 'manganese', type: 'min', target: round1(dri.manganeseMg), unit: 'mg', label: '锰', note: '' },
    selenium: { id: 'selenium', type: 'min', target: round0(dri.seleniumMcg), unit: 'µg', label: '硒', note: '' },
    iodine: { id: 'iodine', type: 'min', target: round0(dri.iodineMcg), unit: 'µg', label: '碘', note: profile.physiology !== 'standard' ? '孕期 / 哺乳期会特别关注碘。' : '' },
    vitaminA: { id: 'vitaminA', type: 'min', target: round0(dri.vitaminAMcg), unit: 'µg RAE', label: '维生素 A', note: '' },
    vitaminC: { id: 'vitaminC', type: 'min', target: round0(vitaminCMg), unit: 'mg', label: '维生素 C', note: profile.smoker ? '已按吸烟模式额外上调。' : '' },
    vitaminD: { id: 'vitaminD', type: 'min', target: round1(vitaminDMcg), unit: 'µg', label: '维生素 D', note: profile.conditions.boneRisk || profile.conditions.jointPain || profile.lowSun ? '骨关节 / 日晒少模式会更关注维生素 D。' : '' },
    vitaminE: { id: 'vitaminE', type: 'min', target: round1(dri.vitaminEMg), unit: 'mg', label: '维生素 E', note: '' },
    vitaminK: { id: 'vitaminK', type: 'min', target: round0(dri.vitaminKMcg), unit: 'µg', label: '维生素 K', note: profile.conditions.boneRisk || menopauseBoneMode ? '骨健康模式会把维生素 K 与钙、维生素 D 一起显示。' : '' },
    vitaminB1: { id: 'vitaminB1', type: 'min', target: round1(dri.vitaminB1Mg), unit: 'mg', label: '维生素 B1', note: '' },
    vitaminB2: { id: 'vitaminB2', type: 'min', target: round1(dri.vitaminB2Mg), unit: 'mg', label: '维生素 B2', note: '' },
    niacin: { id: 'niacin', type: 'min', target: round1(dri.niacinMg), unit: 'mg', label: '烟酸', note: '' },
    vitaminB6: { id: 'vitaminB6', type: 'min', target: round1(dri.vitaminB6Mg), unit: 'mg', label: '维生素 B6', note: '' },
    folate: { id: 'folate', type: 'min', target: round0(dri.folateMcg), unit: 'µg DFE', label: '叶酸', note: profile.physiology.startsWith('pregnant') ? '孕期模式会提高叶酸参考值。' : profile.heavyFlow || profile.conditions.anemiaRisk ? '经量偏多 / 贫血风险会把叶酸纳入造血支持提醒。' : '' },
    vitaminB12: { id: 'vitaminB12', type: 'min', target: round1(dri.vitaminB12Mcg), unit: 'µg', label: '维生素 B12', note: profile.heavyFlow || profile.conditions.anemiaRisk ? '经量偏多 / 贫血风险会把 B12 纳入红细胞支持提醒。' : profile.age >= 50 || profile.diet !== 'omnivore' ? '需额外关注强化食品或补充剂来源。' : '' },
    pantothenicAcid: { id: 'pantothenicAcid', type: 'min', target: round1(dri.pantothenicMg), unit: 'mg', label: '泛酸', note: '' },
    biotin: { id: 'biotin', type: 'min', target: round0(dri.biotinMcg), unit: 'µg', label: '生物素', note: '' },
    omega3: { id: 'omega3', type: 'min', target: round1(dri.alaG), unit: 'g', label: 'Omega-3', note: '按 α-亚麻酸参考值估算。' },
    omega6: { id: 'omega6', type: 'min', target: round1(dri.omega6G), unit: 'g', label: 'Omega-6', note: '' },
    sugar: { id: 'sugar', type: 'max', target: round1(sugarWatch), unit: 'g', label: '糖（参考上限）', note: '这里用总糖近似提醒，不能等同于添加糖。' },
  };

  const notes = [];
  if (profile.age <= 18) notes.push('14–18 岁已切换到青少年 EER 公式与 DRI 表。');
  if (profile.age >= 60) notes.push('中老年模式会更重视蛋白质下限和维生素 B12。');
  if (profile.training !== 'none') notes.push(`训练模式：${TRAINING_MODES[profile.training].label}，训练时长 ${round1(profile.trainingHoursWeek)} 小时 / 周。`);
  if (profile.training === 'none') notes.push('当前按一般成年人最低蛋白参考值叠加年龄与目标做保守估算，不等同于运动营养处方。');
  if (profile.goal !== 'maintain' && profile.physiology !== 'standard') notes.push('孕期 / 哺乳期已优先按维持与生理增量处理热量，不建议在此页面直接执行激进热量缺口。');
  if (profile.smoker) notes.push('吸烟模式已把维生素 C 额外上调 35 mg。');
  if (profile.diet === 'vegetarian' || profile.diet === 'vegan') notes.push('素食模式会提高铁参考值，并提醒额外关注维生素 B12。');
  if (profile.diet === 'pescetarian') notes.push('鱼素模式会保留常规蛋白与 B12 逻辑，并更容易补足 Omega-3。');
  if (profile.conditions.hypertension) notes.push('高血压模式按 1500 mg 钠上限排序提醒。');
  if (profile.conditions.dyslipidemia) notes.push('血脂风险模式会把饱和脂肪控制得更严格。');
  if (profile.conditions.boneRisk) notes.push('骨健康模式会优先把钙、维生素 D、维生素 K 和足量蛋白排在前面。');
  if (profile.conditions.jointPain || profile.jointFocus !== 'none') notes.push('关节关注模式会优先提示 Omega-3、维生素 C、镁、蛋白质与体重管理；持续疼痛仍应线下评估。');
  if (profile.lowSun) notes.push('日晒少模式会把维生素 D 提醒前置；补充剂剂量需结合血检和医嘱。');
  if (profile.conditions.anemiaRisk) notes.push('贫血风险模式会把铁、叶酸、维生素 B12 的提醒前置，但缺铁诊断仍需要化验。');
  if (profile.cyclePhase === 'menstruation') notes.push('经期模式会前置铁、镁、水分和优质蛋白，尤其适合记录疲劳、食欲和经量变化。');
  if (profile.cyclePhase === 'luteal' || profile.periodCramps) notes.push('黄体期 / 经前不适会前置镁、钙、Omega-3 和稳定碳水，偏向缓解波动而不是激进控热量。');
  if (profile.heavyFlow) notes.push('经量偏多会强化铁、叶酸和维生素 B12 提醒；若长期偏多或乏力，应结合血红蛋白 / 铁蛋白检查。');
  if (menopauseBoneMode) notes.push('围绝经 / 绝经后模式会提高骨健康优先级，尤其关注钙、维生素 D、蛋白质和抗阻训练。');
  const glucoseNote = glucoseStatusNote(profile);
  if (glucoseNote) notes.push(glucoseNote);
  const conflictNote = femalePhysiologyConflictNote(profile);
  if (conflictNote) notes.push(conflictNote);

  const generalProteinFloor = round1(Math.max(dri.proteinG, 0.8 * profile.weightKg));
  const modeProteinMin = round1(TRAINING_MODES[profile.training].proteinMinKg * profile.weightKg);
  const modeProteinMax = round1(TRAINING_MODES[profile.training].proteinMaxKg * profile.weightKg);

  const basisRows = [
    { label: '年龄分组', value: ageBand.replace('_', '–').replace('plus', '+') },
    { label: 'BMI', value: bmi.toString() },
    { label: '活动水平', value: ACTIVITY_LEVELS[profile.activity].label },
    { label: '训练模式', value: TRAINING_MODES[profile.training].label },
    { label: '训练时长', value: `${round1(profile.trainingHoursWeek)} 小时 / 周` },
    { label: '生理状态', value: PHYSIOLOGY_STATES[profile.physiology].label },
    { label: '生理周期', value: CYCLE_PHASES[profile.cyclePhase].label },
    { label: '关节关注', value: JOINT_FOCUS_AREAS[profile.jointFocus].label },
    { label: '糖代谢状态', value: GLUCOSE_STATUSES[profile.glucoseStatus].label },
    { label: '蛋白最低参考', value: `${generalProteinFloor} g / 天` },
    { label: '训练蛋白区间', value: profile.training === 'none' ? '当前无专项训练' : `${modeProteinMin} – ${modeProteinMax} g / 天` },
    { label: '当前蛋白建议', value: `${round1(proteinRangeVal.preferred)} g / 天（${round1(proteinRangeVal.min)} – ${round1(proteinRangeVal.max)}）` },
    { label: 'EER 估算', value: `${round0(eer)} kcal` },
    { label: '目标热量', value: `${round0(calories)} kcal` },
  ];

  return {
    profile,
    ageBand,
    bmi,
    eer: round0(eer),
    calories: round0(calories),
    targets,
    notes,
    basisRows,
  };
}

export function defaultProfile() {
  return sanitizeProfile({
    sex: 'female',
    age: 30,
    heightCm: 165,
    weightKg: 55,
    activity: 'lowActive',
    goal: 'maintain',
    training: 'none',
    trainingHoursWeek: 0,
    diet: 'omnivore',
    physiology: 'standard',
    smoker: false,
    glucoseStatus: 'normal',
    cyclePhase: 'none',
    heavyFlow: false,
    periodCramps: false,
    lowSun: false,
    jointFocus: 'none',
    conditions: {},
  });
}

export function createEmptyTotals() {
  return {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    water: 0,
    sugar: 0,
    starch: 0,
    sodium: 0,
    salt: 0,
    potassium: 0,
    calcium: 0,
    phosphorus: 0,
    iron: 0,
    magnesium: 0,
    zinc: 0,
    copper: 0,
    manganese: 0,
    selenium: 0,
    iodine: 0,
    vitaminA: 0,
    vitaminC: 0,
    vitaminD: 0,
    vitaminE: 0,
    vitaminK: 0,
    vitaminB1: 0,
    vitaminB2: 0,
    niacin: 0,
    vitaminB6: 0,
    folate: 0,
    vitaminB12: 0,
    pantothenicAcid: 0,
    biotin: 0,
    omega3: 0,
    omega6: 0,
    monoFat: 0,
    polyFat: 0,
    satFat: 0,
    transFat: 0,
    cholesterol: 0,
  };
}

export function mergeTotals(target, add) {
  for (const [key, value] of Object.entries(add || {})) {
    if (Number.isFinite(value)) target[key] = (target[key] || 0) + value;
  }
  return target;
}

export function foodKnownNutrientIds(food) {
  const ids = new Set();
  const u = food?.u || {};
  for (const [offKey, id] of Object.entries(OFF_TO_APP_IDS)) {
    if (Object.prototype.hasOwnProperty.call(u, offKey) && Number.isFinite(u[offKey])) ids.add(id);
  }
  if (ids.has('salt')) ids.add('sodium');
  if (ids.has('sodium')) ids.add('salt');
  return [...ids];
}

export function normalizedFoodNutrients(food) {
  const u = food?.u || {};
  const has = (key) => Object.prototype.hasOwnProperty.call(u, key) && Number.isFinite(u[key]);
  const sodiumMg = has('na') ? u.na * 1000 : (has('sa') ? (u.sa * 1000 / 2.5) : 0);
  const saltG = has('sa') ? u.sa : (has('na') ? u.na * 2.5 : 0);
  return {
    kcal: has('e') ? u.e / 4.184 : 0,
    protein: has('p') ? u.p : 0,
    carbs: has('cb') ? u.cb : 0,
    fat: has('f') ? u.f : 0,
    fiber: has('fb') ? u.fb : 0,
    sugar: has('sg') ? u.sg : 0,
    starch: has('st') ? u.st : 0,
    satFat: has('sf') ? u.sf : 0,
    transFat: has('tf') ? u.tf : 0,
    monoFat: has('mf') ? u.mf : 0,
    polyFat: has('pf') ? u.pf : 0,
    omega3: has('o3') ? u.o3 : 0,
    omega6: has('o6') ? u.o6 : 0,
    cholesterol: has('ch') ? u.ch * 1000 : 0,
    sodium: sodiumMg,
    salt: saltG,
    potassium: has('k') ? u.k * 1000 : 0,
    calcium: has('ca') ? u.ca * 1000 : 0,
    phosphorus: has('ph') ? u.ph * 1000 : 0,
    iron: has('fe') ? u.fe * 1000 : 0,
    magnesium: has('mg') ? u.mg * 1000 : 0,
    zinc: has('zn') ? u.zn * 1000 : 0,
    copper: has('cu') ? u.cu * 1000 : 0,
    manganese: has('mn') ? u.mn * 1000 : 0,
    selenium: has('se') ? u.se * 1e6 : 0,
    iodine: has('id') ? u.id * 1e6 : 0,
    vitaminA: has('va') ? u.va * 1e6 : 0,
    vitaminC: has('vc') ? u.vc * 1000 : 0,
    vitaminD: has('vd') ? u.vd * 1e6 : 0,
    vitaminE: has('ve') ? u.ve * 1000 : 0,
    vitaminK: has('vk') ? u.vk * 1e6 : 0,
    vitaminB1: has('b1') ? u.b1 * 1000 : 0,
    vitaminB2: has('b2') ? u.b2 * 1000 : 0,
    niacin: has('b3') ? u.b3 * 1000 : 0,
    vitaminB6: has('b6') ? u.b6 * 1000 : 0,
    folate: has('b9') ? u.b9 * 1e6 : 0,
    vitaminB12: has('b12') ? u.b12 * 1e6 : 0,
    pantothenicAcid: has('b5') ? u.b5 * 1000 : 0,
    biotin: has('b7') ? u.b7 * 1e6 : 0,
  };
}

export function scaleNutrients(per100, grams) {
  const factor = (Number(grams) || 0) / 100;
  const out = {};
  for (const [key, value] of Object.entries(per100 || {})) out[key] = Number.isFinite(value) ? value * factor : 0;
  return out;
}

export function parseServingSizeGrams(servingSizeText = '') {
  if (!servingSizeText) return null;
  const txt = String(servingSizeText).replace(',', '.');
  const m = txt.match(/(\d+(?:\.\d+)?)\s*(g|gram|grams|克|ml|毫升)/i);
  if (!m) return null;
  const value = Number(m[1]);
  if (!Number.isFinite(value)) return null;
  return value;
}

export function formatNumber(value, unit = '', digits = 1) {
  if (!Number.isFinite(value)) return `—${unit ? ` ${unit}` : ''}`;
  const rounded = digits === 0 ? Math.round(value) : round1(value);
  return `${rounded.toLocaleString('zh-CN')}${unit ? ` ${unit}` : ''}`;
}

export function targetToText(target) {
  if (!target) return '—';
  if (target.type === 'range') {
    if (Number.isFinite(target.preferred)) {
      return `${formatNumber(target.preferred, target.unit)}（${formatNumber(target.min, target.unit)} – ${formatNumber(target.max, target.unit)}）`;
    }
    return `${formatNumber(target.min, target.unit)} – ${formatNumber(target.max, target.unit)}`;
  }
  return `${formatNumber(target.target, target.unit, DIGITS_0.has(target.id) ? 0 : 1)}`;
}
