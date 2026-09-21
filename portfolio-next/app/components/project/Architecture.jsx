import FlowDiagram from './diagrams/FlowDiagram';
import CompareDiagram from './diagrams/CompareDiagram';
import LoopDiagram from './diagrams/LoopDiagram';
import BranchDiagram from './diagrams/BranchDiagram';

const DIAGRAM_COMPONENTS = {
  flow: FlowDiagram,
  compare: CompareDiagram,
  loop: LoopDiagram,
  branch: BranchDiagram,
};

export function DiagramRenderer({ diagram, title }) {
  const Component = DIAGRAM_COMPONENTS[diagram.type];
  if (!Component) return null;
  const { type, ...props } = diagram;
  return (
    <div className="diagram-frame">
      <Component {...props} title={title} />
    </div>
  );
}

export default function Architecture({ summary, diagram }) {
  return (
    <div className="reveal-group" style={{ marginTop: 48 }}>
      <h3 className="work-subhead reveal">How it works</h3>
      <p className="feat-hook reveal">{summary}</p>
      <div className="reveal">
        <DiagramRenderer diagram={diagram} title="Architecture diagram" />
      </div>
    </div>
  );
}
