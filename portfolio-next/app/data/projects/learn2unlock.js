export default {
  slug: 'learn2unlock',
  name: 'Learn2Unlock',
  year: '2026',
  kind: 'Human-in-the-loop LLM · mobile',
  badge: 'Gold Award · NALI 2026',
  hook: 'The AI drafts. A parent decides. Server code keeps score.',
  // which field formation sits behind this page (lib/neural/formations.js)
  field: 5,
  headline: {
    metric: '0',
    label: 'minutes of screen time the model can award',
  },
  // no walkthrough video yet — the hero samples the app screens in instead
  media: {
    type: 'shots',
    frame: 'phone',
    files: [
      '/assets/screenshots/learn2unlock/02-child-restriction.webp',
      '/assets/screenshots/learn2unlock/06-parent-ai-review.webp',
      '/assets/screenshots/learn2unlock/03-child-challenge.webp',
      '/assets/screenshots/learn2unlock/05-parent-generate.webp',
    ],
    alt: 'Learn2Unlock child and parent app screens: the challenge offer, a quiz question, AI question generation and the parent review queue',
  },
  overview: {
    summary:
      'Learn2Unlock lets children earn screen time by answering short questions aligned to Malaysia’s KSSR primary curriculum — Years 1–6, in Mathematics, Science, Bahasa Melayu and English, with questions in English or Bahasa Melayu. Parents set the rules, and an LLM helps them write questions. The design question was where that model is allowed to sit.',
    bullets: [
      '<b>The model only drafts.</b> An open-weight model (<b>openai/gpt-oss-20b</b>, served by Groq) writes question drafts that enter as <b>pending_review</b> and stay invisible to the child.',
      'Every draft passes <b>schema-constrained JSON</b> at the API boundary and a <b>deterministic server-side filter</b> before a parent sees it; <b>parent approval</b> is the only path into the active question bank.',
      '<b>Separation of authority:</b> scoring, rewards, balance updates and rules run in server code the model can’t reach. The Groq key stays on the server and never ships in a mobile bundle.',
      'Gold Award at the <b>NALI 2026</b> (New Academia Learning Innovation) Exhibition & Competition, Universiti Teknologi Malaysia — a team award.',
    ],
  },
  story: {
    situation:
      'Parental-control apps mostly block: timers and lockouts that make the parent the bad guy and teach the child nothing. Answer-to-unlock apps exist, but their questions don’t follow the Malaysian syllabus, parents don’t have time to write their own, and they don’t trust AI-written questions they can’t check.',
    task:
      'Use an LLM to take the question-writing load off parents, without giving the model any authority over what a child sees, how an answer is marked, or how much screen time is earned.',
    action:
      'Built a TypeScript pnpm monorepo: a parent app and a child app in React Native + Expo (one codebase for Android, iOS and web), a Node.js API server over SQLite for token auth, rules, scoring, the reward ledger and request decisions, and a shared package holding Zod schemas, the API client, theme tokens and a KSSR seed question bank. AI drafts are schema-checked, run through a deterministic rejection filter and queued for parent review. The child’s phone only sends chosen answers; the server marks them, grants at most one reward per challenge, and enforces a daily attempt limit and a daily reward cap. Emergency calls, messaging a parent and school apps are never blocked, and the app asks for a child’s nickname, not their full name.',
    result:
      'A working prototype whose core loop runs end to end — rules, AI drafting through the filter and parent review, server-side scoring and rewards — covered by an automated API test suite and repo-wide type checking. It won a team Gold Award at NALI 2026. Device pairing, device-level app blocking and the report analytics are still simulated, and the page says so below.',
  },
  architecture: {
    summary:
      'Two apps and one server. The model sits on a single edge of the graph — server to Groq, for drafts — and every path from a draft to a child runs through code and a parent.',
    diagram: {
      type: 'flow',
      steps: [
        { label: 'Parent app (React Native + Expo)', sub: 'rules, question bank, AI review queue, time requests' },
        { label: 'Node.js API server', sub: 'token auth · rules · request decisions' },
        { label: 'Groq · openai/gpt-oss-20b', sub: 'drafts only, schema-constrained JSON' },
        { label: 'Deterministic filter → pending_review', sub: 'rejects unsafe, broken or duplicate drafts' },
        { label: 'Parent approval', sub: 'the only path into the active bank' },
        { label: 'SQLite', sub: 'question bank · attempts · reward ledger' },
        { label: 'Child app (React Native + Expo)', sub: 'sends chosen answers; the server scores and awards minutes' },
      ],
    },
  },
  highlights: [
    {
      title: 'Five ways a draft dies before a parent sees it',
      caption:
        'The server rejects a draft with <b>blocked terms</b> (personal-data requests, unsafe or age-inappropriate content), a <b>correct answer that isn’t among the options</b>, <b>duplicate options</b> after normalisation, an <b>explanation that doesn’t contain the answer</b>, or a <b>near-duplicate</b> of an existing question. The parent only spends time on judgement.',
      diagram: {
        type: 'branch',
        root: 'LLM draft · pending_review',
        branches: [
          { label: 'Blocked terms', sub: 'personal data, unsafe' },
          { label: 'Answer missing', sub: 'not among options' },
          { label: 'Duplicate options', sub: 'after normalising' },
          { label: 'Explanation', sub: 'lacks the answer' },
          { label: 'Near-duplicate', sub: 'of a bank question' },
        ],
        outcome: 'Survivors wait for a parent to approve or discard',
      },
    },
    {
      title: 'The model has no arrow into the score',
      caption:
        'Scoring, rewards, balance updates and rules are plain server code. The phone sends only the chosen answers; a reward is granted <b>once per challenge</b>, under a <b>daily attempt limit</b> and a <b>daily reward cap</b>.',
      diagram: {
        type: 'compare',
        before: {
          eyebrow: 'What the model touches',
          label: 'Question drafts',
          lines: ['Enter as pending_review', 'Invisible until approved'],
        },
        after: {
          eyebrow: 'Server code only',
          label: 'Scores · rewards · rules',
          lines: ['One reward per challenge', 'Daily attempt + reward caps'],
        },
        diffLabel: 'no path',
        arrow: false,
      },
    },
  ],
  limitations: [
    'A working prototype, not a store-ready product.',
    'Device pairing is simulated — the parent app has a “Simulate device connection” step instead of a real phone link.',
    'The app doesn’t block other apps on the device yet; that needs native Android permissions.',
    'Dashboard usage figures, the learning-pulse percentages and everything on the Reports tab are sample data.',
    'Settings toggles, data export / delete and password reset are UI only.',
    'The evaluation study with families is planned, not run — there is no learning-outcome result to report yet.',
  ],
  screenshots: {
    dir: 'learn2unlock',
    frame: 'phone',
    alt: 'Learn2Unlock child and parent app screens',
  },
  chips: ['TypeScript', 'React Native', 'Expo', 'Node.js', 'SQLite', 'Zod', 'Groq', 'pnpm'],
  links: [
    { label: 'Repository', href: 'https://github.com/sadad54/Learn2Unlock' },
    { label: 'The decision', href: '#decisions', internal: true },
  ],
};
