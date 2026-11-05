/* Research, as data: the home section (L5) and the /research page both read
   this, so the two can never disagree. Every field is from the résumé and the
   site's own copy — status, numbers, links. Nothing here is a placeholder.

   `bibtex` stays null until a paper has a real venue; the Copy BibTeX action
   only renders once it is filled in. Until then, readers can request the
   manuscript, which is what a supervisor would do anyway. */
export const PAPERS = [
  {
    id: 'safe-rag',
    title: 'SAFE-RAG',
    kind: 'Regulatory RAG evaluation',
    role: 'First author',
    years: '2025 – 2026',
    status: 'Manuscript complete',
    statusNote: 'not yet submitted',
    summary:
      'Investigates incorrect regulatory scope in cited AI answers. Answers were evaluated for valid output schemas and supporting citations — and still grounded to the wrong scope at a measurable rate.',
    findings: ['8.6% wrong-scope grounding rate across 200 annotated items', 'The wrong-scope answers still had valid output schemas and supporting citations'],
    figure: 'waffle',
    caption: 'Wrong-scope grounding rate across 200 annotated items: 8.6%, drawn to scale as 43 of 500 cells.',
    code: 'https://github.com/sadad54/SAFE-RAG',
    bibtex: null,
  },
  {
    id: 'text-to-sql',
    title: 'Text-to-SQL answerability under schema evolution',
    kind: 'Benchmark · drift detection',
    role: 'First author',
    years: '2026',
    status: 'Manuscript complete',
    statusNote: 'not yet submitted',
    summary:
      'When a database schema changes, a question that used to be answerable can silently stop being so. A benchmark for evaluating answerability as schemas evolve — and for catching the drift you can’t see in the structure.',
    findings: [
      '79.5% of structurally invisible drift detected',
      '13.0% false-alarm rate on 5,627 benign schema updates',
      '1,382 benchmark instances across 20 databases; 27,384 model generations',
    ],
    figure: 'gauges',
    caption: 'Detection of structurally invisible drift against the false-alarm rate on 5,627 benign schema updates.',
    code: null,
    bibtex: null,
  },
];

export const EMAIL = 'adnanmashrursadad@gmail.com';
