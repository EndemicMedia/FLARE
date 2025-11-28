import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { ModelQueryNodeData } from '../../types/nodes';
import { FiCpu } from 'react-icons/fi';
import { AVAILABLE_MODELS, getModelById } from '../../constants/models';
import { useFlareWorkflowStore } from '../../store/flareWorkflowStore';
import '../../styles/nodes.css';

const POST_PROCESSING_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'sum', label: 'Summarize' },
  { value: 'vote', label: 'Vote' },
  { value: 'comb', label: 'Combine' },
  { value: 'diff', label: 'Compare' },
  { value: 'exp', label: 'Expand' },
  { value: 'filter', label: 'Filter' },
];

export function ModelQueryNode({ data, id, selected }: NodeProps<ModelQueryNodeData>) {
  const updateNode = useFlareWorkflowStore((state) => state.updateNode);

  const toggleModel = (modelId: string) => {
    const newSelection = data.models.includes(modelId)
      ? data.models.filter(m => m !== modelId)
      : [...data.models, modelId];

    updateNode(id, { models: newSelection });
  };

  return (
    <div className={`flare-node model-query-node ${data.status || 'idle'} ${selected ? 'selected' : ''}`}>
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-input`}
        className="node-handle"
      />

      <div className="node-header">
        <FiCpu className="node-icon" />
        <span className="node-title">Model Query</span>
      </div>

      <div className="node-content">
        <div className="model-selector">
          {AVAILABLE_MODELS.map(model => {
            const isSelected = data.models.includes(model.id);
            return (
              <button
                key={model.id}
                className={`model-chip ${isSelected ? 'selected' : ''}`}
                style={{
                  borderColor: isSelected ? model.color : '#ccc',
                  backgroundColor: isSelected ? `${model.color}20` : 'transparent'
                }}
                onClick={() => toggleModel(model.id)}
                title={model.description}
              >
                <span className="model-chip-name">{model.name}</span>
              </button>
            );
          })}
        </div>

        {data.models.length === 0 && (
          <div className="node-warning">Select at least one model</div>
        )}

        <div className="node-section" style={{ marginTop: '12px' }}>
          <label className="node-label">
            Temperature: {data.temperature?.toFixed(1) || '1.0'}
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={data.temperature || 1.0}
            onChange={(e) => updateNode(id, { temperature: parseFloat(e.target.value) })}
            className="temperature-slider"
          />
        </div>

        <div className="node-section">
          <label className="node-label">Post-Processing</label>
          <select
            value={data.postProcessing || ''}
            onChange={(e) => updateNode(id, { postProcessing: e.target.value })}
            className="node-select"
          >
            {POST_PROCESSING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {data.results && data.results.length > 0 && (
          <div className="model-results">
            {data.results.map((result, idx) => (
              <div key={idx} className="model-result-item">
                <div className="result-model-name">
                  {getModelById(data.models[idx])?.name || data.models[idx]}
                </div>
                <div className="result-text">{result}</div>
              </div>
            ))}
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
