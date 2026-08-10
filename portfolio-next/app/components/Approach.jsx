'use client';

import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.2, 0, 0, 1];
const viewport = { once: true, amount: 0.15, margin: '0px 0px -8% 0px' };

const rise = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

// The carousel track (drag/swipe/keyboard nav, per-slide SVG replay-loop
// animations, dots sync) stays exactly as it was: bespoke, already-working
// vanilla JS (siteScript.js section 7) driving hand-built SVG diagrams.
// Framer Motion owns the section-level reveal here; it has no reason to
// touch the diagram animation logic underneath.
const INNER_HTML = `<div class="loop-carousel">
      <div class="loop-track" id="loopTrack" tabindex="0" aria-label="Approach carousel, four slides, use arrow keys or swipe to navigate">

        <!-- SLIDE 1 / 4 — InterviewPilot: schema repair -->
        <div class="loop-slide" id="slide-repair">
          <div class="slide-tag"><span class="tag live">InterviewPilot</span><span class="tag">Structured output</span></div>
          <h3 class="slide-h">A language model will break your schema. Plan the second attempt.</h3>
          <p class="slide-p">The model returns something invalid, the validator catches it, and the failure &mdash; with its error attached &mdash; goes back as the next prompt. <strong>The system recovers instead of throwing.</strong></p>

          <div class="loop-stage rv d1">
            <svg class="loop-svg" viewBox="0 0 900 230" role="img" aria-label="Diagram: prompt to model to validator, with a repair path returning failures to the model">
              <defs>
                <marker id="ah" markerWidth="7" markerHeight="7" refX="6" refY="3.2" orient="auto">
                  <path d="M0 0 L6.4 3.2 L0 6.4 z" fill="rgba(237,234,227,.28)"/>
                </marker>
              </defs>
              <path class="wire" marker-end="url(#ah)" d="M148 78 H230"/>
              <path class="wire" marker-end="url(#ah)" d="M404 78 H486"/>
              <path class="wire" marker-end="url(#ah)" d="M660 78 H742"/>
              <path class="wire" marker-end="url(#ah)" d="M576 108 V176 H320 V114"/>

              <path class="flow" id="f1" d="M148 78 H236"/>
              <path class="flow" id="f2" d="M404 78 H492"/>
              <path class="flow rep" id="f3" d="M576 108 V176 H320 V114"/>
              <path class="flow ok" id="f4" d="M660 78 H748"/>

              <text class="wire-lbl" x="404" y="196" text-anchor="middle">repair prompt + validation error</text>

              <g class="node" id="n1"><rect x="10" y="52" width="138" height="52" rx="6"/>
                <text x="79" y="82" text-anchor="middle">Prompt</text></g>
              <g class="node" id="n2"><rect x="236" y="52" width="168" height="52" rx="6"/>
                <text x="320" y="82" text-anchor="middle">Llama 3.3 70B</text></g>
              <g class="node" id="n3"><rect x="492" y="52" width="168" height="52" rx="6"/>
                <text x="576" y="82" text-anchor="middle">Schema check</text></g>
              <g class="node" id="n4"><rect x="748" y="52" width="142" height="52" rx="6"/>
                <text x="819" y="82" text-anchor="middle">Valid result</text></g>
            </svg>

            <div class="loop-foot">
              <div class="readout" id="readout" aria-live="polite">
                <span class="attempt">Standing by</span>
                Press replay, or scroll into view, to run the loop.
              </div>
              <button class="replay mag" id="replay">Replay loop</button>
            </div>
          </div>
        </div>

        <!-- SLIDE 2 / 4 — Fraud Detection: imbalanced classification -->
        <div class="loop-slide" id="slide-imbalance">
          <div class="slide-tag"><span class="tag live">Fraud Detection</span><span class="tag">Imbalanced classification</span></div>
          <h3 class="slide-h">A 99.83%-accurate model that catches zero fraud.</h3>
          <p class="slide-p">284,807 transactions, 492 of them fraud &mdash; a 0.17% base rate. Optimising for accuracy rewards a model that never predicts fraud at all. <strong>PR-AUC is the number that tells the truth at this imbalance; accuracy just flatters you.</strong></p>

          <div class="loop-stage rv d1">
            <ul class="metrics compare">
              <div class="compare-col bad-col" id="cc-bad">
                <span class="compare-lbl">Predict &ldquo;never fraud&rdquo;</span>
                <div><span class="v" data-count="99.83" data-dec="2">0.00</span><span class="k">Accuracy %</span></div>
                <div><span class="v r" data-count="0" data-dec="0">0</span><span class="k">Recall %</span></div>
              </div>
              <div class="compare-col good-col" id="cc-good">
                <span class="compare-lbl">Ensemble + SMOTE, scored on PR-AUC</span>
                <div><span class="v" data-count="0.98" data-dec="2">0.00</span><span class="k">ROC-AUC</span></div>
                <div><span class="v" data-count="0.89" data-dec="2">0.00</span><span class="k">PR-AUC</span></div>
              </div>
            </ul>
            <p class="slab-cap">Why PR-AUC</p>
            <div class="slab">positives&nbsp;&nbsp;<span class="s">492</span> / <span class="s">284,807</span> &middot; base rate <span class="s">0.17%</span><br>
<span class="c"># Random Forest + XGBoost + Isolation Forest</span><br>
<span class="c"># SMOTE oversampling, class-weighted loss</span><br>
<span class="c"># headline metric: PR-AUC, not accuracy</span></div>

            <div class="loop-foot">
              <div class="readout" id="readout2" aria-live="polite">
                <span class="attempt">Standing by</span>
                Press replay, or scroll into view, to run the comparison.
              </div>
              <button class="replay mag" id="replay2">Replay</button>
            </div>
          </div>
        </div>

        <!-- SLIDE 3 / 4 — WC26 Predictor: simulated uncertainty -->
        <div class="loop-slide" id="slide-sim">
          <div class="slide-tag"><span class="tag live">WC26 Predictor</span><span class="tag">Simulation, not a point guess</span></div>
          <h3 class="slide-h">A single predicted score hides how uncertain the result really is.</h3>
          <p class="slide-p">Instead of one point prediction per match, the model plays out the whole tournament <strong>10,000 times</strong> &mdash; group stage through knockouts &mdash; and tallies outcomes into probabilities. Then a predicted-vs-actual audit checks the model afterward, because a forecast nobody scores isn&rsquo;t a forecast.</p>

          <div class="loop-stage rv d1">
            <svg class="loop-svg" viewBox="0 0 900 170" role="img" aria-label="Diagram: model scores a match, ten thousand simulated tournaments, tallied into title probability and a predicted versus actual audit">
              <defs>
                <marker id="ah2" markerWidth="7" markerHeight="7" refX="6" refY="3.2" orient="auto">
                  <path d="M0 0 L6.4 3.2 L0 6.4 z" fill="rgba(237,234,227,.28)"/>
                </marker>
              </defs>
              <path class="wire" marker-end="url(#ah2)" d="M158 58 H260"/>
              <path class="wire" marker-end="url(#ah2)" d="M486 58 H588"/>
              <path class="flow" id="sf1" d="M158 58 H268"/>
              <path class="flow" id="sf2" d="M486 58 H596"/>
              <text class="wire-lbl" id="simLoopLbl" x="322" y="40" text-anchor="middle">&times; 10,000 simulated tournaments</text>
              <g class="node" id="s1"><rect x="10" y="32" width="148" height="52" rx="6"/>
                <text x="84" y="62" text-anchor="middle">Match model</text></g>
              <g class="node" id="s2"><rect x="260" y="32" width="226" height="52" rx="6"/>
                <text x="373" y="62" text-anchor="middle">Group + knockout sim</text></g>
              <g class="node" id="s3"><rect x="588" y="32" width="302" height="52" rx="6"/>
                <text x="739" y="62" text-anchor="middle">Title probability + path curve</text></g>
              <path class="wire" d="M84 84 V128 H739 V84"/>
              <path class="flow rep" id="sf3" d="M84 84 V128 H739 V84"/>
              <text class="wire-lbl" x="411" y="146" text-anchor="middle">predicted-vs-actual audit, scored after each tournament</text>
            </svg>
            <p class="slab-cap">Simulation loop</p>
            <div class="slab"><span class="k">for</span> sim <span class="k">in</span> range(<span class="s">10_000</span>):<br>
&nbsp;&nbsp;groups = play_group_stage(model)<br>
&nbsp;&nbsp;bracket = seed_knockouts(groups)<br>
&nbsp;&nbsp;champion = play_out(bracket)<br>
&nbsp;&nbsp;tally[champion] += <span class="s">1</span><br>
<span class="c"># → per-team title probability, per-team path curve</span></div>

            <div class="loop-foot">
              <div class="readout" id="readout3" aria-live="polite">
                <span class="attempt">Standing by</span>
                Press replay, or scroll into view, to run the simulation.
              </div>
              <button class="replay mag" id="replay3">Replay</button>
            </div>
          </div>
        </div>

        <!-- SLIDE 4 / 4 — InterviewPilot: adaptive follow-up depth -->
        <div class="loop-slide" id="slide-adaptive">
          <div class="slide-tag"><span class="tag live">InterviewPilot</span><span class="tag">Agentic follow-up</span></div>
          <h3 class="slide-h">A fixed question list doesn&rsquo;t feel like a real interview.</h3>
          <p class="slide-p">The follow-up agent reads what you actually said and decides whether to probe deeper or move to the next question &mdash; <strong>the same call a human interviewer makes</strong>, not a scripted branch chosen in advance.</p>

          <div class="loop-stage rv d1">
            <svg class="loop-svg" viewBox="0 0 900 200" role="img" aria-label="Diagram: candidate answer goes to the follow-up agent, which decides to probe deeper or move to the next question">
              <defs>
                <marker id="ah3" markerWidth="7" markerHeight="7" refX="6" refY="3.2" orient="auto">
                  <path d="M0 0 L6.4 3.2 L0 6.4 z" fill="rgba(237,234,227,.28)"/>
                </marker>
              </defs>
              <path class="wire" marker-end="url(#ah3)" d="M178 78 H320"/>
              <path class="wire" marker-end="url(#ah3)" d="M498 66 H640"/>
              <path class="wire" marker-end="url(#ah3)" d="M498 92 Q560 130 640 154"/>
              <path class="flow" id="af1" d="M178 78 H330"/>
              <path class="flow ok" id="af2" d="M498 66 H650"/>
              <path class="flow" id="af3" d="M498 92 Q560 130 640 154"/>
              <g class="node" id="a1"><rect x="10" y="52" width="168" height="52" rx="6"/>
                <text x="94" y="82" text-anchor="middle">Candidate answer</text></g>
              <g class="node" id="a2"><rect x="320" y="52" width="178" height="52" rx="6"/>
                <text x="409" y="82" text-anchor="middle">Follow-up agent</text></g>
              <g class="node" id="a3"><rect x="640" y="40" width="216" height="52" rx="6"/>
                <text x="748" y="70" text-anchor="middle">Probe deeper</text></g>
              <g class="node" id="a4"><rect x="640" y="128" width="216" height="52" rx="6"/>
                <text x="748" y="158" text-anchor="middle">Move to next question</text></g>
            </svg>
            <p class="slab-cap">Reads, doesn&rsquo;t branch on a script</p>
            <div class="slab">answer &rarr; agent reasons over content, not just length<br>
<span class="c">// weak / vague / incomplete →</span> probe deeper<br>
<span class="c">// solid, evidenced answer  →</span> move on<br>
<span class="c">// mirrors how a human interviewer decides</span></div>

            <div class="loop-foot">
              <div class="readout" id="readout4" aria-live="polite">
                <span class="attempt">Standing by</span>
                Press replay, or scroll into view, to run the example.
              </div>
              <button class="replay mag" id="replay4">Replay</button>
            </div>
          </div>
        </div>

      </div>
    </div>`;

