'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { DOMAINS, TIER_GROUP } from '../../data/work';
import { EASE_OUT } from '../../lib/motion';

/* The index: a vertical tablist. With no query it's grouped by tier; with a
   query the rows physically re-sort by score (FLIP via `layout`) and grow a
   similarity bar. The active row carries a shared highlight that slides
   between rows instead of blinking. Arrow keys move, Home/End jump. */
export default function IndexList({ rows, ranked, selected, onSelect, onPreload, autoplay, autoplayMs }) {
  const listRef = useRef(null);

  function onKeyDown(e) {
    const i = rows.findIndex((r) => r.p.slug === selected);
    let next = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = rows[Math.min(rows.length - 1, i + 1)];
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = rows[Math.max(0, i - 1)];
    else if (e.key === 'Home') next = rows[0];
    else if (e.key === 'End') next = rows[rows.length - 1];
    if (!next) return;
    e.preventDefault();
    onSelect(next.p.slug, 'key');
    requestAnimationFrame(() => listRef.current?.querySelector(`#tab-${next.p.slug}`)?.focus());
  }

  let lastTier = null;
  return (
    <div className="ix" role="tablist" aria-orientation="vertical" aria-label="Projects" ref={listRef} onKeyDown={onKeyDown} data-lenis-prevent>
      {rows.map(({ p, score, n }) => {
        const on = p.slug === selected;
        const head = !ranked && p.tier !== lastTier ? p.tier : null;
        lastTier = p.tier;
        const dim = ranked && score < 0.02;
        return (
          <motion.div
            key={p.slug}
            layout="position"
            transition={{ layout: { duration: 0.55, ease: EASE_OUT } }}
            className="ix-slot"
            role="presentation"
          >
            {head && (
              <p className="ix-group" aria-hidden="true">
                {TIER_GROUP[head]} <span>{rows.filter((r) => r.p.tier === head).length}</span>
              </p>
            )}
            <button
              type="button"
              role="tab"
              id={`tab-${p.slug}`}
              aria-selected={on}
              aria-controls="work-panel"
              tabIndex={on ? 0 : -1}
              className={`ix-row${on ? ' on' : ''}${dim ? ' dim' : ''}`}
              onClick={() => onSelect(p.slug, 'click')}
              onPointerEnter={() => onPreload?.(p)}
            >
              {on && (
                <motion.span
                  layoutId="ix-active"
                  className="ix-hl"
                  transition={{ type: 'spring', stiffness: 420, damping: 38 }}
                  aria-hidden="true"
                />
              )}
              <span className="ix-n">{String(n).padStart(2, '0')}</span>
              <span className="ix-name">{p.name}</span>
              <span className={`ix-dom d-${p.domain}`} aria-hidden="true">
                {DOMAINS[p.domain].short}
              </span>
              {ranked ? (
                <span className="ix-score" aria-label={`similarity ${score.toFixed(2)}`}>
                  <span className="ix-bar">
                    <motion.span
                      initial={false}
                      animate={{ scaleX: Math.max(0.02, score) }}
                      transition={{ duration: 0.6, ease: EASE_OUT }}
                    />
                  </span>
                  {score.toFixed(2)}
                </span>
              ) : (
                <span className="ix-year">{p.year || '—'}</span>
              )}
              {on && autoplay && <span key={p.slug} className="ix-prog" style={{ animationDuration: `${autoplayMs}ms` }} aria-hidden="true" />}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
