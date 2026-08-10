'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const SECTIONS = [
  ['top', 'Intro'],
  ['about', 'About'],
  ['work', 'Work'],
  ['loop', 'Approach'],
  ['toolkit', 'Toolkit'],
  ['contact', 'Contact'],
];

const EASE = [0.2, 0, 0, 1];

export default function Nav() {
  const reduceMotion = useReducedMotion();
  const [stuck, setStuck] = useState(false);
  const [railOn, setRailOn] = useState(false);
  const [active, setActive] = useState(0);
  const [kbdLabel, setKbdLabel] = useState('⌘');

  useEffect(() => {
    if (navigator.platform && /Win|Linux/i.test(navigator.platform)) setKbdLabel('Ctrl ');

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setStuck(window.scrollY > 40);
        setRailOn(window.scrollY > window.innerHeight * 0.6);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = SECTIONS.findIndex(([id]) => id === entry.target.id);
          if (i !== -1) setActive(i);
        });
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    SECTIONS.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      io.disconnect();
    };
  }, []);

  function goTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  return (
    <>
      <motion.nav
        className={`nav${stuck ? ' stuck' : ''}`}
        id="nav"
        initial={reduceMotion ? false : { y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <a className="nav-mark" href="#top">
          <b>ADNAN M. SADAD</b> <span>AI / Data / Full Stack</span>
        </a>
        <div className="nav-right">
          <motion.a className="hide-sm" href="#work" whileHover={{ color: 'var(--signal-hover)' }}>
            Work
          </motion.a>
          <motion.a className="hide-sm" href="#loop" whileHover={{ color: 'var(--signal-hover)' }}>
            Approach
          </motion.a>
          <motion.a className="hide-sm" href="#contact" whileHover={{ color: 'var(--signal-hover)' }}>
            Contact
          </motion.a>
          <motion.button
            className="kbd"
            id="cmdk-open"
            aria-label="Open command menu"
            whileHover={{ borderColor: 'var(--signal-hover)', color: 'var(--signal-hover)' }}
            whileTap={{ scale: 0.96, borderColor: 'var(--signal-press)', color: 'var(--signal-press)' }}
            transition={{ duration: 0.15 }}
          >
            <span id="kbd-key">{kbdLabel}</span>K
          </motion.button>
        </div>
      </motion.nav>

      <div className={`rail${railOn ? ' on' : ''}`} id="rail" aria-label="Section navigation">
        {SECTIONS.map(([id, label], i) => {
          const isActive = i === active;
          return (
            <button
              key={id}
              onClick={() => goTo(id)}
              aria-current={isActive ? 'true' : 'false'}
              aria-label={`Go to ${label}`}
            >
              <span className="lbl">{label}</span>
              <motion.span
                className="tick"
                style={{ transformOrigin: 'left center' }}
                animate={{
                  scaleX: isActive ? 2 : 1,
                  backgroundColor: isActive ? 'var(--sodium)' : 'var(--dimmer)',
                }}
                transition={{ duration: reduceMotion ? 0 : 0.4, ease: EASE }}
              />
            </button>
          );
        })}
      </div>
    </>
  );
}
