/* =========================================================================
   BOARD — composes a project's media into one bitmap for the stage:
   a walkthrough poster full-bleed, desktop screenshots in a browser window,
   phone screenshots as a fan of three devices, and — for archive projects
   with no screenshots — a generative fingerprint drawn from the project's
   own name. The denoise pass then only ever deals with one texture.
   ========================================================================= */
import { hashSeed, prng } from '../../lib/motion';
import { PALETTE, rgba } from '../../lib/palette';

const cache = new Map();

export function loadImage(src) {
  if (cache.has(src)) return cache.get(src);
  const p = new Promise((res, rej) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
  cache.set(src, p);
  p.catch(() => cache.delete(src));
  return p;
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function cover(ctx, img, x, y, w, h, align = 0.5) {
  const s = Math.max(w / img.width, h / img.height);
  const dw = img.width * s,
    dh = img.height * s;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) * align, dw, dh);
}

function ground(ctx, W, H) {
  ctx.fillStyle = '#0B0D11';
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createRadialGradient(W * 0.5, H * 0.35, 0, W * 0.5, H * 0.35, Math.max(W, H) * 0.75);
  g.addColorStop(0, 'rgba(255,107,61,0.07)');
  g.addColorStop(1, 'rgba(255,107,61,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // dot grid
  ctx.fillStyle = 'rgba(238,235,228,0.05)';
  const step = Math.round(Math.min(W, H) / 18);
  for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) ctx.fillRect(x, y, 1.5, 1.5);
}

