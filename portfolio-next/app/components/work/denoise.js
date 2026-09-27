/* =========================================================================
   DENOISE — the stage's transition, borrowed from how diffusion models
   sample: the outgoing image is noised forward (x_t = √(1−σ²)·x₀ + σ·ε),
   then the incoming one is recovered in discrete sampling steps with fresh
   noise each step, coarse structure first and detail last. Raw WebGL, one
   fullscreen triangle, two textures. Falls back to a 2-D crossfade.
   ========================================================================= */

const VS = `
attribute vec2 p;
varying vec2 vUv;
void main(){ vUv = p * 0.5 + 0.5; vUv.y = 1.0 - vUv.y; gl_Position = vec4(p, 0.0, 1.0); }
`;

const FS = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uA;
uniform sampler2D uB;
uniform float uMix;
uniform float uSigma;
uniform float uSeed;
uniform float uBlock;
uniform float uGrain;
uniform vec2 uRes;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uSeed * 17.131) * 43758.5453); }
vec3 gauss(vec2 p){
  vec3 a = vec3(h(p), h(p + 3.7), h(p + 7.1));
  vec3 b = vec3(h(p + 11.3), h(p + 13.9), h(p + 17.3));
  vec3 c = vec3(h(p + 19.1), h(p + 23.7), h(p + 29.9));
  return (a + b + c - 1.5) * 2.0;
}
void main(){
  vec2 px = vUv * uRes;
  vec2 q = (floor(px / uBlock) + 0.5) * uBlock / uRes;
  vec2 uv = uBlock > 1.01 ? q : vUv;
  vec3 img = mix(texture2D(uA, uv).rgb, texture2D(uB, uv).rgb, uMix);
  vec3 x0 = img * 2.0 - 1.0;
  vec3 eps = gauss(floor(px / uGrain));
  // a touch of the palette in the noise: cool-biased static, ember speckle
  eps += vec3(0.12, 0.0, -0.06) * step(0.985, h(floor(px / uGrain) + 5.0)) * 6.0;
  float s = uSigma;
  vec3 xt = sqrt(max(0.0, 1.0 - s * s)) * x0 + s * eps * 0.62;
  gl_FragColor = vec4(clamp(xt * 0.5 + 0.5, 0.0, 1.0), 1.0);
}
`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class DenoiseStage {
  constructor(canvas, { reduced = false } = {}) {
    this.cv = canvas;
    this.reduced = reduced;
    this.token = 0;
    this.hasImage = false;
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
    this.gl = gl;
    if (!gl) {
      this.ctx2d = canvas.getContext('2d');
      return;
    }
    const vs = compile(gl, gl.VERTEX_SHADER, VS);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FS);
    const pr = gl.createProgram();
    gl.attachShader(pr, vs);
    gl.attachShader(pr, fs);
    gl.linkProgram(pr);
    gl.useProgram(pr);
    this.pr = pr;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.u = {};
    ['uA', 'uB', 'uMix', 'uSigma', 'uSeed', 'uBlock', 'uGrain', 'uRes'].forEach((n) => (this.u[n] = gl.getUniformLocation(pr, n)));
    this.tex = [0, 1].map(() => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([11, 13, 17, 255]));
      return t;
    });
    gl.uniform1i(this.u.uA, 0);
    gl.uniform1i(this.u.uB, 1);
    this.front = 0; // which texture holds the image currently on screen
  }

  upload(slot, source) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + slot);
    gl.bindTexture(gl.TEXTURE_2D, this.tex[slot]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
  }

  draw({ mix, sigma, seed, block }) {
    const gl = this.gl;
    gl.viewport(0, 0, this.cv.width, this.cv.height);
    // texture unit 0 = A (front), unit 1 = B (back)
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex[this.front]);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.tex[1 - this.front]);
    gl.uniform1f(this.u.uMix, mix);
    gl.uniform1f(this.u.uSigma, sigma);
    gl.uniform1f(this.u.uSeed, seed);
    gl.uniform1f(this.u.uBlock, Math.max(1, block));
    gl.uniform1f(this.u.uGrain, Math.max(1, Math.round(this.cv.width / 520)));
    gl.uniform2f(this.u.uRes, this.cv.width, this.cv.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  /**
   * Show a composed board. mode: 'switch' (full noise-out / denoise-in),
   * 'cycle' (a light resample between frames of one project), 'instant'.
   * onStep(k, total) reports sampling progress; resolves when done.
   */
  show(board, { mode = 'switch', onStep } = {}) {
    const my = ++this.token;
    if (!this.gl) {
      const c = this.ctx2d;
      c.globalAlpha = 1;
      c.drawImage(board, 0, 0, this.cv.width, this.cv.height);
      return Promise.resolve();
    }
    const back = 1 - this.front;
    this.upload(back, board);
    const first = !this.hasImage;
    this.hasImage = true;
    if (this.reduced || mode === 'instant') {
      this.front = back;
      this.draw({ mix: 0, sigma: 0, seed: 0, block: 1 });
      onStep?.(0, 0);
      return Promise.resolve();
    }

    const cycle = mode === 'cycle';
    const T_OUT = first ? 0 : cycle ? 260 : 340;
    const T_IN = cycle ? 520 : 980;
    const STEPS = cycle ? 8 : 24;
    const PEAK = cycle ? 0.5 : 1;
    const t0 = performance.now();

    return new Promise((resolve) => {
      const frame = (now) => {
        if (my !== this.token) return resolve();
        const el = now - t0;
        if (el < T_OUT) {
          // forward process on the outgoing image
          const s = ease(el / T_OUT) * PEAK;
          this.draw({ mix: 0, sigma: s, seed: Math.floor(el / 40), block: 1 });
          requestAnimationFrame(frame);
          return;
        }
        const u = Math.min(1, (el - T_OUT) / T_IN);
        const k = Math.min(STEPS, Math.floor(u * STEPS));
        const q = k / STEPS; // quantised: the image resolves in visible steps
        const sigma = PEAK * Math.pow(1 - q, 1.35);
        const block = cycle ? 1 : Math.max(1, Math.round(28 * Math.pow(1 - q, 2.2)));
        this.draw({ mix: 1, sigma, seed: k + 1, block });
        onStep?.(k, STEPS);
        if (u < 1) requestAnimationFrame(frame);
        else {
          this.front = back;
          this.draw({ mix: 0, sigma: 0, seed: 0, block: 1 });
          resolve();
        }
      };
      requestAnimationFrame(frame);
    });
  }

  resize(w, h) {
    this.cv.width = w;
    this.cv.height = h;
  }

  destroy() {
    this.token++;
    const gl = this.gl;
    if (!gl) return;
    this.tex.forEach((t) => gl.deleteTexture(t));
    gl.deleteProgram(this.pr);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}
