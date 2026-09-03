'use client';

import { useState } from 'react';
import { motion, useTransform, useMotionValueEvent } from 'framer-motion';
import { PinnedScene } from './PinnedScene';

const NODE = {
  0: { n1: 'act' },
  1: { n1: 'done', n2: 'act' },
  2: { n1: 'done', n2: 'done', n3: 'bad' },
  3: { n1: 'done', n2: 'act', n3: 'done' },
  4: { n1: 'done', n2: 'done', n3: 'good' },
  5: { n1: 'done', n2: 'done', n3: 'good', n4: 'good' },
};

const READOUT = {
  0: ['Attempt 1 · prompt', 'Answer transcript sent with the rubric and the required output schema.'],
  1: ['Attempt 1 · model', 'Llama 3.3 70B generates the evaluation JSON.'],
  2: ['Attempt 1 · rejected', 'clarity "4/5" — expected integer, got string. follow_up — required field missing.'],
  3: ['Repairing', 'The invalid response and both validation errors go back as the next prompt.'],
  4: ['Attempt 2 · valid', 'clarity: 4 ✓ integer in range. follow_up: present ✓'],
  5: ['Returned', 'Two model calls, one clean result. The user never saw the failure.'],
};

export default function RepairLoopScene() {
  const [phase, setPhase] = useState(0);

  return (
    <PinnedScene id="slide-repair" className="scene-repair" labelledBy="scene-repair-h">
      {(p) => <SceneInner p={p} phase={phase} setPhase={setPhase} />}
    </PinnedScene>
  );
}

function SceneInner({ p, phase, setPhase }) {
  // one derived step value; changes at most five times over the whole scroll
  const step = useTransform(p, (v) => {
    if (v < 0.2) return 0;
    if (v < 0.4) return 1;
    if (v < 0.55) return 2;
    if (v < 0.8) return 3;
    if (v < 0.95) return 4;
    return 5;
  });
  useMotionValueEvent(step, 'change', (v) => setPhase(v));

  const f1 = useTransform(p, [0.0, 0.18], [0, 1], { clamp: true });
  const f2 = useTransform(p, [0.2, 0.38, 0.55, 0.8, 0.92], [0, 1, 1, 0, 1], { clamp: true });
  const f3 = useTransform(p, [0.55, 0.78], [0, 1], { clamp: true });
  const f4 = useTransform(p, [0.9, 1], [0, 1], { clamp: true });
  const badInvalid = useTransform(p, [0.38, 0.44, 0.78, 0.84], [0, 1, 1, 0], { clamp: true });
  const okScale = useTransform(p, [0.9, 0.98], [0.6, 1], { clamp: true });
  const okOpacity = useTransform(p, [0.9, 0.97], [0, 1], { clamp: true });
  const barScaleX = p;

  const nodeState = NODE[phase] || {};
  const [rLabel, rBody] = READOUT[phase] || READOUT[0];

  return (
    <div className="scene-wrap wrap">
      <div className="scene-copy">
        <p className="scene-eyebrow">InterviewPilot · Structured output</p>
        <h3 className="scene-h" id="scene-repair-h">
          A language model will break your schema. Plan the second attempt.
        </h3>
        <p className="scene-body">
          The model returns something invalid, the validator catches it, and the failure — with its
          error attached — goes back as the next prompt. <strong>The system recovers instead of throwing.</strong>
        </p>
        <div className="slab scene-slab">
          <span className="c"># enforced on every response</span>
          <br />
          {'{ '}
          <span className="k">&quot;clarity&quot;</span>: <span className="s">0..5</span>,{' '}
          <span className="k">&quot;follow_up&quot;</span>: <span className="s">str | null</span> {'}'}
          <br />
          <span className="c">// invalid → repair → revalidate</span>
        </div>
        <div className={`scene-readout ${phase === 2 || phase === 3 ? 'bad' : ''} ${phase >= 4 ? 'good' : ''}`}>
          <span className="attempt">{rLabel}</span>
          {rBody}
        </div>
      </div>

      <div className="scene-stage">
        <svg
          className="scene-svg"
          viewBox="0 0 900 210"
          role="img"
          aria-describedby="scene-repair-desc"
        >
          <defs>
            <marker id="rlah" markerWidth="7" markerHeight="7" refX="6" refY="3.2" orient="auto">
              <path d="M0 0 L6.4 3.2 L0 6.4 z" fill="rgba(237,234,227,.28)" />
            </marker>
          </defs>

          {/* static rails */}
          <path className="wire" markerEnd="url(#rlah)" d="M148 78 H230" />
          <path className="wire" markerEnd="url(#rlah)" d="M404 78 H486" />
          <path className="wire" markerEnd="url(#rlah)" d="M660 78 H742" />
          <path className="wire" d="M576 108 V172 H320 V114" />

          {/* scrubbed flows */}
          <motion.path className="flow" d="M148 78 H236" style={{ pathLength: f1 }} pathLength={1} />
          <motion.path className="flow" d="M404 78 H492" style={{ pathLength: f2 }} pathLength={1} />
          <motion.path className="flow rep" d="M576 108 V172 H320 V114" style={{ pathLength: f3 }} pathLength={1} />
          <motion.path className="flow ok" d="M660 78 H748" style={{ pathLength: f4 }} pathLength={1} />

          <text className="wire-lbl" x="404" y="196" textAnchor="middle">
            repair prompt + validation error
          </text>

          <g className={`node ${nodeState.n1 === 'act' ? 'act' : nodeState.n1 ? 'good' : ''}`}>
            <rect x="10" y="52" width="138" height="52" rx="6" />
            <text x="79" y="82" textAnchor="middle">Prompt</text>
          </g>
          <g className={`node ${nodeState.n2 === 'act' ? 'act' : nodeState.n2 === 'done' ? 'good' : ''}`}>
            <rect x="236" y="52" width="168" height="52" rx="6" />
            <text x="320" y="82" textAnchor="middle">Llama 3.3 70B</text>
          </g>
          <g className={`node ${nodeState.n3 === 'bad' ? 'bad' : nodeState.n3 === 'good' ? 'good' : ''}`}>
            <rect x="492" y="52" width="168" height="52" rx="6" />
            <text x="576" y="82" textAnchor="middle">Schema check</text>
          </g>
          <motion.g
            className={`node ${nodeState.n4 ? 'good' : ''}`}
            style={{ scale: okScale, opacity: okOpacity, transformOrigin: '819px 78px' }}
          >
            <rect x="748" y="52" width="142" height="52" rx="6" />
            <text x="819" y="82" textAnchor="middle">Valid result</text>
          </motion.g>

          <motion.text
            className="scene-badge bad"
            x="576"
            y="42"
            textAnchor="middle"
            style={{ opacity: badInvalid }}
          >
            ✕ invalid
          </motion.text>
        </svg>

        <div className="scene-progress" aria-hidden="true">
          <motion.span style={{ scaleX: barScaleX }} />
        </div>
      </div>

      <p id="scene-repair-desc" className="sr-only">
        A flow diagram: a prompt goes to Llama 3.3 70B, whose output hits a schema check. The first
        attempt fails validation, so the invalid response plus its errors are sent back as a repair
        prompt. The second attempt passes and a valid result is returned.
      </p>
    </div>
  );
}
