/**
 * Flare Command Node
 * 
 * Represents a nested FLARE workflow within the main graph.
 * Supports collapsible sub-graph visualization and recursive execution.
 */

import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps, Node, Edge } from 'reactflow';
import { FiChevronDown, FiChevronRight, FiX } from 'react-icons/fi';
import { useFlareWorkflowStore } from '../../store/flareWorkflowStore';
import { useHandleContextMenu } from '../../contexts/HandleContextMenuContext';
import '../../styles/nodes.css';

// Flare command node data interface
export interface FlareCommandNodeData {
    subGraph: {
        nodes: Node[];
        edges: Edge[];
    };
    compiled?: string;
    result?: string;
    status?: 'idle' | 'running' | 'success' | 'error';
    error?: string;
}

// Prevent drag from blocking interactions
const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

export const FlareCommandNode = memo(function FlareCommandNode({
    data,
    id,
    selected
}: NodeProps<FlareCommandNodeData>) {
    const removeNode = useFlareWorkflowStore((state) => state.removeNode);
    const { openHandleContextMenu } = useHandleContextMenu();
    const [expanded, setExpanded] = useState(false);

    const nodeCount = data.subGraph?.nodes?.length || 0;
    const edgeCount = data.subGraph?.edges?.length || 0;

    const handleEditSubGraph = () => {
        // TODO: Open sub-graph editor modal
        console.log('Edit sub-graph:', id);
    };

    return (
        <div className={`flare-node flare-command-node ${data.status || 'idle'} ${selected ? 'selected' : ''}`}>
            <button className="node-close-btn" onClick={(e) => { e.stopPropagation(); removeNode(id); }} title="Remove node">
                <FiX size={14} />
            </button>

            <Handle
                type="target"
                position={Position.Left}
                id="input"
                className="node-handle"
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openHandleContextMenu(id, 'input', 'target', { x: e.clientX, y: e.clientY });
                }}
            />

            <div className="node-header flare-command-header">
                <button
                    className="expand-toggle"
                    onClick={() => setExpanded(!expanded)}
                    onMouseDown={stopPropagation}
                    title={expanded ? 'Collapse' : 'Expand'}
                >
                    {expanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                </button>
                <span className="node-icon">🔄</span>
                <span className="node-title">Nested Workflow</span>
            </div>

            <div className="node-content">
                {expanded ? (
                    <div className="nested-graph-container">
                        <div className="nested-graph-header">
                            <span className="graph-stats">
                                {nodeCount} node{nodeCount !== 1 ? 's' : ''}, {edgeCount} edge{edgeCount !== 1 ? 's' : ''}
                            </span>
                            <button
                                className="edit-subgraph-btn"
                                onClick={handleEditSubGraph}
                                onMouseDown={stopPropagation}
                                title="Edit nested workflow"
                            >
                                ✏️ Edit
                            </button>
                        </div>
                        <div className="nested-graph-preview">
                            {nodeCount > 0 ? (
                                <div className="mini-canvas-placeholder">
                                    {/* TODO: Implement MiniFlareCanvas component */}
                                    <div className="placeholder-text">
                                        📊 Sub-graph visualization
                                        <br />
                                        <small>(Mini canvas coming soon)</small>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-subgraph">
                                    <span>Empty workflow</span>
                                    <button
                                        className="add-nodes-btn"
                                        onClick={handleEditSubGraph}
                                        onMouseDown={stopPropagation}
                                    >
                                        + Add Nodes
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="compiled-preview">
                        <div className="preview-label">Compiled Command:</div>
                        <code className="flare-syntax">
                            {data.compiled || '{ flare ... }'}
                        </code>
                    </div>
                )}

                {/* Result Display */}
                {data.result && (
                    <div className="nested-result">
                        <div className="result-label">Result:</div>
                        <div className="result-content">{data.result}</div>
                    </div>
                )}

                {/* Status Indicator */}
                {data.status === 'running' && (
                    <div className="node-status running">
                        ⏳ Executing nested workflow...
                    </div>
                )}
            </div>

            {data.error && (
                <div className="node-error">{data.error}</div>
            )}

            <Handle
                type="source"
                position={Position.Right}
                id="output"
                className="node-handle"
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openHandleContextMenu(id, 'output', 'source', { x: e.clientX, y: e.clientY });
                }}
            />
        </div>
    );
});
