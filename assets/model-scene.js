let remoteModulesPromise = null;
const STANDARD_BODY_ASSET_URL = './assets/body-models/standard-bodies.json?v=20260426g';
let standardBodyAssetPromise = null;

function loadStandardBodyAsset() {
  if (!standardBodyAssetPromise) {
    standardBodyAssetPromise = fetch(STANDARD_BODY_ASSET_URL, { cache: 'force-cache' })
      .then((response) => {
        if (!response.ok) throw new Error(`standard body asset ${response.status}`);
        return response.json();
      })
      .then((asset) => {
        if (!asset?.meshes || (!asset.meshes.femaleStandard && !asset.meshes.maleStandard)) {
          throw new Error('standard body mesh missing');
        }
        return asset;
      });
  }
  return standardBodyAssetPromise;
}


function importWithTimeout(url, ms = 5200) {
  let timer = null;
  const timeout = new Promise((_, reject) => {
    timer = window.setTimeout(() => reject(new Error(`Module timeout: ${url}`)), ms);
  });
  return Promise.race([import(url), timeout]).finally(() => window.clearTimeout(timer));
}

function perfProfile() {
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  const ua = navigator.userAgent || '';
  const lowEnd = /iPhone OS 1[0-2]_/.test(ua) || /Android [1-8]\./.test(ua);
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || lowEnd;
  return {
    reduced,
    shadows: !reduced,
    dpr: reduced ? Math.min(dpr, 1.5) : dpr,
    radialSegments: reduced ? 24 : 40,
    capsuleCapSegments: reduced ? 4 : 6,
    capsuleRadialSegments: reduced ? 12 : 18,
  };
}

async function importThreeProvider(threeUrl, controlsUrl) {
  const [THREE, controls] = await Promise.all([
    importWithTimeout(threeUrl),
    importWithTimeout(controlsUrl),
  ]);
  return { THREE, OrbitControls: controls.OrbitControls };
}

function loadRemoteModules() {
  if (!remoteModulesPromise) {
    const providers = [
      {
        three: './vendor/three.module.js',
        controls: './vendor/OrbitControls.js',
      },
      {
        three: 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js',
        controls: 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js',
      },
      {
        three: 'https://unpkg.com/three@0.161.0/build/three.module.js?module',
        controls: 'https://unpkg.com/three@0.161.0/examples/jsm/controls/OrbitControls.js?module',
      },
      {
        three: 'https://esm.sh/three@0.161.0',
        controls: 'https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls',
      },
    ];
    remoteModulesPromise = (async () => {
      let lastError = null;
      for (const provider of providers) {
        try {
          return await importThreeProvider(provider.three, provider.controls);
        } catch (error) {
          lastError = error;
        }
      }
      throw lastError || new Error('Three.js CDN unavailable');
    })();
  }
  return remoteModulesPromise;
}

function round1(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}

function clampNum(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
}

function averageOf(...values) {
  const valid = values.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value > 0);
  return valid.length ? round1(valid.reduce((sum, value) => sum + value, 0) / valid.length) : null;
}

function bodySoftMix(base, target, weight = 0.82) {
  const a = Number(base);
  const b = Number(target);
  if (!Number.isFinite(a)) return b;
  if (!Number.isFinite(b)) return a;
  return a + (b - a) * weight;
}

function withBodyDefaults(record) {
  if (!record) return null;
  const weight = Number.isFinite(Number(record.weightKg)) ? Number(record.weightKg) : 58;
  const height = Number.isFinite(Number(record.heightCm)) ? Number(record.heightCm) : 165;
  const bodyFat = Number.isFinite(Number(record.bodyFat)) ? Number(record.bodyFat) : 22;
  const chest = Number.isFinite(Number(record.chest)) ? Number(record.chest) : round1(weight * 1.05 + height * 0.22);
  const waist = Number.isFinite(Number(record.waist)) ? Number(record.waist) : round1(chest * 0.82);
  const abdomen = Number.isFinite(Number(record.abdomen)) ? Number(record.abdomen) : round1(waist + 2.6);
  const hip = Number.isFinite(Number(record.hip)) ? Number(record.hip) : round1(chest * 1.02);
  const upperArm = averageOf(record.upperArmL, record.upperArmR, record.upperArm) || round1(chest * 0.32);
  const forearm = averageOf(record.forearmL, record.forearmR, record.forearm) || round1(upperArm * 0.82);
  const thigh = averageOf(record.thighL, record.thighR, record.thigh) || round1(hip * 0.57);
  const calf = averageOf(record.calfL, record.calfR, record.calf) || round1(thigh * 0.63);
  const ankle = averageOf(record.ankleL, record.ankleR, record.ankle) || round1(calf * 0.63);
  const shoulder = Number.isFinite(Number(record.shoulder)) ? Number(record.shoulder) : round1(chest * 0.48);
  const neck = Number.isFinite(Number(record.neck)) ? Number(record.neck) : round1(chest * 0.39);
  return {
    ...record,
    heightCm: height,
    weightKg: weight,
    bodyFat,
    chest,
    waist,
    abdomen,
    hip,
    upperArmL: Number.isFinite(Number(record.upperArmL)) ? Number(record.upperArmL) : upperArm,
    upperArmR: Number.isFinite(Number(record.upperArmR)) ? Number(record.upperArmR) : upperArm,
    forearmL: Number.isFinite(Number(record.forearmL)) ? Number(record.forearmL) : forearm,
    forearmR: Number.isFinite(Number(record.forearmR)) ? Number(record.forearmR) : forearm,
    thighL: Number.isFinite(Number(record.thighL)) ? Number(record.thighL) : thigh,
    thighR: Number.isFinite(Number(record.thighR)) ? Number(record.thighR) : thigh,
    calfL: Number.isFinite(Number(record.calfL)) ? Number(record.calfL) : calf,
    calfR: Number.isFinite(Number(record.calfR)) ? Number(record.calfR) : calf,
    ankleL: Number.isFinite(Number(record.ankleL)) ? Number(record.ankleL) : ankle,
    ankleR: Number.isFinite(Number(record.ankleR)) ? Number(record.ankleR) : ankle,
    shoulder,
    neck,
    shapeShoulder: clampNum(record.shapeShoulder || 1, 0.8, 1.28),
    shapeChest: clampNum(record.shapeChest || 1, 0.82, 1.28),
    shapeWaist: clampNum(record.shapeWaist || 1, 0.78, 1.25),
    shapeHip: clampNum(record.shapeHip || 1, 0.8, 1.28),
    shapeArm: clampNum(record.shapeArm || 1, 0.8, 1.24),
    shapeLeg: clampNum(record.shapeLeg || 1, 0.85, 1.22),
  };
}

