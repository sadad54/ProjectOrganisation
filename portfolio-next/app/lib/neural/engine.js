/* =========================================================================
   NEURAL FIELD ENGINE — one WebGL context for the whole site.
   Particles live on the GPU with a position per formation (formations.js);
   the vertex shader blends between them, advects network particles along
   their synapses, and handles the pointer (a ray, not a 2-D point — the
   field is 3-D) and click shockwaves. The CPU writes a handful of uniforms
   per frame and never touches a vertex after init.
   ========================================================================= */
import * as THREE from 'three';
import { buildFormations, LOOKS, LAST } from './formations';
import { PALETTE, unit } from '../palette';

const VERT = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uStagger;
uniform float uDim;
uniform float uPx;
uniform vec3 uRayO;
uniform vec3 uRayD;
uniform float uHover;
uniform vec3 uShockO;
uniform float uShockT;
uniform float uVel;
uniform float uFace;
attribute vec4 aP;
attribute vec3 aA2;
attribute vec3 aB;
attribute vec3 aC;
attribute vec3 aD;
attribute vec3 aE;
attribute vec3 aG;
attribute vec3 aI;
attribute vec3 aJ;
attribute vec4 aFH;
attribute vec4 aH0;
attribute vec4 aH1;
attribute vec4 aR;
varying float vHeat;
varying float vAlpha;
varying vec2 vDir;
varying float vDash;

vec3 pSky;

vec3 formation(float k, vec3 pNet){
  if (k < 0.5) return pNet;
  // slots follow the page order (formations.js keeps the build order)
  if (k < 1.5) return aE;
  if (k < 2.5) return aB;
  if (k < 3.5) return aD;
  if (k < 4.5) return aG;
  if (k < 5.5) return aC;
  if (k < 6.5) return aI;
  if (k < 7.5) return pNet;
  if (k < 8.5) return pSky;
  return pNet;
}
float heatOf(float k){
  if (k < 0.5) return aH0.x;
  if (k < 1.5) return aFH.z;
  if (k < 2.5) return aH0.y;
  if (k < 3.5) return aH0.w;
  if (k < 4.5) return aFH.w;
  if (k < 5.5) return aH0.z;
  if (k < 6.5) return aH1.x;
  if (k < 7.5) return aH0.x;
  if (k < 8.5) return aH1.y;
  return aH0.x;
}

