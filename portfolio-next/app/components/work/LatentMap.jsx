'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { DOMAINS } from '../../data/work';
import { EASE_OUT } from '../../lib/motion';

/* The whole index as a similarity map. Positions come from a force layout
   over the TF-IDF cosine similarities (retrieval.js); edges are each
   project's two nearest neighbours. With a query, matches swell and a query
   point settles at the score-weighted centroid of the top three — the same
   picture a vector search draws, at the scale of one portfolio. */
export default function LatentMap({ items, pos, edges, scores, selected, onSelect, onOpen }) {
  const ref = useRef(null);
  const [sz, setSz] = useState({ w: 900, h: 560 });
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const el = ref.current;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSz({ w: Math.max(300, r.width), h: Math.max(300, r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const P = pos.map(([x, y]) => [x * sz.w, y * sz.h]);
  const idxOf = (slug) => items.findIndex((p) => p.slug === slug);

  const regions = useMemo(() => {
    const acc = {};
    items.forEach((p, i) => {
      (acc[p.domain] ||= []).push(pos[i]);
    });
    return Object.entries(acc).map(([d, pts]) => {
      const x = pts.reduce((a, b) => a + b[0], 0) / pts.length;
      const y = Math.min(...pts.map((q) => q[1]));
      return { d, x, y };
    });
  }, [items, pos]);

  const top = scores ? scores.filter((s) => s.score > 0.02).slice(0, 3) : [];
  let q = null;
  if (top.length) {
    const wsum = top.reduce((a, s) => a + s.score, 0);
    q = [
      top.reduce((a, s) => a + P[s.i][0] * s.score, 0) / wsum,
      top.reduce((a, s) => a + P[s.i][1] * s.score, 0) / wsum,
    ];
  }
  const scoreOf = (i) => (scores ? scores.find((s) => s.i === i)?.score ?? 0 : null);

  const sel = idxOf(selected);
  const card = sel >= 0 ? items[sel] : null;
  const cardPos = sel >= 0 ? P[sel] : null;

  return (
    <div className="map" ref={ref}>
      <svg width={sz.w} height={sz.h} className="map-svg" aria-hidden="true">
        {regions.map((r) => (
          <text key={r.d} x={r.x * sz.w} y={Math.max(18, r.y * sz.h - 30)} className={`map-region d-${r.d}`} textAnchor="middle">
            {DOMAINS[r.d].label}
          </text>
        ))}
        {edges.map(([a, b, s], k) => (
          <motion.line
            key={`${a}-${b}`}
            x1={P[a][0]}
            y1={P[a][1]}
            x2={P[b][0]}
            y2={P[b][1]}
            className="map-edge"
            style={{ opacity: 0.25 + Math.min(1, s * 3) * 0.5 }}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, delay: 0.25 + k * 0.03, ease: EASE_OUT }}
          />
        ))}
        {q &&
          top.map((s) => (
            <g key={`q-${s.i}`}>
              <motion.line
                x1={q[0]}
                y1={q[1]}
                x2={P[s.i][0]}
                y2={P[s.i][1]}
                className="map-qline"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: EASE_OUT }}
              />
              <text x={(q[0] + P[s.i][0]) / 2} y={(q[1] + P[s.i][1]) / 2 - 6} className="map-qscore" textAnchor="middle">
                {s.score.toFixed(2)}
              </text>
            </g>
          ))}
        {q && (
          <motion.g initial={false} animate={{ x: q[0], y: q[1] }} transition={{ type: 'spring', stiffness: 160, damping: 20 }}>
            <circle r="14" className="map-q-halo" />
            <circle r="5" className="map-q" />
            <text x="12" y="-10" className="map-q-lbl">
              query
            </text>
          </motion.g>
        )}
      </svg>

      {items.map((p, i) => {
        const s = scoreOf(i);
        const dim = scores && s < 0.02;
        const r = (p.tier === 'case' ? 7 : p.tier === 'build' ? 5.5 : 4.5) + (s ? s * 14 : 0);
        return (
          <motion.button
            type="button"
            key={p.slug}
            className={`map-node d-${p.domain}${p.slug === selected ? ' on' : ''}${dim ? ' dim' : ''}${hover === i ? ' hov' : ''}`}
            style={{ left: P[i][0], top: P[i][1] }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.05 * i, ease: EASE_OUT }}
            onClick={() => onSelect(p.slug, 'map')}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            aria-label={`${p.name} — ${p.kind}`}
            aria-pressed={p.slug === selected}
          >
            <span className="mn-dot" style={{ width: r * 2, height: r * 2 }} />
            <span className="mn-lbl">
              {p.name}
              {s != null && s > 0.02 && <i>{s.toFixed(2)}</i>}
            </span>
          </motion.button>
        );
      })}

      {card && (
        <div
          key={card.slug}
          className={`map-card${cardPos[0] > sz.w * 0.55 ? ' left' : ''}${cardPos[1] > sz.h * 0.55 ? ' up' : ''}`}
          style={{ left: cardPos[0], top: cardPos[1] }}
        >
          <motion.div
            className="map-card-in"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            <p className="mc-kind">{card.kind}</p>
            <p className="mc-name">{card.name}</p>
            <p className="mc-hook">{card.hook}</p>
            {card.metric && (
              <p className="mc-metric">
                <b>{card.metric.value}</b> {card.metric.label}
              </p>
            )}
            <button type="button" className="lnk" onClick={() => onOpen(card.slug)}>
              Open on stage →
            </button>
          </motion.div>
        </div>
      )}

      <div className="map-legend" aria-hidden="true">
        {Object.entries(DOMAINS).map(([k, d]) => (
          <span key={k} className={`d-${k}`}>
            <i />
            {d.label}
          </span>
        ))}
        <span className="map-note">force layout over TF-IDF cosine similarity · edges = 2 nearest neighbours</span>
      </div>
    </div>
  );
}
