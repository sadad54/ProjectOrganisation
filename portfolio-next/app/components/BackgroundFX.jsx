'use client';

import { useEffect, useRef } from 'react';
import useMotionPreference from '../hooks/useMotionPreference';

/* =====================================================================
   LATENT FIELD — the background is an embedding space sitting in the dark.
   ~260 points with real cluster structure and a fixed k-NN graph. The
   cursor is the query vector: the light lifts the local neighbourhood out
   of black, draws the edges between those points, and rings the nearest
   one as the retrieved match. Nothing decorative persists — the structure
   only exists where you query it.

   Cost: 260 points, brute-forced each frame (<0.1ms). rAF pauses when the
   tab is hidden. No pointer → the query drifts on a slow autonomous loop.
   Reduced motion → one static lit frame, no loop.
   ===================================================================== */
export default function BackgroundFX() {
  const reduce = useMotionPreference();
  const cvRef = useRef(null);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const DPR = Math.min(devicePixelRatio || 1, 2);

    // seeded PRNG so the field is stable across reloads / resizes
    let s = 20260903 >>> 0;
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const clamp01 = (v) => (v < 0.02 ? 0.02 : v > 0.98 ? 0.98 : v);

    const N = 260;
    const K = 3;
    const CL = 9;
    const clusters = Array.from({ length: CL }, () => ({
      x: 0.1 + rnd() * 0.8,
      y: 0.1 + rnd() * 0.8,
      r: 0.05 + rnd() * 0.11,
    }));
    const pts = Array.from({ length: N }, () => {
      if (rnd() < 0.84) {
        const c = clusters[(rnd() * CL) | 0];
        return {
          nx: clamp01(c.x + (rnd() - rnd()) * c.r),
          ny: clamp01(c.y + (rnd() - rnd()) * c.r),
          tw: 0.55 + rnd() * 0.45,
        };
      }
      return { nx: rnd(), ny: rnd(), tw: 0.55 + rnd() * 0.45 };
    });

    // fixed k-NN graph, computed once in normalised space
    const edges = [];
    for (let i = 0; i < N; i++) {
      const d = [];
      for (let j = 0; j < N; j++) {
        if (i === j) continue;
        const dx = pts[i].nx - pts[j].nx;
        const dy = pts[i].ny - pts[j].ny;
        d.push([dx * dx + dy * dy, j]);
      }
      d.sort((a, b) => a[0] - b[0]);
      for (let k = 0; k < K; k++) {
        const j = d[k][1];
        if (i < j) edges.push([i, j, Math.sqrt(d[k][0])]);
      }
    }
    const MAX_EDGE = 0.15;

    let W = 0,
      H = 0;
    function resize() {
      W = innerWidth;
      H = innerHeight;
      cv.width = W * DPR;
      cv.height = H * DPR;
      cv.style.width = W + 'px';
      cv.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();

    const fine = matchMedia('(pointer: fine)').matches && !reduce;
    let tx = innerWidth * (reduce ? 0.42 : 0.5),
      ty = innerHeight * 0.4,
      lx = tx,
      ly = ty,
      auto = true,
      autoT = rnd() * 6.28,
      raf = 0,
      running = document.visibilityState === 'visible';

    function draw() {
      const pageProgress = window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
      const palettes = [[255, 155, 106], [183, 186, 255], [164, 237, 200]];
      const position = Math.min(1.999, pageProgress * 2);
      const base = Math.floor(position), mix = position - base;
      const rgb = palettes[base].map((v, i) => Math.round(v + (palettes[base + 1][i] - v) * mix)).join(',');
      const R = Math.min(460, Math.max(300, W * 0.29));
      if (!reduce && auto) {
        autoT += 0.0045;
        tx = W * (0.5 + 0.33 * Math.cos(autoT));
        ty = H * (0.46 + 0.34 * Math.sin(autoT * 0.82));
      }
      if (reduce) {
        lx = tx;
        ly = ty;
      } else {
        lx += (tx - lx) * 0.09;
        ly += (ty - ly) * 0.09;
      }

      ctx.clearRect(0, 0, W, H);

      // the light itself — a soft warm wash, brighter core
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, R);
      g.addColorStop(0, `rgba(${rgb},0.12)`);
      g.addColorStop(0.5, `rgba(${rgb},0.04)`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // edges revealed near the light
      ctx.lineWidth = 1;
      for (let e = 0; e < edges.length; e++) {
        const [a, b, len] = edges[e];
        const ax = pts[a].nx * W,
          ay = pts[a].ny * H,
          bx = pts[b].nx * W,
          by = pts[b].ny * H;
        const dl = Math.hypot((ax + bx) / 2 - lx, (ay + by) / 2 - ly);
        if (dl > R) continue;
        const near = 1 - dl / R;
        const lenFall = 1 - Math.min(len / MAX_EDGE, 1);
        const al = Math.pow(near, 1.5) * lenFall * 0.6;
        if (al < 0.012) continue;
        ctx.strokeStyle = `rgba(${rgb},${al.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      // points
      let nd = 1e9,
        nx = 0,
        ny = 0;
      for (let i = 0; i < N; i++) {
        const x = pts[i].nx * W,
          y = pts[i].ny * H;
        const d = Math.hypot(x - lx, y - ly);
        let a = 0.04 * pts[i].tw;
        if (d < R) a += Math.pow(1 - d / R, 1.25) * 1.05 * pts[i].tw;
        if (d < nd) {
          nd = d;
          nx = x;
          ny = y;
        }
        const aa = Math.min(a, 0.98);
        if (aa > 0.5) {
          ctx.fillStyle = `rgba(${rgb},${(aa * 0.22).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, 3.4 + aa * 3.2, 0, 6.283);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(${rgb},${aa.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, 1 + aa * 2.3, 0, 6.283);
        ctx.fill();
      }

      // the nearest point IS the retrieved match — bright core + ring
      if (nd < R) {
        const q = 1 - nd / R;
        ctx.fillStyle = `rgba(${rgb},${(0.5 + q * 0.45).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(nx, ny, 2.6, 0, 6.283);
        ctx.fill();
        ctx.strokeStyle = `rgba(${rgb},${(0.18 + q * 0.4).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(nx, ny, 9 + (1 - q) * 18, 0, 6.283);
        ctx.stroke();
      }

      if (!reduce && running) raf = requestAnimationFrame(draw);
    }

    function onMove(e) {
      auto = false;
      tx = e.clientX;
      ty = e.clientY;
    }
    function onResize() { resize(); if (reduce) draw(); }
    function onVis() {
      running = document.visibilityState === 'visible';
      if (running && !reduce) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(draw);
      }
    }
    if (fine) window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);
    draw();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      if (fine) window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reduce]);

  return (
    <div id="ambientField" className="lat" aria-hidden="true">
      <canvas ref={cvRef} />
      <div className="lat-vignette" />
    </div>
  );
}
