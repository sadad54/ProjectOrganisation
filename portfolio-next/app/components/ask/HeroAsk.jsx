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
  const [phase, setPhase] = useState('hold'); // hold | out | stream
  const input = useRef(null);
  const wrap = useRef(null);

  // the placeholder streams questions in word by word, the way the headline
  // was generated — never a lone letter on screen — holds each long enough
  // to read, then fades it and streams the next. Paused while the visitor
  // is in the field or the bar is off screen.
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
    let words = [];
    let n = 0;
    let step = 'hold';
    let laps = 0;
    const tick = () => {
      if (!on) return;
      if (!vis || document.activeElement === input.current) {
        t = setTimeout(tick, 400);
        return;
      }
      if (step === 'hold') {
        step = 'out';
        setPhase('out');
        t = setTimeout(tick, 280);
        return;
      }
      if (step === 'out') {
        i = (i + 1) % QS.length;
        // one pass through the questions, then it settles on the first
        if (i === 0 && ++laps >= 1) {
          setQi(0);
          setShown(QS[0]);
          setPhase('done');
          return;
        }
        setQi(i);
        words = QS[i].match(/\S+\s*/g);
        n = 0;
        step = 'stream';
        setPhase('stream');
      }
      n++;
      setShown(words.slice(0, n).join(''));
      if (n >= words.length) {
        step = 'hold';
        setPhase('hold');
        t = setTimeout(tick, 3400);
      } else t = setTimeout(tick, 70 + Math.random() * 60);
    };
    // the first question is there from the start; it only moves on once
    // the headline has finished generating and it has been readable a while
    t = setTimeout(tick, 7000);
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
            <span className={`ha-ph is-${focus ? 'hold' : phase}`} aria-hidden="true">
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
    </form>
  );
}
