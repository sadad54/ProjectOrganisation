'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { reducedMotionNow } from '../../lib/motion';
import { daylight } from '../../lib/daylight';

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
    // a closed <details> still lays its content out (content-visibility:
    // hidden), so a folded section would claim the screen it isn't on
    if (el.checkVisibility && !el.checkVisibility()) continue;
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
    x: el.dataset.fieldX ? Number(el.dataset.fieldX) : null,
  };
}

export default function NeuralField() {
  const ref = useRef(null);
  const engine = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    let raf = 0;
    let mood = 0;
    const reduced = reducedMotionNow();

    const sync = () => {
      raf = 0;
      const e = engine.current;
      if (!e) return;
      const s = readPage();
      if (!s) return;
      e.setTarget(s.m);
      e.setAnchor(s.x);
      e.setDim(s.dim);
    };
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      engine.current?.setVelocity(y - lastY);
      lastY = y;
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
      // the field takes its mood from the time in Kuala Lumpur, checked every few minutes
      e.setMood(daylight());
      mood = setInterval(() => engine.current?.setMood(daylight()), 5 * 60 * 1000);
      const s = readPage();
      if (s) {
        e.setAnchor(s.x);
        e.jump(s.m);
      }
      sync();
      window.__fieldReady = true;
      window.dispatchEvent(new Event('field:ready'));
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('field:sync', onScroll);
    return () => {
      cancelled = true;
      clearInterval(mood);
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
