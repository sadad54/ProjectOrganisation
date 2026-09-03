// #ambientField is a fixed, z-index:0 canvas. Per CSS stacking rules, z-index:0
// stacking contexts and z-index:auto positioned descendants (every `section`
// here is position:relative) paint together in DOM tree order — so this MUST
// render before the main content sections in page.jsx, or the particle field
// paints on top of the page instead of behind it.
// #toast ships empty and aria-hidden — it is a live region that must announce
// only when a copy action actually fires. CommandPalette.jsx fills its text and
// flips aria-hidden on trigger, then clears both. An unconditional "Copied"
// text node here would render a stray word at the top of the document.
// #ambientField is rendered by <BackgroundFX/> in page.jsx (it must still be
// the first painted element — see stacking note there).
export const ATMOSPHERE_HTML = "\n<div class=\"grain\" aria-hidden=\"true\"></div>\n<div class=\"cursor-ring\" id=\"cursorRing\" aria-hidden=\"true\"></div>\n<div class=\"cursor\" id=\"cursor\" aria-hidden=\"true\"></div>\n\n<div class=\"toast\" id=\"toast\" role=\"status\" aria-live=\"polite\" aria-hidden=\"true\"></div>\n\n";
