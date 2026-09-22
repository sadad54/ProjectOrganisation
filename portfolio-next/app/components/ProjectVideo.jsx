'use client';

import { useState } from 'react';

/* ---------------------------------------------------------------------------
   Walkthrough video, click-to-play. Starts as a poster frame with a play
   button (same affordance the old VideoPlaceholder promised) so nothing
   autoplays with sound as it scrolls into view. Shared by the homepage
   Work section cards and the project-detail hero so both read as one system.
--------------------------------------------------------------------------- */
export function walkthrough(slug) {
  return {
    src: `/assets/walkthroughs/${slug}.mp4`,
    poster: `/assets/walkthroughs/${slug}_thumbnail.jpg`,
  };
}

export default function ProjectVideo({ slug, name, alt, variant = 'card' }) {
  const [playing, setPlaying] = useState(false);
  const { src, poster } = walkthrough(slug);
  const label = alt || `${name} walkthrough`;

  return (
    <div className={`proj-video proj-video-${variant}${playing ? ' is-playing' : ''}`}>
      {playing ? (
        <video className="proj-video-el" src={src} poster={poster} controls autoPlay playsInline aria-label={label} />
      ) : (
        <button type="button" className="proj-video-poster" onClick={() => setPlaying(true)} aria-label={`Play ${label}`}>
          <img src={poster} alt={label} loading="lazy" />
          <span className="proj-video-play" aria-hidden="true">
            &#9654;
          </span>
        </button>
      )}
    </div>
  );
}
