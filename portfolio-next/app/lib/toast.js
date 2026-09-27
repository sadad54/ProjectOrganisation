'use client';

let timer;

/** Show a short status message in the shared #toast live region. */
export function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(timer);
  timer = setTimeout(() => {
    t.classList.remove('on');
    setTimeout(() => {
      if (!t.classList.contains('on')) t.textContent = '';
    }, 400);
  }, 1900);
}

/** Copy text to the clipboard with a toast; falls back to showing the text. */
export function copyText(txt, msg) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(txt).then(
      () => toast(msg),
      () => toast(txt)
    );
  } else toast(txt);
}
