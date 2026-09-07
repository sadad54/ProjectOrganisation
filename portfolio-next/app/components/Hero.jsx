'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const ease = [0.22, 1, 0.36, 1];

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 48]);

  return (
    <header className="hero" id="top" ref={ref}>
      <div className="hero-inner wrap">
        <div className="hero-intro">
          <p>Adnan Mashrur Sadad <span>AI & Software Engineer</span></p>
          <p className="hero-location">Based in Kuala Lumpur</p>
        </div>
        <div className="hero-main">
          <div className="hero-content">
            <h1 className="hero-h">
              {['AI systems.', 'Built to work.'].map((line, i) => (
                <span className="hero-h-mask" key={line}>
                  <motion.span className="hero-h-line"
                    initial={false}
                    animate={reduce ? { y: 0 } : { y: ['105%', '0%'] }}
                    transition={{ duration: 0.85, delay: i * 0.1, ease }}
                  >{line}</motion.span>
                </span>
              ))}
            </h1>
            <div className="hero-sub">
              <p>I build applied AI, from language-model workflows to machine-learning pipelines. With the validation, evaluation, and software around them to make the results useful.</p>
              <div className="hero-cta">
                <a className="btn btn-solid" href="#work">Explore selected work <span aria-hidden="true">↘</span></a>
                <a className="hero-text-link" href="/resume.pdf" download>Download résumé</a>
              </div>
            </div>
          </div>
          <motion.figure className="hero-photo" style={reduce ? undefined : { y }}>
            <div className="hero-photo-frame">
              <img src="/assets/portrait-hero.webp" alt="Adnan Mashrur Sadad" width="920" height="1150" fetchPriority="high" />
            </div>
            <figcaption>Adnan Mashrur Sadad</figcaption>
          </motion.figure>
        </div>
        <div className="hero-foot">
          <a href="mailto:adnanmashrursadad@gmail.com">Available for AI engineering opportunities</a>
          <a href="#work">Selected work <span aria-hidden="true">↓</span></a>
        </div>
      </div>
    </header>
  );
}
