'use client';

import { useEffect, useRef, useState } from 'react';
import Magnetic from '../site/Magnetic';
import { whenStageReady } from '../../lib/stage';
import { reducedMotionNow } from '../../lib/motion';

/* The headline is generated, not typeset: tokens stream in the way a model
   emits them — a highlight marks each fresh token, a caret rides the end —
   then the highlights cool off and it settles into plain type. Readable at
   every frame (no scrambling), and fully present without JS. */
const LINES = [
  [{ t: 'Hi,' }, { t: 'I’m' }, { t: 'Adnan.' }],
  [{ t: 'I' }, { t: 'build' }, { t: 'LLM' }, { t: 'systems' }],
  [{ t: 'that' }, { t: 'check', em: true }, { t: 'their', em: true }, { t: 'own', em: true }, { t: 'work.', em: true }],
];

function useFps(on) {
  const [fps, setFps] = useState(null);
  useEffect(() => {
    if (!on) return;
    let raf = 0,
      n = 0,
      t0 = performance.now();
    const loop = (now) => {
      n++;
      if (now - t0 >= 1000) {
        setFps(Math.round((n * 1000) / (now - t0)));
        n = 0;
        t0 = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return fps;
}

export default function Hero() {
  const root = useRef(null);
  const [hud, setHud] = useState(false);
  const [particles, setParticles] = useState(null);
  const fps = useFps(hud);

  useEffect(() => {
    const el = root.current;
    const toks = Array.from(el.querySelectorAll('.tok'));
    const timers = [];
    if (reducedMotionNow()) {
      toks.forEach((t) => t.classList.add('on'));
      el.classList.add('go', 'done');
      return;
    }
    const stop = whenStageReady(() => {
      el.classList.add('go');
      let t = 260;
      toks.forEach((tok, i) => {
        const lineBreak = i > 0 && tok.dataset.line !== toks[i - 1].dataset.line;
        t += lineBreak ? 190 : 72 + (tok.textContent.length > 5 ? 26 : 0);
        timers.push(
          setTimeout(() => {
            toks.forEach((x) => x.classList.remove('cur'));
            tok.classList.add('on', 'cur');
          }, t)
        );
      });
      timers.push(setTimeout(() => el.classList.add('done'), t + 380));
      timers.push(
        setTimeout(() => {
          toks[toks.length - 1]?.classList.remove('cur');
        }, t + 5200)
      );
    });
    return () => {
      stop();
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!window.matchMedia('(min-width: 1100px) and (pointer: fine)').matches) return;
    const read = () => {
      if (window.__field) setParticles(window.__field.stats.particles);
    };
    read();
    window.addEventListener('field:ready', read);
    setHud(true);
    return () => window.removeEventListener('field:ready', read);
  }, []);

  let i = 0;
  return (
    <section className="hero" id="top" ref={root} data-field="0" aria-labelledby="hero-h">
      <div className="hero-in wrap">
        <p className="hero-status">
          <span className="hero-open">
            <span className="hero-dot" aria-hidden="true" />
            Open to AI engineering, data science &amp; full-stack roles
          </span>
          <span className="sep" aria-hidden="true">
            /
          </span>
          <span>Kuala Lumpur, MY</span>
        </p>

        <h1 className="hero-h" id="hero-h">
          {LINES.map((line, li) => (
            <span className="hl" key={li}>
              {line.map((w, wi) => {
                const idx = i++;
                const tok = (
                  <span className={`tok${w.em ? ' em' : ''}`} data-line={li} style={{ '--i': idx }} key={wi}>
                    {w.t}
                  </span>
                );
                return wi < line.length - 1 ? [tok, ' '] : tok;
              })}
            </span>
          ))}
        </h1>

        <div className="hero-foot">
          <p className="hero-sub">
            Software engineer working on applied AI. I care about the part after the model call:{' '}
            <b>schema validation, repair paths, eval harnesses, and a Docker image that actually runs.</b>
          </p>
          <div className="hero-cta">
            <Magnetic className="btn btn-solid" href="#work" data-cursor="Explore">
              See the work <span className="arw">→</span>
            </Magnetic>
            <Magnetic className="btn" href="#research">
              Research <span className="arw down">↓</span>
            </Magnetic>
          </div>
        </div>
      </div>

      <figure className="hero-portrait" aria-hidden="false">
        <div className="hero-portrait-in">
          <img
            src="/assets/portrait-hero-rim-light.webp"
            alt="Portrait of Adnan Mashrur Sadad, lit from one side by a warm rim light"
            width="1000"
            height="1339"
            fetchPriority="high"
          />
        </div>
        <span className="hp-bracket tl" aria-hidden="true" />
        <span className="hp-bracket tr" aria-hidden="true" />
        <span className="hp-bracket bl" aria-hidden="true" />
        <span className="hp-bracket br" aria-hidden="true" />
        <figcaption className="hp-cap">
          <span>subject</span> Adnan M. Sadad <span className="sep">·</span> KL 2026
        </figcaption>
      </figure>

      <a className="hero-scroll" href="#thesis">
        <span className="hs-line" aria-hidden="true" />
        Scroll <span className="sep">·</span> run the forward pass
      </a>

      {hud && (
        <p className="hero-hud" aria-hidden="true">
          <span>field</span> {particles ? particles.toLocaleString('en-US') : '—'} particles
          <span className="sep">·</span>
          {fps ?? '—'} fps <span className="sep">·</span> 7 layers
        </p>
      )}
    </section>
  );
}
