'use client';

import { useEffect, useRef, useState } from 'react';
import Media from '../work/Media';
import { Odometer } from '../work/Stage';
import { DiagramRenderer } from './diagrams';
import { DOMAINS } from '../../data/work';
import { whenStageReady } from '../../lib/stage';
import { reducedMotionNow } from '../../lib/motion';

/* A case study reads like a paper with a demo attached: a hero that samples
   the walkthrough in, then a sticky outline beside the sections — overview,
   the STAR story, how it works, highlights, the limitations (written the
   way a model card writes them), screens, stack. */
export default function ProjectPage({ project: p, entry, shots, prev, next, num, total }) {
  const hero = useRef(null);
  const [active, setActive] = useState('overview');
  const [pinned, setPinned] = useState(false);
  const light = useRef(null);
  const [shot, setShot] = useState(0);

  const sections = [
    ['overview', 'Overview'],
    ['story', 'The story'],
    ['how', 'How it works'],
    p.highlights?.length ? ['highlights', 'Highlights'] : null,
    p.limitations?.length ? ['limits', 'Known limitations'] : null,
    shots.length ? ['screens', 'Screens'] : null,
    ['stack', 'Stack & links'],
  ].filter(Boolean);

  useEffect(() => {
    const el = hero.current;
    if (reducedMotionNow()) {
      el.classList.add('go');
      return;
    }
    return whenStageReady(() => el.classList.add('go'));
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach(([id]) => {
      const s = document.getElementById(id);
      if (s) io.observe(s);
    });
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // once the hero has gone, a slim bar keeps the name and the number in view
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setPinned(!e.isIntersecting), { rootMargin: '-80px 0px 0px 0px' });
    io.observe(hero.current);
    return () => io.disconnect();
  }, []);

  const openShot = (i) => {
    setShot(i);
    light.current?.showModal();
  };
  const step = (d) => setShot((i) => (i + d + shots.length) % shots.length);
  const activeIdx = sections.findIndex((s) => s[0] === active);
  const repo = p.links.find((l) => !l.internal);

  const domain = entry ? DOMAINS[entry.domain].label : null;
  // a case study without a walkthrough yet samples its own screens in instead
  const video = { slug: p.slug, name: p.name, media: p.media || { type: 'video', slug: p.slug } };
  const gallery = shots.length
    ? { slug: `${p.slug}-screens`, name: p.name, media: { type: 'shots', frame: p.screenshots?.frame || 'desktop', files: shots, alt: p.screenshots?.alt || `${p.name} screenshots` } }
    : null;

  return (
    <main id="main" className="cs" data-field={p.field ?? 2} data-field-dim="0.42">
      <span className="cs-progress" aria-hidden="true" />
      <div className={`cs-pin${pinned ? ' on' : ''}`} aria-hidden={!pinned}>
        <div className="wrap cs-pin-in">
          <span className="cs-pin-n">{p.name}</span>
          <span className="cs-pin-m">
            <b>{p.headline.metric}</b> {p.headline.label}
          </span>
          {repo && (
            <a className="lnk" href={repo.href} target="_blank" rel="noopener noreferrer" tabIndex={pinned ? 0 : -1}>
              {repo.label} ↗
            </a>
          )}
        </div>
      </div>
      <header className="cs-hero wrap" ref={hero}>
        <nav className="cs-crumbs" aria-label="Breadcrumb">
          <a href="/#work" data-pt="the index" className="lnk">
            ← All work
          </a>
          <span>
            Case study {String(num).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </nav>
        <p className="cs-meta">
          <span>{p.year}</span>
          <span className="sep">·</span>
          <span>{p.kind}</span>
          {p.badge && (
            <>
              <span className="sep">·</span>
              <span>{p.badge}</span>
            </>
          )}
          {domain && (
            <>
              <span className="sep">·</span>
              <span className={`d-${entry.domain} cs-dom`}>{domain}</span>
            </>
          )}
        </p>
        <h1 className="cs-name" aria-label={p.name}>
          {(() => {
            let i = 0;
            // words stay whole: a line may break between words, never inside one
            return p.name.split(' ').map((w, wi, arr) => (
              <span className="cs-word" key={wi} aria-hidden="true">
                {[...w].map((c) => (
                  <span className="cs-ch" key={i}>
                    <span style={{ '--i': i++ }}>{c}</span>
                  </span>
                ))}
                {wi < arr.length - 1 && <span className="cs-ch">{'\u00A0'}</span>}
              </span>
            ));
          })()}
        </h1>
        <p className="cs-hook">{p.hook}</p>
        <div className="cs-hero-row">
          <div className="cs-metric">
            <Odometer value={p.headline.metric} />
            <span>{p.headline.label}</span>
          </div>
          <div className="cs-links">
            <button type="button" className="btn ask-btn-cs" data-ask={`What problem does ${p.name} solve, and what are its limits?`}>
              <span className="ask-lnk-dot" aria-hidden="true" />
              Ask about {p.name}
            </button>
            {p.links
              .filter((l) => !l.internal)
              .map((l) => (
                <a key={l.href} className="btn" href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label} <span className="arw">↗</span>
                </a>
              ))}
          </div>
        </div>
        <div className="cs-media">
          <Media project={video} />
        </div>
      </header>

      <div className="wrap cs-body">
        <aside className="cs-toc" aria-label="On this page">
          <p className="cs-toc-k">On this page</p>
          <ol>
            {sections.map(([id, label], k) => (
              <li key={id}>
                <a href={`#${id}`} className={active === id ? 'on' : k < activeIdx ? 'read' : ''} aria-current={active === id ? 'true' : undefined}>
                  <span>{String(k + 1).padStart(2, '0')}</span>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        <div className="cs-content">
          <section id="overview" className="cs-sec">
            <h2 className="cs-h">
              <span>01</span> Overview
            </h2>
            <p className="cs-lede rv">{p.overview.summary}</p>
            <ul className="cs-results">
              {p.overview.bullets.map((b, i) => (
                <li key={i} className="rv" style={{ '--d': i * 90 }} dangerouslySetInnerHTML={{ __html: b }} />
              ))}
            </ul>
          </section>

          <section id="story" className="cs-sec">
            <h2 className="cs-h">
              <span>02</span> The story
            </h2>
            <ol className="star">
              {[
                ['Situation', p.story.situation],
                ['Task', p.story.task],
                ['Action', p.story.action],
                ['Result', p.story.result],
              ].map(([k, v], i) => (
                <li key={k} className="rv" style={{ '--d': 60 }}>
                  <span className="star-k">
                    <i aria-hidden="true" />
                    {k}
                  </span>
                  <p>{v}</p>
                </li>
              ))}
            </ol>
          </section>

          <section id="how" className="cs-sec">
            <h2 className="cs-h">
              <span>03</span> How it works
            </h2>
            <p className="cs-lede rv">{p.architecture.summary}</p>
            <div className="rv" data-reveal>
              <DiagramRenderer diagram={p.architecture.diagram} title={`${p.name} architecture`} />
            </div>
          </section>

          {p.highlights?.length > 0 && (
            <section id="highlights" className="cs-sec">
              <h2 className="cs-h">
                <span>{String(sections.findIndex((s) => s[0] === 'highlights') + 1).padStart(2, '0')}</span> Highlights
              </h2>
              <div className="cs-hl">
                {p.highlights.map((h) => (
                  <article key={h.title} className="rv">
                    <h3>{h.title}</h3>
                    <DiagramRenderer diagram={h.diagram} title={h.title} />
                    <p dangerouslySetInnerHTML={{ __html: h.caption }} />
                  </article>
                ))}
              </div>
            </section>
          )}

          {p.limitations?.length > 0 && (
            <section id="limits" className="cs-sec">
              <h2 className="cs-h">
                <span>{String(sections.findIndex((s) => s[0] === 'limits') + 1).padStart(2, '0')}</span> Known limitations
              </h2>
              <p className="cs-note rv">Written the way a model card lists them: what isn’t measured, isn’t built, or isn’t true yet.</p>
              <ul className="limits">
                {p.limitations.map((l, i) => (
                  <li key={i} className="rv" style={{ '--d': i * 60 }}>
                    <span aria-hidden="true">!</span>
                    {l}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {gallery && (
            <section id="screens" className="cs-sec">
              <h2 className="cs-h">
                <span>{String(sections.findIndex((s) => s[0] === 'screens') + 1).padStart(2, '0')}</span> Screens
              </h2>
              <div className="cs-gallery">
                <Media project={gallery} />
              </div>
              <ul className="cs-thumbs" aria-label="All screens, full size">
                {shots.map((src, i) => (
                  <li key={src}>
                    <button type="button" onClick={() => openShot(i)} aria-label={`Open screen ${i + 1} of ${shots.length} full size`} data-cursor="Open">
                      <img src={src} alt="" loading="lazy" decoding="async" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section id="stack" className="cs-sec">
            <h2 className="cs-h">
              <span>{String(sections.length).padStart(2, '0')}</span> Stack &amp; links
            </h2>
            <ul className="chips cs-chips">
              {p.chips.map((c) => (
                <li className="chip" key={c}>
                  {c}
                </li>
              ))}
            </ul>
            <div className="cs-endlinks">
              {p.links.map((l) =>
                l.internal ? (
                  <a key={l.href} className="lnk" href={`/${l.href}`} data-pt="the decision">
                    {l.label} →
                  </a>
                ) : (
                  <a key={l.href} className="lnk" href={l.href} target="_blank" rel="noopener noreferrer">
                    {l.label} ↗
                  </a>
                )
              )}
            </div>
          </section>
        </div>
      </div>

      {/* the page hands over to the next case study instead of stopping */}
      <nav className="cs-end wrap" aria-label="Continue">
        <a
          href={next ? `/work/${next.slug}` : '/#work'}
          data-pt={next ? next.name : 'the index'}
          className="cs-handoff"
          data-cursor={next ? 'Next' : 'Index'}
        >
          <span className="k">{next ? `Next case study · ${String(num + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}` : 'That was the last one'}</span>
          <span className="n">{next ? next.name : 'All work'}</span>
          <span className="h">{next ? next.hook : 'Every project, one query away.'}</span>
          {next && (
            <span className="m">
              <b>{next.headline.metric}</b> {next.headline.label}
            </span>
          )}
          <span className="go" aria-hidden="true">
            →
          </span>
        </a>
        <div className="cs-end-row">
          {prev ? (
            <a href={`/work/${prev.slug}`} data-pt={prev.name} className="lnk">
              ← {prev.name}
            </a>
          ) : (
            <span />
          )}
          <a href="/#work" data-pt="the index" className="lnk">
            All work
          </a>
        </div>
      </nav>

      {shots.length > 0 && (
        <dialog
          ref={light}
          className="cs-light"
          aria-label={`${p.name} screens`}
          data-lenis-prevent
          onClick={(e) => e.target === e.currentTarget && light.current.close()}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') step(1);
            if (e.key === 'ArrowLeft') step(-1);
          }}
        >
          <figure>
            <img src={shots[shot]} alt={`${p.name}, screen ${shot + 1} of ${shots.length}`} />
            <figcaption>
              <button type="button" className="lnk" onClick={() => step(-1)} aria-label="Previous screen">
                ← Prev
              </button>
              <span>
                {String(shot + 1).padStart(2, '0')} / {String(shots.length).padStart(2, '0')}
              </span>
              <button type="button" className="lnk" onClick={() => step(1)} aria-label="Next screen">
                Next →
              </button>
              <button type="button" className="lnk" onClick={() => light.current.close()} autoFocus>
                Close
              </button>
            </figcaption>
          </figure>
        </dialog>
      )}
    </main>
  );
}
