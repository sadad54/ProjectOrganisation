/* Palette for the JS-driven layers — the latent field canvas, the hero/contact
   Three.js networks, and the WebGL fluid dye. The CSS surface is themed by the
   token blocks in globals.css; these are the values CSS can't reach.
   Keep the two in step: one entry here per :root[data-theme=...] block there.

   ?theme=acid | thermal | bone | oxide, persisted to localStorage;
   ?theme=sodium resets. Resolved pre-paint in layout.js so nothing flashes.

   Light themes carry `light: true`, which flips three things JS owns and CSS
   can't: additive blending (invisible on a pale ground) becomes normal, the
   fluid's show pass subtracts dye instead of adding it, and the latent field
   draws graphite on paper rather than light in the dark. */

const ADDITIVE = 'additive';
const NORMAL = 'normal';

export const THEMES = {
  // shipped palette — warm orange on near-black
  sodium: {
    portrait: 'assets/portrait-hero-rim-light.webp',
    signal: [255, 106, 61],
    signalBright: [255, 120, 74],
    signalSoft: [255, 138, 92],
    signalPale: [255, 180, 140],
    field: [255, 106, 61],
    fieldWash: [255, 106, 61],
    net: 0xff6a3d,
    netPulse: 0xffb088,
    netLine: 0xe5484d,
    netBlend: ADDITIVE,
    fluid: {
      warm: [0.58, 0.3, 0.22],
      cool: [0.14, 0.15, 0.2],
      rose: [0.42, 0.17, 0.21],
      base: [0.031, 0.031, 0.059],
      lift: [0.02, 0.06, 0.16],
    },
  },

  // Direction A — acid lime on petrol-black
  acid: {
    portrait: 'assets/portrait-hero-rim-light.webp',
    signal: [184, 242, 74],
    signalBright: [201, 249, 110],
    signalSoft: [214, 250, 142],
    signalPale: [230, 252, 190],
    field: [184, 242, 74],
    fieldWash: [184, 242, 74],
    net: 0xb8f24a,
    netPulse: 0xd8fb8e,
    netLine: 0xff5c5c,
    netBlend: ADDITIVE,
    fluid: {
      warm: [0.42, 0.58, 0.16],
      cool: [0.1, 0.17, 0.15],
      rose: [0.44, 0.22, 0.2],
      base: [0.031, 0.051, 0.047],
      lift: [0.05, 0.14, 0.09],
    },
  },

  // Direction C — mint signal, amber reserved for the human moments
  thermal: {
    portrait: 'assets/portrait-hero-rim-light.webp',
    signal: [77, 232, 194],
    signalBright: [111, 242, 211],
    signalSoft: [150, 246, 222],
    signalPale: [198, 250, 236],
    field: [77, 232, 194],
    fieldWash: [77, 232, 194],
    net: 0x4de8c2,
    netPulse: 0xffb25c,
    netLine: 0xff5470,
    netBlend: ADDITIVE,
    fluid: {
      warm: [0.55, 0.38, 0.18],
      cool: [0.12, 0.17, 0.26],
      rose: [0.42, 0.2, 0.28],
      base: [0.039, 0.051, 0.078],
      lift: [0.03, 0.1, 0.18],
    },
  },

  /* Direction D — "Bone". Warm paper, ink, cobalt.
     The confident option: every other engineering portfolio hides in the dark.
     Cobalt on warm paper is also complementary to the portrait's orange rim,
     so the photograph reads as deliberate rather than tolerated. The latent
     field stops being light in the dark and becomes graphite on paper — the
     query develops the neighbourhood instead of illuminating it. */
  bone: {
    light: true,
    portrait: 'assets/portrait-hero-rim-light-blue.webp',
    signal: [27, 53, 201],
    signalBright: [38, 68, 224],
    signalSoft: [92, 116, 232],
    signalPale: [150, 166, 240],
    field: [105, 96, 82], // soft graphite — pencil on paper, not ink
    fieldAlpha: 0.6,      // peak cap; full-strength dots read as distracting here
    fieldWash: [140, 122, 96], // a warm shade rather than a glow
    net: 0x1b35c9,
    netPulse: 0x5c74e8,   // pulses stay in the cobalt family; a warm pulse read
    netLine: 0xbdb5a4,    // as red-vs-blue clash against the accent
    netBlend: NORMAL,
    netAlpha: 0.5,        // normal blending on paper is far more present than additive
    fluid: {
      warm: [0.30, 0.22, 0.10],
      cool: [0.16, 0.18, 0.30],
      rose: [0.34, 0.14, 0.12],
      base: [0.961, 0.945, 0.910], // paper
      lift: [0.05, 0.04, 0.02],
    },
  },

  /* Direction E — "Oxide". Warm espresso ground, ice signal.
     Inverts the temperature relationship instead of adding a second accent:
     the ground is warm, so the rim-lit portrait belongs structurally and the
     cool signal does all the system work without competing with it. */
  oxide: {
    portrait: 'assets/portrait-hero-rim-light.webp',
    signal: [143, 212, 232],
    signalBright: [168, 224, 240],
    signalSoft: [190, 233, 245],
    signalPale: [216, 243, 250],
    field: [143, 212, 232],
    fieldWash: [143, 212, 232],
    net: 0x8fd4e8,
    netPulse: 0xe8845c,
    netLine: 0xff6b6b,
    netBlend: ADDITIVE,
    fluid: {
      warm: [0.46, 0.26, 0.16],
      cool: [0.16, 0.26, 0.32],
      rose: [0.40, 0.20, 0.20],
      base: [0.090, 0.067, 0.063],
      lift: [0.06, 0.12, 0.16],
    },
  },
};

export const DEFAULT_THEME = 'bone';

export function activeTheme() {
  if (typeof document === 'undefined') return THEMES[DEFAULT_THEME];
  const name = document.documentElement.dataset.theme || DEFAULT_THEME;
  return THEMES[name] || THEMES[DEFAULT_THEME];
}

/** `rgba()` string from a palette triplet. */
export function rgba([r, g, b], a) {
  return `rgba(${r},${g},${b},${a})`;
}
