export default function VideoPlaceholder({ name, slug }) {
  return (
    <div className="video-placeholder" data-video-slot={slug}>
      <div className="video-placeholder-play" aria-hidden="true">
        &#9654;
      </div>
      <span className="video-placeholder-cap">{name} — demo video coming soon</span>
    </div>
  );
}
