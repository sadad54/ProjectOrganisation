'use client';

import { useEffect, useRef, useState } from 'react';
import { reducedMotionNow } from '../../lib/motion';

/* "Ask the model" — the command palette's second mode. One question, one
   answer that cites the site, and the forward pass behind it on demand.
   The stream comes from /api/ask (see that file for the event shapes). */

export const STARTERS = [
  { who: 'Hiring for a role', qs: ['Has he shipped LLM systems that go beyond a demo?', 'Has he run anything under real load?', 'Is he open to relocation?'] },
  { who: 'Reading the engineering', qs: ['How does ProofHire stop the model from making things up?', 'Why does Learn2Unlock never let the model decide?', 'What did the SAFE-RAG research find?'] },
];

const STAGES = ['retrieve', 'generate', 'validate'];
const CITE = /\[(\d+(?:\s*,\s*\d+)*)\]/g;
const KEY = 'ask:last';

function pulse() {
  if (!reducedMotionNow()) window.__field?.pulse?.();
}

// "text [1] more [2, 3]" → [{t:'text '}, {c:1}, {t:' more '}, {c:2}, {c:3}]
function parts(text) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(CITE)) {
    if (m.index > last) out.push({ t: text.slice(last, m.index) });
    m[1].split(',').forEach((x) => out.push({ c: Number(x.trim()) }));
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ t: text.slice(last) });
  return out;
}

function load() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}
function save(v) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* private mode */
  }
}

