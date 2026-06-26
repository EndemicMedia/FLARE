/**
 * MiniFlareCanvas
 *
 * A small read-only ReactFlow canvas used to preview sub-graph contents
 * inside a FlareCommandNode.
 */

import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';
import type { FlareNode } from '../types/nodes';
import type { FlareEdge } from '../types/edges';

interface MiniFlareCanvasProps {
  nodes: FlareNode[];
  edges: FlareEdge[];
  className?: string;
}

export function MiniFlareCanvas({ nodes, edges, className }: MiniFlareCanvasProps) {
  return (
    <div
      className={className}
      style={{ width: '100%', height: 120, borderRadius: 6, overflow: 'hidden' }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        proOptions={{ hideAttribution: true }}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