function normalizeHexColor(value, fallback = '#6c8fa9') {
  const raw = String(value || '').trim();
  if (/^#[0-9a-f]{6}$/i.test(raw)) return raw;
  if (/^#[0-9a-f]{3}$/i.test(raw)) return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`;
  return fallback;
}

function hexToRgba(value, alpha = 1) {
  const hex = normalizeHexColor(value);
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mixHex(a, b, t) {
  const ar = (a >> 16) & 255; const ag = (a >> 8) & 255; const ab = a & 255;
  const br = (b >> 16) & 255; const bg = (b >> 8) & 255; const bb = b & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | bl;
}

function heatPropsForDelta(delta) {
  const magnitude = Math.min(1, Math.abs(delta || 0) / 4.6);
  if ((delta || 0) < -0.12) {
    return {
      color: mixHex(0xecf9f0, 0x9ae2b8, magnitude),
      emissive: mixHex(0x7de2a3, 0x2fc97b, magnitude),
      emissiveIntensity: 0.1 + magnitude * 0.28,
      opacity: 0.98,
    };
  }
  if ((delta || 0) > 0.12) {
    return {
      color: mixHex(0xf0f4ff, 0x9db7ff, magnitude),
      emissive: mixHex(0x8fb0ff, 0x587fff, magnitude),
      emissiveIntensity: 0.12 + magnitude * 0.32,
      opacity: 0.98,
    };
  }
  return {
    color: 0xfffbf3,
    emissive: 0xc9b7ff,
    emissiveIntensity: 0.05,
    opacity: 0.98,
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

function buildBodyMeshDims(recordInput) {
  if (!recordInput) return null;
  const base = withBodyDefaults(recordInput);
  const neutral = withBodyDefaults({ heightCm: base.heightCm, weightKg: base.weightKg, bodyFat: base.bodyFat });
  const soften = (id, weight = 0.8, minScale = 0.78, maxScale = 1.24) => {
    const raw = Number(base[id]);
    const fallback = Number(neutral[id]);
    const source = Number.isFinite(raw) && raw > 0 ? raw : fallback;
    if (!Number.isFinite(fallback) || fallback <= 0) return source;
    const mixed = bodySoftMix(fallback, source, weight);
    return clampNum(mixed, fallback * minScale, fallback * maxScale);
  };
  const armAvg = averageOf(base.upperArmL, base.upperArmR) || averageOf(neutral.upperArmL, neutral.upperArmR) || 28;
  const foreAvg = averageOf(base.forearmL, base.forearmR) || averageOf(neutral.forearmL, neutral.forearmR) || 24;
  const thighAvg = averageOf(base.thighL, base.thighR) || averageOf(neutral.thighL, neutral.thighR) || 54;
  const calfAvg = averageOf(base.calfL, base.calfR) || averageOf(neutral.calfL, neutral.calfR) || 36;
  const chestVolume = bodySoftMix(1, base.shapeChest, 0.78);
  const waistVolume = bodySoftMix(1, base.shapeWaist, 0.92);
  const hipVolume = bodySoftMix(1, base.shapeHip, 0.72);
  const armVolume = bodySoftMix(1, base.shapeArm, 0.86);
  const legVolume = bodySoftMix(1, base.shapeLeg, 0.48);
  const shaped = {
    ...base,
    shoulder: soften('shoulder', 0.8, 0.86, 1.18) * bodySoftMix(1, base.shapeShoulder, 0.86),
    chest: soften('chest', 0.84, 0.82, 1.26) * chestVolume * bodySoftMix(1, base.shapeShoulder, 0.08),
    underbust: bodySoftMix(neutral.chest * 0.92, Number(base.underbust || base.chest * 0.92), 0.8) * bodySoftMix(1, base.shapeChest, 0.34),
    waist: soften('waist', 0.76, 0.75, 1.18) * waistVolume,
    abdomen: soften('abdomen', 0.74, 0.75, 1.22) * bodySoftMix(1, base.shapeWaist, 0.82),
    hip: soften('hip', 0.8, 0.8, 1.22) * hipVolume,
    neck: soften('neck', 0.8, 0.84, 1.14) * bodySoftMix(1, base.shapeShoulder, 0.08),
    upperArmL: bodySoftMix(neutral.upperArmL, armAvg, 0.76) * armVolume * bodySoftMix(1, base.shapeShoulder, 0.12),
    upperArmR: bodySoftMix(neutral.upperArmR, armAvg, 0.76) * armVolume * bodySoftMix(1, base.shapeShoulder, 0.12),
    forearmL: bodySoftMix(neutral.forearmL, foreAvg, 0.76) * bodySoftMix(1, base.shapeArm, 0.74),
    forearmR: bodySoftMix(neutral.forearmR, foreAvg, 0.76) * bodySoftMix(1, base.shapeArm, 0.74),
    thighL: bodySoftMix(neutral.thighL, thighAvg, 0.8) * bodySoftMix(1, base.shapeHip, 0.14) * legVolume,
    thighR: bodySoftMix(neutral.thighR, thighAvg, 0.8) * bodySoftMix(1, base.shapeHip, 0.14) * legVolume,
    calfL: bodySoftMix(neutral.calfL, calfAvg, 0.8) * bodySoftMix(1, base.shapeLeg, 0.18),
    calfR: bodySoftMix(neutral.calfR, calfAvg, 0.8) * bodySoftMix(1, base.shapeLeg, 0.18),
  };

  const height = clampNum(((shaped.heightCm || 165) / 165) * 2.18, 1.92, 2.42);
  const bodyFatAdj = clampNum(((shaped.bodyFat || 22) - 18) * 0.0018, -0.03, 0.05);
  const headRadius = height * 0.112;
  const bottom = -height * 0.5 + 0.02;
  const yAt = (p) => bottom + height * p;
  const ellipse = (cm, xFactor = 0.00315, zFactor = 0.00248) => ({ x: clampNum((cm || 80) * xFactor, 0.09, 0.42), z: clampNum((cm || 80) * zFactor, 0.08, 0.34) });
  const chestDepthBoost = clampNum(1 + ((base.shapeChest || 1) - 1) * 0.56 + bodyFatAdj * 0.12, 0.92, 1.2);
  const shoulderWidthBoost = clampNum(1 + ((base.shapeShoulder || 1) - 1) * 0.36, 0.9, 1.14);
  const hipDepthBoost = clampNum(1 + ((base.shapeHip || 1) - 1) * 0.42 + bodyFatAdj * 0.08, 0.9, 1.16);
  const waistTaper = clampNum(1 - ((base.shapeWaist || 1) - 1) * 0.26, 0.88, 1.08);
  let chest = ellipse(shaped.chest, 0.00332, 0.00268);
  chest = { x: chest.x * shoulderWidthBoost, z: chest.z * chestDepthBoost };
  let underbust = ellipse(shaped.underbust || shaped.chest * 0.92, 0.0032, 0.00254);
  underbust = { x: underbust.x * bodySoftMix(1, shoulderWidthBoost, 0.18), z: underbust.z * bodySoftMix(1, chestDepthBoost, 0.44) };
  let waist = ellipse(shaped.waist, 0.00292, 0.00244 + bodyFatAdj * 0.4);
  waist = { x: waist.x * waistTaper, z: waist.z * bodySoftMix(1, waistTaper, 0.42) };
  let abdomen = ellipse(shaped.abdomen, 0.00302, 0.00264 + bodyFatAdj * 0.55);
  abdomen = { x: abdomen.x * bodySoftMix(1, waistTaper, 0.22), z: abdomen.z * bodySoftMix(1, chestDepthBoost, 0.1) };
  let hip = ellipse(shaped.hip, 0.00324, 0.00284 + bodyFatAdj * 0.18);
  hip = { x: hip.x * bodySoftMix(1, hipDepthBoost, 0.22), z: hip.z * hipDepthBoost };
  let thighTop = ellipse(averageOf(shaped.thighL, shaped.thighR) || 54, 0.00248, 0.00198);
  thighTop = { x: thighTop.x * bodySoftMix(1, hipDepthBoost, 0.16), z: thighTop.z * bodySoftMix(1, legVolume, 0.12) };
  const shoulderX = clampNum((shaped.shoulder || 42) * 0.0087, 0.26, 0.48) * shoulderWidthBoost;
  const shoulderZ = clampNum(chest.z + 0.048, 0.16, 0.36);
  const neck = {
    x: clampNum((shaped.neck || 34) * 0.00328, 0.07, 0.16),
    z: clampNum((shaped.neck || 34) * 0.00262, 0.06, 0.13) * bodySoftMix(1, chestDepthBoost, 0.1),
  };
  const upperArmRadius = {
    L: clampNum((Number(shaped.upperArmL) || 28) * 0.00244, 0.05, 0.12),
    R: clampNum((Number(shaped.upperArmR) || 28) * 0.00244, 0.05, 0.12),
  };
  const forearmRadius = {
    L: clampNum((Number(shaped.forearmL) || 24) * 0.00218, 0.042, 0.094),
    R: clampNum((Number(shaped.forearmR) || 24) * 0.00218, 0.042, 0.094),
  };
  const thighRadius = {
    L: clampNum((Number(shaped.thighL) || 54) * 0.0026, 0.1, 0.2),
    R: clampNum((Number(shaped.thighR) || 54) * 0.0026, 0.1, 0.2),
  };
  const calfRadius = {
    L: clampNum((Number(shaped.calfL) || 36) * 0.0024, 0.07, 0.14),
    R: clampNum((Number(shaped.calfR) || 36) * 0.0024, 0.07, 0.14),
  };
  const legScale = shaped.shapeLeg || 1;
  const upperArmLength = height * 0.24 * bodySoftMix(1, base.shapeArm, 0.06);
  const forearmLength = height * 0.21 * bodySoftMix(1, base.shapeArm, 0.04);
  const thighLength = height * 0.28 * legScale;
  const calfLength = height * 0.27 * legScale;
  const thighCenterY = yAt(0.27 - (legScale - 1) * 0.05);
  const calfCenterY = yAt(0.1 - (legScale - 1) * 0.08);
  const torsoRings = [
    { y: yAt(0.82), x: neck.x, z: neck.z },
    { y: yAt(0.78), x: shoulderX * 0.98, z: shoulderZ * 0.96 },
    { y: yAt(0.74), x: bodySoftMix(chest.x, shoulderX * 0.92, 0.34), z: bodySoftMix(chest.z, shoulderZ * 0.84, 0.28) },
    { y: yAt(0.705), x: chest.x, z: chest.z },
    { y: yAt(0.655), x: underbust.x, z: underbust.z },
    { y: yAt(0.595), x: waist.x, z: waist.z },
    { y: yAt(0.545), x: abdomen.x, z: abdomen.z },
    { y: yAt(0.485), x: hip.x, z: hip.z },
    { y: yAt(0.425), x: thighTop.x, z: thighTop.z },
  ];
  const focusY = {
    chest: yAt(0.705),
    waist: yAt(0.595),
    abdomen: yAt(0.545),
    hip: yAt(0.485),
    upperArmL: yAt(0.64),
    upperArmR: yAt(0.64),
    forearmL: yAt(0.5),
    forearmR: yAt(0.5),
    thighL: thighCenterY,
    thighR: thighCenterY,
    calfL: calfCenterY,
    calfR: calfCenterY,
    weightKg: yAt(0.56),
  };
  const haloRadiusMap = {
    chest: (torsoRings[3]?.x || 0.18) * 2.22,
    waist: (torsoRings[5]?.x || 0.16) * 2.46,
    abdomen: (torsoRings[6]?.x || 0.17) * 2.58,
    hip: (torsoRings[7]?.x || 0.18) * 2.45,
    upperArmL: upperArmRadius.L * 2.76,
    upperArmR: upperArmRadius.R * 2.76,
    forearmL: forearmRadius.L * 2.72,
    forearmR: forearmRadius.R * 2.72,
    thighL: thighRadius.L * 2.36,
    thighR: thighRadius.R * 2.36,
    calfL: calfRadius.L * 2.44,
    calfR: calfRadius.R * 2.44,
    weightKg: (torsoRings[5]?.x || 0.16) * 2.72,
  };
  return {
    height,
    headRadius,
    headCenterY: yAt(0.925),
    neck,
    neckHeight: height * 0.046,
    neckCenterY: yAt(0.842),
    torsoRings,
    armAnchorX: shoulderX * 1.03,
    forearmOffsetX: shoulderX * 0.14,
    upperArmRadius,
    forearmRadius,
    upperArmLength,
    forearmLength,
    upperArmCenterY: yAt(0.645),
    forearmCenterY: yAt(0.5),
    handCenterY: yAt(0.392),
    handRadius: {
      L: clampNum(forearmRadius.L * 0.92, 0.038, 0.09),
      R: clampNum(forearmRadius.R * 0.92, 0.038, 0.09),
    },
    legGap: hip.x * 0.32,
    thighRadius,
    calfRadius,
    thighLength,
    calfLength,
    thighCenterY,
    calfCenterY,
    footCenterY: yAt(-0.03),
    footRadius: {
      L: clampNum(calfRadius.L * 0.98, 0.06, 0.16),
      R: clampNum(calfRadius.R * 0.98, 0.06, 0.16),
    },
    focusY,
    haloRadiusMap,
  };
}

function disposeThreeGroup(group, THREE) {
  group?.traverse?.((child) => {
    child.geometry?.dispose?.();
    if (Array.isArray(child.material)) child.material.forEach((mat) => mat?.dispose?.());
    else child.material?.dispose?.();
  });
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
  const perf = perfProfile();
  if (ghost) {
    return {
      material: new THREE.MeshPhysicalMaterial({
        color: 0xcad7f4,
        transparent: true,
        opacity: perf.reduced ? 0.12 : 0.16,
        roughness: 0.74,
        metalness: 0.01,
        clearcoat: 0.14,
        clearcoatRoughness: 0.42,
        sheen: 0.2,
        sheenColor: 0xf4f8ff,
        side: THREE.DoubleSide,
      }),
      baseIntensity: 0,
    };
  }
  const heat = heatPropsForDelta(delta);
  const intensity = perf.reduced ? heat.emissiveIntensity * 0.75 : heat.emissiveIntensity;
  return {
    material: new THREE.MeshPhysicalMaterial({
      color: heat.color,
      emissive: heat.emissive,
      emissiveIntensity: intensity,
      roughness: perf.reduced ? 0.42 : 0.32,
      metalness: 0.02,
      clearcoat: perf.reduced ? 0.34 : 0.58,
      clearcoatRoughness: perf.reduced ? 0.34 : 0.22,
      sheen: perf.reduced ? 0.28 : 0.46,
      sheenColor: heat.color,
      transmission: perf.reduced ? 0 : 0.04,
      thickness: perf.reduced ? 0 : 0.18,
      ior: 1.32,
      reflectivity: 0.5,
      transparent: heat.opacity < 1,
      opacity: heat.opacity,
      side: THREE.DoubleSide,
    }),
    baseIntensity: intensity,
  };
}

function collectHeatMat(group, entry) {
  if (!entry?.baseIntensity || !entry.material) return;
  group.userData.heatMaterials.push({ material: entry.material, baseIntensity: entry.baseIntensity });
}

function makeCapsuleMesh(THREE, radius, length, material, ghost) {
  const perf = perfProfile();
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(Math.max(0.03, radius), Math.max(0.08, length), perf.capsuleCapSegments, perf.capsuleRadialSegments), material);
  mesh.castShadow = perf.shadows && !ghost;
  mesh.receiveShadow = perf.shadows && !ghost;
  return mesh;
}

function buildTorsoSegmentMesh(THREE, rings, material) {
  return new THREE.Mesh(buildEllipticalStripGeometry(THREE, rings, perfProfile().radialSegments), material);
}

function addLimbSet(THREE, group, dims, ghost, sideKey, upperArmMat, forearmMat, thighMat, calfMat) {
  const side = sideKey === 'L' ? -1 : 1;
  const armAnchorX = side * dims.armAnchorX;
  const upperRadius = dims.upperArmRadius[sideKey];
  const foreRadius = dims.forearmRadius[sideKey];
  const thighRadius = dims.thighRadius[sideKey];
  const calfRadius = dims.calfRadius[sideKey];

  const shoulderCap = new THREE.Mesh(
    new THREE.SphereGeometry(Math.max(0.03, upperRadius * 1.14), 18, 16),
    upperArmMat.material
  );
  shoulderCap.scale.set(1.08, 0.96, 1.16);
  shoulderCap.position.set(armAnchorX * 0.98, dims.upperArmCenterY + dims.upperArmLength * 0.46, 0);
  shoulderCap.castShadow = !ghost;
  group.add(shoulderCap);

  const armUpper = makeCapsuleMesh(THREE, upperRadius, dims.upperArmLength, upperArmMat.material, ghost);
  armUpper.position.set(armAnchorX, dims.upperArmCenterY, 0);
  armUpper.rotation.z = side * 0.12;
  armUpper.rotation.x = 0.05;
  group.add(armUpper);
  collectHeatMat(group, upperArmMat);

  const forearm = makeCapsuleMesh(THREE, foreRadius, dims.forearmLength, forearmMat.material, ghost);
  forearm.position.set(side * (dims.armAnchorX + dims.forearmOffsetX), dims.forearmCenterY, 0.02);
  forearm.rotation.z = side * 0.09;
  forearm.rotation.x = 0.03;
  group.add(forearm);
  collectHeatMat(group, forearmMat);

  const hand = new THREE.Mesh(
    new THREE.SphereGeometry(Math.max(0.028, dims.handRadius[sideKey]), 18, 14),
    forearmMat.material
  );
  hand.scale.set(0.95, 0.78, 1.34);
  hand.position.set(side * (dims.armAnchorX + dims.forearmOffsetX + foreRadius * 0.12), dims.handCenterY, 0.06);
  hand.castShadow = !ghost;
  group.add(hand);

  const hipCap = new THREE.Mesh(
    new THREE.SphereGeometry(Math.max(0.04, thighRadius * 1.08), 18, 16),
    thighMat.material
  );
  hipCap.scale.set(1.08, 0.9, 1.08);
  hipCap.position.set(side * dims.legGap, dims.thighCenterY + dims.thighLength * 0.47, 0);
  hipCap.castShadow = !ghost;
  group.add(hipCap);

  const legUpper = makeCapsuleMesh(THREE, thighRadius, dims.thighLength, thighMat.material, ghost);
  legUpper.position.set(side * dims.legGap, dims.thighCenterY, 0);
  legUpper.rotation.z = side * 0.02;
  group.add(legUpper);
  collectHeatMat(group, thighMat);

  const knee = new THREE.Mesh(
    new THREE.SphereGeometry(Math.max(0.04, calfRadius * 1.08), 16, 14),
    calfMat.material
  );
  knee.scale.set(1.02, 0.88, 1.08);
  knee.position.set(side * dims.legGap, dims.calfCenterY + dims.calfLength * 0.47, 0.01);
  knee.castShadow = !ghost;
  group.add(knee);

  const legLower = makeCapsuleMesh(THREE, calfRadius, dims.calfLength, calfMat.material, ghost);
  legLower.position.set(side * dims.legGap, dims.calfCenterY, 0.01);
  legLower.rotation.z = side * 0.01;
  group.add(legLower);
  collectHeatMat(group, calfMat);

  const foot = new THREE.Mesh(
    new THREE.SphereGeometry(Math.max(0.04, dims.footRadius[sideKey]), 18, 14),
    calfMat.material
  );
  foot.scale.set(1.34, 0.48, 1.82);
  foot.position.set(side * dims.legGap, dims.footCenterY, 0.1);
  foot.castShadow = !ghost;
  group.add(foot);
}


function addAnatomicalGuideRings(THREE, group, dims, ghost = false) {
  if (!dims?.torsoRings?.length) return;
  const guideMaterial = new THREE.MeshBasicMaterial({
    color: ghost ? 0xb9c8e7 : 0xffffff,
    transparent: true,
    opacity: ghost ? 0.08 : 0.24,
    depthWrite: false,
  });
  const specs = [
    { ring: dims.torsoRings[3], tube: 0.0042, opacity: 0.23 },
    { ring: dims.torsoRings[5], tube: 0.0038, opacity: 0.2 },
    { ring: dims.torsoRings[7], tube: 0.004, opacity: 0.22 },
  ];
  specs.forEach((spec, index) => {
    if (!spec.ring) return;
    const material = guideMaterial.clone();
    material.opacity = ghost ? 0.065 : spec.opacity;
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(1, spec.tube, 8, 96), material);
    mesh.scale.set(spec.ring.x * (index === 1 ? 1.08 : 1.04), spec.ring.z * (index === 1 ? 1.1 : 1.04), 1);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(0, spec.ring.y, 0.012 + index * 0.004);
    mesh.renderOrder = 4;
    group.add(mesh);
  });
  const centerMat = guideMaterial.clone();
  centerMat.opacity = ghost ? 0.05 : 0.16;
  const centerLine = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, dims.height * 0.58, 8, 1, true), centerMat);
  centerLine.position.set(0, dims.torsoRings[4]?.y || 0.08, 0.028);
  centerLine.rotation.x = 0;
  centerLine.renderOrder = 5;
  group.add(centerLine);
}


function pickStandardBodyMesh(asset, recordInput) {
  const record = recordInput || {};
  const sex = String(record.sex || record.gender || '').toLowerCase();
  const meshes = asset?.meshes || {};
  if (sex === 'male') return meshes.maleStandard || meshes.femaleStandard || Object.values(meshes)[0] || null;
  return meshes.femaleStandard || meshes.maleStandard || Object.values(meshes)[0] || null;
}

function decodeStandardMesh(mesh) {
  if (!mesh || !Array.isArray(mesh.positions) || !Array.isArray(mesh.indices)) return null;
  if (!mesh.__decoded) {
    const quant = Number(mesh.quant || 10000) || 10000;
    const base = new Float32Array(mesh.positions.length);
    for (let i = 0; i < mesh.positions.length; i += 1) base[i] = Number(mesh.positions[i] || 0) / quant;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 1; i < base.length; i += 3) {
      minY = Math.min(minY, base[i]);
      maxY = Math.max(maxY, base[i]);
    }
    const indexArray = (mesh.vertexCount || base.length / 3) > 65535
      ? new Uint32Array(mesh.indices)
      : new Uint16Array(mesh.indices);
    mesh.__decoded = {
      base,
      indices: indexArray,
      minY: Number.isFinite(minY) ? minY : -1.09,
      maxY: Number.isFinite(maxY) ? maxY : 1.09,
    };
  }
  return mesh.__decoded;
}

