'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { WORK } from '../../data/work';
import { scrollToEl } from './SmoothScroll';
import { toast, copyText } from '../../lib/toast';
import { EASE_OUT, reducedMotionNow, useReducedMotionPref } from '../../lib/motion';
import AskPanel from '../ask/AskPanel';
import AskFloat from '../ask/AskFloat';

const EMAIL = 'adnanmashrursadad@gmail.com';

// typed something that reads as a question, not a command
const QUESTION = /\?\s*$|^(how|what|why|which|who|where|when|has|have|is|are|does|did|do|can|could|tell|show|explain)\b/i;

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
  const [mode, setMode] = useState('cmd'); // 'cmd' | 'ask'
  const [askQ, setAskQ] = useState(null); // { q, k } — k remounts the panel
  const inputRef = useRef(null);
  const boxRef = useRef(null);
  const listRef = useRef(null);
  const triggerRef = useRef(null);

  const goSection = useCallback(
    (id) => {
      if (onHome) scrollToEl(document.getElementById(id));
      else if (window.__ptGo) window.__ptGo(`/#${id}`, 'the index');
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
      ['decisions', 'The decisions I’d defend'],
      ['toolkit', 'Toolkit — skills graph'],
      ['contact', 'Contact'],
    ].forEach(([id, n]) => A.push({ g: 'Sections', n, h: 'Jump', go: () => goSection(id) }));
    WORK.forEach((p) =>
      A.push({
        g: 'Projects',
        n: p.name,
        h: p.kind,
        go: () => {
          if (onHome) {
            window.dispatchEvent(new CustomEvent('work:select', { detail: { slug: p.slug } }));
            scrollToEl(document.querySelector('#work .console') || document.getElementById('work'), { offset: -90 });
          } else if (window.__ptGo) window.__ptGo('/#work', 'the index');
          else router.push('/#work');
        },
      })
    );
    WORK.filter((p) => p.page).forEach((p) =>
      A.push({
        g: 'Case studies',
        n: `${p.name} — case study`,
        h: 'Page',
        go: () => (window.__ptGo ? window.__ptGo(`/work/${p.slug}`, p.name) : router.push(`/work/${p.slug}`)),
      })
    );
    A.push({
      g: 'Case studies',
      n: 'Research — both papers in full',
      h: 'Page',
      go: () => (window.__ptGo ? window.__ptGo('/research', 'research') : router.push('/research')),
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
    const raw = query.trim();
    const q = raw.toLowerCase();
    if (!q) return actions;
    const hits = actions.filter((a) => `${a.n} ${a.h} ${a.g}`.toLowerCase().includes(q));
    // a question goes to the model: first when it reads like one, last otherwise
    const ask = raw.length > 3 && { g: 'Ask the model', n: `Ask: “${raw}”`, h: 'Answers from this site', ask: raw };
    if (!ask) return hits;
    return QUESTION.test(raw) || !hits.length ? [ask, ...hits] : [...hits, ask];
  }, [actions, query]);

  const show = useCallback((m = 'cmd', q = null) => {
    if (!document.querySelector('.cmdk')) triggerRef.current = document.activeElement;
    setQuery('');
    setSel(0);
    setMode(m);
    setAskQ(q ? { q, k: Date.now() } : null);
    setOpen(true);
  }, []);
  const hide = useCallback(() => setOpen(false), []);

  function toAsk(q = null) {
    setMode('ask');
    setAskQ(q ? { q, k: Date.now() } : null);
  }

  function fire(i) {
    const a = filtered[i];
    if (!a) return;
    if (a.ask) return toAsk(a.ask);
    hide();
    setTimeout(a.go, 80);
  }

  // hand the question over to the contact composer, wherever it lives
  function toContact(q) {
    const draft = { s: 'Following up from your site', t: `Hi Adnan — I asked the assistant on your site “${q}” and wanted to follow up: ` };
    hide();
    setTimeout(() => {
      if (onHome) {
        scrollToEl(document.getElementById('contact'));
        window.dispatchEvent(new CustomEvent('contact:prefill', { detail: draft }));
      } else {
        try {
          sessionStorage.setItem('contact:prefill', JSON.stringify(draft));
        } catch {
          /* ignore */
        }
        if (window.__ptGo) window.__ptGo('/#contact', 'the index');
        else router.push('/#contact');
      }
    }, 80);
  }

  useEffect(() => {
    setRmOn(readRM());
    let seen = true;
    try {
      seen = localStorage.getItem('askHintSeen') === '1';
    } catch {
      /* ignore */
    }
    if (seen) return;
    // the hero already holds an ask bar; offer the shortcut only once the
    // visitor has scrolled past it, then retire it for good
    let s = 0,
      r = 0;
    const onScroll = () => {
      if (window.scrollY < window.innerHeight * 0.9) return;
      window.removeEventListener('scroll', onScroll);
      s = setTimeout(() => setHint(true), 1200);
      r = setTimeout(() => {
        setHint(false);
        try {
          localStorage.setItem('askHintSeen', '1');
        } catch {
          /* ignore */
        }
      }, 11000);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(s);
      clearTimeout(r);
    };
  }, []);

  function dismissHint() {
    setHint(false);
    try {
      localStorage.setItem('askHintSeen', '1');
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

  // switching modes moves focus to that mode's input
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus());
  }, [mode, open]);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => {
          if (!o) {
            triggerRef.current = document.activeElement;
            setQuery('');
            setSel(0);
            setMode('cmd');
            setAskQ(null);
          }
          return !o;
        });
        return;
      }
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        hide();
      } else if (mode === 'ask' && e.key !== 'Tab') {
        // the ask panel's own form and buttons handle the rest
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
        const f = boxRef.current?.querySelectorAll('input, button:not([disabled]), a[href]');
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
      else if (e.target.closest?.('[data-ask]')) {
        e.preventDefault();
        show('ask', e.target.closest('[data-ask]').getAttribute('data-ask') || null);
      }
    };
    // anything else on the site can open the assistant, optionally with a question
    const onAsk = (e) => show('ask', e.detail?.q || null);
    document.addEventListener('click', onClick);
    window.addEventListener('ask:open', onAsk);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('ask:open', onAsk);
    };
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
            onClick={() => {
              dismissHint();
              show('ask');
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 * dur, ease: EASE_OUT }}
          >
            <span className="nav-ask-dot" aria-hidden="true" />
            Ask anything about my work <b>{typeof navigator !== 'undefined' && /Win|Linux/i.test(navigator.platform) ? 'Ctrl' : '⌘'} K</b>
            <span
              className="kbd-hint-x"
              role="button"
              aria-label="Dismiss"
              onClick={(e) => {
                e.stopPropagation();
                dismissHint();
              }}
            >
              ×
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AskFloat hidden={open} />

      <AnimatePresence>
        {open && (
          <motion.div
            className="cmdk"
            role="dialog"
            aria-modal="true"
            aria-label={mode === 'ask' ? 'Ask the model' : 'Command menu'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 * dur }}
          >
            <div className="cmdk-bg" onClick={hide} />
            <motion.div
              ref={boxRef}
              className={`cmdk-box${mode === 'ask' ? ' is-ask' : ''}`}
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.28 * dur, ease: EASE_OUT }}
            >
              {mode === 'ask' ? (
                <AskPanel key={askQ?.k || 'ask'} initial={askQ?.q} inputRef={inputRef} onCommands={() => setMode('cmd')} onContact={toContact} />
              ) : (
              <>
              <div className="ask-top">
                <div className="ask-tabs" role="tablist" aria-label="Mode">
                  <span role="tab" aria-selected="true" className="tab on">
                    Commands
                  </span>
                  <button type="button" role="tab" aria-selected="false" className="tab" onClick={() => toAsk(query.trim().length > 3 ? query.trim() : null)}>
                    Ask
                  </button>
                </div>
              </div>
              <div className="cmdk-in">
                <span className="pr" aria-hidden="true">
                  &gt;
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Jump anywhere — or ask a question…"
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
                      <li key={a.g + a.n} className={[i === sel && 'sel', a.ask && 'is-ask'].filter(Boolean).join(' ') || undefined}>
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
              </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
