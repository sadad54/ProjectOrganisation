'use client';

import { useEffect } from 'react';
import BackgroundFX from '../BackgroundFX';
import SmoothScroll from '../SmoothScroll';
import Shot, { imgs } from '../Shot';
import Hero from './Hero';
import Overview from './Overview';
import Story from './Story';
import Architecture from './Architecture';
import Highlights from './Highlights';
import LimitationsList from './LimitationsList';
import ProjectNav from './ProjectNav';
import { initShotCarousels } from './shotCarousel';

export default function ProjectPage({ project, prev, next }) {
  useEffect(() => {
    return initShotCarousels();
  }, []);

  return (
    <SmoothScroll>
      <BackgroundFX />
      <a className="skip-link" href="#project-main">
        Skip to content
      </a>
      <header className="project-header wrap">
        <a href="/">ADNAN M. SADAD</a>
        <a href="/#work">&larr; All work</a>
      </header>
      <main id="project-main">
        <Hero
          slug={project.slug}
          name={project.name}
          year={project.year}
          kind={project.kind}
          hook={project.hook}
          headline={project.headline}
        />
        <div className="wrap">
          <Overview summary={project.overview.summary} bullets={project.overview.bullets} />
          <Story {...project.story} />
          <Architecture summary={project.architecture.summary} diagram={project.architecture.diagram} />
          <Highlights items={project.highlights} />
          <LimitationsList items={project.limitations} />

          {project.screenshots && (
            <div className="reveal" style={{ marginTop: 48 }}>
              <h2 className="work-subhead">Screenshots</h2>
              <Shot
                dataShots={imgs(project.screenshots.dir, project.screenshots.count)}
                alt={project.screenshots.alt}
              />
            </div>
          )}

          <ul className="chips reveal" style={{ marginTop: 40 }}>
            {project.chips.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>

          {project.links.length > 0 && (
            <div className="proj-links reveal">
              {project.links.map((l) => (
                <a
                  className="lnk"
                  key={l.href}
                  href={l.internal ? `/${l.href}` : l.href}
                  target={l.internal ? undefined : '_blank'}
                  rel={l.internal ? undefined : 'noopener'}
                >
                  {l.label} {l.internal ? '→' : '↗'}
                </a>
              ))}
            </div>
          )}
        </div>
        <ProjectNav prev={prev} next={next} />
      </main>
    </SmoothScroll>
  );
}
