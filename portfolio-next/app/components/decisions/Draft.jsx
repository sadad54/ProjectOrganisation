'use client';

import { useEffect, useState } from 'react';
import { motion, useTransform, useMotionValueEvent } from 'framer-motion';

const READOUTS = [
  ['01 / Draft', 'The model writes question drafts. They enter as pending_review, invisible to the child.'],
  ['02 / Filter', 'Malformed JSON fails at parse time; deterministic rules reject unsafe, broken or duplicate drafts.'],
  ['03 / Approve', 'A parent approves or discards each survivor. Approval is the only path into the bank.'],
  ['04 / Score', 'Scoring, rewards and rules run in server code. The model has no path in.'],
];
const phaseOf = (v) => v < 0.25 ? 0 : v < 0.5 ? 1 : v < 0.75 ? 2 : 3;

export default function Learn2UnlockScene({ p }) {
  return <DraftStory p={p} />;
}

function DraftStory({ p }) {
  const [phase, setPhase] = useState(() => phaseOf(p.get()));
  useEffect(() => { setPhase(phaseOf(p.get())); }, [p]);
  useMotionValueEvent(p, 'change', (v) => setPhase(phaseOf(v)));
  const draft = useTransform(p, [0.02, 0.25], [0, 1]);
  const filter = useTransform(p, [0.25, 0.5], [0, 1]);
  const approve = useTransform(p, [0.5, 0.75], [0, 1]);

  return (
    <div className="scene-wrap">
      <div className="scene-copy">
        <p className="scene-eyebrow">Learn2Unlock · Let the model draft, never decide</p>
        <h3 className="scene-h" id="scene-learn2unlock-h">The model writes the questions. It never marks them.</h3>
        <p className="scene-body">An LLM drafts curriculum questions so parents don’t have to. Each draft is schema-checked,
          run through deterministic rules and approved by a parent before a child sees it.
          <strong> Scores, rewards and rules are server code the model can’t reach.</strong></p>
        <div className={`scene-readout ${phase === 1 ? 'bad' : phase === 3 ? 'good' : ''}`}>
          <span className="attempt">{READOUTS[phase][0]}</span>
          {READOUTS[phase][1]}
        </div>
        <p className="scene-note">Illustrative workflow · scroll to follow a draft</p>
      </div>
      <div className="scene-stage">
        <svg className="scene-svg" viewBox="0 0 560 400" role="img" aria-labelledby="l2u-svg-title l2u-svg-desc">
          <title id="l2u-svg-title">From an LLM draft to the question bank</title>
          <desc id="l2u-svg-desc">An LLM draft passes a schema check, a deterministic filter and parent approval before it enters the question bank. Drafts rejected at each step drop out. Scoring, rewards and rules sit in a separate server-side box with no arrow from the model.</desc>
          <path className="wire" d="M135 64 V92 M135 136 V164 M135 208 V236 M135 280 V308 M250 114 H330 M250 186 H330 M250 258 H310 V206 H330" />
          <motion.path className="flow" d="M135 64 V92" style={{ pathLength: draft }} />
          <motion.path className="flow" d="M135 136 V164 M135 208 V236" style={{ pathLength: filter }} />
          <motion.path className="flow rep" d="M250 114 H330 M250 186 H330" style={{ pathLength: filter }} />
          <motion.path className="flow ok" d="M135 280 V308" style={{ pathLength: approve }} />
          <motion.path className="flow rep" d="M250 258 H310 V206 H330" style={{ pathLength: approve }} />
          <text className="wire-lbl" x="145" y="82">pending_review</text>
          <g className="node act">
            <rect x="20" y="20" width="230" height="44" rx="6" /><text x="135" y="46" textAnchor="middle">LLM draft</text>
          </g>
          <g className="node act">
            <rect x="20" y="92" width="230" height="44" rx="6" /><text x="135" y="118" textAnchor="middle">Schema check</text>
          </g>
          <g className={`node ${phase >= 1 ? 'act' : ''}`}>
            <rect x="20" y="164" width="230" height="44" rx="6" /><text x="135" y="190" textAnchor="middle">Deterministic filter</text>
          </g>
          <g className={`node ${phase >= 2 ? 'act' : ''}`}>
            <rect x="20" y="236" width="230" height="44" rx="6" /><text x="135" y="262" textAnchor="middle">Parent approval</text>
          </g>
          <g className={`node ${phase >= 2 ? 'good' : ''}`}>
            <rect x="20" y="308" width="230" height="56" rx="6" />
            <text x="135" y="331" textAnchor="middle">Question bank</text>
            <text x="135" y="352" textAnchor="middle">{phase >= 2 ? '✓ Visible to the child' : 'Nothing approved yet'}</text>
          </g>
          <g className={`node ${phase >= 1 ? 'bad' : ''}`}>
            <rect x="330" y="96" width="218" height="122" rx="6" />
            <text x="439" y="150" textAnchor="middle">Rejected drafts</text>
            <text x="439" y="171" textAnchor="middle">{phase >= 1 ? '× Dropped' : 'None yet'}</text>
          </g>
          <g className={`node ${phase >= 3 ? 'good' : ''}`}>
            <rect x="330" y="282" width="218" height="82" rx="6" />
            <text x="439" y="310" textAnchor="middle">Scoring · rewards · rules</text>
            <text x="439" y="331" textAnchor="middle">Server code only</text>
            <text x="439" y="352" textAnchor="middle">{phase >= 3 ? '✓ No model arrow in' : '—'}</text>
          </g>
        </svg>
        <div className="scene-progress" aria-hidden="true"><motion.span style={{ scaleX: p }} /></div>
      </div>
    </div>
  );
}
