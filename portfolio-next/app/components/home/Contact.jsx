'use client';

import { useEffect, useRef, useState } from 'react';
import Split from '../site/Split';
import Magnetic from '../site/Magnetic';
import { copyText } from '../../lib/toast';
import { reducedMotionNow } from '../../lib/motion';

const EMAIL = 'adnanmashrursadad@gmail.com';

const STARTERS = [
  { k: 'Collaborate', s: 'A project', t: 'Hi Adnan — I’m working on something I think you’d enjoy digging into: ' },
  { k: 'Research', s: 'Research chat', t: 'Hi Adnan — I read about your evaluation research and wanted to ask about ' },
  { k: 'Say hello', s: 'Hello from your portfolio', t: 'Hi Adnan — just saying hello. The part of the site I liked most was ' },
];

const REACH = [
  { href: `mailto:${EMAIL}`, k: 'Email', v: EMAIL, a: 'Copy', kind: 'email' },
  { href: 'https://www.linkedin.com/in/adnan-mashrur-sadad-87a45b237', k: 'LinkedIn', v: 'adnan-mashrur-sadad', a: '↗', kind: 'ext' },
  { href: 'https://github.com/sadad54', k: 'GitHub', v: 'sadad54', a: '↗', kind: 'ext' },
  { href: '/Adnan_Sadad_AI_ML_Resume_LaTeX.pdf', dl: 'Adnan-Sadad-Resume-AI-ML.pdf', k: 'Résumé', v: 'AI / ML', a: 'PDF ↓', kind: 'dl' },
  { href: '/Adnan_Sadad_SWE_Resume_LaTeX.pdf', dl: 'Adnan-Sadad-Resume-Full-Stack.pdf', k: 'Résumé', v: 'Full-stack', a: 'PDF ↓', kind: 'dl' },
];

function useKLTime() {
  const [t, setT] = useState('');
  useEffect(() => {
    const f = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kuala_Lumpur', hour: 'numeric', minute: '2-digit', hour12: true });
    const paint = () => setT(f.format(new Date()).toLowerCase());
    paint();
    const id = setInterval(paint, 30_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

/* OUT — the page ends where a model's forward pass ends: at an output.
   The composer streams a starter message in token by token (the same way
   the hero headline was generated), then hands the whole thing to the
   visitor's own mail client. Nothing is sent from this page. */
export default function Contact() {
  const time = useKLTime();
  const [msg, setMsg] = useState('');
  const [subject, setSubject] = useState('Hello from your portfolio');
  const [streaming, setStreaming] = useState(false);
  const timer = useRef(0);
  const ta = useRef(null);

  function stream(starter) {
    clearTimeout(timer.current);
    setSubject(starter.s);
    if (reducedMotionNow()) {
      setMsg(starter.t);
      ta.current?.focus();
      return;
    }
    const tokens = starter.t.match(/\S+\s*/g) || [];
    let i = 0;
    setMsg('');
    setStreaming(true);
    const step = () => {
      i++;
      setMsg(tokens.slice(0, i).join(''));
      if (i < tokens.length) timer.current = setTimeout(step, 55 + Math.random() * 70);
      else {
        setStreaming(false);
        const el = ta.current;
        if (el) {
          el.focus();
          el.setSelectionRange(el.value.length, el.value.length);
        }
      }
    };
    timer.current = setTimeout(step, 120);
  }
  useEffect(() => () => clearTimeout(timer.current), []);

  const mailto = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(msg)}`;

  return (
    <section className="contact band" id="contact" data-field="6" data-field-dim="0.7" aria-labelledby="contact-h">
      <div className="wrap">
        <p className="layer rv">
          <span className="bars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <b>Out</b> Output <span className="rule" aria-hidden="true" /> contact
        </p>
        <Split
          as="h2"
          id="contact-h"
          className="display contact-h"
          text={['Building something interesting? ', { t: 'I’d like to hear about it.', em: true }]}
        />

        <div className="ct-grid">
          <div className="ct-left">
            <p className="lede rv">
              This site is a running log of things I’ve built and the decisions behind them, not a pitch. If something
              here resonates — or you’re working on a problem you think I’d enjoy digging into — say hello.
            </p>

            <form
              className={`composer rv${streaming ? ' streaming' : ''}`}
              style={{ '--d': 120 }}
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = mailto;
              }}
            >
              <div className="cp-top">
                <span>
                  to <b>{EMAIL}</b>
                </span>
                <span className="cp-subj">
                  subject <b>{subject}</b>
                </span>
              </div>
              <label className="cp-body" htmlFor="ct-msg">
                <span className="cp-pr" aria-hidden="true">
                  &gt;
                </span>
                <textarea
                  id="ct-msg"
                  ref={ta}
                  rows={4}
                  value={msg}
                  placeholder="Write a message, or start from one below…"
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      window.location.href = mailto;
                    }
                  }}
                  aria-label="Message"
                />
              </label>
              <div className="cp-foot">
                <div className="cp-starters" role="group" aria-label="Start from">
                  {STARTERS.map((s) => (
                    <button type="button" key={s.k} onClick={() => stream(s)}>
                      {s.k}
                    </button>
                  ))}
                </div>
                <button type="submit" className="btn btn-solid cp-send" data-cursor="Send">
                  Open in mail <span className="arw">↗</span>
                </button>
              </div>
            </form>
            <p className="cp-note rv">Opens your own mail app with this filled in — nothing is sent from this page.</p>
          </div>

          <div className="ct-right">
            <ul className="reach">
              {REACH.map((r, i) => (
                <li key={r.href} className="rv" style={{ '--d': 80 * i }}>
                  <a
                    href={r.href}
                    target={r.kind === 'ext' ? '_blank' : undefined}
                    rel={r.kind === 'ext' ? 'noopener noreferrer' : undefined}
                    download={r.kind === 'dl' ? r.dl : undefined}
                    onClick={
                      r.kind === 'email'
                        ? (e) => {
                            if (!navigator.clipboard) return;
                            e.preventDefault();
                            copyText(EMAIL, 'Email copied');
                          }
                        : undefined
                    }
                    aria-label={r.kind === 'email' ? `Copy email address ${EMAIL}` : undefined}
                  >
                    <span className="rc-k">{r.k}</span>
                    <span className="rc-v">{r.v}</span>
                    <span className="rc-a">{r.a}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="ct-clock rv">
              <span className="dot" aria-hidden="true" />
              Kuala Lumpur <span className="sep">·</span> <time suppressHydrationWarning>{time || '—'}</time> local{' '}
              <span className="sep">·</span> GMT+8
            </div>
            <Magnetic className="btn ct-top" href="#top" data-cursor="Top">
              Back to the input <span className="arw">↑</span>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
