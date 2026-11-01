/* =========================================================================
   THE WORK INDEX — every project on the homepage lives in this one array.

   Adding a project is one object. Nothing else needs editing: the console
   list, the search index, the latent map (positions are computed from the
   text), the command palette and the skills graph all read from here.

   {
     slug:    'my-project'           unique id (also /work/<slug> if `page`)
     name:    'My Project'
     year:    '2026'                 optional
     kind:    'RAG + evaluation'     one-line category
     domain:  'llm' | 'ml' | 'mobile' | 'systems' | 'web'   (see DOMAINS)
     tier:    'case' | 'build' | 'archive'
              case    — flagship, has a walkthrough video + case-study page
              build   — shipped project, screenshots, no dedicated page
              archive — smaller build, text only (gets a generated glyph)
     hook:    one sentence, the reason to care
     badge:   'Gold Award · NALI 2026'   optional award line, shown beside the year
     metric:  { value: '0.89', label: 'PR-AUC at a 0.17% fraud rate' }  optional
     media:   { type: 'video', slug }                                     case studies
              { type: 'shots', dir, files: [...], frame: 'desktop' | 'phone' }
              null                                                        archive
     notes:   ['bullet (inline <b> allowed)', ...]
     stack:   ['Python', 'FastAPI', ...]   — also drives the skills graph edges
     links:   [{ label, href }]            — external links open in a new tab
     page:    true                          — has /work/<slug> (data/projects/)
   }

   Every number here is copied from the project's repo, README or résumé —
   nothing is estimated for the page.
   ========================================================================= */

export const DOMAINS = {
  llm: { label: 'LLM systems', short: 'LLM' },
  ml: { label: 'ML & data', short: 'ML' },
  mobile: { label: 'Mobile & vision', short: 'Mobile' },
  systems: { label: 'Systems & search', short: 'Systems' },
  web: { label: 'Client web', short: 'Web' },
};

const shots = (dir, n) => Array.from({ length: n }, (_, i) => `/assets/screenshots/${dir}/${String(i + 1).padStart(2, '0')}.png`);

