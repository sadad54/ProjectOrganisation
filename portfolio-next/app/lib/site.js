/* The site's absolute origin, for anything that must print a full URL
   (sitemap, robots, structured data). SITE_URL wins; on Vercel the
   production domain is used; locally it falls back to localhost. */
export const SITE =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');
