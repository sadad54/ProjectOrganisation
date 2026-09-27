import Split from '../site/Split';

/* L2 — the About section written as an ML model card: the format a model
   ships with to say what it was trained on, how it scores and what it's for.
   Every field is a fact from the résumé. The photo gets a detector pass. */
const CARD = [
  ['Model', 'adnan-m-sadad'],
  ['Role', 'Software engineer — applied AI & ML systems'],
  ['Base', 'Kuala Lumpur, Malaysia'],
  ['Trained on', 'B.Sc. Computer Science (Software Engineering) with Honours — MJIIT, Universiti Teknologi Malaysia, 2021–2026'],
  ['Scores', 'CGPA 3.43 / 4.00 · Dean’s List 2022/23 and 2025/26'],
  ['Fine-tuned at', 'Joget Inc. — Software Developer Intern, Oct 2024 – Mar 2025'],
  ['Research', 'First author: SAFE-RAG (under review, ALTA 2026) · Text-to-SQL answerability under schema evolution'],
  ['Benchmarks', 'Gold Medal & Best Video — myHCI-UX Student Design Challenge, Oct 2025'],
  ['Community', 'Secretary Treasurer, SOFEA Society — AI workshops for 200+ students'],
  ['Languages', 'English · Bengali · Bahasa Malaysia · Hindi / Urdu'],
  ['Intended use', 'AI systems that validate, repair and measure their own output'],
  ['License', 'Open — good conversations about interesting work are reason enough'],
];

const BOXES = [
  { x: 318, y: 262, w: 482, h: 818, label: 'person', conf: '0.98', hot: true },
  { x: 458, y: 270, w: 178, h: 240, label: 'face', conf: '0.97' },
  { x: 566, y: 84, w: 88, h: 230, label: 'landmark · KLCC', conf: '0.91' },
];

export default function About() {
  return (
    <section className="about band" id="about" data-field="2" aria-labelledby="about-h">
      <div className="wrap">
        <p className="layer rv">
          <span className="bars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <b>L2</b> Model card <span className="rule" aria-hidden="true" /> about me
        </p>
        <Split
          as="h2"
          id="about-h"
          className="display about-h"
          text={['Four years learning the theory, ', { t: 'one internship learning what breaks.', em: true }]}
        />

        <div className="about-grid">
          <figure className="about-photo rv" data-reveal>
            <div className="about-photo-in">
              <img src="/assets/portrait.jpeg" alt="Adnan Mashrur Sadad standing by a rooftop pool, with the Kuala Lumpur skyline behind him" width="1080" height="1080" loading="lazy" />
              <span className="scanline" aria-hidden="true" />
              <svg className="bbox" viewBox="0 0 1080 1080" preserveAspectRatio="none" aria-hidden="true">
                {BOXES.map((b, i) => (
                  <g key={b.label} className={`bb${b.hot ? ' hot' : ''}`} style={{ '--k': i }}>
                    <rect x={b.x} y={b.y} width={b.w} height={b.h} pathLength="1" />
                  </g>
                ))}
              </svg>
              {BOXES.map((b, i) => (
                <span
                  key={b.label}
                  className={`bb-tag${b.hot ? ' hot' : ''}`}
                  style={{ left: `${(b.x / 1080) * 100}%`, top: `${(b.y / 1080) * 100}%`, '--k': i }}
                  aria-hidden="true"
                >
                  {b.label} <b>{b.conf}</b>
                </span>
              ))}
            </div>
            <figcaption className="about-cap">
              <span>detector pass</span>
              <span>3 objects · KL 2026</span>
            </figcaption>
          </figure>

          <div className="card rv" data-reveal style={{ '--d': 120 }}>
            <div className="card-head">
              <span>
                <b>Model card</b> · adnan-m-sadad
              </span>
              <span className="card-rev">rev 2026.09</span>
            </div>
            <dl className="card-rows">
              {CARD.map(([k, v], i) => (
                <div className="card-row" key={k} style={{ '--r': i }}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="card-foot">
              <span className="ok">✓</span> {CARD.length} fields · every one checkable against the résumé
            </div>
          </div>
        </div>

        <div className="about-bio">
          <p className="rv">
            I studied software engineering at <b>MJIIT, Universiti Teknologi Malaysia</b> in Kuala Lumpur, where the
            thesis was an OCR pipeline for personal finance tracking and income-tax readiness. The coursework taught
            me how systems are supposed to work.
          </p>
          <p className="rv" style={{ '--d': 100 }}>
            Six months at <b>Joget Inc.</b> taught me how they actually break: shipping workflow automations and UI
            components clients used in production, integrating REST services someone else owns, and sitting in sprint
            reviews where a merge has consequences. That’s the half I build for now.
          </p>
        </div>
      </div>
    </section>
  );
}
