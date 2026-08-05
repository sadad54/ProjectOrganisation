// Ported 1:1 from the original index.html inline <script>.
// Runs as a real bundled module now (not a CDN <script>), so:
//  - import('three') below resolves against node_modules/three via webpack — no import map needed.
//  - gsap/ScrollTrigger are real npm imports; we mirror them onto window.gsap/window.ScrollTrigger
//    so every `window.gsap`/`window.ScrollTrigger` check further down keeps working unchanged.
import gsapLib from 'gsap';
import { ScrollTrigger as ScrollTriggerLib } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined' && !window.__siteInited) {
  window.__siteInited = true;
  window.gsap = gsapLib;
  window.ScrollTrigger = ScrollTriggerLib;
/* =====================================================================
   0. ENVIRONMENT
   ===================================================================== */
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = window.matchMedia('(pointer:fine)').matches;
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

if (navigator.platform && /Win|Linux/i.test(navigator.platform)) {
  const k = $('#kbd-key'); if (k) k.textContent = 'Ctrl ';
}

/* =====================================================================
   1. FLUID FIELD  —  curl-noise advected dye, ping-pong on the GPU
   ===================================================================== */
const VERT = [
'attribute vec2 aPos;varying vec2 vUv;',
'void main(){vUv=aPos*0.5+0.5;gl_Position=vec4(aPos,0.0,1.0);}'
].join('\n');

const NOISE = [
'vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}',
'vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}',
'vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}',
'float snoise(vec2 v){',
'  const vec4 C=vec4(0.211324865,0.366025404,-0.577350269,0.024390244);',
'  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);',
'  vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);',
'  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;',
'  i=mod289(i);',
'  vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));',
'  vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);',
'  m=m*m;m=m*m;',
'  vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;',
'  m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);',
'  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;',
'  return 130.0*dot(m,g);}'
].join('\n');

const SIM = [
'precision highp float;',
'varying vec2 vUv;',
'uniform sampler2D uPrev;',
'uniform vec2 uAsp;',
'uniform float uTime;',
'uniform vec2 uP;',
'uniform vec2 uPPrev;',
'uniform float uForce;',
'uniform float uAmb;',
NOISE,
'vec2 curl(vec2 p,float t){',
'  float e=0.06;',
'  float n1=snoise(vec2(p.x,p.y+e)+t);',
'  float n2=snoise(vec2(p.x,p.y-e)+t);',
'  float n3=snoise(vec2(p.x+e,p.y)+t);',
'  float n4=snoise(vec2(p.x-e,p.y)+t);',
'  return vec2((n1-n2)/(2.0*e),-(n3-n4)/(2.0*e));',
'}',
'float seg(vec2 p,vec2 a,vec2 b){',
'  vec2 pa=p-a,ba=b-a;',
'  float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-6),0.0,1.0);',
'  return length(pa-ba*h);',
'}',
'void main(){',
'  vec2 uv=vUv;',
'  vec2 p=uv*uAsp;',
'  vec2 v=curl(p*1.55,uTime*0.09)*0.0032;',
'  v.y+=0.00072;',
'  vec3 dye=texture2D(uPrev,uv-v).rgb;',
'  dye*=0.9942;',
'  float d=seg(p,uP*uAsp,uPPrev*uAsp);',
'  float inj=exp(-d*d/0.0022)*uForce;',
'  vec3 warm=vec3(0.58,0.30,0.22);',
'  vec3 cool=vec3(0.14,0.15,0.20);',
'  vec3 rose=vec3(0.42,0.17,0.21);',
'  float mixv=0.5+0.5*sin(uTime*0.45);',
'  vec3 c=mix(warm,cool,mixv);',
'  c=mix(c,rose,0.10+0.14*sin(uTime*0.21+1.7));',
'  dye+=c*inj*0.55;',
'  for(int i=0;i<4;i++){',
'    float fi=float(i);',
'    vec2 e=vec2(0.5+0.40*sin(uTime*(0.15+fi*0.055)+fi*2.1),',
'                0.5+0.34*cos(uTime*(0.11+fi*0.047)+fi*1.3));',
'    float de=distance(p,e*uAsp);',
'    vec3 ec=(i==0)?warm:((i==1)?cool:((i==2)?rose*0.55:warm*0.48));',
'    dye+=ec*exp(-de*de/0.022)*0.0068*uAmb;',
'  }',
'  gl_FragColor=vec4(min(dye,vec3(1.12)),1.0);',
'}'
].join('\n');

const SHOW = [
'precision highp float;',
'varying vec2 vUv;',
'uniform sampler2D uTex;',
'uniform vec2 uAsp;',
'uniform float uTime;',
NOISE,
'void main(){',
'  vec2 uv=vUv;',
'  float ab=0.0016;',
'  float r=texture2D(uTex,uv+vec2(ab,0.0)).r;',
'  float g=texture2D(uTex,uv).g;',
'  float b=texture2D(uTex,uv-vec2(ab,0.0)).b;',
'  vec3 dye=vec3(r,g,b);',
'  float lum=dot(dye,vec3(0.30,0.59,0.11));',
'  vec3 base=vec3(0.031,0.031,0.059);',
'  vec3 col=base+dye*0.82;',
'  col+=vec3(0.02,0.06,0.16)*smoothstep(0.02,0.48,lum);',
'  col=col/(col+0.86)*1.22;',
'  vec2 c=uv-0.5;',
'  col*=1.0-smoothstep(0.20,0.74,length(c))*0.66;',
'  float n=snoise(uv*vec2(920.0,780.0)+uTime*13.0)*0.018;',
'  col+=n;',
'  gl_FragColor=vec4(max(col,0.0),1.0);',
'}'
].join('\n');

