'use client';

import { useEffect, useRef } from 'react';
import { reducedMotionNow } from '../../lib/motion';

/* Two-part cursor: a precise dot and a ring that trails on a slower spring.
   Interactive elements swell the ring; elements with data-cursor="label"
   grow it into a pill carrying that verb ("Play", "Open", "Query"…), so the
   pointer tells you what a click will do before you make it.
   Fine pointers only; never shown under reduced motion. */
export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    if (!fine || reducedMotionNow()) return;
    const d = dot.current;
    const r = ring.current;
    const l = label.current;
    document.documentElement.classList.add('has-cursor');

    let x = -100,
      y = -100,
      rx = -100,
      ry = -100,
      vs = 1, // visual scale of the ring
      ts = 1,
      shown = false,
      raf = 0;

    function onMove(e) {
      x = e.clientX;
      y = e.clientY;
      if (!shown) {
        shown = true;
        rx = x;
        ry = y;
        d.classList.add('on');
        r.classList.add('on');
      }
    }
    function onOver(e) {
      const t = e.target.closest?.('a,button,[data-cursor],input,textarea,label,[role="tab"],[role="option"]');
      if (!t) {
        ts = 1;
        r.classList.remove('hot', 'lbl', 'text');
        l.textContent = '';
        return;
      }
      const verb = t.getAttribute('data-cursor');
      if (t.matches('input,textarea')) {
        r.classList.add('text');
        r.classList.remove('hot', 'lbl');
        ts = 1;
        l.textContent = '';
        return;
      }
      r.classList.remove('text');
      if (verb && verb !== 'none') {
        l.textContent = verb;
        r.classList.add('lbl');
        r.classList.remove('hot');
        ts = 1;
      } else {
        l.textContent = '';
        r.classList.remove('lbl');
        r.classList.add('hot');
        ts = 1.6;
      }
    }
    function onDown() {
      r.classList.add('press');
    }
    function onUp() {
      r.classList.remove('press');
    }
    function onLeave() {
      d.classList.remove('on');
      r.classList.remove('on');
      shown = false;
    }

    function loop() {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      vs += (ts - vs) * 0.2;
      d.style.transform = `translate3d(${x}px,${y}px,0)`;
      r.style.transform = `translate3d(${rx}px,${ry}px,0) scale(${vs.toFixed(3)})`;
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.documentElement.classList.remove('has-cursor');
    };
  }, []);

  return (
    <>
      <div className="cur-ring" ref={ring} aria-hidden="true">
        <span className="cur-lbl" ref={label} />
      </div>
      <div className="cur-dot" ref={dot} aria-hidden="true" />
    </>
  );
}
