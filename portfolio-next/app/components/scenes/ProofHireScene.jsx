'use client';

import { useEffect, useState } from 'react';
import { motion, useTransform, useMotionValueEvent } from 'framer-motion';
import { PinnedScene } from './PinnedScene';

const READOUTS = [
  ['01 / Extract', 'Repository artifacts become evidence with file and commit provenance.'],
  ['02 / Match', 'Hybrid retrieval and reranking connect job requirements to the evidence graph.'],
  ['03 / Verify', 'The fact guard rejects a claim that has no supporting evidence.'],
  ['04 / Export', 'The supported claim keeps its citation. The unsupported claim stays out.'],
];
const phaseOf = (v) => v < 0.25 ? 0 : v < 0.5 ? 1 : v < 0.75 ? 2 : 3;

export default function ProofHireScene() {
  return (
    <PinnedScene id="slide-proofhire" className="scene-proofhire" labelledBy="scene-proofhire-h">
      {(p) => <EvidenceStory p={p} />}
    </PinnedScene>
  );
}

function EvidenceStory({ p }) {
  const [phase, setPhase] = useState(() => phaseOf(p.get()));
  useEffect(() => { setPhase(phaseOf(p.get())); }, [p]);
  useMotionValueEvent(p, 'change', (v) => setPhase(phaseOf(v)));
  const extract = useTransform(p, [0.02, 0.25], [0, 1]);
  const match = useTransform(p, [0.25, 0.5], [0, 1]);
  const verify = useTransform(p, [0.5, 0.75], [0, 1]);
  const exportClaim = useTransform(p, [0.75, 0.95], [0, 1]);

  return (
    <div className="scene-wrap wrap">
      <div className="scene-copy">
        <p className="scene-eyebrow">ProofHire · Evidence before eloquence</p>
        <h3 className="scene-h" id="scene-proofhire-h">A convincing claim is easy. A defensible one needs a source.</h3>
        <p className="scene-body">Code becomes an evidence graph. Job requirements find their matches.
          Then a verifier checks the draft. <strong>No supporting evidence? That claim cannot leave the system.</strong></p>
        <div className={`scene-readout ${phase === 2 ? 'bad' : phase === 3 ? 'good' : ''}`}>
          <span className="attempt">{READOUTS[phase][0]}</span>
          {READOUTS[phase][1]}
        </div>
        <p className="scene-note">Illustrative workflow · scroll to trace the evidence</p>
      </div>
      <div className="scene-stage">
        <svg className="scene-svg" viewBox="0 0 560 400" role="img" aria-labelledby="proofhire-svg-title proofhire-svg-desc">
          <title id="proofhire-svg-title">From repository evidence to a verified application</title>
          <desc id="proofhire-svg-desc">Source files feed an evidence graph. A job requirement matches the graph, then a fact guard checks the claim. A cited claim can be exported; a claim without evidence is blocked.</desc>
          <path className="wire" d="M126 76 H181 M126 148 H158 Q170 148 170 124 V90 Q170 76 181 76 M285 76 H332 M410 102 V186 M360 238 Q360 290 298 290 H280 M458 238 V328 H280" />
          <motion.path className="flow" d="M126 76 H181 M126 148 H158 Q170 148 170 124 V90 Q170 76 181 76" style={{ pathLength: extract }} />
          <motion.path className="flow" d="M285 76 H332 M410 102 V186" style={{ pathLength: match }} />
          <motion.path className="flow" d="M360 238 Q360 290 298 290 H280" style={{ pathLength: verify }} />
          <motion.path className="flow ok" d="M458 238 V350 H280" style={{ pathLength: exportClaim }} />
          <g className="node act">
            <rect x="8" y="50" width="118" height="52" rx="6" /><text x="67" y="81" textAnchor="middle">Source files</text>
            <rect x="8" y="122" width="118" height="52" rx="6" /><text x="67" y="153" textAnchor="middle">Commits</text>
          </g>
          <g stroke={phase >= 1 ? 'var(--sodium)' : 'var(--line)'} fill="var(--ink)">
            <path d="M193 76 L233 40 L274 76 L248 122 L193 76 L233 40 L248 122 M193 76 H274" fill="none" />
            {[[193,76],[233,40],[274,76],[248,122]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="7" />)}
          </g>
          <text className="wire-lbl" x="233" y="156" textAnchor="middle">Evidence graph</text>
          <g className={`node ${phase >= 1 ? 'act' : ''}`}>
            <rect x="332" y="50" width="216" height="52" rx="6" /><text x="440" y="81" textAnchor="middle">Requirement match</text>
          </g>
          <g className={`node ${phase >= 2 ? 'act' : ''}`}>
            <rect x="332" y="186" width="216" height="52" rx="6" /><text x="440" y="217" textAnchor="middle">Fact guard</text>
          </g>
          <g className={`node ${phase >= 2 ? 'bad' : ''}`}>
            <rect x="8" y="262" width="272" height="56" rx="6" />
            <text x="144" y="285" textAnchor="middle">Claim without evidence</text>
            <text x="144" y="306" textAnchor="middle">{phase >= 2 ? '× BLOCKED' : 'Awaiting verification'}</text>
          </g>
          <g className={`node ${phase >= 3 ? 'good' : ''}`}>
            <rect x="8" y="328" width="272" height="56" rx="6" />
            <text x="144" y="351" textAnchor="middle">Claim + source citation</text>
            <text x="144" y="372" textAnchor="middle">{phase >= 3 ? '✓ EXPORT READY' : 'Awaiting verification'}</text>
          </g>
        </svg>
        <div className="scene-progress" aria-hidden="true"><motion.span style={{ scaleX: p }} /></div>
      </div>
    </div>
  );
}
