# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience is a general professional/technical one: collaborators, potential employers, community/conference contacts, and anyone encountering the site via a shared link, LinkedIn, or conference follow-up. The site is a showcase of Adnan's work and thinking first, not a job-search landing page — copy should read as an open, relaxed invitation to connect over shared interests, not as an active candidate pitch.

Adnan Mashrur Sadad: BSc Software Engineering (MJIIT, Universiti Teknologi Malaysia, Kuala Lumpur), CGPA 3.50, Dean's List. Bangladeshi national living in Malaysia. Currently researching self-correcting agentic RAG (SAFE-RAG) alongside two other papers spanning GenAI, computer vision, and human-in-the-loop agentic systems, and building FinScout on the side.

## Product Purpose

A personal portfolio site that showcases Adnan's work and engineering thinking as his professional presence online — a place to point people who might want to collaborate, hire, or just talk shop, without reading as a job-search pitch. Success is measured by genuine engagement (résumé downloads, contact via email, follow-through to project repos/demos) and by holding up as a credible, likeable professional artifact when shared casually (e.g. LinkedIn, conference follow-up).

## Positioning

Leads with production-grade AI engineering: the mechanism a portfolio full of "I called an LLM API" projects can't truthfully copy is the reliability layer built around the model call — schema validation, repair/retry paths, eval harnesses, and deployment that actually runs (Docker, CI). This was reconsidered mid-interview (briefly considered leading with full-stack breadth instead) and confirmed back to the AI-engineering-reliability angle as the throughline. Full-stack and ML/data breadth (seven shipped builds spanning RAG, Text2SQL, computer vision, mobile, imbalanced classification, simulation) support the positioning as range, not as the headline.

## Operating Context

`portfolio-next/` — a Next.js app — is the **sole** implementation. A parallel static, zero-build, single-file mirror (`index.html`) previously existed and was deliberately dropped (2026-08-06). Do not recreate or mirror future edits into an `index.html` file unless explicitly asked again.

**Redesign, 2026-09-27** ("the page is a forward pass"). Site sections, in order, each labelled as a layer: hero (L0 Input — token-streamed headline, rim-lit portrait), thesis (L1 — scroll-lit statement), About as an ML model card (L2), four engineering decisions in one pinned, scroll-drawn stage (L3 Attention), the work console (L4 Retrieval), Research (L5 Evaluation), a skills × projects graph (L6 Weights), and a prompt-style contact composer (Out). A persistent WebGL neural field re-forms per section. Command palette (⌘K) for navigation and actions.

**The work console is the answer to "add more projects without a carousel or a long scroll."** Every project lives in `app/data/work.js` (14 today: 5 case studies, 5 projects, 4 archive). The console is a fixed-height instrument: an index (grouped by tier, or live-ranked by a real client-side TF-IDF search), a stage that samples each project in with a diffusion-style denoise transition, and a similarity-map view. Adding a project is one entry in that file; the page does not get longer.

## Capabilities and Constraints

