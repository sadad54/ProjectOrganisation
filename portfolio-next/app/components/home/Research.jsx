'use client';

import Split from '../site/Split';
import Paper from '../research/Paper';
import { PAPERS } from '../../data/research';

/* L5 — research. Two first-author projects, each laid out as a paper: status,
   byline, summary, one numbered figure drawing its headline number to scale,
   and a way to get the manuscript. The full write-up lives at /research,
   which is the page to send a prospective supervisor. */
export default function Research() {
  return (
    <section className="research band" id="research" data-field="5" data-field-dim="0.55" aria-labelledby="research-h">
      <div className="wrap">
        <p className="layer rv">
          <span className="bars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <b>L5</b> Evaluation <span className="rule" aria-hidden="true" /> <span className="layer-gloss">research</span>
        </p>
        <div className="rs-head">
          <Split as="h2" id="research-h" className="display" text="Research on knowing when an answer shouldn’t be trusted." />
          <div className="rs-aside rv" style={{ '--d': 120 }}>
            <p className="lede">
              First-author work on evaluating retrieval-augmented and Text-to-SQL systems — the same instinct as the
              projects, pointed at the models themselves: an answer can be well-formed and cited, and still be wrong in
              a way nothing flags.
            </p>
            <a className="lnk" href="/research" data-pt="research">
              Full research page <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="papers">
          {PAPERS.map((p, i) => (
            <Paper key={p.id} paper={p} n={i + 1} delay={i * 120} />
          ))}
        </div>
      </div>
    </section>
  );
}
