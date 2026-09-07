'use client';
import { useEffect, useRef, useState } from 'react';
import { useScroll, useMotionValueEvent } from 'framer-motion';
import useMotionPreference from '../hooks/useMotionPreference';

const chapters = [
  { name: 'InterviewPilot', title: 'An interview that listens.', problem: 'A fixed question list cannot respond to what you actually said.', decision: 'Transcribe the answer, evaluate it against a rubric, then decide whether to probe deeper or move on.', result: 'Adaptive follow-ups, with validated output between the model and the interface.', image: '/assets/screenshots/interviewpilot/01.png', alt: 'InterviewPilot application interface', link: '#p-interviewpilot', color: '#FF9B6A' },
  { name: 'WC26 Predictor', title: 'A forecast with room for doubt.', problem: 'One predicted winner hides all the other ways a tournament could unfold.', decision: 'Model the matches, then simulate the full tournament 10,000 times.', result: 'Tournament paths and probabilities, with a predicted-versus-actual audit.', image: '/assets/screenshots/wc26-predictor/01.png', alt: 'WC26 Predictor tournament dashboard', link: '#p-wc26', color: '#B7BAFF' },
  { name: 'Mindhive Chatbot', title: 'A conversation with a memory.', problem: '“Which opens earliest?” only makes sense if the previous answer is still in context.', decision: 'Preserve conversation state and route each question to product retrieval or an outlet query.', result: 'Follow-up questions stay connected to the conversation.', image: '/assets/screenshots/mindhive-chatbot/01.png', alt: 'Mindhive conversational application', link: '#p-mindhive', color: '#A4EDC8' },
];

export default function WorkStory() {
  const ref = useRef(null);
  const reduce = useMotionPreference();
  const [compact, setCompact] = useState(true);
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const staticView = compact || reduce;
  const update = (value) => setActive(Math.min(2, Math.max(0, Math.floor(value * 3))));
  useMotionValueEvent(scrollYProgress, 'change', update);
  useEffect(() => {
    const media = matchMedia('(max-width: 900px), (max-height: 650px)');
    const sync = () => { setCompact(media.matches); update(scrollYProgress.get()); };
    sync(); media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, [scrollYProgress]);

  return (
    <div ref={ref} className={`work-story${staticView ? ' story-static' : ''}`}>
      <div className="story-sticky">
        <div className="story-heading wrap">
          <p>Three problems. Three working systems.</p>
          <span aria-hidden="true">{staticView ? '01 — 03' : `0${active + 1} / 03`}</span>
        </div>
        <div className="story-stack wrap">
          {chapters.map((chapter, index) => (
            <article key={chapter.name} className="story-chapter" style={{ '--chapter': chapter.color }}
              hidden={!staticView && index !== active}>
              <div className="story-copy">
                <p className="story-project">0{index + 1} <span>{chapter.name}</span></p>
                <h3>{chapter.title}</h3>
                <p className="story-problem">{chapter.problem}</p>
                <dl><dt>The decision</dt><dd>{chapter.decision}</dd><dt>What changes</dt><dd>{chapter.result}</dd></dl>
                <a className="story-link" href={chapter.link}>Explore the engineering <span aria-hidden="true">↗</span></a>
              </div>
              <div className="story-image">
                <img src={chapter.image} alt={chapter.alt} width="1440" height="900" loading="lazy" />
                <span className="story-image-label">{chapter.name} <span>Product view</span></span>
              </div>
            </article>
          ))}
        </div>
        <div className="story-meter wrap" aria-hidden="true">
          {chapters.map((chapter, index) => <span key={chapter.name} className={index <= active ? 'filled' : ''} style={{ '--chapter': chapter.color }} />)}
        </div>
      </div>
    </div>
  );
}
