/* Colour values for the JS-driven layers (neural field, denoise stage,
   generative fingerprints). CSS owns the same values as custom properties in
   app/styles/tokens.css — keep the two in step. */
export const PALETTE = {
  void: [5, 6, 8],
  text: [238, 235, 228],
  ember: [255, 107, 61],
  emberHi: [255, 138, 99],
  cool: [169, 187, 255],
  pass: [82, 227, 168],
  fail: [255, 84, 112],
};

/** [r,g,b] 0-255 → [r,g,b] 0-1, for shader uniforms. */
export const unit = ([r, g, b]) => [r / 255, g / 255, b / 255];

/** `rgba()` string from a palette triplet. */
export const rgba = ([r, g, b], a) => `rgba(${r},${g},${b},${a})`;
