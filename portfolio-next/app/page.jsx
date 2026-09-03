'use client';

import { useEffect } from 'react';
import { ATMOSPHERE_HTML } from './bodyMarkup';
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
import BackgroundFX from './components/BackgroundFX';

export default function Page() {
  useEffect(() => {
    // dynamic import so it only ever runs client-side, after BODY_HTML is already in the DOM
    import('./siteScript');
  }, []);

  return (
    <SmoothScroll>
      {/* Must render first: #ambientField (fixed, z-index:0) stacks by DOM order
          against the position:relative sections below it — see bodyMarkup.js */}
      <BackgroundFX />
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: ATMOSPHERE_HTML }} />
      <a className="skip-link" href="#main">Skip to content</a>
      <Nav />
      <main id="main">
        <Hero />
        <About />
        {/* §2.3 — Approach leads Work: the thesis before the evidence. */}
        <Approach />
        <Work />
        <Toolkit />
        <More />
        <Contact />
      </main>
      <footer>
        <span>&copy; 2026 Adnan Mashrur Sadad</span>
        <span>Hand-built. No template.</span>
        <span>Kuala Lumpur, Malaysia</span>
      </footer>
      <CommandPalette />
    </SmoothScroll>
  );
}
