# 3. Core Features Implementation

## 3.1 Node Types Implementation

**ModelQueryNode Component:**
```javascript
// src/components/nodes/ModelQueryNode.jsx
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const ModelQueryNode = memo(({ data, id, selected }) => {
  const handleModelChange = (newModels) => {
    // Update via store
    useFlareWorkflowStore.getState().updateNode(id, { models: newModels });
  };

  return (
    <div className={`model-query-node ${selected ? 'selected' : ''} ${data.status || ''}`}>
      <Handle type="target" position={Position.Top} id="prompt" />
      <Handle type="target" position={Position.Left} id="temperature" />

      <div className="node-header">
        <span className="node-icon">🤖</span>
        <span className="node-title">Model Query</span>
      </div>

      <div className="node-body">
        <ModelSelector
          models={data.models || []}
          onChange={handleModelChange}
          availableModels={['openai', 'mistral', 'gemini', 'nova-fast', 'qwen-coder']}
        />

        {data.status === 'loading' && (
          <div className="loading-indicator">
            <Spinner />
            <span>Querying models...</span>
          </div>
        )}

        {data.results && data.results.length > 0 && (
          <div className="results-preview">
            {data.results.map((result, idx) => (
              <div key={idx} className="result-item">
                <strong>{data.models[idx]}:</strong>
                <span>{truncate(result, 50)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} id="responses" />
    </div>
  );
});

export default ModelQueryNode;
```

**PostProcessingNode Component:**
```javascript
// src/components/nodes/PostProcessingNode.jsx
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

const PostProcessingNode = memo(({ data, id, selected }) => {
  const operationIcons = {
    vote: '🗳️',
    sum: '📝',
    comb: '🔗',
    diff: '📊',
    exp: '🔍',
    filter: '🔬'
  };

  const operationLabels = {
    vote: 'Vote (Select Best)',
    sum: 'Summarize',
    comb: 'Combine',
    diff: 'Compare',
    exp: 'Expand',
    filter: 'Filter Quality'
  };

  return (
    <div className={`post-processing-node ${selected ? 'selected' : ''} ${data.status || ''}`}>
      <Handle type="target" position={Position.Top} id="responses" />

      <div className="node-header">
        <span className="node-icon">{operationIcons[data.operation]}</span>
        <span className="node-title">{operationLabels[data.operation]}</span>
      </div>

      <div className="node-body">
        {data.model && (
          <div className="operation-model">
            <span>Using: {data.model}</span>
          </div>
        )}

        {data.status === 'loading' && (
          <div className="loading-indicator">
            <Spinner />
            <span>Processing...</span>
          </div>
        )}

        {data.result && (
          <div className="result-preview">
            {truncate(data.result, 100)}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} id="result" />
    </div>
  );
});

export default PostProcessingNode;
```

**TextInputNode Component:**
```javascript
// src/components/nodes/TextInputNode.jsx
import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';

const TextInputNode = memo(({ data, id }) => {
  const [text, setText] = useState(data.text || '');

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    useFlareWorkflowStore.getState().updateNode(id, { text: newText });
  };

  return (
    <div className="text-input-node">
      <div className="node-header">
        <span className="node-icon">📝</span>
        <span className="node-title">Prompt Input</span>
      </div>

      <div className="node-body">
        <textarea
          value={text}
          onChange={handleChange}
          placeholder={data.placeholder || "Enter your prompt..."}
          className="prompt-textarea"
          rows={4}
        />
        <div className="char-count">{text.length} characters</div>
      </div>

      <Handle type="source" position={Position.Bottom} id="text" />
    </div>
  );
});

export default TextInputNode;
```

**ParameterNode Component (Temperature):**
```javascript
// src/components/nodes/ParameterNode.jsx
import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';

const ParameterNode = memo(({ data, id }) => {
  const [value, setValue] = useState(data.value || 1.0);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);
    useFlareWorkflowStore.getState().updateNode(id, { value: newValue });
  };

  return (
    <div className="parameter-node">
      <div className="node-header">
        <span className="node-icon">🌡️</span>
        <span className="node-title">Temperature</span>
      </div>

      <div className="node-body">
        <input
          type="range"
          min={data.min || 0.0}
          max={data.max || 2.0}
          step="0.1"
          value={value}
          onChange={handleChange}
          className="temp-slider"
        />
        <div className="temp-value">{value.toFixed(1)}</div>
        <div className="temp-label">
          {value < 0.3 ? 'Deterministic' : value > 1.5 ? 'Very Creative' : 'Balanced'}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} id="tempValue" />
    </div>
  );
});

export default ParameterNode;
```

## 3.2 Graph to FLARE Compilation

