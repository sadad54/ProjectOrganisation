/* The model card: who Adnan is, as the About section prints it. The "Ask
   the model" assistant indexes the same rows, so the two never disagree.
   Every field is a fact from the résumé. */
/* Papers and awards are listed once, here. The model card rows below, the
   hero's proof strip and the "short version" overlay are all built from
   these, so the three can't disagree. `stat` repeats the figure shown in the
   Research section (components/home/Research.jsx) — change both together. */
export const PAPERS = [
  { name: 'SAFE-RAG', status: 'manuscript complete', role: 'First author', stat: '8.6% wrong-scope grounding rate across 200 annotated items' },
  {
    name: 'Text-to-SQL answerability under schema evolution',
    status: 'manuscript complete',
    role: 'First author',
    stat: '79.5% of structurally invisible drift detected at a 13.0% false-alarm rate',
  },
];
export const AWARDS = [
  { title: 'Gold Award', where: 'NALI 2026, UTM', note: 'Learn2Unlock' },
  { title: 'Gold Medal & Best Video', where: 'myHCI-UX Student Design Challenge, Oct 2025' },
];

export const CARD = [
  ['Model', 'adnan-m-sadad'],
  ['Role', 'Software engineer — applied AI & ML systems'],
  ['Base', 'Kuala Lumpur, Malaysia'],
  ['Trained on', 'Bachelor of Computer Science (Software Engineering) with Honours — MJIIT, Universiti Teknologi Malaysia, 2021–2026'],
  ['Scores', 'CGPA 3.43 / 4.00 · Dean’s List 2022/23 and 2025/26'],
  ['Fine-tuned at', 'Joget Inc. — Software Developer Intern, Oct 2024 – Mar 2025'],
  ['Deployed at', 'Freelance web developer, 2026 – present — Gravity Digital, ModelzNet, Loop & Lug'],
  ['Research', `First author: ${PAPERS.map((p) => `${p.name} (${p.status})`).join(' · ')}`],
  ['Benchmarks', AWARDS.map((a) => `${a.title} — ${a.where}${a.note ? ` (${a.note})` : ''}`).join(' · ')],
  ['Community', 'Secretary Treasurer, SOFEA Society — AI workshops for 200+ students'],
  ['Languages', 'English · Bengali · Bahasa Malaysia · Hindi / Urdu'],
  ['Known biases', 'Real Madrid. Declared, not mitigated.'],
  ['Intended use', 'AI systems that validate, repair and measure their own output'],
  ['License', 'Open — good conversations about interesting work are reason enough'],
];
