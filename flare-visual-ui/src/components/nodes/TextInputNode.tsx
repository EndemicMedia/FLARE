import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { TextInputNodeData } from '../../types/nodes';
import { FiEdit3, FiX } from 'react-icons/fi';
import { useFlareWorkflowStore } from '../../store/flareWorkflowStore';
import { useHandleContextMenu } from '../../contexts/HandleContextMenuContext';
import '../../styles/nodes.css';

// Prevent drag from blocking input interactions
const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

export const TextInputNode = memo(function TextInputNode({ data, id, selected }: NodeProps<TextInputNodeData>) {
  const updateNode = useFlareWorkflowStore((state) => state.updateNode);
  const removeNode = useFlareWorkflowStore((state) => state.removeNode);
  const { openHandleContextMenu } = useHandleContextMenu();

  console.log(`TextInputNode rendering - id: ${id}, selected: ${selected}`, data);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNode(id, { text: e.target.value });
  };

  return (
    <div className={`flare-node text-input-node ${data.status || 'idle'} ${selected ? 'selected' : ''}`}>
      <button className="node-close-btn" onClick={(e) => { e.stopPropagation(); removeNode(id); }} title="Remove node">
        <FiX size={14} />
      </button>

      <div className="node-header">
        <FiEdit3 className="node-icon" />
        <span className="node-title">Text Input</span>
      </div>

      <div className="node-content">
        <textarea
          className="text-input-field"
          value={data.text || ''}
          onChange={handleTextChange}
          onMouseDown={stopPropagation}
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