**Graph-to-FLARE Compiler:**
```javascript
// src/utils/graphToFlare.js

/**
 * Convert node graph to FLARE command syntax
 * Performs topological sort to determine execution order
 */
export function graphToFlareCommand(nodes, edges) {
  // Find the output node (end of the graph)
  const outputNode = nodes.find(n => n.type === 'output');
  if (!outputNode) {
    throw new Error('Graph must have an output node');
  }

  // Trace back from output to build FLARE command
  const flareComponents = {
    models: [],
    temperature: null,
    postProcessing: [],
    prompt: null
  };

  // Traverse graph backwards from output
  const visited = new Set();
  const traverse = (nodeId) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    // Process node based on type
    switch (node.type) {
      case 'modelQuery':
        flareComponents.models.push(...node.data.models);
        break;

      case 'parameter':
        if (node.data.paramType === 'temperature') {
          flareComponents.temperature = node.data.value;
        }
        break;

      case 'postProcessing':
        flareComponents.postProcessing.push(node.data.operation);
        if (node.data.model) {
          flareComponents[`${node.data.operation}_model`] = node.data.model;
        }
        break;

      case 'textInput':
        flareComponents.prompt = node.data.text;
        break;
    }

    // Traverse incoming edges
    const incomingEdges = edges.filter(e => e.target === nodeId);
    incomingEdges.forEach(edge => traverse(edge.source));
  };

  traverse(outputNode.id);

  // Build FLARE command string
  let flareCommand = '{ flare';

  // Add models
  if (flareComponents.models.length > 0) {
    flareCommand += ` model:${flareComponents.models.join(',')}`;
  }

  // Add temperature
  if (flareComponents.temperature !== null) {
    flareCommand += ` temp:${flareComponents.temperature}`;
  }

  // Add post-processing
  if (flareComponents.postProcessing.length > 0) {
    flareComponents.postProcessing.forEach(op => {
      const model = flareComponents[`${op}_model`];
      flareCommand += ` ${op}${model ? ':' + model : ''}`;
    });
  }

  // Add prompt
  if (flareComponents.prompt) {
    flareCommand += ` \`${flareComponents.prompt}\``;
  }

  flareCommand += ' }';

  return flareCommand;
}
```

## 3.3 FLARE to Graph Parsing

**FLARE-to-Graph Parser:**
```javascript
// src/utils/flareToGraph.js

/**
 * Convert FLARE command syntax to node graph
 * Uses existing parseFlareCommand from backend
 */
