/* =========================================================================
   RETRIEVAL — the work index is a real (small) search engine.

   Each project becomes a TF-IDF vector over its own text (name, category,
   hook, notes, stack — with the name and stack weighted up). A query is
   expanded through a hand-written synonym map (so "LLM" finds Llama, Groq
   and RAG), vectorised with the same IDF, and ranked by cosine similarity.
   The latent map is classical MDS over the cosine distances between
   projects. All of it runs client-side in well under a millisecond.
   ========================================================================= */

const STOP = new Set(
  'a an the and or of to in on for with by at from as is are be it its this that into over than then so not no only per via each every can you your my our we i me what when why how who which there their them they his her were was has have had do does did about after before under up out one two three just also more most less like'.split(
    ' '
  )
);

// light stemming: good enough to fold "retrieval/retrieve", "models/model"
function stem(w) {
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 4 && w.endsWith('es') && !w.endsWith('ses')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  if (w.length > 5 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 6 && w.endsWith('al')) return w.slice(0, -2);
  return w;
}

export function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9+#.]+/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^\.+|\.+$/g, ''))
    .filter((w) => w && !STOP.has(w) && (w.length > 1 || /[0-9]/.test(w)))
    .map(stem);
}

// query expansion: term → related terms (weighted lower than the term itself)
const SYN = {
  llm: 'llama groq gemini rag agent prompt language model whisper',
  ai: 'llm model ml agent gemini groq llama rag',
  genai: 'llm rag agent gemini groq llama',
  agent: 'agentic planner planning tool follow-up intent',
  rag: 'retrieval rerank reranking citation pgvector embedding hybrid',
  search: 'retrieval rerank rank query',
  retrieval: 'rag rerank pgvector hybrid citation',
  eval: 'evaluation benchmark harness metric pr-auc hit rate test faithfulness',
  evaluation: 'eval benchmark harness metric test',
  test: 'pytest playwright coverage ci test',
  testing: 'pytest playwright coverage ci test',
  ml: 'xgboost model classification scikit-learn tensorflow training machine learning',
  machine: 'ml xgboost model classification',
  stream: 'streaming kafka redpanda pyflink replay real-time',
  streaming: 'stream kafka redpanda pyflink replay',
  kafka: 'redpanda streaming pyflink',
  drift: 'psi ks retrain retraining decay',
  mlops: 'mlflow drift retrain kubernetes onnx monitoring',
  mobile: 'flutter dart app phone',
  app: 'flutter mobile react',
  vision: 'ocr cnn image camera computer try-on',
  cv: 'ocr cnn image vision computer',
  ocr: 'vision receipt text recognition',
  fraud: 'imbalanced smote transaction fraud',
  finance: 'fraud expense receipt market company filings financial',
  sql: 'text2sql postgresql sqlalchemy mysql database query',
  database: 'sql postgresql pgvector redis mysql supabase firebase',
  frontend: 'react typescript next.js vite ui recharts',
  backend: 'fastapi api spring redis worker pydantic',
  api: 'fastapi openapi rest endpoint',
  deploy: 'docker kubernetes ci github actions onnx cloud',
  docker: 'container kubernetes deploy',
  cloud: 'google aws kubernetes deploy',
  forecast: 'monte carlo simulation prediction probability xgboost',
  simulation: 'monte carlo forecast probability',
  health: 'mood journal meditation wellness',
  wellness: 'mood journal meditation',
  fashion: 'closet outfit stylist try-on',
  chatbot: 'chat agent rag text2sql conversation',
  schema: 'validation pydantic repair json',
  validation: 'schema pydantic repair guard',
  reliability: 'validation repair guard eval test drift',
  graph: 'graphsage pytorch geometric evidence',
  java: 'spring mysql',
  python: 'fastapi pytest pydantic',
};

function docText(p) {
  const rep = (s, n) => Array(n).fill(s).join(' ');
  return [
    rep(p.name, 3),
    rep(p.kind, 2),
    p.hook,
    (p.notes || []).join(' '),
    rep((p.stack || []).join(' '), 2),
    p.domainLabel || '',
  ].join(' ');
}

function tf(tokens) {
  const m = new Map();
  tokens.forEach((t) => m.set(t, (m.get(t) || 0) + 1));
  return m;
}

function normalize(vec) {
  let n = 0;
  vec.forEach((v) => (n += v * v));
  n = Math.sqrt(n) || 1;
  const out = new Map();
  vec.forEach((v, k) => out.set(k, v / n));
  return out;
}

function dot(a, b) {
  let s = 0;
  const [small, big] = a.size < b.size ? [a, b] : [b, a];
  small.forEach((v, k) => {
    const w = big.get(k);
    if (w) s += v * w;
  });
  return s;
}