function FluidField(canvas, opts){
  opts = opts || {};
  const gl = canvas.getContext('webgl', {alpha:false, antialias:false, depth:false, stencil:false, powerPreference:'high-performance'})
          || canvas.getContext('experimental-webgl');
  if (!gl) return null;

  function sh(type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  }
  function prog(vs, fs){
    const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram();
    gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(p)); return null; }
    return p;
  }

  const pSim = prog(VERT, SIM), pShow = prog(VERT, SHOW);
  if (!pSim || !pShow) return null;

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);

  function bindQuad(p){
    const loc = gl.getAttribLocation(p, 'aPos');
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  }

  function makeTarget(w, h){
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return {tex:tex, fbo:fbo, w:w, h:h};
  }

  let A, B, simW, simH, cw, ch, asp = [1,1];

  function resize(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    cw = Math.max(1, Math.round(r.width * dpr));
    ch = Math.max(1, Math.round(r.height * dpr));
    canvas.width = cw; canvas.height = ch;
    const scale = opts.scale || 0.42;
    simW = Math.max(64, Math.min(560, Math.round(r.width * scale)));
    simH = Math.max(64, Math.round(simW * (r.height / Math.max(r.width, 1))));
    A = makeTarget(simW, simH);
    B = makeTarget(simW, simH);
    const ar = Math.max(r.width / Math.max(r.height, 1), 0.0001);
    asp = ar >= 1 ? [ar, 1] : [1, 1 / ar];
  }
  resize();

  const state = {
    px:0.5, py:0.55, ppx:0.5, ppy:0.55,
    tx:0.5, ty:0.55, force:0, target:0, amb:1, t:0, running:false, visible:true
  };

  function pointer(clientX, clientY){
    const r = canvas.getBoundingClientRect();
    state.tx = (clientX - r.left) / Math.max(r.width, 1);
    state.ty = 1 - (clientY - r.top) / Math.max(r.height, 1);
    state.target = 1;
    clearTimeout(state.decay);
    state.decay = setTimeout(function(){ state.target = 0; }, 90);
  }

  function simPass(){
    gl.bindFramebuffer(gl.FRAMEBUFFER, B.fbo);
    gl.viewport(0, 0, simW, simH);
    gl.useProgram(pSim); bindQuad(pSim);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, A.tex);
    gl.uniform1i(gl.getUniformLocation(pSim,'uPrev'), 0);
    gl.uniform2f(gl.getUniformLocation(pSim,'uAsp'), asp[0], asp[1]);
    gl.uniform1f(gl.getUniformLocation(pSim,'uTime'), state.t);
    gl.uniform2f(gl.getUniformLocation(pSim,'uP'), state.px, state.py);
    gl.uniform2f(gl.getUniformLocation(pSim,'uPPrev'), state.ppx, state.ppy);
    gl.uniform1f(gl.getUniformLocation(pSim,'uForce'), state.force * (opts.force || 1));
    gl.uniform1f(gl.getUniformLocation(pSim,'uAmb'), state.amb * (opts.amb || 1));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const tmp = A; A = B; B = tmp;
  }

  function seed(steps){
    for (let i = 0; i < steps; i++){ state.t += 0.055; simPass(); }
  }

  let last = performance.now();
  function frame(now){
    if (!state.running) return;
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    state.t += dt;

    state.ppx = state.px; state.ppy = state.py;
    state.px += (state.tx - state.px) * Math.min(dt * 12, 1);
    state.py += (state.ty - state.py) * Math.min(dt * 12, 1);
    state.force += (state.target - state.force) * Math.min(dt * 7, 1);

    simPass();

    // ---- display pass
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, cw, ch);
    gl.useProgram(pShow); bindQuad(pShow);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, A.tex);
    gl.uniform1i(gl.getUniformLocation(pShow,'uTex'), 0);
    gl.uniform2f(gl.getUniformLocation(pShow,'uAsp'), asp[0], asp[1]);
    gl.uniform1f(gl.getUniformLocation(pShow,'uTime'), state.t);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    requestAnimationFrame(frame);
  }

  let seeded = false;
  function start(){
    if (state.running) return;
    if (!seeded){ seeded = true; seed(opts.seed || 120); }
    state.running = true; last = performance.now();
    requestAnimationFrame(frame);
  }
  function stop(){ state.running = false; }

  let rt;
  window.addEventListener('resize', function(){
    clearTimeout(rt);
    rt = setTimeout(function(){ resize(); if (seeded) seed(140); }, 200);
  });

  return {start:start, stop:stop, pointer:pointer, canvas:canvas};
}

const fields = [];
if (!RM) {
  const heroField = FluidField($('#fluid'), {scale:0.44, force:1.0, amb:1.0});
  const contactField = FluidField($('#fluid2'), {scale:0.32, force:0.7, amb:1.35});
  if (heroField) fields.push(heroField);
  if (contactField) fields.push(contactField);
  if (!heroField) document.body.classList.add('no-webgl');

  // run only while on screen
  fields.forEach(function(f){
    const io = new IntersectionObserver(function(es){
      es.forEach(function(e){ e.isIntersecting ? f.start() : f.stop(); });
    }, {threshold:0.02});
    io.observe(f.canvas);
  });

  window.addEventListener('pointermove', function(e){
    fields.forEach(function(f){ f.pointer(e.clientX, e.clientY); });
  }, {passive:true});
  window.addEventListener('touchmove', function(e){
    const t = e.touches[0]; if (!t) return;
    fields.forEach(function(f){ f.pointer(t.clientX, t.clientY); });
  }, {passive:true});
} else {
  document.body.classList.add('no-webgl');
}

/* =====================================================================
   1b. NEURAL SCENES  —  Three.js node/synapse network (hero + contact)
   ===================================================================== */
