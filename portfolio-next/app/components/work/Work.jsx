'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { WORK, DOMAINS } from '../../data/work';
import { buildIndex, search, similarity, neighbours, layout2D } from './retrieval';
import { frames, loadImage } from './board';
import IndexList from './IndexList';
import Stage from './Stage';
import LatentMap from './LatentMap';
import Split from '../site/Split';
import { EASE_OUT, reducedMotionNow, useMedia } from '../../lib/motion';

const AUTO_MS = 8000;
const EXAMPLES = ['streaming', 'evaluation', 'mobile apps', 'computer vision', 'RAG', 'schema validation', 'monte carlo', 'react'];

function useTypewriter(words, on) {
  const [txt, setTxt] = useState('');
  useEffect(() => {
    if (!on || reducedMotionNow()) {
      setTxt(words[0]);
      return;
    }
    let w = 0,
      c = 0,
      del = false,
      t = 0;
    const tick = () => {
      const word = words[w];
      if (!del) {
        c++;
        setTxt(word.slice(0, c));
        if (c === word.length) {
          del = true;
          t = setTimeout(tick, 1600);
          return;
        }
        t = setTimeout(tick, 70 + Math.random() * 60);
      } else {
        c--;
        setTxt(word.slice(0, c));
        if (c === 0) {
          del = false;
          w = (w + 1) % words.length;
          t = setTimeout(tick, 380);
          return;
        }
        t = setTimeout(tick, 32);
      }
    };
    t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, [words, on]);
  return txt;
}

/* L4 — every project on one screen. A search-engine-shaped index on the
   left (grouped by tier, or ranked by a live TF-IDF query), a stage on the
   right that samples each project in, and a map view of the whole corpus.
   Adding a project is one entry in app/data/work.js; nothing here changes. */
export default function Work() {
  const items = useMemo(() => WORK.map((p) => ({ ...p, domainLabel: DOMAINS[p.domain].label })), []);
  const index = useMemo(() => buildIndex(items), [items]);
  const S = useMemo(() => similarity(index), [index]);
  const nn = useMemo(() => neighbours(S, 2), [S]);
  const pos = useMemo(() => layout2D(S, items.map((p) => p.domain)), [S, items]);
  const edges = useMemo(() => {
    const seen = new Set();
    const out = [];
    nn.forEach((list, a) =>
      list.forEach(({ j, s }) => {
        const key = a < j ? `${a}-${j}` : `${j}-${a}`;
        if (seen.has(key) || s <= 0) return;
        seen.add(key);
        out.push([a, j, s]);
      })
    );
    return out;
  }, [nn]);

  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [domain, setDomain] = useState('all');
  const [view, setView] = useState('stage');
  const [selected, setSelected] = useState(items[0].slug);
  const [auto, setAuto] = useState(false);
  const [sheet, setSheet] = useState(false);
  const touched = useRef(false);
  const inView = useRef(false);
  const hovering = useRef(false);
  const sec = useRef(null);
  const mobile = useMedia('(max-width: 900px)');
  const example = useTypewriter(EXAMPLES, !query && !focused);
  const drag = useDragControls();

  const scores = useMemo(() => (query.trim() ? search(index, query) : null), [index, query]);
  const rows = useMemo(() => {
    let list = scores
      ? scores.map((s) => ({ p: items[s.i], score: s.score, n: s.i + 1 }))
      : items.map((p, i) => ({ p, score: null, n: i + 1 }));
    if (domain !== 'all') list = list.filter((r) => r.p.domain === domain);
    return list;
  }, [scores, items, domain]);
  const hits = scores ? scores.filter((s) => s.score > 0.02).length : null;

  const stop = useCallback(() => {
    touched.current = true;
    setAuto(false);
  }, []);

  const select = useCallback(
    (slug, reason) => {
      if (reason !== 'auto') stop();
      setSelected(slug);
      if (reason === 'map-open') setView('stage');
      if (mobile && (reason === 'click' || reason === 'external' || reason === 'neighbour')) setSheet(true);
      if (reason !== 'auto' && reason !== 'key' && window.__field && !reducedMotionNow()) window.__field.pulse();
    },
    [mobile, stop]
  );

  // the top match takes the stage as you type (debounced so keystrokes
  // don't each trigger a transition)
  useEffect(() => {
    if (!scores) return;
    const t = setTimeout(() => {
      const top = rows.find((r) => r.score > 0.02);
      if (top) setSelected(top.p.slug);
    }, 320);
    return () => clearTimeout(t);
  }, [scores, rows]);

  // a filter that hides the selection hands the stage to the first survivor
  useEffect(() => {
    if (rows.length && !rows.some((r) => r.p.slug === selected)) setSelected(rows[0].p.slug);
  }, [rows, selected]);

  // autoplay: the console demos itself until someone touches it
  useEffect(() => {
    if (reducedMotionNow() || !window.matchMedia('(pointer: fine)').matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        inView.current = e.isIntersecting;
        if (e.isIntersecting && !touched.current) setAuto(true);
        if (!e.isIntersecting) setAuto(false);
      },
      { threshold: 0.45 }
    );
    io.observe(sec.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!auto || view !== 'stage') return;
    const t = setTimeout(() => {
      if (!inView.current || hovering.current || touched.current) return;
      const i = rows.findIndex((r) => r.p.slug === selected);
      const next = rows[(i + 1) % rows.length];
      if (next) setSelected(next.p.slug);
    }, AUTO_MS);
    return () => clearTimeout(t);
  }, [auto, selected, rows, view]);

  // ⌘K and other sections can ask for a project
  useEffect(() => {
    const on = (e) => {
      const slug = e.detail?.slug;
      if (!slug) return;
      setQuery('');
      setDomain('all');
      setView('stage');
      select(slug, 'external');
    };
    window.addEventListener('work:select', on);
    return () => window.removeEventListener('work:select', on);
  }, [select]);

  // warm the image cache for whatever the pointer is about to pick
  const preload = useCallback((p) => {
    frames(p)
      .filter(Boolean)
      .slice(0, 3)
      .forEach((src) => loadImage(src).catch(() => {}));
  }, []);

  const i = items.findIndex((p) => p.slug === selected);
  const project = items[i];
  const near = nn[i].map(({ j, s }) => ({ p: items[j], s }));

  function stepSheet(dir) {
    const k = rows.findIndex((r) => r.p.slug === selected);
    const next = rows[(k + dir + rows.length) % rows.length];
    if (next) setSelected(next.p.slug);
  }

  useEffect(() => {
    if (!sheet) return;
    window.__lenis?.stop();
    document.body.classList.add('is-locked');
    const onKey = (e) => e.key === 'Escape' && setSheet(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.__lenis?.start();
      document.body.classList.remove('is-locked');
      window.removeEventListener('keydown', onKey);
    };
  }, [sheet]);

  return (
    <section className="work band" id="work" ref={sec} data-field="4" data-field-dim="0.7" aria-labelledby="work-h">
      <div className="wrap">
        <header className="work-head">
          <div className="work-title">
            <p className="layer rv">
              <span className="bars" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <b>L4</b> Retrieval <span className="rule" aria-hidden="true" /> selected work
            </p>
            <Split as="h2" id="work-h" className="display" text={['Every project, ', { t: 'one query away.', em: true }]} />
            <p className="lede rv" style={{ '--d': 120 }}>
              {items.length} builds — case studies with walkthroughs, shipped projects, smaller experiments. Type what
              you’re looking for: the ranking is a real TF-IDF search, running in your browser.
            </p>
          </div>

          <div className="work-tools rv" style={{ '--d': 180 }}>
            <label className={`q${focused ? ' focus' : ''}`} htmlFor="work-q" data-cursor="none">
              <span className="q-pr" aria-hidden="true">
                &gt;
              </span>
              <input
                id="work-q"
                type="search"
                value={query}
                autoComplete="off"
                spellCheck="false"
                placeholder=""
                aria-label="Search the work — for example streaming, evaluation, mobile"
                onChange={(e) => {
                  setQuery(e.target.value);
                  stop();
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setQuery('');
                  if (e.key === 'Enter') {
                    const top = rows[0];
                    if (top) select(top.p.slug, 'click');
                  }
                }}
              />
              {!query && (
                <span className="q-ph" aria-hidden="true">
                  query the work — <b>{example}</b>
                  <i className="q-caret" />
                </span>
              )}
              <span className="q-meta" aria-live="polite">
                {scores ? `${hits} / ${items.length} match` : `${items.length} docs · tf-idf`}
              </span>
              {query && (
                <button type="button" className="q-x" onClick={() => setQuery('')} aria-label="Clear search">
                  ×
                </button>
              )}
            </label>
            <div className="work-row">
              <div className="work-filters" role="group" aria-label="Filter by domain">
                {[['all', 'All'], ...Object.entries(DOMAINS).map(([k, d]) => [k, d.label])].map(([k, label]) => (
                  <button
                    type="button"
                    key={k}
                    className={`wf${domain === k ? ' on' : ''} d-${k}`}
                    aria-pressed={domain === k}
                    onClick={() => {
                      setDomain(k);
                      stop();
                    }}
                  >
                    {k !== 'all' && <i aria-hidden="true" />}
                    {label}
                  </button>
                ))}
              </div>
              {!mobile && (
                <div className={`work-view${view === 'map' ? ' is-map' : ''}`} role="group" aria-label="View">
                  <span className="wv-hl" aria-hidden="true" />
                  {[
                    ['stage', 'Stage'],
                    ['map', 'Map'],
                  ].map(([k, label]) => (
                    <button
                      type="button"
                      key={k}
                      className={view === k ? 'on' : ''}
                      aria-pressed={view === k}
                      onClick={() => {
                        setView(k);
                        stop();
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <div
          className={`console rv${view === 'map' ? ' is-map' : ''}`}
          style={{ '--d': 220 }}
          onPointerEnter={() => (hovering.current = true)}
          onPointerLeave={() => (hovering.current = false)}
        >
          <aside className="console-ix">
            {rows.length ? (
              <IndexList
                rows={rows}
                ranked={!!scores}
                selected={selected}
                onSelect={select}
                onPreload={preload}
                autoplay={auto && view === 'stage'}
                autoplayMs={AUTO_MS}
              />
            ) : (
              <p className="ix-empty">Nothing in this domain.</p>
            )}
            <p className="ix-foot">
              {scores ? (
                hits ? (
                  <>
                    ranked by cosine similarity <span>·</span> {hits} above 0.02
                  </>
                ) : (
                  <>no document scores above 0.02 — try “streaming” or “mobile”</>
                )
              ) : (
                <>
                  {auto && view === 'stage' ? 'auto-playing — touch anything to stop' : 'arrow keys move · enter opens'}
                </>
              )}
            </p>
          </aside>

          {!mobile && (
            <div className="console-main">
              <AnimatePresence mode="wait" initial={false}>
                {view === 'stage' ? (
                  <motion.div
                    key="stage"
                    className="console-view"
                    initial={{ opacity: 0, scale: 0.985 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.985 }}
                    transition={{ duration: 0.35, ease: EASE_OUT }}
                  >
                    <Stage project={project} index={i} total={items.length} neighbours={near} onSelect={select} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="map"
                    className="console-view"
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.35, ease: EASE_OUT }}
                  >
                    <LatentMap
                      items={items}
                      pos={pos}
                      edges={edges}
                      scores={scores}
                      selected={selected}
                      onSelect={select}
                      onOpen={(slug) => select(slug, 'map-open')}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Without JS the console can only show its first project, so the whole
          index is also served as plain markup (readers and crawlers alike). */}
      <noscript>
        <div className="wrap ns-work">
          {items.map((p) => (
            <article key={p.slug}>
              <h3>
                {p.name} <span>{p.kind}</span>
              </h3>
              <p>{p.hook}</p>
              <ul>
                {p.notes.map((n, k) => (
                  <li key={k} dangerouslySetInnerHTML={{ __html: n }} />
                ))}
              </ul>
              {p.page && <a href={`/work/${p.slug}`}>Case study →</a>}
            </article>
          ))}
        </div>
      </noscript>

      <AnimatePresence>
        {mobile && sheet && (
          <motion.div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={`${project.name} details`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            drag="y"
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) setSheet(false);
            }}
          >
            <div className="sheet-bar" onPointerDown={(e) => drag.start(e)}>
              <span className="sheet-grab" aria-hidden="true" />
              <button type="button" onClick={() => stepSheet(-1)} aria-label="Previous project">
                ←
              </button>
              <button type="button" onClick={() => stepSheet(1)} aria-label="Next project">
                →
              </button>
              <button type="button" className="sheet-x" onClick={() => setSheet(false)} aria-label="Close">
                Close ×
              </button>
            </div>
            <div className="sheet-body" data-lenis-prevent>
              <Stage project={project} index={i} total={items.length} neighbours={near} onSelect={select} compact />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
