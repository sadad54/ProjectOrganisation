'use client';

/* Optional interface sound. Off unless the visitor turns it on (nav toggle or
   the M key); the choice is remembered. Everything is synthesised with Web
   Audio — there are no audio files — and kept very quiet. Nothing is created
   until a user gesture has happened, and nothing plays under reduced motion. */
import { reducedMotionNow } from './motion';

let ctx = null;
let master = null;
let on = false;
const listeners = new Set();

function read() {
  try {
    return localStorage.getItem('snd') === '1';
  } catch {
    return false;
  }
}

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.5;
  master.connect(ctx.destination);
  return ctx;
}

/** Restore the saved choice. The audio context itself waits for a gesture. */
export function initSound() {
  on = read() && !reducedMotionNow();
  if (!on) return;
  const unlock = () => {
    if (on) ensure()?.resume?.();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
}

export const soundOn = () => on;
export function onSoundChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Called from a click or key press, so creating the context here is allowed. */
export function setSound(v) {
  on = v && !reducedMotionNow();
  try {
    localStorage.setItem('snd', on ? '1' : '0');
  } catch {
    /* private mode */
  }
  if (on) {
    ensure()?.resume?.();
    play('tick');
  }
  listeners.forEach((fn) => fn(on));
  return on;
}

function tone({ f0, f1 = f0, t = 0.12, gain = 0.05, type = 'sine', delay = 0 }) {
  const t0 = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t0);
  o.frequency.exponentialRampToValueAtTime(f1, t0 + t);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.02, t * 0.3));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + t);
  o.connect(g).connect(master);
  o.start(t0);
  o.stop(t0 + t + 0.02);
}

const VOICES = {
  // a section arrives
  tick: () => tone({ f0: 1320, f1: 880, t: 0.07, gain: 0.03 }),
  // a ledger row lights
  click: () => tone({ f0: 2100, f1: 1500, t: 0.03, gain: 0.014, type: 'triangle' }),
  // the portrait lets go
  swell: () => {
    tone({ f0: 98, f1: 147, t: 1.5, gain: 0.07 });
    tone({ f0: 196, f1: 294, t: 1.3, gain: 0.025, delay: 0.12 });
  },
  // the brain rewires
  rise: () => {
    tone({ f0: 330, f1: 495, t: 0.32, gain: 0.035 });
    tone({ f0: 495, f1: 660, t: 0.36, gain: 0.03, delay: 0.14 });
  },
};

/** Play a named sound, if sound is on and the context has been unlocked. */
export function play(name) {
  if (!on || !ctx || ctx.state !== 'running') return;
  VOICES[name]?.();
}
