'use client';

import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.2, 0, 0, 1];
const viewport = { once: true, amount: 0.2, margin: '0px 0px -6% 0px' };

const rise = {
  hidden: { opacity: 0, y: 34 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const copyContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const TIMELINE = [
  {
    when: '2021-2025',
    title: 'BSc Software Engineering',
    detail: "CGPA 3.50 / Dean's List 2022/23 / Top performer, Computational Intelligence",
    where: 'MJIIT, UTM Kuala Lumpur',
  },
  {
    when: 'Oct 2024-Mar 2025',
    title: 'Software Developer Intern',
    detail: 'Workflow automation on Joget DX, REST integrations, Agile delivery',
    where: 'Joget Inc.',
  },
  {
    when: '2022-2023',
    title: 'Secretary Treasurer, SOFEA Society',
    detail: 'Ran AI workshops for 200+ students',
    where: 'UTM',
  },
  {
    when: 'Oct 2025',
    title: 'Gold Medal & Best Video',
    detail: 'myHCI-UX Student Design Challenge, national universities',
    where: 'Malaysia',
  },
  {
    when: 'Now',
    title: 'Researching self-correcting agentic RAG',
    detail:
      'SAFE-RAG, one of three papers in progress spanning GenAI, computer vision, and human-in-the-loop agentic systems',
    where: 'MJIIT, UTM',
  },
];

export default function About() {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? 'show' : 'hidden';

  return (
    <section className="band" id="about">
      <div className="wrap">
        <motion.div
          className="about-grid"
          initial={initial}
          whileInView="show"
          viewport={viewport}
          variants={copyContainer}
        >
          <div className="about-copy">
            <motion.h2 className="title" variants={rise}>
              Four years learning the theory, one internship learning what breaks.
            </motion.h2>
            <motion.p variants={rise}>
              I finished a Bachelor of Software Engineering at <b>MJIIT, Universiti Teknologi Malaysia</b> in
              Kuala Lumpur: CGPA 3.50, Dean&rsquo;s List, and a thesis on OCR-driven personal finance tracking
              for income tax readiness.
            </motion.p>
            <motion.p variants={rise}>
              Between those, six months at <b>Joget Inc.</b> shipping enterprise workflow automations and UI
              components that clients used in production. That&rsquo;s where I learned the unglamorous half:
              integrating REST services someone else owns, cutting 30% of manual effort out of a data flow,
              and sitting in sprint reviews where a merge has consequences.
            </motion.p>
            <motion.p variants={rise}>
              Now I build AI systems end to end. The model call is the easy part. What I find interesting is
              everything wrapped around it: making a language model return structured output you can trust,
              and having a plan for when it doesn&rsquo;t.
            </motion.p>
          </div>
          <motion.figure className="portrait" style={{ margin: 0 }} variants={rise}>
            <div className="portrait-frame magnet-tilt" id="aboutPortrait">
              <span className="halo" aria-hidden="true"></span>
              <img
                src="assets/portrait.jpeg"
                alt="Adnan Mashrur Sadad"
                width="1080"
                height="1080"
                loading="lazy"
              />
            </div>
            <figcaption className="portrait-cap">
              <span>Adnan Mashrur Sadad</span>
              <span>KL / 2026</span>
            </figcaption>
          </motion.figure>
        </motion.div>

        <motion.div
          className="timeline"
          initial={initial}
          whileInView="show"
          viewport={viewport}
          variants={copyContainer}
        >
          {TIMELINE.map((row) => (
            <motion.div className="tl-row" key={row.when + row.title} variants={rise}>
              <span className="tl-when">{row.when}</span>
              <span className="tl-what">
                <b>{row.title}</b>
                <span>{row.detail}</span>
              </span>
              <span className="tl-where">{row.where}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