(function(){
  if (RM) return;
  const heroCanvas = $('#hero3d');
  const contactCanvas = $('#contact3d');
  if (!heroCanvas && !contactCanvas) return;

  let heroSceneState = null;

  async function mountScene(canvas, color, count, radius, neural){
    if (!canvas) return;
    let THREE;
    try { THREE = await import('three'); } catch (err) { return; }

    const renderer = new THREE.WebGLRenderer({canvas:canvas, alpha:true, antialias:true, powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 6.4;
    const group = new THREE.Group();
    scene.add(group);

    let pulses = null, pulseData = null, neuralEdges = null, neuralNodePos = null;

    if (neural) {
      // neuron cell bodies scattered through a cortex-like ellipsoid
      const nNodes = Math.max(50, Math.min(140, count));
      const nodePos = [];
      for (let i = 0; i < nNodes; i++){
        const theta = Math.random() * Math.PI * 2, phi = Math.acos(2 * Math.random() - 1);
        const r = (0.35 + Math.random() * 0.65) * radius;
        nodePos.push([
          r * Math.sin(phi) * Math.cos(theta) * 1.15,
          r * Math.sin(phi) * Math.sin(theta) * 0.92,
          r * Math.cos(phi) * 1.05
        ]);
      }
      const nodeGeo = new THREE.BufferGeometry();
      const nodeArr = new Float32Array(nNodes * 3);
      nodePos.forEach(function(p, i){ nodeArr[i*3] = p[0]; nodeArr[i*3+1] = p[1]; nodeArr[i*3+2] = p[2]; });
      nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodeArr, 3));
      const nodeMat = new THREE.PointsMaterial({size:0.05, color:color, transparent:true, opacity:0.85, blending:THREE.AdditiveBlending, depthWrite:false});
      group.add(new THREE.Points(nodeGeo, nodeMat));

      // synapses: connect each neuron to its nearest few neighbours
      const dist = function(a, b){ return Math.hypot(a[0]-b[0], a[1]-b[1], a[2]-b[2]); };
      const edgeSet = new Set();
      const edges = [];
      nodePos.forEach(function(p, i){
        const near = nodePos.map(function(q, j){ return [j, dist(p, q)]; })
          .filter(function(pair){ return pair[0] !== i; })
          .sort(function(a, b){ return a[1] - b[1]; })
          .slice(0, 3);
        near.forEach(function(pair){
          const j = pair[0], d = pair[1];
          if (d > radius * 0.9) return;
          const key = i < j ? i + '_' + j : j + '_' + i;
          if (edgeSet.has(key)) return;
          edgeSet.add(key); edges.push([i, j]);
        });
      });
      const lineArr = new Float32Array(edges.length * 6);
      edges.forEach(function(e, k){
        lineArr[k*6] = nodePos[e[0]][0]; lineArr[k*6+1] = nodePos[e[0]][1]; lineArr[k*6+2] = nodePos[e[0]][2];
        lineArr[k*6+3] = nodePos[e[1]][0]; lineArr[k*6+4] = nodePos[e[1]][1]; lineArr[k*6+5] = nodePos[e[1]][2];
      });
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.BufferAttribute(lineArr, 3));
      const lineMat = new THREE.LineBasicMaterial({color:color, transparent:true, opacity:0.16, blending:THREE.AdditiveBlending});
      group.add(new THREE.LineSegments(lineGeo, lineMat));

      // firing signals travelling along random synapses
      const nPulse = 16;
      pulseData = Array.from({length:nPulse}, function(){
        const e = edges[(Math.random() * edges.length) | 0] || [0, 0];
        return {a:nodePos[e[0]], b:nodePos[e[1]], t:Math.random(), speed:0.006 + Math.random() * 0.01};
      });
      const pulseArr = new Float32Array(nPulse * 3);
      const pulseGeo = new THREE.BufferGeometry();
      pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulseArr, 3));
      const pulseMat = new THREE.PointsMaterial({size:0.09, color:0xFFB088, transparent:true, opacity:0.95, blending:THREE.AdditiveBlending, depthWrite:false});
      pulses = new THREE.Points(pulseGeo, pulseMat);
      group.add(pulses);
      neuralEdges = edges; neuralNodePos = nodePos;
    } else {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++){
        const theta = Math.random() * Math.PI * 2, phi = Math.acos(2 * Math.random() - 1);
        const r = radius + (Math.random() - 0.5) * 0.6;
        pos[i*3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i*3+2] = r * Math.cos(phi);
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({size:0.026, color:color, transparent:true, opacity:0.82, blending:THREE.AdditiveBlending, depthWrite:false});
      group.add(new THREE.Points(geo, mat));

      const shell = new THREE.Mesh(
        new THREE.IcosahedronGeometry(radius + 0.35, 1),
        new THREE.MeshBasicMaterial({color:0xE5484D, wireframe:true, transparent:true, opacity:0.14})
      );
      group.add(shell);
    }

    function resize(){
      const r = canvas.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      renderer.setSize(r.width, r.height, false);
      camera.aspect = r.width / Math.max(r.height, 1);
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    let mx = 0, my = 0;
    window.addEventListener('pointermove', function(e){
      mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5;
    }, {passive:true});

    const sceneState = {running:false, scroll:0};
    if (canvas === heroCanvas) heroSceneState = sceneState;

    function tick(){
      if (!sceneState.running) return;
      group.rotation.y += 0.0012 + mx * 0.0012;
      group.rotation.x += (my * 0.28 - group.rotation.x) * 0.02;
      if (pulses && pulseData){
        const arr = pulses.geometry.attributes.position.array;
        pulseData.forEach(function(p, i){
          p.t += p.speed;
          if (p.t >= 1){
            const e = neuralEdges[(Math.random() * neuralEdges.length) | 0];
            p.a = neuralNodePos[e[0]]; p.b = neuralNodePos[e[1]]; p.t = 0; p.speed = 0.006 + Math.random() * 0.01;
          }
          arr[i*3]   = p.a[0] + (p.b[0] - p.a[0]) * p.t;
          arr[i*3+1] = p.a[1] + (p.b[1] - p.a[1]) * p.t;
          arr[i*3+2] = p.a[2] + (p.b[2] - p.a[2]) * p.t;
        });
        pulses.geometry.attributes.position.needsUpdate = true;
      }
      if (canvas === heroCanvas){
        group.rotation.z = sceneState.scroll * 0.55;
        group.scale.setScalar(1 - sceneState.scroll * 0.4);
        camera.position.z = 6.4 + sceneState.scroll * 2.4;
      }
      renderer.render(scene, camera);
      requestAnimationFrame(tick);
    }

    const io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (e.isIntersecting && !sceneState.running){ sceneState.running = true; tick(); }
        else if (!e.isIntersecting) sceneState.running = false;
      });
    }, {threshold:0.02});
    io.observe(canvas);
  }

  if (heroCanvas) mountScene(heroCanvas, 0xFF6A3D, 110, 2.3, true);
  if (contactCanvas) mountScene(contactCanvas, 0xFF6A3D, 1500, 1.9, false);

  // tie the hero network's rotation/zoom/fade to scroll position
  const heroSection = $('#top');
  if (heroSection){
    let ticking = false;
    function update(){
      const r = heroSection.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, 1 - (r.bottom / (r.height + innerHeight))));
      if (heroSceneState) heroSceneState.scroll = p;
      ticking = false;
    }
    window.addEventListener('scroll', function(){
      if (!ticking){ ticking = true; requestAnimationFrame(update); }
    }, {passive:true});
    update();
  }
})();

