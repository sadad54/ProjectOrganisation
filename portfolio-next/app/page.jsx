import Hero from './components/home/Hero';
import Thesis from './components/home/Thesis';
import About from './components/home/About';
import Decisions from './components/decisions/Decisions';
import Work from './components/work/Work';
import Research from './components/home/Research';
import Weights from './components/home/Weights';
import Contact from './components/home/Contact';
import Footer from './components/site/Footer';

/* The page is a forward pass: input → thesis → model card → attention (the
   decisions) → retrieval (the work) → evaluation (research) → weights (the
   toolkit) → output. Each section declares the neural-field formation it
   wants behind it with data-field. */
export default function Page() {
  return (
    <>
      <main id="main">
        <Hero />
        <Thesis />
        <About />
        <Decisions />
        <Work />
        <Research />
        <Weights />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
