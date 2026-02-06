import { memo, useState, useEffect, useMemo } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { PostProcessingNodeData } from '../../types/nodes';
import { FiFilter, FiPlus, FiMinus, FiX } from 'react-icons/fi';
import { POST_PROCESSING_OPERATIONS, getOperationById } from '../../constants/postProcessing';
import { useFlareWorkflowStore } from '../../store/flareWorkflowStore';
import { useHandleContextMenu } from '../../contexts/HandleContextMenuContext';
import '../../styles/nodes.css';

// Prevent drag from blocking button clicks
const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

export const PostProcessingNode = memo(function PostProcessingNode({ data, id, selected }: NodeProps<PostProcessingNodeData>) {
  const updateNode = useFlareWorkflowStore((state) => state.updateNode);
  const removeNode = useFlareWorkflowStore((state) => state.removeNode);
  const edges = useFlareWorkflowStore((state) => state.edges);
  const { openHandleContextMenu } = useHandleContextMenu();
  const [selectedOperation, setSelectedOperation] = useState(data.operation);

  // Track number of inputs - start with data.inputCount or count connected edges
  const connectedInputCount = useMemo(() => {
    return edges.filter(e => e.target === id).length;
  }, [edges, id]);

  // Use the higher of declared inputs or connected inputs
  const inputCount = Math.max(data.inputCount || 2, connectedInputCount);

  // Sync with data.operation changes (for programmatic updates)
  useEffect(() => {
    setSelectedOperation(data.operation);
  }, [data.operation]);

  const handleOperationChange = (operation: PostProcessingNodeData['operation']) => {
    setSelectedOperation(operation);
    updateNode(id, { operation });
  };

  const addInput = () => {
    const newCount = (data.inputCount || 2) + 1;
    updateNode(id, { inputCount: newCount });
  };

  const removeInput = () => {
    const currentCount = data.inputCount || 2;
    if (currentCount > 2) {
      updateNode(id, { inputCount: currentCount - 1 });
    }
  };

  const currentOperation = getOperationById(selectedOperation);

  // Generate input handles dynamically
  const inputHandles = useMemo(() => {
    const handles = [];
    const handleCount = inputCount;

    for (let i = 0; i < handleCount; i++) {
      // Distribute handles vertically
      const topPercent = handleCount === 1 ? 50 : 20 + (i * 60 / (handleCount - 1));
      handles.push(
        <Handle
          key={`${id}-input-${i}`}
          type="target"
          position={Position.Left}
          id={`input-${i}`}
          className="node-handle"
          style={{ top: `${topPercent}%` }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openHandleContextMenu(id, `input-${i}`, 'target', { x: e.clientX, y: e.clientY });
          }}
        />
      );
    }
    return handles;
  }, [id, inputCount, openHandleContextMenu]);

  return (
    <div className={`flare-node post-processing-node ${data.status || 'idle'} ${selected ? 'selected' : ''}`}>
      <button className="node-close-btn" onClick={(e) => { e.stopPropagation(); removeNode(id); }} title="Remove node">
        <FiX size={14} />
      </button>
      {/* Dynamic Input Handles */}
      {inputHandles}

      <div className="node-header">
        <FiFilter className="node-icon" />
        <span className="node-title">Post-Processing</span>

        {/* Input count controls */}
        <div className="input-controls" onMouseDown={stopPropagation}>
          <button
            className="input-control-btn"
            onClick={removeInput}
            disabled={(data.inputCount || 2) <= 2}
            title="Remove input"
          >
            <FiMinus size={12} />
          </button>
          <span className="input-count" title="Number of inputs">
            {inputCount}
          </span>
          <button
            className="input-control-btn"
            onClick={addInput}
            title="Add input"
          >
            <FiPlus size={12} />
          </button>
        </div>
      </div>

      <div className="node-content">
        <div className="operation-selector">
          {POST_PROCESSING_OPERATIONS.map(op => {
            const isSelected = op.id === selectedOperation;
            return (
              <button
                key={op.id}
                className={`operation-chip ${isSelected ? 'selected' : ''}`}
                style={{
                  borderColor: isSelected ? op.color : '#ccc',
                  backgroundColor: isSelected ? `${op.color}20` : 'transparent'
                }}
                onClick={() => handleOperationChange(op.id as PostProcessingNodeData['operation'])}
                onMouseDown={stopPropagation}
                title={op.description}
              >
                <span className="operation-icon">{op.icon}</span>
                <span className="operation-name">{op.name}</span>
              </button>
            );
          })}
        </div>

        {currentOperation && (
          <div className="operation-description">
            {currentOperation.description}
          </div>
        )}

        {/* Connected inputs indicator */}
        <div className="connected-inputs-info">
          📥 {connectedInputCount} input{connectedInputCount !== 1 ? 's' : ''} connected
        </div>

        {data.result && (
          <div className="processing-result">
            <div className="result-label">Result:</div>
            <div className="result-content">{data.result}</div>
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
