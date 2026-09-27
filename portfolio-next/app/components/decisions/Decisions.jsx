'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import RepairLoop from './RepairLoop';
import Drift from './Drift';
import MonteCarlo from './MonteCarlo';
import Evidence from './Evidence';
import Split from '../site/Split';
import { scrollToEl } from '../site/SmoothScroll';
import { reducedMotionNow, useMedia } from '../../lib/motion';

const CHAPTERS = [
  { C: RepairLoop, t: 'Plan the second attempt', k: 'InterviewPilot' },
  { C: Drift, t: 'Notice the decay first', k: 'Driftline' },
  { C: MonteCarlo, t: 'Simulate, don’t guess', k: 'WC26 Predictor' },
  { C: Evidence, t: 'No source, no claim', k: 'ProofHire' },
];
const PER = 125; // vh of scroll per chapter

/* L3 — four real engineering decisions in one pinned stage. Scroll drives a
   single progress value; each chapter gets its own slice of it, so its
   diagram draws itself (and un-draws on the way back) while the chapter is
   on stage. On small screens or with reduced motion there's no pin: the
   chapters stack, and each one plays through once when it enters view. */
function Chapter({ C, p }) {
  return <C p={p} />;
}

function Pinned() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [chapter, setChapter] = useState(0);
  const n = CHAPTERS.length;
  useMotionValueEvent(scrollYProgress, 'change', (v) => setChapter(Math.min(n - 1, Math.floor(v * n * 0.9999))));
  const locals = [
    useTransform(scrollYProgress, (v) => Math.min(1, Math.max(0, (v * n - 0) * 1.12))),
    useTransform(scrollYProgress, (v) => Math.min(1, Math.max(0, (v * n - 1) * 1.12))),
    useTransform(scrollYProgress, (v) => Math.min(1, Math.max(0, (v * n - 2) * 1.12))),
    useTransform(scrollYProgress, (v) => Math.min(1, Math.max(0, (v * n - 3) * 1.12))),
  ];
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  function jump(k) {
    const el = ref.current;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    const y = top + (span * (k + 0.06)) / n;
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }

  return (
    <div className="dec-track" ref={ref} style={{ height: `${100 + PER * n}vh` }}>
      <div className="dec-pin">
        <div className="wrap dec-head">
          <div>
            <p className="layer rv">
              <span className="bars" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <b>L3</b> Attention <span className="rule" aria-hidden="true" /> the decisions I’d defend
            </p>
            <Split as="h2" className="h2 dec-title" text={['Four trade-offs, ', { t: 'drawn as you scroll.', em: true }]} />
          </div>
          <nav className="dec-tabs" aria-label="Decisions">
            {CHAPTERS.map((c, k) => (
              <button
                type="button"
                key={c.k}
                className={`dec-tab${k === chapter ? ' on' : ''}${k < chapter ? ' done' : ''}`}
                aria-current={k === chapter ? 'step' : undefined}
                onClick={() => jump(k)}
              >
                <span className="dt-n">0{k + 1}</span>
                <span className="dt-t">{c.t}</span>
                <span className="dt-k">{c.k}</span>
                <span className="dt-bar" aria-hidden="true">
                  <TabFill p={locals[k]} />
                </span>
              </button>
            ))}
          </nav>
        </div>
        <div className="wrap dec-stage">
          {CHAPTERS.map((c, k) => (
            <div key={c.k} className={`dec-scene${k === chapter ? ' on' : ''}${k < chapter ? ' past' : ''}`} aria-hidden={k !== chapter}>
              <Chapter C={c.C} p={locals[k]} />
            </div>
          ))}
        </div>
        <div className="dec-progress" aria-hidden="true">
          <TabFill p={bar} />
        </div>
      </div>
    </div>
  );
}

function TabFill({ p }) {
  const ref = useRef(null);
  useMotionValueEvent(p, 'change', (v) => {
    if (ref.current) ref.current.style.transform = `scaleX(${v})`;
  });
  useEffect(() => {
    if (ref.current) ref.current.style.transform = `scaleX(${p.get()})`;
  }, [p]);
  return <span ref={ref} className="fill" />;
}

/* Unpinned: each chapter plays through once, on a clock, when it's seen. */
function PlayOnView({ C, still }) {
  const ref = useRef(null);
  const p = useMotionValue(still ? 1 : 0);
  useEffect(() => {
    if (still) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        animate(p, 1, { duration: 5.5, ease: 'linear' });
      },
      { threshold: 0.35 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [p, still]);
  return (
    <div className="dec-flat-scene" ref={ref}>
      <C p={p} />
    </div>
  );
}

export default function Decisions() {
  const small = useMedia('(max-width: 900px), (max-height: 640px)');
  const [rm, setRm] = useState(false);
  useEffect(() => setRm(reducedMotionNow()), []);
  const flat = small || rm;

  return (
    <section className={`decisions${flat ? ' flat' : ''}`} id="decisions" data-field="3" data-field-dim="0.8" aria-label="Engineering decisions">
      {flat ? (
        <div className="wrap dec-flat">
          <p className="layer rv">
            <span className="bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <b>L3</b> Attention <span className="rule" aria-hidden="true" /> the decisions I’d defend
          </p>
          <Split as="h2" className="h2 dec-title" text={['Four trade-offs, ', { t: 'drawn as they play.', em: true }]} />
          {CHAPTERS.map((c) => (
            <PlayOnView key={c.k} C={c.C} still={rm} />
          ))}
        </div>
      ) : (
        <Pinned />
      )}
    </section>
  );
}
