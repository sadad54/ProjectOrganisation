'use client';

import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { useReducedMotionPref } from '../../lib/motion';
import SmoothScroll from './SmoothScroll';
import NeuralField from './NeuralField';
import Cursor from './Cursor';
import PageTransition from './PageTransition';
import Preloader from './Preloader';
import RevealObserver from './RevealObserver';
import Nav from './Nav';
import CommandPalette from './CommandPalette';

/* Everything that persists across routes lives here, in the root layout:
   one Lenis instance, one WebGL context, one cursor, one transition overlay.
   Navigating from the index to a case study never tears the field down — it
   just re-forms. */
export default function Providers({ children }) {
  const rm = useReducedMotionPref();
  useEffect(() => {
    // disarms the no-JS failsafe animations in base.css
    document.documentElement.classList.add('hydrated');
  }, []);
  return (
    <MotionConfig reducedMotion={rm ? 'always' : 'user'}>
      <SmoothScroll>
        <NeuralField />
        <div className="grain" aria-hidden="true" />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Nav />
        {children}
        <CommandPalette />
        <Cursor />
        <PageTransition />
        <Preloader />
        <RevealObserver />
        <div className="toast" id="toast" role="status" aria-live="polite" />
      </SmoothScroll>
    </MotionConfig>
  );
}
