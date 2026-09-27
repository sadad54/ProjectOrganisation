'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/* The page is read as a forward pass: every section is a layer. The top bar
   carries the few links people actually use; the right-edge rail shows the
   whole network — one node per layer, the active one firing. */
export const LAYERS = [
  { id: 'top', n: 'L0', name: 'Input' },
  { id: 'thesis', n: 'L1', name: 'Thesis' },
  { id: 'about', n: 'L2', name: 'Model card' },
  { id: 'decisions', n: 'L3', name: 'Attention' },
  { id: 'work', n: 'L4', name: 'Retrieval' },
  { id: 'research', n: 'L5', name: 'Evaluation' },
  { id: 'toolkit', n: 'L6', name: 'Weights' },
  { id: 'contact', n: 'Out', name: 'Output' },
];

const LINKS = [
  ['work', 'Work'],
  ['research', 'Research'],
  ['about', 'About'],
  ['contact', 'Contact'],
];

function Glyph() {
  // three neurons, two synapses — fires once on hover
  return (
    <svg className="nav-glyph" viewBox="0 0 22 22" aria-hidden="true">
      <path d="M4 16 L11 5 L18 16 M4 16 H18" />
      <circle cx="4" cy="16" r="2.2" />
      <circle cx="11" cy="5" r="2.2" />
      <circle cx="18" cy="16" r="2.2" />
    </svg>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const onHome = pathname === '/';
  const [stuck, setStuck] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState('top');
  const [kbd, setKbd] = useState('⌘');
  const [touch, setTouch] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    if (/Win|Linux/i.test(navigator.platform || '')) setKbd('Ctrl');
    setTouch(window.matchMedia('(pointer: coarse)').matches);
    lastY.current = window.scrollY;
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setStuck(y > 40);
        if (y > 420 && y > lastY.current + 6) setHidden(true);
        else if (y < lastY.current - 6 || y <= 420) setHidden(false);
        lastY.current = y;
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!onHome) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-48% 0px -48% 0px' }
    );
    const t = setTimeout(() => {
      LAYERS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      });
    }, 50);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [onHome]);

  const activeIdx = Math.max(0, LAYERS.findIndex((l) => l.id === active));

  return (
    <>
      <header className={`nav${stuck ? ' stuck' : ''}${hidden ? ' hide' : ''}`}>
        <a className="nav-mark" href={onHome ? '#top' : '/'} data-pt={onHome ? undefined : ''} aria-label="Adnan Mashrur Sadad — home">
          <Glyph />
          <span className="nav-name">Adnan M. Sadad</span>
          <span className="nav-role">AI · Data · Full stack</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map(([id, label]) => (
            <a
              key={id}
              href={onHome ? `#${id}` : `/#${id}`}
              data-pt={onHome ? undefined : ''}
              className={`nav-link${onHome && active === id ? ' on' : ''}`}
              aria-current={onHome && active === id ? 'true' : undefined}
            >
              {label}
            </a>
          ))}
          <button className="nav-kbd" id="cmdk-open" type="button" aria-label="Open command menu" data-cursor="Menu">
            {touch ? (
              <span>Menu</span>
            ) : (
              <>
                <span>{kbd}</span>
                <span>K</span>
              </>
            )}
          </button>
        </nav>
      </header>

      {onHome && (
        <nav className={`rail${stuck ? ' on' : ''}`} aria-label="Sections">
          <span className="rail-line" aria-hidden="true">
            <span className="rail-fill" style={{ transform: `scaleY(${activeIdx / (LAYERS.length - 1)})` }} />
          </span>
          {LAYERS.map((l, i) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={`rail-node${i === activeIdx ? ' on' : ''}${i < activeIdx ? ' past' : ''}`}
              aria-current={i === activeIdx ? 'true' : undefined}
              aria-label={`${l.n} ${l.name}`}
            >
              <span className="rail-lbl">
                <b>{l.n}</b> {l.name}
              </span>
              <span className="rail-dot" aria-hidden="true" />
            </a>
          ))}
        </nav>
      )}
    </>
  );
}
