import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { PostProcessingNodeData } from '../../types/nodes';
import { FiFilter } from 'react-icons/fi';
import { POST_PROCESSING_OPERATIONS, getOperationById } from '../../constants/postProcessing';
import '../../styles/nodes.css';

export function PostProcessingNode({ data, id }: NodeProps<PostProcessingNodeData>) {
  const [selectedOperation, setSelectedOperation] = React.useState(data.operation);

  // Sync with data.operation changes (for programmatic updates and independent state)
  React.useEffect(() => {
    setSelectedOperation(data.operation);
  }, [data.operation]);

  const handleOperationChange = (operation: PostProcessingNodeData['operation']) => {
    setSelectedOperation(operation);
    data.operation = operation;
  };

  const currentOperation = getOperationById(selectedOperation);

  return (
    <div className={`flare-node post-processing-node ${data.status || 'idle'}`}>
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-input`}
        className="node-handle"
      />

      <div className="node-header">
        <FiFilter className="node-icon" />
        <span className="node-title">Post-Processing</span>
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

        {currentOperation?.requiresMultipleModels && (
          <div className="node-info">
            Requires multiple model inputs
          </div>
        )}

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
        id={`${id}-output`}
        className="node-handle"
      />
    </div>
  );
}
