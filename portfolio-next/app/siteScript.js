// Legacy interaction module for project galleries, shortcuts, and reveals.
//  - gsap/ScrollTrigger are real npm imports; we mirror them onto window.gsap/window.ScrollTrigger
//    so every `window.gsap`/`window.ScrollTrigger` check further down keeps working unchanged.
import gsapLib from 'gsap';
import { ScrollTrigger as ScrollTriggerLib } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined' && !window.__siteInited) {
  window.__siteInited = true;
  window.gsap = gsapLib;
  window.ScrollTrigger = ScrollTriggerLib;
/* =====================================================================
   0. ENVIRONMENT
   ===================================================================== */
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = window.matchMedia('(pointer:fine)').matches;
const $  = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

// Decorative WebGL backgrounds removed; motion is attached to content.

/* =====================================================================
   2. HEADLINE — the scramble/decode effect was removed in Phase 5.
   Text-scramble on a heading is unreadable mid-animation (spec §7 ban);
   the hero H1 now does a single line-mask reveal in Hero.jsx instead.
   ===================================================================== */

/* =====================================================================
   3. REVEALS
   ===================================================================== */
(function(){
  const els = $$('.rv');
  const hasGSAP = !RM && typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  if (!hasGSAP){
    // fallback: original snap-in-once behaviour (also used under reduced-motion / offline CDN)
    const io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, {threshold:0.12, rootMargin:'0px 0px -6% 0px'});
    els.forEach(function(el){ io.observe(el); });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  els.forEach(function(el){
    el.classList.add('in');       // let GSAP own opacity/transform, not the CSS transition
    el.style.transition = 'none'; // avoid the CSS transition fighting the scrubbed tween
    // crossfade: fades in over the first quarter of its transit through the viewport,
    // holds at full opacity through the middle, fades back out over the last quarter —
    // mirrors the Dala reference instead of a fade-in-once
    gsap.timeline({scrollTrigger:{trigger:el, start:'top bottom', end:'bottom top', scrub:0.6}})
      .fromTo(el, {opacity:0, y:34}, {opacity:1, y:0, ease:'none', duration:0.25})
      .to(el, {opacity:1, y:0, ease:'none', duration:0.5})
      .to(el, {opacity:0, y:-34, ease:'none', duration:0.25});
  });
})();

/* =====================================================================
   4. COUNTERS
   ===================================================================== */
(function(){
  const io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const el = e.target;
      const to = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.dec, 10);
      if (RM){ el.textContent = to.toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec}); return; }
      const dur = 1500; const t0 = performance.now();
      (function step(now){
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * eased).toLocaleString('en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    });
  }, {threshold:0.5});
  $$('[data-count]').forEach(function(el){ io.observe(el); });
})();

// Section 5 (work rail active-state + click-to-scroll) was missed when Work
// section moved to React earlier this session — it duplicated (and, worse,
// fought) the WorkRail component's own IntersectionObserver in Work.jsx,
// using stale array-position matching that broke once the rail became
// grouped by domain instead of strict DOM order. Removed 2026-08-12; the
// React component is the sole owner of this behavior now.

// Section 6 (rail creation, IntersectionObserver active-state, nav "stuck" scroll
// class) now lives entirely in Nav.jsx (Framer Motion conversion).

/* =====================================================================
   5b. WORK CARD SCROLL DIM  —  lighter alternative to a full sticky-stack
   (see chat: pinning 7 content-dense cards, each with its own screenshot
   carousel, risked breaking IntersectionObserver-driven autoplay and
   turning the section into forced dwell time). Opacity ONLY, scrubbed to
   scroll position, same crossfade shape as the sitewide .rv system —
   never y/transform, since Work.jsx's .proj cards are Framer Motion
   components with their own whileHover y-lift; touching transform here
   would fight that on every frame both are active.
   ===================================================================== */
(function(){
  if (RM) return;
  const cards = $$('.proj');
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (!cards.length || !hasGSAP) return;
  gsap.registerPlugin(ScrollTrigger);
  cards.forEach(function(card){
    gsap.timeline({scrollTrigger:{trigger:card, start:'top bottom', end:'bottom top', scrub:0.6}})
      .fromTo(card, {opacity:0.5}, {opacity:1, ease:'none', duration:0.3})
      .to(card, {opacity:1, ease:'none', duration:0.4})
      .to(card, {opacity:0.6, ease:'none', duration:0.3});
  });
})();

