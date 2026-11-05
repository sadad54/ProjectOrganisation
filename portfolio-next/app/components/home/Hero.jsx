'use client';

import { useEffect, useRef } from 'react';
import Magnetic from '../site/Magnetic';
import HeroAsk from '../ask/HeroAsk';
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

/* The portrait is two plates: the subject (base) and the light that falls on
   it (rim), which add back up to the photograph. The rim's strength follows
   the pointer: bring the cursor toward the light, off the subject's left
   shoulder, and the edge burns brighter; move away and it falls to a glint.
   Fine pointers only; everyone else sees the photograph as shot. */
function useRimLight(fig) {
  useEffect(() => {
    const el = fig.current;
    if (!el || !window.matchMedia('(hover: hover) and (pointer: fine)').matches || reducedMotionNow()) return;
    let target = 1,
      cur = 1,
      raf = 0;
    const tick = () => {
      cur += (target - cur) * 0.08;
      el.style.setProperty('--rim', cur.toFixed(3));
      raf = Math.abs(target - cur) > 0.004 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0) return;
      // the key light sits off the left edge, a third of the way down
      const lx = r.left + r.width * 0.05,
        ly = r.top + r.height * 0.38;
      const d = Math.hypot(e.clientX - lx, e.clientY - ly) / Math.max(window.innerWidth, 1);
      const near = Math.max(0, 1 - d / 0.8);
      // a glint at the far side of the screen, a burn right beside the light
      target = 0.22 + 1.7 * Math.pow(near, 1.5);
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [fig]);
}

export default function Hero() {
  const root = useRef(null);
  const fig = useRef(null);
  useRimLight(fig);

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

  let i = 0;
  return (
    <section className="hero" id="top" ref={root} data-field="0" aria-labelledby="hero-h">
      <div className="hero-in wrap">
        {/* on wide screens this lives in the nav; here it is for phones */}
        <p className="hero-status">
          <span className="hero-dot" aria-hidden="true" />
          Open to AI/ML &amp; full-stack roles · open to relocation
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
            Applied-AI engineer. I work on the part after the model call: <b>validation, repair loops, evals, and deploys that run.</b>
          </p>
          <Magnetic className="btn btn-solid" href="#work" data-cursor="Explore">
            See the work <span className="arw">→</span>
          </Magnetic>
        </div>
        <HeroAsk />
      </div>

      <figure className="hero-portrait" ref={fig}>
        <div className="hero-portrait-in">
          <img
            className="hp-base"
            src="/assets/portrait-hero-base.webp"
            srcSet="/assets/portrait-hero-base-640.webp 640w, /assets/portrait-hero-base.webp 1000w"
            sizes="(max-width: 760px) 50vh, (max-width: 1100px) 54vh, 66vh"
            alt="Portrait of Adnan Mashrur Sadad, lit from one side by a cool blue rim light"
            width="1000"
            height="1339"
            fetchPriority="high"
          />
          <img
            className="hp-rim"
            src="/assets/portrait-hero-rim.webp"
            srcSet="/assets/portrait-hero-rim-640.webp 640w, /assets/portrait-hero-rim.webp 1000w"
            sizes="(max-width: 760px) 50vh, (max-width: 1100px) 54vh, 66vh"
            alt=""
            aria-hidden="true"
            width="1000"
            height="1339"
          />
        </div>
        <span className="hp-bracket tl" aria-hidden="true" />
        <span className="hp-bracket tr" aria-hidden="true" />
        <span className="hp-bracket bl" aria-hidden="true" />
        <span className="hp-bracket br" aria-hidden="true" />
      </figure>
    </section>
  );
}
