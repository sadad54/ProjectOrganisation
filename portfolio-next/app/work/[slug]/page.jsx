import fs from 'node:fs';
import path from 'node:path';
import { notFound } from 'next/navigation';
import projects from '../../data/projects';
import { WORK } from '../../data/work';
import ProjectPage from '../../components/project/ProjectPage';

export function generateStaticParams() {
  return Object.keys(projects).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = projects[slug];
  if (!project) return {};
  const title = `${project.name} — Adnan Mashrur Sadad`;
  return {
    title,
    description: project.hook,
    alternates: { canonical: `/work/${slug}` },
    openGraph: { title, description: project.hook, type: 'article', url: `/work/${slug}` },
    twitter: { card: 'summary_large_image', title, description: project.hook },
  };
}

/* Screenshots are listed at build time from what is actually on disk, so a
   project whose folder is still empty (ProofHire) simply has no gallery —
   never a broken frame. */
function existingShots(dir, count) {
  if (!dir) return [];
  const base = path.join(process.cwd(), 'public', 'assets', 'screenshots', dir);
  let files = [];
  try {
    files = fs.readdirSync(base).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  } catch {
    return [];
  }
  files.sort();
  return files.slice(0, count || files.length).map((f) => `/assets/screenshots/${dir}/${f}`);
}

export default async function Page({ params }) {
  const { slug } = await params;
  const project = projects[slug];
  if (!project) notFound();

  const order = Object.keys(projects);
  const idx = order.indexOf(slug);
  const prev = idx > 0 ? { slug: order[idx - 1], name: projects[order[idx - 1]].name, hook: projects[order[idx - 1]].hook } : null;
  const nx = projects[order[idx + 1]];
  const next = nx ? { slug: nx.slug, name: nx.name, hook: nx.hook, kind: nx.kind, headline: nx.headline } : null;
  const indexEntry = WORK.find((p) => p.slug === slug) || null;
  const shots = project.screenshots ? existingShots(project.screenshots.dir, project.screenshots.count) : [];

  // structured data: what this page is, for search engines and link unfurlers
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.name,
    headline: project.hook,
    description: project.overview?.summary || project.hook,
    dateCreated: String(project.year),
    keywords: (project.chips || []).join(', '),
    author: { '@type': 'Person', name: 'Adnan Mashrur Sadad', url: 'https://github.com/sadad54' },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
      <ProjectPage
      project={project}
      entry={indexEntry}
      shots={shots}
      prev={prev}
      next={next}
      num={idx + 1}
      total={order.length}
    />
    </>
  );
}
