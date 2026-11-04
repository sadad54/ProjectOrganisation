/* Retrieval: BM25 over the corpus. The whole site is a few hundred chunks,
   so a lexical ranker in memory is exact, instant and needs no embedding
   service. A small synonym map covers the ways visitors phrase what the
   site says in its own words; project names in a chunk's title count
   twice, so "how does ProofHire…" lands on ProofHire. */
import { corpus } from './corpus';

const STOP = new Set(
  'a an and are as at be but by can could did do does for from had has have he her his how i if in into is it its me my of on or our she so than that the their them then there these they this to was we were what when where which who why will with would you your adnan adnans sadad about tell'.split(' ')
);

// visitors' words → the site's words
const SYN = {
  llm: ['ai', 'model', 'rag'],
  ai: ['llm', 'model'],
  hallucinate: ['citation', 'guard', 'unsupported', 'claim'],
  hallucination: ['citation', 'guard', 'unsupported', 'claim'],
  deploy: ['deployed', 'production', 'serving', 'cloud', 'docker'],
  production: ['deployed', 'serving', 'load', 'requests'],
  load: ['concurrent', 'requests', 'p95', 'latency'],
  scale: ['concurrent', 'requests', 'p95', 'latency'],
  ml: ['machine', 'model', 'xgboost', 'pytorch'],
  mlops: ['drift', 'retraining', 'mlflow', 'kubernetes'],
  experience: ['intern', 'freelance', 'joget'],
  job: ['intern', 'freelance', 'roles'],
  work: ['intern', 'freelance', 'project'],
  education: ['degree', 'cgpa', 'university', 'bachelor'],
  study: ['degree', 'university', 'bachelor'],
  university: ['utm', 'mjiit', 'degree'],
  gpa: ['cgpa'],
  award: ['gold', 'medal', 'nali'],
  awards: ['gold', 'medal', 'nali'],
  paper: ['research', 'manuscript'],
  papers: ['research', 'manuscript'],
  publication: ['research', 'manuscript'],
  hire: ['open', 'roles', 'relocation'],
  available: ['open', 'roles', 'relocation'],
  relocate: ['relocation'],
  contact: ['email', 'linkedin', 'github'],
  email: ['contact'],
  stack: ['python', 'typescript', 'fastapi', 'next'],
  frontend: ['react', 'next', 'typescript'],
  backend: ['fastapi', 'node', 'postgresql'],
  mobile: ['react', 'native', 'expo', 'flutter'],
  test: ['eval', 'harness', 'playwright', 'pytest'],
  testing: ['eval', 'harness', 'playwright', 'pytest'],
  evaluation: ['eval', 'harness', 'benchmark'],
  weakness: ['limitations'],
  limits: ['limitations'],
  failures: ['limitations', 'bugs'],
};

function stem(w) {
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

export function tokens(s) {
  return (s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').match(/[a-z0-9][a-z0-9+#.-]*[a-z0-9+#]|[a-z0-9]/g) || [])
    .filter((w) => !STOP.has(w))
    .map(stem);
}

const K1 = 1.4;
const B = 0.72;
let index = null;

function build() {
  const docs = corpus().map((c) => {
    const t = [...tokens(c.title), ...tokens(c.title), ...tokens(c.text)];
    const tf = new Map();
    t.forEach((w) => tf.set(w, (tf.get(w) || 0) + 1));
    return { c, tf, len: t.length };
  });
  const df = new Map();
  docs.forEach((d) => d.tf.forEach((_, w) => df.set(w, (df.get(w) || 0) + 1)));
  const avg = docs.reduce((n, d) => n + d.len, 0) / docs.length;
  // named things: every project (it has a summary chunk) and each paper.
  // A project's name appears in so many skill rows that BM25 rates it a
  // common word, so naming one is handled as an exact match instead.
  const names = [...new Set(docs.filter((d) => /#summary$|^research#/.test(d.c.id)).map((d) => d.c.title))].map((t) => ({ t, key: squash(t) }));
  return { docs, df, avg, N: docs.length, names };
}

const squash = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

// project names the text mentions ("ProofHire", "proof hire", "WC26 Predictor")
function named(text, names) {
  const s = squash(text);
  return names.filter(({ key }) => key.length > 3 && s.includes(key)).map(({ t }) => t);
}

/**
 * Top-k chunks for a question. `context` (the previous question, for
 * follow-ups like "what about its stack?") is folded in at half weight.
 * Returns [{ ...chunk, score }] with score > 0, best first.
 */
export function retrieve(q, { k = 6, context = '' } = {}) {
  if (!index) index = build();
  const { docs, df, avg, N, names } = index;
  const hit = named(q, names);
  const focus = new Map([...named(context, names).map((t) => [t, 3]), ...hit.map((t) => [t, 6])]);
  const weights = new Map();
  const put = (w, x) => weights.set(w, Math.max(weights.get(w) || 0, x));
  tokens(q).forEach((w) => {
    put(w, 1);
    (SYN[w] || []).forEach((s) => put(stem(s), 0.5));
  });
  tokens(context).forEach((w) => put(w, 0.4));
  if (!weights.size && !focus.size) return [];

  const scored = docs.map((d) => {
    let s = focus.get(d.c.title) || 0;
    weights.forEach((wt, w) => {
      const f = d.tf.get(w);
      if (!f) return;
      const n = df.get(w);
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      s += wt * idf * ((f * (K1 + 1)) / (f + K1 * (1 - B + (B * d.len) / avg)));
    });
    return { ...d.c, score: s };
  });
  // at most two chunks per project, so a broad question ("has he shipped…?")
  // hears from several projects — unless the question names the project,
  // when its own sections are exactly what's wanted
  const per = new Map();
  const out = [];
  for (const d of scored.filter((x) => x.score > 0).sort((a, b) => b.score - a.score)) {
    const n = per.get(d.title) || 0;
    if (n >= (focus.has(d.title) ? 4 : 2)) continue;
    per.set(d.title, n + 1);
    out.push(d);
    if (out.length === k) break;
  }
  return out;
}