/* =====================================================================
   1c. AMBIENT FIELD  —  one particle field that explodes out of the hero
   once, then drifts as a persistent, low-key backdrop behind every
   section down to Contact. Layers BEHIND the existing per-section fluid
   and neural-network canvases (z-index:0, painted first in the DOM), so
   nothing already on the page is replaced — this just sits under it.
   Normal scrolling only: nothing pins or hijacks the scroll.
   ===================================================================== */
(function(){
  if (RM) return;
  const canvas = $('#ambientField');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let W = 0, H = 0;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  function resize(){
    W = innerWidth; H = innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const nParticles = 220;
  const parts = Array.from({length:nParticles}, function(){
    return {
      angle: Math.random() * Math.PI * 2,
      dist: 0.08 + Math.random() * 0.92,      // fraction of max radius once fully exploded
      size: 0.9 + Math.random() * 2.0,
      warm: Math.random() < 0.8,
      driftSpeed: 0.15 + Math.random() * 0.3,
      driftPhase: Math.random() * Math.PI * 2
    };
  });

  let progress = 0; // 0 = tight cluster at hero, 1 = fully exploded — stays at 1 for the rest of the page
  const hero = $('#top');

  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGSAP && hero){
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.create({
      trigger: hero, start:'top top', end:'bottom top', scrub:0.6,
      onUpdate: function(self){ progress = self.progress; }
    });
  } else if (hero) {
    function updateFallback(){
      const r = hero.getBoundingClientRect();
      progress = Math.max(0, Math.min(1, -r.top / Math.max(r.height, 1)));
    }
    window.addEventListener('scroll', updateFallback, {passive:true});
    updateFallback();
  }

  function draw(t){
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H * 0.42;
    const maxR = Math.min(W, H) * 0.68;
    const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic — punchy explode, settles gently
    const alphaCap = 0.4 * Math.min(1, progress / 0.3); // fades up quickly, then holds

    if (alphaCap <= 0.002) return;

    parts.forEach(function(part){
      const drift = Math.sin(t * 0.00016 * part.driftSpeed + part.driftPhase) * 10 * ease;
      const r = maxR * part.dist * ease;
      const x = cx + Math.cos(part.angle) * r + drift;
      const y = cy + Math.sin(part.angle) * r * 0.72 + drift * 0.6;
      const alpha = alphaCap * (0.5 + 0.5 * Math.sin(part.driftPhase + t * 0.0003));
      ctx.beginPath();
      ctx.arc(x, y, part.size, 0, Math.PI * 2);
      ctx.fillStyle = part.warm
        ? 'rgba(255,106,61,' + alpha.toFixed(3) + ')'
        : 'rgba(255,176,136,' + alpha.toFixed(3) + ')';
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* =====================================================================
   2. HEADLINE DECODE
   ===================================================================== */
(function(){
  const el = $('#scramble');
  if (!el || RM) return;
  const final = el.dataset.final;
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*<>/\\{}[]01';
  const queue = final.split('').map(function(ch, i){
    const s = i * 14;
    return {ch:ch, start:s, end: s + 180 + Math.random() * 260};
  });
  el.textContent = '';
  let t0 = 0;
  function tick(now){
    if (!t0) t0 = now;
    const ms = now - t0;
    let out = '', done = 0;
    for (let i = 0; i < queue.length; i++){
      const q = queue[i];
      if (ms >= q.end) { out += q.ch; done++; }
      else if (ms >= q.start) {
        out += (q.ch === ' ') ? ' ' : glyphs[(Math.random() * glyphs.length) | 0];
      }
    }
    el.textContent = out;
    if (done < queue.length) requestAnimationFrame(tick);
    else el.innerHTML = 'Hi, I&rsquo;m <em>Adnan</em>.';
  }
  setTimeout(function(){ requestAnimationFrame(tick); }, 260);
})();
if (RM) { $('#scramble').innerHTML = 'Hi, I&rsquo;m <em>Adnan</em>.'; }

/* =====================================================================
   3. REVEALS
   ===================================================================== */
(function(){
  const els = $$('.rv');
  const hasGSAP = !RM && typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  if (!hasGSAP){
    // fallback: original snap-in-once behaviour (also used under reduced-motion / offline CDN)
    const io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:0.12, rootMargin:'0px 0px -6% 0px'});
    els.forEach(function(el){ io.observe(el); });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  els.forEach(function(el){
    el.classList.add('in');       // let GSAP own opacity/transform, not the CSS transition
    el.style.transition = 'none'; // avoid the CSS transition fighting the scrubbed tween
    // crossfade: fades in over the first quarter of its transit through the viewport,
    // holds at full opacity through the middle, fades back out over the last quarter —
    // mirrors the Dala reference instead of a fade-in-once
    gsap.timeline({scrollTrigger:{trigger:el, start:'top bottom', end:'bottom top', scrub:0.6}})
      .fromTo(el, {opacity:0, y:34}, {opacity:1, y:0, ease:'none', duration:0.25})
      .to(el, {opacity:1, y:0, ease:'none', duration:0.5})
      .to(el, {opacity:0, y:-34, ease:'none', duration:0.25});
  });
})();

/* =====================================================================
   4. COUNTERS
   ===================================================================== */
(function(){
  const io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target;
      const to = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.dec, 10);
      if (RM){ el.textContent = to.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec}); return; }
      const dur = 1500; const t0 = performance.now();
      (function step(now){
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * eased).toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    });
  }, {threshold:0.5});
  $$('[data-count]').forEach(function(el){ io.observe(el); });
})();

