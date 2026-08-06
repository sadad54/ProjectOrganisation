---
name: Adnan Mashrur Sadad — Portfolio
description: A dark, single-signal engineering portfolio built around one warm accent glowing against near-total black.
colors:
  signal-orange: "#FF6A3D"
  alert-rose: "#E5484D"
  void-black: "#0B0B0D"
  surface-1: "#131315"
  surface-2: "#1B1B1E"
  warm-bone: "#F3F0EA"
  shadow-gray: "#8C8A87"
  shadow-gray-deep: "#48474A"
  hairline: "rgba(255,106,61,0.10)"
  hairline-faint: "rgba(255,106,61,0.05)"
typography:
  hero-display:
    fontFamily: "Geist, Helvetica Neue, sans-serif"
    fontSize: "clamp(3rem, 8.6vw, 8rem)"
    fontWeight: 600
    lineHeight: 0.94
    letterSpacing: "-0.042em"
  contact-display:
    fontFamily: "Geist, Helvetica Neue, sans-serif"
    fontSize: "clamp(2.3rem, 7vw, 5.4rem)"
    fontWeight: 600
    lineHeight: 0.96
    letterSpacing: "-0.042em"
  display:
    fontFamily: "Geist, Helvetica Neue, sans-serif"
    fontSize: "clamp(2rem, 4.6vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  project-name:
    fontFamily: "Geist, Helvetica Neue, sans-serif"
    fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  metric-value:
    fontFamily: "Geist, Helvetica Neue, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 2.1rem)"
    fontWeight: 600
    letterSpacing: "-0.03em"
  slide-heading:
    fontFamily: "Geist, Helvetica Neue, sans-serif"
    fontSize: "clamp(1.35rem, 2.6vw, 1.9rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  project-hook:
    fontFamily: "Geist, Helvetica Neue, sans-serif"
    fontSize: "clamp(1.1rem, 1.9vw, 1.5rem)"
    fontWeight: 300
    lineHeight: 1.28
    letterSpacing: "-0.015em"
  marquee:
    fontFamily: "Geist, Helvetica Neue, sans-serif"
    fontSize: "clamp(1.1rem, 2.2vw, 1.7rem)"
    fontWeight: 400
    letterSpacing: "-0.02em"
  lede:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.02rem, 1.35vw, 1.2rem)"
    fontWeight: 400
  about-body:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1rem, 1.25vw, 1.14rem)"
    fontWeight: 400
  hero-sub:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(0.98rem, 1.2vw, 1.1rem)"
    fontWeight: 400
  body:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(15px, 1.02vw, 17px)"
    fontWeight: 400
    lineHeight: 1.62
  body-secondary-lg:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.12rem"
    fontWeight: 600
  body-secondary:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 500
  body-secondary-sm:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.99rem"
    fontWeight: 400
  body-tertiary:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.96rem"
    fontWeight: 400
  body-tertiary-sm:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.94rem"
    fontWeight: 400
  body-quiet:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.92rem"
    fontWeight: 400
  label-lg:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
  label-md:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "11.5px"
    fontWeight: 400
  label:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.13em"
  label-sm:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "10.5px"
    fontWeight: 400
    letterSpacing: "0.1em"
  label-eyebrow:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "10px"
    fontWeight: 400
    letterSpacing: "0.2em"
  label-xs:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "9.5px"
    fontWeight: 400
    letterSpacing: "0.16em"
  label-2xs:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "9px"
    fontWeight: 400
    letterSpacing: "0.16em"
  label-3xs:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "8.5px"
    fontWeight: 400
    letterSpacing: "0.14em"
  label-micro:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "8px"
    fontWeight: 400
    letterSpacing: "0.14em"
rounded:
  focus-ring: "2px"
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  pill: "100px"
spacing:
  gutter: "clamp(20px, 5vw, 72px)"
  container: "1320px"
