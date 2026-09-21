# Project detail pages — design spec

Status: pending user review.
Scope: architectural (new route subsystem; no existing per-project page flow to extend).

## 1. Goal

Give each of the 5 "Featured" homepage projects (ProofHire, Driftline, InterviewPilot,
WC26 Predictor, Mindhive Chatbot) a dedicated detail page at `/work/[slug]` that tells
the full story of the project — what it does, how it works, why it exists, and what it
proves about the builder — using **only verified facts**: content already on the
homepage (`app/components/Work.jsx`), and content pulled directly from each project's
GitHub repository (READMEs, ADRs, build-status docs, metrics files, service code) via
the GitHub connector. No invented numbers, no invented claims.

The 5 "Compact" homepage projects (FinScout, Fraud Detection, ExpenSense, Aura,
FitSync) are explicitly **out of scope** for this pass — they keep their existing
expandable-row treatment on the homepage.

## 2. Non-goals

- No CMS / MDX / headless content system. Content lives in plain JS data files,
  matching the codebase's existing convention (`Work.jsx` uses inline JS objects).
- No merging/deduplication of homepage (`Work.jsx`) content into the new per-project
  data files in this pass. The homepage `Featured` cards keep their current content
  as-is; the detail pages are additive. (Noted as a future cleanup opportunity, not
  attempted here — avoids scope creep into an unrelated refactor.)
- No real demo videos. Every project gets a styled placeholder slot; the real files
  are dropped in later by the user.
- No fabricated metrics, screenshots, or diagrams for anything not evidenced by the
  homepage or the repos.

## 3. Route & data architecture

```
app/
  work/
    [slug]/
      page.jsx              -- thin: looks up project by slug, renders <ProjectPage/>
  data/
    projects/
      index.js               -- { proofhire, driftline, interviewpilot, wc26, mindhive }
      proofhire.js
      driftline.js
      interviewpilot.js
      wc26.js
      mindhive.js
  components/
    project/
      ProjectPage.jsx         -- the shared template; takes one project object, renders the whole page
      Hero.jsx                -- name/meta/headline metric + video placeholder
      VideoPlaceholder.jsx    -- styled 16:9 placeholder frame, data-video-slot="<slug>"
      MetricStrip.jsx         -- XYZ-format metric chips (Overview section)
      Story.jsx               -- STAR narrative (Situation/Task/Action/Result), prose
      Architecture.jsx        -- "How it works": prose + <ArchitectureDiagram/>
      Highlights.jsx          -- feature-specific diagrams + one-line XYZ captions
      LimitationsList.jsx     -- "Honest limitations / not yet done"
      ProjectNav.jsx          -- prev/next + back-to-work links
      diagrams/
        <ProjectSlug><Name>Diagram.jsx   -- one inline-SVG component per diagram
```

`generateStaticParams` in `app/work/[slug]/page.jsx` reads `Object.keys(projects)` from
`app/data/projects/index.js`. An unknown slug calls Next's `notFound()`.

`Work.jsx`'s existing `Featured` cards on the homepage each get their `name` wrapped in
a link to `/work/[slug]` (a small, additive change — not a rewrite of `Work.jsx`).

## 4. Content model

Each `app/data/projects/<slug>.js` file exports one object:

```js
{
  slug, name, year, kind,
  headline: { metric, label },          // the one big number, exactly as used in Work.jsx today
  hook,                                  // the existing one-line hook from Work.jsx
  overview: {
    summary,                             // 1-3 sentence "what it does"
    bullets: [ { x, y, z, text } ],       // XYZ-format impact bullets, real numbers only
  },
  story: { situation, task, action, result },   // STAR, prose paragraphs, no restated numbers in `result`
  architecture: {
    summary,                             // prose walking the diagram
    diagram: <ComponentRef>,             // which diagrams/*.jsx to render
  },
  highlights: [
    { title, diagram: <ComponentRef>, caption /* one XYZ-style line */ }
  ],
  limitations: [ string ],               // pulled verbatim/paraphrased from "Known Gaps" / "Open, and why" docs
  screenshots: { dir, count } | null,     // reuses existing Shot component; null where none exist (Driftline, ProofHire)
  chips: [...],                          // tech stack, reused from Work.jsx
  links: [ { label, href, internal } ],  // reused from Work.jsx
}
```