/* =====================================================================
   5. WORK RAIL
   ===================================================================== */
(function(){
  const items = $$('#workRail li');
  const projs = $$('.proj');
  if (!items.length) return;
  const io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      const i = projs.indexOf(e.target);
      items.forEach(function(li, j){ li.classList.toggle('on', j === i); });
    });
  }, {rootMargin:'-32% 0px -52% 0px'});
  projs.forEach(function(p){ io.observe(p); });
  $$('#workRail button').forEach(function(b){
    b.addEventListener('click', function(){
      const t = document.getElementById(b.dataset.go);
      if (t) t.scrollIntoView({behavior: RM ? 'auto' : 'smooth', block:'start'});
    });
  });
})();

/* =====================================================================
   6. SECTION RAIL + NAV STATE
   ===================================================================== */
(function(){
  const map = [
    ['top','Intro'], ['about','About'], ['work','Work'],
    ['loop','Approach'], ['toolkit','Toolkit'], ['contact','Contact']
  ];
  const rail = $('#rail');
  map.forEach(function(m){
    const b = document.createElement('button');
    b.innerHTML = '<span class="lbl">' + m[1] + '</span><span class="tick"></span>';
    b.setAttribute('aria-label','Go to ' + m[1]);
    b.addEventListener('click', function(){
      const t = document.getElementById(m[0]);
      if (t) t.scrollIntoView({behavior: RM ? 'auto' : 'smooth'});
    });
    rail.appendChild(b);
  });
  const btns = $$('#rail button');
  const nav = $('#nav');

  const io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      const i = map.findIndex(function(m){ return m[0] === e.target.id; });
      btns.forEach(function(b, j){ b.setAttribute('aria-current', j === i ? 'true' : 'false'); });
    });
  }, {rootMargin:'-45% 0px -45% 0px'});
  map.forEach(function(m){ const el = document.getElementById(m[0]); if (el) io.observe(el); });

  let ticking = false;
  window.addEventListener('scroll', function(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      const y = window.scrollY;
      nav.classList.toggle('stuck', y > 40);
      rail.classList.toggle('on', y > window.innerHeight * 0.6);
      ticking = false;
    });
  }, {passive:true});
})();

/* =====================================================================
   7. REPAIR LOOP
   ===================================================================== */
(function(){
  const nodes = {n1:$('#n1'), n2:$('#n2'), n3:$('#n3'), n4:$('#n4')};
  const flows = {f1:$('#f1'), f2:$('#f2'), f3:$('#f3'), f4:$('#f4')};
  const readout = $('#readout');
  if (!readout) return;

  Object.keys(flows).forEach(function(k){
    const p = flows[k];
    const len = p.getTotalLength();
    p.style.setProperty('--len', len);
  });

  const timers = [];
  function clear(){
    timers.forEach(clearTimeout); timers.length = 0;
    Object.keys(nodes).forEach(function(k){ nodes[k].setAttribute('class','node'); });
    Object.keys(flows).forEach(function(k){ flows[k].classList.remove('go'); });
    readout.className = 'readout';
  }
  function at(ms, fn){ timers.push(setTimeout(fn, RM ? 0 : ms)); }
  function say(kind, label, body){
    readout.className = 'readout' + (kind ? ' ' + kind : '');
    readout.innerHTML = '<span class="attempt">' + label + '</span>' + body;
  }

  let running = false;
  function run(){
    clear();
    running = true;
    at(60,   function(){ nodes.n1.setAttribute('class','node act');
                         say('', 'Attempt 1, prompt', 'Answer transcript sent with the rubric and the required output schema.'); });
    at(420,  function(){ flows.f1.classList.add('go'); });
    at(980,  function(){ nodes.n2.setAttribute('class','node act');
                         say('', 'Attempt 1, model', 'Llama 3.3 70B generating the evaluation.'); });
    at(1600, function(){ flows.f2.classList.add('go'); });
    at(2160, function(){ nodes.n3.setAttribute('class','node bad'); nodes.n2.setAttribute('class','node');
                         say('bad', 'Attempt 1, rejected',
                           'clarity: "4/5" &nbsp;<span style="color:var(--rose)">✕ expected integer, got string</span><br>follow_up &nbsp;<span style="color:var(--rose)">✕ required field missing</span>'); });
    at(2900, function(){ flows.f3.classList.add('go');
                         say('bad', 'Repairing', 'The invalid response and both validation errors go back as the next prompt.'); });
    at(3700, function(){ nodes.n3.setAttribute('class','node'); nodes.n2.setAttribute('class','node act');
                         flows.f2.classList.remove('go');
                         say('', 'Attempt 2, model', 'Same context, plus what it got wrong the first time.'); });
    at(4200, function(){ flows.f2.classList.add('go'); });
    at(4800, function(){ nodes.n3.setAttribute('class','node good');
                         say('good', 'Attempt 2, valid', 'clarity: 4 &nbsp;✓ integer in range<br>follow_up: "Walk me through how you\'d shard that table." &nbsp;✓ present'); });
    at(5300, function(){ flows.f4.classList.add('go'); });
    at(5900, function(){ nodes.n4.setAttribute('class','node good'); nodes.n2.setAttribute('class','node'); nodes.n1.setAttribute('class','node');
                         say('good', 'Returned', 'Two model calls, one clean result. The user never saw the failure.');
                         running = false; });
  }

  $('#replay').addEventListener('click', run);
  const io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting){ io.disconnect(); at(400, run); } });
  }, {threshold:0.45});
  io.observe($('.loop-stage'));
})();

