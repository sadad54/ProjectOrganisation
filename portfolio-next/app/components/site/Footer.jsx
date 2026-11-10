'use client';

import { useEffect, useState } from 'react';
import { UPDATED_BY } from '../../data/priors';
import { reducedMotionNow } from '../../lib/motion';

/* The footer's last word goes to whatever most recently moved the weights:
   a slow rotation through the corpus (app/data/priors.js). Still under
   reduced motion. */
function UpdatedBy() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reducedMotionNow()) return;
    const id = setInterval(() => setI((n) => (n + 1) % UPDATED_BY.length), 4200);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="foot-by">
      weights last updated by <b key={i}>{UPDATED_BY[i]}</b>
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="foot">
      <div className="foot-in">
        <span>© 2026 Adnan Mashrur Sadad</span>
        <span className="foot-built">
          Hand-built, no template · <b>Next.js · Three.js · hand-written GLSL</b>
        </span>
        <UpdatedBy />
        <span>Kuala Lumpur, Malaysia</span>
      </div>
    </footer>
  );
}
