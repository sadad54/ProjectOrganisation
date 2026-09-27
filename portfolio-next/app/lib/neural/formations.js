/* =========================================================================
   FORMATIONS — every particle has one assigned position per formation, all
   uploaded once. The vertex shader blends between neighbouring formations
   as the page scrolls, so a morph costs one uniform write per frame.

     0  NETWORK    hero        a 7-layer net; data flows left → right
     1  ATTENTION  thesis      token blocks, attention arcs, embeddings
     2  SPHERE     model card  a clustered hypersphere (normalised embeddings)
     3  LANDSCAPE  decisions   a loss surface with a real gradient-descent path
     4  CLUSTERS   work        four semantic clusters and the bridges between
     5  MATRIX     research    a weight matrix rendered as a heatmap
     6  NETWORK    contact     back where it started (shares slot 0)

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
  const FH = new Float32Array(N * 4); // flow phase, flow speed, heat4, heat5
  const H0 = new Float32Array(N * 4); // heat 0..3
  const R = new Float32Array(N * 4); // rand phase, size, morph delay, swirl
  let LINES = null; // network synapses for the line pass: [ax,ay,az,bx,by,bz] + weight
  let LINEW = null;
  let LAND = null; // landscape wireframe for the line pass
  let LANDW = null;

  const set3 = (arr, i, x, y, z) => {
    arr[i * 3] = x;
    arr[i * 3 + 1] = y;
    arr[i * 3 + 2] = z;
  };

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

  return { A, A2, B, C, D, E, G, FH, H0, R, LINES, LINEW, LAND, LANDW };
}

/* Per-formation staging, interpolated on the CPU: where the formation sits,
   how much it rotates and follows the pointer, how bright it burns. */
export const LOOKS = [
  { off: [0.35, 0.45, 0], spin: 1, follow: 1, dim: 1.0 }, // 0 network
  { off: [0, 0.35, 0], spin: 0.18, follow: 0.5, dim: 0.72 }, // 1 attention
  { off: [3.1, 0.1, -1], spin: 1, follow: 0.7, dim: 0.85 }, // 2 sphere
  { off: [0, 0, 0], spin: 0.12, follow: 0.35, dim: 0.85 }, // 3 landscape
  { off: [0, 0, -1.2], spin: 0.35, follow: 0.6, dim: 0.5 }, // 4 clusters
  { off: [0.9, 0.2, 0.2], spin: 0.22, follow: 0.5, dim: 0.8 }, // 5 matrix
  { off: [0.2, 0.4, 0], spin: 1, follow: 1, dim: 0.95 }, // 6 network
];