/* =====================================================================
   7b. APPROACH CAROUSEL — horizontal scroll/swipe/drag/keys between
       the four signature slides, no extra vertical page height
   ===================================================================== */
(function(){
  const track = $('#loopTrack');
  if (!track) return;
  const slides = $$('.loop-slide', track);
  const prevBtn = $('#loopPrev'), nextBtn = $('#loopNext'), dotsWrap = $('#loopDots');
  if (!slides.length || !prevBtn || !nextBtn || !dotsWrap) return;

  slides.forEach(function(_, i){
    const d = document.createElement('button');
    d.className = 'loop-dot' + (i === 0 ? ' on' : '');
    d.type = 'button';
    d.setAttribute('aria-label', 'Go to approach ' + (i + 1) + ' of ' + slides.length);
    d.addEventListener('click', function(){ goTo(i); });
    dotsWrap.appendChild(d);
  });
  const dots = $$('.loop-dot', dotsWrap);
  let current = 0;

  function setActive(i){
    current = i;
    dots.forEach(function(d, j){ d.classList.toggle('on', j === i); });
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === slides.length - 1;
  }
  function goTo(i){
    i = Math.max(0, Math.min(slides.length - 1, i));
    slides[i].scrollIntoView({behavior: RM ? 'auto' : 'smooth', inline: 'start', block: 'nearest'});
  }
  prevBtn.addEventListener('click', function(){ goTo(current - 1); });
  nextBtn.addEventListener('click', function(){ goTo(current + 1); });
  setActive(0);

  // sync dots/arrows to whichever slide is actually in view (covers swipe, drag, trackpad scroll)
  const slideIO = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (e.isIntersecting && e.intersectionRatio > 0.6){
        setActive(slides.indexOf(e.target));
      }
    });
  }, {root: track, threshold: [0.6]});
  slides.forEach(function(s){ slideIO.observe(s); });

  // arrow keys while the carousel has focus or is hovered
  let hovering = false;
  track.addEventListener('mouseenter', function(){ hovering = true; });
  track.addEventListener('mouseleave', function(){ hovering = false; });
  track.addEventListener('keydown', function(e){
    if (e.key === 'ArrowRight'){ e.preventDefault(); goTo(current + 1); }
    if (e.key === 'ArrowLeft'){ e.preventDefault(); goTo(current - 1); }
  });
  document.addEventListener('keydown', function(e){
    if (!hovering || document.activeElement === track) return;
    if (e.key === 'ArrowRight'){ goTo(current + 1); }
    if (e.key === 'ArrowLeft'){ goTo(current - 1); }
  });

  // click-and-drag for mouse users (touch + trackpad already scroll natively)
  if (FINE){
    let isDown = false, startX = 0, startScroll = 0, moved = false;
    track.addEventListener('pointerdown', function(e){
      isDown = true; moved = false; startX = e.clientX; startScroll = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', function(e){
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startScroll - dx;
    });
    track.addEventListener('pointerup', function(e){
      isDown = false;
      if (moved){
        // snap handled by CSS scroll-snap; block the click that would otherwise fire on children
        const swallow = function(ev){ ev.stopPropagation(); ev.preventDefault(); track.removeEventListener('click', swallow, true); };
        track.addEventListener('click', swallow, true);
      }
    });
    track.addEventListener('pointercancel', function(){ isDown = false; });
  }
})();

/* =====================================================================
   7c. APPROACH CAROUSEL — slides 2-4 animations (same stepper pattern
       as the repair loop: clear → timed steps → readout narration)
   ===================================================================== */
