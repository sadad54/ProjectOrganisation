'use client';

import { useEffect, useRef } from 'react';

/* The pointer as a rim light. The hero portrait is lit from one edge; cards
   get the same treatment from wherever the pointer is: a light-blue edge,
   falling off to indigo, on the side of the border nearest the cursor.

   One fixed overlay follows whichever card is under the pointer (its box,
   its radius) and is masked down to a 1px ring, so no card needs a spare
   pseudo-element or an extra child. The same pointer position is written to
   project images as --mx/--my for their attention-map hover (work.css).
   Fine pointers only; touch never sees it. */
const RIM = '.card,.paper,.cs-nx,.composer,.dec-tab,.media';

export default function RimLight() {
  const ring = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const o = ring.current;
    let cur = null,
      x = 0,
      y = 0,
      raf = 0;

    function place() {
      raf = 0;
      if (!cur || !cur.isConnected) return off();
      const r = cur.getBoundingClientRect();
      o.style.transform = `translate3d(${r.left}px,${r.top}px,0)`;
      o.style.width = `${r.width}px`;
      o.style.height = `${r.height}px`;
      const mx = `${x - r.left}px`,
        my = `${y - r.top}px`;
      o.style.setProperty('--mx', mx);
      o.style.setProperty('--my', my);
      if (cur.classList.contains('media')) {
        cur.style.setProperty('--mx', mx);
        cur.style.setProperty('--my', my);
      }
    }
    function off() {
      cur = null;
      o.classList.remove('on');
    }
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(place);
    };

    function onMove(e) {
      x = e.clientX;
      y = e.clientY;
      const t = e.target.closest?.(RIM) || null;
      if (t !== cur) {
        cur = t;
        if (!t) return off();
        o.style.borderRadius = getComputedStyle(t).borderRadius;
        o.classList.add('on');
      }
      queue();
    }
    const onScroll = () => cur && queue();

    document.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', off);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', off);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return <div className="rim" ref={ring} aria-hidden="true" />;
}
