import { notFound } from 'next/navigation';
import projects from '../../data/projects';
import ProjectPage from '../../components/project/ProjectPage';

export function generateStaticParams() {
  return Object.keys(projects).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = projects[slug];
  if (!project) return {};
  return {
    title: `${project.name} — Adnan Mashrur Sadad`,
    description: project.hook,
  };
}

export default async function Page({ params }) {
  const { slug } = await params;
  const project = projects[slug];
  if (!project) notFound();

  const order = Object.keys(projects);
  const idx = order.indexOf(slug);
  const prev = idx > 0 ? { slug: order[idx - 1], name: projects[order[idx - 1]].name } : null;
  const next = idx < order.length - 1 ? { slug: order[idx + 1], name: projects[order[idx + 1]].name } : null;

  return <ProjectPage project={project} prev={prev} next={next} />;
}
