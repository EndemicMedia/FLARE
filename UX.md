# FLARE Visual Node-Based UI: Technical Implementation Plan

## Executive Summary

This document provides a comprehensive technical blueprint for implementing a visual, node-based UI for the FLARE (Fractal Language for Autonomous Recursive Expansion) system. The interface will transform FLARE's text-based syntax into an intuitive drag-and-drop visual programming environment, enabling users to construct complex AI orchestration workflows without writing code.

**Key Objectives:**
- Visual representation of FLARE commands as interactive node graphs
- Real-time workflow execution with visual feedback
- Bidirectional conversion between node graphs and FLARE syntax
- Seamless integration with existing `/process-flare` backend endpoint
- Support for recursive/nested FLARE commands through visual composition

---

## 1. UI Framework Selection & Justification

### Recommended Framework: **React Flow**

After evaluating multiple node-based JavaScript libraries (React Flow, Rete.js, jsPlumb, Butterfly), **React Flow** is the optimal choice for FLARE's visual interface.

#### Why React Flow?

**Technical Advantages:**
1. **Modern React Architecture**: Built on React 18+ with hooks, TypeScript support, and excellent performance
2. **Rich Feature Set**: Built-in minimap, controls, background grid, edge routing, and node positioning
3. **Flexible Node System**: Custom node components with full React capabilities
4. **Production Ready**: Used by major companies (Stripe, Typeform, Mendix), battle-tested at scale
5. **Active Development**: Regular updates, comprehensive documentation, large community
6. **Performance Optimized**: Virtual rendering for large graphs, automatic viewport optimization
7. **Extensibility**: Plugin system for custom edges, handles, and interactions

**FLARE-Specific Benefits:**
1. **Nested Graph Support**: Can implement sub-flows for recursive FLARE commands
2. **Custom Node Logic**: Easy to implement FLARE-specific nodes (model query, post-processing, parameters)
3. **Edge Validation**: Built-in edge connection rules for ensuring valid FLARE graph structures
4. **State Management**: Works seamlessly with React state management (Context API, Zustand, Redux)
5. **Export/Import**: JSON-based graph structure aligns with FLARE command serialization needs

**Comparison with Alternatives:**

| Feature | React Flow | Rete.js | jsPlumb | Butterfly |
|---------|-----------|---------|---------|-----------|
| React Integration | Native | Plugin | Manual | Manual |
| TypeScript Support | ✓ | ✓ | Limited | ✗ |
| Performance (>100 nodes) | Excellent | Good | Poor | Fair |
| Custom Node Components | Easy | Moderate | Hard | Moderate |
| Edge Routing | Built-in | Built-in | Manual | Limited |
| Active Development | ✓ | ✓ | Limited | Archived |
| Documentation Quality | Excellent | Good | Fair | Poor |
| Learning Curve | Low | Medium | High | Medium |

**Installation:**
```bash
npm install reactflow
# Or for TypeScript (recommended)
npm install reactflow @types/reactflow
```

