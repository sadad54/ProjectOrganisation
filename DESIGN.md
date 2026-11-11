---
name: Adnan Mashrur Sadad — Portfolio
description: A night-blue portfolio built as a neural network's forward pass. One lamp-yellow signal on a deep ultramarine ground.
colors:
  void: "#060A1D"
  surface-1: "#0A102A"
  surface-2: "#0F1735"
  surface-3: "#151F42"
  surface-4: "#1C2850"
  text: "#F3EEE1"
  text-secondary: "#B0B3C6"
  text-tertiary: "#8A8EAB"
  hairline: "rgba(243,238,225,0.08)"
  hairline-2: "rgba(243,238,225,0.14)"
  hairline-3: "rgba(243,238,225,0.22)"
  signal: "#F5B83D"
  signal-hover: "#FBD068"
  signal-press: "#D9982A"
  cool: "#4F9BE6"
  sun: "#F6DF9A"
  rose: "#E08A9B"
  pass: "#63DBA6"
  fail: "#FF6B7A"
typography:
  display:
    fontFamily: "Newsreader (variable: opsz 6–72, wght 200–800, roman and italic)"
    usage: "Headlines, project names, big numbers. Weight 500, tracking no tighter than -0.022em, lining figures."
  accent:
    fontFamily: "Newsreader italic (the display face's own italic)"
    usage: "The emphasised clause of a headline, hooks, pull lines. Never a whole paragraph."
  body:
    fontFamily: "Source Sans 3"
    usage: "All prose."
  mono:
    fontFamily: "IBM Plex Mono"
    usage: "Data, code, measurements and short labels. Labels are 11px or larger, tracked at 0.07–0.09em."
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

# Design System: "Nocturne"

*(2026-09-27. Supersedes "Ink on Paper". The paper theme was retired because almost every project
asset, from the walkthrough posters to the dashboards and phone screens, is dark UI, and on paper those
read as heavy black blocks. The rim-lit hero portrait was always lit for a dark ground.)*

## North star

The site is a model you can look inside. Scrolling is a forward pass: every section is a layer
(L0 Input → L1 Thesis → L2 Model card → L3 Attention → L4 Retrieval → L5 Evaluation → L6 Weights → ∇ Backward pass → Out),
and a single WebGL neural field behind the page re-forms per layer. Motion is the argument, never
decoration: the headline is *generated*, the work index is a *working search engine*, the decisions
*draw themselves*, and the case-study limitations are written the way a model card writes them.

## Colour: one painting

*(2026-11-11. "Nocturne" replaces the "Activation" palette of near-black, neon orange and electric blue,
which read as a default dark-tech scheme. The rule is the same; the colours now come from somewhere.)*

The palette is taken from The Starry Night, the painting the ∇ Backward pass section already draws in
particles: a deep ultramarine night, lamp yellow, warm paper white, cerulean. It also sits well beside
the warm rim light in the hero portrait. Almost everything stays in the cold night, and the few things
that are live are lit.

- **Signal** (`#F5B83D`, lamp yellow) is the only UI accent. It marks the active, hovered, selected or
  firing thing and the number that matters, and it colours the italic clause of a headline. It never
  fills large areas, and it is always flat: no gradient text.
- **Cool** (`#4F9BE6`, cerulean) is data only: the neural field's resting particles, diagram structure,
  and the "ML & data" domain in the work console. It is never used for chrome.
- **Sun** (`#F6DF9A`, starlight) belongs to the corpus ledger and its sky. **Rose** (`#E08A9B`) is the
  "client web" domain in the work console. Neither appears in chrome.
- **Pass / fail** (`#63DBA6` / `#FF6B7A`) are diagram semantics: valid vs rejected, detection vs
  false alarm, recovery vs collapse. They are never used for buttons or links.
- Text is warm paper white (`#F3EEE1`); secondary and tertiary text are tinted from the ground's blue
  (`#B0B3C6`, `#8A8EAB`), not neutral grey. The smallest pairing is 5.5:1.
- Hairlines are paper white at 8–22% alpha, never tinted.

## Type: a well-set paper

*(2026-11-11. Replaces Archivo + Instrument Serif italic + Instrument Sans + Geist Mono. A wide grotesk
with one clause in a borrowed serif italic, plus tracked mono micro-labels everywhere, had become the
most common pairing on machine-made sites.)*

The site is built around a model card and a reading list, so it is set like a paper.

- **Newsreader** carries every headline, project name and large number, at weight 500. Emphasis inside
  a headline is the same family's italic in the signal colour: one family, never a second script.
- **Source Sans 3** is for everything meant to be read. Body text is 16px or larger.
- **IBM Plex Mono** is for data, code, measurements and short labels only. Labels are at least 11px and
  tracked at 0.07–0.09em. If a line is a sentence, it is not set in mono.
- Figures are lining everywhere, and tabular wherever they change or align.

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
  the signal colour. Primary actions get magnetic attraction.
- **Links (`.lnk`):** mono uppercase with an underline that sweeps out and back in the signal colour.
- **Layer tag (`.layer`):** three live bars, then `L4 Retrieval — selected work`. Every section opens
  with one.
- **Chips:** 4px radius, mono, hairline border.
- **Slab:** the code/data block. Mono, with syntax roles `.c` comment, `.k` signal, `.s` cool,
  `.r` fail.
- **Cursor:** a dot plus a trailing ring. `data-cursor="Verb"` grows it into a signal-yellow disc labelled
  with what a click will do.

## Don'ts

- Don't add a second UI accent. Ember is the signal, and cool/pass/fail stay inside data.
- Don't bring back the paper theme or a light mode without re-lighting the project assets.
- Don't add scroll-jacking beyond the two pinned sections (Thesis, Decisions), and never on mobile or
  under reduced motion.
- Don't put invented numbers anywhere, including decorative ones. Visualisations draw real figures to
  scale, for example the 8.6% waffle is 43 of 500 cells.
