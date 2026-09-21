'use client';

import { useId } from 'react';

const COL_W = 260;
const COL_H = 130;
const GAP = 60;
const PAD = 20;

export default function CompareDiagram({ before, after, diffLabel, title }) {
  const uid = useId();
  const arrowId = `dg-arrow-compare-${uid}`;
  const width = PAD * 2 + COL_W * 2 + GAP;
  const height = PAD * 2 + COL_H;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={title || 'Comparison diagram'}>
      <defs>
        <marker id={arrowId} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="dg-accent" />
        </marker>
      </defs>
      {[before, after].map((col, i) => {
        const x = PAD + i * (COL_W + GAP);
        return (
          <g key={col.label}>
            <rect x={x} y={PAD} width={COL_W} height={COL_H} rx={8} className="dg-box" />
            <text x={x + 14} y={PAD + 22} fontSize="10" letterSpacing="1">
              {col.eyebrow}
            </text>
            <text x={x + 14} y={PAD + 46} className="dg-label" fontSize="14">
              {col.label}
            </text>
            {col.lines?.map((line, li) => (
              <text key={li} x={x + 14} y={PAD + 70 + li * 18} fontSize="11">
                {line}
              </text>
            ))}
          </g>
        );
      })}
      <line
        x1={PAD + COL_W}
        y1={PAD + COL_H / 2}
        x2={PAD + COL_W + GAP}
        y2={PAD + COL_H / 2}
        className="dg-line"
        strokeWidth="1.5"
        markerEnd={`url(#${arrowId})`}
      />
      {diffLabel && (
        <text x={PAD + COL_W + GAP / 2} y={PAD + COL_H / 2 - 10} className="dg-accent" fontSize="12" textAnchor="middle">
          {diffLabel}
        </text>
      )}
    </svg>
  );
}
