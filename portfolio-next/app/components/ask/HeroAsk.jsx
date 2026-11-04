'use client';

import { useEffect, useRef, useState } from 'react';
import { reducedMotionNow } from '../../lib/motion';

/* The hero's front door to "Ask the model": a prompt line whose placeholder
   types real questions the way the headline was generated. Enter on an
   empty line asks the question on screen; anything typed is asked as is.
   The field behind it answers focus with a pulse — the 3D half of the UI. */
const QS = [
  'Has he run anything under real load?',
  'How does ProofHire stop the model from making things up?',
  'Has he shipped LLM systems that go beyond a demo?',
  'What did the SAFE-RAG research find?',
  'Is he open to relocation?',
];

function pulse() {
  if (!reducedMotionNow()) window.__field?.pulse?.();
}

export default function HeroAsk() {
  const [v, setV] = useState('');
  const [focus, setFocus] = useState(false);
  const [qi, setQi] = useState(0);
  const [shown, setShown] = useState(QS[0]);
  const [typing, setTyping] = useState(false);
  const input = useRef(null);
  const wrap = useRef(null);

  // the typed placeholder: type, hold, erase, next — paused while the
  // visitor is in the field or the bar is off screen
  useEffect(() => {
    if (reducedMotionNow()) return;
    let on = true;
    let vis = true;
    let t = 0;
    const io = new IntersectionObserver(([e]) => {
      vis = e.isIntersecting;
    });
    if (wrap.current) io.observe(wrap.current);
    let i = 0;
    let n = QS[0].length;
    let phase = 'hold';
    const tick = () => {
      if (!on) return;
      if (!vis || document.activeElement === input.current) {
        t = setTimeout(tick, 400);
        return;
      }
      const q = QS[i];
      if (phase === 'hold') {
        phase = 'erase';
        t = setTimeout(tick, 2600);
        setTyping(false);
        return;
      }
      if (phase === 'erase') {
        n = Math.max(0, n - 3);
        setShown(q.slice(0, n));
        setTyping(true);
        if (!n) {
          i = (i + 1) % QS.length;
          setQi(i);
          phase = 'type';
        }
        t = setTimeout(tick, 16);
        return;
      }
      const next = QS[i];
      n++;
      setShown(next.slice(0, n));
      if (n >= next.length) phase = 'hold';
      t = setTimeout(tick, n >= next.length ? 0 : 34 + Math.random() * 40);
    };
    // let the headline finish generating before the bar starts talking
    t = setTimeout(tick, 4200);
    return () => {
      on = false;
      clearTimeout(t);
      io.disconnect();
    };
  }, []);

  function submit(e) {
    e.preventDefault();
    const q = v.trim() || QS[qi];
    pulse();
    window.dispatchEvent(new CustomEvent('ask:open', { detail: { q } }));
    setV('');
    input.current?.blur();
  }

  return (
    <form className={`hero-ask${focus ? ' on' : ''}`} ref={wrap} onSubmit={submit} role="search" aria-label="Ask about Adnan's work">
      <div className="ha-bar">
        <span className="ha-pr" aria-hidden="true">
          &gt;
        </span>
        <span className="ha-field">
          <input
            ref={input}
            value={v}
            onChange={(e) => setV(e.target.value)}
            onFocus={() => {
              setFocus(true);
              pulse();
            }}
            onBlur={() => setFocus(false)}
            aria-label="Ask a question about Adnan's work"
            maxLength={300}
            autoComplete="off"
            spellCheck="false"
            enterKeyHint="send"
          />
          {!v && (
            <span className={`ha-ph${typing ? ' typing' : ''}`} aria-hidden="true">
              {focus ? QS[qi] : shown}
              {!focus && <i className="ha-caret" />}
            </span>
          )}
        </span>
        <button type="submit" className="ha-go" aria-label={v.trim() ? 'Ask' : `Ask: ${QS[qi]}`}>
          <span className="ha-go-k">Ask</span>
          <span aria-hidden="true">↵</span>
        </button>
      </div>
      <p className="ha-note">
        <span className="ha-dot" aria-hidden="true" />
        Ask the model · answers come only from this site, every claim cited
      </p>
    </form>
  );
}