// 5c (Toolkit sticky-stack) was tried and reverted 2026-08-10 — the plain
// bento grid (Toolkit.jsx) was preferred. Don't re-add without being asked.

/* =====================================================================
   7. REPAIR LOOP
   ===================================================================== */
(function(){
  const nodes = {n1:$('#n1'), n2:$('#n2'), n3:$('#n3'), n4:$('#n4')};
  const flows = {f1:$('#f1'), f2:$('#f2'), f3:$('#f3'), f4:$('#f4')};
  const readout = $('#readout');
  if (!readout) return;

  Object.keys(flows).forEach(function(k){
    const p = flows[k];
    const len = p.getTotalLength();
    p.style.setProperty('--len', len);
  });

  const timers = [];
  function clear(){
    timers.forEach(clearTimeout); timers.length = 0;
    Object.keys(nodes).forEach(function(k){ nodes[k].setAttribute('class','node'); });
    Object.keys(flows).forEach(function(k){ flows[k].classList.remove('go'); });
    readout.className = 'readout';
  }
  function at(ms, fn){ timers.push(setTimeout(fn, RM ? 0 : ms)); }
  function say(kind, label, body){
    readout.className = 'readout' + (kind ? ' ' + kind : '');
    readout.innerHTML = '<span class="attempt">' + label + '</span>' + body;
  }

  let running = false;
  function run(){
    clear();
    running = true;
    at(60,   function(){ nodes.n1.setAttribute('class','node act');
                         say('', 'Attempt 1, prompt', 'Answer transcript sent with the rubric and the required output schema.'); });
    at(420,  function(){ flows.f1.classList.add('go'); });
    at(980,  function(){ nodes.n2.setAttribute('class','node act');
                         say('', 'Attempt 1, model', 'Llama 3.3 70B generating the evaluation.'); });
    at(1600, function(){ flows.f2.classList.add('go'); });
    at(2160, function(){ nodes.n3.setAttribute('class','node bad'); nodes.n2.setAttribute('class','node');
                         say('bad', 'Attempt 1, rejected',
                           'clarity: "4/5" &nbsp;<span style="color:var(--rose)">✕ expected integer, got string</span><br>follow_up &nbsp;<span style="color:var(--rose)">✕ required field missing</span>'); });
    at(2900, function(){ flows.f3.classList.add('go');
                         say('bad', 'Repairing', 'The invalid response and both validation errors go back as the next prompt.'); });
    at(3700, function(){ nodes.n3.setAttribute('class','node'); nodes.n2.setAttribute('class','node act');
                         flows.f2.classList.remove('go');
                         say('', 'Attempt 2, model', 'Same context, plus what it got wrong the first time.'); });
    at(4200, function(){ flows.f2.classList.add('go'); });
    at(4800, function(){ nodes.n3.setAttribute('class','node good');
                         say('good', 'Attempt 2, valid', 'clarity: 4 &nbsp;✓ integer in range<br>follow_up: "Walk me through how you\'d shard that table." &nbsp;✓ present'); });
    at(5300, function(){ flows.f4.classList.add('go'); });
    at(5900, function(){ nodes.n4.setAttribute('class','node good'); nodes.n2.setAttribute('class','node'); nodes.n1.setAttribute('class','node');
                         say('good', 'Returned', 'Two model calls, one clean result. The user never saw the failure.');
                         running = false; });
  }

  $('#replay').addEventListener('click', run);
  const io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting){ io.disconnect(); at(400, run); } });
  }, {threshold:0.45});
  io.observe($('.loop-stage'));
})();

/* =====================================================================
   7b. APPROACH CAROUSEL — horizontal scroll/swipe/drag/keys between
       the four signature slides, no extra vertical page height
   ===================================================================== */
