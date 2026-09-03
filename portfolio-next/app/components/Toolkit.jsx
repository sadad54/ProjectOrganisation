'use client';

import { useEffect, useState } from 'react';
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

// spec §6.5 — "Working languages" dropped from Toolkit; it now lives in About.
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
];

// which chips actually map to a project on the page (see Work.jsx chip lists)
const PROJECT_TECH = new Set([
  'python', 'fastapi', 'react', 'typescript', 'xgboost', 'scikit-learn', 'tensorflow', 'ocr',
  'docker', 'github actions', 'pytest', 'supabase', 'firebase', 'flutter', 'dart', 'groq api',
  'hugging face', 'rag', 'text2sql', 'openapi', 'gemini api', 'vite', 'recharts', 'monte carlo',
  'smote', 'pydantic', 'streamlit', 'sqlalchemy', 'whisper-large-v3', 'llama 3.3 70b',
  'redpanda', 'pyflink', 'feast', 'pytorch geometric', 'onnx runtime', 'mlflow', 'kubernetes',
  'prometheus / grafana', 'agentic retrieval', 'eval harness',
]);

function Cell({ cell, active, onPick }) {
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
      <h3>{cell.title}</h3>
      <ul>
        {cell.items.map((item) => {
          const key = item.toLowerCase();
          const filterable = PROJECT_TECH.has(key);
          return (
            <li key={item}>
              {filterable ? (
                <button
                  type="button"
                  className={`chip-btn${active === key ? ' on' : ''}`}
                  aria-pressed={active === key}
                  onClick={() => onPick(active === key ? null : key, item)}
                >
                  {item}
                </button>
              ) : (
                item
              )}
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}

export default function Toolkit() {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? 'show' : 'hidden';
  const [active, setActive] = useState(null);
  const [activeLabel, setActiveLabel] = useState('');

  function pick(key, label) {
    setActive(key);
    setActiveLabel(key ? label : '');
    window.dispatchEvent(new CustomEvent('portfolio:filter', { detail: { tech: key } }));
  }

  // clear the filter if the user leaves the section entirely
  useEffect(() => {
    return () => window.dispatchEvent(new CustomEvent('portfolio:filter', { detail: { tech: null } }));
  }, []);

  return (
    <section className="band" id="toolkit" aria-label="Toolkit">
      <div className="wrap">
        <motion.h2 className="title" initial={initial} whileInView="show" viewport={viewport} variants={rise}>
          What I reach for.
        </motion.h2>
        <motion.p
          className="toolkit-hint"
          initial={initial}
          whileInView="show"
          viewport={viewport}
          variants={rise}
        >
          {active ? (
            <>
              Highlighting projects that use <strong>{activeLabel}</strong> —{' '}
              <button type="button" className="toolkit-clear" onClick={() => pick(null)}>
                clear
              </button>
            </>
          ) : (
            'Tap a highlighted skill to see which projects use it.'
          )}
        </motion.p>
        <motion.div className="bento" initial={initial} whileInView="show" viewport={viewport} variants={gridContainer}>
          {CELLS.map((cell) => (
            <Cell cell={cell} key={cell.title} active={active} onPick={pick} />
          ))}
        </motion.div>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track" id="mq"></div>
        </div>
      </div>
    </section>
  );
}
