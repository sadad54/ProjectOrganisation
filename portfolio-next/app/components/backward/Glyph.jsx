// a tiny seeded generator (mulberry32), kept local so this stays a server component
function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* One mark per corpus entry: a small drawing of the idea that entry stands
   for, in the same line language as the site's diagrams. All geometry is
   computed here (seeded where it scatters), all motion is CSS in
   backward.css, and every mark is decoration: the row's text says the same
   thing in words. viewBox 132 × 72. */
const W = 132,
  H = 72;
const r2 = (n) => Math.round(n * 100) / 100;

/* objective — a servo: overshoot, correct, settle on the target */
function Servo() {
  const d = 'M6 58 C 30 58, 44 8, 66 22 S 84 50, 96 40 S 104 33, 108 36';
  return (
    <>
      <circle className="g-dim" cx="108" cy="36" r="17" />
      <circle className="g-dim" cx="108" cy="36" r="9" />
      <line className="g-dim g-dash" x1="6" x2="126" y1="36" y2="36" />
      <path className="g-line g-draw" d={d} pathLength="1" />
      <circle className="g-dot g-ride" r="3" style={{ offsetPath: `path('${d}')` }} />
    </>
  );
}

/* latent space — a little above the line, most of it underneath */
function Strata() {
  const rnd = prng(63);
  const below = Array.from({ length: 34 }, () => [8 + rnd() * 116, 30 + Math.pow(rnd(), 0.7) * 38, rnd()]);
  const above = [22, 47, 71, 98, 116];
  return (
    <>
      <line className="g-dim" x1="2" x2="130" y1="24" y2="24" />
      {above.map((x, i) => (
        <circle key={x} className="g-dot" cx={x} cy={12 + (i % 2) * 5} r="2.4" />
      ))}
      {below.map(([x, y, p], i) => (
        <circle key={i} className="g-faint g-twinkle" cx={r2(x)} cy={r2(y)} r={r2(1 + p * 1.4)} style={{ '--k': i % 9 }} />
      ))}
      {above.map((x, i) => (
        <line key={`l${x}`} className="g-dim g-dash" x1={x} x2={x} y1={18 + (i % 2) * 5} y2={36 + ((i * 13) % 22)} />
      ))}
    </>
  );
}

/* learning rate — thirteen months of 1% a day, drawn to scale */
function Steps() {
  const v = Array.from({ length: 13 }, (_, k) => 1.01 ** (k * 30));
  const top = v[v.length - 1];
  return (
    <>
      <line className="g-dim" x1="4" x2="128" y1="66" y2="66" />
      {v.map((x, k) => {
        const h = Math.max(1.5, (x / top) * 58);
        return <rect key={k} className={`g-bar${k === 12 ? ' hot' : ''}`} x={6 + k * 9.5} y={r2(66 - h)} width="5.5" height={r2(h)} style={{ '--k': k }} />;
      })}
    </>
  );
}

/* evaluation — four weeks of days, each one accounted for; not all pass */
function Tally() {
  const miss = new Set([4, 11, 19]);
  return (
    <>
      {Array.from({ length: 28 }, (_, i) => {
        const x = 8 + (i % 7) * 17,
          y = 5 + ((i / 7) | 0) * 16.5;
        return <rect key={i} className={`g-cell${miss.has(i) ? ' miss' : ''}`} x={x} y={y} width="11" height="11" rx="1.5" style={{ '--k': i }} />;
      })}
    </>
  );
}

/* denoising — scattered points settle into a ring, then scatter again */
function Polish() {
  const rnd = prng(1207);
  const n = 30;
  return (
    <>
      <circle className="g-dim g-dash" cx="66" cy="36" r="26" />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return (
          <circle
            key={i}
            className="g-dot g-settle"
            cx={r2(66 + Math.cos(a) * 26)}
            cy={r2(36 + Math.sin(a) * 26)}
            r="1.9"
            style={{ '--dx': `${r2((rnd() - 0.5) * 78)}px`, '--dy': `${r2((rnd() - 0.5) * 44)}px`, '--k': i % 6 }}
          />
        );
      })}
    </>
  );
}

/* logging — entries, one line at a time */
function Log() {
  const rows = [58, 92, 44, 80, 66];
  return (
    <>
      {rows.map((w, i) => (
        <g key={i}>
          <rect className="g-faint" x="6" y={8 + i * 12.5} width="14" height="3" rx="1" />
          <rect className={`g-entry${i === rows.length - 1 ? ' hot' : ''}`} x="26" y={8 + i * 12.5} width={w} height="3" rx="1" style={{ '--k': i }} />
        </g>
      ))}
      <rect className="g-caret" x={26 + rows[4] + 4} y="55" width="2" height="9" />
    </>
  );
}

