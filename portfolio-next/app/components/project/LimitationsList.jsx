export default function LimitationsList({ items }) {
  if (!items?.length) return null;
  return (
    <div className="limitations-block reveal-group" style={{ marginTop: 48 }}>
      <h3 className="work-subhead reveal">Honest limitations</h3>
      <ul className="limitations reveal">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
