'use client';

import { useEffect, useRef, useState } from 'react';
import { composeBoard, frames } from './board';
import { DenoiseStage } from './denoise';
import { reducedMotionNow } from '../../lib/motion';

const CYCLE_MS = 3600;

/* The stage's picture. Every change of project is sampled in through the
   denoise pass; projects with several screenshots resample between them
   while they're on stage. Walkthrough videos play in place on request —
   nothing autoplays with sound, and nothing loads until asked for. */
export default function Media({ project, active = true }) {
  const wrap = useRef(null);
  const cv = useRef(null);
  const stage = useRef(null);
  const req = useRef(0);
  const size = useRef({ w: 0, h: 0, u: 1 });
  const hover = useRef(false);
  const visible = useRef(false);
  const [frame, setFrameState] = useState(0);
  const frameRef = useRef(0);
  const setFrame = (n) => {
    frameRef.current = n;
    setFrameState(n);
  };
  const [step, setStep] = useState(null);
  const [playing, setPlaying] = useState(false);
  const p = project;
  const fr = frames(p);

  // one stage per mount; sized to its box in device pixels
  useEffect(() => {
    const s = new DenoiseStage(cv.current, { reduced: reducedMotionNow() });
    stage.current = s;
    const measure = () => {
      if (!wrap.current) return false;
      const r = wrap.current.getBoundingClientRect();
      const u = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(2, Math.round(r.width * u)),
        h = Math.max(2, Math.round(r.height * u));
      if (w === size.current.w && h === size.current.h) return false;
      size.current = { w, h, u };
      s.resize(w, h);
      return true;
    };
    measure();
    const ro = new ResizeObserver(() => {
      if (measure()) window.dispatchEvent(new CustomEvent('media:redraw'));
    });
    ro.observe(wrap.current);
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting), { threshold: 0.3 });
    io.observe(wrap.current);
    return () => {
      ro.disconnect();
      io.disconnect();
      s.destroy();
    };
  }, []);

  async function paint(proj, idx, mode) {
    const my = ++req.current;
    const { w, h, u } = size.current;
    if (!w) return;
    let board;
    try {
      board = await composeBoard(proj, idx, w, h, u);
    } catch {
      return;
    }
    if (my !== req.current || !stage.current) return;
    await stage.current.show(board, {
      mode,
      onStep: (k, total) => {
        if (my !== req.current) return;
        setStep(total && k < total ? [k, total] : null);
      },
    });
    if (my === req.current) setStep(null);
  }

  // new project → full denoise from the previous one
  useEffect(() => {
    setPlaying(false);
    setFrame(0);
    paint(p, 0, 'switch');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.slug]);

  // canvas resized → repaint the current frame without a transition
  useEffect(() => {
    const onRedraw = () => paint(p, frame, 'instant');
    window.addEventListener('media:redraw', onRedraw);
    return () => window.removeEventListener('media:redraw', onRedraw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.slug, frame]);

  // multi-screenshot projects resample through their frames while on stage
  useEffect(() => {
    if (!active || fr.length < 2 || reducedMotionNow()) return;
    const id = setInterval(() => {
      if (!visible.current || hover.current || document.hidden) return;
      const n = (frameRef.current + 1) % fr.length;
      setFrame(n);
      paint(p, n, 'cycle');
    }, CYCLE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.slug, active, fr.length]);

  function go(dir) {
    const n = (frameRef.current + dir + fr.length) % fr.length;
    setFrame(n);
    paint(p, n, 'cycle');
  }

  const isVideo = p.media?.type === 'video';
  const alt = isVideo ? `${p.name} walkthrough — poster frame` : p.media?.alt || `${p.name} — generated fingerprint (no screenshots on file)`;
  let label;
  if (step) label = `denoising · step ${String(step[0] + 1).padStart(2, '0')} / ${step[1]}`;
  else if (isVideo) label = playing ? 'walkthrough · playing' : 'walkthrough · poster frame';
  else if (p.media) label = `screen ${frame + 1} / ${fr.length}`;
  else label = 'procedural · seeded from the project name';

  return (
    <div
      className={`media${p.media?.frame === 'phone' ? ' phone' : ''}${step ? ' sampling' : ''}`}
      ref={wrap}
      onPointerEnter={() => (hover.current = true)}
      onPointerLeave={() => (hover.current = false)}
    >
      <canvas ref={cv} role="img" aria-label={alt} />
      {isVideo && playing && (
        <video
          className="media-video"
          src={`/assets/walkthroughs/${p.media.slug}.mp4`}
          poster={fr[0]}
          controls
          autoPlay
          playsInline
          aria-label={`${p.name} walkthrough`}
        />
      )}
      {isVideo && !playing && (
        <button type="button" className="media-play" onClick={() => setPlaying(true)} data-cursor="Play" aria-label={`Play the ${p.name} walkthrough`}>
          <span className="mp-ring" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </span>
          <span className="mp-lbl">Play walkthrough</span>
        </button>
      )}
      {!isVideo && fr.length > 1 && (
        <div className="media-nav">
          <button type="button" onClick={() => go(-1)} aria-label="Previous screenshot">
            ←
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next screenshot">
            →
          </button>
        </div>
      )}
      <p className="media-lbl" aria-hidden="true">
        <span className="dot" />
        {label}
      </p>
    </div>
  );
}
