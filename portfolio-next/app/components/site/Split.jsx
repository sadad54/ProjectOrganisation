/* Word-split text for mask reveals.

   `text` is a string, or an array of segments: strings, or { t, em } objects
   for the serif-italic accent. Screen readers get the sentence once, from an
   sr-only copy; the animated word spans are aria-hidden so they're never read
   word-by-word. The reveal itself is CSS (.split.in, see base.css) driven by
   the shared IntersectionObserver in RevealObserver.jsx. */
function segments(text) {
  if (typeof text === 'string') return [{ t: text }];
  return text.map((s) => (typeof s === 'string' ? { t: s } : s));
}

export default function Split({ as: Tag = 'span', text, className = '', delay = 0, style, id }) {
  const segs = segments(text);
  const full = segs.map((s) => s.t).join('');
  let i = 0;

  const renderWords = (str) => {
    const parts = str.split(/(\s+)/);
    return parts.map((p, k) => {
      if (!p) return null;
      if (/^\s+$/.test(p)) return ' ';
      const idx = i++;
      return (
        <span className="w" key={k}>
          <span style={{ '--i': idx }}>{p}</span>
        </span>
      );
    });
  };

  return (
    <Tag className={`split ${className}`} style={{ '--d': delay, ...style }} id={id}>
      <span className="sr-only">{full}</span>
      <span aria-hidden="true">
        {segs.map((s, k) =>
          s.em ? (
            <em key={k} className={s.cls}>
              {renderWords(s.t)}
            </em>
          ) : (
            <span key={k} className={s.cls}>
              {renderWords(s.t)}
            </span>
          )
        )}
      </span>
    </Tag>
  );
}
