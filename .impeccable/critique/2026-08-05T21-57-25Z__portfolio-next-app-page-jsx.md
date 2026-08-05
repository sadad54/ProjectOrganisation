---
target: hero, work rail, contact (portfolio-next/app/page.jsx)
total_score: 17
max_score: 32
na_heuristics: 7,10
p0_count: 1
p1_count: 2
timestamp: 2026-08-05T21-57-25Z
slug: portfolio-next-app-page-jsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Rail active-state and scroll `aria-current` work; WebGL canvases have no visible failure state if init silently partial-fails |
| 2 | Match Between System and Real World | 3 | Copy speaks the audience's language precisely (PR-AUC, SMOTE, schema repair) |
| 3 | User Control and Freedom | 2 | No "back to top of Work" once deep in the 7-panel scroll; motion has no in-page toggle beyond OS reduced-motion |
| 4 | Consistency and Standards | 3 | `.lnk`/`.tag`/`.btn` patterns reused consistently across all three sections |
| 5 | Error Prevention | 1 | Placeholder hrefs (`YOUR-DEMO-LINK-*`) ship live as real `<a href>` targets |
| 6 | Recognition Rather Than Recall | 2 | Rail shows name + number, but no shipped/in-progress signal until you click in |
| 7 | Flexibility and Efficiency of Use | n/a | Persuade-mode surface; no repeat-use efficiency need |
| 8 | Aesthetic and Minimalist Design | 3 | Restrained palette and clear scale; some risk of over-stacking simultaneous effects |
| 9 | Error Recovery | 1 | Placeholder links produce zero error/disabled state on click |
| 10 | Help and Documentation | n/a | Not applicable to a read-and-contact portfolio flow |
| **Total** | | **17/32** | **Acceptable (53%)** |

## Design Specificity Verdict

**LLM assessment**: Grounded, not template-generic, at the content layer — the WebGL "neural network" hero is a literal metaphor tied to the AI-engineer positioning, and the Work-rail animations (repair-loop, Monte Carlo sim) dramatize this candidate's actual project mechanics rather than generic copy. But the chrome around that content (pill buttons, mono eyebrows, dark+single-accent palette, magnetic cursor, command palette, grain overlay) is a fairly familiar "cinematic dev portfolio" kit — differentiation lives almost entirely in copy and the two bespoke canvases, not in the compositional structure of Hero/Work/Contact themselves.

**Deterministic scan**: 6 findings from `detect.mjs` against `index.html` (content-identical to the canonical `portfolio-next` app):
- `overused-font` (slop) — Google Fonts "Geist" family (line 14)
- `layout-transition` (quality) x4 — `transition:width/height` (`.cursor`, line 101, global chrome visible in Hero+Contact), `transition:padding-left` (`.tl-row`, line 311, About - out of scope), `transition:width` (`.loop-dot`, line 520, Approach carousel - out of scope), `transition:padding` (`.reach a`, line 592, Contact, in scope)
- `marquee` (slop) — infinite horizontal loop in Toolkit's `.marquee-track` (out of scope, incidental)

No false positives identified.

**Where they converge**: the detector's `overused-font` hit on Geist reinforces the LLM's own specificity verdict.

**Where the detector adds evidence**: the `.reach a` and `.cursor` `layout-transition` findings are concrete performance evidence supporting the P3 motion-stacking concern below.

**Visual overlays**: unavailable this run — no browser automation tool exposed, and `WebFetch` refused the localhost dev-server URL.

## Overall Impression

The site does the hard thing well (real metrics, real mechanism diagrams, an honest visa disclosure) and does the easy thing poorly: six of seven "Live demo" links and one repo link are live placeholder hrefs that will fail the moment a recruiter clicks the one action the page is built to drive.

## What's Working

- The repair-loop and Monte Carlo SVG animations are genuine "show, don't tell."
- `prefers-reduced-motion` is threaded through every motion system, not bolted on.
- The code "slab" blocks next to each project's prose give a technical reader a fast, verifiable artifact.

## Priority Issues

**[P0] Six of seven project "Live demo" links and one "Repository" link point to literal placeholder strings.**
Why it matters: undermines the site's own "no unstated placeholders presented as final" principle at the moment of highest engagement.
Fix: render `.lnk.demo`/`.lnk` as a disabled/greyed span with "Demo coming soon" copy when the href is a known placeholder token.
Suggested command: /impeccable harden

**[P1] Visa/sponsorship disclosure is visually under-weighted for its stakes.**
Why it matters: a hard qualifier styled like boilerplate risks being skipped by the persona most likely to filter on it early.
Fix: visible label/icon, slightly elevated treatment, or reposition closer to the primary CTA.
Suggested command: /impeccable typeset or /impeccable layout

**[P1] Work rail is a flat 7-item list with no categorization.**
Why it matters: violates the ≤4-visible-options guideline; forces opening every panel to find the AI-engineering depth the positioning says should lead.
Fix: group/sub-label the rail, or add a category/status cue for scanning.
Suggested command: /impeccable layout

**[P2] FinScout (in-progress) sits visually equal to six "Shipped" projects in the rail.**
Why it matters: no expectation-setting before the click.
Fix: in-rail status indicator (dot color, "WIP" suffix).
Suggested command: /impeccable clarify

**[P3] Simultaneous layered motion in Hero/Contact plus confirmed non-transform `layout-transition` hits on `.cursor` and `.reach a`.**
Why it matters: GPU/rAF cost stacks in the two sections most likely to hold attention; width/height/padding transitions trigger layout recalculation.
Fix: switch `.cursor`/`.reach a` transitions to transform/opacity; consider capping simultaneous effects per section.
Suggested command: /impeccable optimize

## Persona Red Flags

**Jordan (confused first-timer)**: rail labels have zero descriptor; most natural next click (demo link) is dead on 6 of 7 projects.

**Casey (distracted mobile user)**: `.work-rail{display:none}` below 980px removes jump-nav entirely on mobile; must scroll linearly through all 7 panels.

**Recruiter/hiring-manager (project-specific)**: flat rail forces opening every panel to assess fit; under-weighted visa disclosure is the highest-risk moment for this persona.

## Minor Observations

- "UTM '25" in hero status line has no expansion nearby.
- `.shot-label` fallback text leaks developer-facing copy to end users for missing screenshots.
- `.reach` lists 5 contact methods at equal weight despite lede stating email is fastest.
- Hero portrait alt text gives screen-reader users no context for the bobblehead render.

## Questions to Consider

1. If the differentiator is the reliability layer, why does the rail present all 7 projects as visual peers?
2. Is shipping 6 dead demo links and 1 dead repo link to real recruiters an acceptable risk right now?
3. Why does the visa disclosure's styling work against being noticed, given it's a confirmed honesty commitment?