/* compounding — the same link, repeated, each one larger than the last */
function Chain() {
  let x = 8;
  const links = Array.from({ length: 7 }, (_, k) => {
    const r = 3 * 1.32 ** k;
    const c = { x: x + r, r };
    x += r * 1.45;
    return c;
  });
  return (
    <>
      <line className="g-dim g-dash" x1="4" x2="128" y1="52" y2="52" />
      {links.map((c, k) => (
        <circle key={k} className={`g-ring${k === links.length - 1 ? ' hot' : ''}`} cx={r2(c.x)} cy={r2(52 - c.r)} r={r2(c.r)} style={{ '--k': k }} />
      ))}
    </>
  );
}

/* discipline — a metronome */
function Metronome() {
  return (
    <>
      <path className="g-dim" d="M44 66 L58 8 H74 L88 66 Z" />
      <line className="g-dim" x1="36" x2="96" y1="66" y2="66" />
      {[-2, -1, 0, 1, 2].map((k) => (
        <line key={k} className="g-dim" x1={66 + k * 22} x2={66 + k * 22} y1="4" y2="8" />
      ))}
      <g className="g-swing">
        <line className="g-line" x1="66" x2="66" y1="62" y2="10" />
        <rect className="g-dot" x="61" y="24" width="10" height="7" rx="1" />
      </g>
    </>
  );
}

/* this sky — brush strokes turning round a star */
function Swirl() {
  const strokes = [];
  for (let ring = 0; ring < 4; ring++) {
    const r = 7 + ring * 7;
    const n = 5 + ring * 3;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + ring * 0.5;
      const len = 0.26 + ring * 0.02;
      strokes.push(
        <path
          key={`${ring}-${k}`}
          className={ring < 2 ? 'g-line' : 'g-stroke'}
          d={`M${r2(66 + Math.cos(a) * r)} ${r2(36 + Math.sin(a) * r)} A${r} ${r} 0 0 1 ${r2(66 + Math.cos(a + len) * r)} ${r2(36 + Math.sin(a + len) * r)}`}
        />
      );
    }
  }
  return (
    <>
      <g className="g-turn">{strokes}</g>
      <circle className="g-dot" cx="66" cy="36" r="2.6" />
      <g className="g-turn slow">
        <path className="g-stroke" d="M14 20 a6 6 0 0 1 9 -3" />
        <path className="g-stroke" d="M112 54 a7 7 0 0 1 8 5" />
      </g>
    </>
  );
}

/* known bias — the ninety minutes, and the three after them */
function Clock() {
  const R = 25,
    C = 2 * Math.PI * R;
  const extra = (3 / 90) * C; // added time, to scale
  return (
    <>
      <circle className="g-dim" cx="40" cy="36" r={R} />
      <circle className="g-line g-full" cx="40" cy="36" r={R} strokeDasharray={`${r2(C)} ${r2(C)}`} transform="rotate(-90 40 36)" />
      <circle className="g-added" cx="40" cy="36" r={R + 5} strokeDasharray={`${r2(extra + 2)} ${r2(C * 2)}`} transform="rotate(-90 40 36)" />
      <text className="g-text" x="78" y="33">
        90
        <tspan className="hot">+3′</tspan>
      </text>
      <text className="g-cap" x="78" y="47">
        not over
      </text>
    </>
  );
}

/* fiction — a code is a line you hold; the leap is the part you can't see land */
function Leap() {
  const d = 'M22 14 C 60 6, 92 30, 104 58';
  return (
    <>
      <path className="g-line" d="M4 14 H22" />
      <path className="g-dim" d="M22 14 V66" />
      <path className="g-dim g-dash g-draw" d={d} pathLength="1" />
      <path className="g-dim" d="M92 66 q12 -14 24 0 Z" />
      <circle className="g-dot g-ride fall" r="2.8" style={{ offsetPath: `path('${d}')` }} />
      <circle className="g-dot" cx="14" cy="10" r="1.6" />
      <circle className="g-dot" cx="9" cy="10" r="1.6" />
      <circle className="g-dot" cx="19" cy="10" r="1.6" />
    </>
  );
}

const MARKS = { servo: Servo, strata: Strata, steps: Steps, tally: Tally, polish: Polish, log: Log, chain: Chain, metronome: Metronome, swirl: Swirl, clock: Clock, leap: Leap };

export default function Glyph({ name }) {
  const Mark = MARKS[name];
  if (!Mark) return null;
  return (
    <svg className={`bw-glyph g-${name}`} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
      <Mark />
    </svg>
  );
}
