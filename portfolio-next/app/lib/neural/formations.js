/* =========================================================================
   FORMATIONS — every particle has one assigned position per formation, all
   uploaded once. The vertex shader blends between neighbouring formations
   as the page scrolls, so a morph costs one uniform write per frame.

     0  NETWORK    hero        a 7-layer net; data flows left → right
     1  CLUSTERS   work        four semantic clusters and the bridges between
     2  ATTENTION  thesis      token blocks, attention arcs, embeddings
     3  LANDSCAPE  decisions   a loss surface with a real gradient-descent path
     4  MATRIX     research    a weight matrix rendered as a heatmap
     5  SPHERE     model card  a clustered hypersphere (normalised embeddings)

   Slot numbers follow the page order, so a morph between neighbouring
   sections never flies through a third shape. The arrays below are still
   built in the original order; engine.js maps slot → array.
     6  BRAIN      backward    the wetware: two hemispheres, gyri drawn as lines
     7  NETWORK    backward    …rewired into the software (shares slot 0)
     8  STARRY     corpus      a turning night sky of vortices, after Van Gogh
     9  NETWORK    contact     back where it started (shares slot 0)

   Heat (0..1) is art direction per formation: 0 renders cool and dim, 1
   renders ember and larger. Everything is seeded — the same field every load.
   ========================================================================= */
import { prng } from '../motion';

const TAU = Math.PI * 2;

function gauss(rnd) {
  // Box–Muller
  let u = 0,
    v = 0;
  while (u === 0) u = rnd();
  while (v === 0) v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
}

