'use client';

/* ---------------------------------------------------------------------------
   Screenshot carousel. The autoplay / manual-nav / crossfade behaviour lives
   in `app/components/project/shotCarousel.js` (`initShotCarousels()`), called
   once by both the homepage (via siteScript.js §13) and by project detail
   pages (via ProjectPage.jsx), so there is exactly one implementation.

   Every project that ships this component real screenshots; if a file 404s
   at runtime the onError handler collapses the frame to nothing
   (`.shot.empty { display:none }`) rather than showing a broken-image icon.
--------------------------------------------------------------------------- */
export function imgs(dir, n) {
  return JSON.stringify(
    Array.from({ length: n }, (_, i) => `/assets/screenshots/${dir}/${String(i + 1).padStart(2, '0')}.png`)
  );
}

export default function Shot({ dataShots, alt, mobileFit }) {
  if (process.env.NODE_ENV === 'development') {
    let arr = null;
    try {
      arr = JSON.parse(dataShots);
    } catch {
      /* fall through */
    }
    if (!Array.isArray(arr) || arr.length === 0) {
      // eslint-disable-next-line no-console
      console.warn(`[shot] missing or empty screenshot set for: ${alt}`);
    }
  }

  return (
    <div className={`shot${mobileFit ? ' mobile-fit' : ''}`} data-shots={dataShots}>
      <img
        src={JSON.parse(dataShots)[0]}
        alt={alt}
        loading="lazy"
        onError={(e) => e.currentTarget.closest('.shot').classList.add('empty')}
      />
      <button className="shot-arrow prev" data-shot-prev aria-label="Previous screenshot">
        &larr;
      </button>
      <button className="shot-arrow next" data-shot-next aria-label="Next screenshot">
        &rarr;
      </button>
      <div className="shot-dots" data-shot-dots></div>
    </div>
  );
}
