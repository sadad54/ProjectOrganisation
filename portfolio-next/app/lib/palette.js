/* Colour values for the JS-driven layers (neural field, denoise stage,
   generative fingerprints). CSS owns the same values as custom properties in
   app/styles/tokens.css — keep the two in step. */
export const PALETTE = {
  void: [2, 7, 10],
  s1: [8, 17, 26],
  s2: [13, 23, 34],
  s3: [19, 31, 43],
  text: [234, 241, 246],
  signal: [56, 180, 255],
  signalHi: [108, 200, 255],
  indigo: [88, 46, 255],
  cool: [139, 123, 255],
  mint: [82, 255, 165],
  pass: [82, 255, 165],
  fail: [255, 84, 112],
};

/** [r,g,b] 0-255 → [r,g,b] 0-1, for shader uniforms. */
export const unit = ([r, g, b]) => [r / 255, g / 255, b / 255];

/** `rgba()` string from a palette triplet. */
export const rgba = ([r, g, b], a) => `rgba(${r},${g},${b},${a})`;
