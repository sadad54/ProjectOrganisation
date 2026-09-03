'use client';

import { motion, useReducedMotion } from 'framer-motion';
import RepairLoopScene from './scenes/RepairLoopScene';
import DriftlineScene from './scenes/DriftlineScene';
import MonteCarloScene from './scenes/MonteCarloScene';
import FollowUpScene from './scenes/FollowUpScene';

const EASE = [0.2, 0, 0, 1];
const viewport = { once: true, amount: 0.15, margin: '0px 0px -8% 0px' };

const rise = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/* §6.3 — the carousel is gone. Each decision is a pinned scene whose diagram
   draws itself as the reader scrolls, and un-draws on the way back. The motion
   is the explanation, not an illustration of it. */
export default function Approach() {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? 'show' : 'hidden';

  return (
    <section className="band loop" id="loop" aria-label="Approach">
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
              Four decisions I&rsquo;d defend in an interview.
            </motion.h2>
          </div>
          <motion.p className="lede" variants={rise}>
            Each one is a real decision from a shipped project.{' '}
            <strong>Scroll through — the diagram draws itself.</strong>
          </motion.p>
        </motion.div>
      </div>

      <RepairLoopScene />
      <DriftlineScene />
      <MonteCarloScene />
      <FollowUpScene />
    </section>
  );
}
