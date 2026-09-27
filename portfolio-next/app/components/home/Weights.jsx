'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { WORK } from '../../data/work';
import { SKILL_GROUPS, ALSO } from '../../data/skills';
import Split from '../site/Split';
import { scrollToEl } from '../site/SmoothScroll';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/* L6 — the toolkit as a weight matrix between two layers: skills in, projects
   out. An edge exists wherever a project's stack uses the skill (derived
   from the data, never drawn by hand). At rest the whole matrix hangs there
   as texture; point at a skill and its weights fire, point at a project and
   you see what it was built from. Click a project to open it on the stage. */
export default function Weights() {
  const skills = useMemo(() => SKILL_GROUPS.flatMap((g, gi) => g.skills.map((s) => ({ ...s, g: gi, id: `${gi}-${s.n}` }))), []);
  const projects = WORK;
  const edges = useMemo(() => {
    const out = [];
    skills.forEach((s, si) =>
      projects.forEach((p, pi) => {
        const st = p.stack.map((x) => x.toLowerCase());
        if (s.m.some((m) => st.includes(m))) out.push([si, pi]);
      })
    );
    return out;
  }, [skills, projects]);
  const degS = useMemo(() => skills.map((_, i) => edges.filter((e) => e[0] === i).length), [skills, edges]);
  const degP = useMemo(() => projects.map((_, i) => edges.filter((e) => e[1] === i).length), [projects, edges]);

  const box = useRef(null);
  const [geo, setGeo] = useState(null);
  const [hs, setHs] = useState(null); // hovered skill index
  const [hp, setHp] = useState(null); // hovered project index
  const [pin, setPin] = useState(null); // clicked skill index

  const measure = useCallback(() => {
    const el = box.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    if (b.width < 700) {
      setGeo(null);
      return;
    }
    const S = Array.from(el.querySelectorAll('[data-s]')).map((n) => {
      const r = n.getBoundingClientRect();
      return [r.right - b.left, r.top + r.height / 2 - b.top];
    });
    const P = Array.from(el.querySelectorAll('[data-p]')).map((n) => {
      const r = n.getBoundingClientRect();
      return [r.left - b.left, r.top + r.height / 2 - b.top];
    });
    setGeo({ w: b.width, h: b.height, S, P });
  }, []);

  useIso(() => {
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box.current);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [measure]);

  const activeS = pin ?? hs;
  const litS = new Set();
  const litP = new Set();
  if (activeS != null) {
    litS.add(activeS);
    edges.forEach(([s, p]) => s === activeS && litP.add(p));
  } else if (hp != null) {
    litP.add(hp);
    edges.forEach(([s, p]) => p === hp && litS.add(s));
  }
  const any = litS.size > 0 || litP.size > 0;

  const openProject = (slug) => {
    window.dispatchEvent(new CustomEvent('work:select', { detail: { slug } }));
    scrollToEl(document.getElementById('work'), { offset: 0 });
  };

  const summary =
    activeS != null
      ? `${skills[activeS].n} — used in ${litP.size} project${litP.size === 1 ? '' : 's'}${litP.size ? ': ' + [...litP].map((i) => projects[i].name).join(', ') : ''}`
      : hp != null
        ? `${projects[hp].name} — built with ${litS.size} of these skills`
        : '';

  return (
    <section className="weights band" id="toolkit" data-field="5" data-field-dim="0.28" aria-labelledby="weights-h">
      <div className="wrap">
        <p className="layer rv">
          <span className="bars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <b>L6</b> Weights <span className="rule" aria-hidden="true" /> toolkit
        </p>
        <div className="wt-head">
          <Split as="h2" id="weights-h" className="display" text={['What I reach for, ', { t: 'wired to where I used it.', em: true }]} />
          <p className="lede rv" style={{ '--d': 120 }}>
            {skills.length} skills × {projects.length} projects, {edges.length} connections — each one a project whose
            stack actually uses the skill. Point at either side.
          </p>
        </div>

        <div className={`wt${any ? ' is-active' : ''}`} ref={box} onPointerLeave={() => (setHs(null), setHp(null))}>
          {geo && (
            <svg className="wt-svg" width={geo.w} height={geo.h} aria-hidden="true">
              {edges.map(([s, p], k) => {
                const a = geo.S[s];
                const b = geo.P[p];
                if (!a || !b) return null;
                const mx = (a[0] + b[0]) / 2;
                const hot = (activeS != null && s === activeS) || (hp != null && p === hp);
                return (
                  <path
                    key={k}
                    d={`M${a[0] + 6} ${a[1]} C${mx} ${a[1]}, ${mx} ${b[1]}, ${b[0] - 6} ${b[1]}`}
                    className={`wt-e${hot ? (activeS != null ? ' hot' : ' cool') : ''}`}
                    pathLength="1"
                  />
                );
              })}
            </svg>
          )}

          <div className="wt-skills">
            {SKILL_GROUPS.map((g, gi) => (
              <div className="wt-group" key={g.name}>
                <p className="wt-gname">{g.name}</p>
                <ul>
                  {g.skills.map((s) => {
                    const i = skills.findIndex((x) => x.id === `${gi}-${s.n}`);
                    return (
                      <li key={s.n}>
                        <button
                          type="button"
                          data-s={i}
                          className={`wt-s${litS.has(i) ? ' lit' : ''}${pin === i ? ' pin' : ''}${!degS[i] ? ' zero' : ''}`}
                          aria-pressed={pin === i}
                          onPointerEnter={() => setHs(i)}
                          onFocus={() => setHs(i)}
                          onBlur={() => setHs(null)}
                          onClick={() => setPin(pin === i ? null : i)}
                        >
                          {s.n}
                          <i>{degS[i]}</i>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            <p className="wt-also">
              <span>Also</span> {ALSO.join(' · ')}
            </p>
          </div>

          <div className="wt-gap" aria-hidden="true" />

          <ol className="wt-projects" aria-label="Projects">
            {projects.map((p, i) => (
              <li key={p.slug}>
                <button
                  type="button"
                  data-p={i}
                  className={`wt-p d-${p.domain}${litP.has(i) ? ' lit' : ''}`}
                  onPointerEnter={() => {
                    setHp(i);
                    setHs(null);
                  }}
                  onFocus={() => setHp(i)}
                  onBlur={() => setHp(null)}
                  onClick={() => openProject(p.slug)}
                  data-cursor="Open"
                >
                  <i className="wt-dot" aria-hidden="true" />
                  <span>{p.name}</span>
                  <em>{degP[i]}</em>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <p className="wt-live" aria-live="polite">
          {summary || 'Hover or focus a skill to see where it was used · click a project to open it'}
        </p>
      </div>
    </section>
  );
}