export const WORK = [
  {
    slug: 'proofhire',
    name: 'ProofHire',
    year: '2026',
    kind: 'AI engineering / Full stack',
    domain: 'llm',
    tier: 'case',
    hook: 'Your code is the evidence. Every application claim has to earn its place.',
    metric: { value: '5 ms', label: 'retrieval p50 · 20k rows · local benchmark' },
    media: { type: 'video', slug: 'proofhire' },
    notes: [
      'Turns authorized GitHub repositories into a <b>provenance-aware evidence graph</b>, tracing technical claims to source files and commits.',
      '<b>Hybrid retrieval + LLM reranking</b> map job requirements to Strong / Partial / Gap / Unknown coverage. Indexed candidate generation took vector-plus-lexical p50 from 399 ms to 5 ms.',
      'Claim-level citations, <b>deterministic fact guards and bounded repair</b> — unsupported claims are blocked from export.',
    ],
    stack: ['Python', 'FastAPI', 'Next.js', 'React', 'TypeScript', 'PostgreSQL', 'pgvector', 'Redis', 'RAG', 'Docker', 'Playwright'],
    links: [{ label: 'Repository', href: 'https://github.com/sadad54/ResumeGitProject' }],
    page: true,
  },
  {
    slug: 'driftline',
    name: 'Driftline',
    year: '2026',
    kind: 'Streaming ML / MLOps',
    domain: 'ml',
    tier: 'case',
    hook: 'Six months of silent model decay, caught and reversed by the pipeline itself.',
    metric: { value: '+97.8%', label: 'PR-AUC recovered in one week after drift' },
    media: { type: 'video', slug: 'driftline' },
    notes: [
      'Replays six months of IEEE-CIS transactions through <b>Redpanda and PyFlink</b>, computing stateful 1h / 24h / 7d velocity features the way a live system would see them.',
      '<b>Drift-triggered retraining</b> behind a shadow-scored promotion gate: PR-AUC recovered from 0.2635 to 0.5211 after a mid-stream collapse.',
      'Served via ONNX / FastAPI on Google Cloud: <b>10,018 requests, zero failures, 380 ms p95</b> at 50 concurrent users.',
    ],
    stack: ['Python', 'Redpanda', 'PyFlink', 'Feast', 'XGBoost', 'PyTorch Geometric', 'FastAPI', 'ONNX Runtime', 'MLflow', 'Kubernetes', 'Prometheus / Grafana', 'Google Cloud'],
    links: [{ label: 'Repository', href: 'https://github.com/sadad54/driftline' }],
    page: true,
  },
  {
    slug: 'learn2unlock',
    name: 'Learn2Unlock',
    year: '2026',
    kind: 'Human-in-the-loop LLM · mobile',
    domain: 'llm',
    tier: 'case',
    badge: 'Gold Award · NALI 2026',
    hook: 'The AI drafts. A parent decides. Server code keeps score.',
    metric: { value: '0', label: 'minutes of screen time the model can award' },
    media: {
      type: 'shots',
      frame: 'phone',
      files: [
        '/assets/screenshots/learn2unlock/02-child-restriction.webp',
        '/assets/screenshots/learn2unlock/06-parent-ai-review.webp',
        '/assets/screenshots/learn2unlock/03-child-challenge.webp',
        '/assets/screenshots/learn2unlock/05-parent-generate.webp',
      ],
      alt: 'Learn2Unlock screens: the child’s challenge offer, a quiz question, AI question generation and the parent review queue',
    },
    notes: [
      'Kids earn screen time by answering short questions aligned to Malaysia’s <b>KSSR</b> primary curriculum — Years 1–6, Maths, Science, Bahasa Melayu and English. Parents set the rules.',
      '<b>Human-in-the-loop by design:</b> the LLM only drafts. Drafts arrive as schema-checked JSON, a deterministic server-side filter rejects unsafe, broken or duplicate ones, and a parent approves every survivor.',
      'Scoring, rewards and rules run in server code the model can’t reach — the phone only sends chosen answers. A working prototype: device pairing, app blocking and reports are still simulated.',
    ],
    stack: ['TypeScript', 'React Native', 'Expo', 'Node.js', 'SQLite', 'Zod', 'Groq', 'pnpm'],
    links: [{ label: 'Repository', href: 'https://github.com/sadad54/Learn2Unlock' }],
    page: true,
  },
  {
    slug: 'interviewpilot',
    name: 'InterviewPilot',
    year: '2026',
    kind: 'Full stack + LLM',
    domain: 'llm',
    tier: 'case',
    hook: 'A mock interview that pushes back.',
    metric: { value: '0', label: 'dropped requests under schema repair' },
    media: { type: 'video', slug: 'interviewpilot' },
    notes: [
      'You answer out loud. <b>Whisper-large-v3</b> transcribes, <b>Llama 3.3 70B</b> scores against a rubric and returns schema-validated JSON.',
      '<b>The repair loop:</b> when the model breaks its own schema, the invalid output goes back with the validation error attached. No half-parsed answers reach the UI.',
      'A follow-up agent decides whether to probe deeper or move on. 19 backend tests, 89% statement coverage, CI on every push.',
    ],
    stack: ['Python', 'FastAPI', 'SQLAlchemy', 'React', 'TypeScript', 'Groq API', 'Whisper-large-v3', 'Llama 3.3 70B', 'Docker', 'GitHub Actions', 'pytest'],
    links: [{ label: 'Repository', href: 'https://github.com/sadad54/interviewpilot' }],
    page: true,
  },
  {
    slug: 'wc26',
    name: 'WC26 Predictor',
    year: '2026',
    kind: 'ML + simulation',
    domain: 'ml',
    tier: 'case',
    hook: 'Every path to the trophy, simulated ten thousand times.',
    metric: { value: '10,000', label: 'tournaments simulated per forecast' },
    media: { type: 'video', slug: 'wc26' },
    notes: [
      'Feature pipeline over results, FIFA rankings, rolling form, squad proxies and head-to-head history, rescoring a fixture the moment the draw changes.',
      'Outcome, xG and scoreline models feed a <b>Monte Carlo simulation of the whole tournament</b> — groups, knockouts, champion odds.',
      'A <b>predicted-vs-actual audit</b> ships with the forecast, because a forecast nobody scores afterwards isn’t a forecast.',
    ],
    stack: ['Python', 'XGBoost', 'FastAPI', 'React', 'TypeScript', 'Recharts', 'Monte Carlo'],
    links: [{ label: 'Repository', href: 'https://github.com/sadad54/worldcup_predictor' }],
    page: true,
  },
  {
    slug: 'mindhive',
    name: 'Mindhive Chatbot',
    year: '2025',
    kind: 'RAG + Text2SQL',
    domain: 'llm',
    tier: 'case',
    hook: 'Five turns deep and still on topic.',
    metric: { value: '85.0%', label: 'Hit Rate@1 on a hand-labelled eval set' },
    media: { type: 'video', slug: 'mindhive' },
    notes: [
      'Multi-turn agent with <b>stateful memory and intent-based planning</b>, holding context across three to five related turns.',
      'One planner routes each turn to a <b>product-RAG</b> endpoint or an <b>outlet Text2SQL</b> endpoint with injection protection on generated SQL.',
      'Shipped like a product: OpenAPI spec, test suite, architecture diagrams and an honest eval baseline.',
    ],
    stack: ['Python', 'FastAPI', 'RAG', 'Text2SQL', 'OpenAPI', 'Agentic planning'],
    links: [{ label: 'Repository', href: 'https://github.com/sadad54/chatbotZUS' }],
    page: true,
  },
  {
    slug: 'finscout',
    name: 'FinScout',
    year: '2026',
    kind: 'Agent + evaluation',
    domain: 'llm',
    tier: 'build',
    hook: 'Company research with a score attached.',
    media: {
      type: 'shots',
      frame: 'desktop',
      files: [
        '/assets/screenshots/finscout/02-ask-market-final.png',
        '/assets/screenshots/finscout/05-research-pipeline-inflight.png',
        '/assets/screenshots/finscout/06-research-final-top.png',
        '/assets/screenshots/finscout/03-ask-risk-rag-final.png',
      ],
      alt: 'FinScout: an agent answering a market question with the tool call it made, and a research brief pipeline',
    },
    notes: [
      'A public-markets research agent that gathers filings, financials and news on a listed company and writes a brief a human can actually check.',
      '<b>Built harness-first:</b> retrieval precision, citation faithfulness and completeness are tracked before features land, so every change gets measured instead of eyeballed.',
      'The point isn’t the agent. It’s being able to say what changed when I changed something.',
    ],
    stack: ['Python', 'FastAPI', 'Agentic retrieval', 'Eval harness'],
    links: [{ label: 'Repository', href: 'https://github.com/sadad54/finscout' }],
  },
  {
    slug: 'fraud',
    name: 'Fraud Detection',
    year: '2026',
    kind: 'Imbalanced classification',
    domain: 'ml',
    tier: 'build',
    hook: '0.17% of transactions are fraud. Find them anyway.',
    metric: { value: '0.89', label: 'PR-AUC · 0.98 ROC-AUC · 284,807 transactions' },
    media: { type: 'shots', frame: 'desktop', files: shots('fraud-detection', 10), alt: 'Fraud detection dashboard: batch scanning and model explainability views' },
    notes: [
      'Ensemble of <b>Random Forest, XGBoost and Isolation Forest</b> over 284,807 real transactions — supervised signal plus an unsupervised outlier view.',
      'SMOTE and class-weighted loss for a 0.17% positive rate, with <b>PR-AUC as the headline number</b> — at this imbalance ROC-AUC flatters everything.',
      'FastAPI inference service with Pydantic validation, plus a Streamlit dashboard for batch scanning and explainability.',
    ],
    stack: ['Python', 'XGBoost', 'Scikit-learn', 'SMOTE', 'FastAPI', 'Pydantic', 'Streamlit'],
    links: [],
  },
  {
    slug: 'expensense',
    name: 'ExpenSense',
    year: '2024',
    kind: 'Mobile + OCR',
    domain: 'mobile',
    tier: 'build',
    hook: 'Point your camera at a receipt. Get a categorised expense.',
    metric: { value: '85%', label: 'categorisation precision · 500+ receipts a month' },
    media: { type: 'shots', frame: 'phone', files: shots('expensense', 10), alt: 'ExpenSense mobile app screens: receipt scanning and categorised expenses' },
    notes: [
      'An <b>OCR + TensorFlow classification pipeline</b> that turns receipt photos into categorised expenses in real time.',
      'Flutter app on a Firebase backend: scan, classify, log — manual entry cut to seconds.',
      'The pipeline underpins a published undergraduate thesis on OCR-based personal finance tracking for income-tax readiness.',
    ],
    stack: ['Flutter', 'Dart', 'Firebase', 'TensorFlow', 'OCR'],
    links: [{ label: 'Repository', href: 'https://github.com/sadad54/expensense' }],
  },
  {
    slug: 'aura',
    name: 'Aura',
    year: '2026',
    kind: 'AI wellness',
    domain: 'llm',
    tier: 'build',
    hook: 'Mood tracking that actually tells you something.',
    media: { type: 'shots', frame: 'phone', files: shots('aura', 9), alt: 'Aura wellness app screens: mood tracking, journaling and AI insights' },
    notes: [
      'Mood tracking, guided journaling, meditation timers, ambient soundscapes and daily routines — self-care as a five-second habit.',
      'The <b>Gemini API</b> reads mood, journal and habit history to surface correlations and affirmations instead of logging numbers nobody revisits.',
      'A themeable, component-driven React + TypeScript UI with custom charts, progress rings and mood orbs.',
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Gemini API', 'Recharts'],
    links: [],
  },
  {
    slug: 'fitsync',
    name: 'FitSync',
    year: '2026',
    kind: 'Mobile + AI',
    domain: 'mobile',
    tier: 'build',
    hook: 'A personal AI stylist that knows what’s actually in your closet.',
    metric: { value: '< 2 s', label: 'outfit suggestions from your own wardrobe' },
    media: {
      type: 'shots',
      frame: 'phone',
      files: [
        '/assets/screenshots/fitsync/02-home.png',
        '/assets/screenshots/fitsync/03-closet.png',
        '/assets/screenshots/fitsync/05-generate.png',
        '/assets/screenshots/fitsync/08-tryon.png',
        '/assets/screenshots/fitsync/10-community.png',
        '/assets/screenshots/fitsync/14-trends.png',
      ],
      alt: 'FitSync app screens: closet, outfit generation, virtual try-on and community',
    },
    notes: [
      'Scan your wardrobe into a digital closet; outfits are generated against <b>what you actually own</b>, not a catalogue.',
      '<b>Virtual try-on</b> previews a suggestion on you before you commit, with a history of past try-ons.',
      'Community challenges, a trend feed and store integration, on a <b>Groq + Hugging Face</b> recommendation backend.',
    ],
    stack: ['Flutter', 'Dart', 'FastAPI', 'Supabase', 'Groq API', 'Hugging Face'],
    links: [],
  },
  {
    slug: 'gravity-digital',
    name: 'Gravity Digital',
    year: '2026',
    kind: 'Client web · Next.js + WebGL',
    domain: 'web',
    tier: 'build',
    hook: 'An agency site whose 3D scene steps down a quality tier before a slow device drops frames.',
    metric: { value: '74', label: 'Vitest tests across 11 suites' },
    media: {
      type: 'shots',
      frame: 'desktop',
      files: ['/assets/screenshots/gravity-digital/01-home.webp'],
      alt: 'Gravity Digital homepage: “Perfectly gravitalized.” beside a 3D logo mark over a planet horizon',
    },
    notes: [
      'Full rebuild of a Dhaka creative and digital agency’s site on <b>Next.js 16</b> (App Router), React 19 and TypeScript — statically pre-rendered work and service pages, sitemap, robots and metadata.',
      'A <b>Three.js / WebGL</b> scene picks a quality tier (high / medium / low / off) per device from WebGL support, reduced motion, CPU cores, pointer type and viewport width, and <b>downgrades itself at runtime</b> when average frame time exceeds 22 ms over a 60-frame window.',
      'Lazy-loaded <b>Matter.js physics</b> that stops off-screen, <b>GSAP</b> scroll animation (ScrollTrigger, Flip, SplitText), a page-transition state machine, accessible Radix UI dialogs and reduced-motion fallbacks.',
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'Three.js', 'GSAP', 'Matter.js', 'Radix UI', 'Vitest', 'Vercel'],
    links: [
      { label: 'Live site', href: 'https://gravitydigitalbd.com' },
      { label: 'Repository', href: 'https://github.com/sadad54/gravity-digital-nextjs' },
    ],
  },
  {
    slug: 'modelznet',
    name: 'ModelzNet',
    year: '2026',
    kind: 'Client web · booking flows',
    domain: 'web',
    tier: 'build',
    hook: 'Booking, registration and a session archive for a Kuala Lumpur model network.',
    metric: { value: '564', label: 'photos in the session archive · 12 portfolios' },
    media: {
      type: 'shots',
      frame: 'desktop',
      files: ['/assets/screenshots/modelznet/01-home.webp'],
      alt: 'ModelzNet homepage: “Real models. Real portfolios.” with Book a spot and Register buttons',
    },
    notes: [
      'Next.js site for a Kuala Lumpur model network, with a <b>4-step booking flow</b> and a <b>5-step registration flow</b> that both take bank-transfer receipt uploads.',
      'A guest directory filterable by session date, and a <b>564-photo session archive</b> across 12 portfolios.',
      'A partnership-message composer and a referral programme section.',
    ],
    stack: ['Next.js', 'React', 'TypeScript', 'Vercel'],
    links: [{ label: 'Live site', href: 'https://www.modelznet.com' }],
  },
  {
    slug: 'loop-and-lug',
    name: 'Loop & Lug',
    year: '2026',
    kind: 'Client web · retail',
    domain: 'web',
    tier: 'build',
    hook: 'New and pre-owned watches in Dhaka and Kuala Lumpur, with the inspection laid out step by step.',
    metric: { value: '10', label: 'point inspection, walked through interactively' },
    media: {
      type: 'shots',
      frame: 'desktop',
      files: ['/assets/screenshots/loop-and-lug/01-home.webp'],
      alt: 'Loop & Lug homepage: “Watches, examined.” beside a close-up of a steel dress watch',
    },
    notes: [
      'Site for an independent new and pre-owned watch dealer in <b>Dhaka and Kuala Lumpur</b>.',
      'An interactive <b>10-point inspection walkthrough</b>, budget-based sourcing enquiries and a <b>WhatsApp</b> sell / trade-in path.',
      'SEO metadata — Open Graph and indexing — so shared links and search results read properly.',
    ],
    stack: ['Next.js', 'Vercel'],
    links: [{ label: 'Live site', href: 'https://loop-and-lug.vercel.app' }],
  },
  {
    slug: 'ai-eye',
    name: 'AI-Eye',
    kind: 'Computer vision · accessibility',
    domain: 'mobile',
    tier: 'archive',
    hook: 'Real-time text recognition, read aloud — computer vision for accessibility.',
    metric: { value: '92%', label: 'OCR accuracy · sub-second inference' },
    media: null,
    notes: ['Computer vision for accessibility: real-time text recognition and speech output at 92% OCR accuracy with sub-second inference.'],
    stack: ['Python', 'TensorFlow', 'CNN', 'OCR', 'TTS'],
    links: [],
  },
  {
    slug: 'halalxperience',
    name: 'HalalXperience',
    kind: 'Mobile · on-device ML',
    domain: 'mobile',
    tier: 'archive',
    hook: 'Scan a barcode, know if it’s halal.',
    media: null,
    notes: ['Barcode-based halal verification for shoppers, built on on-device ML Kit scanning.'],
    stack: ['Flutter', 'Firebase', 'ML Kit'],
    links: [],
  },
  {
    slug: 'clinic',
    name: 'Clinic Management System',
    kind: 'Enterprise Java',
    domain: 'systems',
    tier: 'archive',
    hook: 'Role-based records for a clinic, with queries tuned to stay fast.',
    media: null,
    notes: ['Role-based clinic records system with optimised SQL queries behind a servlet and Spring stack.'],
    stack: ['Java', 'Spring', 'MySQL', 'SQL'],
    links: [],
  },
  {
    slug: 'devpath',
    name: 'DevPath AI',
    kind: 'Knowledge systems · search',
    domain: 'systems',
    tier: 'archive',
    hook: 'A learning path that adapts to what a junior developer already knows.',
    media: null,
    notes: [
      'Adaptive skill assessment that generates a personalised learning path for junior developers, from knowledge representation through to state-space search.',
    ],
    stack: ['Knowledge representation', 'State-space search'],
    links: [],
  },
];

export const TIER_LABEL = { case: 'Case study', build: 'Project', archive: 'Archive' };
export const TIER_GROUP = { case: 'Case studies', build: 'Projects', archive: 'Archive' };
