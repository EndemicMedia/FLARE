import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { ModelQueryNodeData } from '../../types/nodes';
import { FiCpu, FiChevronDown, FiChevronRight, FiX } from 'react-icons/fi';
import { SingleModelSelector } from './SingleModelSelector';
import { useFlareWorkflowStore } from '../../store/flareWorkflowStore';
import { useHandleContextMenu } from '../../contexts/HandleContextMenuContext';
import '../../styles/nodes.css';

// Prevent drag from blocking interactions
const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

// Get descriptive label for temperature
const getTemperatureLabel = (temp: number) => {
  if (temp < 0.3) return 'Deterministic';
  if (temp > 1.5) return 'Very Creative';
  return 'Balanced';
};

export const ModelQueryNode = memo(function ModelQueryNode({ data, id, selected }: NodeProps<ModelQueryNodeData>) {
  const updateNode = useFlareWorkflowStore((state) => state.updateNode);
  const removeNode = useFlareWorkflowStore((state) => state.removeNode);
  const { openHandleContextMenu } = useHandleContextMenu();
  const [showAdvanced, setShowAdvanced] = useState(false);

  console.log(`ModelQueryNode rendering - id: ${id}, selected: ${selected}`, data);

  // Get the first model from the array (for backwards compatibility)
  const selectedModel = data.models?.[0] || data.model || null;

  const handleModelChange = (model: string) => {
    // Store as single model for new architecture, but keep models array for backwards compat
    updateNode(id, { model, models: [model] });
  };

  const temperature = data.temperature ?? 1.0;
  const maxTokens = data.maxTokens ?? 2048;
  const seed = data.seed ?? null;
  const topP = data.topP ?? 1.0;

  return (
    <div className={`flare-node model-query-node ${data.status || 'idle'} ${selected ? 'selected' : ''}`}>
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

      <div className="node-header">
        <FiCpu className="node-icon" />
        <span className="node-title">Model Query</span>
      </div>

      <div className="node-content">
        {/* Single Model Selector */}
        <SingleModelSelector
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
        />

        {!selectedModel && (
          <div className="node-warning">Select a model</div>
        )}

        {/* Advanced Parameters Section */}
        <div className="node-section advanced-section">
          <button
            className="advanced-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
            onMouseDown={stopPropagation}
          >
            {showAdvanced ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
            <span>⚙️ Advanced Parameters</span>
          </button>

          {showAdvanced && (
            <div className="advanced-params">
              {/* Temperature */}
              <div className="param-row">
                <label className="param-label">
                  🌡️ Temperature: {temperature.toFixed(1)}
                  <span className="param-hint">{getTemperatureLabel(temperature)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => updateNode(id, { temperature: parseFloat(e.target.value) })}
                  onMouseDown={stopPropagation}
                  className="temperature-slider"
                />
              </div>

              {/* Max Tokens */}
              <div className="param-row">
                <label className="param-label">📏 Max Tokens</label>
                <input
                  type="number"
                  min="1"
                  max="128000"
                  value={maxTokens}
                  onChange={(e) => updateNode(id, { maxTokens: parseInt(e.target.value) || 2048 })}
                  onMouseDown={stopPropagation}
                  className="param-input"
                />
              </div>

              {/* Seed */}
              <div className="param-row">
                <label className="param-label">🎲 Seed (optional)</label>
                <input
                  type="number"
                  min="0"
                  value={seed ?? ''}
                  placeholder="Random"
                  onChange={(e) => updateNode(id, { seed: e.target.value ? parseInt(e.target.value) : null })}
                  onMouseDown={stopPropagation}
                  className="param-input"
                />
              </div>

              {/* Top-P */}
              <div className="param-row">
                <label className="param-label">
                  🎯 Top-P: {topP.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={topP}
                  onChange={(e) => updateNode(id, { topP: parseFloat(e.target.value) })}
                  onMouseDown={stopPropagation}
                  className="temperature-slider"
                />
              </div>
            </div>
          )}
        </div>

        {/* Result display */}
        {data.result && (
          <div className="model-result">
            <div className="result-label">Response:</div>
            <div className="result-text">{data.result}</div>
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
