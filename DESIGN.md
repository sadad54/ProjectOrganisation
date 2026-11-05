---
name: Adnan Mashrur Sadad — Portfolio
description: A dark, cinematic portfolio built as a neural network's forward pass. Monochrome chrome on a midnight ground; colour only where something emits light or reports a result.
colors:
  void: "#02070A"
  surface-1: "#08111A"
  surface-2: "#0D1722"
  surface-3: "#131F2B"
  surface-4: "#1A2734"
  text: "#EAF1F6"
  text-secondary: "#9DA9B4"
  text-tertiary: "#7C8894"
  hairline: "rgba(234,241,246,0.08)"
  hairline-2: "rgba(234,241,246,0.14)"
  hairline-3: "rgba(234,241,246,0.22)"
  signal: "#38B4FF"
  signal-hover: "#6CC8FF"
  indigo: "#582EFF"
  cool: "#8B7BFF"
  mint: "#52FFA5"
  lit-gradient: "#7A5CFF → #38B4FF → #52FFA5"
  depth-ramp: "#8B7BFF #7F8AFF #6F99FF #5AA7FF #38B4FF #3ACFE6 #43E8C9 #52FFA5"
  pass: "#52FFA5"
  fail: "#FF5470"
typography:
  display:
    fontFamily: "Archivo (variable: wdth 62–125, wght 100–900)"
    usage: "Headlines, project names, big numbers. Set semi-expanded (font-stretch 104–118%), weight 520–640, tight tracking (-0.03 to -0.05em)."
  accent:
    fontFamily: "Archivo at its condensed extreme (wdth 62%), weight 500"
    usage: "The emphasised clause of a headline, hooks, pull lines. The same family pulled to its narrowest cut, never a second typeface. Never a whole paragraph."
  body:
    fontFamily: "Instrument Sans"
    usage: "All prose."
  mono:
    fontFamily: "Geist Mono"
    usage: "Labels, metadata, status, code, layer tags. Uppercase and tracked wide for labels."
rounded:
  xs: "4px"
  sm: "6px"
  md: "10px"
  lg: "16px"
  pill: "999px"
spacing:
  gutter: "clamp(18px, 4.6vw, 68px)"
  container: "1380px"
motion:
  ease-out: "cubic-bezier(.16,1,.3,1)"
  ease-in-out: "cubic-bezier(.76,0,.24,1)"
  ease-soft: "cubic-bezier(.4,0,.2,1)"
---

# Design System: "Activation"

*(2026-11-05. The palette moved from "one warm signal" to indigo / light blue / mint, and the
serif-italic accent became a condensed cut of Archivo. Ember orange plus a serif-italic clause had
become the stock look of AI-generated sites. 2026-09-27: supersedes "Ink on Paper". The paper theme
was retired because almost every project asset, from the walkthrough posters to the dashboards and
phone screens, is dark UI, and on paper those read as heavy black blocks. The rim-lit hero portrait
was always lit for a dark ground.)*

## North star

The site is a model you can look inside. Scrolling is a forward pass: every section is a layer
(L0 Input → L1 Thesis → L2 Model card → L3 Attention → L4 Retrieval → L5 Evaluation → L6 Weights → Out),
and a single WebGL neural field behind the page re-forms per layer. Motion is the argument, never
decoration: the headline is *generated*, the work index is a *working search engine*, the decisions
*draw themselves*, and the case-study limitations are written the way a model card writes them.

## Colour: light, not paint

The palette works like an activation map read by brightness. The chrome (buttons, borders, labels) is
monochrome: white, black and neutral hairlines. Colour appears only where something emits light or
reports a real result.

- **Signal** (`#38B4FF`, ~8.8:1 on void) is the one UI accent: focus rings, selection, the active
  tab, live carets, the portrait's rim light. It marks state; it doesn't fill buttons.
- **Indigo** (`#582EFF`, ~3:1) is atmosphere only: the neural field's resting particles, the aurora
  column, background blooms, the portrait's spill. It is never text. Where indigo has to be read
  (the Ask the model surfaces, the ML domain), use **cool** (`#8B7BFF`, ~6:1).
