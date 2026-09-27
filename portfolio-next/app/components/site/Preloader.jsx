'use client';

import { useEffect, useRef, useState } from 'react';
import { Cells } from './PageTransition';

const STEPS = ['tokenizer', 'weights', 'shaders', 'attention'];
const MIN_MS = 1100;
const MAX_MS = 2400;

function announceDone() {
  window.__bootDone = true;
  window.dispatchEvent(new Event('boot:done'));
}

/* First visit per session only (html.boot is set pre-paint in layout.js, and
   never under reduced motion). Progress is tied to real work — fonts loaded,
   the neural field compiled, the hero portrait decoded — with a floor so it
   never flickers and a ceiling so it never holds anyone hostage. Click skips. */
export default function Preloader() {
  const [phase, setPhase] = useState('boot'); // boot | reveal | gone
  const [pct, setPct] = useState(0);
  const [step, setStep] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains('boot')) {
      setPhase('gone');
      announceDone();
      return;
    }
    const t0 = performance.now();
    let last = t0;
    let target = 0.08;
    let shown = 0;
    let raf = 0;
    const flags = { fonts: false, field: false, portrait: false };
    const bump = () => {
      const n = Object.values(flags).filter(Boolean).length;
      target = 0.08 + (n / 3) * 0.92;
    };

    document.fonts?.ready.then(() => {
      flags.fonts = true;
      bump();
    });
    const onField = () => {
      flags.field = true;
      bump();
    };
    window.addEventListener('field:ready', onField);
    if (window.__fieldReady) onField();
    const img = new Image();
    img.src = '/assets/portrait-hero-rim-light.webp';
    (img.decode ? img.decode() : Promise.resolve())
      .catch(() => {})
      .then(() => {
        flags.portrait = true;
        bump();
      });

    function finish() {
      if (doneRef.current) return;
      doneRef.current = true;
      setPct(100);
      setStep(STEPS.length);
      try {
        sessionStorage.setItem('booted', '1');
      } catch {
        /* private mode */
      }
      setTimeout(() => {
        setPhase('reveal');
        root.classList.remove('boot');
        announceDone();
        setTimeout(() => setPhase('gone'), 900);
      }, 260);
    }

    function tick(now) {
      const el = now - t0;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      // never faster than MIN_MS, never slower than MAX_MS; time-based easing
      // so a slow device doesn't also get a slow boot
      const floor = Math.min(1, el / MIN_MS);
      const ceil = el > MAX_MS ? 1 : target;
      const goal = Math.min(floor, ceil);
      shown += (goal - shown) * (1 - Math.exp(-dt * 9));
      if (goal >= 1 && shown > 0.97) shown = 1;
      setPct(Math.round(shown * 100));
      setStep(Math.min(STEPS.length - 1, Math.floor(shown * STEPS.length)));
      if (shown >= 1) finish();
      else raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    const skip = () => {
      cancelAnimationFrame(raf);
      finish();
    };
    window.addEventListener('pointerdown', skip, { once: true });
    window.addEventListener('keydown', skip, { once: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('field:ready', onField);
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
    };
  }, []);

  if (phase === 'gone') return null;

  return (
    <div className="boot-ov" data-phase={phase} aria-hidden="true">
      <Cells phase={phase === 'reveal' ? 'reveal' : 'covered'} className="boot-cells" />
      <div className="boot-in">
        <div className="boot-top">
          <span>adnan.model</span>
          <span>rev 2026.09</span>
        </div>
        <div className="boot-mid">
          <span className="boot-pct">{String(pct).padStart(3, '0')}</span>
          <span className="boot-bar">
            <span style={{ transform: `scaleX(${pct / 100})` }} />
          </span>
          <ol className="boot-steps">
            {STEPS.map((s, i) => (
              <li key={s} className={i < step ? 'ok' : i === step ? 'run' : ''}>
                <span>{s}</span>
                <span className="dots" />
                <span>{i < step ? 'ready' : i === step ? 'loading' : 'queued'}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="boot-foot">
          <span>Kuala Lumpur, MY</span>
          <span>click to skip</span>
        </div>
      </div>
    </div>
  );
}
