'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.2, 0, 0, 1];
const viewport = { once: true, amount: 0.2, margin: '0px 0px -8% 0px' };

const rise = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const EMAIL = 'adnanmashrursadad@gmail.com';

const REACH = [
  { href: `mailto:${EMAIL}`, v: EMAIL, k: 'Email', kind: 'email' },
  { href: 'https://www.linkedin.com/in/adnan-mashrur-sadad-87a45b237', v: 'LinkedIn', k: 'Profile ↗', kind: 'external' },
  { href: 'https://github.com/sadad54', v: 'GitHub', k: 'Code ↗', kind: 'external' },
  {
    href: '/Adnan_Sadad_AI_ML_Resume_LaTeX.pdf',
    downloadAs: 'Adnan-Sadad-Resume-AI-ML.pdf',
    v: 'Résumé — AI / ML',
    k: 'PDF ↓',
    kind: 'download',
  },
  {
    href: '/Adnan_Sadad_SWE_Resume_LaTeX.pdf',
    downloadAs: 'Adnan-Sadad-Resume-Full-Stack.pdf',
    v: 'Résumé — Full-Stack',
    k: 'PDF ↓',
    kind: 'download',
  },
];

// §6.6 — local time indicator. Answers "is there a real person in a real
// timezone" without a word of copy.
function useKualaLumpurTime() {
  const [t, setT] = useState('');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kuala_Lumpur',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const paint = () => setT(fmt.format(new Date()).toLowerCase());
    paint();
    const id = setInterval(paint, 60_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export default function Contact() {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? 'show' : 'hidden';
  const localTime = useKualaLumpurTime();
  const [copied, setCopied] = useState(false);

  function copyEmail(e) {
    if (!navigator.clipboard) return; // let the mailto: href do its job
    e.preventDefault();
    navigator.clipboard.writeText(EMAIL).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      },
      () => {
        window.location.href = `mailto:${EMAIL}`;
      }
    );
  }

  return (
    <section className="contact" id="contact" aria-label="Contact">
      <div className="wrap">
        <motion.p className="eyebrow" initial={initial} whileInView="show" viewport={viewport} variants={rise}>
          Contact
        </motion.p>
        <div className="contact-grid">
          <div>
            <motion.h2 className="big" initial={initial} whileInView="show" viewport={viewport} variants={rise}>
              Let&rsquo;s build something useful.
            </motion.h2>
            <motion.p className="lede" initial={initial} whileInView="show" viewport={viewport} variants={rise}>
              I&rsquo;m open to AI engineering and software roles. If my work fits a problem your team is solving, I&rsquo;d like to talk.
            </motion.p>
            <motion.p
              className="contact-time"
              initial={initial}
              whileInView="show"
              viewport={viewport}
              variants={rise}
            >
              Kuala Lumpur <span className="sep">·</span>{' '}
              <time suppressHydrationWarning>{localTime || '—'}</time> local
            </motion.p>
          </div>
          <motion.ul className="reach" initial={initial} whileInView="show" viewport={viewport} variants={listContainer}>
            {REACH.map((r) => (
              <motion.li key={r.href} variants={rise}>
                <motion.a
                  href={r.href}
                  target={r.kind === 'external' ? '_blank' : undefined}
                  rel={r.kind === 'external' ? 'noopener' : undefined}
                  download={r.kind === 'download' ? r.downloadAs || true : undefined}
                  onClick={r.kind === 'email' ? copyEmail : undefined}
                  aria-label={r.kind === 'email' ? 'Copy email address' : undefined}
                  whileHover={{ x: 6, color: 'var(--signal-hover)' }}
                  whileTap={{ color: 'var(--signal-press)' }}
                  transition={{ duration: 0.2, ease: EASE }}
                >
                  <span className="v">{r.kind === 'email' && copied ? 'Copied to clipboard ✓' : r.v}</span>
                  <span className="k">{r.k}</span>
                </motion.a>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {copied ? 'Email address copied to clipboard' : ''}
      </p>
    </section>
  );
}
