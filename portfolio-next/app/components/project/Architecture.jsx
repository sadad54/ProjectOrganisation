import { DiagramRenderer } from './diagrams';

export default function Architecture({ summary, diagram }) {
  return (
    <div className="reveal-group" style={{ marginTop: 48 }}>
      <h2 className="work-subhead reveal">How it works</h2>
      <p className="feat-hook reveal">{summary}</p>
      <div className="reveal">
        <DiagramRenderer diagram={diagram} title="Architecture diagram" />
      </div>
    </div>
  );
}
