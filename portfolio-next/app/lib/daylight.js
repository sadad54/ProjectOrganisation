/* What time of day it is in Kuala Lumpur, as a mood for the field. KL sits
   near the equator, so sunrise and sunset barely move through the year
   (about 07:00 and 19:15); the windows below are fixed approximations, not an
   ephemeris. `warm` is how much dawn or dusk there is (0..1), `deep` how much
   night (0..1). */
const hourInKL = (d) => {
  const [h, m] = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit', hour12: false })
    .format(d)
    .split(':')
    .map(Number);
  return (h % 24) + m / 60;
};
const bump = (h, c, w) => Math.max(0, 1 - Math.abs(h - c) / w);

export function daylight(date = new Date()) {
  const h = hourInKL(date);
  const warm = Math.max(bump(h, 7.1, 1.2), bump(h, 19.2, 1.2));
  const night = h < 6.2 || h > 20.2 ? 1 : h < 7.2 ? 7.2 - h : h > 19.2 ? h - 19.2 : 0;
  const phase = warm > 0.25 ? (h < 12 ? 'dawn' : 'dusk') : night > 0.5 ? 'night' : 'day';
  return { warm, deep: Math.min(1, night), phase, hour: h };
}
