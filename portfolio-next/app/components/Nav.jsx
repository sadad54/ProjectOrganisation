'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Keep navigation order aligned with the page.
const SECTIONS = [
  ['top', 'Intro'],
  ['work', 'Work'],
  ['loop', 'Approach'],
  ['about', 'About'],
  ['toolkit', 'Toolkit'],
  ['contact', 'Contact'],
];

const EASE = [0.2, 0, 0, 1];

export default function Nav() {
  const reduceMotion = useReducedMotion();
  const [stuck, setStuck] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [railOn, setRailOn] = useState(false);
  const [active, setActive] = useState(0);
  const [kbdLabel, setKbdLabel] = useState('⌘');
  const lastY = useRef(0);

  useEffect(() => {
    if (navigator.platform && /Win|Linux/i.test(navigator.platform)) setKbdLabel('Ctrl ');

    lastY.current = window.scrollY;
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setStuck(y > 80);
        setRailOn(y > window.innerHeight * 0.6);
        // §5.1 — hide on scroll down, reveal on scroll up, but only past y:400
        // so the header never flickers around the top of the page.
        if (y > 400 && y > lastY.current + 4) setHidden(true);
        else if (y < lastY.current - 4 || y <= 400) setHidden(false);
        lastY.current = y;
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
      // active = whichever section is crossing the viewport midline
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

  return (
    <>
      <motion.nav
        className={`nav${stuck ? ' stuck' : ''}`}
        id="nav"
        initial={reduceMotion ? false : { y: -24, opacity: 0 }}
        animate={{ y: hidden ? '-102%' : 0, opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.24, ease: EASE }}
      >
        <a className="nav-mark" href="#top">
          <b>Adnan Sadad<span className="wordmark-period">.</span></b>
        </a>
        <div className="nav-right">
          {[
            ['#work', 'Work'],
            ['#loop', 'Approach'],
            ['#contact', 'Contact'],
          ].map(([href, label]) => {
            const isActive = SECTIONS[active]?.[0] === href.slice(1);
            return (
              <motion.a
                key={href}
                className={`nav-link hide-sm${isActive ? ' on' : ''}`}
                href={href}
                aria-current={isActive ? 'true' : undefined}
                whileHover={{ color: 'var(--signal-hover)' }}
              >
                {label}
              </motion.a>
            );
          })}
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

      <nav className={`rail${railOn ? ' on' : ''}`} id="rail" aria-label="Section navigation">
        <span className="rail-progress" aria-hidden="true" />
        {SECTIONS.map(([id, label], i) => {
          const isActive = i === active;
          return (
            <a
              key={id}
              href={`#${id}`}
              aria-current={isActive ? 'true' : undefined}
              aria-label={`Go to ${label}`}
            >
              <span className="lbl">{label}</span>
              <motion.span
                className="tick"
                style={{ transformOrigin: 'right center' }}
                animate={{
                  scaleX: isActive ? 2.33 : 1,
                  backgroundColor: isActive ? 'var(--sodium)' : 'var(--dimmer)',
                }}
                transition={{ duration: reduceMotion ? 0 : 0.4, ease: EASE }}
              />
            </a>
          );
        })}
      </nav>
    </>
  );
}
