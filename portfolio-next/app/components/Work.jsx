'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Shot, { imgs } from './Shot';

const EASE = [0.2, 0, 0, 1];

/* =========================================================================
   TIER 1 — FEATURED (§2.1). Five projects, full treatment: a sticky left
   column carrying name + one headline number, a scrolling right column with
   the bullets, chips, links and code panel.
   ========================================================================= */
function Featured({ id, name, year, kind, metric, metricLabel, hook, shot, notes, chips, links, slab, children }) {
  return (
    <article className="feat" id={id} data-tech={chips.map((c) => c.toLowerCase()).join('|')}>
      <div className="feat-aside">
        <div className="feat-aside-in">
          <p className="feat-meta">
            <span>{year}</span>
            <span className="sep">/</span>
            <span>{kind}</span>
          </p>
          <h3 className="feat-name">{name}</h3>
          <p className="feat-metric">
            <span className="feat-metric-v">{metric}</span>
            <span className="feat-metric-k">{metricLabel}</span>
          </p>
        </div>
      </div>

      <div className="feat-body">
        <p className="feat-hook">{hook}</p>
        {shot}
        <ul className="notes reveal-group">
          {notes.map((n, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: n }} />
          ))}
        </ul>
        <ul className="chips reveal">
          {chips.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        {links.length > 0 && (
          <div className="proj-links reveal">
            {links.map((l) =>
              l.internal ? (
                <a className="lnk pointer" key={l.href} href={l.href}>
                  {l.label} &darr;
                </a>
              ) : (
                <a className="lnk" key={l.href} href={l.href} target="_blank" rel="noopener">
                  {l.label} ↗
                </a>
              )
            )}
          </div>
        )}
        {slab && (
          <div className="feat-slab reveal">
            <p className="slab-cap">{slab.cap}</p>
            <div className="slab" dangerouslySetInnerHTML={{ __html: slab.html }} />
          </div>
        )}
        {children}
      </div>
    </article>
  );
}

/* =========================================================================
   TIER 2 — COMPACT (§2.1 / §6.4). One dense row each. Click expands inline —
   bullets + code panel — with only one row open at a time. Real <button
   aria-expanded>, keyboard-operable.
   ========================================================================= */
