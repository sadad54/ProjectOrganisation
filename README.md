# adnan.dev — portfolio

A Next.js site that reads like a model's forward pass. Every section is a layer, and a single WebGL
"neural field" behind the page re-forms as you move through them.

```
portfolio-next/     the site (Next.js App Router)
```

## Run it

```bash
cd portfolio-next
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all case-study pages prerender)
```

Deploy `portfolio-next/` to Vercel (framework preset: Next.js), or any Node host that runs `next start`.

## Add a project

Add one object to **`portfolio-next/app/data/work.js`**. That's the whole change. The work console's
index, its search engine, the similarity map, the command palette (⌘K) and the skills graph all read
from that array. The schema is documented at the top of the file:

- `tier: 'case'`: flagship. Walkthrough video at `public/assets/walkthroughs/<slug>.mp4` (+ `<slug>_thumbnail.jpg`)
  and a case-study page; add `app/data/projects/<slug>.js` and register it in `app/data/projects/index.js`.
- `tier: 'build'`: screenshots listed in `media.files` (`frame: 'desktop'` for browser frames, `'phone'` for a device fan).
- `tier: 'archive'`: text only. The stage draws a generative "fingerprint" seeded from the slug.

The console is a fixed-height instrument, so the page never gets longer as projects are added.

Skills for the toolkit graph live in `app/data/skills.js`. Each skill lists the stack names it matches,
and edges are derived from each project's `stack`.

## What's where

| Layer | Section | Component |
|---|---|---|
| L0 Input | Hero: token-streamed headline, rim-lit portrait | `components/home/Hero.jsx` |
| L1 Thesis | Scroll-lit statement | `components/home/Thesis.jsx` |
| L2 Model card | About, written as an ML model card, with a detector pass on the photo | `components/home/About.jsx` |
| L3 Attention | Four engineering decisions in one pinned, scroll-drawn stage | `components/decisions/` |
| L4 Retrieval | The work console: index, stage, map | `components/work/` |
| L5 Evaluation | Research | `components/home/Research.jsx` |
| L6 Weights | Skills × projects graph | `components/home/Weights.jsx` |
| Out | Contact composer | `components/home/Contact.jsx` |

Persistent across routes (in the root layout, `components/site/Providers.jsx`): Lenis smooth scroll,
the neural field, the cursor, the route-transition wipe, the boot sequence and the ⌘K palette.

### The neural field (`app/lib/neural/`)

One Three.js context. About 16k particles (8k on small or low-core devices) carry a position for each of
six formations: a 7-layer network with flowing synapses, attention arcs, a clustered hypersphere, a
wireframe loss landscape with a real gradient-descent run, semantic clusters, and a stacked weight
tensor. The vertex shader blends between formations, so a morph costs one uniform write per frame.
Sections pick a formation with `data-field="<n>"` (and optionally `data-field-dim`). The pointer is a
query ray, and clicks send a shockwave. Frame times are monitored and quality drops once if a device
struggles. The field pauses when the tab is hidden.

### The work console (`components/work/`)

- `retrieval.js`: TF-IDF with query expansion and prefix matching, cosine ranking, nearest
  neighbours, and a seeded force layout for the map.
- `board.js`: composes a project's media into one bitmap (poster, browser window, phone fan or
  generated fingerprint).
- `denoise.js`: the stage transition, a diffusion-style forward-noise / stepped-denoise pass in raw WebGL.

## Accessibility and fallbacks

- `prefers-reduced-motion` (or ⌘K → "Reduce motion") shows a still field and no preloader. Pinned
  sections unpin into a static layout, autoplay and token streaming stop, and content is shown in its
  final state.
- Without WebGL, a CSS gradient replaces the field. Without JS, all content is server-rendered and
  readable, and the work index falls back to a plain list.
- The console is a keyboard tablist (arrows, Home/End). The palette traps focus and returns it on close.
- axe-core reports no violations on the homepage or a case study.

## Before you publish

- Share previews: `app/opengraph-image.jpg` (and the matching `twitter-image.jpg`) is a 1200×630
  capture of the real hero. On Vercel the image URLs resolve by themselves. On any other host, set
  `SITE_URL=https://your-domain` at build time. If the hero copy changes, re-capture the image.
- Demo links: none of the projects has a live demo URL yet. When one is deployed, add it to that
  project's `links` in `app/data/work.js`.
- `sadad54/AuraFinalPF` and `sadad54/chatbotZUS` are private, so their repo links won't resolve for a
  visitor until they're public. The Fraud Detection project has no public repo yet, so it has no
  repository link.
- ProofHire screenshots: `public/assets/screenshots/proofhire/` is empty, so the case study simply
  has no gallery until files are added. The page lists what's on disk at build time.
