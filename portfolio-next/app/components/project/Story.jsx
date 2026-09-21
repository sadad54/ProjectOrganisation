export default function Story({ situation, task, action, result }) {
  const parts = [
    ['Situation', situation],
    ['Task', task],
    ['Action', action],
    ['Result', result],
  ];
  return (
    <div className="reveal-group" style={{ marginTop: 48 }}>
      <h3 className="work-subhead reveal">The story</h3>
      <div className="story">
        {parts.map(([label, text]) => (
          <div key={label}>
            <h4>{label}</h4>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
