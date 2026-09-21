export default {
  slug: 'interviewpilot',
  name: 'InterviewPilot',
  year: '2026',
  kind: 'Full stack + LLM',
  hook: 'A mock interview that pushes back.',
  headline: {
    metric: '0',
    label: 'dropped requests under schema repair',
  },
  overview: {
    summary:
      'InterviewPilot is a full-stack mock interview platform that plans an interview around competency areas, asks and adaptively follows up on questions, transcribes and scores answers against a strict rubric with a schema-repair loop, and generates an evidence-backed report at the end.',
    bullets: [
      'Reached <b>89% backend statement coverage</b> (654/738 lines, 19 tests passing) by building the schema-repair and follow-up logic as isolated, independently testable services.',
      "Eliminated dropped or half-parsed responses by re-prompting the model with its own validation error attached whenever it broke the enforced JSON contract, instead of discarding the turn.",
      'Kept the product usable with <b>zero API key</b> by writing deterministic fallback heuristics for text interviews, explicitly disclosed as not measuring real technical correctness.',
    ],
  },
  story: {
    situation:
      "Most mock-interview demos are a fixed question list wrapped around a chatbot — nothing adapts to what the candidate actually says.",
    task: 'Build an interviewer that behaves like a stateful workflow (plan → ask → probe → complete → report), not a one-shot prompt.',
    action:
      'Modeled the interview as an explicit state machine (Created → Planning → InProgress → Probe → Completed → Report), used Whisper-large-v3 for audio and Llama 3.3 70B via Groq for scoring against a rubric, and enforced the model\'s output against a strict schema (technical_accuracy/clarity/depth 0–5, evidence[], follow_up) with a repair loop instead of trusting the first response. Backed it with FastAPI, SQLAlchemy and Alembic, a pytest suite with all Groq calls mocked, Docker, and GitHub Actions on every push.',
    result:
      'A full-lifecycle product, not a chatbot demo, that proves the specific skill of designing stateful workflows and schema-enforced LLM integration in a production-style backend, with its real limitations (deterministic-fallback scoring, untested live audio accuracy) stated rather than glossed over.',
  },
  architecture: {
    summary:
      'The interview is modeled as an explicit state machine rather than a linear script, so a weak answer can branch into a follow-up probe before returning to the main flow.',
    diagram: {
      type: 'flow',
      steps: [
        { label: 'Created', sub: 'session created' },
        { label: 'Planning', sub: 'competency areas planned' },
        { label: 'InProgress', sub: 'primary questions asked' },
        { label: 'Probe', sub: 'follow-up when an answer needs more depth — loops back to InProgress' },
        { label: 'Completed' },
        { label: 'Report', sub: 'evidence-backed report generated' },
      ],
    },
  },
  highlights: [
    {
      title: 'The schema-repair loop',
      caption:
        'Reached <b>zero dropped requests</b> under schema repair by feeding an invalid response back to the model with its own validation error attached, instead of discarding the turn.',
      diagram: {
        type: 'loop',
        nodes: [
          { label: 'Model responds' },
          { label: 'Schema validation', sub: 'technical_accuracy, clarity, depth 0–5, evidence[], follow_up' },
          { label: 'Invalid → re-prompt', sub: 'validation error attached' },
          { label: 'Re-validate' },
        ],
        gateLabel: 'Zero dropped requests, zero half-parsed answers reaching the UI',
      },
    },
    {
      title: 'Adaptive follow-up, not a fixed question list',
      caption:
        'Chose whether to probe deeper or move on per answer, instead of stepping through a fixed script.',
      diagram: {
        type: 'flow',
        steps: [
          { label: 'Candidate answers a primary question' },
          { label: 'followup_service.py scores answer quality' },
          { label: 'Weak answer → generates a targeted probe' },
          { label: 'Strong answer → moves to next primary question' },
        ],
      },
    },
  ],
  limitations: [
    'Deterministic fallback scores (used with no Groq key) are length-based and do not measure real technical correctness — disclosed explicitly in the product itself, including when a configured provider fails.',
    'Frontend component unit tests (vitest) were attempted; the workspace install did not land and the attempt was dropped by decision. Playwright E2E, axe and visual regression are the frontend coverage instead.',
    "Live audio transcription accuracy hasn't been validated in this readiness pass — automated tests mock every provider call.",
    'Readiness numbers (19 backend tests, 89% statement coverage) measure code paths, not live model quality, which remains untested by the test suite itself.',
  ],
  screenshots: {
    dir: 'interviewpilot',
    count: 9,
    alt: 'InterviewPilot: a mock-interview session with the live transcript on the left and rubric scores for technical accuracy, clarity and depth on the right.',
  },
  chips: [
    'Python', 'FastAPI', 'SQLAlchemy', 'React', 'TypeScript', 'Groq API',
    'Whisper-large-v3', 'Llama 3.3 70B', 'Docker', 'GitHub Actions', 'pytest',
  ],
  links: [{ label: 'Repository', href: 'https://github.com/sadad54/interviewpilot' }],
};
