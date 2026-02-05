import React from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { ParameterNodeData } from '../../types/nodes';
import { FiSliders } from 'react-icons/fi';
import '../../styles/nodes.css';

export function ParameterNode({ data, id }: NodeProps<ParameterNodeData>) {
  const [value, setValue] = React.useState(data.value);

  // Sync with data.value changes (for programmatic updates)
  React.useEffect(() => {
    setValue(data.value);
  }, [data.value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);
    data.value = newValue;
  };

  // Handle both input and change events for better test compatibility
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const newValue = parseFloat((e.target as HTMLInputElement).value);
    setValue(newValue);
    data.value = newValue;
  };

  const getParameterLabel = () => {
    switch (data.paramType) {
      case 'temperature':
        return 'Temperature';
      default:
        return data.paramType;
    }
  };

  const getParameterDescription = () => {
    switch (data.paramType) {
      case 'temperature':
        return 'Controls randomness (0.0 = deterministic, 2.0 = creative)';
      default:
        return '';
    }
  };

  return (
    <div className={`flare-node parameter-node ${data.status || 'idle'}`}>
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
            onInput={handleInput}
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
}