export default function Approach() {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? 'show' : 'hidden';

  return (
    <section className="band loop" id="loop">
      <div className="wrap">
        <motion.div
          className="loop-head"
          initial={initial}
          whileInView="show"
          viewport={viewport}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          <div>
            <motion.p className="eyebrow" variants={rise}>
              How I think about engineering trade-offs
            </motion.p>
            <motion.h2 className="title" style={{ marginBottom: 0 }} variants={rise}>
              Four projects, four decisions I&rsquo;d defend in an interview.
            </motion.h2>
          </div>
          <motion.p className="lede" variants={rise}>
            Swipe, drag, or scroll sideways &mdash; each one is a real decision from a shipped project.{' '}
            <strong>Arrow keys and the buttons below work too.</strong>
          </motion.p>
        </motion.div>

        <motion.div
          initial={initial}
          whileInView="show"
          viewport={viewport}
          variants={rise}
          dangerouslySetInnerHTML={{ __html: INNER_HTML }}
        />

        <div className="loop-nav">
          <motion.button
            className="loop-arrow"
            id="loopPrev"
            aria-label="Previous approach"
            whileHover={{ scale: 1.08, borderColor: 'var(--signal-hover)', color: 'var(--signal-hover)' }}
            whileTap={{ scale: 0.92, borderColor: 'var(--signal-press)', color: 'var(--signal-press)' }}
            transition={{ duration: 0.18 }}
          >
            &larr;
          </motion.button>
          {/* dots stay vanilla: dynamically built and kept in sync with the
              current slide by the existing loop-carousel JS (siteScript.js) */}
          <div className="loop-dots" id="loopDots"></div>
          <motion.button
            className="loop-arrow"
            id="loopNext"
            aria-label="Next approach"
            whileHover={{ scale: 1.08, borderColor: 'var(--signal-hover)', color: 'var(--signal-hover)' }}
            whileTap={{ scale: 0.92, borderColor: 'var(--signal-press)', color: 'var(--signal-press)' }}
            transition={{ duration: 0.18 }}
          >
            &rarr;
          </motion.button>
        </div>
      </div>
    </section>
  );
}
