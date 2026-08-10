'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const EASE = [0.2, 0, 0, 1];
let toastTimer;

function jump(id, reduceMotion) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 1900);
}

function copy(txt, msg) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(txt).then(() => showToast(msg)).catch(() => showToast(txt));
  } else {
    showToast(txt);
  }
}

export default function CommandPalette() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);

  const ACTIONS = [
    { n: 'Selected work', h: 'Section', go: () => jump('work', reduceMotion) },
    { n: 'How I build', h: 'Section', go: () => jump('loop', reduceMotion) },
    { n: 'About me', h: 'Section', go: () => jump('about', reduceMotion) },
    { n: 'Toolkit', h: 'Section', go: () => jump('toolkit', reduceMotion) },
    { n: 'Contact', h: 'Section', go: () => jump('contact', reduceMotion) },
    { n: 'Copy email address', h: 'Copy', go: () => copy('adnanmashrursadad@gmail.com', 'Email copied') },
    { n: 'Open GitHub', h: 'External', go: () => window.open('https://github.com/sadad54', '_blank', 'noopener') },
    {
      n: 'Open LinkedIn',
      h: 'External',
      go: () => window.open('https://www.linkedin.com/in/adnan-mashrur-sadad-87a45b237', '_blank', 'noopener'),
    },
    { n: 'Download résumé', h: 'File', go: () => window.open('resume.pdf', '_blank', 'noopener') },
    {
      n: 'Replay the repair loop',
      h: 'Demo',
      go: () => {
        jump('loop', reduceMotion);
        setTimeout(() => document.getElementById('replay')?.click(), 700);
      },
    },
  ];

  const filtered = ACTIONS.filter((a) => (a.n + ' ' + a.h).toLowerCase().includes(query.toLowerCase().trim()));

  function show() {
    setQuery('');
    setSel(0);
    setOpen(true);
  }
  function hide() {
    setOpen(false);
  }
  function fire(i) {
    const a = filtered[i];
    if (!a) return;
    hide();
    setTimeout(a.go, 60);
  }

  useEffect(() => {
    if (open) {
      document.body.classList.add('is-locked');
      const t = setTimeout(() => inputRef.current?.focus(), 30);
      return () => {
        clearTimeout(t);
        document.body.classList.remove('is-locked');
      };
    }
  }, [open]);

  useEffect(() => {
    function onKeydown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (!open) return;
      if (e.key === 'Escape') hide();
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSel((s) => Math.min(s + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSel((s) => Math.max(s - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        fire(sel);
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
  }, []);

  return (
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
            className="cmdk-box"
            initial={{ opacity: 0, y: reduceMotion ? 0 : -12, scale: reduceMotion ? 1 : 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduceMotion ? 0 : -8, scale: reduceMotion ? 1 : 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: EASE }}
          >
            <input
              ref={inputRef}
              id="cmdkInput"
              type="text"
              placeholder="Jump to a section, copy an address…"
              autoComplete="off"
              spellCheck="false"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSel(0);
              }}
            />
            <ul className="cmdk-list" id="cmdkList">
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
                    <span className="nm" style={{ color: 'var(--dimmer)' }}>Nothing matches that</span>
                  </button>
                </li>
              )}
            </ul>
            <div className="cmdk-foot">
              <span>&uarr;&darr; Navigate</span>
              <span>&crarr; Select</span>
              <span>Esc Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
