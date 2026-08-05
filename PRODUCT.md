# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience is broader than pure recruiter screening: hiring managers and recruiters evaluating Adnan for AI Engineer / Data Scientist / Full Stack roles, but also collaborators, community/conference contacts, and general professional networking. Design and copy should read well both to someone actively screening candidates and to someone encountering the site in a more casual professional context (e.g. shared link, LinkedIn, conference follow-up).

Adnan Mashrur Sadad: BSc Software Engineering (MJIIT, Universiti Teknologi Malaysia, Kuala Lumpur), CGPA 3.50, Dean's List. Bangladeshi national living in Malaysia. Currently available immediately for a first full-time role.

## Product Purpose

A personal portfolio site that gets Adnan considered and contacted for AI Engineer / Data Scientist / Full Stack roles, and more broadly serves as his professional presence online. Success is measured by recruiter/hiring-manager engagement (résumé downloads, contact via email, follow-through to project repos/demos) and by holding up as a credible professional artifact when shared more casually.

## Positioning

Leads with production-grade AI engineering: the mechanism a portfolio full of "I called an LLM API" projects can't truthfully copy is the reliability layer built around the model call — schema validation, repair/retry paths, eval harnesses, and deployment that actually runs (Docker, CI). This was reconsidered mid-interview (briefly considered leading with full-stack breadth instead) and confirmed back to the AI-engineering-reliability angle as the throughline. Full-stack and ML/data breadth (seven shipped builds spanning RAG, Text2SQL, computer vision, mobile, imbalanced classification, simulation) support the positioning as range, not as the headline.

## Operating Context

Two parallel implementations exist:
- `portfolio-next/` — a Next.js app, confirmed as the **canonical** version for future design/dev work.
- `index.html` — a static, zero-build, single-file export kept as a portable mirror (per its own README: "no build step, no dependencies, no framework"). Treat as a secondary export target, not the primary surface, unless told otherwise.

The two are currently kept content-identical by hand; there is no automated sync script.

Site sections: hero (status line, headline, CTA, portrait), About (bio, timeline), Work (7 project case studies in a rail-navigated panel layout), Approach (a 4-slide horizontally-swipeable carousel of real engineering decisions, e.g. schema-repair loop, imbalanced-classification metric choice), Toolkit (skills bento grid), Other Builds (smaller projects), Contact (contact methods + visa/sponsorship note), command palette (⌘K) for quick navigation/actions.

## Capabilities and Constraints

- Hero uses a WebGL curl-noise fluid-dye background plus a Three.js neural-network particle visual, both gated behind `IntersectionObserver` (pause off-screen) and disabled under `prefers-reduced-motion` with a CSS-gradient fallback when WebGL is unavailable.
- Hero portrait is currently `assets/bobblehead.webp`, a transparent-background stylized 3D-render cutout. A real-photo alternative (color-graded, feathered headshot) was produced and is available at `assets/adnan-headshot.webp` / `portfolio-next/public/assets/adnan-headshot.webp` but the swap was explicitly reverted by Adnan — bobblehead is the current intentional choice, not an oversight.
- Several project cards still carry placeholder links pending real deploys/repos (tracked in the site's own README "Before you publish" checklist): a Fraud Detection repo link, and demo links for InterviewPilot, WC26 Predictor, Fraud Detection, Mindhive Chatbot, ExpenSense, and Aura. Two backing repos (`AuraFinalPF`, `chatbotZUS`) are currently private.
- Screenshot slots exist per project (`assets/screenshots/<project>.png`) with a graceful `onerror` placeholder fallback when an image is missing; not all are filled yet.
- FinScout (the 7th project) is in progress, not yet shipped.
- Visa/sponsorship paragraph in Contact is a deliberate, confirmed-honest disclosure (Employment Pass sponsorship needed) — not a placeholder to remove casually.

## Brand Commitments

- Name/byline: "ADNAN M. SADAD" / "AI / Data / Full Stack".
- Existing visual system (not yet captured in a DESIGN.md): near-black base (`--ink #0B0B0D`), warm orange accent (`--sodium`/`--signal #FF6A3D`), sparing rose (`--rose #E5484D`), monospace for labels/meta, a display face for headings — dark, moody, cinematic, with warm accent lighting throughout.
- Contact: adnanmashrursadad@gmail.com, +60 11-3968 7435, LinkedIn (`adnan-mashrur-sadad-87a45b237`), GitHub (`sadad54`).

## Evidence on Hand

- Real, shipped project detail for all 7 case studies (architecture, metrics, stack, decisions) already written into the site — not placeholder copy.
- Real metrics quoted: 0.98 ROC-AUC / 0.89 PR-AUC on Fraud Detection (284,807 transactions, 0.17% positive rate); 85% categorisation precision / 500+ receipts/month on ExpenSense; Gold Medal & Best Video at the myHCI-UX Student Design Challenge (national, Malaysia); Secretary Treasurer, SOFEA Society, workshops for 200+ students.
- Résumé PDF at `resume.pdf` (also `portfolio-next/public/resume.pdf`), served by the "Résumé" link and the ⌘K "Download résumé" action.
- Assets on hand: `assets/portrait.jpeg` (real photo, used in About section), `assets/hero.png` (source headshot, unprocessed), `assets/adnan-headshot.webp` (processed/graded headshot, produced but not currently wired in), `assets/bobblehead.webp` (current hero visual).
- Absent: repo link for Fraud Detection; demo links for six projects; screenshots for most/all project cards — future work must not fabricate these, only use the placeholder mechanism already in place.

## Product Principles

1. Every claim on the site must be backed by something real and checkable (a repo, a metric, a shipped artifact) — no invented testimonials, benchmarks, or unstated placeholders presented as final.
2. The differentiator is the reliability engineering around AI systems (validation, repair, evals, deployment), not the model call itself — this should keep showing up as the throughline across copy and case studies, even as breadth (full-stack, ML/data) is demonstrated.
3. Honesty over polish where they conflict: the visa/sponsorship disclosure and the placeholder-with-`onerror`-fallback pattern for missing screenshots are deliberate choices to stay truthful rather than hide gaps.
4. Motion and visual ambition (WebGL fluid, 3D neural network, scroll-driven carousel) are part of the pitch — a systems engineer who can also ship polished, technically extraordinary front-end work — but must never come at the cost of `prefers-reduced-motion` support or graceful degradation without WebGL.
5. `portfolio-next` is the canonical implementation going forward; `index.html` is maintained as a portable static mirror, not the primary design target.

## Accessibility & Inclusion

`prefers-reduced-motion` is a confirmed, already-implemented requirement across the hero's WebGL/3D effects and portrait float animation — future motion work must preserve this, not just avoid regressing it incidentally.
