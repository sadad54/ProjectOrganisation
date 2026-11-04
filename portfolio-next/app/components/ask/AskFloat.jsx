'use client';

import { useEffect, useState } from 'react';

/* Phones only (CSS): once the hero — and its ask bar — has scrolled away,
   a small "Ask" pill waits in the thumb zone. It steps aside over the
   contact form, where the page's own composer takes over. */
export default function AskFloat({ hidden }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    let atContact = false;
    let raf = 0;
    const read = () => {
      raf = 0;
      setOn(window.scrollY > window.innerHeight * 0.85 && !atContact);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    const io = new IntersectionObserver(([e]) => {
      atContact = e.isIntersecting;
      read();
    });
    const t = setTimeout(() => {
      const c = document.getElementById('contact');
      if (c) io.observe(c);
    }, 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    read();
    return () => {
      clearTimeout(t);
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      className={`ask-float${on && !hidden ? ' on' : ''}`}
      data-ask=""
      aria-label="Ask the model about Adnan's work"
      tabIndex={on && !hidden ? 0 : -1}
      aria-hidden={on && !hidden ? undefined : true}
    >
      <span className="nav-ask-dot" aria-hidden="true" />
      Ask the model
    </button>
  );
}
