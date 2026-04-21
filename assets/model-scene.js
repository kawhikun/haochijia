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
    shapeShoulder: clampNum(record.shapeShoulder || 1, 0.8, 1.25),
    shapeWaist: clampNum(record.shapeWaist || 1, 0.8, 1.25),
    shapeHip: clampNum(record.shapeHip || 1, 0.8, 1.25),
    shapeLeg: clampNum(record.shapeLeg || 1, 0.85, 1.2),
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
  const shaped = {
    ...base,
    shoulder: soften('shoulder', 0.78, 0.86, 1.16) * base.shapeShoulder,
    chest: soften('chest', 0.82) * bodySoftMix(1, base.shapeShoulder, 0.18),
    underbust: bodySoftMix(neutral.chest * 0.92, Number(base.underbust || base.chest * 0.92), 0.8),
    waist: soften('waist', 0.74, 0.76, 1.18) * base.shapeWaist,
    abdomen: soften('abdomen', 0.72, 0.76, 1.22) * base.shapeWaist,
    hip: soften('hip', 0.78, 0.8, 1.2) * base.shapeHip,
    neck: soften('neck', 0.8, 0.84, 1.14),
    upperArmL: bodySoftMix(neutral.upperArmL, armAvg, 0.76) * bodySoftMix(1, base.shapeShoulder, 0.18),
    upperArmR: bodySoftMix(neutral.upperArmR, armAvg, 0.76) * bodySoftMix(1, base.shapeShoulder, 0.18),
    forearmL: bodySoftMix(neutral.forearmL, foreAvg, 0.76),
    forearmR: bodySoftMix(neutral.forearmR, foreAvg, 0.76),
    thighL: bodySoftMix(neutral.thighL, thighAvg, 0.8) * bodySoftMix(1, base.shapeHip, 0.14),
    thighR: bodySoftMix(neutral.thighR, thighAvg, 0.8) * bodySoftMix(1, base.shapeHip, 0.14),
    calfL: bodySoftMix(neutral.calfL, calfAvg, 0.8) * bodySoftMix(1, base.shapeLeg, 0.08),
    calfR: bodySoftMix(neutral.calfR, calfAvg, 0.8) * bodySoftMix(1, base.shapeLeg, 0.08),
  };

  const height = clampNum(((shaped.heightCm || 165) / 165) * 2.18, 1.92, 2.42);
  const bodyFatAdj = clampNum(((shaped.bodyFat || 22) - 18) * 0.0018, -0.03, 0.05);
  const headRadius = height * 0.095;
  const bottom = -height * 0.5 + 0.02;
  const yAt = (p) => bottom + height * p;
  const ellipse = (cm, xFactor = 0.00315, zFactor = 0.00248) => ({ x: clampNum((cm || 80) * xFactor, 0.09, 0.42), z: clampNum((cm || 80) * zFactor, 0.08, 0.34) });
  const chest = ellipse(shaped.chest, 0.00328, 0.00266);
  const underbust = ellipse(shaped.underbust || shaped.chest * 0.92, 0.00318, 0.00252);
  const waist = ellipse(shaped.waist, 0.00292, 0.00244 + bodyFatAdj * 0.4);
  const abdomen = ellipse(shaped.abdomen, 0.00302, 0.00264 + bodyFatAdj * 0.55);
  const hip = ellipse(shaped.hip, 0.00322, 0.00282 + bodyFatAdj * 0.18);
  const thighTop = ellipse(averageOf(shaped.thighL, shaped.thighR) || 54, 0.00248, 0.00196);
  const shoulderX = clampNum((shaped.shoulder || 42) * 0.0086, 0.26, 0.45);
  const shoulderZ = clampNum(chest.z + 0.04, 0.16, 0.34);
  const neck = { x: clampNum((shaped.neck || 34) * 0.00328, 0.07, 0.16), z: clampNum((shaped.neck || 34) * 0.00262, 0.06, 0.13) };
  const upperArmRadius = { L: clampNum((averageOf(shaped.upperArmL, shaped.upperArmL) || 28) * 0.00242, 0.05, 0.12), R: clampNum((averageOf(shaped.upperArmR, shaped.upperArmR) || 28) * 0.00242, 0.05, 0.12) };
  const forearmRadius = { L: clampNum((averageOf(shaped.forearmL, shaped.forearmL) || 24) * 0.00218, 0.042, 0.094), R: clampNum((averageOf(shaped.forearmR, shaped.forearmR) || 24) * 0.00218, 0.042, 0.094) };
  const thighRadius = { L: clampNum((averageOf(shaped.thighL, shaped.thighL) || 54) * 0.00258, 0.1, 0.2), R: clampNum((averageOf(shaped.thighR, shaped.thighR) || 54) * 0.00258, 0.1, 0.2) };
  const calfRadius = { L: clampNum((averageOf(shaped.calfL, shaped.calfL) || 36) * 0.00238, 0.07, 0.14), R: clampNum((averageOf(shaped.calfR, shaped.calfR) || 36) * 0.00238, 0.07, 0.14) };
  const legScale = shaped.shapeLeg || 1;
  const upperArmLength = height * 0.24;
  const forearmLength = height * 0.21;
  const thighLength = height * 0.28 * legScale;
  const calfLength = height * 0.27 * legScale;
  const thighCenterY = yAt(0.27 - (legScale - 1) * 0.05);
  const calfCenterY = yAt(0.1 - (legScale - 1) * 0.08);
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
    thighL: thighCenterY,
    thighR: thighCenterY,
    calfL: calfCenterY,
    calfR: calfCenterY,
    weightKg: yAt(0.55),
  };
  const haloRadiusMap = {
    chest: (torsoRings[2]?.x || 0.18) * 2.2,
    waist: (torsoRings[4]?.x || 0.16) * 2.45,
    abdomen: (torsoRings[5]?.x || 0.17) * 2.56,
    hip: (torsoRings[6]?.x || 0.18) * 2.45,
    upperArmL: upperArmRadius.L * 2.7,
    upperArmR: upperArmRadius.R * 2.7,
    forearmL: forearmRadius.L * 2.7,
    forearmR: forearmRadius.R * 2.7,
    thighL: thighRadius.L * 2.34,
    thighR: thighRadius.R * 2.34,
    calfL: calfRadius.L * 2.42,
    calfR: calfRadius.R * 2.42,
    weightKg: (torsoRings[4]?.x || 0.16) * 2.7,
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
    thighCenterY,
    calfCenterY,
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
        roughness: 0.82,
        metalness: 0.01,
        clearcoat: 0.06,
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
      roughness: perf.reduced ? 0.56 : 0.48,
      metalness: 0.01,
      clearcoat: perf.reduced ? 0.18 : 0.3,
      clearcoatRoughness: perf.reduced ? 0.44 : 0.36,
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
  [
    buildTorsoSegmentMesh(THREE, rings.slice(0, 4), torsoChestMat.material),
    buildTorsoSegmentMesh(THREE, rings.slice(3, 6), torsoMidMat.material),
    buildTorsoSegmentMesh(THREE, rings.slice(5, 8), torsoHipMat.material),
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
  head.scale.set(1, 1.12, 0.98);
  head.position.y = dims.headCenterY;
  head.castShadow = !ghost;
  group.add(head);
  collectHeatMat(group, headMat);

  addLimbSet(THREE, group, dims, ghost, 'L', armLMat, foreLMat, thighLMat, calfLMat);
  addLimbSet(THREE, group, dims, ghost, 'R', armRMat, foreRMat, thighRMat, calfRMat);
  return group;
}

function createWebGLBodyScene(canvas, THREE, OrbitControls, options) {
  const perf = perfProfile();
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !perf.reduced, alpha: true, powerPreference: 'high-performance' });
  } catch (error) {
    console.error(error);
    return null;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = perf.reduced ? 1.04 : 1.1;
  renderer.shadowMap.enabled = perf.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a1323, 5.2, 11.6);

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 30);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 2.8;
  controls.maxDistance = 6.2;
  controls.minPolarAngle = 0.98;
  controls.maxPolarAngle = 2.04;
  controls.target.set(0, 0.14, 0);
  controls.zoomSpeed = 1;
  controls.rotateSpeed = 0.9;

  const hemi = new THREE.HemisphereLight(0xf2f6ff, 0x112038, perf.reduced ? 1.4 : 1.56);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffffff, perf.reduced ? 1.7 : 2.0);
  key.position.set(3.6, 5.0, 4.0);
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
  const rim = new THREE.DirectionalLight(0x8fa8ff, perf.reduced ? 0.78 : 1.02);
  rim.position.set(-4.0, 3.1, -4.1);
  scene.add(rim);
  const fill = new THREE.PointLight(0xe8f2ff, perf.reduced ? 0.8 : 1.02, 12, 2);
  fill.position.set(0, 1.7, 2.4);
  scene.add(fill);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(2.22, perf.reduced ? 44 : 72),
    new THREE.ShadowMaterial({ transparent: true, opacity: perf.reduced ? 0.16 : 0.22, color: 0x7f9be0 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.2;
  floor.receiveShadow = perf.shadows;
  scene.add(floor);

  const glowRing = new THREE.Mesh(
    new THREE.RingGeometry(1.14, 1.96, perf.reduced ? 40 : 72),
    new THREE.MeshBasicMaterial({ color: 0x8aa7ff, transparent: true, opacity: perf.reduced ? 0.08 : 0.15, side: THREE.DoubleSide })
  );
  glowRing.rotation.x = -Math.PI / 2;
  glowRing.position.y = -1.17;
  glowRing.visible = !perf.reduced;
  scene.add(glowRing);

  const focusHalo = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.015, 12, perf.reduced ? 40 : 80),
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
    const radius = perf.reduced ? 4.05 : 4.22;
    const rad = (angle || 0) * Math.PI / 180;
    camera.position.set(Math.sin(rad) * radius, 1.32, Math.cos(rad) * radius);
    controls.target.set(0, 0.16, 0);
    controls.update();
  }

  function updateFocus(snapshot) {
    const dims = buildBodyMeshDims(snapshot?.current);
    const yMap = dims?.focusY || {};
    const targetY = yMap[focusField] ?? 0.02;
    focusHalo.position.set(0, targetY, 0);
    focusHalo.scale.setScalar((dims?.haloRadiusMap?.[focusField] || 1) * 1.02);
    focusHalo.material.opacity = focusField ? (perf.reduced ? 0.12 : 0.18) : 0.02;
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
    if (!perf.reduced && glowRing.visible) glowRing.material.opacity = 0.14 + Math.sin(time / 950) * 0.025;
    focusHalo.material.opacity = focusField ? ((perf.reduced ? 0.1 : 0.14) + Math.sin(time / 220) * (perf.reduced ? 0.02 : 0.05)) : 0.02;
    if (currentGroup && !perf.reduced) {
      currentGroup.position.y = Math.sin(time / 980) * 0.01;
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
  alignCamera(0);
  requestAnimationFrame(animate);

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
    resetView() {
      alignCamera(0);
      options.onViewReset?.();
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

  let touchCount = 0;
  let pressTimer = null;
  let lastTap = 0;
  canvas.addEventListener('pointerdown', (event) => {
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
  const centerX = width * 0.5;
  const topY = height * 0.06;
  const bodyHeight = height * 0.84;
  return {
    centerX,
    topY,
    bodyHeight,
    headR: clampNum((body.neck || 34) * 0.38, 12, 28),
    shoulderHalf: clampNum((body.shoulder || 42) * 1.1, 28, 76),
    chestHalf: clampNum((body.chest || 90) * 0.54, 26, 66),
    waistHalf: clampNum((body.waist || 75) * 0.46, 22, 58),
    hipHalf: clampNum((body.hip || 95) * 0.5, 26, 70),
    thighHalf: clampNum((averageOf(body.thighL, body.thighR) || 54) * 0.31, 14, 34),
    calfHalf: clampNum((averageOf(body.calfL, body.calfR) || 36) * 0.28, 11, 26),
  };
}

function drawFallbackFigure(ctx, canvas, snapshot, focusField) {
  const dpr = Math.max(window.devicePixelRatio || 1, 1);
  const width = canvas.clientWidth || canvas.width;
  const height = canvas.clientHeight || canvas.height;
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const bg = ctx.createLinearGradient(0, 0, 0, height);
  bg.addColorStop(0, 'rgba(8,16,34,0.96)');
  bg.addColorStop(1, 'rgba(14,27,49,0.88)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  if (!snapshot?.current) return;
  const p = fallbackFigureProfile(snapshot.current, width, height);
  const glow = ctx.createRadialGradient(p.centerX, p.topY + p.bodyHeight * 0.34, 20, p.centerX, p.topY + p.bodyHeight * 0.4, width * 0.34);
  glow.addColorStop(0, 'rgba(255,255,255,0.8)');
  glow.addColorStop(0.45, 'rgba(95,138,255,0.24)');
  glow.addColorStop(1, 'rgba(95,138,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  const fill = ctx.createLinearGradient(p.centerX - 90, p.topY, p.centerX + 90, p.topY + p.bodyHeight);
  fill.addColorStop(0, 'rgba(193,213,255,0.95)');
  fill.addColorStop(0.45, 'rgba(250,252,255,0.98)');
  fill.addColorStop(1, 'rgba(145,180,255,0.92)');

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
  ctx.ellipse(p.centerX, p.topY + p.headR + 6, p.headR, p.headR * 1.12, 0, 0, Math.PI * 2);
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
  ctx.strokeStyle = 'rgba(173,196,255,0.26)';
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
    grad.addColorStop(0, 'rgba(139,172,255,0)');
    grad.addColorStop(0.45, 'rgba(255,255,255,0.72)');
    grad.addColorStop(0.55, 'rgba(255,255,255,0.72)');
    grad.addColorStop(1, 'rgba(139,172,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(p.centerX - p.hipHalf * 1.2, focusY - 16, p.hipHalf * 2.4, 32);
  }
}

export function createBodyModelController(canvas, options = {}) {
  const ctx = canvas.getContext('2d');
  const fallback = {
    mode: 'fallback',
    setSnapshot(snapshot) {
      drawFallbackFigure(ctx, canvas, snapshot, options.focusField || '');
    },
    setFocusField(field) {
      options.focusField = field || '';
      if (options.snapshot) drawFallbackFigure(ctx, canvas, options.snapshot, options.focusField);
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
      return proxy;
    }).catch((error) => {
      console.warn('[haochijia] WebGL body scene unavailable, fallback canvas used.', error);
      proxy.mode = 'fallback';
      return proxy;
    }),
  };
  if (options.snapshot) fallback.setSnapshot(options.snapshot);
  return proxy;
}
