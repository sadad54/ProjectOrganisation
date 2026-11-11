import projects from './data/projects';
import { SITE } from './lib/site';

export default function sitemap() {
  const now = new Date();
  return [
    { url: SITE, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    ...Object.keys(projects).map((slug) => ({ url: `${SITE}/work/${slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 })),
  ];
}
