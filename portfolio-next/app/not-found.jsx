export const metadata = { title: 'Not found — Adnan Mashrur Sadad' };

/* 404, in the site's own vocabulary. */
export default function NotFound() {
  return (
    <main id="main" className="nf" data-field="1" data-field-dim="0.6">
      <div className="wrap">
        <p className="layer">
          <b>404</b> Out of vocabulary
        </p>
        <h1 className="display nf-h">
          That token isn’t <em>in the vocabulary.</em>
        </h1>
        <p className="lede">
          The page you asked for doesn’t exist — or it moved when the site was rebuilt. The index has everything that
          does.
        </p>
        <div className="nf-cta">
          <a className="btn btn-solid" href="/" data-pt="the index">
            Back to the index <span className="arw">→</span>
          </a>
          <a className="btn" href="/#work" data-pt="the work">
            Browse the work
          </a>
        </div>
      </div>
    </main>
  );
}