function bellWeight(t, center, spread) {
  const distance = (Number(t) - center) / Math.max(0.0001, spread);
  return Math.exp(-distance * distance);
}

function bodyRatio(base, neutral, key, min = 0.78, max = 1.25) {
  const source = Number(base?.[key]);
  const ref = Number(neutral?.[key]);
  if (!Number.isFinite(source) || source <= 0 || !Number.isFinite(ref) || ref <= 0) return 1;
  return clampNum(source / ref, min, max);
}

function buildStandardBodyMorph(recordInput) {
  const base = withBodyDefaults(recordInput);
  const neutral = withBodyDefaults({
    sex: base?.sex || recordInput?.sex || 'female',
    heightCm: base?.heightCm || 165,
    weightKg: base?.weightKg || 58,
    bodyFat: base?.bodyFat || 22,
  });
  const armRatio = bodyRatio(
    { upperArm: averageOf(base.upperArmL, base.upperArmR) || base.upperArm || neutral.upperArmL },
    { upperArm: averageOf(neutral.upperArmL, neutral.upperArmR) || 28 },
    'upperArm',
    0.78,
    1.28
  );
  const thighRatio = bodyRatio(
    { thigh: averageOf(base.thighL, base.thighR) || base.thigh || neutral.thighL },
    { thigh: averageOf(neutral.thighL, neutral.thighR) || 54 },
    'thigh',
    0.78,
    1.28
  );
  const calfRatio = bodyRatio(
    { calf: averageOf(base.calfL, base.calfR) || base.calf || neutral.calfL },
    { calf: averageOf(neutral.calfL, neutral.calfR) || 36 },
    'calf',
    0.78,
    1.24
  );
  const bodyFatPush = clampNum(((base.bodyFat || 22) - 22) / 100, -0.1, 0.16);
  return {
    height: clampNum((base.heightCm || 165) / 165, 0.9, 1.16),
    shoulder: bodyRatio(base, neutral, 'shoulder', 0.86, 1.2) * bodySoftMix(1, base.shapeShoulder || 1, 0.76),
    chest: bodyRatio(base, neutral, 'chest', 0.82, 1.28) * bodySoftMix(1, base.shapeChest || 1, 0.84),
    waist: bodyRatio(base, neutral, 'waist', 0.72, 1.24) * bodySoftMix(1, base.shapeWaist || 1, 0.9),
    abdomen: bodyRatio(base, neutral, 'abdomen', 0.72, 1.26) * bodySoftMix(1, base.shapeWaist || 1, 0.78),
    hip: bodyRatio(base, neutral, 'hip', 0.8, 1.28) * bodySoftMix(1, base.shapeHip || 1, 0.86),
    neck: bodyRatio(base, neutral, 'neck', 0.86, 1.18),
    arm: armRatio * bodySoftMix(1, base.shapeArm || 1, 0.88),
    thigh: thighRatio * bodySoftMix(1, base.shapeHip || 1, 0.18) * bodySoftMix(1, base.shapeLeg || 1, 0.42),
    calf: calfRatio * bodySoftMix(1, base.shapeLeg || 1, 0.28),
    leg: bodySoftMix(1, base.shapeLeg || 1, 0.58),
    depth: clampNum(1 + bodyFatPush, 0.9, 1.18),
  };
}

