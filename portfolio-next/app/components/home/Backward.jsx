'use client';

import { useEffect, useRef } from 'react';
import Parallels from '../backward/Parallels';
import Compound from '../backward/Compound';
import Corpus from '../backward/Corpus';
import { reducedMotionNow } from '../../lib/motion';

/* ∇ — the page so far is a forward pass. This is the other half of training:
   the backward pass, where the weights get changed. Three acts: the parallels
   between a brain and a model (pinned), the arithmetic of small daily steps,
   and the things Adnan keeps going back to. All copy: app/data/priors.js.

   The section headings are set in Archivo's width axis, and scroll speed
   squeezes them: --kin runs 0 (at rest, wide) to 1 (scrolling fast, narrow).
   Narrowing never re-wraps a line, so the layout holds still. */
export default function Backward() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reducedMotionNow()) return;
    let raf = 0,
      last = window.scrollY,
      kin = 0,
      target = 0,
      seen = false;
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen) kick();
    });
    io.observe(el);
    const loop = () => {
      const y = window.scrollY;
      target = Math.min(1, Math.abs(y - last) / 55);
      last = y;
      kin += (target - kin) * (target > kin ? 0.22 : 0.07);
      el.style.setProperty('--kin', kin.toFixed(3));
      raf = seen || kin > 0.004 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) {
        last = window.scrollY;
        raf = requestAnimationFrame(loop);
      }
    };
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="backward" id="backward" ref={ref} aria-labelledby="bw-h">
      <Parallels />
      <Compound />
      <Corpus />
    </section>
  );
}
