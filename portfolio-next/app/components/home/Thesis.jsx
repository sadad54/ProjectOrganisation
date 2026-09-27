'use client';

import { useEffect, useRef } from 'react';
import { reducedMotionNow } from '../../lib/motion';

/* The thesis reads itself in as you scroll: one progress value (--p) is
   written to the container, and every word derives its own brightness from
   it in CSS — no per-word listeners. The three phrases that carry the
   argument burn ember once they're lit. */
const TEXT = [
  { t: 'The model call is the easy part. What I find interesting is everything wrapped around it:' },
  { t: 'output you can trust,', hot: true },
  { t: 'a plan for when it breaks,', hot: true },
  { t: 'and' },
  { t: 'a number that says whether it got better.', hot: true },
];

const WORDS = TEXT.reduce((n, seg) => n + seg.t.split(' ').length, 0);

export default function Thesis() {
  const sec = useRef(null);
  const txt = useRef(null);

  useEffect(() => {
    const s = sec.current;
    const t = txt.current;
    if (reducedMotionNow()) {
      t.style.setProperty('--p', '1');
      return;
    }
    let raf = 0;
    // each hot phrase fires the field once as it lights (scrolling forward)
    const hotEnds = [19.5, 25.5, 34.5].map((w) => w / (WORDS + 3));
    let lastP = 0;
    const update = () => {
      raf = 0;
      const r = s.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, (-r.top + window.innerHeight * 0.15) / Math.max(1, span * 0.78)));
      t.style.setProperty('--p', p.toFixed(4));
      if (p > lastP && hotEnds.some((h) => lastP < h && p >= h)) window.__field?.pulse();
      lastP = p;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, []);

  let i = 0;
  const words = [];
  TEXT.forEach((seg, si) => {
    seg.t.split(' ').forEach((w, wi) => {
      words.push(
        <span key={`${si}-${wi}`} className={`tw${seg.hot ? ' hot' : ''}`} style={{ '--i': i++ }}>
          {w}
        </span>,
        ' '
      );
    });
  });
  const N = i;
  const full = TEXT.map((s) => s.t).join(' ');

  return (
    <section className="thesis" id="thesis" ref={sec} data-field="1" data-field-dim="0.85" aria-label="Thesis">
      <div className="thesis-pin">
        <div className="wrap thesis-in" ref={txt} style={{ '--n': N }}>
          <p className="layer rv">
            <span className="bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <b>L1</b> Thesis <span className="rule" aria-hidden="true" /> what every project below has in common
          </p>
          <p className="thesis-text">
            <span className="sr-only">{full}</span>
            <span aria-hidden="true">{words}</span>
          </p>
          <div className="thesis-legend" aria-hidden="true">
            <span>schema validation</span>
            <span>repair loops</span>
            <span>eval harnesses</span>
          </div>
        </div>
      </div>
    </section>
  );
}
