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

    let t = 0;
    const mo = new MutationObserver(() => {
      clearTimeout(t);
      t = setTimeout(scan, 60);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(t);
      mo.disconnect();
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