function deformStandardBodyPositions(decoded, recordInput) {
  const morph = buildStandardBodyMorph(recordInput);
  const base = decoded.base;
  const out = new Float32Array(base.length);
  const minY = decoded.minY;
  const height = Math.max(0.001, decoded.maxY - decoded.minY);
  for (let i = 0; i < base.length; i += 3) {
    const x = base[i];
    const y = base[i + 1];
    const z = base[i + 2];
    const t = clampNum((y - minY) / height, 0, 1);
    const absX = Math.abs(x);
    const armZone = absX > 0.27 && t > 0.32 && t < 0.76 ? clampNum((absX - 0.24) / 0.36, 0, 1) : 0;
    let sx = 1;
    let sz = 1;
    const add = (scale, weight, zWeight = 0.72) => {
      const delta = (scale || 1) - 1;
      sx += delta * weight;
      sz += delta * weight * zWeight;
    };
    add(morph.calf, bellWeight(t, 0.1, 0.075), 0.78);
    add(morph.thigh, bellWeight(t, 0.25, 0.095), 0.76);
    add(morph.hip, bellWeight(t, 0.39, 0.085), 0.86);
    add(morph.abdomen, bellWeight(t, 0.47, 0.07), 0.9);
    add(morph.waist, bellWeight(t, 0.53, 0.07), 0.82);
    add(morph.chest, bellWeight(t, 0.64, 0.09), 0.8);
    add(morph.shoulder, bellWeight(t, 0.73, 0.07), 0.62);
    add(morph.neck, bellWeight(t, 0.81, 0.045), 0.54);
    if (armZone) {
      add(morph.arm, armZone * (0.82 + bellWeight(t, 0.56, 0.18) * 0.18), 0.92);
    }
    const legBlend = t < 0.36 ? (1 - t / 0.36) : 0;
    const yLegScale = 1 + (morph.leg - 1) * legBlend;
    const yScale = morph.height * yLegScale;
    out[i] = x * clampNum(sx, 0.66, 1.46);
    out[i + 1] = y * clampNum(yScale, 0.84, 1.25);
    out[i + 2] = z * clampNum(sz * morph.depth, 0.7, 1.46);
  }
  return out;
}