function browser(ctx, img, W, H, u) {
  const pad = Math.round(W * 0.055);
  const x = pad,
    y = Math.round(H * 0.075),
    w = W - pad * 2,
    h = H - y - Math.round(H * 0.02);
  const bar = Math.round(22 * u);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 40 * u;
  ctx.shadowOffsetY = 18 * u;
  rr(ctx, x, y, w, h + 30 * u, 10 * u);
  ctx.fillStyle = '#11141A';
  ctx.fill();
  ctx.restore();
  ctx.save();
  rr(ctx, x, y, w, h + 30 * u, 10 * u);
  ctx.clip();
  ctx.fillStyle = '#181C24';
  ctx.fillRect(x, y, w, bar);
  ['#FF5F57', '#FEBC2E', '#28C840'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.globalAlpha = 0.75;
    ctx.beginPath();
    ctx.arc(x + 14 * u + i * 12 * u, y + bar / 2, 3.6 * u, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(238,235,228,0.07)';
  rr(ctx, x + w * 0.3, y + bar * 0.22, w * 0.4, bar * 0.56, bar * 0.28);
  ctx.fill();
  cover(ctx, img, x, y + bar, w, h + 30 * u - bar, 0);
  ctx.restore();
  ctx.strokeStyle = 'rgba(238,235,228,0.12)';
  ctx.lineWidth = u;
  rr(ctx, x + 0.5, y + 0.5, w - 1, h + 30 * u - 1, 10 * u);
  ctx.stroke();
}

function phone(ctx, img, cx, cy, ph, u, alpha) {
  const pw = ph * 0.462;
  const x = cx - pw / 2,
    y = cy - ph / 2;
  const r = pw * 0.14;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 36 * u;
  ctx.shadowOffsetY = 16 * u;
  rr(ctx, x, y, pw, ph, r);
  ctx.fillStyle = '#050608';
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = alpha;
  const b = 4 * u;
  rr(ctx, x + b, y + b, pw - b * 2, ph - b * 2, r - b);
  ctx.clip();
  cover(ctx, img, x + b, y + b, pw - b * 2, ph - b * 2, 0);
  ctx.restore();
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#050608';
  rr(ctx, cx - pw * 0.13, y + b + 5 * u, pw * 0.26, 11 * u, 6 * u);
  ctx.fill();
  ctx.strokeStyle = 'rgba(238,235,228,0.16)';
  ctx.lineWidth = u;
  rr(ctx, x + 0.5, y + 0.5, pw - 1, ph - 1, r);
  ctx.stroke();
  ctx.restore();
}

/* Generative fingerprint: a small network seeded by the slug. Layer count,
   widths, wiring and which neurons fire all come from the hash, so every
   archive project gets its own stable glyph. */
function fingerprint(ctx, slug, W, H, u) {
  const rnd = prng(hashSeed(slug));
  const L = 4 + Math.floor(rnd() * 3);
  const layers = Array.from({ length: L }, (_, l) => {
    const n = 2 + Math.floor(rnd() * 5) + (l > 0 && l < L - 1 ? 2 : 0);
    return Array.from({ length: n }, (_, k) => ({
      x: W * 0.16 + ((W * 0.68) * l) / (L - 1),
      y: H * 0.5 + (k - (n - 1) / 2) * H * (0.62 / Math.max(n, 5)) + (rnd() - 0.5) * 6 * u,
      hot: rnd() < 0.25,
    }));
  });
  ctx.lineWidth = u;
  for (let l = 0; l < L - 1; l++)
    layers[l].forEach((a) =>
      layers[l + 1].forEach((b) => {
        if (rnd() < 0.45) return;
        const hot = a.hot && b.hot;
        ctx.strokeStyle = hot ? rgba(PALETTE.ember, 0.55) : rgba(PALETTE.cool, 0.12 + rnd() * 0.12);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        const mx = (a.x + b.x) / 2;
        ctx.bezierCurveTo(mx, a.y, mx, b.y, b.x, b.y);
        ctx.stroke();
      })
    );
  layers.flat().forEach((nd) => {
    const r = (nd.hot ? 5.5 : 4) * u;
    if (nd.hot) {
      const g = ctx.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, r * 5);
      g.addColorStop(0, rgba(PALETTE.ember, 0.35));
      g.addColorStop(1, rgba(PALETTE.ember, 0));
      ctx.fillStyle = g;
      ctx.fillRect(nd.x - r * 5, nd.y - r * 5, r * 10, r * 10);
    }
    ctx.fillStyle = nd.hot ? rgba(PALETTE.ember, 1) : '#0B0D11';
    ctx.strokeStyle = nd.hot ? rgba(PALETTE.ember, 1) : rgba(PALETTE.cool, 0.7);
    ctx.lineWidth = 1.4 * u;
    ctx.beginPath();
    ctx.arc(nd.x, nd.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  ctx.fillStyle = 'rgba(238,235,228,0.42)';
  ctx.font = `${10 * u}px "Geist Mono", ui-monospace, monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`FINGERPRINT · ${slug.toUpperCase()} · NO SCREENSHOTS ON FILE`, W / 2, H - 22 * u);
}

/** Frames a project's media can show (index into this for cycling). */
export function frames(p) {
  if (!p.media) return [null];
  if (p.media.type === 'video') return [`/assets/walkthroughs/${p.media.slug}_thumbnail.jpg`];
  return p.media.files;
}

/**
 * Compose frame `i` of project `p` into a canvas of W×H device pixels.
 * `u` is the device-pixel unit (DPR) for strokes and radii.
 */
export async function composeBoard(p, i, W, H, u) {
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext('2d');
  ground(ctx, W, H);
  const fr = frames(p);
  if (!p.media) {
    fingerprint(ctx, p.slug, W, H, u);
    return cv;
  }
  if (p.media.type === 'video') {
    const img = await loadImage(fr[0]);
    cover(ctx, img, 0, 0, W, H);
    // a quiet scrim at the bottom for the overlay label
    const g = ctx.createLinearGradient(0, H * 0.7, 0, H);
    g.addColorStop(0, 'rgba(5,6,8,0)');
    g.addColorStop(1, 'rgba(5,6,8,0.55)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    return cv;
  }
  if (p.media.frame === 'phone') {
    const n = fr.length;
    const idx = [(i - 1 + n) % n, i % n, (i + 1) % n];
    const imgs = await Promise.all(idx.map((k) => loadImage(fr[k])));
    const ph = H * 0.84;
    phone(ctx, imgs[0], W * 0.5 - ph * 0.5, H * 0.53, ph * 0.84, u, 0.5);
    phone(ctx, imgs[2], W * 0.5 + ph * 0.5, H * 0.53, ph * 0.84, u, 0.5);
    phone(ctx, imgs[1], W * 0.5, H * 0.5, ph, u, 1);
    return cv;
  }
  const img = await loadImage(fr[i % fr.length]);
  browser(ctx, img, W, H, u);
  return cv;
}
