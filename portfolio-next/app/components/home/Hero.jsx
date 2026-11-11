'use client';

import { useEffect, useRef, useState } from 'react';
import Magnetic from '../site/Magnetic';
import HeroAsk from '../ask/HeroAsk';
import { whenStageReady } from '../../lib/stage';
import { reducedMotionNow } from '../../lib/motion';
import { play } from '../../lib/sound';
import { Odometer } from '../work/Stage';
import { WORK } from '../../data/work';
import { PAPERS, AWARDS } from '../../data/profile';

// the proof strip: four counts, all read from the data files
const PROOF = [
  [WORK.length, 'projects built'],
  [WORK.filter((p) => p.tier === 'case').length, 'case studies'],
  [PAPERS.length, 'first-author papers'],
  [AWARDS.length, 'gold awards'],
];

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
  const [proof, setProof] = useState(false);
  // the counts roll in once the hero has finished arriving
  useEffect(() => {
    const el = root.current;
    if (el.classList.contains('done')) return setProof(true);
    const mo = new MutationObserver(() => {
      if (el.classList.contains('done')) {
        setProof(true);
        mo.disconnect();
      }
    });
    mo.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);
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

  // The opening: the field's particles hold the portrait, then let go into the
  // network while the photograph itself wipes in over them. Top of the page
  // only, motion allowed only, and skipped silently if anything is missing.
  useEffect(() => {
    if (reducedMotionNow() || window.scrollY > window.innerHeight * 0.4) return;
    let dead = false,
      stop = () => {},
      t = 0;
    const begin = async () => {
      const field = window.__field;
      const box = root.current?.querySelector('.hero-portrait');
      if (!field?.setFace || !box) return;
      try {
        const { sampleFace } = await import('../../lib/neural/face');
        const pts = await sampleFace('/assets/portrait-hero-rim-light.webp', field.stats.particles);
        if (dead || window.scrollY > window.innerHeight * 0.4) return;
        field.setFace(pts, box.getBoundingClientRect());
        field.faceTo(1);
        stop = whenStageReady(() => {
          t = setTimeout(() => {
            field.faceTo(0, 3000);
            play('swell');
          }, 1100);
        });
      } catch {
        /* no portrait opening: the hero is complete without it */
      }
    };
    if (window.__field) begin();
    else window.addEventListener('field:ready', begin, { once: true });
    return () => {
      dead = true;
      stop();
      clearTimeout(t);
      window.removeEventListener('field:ready', begin);
      window.__field?.faceTo?.(0);
    };
  }, []);

  // the italic run's gradient: one sweep per visual line, sliced per token
  useEffect(() => {
    const h = root.current.querySelector('.hero-h');
    const measure = () => {
      const em = Array.from(h.querySelectorAll('.tok.em'));
      if (!em.length) return;
      const lines = new Map();
      em.forEach((t) => {
        const k = Math.round(t.offsetTop);
        if (!lines.has(k)) lines.set(k, []);
        lines.get(k).push(t);
      });
      lines.forEach((run) => {
        const x0 = run[0].offsetLeft;
        const last = run[run.length - 1];
        const w = last.offsetLeft + last.offsetWidth - x0;
        run.forEach((t) => {
          t.style.setProperty('--lw', `${w}px`);
          t.style.setProperty('--lx', `${t.offsetLeft - x0}px`);
        });
      });
      h.classList.add('lit');
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(h);
    return () => ro.disconnect();
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
          <span>Kuala Lumpur, MY · open to relocation</span>
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
            <button type="button" className="lnk hero-brief" data-brief data-cursor="1 min">
              The short version
            </button>
          </div>
        </div>
        <HeroAsk />
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

      <dl className="hero-proof">
        {PROOF.map(([n, label]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{proof ? <Odometer value={String(n).padStart(2, '0')} /> : '00'}</dd>
          </div>
        ))}
      </dl>

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