(function(){
  const track = $('#loopTrack');
  if (!track) return;
  const slides = $$('.loop-slide', track);
  const prevBtn = $('#loopPrev'), nextBtn = $('#loopNext'), dotsWrap = $('#loopDots');
  if (!slides.length || !prevBtn || !nextBtn || !dotsWrap) return;

  slides.forEach(function(_, i){
    const d = document.createElement('button');
    d.className = 'loop-dot' + (i === 0 ? ' on' : '');
    d.type = 'button';
    d.setAttribute('aria-label', 'Go to approach ' + (i + 1) + ' of ' + slides.length);
    d.addEventListener('click', function(){ goTo(i); });
    dotsWrap.appendChild(d);
  });
  const dots = $$('.loop-dot', dotsWrap);
  let current = 0;

  function setActive(i){
    current = i;
    dots.forEach(function(d, j){ d.classList.toggle('on', j === i); });
    prevBtn.disabled = i === 0;
    nextBtn.disabled = i === slides.length - 1;
  }
  function goTo(i){
    i = Math.max(0, Math.min(slides.length - 1, i));
    slides[i].scrollIntoView({behavior: RM ? 'auto' : 'smooth', inline: 'start', block: 'nearest'});
  }
  prevBtn.addEventListener('click', function(){ goTo(current - 1); });
  nextBtn.addEventListener('click', function(){ goTo(current + 1); });
  setActive(0);

  // sync dots/arrows to whichever slide is actually in view (covers swipe, drag, trackpad scroll)
  const slideIO = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (e.isIntersecting && e.intersectionRatio > 0.6){
        setActive(slides.indexOf(e.target));
      }
    });
  }, {root: track, threshold: [0.6]});
  slides.forEach(function(s){ slideIO.observe(s); });

  // arrow keys while the carousel has focus or is hovered
  let hovering = false;
  track.addEventListener('mouseenter', function(){ hovering = true; });
  track.addEventListener('mouseleave', function(){ hovering = false; });
  track.addEventListener('keydown', function(e){
    if (e.key === 'ArrowRight'){ e.preventDefault(); goTo(current + 1); }
    if (e.key === 'ArrowLeft'){ e.preventDefault(); goTo(current - 1); }
  });
  document.addEventListener('keydown', function(e){
    if (!hovering || document.activeElement === track) return;
    if (e.key === 'ArrowRight'){ goTo(current + 1); }
    if (e.key === 'ArrowLeft'){ goTo(current - 1); }
  });

  // click-and-drag for mouse users (touch + trackpad already scroll natively)
  if (FINE){
    let isDown = false, startX = 0, startScroll = 0, moved = false;
    track.addEventListener('pointerdown', function(e){
      isDown = true; moved = false; startX = e.clientX; startScroll = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', function(e){
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startScroll - dx;
    });
    track.addEventListener('pointerup', function(e){
      isDown = false;
      if (moved){
        // snap handled by CSS scroll-snap; block the click that would otherwise fire on children
        const swallow = function(ev){ ev.stopPropagation(); ev.preventDefault(); track.removeEventListener('click', swallow, true); };
        track.addEventListener('click', swallow, true);
      }
    });
    track.addEventListener('pointercancel', function(){ isDown = false; });
  }
})();

// 7b2 (scroll-pinned horizontal pan for the Approach carousel) was tried and
// reverted 2026-08-10: two rounds of fixes couldn't resolve reports of the
// pan racing through all 4 slides before the user could read them, and
// there was no browser access available this session to verify a fix
// live. The manual carousel from 7b (drag/swipe/keys/dots/buttons) is the
// carousel again, unmodified. Don't re-attempt scroll-pinning here without
// a way to visually verify the result first.

/* =====================================================================
   7c. APPROACH CAROUSEL — slides 2-4 animations (same stepper pattern
       as the repair loop: clear → timed steps → readout narration)
   ===================================================================== */
