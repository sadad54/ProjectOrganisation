'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ReactLenis, useLenis } from 'lenis/react';
import { useReducedMotionPref, reducedMotionNow } from '../../lib/motion';

/* Lenis for scroll weight on desktop wheels.
   - syncTouch:false — native momentum on touch devices is never hijacked
   - lerp .1 (above ~.12 reads as input lag)
   - same-page anchor links route through lenis.scrollTo()
   - nested scrollers opt out with data-lenis-prevent
   - lives in the root layout, so it persists across route changes; on a new
     pathname it jumps to the top (or to the URL hash) instantly. */
function LenisBridge() {
  const lenis = useLenis();
  const pathname = usePathname();

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
      lenis.scrollTo(target, {
        offset: target.dataset.scrollOffset ? Number(target.dataset.scrollOffset) : -20,
        immediate: reducedMotionNow(),
      });
      history.replaceState(null, '', href);
    }
    document.addEventListener('click', onAnchorClick, { capture: true });
    return () => {
      document.removeEventListener('click', onAnchorClick, { capture: true });
      if (window.__lenis === lenis) delete window.__lenis;
    };
  }, [lenis]);

  useEffect(() => {
    if (!lenis) return;
    lenis.resize();
  }, [lenis, pathname]);

  return null;
}

export default function SmoothScroll({ children }) {
  const rm = useReducedMotionPref();
  // Always mounted (root mode renders children directly, so toggling options
  // re-creates the Lenis instance without remounting the page). Reduced
  // motion simply turns wheel smoothing off.
  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: !rm, syncTouch: false, wheelMultiplier: 1 }}>
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}

/** Scroll helper used by the nav, palette and transitions. */
export function scrollToEl(el, { immediate = false, offset = -20 } = {}) {
  if (!el) return;
  const now = immediate || reducedMotionNow();
  if (window.__lenis) window.__lenis.scrollTo(el, { immediate: now, offset, force: true });
  else {
    const y = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top: y, behavior: now ? 'auto' : 'smooth' });
  }
}
