import { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { ParameterNodeData } from '../../types/nodes';
import { FiSliders, FiX } from 'react-icons/fi';
import { useFlareWorkflowStore } from '../../store/flareWorkflowStore';
import '../../styles/nodes.css';

// Prevent drag from blocking slider interactions
const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

export const ParameterNode = memo(function ParameterNode({ data, id }: NodeProps<ParameterNodeData>) {
  const updateNode = useFlareWorkflowStore((state) => state.updateNode);
  const removeNode = useFlareWorkflowStore((state) => state.removeNode);
  const [value, setValue] = useState(data.value);

  // Sync with data.value changes (for programmatic updates)
  useEffect(() => {
    setValue(data.value);
  }, [data.value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);
    updateNode(id, { value: newValue });
  };

  const getParameterLabel = () => {
    switch (data.paramType) {
      case 'temperature':
        return 'Temperature';
      default:
        return data.paramType;
    }
  };

  const getTemperatureLabel = () => {
    if (value < 0.3) return 'Deterministic';
    if (value > 1.5) return 'Very Creative';
    return 'Balanced';
  };

  const getParameterDescription = () => {
    switch (data.paramType) {
      case 'temperature':
        return `${getTemperatureLabel()} (${value.toFixed(1)})`;
      default:
        return '';
    }
  };

  return (
    <div className={`flare-node parameter-node ${data.status || 'idle'}`}>
      <button className="node-close-btn" onClick={(e) => { e.stopPropagation(); removeNode(id); }} title="Remove node">
        <FiX size={14} />
      </button>
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-input`}
        className="node-handle"
      />

      <div className="node-header">
        <FiSliders className="node-icon" />
        <span className="node-title">{getParameterLabel()}</span>
      </div>

      <div className="node-content">
        <div className="parameter-control">
          <div className="parameter-value-display">
            {value.toFixed(2)}
          </div>

          <input
            type="range"
            className="parameter-slider"
            min={data.min}
            max={data.max}
            step={0.1}
            value={value}
            onChange={handleChange}
            onMouseDown={stopPropagation}
          />

          <div className="parameter-range">
            <span>{data.min}</span>
            <span>{data.max}</span>
          </div>

          {getParameterDescription() && (
            <div className="parameter-description">
              {getParameterDescription()}
            </div>
          )}
        </div>
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
});