- **Mint** (`#52FFA5`) is the brightest thing on any screen: the availability dot, passing results
  and the numbers that came out of a model or an eval (case-study headline metrics, similarity
  scores). It doubles as `pass`.
- **The lit gradient** (indigo → signal → mint) is reserved for what glows: the hero headline's
  emphasised clause and the brightest particles. It is the only gradient text on the site.
- **Depth ramp** (`--d0` … `--d7`, OKLab-even, every step ≥ 6:1). The forward pass in colour: each
  section sets `--lc` from its layer, and its layer tag, heading emphasis and rail node read it. Input
  is indigo, the middle of the pass is light blue, and the output is mint. The neural field's hot
  colour follows the same walk as you scroll (`depthHot` in `engine.js`).
- **Pass / fail** (`#52FFA5` / `#FF5470`) are diagram semantics: valid vs rejected, detection vs
  false alarm, recovery vs collapse.
- Hairlines are neutral (cool-white at 8–22% alpha), never tinted.
- Text steps (`text` / `text-2` / `text-3`) all pass WCAG AA on `void`. `text-3` (~5.3:1) is the floor
  for small mono labels.

Domain colours in the work console: LLM systems = signal, ML & data = cool, Mobile & vision = pass,
Client web = sun, Systems & search = text-secondary.

## Typography

Archivo (variable width) carries the display voice, set semi-expanded and tight. The emphasised
clause of a headline is the same family pulled to its condensed extreme (`font-stretch:62%`), for
example "I build LLM systems that *check their own work.*" The contrast is width, not a second
typeface. In split headings the clause arrives wide and draws in to its condensed cut as the words
rise. There is one accent clause per headline, and only three headlines carry one: the hero, About and
Contact. Repeated everywhere, a signature becomes a template. Other sections open on a real number
(`.opener-num`, e.g. Work's build count, computed from the data) or a plain strong sentence.

Mono uppercase is for data and the layer metaphor only. Each layer tag reads `L4 Retrieval —` in
mono, then its plain-language gloss (`selected work`) in body type (`.layer-gloss`), so the metaphor
never costs a reader the meaning. Headings balance, prose wraps `pretty`, and every figure that can sit
beside another uses tabular numerals. Geist Mono is metadata only: layer tags, labels,
status, code. Instrument Sans is for prose.

## Surfaces and depth

The ground is `void`. Panels (the console, cards, the composer, the decision stage) are near-black at
around 80–90% opacity with a backdrop blur, a 1px hairline and a large soft shadow. They float above
the field like instruments, and the console carries corner ticks to read as a device rather than a
card. There is no glassmorphism beyond that one treatment, no gradient text beyond the hero clause,
and no pastel.

The pointer acts as a rim light: on a mouse, the card under it catches a light-blue edge on the
side nearest the cursor, falling off to indigo (`RimLight.jsx`, one fixed overlay masked to a 1px
ring). Project images (`.media`) rest in greyscale and get their colour back on hover, with a soft
attention-map bloom where the pointer is. Touch devices always see full colour.

## Motion

**One perpetual loop per screen, and it is the field.** Everything else animates once, when something
changes, and stops: layer bars fire on arrival, live dots ping twice and then glow, carets blink a few
times and go solid, the ask bar's rim scans once, its placeholder streams each question once and
settles, the work console tours the case studies once, and multi-screen projects cycle one lap. Grain
is static. Restlessness reads as noise, not life.

- **Easing:** arrivals use `ease-out` (expo-ish), morphs and wipes use `ease-in-out`, small state
  changes use `ease-soft`.
- **Reveals:** a site-wide IntersectionObserver sets `data-in` (an attribute, because React owns
  `className`). Headlines rise word by word out of masks. Content never hides unless `html.js` is set,
  and a failsafe shows everything if the bundle never loads.
- **Signature moments:** the token-streamed hero, the neural field's morphs, the console's denoise
  transition and FLIP re-ranking, the pinned decision theater, the route-transition cell wipe, and the
  boot sequence (first visit per session only).
- **Reduced motion** (OS or ⌘K) shows a still field, final states, no pins, no autoplay and no
  preloader. This is a hard requirement, not a nice-to-have.

## Hero

One headline, one sentence, one action, one input. Availability lives in the nav (`.nav-open`) on wide
screens and as a single line above the headline on phones. The floating "Ask anything" hint waits until
the visitor has scrolled past the hero, since the hero already holds the ask bar.

The portrait is two plates that add back up to the photograph: the subject (`portrait-hero-base`) and
the light that falls on it (`portrait-hero-rim`, keyed from the blue in the recoloured plate), added
with `mix-blend-mode: plus-lighter`. On a mouse, the rim's brightness follows the pointer's distance
to the key light off the subject's left shoulder (`--rim`, 0.22–1.92): a glint from across the screen,
a burn beside it.

## Research and case studies

Research is laid out as papers (`components/research/Paper.jsx`, data in `data/research.js`): status,
byline with authorship, summary, one numbered figure (`Fig. n`) with a caption that states what is
drawn to scale, findings, and the actions a reader takes: request the manuscript, read the code, and
Copy BibTeX, which appears only once a paper has a real venue. `/research` is the page to send a
prospective supervisor: an academic profile strip, both papers in full, and a contact block.

Case studies read like technical reports: results as a numbered ruled list with tabular figures,
diagrams and galleries as numbered, captioned figures, a ~68ch measure, and margin notes (the headline
result, the limitations gloss) that leave the text column on screens ≥1320px. From the work stage, the
project name morphs into the case study's title through the View Transitions API (`data-vt`,
`goShared` in `PageTransition.jsx`); everywhere else, and in older browsers, the cell wipe runs.