function standardBodyVolumeDelta(current, previous) {
  if (!current || !previous) return 0.06;
  const keys = ['chest', 'waist', 'abdomen', 'hip', 'upperArmL', 'upperArmR', 'thighL', 'thighR', 'calfL', 'calfR'];
  const deltas = keys.map((key) => Number(current?.[key] || 0) - Number(previous?.[key] || 0)).filter((value) => Number.isFinite(value));
  if (!deltas.length) return 0.06;
  return round1(deltas.reduce((sum, value) => sum + value, 0) / deltas.length);
}

function addStandardBodyOriginMark(THREE, group, dims, ghost = false) {
  if (!dims) return;
  addAnatomicalGuideRings(THREE, group, dims, ghost);
  const pointMat = new THREE.MeshBasicMaterial({
    color: ghost ? 0xb9c8e7 : 0xffffff,
    transparent: true,
    opacity: ghost ? 0.08 : 0.22,
    depthWrite: false,
  });
  const focusPairs = [
    ['胸围', dims.focusY?.chest, dims.haloRadiusMap?.chest],
    ['腰围', dims.focusY?.waist, dims.haloRadiusMap?.waist],
    ['臀围', dims.focusY?.hip, dims.haloRadiusMap?.hip],
  ];
  focusPairs.forEach(([, y, radius], index) => {
    if (!Number.isFinite(y) || !Number.isFinite(radius)) return;
    const bead = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.012, radius * 0.032), 12, 10), pointMat.clone());
    bead.position.set(radius * 0.54, y, 0.05 + index * 0.004);
    bead.renderOrder = 6;
    group.add(bead);
  });
}