void main(){
  float ph = fract(aFH.x + uTime * aFH.y);
  vec3 pNet = mix(position, aA2, ph);

  // the night sky: every particle rides an orbit; a radius above 8 is a wind
  // band (a slice of a huge circle) whose angle wraps instead of turning
  float orad = abs(aH1.z);
  float odir = aH1.z < 0.0 ? -1.0 : 1.0;
  float oth = orad > 8.0
    ? 1.5708 + (fract(aH1.w + odir * uTime * 0.007 * (0.6 + aR.w)) - 0.5) * 1.5
    : aH1.w + odir * uTime * 0.3 / (0.3 + orad);
  pSky = vec3(aJ.x + orad * cos(oth), aJ.y + orad * sin(oth), aJ.z);
  vDir = vec2(-sin(oth), cos(oth));

  float m = clamp(uMorph + (aR.z - 0.5) * uStagger, 0.0, 9.0);
  float k0 = floor(m);
  float k1 = min(k0 + 1.0, 9.0);
  float f = fract(m);
  float e = f * f * (3.0 - 2.0 * f);
  e = e * e * (3.0 - 2.0 * e);

  vec3 p = mix(formation(k0, pNet), formation(k1, pNet), e);
  float heat = mix(heatOf(k0), heatOf(k1), e);

  // mid-flight swirl: particles leave one shape and arc into the next
  float transit = sin(3.14159265 * e);
  vec3 sw = vec3(
    sin(p.y * 1.3 + uTime * 0.7 + aR.x * 6.2831),
    cos(p.x * 1.1 - uTime * 0.6 + aR.x * 4.0),
    sin(p.x * 0.8 + p.y * 0.9 + uTime * 0.5)
  );
  p += sw * transit * (0.45 + aR.w * 0.7);

  // breathing
  p += 0.03 * vec3(sin(uTime * 0.9 + aR.x * 40.0), cos(uTime * 0.7 + aR.x * 31.0), sin(uTime * 0.8 + aR.x * 23.0));

  // scroll velocity smears the field vertically, like a long exposure
  p.y += uVel * (aR.w - 0.5) * 0.9;

  vec4 wp = modelMatrix * vec4(p, 1.0);

  // the opening: every particle also has a place in a portrait (world space,
  // sampled from the hero photo). uFace 1 → 0 lets them go, each on its own
  // delay, arcing out to wherever the page wants them.
  float fk = clamp(uFace * 1.7 - aR.z * 0.7, 0.0, 1.0);
  fk = fk * fk * (3.0 - 2.0 * fk);
  vec3 arc = vec3(sin(aR.x * 37.0 + uTime), cos(aR.x * 23.0 - uTime * 0.7), sin(aR.x * 51.0)) * sin(3.14159265 * fk) * (0.5 + aR.w);
  wp.xyz = mix(wp.xyz, aP.xyz, fk) + arc;
  heat = mix(heat, aP.w, fk);

  // the pointer is a query ray: nearby neurons move aside and light up
  vec3 v = wp.xyz - uRayO;
  vec3 c = uRayO + uRayD * dot(v, uRayD);
  vec3 away = wp.xyz - c;
  float d = length(away);
  float fall = exp(-d * d / 0.42) * uHover;
  wp.xyz += normalize(away + vec3(1e-4)) * fall * 0.42;

  // click: a shockwave rolls outward from the hit point
  float sd = length(wp.xyz - uShockO);
  float ring = sd - uShockT * 7.0;
  float wave = exp(-ring * ring * 3.0) * max(0.0, 1.0 - uShockT);
  wp.xyz += normalize(wp.xyz - uShockO + vec3(1e-4)) * wave * 0.32;

  vec4 mv = viewMatrix * wp;
  gl_Position = projectionMatrix * mv;

  float hot = clamp(heat + fall * 0.85 + wave * 1.1, 0.0, 1.0);
  vHeat = hot;
  float tw = 0.78 + 0.22 * sin(uTime * 2.1 + aR.x * 50.0);
  vAlpha = (0.42 + 0.58 * hot) * tw * uDim;
  // per-particle size only means something in the network (somas, pulses);
  // every other formation uses an even, slightly randomised dot
  float netW = clamp(max(0.0, 1.0 - m * 1.6) + max(0.0, 1.0 - abs(m - 7.0) * 1.6) + max(0.0, 1.0 - (9.0 - m) * 1.6), 0.0, 1.0);
  float size = mix(0.95 + aR.x * 0.55, aR.y, netW);
  size *= 1.0 + clamp(1.0 - abs(m - 4.0), 0.0, 1.0) * 1.1;
  // the brain's folds are fine lines: a slightly heavier point holds them
  size *= 1.0 + clamp(1.0 - abs(m - 6.0), 0.0, 1.0) * 0.3;
  // in the sky each point stretches into a stroke laid along its orbit
  vDash = clamp(1.0 - abs(m - 8.0) * 1.5, 0.0, 1.0);
  size *= 1.0 + vDash * (1.9 + aR.x * 1.6);
  size = mix(size, 1.15 + aR.x * 0.35, fk);
  gl_PointSize = uPx * size * (1.0 + hot * 0.8) * (10.0 / -mv.z);
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uCool;
uniform vec3 uEmber;
uniform vec3 uWhite;
uniform vec3 uSun;
varying float vHeat;
varying float vAlpha;
varying vec2 vDir;
varying float vDash;
void main(){
  vec2 q = gl_PointCoord - 0.5;
  q.y = -q.y;
  // a round point, or (in the sky) a dash: squeeze the axis across the stroke
  float along = dot(q, vDir);
  float across = dot(q, vec2(-vDir.y, vDir.x));
  float r = length(vec2(along, across * mix(1.0, 4.6, vDash)));
  if (r > 0.5) discard;
  float halo = pow(smoothstep(0.5, 0.0, r), mix(2.2, 1.2, vDash));
  float dotc = smoothstep(0.2, 0.0, r);
  float core = halo * 0.72 + dotc * 0.6;
  // the sky's lit strokes are painted yellow, not ember
  vec3 col = mix(uCool, mix(uEmber, uSun, vDash), smoothstep(0.3, 0.85, vHeat));
  col = mix(col, uWhite, smoothstep(0.9, 1.0, vHeat) * dotc * 0.55);
  float a = core * vAlpha;
  // premultiplied, summed with ONE/ONE blending: true additive light over
  // whatever the page paints behind the (transparent) canvas
  gl_FragColor = vec4(col * a, a);
}
`;

const LINE_VERT = /* glsl */ `
attribute float aW;
varying float vW;
void main(){
  vW = aW;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const LINE_FRAG = /* glsl */ `
precision highp float;
uniform float uA;
uniform float uHotLo;
uniform float uBase;
uniform float uGain;
uniform vec3 uCool;
uniform vec3 uEmber;
varying float vW;
void main(){
  // weight → colour and strength: most lines faint, the heavy ones run hot
  vec3 c = mix(uCool, uEmber, smoothstep(uHotLo, 1.0, vW));
  float a = uA * (uBase + uGain * vW * vW);
  gl_FragColor = vec4(c * a, a);
}
`;

/* Glass pass. The field renders offscreen, then one full-screen quad looks
   at it through a sheet of fluted (reeded) glass: every vertical flute is a
   half-cylinder lens, so the sample shifts sideways with the slope of the
   lens profile — a compressed, repeated image near each edge, true near the
   centre. R/G/B shift by slightly different amounts (dispersion), and a
   soft aurora sits behind the particles so the flutes have something
   blurred to bend; points alone just double. uGlass (0..1) scales the whole
   effect and follows the page's data-field-dim. */
const GLASS_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;
const GLASS_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uFlutes;
uniform float uGlass;
uniform float uTime;
uniform float uAspect;
uniform float uWarmK;
uniform float uCoolK;
uniform vec3 uCool;
uniform vec3 uEmber;
uniform vec3 uWhite;
varying vec2 vUv;

vec4 aurora(vec2 uv){
  // a blue column falling from the top, hottest just right of centre (the
  // type pocket is on the left), with a cantaloupe core pooling at the base
  float cx = 0.6 + 0.02 * sin(uTime * 0.11);
  // never narrower than square, or a portrait phone becomes one blue slab
  float dx = (uv.x - cx) * max(uAspect, 1.0);
  float breathe = 0.92 + 0.08 * sin(uTime * 0.37);
  float column = exp(-dx * dx / 0.22) * smoothstep(-0.1, 1.0, uv.y);
  float wash = exp(-dx * dx / 1.4) * 0.35;
  float cy = uv.y - 0.1;
  float core = exp(-dx * dx / 0.07) * exp(-cy * cy / 0.035);
  // uCoolK / uWarmK: the time of day in Kuala Lumpur (see lib/daylight.js)
  float b = (column * 0.6 + wash * 0.22) * breathe * uCoolK;
  float w = core * 0.5 * breathe * uWarmK;
  vec3 col = uCool * b + uEmber * w;
  return vec4(col, max(b, w));
}

void main(){
  float f = fract(vUv.x * uFlutes);
  float c = f * 2.0 - 1.0;
  // slope of a half-cylinder profile, clamped so the edges stay legible
  float slope = c / sqrt(max(1.0 - c * c * 0.9, 0.1));
  float off = slope * 0.27 * uGlass / uFlutes;

  vec2 uvG = vec2(vUv.x + off, vUv.y);
  vec4 sG = texture2D(uTex, uvG);
  float r = texture2D(uTex, vec2(vUv.x + off * 1.12, vUv.y)).r;
  float b = texture2D(uTex, vec2(vUv.x + off * 0.88, vUv.y)).b;
  vec3 col = vec3(r, sG.g, b);
  float a = sG.a;

  // the aurora is refracted too — that is what draws the vertical streaks
  vec4 glow = aurora(uvG) * uGlass;
  // each flute darkens toward one edge and catches light on the other
  float lum = dot(glow.rgb + col, vec3(0.3, 0.59, 0.11));
  float shade = 1.0 - 0.105 * uGlass * smoothstep(0.2, 1.0, -c);
  float ridge = smoothstep(0.9, 1.0, f) * (0.0035 + lum * 0.26) * uGlass;

  col = (col + glow.rgb) * shade + uWhite * ridge;
  a = clamp(a + glow.a + ridge, 0.0, 1.0);
  gl_FragColor = vec4(col, a);
}
`;

const lerp = (a, b, t) => a + (b - a) * t;

// world x for a staging entry: its own, or (with `fx`) a fraction of the
// half-width of the view at that depth
let anchorX = null; // set by the page (data-field-x): overrides a staging entry's own fx
let baseZ = 10; // the camera's resting distance (it dollies in during a morph)
const offX = (l, cam) => (l.fx == null ? l.off[0] : (anchorX ?? l.fx) * (baseZ - l.off[2]) * 0.36397 * cam.aspect);

function lookAt(m, cam) {
  // interpolate the staging table at fractional formation index m
  const k0 = Math.max(0, Math.min(LAST, Math.floor(m)));
  const k1 = Math.min(LAST, k0 + 1);
  let t = m - k0;
  t = t * t * (3 - 2 * t);
  const a = LOOKS[k0],
    b = LOOKS[k1];
  return {
    off: [lerp(offX(a, cam), offX(b, cam), t), lerp(a.off[1], b.off[1], t), lerp(a.off[2], b.off[2], t)],
    spin: lerp(a.spin, b.spin, t),
    follow: lerp(a.follow, b.follow, t),
    dim: lerp(a.dim, b.dim, t),
    glass: lerp(a.glass ?? 1, b.glass ?? 1, t),
  };
}

export function createNeuralField(canvas, { reduced = false } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: 'high-performance',
    });
  } catch (e) {
    return null;
  }
  if (!renderer || !renderer.getContext()) return null;

  const small = Math.min(window.innerWidth, window.innerHeight) < 700 || navigator.hardwareConcurrency <= 4;
  const N = small ? 8000 : 16000;
  let dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
  camera.position.set(0, 0, 10);

  const F = buildFormations(N);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(F.A, 3));
  geo.setAttribute('aA2', new THREE.BufferAttribute(F.A2, 3));
  geo.setAttribute('aB', new THREE.BufferAttribute(F.B, 3));
  geo.setAttribute('aC', new THREE.BufferAttribute(F.C, 3));
  geo.setAttribute('aD', new THREE.BufferAttribute(F.D, 3));
  geo.setAttribute('aE', new THREE.BufferAttribute(F.E, 3));
  geo.setAttribute('aG', new THREE.BufferAttribute(F.G, 3));
  geo.setAttribute('aI', new THREE.BufferAttribute(F.I, 3));
  geo.setAttribute('aJ', new THREE.BufferAttribute(F.J, 3));
  geo.setAttribute('aH1', new THREE.BufferAttribute(F.H1, 4));
  geo.setAttribute('aFH', new THREE.BufferAttribute(F.FH, 4));
  geo.setAttribute('aH0', new THREE.BufferAttribute(F.H0, 4));
  geo.setAttribute('aR', new THREE.BufferAttribute(F.R, 4));
  const faceAttr = new THREE.BufferAttribute(new Float32Array(N * 4), 4);
  geo.setAttribute('aP', faceAttr);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 30);

  const uniforms = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uStagger: { value: 0.55 },
    uDim: { value: 1 },
    uPx: { value: 3.1 * dpr },
    uRayO: { value: new THREE.Vector3(0, 0, 10) },
    uRayD: { value: new THREE.Vector3(0, 0, -1) },
    uHover: { value: 0 },
    uShockO: { value: new THREE.Vector3(0, 0, 0) },
    uShockT: { value: 1 },
    uVel: { value: 0 },
    uFace: { value: 0 },
    uCool: { value: new THREE.Color(...unit(PALETTE.cool)) },
    uEmber: { value: new THREE.Color(...unit(PALETTE.signal)) },
    uWhite: { value: new THREE.Color(1, 0.97, 0.9) },
    uSun: { value: new THREE.Color(...unit(PALETTE.sun)) },
  };
  const mat = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneFactor,
  });
  const points = new THREE.Points(geo, mat);
  const group = new THREE.Group();

  // Line passes. 1px strokes read where 2px points only read as dust:
  // the network's synapses, and the loss landscape's wireframe.
  const lineSets = [];
  function makeLines(pos, w, { hotLo, base, gain }) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aW', new THREE.BufferAttribute(w, 1));
    const u = {
      uA: { value: 0 },
      uHotLo: { value: hotLo },
      uBase: { value: base },
      uGain: { value: gain },
      uCool: uniforms.uCool,
      uEmber: uniforms.uEmber,
    };
    const m = new THREE.ShaderMaterial({
      vertexShader: LINE_VERT,
      fragmentShader: LINE_FRAG,
      uniforms: u,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendSrcAlpha: THREE.OneFactor,
      blendDstAlpha: THREE.OneFactor,
    });
    const obj = new THREE.LineSegments(g, m);
    lineSets.push({ g, m, u });
    group.add(obj);
    return u;
  }
  const synapseU = makeLines(F.LINES, F.LINEW, { hotLo: 0.88, base: 0.05, gain: 0.3 });
  const landU = makeLines(F.LAND, F.LANDW, { hotLo: 0.7, base: 0.07, gain: 0.26 });
  const brainU = makeLines(F.BRAIN, F.BRAINW, { hotLo: 0.6, base: 0.1, gain: 0.5 });
  group.add(points);
  scene.add(group);

  // the field draws into this, the glass pass draws it to the screen
  const target = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false });
  const glassU = {
    uTex: { value: target.texture },
    uFlutes: { value: 40 },
    uGlass: { value: 1 },
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uWarmK: { value: 1 },
    uCoolK: { value: 1 },
    uCool: uniforms.uCool,
    uEmber: uniforms.uEmber,
    uWhite: uniforms.uWhite,
  };
  const glassMat = new THREE.ShaderMaterial({
    vertexShader: GLASS_VERT,
    fragmentShader: GLASS_FRAG,
    uniforms: glassU,
    depthWrite: false,
    depthTest: false,
    blending: THREE.NoBlending,
  });
  const glassGeo = new THREE.PlaneGeometry(2, 2);
  const glassScene = new THREE.Scene();
  glassScene.add(new THREE.Mesh(glassGeo, glassMat));
  const glassCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  // flute width in CSS px: wider on small screens so the image survives
  const fluteW = small ? 38 : 26;

  // each line set belongs to its formation(s) and fades with distance to it
  const near = (m, k) => Math.max(0, 1 - Math.abs(m - k) * 1.8);
  const synapseAlpha = (m) => near(m, 0) + near(m, 7) + near(m, LAST);
  const landAlpha = (m) => near(m, 3);
  const brainAlpha = (m) => near(m, 6);

  // ---- state ----
  const S = {
    face: 0, // 1 = particles hold the portrait, 0 = released
    faceFrom: 0,
    faceTo: 0,
    faceT0: 0,
    faceMs: 0,
    baseZ: 10,
    dolly: 0,
    lastMorph: 0,
    target: 0, // formation index the page asks for
    morph: 0,
    dimMul: 1, // page-level dimming (e.g. behind the work console)
    dimTarget: 1,
    mx: 0,
    my: 0,
    ex: 0,
    ey: 0,
    hover: 0,
    hoverTarget: 0,
    lastMove: 0,
    shockT: 1,
    vel: 0,
    velTarget: 0,
    t: 0,
    running: false,
    raf: 0,
    last: performance.now(),
    rotY: 0,
    frames: 0,
    slowFrames: 0,
    degraded: false,
  };

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(h, 1);
    // keep the formations' horizontal extent on narrow screens
    S.baseZ = camera.aspect < 1 ? 10 + (1 - camera.aspect) * 9 : 10;
    camera.position.z = S.baseZ - S.dolly;
    camera.updateProjectionMatrix();
    target.setSize(Math.round(w * dpr), Math.round(h * dpr));
    glassU.uFlutes.value = w / fluteW;
    glassU.uAspect.value = camera.aspect;
  }
  resize();

  const ndc = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  function updateRay() {
    ndc.set(S.ex, -S.ey);
    ray.setFromCamera(ndc, camera);
    uniforms.uRayO.value.copy(ray.ray.origin);
    uniforms.uRayD.value.copy(ray.ray.direction);
  }

  function render() {
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(glassScene, glassCam);
  }

  function frame(now) {
    if (!S.running) return;
    const dt = Math.min(0.05, (now - S.last) / 1000);
    S.last = now;
    S.t += dt;

    // follow the page, critically damped
    S.morph += (S.target - S.morph) * (1 - Math.exp(-dt * 3.2));
    if (Math.abs(S.target - S.morph) < 0.0005) S.morph = S.target;
    S.dimMul += (S.dimTarget - S.dimMul) * (1 - Math.exp(-dt * 3));

    // the portrait's release runs on its own clock
    if (S.faceMs > 0) {
      const u = Math.min(1, (now - S.faceT0) / S.faceMs);
      const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      S.face = S.faceFrom + (S.faceTo - S.faceFrom) * e;
      if (u >= 1) S.faceMs = 0;
    }
    uniforms.uFace.value = S.face;

    // a morph is also a camera move: push in while the particles travel,
    // settle back as they land
    const speed = Math.abs(S.morph - S.lastMorph) / Math.max(dt, 1e-3);
    S.lastMorph = S.morph;
    S.dolly += (Math.min(1, speed * 0.55) * 1.25 - S.dolly) * (1 - Math.exp(-dt * 2.6));
    baseZ = S.baseZ;
    camera.position.z = S.baseZ - S.dolly;

    const look = lookAt(S.morph, camera);
    S.ex += (S.mx - S.ex) * (1 - Math.exp(-dt * 5));
    S.ey += (S.my - S.ey) * (1 - Math.exp(-dt * 5));
    if (now - S.lastMove > 2400) S.hoverTarget = 0;
    S.hover += (S.hoverTarget - S.hover) * (1 - Math.exp(-dt * 4));

    S.rotY += dt * 0.05 * look.spin;
    group.rotation.y = Math.sin(S.rotY) * 0.5 * look.spin + S.ex * 0.32 * look.follow;
    group.rotation.x = -0.08 + S.ey * 0.16 * look.follow;
    group.position.set(look.off[0], look.off[1], look.off[2]);
    group.updateMatrixWorld();

    if (S.shockT < 1) S.shockT = Math.min(1, S.shockT + dt / 1.5);
    S.vel += (S.velTarget - S.vel) * (1 - Math.exp(-dt * 6));
    S.velTarget *= Math.exp(-dt * 5);
    uniforms.uVel.value = S.vel;

    uniforms.uTime.value = S.t;
    glassU.uTime.value = S.t;
    // the portrait is read through nearly clear glass, or the flutes smear it
    glassU.uGlass.value = S.dimMul * look.glass * (1 - 0.75 * S.face);
    uniforms.uMorph.value = S.morph;
    uniforms.uDim.value = look.dim * S.dimMul;
    synapseU.uA.value = synapseAlpha(S.morph) * look.dim * S.dimMul * (1 - S.face);
    landU.uA.value = landAlpha(S.morph) * look.dim * S.dimMul;
    brainU.uA.value = brainAlpha(S.morph) * look.dim * S.dimMul;
    uniforms.uHover.value = S.hover;
    uniforms.uShockT.value = S.shockT;
    updateRay();
    render();

    // adaptive quality: if frames run long, drop resolution once
    S.frames++;
    if (dt > 0.028) S.slowFrames++;
    if (!S.degraded && S.frames === 150 && S.slowFrames > 60) {
      S.degraded = true;
      dpr = 1;
      renderer.setPixelRatio(1);
      uniforms.uPx.value = 3.1;
      geo.setDrawRange(0, Math.round(N * 0.6));
      resize();
    }
    S.raf = requestAnimationFrame(frame);
  }

  function start() {
    if (S.running || reduced) return;
    S.running = true;
    S.last = performance.now();
    S.raf = requestAnimationFrame(frame);
  }
  function stop() {
    S.running = false;
    cancelAnimationFrame(S.raf);
  }

  function staticFrame() {
    // reduced motion: one still frame, network formation, calm
    const look = lookAt(S.target, camera);
    group.rotation.set(-0.08, 0.3, 0);
    group.position.set(look.off[0], look.off[1], look.off[2]);
    uniforms.uMorph.value = S.target;
    uniforms.uDim.value = look.dim * 0.7 * S.dimTarget;
    synapseU.uA.value = synapseAlpha(S.target) * look.dim * 0.7 * S.dimTarget;
    landU.uA.value = landAlpha(S.target) * look.dim * 0.7 * S.dimTarget;
    brainU.uA.value = brainAlpha(S.target) * look.dim * 0.7 * S.dimTarget;
    uniforms.uTime.value = 2;
    glassU.uTime.value = 2;
    glassU.uGlass.value = 0.7 * S.dimTarget * look.glass;
    uniforms.uHover.value = 0;
    render();
  }

  // ---- input ----
  function onMove(e) {
    S.mx = (e.clientX / window.innerWidth) * 2 - 1;
    S.my = (e.clientY / window.innerHeight) * 2 - 1;
    S.hoverTarget = 1;
    S.lastMove = performance.now();
  }
  function onDown(e) {
    if (reduced) return;
    if (e.target.closest?.('input,textarea,select,[data-no-shock]')) return;
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -((e.clientY / window.innerHeight) * 2 - 1);
    ndc.set(x, y);
    ray.setFromCamera(ndc, camera);
    // hit point: where the ray meets the formation's mid-plane
    const o = ray.ray.origin,
      d = ray.ray.direction;
    const tz = (group.position.z - o.z) / d.z;
    uniforms.uShockO.value.set(o.x + d.x * tz, o.y + d.y * tz, group.position.z);
    S.shockT = 0;
  }
  function onVis() {
    if (document.visibilityState === 'visible') start();
    else stop();
  }
  let rt = 0;
  function onResize() {
    clearTimeout(rt);
    rt = setTimeout(() => {
      resize();
      if (reduced) staticFrame();
    }, 120);
  }
  function onLost(e) {
    e.preventDefault();
    stop();
    document.documentElement.classList.add('no-webgl');
  }

  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onDown, { passive: true });
  window.addEventListener('resize', onResize);
  document.addEventListener('visibilitychange', onVis);
  canvas.addEventListener('webglcontextlost', onLost);

  // first frame before announcing readiness (shader compile happens here)
  if (reduced) staticFrame();
  else {
    uniforms.uTime.value = 0;
    render();
    start();
  }
  const api = {
    get state() {
      return { morph: S.morph, target: S.target, dim: S.dimMul };
    },
    /** formation index the page wants (fractional values blend neighbours) */
    setTarget(m) {
      S.target = Math.max(0, Math.min(LAST, m));
      if (reduced) {
        S.morph = S.target;
      }
    },
    /** scroll velocity in px/frame (Lenis), mapped to a small smear */
    setVelocity(v) {
      if (reduced) return;
      S.velTarget = Math.max(-1, Math.min(1, v / 60));
    },
    /** where an `fx` formation sits: -1 (left edge) .. 1 (right edge), or null for its default */
    setAnchor(v) {
      anchorX = v == null || Number.isNaN(v) ? null : v;
    },
    /** Give every particle a place in a portrait. `samples` is [u, v, lum, warm] per
     *  point (image space, 0..1); `rect` is where that image sits on screen. */
    setFace(samples, rect) {
      const halfH = S.baseZ * 0.36397,
        halfW = halfH * camera.aspect;
      const a = faceAttr.array;
      const n = samples.length / 4;
      for (let i = 0; i < N; i++) {
        const k = (i % n) * 4;
        const x = rect.left + samples[k] * rect.width,
          y = rect.top + samples[k + 1] * rect.height;
        a[i * 4] = ((x / window.innerWidth) * 2 - 1) * halfW;
        a[i * 4 + 1] = -((y / window.innerHeight) * 2 - 1) * halfH;
        a[i * 4 + 2] = samples[k + 2] * 0.35;
        // lit skin stays cool and bright by luminance; the rim light runs hot
        a[i * 4 + 3] = Math.max(0.06 + samples[k + 2] * 0.23, samples[k + 3]);
      }
      faceAttr.needsUpdate = true;
    },
    /** Time-of-day mood: `warm` (dawn/dusk) lifts the ember pool, `deep` (night) lowers the blue. */
    setMood({ warm = 0, deep = 0 } = {}) {
      glassU.uWarmK.value = 1 + warm * 0.9 - deep * 0.2;
      glassU.uCoolK.value = 1 - deep * 0.28 - warm * 0.1;
      if (reduced) staticFrame();
    },
    /** Hold (1) or release (0) the portrait over `ms`. */
    faceTo(v, ms = 0) {
      if (reduced) return;
      if (ms <= 0) {
        S.face = S.faceTo = v;
        S.faceMs = 0;
        return;
      }
      S.faceFrom = S.face;
      S.faceTo = v;
      S.faceT0 = performance.now();
      S.faceMs = ms;
    },
    /** 0..1 page-level dimming multiplier */
    setDim(v) {
      S.dimTarget = v;
      if (reduced) staticFrame();
    },
    jump(m) {
      S.target = S.morph = Math.max(0, Math.min(LAST, m));
      if (reduced) staticFrame();
    },
    pulse() {
      S.shockT = 0;
      uniforms.uShockO.value.set(group.position.x, group.position.y, group.position.z);
    },
    /** briefly repaint the field's lit particles in another colour ([r,g,b] 0-255) */
    flash(rgb, ms = 2600) {
      const home = new THREE.Color(...unit(PALETTE.signal));
      uniforms.uEmber.value.setRGB(...unit(rgb));
      clearTimeout(S.flashT);
      S.flashT = setTimeout(() => {
        uniforms.uEmber.value.copy(home);
        if (reduced) staticFrame();
      }, ms);
      if (reduced) staticFrame();
    },
    get stats() {
      return { particles: S.degraded ? Math.round(N * 0.6) : N, dpr };
    },
    destroy() {
      stop();
      clearTimeout(S.flashT);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      geo.dispose();
      mat.dispose();
      lineSets.forEach(({ g, m }) => {
        g.dispose();
        m.dispose();
      });
      target.dispose();
      glassGeo.dispose();
      glassMat.dispose();
      renderer.dispose();
    },
  };
  return api;
}
