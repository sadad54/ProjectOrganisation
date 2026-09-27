'use client';

import { useEffect, useRef } from 'react';
import { reducedMotionNow } from '../../lib/motion';

/* Pointer attraction for primary actions. The element leans toward the
   cursor (a fraction of the offset, eased), and its inner label leans a
   little further, so it reads as depth rather than a slide. */
export default function Magnetic({ as: Tag = 'a', strength = 0.28, className = '', children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia('(pointer: fine)').matches || reducedMotionNow()) return;
    const inner = el.querySelector('.mag-in');
    let raf = 0,
      tx = 0,
      ty = 0,
      x = 0,
      y = 0,
      active = false;
    const loop = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
      if (inner) inner.style.transform = `translate3d(${(x * 0.45).toFixed(2)}px,${(y * 0.45).toFixed(2)}px,0)`;
      if (active || Math.abs(x) > 0.05 || Math.abs(y) > 0.05) raf = requestAnimationFrame(loop);
      else raf = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * strength;
      ty = (e.clientY - (r.top + r.height / 2)) * strength * 1.2;
      active = true;
      kick();
    };
    const onLeave = () => {
      tx = ty = 0;
      active = false;
      kick();
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [strength]);

  return (
    <Tag ref={ref} className={`mag ${className}`} {...rest}>
      <span className="mag-in">{children}</span>
    </Tag>
  );
}
