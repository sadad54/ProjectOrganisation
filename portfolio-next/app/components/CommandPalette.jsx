'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const EASE = [0.2, 0, 0, 1];
let toastTimer;

function jump(id, reduceMotion) {
  const el = document.getElementById(id);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -72 });
  else el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.removeAttribute('aria-hidden');
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.classList.remove('on');
    t.setAttribute('aria-hidden', 'true');
    t.textContent = '';
  }, 1900);
}

function copy(txt, msg) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(txt).then(() => showToast(msg)).catch(() => showToast(txt));
  } else {
    showToast(txt);
  }
}

// §5.3 — a real "Toggle reduced motion" affordance. It layers a manual override
// on top of the OS `prefers-reduced-motion` setting: `html.rm` in globals.css
// mirrors the reduced-motion media block, so CSS animation, transitions and
// scroll-driven reveals all stop for users whose OS flag isn't set.
function readRM() {
  try {
    return localStorage.getItem('rm') === '1';
  } catch {
    return false;
  }
}
function applyRM(on) {
  document.documentElement.classList.toggle('rm', on);
  try {
    localStorage.setItem('rm', on ? '1' : '0');
  } catch {
    /* ignore */
  }
}

const PROJECTS = [
  ['p-proofhire', 'ProofHire'],
  ['p-driftline', 'Driftline'],
  ['p-interviewpilot', 'InterviewPilot'],
  ['p-wc26', 'WC26 Predictor'],
  ['p-mindhive', 'Mindhive Chatbot'],
  ['p-finscout', 'FinScout'],
  ['p-fraud', 'Financial Fraud Detection'],
  ['p-expensense', 'ExpenSense'],
  ['p-aura', 'Aura'],
  ['p-fitsync', 'FitSync'],
];

