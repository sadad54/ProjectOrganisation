'use client';

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
} from 'framer-motion';

const EASE = [0.2, 0, 0, 1];

// Restores the pointer-attraction the CTA buttons had under the old vanilla
// `.mag` system. Same physics (dx*0.22, dy*0.3), owned by Motion.
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

/* §6.1 — the one orchestrated load sequence on the site. ~900ms total,
   staggerChildren 0.06. Everything else reveals on scroll. */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const statusV = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: EASE } },
};
const lineMaskV = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.7, ease: EASE } },
};
const paraV = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: EASE } },
};
const ctaV = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.16, ease: EASE } },
};
const portraitV = {
  hidden: { clipPath: 'inset(0 0 100% 0)', scale: 1.06 },
  show: {
    clipPath: 'inset(0 0 0% 0)',
    scale: 1,
    transition: { duration: 0.7, ease: EASE },
  },
};

export default function Hero() {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? 'show' : 'hidden';
  const heroRef = useRef(null);

  // desktop-only shallow parallax as the hero scrolls away (§6.1)
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const on = () => setDesktop(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const active = desktop && !reduceMotion;
  const pScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.08]);
  const pOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const hY = useTransform(scrollYProgress, [0, 0.4], [0, -60]);

  return (
    <header className="hero" id="top" ref={heroRef}>
      <canvas id="fluid" aria-hidden="true"></canvas>
      <canvas id="hero3d" aria-hidden="true"></canvas>
      <div className="hero-veil" aria-hidden="true"></div>
      <motion.div className="hero-inner wrap" initial={initial} animate="show" variants={container}>
        <motion.div className="hero-status" variants={statusV}>
          <span className="status-cursor" aria-hidden="true"></span>
          <span>Open to AI Engineer / Data Science / Full Stack roles</span>
          <span className="sep">/</span>
          <span>Kuala Lumpur, MY</span>
          <span className="sep">/</span>
          <span>
            <abbr title="Universiti Teknologi Malaysia">UTM</abbr> &rsquo;25
          </span>
        </motion.div>

        <div className="hero-main">
          <div className="hero-content">
            <motion.h1 className="hero-h" id="scramble" style={active ? { y: hY } : undefined}>
              <span className="hero-h-mask">
                <motion.span className="hero-h-line" variants={lineMaskV}>
                  Hi, I&rsquo;m <em>Adnan.</em>
                </motion.span>
              </span>
            </motion.h1>
            <motion.div className="hero-sub">
              <motion.p variants={paraV}>
                Software engineer working on applied AI. I care about the part after the model call:{' '}
                <b>schema validation, repair paths, eval harnesses, and a Docker image that actually runs.</b>
              </motion.p>
              <motion.div className="hero-cta" variants={ctaV}>
                <MagneticButton className="btn btn-solid" href="#work">
                  See the work <span className="arw">&rarr;</span>
                </MagneticButton>
                <MagneticButton className="btn ghost" href="mailto:adnanmashrursadad@gmail.com">
                  Email me
                </MagneticButton>
              </motion.div>
            </motion.div>
          </div>

          <motion.div className="hero-portrait-float" variants={portraitV}>
            <motion.div
              className="hero-portrait-parallax"
              style={active ? { scale: pScale, opacity: pOpacity } : undefined}
            >
              <div className="hero-portrait magnet-tilt" id="heroPortrait">
                <span className="halo" aria-hidden="true"></span>
                <span className="portrait-brackets" aria-hidden="true"></span>
                <img
                  src="assets/portrait-hero-rim-light.webp"
                  alt="Black-and-white studio portrait of Adnan Mashrur Sadad with an orange rim light"
                  width="1000"
                  height="1339"
                  loading="eager"
                />
                <span className="portrait-tag" aria-hidden="true">
                  Portrait <span className="sep">/</span> Rim Light <span className="sep">/</span> KL 2026
                </span>
                <span className="contact-shadow" aria-hidden="true"></span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </header>
  );
}
