'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { LAYERS } from './Nav';
import { scrollToEl } from './SmoothScroll';
import { toast } from '../../lib/toast';
import { initSound, play, setSound, soundOn } from '../../lib/sound';

const KEYS = [
  ['1 – 9', 'Jump to a section'],
  ['⌘ K', 'Command menu'],
  ['/', 'Ask the model'],
  ['B', 'The short version'],
  ['M', 'Sound on / off'],
  ['?', 'This sheet'],
  ['Esc', 'Close anything'],
];

const typing = (el) => el?.closest?.('input, textarea, select, [contenteditable="true"]');
const busy = () => document.querySelector('dialog[open], .cmdk');

/* Single-key shortcuts for the whole site, the sheet that lists them (?), and
   the two page-wide hooks for optional sound. Keys are ignored while typing,
   with a modifier held, or while a dialog or the command menu is open. */
export default function Shortcuts() {
  const ref = useRef(null);
  const pathname = usePathname();
  const onHome = pathname === '/';

  useEffect(() => {
    initSound();
    const d = ref.current;
    const open = () => !d.open && d.showModal();
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return;
      if (e.key === '?') {
        if (busy() && !d.open) return;
        e.preventDefault();
        d.open ? d.close() : open();
        return;
      }
      if (busy()) return;
      const k = e.key.toLowerCase();
      if (k === 'b') window.dispatchEvent(new Event('brief:open'));
      else if (k === '/') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('ask:open', { detail: {} }));
      } else if (k === 'm') toast(setSound(!soundOn()) ? 'Sound on' : 'Sound off');
      else if (onHome && /^[1-9]$/.test(k)) {
        const el = document.getElementById(LAYERS[Number(k) - 1]?.id);
        if (el) scrollToEl(el);
      }
    };
    // a ledger row lighting up is the one hover that makes a sound
    let last = null;
    const onOver = (e) => {
      const r = e.target.closest?.('.bw-row');
      if (r && r !== last) play('click');
      last = r || null;
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('shortcuts:open', open);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('shortcuts:open', open);
    };
  }, [onHome]);

  return (
    <dialog
      ref={ref}
      className="keys"
      aria-labelledby="keys-h"
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current.close();
      }}
    >
      <div className="keys-in">
        <p className="brief-k" id="keys-h">
          <b>?</b> keyboard
        </p>
        <dl>
          {KEYS.map(([k, v]) => (
            <div key={k}>
              <dt>
                <kbd>{k}</kbd>
              </dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <form method="dialog">
          <button className="lnk" autoFocus>
            Close
          </button>
        </form>
      </div>
    </dialog>
  );
}