components:
  button-primary:
    backgroundColor: "{colors.warm-bone}"
    textColor: "{colors.void-black}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.void-black}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.warm-bone}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  button-ghost-hover:
    backgroundColor: "{colors.warm-bone}"
    textColor: "{colors.void-black}"
  tag:
    backgroundColor: "transparent"
    textColor: "{colors.shadow-gray}"
    rounded: "{rounded.pill}"
    padding: "5px 10px"
  tag-live:
    textColor: "{colors.signal-orange}"
  slab:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.shadow-gray}"
    rounded: "{rounded.sm}"
    padding: "20px"
---

# Design System: Adnan Mashrur Sadad — Portfolio

## Overview

**Creative North Star: "The Signal in the Dark"**

One warm indicator light against near-total darkness. The system's own code names the accent `--signal` before it names it `--sodium` — this isn't a metaphor imposed from outside, it's what the implementation already calls itself. The base surface (`--ink`, #0B0B0D) sits at the very edge of black, and exactly one hue — a warm orange-red — is allowed to glow against it: a pulsing status dot in the hero, a hover state on a button, the cursor of a running process. Everything else — text, borders, secondary surfaces — stays in a narrow band of warm grays and off-white, so the signal color reads as *information*, not decoration.

The system is unapologetically technical without being cold. Monospace labels (`Geist Mono`) carry metadata, timestamps, and status the way a terminal or a build log would; a distinctive "slab" component renders code and data with syntax-highlight-style inline color (comment / keyword / string / result), reinforcing that this is a working engineer's site, not a marketing template pretending to be one. Photography (the hero portrait, the About section photo) is the one place the system allows itself real depth — soft `drop-shadow` filters, not flat cards — floating those images above the flat plane everything else lives on.

Confirmed rejection: generic SaaS gradient-and-glassmorphism — gradient text, frosted-glass cards, pastel palettes, rounded-everything softness. None of that belongs here; the system's restraint (one accent, flat surfaces, hairline borders) is the entire point, not a placeholder waiting to be prettied up.

**Key Characteristics:**
- Near-black base with exactly one warm accent color, used sparingly and functionally (status, hover, active states)
- Monospace labels for all metadata/status text; a serif-free display face for headlines
- Flat by default — depth comes from hairline borders and tonal surface steps, not shadows
- A signature "slab" component renders code/data with terminal-style syntax coloring
- Motion is restrained and purposeful: a pulsing status dot, hover-only color shifts, WebGL ambient effects that never demand attention

## Colors

The palette is almost monochrome by design — a narrow range of near-black surfaces and warm off-white text — so that the single accent color reads unmistakably as *the* signal, not one of several competing colors.

