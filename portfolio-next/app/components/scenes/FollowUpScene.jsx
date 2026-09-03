'use client';

import { useState } from 'react';
import { motion, useTransform, useMotionValueEvent } from 'framer-motion';
import { PinnedScene } from './PinnedScene';

export default function FollowUpScene() {
  return (
    <PinnedScene id="slide-adaptive" className="scene-adaptive" labelledBy="scene-adaptive-h">
      {(p) => <SceneInner p={p} />}
    </PinnedScene>
  );
}

function SceneInner({ p }) {
  const [phase, setPhase] = useState(0); // 0 in, 1 reading, 2 decided
  const phaseMv = useTransform(p, (v) => (v < 0.3 ? 0 : v < 0.72 ? 1 : 2));
  useMotionValueEvent(phaseMv, 'change', (v) => setPhase(v));

  const f1 = useTransform(p, [0.05, 0.28], [0, 1], { clamp: true });
  const fProbe = useTransform(p, [0.72, 0.9], [0, 1], { clamp: true });
  const fMove = useTransform(p, [0.72, 0.9], [0, 1], { clamp: true });
  // unchosen branch settles to 15% opacity, not gone (spec §6.3)
  const moveOpacity = useTransform(p, [0.72, 0.9], [1, 0.15], { clamp: true });
  const barScaleX = p;

  return (
    <div className="scene-wrap wrap">
      <div className="scene-copy">
        <p className="scene-eyebrow">InterviewPilot · Agentic follow-up</p>
        <h3 className="scene-h" id="scene-adaptive-h">
          A fixed question list doesn’t feel like a real interview.
        </h3>
        <p className="scene-body">
          The follow-up agent reads what you actually said and decides whether to probe deeper or move to
          the next question — <strong>the same call a human interviewer makes</strong>, not a scripted
          branch chosen in advance.
        </p>
        <div className="slab scene-slab">
          answer → agent reasons over content, not length
          <br />
          <span className="c">// weak / vague / incomplete →</span> probe deeper
          <br />
          <span className="c">// solid, evidenced answer →</span> move on
        </div>
        <div className={`scene-readout ${phase === 1 ? 'bad' : ''} ${phase === 2 ? 'good' : ''}`}>
          <span className="attempt">
            {phase === 0 ? 'Candidate answers' : phase === 1 ? 'Agent reading' : 'Decided · probe deeper'}
          </span>
          {phase === 0
            ? 'A vague, surface-level answer on database sharding.'
            : phase === 1
              ? 'Reasoning over the content and specificity of the answer.'
              : 'Surface-level answer → a targeted follow-up, not a move-on. A solid answer would have gone the other way.'}
        </div>
      </div>

      <div className="scene-stage">
        <svg className="scene-svg" viewBox="0 0 900 200" role="img" aria-describedby="scene-adaptive-desc">
          <defs>
            <marker id="fuah" markerWidth="7" markerHeight="7" refX="6" refY="3.2" orient="auto">
              <path d="M0 0 L6.4 3.2 L0 6.4 z" fill="rgba(237,234,227,.28)" />
            </marker>
          </defs>

          <path className="wire" markerEnd="url(#fuah)" d="M178 78 H320" />
          <path className="wire" d="M498 66 H640" />
          <path className="wire" d="M498 92 Q560 130 640 154" />

          <motion.path className="flow" d="M178 78 H330" style={{ pathLength: f1 }} pathLength={1} />
          <motion.path className="flow ok" d="M498 66 H650" style={{ pathLength: fProbe }} pathLength={1} />
          <motion.path
            className="flow"
            d="M498 92 Q560 130 640 154"
            style={{ pathLength: fMove, opacity: moveOpacity }}
            pathLength={1}
          />

          <g className={`node ${phase === 0 ? 'act' : 'good'}`}>
            <rect x="10" y="52" width="168" height="52" rx="6" />
            <text x="94" y="82" textAnchor="middle">Candidate answer</text>
          </g>
          <g className={`node ${phase === 1 ? 'act pulsing' : phase === 2 ? 'good' : ''}`}>
            <rect x="320" y="52" width="178" height="52" rx="6" />
            <text x="409" y="82" textAnchor="middle">Follow-up agent</text>
          </g>
          <g className={`node ${phase === 2 ? 'good' : ''}`}>
            <rect x="640" y="40" width="216" height="52" rx="6" />
            <text x="748" y="70" textAnchor="middle">Probe deeper</text>
          </g>
          <motion.g className="node" style={{ opacity: moveOpacity }}>
            <rect x="640" y="128" width="216" height="52" rx="6" />
            <text x="748" y="158" textAnchor="middle">Move to next question</text>
          </motion.g>
        </svg>

        <div className="scene-progress" aria-hidden="true">
          <motion.span style={{ scaleX: barScaleX }} />
        </div>
      </div>

      <p id="scene-adaptive-desc" className="sr-only">
        A candidate answer flows into a follow-up agent, which pauses to read it, then commits to one of
        two branches — &ldquo;probe deeper&rdquo; or &ldquo;move to the next question&rdquo;. Here the
        answer was weak, so the agent probes deeper; the move-on branch fades but stays visible, because
        both were live until the content decided.
      </p>
    </div>
  );
}
