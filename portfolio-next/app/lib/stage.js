'use client';

/* Intro choreography gate. Entrance animations (the hero's token stream, a
   case-study title) should start when the viewer can actually see them —
   after the boot sequence, and after a route-transition wipe has lifted.
   Both overlays flip these flags and fire the matching events. */
export function whenStageReady(cb) {
  if (typeof window === 'undefined') return () => {};
  let done = false;
  const run = () => {
    if (done) return;
    if (!window.__bootDone || window.__ptBusy) return;
    done = true;
    cleanup();
    cb();
  };
  const cleanup = () => {
    window.removeEventListener('boot:done', run);
    window.removeEventListener('pt:revealed', run);
  };
  window.addEventListener('boot:done', run);
  window.addEventListener('pt:revealed', run);
  // next tick, so a same-frame flag flip from a sibling effect is seen
  const t = setTimeout(run, 0);
  return () => {
    clearTimeout(t);
    cleanup();
  };
}
