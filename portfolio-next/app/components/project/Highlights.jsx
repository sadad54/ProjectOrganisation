import { DiagramRenderer } from './diagrams';

export default function Highlights({ items }) {
  if (!items?.length) return null;
  return (
    <div style={{ marginTop: 48 }}>
      <h2 className="work-subhead reveal">Highlights</h2>
      <div className="highlights">
        {items.map((item) => (
          <div key={item.title} className="reveal">
            <p className="feat-name" style={{ fontSize: '1.3rem', marginBottom: 0 }}>
              {item.title}
            </p>
            <DiagramRenderer diagram={item.diagram} title={item.title} />
            <p className="highlight-caption" dangerouslySetInnerHTML={{ __html: item.caption }} />
          </div>
        ))}
      </div>
    </div>
  );
}
