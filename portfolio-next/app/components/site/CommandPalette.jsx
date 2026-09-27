'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { WORK } from '../../data/work';
import { scrollToEl } from './SmoothScroll';
import { toast, copyText } from '../../lib/toast';
import { EASE_OUT, reducedMotionNow, useReducedMotionPref } from '../../lib/motion';

const EMAIL = 'adnanmashrursadad@gmail.com';

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
    /* private mode */
  }
}

/* ⌘K / Ctrl-K. Every section, every project, the contact actions and the
   motion switch — grouped, filterable, fully keyboard driven, focus trapped
   and returned to the trigger on close. */
export default function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const onHome = pathname === '/';
  const rmPref = useReducedMotionPref();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [sel, setSel] = useState(0);
  const [rmOn, setRmOn] = useState(false);
  const [hint, setHint] = useState(false);
  const inputRef = useRef(null);
  const boxRef = useRef(null);
  const listRef = useRef(null);
  const triggerRef = useRef(null);

  const goSection = useCallback(
    (id) => {
      if (onHome) scrollToEl(document.getElementById(id));
      else router.push(`/#${id}`);
    },
    [onHome, router]
  );

  const actions = useMemo(() => {
    const A = [];
    [
      ['work', 'Selected work'],
      ['research', 'Research'],
      ['about', 'About — the model card'],
      ['decisions', 'Four decisions I’d defend'],
      ['toolkit', 'Toolkit — skills graph'],
      ['contact', 'Contact'],
    ].forEach(([id, n]) => A.push({ g: 'Sections', n, h: 'Jump', go: () => goSection(id) }));
    WORK.forEach((p) => {
      A.push({
        g: 'Projects',
        n: p.name,
        h: p.kind,
        go: () => {
          if (onHome) {
            window.dispatchEvent(new CustomEvent('work:select', { detail: { slug: p.slug } }));
            scrollToEl(document.getElementById('work'), { offset: 0 });
          } else router.push(`/#work`);
        },
      });
      if (p.page)
        A.push({ g: 'Case studies', n: `${p.name} — case study`, h: 'Page', go: () => router.push(`/work/${p.slug}`) });
    });
    A.push(
      { g: 'Contact', n: 'Copy email address', h: 'Copy', go: () => copyText(EMAIL, 'Email copied') },
      { g: 'Contact', n: 'Open GitHub', h: 'External', go: () => window.open('https://github.com/sadad54', '_blank', 'noopener') },
      {
        g: 'Contact',
        n: 'Open LinkedIn',
        h: 'External',
        go: () => window.open('https://www.linkedin.com/in/adnan-mashrur-sadad-87a45b237', '_blank', 'noopener'),
      },
      { g: 'Contact', n: 'Résumé — AI / ML', h: 'PDF', go: () => window.open('/Adnan_Sadad_AI_ML_Resume_LaTeX.pdf', '_blank', 'noopener') },
      { g: 'Contact', n: 'Résumé — Full-stack', h: 'PDF', go: () => window.open('/Adnan_Sadad_SWE_Resume_LaTeX.pdf', '_blank', 'noopener') },
      {
        g: 'Site',
        n: 'Fire the network',
        h: 'Fun',
        go: () => {
          if (window.__field && !reducedMotionNow()) window.__field.pulse();
          else toast('Motion is off');
        },
      },
      {
        g: 'Site',
        n: rmOn ? 'Turn motion back on' : 'Reduce motion',
        h: 'Accessibility',
        go: () => {
          const next = !readRM();
          applyRM(next);
          setRmOn(next);
          toast(next ? 'Reduced motion on — reloading' : 'Motion restored — reloading');
          setTimeout(() => location.reload(), 700);
        },
      }
    );
    return A;
  }, [goSection, onHome, router, rmOn]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return actions;
    return actions.filter((a) => `${a.n} ${a.h} ${a.g}`.toLowerCase().includes(q));
  }, [actions, query]);

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
    setTimeout(a.go, 80);
  }

  useEffect(() => {
    setRmOn(readRM());
    let seen = true;
    try {
      seen = localStorage.getItem('kbdHintSeen') === '1';
    } catch {
      /* ignore */
    }
    if (seen) return;
    const s = setTimeout(() => setHint(true), 6500);
    const r = setTimeout(() => {
      setHint(false);
      try {
        localStorage.setItem('kbdHintSeen', '1');
      } catch {
        /* ignore */
      }
    }, 17000);
    return () => {
      clearTimeout(s);
      clearTimeout(r);
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
    if (!open) return;
    dismissHint();
    document.body.classList.add('is-locked');
    window.__lenis?.stop();
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => {
      clearTimeout(t);
      document.body.classList.remove('is-locked');
      window.__lenis?.start();
      triggerRef.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector('li.sel')?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => {
          if (!o) {
            triggerRef.current = document.activeElement;
            setQuery('');
            setSel(0);
          }
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
        const f = boxRef.current?.querySelectorAll('input, button');
        if (!f?.length) return;
        const first = f[0],
          last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    const onClick = (e) => {
      if (e.target.closest?.('#cmdk-open')) show();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [show]);

  let lastGroup = null;
  const dur = rmPref ? 0 : 1;

  return (
    <>
      <AnimatePresence>
        {hint && (
          <motion.button
            type="button"
            className="kbd-hint"
            onClick={dismissHint}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 * dur, ease: EASE_OUT }}
          >
            Press <b>{typeof navigator !== 'undefined' && /Win|Linux/i.test(navigator.platform) ? 'Ctrl' : '⌘'} K</b> to
            jump anywhere
            <span className="kbd-hint-x" aria-hidden="true">
              ×
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="cmdk"
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 * dur }}
          >
            <div className="cmdk-bg" onClick={hide} />
            <motion.div
              ref={boxRef}
              className="cmdk-box"
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.28 * dur, ease: EASE_OUT }}
            >
              <div className="cmdk-in">
                <span className="pr" aria-hidden="true">
                  &gt;
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Jump to a section, open a project, copy an address…"
                  autoComplete="off"
                  spellCheck="false"
                  value={query}
                  aria-label="Command"
                  aria-controls="cmdk-list"
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSel(0);
                  }}
                />
              </div>
              <ul className="cmdk-list" id="cmdk-list" ref={listRef} data-lenis-prevent>
                {filtered.length ? (
                  filtered.map((a, i) => {
                    const head = a.g !== lastGroup ? a.g : null;
                    lastGroup = a.g;
                    return (
                      <li key={a.g + a.n} className={i === sel ? 'sel' : undefined}>
                        {head && <p className="cmdk-group">{head}</p>}
                        <button type="button" onClick={() => fire(i)} onMouseMove={() => setSel(i)}>
                          <span className="nm">{a.n}</span>
                          <span className="hint">{a.h}</span>
                        </button>
                      </li>
                    );
                  })
                ) : (
                  <li>
                    <p className="cmdk-group">Nothing matches “{query}”</p>
                  </li>
                )}
              </ul>
              <div className="cmdk-foot">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>Esc Close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
