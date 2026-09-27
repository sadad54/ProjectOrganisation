'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { reducedMotionNow } from '../../lib/motion';

/* Reads the page: every section that wants the field declares
   data-field="<formation>" (and optionally data-field-dim="0..1"). The
   section under the viewport's centre line wins, and the engine plays the
   morph over ~1s. (A scroll-scrubbed blend was tried first: parking the
   page near a boundary left particles mid-flight, and grids read as haze.) */
function readPage() {
  const els = document.querySelectorAll('[data-field]');
  if (!els.length) return null;
  const c = window.innerHeight * 0.5;
  let pick = null;
  let nearest = null;
  let best = Infinity;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.top <= c && r.bottom > c) {
      pick = el;
      break;
    }
    const d = Math.min(Math.abs(r.top - c), Math.abs(r.bottom - c));
    if (d < best) {
      best = d;
      nearest = el;
    }
  }
  const el = pick || nearest;
  return {
    m: Number(el.dataset.field) || 0,
    dim: el.dataset.fieldDim ? Number(el.dataset.fieldDim) : 1,
  };
}

export default function NeuralField() {
  const ref = useRef(null);
  const engine = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    const reduced = reducedMotionNow();

    const sync = () => {
      raf = 0;
      const e = engine.current;
      if (!e) return;
      const s = readPage();
      if (!s) return;
      e.setTarget(s.m);
      e.setDim(s.dim);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sync);
    };

    import('../../lib/neural/engine').then(({ createNeuralField }) => {
      if (cancelled || !ref.current) return;
      const e = createNeuralField(ref.current, { reduced });
      if (!e) {
        document.documentElement.classList.add('no-webgl');
        window.__fieldReady = true;
        window.dispatchEvent(new Event('field:ready'));
        return;
      }
      engine.current = e;
      window.__field = e;
      const s = readPage();
      if (s) e.jump(s.m);
      sync();
      window.__fieldReady = true;
      window.dispatchEvent(new Event('field:ready'));
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('field:sync', onScroll);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('field:sync', onScroll);
      engine.current?.destroy();
      engine.current = null;
      if (window.__field) delete window.__field;
    };
  }, []);

  // new route: re-read the page once it has painted
  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event('field:sync')), 60);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div className="field" aria-hidden="true">
      <canvas ref={ref} />
      <div className="field-vignette" />
    </div>
  );
}