### Primary
- **Signal Orange** (#FF6A3D): the system's only real color. Used for the status-pulse dot, button hover fills, active/current states (rail highlighting, active tabs), link hover, and the hero/contact ambient glow. **The One Signal Rule.** If it's orange, it means something is live, active, or being pointed at — the color is never used decoratively.

### Secondary (sparing)
- **Alert Rose** (#E5484D): reserved for "bad" or negative-outcome states only — a failed metric in a diagram, an error path in a flow visualization. Never used for standard UI chrome.

### Neutral
- **Void Black** (#0B0B0D): the base surface for the entire page.
- **Surface One** (#131315): the first elevated step — code slabs, cell backgrounds.
- **Surface Two** (#1B1B1E): hover state for surface-one elements.
- **Warm Bone** (#F3F0EA): primary text and the "inverted" fill color for solid buttons.
- **Shadow Gray** (#8C8A87): secondary/body text on dark surfaces.
- **Shadow Gray Deep** (#48474A): tertiary text, labels, and inactive states.
- **Hairline** (rgba(255,106,61,0.10)) / **Hairline Faint** (rgba(255,106,61,0.05)): borders and dividers — tinted with the accent hue at very low opacity rather than using pure gray, so even structural lines feel like part of the same signal system.

### Named Rules
**The One Signal Rule.** The accent color is used on a small fraction of any given screen, and always to mean something (active, live, hovered, pulsing) — never as background fill or decoration.

**The Translucency Rule.** Gradients, veils, glows, and borders are built by varying the *opacity* of an already-documented base color (`--ink`/void-black for darkening veils, `--sodium`/signal-orange for glows and hairlines, `--rose`/alert-rose for error emphasis, `--bone`/warm-bone for faint highlight washes) — never by introducing a new hue. A component using `rgba(255,106,61,0.24)` instead of the documented `rgba(255,106,61,0.10)` hairline is still using signal orange, just at a different translucency for a different purpose (a stronger visa-note border vs. a quiet divider); it is not a new color.

## Typography

**Display Font:** Geist (with Helvetica Neue, sans-serif fallback)
**Body Font:** Geist (with Helvetica Neue, Arial, sans-serif fallback)
**Label/Mono Font:** Geist Mono (with ui-monospace, SFMono-Regular, Menlo fallback)

**Character:** A single grotesque-sans family (Geist) carries both display and body duty, kept from feeling monotonous by a hard swap to Geist Mono for every label, tag, timestamp, and piece of metadata — the mono face is what signals "this is structural/technical," not a second display voice.

### Hierarchy
- **Hero Display** (600 weight, `clamp(3rem, 8.6vw, 8rem)`, 0.94 line-height, -0.042em tracking): the single "Hi, I'm Adnan." headline only.
- **Display** (600 weight, `clamp(2rem, 4.6vw, 3.5rem)`, 1.02 line-height, -0.03em tracking): section titles (`h2.title`) and project names.
- **Body** (400 weight, `clamp(15px, 1.02vw, 17px)`, 1.62 line-height): all prose copy; capped at a comfortable measure per paragraph (`max-width:46-62ch` depending on context).
- **Label** (400 weight, 8-13px in a fine ~0.5-1px ramp — `label-micro` through `label-lg` in the frontmatter — 0.1-0.2em tracking, uppercase): eyebrows, tags, timestamps, nav, button text, diagram annotations — always monospace, always tracked wide, almost always uppercase. The fine step size is deliberate: each component picks the density-appropriate step (a diagram annotation and a nav link are both "labels" but at different visual weights), not an accident of arbitrary values.

### Named Rules
**The Mono-Means-Metadata Rule.** Monospace type is never used for prose or headlines — only for labels, timestamps, code, and anything that represents system/status information.

## Layout

Content lives inside a `1320px` max-width container with a fluid gutter (`clamp(20px, 5vw, 72px)`) that scales with viewport width. Sections use generous vertical rhythm (`clamp(90px, 13vh, 170px)` between major bands). The Work section uses a two-column layout on desktop — a sticky left rail (fixed at `top:26vh`) alongside a scrolling right column of project panels — that collapses to a single column with the rail hidden below 980px. Most other sections respond at 820-900px by stacking to a single column and centering text. Density stays low throughout: one primary element per screen region, generous whitespace between groups.

## Elevation & Depth

Flat by default. **The Flat-By-Default Rule.** Nearly the entire system uses hairline borders (1px, accent-tinted) and stepped surface colors (`--ink` → `--ink-1` → `--ink-2`) to convey depth, not shadows — there is exactly one `box-shadow` in the whole system, `0 30px 90px rgba(0,0,0,.6)` on the command palette modal, reserved for the one surface that genuinely floats above everything else. Photography is the other deliberate exception: portrait images use `drop-shadow` filters (a soft dark shadow plus a faint accent-colored glow) to read as floating objects rather than flat content, which is what makes them feel like physical photographs rather than UI elements.

## Shapes

Two families of corner language, used consistently by role: fully pill-shaped (`border-radius:100px`) for anything interactive and clickable — buttons, tags, chips, status dots, carousel dots — and a small soft-radius family (4px / 6px / 8px / 10px) for containers, cards, and code slabs. Borders are always 1px and always accent-tinted (`--line` / `--line-2`) rather than neutral gray, even on structural dividers.

## Components

### Buttons
- **Shape:** fully pill-shaped (100px radius).
- **Primary (solid):** warm bone background, void-black text; on hover, the fill wipes to signal orange from behind via a `translateY` reveal, text stays void-black throughout.
- **Ghost:** transparent background, hairline border, warm bone text; on hover, fills to warm bone with void-black text (same wipe mechanic as primary, different destination color).
- **Hover / Focus:** all buttons share a `cubic-bezier(.22,1,.36,1)` ease on border-color/color/transform; the arrow glyph inside CTA buttons nudges right 4px on hover. Focus-visible gets a 2px signal-orange outline with 3px offset, site-wide.

### Tags / Chips
- **Tags** (`.tag`): pill-shaped, hairline border, small mono uppercase label. A `.live` or `.wip` modifier tints text and border to signal orange — the only thing distinguishing a status tag from a neutral metadata tag is that color.
- **Chips** (`.chips li`): small-radius (4px) rectangles, hairline border, mono label; border and text shift to signal orange on hover.

### Cards / Slabs (signature component)
- **Slab** (the code/data display block): surface-one background with a very faint top-to-bottom lightening gradient, 6px radius, hairline border, monospace body at 11.5px/1.85 line-height. Inline spans carry syntax-highlight-style roles: `.c` (comment) uses shadow-gray-deep, `.k` (keyword) uses signal orange, `.s` (string/value) also signal orange, `.r` (result/error) uses alert rose. This is the system's most distinctive component — it's what makes the site read as "built by an engineer" rather than "designed to look like one."
- **Cell** (bento/toolkit cards): surface-one background, 6px radius, hairline border; on hover, border tints to signal orange and the card lifts 3px with a subtle radial accent glow fading in behind it.

### Inputs
- **Command palette search:** borderless except a hairline bottom border, transparent background, monospace 13px text, warm-bone on focus (no visible focus ring — the modal context itself signals focus).

### Navigation
- **Top nav:** fixed, transparent until scrolled, then gains a blurred near-black background and hairline bottom border (`backdrop-filter:blur(14px)`). Links are shadow-gray, shifting to signal orange on hover; no underlines anywhere in the system.
- **Section rail** (right-edge dot nav): ticks grow from 20px to 40px and tint signal orange when their section is active; labels stay hidden until hover or active state.
- **Work rail:** a numbered (`01`-`07`), left-aligned list; the active project's number and text shift to warm bone / signal orange while inactive items stay shadow-gray-deep.

## Do's and Don'ts

### Do:
- **Do** treat signal orange as meaningful, not decorative — reserve it for active/live/hovered/pulsing states.
- **Do** use monospace exclusively for labels, metadata, timestamps, and code — never for prose or headlines.
- **Do** tint structural borders and dividers with the accent hue at low opacity (`--line`/`--line-2`) rather than neutral gray.
- **Do** keep buttons and tags fully pill-shaped; keep containers and cards in the 4-10px soft-radius family.
- **Do** reserve real `box-shadow` for the one genuinely floating surface (the command palette); use `drop-shadow` only on photographic content.

### Don't:
- **Don't** introduce a second accent color competing with signal orange — alert rose is the only other hue, and only for negative/error states.
- **Don't** use gradient text, frosted-glass/glassmorphism cards, pastel palettes, or rounded-everything softness — the confirmed anti-reference is generic SaaS-template aesthetics.
- **Don't** add box-shadow-based card elevation as a default pattern; the system's depth model is flat surfaces + hairline borders + stepped tone, not shadow layering.
- **Don't** use icon-only or underlined navigation; the system's link treatment is color-shift-on-hover, no underlines, and labeled (not icon-only) controls.
