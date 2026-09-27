/* =========================================================================
   NEURAL FIELD ENGINE — one WebGL context for the whole site.
   Particles live on the GPU with a position per formation (formations.js);
   the vertex shader blends between them, advects network particles along
   their synapses, and handles the pointer (a ray, not a 2-D point — the
   field is 3-D) and click shockwaves. The CPU writes a handful of uniforms
   per frame and never touches a vertex after init.
   ========================================================================= */
import * as THREE from 'three';
import { buildFormations, LOOKS } from './formations';
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
attribute vec3 aA2;
attribute vec3 aB;
attribute vec3 aC;
attribute vec3 aD;
attribute vec3 aE;
attribute vec3 aG;
attribute vec4 aFH;
attribute vec4 aH0;
attribute vec4 aR;
varying float vHeat;
varying float vAlpha;

vec3 formation(float k, vec3 pNet){
  if (k < 0.5) return pNet;
  if (k < 1.5) return aB;
  if (k < 2.5) return aC;
  if (k < 3.5) return aD;
  if (k < 4.5) return aE;
  if (k < 5.5) return aG;
  return pNet;
}
float heatOf(float k){
  if (k < 0.5) return aH0.x;
  if (k < 1.5) return aH0.y;
  if (k < 2.5) return aH0.z;
  if (k < 3.5) return aH0.w;
  if (k < 4.5) return aFH.z;
  if (k < 5.5) return aFH.w;
  return aH0.x;
}

void main(){
  float ph = fract(aFH.x + uTime * aFH.y);
  vec3 pNet = mix(position, aA2, ph);

  float m = clamp(uMorph + (aR.z - 0.5) * uStagger, 0.0, 6.0);
  float k0 = floor(m);
  float k1 = min(k0 + 1.0, 6.0);
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
  float netW = clamp(max(0.0, 1.0 - m * 1.6) + max(0.0, 1.0 - (6.0 - m) * 1.6), 0.0, 1.0);
  float size = mix(0.95 + aR.x * 0.55, aR.y, netW);
  size *= 1.0 + clamp(1.0 - abs(m - 5.0), 0.0, 1.0) * 1.1;
  gl_PointSize = uPx * size * (1.0 + hot * 0.8) * (10.0 / -mv.z);
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uCool;
uniform vec3 uEmber;
uniform vec3 uWhite;
varying float vHeat;
varying float vAlpha;
void main(){
  vec2 q = gl_PointCoord - 0.5;
  float r = length(q);
  if (r > 0.5) discard;
  float halo = pow(smoothstep(0.5, 0.0, r), 2.2);
  float dotc = smoothstep(0.2, 0.0, r);
  float core = halo * 0.72 + dotc * 0.6;
  vec3 col = mix(uCool, uEmber, smoothstep(0.3, 0.85, vHeat));
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

const lerp = (a, b, t) => a + (b - a) * t;

function lookAt(m) {
  // interpolate the staging table at fractional formation index m
  const k0 = Math.max(0, Math.min(6, Math.floor(m)));
  const k1 = Math.min(6, k0 + 1);
  let t = m - k0;
  t = t * t * (3 - 2 * t);
  const a = LOOKS[k0],
    b = LOOKS[k1];
  return {
    off: [lerp(a.off[0], b.off[0], t), lerp(a.off[1], b.off[1], t), lerp(a.off[2], b.off[2], t)],
    spin: lerp(a.spin, b.spin, t),
    follow: lerp(a.follow, b.follow, t),
    dim: lerp(a.dim, b.dim, t),
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
  geo.setAttribute('aFH', new THREE.BufferAttribute(F.FH, 4));
  geo.setAttribute('aH0', new THREE.BufferAttribute(F.H0, 4));
  geo.setAttribute('aR', new THREE.BufferAttribute(F.R, 4));
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
    uCool: { value: new THREE.Color(...unit(PALETTE.cool)) },
    uEmber: { value: new THREE.Color(...unit(PALETTE.ember)) },
    uWhite: { value: new THREE.Color(1, 0.96, 0.9) },
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
  group.add(points);
  scene.add(group);

  // each line set belongs to its formation(s) and fades with distance to it
  const near = (m, k) => Math.max(0, 1 - Math.abs(m - k) * 1.8);
  const synapseAlpha = (m) => near(m, 0) + near(m, 6);
  const landAlpha = (m) => near(m, 3);

  // ---- state ----
  const S = {
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
    camera.position.z = camera.aspect < 1 ? 10 + (1 - camera.aspect) * 9 : 10;
    camera.updateProjectionMatrix();
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
    renderer.render(scene, camera);
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

    const look = lookAt(S.morph);
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
    uniforms.uMorph.value = S.morph;
    uniforms.uDim.value = look.dim * S.dimMul;
    synapseU.uA.value = synapseAlpha(S.morph) * look.dim * S.dimMul;
    landU.uA.value = landAlpha(S.morph) * look.dim * S.dimMul;
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
    const look = lookAt(S.target);
    group.rotation.set(-0.08, 0.3, 0);
    group.position.set(look.off[0], look.off[1], look.off[2]);
    uniforms.uMorph.value = S.target;
    uniforms.uDim.value = look.dim * 0.7 * S.dimTarget;
    synapseU.uA.value = synapseAlpha(S.target) * look.dim * 0.7 * S.dimTarget;
    landU.uA.value = landAlpha(S.target) * look.dim * 0.7 * S.dimTarget;
    uniforms.uTime.value = 2;
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
      S.target = Math.max(0, Math.min(6, m));
      if (reduced) {
        S.morph = S.target;
      }
    },
    /** scroll velocity in px/frame (Lenis), mapped to a small smear */
    setVelocity(v) {
      if (reduced) return;
      S.velTarget = Math.max(-1, Math.min(1, v / 60));
    },
    /** 0..1 page-level dimming multiplier */
    setDim(v) {
      S.dimTarget = v;
      if (reduced) staticFrame();
    },
    jump(m) {
      S.target = S.morph = Math.max(0, Math.min(6, m));
      if (reduced) staticFrame();
    },
    pulse() {
      S.shockT = 0;
      uniforms.uShockO.value.set(group.position.x, group.position.y, group.position.z);
    },
    get stats() {
      return { particles: S.degraded ? Math.round(N * 0.6) : N, dpr };
    },
    destroy() {
      stop();
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
      renderer.dispose();
    },
  };
  return api;
}