(function(){
  function prepFlows(flows){
    Object.keys(flows).forEach(function(k){
      var p = flows[k];
      if (!p) return;
      var len = p.getTotalLength();
      p.style.setProperty('--len', len);
    });
  }
  function stepper(opts){
    // opts: { readout, nodes, flows, extra (el to clear classes on), steps: [{ms, fn}] }
    var readout = opts.readout;
    if (!readout) return null;
    var nodes = opts.nodes || {};
    var flows = opts.flows || {};
    var extra = opts.extra || [];
    var timers = [];
    function clear(){
      timers.forEach(clearTimeout); timers.length = 0;
      Object.keys(nodes).forEach(function(k){ if (nodes[k]) nodes[k].setAttribute('class','node'); });
      Object.keys(flows).forEach(function(k){ if (flows[k]) flows[k].classList.remove('go'); });
      extra.forEach(function(el){ if (el) el.classList.remove('act','good','bad','pulse'); });
      readout.className = 'readout';
    }
    function at(ms, fn){ timers.push(setTimeout(fn, RM ? 0 : ms)); }
    function say(kind, label, body){
      readout.className = 'readout' + (kind ? ' ' + kind : '');
      readout.innerHTML = '<span class="attempt">' + label + '</span>' + body;
    }
    return { clear: clear, at: at, say: say };
  }

  /* -- slide 2: imbalanced classification -- */
  (function(){
    var readout = $('#readout2'), replay = $('#replay2');
    var bad = $('#cc-bad'), good = $('#cc-good');
    var s = stepper({ readout: readout, extra: [bad, good] });
    if (!s || !replay) return;
    function run(){
      s.clear();
      s.at(60,   function(){ bad.classList.add('act');
                 s.say('bad', 'Optimising for accuracy', 'A model that predicts &ldquo;never fraud&rdquo; on every transaction.'); });
      s.at(1300, function(){ s.say('bad', 'Looks great, does nothing',
                 '99.83% accuracy &nbsp;<span style="color:var(--rose)">but 0% recall</span> &mdash; every fraud case slips through.'); });
      s.at(2700, function(){ bad.classList.remove('act'); good.classList.add('act');
                 s.say('', 'Ensemble + SMOTE', 'Random Forest, XGBoost and Isolation Forest, trained with SMOTE oversampling and class-weighted loss.'); });
      s.at(4000, function(){ s.say('good', 'Scored on PR-AUC',
                 '0.98 ROC-AUC, 0.89 PR-AUC &mdash; the metric that actually holds up at a 0.17% fraud rate.'); });
    }
    replay.addEventListener('click', run);
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting){ io.disconnect(); s.at(400, run); } });
    }, {threshold:0.5});
    io.observe(bad.closest('.loop-stage'));
  })();

  /* -- slide 3: simulated uncertainty -- */
  (function(){
    var readout = $('#readout3'), replay = $('#replay3');
    var nodes = { s1:$('#s1'), s2:$('#s2'), s3:$('#s3') };
    var flows = { sf1:$('#sf1'), sf2:$('#sf2'), sf3:$('#sf3') };
    var lbl = $('#simLoopLbl');
    prepFlows(flows);
    var s = stepper({ readout: readout, nodes: nodes, flows: flows, extra: [lbl] });
    if (!s || !replay) return;
    function run(){
      s.clear();
      s.at(60,   function(){ nodes.s1.setAttribute('class','node act');
                 s.say('', 'Score the fixture', 'Win / draw / loss probabilities and expected goals from the match model.'); });
      s.at(700,  function(){ flows.sf1.classList.add('go'); });
      s.at(1250, function(){ nodes.s2.setAttribute('class','node act'); lbl.classList.add('pulse');
                 s.say('', 'Simulate the tournament, 10,000 times', 'Group stage draws, then every knockout upset or hold, played out from those odds.'); });
      s.at(2600, function(){ flows.sf2.classList.add('go'); });
      s.at(3150, function(){ nodes.s3.setAttribute('class','node good'); nodes.s1.setAttribute('class','node'); nodes.s2.setAttribute('class','node');
                 s.say('good', 'Tallied', 'Per-team title probability and path-to-final curve, from 10,000 simulated outcomes.'); });
      s.at(4300, function(){ flows.sf3.classList.add('go');
                 s.say('good', 'Predicted-vs-actual audit', 'Checked against what actually happened, after the fact &mdash; a forecast nobody scores isn&rsquo;t a forecast.'); });
    }
    replay.addEventListener('click', run);
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting){ io.disconnect(); s.at(400, run); } });
    }, {threshold:0.5});
    io.observe(readout.closest('.loop-stage'));
  })();

  /* -- slide 4: adaptive follow-up depth -- */
  (function(){
    var readout = $('#readout4'), replay = $('#replay4');
    var nodes = { a1:$('#a1'), a2:$('#a2'), a3:$('#a3'), a4:$('#a4') };
    var flows = { af1:$('#af1'), af2:$('#af2'), af3:$('#af3') };
    prepFlows(flows);
    var s = stepper({ readout: readout, nodes: nodes, flows: flows });
    if (!s || !replay) return;
    function run(){
      s.clear();
      s.at(60,   function(){ nodes.a1.setAttribute('class','node act');
                 s.say('', 'Candidate answers', 'A vague, surface-level answer on database sharding.'); });
      s.at(700,  function(){ flows.af1.classList.add('go'); });
      s.at(1300, function(){ nodes.a2.setAttribute('class','node act'); nodes.a1.setAttribute('class','node');
                 s.say('', 'Follow-up agent reads it', 'Reasons over the content and specificity of the answer, not just its length.'); });
      s.at(2600, function(){ nodes.a3.setAttribute('class','node good'); flows.af2.classList.add('go');
                 s.say('good', 'Probe deeper', 'Answer was surface-level, so the agent asks a targeted follow-up instead of moving on.'); });
      s.at(3900, function(){ nodes.a2.setAttribute('class','node');
                 s.say('good', 'Mirrors a real interviewer', 'A solid, evidenced answer would have sent it down the &ldquo;move on&rdquo; path instead.'); });
    }
    replay.addEventListener('click', run);
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting){ io.disconnect(); s.at(400, run); } });
    }, {threshold:0.5});
    io.observe(readout.closest('.loop-stage'));
  })();
})();

/* =====================================================================
   8. MARQUEE
   ===================================================================== */
(function(){
  const words = ['Python','FastAPI','React','TypeScript','XGBoost','Docker','RAG','TensorFlow',
                 'Groq','Whisper','SQLAlchemy','GitHub Actions','Scikit-learn','Flutter','AWS',
                 'Text2SQL','Streamlit','Supabase','Monte Carlo','Spring','pytest','Pydantic'];
  const track = $('#mq');
  const html = words.map(function(w){ return '<span>' + w + '</span>'; }).join('');
  track.innerHTML = html + html;
})();

/* =====================================================================
   9. CURSOR + MAGNETIC
   ===================================================================== */
