import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { OutputNodeData } from '../../types/nodes';
import { FiEye, FiCopy, FiCode } from 'react-icons/fi';
import { useFlareWorkflowStore } from '../../store/flareWorkflowStore';
import '../../styles/nodes.css';

export function OutputNode({ data, id, selected }: NodeProps<OutputNodeData>) {
  const updateNode = useFlareWorkflowStore((state) => state.updateNode);

  console.log(`OutputNode rendering - id: ${id}, selected: ${selected}`, data);

  const handleCopy = () => {
    if (data.content) {
      navigator.clipboard.writeText(data.content);
    }
  };

  const handleDisplayModeChange = (mode: OutputNodeData['displayMode']) => {
    updateNode(id, { displayMode: mode });
  };

  const renderContent = () => {
    if (!data.content) {
      return <div className="output-placeholder">No output yet. Run the workflow to see results.</div>;
    }

    switch (data.displayMode) {
      case 'json':
        try {
          const formatted = JSON.stringify(JSON.parse(data.content), null, 2);
          return <pre className="output-json">{formatted}</pre>;
        } catch {
          return <pre className="output-text">{data.content}</pre>;
        }
      case 'markdown':
        return <div className="output-markdown">{data.content}</div>;
      case 'text':
      default:
        return <div className="output-text">{data.content}</div>;
    }
  };

  return (
    <div className={`flare-node output-node ${data.status || 'idle'} ${selected ? 'selected' : ''}`}>
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-input`}
        className="node-handle"
      />

      <div className="node-header">
        <FiEye className="node-icon" />
        <span className="node-title">Output</span>
      </div>

      <div className="node-content">
        <div className="output-controls">
          <div className="display-mode-selector">
            <button
              className={`mode-button ${data.displayMode === 'text' ? 'active' : ''}`}
              onClick={() => handleDisplayModeChange('text')}
              title="Text mode"
            >
              Text
            </button>
            <button
              className={`mode-button ${data.displayMode === 'json' ? 'active' : ''}`}
              onClick={() => handleDisplayModeChange('json')}
              title="JSON mode"
            >
              <FiCode size={14} /> JSON
            </button>
            <button
              className={`mode-button ${data.displayMode === 'markdown' ? 'active' : ''}`}
              onClick={() => handleDisplayModeChange('markdown')}
              title="Markdown mode"
            >
              MD
            </button>
          </div>

          {data.content && (
            <button
              className="copy-button"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              <FiCopy size={14} /> Copy
            </button>
          )}
        </div>

        <div className="output-display">
          {renderContent()}
        </div>
      </div>

      {data.error && (
        <div className="node-error">{data.error}</div>
      )}
    </div>
  );
}