## Rhythm

Four spacing steps (`--sp-s/m/l/xl`). Density follows content: Work and Research sit tighter so
their instruments read as one surface; Contact gets the most room.

## Performance

Phones (coarse pointer, small screen), Save-Data or 2G, `prefers-reduced-data`, and devices with
≤4 GB memory or ≤4 cores get `field-still.webp`, a still rendered from the engine, instead of the live
field, and never download three.js. A live field that stutters reads worse than a still one that
doesn't. The portrait ships 640w and 1000w plates.

## Components

- **Buttons:** pill, mono uppercase label. The fill wipes up from below on hover. `btn-solid` is
  white with void text, and its hover wipes to black. Controls stay monochrome. Primary actions get
  magnetic attraction.
- **Links (`.lnk`):** mono uppercase with an underline that sweeps out and back in signal.
- **Layer tag (`.layer`):** three live bars, then `L4 Retrieval — selected work`, in the layer's
  depth colour. Every section opens with one.
- **Rail:** one node per layer, each in its depth colour; the fill reveals the full ramp as you
  descend.
- **Chips:** 4px radius, mono, hairline border.
- **Slab:** the code/data block. Mono, with syntax roles `.c` comment, `.k` signal, `.s` cool,
  `.r` fail.
- **Cursor:** a dot plus a trailing ring. `data-cursor="Verb"` grows it into a white disc labelled
  with what a click will do.

## Don'ts

- Don't add a second UI accent, and don't fill controls with colour. Signal marks state; indigo is
  light; mint is reserved for live and measured.
- Don't use raw indigo for text, or the lit gradient anywhere but the hero clause.
- Don't add purple-to-blue gradient backgrounds, frosted cards beyond the panel treatment, or glows
  on every border: that is where this palette turns generic.
- Don't bring back the paper theme or a light mode without re-lighting the project assets.
- Don't add scroll-jacking beyond the two pinned sections (Thesis, Decisions), and never on mobile or
  under reduced motion.
- Don't add a second perpetual animation. The field is the only thing that moves forever.
- Don't reuse the condensed accent clause beyond the hero, About and Contact.
- Don't put invented numbers anywhere, including decorative ones. Visualisations draw real figures to
  scale, for example the 8.6% waffle is 43 of 500 cells.
