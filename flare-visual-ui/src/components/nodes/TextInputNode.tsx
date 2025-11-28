import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { TextInputNodeData } from '../../types/nodes';
import { FiEdit3 } from 'react-icons/fi';
import { useFlareWorkflowStore } from '../../store/flareWorkflowStore';
import '../../styles/nodes.css';

export function TextInputNode({ data, id, selected }: NodeProps<TextInputNodeData>) {
  const updateNode = useFlareWorkflowStore((state) => state.updateNode);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNode(id, { text: e.target.value });
  };

  return (
    <div className={`flare-node text-input-node ${data.status || 'idle'} ${selected ? 'selected' : ''}`}>
      <div className="node-header">
        <FiEdit3 className="node-icon" />
        <span className="node-title">Text Input</span>
      </div>

      <div className="node-content">
        <textarea
          className="text-input-field"
          value={data.text || ''}
          onChange={handleTextChange}
          placeholder={data.placeholder || 'Enter your prompt here...'}
          rows={4}
        />
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
