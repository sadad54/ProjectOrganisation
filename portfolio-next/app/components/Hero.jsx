'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useMotionValue, useSpring } from 'framer-motion';

const EASE = [0.2, 0, 0, 1];

// Restores the pointer-attraction CTA buttons had under the old vanilla `.mag`
// system (removed during the Framer Motion conversion to avoid two systems
// fighting over the same transform). Same physics (dx*0.22, dy*0.3), now
// owned entirely by Motion via useMotionValue + a spring for the release.
function MagneticButton({ className, href, children, onClick }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20 });
  const springY = useSpring(y, { stiffness: 300, damping: 20 });

  function onPointerMove(e) {
    if (reduceMotion) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.22);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
  }
  function onPointerLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      ref={ref}
      className={className}
      href={href}
      onClick={onClick}
      style={reduceMotion ? undefined : { x: springX, y: springY }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2, ease: EASE }}
    >
      {children}
    </motion.a>
  );
}

const statusV = {
  hidden: { opacity: 0, y: -10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const textContainerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const fromLeftV = {
  hidden: { opacity: 0, x: -28 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
};

const fromRightV = {
  hidden: { opacity: 0, x: 36 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE, delay: 0.25 } },
};

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? 'show' : 'hidden';

  return (
    <header className="hero" id="top">
      <canvas id="fluid" aria-hidden="true"></canvas>
      <canvas id="hero3d" aria-hidden="true"></canvas>
      <div className="hero-veil" aria-hidden="true"></div>
      <div className="hero-inner wrap">
        <motion.div
          className="hero-status"
          initial={initial}
          animate="show"
          variants={statusV}
        >
          <span><i className="dot"></i></span>
          <span>Open to AI Engineer / Data Science / Full Stack roles</span>
          <span className="sep">/</span>
          <span>Kuala Lumpur, MY</span>
          <span className="sep">/</span>
          <span><abbr title="Universiti Teknologi Malaysia">UTM</abbr> &rsquo;25</span>
        </motion.div>

        <div className="hero-main">
          <motion.div
            className="hero-content"
            initial={initial}
            animate="show"
            variants={textContainerV}
          >
            <motion.h1
              className="hero-h"
              id="scramble"
              data-final="Hi, I&rsquo;m Adnan."
              variants={fromLeftV}
            >
              Hi, I&rsquo;m Adnan.
            </motion.h1>
            <motion.div className="hero-sub" variants={fromLeftV}>
              <p>
                Software engineer working on applied AI. I care about the part after the model call:{' '}
                <b>schema validation, repair paths, eval harnesses, and a Docker image that actually runs.</b>
              </p>
              <div className="hero-cta">
                <MagneticButton className="btn btn-solid" href="#work">
                  See the work <span className="arw">&rarr;</span>
                </MagneticButton>
                <MagneticButton className="btn ghost" href="mailto:adnanmashrursadad@gmail.com">
                  Email me
                </MagneticButton>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="hero-portrait-float"
            initial={initial}
            animate="show"
            variants={fromRightV}
          >
            <div className="hero-portrait magnet-tilt" id="heroPortrait">
              <span className="halo" aria-hidden="true"></span>
              <span className="portrait-brackets" aria-hidden="true"></span>
              <img
                src="assets/portrait-hero.webp"
                alt="Black-and-white studio portrait of Adnan Mashrur Sadad"
                width="920"
                height="1150"
                loading="eager"
              />
              <span className="portrait-tag" aria-hidden="true">
                Portrait <span className="sep">/</span> B&amp;W <span className="sep">/</span> KL 2026
              </span>
              <span className="contact-shadow" aria-hidden="true"></span>
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
