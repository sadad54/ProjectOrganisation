'use client';

import { useEffect, useRef, useState } from 'react';
import { reducedMotionNow, prng } from '../../lib/motion';
import { copyText } from '../../lib/toast';
import { EMAIL } from '../../data/research';

/* One paper, laid out the way a paper is: status and authorship, title,
   summary, one numbered figure with its caption, the findings as a list, and
   the actions a reader actually takes (request the manuscript, read the code,
   cite it once it has a venue). The figures draw real numbers to scale. */

export function useSeen(threshold = 0.35) {
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
    // a seeded shuffle, so SSR and the client agree and the pattern is the
    // same on every visit
    const rnd = prng(86);
    const idx = Array.from({ length: CELLS }, (_, i) => i);
    for (let i = CELLS - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [idx[i], idx[j]] = [idx[j], idx[i]];
    }
    return new Set(idx.slice(0, LIT));
  });
  return (
    <div className="pp-viz">
      <div className={`waffle${seen ? ' on' : ''}`} role="img" aria-label="Waffle chart: 43 of 500 cells highlighted, an 8.6% rate">
        {Array.from({ length: CELLS }, (_, i) => (
          <i key={i} className={lit.has(i) ? 'hit' : ''} style={{ '--k': i }} />
        ))}
      </div>
      <div className="pp-stat">
        <span className="pp-big">
          <Count to={8.6} dec={1} seen={seen} suffix="%" />
        </span>
        <span className="pp-lbl">wrong-scope grounding rate</span>
      </div>
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

function Gauges({ seen }) {
  return (
    <div className="pp-viz col">
      <Gauge label="Structurally invisible drift detected" value={79.5} tone="pass" seen={seen} note="higher is better" />
      <Gauge label="False-alarm rate" value={13.0} tone="fail" seen={seen} note="on 5,627 benign schema updates" />
      <div className="pp-counts">
        <div>
          <b>
            <Count to={1382} seen={seen} />
          </b>
          <span>benchmark instances</span>
        </div>
        <div>
          <b>
            <Count to={20} seen={seen} />
          </b>
          <span>databases</span>
        </div>
        <div>
          <b>
            <Count to={27384} seen={seen} />
          </b>
          <span>model generations</span>
        </div>
      </div>
    </div>
  );
}

const FIGURES = { waffle: Waffle, gauges: Gauges };

export default function Paper({ paper, n, full = false, delay = 0 }) {
  const [ref, seen] = useSeen();
  const Fig = FIGURES[paper.figure];
  const subject = `Manuscript request: ${paper.title}`;
  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;

  return (
    <article className={`paper rv${full ? ' full' : ''}`} ref={ref} style={{ '--d': delay }} aria-labelledby={`pp-${paper.id}`}>
      <div className="pp-main">
        <p className="pp-tags">
          <span className="pp-status done">
            <i aria-hidden="true" /> {paper.status}
          </span>
          <span>{paper.years}</span>
        </p>
        <h3 className="pp-title" id={`pp-${paper.id}`}>
          {paper.title}
        </h3>
        <p className="pp-byline">
          <b>A. M. Sadad</b> ({paper.role.toLowerCase()}) · {paper.kind}
        </p>
        <p className="pp-body">{paper.summary}</p>
        {full && (
          <ul className="pp-findings">
            {paper.findings.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        )}
      </div>

      <figure className="pp-fig">
        {Fig && <Fig seen={seen} />}
        <figcaption>
          <b>Fig. {n}</b> {paper.caption}
        </figcaption>
      </figure>

      <div className="pp-actions">
        <a className="lnk" href={mailto} onClick={() => copyText(EMAIL, `Email copied — ${EMAIL}`)}>
          Request the manuscript <span aria-hidden="true">→</span>
        </a>
        {paper.code && (
          <a className="lnk" href={paper.code} target="_blank" rel="noopener noreferrer">
            Code <span aria-hidden="true">↗</span>
          </a>
        )}
        {paper.bibtex && (
          <button type="button" className="lnk" onClick={() => copyText(paper.bibtex, 'BibTeX copied')}>
            Copy BibTeX
          </button>
        )}
        <span className="pp-note">
          {paper.status} · {paper.statusNote}
        </span>
      </div>
    </article>
  );
}
