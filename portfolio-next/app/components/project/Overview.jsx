export default function Overview({ summary, bullets }) {
  return (
    <div className="reveal-group">
      <h3 className="work-subhead reveal">Overview</h3>
      <p className="feat-hook reveal">{summary}</p>
      <ul className="notes reveal-group">
        {bullets.map((b, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: b }} />
        ))}
      </ul>
    </div>
  );
}
