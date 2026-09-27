---
name: Adnan Mashrur Sadad — Portfolio
description: A dark, cinematic portfolio built as a neural network's forward pass. One warm signal on a cold, dim ground.
colors:
  void: "#050608"
  surface-1: "#0B0D11"
  surface-2: "#11141A"
  surface-3: "#181C24"
  surface-4: "#20252F"
  text: "#EEEBE4"
  text-secondary: "#A6A39C"
  text-tertiary: "#85837D"
  hairline: "rgba(238,235,228,0.08)"
  hairline-2: "rgba(238,235,228,0.14)"
  hairline-3: "rgba(238,235,228,0.22)"
  ember: "#FF6B3D"
  ember-hover: "#FF8A63"
  ember-press: "#E4521F"
  cool: "#A9BBFF"
  pass: "#52E3A8"
  fail: "#FF5470"
typography:
  display:
    fontFamily: "Archivo (variable: wdth 62–125, wght 100–900)"
    usage: "Headlines, project names, big numbers. Set semi-expanded (font-stretch 104–118%), weight 520–640, tight tracking (-0.03 to -0.05em)."
  accent:
    fontFamily: "Instrument Serif, italic"
    usage: "The emphasised clause of a headline, hooks, pull lines. Never a whole paragraph."
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

*(2026-09-27. Supersedes "Ink on Paper". The paper theme was retired because almost every project
asset, from the walkthrough posters to the dashboards and phone screens, is dark UI, and on paper those
read as heavy black blocks. The rim-lit hero portrait was always lit for a dark ground.)*

## North star

The site is a model you can look inside. Scrolling is a forward pass: every section is a layer
(L0 Input → L1 Thesis → L2 Model card → L3 Attention → L4 Retrieval → L5 Evaluation → L6 Weights → Out),
and a single WebGL neural field behind the page re-forms per layer. Motion is the argument, never
decoration: the headline is *generated*, the work index is a *working search engine*, the decisions
*draw themselves*, and the case-study limitations are written the way a model card writes them.

## Colour: the activation rule

The palette works like an activation map. Almost everything sits cold and dim, and the few things that
are live run hot.

- **Ember** (`#FF6B3D`) is the only UI accent. It marks the active, hovered, selected or firing
  thing and the number that matters, and it colours the serif-italic headline clause. It never fills
  large areas.
- **Cool** (`#A9BBFF`) is data only: the neural field's resting particles, diagram structure, and the
  "ML & data" domain in the work console. It is never used for chrome.
- **Pass / fail** (`#52E3A8` / `#FF5470`) are diagram semantics: valid vs rejected, detection vs
  false alarm, recovery vs collapse. They are never used for buttons or links.
- Hairlines are neutral (warm-white at 8–22% alpha), never tinted.
- Text steps (`text` / `text-2` / `text-3`) all pass WCAG AA on `void`. `text-3` (~5.3:1) is the floor
  for small mono labels.

Domain colours in the work console: LLM systems = ember, ML & data = cool, Mobile & vision = pass,
Systems & search = text-secondary.

## Typography

Archivo (variable width) carries the display voice, set semi-expanded and tight. The emphasised
clause of a headline switches to Instrument Serif italic in ember, for example "I build LLM systems
that *check their own work.*" There is one accent clause per headline. Geist Mono is metadata only:
layer tags, labels, status, code. Instrument Sans is for prose.

## Surfaces and depth

The ground is `void`. Panels (the console, cards, the composer, the decision stage) are near-black at
around 80–90% opacity with a backdrop blur, a 1px hairline and a large soft shadow. They float above
the field like instruments, and the console carries corner ticks to read as a device rather than a
card. There is no glassmorphism beyond that one treatment, no gradient text, and no pastel.

## Motion

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

## Components

- **Buttons:** pill, mono uppercase label. The fill wipes up from below on hover. `btn-solid` is
  ember. Primary actions get magnetic attraction.
- **Links (`.lnk`):** mono uppercase with an underline that sweeps out and back in ember.
- **Layer tag (`.layer`):** three live bars, then `L4 Retrieval — selected work`. Every section opens
  with one.
- **Chips:** 4px radius, mono, hairline border.
- **Slab:** the code/data block. Mono, with syntax roles `.c` comment, `.k` ember, `.s` cool,
  `.r` fail.
- **Cursor:** a dot plus a trailing ring. `data-cursor="Verb"` grows it into an ember disc labelled
  with what a click will do.

## Don'ts

- Don't add a second UI accent. Ember is the signal, and cool/pass/fail stay inside data.
- Don't bring back the paper theme or a light mode without re-lighting the project assets.
- Don't add scroll-jacking beyond the two pinned sections (Thesis, Decisions), and never on mobile or
  under reduced motion.
- Don't put invented numbers anywhere, including decorative ones. Visualisations draw real figures to
  scale, for example the 8.6% waffle is 43 of 500 cells.
