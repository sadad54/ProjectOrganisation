'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { reducedMotionNow } from '../../lib/motion';

export const COLS = 14;
export const ROWS = 8;

/* A grid of cells that fills like a causal attention mask — a diagonal
   sweep, top-left first — then drains the same way to reveal the next page.
   Shared by the route wipe and the boot sequence so both read as one system. */
export function Cells({ phase, className = '' }) {
  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      cells.push(<i key={`${r}-${c}`} style={{ '--k': c + r }} />);
    }
  }
  return (
    <div className={`cells ${className}`} data-phase={phase} aria-hidden="true">
      {cells}
    </div>
  );
}

const COVER_MS = 620;
const REVEAL_MS = 720;

/* Any <a data-pt href="/…"> gets the wipe: cover → router.push → the new
   route mounts underneath → reveal. Modified clicks (new tab etc.), external
   links and reduced motion fall straight through to normal navigation. */
export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState('idle'); // idle | cover | covered | reveal
  const [label, setLabel] = useState('');
  const pending = useRef(null);
  const lastPath = useRef(pathname);

  useEffect(() => {
    function onClick(e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[data-pt]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('http') || a.target === '_blank') return;
      const url = new URL(href, location.href);
      if (url.pathname === location.pathname) return; // same page: let anchors work
      e.preventDefault();
      if (reducedMotionNow()) {
        router.push(href);
        return;
      }
      window.__ptBusy = true;
      pending.current = url;
      setLabel(a.getAttribute('data-pt') || '');
      setPhase('cover');
      router.prefetch(url.pathname);
      setTimeout(() => {
        setPhase('covered');
        router.push(href, { scroll: false });
      }, COVER_MS);
    }
    function onEnter(e) {
      const a = e.target.closest?.('a[data-pt]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (href && href.startsWith('/')) router.prefetch(new URL(href, location.href).pathname);
    }
    document.addEventListener('click', onClick);
    document.addEventListener('pointerover', onEnter, { passive: true });
    return () => {
      document.removeEventListener('click', onClick);
      document.removeEventListener('pointerover', onEnter);
    };
  }, [router]);

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;
    const url = pending.current;
    pending.current = null;
    // Back/forward (no wipe in flight): leave scroll to the browser/router.
    if (!url || !window.__ptBusy) return;
    // land: hash target or top, instantly, while the cells still cover
    const land = () => {
      const el = url.hash ? document.getElementById(url.hash.slice(1)) : null;
      if (window.__lenis) window.__lenis.scrollTo(el || 0, { immediate: true, force: true, offset: el ? -20 : 0 });
      else if (el) el.scrollIntoView();
      else window.scrollTo(0, 0);
    };
    requestAnimationFrame(() => {
      land();
      setTimeout(() => {
        land();
        setPhase('reveal');
        setTimeout(() => {
          setPhase('idle');
          window.__ptBusy = false;
          window.dispatchEvent(new Event('pt:revealed'));
        }, REVEAL_MS);
      }, 140);
    });
  }, [pathname]);

  // safety net: never leave the page covered
  useEffect(() => {
    if (phase !== 'covered') return;
    const t = setTimeout(() => {
      setPhase('reveal');
      setTimeout(() => {
        setPhase('idle');
        window.__ptBusy = false;
        window.dispatchEvent(new Event('pt:revealed'));
      }, REVEAL_MS);
    }, 2400);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="pt" data-phase={phase}>
      <Cells phase={phase} />
      <p className="pt-label" aria-live="polite">
        {phase !== 'idle' && label ? (
          <>
            <span className="pt-k">loading</span> {label}
          </>
        ) : null}
      </p>
    </div>
  );
}
