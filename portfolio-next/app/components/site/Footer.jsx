'use client';

import { useEffect, useState } from 'react';
import { UPDATED_BY } from '../../data/priors';
import { reducedMotionNow } from '../../lib/motion';

const LINKS = [
  ['mailto:adnanmashrursadad@gmail.com', 'Email'],
  ['https://www.linkedin.com/in/adnan-mashrur-sadad-87a45b237', 'LinkedIn'],
  ['https://github.com/sadad54', 'GitHub'],
  ['/Adnan_Sadad_AI_ML_Resume_LaTeX.pdf', 'Résumé'],
];

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

/* The page signs off: the name once, large, then the colophon. */
export default function Footer() {
  return (
    <footer className="foot">
      <div className="foot-in">
        <div className="foot-top">
          <span className="foot-end">
            <b>EOS</b> <i aria-hidden="true" /> end of sequence
          </span>
          <nav className="foot-links" aria-label="Elsewhere">
            {LINKS.map(([href, label]) => (
              <a key={label} className="lnk" href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {label}
              </a>
            ))}
          </nav>
        </div>
        <p className="foot-mark" aria-hidden="true">
          <span>
            Adnan M. <em>Sadad</em>
          </span>
        </p>
        <div className="foot-base">
          <span>© 2026 Adnan Mashrur Sadad</span>
          <span className="foot-built">
            Hand-built, no template · <b>Next.js · Three.js · hand-written GLSL</b>
          </span>
          <UpdatedBy />
          <span>Kuala Lumpur, Malaysia</span>
        </div>
      </div>
    </footer>
  );
}
