'use client';

import { useState } from 'react';
import { motion, useTransform, useMotionValueEvent } from 'framer-motion';

const nf4 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

// PR-AUC, as reported on the résumé: the honest chronological baseline,
// then the incumbent and the retrained candidate on the same gate holdout
const PTS = [
  { x: 120, v: 0.4751, label: 'chronological split' },
  { x: 380, v: 0.2811, label: 'incumbent · gate holdout' },
  { x: 640, v: 0.4802, label: 'candidate · same holdout' },
];
const yOf = (v) => 236 - ((v - 0.22) / (0.56 - 0.22)) * 196;
const LINE = `M${PTS.map((p) => `${p.x} ${yOf(p.v).toFixed(1)}`).join(' L')}`;

export default function DriftlineScene({ p }) {
  return <SceneInner p={p} />;
}

function SceneInner({ p }) {
  const [phase, setPhase] = useState(0);
  const phaseMv = useTransform(p, (v) => (v < 0.3 ? 0 : v < 0.65 ? 1 : v < 0.9 ? 2 : 3));
  useMotionValueEvent(phaseMv, 'change', setPhase);

  const draw = useTransform(p, [0.03, 0.9], [0, 1], { clamp: true });
  const value = useTransform(p, [0, 0.3, 0.65, 0.9], [0.4751, 0.4751, 0.2811, 0.4802], { clamp: true });
  const valueText = useTransform(value, (v) => nf4.format(v));
  const collapseFlash = useTransform(p, [0.5, 0.55, 0.65, 0.7], [0, 1, 1, 0], { clamp: true });
  const skewOpacity = useTransform(p, [0.9, 0.98], [0, 1], { clamp: true });
  const barScaleX = p;

  const readout =
    phase === 0
      ? ['Replaying', '590K IEEE-CIS transactions streamed through Redpanda + PyFlink. XGBoost scores 0.4751 PR-AUC on the honest chronological split.']
      : phase === 1
        ? ['Drifted', 'On the gate’s holdout the incumbent scores 0.2811 — the model is quietly worse and nothing says so.']
        : phase === 2
          ? ['Retrain → gate', 'PSI/KS drift tests fire a retrain. The candidate scores 0.4802 on the same holdout, clears the gate and is promoted.']
          : ['Held', 'The pipeline caught its own decay and fixed it. The failure was logged, not hidden.'];

  return (
    <div className="scene-wrap">
      <div className="scene-copy">
        <p className="scene-eyebrow">Driftline · Streaming ML / drift</p>
        <h3 className="scene-h" id="scene-drift-h">
          A model decays in silence. The pipeline has to notice before you do.
        </h3>
        <p className="scene-body">
          590K real transactions, replayed in order. Left alone, the model drifts. <strong>Drift tests
          catch it and trigger a retrain — and the candidate only ships if it beats the incumbent on the
          same holdout.</strong>
        </p>
        <div className="slab scene-slab">
          <span className="c"># PSI / KS drift tests on the live feature stream</span>
          <br />
          <span className="k">if</span> drift_score &gt; threshold:
          <br />
          &nbsp;&nbsp;trigger_retrain() <span className="c"># no human in the loop</span>
        </div>
        <div className={`scene-readout ${phase === 1 ? 'bad' : ''} ${phase >= 2 ? 'good' : ''}`}>
          <span className="attempt">{readout[0]}</span>
          {readout[1]}
        </div>
      </div>

      <div className="scene-stage">
        <div className="scene-drift-value">
          <motion.span className="scene-drift-num">{valueText}</motion.span>
          <span className="scene-drift-k">PR-AUC</span>
        </div>

        <svg className="scene-svg" viewBox="0 0 720 260" role="img" aria-label="PR-AUC: chronological baseline, drifted incumbent and retrained candidate" aria-describedby="scene-drift-desc">
          {/* baseline grid */}
          <line x1="40" y1={yOf(0.4751)} x2="700" y2={yOf(0.4751)} stroke="var(--hair-2)" strokeDasharray="3 5" />
          <text className="wire-lbl" x="44" y={yOf(0.4751) - 12}>chronological baseline 0.4751</text>

          <motion.path
            d={LINE}
            fill="none"
            stroke="var(--signal)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            style={{ pathLength: draw }}
          />

          {PTS.map((pt, i) => {
            const lit = phase >= i;
            const isCollapse = i === 1;
            const isRecovery = i === 2;
            return (
              <g key={i}>
                <motion.circle
                  cx={pt.x}
                  cy={yOf(pt.v)}
                  r={lit ? 5 : 3}
                  fill={isRecovery && phase >= 2 ? 'var(--pass)' : isCollapse && phase >= 1 ? 'var(--fail)' : lit ? 'var(--signal)' : 'var(--s3)'}
                  stroke={lit ? 'var(--void)' : 'var(--hair-2)'}
                  strokeWidth="2"
                />
                {isCollapse && (
                  <motion.circle
                    cx={pt.x}
                    cy={yOf(pt.v)}
                    r="14"
                    fill="none"
                    stroke="var(--fail)"
                    strokeWidth="1.5"
                    style={{ opacity: collapseFlash }}
                  />
                )}
                {i !== 0 && (
                  <text
                    className="wire-lbl"
                    x={pt.x}
                    y={yOf(pt.v) + (i === 2 ? -16 : 26)}
                    textAnchor="middle"
                    style={{ opacity: lit ? 1 : 0.62 }}
                  >
                    {pt.v.toFixed(4)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <motion.p className="scene-note" style={{ opacity: skewOpacity }}>
          Footnote: a random split scored 0.6974. The chronological 0.4751 is the number reported.
        </motion.p>

        <div className="scene-progress" aria-hidden="true">
          <motion.span style={{ scaleX: barScaleX }} />
        </div>
      </div>

      <p id="scene-drift-desc" className="sr-only">
        A line chart of PR-AUC. XGBoost scores 0.4751 on a chronological split. After drift, the
        incumbent scores 0.2811 on the promotion gate's holdout; the drift-triggered retrain scores 0.4802
        on the same holdout and is promoted. A footnote notes that a random split scored 0.6974, and that
        the chronological figure is the one reported.
      </p>
    </div>
  );
}