export function buildFormations(N) {
  const rnd = prng(20260927);

  const A = new Float32Array(N * 3); // network: edge start / node (also `position`)
  const A2 = new Float32Array(N * 3); // network: edge end
  const B = new Float32Array(N * 3); // attention
  const C = new Float32Array(N * 3); // sphere
  const D = new Float32Array(N * 3); // landscape
  const E = new Float32Array(N * 3); // clusters
  const G = new Float32Array(N * 3); // matrix
  const I = new Float32Array(N * 3); // brain
  const J = new Float32Array(N * 3); // starry: orbit centre x, y and depth z
  const H1 = new Float32Array(N * 4); // heat6 (brain), heat8 (starry), starry orbit radius (signed = direction), starry angle
  const FH = new Float32Array(N * 4); // flow phase, flow speed, heat4, heat5
  const H0 = new Float32Array(N * 4); // heat 0..3
  const R = new Float32Array(N * 4); // rand phase, size, morph delay, swirl
  let LINES = null; // network synapses for the line pass: [ax,ay,az,bx,by,bz] + weight
  let LINEW = null;
  let LAND = null; // landscape wireframe for the line pass
  let LANDW = null;
  let BRAIN = null; // the brain's outline and folds for the line pass
  let BRAINW = null;

  const set3 = (arr, i, x, y, z) => {
    arr[i * 3] = x;
    arr[i * 3 + 1] = y;
    arr[i * 3 + 2] = z;
  };

  // The engine drops the tail of the buffer on slow devices. Formations built
  // part by part write through this shuffle, so every part thins out evenly
  // instead of the last one vanishing.
  const perm = Array.from({ length: N }, (_, i) => i);
  for (let i = N - 1; i > 0; i--) {
    const j = (rnd() * (i + 1)) | 0;
    const t = perm[i];
    perm[i] = perm[j];
    perm[j] = t;
  }

  for (let i = 0; i < N; i++) {
    R[i * 4] = rnd();
    R[i * 4 + 1] = 0.55 + rnd() * 0.75;
    R[i * 4 + 2] = rnd();
    R[i * 4 + 3] = rnd();
  }

  // ---------------------------------------------------------------- 0 NETWORK
  {
    const SIZES = [5, 9, 13, 16, 13, 9, 5];
    const L = SIZES.length;
    const layers = SIZES.map((n, l) => {
      const x = -4.3 + (8.6 * l) / (L - 1);
      const R0 = 0.62 + 0.13 * n;
      const nodes = [];
      for (let k = 0; k < n; k++) {
        const inner = n >= 13 && k % 3 === 2;
        const r = inner ? R0 * 0.52 : R0;
        const a = (k / n) * TAU + l * 0.37 + (inner ? 0.4 : 0);
        nodes.push({ p: [x + (rnd() - 0.5) * 0.12, Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.9], a, hot: rnd() < 0.22 });
      }
      return nodes;
    });
    const edges = [];
    for (let l = 0; l < L - 1; l++) {
      const cur = layers[l];
      const nxt = layers[l + 1];
      cur.forEach((nd) => {
        const byAngle = nxt
          .map((m, j) => {
            let d = Math.abs(((m.a - nd.a + Math.PI * 3) % TAU) - Math.PI);
            return [d, j];
          })
          .sort((p, q) => p[0] - q[0]);
        for (let k = 0; k < 3; k++) edges.push([nd, nxt[byAngle[k][1]]]);
      });
    }
    const nodes = layers.flat();
    LINES = new Float32Array(edges.length * 6);
    LINEW = new Float32Array(edges.length * 2);
    edges.forEach(([a, b], k) => {
      LINES.set(a.p, k * 6);
      LINES.set(b.p, k * 6 + 3);
      const w = rnd();
      LINEW[k * 2] = w;
      LINEW[k * 2 + 1] = w;
    });

    let i = 0;
    // nodes: tight glowing clusters
    const PER_NODE = Math.max(8, Math.round((N * 0.06) / nodes.length));
    nodes.forEach((nd) => {
      for (let k = 0; k < PER_NODE && i < N; k++, i++) {
        // k = 0 is the soma: one large soft point; the rest are satellites
        const s = k === 0 ? 0 : 0.03 + rnd() * 0.05;
        const x = nd.p[0] + gauss(rnd) * s,
          y = nd.p[1] + gauss(rnd) * s,
          z = nd.p[2] + gauss(rnd) * s;
        set3(A, i, x, y, z);
        set3(A2, i, x, y, z);
        FH[i * 4] = 0;
        FH[i * 4 + 1] = 0;
        H0[i * 4] = nd.hot ? 0.95 : k === 0 ? 0.55 : 0.3;
        R[i * 4 + 1] = k === 0 ? 3.6 + rnd() * 1.2 : 0.7 + rnd() * 0.6;
      }
    });
    // firing pulses: short comet trains racing along random edges
    const trains = Math.round((N * 0.03) / 7);
    for (let t = 0; t < trains; t++) {
      const [a, b] = edges[(rnd() * edges.length) | 0];
      const base = rnd();
      const speed = 0.32 + rnd() * 0.3;
      for (let k = 0; k < 7 && i < N; k++, i++) {
        set3(A, i, ...a.p);
        set3(A2, i, ...b.p);
        FH[i * 4] = base - k * 0.011;
        FH[i * 4 + 1] = speed;
        H0[i * 4] = 1 - k * 0.1;
        R[i * 4 + 1] = 1.5 - k * 0.12;
      }
    }
    // ambient dust for depth
    const dust = Math.round(N * 0.07);
    for (let k = 0; k < dust && i < N; k++, i++) {
      const x = (rnd() - 0.5) * 16,
        y = (rnd() - 0.5) * 9,
        z = -5 + rnd() * 6;
      set3(A, i, x, y, z);
      set3(A2, i, x, y, z);
      FH[i * 4 + 1] = 0;
      H0[i * 4] = 0;
      R[i * 4 + 1] = 0.4 + rnd() * 0.5;
    }
    // synapses: everything left, spread across edges, drifting forward
    const rest = N - i;
    for (let k = 0; k < rest; k++, i++) {
      const [a, b] = edges[k % edges.length];
      const j = 0.015;
      set3(A, i, a.p[0] + gauss(rnd) * j, a.p[1] + gauss(rnd) * j, a.p[2] + gauss(rnd) * j);
      set3(A2, i, b.p[0] + gauss(rnd) * j, b.p[1] + gauss(rnd) * j, b.p[2] + gauss(rnd) * j);
      FH[i * 4] = rnd();
      FH[i * 4 + 1] = 0.018 + rnd() * 0.03;
      H0[i * 4] = 0.1;
      R[i * 4 + 1] = 0.5 + rnd() * 0.4;
    }
  }

  // -------------------------------------------------------------- 1 ATTENTION
  {
    const T = 9;
    const X0 = -4.6,
      X1 = 4.6,
      TY = -1.85;
    const tokX = Array.from({ length: T }, (_, t) => X0 + ((X1 - X0) * t) / (T - 1));
    const pairs = [
      [0, 3, 0.95], [1, 3, 0.5], [2, 5, 0.9], [3, 8, 0.75], [4, 6, 0.4], [5, 8, 0.85],
      [0, 8, 0.3], [6, 8, 0.55], [1, 4, 0.25], [2, 7, 0.35], [3, 5, 0.6], [0, 5, 0.2],
      [4, 8, 0.45], [6, 7, 0.3], [1, 6, 0.2],
    ];
    const blockN = Math.round(N * 0.18);
    const embN = Math.round(N * 0.16);
    const dustN = Math.round(N * 0.08);
    const arcN = N - blockN - embN - dustN;
    let i = 0;
    for (let k = 0; k < blockN; k++, i++) {
      const t = k % T;
      set3(B, i, tokX[t] + (rnd() - 0.5) * 0.66, TY + (rnd() - 0.5) * 0.28, (rnd() - 0.5) * 0.18);
      H0[i * 4 + 1] = t === 3 || t === 5 || t === 8 ? 0.85 : 0.25;
    }
    // embedding columns under each token
    const embVals = Array.from({ length: T * 10 }, () => 0.15 + rnd() * 0.85);
    for (let k = 0; k < embN; k++, i++) {
      const t = k % T;
      const dIdx = ((k / T) | 0) % 10;
      const h = embVals[t * 10 + dIdx];
      const x = tokX[t] - 0.3 + (dIdx / 9) * 0.6;
      const y = TY - 0.3 - rnd() * h * 0.95;
      set3(B, i, x + (rnd() - 0.5) * 0.02, y, (rnd() - 0.5) * 0.08);
      H0[i * 4 + 1] = h > 0.8 ? 0.6 : 0.08;
    }
    // attention arcs (weighted: strong arcs get more particles and more heat)
    const wsum = pairs.reduce((s, p) => s + p[2], 0);
    let made = 0;
    pairs.forEach(([a, b, w], pi) => {
      const cnt = pi === pairs.length - 1 ? arcN - made : Math.round((arcN * w) / wsum);
      made += cnt;
      const xa = tokX[a],
        xb = tokX[b];
      const peak = TY + 0.35 + 0.42 * (b - a) + 0.25;
      for (let k = 0; k < cnt && i < N; k++, i++) {
        const u = rnd();
        // quadratic bezier from token a top to token b top
        const cx = (xa + xb) / 2,
          cy = peak * 2 - (TY + 0.18);
        const x = (1 - u) * (1 - u) * xa + 2 * (1 - u) * u * cx + u * u * xb;
        const y = (1 - u) * (1 - u) * (TY + 0.18) + 2 * (1 - u) * u * cy + u * u * (TY + 0.18);
        set3(B, i, x + gauss(rnd) * 0.012, y + gauss(rnd) * 0.012, (rnd() - 0.5) * 0.1 + Math.sin(u * Math.PI) * (pi % 2 ? 0.35 : -0.35));
        H0[i * 4 + 1] = w > 0.7 ? 0.9 : w * 0.45;
      }
    });
    for (; i < N; i++) {
      set3(B, i, (rnd() - 0.5) * 16, (rnd() - 0.5) * 9, -5 + rnd() * 6);
      H0[i * 4 + 1] = 0;
    }
  }

  // ----------------------------------------------------------------- 2 SPHERE
  {
    const RAD = 2.75;
    const centers = Array.from({ length: 9 }, () => {
      const u = rnd() * 2 - 1,
        th = rnd() * TAU,
        s = Math.sqrt(1 - u * u);
      return [s * Math.cos(th), u, s * Math.sin(th)];
    });
    for (let i = 0; i < N; i++) {
      let v;
      const r = rnd();
      let hot = 0.12;
      if (r < 0.62) {
        const ci = (rnd() * centers.length) | 0;
        const c = centers[ci];
        v = [c[0] + gauss(rnd) * 0.2, c[1] + gauss(rnd) * 0.2, c[2] + gauss(rnd) * 0.2];
        if (ci === 0) hot = 0.95;
        else if (ci === 4) hot = 0.35;
      } else {
        const u = rnd() * 2 - 1,
          th = rnd() * TAU,
          s = Math.sqrt(1 - u * u);
        v = [s * Math.cos(th), u, s * Math.sin(th)];
      }
      const len = Math.hypot(v[0], v[1], v[2]) || 1;
      const shell = r > 0.9 ? 0.35 + rnd() * 0.55 : 1 + gauss(rnd) * 0.012;
      set3(C, i, (v[0] / len) * RAD * shell, (v[1] / len) * RAD * shell, (v[2] / len) * RAD * shell);
      H0[i * 4 + 2] = hot;
    }
  }

  // -------------------------------------------------------------- 3 LANDSCAPE
  // A loss surface drawn as a wireframe (line pass) with particles on its
  // vertices, plus two real gradient-descent runs: one rolls into the global
  // minimum (hot), one settles in a local minimum (warm) — the reason you
  // check the number instead of trusting the first answer.
  {
    const h = (x, z) =>
      1.05 * Math.exp(-((x - 3.2) ** 2 + (z + 2.4) ** 2) / 2.6) +
      0.75 * Math.exp(-((x + 5) ** 2 + (z + 3.4) ** 2) / 3.5) -
      1.35 * Math.exp(-((x + 0.9) ** 2 + (z + 0.5) ** 2) / 5.5) -
      0.35 * Math.exp(-((x - 5.2) ** 2 + (z - 0.9) ** 2) / 1.4) +
      0.06 * Math.sin(x * 1.3) * Math.cos(z * 1.1);
    const tilt = -0.72;
    const ct = Math.cos(tilt),
      st = Math.sin(tilt);
    const tf = (x, y, z) => [x, y * ct - z * st - 1.35, y * st + z * ct];
    const descend = (sx, sz) => {
      const pts = [];
      let px = sx,
        pz = sz;
      for (let k = 0; k < 220; k++) {
        pts.push([px, h(px, pz), pz]);
        const e = 0.01;
        const gx = (h(px + e, pz) - h(px - e, pz)) / (2 * e);
        const gz = (h(px, pz + e) - h(px, pz - e)) / (2 * e);
        px -= gx * 0.3;
        pz -= gz * 0.3;
      }
      // resample by arc length so particles spread evenly along the run
      const cum = [0];
      for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][2] - pts[k - 1][2]));
      const total = cum[cum.length - 1];
      return (u) => {
        const d = u * total;
        let k = 1;
        while (k < cum.length - 1 && cum[k] < d) k++;
        const t = (d - cum[k - 1]) / Math.max(1e-6, cum[k] - cum[k - 1]);
        const a = pts[k - 1],
          b = pts[k];
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
      };
    };
    const good = descend(2.9, -2.2);
    const stuck = descend(3.3, -2.1);

    const X0 = -7.8,
      X1 = 7.8,
      Z0 = -6.4,
      Z1 = 3.2;
    const LC = 52,
      LR = 24;
    // wireframe for the line pass
    const segs = LR * (LC - 1) + LC * (LR - 1);
    LAND = new Float32Array(segs * 6);
    LANDW = new Float32Array(segs * 2);
    const vx = (c) => X0 + ((X1 - X0) * c) / (LC - 1);
    const vz = (r) => Z0 + ((Z1 - Z0) * r) / (LR - 1);
    const depth = (x, z) => Math.min(1, Math.max(0, (0.5 - h(x, z)) / 1.9));
    let q = 0;
    const seg = (x1, z1, x2, z2) => {
      LAND.set(tf(x1, h(x1, z1), z1), q * 6);
      LAND.set(tf(x2, h(x2, z2), z2), q * 6 + 3);
      LANDW[q * 2] = depth(x1, z1);
      LANDW[q * 2 + 1] = depth(x2, z2);
      q++;
    };
    for (let r = 0; r < LR; r++) for (let c = 0; c < LC - 1; c++) seg(vx(c), vz(r), vx(c + 1), vz(r));
    for (let c = 0; c < LC; c++) for (let r = 0; r < LR - 1; r++) seg(vx(c), vz(r), vx(c), vz(r + 1));

    const goodN = Math.round(N * 0.07);
    const stuckN = Math.round(N * 0.035);
    const vertN = N - goodN - stuckN;
    let i = 0;
    for (let k = 0; k < vertN; k++, i++) {
      const cell = k % (LC * LR);
      const c = cell % LC,
        r = (cell / LC) | 0;
      const x = vx(c),
        z = vz(r);
      set3(D, i, ...tf(x + (rnd() - 0.5) * 0.01, h(x, z), z + (rnd() - 0.5) * 0.01));
      H0[i * 4 + 3] = 0.12 + depth(x, z) * 0.35;
    }
    for (let k = 0; k < goodN; k++, i++) {
      const [x, y, z] = good(k / goodN);
      set3(D, i, ...tf(x + gauss(rnd) * 0.012, y + 0.05, z + gauss(rnd) * 0.012));
      H0[i * 4 + 3] = 1;
    }
    for (let k = 0; k < stuckN; k++, i++) {
      const [x, y, z] = stuck(k / stuckN);
      set3(D, i, ...tf(x + gauss(rnd) * 0.012, y + 0.05, z + gauss(rnd) * 0.012));
      H0[i * 4 + 3] = 0.62;
    }
  }

  // --------------------------------------------------------------- 4 CLUSTERS
  {
    const cs = [
      [-4.4, 1.25, -1.2, 0.85],
      [-1.4, -1.35, 0.2, 0.7],
      [1.9, 1.45, -1.8, 0.95],
      [4.6, -0.9, 0.1, 0.7],
    ];
    for (let i = 0; i < N; i++) {
      const r = rnd();
      if (r < 0.86) {
        const c = cs[(rnd() * cs.length) | 0];
        set3(E, i, c[0] + gauss(rnd) * c[3], c[1] + gauss(rnd) * c[3] * 0.8, c[2] + gauss(rnd) * c[3]);
        FH[i * 4 + 2] = rnd() < 0.05 ? 0.8 : 0.14;
      } else {
        const a = cs[(rnd() * cs.length) | 0],
          b = cs[(rnd() * cs.length) | 0];
        const u = rnd();
        set3(E, i, a[0] + (b[0] - a[0]) * u + gauss(rnd) * 0.08, a[1] + (b[1] - a[1]) * u + gauss(rnd) * 0.08, a[2] + (b[2] - a[2]) * u);
        FH[i * 4 + 2] = 0.2;
      }
    }
  }

  // ----------------------------------------------------------------- 5 MATRIX
  // Three stacked weight matrices (a tensor, or three attention heads), each
  // a coarse grid of cells; heat is a smooth random field, so hot regions
  // read as learned structure rather than noise.
  {
    const fields = [0, 1, 2].map(() => {
      const blobs = Array.from({ length: 9 }, () => [(rnd() - 0.5) * 11, (rnd() - 0.5) * 5, 0.5 + rnd() * 1.4, 0.4 + rnd() * 0.8]);
      return (x, y) => blobs.reduce((acc, b) => acc + b[3] * Math.exp(-((x - b[0]) ** 2 + (y - b[1]) ** 2) / b[2]), 0);
    });
    const cols = 40,
      rows = 18;
    const W = 11.2,
      Hh = 5;
    const rotY = -0.42,
      cy = Math.cos(rotY),
      sy = Math.sin(rotY);
    const gridN = Math.round(N * 0.94);
    let i = 0;
    for (let k = 0; k < gridN; k++, i++) {
      const layer = k % 3;
      const cell = ((k / 3) | 0) % (cols * rows);
      const c = cell % cols,
        r = (cell / cols) | 0;
      const x = -W / 2 + (W * c) / (cols - 1);
      const y = -Hh / 2 + (Hh * r) / (rows - 1);
      const v = fields[layer](x, y);
      const lx = x + layer * 0.55,
        ly = y + layer * 0.42,
        lz = -layer * 1.5 + (rnd() - 0.5) * 0.01;
      set3(G, i, lx * cy + lz * sy, ly, -lx * sy + lz * cy);
      FH[i * 4 + 3] = Math.min(1, 0.1 + Math.max(0, (v - 0.35) * 1.15)) * (1 - layer * 0.18);
    }
    for (; i < N; i++) {
      set3(G, i, (rnd() - 0.5) * 16, (rnd() - 0.5) * 9, -5 + rnd() * 5);
      FH[i * 4 + 3] = 0;
    }
  }

  // ------------------------------------------------------------------ 6 BRAIN
  // Two hemispheres seen from the side. Particles are rejection-sampled onto
  // the zero-crossings of a warped sine field, which meander across a surface
  // the way gyri do; a thin fill keeps the silhouette. A few regions run hot.
  {
    const fold = (x, y, z) =>
      Math.sin(2.1 * x + 1.7 * Math.sin(1.7 * y + 1.1 * z)) +
      Math.sin(2.5 * y + 1.5 * Math.sin(1.9 * z - 0.9 * x)) +
      Math.sin(2.3 * z + 1.6 * Math.sin(1.8 * x + y));
    const active = [
      [1.55, 0.55, 0.9, 0.75],
      [-0.2, -0.45, -0.95, 0.6],
      [-1.3, 0.85, 0.75, 0.55],
    ];
    const glow = (x, y, z) => active.reduce((g, a) => Math.max(g, Math.exp(-((x - a[0]) ** 2 + (y - a[1]) ** 2 + (z - a[2]) ** 2) / (a[3] * a[3]))), 0);
    const K = 0.9;
    const place = (x, y, z) => [-x * K + 0.25, y * K + 0.35, z * K]; // frontal lobe faces the copy
    const put = (n, x, y, z, heat) => {
      const i = perm[n];
      set3(I, i, ...place(x, y, z));
      H1[i * 4] = heat;
    };
    const rimN = Math.round(N * 0.1);
    const cortexN = rimN + Math.round(N * 0.68);
    const cerebN = Math.round(N * 0.1);
    const stemN = Math.round(N * 0.035);
    // the underside: flat, with the temporal lobe bulging below the middle
    const underOf = (x) => 1.05 + 0.5 * Math.exp(-((x - 0.45) ** 2) / 0.9) - 0.25 * Math.exp(-((x - 2.1) ** 2) / 0.5);
    const topOf = (x) => 1.72 - 0.1 * Math.max(0, x - 1.2);
    let i = 0;
    // the profile first: the outline you would draw if asked to draw a brain
    for (; i < rimN; i++) {
      const a = rnd() * TAU;
      const x = Math.cos(a) * 2.55,
        dy = Math.sin(a);
      const y = dy > 0 ? dy * topOf(x) : dy * underOf(x);
      put(i, x + gauss(rnd) * 0.012, y + gauss(rnd) * 0.012, (rnd() < 0.5 ? -1 : 1) * (0.07 + rnd() * 0.1), 0.34);
    }
    let guard = 0;
    while (i < cortexN && guard++ < N * 40) {
      const u = rnd() * 2 - 1,
        th = rnd() * TAU,
        s = Math.sqrt(1 - u * u);
      const dx = s * Math.cos(th),
        dy = u,
        dz = Math.abs(s * Math.sin(th));
      const side = rnd() < 0.5 ? -1 : 1;
      const x = dx * 2.55;
      const y = dy > 0 ? dy * topOf(x) : dy * underOf(x);
      const z = (0.07 + dz * 0.95) * side;
      const n = Math.abs(fold(x, y, z + side * 3.1));
      const line = n < 0.11;
      if (!line && rnd() > 0.02) continue;
      const sink = line ? 0.965 : 1; // sulci sit a touch below the surface
      const g = glow(x, y, z);
      put(i, x * sink + gauss(rnd) * 0.008, y * sink + gauss(rnd) * 0.008, z * sink + gauss(rnd) * 0.008, line ? 0.3 + 0.7 * g : 0.03 + 0.3 * g);
      i++;
    }
    // cerebellum: a striated lobe tucked under the back
    for (let k = 0; k < cerebN && i < N; ) {
      const u = rnd() * 2 - 1,
        th = rnd() * TAU,
        s = Math.sqrt(1 - u * u);
      const y = -1.22 + u * 0.58;
      if (((y * 11) % 1 + 1) % 1 > 0.4) continue;
      put(i, -1.75 + s * Math.cos(th) * 0.85, y, s * Math.sin(th) * 0.9, 0.2);
      i++;
      k++;
    }
    // brain stem
    for (let k = 0; k < stemN && i < N; k++, i++) {
      const t = rnd(),
        a = rnd() * TAU,
        r = 0.32 - 0.12 * t;
      put(i, -0.8 - 0.3 * t + Math.cos(a) * r, -1.05 - 1.7 * t, Math.sin(a) * r, 0.14 + (rnd() < 0.06 ? 0.7 : 0));
    }
    for (; i < N; i++) {
      set3(I, perm[i], (rnd() - 0.5) * 16, (rnd() - 0.5) * 9, -5 + rnd() * 5);
      H1[perm[i] * 4] = 0;
    }

    // The same shape as 1px strokes for the line pass: dots alone read as
    // dust, lines read as a drawing. Folds are the zero-contour of `fold`,
    // found by marching squares over each hemisphere's (angle, lift) grid.
    const segs = [];
    const line = (a, b, w) => segs.push([place(...a), place(...b), w]);
    const SINK = 0.965;
    const surf = (al, be, side) => {
      const cb = Math.cos(be);
      const x = Math.cos(al) * cb * 2.55,
        dy = Math.sin(al) * cb;
      const y = dy > 0 ? dy * topOf(x) : dy * underOf(x);
      return [x * SINK, y * SINK, (0.07 + Math.sin(be) * 0.95) * side * SINK];
    };
    const GA = 132,
      GB = 44;
    for (const side of [-1, 1]) {
      const P = [],
        V = [];
      for (let b = 0; b <= GB; b++) {
        for (let a = 0; a <= GA; a++) {
          const p = surf((a / GA) * TAU, (b / GB) * (Math.PI / 2) * 0.985, side);
          P.push(p);
          V.push(fold(p[0] / SINK, p[1] / SINK, p[2] / SINK + side * 3.1));
        }
      }
      const at = (a, b) => b * (GA + 1) + a;
      const cross = (i0, i1) => {
        const t = V[i0] / (V[i0] - V[i1]);
        return [P[i0][0] + (P[i1][0] - P[i0][0]) * t, P[i0][1] + (P[i1][1] - P[i0][1]) * t, P[i0][2] + (P[i1][2] - P[i0][2]) * t];
      };
      for (let b = 0; b < GB; b++) {
        for (let a = 0; a < GA; a++) {
          const c = [at(a, b), at(a + 1, b), at(a + 1, b + 1), at(a, b + 1)];
          const pts = [];
          for (let e = 0; e < 4; e++) {
            const i0 = c[e],
              i1 = c[(e + 1) % 4];
            if (V[i0] > 0 !== V[i1] > 0) pts.push(cross(i0, i1));
          }
          if (pts.length === 2 || pts.length === 4) {
            for (let e = 0; e < pts.length; e += 2) {
              const m = pts[e];
              line(pts[e], pts[e + 1], 0.42 + 0.58 * glow(m[0], m[1], m[2]));
            }
          }
        }
      }
      // the profile, drawn once per hemisphere either side of the fissure
      const RIM = 150;
      for (let k = 0; k < RIM; k++) line(surf((k / RIM) * TAU, 0, side), surf(((k + 1) / RIM) * TAU, 0, side), 0.62);
    }
    // cerebellum: stacked rings; brain stem: four edges
    for (let r = 0; r < 7; r++) {
      const u = -0.86 + (r / 6) * 1.72,
        s = Math.sqrt(1 - u * u),
        y = -1.22 + u * 0.58;
      for (let k = 0; k < 40; k++) {
        const t0 = (k / 40) * TAU,
          t1 = ((k + 1) / 40) * TAU;
        line([-1.75 + s * Math.cos(t0) * 0.85, y, s * Math.sin(t0) * 0.9], [-1.75 + s * Math.cos(t1) * 0.85, y, s * Math.sin(t1) * 0.9], 0.34);
      }
    }
    for (let e = 0; e < 4; e++) {
      const a = (e / 4) * TAU + 0.6;
      line([-0.8 + Math.cos(a) * 0.32, -1.05, Math.sin(a) * 0.32], [-1.1 + Math.cos(a) * 0.2, -2.75, Math.sin(a) * 0.2], 0.3);
    }
    BRAIN = new Float32Array(segs.length * 6);
    BRAINW = new Float32Array(segs.length * 2);
    segs.forEach(([a, b, w], k) => {
      BRAIN.set(a, k * 6);
      BRAIN.set(b, k * 6 + 3);
      BRAINW[k * 2] = w;
      BRAINW[k * 2 + 1] = w;
    });
  }

  // ----------------------------------------------------------------- 8 STARRY
  // Every particle orbits a centre, so the sky turns: J holds the centre and
  // depth, H1.z the radius (sign = direction) and H1.w the starting angle. A
  // radius above 8 marks a wind band: a slice of a very large circle, whose
  // angle wraps (H1.w is then a 0..1 phase). The shader draws each particle as
  // a dash along its orbit — a brush stroke.
  {
    const orbit = (n, cx, cy, z, r, th, heat) => {
      const i = perm[n];
      set3(J, i, cx, cy, z);
      H1[i * 4 + 1] = heat;
      H1[i * 4 + 2] = r;
      H1[i * 4 + 3] = th;
    };
    let i = 0;
    const take = (frac) => Math.round(N * frac);
    // the great swirl: two interlocked spiral arms
    for (let k = 0, n = take(0.27); k < n && i < N; k++, i++) {
      const t = Math.sqrt(rnd()) * 1.75 * Math.PI;
      const arm = k % 2 ? Math.PI : 0;
      // each arm is three brush-widths side by side
      const lane = ((k >> 1) % 3) - 1;
      const r = 0.16 + 0.44 * t + lane * 0.11 + gauss(rnd) * 0.022;
      orbit(i, -0.5, 1.05, gauss(rnd) * 0.1, -Math.max(0.05, r), -t + arm, lane === 0 || rnd() < 0.15 ? 0.78 + rnd() * 0.22 : 0.2 + rnd() * 0.3);
    }
    // its smaller partner, turning the other way
    for (let k = 0, n = take(0.08); k < n && i < N; k++, i++) {
      const t = Math.sqrt(rnd()) * 1.7 * Math.PI;
      const r = 0.15 + 0.2 * t + gauss(rnd) * 0.04;
      orbit(i, 2.45, 0.35, gauss(rnd) * 0.12, Math.max(0.05, r), t, rnd() < 0.08 ? 0.9 : 0.18 + rnd() * 0.25);
    }
    // eleven stars, each a set of haloed rings
    const stars = [
      [-5.6, 2.5, 0.8], [-4.2, 0.9, 0.6], [-3.3, 2.8, 0.7], [-2.2, 1.9, 0.5], [-0.4, 2.9, 0.75], [1.2, 2.2, 0.55],
      [2.6, 2.9, 0.65], [3.6, 1.3, 0.6], [-5.2, -0.4, 0.5], [4.9, -0.6, 0.55], [0.6, -1.6, 0.45],
    ];
    const starN = take(0.24);
    const starW = stars.reduce((a, s) => a + s[2] * s[2], 0);
    stars.forEach(([cx, cy, size], si) => {
      const n = Math.round((starN * size * size) / starW);
      for (let k = 0; k < n && i < N; k++, i++) {
        const ring = Math.floor(Math.sqrt(rnd()) * 5);
        const r = size * (0.1 + ring * 0.19) + gauss(rnd) * 0.012;
        orbit(i, cx, cy, gauss(rnd) * 0.06, (si % 2 ? 1 : -1) * Math.max(0.03, r), rnd() * TAU, ring === 0 ? 1 : ring === 1 ? 0.92 : ring === 2 ? 0.6 : 0.3);
      }
    });
    // the moon: a hot core and wide halos, top right
    for (let k = 0, n = take(0.09); k < n && i < N; k++, i++) {
      const ring = Math.floor(Math.sqrt(rnd()) * 6);
      const r = 0.12 + ring * 0.2 + gauss(rnd) * 0.015;
      orbit(i, 5.35, 2.35, gauss(rnd) * 0.06, Math.max(0.03, r), rnd() * TAU, ring < 2 ? 1 : ring < 4 ? 0.75 : 0.4);
    }
    // wind bands sweeping across the lower sky
    for (let k = 0, n = take(0.2); k < n && i < N; k++, i++) {
      const band = (rnd() * 6) | 0;
      const r = 12.5 + band * 0.34 + gauss(rnd) * 0.03;
      orbit(i, 0.5, -15.2, gauss(rnd) * 0.15, band % 2 ? r : -r, rnd(), band === 2 ? 0.55 + rnd() * 0.3 : 0.12 + rnd() * 0.22);
    }
    for (; i < N; i++) orbit(i, (rnd() - 0.5) * 16, (rnd() - 0.5) * 9, -5 + rnd() * 5, 0.02, rnd() * TAU, 0);
  }

  return { A, A2, B, C, D, E, G, I, J, FH, H0, H1, R, LINES, LINEW, LAND, LANDW, BRAIN, BRAINW };
}

