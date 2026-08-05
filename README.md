# adnan.dev — portfolio

Single-file site. No build step, no dependencies, no framework. `index.html` contains the
markup, CSS, WebGL shaders and JS; your photo is embedded as base64 so the file is portable.

## Deploy

Drop both files in a repo root and point any static host at it.

- **GitHub Pages** — push to `main`, then Settings → Pages → deploy from `main` / root.
- **Vercel / Netlify** — drag the folder onto the dashboard. No build command, no output dir.
- **Cloudflare Pages** — same, framework preset "None".

Files:

```
index.html     the whole site
resume.pdf     served by the "Résumé" link and the ⌘K "Download résumé" action
```

## Before you publish — placeholders

The site now has all 7 builds (InterviewPilot, WC26 Predictor, Fraud Detection, Mindhive
Chatbot, ExpenSense, Aura, FinScout), each with a screenshot slot and a repo + demo link pair.
GitHub links are filled in wherever the repo is public; what's left:

| Placeholder | Appears in | What to do |
|---|---|---|
| `YOUR-REPO-LINK-FRAUD-DETECTION` | Fraud Detection repo link | The fraud detection code isn't on GitHub yet (it's local at `D:\RAG\fraud_detection`) — push it, then paste the URL |
| `YOUR-DEMO-LINK-INTERVIEWPILOT` | InterviewPilot demo button | Paste a live URL once deployed, or delete the `<a class="lnk demo">` tag if you'd rather not show a broken link |
| `YOUR-DEMO-LINK-WC26` | WC26 Predictor demo button | Same as above |
| `YOUR-DEMO-LINK-FRAUD-DETECTION` | Fraud Detection demo button | Same as above |
| `YOUR-DEMO-LINK-MINDHIVE` | Mindhive Chatbot demo button | This repo already has a `vercel.json` — probably the fastest one to deploy |
| `YOUR-DEMO-LINK-EXPENSENSE` | ExpenSense demo button | Flutter mobile app — you may not have a web demo for this one; delete the button if so |
| `YOUR-DEMO-LINK-AURA` | Aura demo button | Also worth deciding whether to make `sadad54/AuraFinalPF` public first |

Search for `YOUR-` and you'll catch all of them.

**Screenshots.** Each project card has a dashed placeholder box (`.shot`). Drop an image at
the path named inside it — e.g. `assets/screenshots/interviewpilot.png` — and it swaps in
automatically (no HTML edit needed; the placeholder text is just an `onerror` fallback). Create
the `assets/screenshots/` folder next to `index.html`. Suggested shot: one clean, representative
screen per project — a dashboard, the chat UI, the mobile app's main screen, etc. 16:10 aspect
ratio fits the layout best.

Two repos are currently private and won't resolve for a visitor until you flip them public:
`sadad54/AuraFinalPF` and `sadad54/chatbotZUS` (the ZUS/Mindhive chatbot — code lives locally
at `D:\RAG\chatbot`).

Also worth a look:

- **The visa paragraph** in the contact section. It's honest and it saves a recruiter a
  round-trip, but delete the `<div class="visa">` block if you'd rather raise it in
  conversation instead.
- **`<title>` and the OG tags** in `<head>` if you want a custom link preview.

## The Approach section is now a 4-slide carousel

`#loop` used to be one static diagram (the InterviewPilot schema-repair loop). It's now a
horizontally-swipeable carousel with four real engineering decisions, one per slide, so the
section didn't grow taller:

1. **Schema repair** (InterviewPilot) — the original animated diagram, unchanged, still
   auto-plays once on scroll-into-view and has its own Replay button.
2. **Imbalanced classification** (Fraud Detection) — the accuracy-trap vs PR-AUC comparison,
   reusing the same count-up number animation as the metrics elsewhere on the site.
3. **Simulated uncertainty** (WC26 Predictor) — the 10,000-run Monte Carlo + predicted-vs-actual
   audit, as a flow diagram.
4. **Adaptive follow-up depth** (InterviewPilot, the other half of that project) — the
   probe-deeper-or-move-on decision the follow-up agent makes.

Navigate it by: dragging with a mouse, swiping on touch, trackpad horizontal scroll, the
arrow buttons, the dot indicators, or arrow keys while hovering the carousel. All four work off
`scroll-snap`, so there's no dependency on JS for the core scrolling — the buttons/dots/keys are
progressive enhancement on top.

To add a fifth slide later: copy one `<div class="loop-slide" id="...">…</div>` block, drop it
inside `#loopTrack`, and the dot indicators + arrow buttons pick it up automatically (they're
generated from however many `.loop-slide` elements exist — no JS array to edit).

## How the hero works

A curl-noise velocity field advects a colour buffer on the GPU, ping-ponging between two
framebuffers at ~44% resolution. Your pointer injects dye along the segment between the last
two positions, so fast movement leaves a longer streak. Four ambient emitters keep the field
alive when nobody's touching it, and the field is pre-seeded with 120 simulation steps on
first paint so it's never blank.

It only runs while the canvas is on screen (IntersectionObserver), falls back to an animated
CSS gradient if WebGL is unavailable, and is disabled entirely under
`prefers-reduced-motion`.

## Tweaking

Everything visual is a CSS custom property at the top of the `<style>` block:

```css
--sodium: #FF6A3D;   /* primary accent — orange */
--signal: #FF6A3D;   /* secondary, currently same as primary */
--rose:   #E5484D;   /* used sparingly */
--ink:    #0B0B0D;   /* base */
```

The fluid palette lives separately in the `SIM` shader string (`warm`, `cool`, `rose` as
normalised vec3s) — change those to match if you retheme.
