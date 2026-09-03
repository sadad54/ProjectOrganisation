'use client';

import { useState } from 'react';
import { motion, useTransform, useMotionValueEvent } from 'framer-motion';
import { PinnedScene } from './PinnedScene';

const nf0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

// deterministic "bracket noise" — fixed so SSR and client render identically
const PATHS = Array.from({ length: 34 }, (_, i) => {
  const seed = (i * 1103515245 + 12345) & 0x7fffffff;
  const r = (n) => (((seed >> (n * 3)) & 7) / 7) * 2 - 1;
  const y0 = 20 + ((seed % 120) / 120) * 120;
  return `M0 ${y0.toFixed(0)} C 120 ${(y0 + r(1) * 60).toFixed(0)}, 240 ${(y0 + r(2) * 90).toFixed(0)}, 360 ${(80 + r(3) * 70).toFixed(0)} S 600 ${(80 + r(4) * 50).toFixed(0)}, 720 80`;
});

// unlabelled final shape the distribution settles into (illustrative, not a claim)
const FINAL_BARS = [1, 0.9, 0.82, 0.79, 0.66, 0.58, 0.5, 0.44, 0.38, 0.3];
const NOISE_BARS = [0.4, 0.9, 0.35, 0.7, 0.55, 0.8, 0.3, 0.62, 0.48, 0.72];

export default function MonteCarloScene() {
  return (
    <PinnedScene id="slide-sim" className="scene-sim" labelledBy="scene-sim-h">
      {(p) => <SceneInner p={p} />}
    </PinnedScene>
  );
}

function SceneInner({ p }) {
  const count = useTransform(p, [0.02, 0.9], [0, 10000], { clamp: true });
  const countText = useTransform(count, (v) => nf0.format(Math.round(v / 25) * 25));
  const [conv, setConv] = useState(0);
  const convMv = useTransform(p, [0.1, 0.95], [0, 1], { clamp: true });
  useMotionValueEvent(convMv, 'change', (v) => setConv(v));
  const barScaleX = p;

  return (
    <div className="scene-wrap wrap">
      <div className="scene-copy">
        <p className="scene-eyebrow">WC26 Predictor · Simulation, not a point guess</p>
        <h3 className="scene-h" id="scene-sim-h">
          A single predicted score hides how uncertain the result really is.
        </h3>
        <p className="scene-body">
          Instead of one point prediction per match, the model plays out the whole tournament{' '}
          <strong>10,000 times</strong> — group stage through knockouts — and tallies outcomes into
          probabilities. Individual paths are noise; the distribution is the signal.
        </p>
        <div className="slab scene-slab">
          <span className="k">for</span> sim <span className="k">in</span> range(<span className="s">10_000</span>):
          <br />
          &nbsp;&nbsp;groups = play_group_stage(model)
          <br />
          &nbsp;&nbsp;champion = play_out(seed_knockouts(groups))
          <br />
          &nbsp;&nbsp;tally[champion] += <span className="s">1</span>
        </div>
        <p className="scene-readout">
          <span className="attempt">Simulated</span>
          <motion.span>{countText}</motion.span> tournaments
        </p>
      </div>

      <div className="scene-stage">
        <svg className="scene-svg" viewBox="0 0 720 200" role="img" aria-describedby="scene-sim-desc">
          {PATHS.map((d, i) => {
            const band = 0.05 + (i / PATHS.length) * 0.6;
            return <MCPath key={i} d={d} p={p} band={band} />;
          })}
        </svg>

        <div className="scene-bars">
          {FINAL_BARS.map((f, i) => {
            const h = NOISE_BARS[i] + (f - NOISE_BARS[i]) * conv;
            return (
              <span
                key={i}
                className="scene-bar"
                style={{ height: `${Math.max(6, h * 100)}%`, opacity: 0.35 + conv * 0.5 }}
              />
            );
          })}
        </div>
        <p className="scene-note">Per-team title probability, converging as the sim count grows.</p>

        <div className="scene-progress" aria-hidden="true">
          <motion.span style={{ scaleX: barScaleX }} />
        </div>
      </div>

      <p id="scene-sim-desc" className="sr-only">
        Scrolling drives a simulation counter from 0 to 10,000. Faint individual tournament paths
        accumulate into scatter, while a bar chart of per-team title probability starts noisy and
        settles into a stable distribution.
      </p>
    </div>
  );
}

function MCPath({ d, p, band }) {
  const opacity = useTransform(p, [band, band + 0.08, 0.95], [0, 0.16, 0.16], { clamp: true });
  const len = useTransform(p, [band, band + 0.12], [0, 1], { clamp: true });
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="var(--sodium)"
      strokeWidth="1"
      pathLength={1}
      style={{ opacity, pathLength: len }}
    />
  );
}
