'use client';

import { useEffect, useRef, useState } from 'react';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import Split from '../site/Split';
import { PAIRS } from '../../data/priors';
import { reducedMotionNow, useMedia } from '../../lib/motion';
import { play } from '../../lib/sound';

const PER = 60; // vh of scroll per pair (was 82)
const REWIRE = 3; // from this pair on, the brain behind the copy has become a network
const pad = (n) => String(n).padStart(2, '0');

function Label() {
  return (
    <p className="layer rv">
      <span className="bars" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <b>∇</b> Backward pass <span className="rule" aria-hidden="true" /> how the weights got this way
    </p>
  );
}

function Pair({ pair, k }) {
  return (
    <>
      <p className="bw-count">
        {pad(k + 1)} <span>/ {pad(PAIRS.length)}</span>
      </p>
      <h3 className="bw-pair">
        <em className="bw-human">{pair.human}</em>
        <span className="bw-is">
          <span className="bw-rule" aria-hidden="true" />
          <span className="bw-eq">is</span>
          <span className="bw-machine">{pair.machine}</span>
        </span>
      </h3>
      <p className="bw-line">{pair.line}</p>
      <p className="bw-src">{pair.src}</p>
    </>
  );
}

/* Act A, pinned: five ideas, each said once about a brain and once about a
   model. Behind the copy the field holds a brain for the first pairs, then
   rewires into the network from the hero. The engine plays that morph on its
   own clock; this component only says which formation it wants. */
function Pinned() {
  const ref = useRef(null);
  const fill = useRef(null);
  const room = useRef(null);
  const [fx, setFx] = useState(null);
  // tell the field where the open half of the stage is, so the brain sits in
  // it and never under the copy, whatever the screen's shape
  useEffect(() => {
    const read = () => {
      const r = room.current?.getBoundingClientRect();
      if (!r || !r.width) return;
      const half = window.innerWidth / 2;
      setFx(((r.left + r.width / 2 - half) / half).toFixed(3));
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [k, setK] = useState(0);
  const n = PAIRS.length;
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setK(Math.min(n - 1, Math.floor(v * n * 0.9999)));
    if (fill.current) fill.current.style.transform = `scaleX(${v})`;
  });
  const formation = k >= REWIRE ? 7 : 6;
  const prev = useRef(formation);
  useEffect(() => {
    window.dispatchEvent(new Event('field:sync'));
    // the rewire is an event, not a fade
    if (prev.current !== formation) {
      window.__field?.pulse?.();
      play('rise');
    }
    prev.current = formation;
  }, [formation, fx]);

  function jump(i) {
    const el = ref.current;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const y = top + ((el.offsetHeight - window.innerHeight) * (i + 0.08)) / n;
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  }

  return (
    <div className="bw-track" ref={ref} style={{ height: `${100 + PER * n}vh` }} data-field={formation} data-field-dim="1" data-field-x={fx ?? undefined}>
      <div className="bw-pin">
        <div className="wrap bw-pin-in">
          <div className="bw-copy">
            <Label />
            <Split as="h2" id="bw-h" className="h2 bw-title" text={['A brain and a model ', { t: 'learn the same way.', em: true }]} />
            <div className="bw-stage">
              {PAIRS.map((pair, i) => (
                <div key={pair.human} className={`bw-scene${i === k ? ' on' : ''}${i < k ? ' past' : ''}`} aria-hidden={i !== k}>
                  <Pair pair={pair} k={i} />
                </div>
              ))}
            </div>
          </div>
          <div className="bw-room" ref={room} aria-hidden="true" />
          <nav className="bw-steps" aria-label="Parallels">
            {PAIRS.map((pair, i) => (
              <button
                type="button"
                key={pair.human}
                className={`bw-step${i === k ? ' on' : ''}${i < k ? ' done' : ''}`}
                aria-current={i === k ? 'step' : undefined}
                onClick={() => jump(i)}
              >
                <span>{pad(i + 1)}</span>
                {pair.human}
              </button>
            ))}
            <span className="bw-state" aria-hidden="true">
              field · <b>{k >= REWIRE ? 'network' : 'brain'}</b>
            </span>
          </nav>
        </div>
        <div className="dec-progress" aria-hidden="true">
          <span ref={fill} className="fill" />
        </div>
      </div>
    </div>
  );
}

export default function Parallels() {
  const small = useMedia('(max-width: 900px), (max-height: 660px)');
  const [rm, setRm] = useState(false);
  useEffect(() => setRm(reducedMotionNow()), []);

  if (!(small || rm)) return <Pinned />;
  return (
    <div className="bw-flat band" data-field="6" data-field-dim="0.35">
      <div className="wrap">
        <Label />
        <Split as="h2" id="bw-h" className="h2 bw-title" text={['A brain and a model ', { t: 'learn the same way.', em: true }]} />
        <div className="bw-flat-list">
          {PAIRS.map((pair, i) => (
            <article key={pair.human} className="bw-flat-item rv">
              <Pair pair={pair} k={i} />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
