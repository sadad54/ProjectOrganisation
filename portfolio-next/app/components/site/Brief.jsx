'use client';

import { useEffect, useRef } from 'react';
import { WORK } from '../../data/work';
import { CARD, PAPERS, AWARDS } from '../../data/profile';
import { copyText } from '../../lib/toast';

const EMAIL = 'adnanmashrursadad@gmail.com';
const row = (k) => CARD.find((r) => r[0] === k)?.[1];
// the strongest three: case studies that carry a headline number, in index order
const TOP = WORK.filter((p) => p.tier === 'case' && p.metric).slice(0, 3);

/* The short version: one screen for the reader who has a minute. Everything
   on it is read from the same data files as the long version, and it prints
   as a one-page handout. Opened from the hero, ⌘K, or the B key
   (window event `brief:open`). A native <dialog>: focus trap, Esc and the
   backdrop come from the platform. */
export default function Brief() {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    const open = () => {
      if (d.open) return;
      d.showModal();
      document.documentElement.classList.add('brief-open');
      window.__lenis?.stop();
    };
    const closed = () => {
      document.documentElement.classList.remove('brief-open');
      window.__lenis?.start();
    };
    const onClick = (e) => {
      if (e.target.closest?.('[data-brief]')) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener('brief:open', open);
    document.addEventListener('click', onClick);
    d.addEventListener('close', closed);
    return () => {
      window.removeEventListener('brief:open', open);
      document.removeEventListener('click', onClick);
      d.removeEventListener('close', closed);
      closed();
    };
  }, []);

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      className="brief"
      aria-labelledby="brief-h"
      data-lenis-prevent
      onClick={(e) => {
        if (e.target === e.currentTarget) close(); // the backdrop
      }}
    >
      <article className="brief-in">
        <header className="brief-top">
          <p className="brief-k">
            <b>TL;DR</b> the short version
          </p>
          <div className="brief-acts">
            <button type="button" className="lnk" onClick={() => window.print()}>
              Print / save PDF
            </button>
            <button type="button" className="lnk" onClick={close} autoFocus>
              Close <span aria-hidden="true">Esc</span>
            </button>
          </div>
        </header>

        <h2 className="brief-h" id="brief-h">
          Adnan Mashrur Sadad
        </h2>
        <p className="brief-role">
          {row('Role')} <span className="sep">·</span> {row('Base')}
        </p>
        <p className="brief-use">{row('Intended use')}.</p>

        <section aria-label="Strongest work">
          <h3 className="brief-sec">Strongest work</h3>
          <ul className="brief-work">
            {TOP.map((p) => (
              <li key={p.slug}>
                <a href={`/work/${p.slug}`} data-pt={p.name} onClick={close}>
                  <span className="bw-m">{p.metric.value}</span>
                  <span className="bw-l">{p.metric.label}</span>
                  <span className="bw-t">
                    {p.name} <span aria-hidden="true">→</span>
                  </span>
                  <span className="bw-kd">{p.kind}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <div className="brief-cols">
          <section aria-label="Research">
            <h3 className="brief-sec">Research</h3>
            <ul className="brief-list">
              {PAPERS.map((p) => (
                <li key={p.name}>
                  <b>{p.name}</b>
                  <span>
                    {p.role} · {p.status}
                  </span>
                  <span>{p.stat}</span>
                </li>
              ))}
            </ul>
          </section>
          <section aria-label="Background">
            <h3 className="brief-sec">Background</h3>
            <ul className="brief-list">
              <li>
                <b>Education</b>
                <span>{row('Trained on')}</span>
                <span>{row('Scores')}</span>
              </li>
              <li>
                <b>Experience</b>
                <span>{row('Fine-tuned at')}</span>
              </li>
              {AWARDS.map((a) => (
                <li key={a.title}>
                  <b>{a.title}</b>
                  <span>
                    {a.where}
                    {a.note ? ` · ${a.note}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="brief-foot">
          <a className="btn btn-solid" href="/Adnan_Sadad_AI_ML_Resume_LaTeX.pdf" download="Adnan-Sadad-Resume-AI-ML.pdf">
            Résumé · AI / ML <span className="arw down">↓</span>
          </a>
          <a className="btn" href="/Adnan_Sadad_SWE_Resume_LaTeX.pdf" download="Adnan-Sadad-Resume-Full-Stack.pdf">
            Résumé · Full-stack <span className="arw down">↓</span>
          </a>
          <button type="button" className="lnk" onClick={() => copyText(EMAIL, 'Email copied')}>
            {EMAIL}
          </button>
          <a className="lnk" href="https://www.linkedin.com/in/adnan-mashrur-sadad-87a45b237" target="_blank" rel="noopener noreferrer">
            LinkedIn ↗
          </a>
          <a className="lnk" href="https://github.com/sadad54" target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
        </footer>
      </article>
    </dialog>
  );
}
