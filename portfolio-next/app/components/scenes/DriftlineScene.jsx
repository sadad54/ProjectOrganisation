'use client';

import { useState } from 'react';
import { motion, useTransform, useMotionValueEvent } from 'framer-motion';
import { PinnedScene } from './PinnedScene';

const nf4 = new Intl.NumberFormat('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

// PR-AUC over the replay (spec §6.4)
const PTS = [
  { x: 96, v: 0.4761, label: 'baseline' },
  { x: 288, v: 0.368, label: 'after 6mo · no retrain' },
  { x: 480, v: 0.2635, label: 'mid-stream collapse' },
  { x: 648, v: 0.5211, label: 'after retraining' },
];
const yOf = (v) => 236 - ((v - 0.22) / (0.56 - 0.22)) * 196;
const LINE = `M${PTS.map((p) => `${p.x} ${yOf(p.v).toFixed(1)}`).join(' L')}`;

export default function DriftlineScene() {
  return (
    <PinnedScene id="slide-drift" className="scene-drift" labelledBy="scene-drift-h">
      {(p) => <SceneInner p={p} />}
    </PinnedScene>
  );
}

function SceneInner({ p }) {
  const [phase, setPhase] = useState(0);
  const phaseMv = useTransform(p, (v) => (v < 0.25 ? 0 : v < 0.55 ? 1 : v < 0.9 ? 2 : 3));
  useMotionValueEvent(phaseMv, 'change', setPhase);

  const draw = useTransform(p, [0.03, 0.9], [0, 1], { clamp: true });
  const value = useTransform(p, [0, 0.25, 0.55, 0.9], [0.4761, 0.368, 0.2635, 0.5211], { clamp: true });
  const valueText = useTransform(value, (v) => nf4.format(v));
  const collapseFlash = useTransform(p, [0.46, 0.5, 0.6, 0.64], [0, 1, 1, 0], { clamp: true });
  const skewOpacity = useTransform(p, [0.9, 0.98], [0, 1], { clamp: true });
  const barScaleX = p;

  const readout =
    phase === 0
      ? ['Replaying', 'Six months of IEEE-CIS transactions streamed through Redpanda + PyFlink, exactly as a live system sees them.']
      : phase === 1
        ? ['Decaying', 'No retraining. PR-AUC slides from 0.4761 toward 0.37 — the model is quietly getting worse and nothing says so.']
        : phase === 2
          ? ['Collapse → recovery', 'PSI/KS drift tests fire at 0.2635. Automatic retraining kicks in and pulls PR-AUC back to 0.5211 — +97.8% in one week.']
          : ['Held', 'The pipeline caught its own decay and fixed it. The failure was logged, not hidden.'];

  return (
    <div className="scene-wrap wrap">
      <div className="scene-copy">
        <p className="scene-eyebrow">Driftline · Streaming ML / drift</p>
        <h3 className="scene-h" id="scene-drift-h">
          A model decays in silence. The pipeline has to notice before you do.
        </h3>
        <p className="scene-body">
          Six months of real transactions, replayed in order. Left alone, PR-AUC slides and then
          collapses. <strong>Drift tests catch it and trigger a retrain — the recovery is automatic,
          not a person noticing a dashboard.</strong>
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

        <svg className="scene-svg" viewBox="0 0 720 260" role="img" aria-describedby="scene-drift-desc">
          {/* baseline grid */}
          <line x1="40" y1={yOf(0.4761)} x2="700" y2={yOf(0.4761)} stroke="var(--line)" strokeDasharray="3 5" />
          <text className="wire-lbl" x="696" y={yOf(0.4761) + 16} textAnchor="end">baseline 0.4761</text>

          <motion.path
            d={LINE}
            fill="none"
            stroke="var(--sodium)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            style={{ pathLength: draw }}
          />

          {PTS.map((pt, i) => {
            const lit = phase >= i;
            const isCollapse = i === 2;
            const isRecovery = i === 3;
            return (
              <g key={i}>
                <motion.circle
                  cx={pt.x}
                  cy={yOf(pt.v)}
                  r={lit ? 5 : 3}
                  fill={isRecovery && phase >= 3 ? 'var(--signal)' : isCollapse && phase >= 2 ? 'var(--rose)' : lit ? 'var(--sodium)' : 'var(--ink-2)'}
                  stroke={lit ? 'var(--ink)' : 'var(--line)'}
                  strokeWidth="2"
                />
                {isCollapse && (
                  <motion.circle
                    cx={pt.x}
                    cy={yOf(pt.v)}
                    r="14"
                    fill="none"
                    stroke="var(--rose)"
                    strokeWidth="1.5"
                    style={{ opacity: collapseFlash }}
                  />
                )}
                {i !== 0 && (
                  <text
                    className="wire-lbl"
                    x={pt.x}
                    y={yOf(pt.v) + (i === 3 ? -16 : 26)}
                    textAnchor="middle"
                    style={{ opacity: lit ? 1 : 0.3 }}
                  >
                    {pt.v.toFixed(4)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <motion.p className="scene-note" style={{ opacity: skewOpacity }}>
          Footnote: an 8.66% training/serving feature-store skew, found and documented — not left out.
        </motion.p>

        <div className="scene-progress" aria-hidden="true">
          <motion.span style={{ scaleX: barScaleX }} />
        </div>
      </div>

      <p id="scene-drift-desc" className="sr-only">
        A line chart of PR-AUC over a six-month replay. It starts at 0.4761, drifts down to 0.3680 with
        no retraining, collapses to 0.2635, then recovers to 0.5211 after drift-triggered automatic
        retraining — a 97.8% jump in one week. A footnote notes an 8.66% training/serving skew that was
        found and documented.
      </p>
    </div>
  );
}
