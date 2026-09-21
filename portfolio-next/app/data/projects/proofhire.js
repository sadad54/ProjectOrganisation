export default {
  slug: 'proofhire',
  name: 'ProofHire',
  year: '2026',
  kind: 'AI engineering / Full stack',
  hook: 'Your code is the evidence. Every application claim has to earn its place.',
  headline: {
    metric: '5 ms',
    label: 'retrieval p50 · 20k rows · local benchmark',
  },
  overview: {
    summary:
      'ProofHire converts authorized GitHub repositories into a provenance-aware Evidence Graph, matches job requirements to that evidence through hybrid retrieval and reranking, and generates resumes and cover letters where every material claim carries a citation back to a specific file or commit.',
    bullets: [
      'Cut candidate-generation cost <b>80× at 20k rows</b> (measured via <code>benchmark_queries.py</code>) by rewriting hybrid retrieval as two-stage GIN/IVFFlat candidate generation instead of ranking the whole table by fused score.',
      'Reached <b>Lighthouse 100/100/100/100</b> on five routes (jobs page 98 perf) by building the Evidence Constellation graph UI with viewport virtualization.',
      'Blocked unsupported claims from every export by running a <b>deterministic fact guard</b> on employer/date/degree/metric claims after generation, not just at prompt time.',
    ],
  },
  story: {
    situation:
      "Resume-tailoring tools generally start from a resume — a page that captures only a sliver of a developer's real technical history, with generated claims that aren't traceable to anything concrete.",
    task: "Build a system where every material claim in a generated resume carries provenance back to a specific file, commit, or confirmed profile fact.",
    action:
      "Built a modular monolith (one FastAPI API plus one async Dramatiq worker, explicitly not microservices, because it's a single sequential builder and cross-service contract overhead isn't justified yet) that ingests authorized GitHub repos, extracts evidence with provenance, matches it to job requirements via hybrid retrieval and LLM reranking, and renders citation-carrying resumes with a deterministic fact guard behind them. Found and fixed real bugs along the way: a worker registering actors on a phantom broker after an import reorder (jobs sat unconsumed while reporting healthy), cross-event-loop connection reuse, retrieval silently ignoring its own indexes (fixed for an 80× speedup), a security-header scrubber gap, and 13 CRITICAL/HIGH CVEs traced to base-image toolchains and removed by not shipping them.",
    result:
      "A full pipeline — OAuth through PDF export — with security, observability and an accessibility-tested frontend built in from the start, and an explicit practice of writing down what's verified versus not yet measured, rather than blurring the two (see Limitations below).",
  },
  architecture: {
    summary:
      'A modular monolith, not microservices: one FastAPI API and one async worker share strong internal module boundaries, so a single builder can move fast without paying multi-service coordination costs.',
    diagram: {
      type: 'flow',
      steps: [
        { label: 'GitHub OAuth → repository sync', sub: 'tree, P0/P1/P2 classification, incremental re-sync' },
        { label: 'LLM evidence extraction', sub: 'changed artifacts only' },
        { label: 'Evidence Graph', sub: 'every node carries provenance' },
        { label: 'JD requirement extraction' },
        { label: 'Two-stage hybrid retrieval', sub: 'GIN + IVFFlat candidate generation' },
        { label: 'LLM rerank', sub: 'Strong / Partial / Gap / Unknown coverage' },
        { label: 'Resume / cover-letter generation' },
        { label: 'Deterministic fact guard', sub: 'blocks unsupported claims' },
        { label: 'Bounded repair → HTML/PDF render → parse-back validation → export' },
      ],
    },
  },
  highlights: [
    {
      title: 'Hybrid retrieval: before vs. after',
      caption:
        'Cut candidate-generation cost <b>80×</b> at 20k rows by replacing a full-table fused-score sort with two-stage GIN/IVFFlat retrieval.',
      diagram: {
        type: 'compare',
        before: {
          eyebrow: 'Before',
          label: 'Full-table fused-score sort',
          lines: ['Every row ranked by fused score', 'Postgres indexes unused', '1.0× — no speedup'],
        },
        after: {
          eyebrow: 'After',
          label: 'Two-stage candidate generation',
          lines: ['GIN + IVFFlat narrow candidates first', 'Fusion + rerank only on candidates', '80× faster @ 20k rows'],
        },
        diffLabel: '80×',
      },
    },
  ],
  limitations: [
    'Nothing is deployed or hosted yet — images build and scan clean in CI, but the export store is still local disk.',
    "No 100+ labelled JD benchmark has been run; the eval harness computes every metric (extraction F1, Recall@5, nDCG@5, unsupported-claim rate, verifier catch rate) but refuses to fabricate a missing measurement.",
    "No load testing beyond per-request latency — 10/50/100/250-user concurrency testing hasn't been run.",
    'Provider cost/token telemetry exists end-to-end but reports zero by construction against the mock provider, since no real API spend has been metered yet.',
    "A live walkthrough of the Chrome extension hasn't been recorded in this environment — Chrome blocks automation on chrome://extensions.",
  ],
  screenshots: {
    dir: 'proofhire',
    // Provisional count — update to match the real number of files once
    // screenshots are added to public/assets/screenshots/proofhire/. Until
    // then the Shot component's onError handler collapses this section
    // entirely (`.shot.empty`), so an inaccurate count causes no visible bug.
    count: 9,
    alt: "ProofHire's Evidence Constellation graph view with JD overlay and provenance rail",
  },
  chips: ['Python', 'FastAPI', 'Next.js', 'React', 'TypeScript', 'PostgreSQL', 'pgvector', 'Redis', 'RAG', 'Docker', 'Playwright'],
  links: [
    { label: 'Repository', href: 'https://github.com/sadad54/ResumeGitProject' },
    { label: 'Trace a claim', href: '#slide-proofhire', internal: true },
  ],
};
