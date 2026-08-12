// #ambientField is a fixed, z-index:0 canvas. Per CSS stacking rules, z-index:0
// stacking contexts and z-index:auto positioned descendants (every `section`
// here is position:relative) paint together in DOM tree order — so this MUST
// render before the main content sections in page.jsx, or the particle field
// paints on top of the page instead of behind it.
export const ATMOSPHERE_HTML = "\n<canvas id=\"ambientField\" aria-hidden=\"true\"></canvas>\n<div class=\"grain\" aria-hidden=\"true\"></div>\n<div class=\"cursor-ring\" id=\"cursorRing\" aria-hidden=\"true\"></div>\n<div class=\"cursor\" id=\"cursor\" aria-hidden=\"true\"></div>\n\n<div class=\"toast\" id=\"toast\">Copied</div>\n\n";