/* Per-formation staging, interpolated on the CPU: where the formation sits,
   how much it rotates and follows the pointer, how bright it burns.
   `fx` (optional) places the formation by screen position instead of world
   units: a fraction of the half-width, so it stays inside its frame on any
   aspect ratio. It is a default: a section can give the exact spot with
   data-field-x (see NeuralField.jsx). */
export const LOOKS = [
  { off: [0.35, 0.45, 0], spin: 1, follow: 1, dim: 1.0 }, // 0 network
  { off: [0, 0, -1.2], spin: 0.35, follow: 0.6, dim: 0.5 }, // 1 clusters
  { off: [0, 0.35, 0], fx: 0.22, spin: 0.18, follow: 0.5, dim: 0.72 }, // 2 attention (beside the thesis copy, not under it)
  { off: [0, 0, 0], spin: 0.12, follow: 0.35, dim: 0.85 }, // 3 landscape
  { off: [0.9, 0.2, 0.2], spin: 0.22, follow: 0.5, dim: 0.8 }, // 4 matrix
  { off: [3.1, 0.1, -1], spin: 1, follow: 0.7, dim: 0.85 }, // 5 sphere
  { off: [2.9, -0.35, 0], fx: 0.34, spin: 0.42, follow: 0.5, dim: 1.05, glass: 0.4 }, // 6 brain
  { off: [2.9, -0.2, -3.6], fx: 0.34, spin: 0.8, follow: 0.6, dim: 1.05, glass: 0.4 }, // 7 network
  { off: [0, 0.2, 0], spin: 0.04, follow: 0.18, dim: 0.9, glass: 0.3 }, // 8 starry
  { off: [0.2, 0.4, 0], spin: 1, follow: 1, dim: 0.95 }, // 9 network
];

/** Highest formation index. */
export const LAST = LOOKS.length - 1;
