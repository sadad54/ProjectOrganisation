import Parallels from '../backward/Parallels';
import Compound from '../backward/Compound';
import Corpus from '../backward/Corpus';

/* ∇ — the page so far is a forward pass. This is the other half of training:
   the backward pass, where the weights get changed. Three acts: the parallels
   between a brain and a model (pinned, on the same frame as L3), the
   arithmetic of small daily steps, and the things Adnan keeps going back to.
   All copy: app/data/priors.js. */
export default function Backward() {
  return (
    <section className="backward" id="backward" aria-labelledby="bw-h">
      <Parallels />
      <Compound />
      <Corpus />
    </section>
  );
}
