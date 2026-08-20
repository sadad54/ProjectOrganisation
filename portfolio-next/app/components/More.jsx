'use client';

import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.2, 0, 0, 1];
const viewport = { once: true, amount: 0.15, margin: '0px 0px -8% 0px' };

const rise = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const BUILDS = [
  {
    name: 'AI-Eye',
    desc: 'Computer vision for accessibility: real-time text recognition and speech output at 92% OCR accuracy with sub-second inference.',
    stack: 'Python / TensorFlow / CNN / TTS',
  },
  {
    name: 'HalalXperience',
    desc: 'Barcode-based halal verification for shoppers, built on on-device ML Kit scanning.',
    stack: 'Flutter / Firebase / ML Kit',
  },
  {
    name: 'Clinic Management System',
    desc: 'Role-based clinic records system with optimised SQL queries behind a servlet and Spring stack.',
    stack: 'Java / Spring / MySQL',
  },
  {
    name: 'DevPath AI',
    desc: 'Adaptive skill assessment that generates a personalised learning path for junior developers, from knowledge representation through to state-space search.',
    stack: 'Knowledge systems / Search',
  },
];

export default function More() {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? 'show' : 'hidden';

  return (
    <section className="band" id="more" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <motion.h2 className="title" initial={initial} whileInView="show" viewport={viewport} variants={rise}>
          Smaller things, same habits.
        </motion.h2>
        <motion.div className="more" initial={initial} whileInView="show" viewport={viewport} variants={listContainer}>
          {BUILDS.map((b) => (
            <motion.article key={b.name} variants={rise}>
              <h5>{b.name}</h5>
              <p>{b.desc}</p>
              <span className="st">{b.stack}</span>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