(function(){
  function prepFlows(flows){
    Object.keys(flows).forEach(function(k){
      var p = flows[k];
      if (!p) return;
      var len = p.getTotalLength();
      p.style.setProperty('--len', len);
    });
  }
  function stepper(opts){
    // opts: { readout, nodes, flows, extra (el to clear classes on), steps: [{ms, fn}] }
    var readout = opts.readout;
    if (!readout) return null;
    var nodes = opts.nodes || {};
    var flows = opts.flows || {};
    var extra = opts.extra || [];
    var timers = [];
    function clear(){
      timers.forEach(clearTimeout); timers.length = 0;
      Object.keys(nodes).forEach(function(k){ if (nodes[k]) nodes[k].setAttribute('class','node'); });
      Object.keys(flows).forEach(function(k){ if (flows[k]) flows[k].classList.remove('go'); });
      extra.forEach(function(el){ if (el) el.classList.remove('act','good','bad','pulse'); });
      readout.className = 'readout';
    }
    function at(ms, fn){ timers.push(setTimeout(fn, RM ? 0 : ms)); }
    function say(kind, label, body){
      readout.className = 'readout' + (kind ? ' ' + kind : '');
      readout.innerHTML = '<span class="attempt">' + label + '</span>' + body;
    }
    return { clear: clear, at: at, say: say };
  }

  /* -- slide 2: imbalanced classification -- */
  (function(){
    var readout = $('#readout2'), replay = $('#replay2');
    var bad = $('#cc-bad'), good = $('#cc-good');
    var s = stepper({ readout: readout, extra: [bad, good] });
    if (!s || !replay) return;
    function run(){
      s.clear();
      s.at(60,   function(){ bad.classList.add('act');
                 s.say('bad', 'Optimising for accuracy', 'A model that predicts &ldquo;never fraud&rdquo; on every transaction.'); });
      s.at(1300, function(){ s.say('bad', 'Looks great, does nothing',
                 '99.83% accuracy &nbsp;<span style="color:var(--rose)">but 0% recall</span> &mdash; every fraud case slips through.'); });
      s.at(2700, function(){ bad.classList.remove('act'); good.classList.add('act');
                 s.say('', 'Ensemble + SMOTE', 'Random Forest, XGBoost and Isolation Forest, trained with SMOTE oversampling and class-weighted loss.'); });
      s.at(4000, function(){ s.say('good', 'Scored on PR-AUC',
                 '0.98 ROC-AUC, 0.89 PR-AUC &mdash; the metric that actually holds up at a 0.17% fraud rate.'); });
    }
    replay.addEventListener('click', run);
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting){ io.disconnect(); s.at(400, run); } });
    }, {threshold:0.5});
    io.observe(bad.closest('.loop-stage'));
  })();

  /* -- slide 3: simulated uncertainty -- */
  (function(){
    var readout = $('#readout3'), replay = $('#replay3');
    var nodes = { s1:$('#s1'), s2:$('#s2'), s3:$('#s3') };
    var flows = { sf1:$('#sf1'), sf2:$('#sf2'), sf3:$('#sf3') };
    var lbl = $('#simLoopLbl');
    prepFlows(flows);
    var s = stepper({ readout: readout, nodes: nodes, flows: flows, extra: [lbl] });
    if (!s || !replay) return;
    function run(){
      s.clear();
      s.at(60,   function(){ nodes.s1.setAttribute('class','node act');
                 s.say('', 'Score the fixture', 'Win / draw / loss probabilities and expected goals from the match model.'); });
      s.at(700,  function(){ flows.sf1.classList.add('go'); });
      s.at(1250, function(){ nodes.s2.setAttribute('class','node act'); lbl.classList.add('pulse');
                 s.say('', 'Simulate the tournament, 10,000 times', 'Group stage draws, then every knockout upset or hold, played out from those odds.'); });
      s.at(2600, function(){ flows.sf2.classList.add('go'); });
      s.at(3150, function(){ nodes.s3.setAttribute('class','node good'); nodes.s1.setAttribute('class','node'); nodes.s2.setAttribute('class','node');
                 s.say('good', 'Tallied', 'Per-team title probability and path-to-final curve, from 10,000 simulated outcomes.'); });
      s.at(4300, function(){ flows.sf3.classList.add('go');
                 s.say('good', 'Predicted-vs-actual audit', 'Checked against what actually happened, after the fact &mdash; a forecast nobody scores isn&rsquo;t a forecast.'); });
    }
    replay.addEventListener('click', run);
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting){ io.disconnect(); s.at(400, run); } });
    }, {threshold:0.5});
    io.observe(readout.closest('.loop-stage'));
  })();

  /* -- slide 4: adaptive follow-up depth -- */
  (function(){
    var readout = $('#readout4'), replay = $('#replay4');
    var nodes = { a1:$('#a1'), a2:$('#a2'), a3:$('#a3'), a4:$('#a4') };
    var flows = { af1:$('#af1'), af2:$('#af2'), af3:$('#af3') };
    prepFlows(flows);
    var s = stepper({ readout: readout, nodes: nodes, flows: flows });
    if (!s || !replay) return;
    function run(){
      s.clear();
      s.at(60,   function(){ nodes.a1.setAttribute('class','node act');
                 s.say('', 'Candidate answers', 'A vague, surface-level answer on database sharding.'); });
      s.at(700,  function(){ flows.af1.classList.add('go'); });
      s.at(1300, function(){ nodes.a2.setAttribute('class','node act'); nodes.a1.setAttribute('class','node');
                 s.say('', 'Follow-up agent reads it', 'Reasons over the content and specificity of the answer, not just its length.'); });
      s.at(2600, function(){ nodes.a3.setAttribute('class','node good'); flows.af2.classList.add('go');
                 s.say('good', 'Probe deeper', 'Answer was surface-level, so the agent asks a targeted follow-up instead of moving on.'); });
      s.at(3900, function(){ nodes.a2.setAttribute('class','node');
                 s.say('good', 'Mirrors a real interviewer', 'A solid, evidenced answer would have sent it down the &ldquo;move on&rdquo; path instead.'); });
    }
    replay.addEventListener('click', run);
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting){ io.disconnect(); s.at(400, run); } });
    }, {threshold:0.5});
    io.observe(readout.closest('.loop-stage'));
  })();
})();

