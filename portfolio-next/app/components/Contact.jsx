'use client';

import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.2, 0, 0, 1];
const viewport = { once: true, amount: 0.2, margin: '0px 0px -8% 0px' };

const rise = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const REACH = [
  { href: 'mailto:adnanmashrursadad@gmail.com', v: 'adnanmashrursadad@gmail.com', k: 'Email', external: false },
  { href: 'https://www.linkedin.com/in/adnan-mashrur-sadad-87a45b237', v: 'LinkedIn', k: 'Profile ↗', external: true },
  { href: 'https://github.com/sadad54', v: 'GitHub', k: 'Code ↗', external: true },
  { href: 'resume.pdf', v: 'Résumé', k: 'PDF ↓', download: true },
];

export default function Contact() {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? 'show' : 'hidden';

  return (
    <section className="contact" id="contact">
      <canvas id="fluid2" aria-hidden="true"></canvas>
      <canvas id="contact3d" aria-hidden="true"></canvas>
      <div className="contact-veil" aria-hidden="true"></div>
      <div className="wrap">
        <motion.p className="eyebrow" initial={initial} whileInView="show" viewport={viewport} variants={rise}>
          Contact
        </motion.p>
        <div className="contact-grid">
          <div>
            <motion.h2 className="big" initial={initial} whileInView="show" viewport={viewport} variants={rise}>
              Building something interesting? I&rsquo;d like to hear about it.
            </motion.h2>
            <motion.p className="lede" initial={initial} whileInView="show" viewport={viewport} variants={rise}>
              This site is a running log of things I&rsquo;ve built and the decisions behind them, not a
              pitch. If something here resonates, or you&rsquo;re working on a problem you think
              I&rsquo;d enjoy digging into, say hello. Good conversations about interesting work are
              reason enough to reach out.
            </motion.p>
          </div>
          <motion.ul className="reach" initial={initial} whileInView="show" viewport={viewport} variants={listContainer}>
            {REACH.map((r) => (
              <motion.li key={r.href} variants={rise}>
                <motion.a
                  href={r.href}
                  target={r.external ? '_blank' : undefined}
                  rel={r.external ? 'noopener' : undefined}
                  download={r.download || undefined}
                  whileHover={{ x: 6, color: 'var(--signal-hover)' }}
                  whileTap={{ color: 'var(--signal-press)' }}
                  transition={{ duration: 0.2, ease: EASE }}
                >
                  <span className="v">{r.v}</span>
                  <span className="k">{r.k}</span>
                </motion.a>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
