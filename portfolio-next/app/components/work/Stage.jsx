'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Media from './Media';
import { DOMAINS, TIER_LABEL } from '../../data/work';
import { EASE_OUT, EASE_SOFT } from '../../lib/motion';

/* Numbers roll in like an odometer: each digit spins through a full turn and
   lands on its value, staggered left to right. Non-digits stay put, so the
   final state is always the exact string from the data. */
export function Odometer({ value }) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setGo(true)));
    return () => cancelAnimationFrame(r);
  }, []);
  return (
    <span className="odo">
      <span className="sr-only">{value}</span>
      {[...value].map((ch, i) =>
        /\d/.test(ch) ? (
          <span className="odo-d" key={i} aria-hidden="true">
            <span className="odo-strip" style={{ transform: `translateY(${go ? -(10 + Number(ch)) : 0}em)`, transitionDelay: `${i * 45}ms` }}>
              {'01234567890123456789'.split('').map((d, k) => (
                <span key={k}>{d}</span>
              ))}
            </span>
          </span>
        ) : (
          <span className="odo-c" key={i} aria-hidden="true">
            {ch}
          </span>
        )
      )}
    </span>
  );
}

const box = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } },
  exit: { opacity: 0, y: -10, filter: 'blur(6px)', transition: { duration: 0.22, ease: EASE_SOFT } },
};
const rise = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};
const chars = { hidden: {}, show: { transition: { staggerChildren: 0.018 } } };
const char = {
  hidden: { y: '108%' },
  show: { y: '0%', transition: { duration: 0.8, ease: EASE_OUT } },
};

export default function Stage({ project: p, index, total, neighbours, onSelect, mediaActive = true, compact = false }) {
  return (
    <div className={`stage${compact ? ' compact' : ''}`} role="tabpanel" id="work-panel" aria-labelledby={`tab-${p.slug}`} aria-live="polite">
      <div className="stage-text" data-lenis-prevent>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={p.slug} className="st" variants={box} initial="hidden" animate="show" exit="exit">
            <motion.p className="st-meta" variants={rise}>
              <span className="st-idx">
                {String(index + 1).padStart(2, '0')}
                <i>/{String(total).padStart(2, '0')}</i>
              </span>
              <span className={`st-tier t-${p.tier}`}>{TIER_LABEL[p.tier]}</span>
              {p.year && <span>{p.year}</span>}
              <span className={`st-dom d-${p.domain}`}>{DOMAINS[p.domain].label}</span>
            </motion.p>

            <motion.h3 className="st-name" variants={chars} aria-label={p.name}>
              {p.name.split(' ').map((w, wi, arr) => (
                <span className="st-word" key={wi} aria-hidden="true">
                  {[...w].map((c, ci) => (
                    <span className="st-ch" key={ci}>
                      <motion.span variants={char}>{c}</motion.span>
                    </span>
                  ))}
                  {wi < arr.length - 1 && <span className="st-ch">{'\u00A0'}</span>}
                </span>
              ))}
            </motion.h3>
            <motion.p className="st-kind" variants={rise}>
              {p.kind}
            </motion.p>
            <motion.p className="st-hook" variants={rise}>
              {p.hook}
            </motion.p>

            <motion.ul className="st-notes" variants={rise}>
              {p.notes.map((n, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: n }} />
              ))}
            </motion.ul>

            <motion.div className="st-links" variants={rise}>
              {p.page && (
                <a className="btn btn-solid st-cta" href={`/work/${p.slug}`} data-pt={p.name} data-cursor="Open">
                  Case study <span className="arw">→</span>
                </a>
              )}
              {p.links.map((l) => (
                <a className="lnk" key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label} ↗
                </a>
              ))}
            </motion.div>

            {neighbours?.length > 0 && (
              <motion.p className="st-nn" variants={rise}>
                <span className="st-nn-k">Nearest in the index</span>
                {neighbours.map((n) => (
                  <button type="button" key={n.p.slug} onClick={() => onSelect(n.p.slug, 'neighbour')}>
                    {n.p.name} <i>{n.s.toFixed(2)}</i>
                  </button>
                ))}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="stage-media">
        <Media project={p} active={mediaActive} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={p.slug} className="stage-spec" variants={box} initial="hidden" animate="show" exit="exit">
            {p.metric ? (
              <motion.div className="st-metric" variants={rise}>
                <Odometer value={p.metric.value} />
                <span className="st-metric-k">{p.metric.label}</span>
              </motion.div>
            ) : (
              <motion.div className="st-metric st-metric-none" variants={rise}>
                <span className="st-metric-k">No headline metric published for this one — the notes carry it.</span>
              </motion.div>
            )}
            <motion.ul className="chips st-stack" variants={rise} aria-label="Stack">
              {p.stack.map((c) => (
                <li className="chip" key={c}>
                  {c}
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