export default function AskPanel({ initial, onCommands, onContact, inputRef }) {
  // a: { q, text, sources, cited, status, reason, ms, model, repaired, error }
  const [a, setA] = useState(null);
  const [stage, setStage] = useState(-1);
  const [draft, setDraft] = useState('');
  const [trace, setTrace] = useState(false);
  const [hot, setHot] = useState(0);
  const [live, setLive] = useState('');
  const ctrl = useRef(null);
  const bodyRef = useRef(null);
  const seen = useRef(0);

  const busy = a?.status === 'run';

  async function ask(q) {
    q = q.trim();
    if (!q || busy) return;
    const prev = a && a.status === 'done' ? { q: a.q, a: a.text.replace(CITE, '') } : null;
    ctrl.current?.abort();
    const ac = new AbortController();
    ctrl.current = ac;
    seen.current = 0;
    setDraft('');
    setTrace(false);
    setHot(0);
    setLive('');
    setStage(0);
    let cur = { q, text: '', sources: [], cited: [], status: 'run' };
    const put = (patch) => {
      cur = { ...cur, ...patch };
      setA(cur);
    };
    put({});
    pulse();

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q, prev }),
        signal: ac.signal,
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'The model didn’t answer. Try again?');
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          if (!line.trim()) continue;
          const e = JSON.parse(line);
          if (e.t === 'retrieved') {
            setStage(1);
            put({ sources: e.sources });
          } else if (e.t === 'delta' || e.t === 'replace') {
            const text = e.t === 'delta' ? cur.text + e.text : e.text;
            // fire the field once per citation as it lands
            const n = [...text.matchAll(CITE)].length;
            if (n > seen.current) {
              seen.current = n;
              pulse();
              const last = [...text.matchAll(CITE)].pop();
              setHot(Number(last[1].split(',')[0]));
            }
            put({ text, repaired: e.t === 'replace' || cur.repaired });
          } else if (e.t === 'done') {
            setStage(3);
            setHot(0);
            // drop any mark that points outside the retrieved sources
            const text = cur.text.replace(CITE, (m, g) => {
              const ok = g.split(',').map((x) => Number(x.trim())).filter((x) => e.cited.includes(x));
              return ok.length ? `[${ok.join(', ')}]` : '';
            });
            put({ text, cited: e.cited, status: 'done', ms: e.ms, model: e.model, repaired: e.repaired });
            setLive(`Answer: ${text.replace(CITE, '')}`);
          } else if (e.t === 'miss') {
            setStage(3);
            put({ text: '', status: 'miss', reason: e.reason, ms: e.ms });
            setLive('That isn’t on file. Nothing on this site covers it.');
          } else if (e.t === 'error') {
            throw new Error(e.message);
          }
        }
      }
      if (cur.status === 'run') throw new Error('The answer was cut off. Try again?');
    } catch (err) {
      if (ac.signal.aborted) return;
      put({ status: 'error', error: err.message });
      setLive(err.message);
    } finally {
      if (cur.status !== 'run') save(cur);
    }
  }

  // keep whatever streamed; never claim it was checked
  function stop() {
    ctrl.current?.abort();
    setA((v) => (v ? { ...v, status: 'stopped' } : v));
    setHot(0);
  }

  useEffect(() => {
    if (initial) ask(initial);
    else {
      const last = load();
      if (last) {
        setA(last);
        setStage(3);
      }
    }
    return () => ctrl.current?.abort();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // an opened trace lands below the fold: bring it into view
  useEffect(() => {
    if (!trace) return;
    const b = bodyRef.current;
    b?.scrollTo({ top: b.scrollHeight, behavior: reducedMotionNow() ? 'auto' : 'smooth' });
  }, [trace]);

  const done = a?.status === 'done';
  const max = Math.max(1, ...(a?.sources || []).map((s) => s.score));
  const cited = done ? a.cited.map((n) => a.sources.find((s) => s.n === n)).filter(Boolean) : [];

  function label(st, i) {
    if (!a) return '—';
    if (a.status === 'stopped' && stage <= i) return 'stopped';
    if (a.status === 'error' && stage <= i) return 'failed';
    if (stage > i) {
      if (st === 'retrieve') return `${a.sources.length} chunks`;
      if (st === 'validate') return a.status === 'miss' ? (a.reason === 'ungrounded' ? 'withheld' : 'no support') : `${a.cited.length} cited`;
      return a.status === 'miss' ? '—' : 'done';
    }
    return stage === i ? 'running' : '—';
  }
  const cls = (st, i) =>
    stage > i ? (st === 'validate' && a?.status === 'miss' ? 'miss' : 'ok') : a && a.status !== 'run' ? 'stop' : stage === i ? 'run' : '';

  return (
    <>
      <div className="ask-top">
        <div className="ask-tabs" role="tablist" aria-label="Mode">
          <button type="button" role="tab" aria-selected="false" className="tab" onClick={onCommands}>
            Commands
          </button>
          <span role="tab" aria-selected="true" className="tab on">
            Ask
          </span>
        </div>
        <span className="ask-beta">Answers from this site only</span>
      </div>

      {a && (
        <div className="ask-q">
          <span className="pr" aria-hidden="true">
            &gt;
          </span>{' '}
          {a.q}
        </div>
      )}

      <div className="ask-body" ref={bodyRef} data-lenis-prevent>
        <p className="sr-only" aria-live="polite">
          {live}
        </p>

        {!a && (
          <div className="ask-empty">
            {STARTERS.map((g) => (
              <div key={g.who} className="ask-group">
                <p className="ask-label">{g.who}</p>
                <ul>
                  {g.qs.map((q) => (
                    <li key={q}>
                      <button type="button" onClick={() => ask(q)}>
                        {q}
                        <span className="go" aria-hidden="true">
                          ↵
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {a && (
          <>
            <ol className="ask-pass" aria-label="Forward pass">
              {STAGES.map((st, i) => (
                <li key={st} className={cls(st, i)}>
                  <span>{st}</span>
                  <span className="dots" />
                  <span>{label(st, i)}</span>
                </li>
              ))}
            </ol>

            {a.text && (
              <p className="ask-text">
                {parts(a.text).map((p, i) =>
                  p.t !== undefined ? (
                    <span key={i}>{p.t}</span>
                  ) : (
                    <button
                      key={i}
                      type="button"
                      className={`ask-cite${hot === p.c ? ' on' : ''}`}
                      onClick={() => {
                        setHot(p.c);
                        pulse();
                      }}
                      aria-label={`Source ${p.c}: ${a.sources.find((s) => s.n === p.c)?.title || ''}`}
                    >
                      {p.c}
                    </button>
                  )
                )}
              </p>
            )}

            {a.status === 'miss' && (
              <div className="ask-miss">
                <p className="ask-miss-h">That isn’t on file.</p>
                <p>
                  {a.reason === 'ungrounded'
                    ? 'The draft answer couldn’t point to anything on this site, so it was withheld. Adnan can tell you directly.'
                    : 'Nothing on this site covers it, and I only answer from what’s written here. Adnan can tell you directly.'}
                </p>
              </div>
            )}

            {a.status === 'error' && (
              <div className="ask-miss err">
                <p className="ask-miss-h">{a.error}</p>
              </div>
            )}

            {a.status === 'stopped' && <p className="ask-note">Stopped — this partial answer wasn’t checked.</p>}

            {cited.length > 0 && (
              <ul className="ask-sources">
                {cited.map((s) => (
                  <li key={s.n} className={hot === s.n ? 'on' : ''}>
                    <a href={s.href} onMouseEnter={() => setHot(s.n)} onMouseLeave={() => setHot(0)} onFocus={() => setHot(s.n)} onBlur={() => setHot(0)}>
                      <span className="n">{s.n}</span>
                      <span className="src">
                        <b>{s.title}</b>
                        <span className="where">{s.section}</span>
                        <span className="snip">“{s.snip}”</span>
                      </span>
                      <span className="arr" aria-hidden="true">
                        ↗
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}

            {a.status !== 'run' && (
              <div className="ask-acts">
                <button type="button" className="ask-btn hot" onClick={() => onContact(a.q)}>
                  Message Adnan about this →
                </button>
                {(done || a.status === 'miss') && (
                  <button type="button" className="ask-btn" onClick={() => setTrace((v) => !v)} aria-expanded={trace}>
                    {trace ? 'Hide' : 'Show'} the forward pass
                  </button>
                )}
                <button
                  type="button"
                  className="ask-btn ghost"
                  onClick={() => {
                    setA(null);
                    setStage(-1);
                    try {
                      sessionStorage.removeItem(KEY);
                    } catch {
                      /* ignore */
                    }
                    inputRef.current?.focus();
                  }}
                >
                  New question
                </button>
              </div>
            )}

            {trace && (done || a.status === 'miss') && (
              <div className="ask-trace">
                <p className="ask-label">Retrieved · bm25 over this site</p>
                <ul>
                  {a.sources.map((s) => {
                    const used = a.cited?.includes(s.n);
                    return (
                      <li key={s.id} className={used ? 'used' : ''}>
                        <span className="id">{s.id}</span>
                        <span className="bar">
                          <i style={{ width: `${Math.round((s.score / max) * 100)}%` }} />
                        </span>
                        <span className="sc">{s.score.toFixed(1)}</span>
                        <span className="u">{used ? 'cited' : '—'}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="ask-meta">
                  {done
                    ? `${a.cited.length} citation${a.cited.length === 1 ? '' : 's'} checked against retrieval${a.repaired ? ' · repaired once' : ''}`
                    : a.reason === 'ungrounded'
                      ? 'draft cited nothing · repair failed · withheld'
                      : 'model found no support in these sources'}{' '}
                  · {(a.ms / 1000).toFixed(2)} s{a.model ? ` · ${a.model}` : ''}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <form
        className="ask-in"
        onSubmit={(e) => {
          e.preventDefault();
          ask(draft);
        }}
      >
        <span className="pr" aria-hidden="true">
          &gt;
        </span>
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={a ? 'Ask a follow-up…' : 'Ask about my projects, stack or decisions…'}
          aria-label="Your question"
          maxLength={300}
          autoComplete="off"
          spellCheck="false"
          readOnly={busy}
        />
        <button type={busy ? 'button' : 'submit'} className="ask-send" onClick={busy ? stop : undefined} disabled={!busy && !draft.trim()}>
          {busy ? 'Stop' : 'Ask ↵'}
        </button>
      </form>
      <div className="cmdk-foot">
        <span>↵ Ask</span>
        <span>Esc Close</span>
        <span className="ask-foot-r">Can be wrong — check the sources</span>
      </div>
    </>
  );
}
