import Split from '../site/Split';
import { CORPUS } from '../../data/priors';
import Glyph from './Glyph';

/* Act C — the training corpus: the books, thinkers and off-hours things that
   moved the weights, set as a ledger in the work console's list language.
   Rows, not panels: the field behind is a turning night sky, and it should
   stay in view. */
export default function Corpus() {
  let n = 0;
  return (
    <div className="bw-corpus">
      <div className="wrap">
        <div className="bw-sky" data-field="8" data-field-dim="1">
          <p className="bw-sky-cap rv-fade" aria-hidden="true">
            <span>after The Starry Night, 1889</span>
            <span>particles on orbits · drawn as strokes</span>
          </p>
          <div className="bw-sky-head">
            <p className="layer rv">
              <span className="bars" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <b>D</b> Training corpus <span className="rule" aria-hidden="true" /> what moved the weights
            </p>
            <Split as="h2" className="display" text={['None of this is on my résumé. ', { t: 'All of it is in the work.', em: true }]} />
          </div>
        </div>

        {/* the sky dims behind the rows so the type always wins */}
        <div className="bw-ledger" data-field="8" data-field-dim="0.42">
          {CORPUS.map((g) => (
            <section className="bw-group" key={g.group} aria-label={g.group}>
              <p className="bw-gname rv">
                {g.group} <span>{String(g.items.length).padStart(2, '0')}</span>
              </p>
              <ul>
                {g.items.map((it, i) => (
                  <li className="bw-row rv" key={it.name} style={{ '--d': i * 60 }}>
                    <span className="bw-n" aria-hidden="true">
                      {String(++n).padStart(2, '0')}
                    </span>
                    <div className="bw-id">
                      <h3 className="bw-name">{it.name}</h3>
                      <p className="bw-by">{it.by}</p>
                    </div>
                    <figure className="bw-fig">
                      <Glyph name={it.g} />
                      <figcaption className="bw-k">
                        <span>{it.k}</span>
                      </figcaption>
                    </figure>
                    <p className="bw-says">{it.says}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