function buildStandardBodyGroup(THREE, recordInput, previousInput, ghost = false, asset = null) {
  const record = withBodyDefaults(recordInput);
  const previous = previousInput ? withBodyDefaults(previousInput) : null;
  const meshSpec = pickStandardBodyMesh(asset, record);
  const decoded = decodeStandardMesh(meshSpec);
  if (!decoded) return buildWebglBodyGroup(THREE, recordInput, previousInput, ghost);
  const positions = deformStandardBodyPositions(decoded, record);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(decoded.indices, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  const delta = standardBodyVolumeDelta(record, previous);
  const bodyMat = createBodyMaterial(THREE, ghost, delta);
  bodyMat.material.roughness = ghost ? 0.82 : 0.44;
  bodyMat.material.metalness = 0.01;
  bodyMat.material.clearcoat = ghost ? 0.08 : 0.28;
  bodyMat.material.opacity = ghost ? 0.16 : 0.96;
  bodyMat.material.transparent = true;
  const mesh = new THREE.Mesh(geometry, bodyMat.material);
  mesh.castShadow = !ghost;
  mesh.receiveShadow = !ghost;
  mesh.name = meshSpec?.label || 'standard-body';
  const group = new THREE.Group();
  group.userData = { heatMaterials: [], dims: buildBodyMeshDims(record), modelSource: meshSpec?.sourceGroup || 'standard-body' };
  group.add(mesh);
  collectHeatMat(group, bodyMat);
  addStandardBodyOriginMark(THREE, group, group.userData.dims, ghost);
  return group;
}


function buildWebglBodyGroup(THREE, recordInput, previousInput, ghost = false) {
  const record = withBodyDefaults(recordInput);
  const previous = previousInput ? withBodyDefaults(previousInput) : null;
  const dims = buildBodyMeshDims(record);
  const deltas = buildBodySegmentDeltaMap(record, previous);
  const group = new THREE.Group();
  group.userData = { heatMaterials: [], dims };

  const headMat = createBodyMaterial(THREE, ghost, 0.06);
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
  [
    buildTorsoSegmentMesh(THREE, rings.slice(0, 5), torsoChestMat.material),
    buildTorsoSegmentMesh(THREE, rings.slice(3, 7), torsoMidMat.material),
    buildTorsoSegmentMesh(THREE, rings.slice(5, 9), torsoHipMat.material),
  ].forEach((mesh) => {
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

  const head = new THREE.Mesh(new THREE.SphereGeometry(dims.headRadius, 40, 32), headMat.material);
  head.scale.set(1, 1.16, 1.03);
  head.position.set(0, dims.headCenterY, 0.012);
  head.castShadow = !ghost;
  group.add(head);
  collectHeatMat(group, headMat);

  const faceMaterial = new THREE.MeshPhysicalMaterial({
    color: ghost ? 0xd7e1f8 : 0xfffbf4,
    emissive: ghost ? 0x8ea7d8 : 0xdcd0ff,
    emissiveIntensity: ghost ? 0.02 : 0.055,
    roughness: 0.38,
    metalness: 0.0,
    clearcoat: ghost ? 0.12 : 0.42,
    clearcoatRoughness: 0.26,
    transparent: true,
    opacity: ghost ? 0.12 : 0.64,
    side: THREE.DoubleSide,
  });
  const facePlate = new THREE.Mesh(new THREE.SphereGeometry(dims.headRadius * 0.74, 32, 18), faceMaterial);
  facePlate.scale.set(0.72, 0.92, 0.18);
  facePlate.position.set(0, dims.headCenterY - dims.headRadius * 0.02, dims.headRadius * 0.93);
  facePlate.rotation.x = -0.05;
  facePlate.castShadow = false;
  group.add(facePlate);

  const crownMaterial = new THREE.MeshBasicMaterial({
    color: ghost ? 0xb8c6e6 : 0xffffff,
    transparent: true,
    opacity: ghost ? 0.08 : 0.28,
  });
  const crown = new THREE.Mesh(new THREE.TorusGeometry(dims.headRadius * 1.05, dims.headRadius * 0.012, 8, 72), crownMaterial);
  crown.position.set(0, dims.headCenterY + dims.headRadius * 0.035, dims.headRadius * 0.02);
  crown.rotation.x = Math.PI / 2;
  crown.scale.set(0.82, 1.0, 1.0);
  group.add(crown);

  addLimbSet(THREE, group, dims, ghost, 'L', armLMat, foreLMat, thighLMat, calfLMat);
  addLimbSet(THREE, group, dims, ghost, 'R', armRMat, foreRMat, thighRMat, calfRMat);
  addAnatomicalGuideRings(THREE, group, dims, ghost);
  return group;
}

function createWebGLBodyScene(canvas, THREE, OrbitControls, options) {
  const perf = perfProfile();
  const platformKey = options?.platformKey || '';
  const isIOS = platformKey === 'ios';
  const isAndroid = platformKey === 'android';
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !perf.reduced, alpha: true, powerPreference: 'high-performance' });
  } catch (error) {
    console.error(error);
    return null;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = perf.reduced ? 1.16 : 1.28;
  renderer.shadowMap.enabled = perf.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearAlpha(0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(isIOS ? 0xf7f2ea : isAndroid ? 0xf2f7ed : 0xf6f3ec, 6.2, isAndroid ? 13.8 : 13.1);

  const camera = new THREE.PerspectiveCamera(isIOS ? 24.8 : isAndroid ? 25.2 : 25.5, 1, 0.1, 30);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableRotate = true;
  controls.minDistance = 2.72;
  controls.maxDistance = 6.4;
  controls.minPolarAngle = 0.92;
  controls.maxPolarAngle = 2.12;
  controls.target.set(0, 0.16, 0);
  controls.zoomSpeed = isIOS ? 1.05 : isAndroid ? 0.98 : 0.96;
  controls.rotateSpeed = isIOS ? 0.96 : isAndroid ? 0.9 : 0.82;
  controls.autoRotate = !perf.reduced;
  controls.autoRotateSpeed = isIOS ? 0.38 : isAndroid ? 0.46 : 0.42;

  const white = new THREE.Color(0xffffff);
  const deepSlate = new THREE.Color(0xf5efe6);

  const hemi = new THREE.HemisphereLight(isIOS ? 0xfff8ff : isAndroid ? 0xf8fff8 : 0xfffbf4, isIOS ? 0xd6c4ec : isAndroid ? 0xcfe5d5 : 0xd9cced, perf.reduced ? 1.46 : (isIOS ? 1.76 : isAndroid ? 1.7 : 1.72));
  scene.add(hemi);
  const key = new THREE.DirectionalLight(isIOS ? 0xfff5fe : isAndroid ? 0xf6fff8 : 0xfffbf6, perf.reduced ? 1.78 : (isIOS ? 2.18 : isAndroid ? 2.08 : 2.12));
  key.position.set(isAndroid ? 4.2 : 3.9, 5.1, isIOS ? 4.1 : 3.9);
  key.castShadow = perf.shadows;
  key.shadow.mapSize.width = perf.shadows ? 512 : 256;
  key.shadow.mapSize.height = perf.shadows ? 512 : 256;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 16;
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(isIOS ? 0xd7a7d6 : isAndroid ? 0xa6d3b1 : 0xb484b0, perf.reduced ? 0.84 : (isIOS ? 1.16 : isAndroid ? 1.04 : 1.08));
  rim.position.set(isIOS ? -4.3 : -4.1, 3.2, isAndroid ? -4.0 : -4.3);
  scene.add(rim);
  const fill = new THREE.PointLight(isIOS ? 0xf7eef9 : isAndroid ? 0xe8fff2 : 0xdfeeff, perf.reduced ? 0.84 : (isIOS ? 1.16 : isAndroid ? 1.02 : 1.1), 13, 2);
  fill.position.set(0, isIOS ? 1.7 : 1.6, isAndroid ? 2.7 : 2.55);
  scene.add(fill);
  const accentLight = new THREE.PointLight(isIOS ? 0x795f9c : isAndroid ? 0x518463 : 0x6c8fa9, perf.reduced ? 0.58 : (isIOS ? 0.82 : isAndroid ? 0.76 : 0.78), 8.8, 2);
  accentLight.position.set(0, 0.5, isIOS ? -2.35 : -2.2);
  scene.add(accentLight);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(isAndroid ? 2.34 : 2.26, perf.reduced ? 44 : 72),
    new THREE.ShadowMaterial({ transparent: true, opacity: perf.reduced ? 0.17 : (isIOS ? 0.26 : 0.24), color: isIOS ? 0x795f9c : isAndroid ? 0x518463 : 0x6c8fa9 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.2;
  floor.receiveShadow = perf.shadows;
  scene.add(floor);

  const glowRing = new THREE.Mesh(
    new THREE.RingGeometry(isIOS ? 1.08 : 1.1, isAndroid ? 1.98 : 1.92, perf.reduced ? 40 : 72),
    new THREE.MeshBasicMaterial({ color: isIOS ? 0x795f9c : isAndroid ? 0x518463 : 0x6c8fa9, transparent: true, opacity: perf.reduced ? 0.09 : 0.16, side: THREE.DoubleSide })
  );
  glowRing.rotation.x = -Math.PI / 2;
  glowRing.position.y = -1.17;
  glowRing.visible = !perf.reduced;
  scene.add(glowRing);

  const glowRingOuter = new THREE.Mesh(
    new THREE.RingGeometry(1.96, isAndroid ? 2.42 : 2.34, perf.reduced ? 40 : 72),
    new THREE.MeshBasicMaterial({ color: isIOS ? 0xb484b0 : isAndroid ? 0xa6d3b1 : 0xb484b0, transparent: true, opacity: perf.reduced ? 0.04 : (isIOS ? 0.08 : 0.07), side: THREE.DoubleSide })
  );
  glowRingOuter.rotation.x = -Math.PI / 2;
  glowRingOuter.position.y = -1.168;
  glowRingOuter.visible = !perf.reduced;
  scene.add(glowRingOuter);

  const arcRing = new THREE.Mesh(
    new THREE.TorusGeometry(isIOS ? 1.34 : 1.38, 0.012, 10, perf.reduced ? 36 : 96, Math.PI * (isAndroid ? 1.74 : 1.68)),
    new THREE.MeshBasicMaterial({ color: isIOS ? 0xeedaca : isAndroid ? 0xccf2e0 : 0xeedaca, transparent: true, opacity: perf.reduced ? 0.05 : 0.12 })
  );
  arcRing.rotation.set(Math.PI / 2.8, 0.08, Math.PI / 10);
  arcRing.position.set(0, 0.2, -0.1);
  arcRing.visible = !perf.reduced;
  scene.add(arcRing);

  const backAura = new THREE.Mesh(
    new THREE.SphereGeometry(isAndroid ? 1.46 : 1.4, perf.reduced ? 18 : 34, perf.reduced ? 14 : 26),
    new THREE.MeshBasicMaterial({ color: isIOS ? 0xf5e9f5 : isAndroid ? 0xe2fff1 : 0xdfeeff, transparent: true, opacity: perf.reduced ? 0.04 : (isIOS ? 0.09 : 0.08), side: THREE.DoubleSide })
  );
  backAura.scale.set(1.1, 1.48, 0.5);
  backAura.position.set(0, 0.58, -0.68);
  scene.add(backAura);

  const focusHalo = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.016, 12, perf.reduced ? 40 : 88),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
  );
  focusHalo.rotation.x = Math.PI / 2;
  focusHalo.position.y = 0.12;
  scene.add(focusHalo);

  let currentGroup = null;
  let ghostGroup = null;
  let disposed = false;
  let currentSnapshot = null;
  let focusField = '';
  let standardBodyAsset = null;
  let resizeObserver = null;
  let focusHaloBaseScale = 1;
  let userInteracted = false;
  const accentColor = new THREE.Color(normalizeHexColor(options.accentColor || '#6c8fa9'));

  function applyAccent(colorValue) {
    accentColor.set(normalizeHexColor(colorValue || '#6c8fa9'));
    const brightAccent = accentColor.clone().lerp(white, 0.24);
    const softAccent = accentColor.clone().lerp(deepSlate, 0.34);
    rim.color.copy(brightAccent.clone().lerp(new THREE.Color(0xf0d8f0), 0.26));
    fill.color.copy(brightAccent.clone().lerp(new THREE.Color(0xf7f1ec), 0.4));
    accentLight.color.copy(accentColor);
    glowRing.material.color.copy(brightAccent);
    glowRingOuter.material.color.copy(accentColor.clone().lerp(new THREE.Color(0xf0d8f0), 0.28));
    arcRing.material.color.copy(accentColor.clone().lerp(new THREE.Color(0xeedaca), 0.18));
    backAura.material.color.copy(brightAccent.clone().lerp(white, 0.18));
    focusHalo.material.color.copy(brightAccent);
    if (floor.material.color) floor.material.color.copy(softAccent.clone().lerp(new THREE.Color(0xd9d0c2), 0.3));
    scene.fog.color.copy(deepSlate.clone().lerp(accentColor, 0.08));
  }

  function updateSize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(320, Math.round(rect.width || canvas.clientWidth || 320));
    const height = Math.max(420, Math.round(rect.height || canvas.clientHeight || 420));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, perf.dpr));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function alignCamera(angle = 0) {
    const radius = perf.reduced ? (isIOS ? 3.74 : 3.82) : (isIOS ? 3.88 : isAndroid ? 4.02 : 3.96);
    const cameraY = isIOS ? 1.46 : isAndroid ? 1.38 : 1.42;
    const targetY = isIOS ? 0.24 : isAndroid ? 0.19 : 0.21;
    const rad = (angle || 0) * Math.PI / 180;
    camera.position.set(Math.sin(rad) * radius, cameraY, Math.cos(rad) * radius);
    controls.target.set(0, targetY, 0);
    controls.update();
  }

  function updateFocus(snapshot) {
    const dims = buildBodyMeshDims(snapshot?.current);
    const yMap = dims?.focusY || {};
    const targetY = yMap[focusField] ?? 0.02;
    focusHaloBaseScale = (dims?.haloRadiusMap?.[focusField] || 1) * 1.02;
    focusHalo.position.set(0, targetY, 0);
    focusHalo.scale.setScalar(focusHaloBaseScale);
    focusHalo.material.opacity = focusField ? (perf.reduced ? 0.12 : 0.2) : 0.02;
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
    const useStandardBody = standardBodyAsset?.meshes;
    currentGroup = useStandardBody
      ? buildStandardBodyGroup(THREE, snapshot.current, snapshot.previous, false, standardBodyAsset)
      : buildWebglBodyGroup(THREE, snapshot.current, snapshot.previous, false);
    scene.add(currentGroup);
    if (snapshot.previous && options.overlay !== false) {
      ghostGroup = useStandardBody
        ? buildStandardBodyGroup(THREE, snapshot.previous, null, true, standardBodyAsset)
        : buildWebglBodyGroup(THREE, snapshot.previous, null, true);
      scene.add(ghostGroup);
    }
    updateFocus(snapshot);
  }

  function animate(time) {
    if (disposed) return;
    requestAnimationFrame(animate);
    controls.update();
    if (!perf.reduced && glowRing.visible) {
      glowRing.material.opacity = 0.15 + Math.sin(time / 950) * 0.026;
      glowRingOuter.material.opacity = 0.064 + Math.sin(time / 1650) * 0.012;
      arcRing.rotation.z = Math.PI / 10 + Math.sin(time / 2100) * 0.06;
      arcRing.rotation.y = 0.08 + Math.sin(time / 2600) * 0.14;
      backAura.material.opacity = 0.078 + Math.sin(time / 1320) * 0.01;
    }
    if (focusField) {
      const pulse = 1 + Math.sin(time / 260) * (perf.reduced ? 0.025 : 0.05);
      focusHalo.scale.setScalar(focusHaloBaseScale * pulse);
      focusHalo.material.opacity = (perf.reduced ? 0.11 : 0.16) + Math.sin(time / 220) * (perf.reduced ? 0.02 : 0.045);
    } else {
      focusHalo.material.opacity = 0.02;
    }
    if (currentGroup && !perf.reduced) {
      currentGroup.position.y = Math.sin(time / 980) * 0.01;
      currentGroup.rotation.y = userInteracted ? currentGroup.rotation.y : Math.sin(time / 3200) * 0.08;
      const mats = currentGroup.userData?.heatMaterials || [];
      mats.forEach((entry, idx) => {
        entry.material.emissiveIntensity = entry.baseIntensity * (0.92 + Math.sin(time / 320 + idx) * 0.08);
      });
    }
    renderer.render(scene, camera);
  }

  updateSize();
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(canvas);
  }
  applyAccent(options.accentColor || '#6c8fa9');
  alignCamera(0);
  loadStandardBodyAsset()
    .then((asset) => {
      standardBodyAsset = asset;
      options.onModelAssetReady?.(asset);
      if (!disposed && currentSnapshot) setGroup(currentSnapshot);
    })
    .catch((error) => {
      console.warn('[haochijia] uploaded standard body asset unavailable, procedural mesh retained.', error);
    });
  requestAnimationFrame(animate);

  const markInteracted = () => {
    userInteracted = true;
    controls.autoRotate = false;
  };
  controls.addEventListener('start', markInteracted);
  canvas.addEventListener('wheel', markInteracted, { passive: true });

  const controller = {
    mode: 'webgl',
    setSnapshot(snapshot) {
      currentSnapshot = snapshot;
      setGroup(snapshot);
    },
    setFocusField(field) {
      focusField = field || '';
      if (currentSnapshot) updateFocus(currentSnapshot);
    },
    setAccentColor(color) {
      options.accentColor = color || options.accentColor || '#6c8fa9';
      applyAccent(options.accentColor);
    },
    resetView() {
      alignCamera(0);
      options.onViewReset?.();
    },
    dispose() {
      disposed = true;
      resizeObserver?.disconnect();
      controls.removeEventListener('start', markInteracted);
      canvas.removeEventListener('wheel', markInteracted);
      controls.dispose();
      if (currentGroup) disposeThreeGroup(currentGroup, THREE);
      if (ghostGroup) disposeThreeGroup(ghostGroup, THREE);
      renderer.dispose();
    },
  };

  let touchCount = 0;
  let pressTimer = null;
  let lastTap = 0;
  canvas.addEventListener('pointerdown', () => {
    markInteracted();
    touchCount += 1;
    if (touchCount === 1) {
      pressTimer = window.setTimeout(() => options.onLongPress?.(), 520);
      const now = Date.now();
      if (now - lastTap < 320) {
        controller.resetView();
      }
      lastTap = now;
    }
  }, { passive: true });
  const endPointer = () => {
    touchCount = Math.max(0, touchCount - 1);
    if (pressTimer) {
      window.clearTimeout(pressTimer);
      pressTimer = null;
    }
  };
  canvas.addEventListener('pointerup', endPointer, { passive: true });
  canvas.addEventListener('pointercancel', endPointer, { passive: true });
  canvas.addEventListener('pointerleave', endPointer, { passive: true });
  canvas.addEventListener('dblclick', () => controller.resetView(), { passive: true });
  return controller;
}

