'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import Split from '../site/Split';
import { reducedMotionNow } from '../../lib/motion';

/* Act B — the arithmetic behind "one percent a day". Both curves are
   computed (1.01^d and 0.99^d) and drawn to one linear scale, so the long
   flat stretch before the climb is the real shape, not a flourish. */
const DAYS = 365;
const W = 720,
  H = 400;
const X0 = 54,
  X1 = 700,
  Y0 = 352,
  Y1 = 26;
const TOP = 40;
const up = (d) => 1.01 ** d;
const down = (d) => 0.99 ** d;
const px = (d) => X0 + ((X1 - X0) * d) / DAYS;
const py = (v) => Y0 - ((Y0 - Y1) * v) / TOP;
const path = (f) =>
  Array.from({ length: DAYS + 1 }, (_, d) => `${d ? 'L' : 'M'}${px(d).toFixed(1)} ${py(f(d)).toFixed(2)}`).join('');
const YT = [1, 10, 20, 30];
// milestones come from the arithmetic, never typed in: the first day each
// multiple is passed
const firstDay = (x) => Math.ceil(Math.log(x) / Math.log(1.01));
const MARKS = [2, 10].map((x) => ({ x, d: firstDay(x) }));
const FLAT = MARKS[0].d; // the stretch that still looks like nothing
const area = `${path(up)}L${px(DAYS).toFixed(1)} ${Y0}L${X0} ${Y0}Z`;
const XT = [0, 90, 180, 270, 365];

export default function Compound() {
  const root = useRef(null);
  const svg = useRef(null);
  const [day, setDay] = useState(DAYS);
  const better = useMemo(() => path(up), []);
  const worse = useMemo(() => path(down), []);

  // first time it is seen, the year plays through once
  useEffect(() => {
    if (reducedMotionNow()) return;
    let ctl;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        ctl = animate(0, DAYS, { duration: 2.6, ease: [0.3, 0, 0.2, 1], delay: 0.25, onUpdate: (v) => setDay(Math.round(v)) });
      },
      { threshold: 0.45 }
    );
    io.observe(root.current);
    return () => {
      io.disconnect();
      ctl?.stop();
    };
  }, []);

  function scrub(e) {
    const r = svg.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    setDay(Math.round(Math.min(DAYS, Math.max(0, ((x - X0) / (X1 - X0)) * DAYS))));
  }

  const x = px(day);
  return (
    <div className="bw-compound band" data-field="7" data-field-dim="0.32">
      <div className="wrap bw-cmp">
        <div className="bw-cmp-copy">
          <p className="layer rv">
            <span className="bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <b>lr</b> Learning rate <span className="rule" aria-hidden="true" /> small steps, every day
          </p>
          <Split as="h2" className="display" text={['One percent, ', { t: 'compounded.', em: true }]} />
          <p className="lede rv" style={{ '--d': 80 }}>
            <b>Atomic Habits</b> puts arithmetic on it. Get one percent better every day and a year later you are close
            to thirty-eight times where you started. Slip one percent a day and almost nothing is left. Drag the day:
            the line looks flat for months before it stops looking flat.
          </p>
          <dl className="bw-read rv" style={{ '--d': 160 }}>
            <div>
              <dt>Day</dt>
              <dd>{day}</dd>
            </div>
            <div className="hot">
              <dt>1% better</dt>
              <dd>×{up(day).toFixed(2)}</dd>
            </div>
            <div className="cold">
              <dt>1% worse</dt>
              <dd>×{down(day).toFixed(2)}</dd>
            </div>
          </dl>
        </div>

        <figure className="bw-chart scene-stage rv" data-reveal ref={root} style={{ '--d': 120 }}>
          <p className="bw-chart-top" aria-hidden="true">
            <span>
              <i className="hot" /> 1.01ⁿ
            </span>
            <span>
              <i className="cold" /> 0.99ⁿ
            </span>
            <span className="r">drag the day</span>
          </p>
          <svg
            ref={svg}
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`After ${day} days: one percent better each day is ${up(day).toFixed(2)} times the start; one percent worse is ${down(day).toFixed(2)} times.`}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              scrub(e);
            }}
            onPointerMove={(e) => e.buttons && scrub(e)}
            data-no-shock
            data-cursor="Drag"
          >
            {YT.map((v) => (
              <g key={v} className="bw-grid">
                <line x1={X0} x2={X1} y1={py(v)} y2={py(v)} />
                <text x={X0 - 10} y={py(v) + 3} textAnchor="end">
                  ×{v}
                </text>
              </g>
            ))}
            {XT.map((d) => (
              <text key={d} className="bw-tick" x={px(d)} y={Y0 + 22} textAnchor="middle">
                {d === 0 ? 'day 0' : d}
              </text>
            ))}
            <defs>
              <linearGradient id="bw-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--signal)" stopOpacity=".26" />
                <stop offset="1" stopColor="var(--signal)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="bw-area" d={area} fill="url(#bw-area)" />
            <line className="bw-axis" x1={X0} x2={X1} y1={Y0} y2={Y0} />
            {/* the first seventy days: twice as good, and it looks like nothing */}
            <g className="bw-flatline">
              <path d={`M${px(0)} ${Y0 - 30}v-7H${px(FLAT)}v7`} />
              <text x={px(0)} y={Y0 - 46}>
                ×2 by day {FLAT} · still looks flat
              </text>
            </g>
            {MARKS.map((m) => (
              <g key={m.x} className={`bw-ms${day >= m.d ? ' on' : ''}`}>
                <line x1={px(m.d)} x2={px(m.d)} y1={py(up(m.d))} y2={Y0} />
                <circle cx={px(m.d)} cy={py(up(m.d))} r="3" />
                {m.x > 2 && (
                  <text x={px(m.d) - 8} y={py(up(m.d)) - 10} textAnchor="end">
                    ×{m.x} · day {m.d}
                  </text>
                )}
              </g>
            ))}
            <path className="bw-curve cold" d={worse} pathLength="1" />
            <path className="bw-curve hot" d={better} pathLength="1" />
            <g className="bw-mark">
              <line x1={x} x2={x} y1={Y1 - 8} y2={Y0} />
              <circle className="cold" cx={x} cy={py(down(day))} r="4.5" />
              <circle className="hot" cx={x} cy={py(up(day))} r="5.5" />
            </g>
          </svg>
          <input
            className="bw-range"
            type="range"
            min="0"
            max={DAYS}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            aria-label="Day of the year"
            data-no-shock
          />
          <figcaption className="about-cap">
            <span>1.01ⁿ and 0.99ⁿ · computed, linear scale</span>
            <span>n = {day}</span>
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