/* =====================================================================
   8. MARQUEE
   ===================================================================== */
(function(){
  const words = ['Python','FastAPI','React','TypeScript','XGBoost','Docker','RAG','TensorFlow',
                 'Groq','Whisper','SQLAlchemy','GitHub Actions','Scikit-learn','Flutter','AWS',
                 'Text2SQL','Streamlit','Supabase','Monte Carlo','Spring','pytest','Pydantic'];
  const track = $('#mq');
  const html = words.map(function(w){ return '<span>' + w + '</span>'; }).join('');
  track.innerHTML = html + html;
})();

/* =====================================================================
   9. CURSOR + MAGNETIC
   ===================================================================== */
(function(){
  if (!FINE || RM) return;
  const c = $('#cursor');
  const ring = $('#cursorRing');
  if (!c) return;
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, rx = x, ry = y;
  let ringScaleTarget = 1, ringScale = 1;
  window.addEventListener('pointermove', function(e){
    x = e.clientX; y = e.clientY;
    c.classList.add('on');
    if (ring) ring.classList.add('on');
  }, {passive:true});
  (function loop(){
    cx += (x - cx) * 0.22; cy += (y - cy) * 0.22;
    c.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
    if (ring){
      // slower lerp than the dot — the ring trails behind it, the classic
      // dual-cursor "lag" that reads as premium rather than a flat blob.
      // Scale is lerped the same way (never CSS width/height — see globals.css)
      // and composed into this same transform string every frame.
      rx += (x - rx) * 0.11; ry += (y - ry) * 0.11;
      ringScale += (ringScaleTarget - ringScale) * 0.18;
      ring.style.transform =
        'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%) scale(' + ringScale.toFixed(3) + ')';
    }
    requestAnimationFrame(loop);
  })();
  $$('a, button').forEach(function(el){
    el.addEventListener('pointerenter', function(){
      c.classList.add('big'); if (ring) { ring.classList.add('big'); ringScaleTarget = 52 / 36; }
    });
    el.addEventListener('pointerleave', function(){
      c.classList.remove('big'); if (ring) { ring.classList.remove('big'); ringScaleTarget = 1; }
    });
  });
  $$('.mag').forEach(function(el){
    el.addEventListener('pointermove', function(e){
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.30;
      el.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
    });
    el.addEventListener('pointerleave', function(){ el.style.transform = ''; });
  });
})();

/* =====================================================================
   9b. PORTRAIT MAGNET  —  attracts + tilts within a radius, not just on hover.
   Shared by every element with the .magnet-tilt class (currently: the hero
   portrait and the About portrait) so both use one tilt system, not two.
   ===================================================================== */
