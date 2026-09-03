'use client';

import { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { useReducedMotion } from 'framer-motion';

/* spec §4C — Lenis for the cinematic scroll weight.
   - syncTouch:false: never hijack native momentum on mobile
   - lerp 0.1 (spec cap 0.12 — higher reads as input lag)
   - anchor links route through lenis.scrollTo(); siteScript's native
     smooth-anchor handler is guarded off while `.lenis` is on <html>
   - keyboard Space / PageDown / Home / End keep working (Lenis smooths the
     wheel only; window keydown scrolling is untouched) */
function LenisBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    window.__lenis = lenis;

    function onAnchorClick(e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = e.target.closest?.('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -72 });
      history.replaceState(null, '', href);
    }
    document.addEventListener('click', onAnchorClick, { capture: true });

    return () => {
      document.removeEventListener('click', onAnchorClick, { capture: true });
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, [lenis]);

  return null;
}

export default function SmoothScroll({ children }) {
  const reduce = useReducedMotion();

  if (reduce) return children;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        duration: 1.2,
        smoothWheel: true,
        syncTouch: false,
      }}
    >
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}
