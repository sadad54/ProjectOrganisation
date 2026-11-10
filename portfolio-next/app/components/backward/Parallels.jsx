'use client';

import { useEffect, useRef, useState } from 'react';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import Split from '../site/Split';
import { PAIRS } from '../../data/priors';
import { reducedMotionNow, useMedia } from '../../lib/motion';

const PER = 95; // vh of scroll per pair
const REWIRE = 3; // from this pair on, the brain beside the copy has become a network
const pad = (n) => String(n).padStart(2, '0');

function Label() {
  return (
    <p className="layer rv">
      <span className="bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <b>∇</b> Backward pass <span className="rule" aria-hidden="true" /> how the weights got this way
    </p>
  );
}

const TITLE = ['A brain and a model ', { t: 'learn the same way.', em: true }];

function Copy({ pair, k }) {
  return (
    <div className="scene-copy">
      <p className="scene-eyebrow">
        Parallel {pad(k + 1)} <span>/ {pad(PAIRS.length)}</span>
      </p>
      <h3 className="scene-h bw-h3">
        <em>{pair.human}</em> {pair.verb} {pair.machine}.
      </h3>
      <p className="scene-body bw-body">{pair.line}</p>
      <p className="scene-note">{pair.src}</p>
    </div>
  );
}

/* Act A, on the same pinned frame as the L3 decisions: a head row with the
   title and one tab per parallel, and a stage below it. The stage's right
   half is a window onto the field, which holds a brain for the first pairs
   and then rewires into the hero's network. The engine plays that morph on
   its own clock; this component only says which formation it wants. */
function Pinned() {
  const ref = useRef(null);
  const fills = useRef([]);
  const frame = useRef(null);
  const [fx, setFx] = useState(null);
  // tell the field where its window is, so the specimen sits inside the frame
  useEffect(() => {
    const read = () => {
      const r = frame.current?.getBoundingClientRect();
      if (!r || !r.width) return;
      const half = window.innerWidth / 2;
      setFx(((r.left + r.width / 2 - half) / half).toFixed(3));
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);
  const bar = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [k, setK] = useState(0);
  const n = PAIRS.length;
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setK(Math.min(n - 1, Math.floor(v * n * 0.9999)));
    if (bar.current) bar.current.style.transform = `scaleX(${v})`;
    fills.current.forEach((el, i) => {
      if (el) el.style.transform = `scaleX(${Math.min(1, Math.max(0, (v * n - i) * 1.12))})`;
    });
  });
  const wired = k >= REWIRE;
  const first = useRef(true);
  const wasWired = useRef(false);
  useEffect(() => {
    window.dispatchEvent(new Event('field:sync'));
    // the rewire is an event, not a fade
    if (!first.current && wasWired.current !== wired) window.__field?.pulse?.();
    first.current = false;
    wasWired.current = wired;
  }, [wired, fx]);

  function jump(i) {
    const el = ref.current;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + ((el.offsetHeight - window.innerHeight) * (i + 0.06)) / n;
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }

  return (
    <div className="dec-track" ref={ref} style={{ height: `${100 + PER * n}vh` }} data-field={wired ? 7 : 6} data-field-dim="1" data-field-x={fx ?? undefined}>
      <div className="dec-pin bw-pin">
        <div className="wrap dec-head">
          <div>
            <Label />
            <Split as="h2" id="bw-h" className="h2 dec-title" text={TITLE} />
          </div>
          <nav className="dec-tabs" aria-label="Parallels" style={{ '--n': n }}>
            {PAIRS.map((pair, i) => (
              <button
                type="button"
                key={pair.human}
                className={`dec-tab${i === k ? ' on' : ''}${i < k ? ' done' : ''}`}
                aria-current={i === k ? 'step' : undefined}
                onClick={() => jump(i)}
              >
                <span className="dt-n">{pad(i + 1)}</span>
                <span className="dt-t">{pair.human}</span>
                <span className="dt-k">{pair.machine}</span>
                <span className="dt-bar" aria-hidden="true">
                  <span className="fill" ref={(el) => (fills.current[i] = el)} />
                </span>
              </button>
            ))}
          </nav>
        </div>
        <div className="wrap dec-stage bw-stage">
          <div className="bw-scenes">
            {PAIRS.map((pair, i) => (
              <div key={pair.human} className={`bw-scene${i === k ? ' on' : ''}${i < k ? ' past' : ''}`} aria-hidden={i !== k}>
                <Copy pair={pair} k={i} />
              </div>
            ))}
          </div>
          {/* a window onto the field: the specimen is the particles themselves */}
          <div className={`bw-frame${wired ? ' wired' : ''}`} ref={frame} aria-hidden="true">
            <i className="tl" />
            <i className="tr" />
            <i className="bl" />
            <i className="br" />
            <p className="bw-frame-top">
              <span>fig. ∇</span>
              <span>same particles, rewired</span>
            </p>
            <p className="bw-frame-cap">
              <span className={wired ? '' : 'on'}>wetware</span>
              <span className="arw">→</span>
              <span className={wired ? 'on' : ''}>software</span>
            </p>
          </div>
        </div>
        <div className="dec-progress" aria-hidden="true">
          <span ref={bar} className="fill" />
        </div>
      </div>
    </div>
  );
}

export default function Parallels() {
  const small = useMedia('(max-width: 900px), (max-height: 640px)');
  const [rm, setRm] = useState(false);
  useEffect(() => setRm(reducedMotionNow()), []);

  if (!(small || rm)) return <Pinned />;
  return (
    <div className="wrap dec-flat" data-field="6" data-field-dim="0.4">
      <Label />
      <Split as="h2" id="bw-h" className="h2 dec-title" text={TITLE} />
      {PAIRS.map((pair, i) => (
        <div className="dec-flat-scene rv" key={pair.human}>
          <Copy pair={pair} k={i} />
        </div>
      ))}
    </div>
  );
}