(function(){
  if (!FINE || RM) return;
  const wraps = $$('.magnet-tilt');
  if (!wraps.length) return;
  const PAD = 150, STRENGTH = 3, TILT = 14;
  const ACTIVE = 'transform 0.3s ease-out', INACTIVE = 'transform 0.6s ease-in-out';
  wraps.forEach(function(wrap){ wrap.style.transition = INACTIVE; });
  window.addEventListener('pointermove', function(e){
    wraps.forEach(function(wrap){
      const r = wrap.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const edgeDist = Math.max(Math.abs(dx) - r.width / 2, Math.abs(dy) - r.height / 2, 0);
      if (edgeDist < PAD) {
        wrap.style.transition = ACTIVE;
        const nx = Math.max(-1, Math.min(1, dx / (r.width / 2 + PAD)));
        const ny = Math.max(-1, Math.min(1, dy / (r.height / 2 + PAD)));
        wrap.style.transform =
          'translate3d(' + (dx / STRENGTH) + 'px,' + (dy / STRENGTH) + 'px,0) ' +
          'rotateY(' + (nx * TILT) + 'deg) rotateX(' + (-ny * TILT) + 'deg)';
      } else {
        wrap.style.transition = INACTIVE;
        wrap.style.transform = 'translate3d(0,0,0) rotateY(0) rotateX(0)';
      }
    });
  }, {passive:true});
})();

// Sections 10 (TOAST) and 11 (COMMAND PALETTE) now live in CommandPalette.jsx
// (Framer Motion AnimatePresence conversion) — the #toast element stays static
// markup here, driven directly by that component.

/* =====================================================================
   12. SMOOTH ANCHORS — skipped when Lenis is active (SmoothScroll.jsx owns
       anchor routing via lenis.scrollTo, else the two smooth scrollers fight)
   ===================================================================== */
if (!document.documentElement.classList.contains('lenis')) {
  $$('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      const t = document.querySelector(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      t.scrollIntoView({behavior: RM ? 'auto' : 'smooth'});
    });
  });
}

/* =====================================================================
   13. PROJECT SCREENSHOT CAROUSELS — autoplay + manual nav, crossfade
   ===================================================================== */
$$('.shot[data-shots]').forEach(function(shot){
  let shots;
  try { shots = JSON.parse(shot.dataset.shots); } catch (e) { return; }
  if (!Array.isArray(shots) || shots.length < 2) return;

  const img = shot.querySelector('img');
  const dotsWrap = shot.querySelector('[data-shot-dots]');
  const prevBtn = shot.querySelector('[data-shot-prev]');
  const nextBtn = shot.querySelector('[data-shot-next]');
  const baseAlt = img.alt;

  let i = 0, transitioning = false, visible = false, hovered = false;
  const dots = shots.map(function(_, idx){
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', 'Show screenshot ' + (idx + 1) + ' of ' + shots.length);
    b.addEventListener('click', function(){ go(idx); });
    dotsWrap.appendChild(b);
    return b;
  });

  function paintDots(){
    dots.forEach(function(d, idx){ d.classList.toggle('on', idx === i); });
    img.alt = baseAlt + ' (' + (i + 1) + ' of ' + shots.length + ')';
  }
  paintDots();

  function go(next){
    if (transitioning || next === i) return;
    transitioning = true;
    img.classList.add('is-out');
    setTimeout(function(){
      i = next;
      img.src = shots[i];
      paintDots();
      img.classList.remove('is-out');
      img.classList.remove('is-in'); void img.offsetWidth;
      img.classList.add('is-in');
      setTimeout(function(){ img.classList.remove('is-in'); transitioning = false; }, RM ? 0 : 620);
    }, RM ? 0 : 320);
  }
  function step(dir){ go((i + dir + shots.length) % shots.length); }

  if (prevBtn) prevBtn.addEventListener('click', function(){ step(-1); restartAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', function(){ step(1); restartAutoplay(); });

  let sx = 0, sy = 0;
  shot.addEventListener('touchstart', function(e){ sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, {passive: true});
  shot.addEventListener('touchend', function(e){
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)){ step(dx < 0 ? 1 : -1); restartAutoplay(); }
  }, {passive: true});

  shot.addEventListener('pointerenter', function(){ hovered = true; });
  shot.addEventListener('pointerleave', function(){ hovered = false; });
  shot.addEventListener('focusin', function(){ hovered = true; });
  shot.addEventListener('focusout', function(){ hovered = false; });

  let timer = null;
  function tick(){ if (visible && !hovered && !RM) step(1); }
  function startAutoplay(){ if (timer || RM) return; timer = setInterval(tick, 4200); }
  function stopAutoplay(){ clearInterval(timer); timer = null; }
  function restartAutoplay(){ stopAutoplay(); startAutoplay(); }

  const io = new IntersectionObserver(function(es){
    visible = es[0].isIntersecting;
    if (visible) startAutoplay(); else stopAutoplay();
  }, {threshold: 0.35});
  io.observe(shot);
});

}