export default function CommandPalette() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sel, setSel] = useState(0);
  const [rmOn, setRmOn] = useState(false);
  const [hint, setHint] = useState(false);
  const inputRef = useRef(null);
  const boxRef = useRef(null);
  const triggerRef = useRef(null);

  const ACTIONS = [
    { n: 'Selected work', h: 'Section', go: () => jump('work', reduceMotion) },
    { n: 'How I build', h: 'Section', go: () => jump('loop', reduceMotion) },
    { n: 'About me', h: 'Section', go: () => jump('about', reduceMotion) },
    { n: 'Toolkit', h: 'Section', go: () => jump('toolkit', reduceMotion) },
    { n: 'Contact', h: 'Section', go: () => jump('contact', reduceMotion) },
    ...PROJECTS.map(([id, name]) => ({
      n: `Jump to ${name}`,
      h: 'Project',
      go: () => jump(id, reduceMotion),
    })),
    { n: 'Copy email address', h: 'Copy', go: () => copy('adnanmashrursadad@gmail.com', 'Email copied') },
    { n: 'Open GitHub', h: 'External', go: () => window.open('https://github.com/sadad54', '_blank', 'noopener') },
    {
      n: 'Open LinkedIn',
      h: 'External',
      go: () => window.open('https://www.linkedin.com/in/adnan-mashrur-sadad-87a45b237', '_blank', 'noopener'),
    },
    {
      n: 'Download résumé — AI / ML',
      h: 'File',
      go: () => window.open('/Adnan_Sadad_AI_ML_Resume_LaTeX.pdf', '_blank', 'noopener'),
    },
    {
      n: 'Download résumé — Full-Stack',
      h: 'File',
      go: () => window.open('/Adnan_Sadad_SWE_Resume_LaTeX.pdf', '_blank', 'noopener'),
    },
    { n: 'The repair-loop scene', h: 'Approach', go: () => jump('slide-repair', reduceMotion) },
    {
      n: rmOn ? 'Turn motion back on' : 'Toggle reduced motion',
      h: 'Accessibility',
      go: () => {
        const next = !readRM();
        applyRM(next);
        setRmOn(next);
        showToast(next ? 'Reduced motion on' : 'Motion restored');
      },
    },
  ];

  const filtered = ACTIONS.filter((a) => (a.n + ' ' + a.h).toLowerCase().includes(query.toLowerCase().trim()));

  const show = useCallback(() => {
    triggerRef.current = document.activeElement;
    setQuery('');
    setSel(0);
    setOpen(true);
  }, []);
  const hide = useCallback(() => setOpen(false), []);

  function fire(i) {
    const a = filtered[i];
    if (!a) return;
    hide();
    setTimeout(a.go, 60);
  }

  // one-time ⌘K coach hint (§5.3)
  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem('kbdHintSeen') === '1';
    } catch {
      /* ignore */
    }
    setRmOn(readRM());
    applyRM(readRM());
    if (seen) return;
    const show = setTimeout(() => setHint(true), 2600);
    // count it as "shown" and retire it after a while even if untouched
    const retire = setTimeout(() => {
      setHint(false);
      try {
        localStorage.setItem('kbdHintSeen', '1');
      } catch {
        /* ignore */
      }
    }, 14000);
    return () => {
      clearTimeout(show);
      clearTimeout(retire);
    };
  }, []);

  function dismissHint() {
    setHint(false);
    try {
      localStorage.setItem('kbdHintSeen', '1');
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    if (open) {
      dismissHint();
      document.body.classList.add('is-locked');
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => {
        clearTimeout(t);
        document.body.classList.remove('is-locked');
        // §5.3 — return focus to the trigger on close
        if (triggerRef.current && triggerRef.current.focus) triggerRef.current.focus();
      };
    }
  }, [open]);

  useEffect(() => {
    function onKeydown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => {
          if (!o) triggerRef.current = document.activeElement;
          return !o;
        });
        return;
      }
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        hide();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSel((s) => Math.min(s + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSel((s) => Math.max(s - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        fire(sel);
      } else if (e.key === 'Tab') {
        // focus trap
        const focusables = boxRef.current?.querySelectorAll(
          'input, button, [href], [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || !focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKeydown);
    return () => document.removeEventListener('keydown', onKeydown);
  });

  useEffect(() => {
    const btn = document.getElementById('cmdk-open');
    if (!btn) return;
    const handler = () => show();
    btn.addEventListener('click', handler);
    return () => btn.removeEventListener('click', handler);
  }, [show]);

  return (
    <>
      <AnimatePresence>
        {hint && (
          <motion.button
            type="button"
            className="kbd-hint"
            onClick={dismissHint}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: EASE }}
          >
            Press <b>{typeof navigator !== 'undefined' && /Win|Linux/i.test(navigator.platform) ? 'Ctrl' : '⌘'} K</b> for
            quick navigation
            <span className="kbd-hint-x" aria-hidden="true">
              ×
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="cmdk open"
            id="cmdk"
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
          >
            <div className="cmdk-bg" onClick={hide} />
            <motion.div
              ref={boxRef}
              className="cmdk-box"
              initial={{ opacity: 0, y: reduceMotion ? 0 : -8, scale: reduceMotion ? 1 : 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -8, scale: reduceMotion ? 1 : 0.98 }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: EASE }}
            >
              <input
                ref={inputRef}
                id="cmdkInput"
                type="text"
                placeholder="Jump to a section or project, copy an address…"
                autoComplete="off"
                spellCheck="false"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSel(0);
                }}
              />
              <motion.ul
                key={query}
                className="cmdk-list"
                id="cmdkList"
                initial={{ opacity: reduceMotion ? 1 : 0.4 }}
                animate={{ opacity: 1 }}
                transition={{ duration: reduceMotion ? 0 : 0.08 }}
              >
                {filtered.length ? (
                  filtered.map((a, i) => (
                    <li key={a.n} className={i === sel ? 'sel' : undefined}>
                      <button onClick={() => fire(i)}>
                        <span className="nm">{a.n}</span>
                        <span className="hint">{a.h}</span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li>
                    <button>
                      <span className="nm" style={{ color: 'var(--dimmer)' }}>
                        Nothing matches that
                      </span>
                    </button>
                  </li>
                )}
              </motion.ul>
              <div className="cmdk-foot">
                <span>&uarr;&darr; Navigate</span>
                <span>&crarr; Select</span>
                <span>Esc Close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
