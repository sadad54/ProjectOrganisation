/* Facts the "Ask the model" assistant can cite that the site states in
   component copy rather than in a data file. Each entry quotes the section
   it comes from — when that copy changes, change it here too.
   (Projects, case studies, skills and the model card are indexed straight
   from their data files and need no copy here.) */
export const KNOWLEDGE = [
  {
    id: 'hero#status',
    title: 'Availability',
    section: 'Hero',
    href: '/#top',
    text: 'Adnan is open to AI engineering, data science and full-stack roles. He is based in Kuala Lumpur, Malaysia, and open to relocation. In his words: he builds LLM systems that check their own work. Software engineer working on applied AI; he cares about the part after the model call — schema validation, repair paths, eval harnesses, and a Docker image that actually runs.',
  },
  {
    id: 'thesis#thesis',
    title: 'Thesis',
    section: 'What he cares about',
    href: '/#thesis',
    text: 'The model call is the easy part. What Adnan finds interesting is everything wrapped around it: output you can trust, a plan for when it breaks, and a number that says whether it got better.',
  },
  {
    id: 'research#safe-rag',
    title: 'SAFE-RAG',
    section: 'Research · first author',
    href: '/research',
    text: 'SAFE-RAG (regulatory RAG evaluation, 2025–2026, first author, manuscript complete, not yet submitted) investigates incorrect regulatory scope in cited AI answers. Answers were evaluated for valid output schemas and supporting citations — and still grounded to the wrong scope at a measurable rate: an 8.6% wrong-scope grounding rate across 200 annotated items.',
  },
  {
    id: 'research#text-to-sql',
    title: 'Text-to-SQL answerability under schema evolution',
    section: 'Research · first author',
    href: '/research',
    text: 'Text-to-SQL answerability under schema evolution (benchmark and drift detection, 2026, first author, manuscript complete, not yet submitted). When a database schema changes, a question that used to be answerable can silently stop being so. The benchmark evaluates answerability as schemas evolve and catches structurally invisible drift: 79.5% of structurally invisible drift detected, a 13.0% false-alarm rate on 5,627 benign schema updates, across 1,382 benchmark instances, 20 databases and 27,384 model generations.',
  },
  {
    id: 'decisions#index',
    title: 'Engineering decisions',
    section: 'The decisions he’d defend',
    href: '/#decisions',
    text: 'Five engineering decisions Adnan would defend, each from a real project: 01 Plan the second attempt (InterviewPilot — a repair loop when model output fails validation); 02 Notice the decay first (Driftline — drift detection before retraining); 03 Simulate, don’t guess (WC26 Predictor — Monte Carlo simulation); 04 No source, no claim (ProofHire — evidence before any claim); 05 Let the model draft, never decide (Learn2Unlock — the LLM drafts, a parent decides).',
  },
  {
    id: 'contact#reach',
    title: 'Contact',
    section: 'Contact',
    href: '/#contact',
    text: 'You can reach Adnan by email at adnanmashrursadad@gmail.com, on LinkedIn (adnan-mashrur-sadad) or GitHub (sadad54). Two résumés are available on the site as PDFs: AI / ML and full-stack. The contact section drafts a message and opens it in your own mail client; nothing is sent from the page.',
  },
];
