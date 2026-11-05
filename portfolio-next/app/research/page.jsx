import Paper from '../components/research/Paper';
import { PAPERS, EMAIL } from '../data/research';
import { CARD } from '../data/profile';

export const metadata = {
  title: 'Research — Adnan Mashrur Sadad',
  description:
    'First-author research on evaluating retrieval-augmented and Text-to-SQL systems: answers that are well-formed and cited, and still wrong.',
};

const row = (k) => CARD.find(([key]) => key === k)?.[1];

/* The page to send a prospective supervisor: who, trained where, working on
   what, the two papers in full, and how to get a manuscript. Same data as the
   home section's L5 (data/research.js) and the model card (data/profile.js). */
export default function ResearchPage() {
  const profile = [
    ['Researcher', 'Adnan Mashrur Sadad'],
    ['Degree', row('Trained on')],
    ['Results', row('Scores')],
    ['Focus', 'Evaluating retrieval-augmented and Text-to-SQL systems — when an answer is well-formed and cited, and still wrong'],
    ['Industry', row('Fine-tuned at')],
  ];
  return (
    <main id="main" className="rp" data-field="5" data-field-dim="0.4" style={{ '--lc': 'var(--d5)' }}>
      <div className="wrap">
        <a className="lnk rp-back" href="/#research" data-pt="the index">
          <span aria-hidden="true">←</span> Index
        </a>

        <header className="rp-head">
          <p className="layer rv">
            <span className="bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <b>L5</b> Evaluation <span className="rule" aria-hidden="true" /> <span className="layer-gloss">research</span>
          </p>
          <h1 className="display rp-h rv">Research on knowing when an answer shouldn’t be trusted.</h1>
          <p className="lede rv" style={{ '--d': 120 }}>
            First-author work on evaluating retrieval-augmented and Text-to-SQL systems — the same instinct as my
            engineering work, pointed at the models themselves: an answer can be well-formed and cited, and still be
            wrong in a way nothing flags.
          </p>
        </header>

        <dl className="rp-profile rv" style={{ '--d': 180 }}>
          {profile.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <section className="rp-papers" aria-label="Papers">
          {PAPERS.map((p, i) => (
            <Paper key={p.id} paper={p} n={i + 1} full />
          ))}
        </section>

        <section className="rp-cta rv" aria-labelledby="rp-cta-h">
          <h2 className="h2" id="rp-cta-h">
            For a manuscript, a question about the method, or a conversation about supervision.
          </h2>
          <div className="rp-cta-row">
            <a className="btn btn-solid" href={`mailto:${EMAIL}?subject=${encodeURIComponent('Research')}`}>
              {EMAIL}
            </a>
            <a className="btn" href="/Adnan_Sadad_AI_ML_Resume_LaTeX.pdf" target="_blank" rel="noopener">
              Résumé · PDF
            </a>
            <a className="btn" href="https://github.com/sadad54" target="_blank" rel="noopener noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