function CompactRow({ row, open, onToggle }) {
  const reduceMotion = useReducedMotion();
  return (
    <li
      className={`crow${open ? ' is-open' : ''}`}
      id={row.id}
      data-tech={row.chips.map((c) => c.toLowerCase()).join('|')}
    >
      <button
        type="button"
        className="crow-head"
        aria-expanded={open}
        aria-controls={`${row.id}-panel`}
        onClick={onToggle}
      >
        <span className="crow-main">
          <span className="crow-name">{row.name}</span>
          <span className="crow-hook">{row.hook}</span>
        </span>
        <span className="crow-side">
          <span className="crow-meta">
            {row.year} <span className="sep">·</span> {row.kind}
          </span>
          <span className="crow-tech">{row.tech.join(' · ')}</span>
        </span>
        <span className="crow-plus" aria-hidden="true">
          +
        </span>
      </button>

      {/* Panel is always in the DOM — readable with JS disabled and to crawlers.
          framer-motion emits height:0 into the SSR markup; the `html:not(.js)`
          rule in globals.css forces it open again for no-JS. Once hydrated, JS
          collapses it (initial=false) and animates the accordion on toggle. */}
      <motion.div
        className="crow-panel"
        id={`${row.id}-panel`}
        role="region"
        aria-label={`${row.name} details`}
        aria-hidden={!open}
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.83, 0, 0.17, 1] }}
      >
        <div className="crow-panel-in">
          <ul className="notes">
            {row.notes.map((n, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: n }} />
            ))}
          </ul>
          <div>
            <ul className="chips">
              {row.chips.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            {row.links.length > 0 && (
              <div className="proj-links">
                {row.links.map((l) =>
                  l.internal ? (
                    <a className="lnk pointer" key={l.href} href={l.href}>
                      {l.label} &darr;
                    </a>
                  ) : (
                    <a className="lnk" key={l.href} href={l.href} target="_blank" rel="noopener">
                      {l.label} ↗
                    </a>
                  )
                )}
              </div>
            )}
            {row.slab && (
              <div className="feat-slab">
                <p className="slab-cap">{row.slab.cap}</p>
                <div className="slab" dangerouslySetInnerHTML={{ __html: row.slab.html }} />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </li>
  );
}

const COMPACT = [
  {
    id: 'p-finscout',
    name: 'FinScout',
    hook: 'Company research with a score attached.',
    year: '2026',
    kind: 'Agent + evaluation',
    tech: ['Python', 'FastAPI', 'Evals'],
    chips: ['Python', 'Agentic retrieval', 'Eval harness', 'FastAPI'],
    notes: [
      'A public-markets research agent that gathers filings, financials and news on a listed company and writes a brief a human can actually check.',
      '<b>Built harness-first.</b> The evaluation suite (retrieval precision, citation faithfulness, answer completeness) exists before the features do, so every change gets measured instead of eyeballed.',
      'The point of the project isn&rsquo;t the agent. It&rsquo;s being able to say what changed when I changed something.',
    ],
    links: [{ label: 'Repository', href: 'https://github.com/sadad54/finscout' }],
    slab: {
      cap: 'Harness first',
      html:
        '<span class="c">## eval/run.py</span><br>\nretrieval_precision@5 &nbsp;<span class="k">&rarr; tracked</span><br>\n' +
        'citation_faithfulness <span class="k">&rarr; tracked</span><br>\ncompleteness&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="k">&rarr; tracked</span><br>\n' +
        'latency_p95&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="k">&rarr; tracked</span><br><br>\n<span class="c"># no merge without a delta</span>',
    },
  },
  {
    id: 'p-fraud',
    name: 'Financial Fraud Detection',
    hook: '0.17% of transactions are fraud. Find them anyway.',
    year: '2026',
    kind: 'Imbalanced classification',
    tech: ['XGBoost', 'SMOTE', 'FastAPI'],
    chips: ['Python', 'XGBoost', 'Scikit-learn', 'SMOTE', 'FastAPI', 'Pydantic', 'Streamlit'],
    notes: [
      'Ensemble of <b>Random Forest, XGBoost and Isolation Forest</b> over 284,807 real transactions: supervised signal plus an unsupervised outlier view for the patterns labels don&rsquo;t cover.',
      'Handled the 0.17% positive rate with SMOTE and class-weighted loss, and <b>reported PR-AUC as the headline number</b> &mdash; at this imbalance ROC-AUC flatters everything.',
      'Modular inference service in FastAPI with Pydantic validation and OpenAPI docs, plus a Streamlit dashboard for batch scanning and explainability.',
    ],
    links: [],
    slab: {
      cap: 'Why PR-AUC',
      html:
        'positives&nbsp;&nbsp;<span class="s">492</span> / <span class="s">284,807</span> &middot; base rate <span class="s">0.17%</span><br>\n' +
        '<span class="c"># a model predicting "never fraud"</span><br>\n' +
        'accuracy&nbsp;&nbsp;<span class="r">99.83%</span> <span class="c">&larr; useless</span><br>\n' +
        'recall&nbsp;&nbsp;&nbsp;&nbsp;<span class="r">0.00%</span><br><br>\n' +
        '<span class="c"># so the harness reports</span><br>\nPR-AUC&nbsp;&nbsp;&nbsp;&nbsp;<span class="k">0.89</span>',
    },
  },
  {
    id: 'p-expensense',
    name: 'ExpenSense',
    hook: 'Point your camera at a receipt. Get a categorised expense.',
    year: '2024',
    kind: 'Mobile + OCR',
    tech: ['Flutter', 'Firebase', 'TensorFlow'],
    chips: ['Flutter', 'Dart', 'Firebase', 'TensorFlow', 'OCR'],
    notes: [
      'Automated personal expense tracking with an <b>OCR + TensorFlow classification pipeline</b>, reaching 85% categorisation precision across 500+ receipts a month.',
      'Cut manual entry to seconds with a Flutter app on a Firebase backend that scans, classifies and logs receipts in real time.',
      'Grounded academically: the pipeline underpins a published undergraduate thesis on OCR-based personal finance tracking for income-tax readiness.',
    ],
    links: [{ label: 'Repository', href: 'https://github.com/sadad54/expensense' }],
    slab: {
      cap: 'Pipeline',
      html:
        'receipt photo<br>\n&nbsp;&nbsp;&rarr; OCR text extraction<br>\n&nbsp;&nbsp;&rarr; TensorFlow category classifier<br>\n' +
        '&nbsp;&nbsp;&rarr; amount + merchant + category<br>\n&nbsp;&nbsp;&rarr; synced to Firebase<br><br>\n<span class="c"># 85% precision &middot; 500+ receipts / mo</span>',
    },
  },
  {
    id: 'p-aura',
    name: 'Aura',
    hook: 'Mood tracking that actually tells you something.',
    year: '2026',
    kind: 'AI wellness',
    tech: ['React', 'TypeScript', 'Gemini API'],
    chips: ['React', 'TypeScript', 'Vite', 'Gemini API', 'Recharts'],
    notes: [
      'A full wellness experience &mdash; <b>mood tracking, guided journaling, meditation timers, ambient soundscapes and daily routines</b> &mdash; designed to make self-care a five-second habit.',
      'Wired in the <b>Gemini API</b> to read mood, journal and habit history and surface AI-generated correlations and affirmations, instead of logging numbers nobody revisits.',
      'A themeable, component-driven UI in React and TypeScript on Vite, with custom charts, animated progress rings and mood orbs.',
    ],
    links: [],
    slab: {
      cap: 'Insight loop',
      html:
        'mood + journal + habit log<br>\n&nbsp;&nbsp;&rarr; Gemini API<br>\n&nbsp;&nbsp;&rarr; pattern correlation<br>\n&nbsp;&nbsp;&rarr; affirmation / nudge',
    },
  },
  {
    id: 'p-fitsync',
    name: 'FitSync',
    hook: 'A personal AI stylist that knows what’s actually in your closet.',
    year: '2026',
    kind: 'Mobile + AI',
    tech: ['Flutter', 'FastAPI', 'Groq API'],
    chips: ['Flutter', 'Dart', 'FastAPI', 'Supabase', 'Groq API', 'Hugging Face'],
    notes: [
      'You scan your own wardrobe into a digital closet, and outfit suggestions get generated against <b>what you actually own</b>, not a generic catalogue.',
      '<b>Virtual try-on</b> lets you preview a suggested outfit on yourself before committing, with a history to revisit past try-ons.',
      'A community layer &mdash; style challenges, a trend feed, store integration &mdash; so it&rsquo;s social and shoppable, not solitary generation.',
      'Modular recommendation backend over <b>Groq and Hugging Face</b>, returning suggestions in under two seconds.',
    ],
    links: [],
    slab: {
      cap: 'Recommendation loop',
      html:
        'closet item added<br>\n&nbsp;&nbsp;&rarr; Groq + Hugging Face recommendation<br>\n&nbsp;&nbsp;&rarr; generated outfit<br>\n&nbsp;&nbsp;&rarr; virtual try-on preview<br><br>\n<span class="c"># suggestion returned in &lt; 2s</span>',
    },
  },
];

export default function Work() {
  const [openRow, setOpenRow] = useState(null);

  // spec §6.5 — Toolkit chip clicks broadcast a tech; matching projects stay
  // lit, the rest drop back.
  useEffect(() => {
    function onFilter(e) {
      const tech = e.detail?.tech || null;
      const items = document.querySelectorAll('#work [data-tech]');
      let anyMatch = false;
      items.forEach((el) => {
        const list = (el.getAttribute('data-tech') || '').split('|');
        if (tech && list.includes(tech)) anyMatch = true;
      });
      items.forEach((el) => {
        const list = (el.getAttribute('data-tech') || '').split('|');
        const match = !!tech && anyMatch && list.includes(tech);
        el.classList.toggle('is-dim', !!tech && anyMatch && !match);
        el.classList.toggle('is-match', match);
      });
    }
    window.addEventListener('portfolio:filter', onFilter);
    return () => window.removeEventListener('portfolio:filter', onFilter);
  }, []);

  return (
    <section className="band" id="work" aria-label="Selected work">
      <div className="wrap">
        <p className="eyebrow reveal">Selected work</p>
        <h2 className="title reveal">
          Things I built, and the decision inside each one worth talking about.
        </h2>

        <div className="feat-list">
          <Featured
            id="p-proofhire"
            name="ProofHire"
            year="2026"
            kind="AI engineering / Full stack"
            metric="5 ms"
            metricLabel="retrieval p50 · 20k rows · local benchmark"
            hook="Your code is the evidence. Every application claim has to earn its place."
            notes={[
              'Turns authorized GitHub repositories into a <b>provenance-aware evidence graph</b>, tracing technical claims to source files and commits. Incremental sync processes changed artifacts and marks stale evidence.',
              '<b>Hybrid retrieval + LLM reranking</b> map job requirements to Strong / Partial / Gap / Unknown coverage. Two-stage indexed candidate generation made retrieval 80× faster at 20k rows in the local benchmark.',
              'Generates resumes and cover letters with <b>claim-level citations, deterministic fact guards and bounded repair</b>. Unsupported claims are blocked from export; rendered PDFs undergo parse-back and overflow checks.',
              'Built end to end: <b>Next.js / React, FastAPI, PostgreSQL + pgvector and Redis workers</b>, with an interactive evidence constellation, streaming progress, typed API contracts and Playwright accessibility checks.',
            ]}
            chips={['Python', 'FastAPI', 'Next.js', 'React', 'TypeScript', 'PostgreSQL', 'pgvector', 'Redis', 'RAG', 'Docker', 'Playwright']}
            links={[
              { label: 'Repository', href: 'https://github.com/sadad54/ResumeGitProject' },
              { label: 'Trace a claim', href: '#slide-proofhire', internal: true },
            ]}
          />

          <Featured
            id="p-driftline"
            name="Driftline"
            year="2026"
            kind="Streaming ML / MLOps"
            metric="+97.8%"
            metricLabel="PR-AUC recovered after drift"
            hook="Six months of silent model decay, caught and reversed by the pipeline itself."
            notes={[
              'Replays six months of real IEEE-CIS transaction data through <b>Redpanda (Kafka API)</b> and <b>PyFlink</b>, computing stateful 1h / 24h / 7d velocity aggregations exactly as a live system would see them, not a static notebook.',
              'A <b>graph-augmented entity model</b> (605K nodes, ~8M edges, PyTorch Geometric GraphSAGE) runs alongside XGBoost, with leakage boundaries tested, not assumed.',
              '<b>Drift-triggered retraining.</b> PSI/KS statistical tests catch the decay; when performance collapsed mid-stream to a PR-AUC of 0.2635, automatic retraining recovered it to 0.5211 &mdash; a 97.8% jump in one week.',
              'Documents its own failures alongside the wins: GraphSAGE ensemble underperformance, an 8.66% online/offline feature-store skew, and ONNX export limits on categorical XGBoost.',
            ]}
            chips={[
              'Python', 'Redpanda', 'PyFlink', 'Feast', 'XGBoost', 'PyTorch Geometric',
              'FastAPI', 'ONNX Runtime', 'MLflow', 'Kubernetes', 'Prometheus / Grafana',
            ]}
            links={[{ label: 'Repository', href: 'https://github.com/sadad54/driftline' }]}
            slab={{
              cap: 'Drift & recovery',
              html:
                'baseline PR-AUC&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="k">0.4761</span><br>\n' +
                'after 6mo, no retrain&nbsp;<span class="r">0.3680</span> <span class="c">&larr; decays silently</span><br><br>\n' +
                'mid-stream collapse&nbsp;&nbsp;&nbsp;<span class="r">0.2635</span><br>\n' +
                'after retraining&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="k">0.5211</span> <span class="c">&larr; +97.8% in one week</span><br><br>\n' +
                '<span class="c"># training/serving skew: 8.66%, found and documented</span>',
            }}
          />

          <Featured
            id="p-interviewpilot"
            name="InterviewPilot"
            year="2026"
            kind="Full stack + LLM"
            metric="0"
            metricLabel="dropped requests under schema repair"
            hook="A mock interview that pushes back."
            shot={
              <Shot
                dataShots={imgs('interviewpilot', 9)}
                alt="InterviewPilot: a mock-interview session with the live transcript on the left and rubric scores for technical accuracy, clarity and depth on the right."
              />
            }
            notes={[
              'You answer out loud. <b>Whisper-large-v3</b> transcribes it, <b>Llama 3.3 70B</b> scores it against a rubric (technical accuracy, clarity, depth) and returns schema-validated JSON.',
              '<b>The repair loop.</b> When the model breaks its own output schema, the invalid response is fed back with the validation error attached and the model is asked to fix it. No dropped requests, no half-parsed answers reaching the UI.',
              '<b>The follow-up agent.</b> It reads what you actually said and decides whether to probe deeper or move on, the way a real interviewer does. Not a fixed question list.',
              'FastAPI + SQLAlchemy behind React and TypeScript. Conventional commits, a pytest suite with Groq calls fully mocked, a Dockerfile, and GitHub Actions on every push.',
            ]}
            chips={[
              'Python', 'FastAPI', 'SQLAlchemy', 'React', 'TypeScript', 'Groq API',
              'Whisper-large-v3', 'Llama 3.3 70B', 'Docker', 'GitHub Actions', 'pytest',
            ]}
            links={[{ label: 'Repository', href: 'https://github.com/sadad54/interviewpilot' }]}
            slab={{
              cap: 'Evaluator contract',
              html:
                '<span class="c"># enforced on every response</span><br>\n{<br>\n' +
                '&nbsp;&nbsp;<span class="k">"technical_accuracy"</span>: <span class="s">0..5</span>,<br>\n' +
                '&nbsp;&nbsp;<span class="k">"clarity"</span>: <span class="s">0..5</span>,<br>\n' +
                '&nbsp;&nbsp;<span class="k">"depth"</span>: <span class="s">0..5</span>,<br>\n' +
                '&nbsp;&nbsp;<span class="k">"evidence"</span>: <span class="s">str[]</span>,<br>\n' +
                '&nbsp;&nbsp;<span class="k">"follow_up"</span>: <span class="s">str | null</span><br>\n}<br>\n' +
                '<span class="c">// invalid &rarr; repair &rarr; revalidate</span>',
            }}
          />

          <Featured
            id="p-wc26"
            name="WC26 Predictor"
            year="2026"
            kind="ML + simulation"
            metric="10,000"
            metricLabel="tournaments simulated per forecast"
            hook="Every path to the trophy, simulated ten thousand times."
            shot={
              <Shot
                dataShots={imgs('wc26-predictor', 20)}
                alt="WC26 Predictor dashboard: tournament-path probability curves, a group-pressure matrix, and a predicted-versus-actual audit panel."
              />
            }
            notes={[
              'Feature pipeline over historical results, FIFA rankings, rolling form, squad proxies, head-to-head history and match context, so a new fixture can be scored the moment the draw changes.',
              'Models match outcome, expected goals and scoreline probability, then <b>Monte Carlo simulates the full tournament</b>: group qualification, knockout paths, finalists, champion odds.',
              'Dashboard with tournament-path curves, group-pressure matrices, player-form impact views and a <b>predicted-vs-actual audit</b>, because a forecast nobody scores afterwards isn&rsquo;t a forecast.',
            ]}
            chips={['Python', 'XGBoost', 'FastAPI', 'React', 'TypeScript', 'Recharts', 'Monte Carlo']}
            links={[
              { label: 'Repository', href: 'https://github.com/sadad54/worldcup_predictor' },
              { label: 'The trade-off behind this', href: '#slide-sim', internal: true },
            ]}
          />

          <Featured
            id="p-mindhive"
            name="Mindhive Chatbot"
            year="2025"
            kind="RAG + Text2SQL"
            metric="200+"
            metricLabel="documents in the RAG test set"
            hook="Five turns deep and still on topic."
            shot={
              <Shot
                dataShots={imgs('mindhive-chatbot', 9)}
                alt="Mindhive chatbot: a multi-turn conversation about ZUS outlets, resolving a follow-up question against the previous answer."
              />
            }
            notes={[
              'Multi-turn conversational agent with <b>stateful memory and intent-based planning</b>, holding context across three to five related turns instead of treating each message as new.',
              'Two FastAPI microservices: a <b>RAG</b> product-knowledge endpoint tested against 200+ documents, and a <b>Text2SQL</b> outlet-query endpoint with injection protection on generated queries.',
              'Shipped as a complete repository: OpenAPI specification, test suite, architecture diagrams and a hosted demo. Built as a technical assessment, delivered like a product.',
            ]}
            chips={['FastAPI', 'RAG', 'Text2SQL', 'OpenAPI', 'Agentic planning']}
            links={[]}
            slab={{
              cap: 'Turn handling',
              html:
                'user &rarr; <span class="c">"outlets in PJ?"</span><br>\n&nbsp;&nbsp;intent: <span class="k">outlet_lookup</span> &rarr; Text2SQL<br><br>\n' +
                'user &rarr; <span class="c">"which opens earliest?"</span><br>\n&nbsp;&nbsp;<span class="s">resolves against prior result</span><br>\n&nbsp;&nbsp;intent: <span class="k">outlet_refine</span><br><br>\n' +
                'user &rarr; <span class="c">"is it halal certified?"</span><br>\n&nbsp;&nbsp;intent: <span class="k">product_rag</span>',
            }}
          />
        </div>

        <h3 className="work-subhead reveal">More work</h3>
        <ul className="compact-list">
          {COMPACT.map((row) => (
            <CompactRow
              key={row.id}
              row={row}
              open={openRow === row.id}
              onToggle={() => setOpenRow((cur) => (cur === row.id ? null : row.id))}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