export function flareCommandToGraph(flareCommand) {
  // Import and use backend parser
  const parsed = parseFlareCommand(flareCommand);

  const nodes = [];
  const edges = [];
  let nodeCounter = 0;

  const createNode = (type, data, position) => {
    const id = `node-${nodeCounter++}`;
    nodes.push({
      id,
      type,
      position,
      data
    });
    return id;
  };

  const createEdge = (source, target, sourceHandle = 'default', targetHandle = 'default') => {
    edges.push({
      id: `edge-${edges.length}`,
      source,
      target,
      sourceHandle,
      targetHandle
    });
  };

  // Create nodes in visual layout
  // Text Input Node (top)
  const textInputId = createNode('textInput', {
    text: parsed.command,
    placeholder: 'Enter your prompt...'
  }, { x: 250, y: 50 });

  // Temperature Parameter Node (if specified)
  let tempNodeId = null;
  if (parsed.temp !== 1.0) {
    tempNodeId = createNode('parameter', {
      paramType: 'temperature',
      value: parsed.temp,
      min: 0.0,
      max: 2.0
    }, { x: 100, y: 50 });
  }

  // Model Query Node
  const modelQueryId = createNode('modelQuery', {
    models: parsed.model,
    concurrent: true,
    results: []
  }, { x: 250, y: 200 });

  // Connect text input to model query
  createEdge(textInputId, modelQueryId, 'text', 'prompt');

  // Connect temperature to model query (if exists)
  if (tempNodeId) {
    createEdge(tempNodeId, modelQueryId, 'tempValue', 'temperature');
  }

  // Post-processing nodes (chain them)
  let previousNodeId = modelQueryId;
  let yPosition = 350;

  parsed.postProcessing.forEach((operation, index) => {
    const postProcessId = createNode('postProcessing', {
      operation,
      model: parsed[`${operation}_model`] || null,
      input: [],
      result: null
    }, { x: 250, y: yPosition });

    createEdge(previousNodeId, postProcessId,
      previousNodeId === modelQueryId ? 'responses' : 'result',
      'responses'
    );

    previousNodeId = postProcessId;
    yPosition += 150;
  });

  // Output Node (bottom)
  const outputId = createNode('output', {
    displayMode: 'text',
    content: null
  }, { x: 250, y: yPosition });

  createEdge(previousNodeId, outputId,
    previousNodeId === modelQueryId ? 'responses' : 'result',
    'result'
  );

  return { nodes, edges };
}
```

## 3.4 Recursive FLARE Command Support

**Nested Graph Component:**
```javascript
// src/components/nodes/FlareCommandNode.jsx
import React, { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';

const FlareCommandNode = memo(({ data, id }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flare-command-node">
      <Handle type="target" position={Position.Top} id="contextInput" />

      <div className="node-header">
        <span className="node-icon">🔄</span>
        <span className="node-title">Nested FLARE Command</span>
        <button onClick={() => setExpanded(!expanded)}>
          {expanded ? '▼' : '▶'}
        </button>
      </div>

      <div className="node-body">
        {expanded ? (
          <div className="nested-graph">
            <MiniFlareCanvas
              nodes={data.subGraph.nodes}
              edges={data.subGraph.edges}
              readonly={true}
            />
          </div>
        ) : (
          <div className="compiled-command">
            <code>{truncate(data.compiled, 60)}</code>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} id="result" />
    </div>
  );
});

export default FlareCommandNode;
```

## 3.5 Real-Time Execution Engine

**Workflow Execution System:**
```javascript
// src/services/workflowExecutor.js

/**
 * Execute node graph workflow with real-time status updates
 * Handles parallel execution where possible
 */
export async function executeGraphWorkflow(nodes, edges, setNodeStatus) {
  // Perform topological sort to determine execution order
  const executionOrder = topologicalSort(nodes, edges);

  // Track node results for data flow
  const nodeResults = new Map();

  for (const nodeId of executionOrder) {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) continue;

    // Set node to loading state
    setNodeStatus(nodeId, 'loading', null);

    try {
      let result;

      switch (node.type) {
        case 'textInput':
          // Text input nodes just pass through their data
          result = node.data.text;
          setNodeStatus(nodeId, 'completed', result);
          break;

        case 'parameter':
          // Parameter nodes pass through their value
          result = node.data.value;
          setNodeStatus(nodeId, 'completed', result);
          break;

        case 'modelQuery':
          // Get inputs from connected nodes
          const promptEdge = edges.find(e =>
            e.target === nodeId && e.targetHandle === 'prompt'
          );
          const tempEdge = edges.find(e =>
            e.target === nodeId && e.targetHandle === 'temperature'
          );

          const prompt = promptEdge ? nodeResults.get(promptEdge.source) : '';
          const temperature = tempEdge ? nodeResults.get(tempEdge.source) : 1.0;

          // Execute model queries in parallel
          const modelResponses = await Promise.all(
            node.data.models.map(model =>
              executeModelQuery({
                modelName: model,
                temp: temperature,
                prompt: prompt
              })
            )
          );

          result = modelResponses;
          setNodeStatus(nodeId, 'completed', result);
          break;

        case 'postProcessing':
          // Get input responses
          const responseEdges = edges.filter(e =>
            e.target === nodeId && e.targetHandle === 'responses'
          );

          let inputResponses = [];
          responseEdges.forEach(edge => {
            const sourceResult = nodeResults.get(edge.source);
            if (Array.isArray(sourceResult)) {
              inputResponses.push(...sourceResult);
            } else {
              inputResponses.push(sourceResult);
            }
          });

          // Apply post-processing operation
          result = await applyPostProcessing({
            operation: node.data.operation,
            responses: inputResponses,
            model: node.data.model
          });

          setNodeStatus(nodeId, 'completed', result);
          break;

        case 'output':
          // Get final result
          const resultEdge = edges.find(e => e.target === nodeId);
          result = resultEdge ? nodeResults.get(resultEdge.source) : null;
          setNodeStatus(nodeId, 'completed', result);
          break;

        case 'flareCommand':
          // Execute nested FLARE command
          const contextEdge = edges.find(e => e.target === nodeId);
          const context = contextEdge ? nodeResults.get(contextEdge.source) : '';

          // Recursively execute sub-graph
          const subResult = await executeGraphWorkflow(
            node.data.subGraph.nodes,
            node.data.subGraph.edges,
            setNodeStatus
          );

          result = subResult;
          setNodeStatus(nodeId, 'completed', result);
          break;
      }

      // Store result for downstream nodes
      nodeResults.set(nodeId, result);

    } catch (error) {
      console.error(`Error executing node ${nodeId}:`, error);
      setNodeStatus(nodeId, 'error', error.message);
      throw error; // Stop execution on error
    }
  }

  // Return final output
  const outputNode = nodes.find(n => n.type === 'output');
  return outputNode ? nodeResults.get(outputNode.id) : null;
}

/**
 * Topological sort to determine execution order
 * Ensures nodes execute only after their dependencies
 */
function topologicalSort(nodes, edges) {
  const inDegree = new Map();
  const adjacencyList = new Map();

  // Initialize
  nodes.forEach(node => {
    inDegree.set(node.id, 0);
    adjacencyList.set(node.id, []);
  });

  // Build graph
  edges.forEach(edge => {
    adjacencyList.get(edge.source).push(edge.target);
    inDegree.set(edge.target, inDegree.get(edge.target) + 1);
  });

  // Find nodes with no dependencies
  const queue = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId);
  });

  // Process queue
  const sorted = [];
  while (queue.length > 0) {
    const nodeId = queue.shift();
    sorted.push(nodeId);

    adjacencyList.get(nodeId).forEach(neighbor => {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    });
  }

  // Check for cycles
  if (sorted.length !== nodes.length) {
    throw new Error('Graph contains cycles - cannot execute');
  }

  return sorted;
}
```
