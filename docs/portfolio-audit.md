# Portfolio audit and editorial redesign

## Revision 2 — personality and scrollytelling

The owner preferred a more vibrant direction and explicitly requested the original interactive neural field. This revision restores the pointer-responsive field with a scroll-interpolated tangerine, periwinkle, and mint palette. A three-chapter project story now pairs the problem, engineering decision, and result with existing product screenshots. The hero introduces Adnan personally; project accents and a mint contact section extend the colour throughout the page.

Desktop storytelling uses one 260svh sequence. Narrow or short screens and reduced-motion mode show every chapter in normal flow. The restored background responds to the OS and manual motion settings, redraws on resize, and pauses its animation when the tab is hidden. The prior audit below records the first iteration; its removal of the neural field and restrained blue palette are superseded by this revision.

Validation: production build and generated image/anchor checks pass. Browser visual/interaction checks remain outstanding. Production remains unchanged; this revision updates the existing draft preview.

---

Reviewed 7 September 2026 against main commit baeffeb1cb38e808faae9df809c0f8bf20404a8e.

## Assessment

The strongest material is the engineering work: screenshots, concrete implementation choices, and documented model failures. The presentation puts too much decoration and explanation ahead of that evidence. The premium direction should come from composition, legibility, photography, and pacing.

Evidence: the supplied header screenshot; the live site's HTML retrieved from https://portfolio-sadad.vercel.app/; and the current Next.js source in `portfolio-next`. This is a source and content audit, not a completed cross-browser visual audit. No Lighthouse or Core Web Vitals measurements were taken.

| Priority | Finding | Change in this branch |
| --- | --- | --- |
| High | Name, three role categories, availability, location, and graduation shorthand compete in small uppercase monospace text. | Simple wordmark; sentence-case identity; concise availability statement below the hero. |
| High | Fluid shaders, neural canvases, a global point field, cursor rings, portrait brackets, and orange halos compete for attention. | Removed those effects from the rendered page and removed the legacy background shader code. Reused the existing monochrome portrait. |
| High | Four 300vh pinned scenes precede Work on desktop; mobile used four 240vh scenes. | Work follows the hero. Desktop scenes use 170vh; narrow and short screens show finished diagrams in normal flow. |
| High | Most supporting labels use roughly 9–11px text with wide tracking. | Navigation and ordinary labels use readable sans-serif type; monospace remains useful for actual code. |
| Medium | Colour is repeated across decorative borders, gradients, headings, portrait treatment, and micro-interactions. | Neutral black/white surfaces, neutral rules, a blue primary action, and readable blue for interactive accents. Error semantics remain distinct. |
| Medium | Several headings describe the site or perform an interview persona. | Shorter headings and direct introductory/contact copy. |
| Medium | The root README describes a single-file site that no longer exists at the repository root. | This audit identifies `portfolio-next` as the current app. Update the legacy README separately when retiring historical instructions. |

## Design and motion direction

- Foundation: charcoal `#101112`, white `#F5F5F3`, supporting text `#B0B2B5`.
- Accent: blue `#2855DE` for the primary action; `#96B8FF` for small interactive accents on dark surfaces.
- Typography: Instrument Sans; large, tightly composed headings; restrained code typography.
- Hero: two-line statement, concise description, existing portrait, and direct access to selected work and the résumé.
- Sequence: introduction → selected work → engineering notes → background → toolkit → additional work → contact.
- Motion: one brief headline entrance, shallow portrait movement, content reveals, sticky project summaries, and shorter explanatory scenes. Native touch scrolling remains available.
- Accessibility: existing keyboard navigation, command palette, screenshot controls, project expansion, toolkit filtering, contact actions, and résumé download are retained. Scene motion responds to screen size, the OS motion preference, and the existing manual motion toggle.

## Content that needs the owner's confirmation

1. Education: the old hero said UTM '25, while About says 2021–2026 and describes the degree as unfinished. The ambiguous hero shorthand is removed. Confirm the current graduation status before changing About or the résumé.
2. InterviewPilot: “0 dropped requests” needs an evaluation sample size, workload, failure policy, and test date. A repair mechanism is not evidence of an unconditional reliability guarantee.
3. Driftline: the 97.8% figure is a relative increase from 0.2635 to 0.5211, not a percentage-point increase. Keep the baseline, endpoint, evaluation period, and replay setting attached to the claim.
4. Distinguish production use, technical assessments, research prototypes, and historical-data replays in case-study copy. Keep private-project claims reviewable through permitted screenshots and documentation.
5. Verify that the downloadable résumé, biography, and project README metrics agree. Personal facts were not replaced using older conversational memory.

## Validation and release

- `npm run build`: production compilation and static page generation pass.
- `git diff --check`: passes.
- Generated homepage: image paths exist locally; internal anchor targets resolve; Work follows the hero; decorative background canvas IDs are absent.
- JavaScript syntax check passes for the edited legacy interaction module.
- Not yet validated in a browser: visual composition at desktop/mobile widths, keyboard flow, screenshot controls, motion toggle transitions, zoom, and perceived scroll pacing. Review these in a deployment preview before merging.
- No production deployment or merge is part of this change. Existing framework, dependencies, lockfile, project screenshots, and deployment configuration are preserved.

The next useful investment is deeper evidence for two or three flagship projects: evaluation conditions, an architecture explanation, and a short product walkthrough. More visual effects will not supply that credibility.
