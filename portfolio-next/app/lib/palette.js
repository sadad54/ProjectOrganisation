/* Colour values for the JS-driven layers (neural field, denoise stage,
   generative fingerprints). CSS owns the same values as custom properties in
   app/styles/tokens.css — keep the two in step. */
export const PALETTE = {
  void: [6, 10, 29],
  s1: [10, 16, 42],
  s2: [15, 23, 53],
  s3: [21, 31, 66],
  text: [243, 238, 225],
  signal: [242, 107, 33],
  signalHi: [255, 138, 71],
  cool: [79, 155, 230],
  pass: [99, 219, 166],
  sun: [246, 223, 154],
  fail: [255, 107, 122],
};

/** [r,g,b] 0-255 → [r,g,b] 0-1, for shader uniforms. */
export const unit = ([r, g, b]) => [r / 255, g / 255, b / 255];

/** `rgba()` string from a palette triplet. */
export const rgba = ([r, g, b], a) => `rgba(${r},${g},${b},${a})`;
