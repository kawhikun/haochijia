let remoteModulesPromise = null;

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

function loadRemoteModules() {
  if (!remoteModulesPromise) {
    remoteModulesPromise = Promise.all([
      import('https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js'),
      import('https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js'),
    ]).then(([THREE, controls]) => ({ THREE, OrbitControls: controls.OrbitControls }));
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
    color: 0xf7fbff,
    emissive: 0x8eabff,
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
  const headRadius = height * 0.095;
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
    headCenterY: yAt(0.92),
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
      roughness: perf.reduced ? 0.46 : 0.36,
      metalness: 0.02,
      clearcoat: perf.reduced ? 0.26 : 0.46,
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

  const head = new THREE.Mesh(new THREE.SphereGeometry(dims.headRadius, 32, 28), headMat.material);
  head.scale.set(1, 1.14, 1.02);
  head.position.set(0, dims.headCenterY, 0.01);
  head.castShadow = !ghost;
  group.add(head);
  collectHeatMat(group, headMat);

  addLimbSet(THREE, group, dims, ghost, 'L', armLMat, foreLMat, thighLMat, calfLMat);
  addLimbSet(THREE, group, dims, ghost, 'R', armRMat, foreRMat, thighRMat, calfRMat);
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
  renderer.toneMappingExposure = perf.reduced ? 1.08 : 1.18;
  renderer.shadowMap.enabled = perf.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearAlpha(0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(isIOS ? 0x151a2f : isAndroid ? 0x132132 : 0x101626, 5.1, isAndroid ? 12.6 : 11.8);

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
  controls.autoRotateSpeed = isIOS ? 0.44 : isAndroid ? 0.54 : 0.48;

  const white = new THREE.Color(0xffffff);
  const deepSlate = new THREE.Color(0x101626);

  const hemi = new THREE.HemisphereLight(isIOS ? 0xf4e6f1 : isAndroid ? 0xeaf7f0 : 0xf7f1ec, isIOS ? 0x1a2440 : 0x182436, perf.reduced ? 1.34 : (isIOS ? 1.62 : isAndroid ? 1.58 : 1.54));
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
    if (floor.material.color) floor.material.color.copy(softAccent.clone().lerp(new THREE.Color(0x2d3548), 0.36));
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
    const radius = perf.reduced ? (isIOS ? 3.94 : 4.02) : (isIOS ? 4.06 : isAndroid ? 4.26 : 4.2);
    const cameraY = isIOS ? 1.4 : isAndroid ? 1.3 : 1.34;
    const targetY = isIOS ? 0.2 : isAndroid ? 0.14 : 0.16;
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
    currentGroup = buildWebglBodyGroup(THREE, snapshot.current, snapshot.previous, false);
    scene.add(currentGroup);
    if (snapshot.previous && options.overlay !== false) {
      ghostGroup = buildWebglBodyGroup(THREE, snapshot.previous, null, true);
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
    headR: clampNum((body.neck || 34) * 0.38, 12, 28),
    shoulderHalf: clampNum((body.shoulder || 42) * 1.1 * bodySoftMix(1, body.shapeShoulder || 1, 0.82), 28, 80),
    chestHalf: clampNum((body.chest || 90) * 0.54 * chestScale, 26, 68),
    waistHalf: clampNum((body.waist || 75) * 0.46 * waistScale, 22, 58),
    hipHalf: clampNum((body.hip || 95) * 0.5 * hipScale, 26, 72),
    thighHalf: clampNum((averageOf(body.thighL, body.thighR) || 54) * 0.31 * legScale, 14, 36),
    calfHalf: clampNum((averageOf(body.calfL, body.calfR) || 36) * 0.28 * legScale, 11, 26),
  };
}

function drawFallbackFigure(ctx, canvas, snapshot, focusField, accentColor = '#6c8fa9') {
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
  bg.addColorStop(0, 'rgba(27, 20, 38, 0.96)');
  bg.addColorStop(0.52, 'rgba(23, 33, 48, 0.92)');
  bg.addColorStop(1, 'rgba(11, 19, 31, 0.9)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  if (!snapshot?.current) return;
  const p = fallbackFigureProfile(snapshot.current, width, height);

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
  fill.addColorStop(0, 'rgba(238, 218, 202, 0.94)');
  fill.addColorStop(0.45, 'rgba(250, 252, 255, 0.98)');
  fill.addColorStop(1, 'rgba(153, 196, 207, 0.9)');

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
}

export function createBodyModelController(canvas, options = {}) {
  const ctx = canvas.getContext('2d');
  const redrawFallback = () => {
    if (!ctx) return;
    drawFallbackFigure(ctx, canvas, options.snapshot, options.focusField || '', options.accentColor || '#6c8fa9');
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
      options.onViewReset?.();
    },
    dispose() {},
  };

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
