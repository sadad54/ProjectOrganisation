/* Samples a photo into points for the field's opening portrait. Bright pixels
   are more likely to be picked, so the lit side of the face is dense and the
   dark backdrop stays empty. Returns [u, v, lum, warm] per point, in image
   space (0..1). The same edge fades as the hero image's CSS mask apply. */
import { prng } from '../motion';

export function sampleFace(src, count) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      try {
        const W = 220,
          H = Math.round((W * img.naturalHeight) / img.naturalWidth);
        const c = document.createElement('canvas');
        c.width = W;
        c.height = H;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.drawImage(img, 0, 0, W, H);
        const d = g.getImageData(0, 0, W, H).data;
        const rnd = prng(20261111);
        const out = new Float32Array(count * 4);
        const edge = (x, a, b) => Math.min(1, Math.max(0, (x - a) / (b - a)));
        let n = 0,
          guard = 0;
        while (n < count && guard++ < count * 60) {
          const u = rnd(),
            v = rnd();
          const i = (Math.min(H - 1, (v * H) | 0) * W + Math.min(W - 1, (u * W) | 0)) * 4;
          const r = d[i] / 255,
            gr = d[i + 1] / 255,
            b = d[i + 2] / 255;
          const lum = 0.3 * r + 0.59 * gr + 0.11 * b;
          const fade = edge(u, 0.04, 0.3) * (1 - edge(u, 0.9, 1)) * (1 - edge(v, 0.62, 0.98));
          if (rnd() > Math.pow(lum, 1.7) * fade * 2.2) continue;
          out[n * 4] = u;
          out[n * 4 + 1] = v;
          out[n * 4 + 2] = lum;
          out[n * 4 + 3] = Math.min(1, Math.max(0, (r - b) * 2.6) * (0.4 + lum));
          n++;
        }
        if (n < count * 0.5) return reject(new Error('portrait too dark to sample'));
        resolve(out.subarray(0, n * 4));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = src;
  });
}
