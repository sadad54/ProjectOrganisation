'use client';

const BOX_W = 150;
const BOX_H = 56;
const GAP = 34;
const PAD = 24;
const ROW_Y = 30;

export default function LoopDiagram({ nodes, gateLabel, title }) {
  const width = PAD * 2 + nodes.length * BOX_W + (nodes.length - 1) * GAP;
  const height = 210;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={title || 'Loop diagram'}>
      <defs>
        <marker id="dg-arrow-loop" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="dg-accent" />
        </marker>
      </defs>
      {nodes.map((node, i) => {
        const x = PAD + i * (BOX_W + GAP);
        return (
          <g key={node.label}>
            <rect x={x} y={ROW_Y} width={BOX_W} height={BOX_H} rx={8} className="dg-box" />
            <text x={x + 12} y={ROW_Y + 22} className="dg-label" fontSize="11">
              {node.label}
            </text>
            {node.sub && (
              <text x={x + 12} y={ROW_Y + 40} fontSize="9.5">
                {node.sub}
              </text>
            )}
            {i < nodes.length - 1 && (
              <line
                x1={x + BOX_W}
                y1={ROW_Y + BOX_H / 2}
                x2={x + BOX_W + GAP}
                y2={ROW_Y + BOX_H / 2}
                className="dg-line"
                strokeWidth="1.5"
                markerEnd="url(#dg-arrow-loop)"
              />
            )}
          </g>
        );
      })}
      <path
        d={`M ${PAD + (nodes.length - 1) * (BOX_W + GAP) + BOX_W / 2} ${ROW_Y + BOX_H}
            C ${width - 10} ${height - 26}, ${10} ${height - 26}, ${PAD + BOX_W / 2} ${ROW_Y + BOX_H}`}
        fill="none"
        className="dg-line"
        strokeWidth="1.5"
        markerEnd="url(#dg-arrow-loop)"
      />
      {gateLabel && (
        <text x={width / 2} y={height - 8} className="dg-accent" fontSize="11" textAnchor="middle">
          {gateLabel}
        </text>
      )}
    </svg>
  );
}
