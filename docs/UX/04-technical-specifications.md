# 4. Technical Specifications

## 4.1 Component Implementation Details

**Main Canvas Component:**
```javascript
// src/components/FlareWorkflowCanvas.jsx
import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useFlareWorkflowStore } from '../store/flareWorkflowStore';
import { isValidConnection } from '../utils/connectionValidator';

// Import custom node types
import TextInputNode from './nodes/TextInputNode';
import ModelQueryNode from './nodes/ModelQueryNode';
import PostProcessingNode from './nodes/PostProcessingNode';
import ParameterNode from './nodes/ParameterNode';
import OutputNode from './nodes/OutputNode';
import FlareCommandNode from './nodes/FlareCommandNode';

const nodeTypes = {
  textInput: TextInputNode,
  modelQuery: ModelQueryNode,
  postProcessing: PostProcessingNode,
  parameter: ParameterNode,
  output: OutputNode,
  flareCommand: FlareCommandNode,
};

export default function FlareWorkflowCanvas() {
  const {
    nodes,
    edges,
    addEdge: storeAddEdge,
    updateNode,
    selectedNode,
  } = useFlareWorkflowStore();

  const [localNodes, setNodes, onNodesChange] = useNodesState(nodes);
  const [localEdges, setEdges, onEdgesChange] = useEdgesState(edges);

  const onConnect = useCallback(
    (params) => {
      if (isValidConnection(params, localNodes, localEdges)) {
        storeAddEdge(params);
        setEdges((eds) => addEdge(params, eds));
      } else {
        alert('Invalid connection: incompatible node types or constraints violated');
      }
    },
    [localNodes, localEdges, storeAddEdge, setEdges]
  );

  const onNodeClick = useCallback(
    (event, node) => {
      useFlareWorkflowStore.setState({ selectedNode: node.id });
    },
    []
  );

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.data.status === 'error') return '#e53e3e';
            if (n.data.status === 'loading') return '#3182ce';
            if (n.data.status === 'completed') return '#48bb78';
            return '#718096';
          }}
          nodeColor={(n) => {
            if (n.type === 'textInput') return '#e2e8f0';
            if (n.type === 'modelQuery') return '#bee3f8';
            if (n.type === 'postProcessing') return '#c6f6d5';
            if (n.type === 'parameter') return '#fed7d7';
            if (n.type === 'output') return '#feebc8';
            return '#edf2f7';
          }}
        />
      </ReactFlow>
    </div>
  );
}
```

## 4.2 API Integration Patterns

**Backend Integration Service:**
```javascript
// src/services/flareApiService.js

/**
 * Service for communicating with FLARE backend at /process-flare
 */
const FLARE_API_BASE = process.env.REACT_APP_FLARE_API_URL || 'http://localhost:8080';

export const flareApiService = {
  /**
   * Process a FLARE command via backend API
   */
  async processFlareCommand(flareCommand) {
    try {
      const response = await fetch(`${FLARE_API_BASE}/process-flare`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command: flareCommand }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Error processing FLARE command:', error);
      throw error;
    }
  },

  /**
   * Execute model query directly (for single nodes)
   */
  async executeModelQuery({ modelName, temp, prompt }) {
    // Construct simple FLARE command for single model query
    const flareCommand = `{ flare model:${modelName} temp:${temp} \`${prompt}\` }`;
    return this.processFlareCommand(flareCommand);
  },

  /**
   * Apply post-processing operation
   */
  async applyPostProcessing({ operation, responses, model }) {
    // Construct FLARE command with pre-computed responses
    // This requires backend to support injecting responses
    // Alternatively, execute the full graph as a single FLARE command
    const combinedPrompt = responses.join('\n\n---\n\n');
    const flareCommand = `{ flare model:${model || 'openai'} ${operation} \`${combinedPrompt}\` }`;
    return this.processFlareCommand(flareCommand);
  },

  /**
   * Execute complete workflow by compiling to FLARE and sending to backend
   */
  async executeWorkflow(nodes, edges) {
    const flareCommand = graphToFlareCommand(nodes, edges);
    console.log('Executing FLARE command:', flareCommand);
    return this.processFlareCommand(flareCommand);
  },
};
```

## 4.3 Node Configuration Panel

**Dynamic Config Panel:**
```javascript
// src/components/NodeConfigPanel.jsx
import React from 'react';
import { useFlareWorkflowStore } from '../store/flareWorkflowStore';