(function(){
  if (!FINE || RM) return;
  const c = $('#cursor');
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
  window.addEventListener('pointermove', function(e){ x = e.clientX; y = e.clientY; c.classList.add('on'); }, {passive:true});
  (function loop(){
    cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
    c.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
    requestAnimationFrame(loop);
  })();
  $$('a, button').forEach(function(el){
    el.addEventListener('pointerenter', function(){ c.classList.add('big'); });
    el.addEventListener('pointerleave', function(){ c.classList.remove('big'); });
  });
  $$('.mag').forEach(function(el){
    el.addEventListener('pointermove', function(e){
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.30;
      el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    });
    el.addEventListener('pointerleave', function(){ el.style.transform = ''; });
  });
})();

/* =====================================================================
   9b. HERO PORTRAIT MAGNET  —  attracts + tilts within a radius, not just on hover
   ===================================================================== */
(function(){
  if (!FINE || RM) return;
  const wrap = $('#heroPortrait');
  if (!wrap) return;
  const PAD = 150, STRENGTH = 3, TILT = 14;
  const ACTIVE = 'transform 0.3s ease-out', INACTIVE = 'transform 0.6s ease-in-out';
  wrap.style.transition = INACTIVE;
  window.addEventListener('pointermove', function(e){
    const r = wrap.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const edgeDist = Math.max(Math.abs(dx) - r.width / 2, Math.abs(dy) - r.height / 2, 0);
    if (edgeDist < PAD) {
      wrap.style.transition = ACTIVE;
      const nx = Math.max(-1, Math.min(1, dx / (r.width / 2 + PAD)));
      const ny = Math.max(-1, Math.min(1, dy / (r.height / 2 + PAD)));
      wrap.style.transform =
        'translate3d(' + (dx / STRENGTH) + 'px,' + (dy / STRENGTH) + 'px,0) ' +
        'rotateY(' + (nx * TILT) + 'deg) rotateX(' + (-ny * TILT) + 'deg)';
    } else {
      wrap.style.transition = INACTIVE;
      wrap.style.transform = 'translate3d(0,0,0) rotateY(0) rotateX(0)';
    }
  }, {passive:true});
})();

/* =====================================================================
   10. TOAST
   ===================================================================== */
let toastT;
function toast(msg){
  const t = $('#toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(function(){ t.classList.remove('on'); }, 1900);
}

/* =====================================================================
   11. COMMAND PALETTE
   ===================================================================== */
(function(){
  const panel = $('#cmdk'), input = $('#cmdkInput'), list = $('#cmdkList');
  const ACTIONS = [
    {n:'Selected work',      h:'Section', go:function(){ jump('work'); }},
    {n:'How I build',        h:'Section', go:function(){ jump('loop'); }},
    {n:'About me',           h:'Section', go:function(){ jump('about'); }},
    {n:'Toolkit',            h:'Section', go:function(){ jump('toolkit'); }},
    {n:'Contact',            h:'Section', go:function(){ jump('contact'); }},
    {n:'Copy email address', h:'Copy',    go:function(){ copy('adnanmashrursadad@gmail.com', 'Email copied'); }},
    {n:'Copy phone number',  h:'Copy',    go:function(){ copy('+60 11-3968 7435', 'Number copied'); }},
    {n:'Open GitHub',        h:'External',go:function(){ open('https://github.com/sadad54'); }},
    {n:'Open LinkedIn',      h:'External',go:function(){ open('https://www.linkedin.com/in/adnan-mashrur-sadad-87a45b237'); }},
    {n:'Download résumé',    h:'File',    go:function(){ open('resume.pdf'); }},
    {n:'Replay the repair loop', h:'Demo',go:function(){ jump('loop'); setTimeout(function(){ $('#replay').click(); }, 700); }}
  ];
  let filtered = ACTIONS.slice(), sel = 0;

  function jump(id){ const el = document.getElementById(id); if (el) el.scrollIntoView({behavior: RM ? 'auto' : 'smooth'}); }
  function open(url){ window.open(url, '_blank', 'noopener'); }
  function copy(txt, msg){
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function(){ toast(msg); }).catch(function(){ toast(txt); });
    else toast(txt);
  }
  function render(){
    list.innerHTML = filtered.map(function(a, i){
      return '<li class="' + (i === sel ? 'sel' : '') + '"><button data-i="' + i + '"><span class="nm">' + a.n + '</span><span class="hint">' + a.h + '</span></button></li>';
    }).join('') || '<li><button><span class="nm" style="color:var(--dimmer)">Nothing matches that</span></button></li>';
  }
  function show(){
    panel.classList.add('open'); document.body.classList.add('is-locked');
    input.value = ''; filtered = ACTIONS.slice(); sel = 0; render();
    setTimeout(function(){ input.focus(); }, 30);
  }
  function hide(){ panel.classList.remove('open'); document.body.classList.remove('is-locked'); }
  function fire(i){ const a = filtered[i]; if (!a) return; hide(); setTimeout(a.go, 60); }

  $('#cmdk-open').addEventListener('click', show);
  panel.addEventListener('click', function(e){
    if (e.target.hasAttribute('data-close')) hide();
    const b = e.target.closest('button[data-i]');
    if (b) fire(parseInt(b.dataset.i, 10));
  });
  input.addEventListener('input', function(){
    const q = input.value.toLowerCase().trim();
    filtered = ACTIONS.filter(function(a){ return (a.n + ' ' + a.h).toLowerCase().includes(q); });
    sel = 0; render();
  });
  document.addEventListener('keydown', function(e){
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); panel.classList.contains('open') ? hide() : show(); return; }
    if (!panel.classList.contains('open')) return;
    if (e.key === 'Escape'){ hide(); }
    else if (e.key === 'ArrowDown'){ e.preventDefault(); sel = Math.min(sel + 1, filtered.length - 1); render(); }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
    else if (e.key === 'Enter'){ e.preventDefault(); fire(sel); }
  });
})();

/* =====================================================================
   12. SMOOTH ANCHORS
   ===================================================================== */
$$('a[href^="#"]').forEach(function(a){
  a.addEventListener('click', function(e){
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({behavior: RM ? 'auto' : 'smooth'});
  });
});

}