export function buildIndex(items) {
  const docs = items.map((p) => tokenize(docText(p)));
  const df = new Map();
  docs.forEach((toks) => new Set(toks).forEach((t) => df.set(t, (df.get(t) || 0) + 1)));
  const N = docs.length;
  const idf = new Map();
  df.forEach((d, t) => idf.set(t, Math.log((N + 1) / (d + 1)) + 1));
  const vecs = docs.map((toks) => {
    const v = new Map();
    tf(toks).forEach((c, t) => v.set(t, (1 + Math.log(c)) * idf.get(t)));
    return normalize(v);
  });
  const names = items.map((p) => tokenize(p.name));
  return { items, idf, vecs, names };
}

/** Rank every item against a free-text query. Returns [{ i, score }] desc. */
export function search(index, q) {
  const qt = tokenize(q);
  if (!qt.length) return null;
  const v = new Map();
  const add = (t, w) => {
    const idf = index.idf.get(t);
    if (!idf) return;
    v.set(t, Math.max(v.get(t) || 0, w * idf));
  };
  qt.forEach((t) => {
    add(t, 1);
    // prefix match: "stream" finds "streaming" as the user types
    if (t.length >= 3) index.idf.forEach((_, k) => k.startsWith(t) && k !== t && add(k, 0.7));
    const syn = SYN[t];
    if (syn) tokenize(syn).forEach((s) => add(s, 0.55));
  });
  if (!v.size) return index.items.map((_, i) => ({ i, score: 0 }));
  const qv = normalize(v);
  return index.vecs
    .map((dv, i) => {
      let score = dot(qv, dv);
      // a query naming the project outright should win
      if (index.names[i].some((n) => qt.includes(n))) score += 0.35;
      return { i, score: Math.min(1, score) };
    })
    .sort((a, b) => b.score - a.score || a.i - b.i);
}

/** Cosine similarity matrix between items. */
export function similarity(index) {
  const n = index.vecs.length;
  const S = Array.from({ length: n }, () => new Float64Array(n));
  for (let a = 0; a < n; a++) for (let b = a; b < n; b++) S[a][b] = S[b][a] = a === b ? 1 : dot(index.vecs[a], index.vecs[b]);
  return S;
}

/** k nearest neighbours per item, from the similarity matrix. */
export function neighbours(S, k = 2) {
  return S.map((row, i) =>
    Array.from(row, (s, j) => ({ j, s }))
      .filter((x) => x.j !== i)
      .sort((a, b) => b.s - a.s)
      .slice(0, k)
  );
}

/* 2-D similarity map. A seeded force-directed layout: every pair repels,
   and each pair is pulled together in proportion to its cosine similarity
   (plus a small pull for sharing a domain), so semantic neighbours end up
   near each other. (Classical MDS was tried first — with similarities this
   sparse it collapsed most projects into one corner.) Deterministic: the
   map is identical on every load. */
export function layout2D(S, groups) {
  const n = S.length;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const P = Array.from({ length: n }, () => [0.3 + rnd() * 0.4, 0.3 + rnd() * 0.4]);
  const W = S.map((row, a) => Array.from(row, (sim, b) => (a === b ? 0 : sim * 3.2 + (groups[a] === groups[b] ? 0.55 : 0))));
  for (let it = 0; it < 600; it++) {
    const cool = 1 - it / 600;
    const F = P.map(() => [0, 0]);
    for (let a = 0; a < n; a++) {
      for (let b = a + 1; b < n; b++) {
        let dx = P[b][0] - P[a][0],
          dy = P[b][1] - P[a][1];
        let d = Math.hypot(dx, dy) || 1e-3;
        const ux = dx / d,
          uy = dy / d;
        const rep = 0.0022 / (d * d);
        const att = W[a][b] * (d - 0.12) * 0.35;
        const f = att - rep;
        F[a][0] += ux * f;
        F[a][1] += uy * f;
        F[b][0] -= ux * f;
        F[b][1] -= uy * f;
      }
      // gravity keeps loners on the board
      F[a][0] += (0.5 - P[a][0]) * 0.04;
      F[a][1] += (0.5 - P[a][1]) * 0.04;
    }
    for (let a = 0; a < n; a++) {
      const step = Math.min(0.02, Math.hypot(F[a][0], F[a][1])) * cool;
      const m = Math.hypot(F[a][0], F[a][1]) || 1;
      P[a][0] += (F[a][0] / m) * step;
      P[a][1] += (F[a][1] / m) * step;
    }
  }
  const xs = P.map((p) => p[0]),
    ys = P.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  // labels hang to the right of each dot and the legend sits at the bottom,
  // so the usable box is skewed left and up
  return P.map(([x, y]) => [0.07 + (0.72 * (x - x0)) / (x1 - x0 || 1), 0.13 + (0.7 * (y - y0)) / (y1 - y0 || 1)]);
}