- One persistent Three.js "neural field" (hand-written GLSL, ~16k particles; 8k on small/low-core devices) behind every page, re-forming per section; adaptive quality, paused when hidden, a still frame under reduced motion, a CSS gradient without WebGL.
- Hero portrait is `assets/portrait-hero-rim-light.webp` (the orange rim-lit plate — lit for a dark ground), blended with `lighten` so the field shows through its black backdrop. `bobblehead.webp` and `adnan-headshot.webp` remain on disk but unused.
- Case studies (`/work/[slug]`) exist for ProofHire, Driftline, InterviewPilot, WC26 Predictor and Mindhive; each has a walkthrough video. Screenshot galleries are listed from disk at build time (ProofHire's folder is still empty, so it has none).
- Demo links: none published yet. Two backing repos (`AuraFinalPF`, `chatbotZUS`) are private; Fraud Detection has no public repo.
- The Contact section's visa/sponsorship disclosure and phone number were deliberately removed (2026-08-06). Do not reintroduce either without being explicitly asked again.

## Brand Commitments

- Name/byline: "ADNAN M. SADAD" / "AI / Data / Full Stack".
- Visual system: see `DESIGN.md` ("Activation", 2026-09-27) — near-black `#050608` ground, one ember signal `#FF6B3D`, cool/pass/fail reserved for data, Archivo + Instrument Serif italic + Instrument Sans + Geist Mono.
- Contact: adnanmashrursadad@gmail.com, LinkedIn (`adnan-mashrur-sadad-87a45b237`), GitHub (`sadad54`). Phone number removed from the site (2026-08-06).

## Evidence on Hand

- Real, shipped project detail for all 7 case studies (architecture, metrics, stack, decisions) already written into the site — not placeholder copy.
- Real metrics quoted: 0.98 ROC-AUC / 0.89 PR-AUC on Fraud Detection (284,807 transactions, 0.17% positive rate); 85% categorisation precision / 500+ receipts/month on ExpenSense; Gold Medal & Best Video at the myHCI-UX Student Design Challenge (national, Malaysia); Secretary Treasurer, SOFEA Society, workshops for 200+ students.
- Research (from the résumé, shown in the L5 section): SAFE-RAG — first author, short paper under review at ALTA 2026, 8.6% wrong-scope grounding rate across 200 annotated items; Text-to-SQL answerability under schema evolution — first author, manuscript complete (not yet submitted), 1,382-instance benchmark across 20 databases, 27,384 generations, 79.5% of structurally invisible drift detected at a 13.0% false-alarm rate over 5,627 benign updates.
- Education per the résumé: B.Sc. Computer Science (Software Engineering) with Honours, MJIIT UTM, 2021–2026, CGPA 3.43/4.00, Dean's List 2022/23 and 2025/26.
- Two résumé variants, both in `portfolio-next/public/`: `Adnan_Sadad_AI_ML_Resume_LaTeX.pdf` (AI/ML, leads) and `Adnan_Sadad_SWE_Resume_LaTeX.pdf` (Full-Stack), each served by its own row in the Contact "reach" list and its own ⌘K "Download résumé" action (2026-09-19). Superseded single-résumé PDFs live outside the served folder at `portfolio-next/old_resumes/` for archival only — never link to that path from the site.
- Assets on hand: `assets/portrait.jpeg` (real photo, used in About section), `assets/hero.png` (source headshot, unprocessed), `assets/adnan-headshot.webp` (processed/graded headshot, produced but not currently wired in), `assets/bobblehead.webp` (current hero visual).
- Absent: repo link for Fraud Detection; demo links for six projects; screenshots for most/all project cards — future work must not fabricate these, only use the placeholder mechanism already in place.

## Product Principles

1. Every claim on the site must be backed by something real and checkable (a repo, a metric, a shipped artifact) — no invented testimonials, benchmarks, or unstated placeholders presented as final.
2. The differentiator is the reliability engineering around AI systems (validation, repair, evals, deployment), not the model call itself — this should keep showing up as the throughline across copy and case studies, even as breadth (full-stack, ML/data) is demonstrated.
3. Honesty over polish where they conflict: the placeholder-with-`onerror`-fallback pattern for missing screenshots is a deliberate choice to stay truthful rather than hide gaps.
4. Motion and visual ambition (the neural field, the work console's search and denoise stage, scroll-drawn decisions) are part of the pitch — a systems engineer who can also ship polished, technically extraordinary front-end work — but must never come at the cost of `prefers-reduced-motion` support or graceful degradation without WebGL.
5. `portfolio-next` is the canonical implementation; there is no static mirror.
6. Decorative numbers are still numbers: visualisations draw real figures to scale, and nothing on the page prints a value that wasn't measured.

## Accessibility & Inclusion

`prefers-reduced-motion` is a confirmed, already-implemented requirement across the hero's WebGL/3D effects and portrait float animation — future motion work must preserve this, not just avoid regressing it incidentally.
