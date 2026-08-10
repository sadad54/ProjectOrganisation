'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.2, 0, 0, 1];
const viewport = { once: true, amount: 0.1, margin: '0px 0px -8% 0px' };

const rise = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

// Rail order matches DOM order of .proj articles below (highlighting matches by
// array position via IntersectionObserver, not by data-go id) — preserved from the
// original vanilla markup's own note.
const RAIL = [
  { go: 'p1', name: 'InterviewPilot', hook: 'Schema repair + eval loop' },
  { go: 'p2', name: 'WC26 Predictor', hook: '10k-run Monte Carlo sim' },
  { go: 'p3', name: 'Fraud Detection', hook: 'Imbalanced classification' },
  { go: 'p4', name: 'Mindhive Chatbot', hook: 'RAG + Text2SQL agent' },
  { go: 'p6', name: 'ExpenSense', hook: 'OCR + mobile pipeline' },
  { go: 'p7', name: 'Aura', hook: 'AI wellness, Gemini API' },
  { go: 'p5', name: 'FinScout', hook: 'Agentic research + eval harness', wip: true },
];

function imgs(dir, n) {
  return JSON.stringify(Array.from({ length: n }, (_, i) => `assets/screenshots/${dir}/${String(i + 1).padStart(2, '0')}.png`));
}

function imgsList(dir, files) {
  return JSON.stringify(files.map((f) => `assets/screenshots/${dir}/${f}`));
}

function Shot({ dataShots, slug, alt, mobileFit }) {
  return (
    <div className={`shot${mobileFit ? ' mobile-fit' : ''}`} data-shots={dataShots}>
      <img
        src={JSON.parse(dataShots)[0]}
        alt={alt}
        loading="lazy"
        onError={(e) => e.currentTarget.closest('.shot').classList.add('empty')}
      />
      <span className="shot-label">Screenshot: drop a file at assets/screenshots/{slug}.png</span>
      <motion.button
        className="shot-arrow prev"
        data-shot-prev
        aria-label="Previous screenshot"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        transition={{ duration: 0.15 }}
      >
        &larr;
      </motion.button>
      <motion.button
        className="shot-arrow next"
        data-shot-next
        aria-label="Next screenshot"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        transition={{ duration: 0.15 }}
      >
        &rarr;
      </motion.button>
      <div className="shot-dots" data-shot-dots></div>
    </div>
  );
}

function Tags({ tags }) {
  return (
    <div className="proj-head">
      {tags.map((t, i) => (
        <span key={i} className={`tag${t.live ? ' live' : ''}${t.wip ? ' wip' : ''}`}>{t.t}</span>
      ))}
    </div>
  );
}