## 5. Per-project content (sourced; see citations)

### ProofHire (`sadad54/ResumeGitProject`)
- **Headline:** 5 ms retrieval p50 · 20k rows (local benchmark) — from Work.jsx, corroborated by
  BUILD_STATUS.md ("retrieval query p50 5 ms at 20k rows after an 80× fix").
- **Overview XYZ bullets:**
  - Cut retrieval latency from a full-table scan to 5ms p50 at 20k rows (measured via
    `apps/api/scripts/benchmark_queries.py`) by rewriting hybrid retrieval as two-stage
    GIN/IVFFlat candidate generation instead of ranking the whole table by fused score.
  - Reached Lighthouse 100/100/100/100 on 5 routes (jobs page 98 perf), 475–574 KiB initial JS,
    by building the Evidence Constellation graph UI with viewport virtualization.
  - Blocked unsupported claims from every export by running a deterministic fact guard
    (employer/date/degree/metric claims) after generation, not just at prompt time.
- **Story (STAR):**
  - *Situation:* resume-tailoring tools start from a resume — a page that captures a sliver of a
    developer's real technical history, with claims that aren't traceable to anything concrete.
  - *Task:* build a system where every material claim in a generated resume carries provenance
    back to a specific file, commit, or confirmed profile fact.
  - *Action:* built a modular monolith (ADR-0001 — one FastAPI API + one async Dramatiq worker,
    explicitly not microservices, because it's a single sequential builder and cross-service
    contract overhead isn't justified yet) that ingests authorized GitHub repos, extracts evidence
    with provenance, matches it to job requirements via hybrid retrieval + LLM rerank, and renders
    citation-carrying resumes with a deterministic fact guard behind them. Found and fixed real
    bugs along the way: a worker registering actors on a phantom broker after an import reorder
    (jobs sat unconsumed while reporting healthy), cross-event-loop connection reuse, retrieval
    silently ignoring its own indexes (fixed for an 80× speedup), a security-header scrubber gap,
    and 13 CRITICAL/HIGH CVEs traced to base-image toolchains and removed by not shipping them.
  - *Result (non-metric):* a full pipeline — OAuth through PDF export — with security,
    observability and an accessibility-tested frontend built in from the start, and an explicit
    practice of writing down what's "verified" versus "not yet measured" rather than blurring
    the two (see Limitations).
- **Architecture diagram:** OAuth → repo sync (tree/classification/incremental re-sync) →
  LLM evidence extraction (changed artifacts only) → Evidence Graph (provenance) → JD requirement
  extraction → two-stage hybrid retrieval (GIN+IVFFlat) → LLM rerank → Strong/Partial/Gap/Unknown
  coverage → resume/cover-letter generation → deterministic fact guard → bounded repair →
  HTML/PDF render → parse-back validation → export.
- **Highlight diagram:** hybrid retrieval before/after — "ranked whole table by fused score
  (1.0× — indexes unused)" vs. "two-stage candidate generation (80× faster @ 20k rows)."
  Caption (XYZ): *"Cut candidate-generation cost 80× at 20k rows by replacing a full-table
  fused-score sort with two-stage GIN/IVFFlat retrieval."*
- **Limitations (from BUILD_STATUS.md "Open, and why"):** nothing is deployed/hosted yet;
  no 100+ labelled JD benchmark run yet (eval harness exists, computes every metric, "refuses to
  fabricate a missing measurement"); no load testing beyond per-request latency; provider cost
  telemetry exists end-to-end but reports zero by construction against the mock provider; live
  Chrome-extension walkthrough not done (Chrome blocks automation on `chrome://extensions`).
- **Screenshots:** none yet (`public/assets/screenshots/proofhire` doesn't exist) — the existing
  ProofHireScene component + the internal `#slide-proofhire` link from the homepage stand in.
- **Links:** repo (existing), "Trace a claim" homepage anchor (existing).

### Driftline (`sadad54/driftline`)
- **Headline:** keep Work.jsx's "+97.8%" framed exactly as the README frames it — a **descriptive
  week-over-week change** (week 14 → 15, PR-AUC 0.2635 → 0.5211), explicitly not a causal claim.
  The page must carry the same honesty the README insists on.
- **Overview XYZ bullets:**
  - Reproduced a real, un-injected performance decay — PR-AUC fell from 0.4761 (first held-out
    month) to 0.3680 (month 6), a 22.7% relative decline — by replaying six months of real
    IEEE-CIS transactions through a live-shaped streaming pipeline instead of a static notebook.
  - Recovered a mid-replay collapse from PR-AUC 0.2635 to 0.5211 (week 14 → 15) by building a
    PSI/KS drift monitor that triggers retraining, gated by causal shadow-scoring against a
    held-out tail before promotion (first promotion: candidate 0.4802 vs. incumbent 0.2811 on the
    identical shadow holdout).
  - Found and quantified a real online/offline feature-store skew — 8.66% of sampled
    (card1, window) pairs disagreed between the Redis and Parquet paths — by testing Feast's
    two write paths against each other instead of assuming consistency.
- **Story (STAR):**
  - *Situation:* fraud models decay silently in production; most portfolio fraud projects
    demonstrate a single offline metric and stop there.
  - *Task:* build something that reproduces real drift, catches it automatically, and proves the
    recovery with a gate that can't be gamed by evaluating on the future.
  - *Action:* replayed real IEEE-CIS data through Redpanda/PyFlink for stateful 1h/24h/7d velocity
    features, trained a GraphSAGE entity-graph model (605K nodes, ~8M edges) alongside XGBoost with
    a tested leakage boundary, then wired PSI/KS drift detection to a retrain → shadow-score →
    promotion-gate loop logged to MLflow. Documented failures as deliverables, not embarrassments:
    the GraphSAGE+XGBoost ensemble never beat XGBoost alone (root-caused to naive equal-weight
    averaging and a genuinely undertrained 5-epoch CPU-only GNN); a random 80/20 split inflated
    PR-AUC by +0.2222 versus the honest time-ordered split; a load test against the k3d deployment
    produced a real HPA scale event (2→4 replicas) and a real kubelet-triggered restart from
    liveness probes failing under saturation. Several infra bugs were found by actually running
    things: a Parquet-durability bug under SIGTERM, a silently-dropped column, an orphaned JVM
    process outliving `timeout` by about an hour, a graph node-id collision, CI disk exhaustion
    from an unscoped CUDA torch install, and a silent numpy upgrade breaking XGBoost's `np.NaN`.
  - *Result (non-metric):* a project whose central claim — everything here is either real and
    measured or explicitly labeled "simulated" — held up under its own scrutiny, including when
    that scrutiny produced a negative result (the ensemble) instead of a positive one.
- **Architecture diagram:** replay_producer → Redpanda (topic `transactions.raw`, 6 partitions) →
  PyFlink windowed velocity aggregation (1h/24h/7d) → Feast online (Redis) / offline (Parquet)
  stores → scoring service (FastAPI + ONNX, XGBoost; GraphSAGE ensemble built but not wired into
  serving) → `transactions.scored` → monitoring (PSI/KS + Prometheus/Grafana) → drift-triggered
  retrain → causal shadow-score → promotion gate → MLflow → Kubernetes (k3d, HPA 2–6 replicas).
- **Highlight diagram:** the drift-triggered retrain / shadow-score / promotion-gate loop, since
  it's the project's actual novel mechanism, not just "a model that scores things."
  Caption (XYZ): *"Recovered PR-AUC from 0.2635 to 0.5211 by gating every retrain behind a causal
  shadow-score comparison against the incumbent, so a bad candidate can never self-promote."*
  Second highlight: the online/offline skew diagram (Redis write-per-event vs. Parquet
  200-row-buffered flush) — the "your metrics lied to you" finding.
- **Limitations (from README "Known Gaps"):** Spark alternative path not built; device/email graph
  entities not added; GraphSAGE not wired into serving; k3d manifests cover the scorer only;
  multi-worker uvicorn fix identified but not yet re-benchmarked; no demo video recorded (until
  this project page's placeholder is filled).
- **Screenshots:** none in `public/assets/screenshots/` — page relies on the architecture/highlight
  diagrams plus the existing `DriftlineScene` component.
- **Links:** repo (existing).

### InterviewPilot (`sadad54/interviewpilot`)
- **Headline:** 0 dropped requests under schema repair (Work.jsx) — corroborated by README's
  "Readiness validation: 19 backend tests passed; statement coverage 654/738 (88.62%, ~89%)."
- **Overview XYZ bullets:**
  - Reached 89% backend statement coverage (654/738 lines, 19 tests passing) by building the
    schema-repair and follow-up logic as isolated, independently testable services
    (`interview_service.py`, `followup_service.py`, `evaluation_service.py`).
  - Eliminated dropped or half-parsed responses by re-prompting the model with its own validation
    error attached whenever it broke the enforced JSON contract, instead of discarding the turn.
  - Kept the product usable with zero API key by writing deterministic fallback heuristics for
    text interviews, explicitly disclosed to the user as not measuring real technical correctness.
- **Story (STAR):**
  - *Situation:* most mock-interview demos are a fixed question list wrapped around a chatbot —
    nothing adapts to what the candidate actually says.
  - *Task:* build an interviewer that behaves like a stateful workflow (plan → ask → probe →
    complete → report), not a one-shot prompt.
  - *Action:* modeled the interview as an explicit state machine (Created → Planning → InProgress
    → Probe → Completed → Report), used Whisper-large-v3 for audio and Llama 3.3 70B via Groq for
    scoring against a rubric, and enforced the model's output against a strict schema
    (technical_accuracy/clarity/depth 0–5, evidence[], follow_up) with a repair loop instead of
    trusting the first response. Backed it with FastAPI + SQLAlchemy + Alembic, a pytest suite
    with all Groq calls mocked, Docker, and GitHub Actions on every push.
  - *Result (non-metric):* a full-lifecycle product — not a chatbot demo — that proves the
    specific skill of designing stateful workflows and schema-enforced LLM integration in a
    production-style backend, with its real limitations (deterministic-fallback scoring, untested
    live audio accuracy) stated rather than glossed over.
- **Architecture diagram:** the interview state machine, adapted directly from the README's own
  Mermaid diagram (Created → Planning → InProgress ⇄ Probe → Completed → Report).
- **Highlight diagram:** the schema-repair loop — model responds → schema validation → (if
  invalid) feed response + validation error back to the model → re-validate → only then does it
  reach the transcript. Caption (XYZ): *"Reached zero dropped requests under schema repair by
  feeding an invalid response back to the model with its own validation error attached, instead
  of discarding the turn."*
- **Limitations (from README "Verification and demo limitations"):** deterministic fallback scores
  are length-based, don't measure technical correctness, and are explicitly disclosed as such;
  frontend component unit tests (vitest) were attempted and dropped; live audio transcription
  accuracy hasn't been validated in this readiness pass; provider calls are mocked in CI, so live
  model quality is untested by the test suite itself.
- **Screenshots:** existing `public/assets/screenshots/interviewpilot` (9 images) — keep using
  the existing `Shot` carousel, unchanged.
- **Links:** repo (existing).

### WC26 Predictor (`sadad54/worldcup_predictor`)
- **Headline:** 10,000 tournaments simulated per forecast (Work.jsx; the Monte Carlo simulation
  mechanism is corroborated by the README's architecture section, though the exact "10,000" figure
  lives on the site already, not restated in the README itself — treated as an existing, presumably
  user-verified site claim, not something newly introduced here).
- **Overview XYZ bullets:**
  - Simulated the full tournament bracket 10,000 times per forecast by chaining match-outcome and
    scoreline probability models into a group-and-knockout Monte Carlo engine.
  - Made every prediction auditable after the fact by shipping a predicted-vs-actual audit view
    alongside the forecast, not just the forecast itself.
  - Kept live-score data honest by building a provider-aware ingestion chain (`football_data` →
    `api_football` → `community_worldcup` → cache) that surfaces provider health, cache age, and
    whether a number is official or community-sourced, instead of silently pretending one source
    always works.
- **Story (STAR):**
  - *Situation:* a simple "who wins" predictor doesn't demonstrate modelling depth, uncertainty
    handling, or product thinking — anyone can print a single number.
  - *Task:* build a system where the full pipeline is inspectable: how teams advance, where
    uncertainty concentrates, how squad-quality assumptions move the odds, and how the model's
    calls compare to what actually happened.
  - *Action:* engineered features from historical results, FIFA rankings, rolling form, squad
    proxies, head-to-head history and match context; trained outcome/xG/scoreline models; ran
    Monte Carlo tournament simulation for group qualification through champion odds; built a
    FastAPI backend and a React+TypeScript+Recharts dashboard with tournament-path curves, a
    group-pressure matrix, player-form impact views, and the audit panel; added provider-aware
    live-score ingestion with explicit fallback and health reporting.
  - *Result (non-metric):* a single project that touches feature engineering, applied ML,
    simulation, API design, and data-viz/frontend product work end to end — explicitly built to be
    inspected, not just trusted.
- **Architecture diagram:** raw data → cleaning/normalization → features (form, rankings, squad
  proxies, context, head-to-head) → match outcome + xG models → scoreline probability → group +
  knockout Monte Carlo simulation → dashboard CSV exports → FastAPI → React dashboard.
- **Highlight diagram:** the Monte Carlo fan-out — one simulated tournament path shown branching
  at each knockout round into group qualification → Ro32 → knockout → finalists → champion,
  repeated 10,000× per forecast. Caption (XYZ): *"Turned a single point prediction into a full
  uncertainty picture by running 10,000 simulated tournaments per forecast instead of one."*
- **Limitations (from README "Caveats"):** player-form is a conservative squad proxy, not full
  live club-form modelling; some live-score providers restrict 2026 tournament access by API plan;
  community live-score data is useful for demos but isn't official FIFA data.
- **Screenshots:** existing `public/assets/screenshots/wc26-predictor` (20 images) — reuse as-is.
- **Links:** repo (existing), "The trade-off behind this" homepage anchor (existing).

### Mindhive Chatbot (`sadad54/chatbotZUS`)
- **Headline correction:** replace "200+ documents in the RAG test set" (inaccurate) with the
  verified corpus size: **19 products + 17 outlets = 36 documents**, evaluated against a
  **20-query hand-labeled set**, per the actual run of `eval_retrieval_chatbotZUS.py`:
  overall Hit Rate@1/3/5 = **85.0%**, MRR = **0.8625**; product-RAG queries (n=10) Hit Rate@1/3/5
  = **70.0%**, MRR = **0.7249**; outlet-lookup queries (n=10) Hit Rate@1/3/5 = **100.0%**, MRR =
  **1.0000**. Retrieval method: TF-IDF (1–2 gram) + cosine similarity. *(This also needs a small
  correction on the homepage `Work.jsx` compact-row entry — flagged as a fix-along-the-way,
  confirmed with the user.)*
- **Overview XYZ bullets:**
  - Reached 85.0% Hit Rate@1 (MRR 0.8625) across a 20-query hand-labeled eval set by combining a
    product-RAG endpoint with an outlet-lookup Text2SQL endpoint behind one intent router.
  - Resolved every outlet-lookup query correctly (100% Hit Rate@1, MRR 1.0000) versus 70% on
    product queries — a real, honest gap the eval surfaces between structured Text2SQL lookups and
    fuzzier product-description retrieval, not smoothed over.
  - Protected the outlet-lookup endpoint from injection by validating/constraining generated SQL
    before execution (per Work.jsx's existing "injection protection on generated queries" claim).
  - Held context across 3-5 related turns by resolving follow-up questions against the prior
    answer instead of treating each message as new (e.g. "which opens earliest?" resolving against
    a prior outlet-lookup result).
- **Story (STAR):**
  - *Situation:* a take-home technical assessment asking for a chatbot that can answer both
    unstructured product questions and structured outlet-location questions.
  - *Task:* handle both question types through one coherent multi-turn agent, not two disconnected
    demos glued together, and ship it like a real product rather than a notebook.
  - *Action:* built two FastAPI-backed capabilities — a RAG endpoint over the product corpus and a
    Text2SQL endpoint over outlet data — behind a single intent-routing planner
    (`app/planner/agent.py`, `intent.py`) that decides per turn whether a question is a fresh
    product/outlet lookup or a refinement of the previous answer, and added a retrieval-quality
    eval harness (TF-IDF baseline, since the production sentence-transformer model isn't available
    in CI) to keep the RAG side honest rather than assumed-good.
  - *Result (non-metric):* delivered a complete repository — OpenAPI spec, test suite, architecture
    diagrams, hosted demo — for what was framed as an assessment, demonstrating the same
    engineering rigor (tests, docs, honest eval baselines) as a production submission.
- **Architecture diagram:** user query → intent planner (`planner/agent.py` + `intent.py`) →
  routes to either product-RAG (`rag/products_api.py`) or outlet Text2SQL (`outlets/text2sql.py`)
  → response (+ trace/logs) → conversational memory feeding the next turn's intent resolution.
- **Highlight diagram:** the existing "turn handling" slab from Work.jsx, redrawn as an SVG state
  flow (outlet_lookup → outlet_refine → product_rag across three turns), since it's the concrete
  proof of multi-turn intent resolution. Caption (XYZ): *"Resolved 100% of outlet-lookup queries
  correctly (MRR 1.0000) by routing structured location questions to Text2SQL instead of forcing
  every query through the same retrieval path."*
- **Limitations (from the eval script's own documented caveat, and the eval results themselves):**
  the committed retrieval eval uses TF-IDF + cosine similarity as "a conservative baseline, not an
  exact reproduction of production retrieval quality," because production uses a
  sentence-transformer embedding model not available in the CI environment that generated these
  numbers; product-RAG retrieval (70% Hit Rate@1) is measurably weaker than outlet Text2SQL (100%)
  on this baseline and is reported as-is rather than only showing the stronger number.
- **Screenshots:** existing `public/assets/screenshots/mindhive-chatbot` (9 images) — reuse as-is.
- **Links:** repo added — `https://github.com/sadad54/chatbotZUS` (currently missing from
  Work.jsx's `links: []`; will be added there too as part of this pass).

## 6. Shared UI components (implementation notes)

- **`VideoPlaceholder`**: a 16:9 box styled with the site's existing dark/paper theme tokens
  (`app/theme.js`, `globals.css`), a centered play-button glyph, the project name, and small
  caption text ("Demo video — coming soon"). Marked `data-video-slot="<slug>"` so swapping in the
  real `<video>`/embed later is a single, obvious edit. No motion/animation beyond what
  `Featured`/`CompactRow` already use (respecting `useReducedMotion`).
- **Diagrams**: inline SVG components, monospace/terminal palette matching `.slab`/`.feat-slab` in
  `globals.css` (same font stack, same accent colors), not photorealistic — consistent with the
  site's existing code-slab aesthetic rather than a new visual language.
- **`Shot` carousel**: reused unchanged from `Work.jsx` for the 3 projects with screenshots
  (InterviewPilot, WC26, Mindhive). ProofHire and Driftline render their existing scene components
  (`ProofHireScene`, `DriftlineScene`) in that slot instead, since no screenshot folders exist for
  them and re-purposing the existing built scenes avoids an empty section.
- **Consistency**: `ProjectPage` reuses existing CSS classes/patterns (`.feat-meta`, `.chips`,
  `.proj-links`, `.slab`, reveal-on-scroll classes) rather than introducing a parallel style system,
  so a visitor moving from the homepage to a project page sees continuity, not a different site.

## 7. Error handling / edge cases

- Unknown `/work/[slug]` → Next `notFound()` → existing 404 handling (or a minimal not-found page
  if none exists yet — to confirm during implementation).
- Missing screenshot directory: already handled by the existing `Shot` component's `onError`
  collapse-to-`.shot.empty` behavior; unaffected by this work.
- `next dev`'s AGENTS.md-regeneration behavior (per repo convention) is unrelated to this feature
  and not touched.

## 8. Testing / verification plan

- Every number, claim, and repo-structure statement on each page must trace to: (a) `Work.jsx`'s
  existing content, (b) a fetched README/ADR/metrics file, or (c) user-supplied input (Mindhive's
  eval numbers). No new invented figures.
- Manual pass per page: confirm headline metric matches Work.jsx exactly (no silent rewording of a
  number), confirm STAR "Result" paragraphs don't restate the XYZ numbers verbatim.
- Visual check in dev server: video placeholder renders correctly at mobile/desktop widths, diagram
  SVGs don't overflow on narrow viewports, dark/light theme (site's existing theme toggle) renders
  both correctly.
- Link check: every `/work/[slug]` route resolves; homepage `Featured` card names link correctly;
  prev/next nav cycles through all 5 without dead ends.

## 9. Open items

None. Mindhive's eval numbers (Hit Rate@k, MRR, corpus size) were supplied by the user from a real
run of `eval_retrieval_chatbotZUS.py` and are incorporated in §5 above. Every project's content in
this spec is fully sourced from Work.jsx, fetched repo documentation, or user-supplied real output.
