/* The toolkit, grouped. Each skill lists the stack names (lower-case) it
   stands for; the skills graph draws an edge to every project in
   app/data/work.js whose `stack` contains one of them, so the wiring is
   derived from the projects, never hand-drawn. Skills with no project
   behind them still show — they just have no edges. */
export const SKILL_GROUPS = [
  {
    name: 'LLM systems & agents',
    skills: [
      { n: 'RAG & hybrid retrieval', m: ['rag', 'pgvector'] },
      { n: 'Agentic workflows', m: ['agentic planning', 'agentic retrieval'] },
      { n: 'Text-to-SQL', m: ['text2sql'] },
      { n: 'Eval harnesses', m: ['eval harness'] },
      { n: 'Groq · Llama', m: ['groq api', 'llama 3.3 70b'] },
      { n: 'Whisper', m: ['whisper-large-v3'] },
      { n: 'Gemini API', m: ['gemini api'] },
      { n: 'Hugging Face', m: ['hugging face'] },
    ],
  },
  {
    name: 'ML & data',
    skills: [
      { n: 'XGBoost', m: ['xgboost'] },
      { n: 'scikit-learn', m: ['scikit-learn', 'smote'] },
      { n: 'TensorFlow', m: ['tensorflow', 'cnn'] },
      { n: 'PyTorch Geometric', m: ['pytorch geometric'] },
      { n: 'Computer vision · OCR', m: ['ocr', 'cnn', 'ml kit'] },
      { n: 'Monte Carlo', m: ['monte carlo'] },
      { n: 'Streaming · PyFlink', m: ['redpanda', 'pyflink'] },
      { n: 'MLOps · MLflow · ONNX', m: ['mlflow', 'onnx runtime', 'feast'] },
      { n: 'Search & knowledge systems', m: ['state-space search', 'knowledge representation'] },
    ],
  },
  {
    name: 'Backend & data',
    skills: [
      { n: 'Python', m: ['python'] },
      { n: 'FastAPI', m: ['fastapi'] },
      { n: 'Pydantic · OpenAPI', m: ['pydantic', 'openapi'] },
      { n: 'SQLAlchemy', m: ['sqlalchemy'] },
      { n: 'PostgreSQL', m: ['postgresql'] },
      { n: 'Redis', m: ['redis'] },
      { n: 'Java · Spring', m: ['java', 'spring'] },
      { n: 'SQL · MySQL', m: ['sql', 'mysql'] },
      { n: 'Firebase · Supabase', m: ['firebase', 'supabase'] },
    ],
  },
  {
    name: 'Frontend & mobile',
    skills: [
      { n: 'React', m: ['react'] },
      { n: 'TypeScript', m: ['typescript'] },
      { n: 'Next.js', m: ['next.js'] },
      { n: 'Flutter · Dart', m: ['flutter', 'dart'] },
      { n: 'Recharts', m: ['recharts'] },
      { n: 'Vite', m: ['vite'] },
      { n: 'Streamlit', m: ['streamlit'] },
    ],
  },
  {
    name: 'Infra & quality',
    skills: [
      { n: 'Docker', m: ['docker'] },
      { n: 'Kubernetes', m: ['kubernetes'] },
      { n: 'Google Cloud', m: ['google cloud'] },
      { n: 'GitHub Actions', m: ['github actions'] },
      { n: 'pytest', m: ['pytest'] },
      { n: 'Playwright', m: ['playwright'] },
      { n: 'Prometheus · Grafana', m: ['prometheus / grafana'] },
    ],
  },
];

/* Also in the toolbox, without a project on this page to point at. */
export const ALSO = ['C++', 'JavaScript', 'AWS', 'Vue.js', 'REST APIs', 'Microservices', 'Data structures & algorithms', 'Operating systems', 'Databases'];