**License:** MIT (fully compatible with FLARE's open-source nature)

---

## 2. Architecture Design

### 2.1 Component Hierarchy

```
FlareWorkflowCanvas/
├── FlareToolbar/
│   ├── NodePalette/
│   │   ├── InputOutputCategory/
│   │   ├── AIProcessingCategory/
│   │   └── LogicFlowCategory/
│   ├── WorkflowControls/
│   │   ├── ExecuteButton/
│   │   ├── SaveButton/
│   │   ├── LoadButton/
│   │   └── SyntaxToggle/
│   └── TemplateSelector/
├── ReactFlowCanvas/
│   ├── CustomNodes/
│   │   ├── TextInputNode/
│   │   ├── ModelQueryNode/
│   │   ├── PostProcessingNode/
│   │   ├── ParameterNode/
│   │   ├── OutputNode/
│   │   └── FlareCommandNode/ (recursive)
│   ├── CustomEdges/
│   │   ├── DataFlowEdge/
│   │   └── ControlFlowEdge/
│   └── ConnectionValidator/
├── NodeConfigPanel/
│   ├── ModelSelector/
│   ├── TemperatureSlider/
│   ├── PostProcessingConfig/
│   └── PromptEditor/
├── ExecutionEngine/
│   ├── TopologicalSorter/
│   ├── NodeExecutor/
│   └── ResultCollector/
├── SyntaxView/
│   ├── FlareCodeEditor/
│   └── LivePreview/
└── ExecutionMonitor/
    ├── ExecutionProgress/
    ├── NodeStatusIndicator/
    └── ResultDisplay/
```

### 2.2 FLARE Syntax to Node Mapping

#### Core FLARE Elements → Node Types

**1. Model Query Node** (`model:` parameter)
```javascript
// FLARE Syntax: model:openai,mistral
// Node Representation:
{
  type: 'modelQuery',
  data: {
    models: ['openai', 'mistral'],
    prompt: '', // Connected via edge
    concurrent: true,
    results: []
  },
  inputs: ['prompt'],
  outputs: ['responses'] // Array of model responses
}
```

**2. Temperature Parameter Node** (`temp:` parameter)
```javascript
// FLARE Syntax: temp:0.8
// Node Representation:
{
  type: 'parameter',
  data: {
    paramType: 'temperature',
    value: 0.8,
    min: 0.0,
    max: 2.0
  },
  inputs: [],
  outputs: ['tempValue']
}
```

**3. Post-Processing Nodes** (`vote`, `sum`, `comb`, `diff`, `exp`, `filter`)
```javascript
// FLARE Syntax: vote sum
// Node Representation (Vote):
{
  type: 'postProcessing',
  data: {
    operation: 'vote',
    model: 'openai', // Optional model for post-processing
    input: [], // Connected responses
    result: null
  },
  inputs: ['responses'],
  outputs: ['result']
}

// Node Representation (Sum):
{
  type: 'postProcessing',
  data: {
    operation: 'sum',
    model: 'mistral',
    input: [],
    result: null
  },
  inputs: ['responses'],
  outputs: ['result']
}
```

**4. Prompt/Text Input Node**
```javascript
// FLARE Syntax: `Explain renewable energy`
// Node Representation:
{
  type: 'textInput',
  data: {
    text: 'Explain renewable energy',
    placeholder: 'Enter your prompt...'
  },
  inputs: [],
  outputs: ['text']
}
```

**5. Output Display Node**
```javascript
{
  type: 'output',
  data: {
    displayMode: 'text', // 'text' | 'json' | 'markdown'
    content: null
  },
  inputs: ['result'],
  outputs: []
}
```

**6. Recursive FLARE Command Node** (for nested commands)
```javascript
// FLARE Syntax: { flare model:openai `Summarize: { flare model:mistral `Explain AI` }` }
// Node Representation:
{
  type: 'flareCommand',
  data: {
    subGraph: {
      nodes: [...], // Nested nodes
      edges: [...]
    },
    compiled: '{ flare model:mistral `Explain AI` }'
  },
  inputs: ['contextInput'],
  outputs: ['result']
}
```

### 2.3 Complete FLARE Command as Node Graph

**Example FLARE Command:**
```javascript
{ flare model:openai,mistral temp:0.8 vote sum `Explain renewable energy` }
```

**Visual Node Graph Representation:**
```
┌────────────────┐
│  Text Input    │
│  "Explain      │
│  renewable     │──┐
│  energy"       │  │
└────────────────┘  │
                    │
┌────────────────┐  │
│  Temperature   │  │
│  Param: 0.8    │──┤
└────────────────┘  │
                    ↓
              ┌──────────────┐
              │ Model Query  │
              │ [openai,     │
              │  mistral]    │
              └──────────────┘
                      │
              ┌───────┴───────┐
              │               │
        ┌─────▼─────┐   ┌────▼────┐
        │  OpenAI   │   │ Mistral │
        │  Response │   │ Response│
        └─────┬─────┘   └────┬────┘
              │               │
              └───────┬───────┘
                      ↓
              ┌──────────────┐
              │ Vote Post-   │
              │ Processing   │
              └──────┬───────┘
                      │
                      ↓
              ┌──────────────┐
              │ Sum Post-    │
              │ Processing   │
              └──────┬───────┘
                      │
                      ↓
              ┌──────────────┐
              │    Output    │
              │   Display    │
              └──────────────┘
```

### 2.4 Connection Logic & Validation

**Edge Connection Rules:**
```javascript
const connectionRules = {
  // What can connect to what
  validConnections: {
    'textInput.text': ['modelQuery.prompt', 'flareCommand.contextInput'],
    'parameter.tempValue': ['modelQuery.temperature'],
    'modelQuery.responses': ['postProcessing.responses', 'output.result'],
    'postProcessing.result': ['postProcessing.responses', 'output.result'],
    'flareCommand.result': ['postProcessing.responses', 'output.result']
  },

  // Connection constraints
  constraints: {
    'modelQuery.prompt': { maxConnections: 1, required: true },
    'modelQuery.temperature': { maxConnections: 1, required: false },
    'postProcessing.responses': { maxConnections: Infinity, required: true },
    'output.result': { maxConnections: 1, required: true }
  },

  // Type validation
  typeValidation: (sourceType, targetType) => {
    const compatibilityMap = {
      'text': ['text', 'prompt'],
      'number': ['number', 'temperature'],
      'responses': ['responses', 'result'],
      'result': ['result', 'responses']
    };
    return compatibilityMap[sourceType]?.includes(targetType) ?? false;
  }
};
```

**Edge Validator Component:**
```javascript
// src/components/ConnectionValidator.js
export const isValidConnection = (connection, nodes, edges) => {
  const sourceNode = nodes.find(n => n.id === connection.source);
  const targetNode = nodes.find(n => n.id === connection.target);

  if (!sourceNode || !targetNode) return false;

  // Check type compatibility
  const sourceHandle = connection.sourceHandle || 'default';
  const targetHandle = connection.targetHandle || 'default';
  const sourceType = getHandleType(sourceNode, sourceHandle, 'source');
  const targetType = getHandleType(targetNode, targetHandle, 'target');

  if (!connectionRules.typeValidation(sourceType, targetType)) {
    return false;
  }

  // Check max connections constraint
  const targetKey = `${targetNode.type}.${targetHandle}`;
  const constraint = connectionRules.constraints[targetKey];

  if (constraint?.maxConnections) {
    const existingConnections = edges.filter(
      e => e.target === connection.target && e.targetHandle === targetHandle
    );
    if (existingConnections.length >= constraint.maxConnections) {
      return false;
    }
  }

  // Check for cycles (prevent infinite loops)
  if (wouldCreateCycle(connection, edges)) {
    return false;
  }

  return true;
};
```

### 2.5 State Management Architecture

**State Structure (Using Zustand):**
```javascript
// src/store/flareWorkflowStore.js
import create from 'zustand';

export const useFlareWorkflowStore = create((set, get) => ({
  // Graph state
  nodes: [],
  edges: [],

  // Execution state
  executionState: 'idle', // 'idle' | 'running' | 'completed' | 'error'
  executionProgress: {},
  results: {},

  // UI state
  selectedNode: null,
  configPanelOpen: false,
  syntaxViewMode: false,

  // Actions
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, { ...node, id: generateId() }]
  })),

  updateNode: (nodeId, updates) => set((state) => ({
    nodes: state.nodes.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n
    )
  })),

  removeNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter(n => n.id !== nodeId),
    edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId)
  })),

  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, { ...edge, id: generateId() }]
  })),

  removeEdge: (edgeId) => set((state) => ({
    edges: state.edges.filter(e => e.id !== edgeId)
  })),

  setNodeStatus: (nodeId, status, result) => set((state) => ({
    executionProgress: {
      ...state.executionProgress,
      [nodeId]: { status, result, timestamp: Date.now() }
    }
  })),

  compileToFlare: () => {
    const { nodes, edges } = get();
    return graphToFlareCommand(nodes, edges);
  },

  loadFromFlare: (flareCommand) => {
    const { nodes, edges } = flareCommandToGraph(flareCommand);
    set({ nodes, edges });
  },

  executeWorkflow: async () => {
    set({ executionState: 'running', executionProgress: {} });
    const { nodes, edges } = get();
    try {
      await executeGraphWorkflow(nodes, edges, get().setNodeStatus);
      set({ executionState: 'completed' });
    } catch (error) {
      set({ executionState: 'error' });
      console.error('Workflow execution failed:', error);
    }
  }
}));
```

---

## 3. Core Features Implementation

### 3.1 Node Types Implementation

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

### 3.2 Graph to FLARE Compilation

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
    flareCommand += ` model:${flareComponents.models.join(','')}`;
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

### 3.3 FLARE to Graph Parsing

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

### 3.4 Recursive FLARE Command Support

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

### 3.5 Real-Time Execution Engine

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

---

## 4. Technical Specifications

### 4.1 Component Implementation Details

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

### 4.2 API Integration Patterns

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

### 4.3 Node Configuration Panel

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

### 4.4 Visual Feedback System

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

---

## 5. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Goals:** Set up project structure, implement basic node system

**Tasks:**
1. **Project Setup**
   - Create React app with TypeScript
   - Install dependencies: `reactflow`, `zustand`, `axios`
   - Set up project structure following atomic file organization
   - Configure ESLint, Prettier, and TypeScript configs

2. **Basic Node Implementation**
   - Implement TextInputNode component
   - Implement ModelQueryNode component
   - Implement OutputNode component
   - Create node type registry
   - Implement basic styling (Tailwind CSS)

3. **Canvas Setup**
   - Set up ReactFlow canvas
   - Implement node palette/toolbar
   - Add drag-and-drop from palette to canvas
   - Implement basic node positioning

**Deliverables:**
- Working canvas with 3 node types
- Ability to drag nodes onto canvas
- Basic visual styling

**Testing Strategy:**
- Unit tests for node components
- Integration test for canvas drag-drop
- Visual regression tests

### Phase 2: Core Functionality (Weeks 3-4)

**Goals:** Implement connections, validation, and state management

**Tasks:**
1. **Connection System**
   - Implement edge connection logic
   - Create connection validator
   - Add visual feedback for valid/invalid connections
   - Implement edge deletion

2. **State Management**
   - Set up Zustand store
   - Implement node CRUD operations
   - Implement edge CRUD operations
   - Add undo/redo functionality

3. **Additional Node Types**
   - Implement ParameterNode (temperature)
   - Implement PostProcessingNode (all 6 operations)
   - Add node configuration panel
   - Implement node deletion with confirmation

**Deliverables:**
- Complete node system with all types
- Working connection validation
- State management with undo/redo

**Testing Strategy:**
- Unit tests for connection validator
- State management tests
- Edge case testing (cycles, invalid connections)

### Phase 3: FLARE Integration (Weeks 5-6)

**Goals:** Bidirectional FLARE syntax conversion

**Tasks:**
1. **Graph to FLARE Compiler**
   - Implement graph-to-FLARE conversion
   - Add topological sort algorithm
   - Create FLARE syntax generator
   - Add syntax preview panel

2. **FLARE to Graph Parser**
   - Integrate existing parseFlareCommand
   - Implement graph layout algorithm
   - Create visual FLARE command loader
   - Add validation for parsed commands

3. **Syntax View Toggle**
   - Implement split-view mode (graph + syntax)
   - Add live syntax preview
   - Implement syntax-to-graph sync
   - Add syntax highlighting

**Deliverables:**
- Bidirectional FLARE conversion
- Live syntax preview
- Graph layout from FLARE commands

**Testing Strategy:**
- Round-trip conversion tests (graph → FLARE → graph)
- Parser integration tests
- Complex FLARE command tests

### Phase 4: Execution Engine (Weeks 7-8)

**Goals:** Real-time workflow execution with visual feedback

**Tasks:**
1. **Backend Integration**
   - Create FLARE API service
   - Implement /process-flare endpoint integration
   - Add error handling and retries
   - Implement request cancellation

2. **Execution Engine**
   - Implement workflow executor
   - Add topological sort for execution order
   - Create node-by-node execution system
   - Implement parallel execution for independent nodes

3. **Visual Feedback**
   - Add execution progress indicators
   - Implement animated data flow
   - Create execution monitor component
   - Add node status badges (queued, loading, completed, error)

**Deliverables:**
- Working execution engine
- Real-time visual feedback
- Integration with existing backend

**Testing Strategy:**
- End-to-end execution tests
- Error handling tests
- Parallel execution tests
- Backend integration tests

### Phase 5: Advanced Features (Weeks 9-10)

**Goals:** Templates, recursive commands, and polish

**Tasks:**
1. **Template System**
   - Create template data structure
   - Implement template library
   - Add template save/load functionality
   - Create 5-10 example templates

2. **Recursive FLARE Support**
   - Implement FlareCommandNode
   - Add nested graph visualization
   - Create sub-graph editor
   - Implement recursive execution

3. **UI Polish**
   - Add keyboard shortcuts
   - Implement zoom and pan controls
   - Create help/tutorial system
   - Add export/import (JSON)
   - Implement workflow sharing (URL parameters)

**Deliverables:**
- Template library with examples
- Recursive command support
- Polished UI with keyboard shortcuts

**Testing Strategy:**
- Template round-trip tests
- Recursive execution tests
- Usability testing
- Performance testing (large graphs)

### Phase 6: Documentation & Deployment (Week 11)

**Goals:** Production-ready deployment

**Tasks:**
1. **Documentation**
   - Write user guide
   - Create video tutorials
   - Document API integration
   - Add inline help/tooltips

2. **Performance Optimization**
   - Optimize re-renders
   - Implement virtual rendering for large graphs
   - Add caching for compiled FLARE commands
   - Optimize bundle size

3. **Deployment**
   - Set up production build
   - Configure environment variables
   - Deploy to hosting (Vercel/Netlify)
   - Set up CI/CD pipeline

**Deliverables:**
- Complete documentation
- Production deployment
- CI/CD pipeline

**Testing Strategy:**
- Performance benchmarks
- Cross-browser testing
- Accessibility testing
- Production smoke tests

---

## 6. File Structure

```
flare-visual-ui/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── templates/
│       ├── text-summarizer.json
│       ├── multi-model-compare.json
│       └── content-moderator.json
├── src/
│   ├── components/
│   │   ├── FlareWorkflowCanvas.jsx
│   │   ├── FlareToolbar.jsx
│   │   ├── NodePalette.jsx
│   │   ├── NodeConfigPanel.jsx
│   │   ├── SyntaxView.jsx
│   │   ├── ExecutionMonitor.jsx
│   │   └── nodes/
│   │       ├── TextInputNode.jsx
│   │       ├── ModelQueryNode.jsx
│   │       ├── PostProcessingNode.jsx
│   │       ├── ParameterNode.jsx
│   │       ├── OutputNode.jsx
│   │       └── FlareCommandNode.jsx
│   ├── store/
│   │   └── flareWorkflowStore.js
│   ├── services/
│   │   ├── flareApiService.js
│   │   ├── workflowExecutor.js
│   │   └── templateService.js
│   ├── utils/
│   │   ├── graphToFlare.js
│   │   ├── flareToGraph.js
│   │   ├── connectionValidator.js
│   │   ├── topologicalSort.js
│   │   └── layoutAlgorithm.js
│   ├── styles/
│   │   ├── globals.css
│   │   ├── nodes.css
│   │   └── canvas.css
│   ├── types/
│   │   ├── nodes.ts
│   │   ├── edges.ts
│   │   └── workflow.ts
│   ├── App.jsx
│   └── index.jsx
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## 7. Dependencies & Setup

### 7.1 Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "reactflow": "^11.10.0",
    "zustand": "^4.4.0",
    "axios": "^1.4.0",
    "@tailwindcss/forms": "^0.5.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0",
    "vitest": "^0.34.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "eslint": "^8.45.0",
    "prettier": "^3.0.0",
    "tailwindcss": "^3.3.0"
  }
}
```

### 7.2 Installation Steps

```bash
# Create new React app with Vite
npm create vite@latest flare-visual-ui -- --template react-ts

cd flare-visual-ui

# Install dependencies
npm install reactflow zustand axios

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install testing libraries
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Install ESLint and Prettier
npm install -D eslint prettier eslint-config-prettier eslint-plugin-react

# Start development server
npm run dev
```

### 7.3 Environment Configuration

```bash
# .env.local
REACT_APP_FLARE_API_URL=http://localhost:8080
REACT_APP_ENABLE_DEBUG=true
REACT_APP_MAX_NODES=100
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Node Component Tests:**
```javascript
// src/components/nodes/__tests__/ModelQueryNode.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import ModelQueryNode from '../ModelQueryNode';
import { useFlareWorkflowStore } from '../../../store/flareWorkflowStore';

describe('ModelQueryNode', () => {
  it('renders with correct models', () => {
    const data = {
      models: ['openai', 'mistral'],
      status: 'idle'
    };

    render(<ModelQueryNode data={data} id="test-1" />);

    expect(screen.getByText('Model Query')).toBeInTheDocument();
    expect(screen.getByText(/openai/i)).toBeInTheDocument();
    expect(screen.getByText(/mistral/i)).toBeInTheDocument();
  });

  it('updates store when models change', () => {
    const data = { models: ['openai'] };
    const updateNode = vi.fn();

    useFlareWorkflowStore.setState({ updateNode });

    render(<ModelQueryNode data={data} id="test-1" />);

    // Simulate model selection change
    const addButton = screen.getByRole('button', { name: /add model/i });
    fireEvent.click(addButton);

    expect(updateNode).toHaveBeenCalledWith('test-1', expect.any(Object));
  });
});
```

### 8.2 Integration Tests

**Graph Compilation Test:**
```javascript
// src/utils/__tests__/graphToFlare.test.js
import { graphToFlareCommand } from '../graphToFlare';

describe('graphToFlareCommand', () => {
  it('compiles simple graph to FLARE syntax', () => {
    const nodes = [
      {
        id: '1',
        type: 'textInput',
        data: { text: 'Explain AI' }
      },
      {
        id: '2',
        type: 'modelQuery',
        data: { models: ['openai', 'mistral'] }
      },
      {
        id: '3',
        type: 'output',
        data: { displayMode: 'text' }
      }
    ];

    const edges = [
      { source: '1', target: '2', sourceHandle: 'text', targetHandle: 'prompt' },
      { source: '2', target: '3', sourceHandle: 'responses', targetHandle: 'result' }
    ];

    const flare = graphToFlareCommand(nodes, edges);

    expect(flare).toBe('{ flare model:openai,mistral `Explain AI` }');
  });

  it('includes temperature and post-processing', () => {
    const nodes = [
      { id: '1', type: 'textInput', data: { text: 'Test' } },
      { id: '2', type: 'parameter', data: { paramType: 'temperature', value: 0.8 } },
      { id: '3', type: 'modelQuery', data: { models: ['openai'] } },
      { id: '4', type: 'postProcessing', data: { operation: 'vote' } },
      { id: '5', type: 'output', data: {} }
    ];

    const edges = [
      { source: '1', target: '3', sourceHandle: 'text', targetHandle: 'prompt' },
      { source: '2', target: '3', sourceHandle: 'tempValue', targetHandle: 'temperature' },
      { source: '3', target: '4', sourceHandle: 'responses', targetHandle: 'responses' },
      { source: '4', target: '5', sourceHandle: 'result', targetHandle: 'result' }
    ];

    const flare = graphToFlareCommand(nodes, edges);

    expect(flare).toBe('{ flare model:openai temp:0.8 vote `Test` }');
  });
});
```

### 8.3 End-to-End Tests

**Complete Workflow Test:**
```javascript
// src/__tests__/e2e/workflow.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';
import { flareApiService } from '../../services/flareApiService';

vi.mock('../../services/flareApiService');

describe('Complete Workflow', () => {
  it('creates workflow, executes, and displays results', async () => {
    // Mock API response
    flareApiService.processFlareCommand.mockResolvedValue(
      'AI is artificial intelligence...'
    );

    render(<App />);

    // Drag text input node
    const textInputNode = screen.getByText('Text Input');
    fireEvent.dragStart(textInputNode);
    const canvas = screen.getByTestId('react-flow-canvas');
    fireEvent.drop(canvas, { clientX: 250, clientY: 100 });

    // Configure text input
    const promptArea = screen.getByPlaceholderText(/enter your prompt/i);
    fireEvent.change(promptArea, { target: { value: 'Explain AI' } });

    // Drag model query node
    const modelNode = screen.getByText('Model Query');
    fireEvent.dragStart(modelNode);
    fireEvent.drop(canvas, { clientX: 250, clientY: 250 });

    // Connect nodes
    const textOutputHandle = screen.getAllByTestId('handle-source')[0];
    const modelInputHandle = screen.getAllByTestId('handle-target')[0];
    fireEvent.mouseDown(textOutputHandle);
    fireEvent.mouseUp(modelInputHandle);

    // Execute workflow
    const executeButton = screen.getByRole('button', { name: /execute/i });
    fireEvent.click(executeButton);

    // Wait for execution
    await waitFor(() => {
      expect(screen.getByText(/execution completed/i)).toBeInTheDocument();
    });

    // Verify API was called
    expect(flareApiService.processFlareCommand).toHaveBeenCalledWith(
      expect.stringContaining('Explain AI')
    );
  });
});
```

---

## 9. Performance Considerations

### 9.1 Optimization Strategies

**Virtual Rendering for Large Graphs:**
```javascript
// ReactFlow automatically handles this with viewport optimization
// For 100+ nodes, ensure proper memoization

const CustomNode = memo(({ data, id }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison for shallow equality
  return prevProps.data === nextProps.data &&
         prevProps.selected === nextProps.selected;
});
```

**Debounced State Updates:**
```javascript
// src/hooks/useDebouncedUpdate.js
import { useCallback } from 'react';
import { debounce } from 'lodash';

export function useDebouncedNodeUpdate(nodeId, delay = 300) {
  const updateNode = useFlareWorkflowStore((state) => state.updateNode);

  const debouncedUpdate = useCallback(
    debounce((updates) => {
      updateNode(nodeId, updates);
    }, delay),
    [nodeId, delay]
  );

  return debouncedUpdate;
}
```

**FLARE Compilation Caching:**
```javascript
// src/store/flareWorkflowStore.js
export const useFlareWorkflowStore = create((set, get) => ({
  // ... other state

  compiledFlareCache: null,
  graphHash: null,

  compileToFlare: () => {
    const { nodes, edges, graphHash, compiledFlareCache } = get();

    // Generate hash of current graph
    const currentHash = generateGraphHash(nodes, edges);

    // Return cached compilation if graph hasn't changed
    if (currentHash === graphHash && compiledFlareCache) {
      return compiledFlareCache;
    }

    // Compile and cache
    const compiled = graphToFlareCommand(nodes, edges);
    set({
      compiledFlareCache: compiled,
      graphHash: currentHash
    });

    return compiled;
  }
}));
```

### 9.2 Bundle Size Optimization

**Code Splitting:**
```javascript
// src/App.jsx
import { lazy, Suspense } from 'react';

const FlareWorkflowCanvas = lazy(() => import('./components/FlareWorkflowCanvas'));
const NodeConfigPanel = lazy(() => import('./components/NodeConfigPanel'));
const SyntaxView = lazy(() => import('./components/SyntaxView'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FlareWorkflowCanvas />
      <NodeConfigPanel />
      <SyntaxView />
    </Suspense>
  );
}
```

---

## 10. Accessibility & UX Enhancements

### 10.1 Keyboard Shortcuts

```javascript
// src/hooks/useKeyboardShortcuts.js
import { useEffect } from 'react';
import { useFlareWorkflowStore } from '../store/flareWorkflowStore';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        // Implement undo
      }

      // Ctrl/Cmd + Shift + Z: Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        // Implement redo
      }

      // Delete: Remove selected node
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedNode = useFlareWorkflowStore.getState().selectedNode;
        if (selectedNode) {
          e.preventDefault();
          useFlareWorkflowStore.getState().removeNode(selectedNode);
        }
      }

      // Ctrl/Cmd + E: Execute workflow
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        useFlareWorkflowStore.getState().executeWorkflow();
      }

      // Ctrl/Cmd + S: Save workflow
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Implement save
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
```

### 10.2 Screen Reader Support

```javascript
// Add ARIA labels to nodes
<div
  className="model-query-node"
  role="article"
  aria-label={`Model query node using ${data.models.join(', ')}`}
  aria-describedby={`node-${id}-description`}
  tabIndex={0}
>
  <div id={`node-${id}-description`} className="sr-only">
    This node queries {data.models.length} AI models in parallel.
    Current status: {data.status || 'idle'}.
  </div>
  {/* Node content */}
</div>
```

---

## Conclusion

This implementation plan provides a comprehensive technical roadmap for building a production-ready, node-based visual UI for FLARE. The architecture leverages React Flow's powerful capabilities while maintaining tight integration with FLARE's existing backend infrastructure.

**Key Success Factors:**
1. **Incremental Development**: Phased approach allows for early feedback and iteration
2. **Strong Typing**: TypeScript ensures maintainability and reduces bugs
3. **Comprehensive Testing**: Unit, integration, and E2E tests ensure reliability
4. **Performance Focus**: Optimization strategies from the start
5. **User-Centric Design**: Keyboard shortcuts, accessibility, and intuitive interactions

**Next Steps:**
1. Review and approve this technical plan
2. Set up development environment (Phase 1, Week 1)
3. Begin implementation with basic node system
4. Schedule weekly progress reviews
5. Plan user testing sessions for Phase 5

This visual interface will democratize FLARE's powerful AI orchestration capabilities, making them accessible to non-technical users while maintaining the full power and flexibility of the underlying FLARE language.
