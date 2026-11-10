'use client';

import { useEffect, useRef } from 'react';
import Split from '../site/Split';
import { CORPUS } from '../../data/priors';
import { reducedMotionNow } from '../../lib/motion';

/* A card that tilts toward the pointer, with a soft light that follows it.
   Same eased-follow loop as Magnetic; fine pointers only, off under reduced
   motion. */
function Tilt({ children, className = '', ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(pointer: fine)').matches || reducedMotionNow()) return;
    let raf = 0,
      tx = 0,
      ty = 0,
      x = 0,
      y = 0,
      active = false;
    const loop = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      el.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 9).toFixed(2)}deg) translateZ(${active ? 8 : 0}px)`;
      if (active || Math.abs(x) > 0.002 || Math.abs(y) > 0.002) raf = requestAnimationFrame(loop);
      else {
        raf = 0;
        el.style.transform = '';
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const u = (e.clientX - r.left) / r.width,
        v = (e.clientY - r.top) / r.height;
      tx = u - 0.5;
      ty = v - 0.5;
      el.style.setProperty('--gx', `${(u * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(v * 100).toFixed(1)}%`);
      active = true;
      el.classList.add('lit');
      kick();
    };
    const onLeave = () => {
      tx = ty = 0;
      active = false;
      el.classList.remove('lit');
      kick();
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);
  return (
    <article ref={ref} className={`bw-card ${className}`} {...rest}>
      {children}
    </article>
  );
}

/* Act C — the training corpus: the books, thinkers and off-hours things that
   moved the weights. The field behind it is a turning night sky. */
export default function Corpus() {
  let n = 0;
  return (
    <div className="bw-corpus" data-field="8" data-field-dim="1">
      <div className="wrap">
        <div className="bw-sky">
          <p className="bw-sky-cap rv-fade" aria-hidden="true">
            <span>after The Starry Night, 1889</span>
            <span>particles on orbits · drawn as strokes</span>
          </p>
          <div className="bw-sky-head">
            <p className="layer rv">
              <span className="bars" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <b>D</b> Training corpus <span className="rule" aria-hidden="true" /> what moved the weights
            </p>
            <Split as="h2" className="display bw-kin" text={['None of this is on my résumé. ', { t: 'All of it is in the work.', em: true }]} />
          </div>
        </div>

        {CORPUS.map((g) => (
          <div className="bw-group" key={g.group}>
            <p className="bw-gname rv">
              {g.group} <span>{String(g.items.length).padStart(2, '0')}</span>
            </p>
            <div className="bw-cards">
              {g.items.map((it) => (
                <div className="rv bw-slot" key={it.name} style={{ '--d': (n++ % 3) * 70 }}>
                  <Tilt>
                    <p className="bw-k">
                      <span>{it.k}</span>
                    </p>
                    <h3 className="bw-name">{it.name}</h3>
                    <p className="bw-by">{it.by}</p>
                    <p className="bw-says">{it.says}</p>
                  </Tilt>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
