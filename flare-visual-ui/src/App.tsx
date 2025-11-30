import { useCallback, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { TextInputNode } from './components/nodes/TextInputNode';
import { ModelQueryNode } from './components/nodes/ModelQueryNode';
import { OutputNode } from './components/nodes/OutputNode';
import { useFlareWorkflowStore } from './store/flareWorkflowStore';
import { executeWorkflow } from './utils/workflowExecutor';

// Register custom node types
const nodeTypes: NodeTypes = {
  textInput: TextInputNode,
  modelQuery: ModelQueryNode,
  output: OutputNode,
};

// Demo workflow: "Explain quantum computing" with vote
const initialNodes: Node[] = [
  {
    id: 'input-1',
    type: 'textInput',
    position: { x: 50, y: 200 },
    data: { 
      text: 'Explain quantum computing in simple terms',
      placeholder: 'Enter your prompt...'
    },
  },
  {
    id: 'model-1',
    type: 'modelQuery',
    position: { x: 400, y: 150 },
    data: {
      models: ['mistral', 'openai'],
      temperature: 0.7,
      postProcessing: 'vote',
    },
  },
  {
    id: 'output-1',
    type: 'output',
    position: { x: 850, y: 200 },
    data: {
      displayMode: 'text' as const,
      content: null,
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'input-1', target: 'model-1', sourceHandle: 'input-1-output', targetHandle: 'model-1-input' },
  { id: 'e2-3', source: 'model-1', target: 'output-1', sourceHandle: 'model-1-output', targetHandle: 'output-1-input' },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { setExecutionState } = useFlareWorkflowStore();

  useEffect(() => {
    console.log('App mounted with nodes:', nodes);
    console.log('App mounted with edges:', edges);
  }, []);

  useEffect(() => {
    console.log('Nodes updated:', nodes.length, nodes);
  }, [nodes]);

  useEffect(() => {
    console.log('Edges updated:', edges.length, edges);
  }, [edges]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addTextInputNode = () => {
    const newNode: Node = {
      id: `input-${Date.now()}`,
      type: 'textInput',
      position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 100 },
      data: { text: '', placeholder: 'Enter your prompt...' },
    };
    console.log('Adding TextInput node:', newNode);
    setNodes((nds) => [...nds, newNode]);
  };

  const addModelQueryNode = () => {
    const newNode: Node = {
      id: `model-${Date.now()}`,
      type: 'modelQuery',
      position: { x: Math.random() * 200 + 400, y: Math.random() * 200 + 100 },
      data: { models: ['mistral'], temperature: 1.0, postProcessing: '' },
    };
    console.log('Adding ModelQuery node:', newNode);
    setNodes((nds) => [...nds, newNode]);
  };

  const addOutputNode = () => {
    const newNode: Node = {
      id: `output-${Date.now()}`,
      type: 'output',
      position: { x: Math.random() * 200 + 850, y: Math.random() * 200 + 100 },
      data: { displayMode: 'text' as const, content: null },
    };
    console.log('Adding Output node:', newNode);
    setNodes((nds) => [...nds, newNode]);
  };

  const handleRunWorkflow = async () => {
    setExecutionState('running');
    try {
      await executeWorkflow(nodes, edges);
    } catch (error: any) {
      console.error('Workflow execution error:', error);
      alert(`Workflow Error: ${error.message}`);
    } finally {
      setExecutionState('idle');
    }
  };

  const executionState = useFlareWorkflowStore((state) => state.executionState);
  const isRunning = executionState === 'running';

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            FLARE Visual Workflow Builder
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Build AI orchestration workflows visually
          </p>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b px-4 py-3 flex gap-2">
        <button
          onClick={addTextInputNode}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          + Text Input
        </button>
        <button
          onClick={addModelQueryNode}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-sm font-medium"
        >
          + Model Query
        </button>
        <button
          onClick={addOutputNode}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm font-medium"
        >
          + Output
        </button>

        <div className="flex-1"></div>

        <button
          onClick={handleRunWorkflow}
          disabled={isRunning}
          className={`px-6 py-2 rounded font-medium text-sm transition-colors ${
            isRunning
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-500 text-white hover:bg-orange-600'
          }`}
        >
          {isRunning ? '⏳ Running...' : '▶ Run Workflow'}
        </button>
        
        <div className="text-sm text-gray-500 flex items-center">
          <span className="mr-2">Nodes: {nodes.length}</span>
          <span>Connections: {edges.length}</span>
        </div>
      </div>

      {/* Canvas */}
      <main style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          style={{ width: '100%', height: '100%' }}
        >
          <Controls />
          <MiniMap />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
      </main>
    </div>
  );
}

export default App;