function fallbackFigureProfile(record, width, height) {
  const body = withBodyDefaults(record);
  const chestScale = bodySoftMix(1, body.shapeChest || 1, 0.72);
  const waistScale = bodySoftMix(1, body.shapeWaist || 1, 0.9);
  const hipScale = bodySoftMix(1, body.shapeHip || 1, 0.76);
  const legScale = bodySoftMix(1, body.shapeLeg || 1, 0.68);
  return {
    centerX: width * 0.5,
    topY: height * 0.06,
    bodyHeight: height * 0.84,
    headR: clampNum((body.neck || 34) * 0.48, 15, 34),
    shoulderHalf: clampNum((body.shoulder || 42) * 1.1 * bodySoftMix(1, body.shapeShoulder || 1, 0.82), 28, 80),
    chestHalf: clampNum((body.chest || 90) * 0.54 * chestScale, 26, 68),
    waistHalf: clampNum((body.waist || 75) * 0.46 * waistScale, 22, 58),
    hipHalf: clampNum((body.hip || 95) * 0.5 * hipScale, 26, 72),
    thighHalf: clampNum((averageOf(body.thighL, body.thighR) || 54) * 0.31 * legScale, 14, 36),
    calfHalf: clampNum((averageOf(body.calfL, body.calfR) || 36) * 0.28 * legScale, 11, 26),
  };
}

