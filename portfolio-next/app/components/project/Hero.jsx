import VideoPlaceholder from './VideoPlaceholder';

export default function Hero({ slug, name, year, kind, hook, headline }) {
  return (
    <header className="project-hero wrap">
      <p className="feat-meta reveal">
        <span>{year}</span>
        <span className="sep">/</span>
        <span>{kind}</span>
      </p>
      <h1 className="project-hero-name reveal">{name}</h1>
      <p className="feat-hook reveal">{hook}</p>
      <VideoPlaceholder name={name} slug={slug} />
      <p className="feat-metric reveal" style={{ marginTop: 28 }}>
        <span className="feat-metric-v">{headline.metric}</span>
        <span className="feat-metric-k">{headline.label}</span>
      </p>
    </header>
  );
}
