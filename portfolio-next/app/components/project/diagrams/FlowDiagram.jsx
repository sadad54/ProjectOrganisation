'use client';

const BOX_W = 560;
const BOX_H = 46;
const GAP = 34;
const PAD = 20;

export default function FlowDiagram({ steps, title }) {
  const width = BOX_W + PAD * 2;
  const height = PAD * 2 + steps.length * BOX_H + (steps.length - 1) * GAP;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={title || 'Architecture diagram'}>
      <defs>
        <marker id="dg-arrow-flow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="dg-accent" />
        </marker>
      </defs>
      {steps.map((step, i) => {
        const y = PAD + i * (BOX_H + GAP);
        return (
          <g key={step.label}>
            <rect x={PAD} y={y} width={BOX_W} height={BOX_H} rx={8} className="dg-box" />
            <text x={PAD + 16} y={y + 20} className="dg-label" fontSize="13">
              {step.label}
            </text>
            {step.sub && (
              <text x={PAD + 16} y={y + 36} fontSize="11">
                {step.sub}
              </text>
            )}
            {i < steps.length - 1 && (
              <line
                x1={PAD + BOX_W / 2}
                y1={y + BOX_H}
                x2={PAD + BOX_W / 2}
                y2={y + BOX_H + GAP}
                className="dg-line"
                strokeWidth="1.5"
                markerEnd="url(#dg-arrow-flow)"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