function drawFallbackFigure(ctx, canvas, snapshot, focusField, accentColor = '#6c8fa9', view = {}) {
  const dpr = Math.max(window.devicePixelRatio || 1, 1);
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const accent = normalizeHexColor(accentColor, '#6c8fa9');
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, 'rgba(255, 251, 244, 0.98)');
  bg.addColorStop(0.52, 'rgba(248, 242, 232, 0.94)');
  bg.addColorStop(1, 'rgba(239, 233, 222, 0.92)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  if (!snapshot?.current) return;
  const p = fallbackFigureProfile(snapshot.current, width, height);
  const yaw = Number(view.rotation || 0);
  const zoom = clampNum(Number(view.zoom || 1), 0.78, 1.38);
  const depth = 0.82 + Math.abs(Math.cos(yaw)) * 0.18;
  const lean = Math.sin(yaw) * Math.min(34, width * 0.08);
  p.bodyHeight *= zoom;
  p.topY = height * 0.06 + (1 - zoom) * height * 0.2;
  ['shoulderHalf', 'chestHalf', 'waistHalf', 'hipHalf', 'thighHalf', 'calfHalf'].forEach((key) => { p[key] *= depth * zoom; });
  p.headR *= zoom;

  const stageGlow = ctx.createRadialGradient(p.centerX, height * 0.86, 16, p.centerX, height * 0.86, width * 0.32);
  stageGlow.addColorStop(0, hexToRgba(accent, 0.22));
  stageGlow.addColorStop(0.42, hexToRgba(accent, 0.08));
  stageGlow.addColorStop(1, hexToRgba(accent, 0));
  ctx.fillStyle = stageGlow;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(p.centerX, p.topY + p.bodyHeight * 0.34, 20, p.centerX, p.topY + p.bodyHeight * 0.42, width * 0.36);
  glow.addColorStop(0, 'rgba(255,255,255,0.78)');
  glow.addColorStop(0.42, hexToRgba(accent, 0.2));
  glow.addColorStop(1, hexToRgba(accent, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const fill = ctx.createLinearGradient(p.centerX - 90, p.topY, p.centerX + 90, p.topY + p.bodyHeight);
  fill.addColorStop(0, 'rgba(250, 232, 216, 0.96)');
  fill.addColorStop(0.45, 'rgba(255, 253, 248, 0.98)');
  fill.addColorStop(1, 'rgba(184, 200, 226, 0.92)');

  const y0 = p.topY + p.headR * 2.2;
  const y1 = y0 + p.bodyHeight * 0.08;
  const y2 = y0 + p.bodyHeight * 0.18;
  const y3 = y0 + p.bodyHeight * 0.34;
  const y4 = y0 + p.bodyHeight * 0.5;
  const y5 = y0 + p.bodyHeight * 0.64;
  const y6 = y0 + p.bodyHeight * 0.92;
  const left = [
    [p.centerX - p.shoulderHalf * 0.2, y0],
    [p.centerX - p.shoulderHalf, y1],
    [p.centerX - p.chestHalf, y2],
    [p.centerX - p.waistHalf, y3],
    [p.centerX - p.hipHalf, y4],
    [p.centerX - p.thighHalf, y5],
    [p.centerX - p.calfHalf, y6],
  ];
  const right = left.map(([x, y]) => [p.centerX + (p.centerX - x), y]).reverse();

  ctx.save();
  ctx.translate(lean, 0);

  ctx.beginPath();
  ctx.ellipse(p.centerX, p.topY + p.headR + 6, p.headR, p.headR * 1.14, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i < left.length; i += 1) {
    const [prevX, prevY] = left[i - 1];
    const [x, y] = left[i];
    ctx.quadraticCurveTo(prevX, prevY, (prevX + x) / 2, (prevY + y) / 2);
  }
  ctx.bezierCurveTo(p.centerX - p.calfHalf, y6 + 16, p.centerX + p.calfHalf, y6 + 16, right[0][0], right[0][1]);
  for (let i = 1; i < right.length; i += 1) {
    const [prevX, prevY] = right[i - 1];
    const [x, y] = right[i];
    ctx.quadraticCurveTo(prevX, prevY, (prevX + x) / 2, (prevY + y) / 2);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = hexToRgba(accent, 0.28);
  ctx.lineWidth = 1.2;
  ctx.stroke();

  const sideGlow = ctx.createLinearGradient(p.centerX - p.shoulderHalf, y1, p.centerX + p.shoulderHalf, y4);
  sideGlow.addColorStop(0, hexToRgba(accent, 0.08));
  sideGlow.addColorStop(0.5, 'rgba(255,255,255,0.28)');
  sideGlow.addColorStop(1, hexToRgba(accent, 0.16));
  ctx.fillStyle = sideGlow;
  ctx.globalCompositeOperation = 'soft-light';
  ctx.fillRect(p.centerX - p.shoulderHalf * 1.1, y0, p.shoulderHalf * 2.2, y6 - y0);
  ctx.globalCompositeOperation = 'source-over';


  const drawFallbackLandmark = (y, half, alpha) => {
    ctx.save();
    ctx.strokeStyle = hexToRgba(accent, alpha);
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.ellipse(p.centerX, y, Math.max(16, half), Math.max(7, half * 0.16), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  };
  drawFallbackLandmark(y2, p.chestHalf, 0.26);
  drawFallbackLandmark(y3, p.waistHalf, 0.22);
  drawFallbackLandmark(y4, p.hipHalf, 0.24);

  const focusMap = {
    chest: y2,
    waist: y3,
    abdomen: y3 + 20,
    hip: y4,
    thighL: y5,
    thighR: y5,
    calfL: y6 - 30,
    calfR: y6 - 30,
    upperArmL: y2,
    upperArmR: y2,
  };
  const focusY = focusMap[focusField];
  if (focusY) {
    const grad = ctx.createLinearGradient(p.centerX - p.hipHalf * 1.2, focusY, p.centerX + p.hipHalf * 1.2, focusY);
    grad.addColorStop(0, hexToRgba(accent, 0));
    grad.addColorStop(0.42, hexToRgba(accent, 0.24));
    grad.addColorStop(0.5, 'rgba(255,255,255,0.76)');
    grad.addColorStop(0.58, hexToRgba(accent, 0.24));
    grad.addColorStop(1, hexToRgba(accent, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(p.centerX - p.hipHalf * 1.2, focusY - 18, p.hipHalf * 2.4, 36);
  }
  ctx.restore();
}

export function createBodyModelController(canvas, options = {}) {
  const ctx = canvas.getContext('2d');
  const fallbackView = { rotation: 0, zoom: 1, dragging: false, lastX: 0, lastY: 0 };
  const redrawFallback = () => {
    if (!ctx) return;
    drawFallbackFigure(ctx, canvas, options.snapshot, options.focusField || '', options.accentColor || '#6c8fa9', fallbackView);
  };
  const fallback = {
    mode: 'fallback',
    setSnapshot(snapshot) {
      options.snapshot = snapshot;
      redrawFallback();
    },
    setFocusField(field) {
      options.focusField = field || '';
      redrawFallback();
    },
    setAccentColor(color) {
      options.accentColor = color || options.accentColor || '#6c8fa9';
      redrawFallback();
    },
    resetView() {
      fallbackView.rotation = 0;
      fallbackView.zoom = 1;
      redrawFallback();
      options.onViewReset?.();
    },
    dispose() {},
  };

  const onFallbackPointerDown = (event) => {
    fallbackView.dragging = true;
    fallbackView.lastX = event.clientX || 0;
    fallbackView.lastY = event.clientY || 0;
    canvas.setPointerCapture?.(event.pointerId);
  };
  const onFallbackPointerMove = (event) => {
    if (!fallbackView.dragging || proxy.impl !== fallback) return;
    const x = event.clientX || 0;
    const y = event.clientY || 0;
    fallbackView.rotation += (x - fallbackView.lastX) * 0.018;
    fallbackView.zoom = clampNum(fallbackView.zoom + (fallbackView.lastY - y) * 0.0012, 0.78, 1.38);
    fallbackView.lastX = x;
    fallbackView.lastY = y;
    redrawFallback();
  };
  const onFallbackPointerEnd = (event) => {
    fallbackView.dragging = false;
    canvas.releasePointerCapture?.(event.pointerId);
  };
  const onFallbackWheel = (event) => {
    if (proxy.impl !== fallback) return;
    fallbackView.zoom = clampNum(fallbackView.zoom + (event.deltaY < 0 ? 0.05 : -0.05), 0.78, 1.38);
    redrawFallback();
  };
  canvas.addEventListener('pointerdown', onFallbackPointerDown, { passive: true });
  canvas.addEventListener('pointermove', onFallbackPointerMove, { passive: true });
  canvas.addEventListener('pointerup', onFallbackPointerEnd, { passive: true });
  canvas.addEventListener('pointercancel', onFallbackPointerEnd, { passive: true });
  canvas.addEventListener('wheel', onFallbackWheel, { passive: true });
  canvas.addEventListener('dblclick', () => fallback.resetView(), { passive: true });

  const proxy = {
    mode: 'loading',
    impl: fallback,
    setSnapshot(snapshot) {
      options.snapshot = snapshot;
      proxy.impl.setSnapshot(snapshot);
    },
    setFocusField(field) {
      options.focusField = field || '';
      proxy.impl.setFocusField(field);
    },
    setAccentColor(color) {
      options.accentColor = color || options.accentColor || '#6c8fa9';
      proxy.impl.setAccentColor?.(options.accentColor);
    },
    resetView() {
      proxy.impl.resetView();
    },
    dispose() {
      canvas.removeEventListener('pointerdown', onFallbackPointerDown);
      canvas.removeEventListener('pointermove', onFallbackPointerMove);
      canvas.removeEventListener('pointerup', onFallbackPointerEnd);
      canvas.removeEventListener('pointercancel', onFallbackPointerEnd);
      canvas.removeEventListener('wheel', onFallbackWheel);
      proxy.impl.dispose();
    },
    ready: loadRemoteModules().then(({ THREE, OrbitControls }) => {
      const impl = createWebGLBodyScene(canvas, THREE, OrbitControls, options);
      if (!impl) return proxy;
      proxy.impl.dispose?.();
      proxy.impl = impl;
      proxy.mode = impl.mode;
      if (options.snapshot) impl.setSnapshot(options.snapshot);
      if (options.focusField) impl.setFocusField(options.focusField);
      if (options.accentColor) impl.setAccentColor?.(options.accentColor);
      return proxy;
    }).catch((error) => {
      console.warn('[haochijia] WebGL body scene unavailable, fallback canvas used.', error);
      proxy.mode = 'fallback';
      return proxy;
    }),
  };
  if (options.snapshot || ctx) fallback.setSnapshot(options.snapshot || null);
  return proxy;
}