export default function NodeConfigPanel() {
  const { selectedNode, nodes, updateNode } = useFlareWorkflowStore();

  if (!selectedNode) {
    return (
      <div className="config-panel empty">
        <p>Select a node to configure</p>
      </div>
    );
  }

  const node = nodes.find(n => n.id === selectedNode);
  if (!node) return null;

  const renderConfig = () => {
    switch (node.type) {
      case 'modelQuery':
        return (
          <div className="config-section">
            <h3>Model Query Configuration</h3>

            <label>Models:</label>
            <ModelMultiSelect
              selected={node.data.models}
              onChange={(models) => updateNode(selectedNode, { models })}
              options={[
                { value: 'openai', label: 'OpenAI GPT-5 Nano' },
                { value: 'mistral', label: 'Mistral Small 3.1' },
                { value: 'gemini', label: 'Gemini 2.5 Flash' },
                { value: 'nova-fast', label: 'Amazon Nova Micro' },
                { value: 'qwen-coder', label: 'Qwen 2.5 Coder' },
              ]}
            />

            <label>Concurrent Execution:</label>
            <input
              type="checkbox"
              checked={node.data.concurrent}
              onChange={(e) => updateNode(selectedNode, { concurrent: e.target.checked })}
            />
            <span>Execute models in parallel</span>
          </div>
        );

      case 'postProcessing':
        return (
          <div className="config-section">
            <h3>Post-Processing Configuration</h3>

            <label>Operation:</label>
            <select
              value={node.data.operation}
              onChange={(e) => updateNode(selectedNode, { operation: e.target.value })}
            >
              <option value="vote">Vote (Select Best)</option>
              <option value="sum">Summarize</option>
              <option value="comb">Combine</option>
              <option value="diff">Compare</option>
              <option value="exp">Expand</option>
              <option value="filter">Filter Quality</option>
            </select>

            <label>Processing Model (Optional):</label>
            <select
              value={node.data.model || ''}
              onChange={(e) => updateNode(selectedNode, { model: e.target.value })}
            >
              <option value="">Use first model</option>
              <option value="openai">OpenAI</option>
              <option value="mistral">Mistral</option>
              <option value="gemini">Gemini</option>
            </select>
          </div>
        );

      case 'parameter':
        return (
          <div className="config-section">
            <h3>Temperature Parameter</h3>

            <label>Value: {node.data.value.toFixed(1)}</label>
            <input
              type="range"
              min={node.data.min}
              max={node.data.max}
              step="0.1"
              value={node.data.value}
              onChange={(e) => updateNode(selectedNode, { value: parseFloat(e.target.value) })}
            />

            <div className="param-description">
              <strong>Effect:</strong>
              <p>
                {node.data.value < 0.3
                  ? 'Very deterministic - responses will be consistent and focused'
                  : node.data.value > 1.5
                  ? 'Very creative - responses will be diverse and experimental'
                  : 'Balanced - mix of consistency and creativity'
                }
              </p>
            </div>
          </div>
        );

      case 'textInput':
        return (
          <div className="config-section">
            <h3>Text Input</h3>

            <label>Prompt:</label>
            <textarea
              value={node.data.text}
              onChange={(e) => updateNode(selectedNode, { text: e.target.value })}
              rows={8}
              className="config-textarea"
            />

            <div className="prompt-suggestions">
              <strong>Suggestions:</strong>
              <ul>
                <li>Be specific and clear</li>
                <li>Provide context when needed</li>
                <li>Use examples for better results</li>
              </ul>
            </div>
          </div>
        );

      case 'output':
        return (
          <div className="config-section">
            <h3>Output Display</h3>

            <label>Display Mode:</label>
            <select
              value={node.data.displayMode}
              onChange={(e) => updateNode(selectedNode, { displayMode: e.target.value })}
            >
              <option value="text">Plain Text</option>
              <option value="markdown">Markdown</option>
              <option value="json">JSON</option>
            </select>

            {node.data.content && (
              <div className="output-preview">
                <strong>Current Output:</strong>
                <pre>{JSON.stringify(node.data.content, null, 2)}</pre>
              </div>
            )}
          </div>
        );

      default:
        return <p>No configuration available for this node type</p>;
    }
  };

  return (
    <div className="config-panel">
      <div className="config-header">
        <h2>Node Configuration</h2>
        <button onClick={() => useFlareWorkflowStore.setState({ selectedNode: null })}>
          ✕
        </button>
      </div>
      <div className="config-body">
        {renderConfig()}
      </div>
    </div>
  );
}
```

## 4.4 Visual Feedback System

**Execution Animation:**
```javascript
// src/components/ExecutionMonitor.jsx
import React, { useEffect, useState } from 'react';
import { useFlareWorkflowStore } from '../store/flareWorkflowStore';

export default function ExecutionMonitor() {
  const { executionState, executionProgress } = useFlareWorkflowStore();
  const [animatingEdges, setAnimatingEdges] = useState([]);

  useEffect(() => {
    // Animate data flow through edges when nodes complete
    Object.entries(executionProgress).forEach(([nodeId, progress]) => {
      if (progress.status === 'completed') {
        // Find outgoing edges from this node
        const edges = useFlareWorkflowStore.getState().edges;
        const outgoingEdges = edges.filter(e => e.source === nodeId);

        // Add animation class temporarily
        outgoingEdges.forEach(edge => {
          setAnimatingEdges(prev => [...prev, edge.id]);
          setTimeout(() => {
            setAnimatingEdges(prev => prev.filter(id => id !== edge.id));
          }, 1000);
        });
      }
    });
  }, [executionProgress]);

  return (
    <div className="execution-monitor">
      <div className="execution-status">
        <span className={`status-indicator ${executionState}`}>
          {executionState === 'idle' && '⏸️'}
          {executionState === 'running' && '▶️'}
          {executionState === 'completed' && '✅'}
          {executionState === 'error' && '❌'}
        </span>
        <span className="status-text">
          {executionState === 'idle' && 'Ready to execute'}
          {executionState === 'running' && 'Executing workflow...'}
          {executionState === 'completed' && 'Execution completed'}
          {executionState === 'error' && 'Execution failed'}
        </span>
      </div>

      {executionState === 'running' && (
        <div className="execution-progress">
          {Object.entries(executionProgress).map(([nodeId, progress]) => {
            const node = useFlareWorkflowStore.getState().nodes.find(n => n.id === nodeId);
            return (
              <div key={nodeId} className="node-progress">
                <span className="node-name">{node?.type}</span>
                <span className={`node-status ${progress.status}`}>
                  {progress.status}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .execution-monitor {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 16px;
          min-width: 250px;
        }

        .status-indicator {
          font-size: 24px;
          margin-right: 8px;
        }

        .status-indicator.running {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .node-progress {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          padding: 4px 8px;
          background: #f7fafc;
          border-radius: 4px;
        }

        .node-status.loading {
          color: #3182ce;
          font-weight: bold;
        }

        .node-status.completed {
          color: #48bb78;
        }

        .node-status.error {
          color: #e53e3e;
        }
      `}</style>
    </div>
  );
}
```
