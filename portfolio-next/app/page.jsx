import Hero from './components/home/Hero';
import Thesis from './components/home/Thesis';
import About from './components/home/About';
import Decisions from './components/decisions/Decisions';
import Work from './components/work/Work';
import Research from './components/home/Research';
import Weights from './components/home/Weights';
import Backward from './components/home/Backward';
import Contact from './components/home/Contact';
import Footer from './components/site/Footer';
import { CARD } from './data/profile';
import { SITE } from './lib/site';

const row = (k) => CARD.find((r) => r[0] === k)?.[1];
// structured data: who this site is about, built from the model card's rows
const PERSON = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Adnan Mashrur Sadad',
  url: SITE,
  jobTitle: row('Role'),
  description: row('Intended use'),
  address: { '@type': 'PostalAddress', addressLocality: 'Kuala Lumpur', addressCountry: 'MY' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Universiti Teknologi Malaysia' },
  knowsLanguage: (row('Languages') || '').split(' · '),
  sameAs: ['https://github.com/sadad54', 'https://www.linkedin.com/in/adnan-mashrur-sadad-87a45b237'],
};

/* The page is a forward pass: input → retrieval (the work, first, so the
   proof is one scroll away) → thesis → attention (the decisions) →
   evaluation (research) → model card → weights (the toolkit) → the backward
   pass (what trained it) → output. Each section declares the neural-field formation it
   wants behind it with data-field. */
export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON).replace(/</g, '\\u003c') }} />
      <main id="main">
        <Hero />
        <Work />
        <Thesis />
        <Decisions />
        <Research />
        <About />
        <Weights />
        <Backward />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
