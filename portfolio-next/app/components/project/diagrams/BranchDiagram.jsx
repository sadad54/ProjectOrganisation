'use client';

import { useId } from 'react';

const ROOT_W = 220;
const ROOT_H = 44;
const BRANCH_W = 140;
const BRANCH_H = 60;
const GAP_X = 24;
const PAD = 20;
const V_GAP = 46;

export default function BranchDiagram({ root, branches, outcome, title }) {
  const uid = useId();
  const arrowId = `dg-arrow-branch-${uid}`;
  let width = PAD * 2 + branches.length * BRANCH_W + (branches.length - 1) * GAP_X;
  const outcomeW = Math.max(180, outcome.length * 7 + 32);
  if (outcomeW + PAD * 2 > width) width = outcomeW + PAD * 2;
  const rootX = width / 2 - ROOT_W / 2;
  const rootY = PAD;
  const branchY = rootY + ROOT_H + V_GAP;
  const outcomeY = branchY + BRANCH_H + V_GAP;
  const height = outcomeY + 44 + PAD;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={title || 'Simulation fan-out diagram'}>
      <defs>
        <marker id={arrowId} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="dg-accent" />
        </marker>
      </defs>
      <rect x={rootX} y={rootY} width={ROOT_W} height={ROOT_H} rx={8} className="dg-box" />
      <text x={width / 2} y={rootY + ROOT_H / 2 + 5} className="dg-label" fontSize="12" textAnchor="middle">
        {root}
      </text>

      {branches.map((branch, i) => {
        const x = PAD + i * (BRANCH_W + GAP_X);
        const midX = x + BRANCH_W / 2;
        return (
          <g key={branch.label}>
            <line
              x1={width / 2}
              y1={rootY + ROOT_H}
              x2={midX}
              y2={branchY}
              className="dg-line"
              strokeWidth="1.2"
              markerEnd={`url(#${arrowId})`}
            />
            <rect x={x} y={branchY} width={BRANCH_W} height={BRANCH_H} rx={8} className="dg-box" />
            <text x={midX} y={branchY + 22} className="dg-label" fontSize="11" textAnchor="middle">
              {branch.label}
            </text>
            {branch.sub && (
              <text x={midX} y={branchY + 40} fontSize="9.5" textAnchor="middle">
                {branch.sub}
              </text>
            )}
            <line
              x1={midX}
              y1={branchY + BRANCH_H}
              x2={width / 2}
              y2={outcomeY}
              className="dg-line"
              strokeWidth="1.2"
              markerEnd={`url(#${arrowId})`}
            />
          </g>
        );
      })}

      <rect x={width / 2 - outcomeW / 2} y={outcomeY} width={outcomeW} height={44} rx={8} className="dg-box" />
      <text x={width / 2} y={outcomeY + 26} className="dg-accent" fontSize="12" textAnchor="middle">
        {outcome}
      </text>
    </svg>
  );
}
