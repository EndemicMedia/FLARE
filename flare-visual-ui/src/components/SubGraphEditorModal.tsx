/**
 * SubGraphEditorModal
 *
 * Full-screen modal for previewing and editing a FlareCommandNode's sub-graph.
 * Shows a read-only ReactFlow canvas of the nested workflow.
 */

import ReactFlow, { Controls, Background, BackgroundVariant } from 'reactflow';
import 'reactflow/dist/style.css';
import type { FlareNode } from '../types/nodes';
import type { FlareEdge } from '../types/edges';

interface SubGraphData {
  nodes: FlareNode[];
  edges: FlareEdge[];
}

interface SubGraphEditorModalProps {
  nodeId: string;
  subGraph: SubGraphData;
  onSave: (subGraph: SubGraphData) => void;
  onClose: () => void;
}

export function SubGraphEditorModal({
  nodeId: _nodeId, // reserved for future use (e.g. sub-graph title)
  subGraph,
  onSave,
  onClose,
}: SubGraphEditorModalProps) {
  const { nodes, edges } = subGraph;

  const handleSave = () => {
    onSave(subGraph);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal panel */}
      <div
        className="relative bg-gray-900 rounded-xl shadow-2xl border border-gray-700 flex flex-col"
        style={{ width: '80vw', height: '70vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700 shrink-0">
          <span className="text-white font-semibold text-sm">🔄 Nested Workflow Preview</span>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-medium transition-colors"
            >
              Done
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Note */}
        <div className="px-5 py-2 bg-gray-800/60 border-b border-gray-700 text-xs text-gray-400 shrink-0">
          This is a read-only preview. To edit the sub-graph, build it on the main canvas then assign it to this node.
        </div>

        {/* Canvas area */}
        <div className="flex-1 relative">
          {nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              <div className="text-center">
                <div className="text-3xl mb-2">🔄</div>
                <p>Sub-graph is empty.</p>
                <p className="text-xs mt-2 text-gray-500">
                  Build nodes on the main canvas and nest them here.
                </p>
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              proOptions={{ hideAttribution: true }}
              style={{ width: '100%', height: '100%' }}
            >
              <Controls />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          )}
        </div>
      </div>
    </div>
  );
}
