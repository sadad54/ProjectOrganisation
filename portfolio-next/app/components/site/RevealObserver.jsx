'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SELECTOR = '.rv,.rv-fade,.split,.rv-line,[data-reveal]';

/* One IntersectionObserver for the whole site. Anything carrying a reveal
   class gets a `data-in` attribute the first time it crosses into view — an
   attribute, not a class, because React rewrites `className` whenever a
   component's classes change and would silently strip an added `.in`. A MutationObserver
   picks up elements that mount later (route changes, the work console), so
   components never have to register themselves. */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.setAttribute('data-in', '');
          io.unobserve(e.target);
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -7% 0px' }
    );

    const seen = new WeakSet();
    const scan = () => {
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (seen.has(el) || el.hasAttribute('data-in')) return;
        seen.add(el);
        io.observe(el);
      });
    };
    scan();

    // a jump (nav link, rail, palette) lands on finished content: anything
    // revealed while the page is travelling there skips its entrance
    let jt = 0;
    const onJump = (e) => {
      if (e.type === 'click' && !e.target.closest?.('a[href*="#"]')) return;
      document.documentElement.classList.add('jumped');
      clearTimeout(jt);
      jt = setTimeout(() => document.documentElement.classList.remove('jumped'), 1600);
    };
    document.addEventListener('click', onJump, true);
    window.addEventListener('hashchange', onJump);
    window.addEventListener('reveal:jump', onJump);

    let t = 0;
    const mo = new MutationObserver(() => {
      clearTimeout(t);
      t = setTimeout(scan, 60);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(t);
      clearTimeout(jt);
      document.removeEventListener('click', onJump, true);
      window.removeEventListener('hashchange', onJump);
      window.removeEventListener('reveal:jump', onJump);
      mo.disconnect();
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
