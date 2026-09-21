import FlowDiagram from './FlowDiagram';
import CompareDiagram from './CompareDiagram';
import LoopDiagram from './LoopDiagram';
import BranchDiagram from './BranchDiagram';

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
