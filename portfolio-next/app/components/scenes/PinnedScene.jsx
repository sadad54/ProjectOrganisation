'use client';

import { useEffect, useRef } from 'react';
import { useScroll, useSpring, useReducedMotion, useMotionValue, useTransform } from 'framer-motion';

/* spec §4B — one progress value per pinned scene, shared by every element in
   it so they stay in sync. Pin is `position: sticky`, never a library.

   The reduced-motion branch is applied *after* mount, not during render, so the
   server markup and the first client render agree (both start at progress 0)
   and hydration never mismatches. Once mounted, reduced-motion pins the value
   at 1 — the finished diagram, no scrubbing. */
export function useSceneProgress(ref) {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const staticMode = useMotionValue(0);
  const progress = useTransform([smooth, staticMode], ([value, isStatic]) => isStatic ? 1 : value);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px), (max-height: 650px)');
    const update = () => {
      staticMode.set(reduce || media.matches || document.documentElement.classList.contains('rm') ? 1 : 0);
    };
    update();
    media.addEventListener('change', update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => { media.removeEventListener('change', update); observer.disconnect(); };
  }, [reduce, staticMode]);

  return progress;
}

/**
 * A scroll-scrubbed scene. `children` is a render function that receives the
 * progress MotionValue. Height is fixed in CSS (.pinned-scene) so the layout
 * reserves it and CLS stays at 0.
 */
export function PinnedScene({ id, className = '', children, labelledBy }) {
  const ref = useRef(null);
  const p = useSceneProgress(ref);
  return (
    <section ref={ref} id={id} className={`pinned-scene ${className}`} aria-labelledby={labelledBy}>
      <div className="pinned-sticky">{children(p)}</div>
    </section>
  );
}
