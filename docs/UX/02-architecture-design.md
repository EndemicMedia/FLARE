# 2. Architecture Design

## 2.1 Component Hierarchy

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

## 2.2 FLARE Syntax to Node Mapping

### Core FLARE Elements → Node Types

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

## 2.3 Complete FLARE Command as Node Graph

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

## 2.4 Connection Logic & Validation

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

## 2.5 State Management Architecture

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