export default function Work() {
  return (
    <section className="band" id="work">
      <div className="wrap">
        <motion.p className="eyebrow" initial="hidden" whileInView="show" viewport={viewport} variants={rise}>
          Selected work, seven builds
        </motion.p>
        <motion.h2 className="title" initial="hidden" whileInView="show" viewport={viewport} variants={rise}>
          Things I built, and the decision inside each one worth talking about.
        </motion.h2>

        <div className="work-grid">
          <WorkRail />
          <div className="panels">
            <motion.article
              className="proj"
              id="p1"
              whileHover={{ y: -4, transition: { duration: 0.3, ease: EASE } }}
            >
              <Tags tags={[{ t: 'Shipped', live: true }, { t: '2026' }, { t: 'Full stack + LLM' }]} />
              <h3 className="proj-name">InterviewPilot</h3>
              <p className="proj-hook">A mock interview that pushes back.</p>
              <Shot dataShots={imgs('interviewpilot', 9)} slug="interviewpilot" alt="InterviewPilot screenshot" />
              <div className="proj-body">
                <div>
                  <ul className="notes">
                    <li>You answer out loud. <b>Whisper-large-v3</b> transcribes it, <b>Llama 3.3 70B</b> scores it against a rubric (technical accuracy, clarity, depth) and returns schema-validated JSON.</li>
                    <li><b>The repair loop.</b> When the model breaks its own output schema, the invalid response is fed back with the validation error attached and the model is asked to fix it. No dropped requests, no half-parsed answers reaching the UI.</li>
                    <li><b>The follow-up agent.</b> It reads what you actually said and decides whether to probe deeper or move on, the way a real interviewer does. Not a fixed question list.</li>
                    <li>FastAPI + SQLAlchemy behind React and TypeScript. Conventional commits, a pytest suite with Groq calls fully mocked, a Dockerfile, and GitHub Actions on every push.</li>
                  </ul>
                  <ul className="chips">
                    <li>Python</li><li>FastAPI</li><li>SQLAlchemy</li><li>React</li><li>TypeScript</li><li>Groq API</li><li>Whisper-large-v3</li><li>Llama 3.3 70B</li><li>Docker</li><li>GitHub Actions</li><li>pytest</li>
                  </ul>
                  <div className="proj-links">
                    <a className="lnk" href="https://github.com/sadad54/interviewpilot">Repository ↗</a>
                    <span className="lnk demo is-disabled" aria-disabled="true">Demo coming soon</span>
                  </div>
                </div>
                <div>
                  <p className="slab-cap">Evaluator contract</p>
                  <div className="slab" dangerouslySetInnerHTML={{ __html:
                    '<span class="c"># enforced on every response</span><br>\n{<br>\n' +
                    '&nbsp;&nbsp;<span class="k">"technical_accuracy"</span>: <span class="s">0..5</span>,<br>\n' +
                    '&nbsp;&nbsp;<span class="k">"clarity"</span>: <span class="s">0..5</span>,<br>\n' +
                    '&nbsp;&nbsp;<span class="k">"depth"</span>: <span class="s">0..5</span>,<br>\n' +
                    '&nbsp;&nbsp;<span class="k">"evidence"</span>: <span class="s">str[]</span>,<br>\n' +
                    '&nbsp;&nbsp;<span class="k">"follow_up"</span>: <span class="s">str | null</span><br>\n}<br>\n' +
                    '<span class="c">// invalid → repair → revalidate</span>'
                  }} />
                </div>
              </div>
            </motion.article>

            <motion.article
              className="proj"
              id="p2"
              whileHover={{ y: -4, transition: { duration: 0.3, ease: EASE } }}
            >
              <Tags tags={[{ t: 'Shipped', live: true }, { t: '2026' }, { t: 'ML + simulation' }]} />
              <h3 className="proj-name">WC26 Predictor</h3>
              <p className="proj-hook">Every path to the trophy, simulated ten thousand times.</p>
              <Shot dataShots={imgs('wc26-predictor', 20)} slug="wc26-predictor" alt="WC26 Predictor dashboard screenshot" />
              <div className="proj-body">
                <div>
                  <ul className="notes">
                    <li>Feature pipeline over historical results, FIFA rankings, rolling form, squad proxies, head-to-head history and match context, assembled so a new fixture can be scored the moment the draw changes.</li>
                    <li>Models match outcome, expected goals and scoreline probability, then <b>Monte Carlo simulates the full tournament</b>: group qualification, knockout paths, finalists, champion odds.</li>
                    <li>Dashboard with tournament-path curves, group-pressure matrices, player-form impact views and a <b>predicted-vs-actual audit</b>, because a forecast nobody scores afterwards isn&rsquo;t a forecast.</li>
                  </ul>
                  <ul className="chips"><li>Python</li><li>XGBoost</li><li>FastAPI</li><li>React</li><li>TypeScript</li><li>Recharts</li><li>Monte Carlo</li></ul>
                  <div className="proj-links"><a className="lnk" href="https://github.com/sadad54/worldcup_predictor">Repository ↗</a> <span className="lnk demo is-disabled" aria-disabled="true">Demo coming soon</span></div>
                </div>
                <div>
                  <p className="slab-cap">Simulation loop</p>
                  <div className="slab" dangerouslySetInnerHTML={{ __html:
                    '<span class="k">for</span> sim <span class="k">in</span> range(<span class="s">10_000</span>):<br>\n' +
                    '&nbsp;&nbsp;groups = play_group_stage(model)<br>\n&nbsp;&nbsp;bracket = seed_knockouts(groups)<br>\n' +
                    '&nbsp;&nbsp;champion = play_out(bracket)<br>\n&nbsp;&nbsp;tally[champion] += <span class="s">1</span><br>\n<br>' +
                    '<span class="c"># → per-team title probability</span><br>\n<span class="c"># → per-team path-to-final curve</span>'
                  }} />
                </div>
              </div>
            </motion.article>

            <motion.article
              className="proj"
              id="p3"
              whileHover={{ y: -4, transition: { duration: 0.3, ease: EASE } }}
            >
              <Tags tags={[{ t: 'Shipped', live: true }, { t: '2026' }, { t: 'Imbalanced classification' }]} />
              <h3 className="proj-name">Financial Fraud Detection</h3>
              <p className="proj-hook">0.17% of transactions are fraud. Find them anyway.</p>
              <Shot dataShots={imgs('fraud-detection', 10)} slug="fraud-detection" alt="Fraud detection dashboard screenshot" />
              <div className="proj-body">
                <div>
                  <ul className="metrics">
                    <div><span className="v" data-count="0.98" data-dec="2">0.00</span><span className="k">ROC-AUC</span></div>
                    <div><span className="v" data-count="0.89" data-dec="2">0.00</span><span className="k">PR-AUC</span></div>
                    <div><span className="v" data-count="284807" data-dec="0">0</span><span className="k">Transactions</span></div>
                  </ul>
                  <ul className="notes">
                    <li>Ensemble of <b>Random Forest, XGBoost and Isolation Forest</b> over 284,807 real transactions: supervised signal plus an unsupervised outlier view for the patterns labels don&rsquo;t cover.</li>
                    <li>Handled the 0.17% positive rate with SMOTE and class-weighted loss, and <b>reported PR-AUC as the headline number</b>. At this imbalance ROC-AUC flatters everything; precision-recall is the metric that tells you the truth.</li>
                    <li>Modular inference service in FastAPI with Pydantic validation and OpenAPI docs, plus a Streamlit dashboard for batch scanning and explainability.</li>
                  </ul>
                  <ul className="chips"><li>Python</li><li>XGBoost</li><li>Scikit-learn</li><li>SMOTE</li><li>FastAPI</li><li>Pydantic</li><li>Streamlit</li></ul>
                  <div className="proj-links">
                    <span className="lnk is-disabled" aria-disabled="true">Repository coming soon</span>
                    <span className="lnk demo is-disabled" aria-disabled="true">Demo coming soon</span>
                  </div>
                </div>
                <div>
                  <p className="slab-cap">Why PR-AUC</p>
                  <div className="slab" dangerouslySetInnerHTML={{ __html:
                    'positives&nbsp;&nbsp;<span class="s">492</span> / <span class="s">284,807</span><br>\nbase rate <span class="s">0.17%</span><br><br>\n' +
                    '<span class="c"># a model predicting "never fraud"</span><br>\naccuracy&nbsp;&nbsp;<span class="r">99.83%</span> <span class="c">← useless</span><br>\n' +
                    'recall&nbsp;&nbsp;&nbsp;&nbsp;<span class="r">0.00%</span><br><br>\n<span class="c"># so the harness reports</span><br>\nPR-AUC&nbsp;&nbsp;&nbsp;&nbsp;<span class="k">0.89</span>'
                  }} />
                </div>
              </div>
            </motion.article>

            <motion.article
              className="proj"
              id="p4"
              whileHover={{ y: -4, transition: { duration: 0.3, ease: EASE } }}
            >
              <Tags tags={[{ t: 'Delivered', live: true }, { t: '2025' }, { t: 'RAG + Text2SQL' }]} />
              <h3 className="proj-name">Mindhive Chatbot Assessment</h3>
              <p className="proj-hook">Five turns deep and still on topic.</p>
              <Shot dataShots={imgs('mindhive-chatbot', 9)} slug="mindhive-chatbot" alt="Mindhive ZUS chatbot screenshot" />
              <div className="proj-body">
                <div>
                  <ul className="notes">
                    <li>Multi-turn conversational agent with <b>stateful memory and intent-based planning</b>, holding context across three to five related turns instead of treating each message as new.</li>
                    <li>Two FastAPI microservices: a <b>RAG</b> product-knowledge endpoint tested against 200+ documents, and a <b>Text2SQL</b> outlet-query endpoint with injection protection on generated queries.</li>
                    <li>Shipped as a complete repository: OpenAPI specification, test suite, architecture diagrams and a hosted demo. Built as a technical assessment, delivered like a product.</li>
                  </ul>
                  <ul className="chips"><li>FastAPI</li><li>RAG</li><li>Text2SQL</li><li>OpenAPI</li><li>Agentic planning</li></ul>
                  <div className="proj-links"><a className="lnk" href="https://github.com/sadad54/chatbotZUS">Repository ↗</a> <span className="lnk demo is-disabled" aria-disabled="true">Demo coming soon</span></div>
                </div>
                <div>
                  <p className="slab-cap">Turn handling</p>
                  <div className="slab" dangerouslySetInnerHTML={{ __html:
                    'user &rarr; <span class="c">"outlets in PJ?"</span><br>\n&nbsp;&nbsp;intent: <span class="k">outlet_lookup</span> &rarr; Text2SQL<br><br>\n' +
                    'user &rarr; <span class="c">"which opens earliest?"</span><br>\n&nbsp;&nbsp;<span class="s">resolves against prior result</span><br>\n&nbsp;&nbsp;intent: <span class="k">outlet_refine</span><br><br>\n' +
                    'user &rarr; <span class="c">"is it halal certified?"</span><br>\n&nbsp;&nbsp;intent: <span class="k">product_rag</span>'
                  }} />
                </div>
              </div>
            </motion.article>

            <motion.article
              className="proj"
              id="p6"
              whileHover={{ y: -4, transition: { duration: 0.3, ease: EASE } }}
            >
              <Tags tags={[{ t: 'Shipped', live: true }, { t: '2024' }, { t: 'Mobile + OCR' }]} />
              <h3 className="proj-name">ExpenSense</h3>
              <p className="proj-hook">Point your camera at a receipt. Get a categorised expense.</p>
              <Shot dataShots={imgs('expensense', 10)} slug="expensense" alt="ExpenSense app screenshot" mobileFit />
              <div className="proj-body">
                <div>
                  <ul className="metrics">
                    <div><span className="v" data-count="85" data-dec="0">0</span><span className="k">Categorisation precision %</span></div>
                    <div><span className="v" data-count="500" data-dec="0">0</span><span className="k">Receipts / month</span></div>
                  </ul>
                  <ul className="notes">
                    <li>Automated personal expense tracking by building an <b>OCR + TensorFlow classification pipeline</b>, reaching 85% categorisation precision across 500+ receipts scanned a month.</li>
                    <li>Cut manual expense entry to seconds with a Flutter mobile app on a Firebase backend that scans, classifies and logs receipts in real time.</li>
                    <li>Grounded the system academically: the pipeline underpins a published undergraduate thesis on OCR-based personal finance tracking for income tax readiness.</li>
                  </ul>
                  <ul className="chips"><li>Flutter</li><li>Dart</li><li>Firebase</li><li>TensorFlow</li><li>OCR</li></ul>
                  <div className="proj-links">
                    <a className="lnk" href="https://github.com/sadad54/expensense">Repository ↗</a>
                    <span className="lnk demo is-disabled" aria-disabled="true">Demo coming soon</span>
                  </div>
                </div>
                <div>
                  <p className="slab-cap">Pipeline</p>
                  <div className="slab" dangerouslySetInnerHTML={{ __html:
                    'receipt photo<br>\n&nbsp;&nbsp;&rarr; OCR text extraction<br>\n&nbsp;&nbsp;&rarr; TensorFlow category classifier<br>\n' +
                    '&nbsp;&nbsp;&rarr; amount + merchant + category<br>\n&nbsp;&nbsp;&rarr; synced to Firebase<br><br>\n<span class="c"># 85% precision · 500+ receipts / mo</span>'
                  }} />
                </div>
              </div>
            </motion.article>

            <motion.article
              className="proj"
              id="p7"
              whileHover={{ y: -4, transition: { duration: 0.3, ease: EASE } }}
            >
              <Tags tags={[{ t: 'Shipped', live: true }, { t: '2026' }, { t: 'AI wellness' }]} />
              <h3 className="proj-name">Aura</h3>
              <p className="proj-hook">Mood tracking that actually tells you something.</p>
              <Shot dataShots={imgs('aura', 9)} slug="aura" alt="Aura app screenshot" mobileFit />
              <div className="proj-body">
                <div>
                  <ul className="notes">
                    <li>Built a full wellness experience, <b>mood tracking, guided journaling, meditation timers, ambient soundscapes and daily routines</b>, designed to make self-care a five-second habit, not a chore.</li>
                    <li>Wired in the <b>Gemini API</b> to read mood, journal and habit history and surface AI-generated correlations and affirmations, instead of just logging numbers nobody looks at again.</li>
                    <li>Built a themeable, component-driven UI in React and TypeScript on Vite, with custom charts, animated progress rings and mood orbs, tuned for a calm, low-friction daily check-in.</li>
                  </ul>
                  <ul className="chips"><li>React</li><li>TypeScript</li><li>Vite</li><li>Gemini API</li><li>Recharts</li></ul>
                  <div className="proj-links">
                    <a className="lnk" href="https://github.com/sadad54/AuraFinalPF">Repository ↗</a>
                    <span className="lnk demo is-disabled" aria-disabled="true">Demo coming soon</span>
                  </div>
                </div>
                <div>
                  <p className="slab-cap">Insight loop</p>
                  <div className="slab" dangerouslySetInnerHTML={{ __html:
                    'mood + journal + habit log<br>\n&nbsp;&nbsp;&rarr; Gemini API<br>\n&nbsp;&nbsp;&rarr; pattern correlation<br>\n&nbsp;&nbsp;&rarr; affirmation / nudge<br><br>\n' +
                    '<span class="c">// repo is currently private,</span><br>\n<span class="c">// make public before sharing this link</span>'
                  }} />
                </div>
              </div>
            </motion.article>

            <motion.article
              className="proj"
              id="p5"
              whileHover={{ y: -4, transition: { duration: 0.3, ease: EASE } }}
            >
              <div className="proj-head"><span className="tag wip">In progress</span><span className="tag">2026</span><span className="tag">Agent + evaluation</span></div>
              <h3 className="proj-name">FinScout</h3>
              <p className="proj-hook">Company research with a score attached.</p>
              <Shot
                dataShots={imgsList('finscout', [
                  '01-ask-empty.png',
                  '02-ask-market-final.png',
                  '03-ask-risk-rag-final.png',
                  '04-research-empty.png',
                  '05-research-pipeline-inflight.png',
                  '06-research-final-top.png',
                  '07-research-final-fullpage.png',
                ])}
                slug="finscout"
                alt="FinScout research agent screenshot"
              />
              <div className="proj-body">
                <div>
                  <ul className="notes">
                    <li>A public-markets research agent that gathers filings, financials and news on a listed company and writes a brief a human can actually check.</li>
                    <li><b>Built harness-first.</b> The evaluation suite (retrieval precision, citation faithfulness, answer completeness) exists before the features do, so every change gets measured instead of eyeballed.</li>
                    <li>The point of the project isn&rsquo;t the agent. It&rsquo;s being able to say what changed when I changed something.</li>
                  </ul>
                  <ul className="chips"><li>Python</li><li>Agentic retrieval</li><li>Eval harness</li><li>FastAPI</li></ul>
                  <div className="proj-links">
                    <a className="lnk" href="https://github.com/sadad54/finscout">Repository ↗</a>
                    <span className="lnk demo is-disabled" aria-disabled="true">Demo coming soon</span>
                  </div>
                </div>
                <div>
                  <p className="slab-cap">Harness first</p>
                  <div className="slab" dangerouslySetInnerHTML={{ __html:
                    '<span class="c">## eval/run.py</span><br>\nretrieval_precision@5 &nbsp;<span class="k">→ tracked</span><br>\n' +
                    'citation_faithfulness <span class="k">→ tracked</span><br>\ncompleteness&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="k">→ tracked</span><br>\n' +
                    'latency_p95&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="k">→ tracked</span><br><br>\n<span class="c"># no merge without a delta</span>'
                  }} />
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkRail() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const projs = Array.from(document.querySelectorAll('.proj'));
    if (!projs.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = projs.indexOf(entry.target);
          if (i !== -1) setActive(i);
        });
      },
      { rootMargin: '-32% 0px -52% 0px' }
    );
    projs.forEach((p) => io.observe(p));
    return () => io.disconnect();
  }, []);

  function goTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  return (
    <aside className="work-rail">
      <ol id="workRail">
        {RAIL.map((item, i) => (
          <li key={item.go} className={i === active ? 'on' : undefined}>
            <motion.button
              data-go={item.go}
              onClick={() => goTo(item.go)}
              whileHover={{ x: 3 }}
              transition={{ duration: 0.18, ease: EASE }}
            >
              <span className="wr-text">
                <span className="wr-name">
                  {item.name} {item.wip && <span className="wr-status">WIP</span>}
                </span>
                <span className="wr-hook">{item.hook}</span>
              </span>
            </motion.button>
          </li>
        ))}
      </ol>
    </aside>
  );
}
