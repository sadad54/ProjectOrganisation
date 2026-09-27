'use client';

import { useEffect, useRef, useState } from 'react';
import Split from '../site/Split';
import { reducedMotionNow, prng } from '../../lib/motion';

/* L5 — research. Two first-author projects, each with its headline numbers
   drawn rather than stated: a waffle of the wrong-scope rate, gauges for
   detection vs false alarms. Every figure is from the résumé. */

function useSeen(threshold = 0.35) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (reducedMotionNow()) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen];
}

function Count({ to, dec = 0, seen, dur = 1600, suffix = '' }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (reducedMotionNow()) {
      setV(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, to, dur]);
  return (
    <>
      {v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })}
      {suffix}
    </>
  );
}

// 8.6% of a 500-cell waffle = 43 cells: the rate, drawn to scale
const CELLS = 500;
const LIT = 43;
function Waffle({ seen }) {
  const [lit] = useState(() => {
    // spread the lit cells across the grid: a seeded shuffle, so SSR and the
    // client agree and the pattern is the same on every visit
    const rnd = prng(86);
    const idx = Array.from({ length: CELLS }, (_, i) => i);
    for (let i = CELLS - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return new Set(idx.slice(0, LIT));
  });
  return (
    <div className={`waffle${seen ? ' on' : ''}`} role="img" aria-label="Waffle chart: 43 of 500 cells highlighted, an 8.6% rate">
      {Array.from({ length: CELLS }, (_, i) => (
        <i key={i} className={lit.has(i) ? 'hit' : ''} style={{ '--k': i }} />
      ))}
    </div>
  );
}

function Gauge({ label, value, tone, seen, note }) {
  return (
    <div className={`gauge ${tone}`}>
      <div className="g-top">
        <span className="g-k">{label}</span>
        <span className="g-v">
          <Count to={value} dec={1} seen={seen} suffix="%" />
        </span>
      </div>
      <div className="g-track" aria-hidden="true">
        <span style={{ transform: `scaleX(${seen ? value / 100 : 0})` }} />
        <i style={{ left: `${value}%` }} />
      </div>
      <p className="g-note">{note}</p>
    </div>
  );
}

export default function Research() {
  const [r1, s1] = useSeen();
  const [r2, s2] = useSeen();
  return (
    <section className="research band" id="research" data-field="5" data-field-dim="0.55" aria-labelledby="research-h">
      <div className="wrap">
        <p className="layer rv">
          <span className="bars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <b>L5</b> Evaluation <span className="rule" aria-hidden="true" /> research
        </p>
        <div className="rs-head">
          <Split as="h2" id="research-h" className="display" text={['Research on knowing when an answer ', { t: 'shouldn’t be trusted.', em: true }]} />
          <p className="lede rv" style={{ '--d': 120 }}>
            First-author work on evaluating retrieval-augmented and Text-to-SQL systems — the same instinct as the
            projects, pointed at the models themselves: an answer can be well-formed, cited and confident, and still
            be wrong in a way nothing flags.
          </p>
        </div>

        <div className="papers">
          <article className="paper rv" ref={r1}>
            <div className="pp-tags">
              <span className="pp-status review">
                <i /> Under review · ALTA 2026
              </span>
              <span>First author</span>
              <span>2025 – 2026</span>
            </div>
            <h3 className="pp-title">SAFE-RAG</h3>
            <p className="pp-kind">Regulatory RAG evaluation</p>
            <p className="pp-body">
              Investigates incorrect regulatory scope in cited AI answers. Answers were evaluated for valid output schemas
              and supporting citations — and still grounded to the wrong scope at a measurable rate.
            </p>
            <div className="pp-viz">
              <Waffle seen={s1} />
              <div className="pp-stat">
                <span className="pp-big">
                  <Count to={8.6} dec={1} seen={s1} suffix="%" />
                </span>
                <span className="pp-lbl">wrong-scope grounding rate, across 200 annotated items</span>
              </div>
            </div>
            <p className="pp-foot">Short paper · under review</p>
          </article>

          <article className="paper rv" ref={r2} style={{ '--d': 120 }}>
            <div className="pp-tags">
              <span className="pp-status done">
                <i /> Manuscript complete
              </span>
              <span>First author</span>
              <span>2026</span>
            </div>
            <h3 className="pp-title">Text-to-SQL answerability under schema evolution</h3>
            <p className="pp-kind">Benchmark · drift detection</p>
            <p className="pp-body">
              When a database schema changes, a question that used to be answerable can silently stop being so. A
              benchmark for evaluating answerability as schemas evolve — and for catching the drift you can’t see in the
              structure.
            </p>
            <div className="pp-viz col">
              <Gauge label="Structurally invisible drift detected" value={79.5} tone="pass" seen={s2} note="higher is better" />
              <Gauge label="False-alarm rate" value={13.0} tone="fail" seen={s2} note="on 5,627 benign schema updates" />
              <div className="pp-counts">
                <div>
                  <b>
                    <Count to={1382} seen={s2} />
                  </b>
                  <span>benchmark instances</span>
                </div>
                <div>
                  <b>
                    <Count to={20} seen={s2} />
                  </b>
                  <span>databases</span>
                </div>
                <div>
                  <b>
                    <Count to={27384} seen={s2} />
                  </b>
                  <span>model generations</span>
                </div>
              </div>
            </div>
            <p className="pp-foot">Manuscript complete · not yet submitted</p>
          </article>
        </div>
      </div>
    </section>
  );
}
