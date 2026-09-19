'use client';

import { useEffect } from 'react';
import BackgroundFX from './components/BackgroundFX';
import Nav from './components/Nav';
import Hero from './components/Hero';
import About from './components/About';
import Work from './components/Work';
import Approach from './components/Approach';
import Toolkit from './components/Toolkit';
import More from './components/More';
import Contact from './components/Contact';
import CommandPalette from './components/CommandPalette';
import SmoothScroll from './components/SmoothScroll';

export default function Page() {
  useEffect(() => {
    // dynamic import so it only ever runs client-side, after BODY_HTML is already in the DOM
    import('./siteScript');
  }, []);

  return (
    <SmoothScroll>
      <BackgroundFX />
      <div className="toast" id="toast" role="status" aria-live="polite" aria-hidden="true" />
      <a className="skip-link" href="#main">Skip to content</a>
      <Nav />
      <main id="main">
        <Hero />
        <Work />
        <Approach />
        <About />
        <Toolkit />
        <More />
        <Contact />
      </main>
      <footer>
        <span>&copy; 2026 Adnan Mashrur Sadad</span>
        <span>Kuala Lumpur, Malaysia</span>
      </footer>
      <CommandPalette />
    </SmoothScroll>
  );
}
