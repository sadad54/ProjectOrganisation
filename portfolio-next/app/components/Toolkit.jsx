'use client';

import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.2, 0, 0, 1];
const viewport = { once: true, amount: 0.12, margin: '0px 0px -8% 0px' };

const rise = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const gridContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const CELLS = [
  {
    wide: true,
    title: 'GenAI & LLM systems',
    items: ['RAG', 'Agentic workflows', 'Text2SQL', 'Prompt engineering', 'Structured output validation', 'Eval & repair loops', 'Groq API', 'Whisper', 'Hugging Face'],
  },
  {
    wide: true,
    title: 'AI / ML & data',
    items: ['XGBoost', 'Scikit-learn', 'TensorFlow', 'CNN / ANN', 'Computer vision', 'OCR', 'Monte Carlo simulation', 'Predictive analytics'],
  },
  { title: 'Languages', items: ['Python', 'Java', 'C++', 'JavaScript', 'TypeScript', 'Dart', 'SQL'] },
  { title: 'Frameworks', items: ['FastAPI', 'React', 'SQLAlchemy', 'Spring', 'Flutter', 'Vue.js', 'Streamlit', 'Recharts'] },
  { title: 'Cloud & architecture', items: ['AWS', 'Docker', 'REST APIs', 'Microservices', 'CI/CD', 'GitHub Actions', 'Supabase', 'Firebase'] },
  {
    wide: true,
    title: 'Core CS',
    items: ['Data structures & algorithms', 'OOP', 'Operating systems', 'Databases', 'Software engineering', 'Computer architecture'],
  },
  {
    wide: true,
    title: 'Working languages',
    items: ['English', 'Bengali', 'Bahasa Malaysia (conversational)', 'Hindi / Urdu (conversational)'],
  },
];

function Cell({ cell }) {
  function onPointerMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%');
    e.currentTarget.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%');
  }

  return (
    <motion.div
      className={`cell${cell.wide ? ' wide' : ''}`}
      variants={rise}
      onPointerMove={onPointerMove}
      whileHover={{ y: -3, transition: { duration: 0.3, ease: EASE } }}
    >
      <h4>{cell.title}</h4>
      <ul>
        {cell.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function Toolkit() {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? 'show' : 'hidden';

  return (
    <section className="band" id="toolkit">
      <div className="wrap">
        <motion.h2 className="title" initial={initial} whileInView="show" viewport={viewport} variants={rise}>
          What I reach for.
        </motion.h2>
        <motion.div className="bento" initial={initial} whileInView="show" viewport={viewport} variants={gridContainer}>
          {CELLS.map((cell) => (
            <Cell cell={cell} key={cell.title} />
          ))}
        </motion.div>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track" id="mq"></div>
        </div>
      </div>
    </section>
  );
}
