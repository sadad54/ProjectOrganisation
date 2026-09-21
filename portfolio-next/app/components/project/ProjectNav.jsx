import Link from 'next/link';

export default function ProjectNav({ prev, next }) {
  return (
    <nav className="project-nav wrap" aria-label="More projects">
      <Link href="/#work">&larr; All work</Link>
      <span style={{ display: 'flex', gap: 20 }}>
        {prev && <Link href={`/work/${prev.slug}`}>&larr; {prev.name}</Link>}
        {next && <Link href={`/work/${next.slug}`}>{next.name} &rarr;</Link>}
      </span>
    </nav>
  );
}
