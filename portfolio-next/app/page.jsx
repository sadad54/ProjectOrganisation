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

export default function Page() {
  useEffect(() => {
    // dynamic import so it only ever runs client-side, after BODY_HTML is already in the DOM
    import('./siteScript');
  }, []);

  return (
    <>
      {/* Must render first: #ambientField (fixed, z-index:0) stacks by DOM order
          against the position:relative sections below it — see bodyMarkup.js */}
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: ATMOSPHERE_HTML }} />
      <Nav />
      <Hero />
      <About />
      <Work />
      <Approach />
      <Toolkit />
      <More />
      <Contact />
      <footer>
        <span>&copy; 2026 Adnan Mashrur Sadad</span>
        <span>Built from scratch. No framework, no template.</span>
        <span>Kuala Lumpur, Malaysia</span>
      </footer>
      <CommandPalette />
    </>
  );
}
