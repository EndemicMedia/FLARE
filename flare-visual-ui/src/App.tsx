import { useState, useCallback, useEffect } from 'react';
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
import { FiCode } from 'react-icons/fi';
import { TextInputNode } from './components/nodes/TextInputNode';
import { ModelQueryNode } from './components/nodes/ModelQueryNode';
import { ParameterNode } from './components/nodes/ParameterNode';
import { PostProcessingNode } from './components/nodes/PostProcessingNode';
import { OutputNode } from './components/nodes/OutputNode';
import { ImageGenerationNode } from './components/nodes/ImageGenerationNode';
import { FlareCommandNode } from './components/nodes/FlareCommandNode';
import { CustomEdge } from './components/edges/CustomEdge';
import { SyntaxView } from './components/SyntaxView';
import { ThemeToggle } from './components/ThemeToggle';
import { HandleContextMenu } from './components/HandleContextMenu';
import { HandleContextMenuContext } from './contexts/HandleContextMenuContext';
import { useFlareWorkflowStore } from './store/flareWorkflowStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useWorkflowSync } from './hooks/useWorkflowSync';
import { executeWorkflow } from './utils/workflowExecutor';
import { getLayoutedElements } from './utils/autoLayout';
import { validateConnection } from './utils/connectionValidator';

// Register custom node types
const nodeTypes: NodeTypes = {
  textInput: TextInputNode,
  modelQuery: ModelQueryNode,
  parameter: ParameterNode,
  postProcessing: PostProcessingNode,
  output: OutputNode,
  imageGeneration: ImageGenerationNode,
  flareCommand: FlareCommandNode,
};

// Register custom edge types
const edgeTypes = {
  default: CustomEdge,
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
  { id: 'e1-2', source: 'input-1', target: 'model-1', sourceHandle: 'output', targetHandle: 'input' },
  { id: 'e2-3', source: 'model-1', target: 'output-1', sourceHandle: 'output', targetHandle: 'input' },
];

function App() {
  const {
    nodes, edges,
    onNodesChange, onEdgesChange,
    setNodes, setEdges,
    addNode, addEdge: storeAddEdge,
    executionState, setExecutionState,
    saveWorkflowToFile, loadWorkflowFromFile
  } = useFlareWorkflowStore();

  // Auto-sync workflow to URL and localStorage
  useWorkflowSync();

  const [showSyntax, setShowSyntax] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    sourceNodeId: string;
    sourceHandle: string;
    handleType: 'source' | 'target';
    position: { x: number; y: number };
  } | null>(null);

  // Initialize with demo data if empty and no URL hash
  useEffect(() => {
    if (nodes.length === 0 && !window.location.hash) {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, []);

  const onConnect = useCallback(
    (params: Connection | Edge) => storeAddEdge(params as Edge),
    [storeAddEdge]
  );

  const addTextInputNode = () => {
    const newNode: Node = {
      id: `input-${Date.now()}`,
      type: 'textInput',
      position: { x: Math.random() * 200 + 50, y: Math.random() * 200 + 100 },
      data: { text: '', placeholder: 'Enter your prompt...' },
    };
    console.log('Adding TextInput node:', newNode);
    addNode(newNode);
  };

  const addModelQueryNode = () => {
    const newNode: Node = {
      id: `model-${Date.now()}`,
      type: 'modelQuery',
      position: { x: Math.random() * 200 + 400, y: Math.random() * 200 + 100 },
      data: { models: ['mistral'], temperature: 1.0, postProcessing: '' },
    };
    console.log('Adding ModelQuery node:', newNode);
    addNode(newNode);
  };

  const addOutputNode = () => {
    const newNode: Node = {
      id: `output-${Date.now()}`,
      type: 'output',
      position: { x: Math.random() * 200 + 850, y: Math.random() * 200 + 100 },
      data: { displayMode: 'text' as const, content: null },
    };
    console.log('Adding Output node:', newNode);
    addNode(newNode);
  };

  const addParameterNode = () => {
    const newNode: Node = {
      id: `param-${Date.now()}`,
      type: 'parameter',
      position: { x: Math.random() * 200 + 250, y: Math.random() * 200 + 100 },
      data: { paramType: 'temperature', value: 0.7, min: 0.0, max: 2.0 },
    };
    console.log('Adding Parameter node:', newNode);
    addNode(newNode);
  };

  const addPostProcessingNode = () => {
    const newNode: Node = {
      id: `postproc-${Date.now()}`,
      type: 'postProcessing',
      position: { x: Math.random() * 200 + 650, y: Math.random() * 200 + 100 },
      data: { operation: 'vote' },
    };
    console.log('Adding PostProcessing node:', newNode);
    addNode(newNode);
  };

  const addImageGenerationNode = () => {
    const newNode: Node = {
      id: `image-${Date.now()}`,
      type: 'imageGeneration',
      position: { x: Math.random() * 200 + 400, y: Math.random() * 200 + 300 },
      data: {
        model: 'flux',
        width: 1024,
        height: 1024,
        enhance: true,
        nologo: true
      },
    };
    console.log('Adding ImageGeneration node:', newNode);
    addNode(newNode);
  };

  const addFlareCommandNode = () => {
    const newNode: Node = {
      id: `flare-${Date.now()}`,
      type: 'flareCommand',
      position: { x: Math.random() * 200 + 500, y: Math.random() * 200 + 200 },
      data: {
        subGraph: {
          nodes: [],
          edges: []
        },
        compiled: '{ flare ... }',
      },
    };
    console.log('Adding FlareCommand node:', newNode);
    addNode(newNode);
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

  // Keyboard shortcuts (after handleRunWorkflow is defined)
  useKeyboardShortcuts({
    onExecute: handleRunWorkflow,
    onSave: () => console.log('Save workflow (TODO: implement)'),
  });

  const handleAutoLayout = () => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges, {
      direction: 'LR',
      nodeSpacing: 80,
      rankSpacing: 200,
    });
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  };

  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      const { isValid, message } = validateConnection(connection, nodes, edges);
      if (!isValid && message) {
        console.warn(message);
      }
      return isValid;
    },
    [nodes, edges]
  );

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
          onClick={addPostProcessingNode}
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors text-sm font-medium"
        >
          + Post-Processing
        </button>
        <button
          onClick={addOutputNode}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm font-medium"
        >
          + Output
        </button>
        <button
          onClick={addImageGenerationNode}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded hover:from-purple-600 hover:to-indigo-600 transition-colors text-sm font-medium"
        >
          + Image Gen
        </button>
        <button
          onClick={addFlareCommandNode}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded hover:from-indigo-600 hover:to-purple-700 transition-colors text-sm font-medium"
        >
          🔄 Nested Workflow
        </button>

        <div className="flex-1"></div>

        <button
          onClick={handleAutoLayout}
          className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors text-sm font-medium"
          title="Auto-arrange nodes (Dagre layout)"
        >
          ✨ Auto Layout
        </button>

        <input
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          id="workflow-file-input"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              try {
                await loadWorkflowFromFile(file);
                console.log('Workflow loaded successfully');
              } catch (error) {
                console.error('Failed to load workflow:', error);
                alert('Failed to load workflow. Please check the file format.');
              }
            }
          }}
        />

        <button
          onClick={() => saveWorkflowToFile()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium"
          title="Save workflow to file (Ctrl+S)"
        >
          💾 Save
        </button>

        <button
          onClick={() => document.getElementById('workflow-file-input')?.click()}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium"
          title="Load workflow from file"
        >
          📂 Load
        </button>

        <button
          onClick={() => setShowSyntax(!showSyntax)}
          className={`px-4 py-2 border rounded font-medium text-sm flex items-center gap-2 transition-colors ${showSyntax
            ? 'bg-gray-200 text-gray-800 border-gray-300'
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          title="Toggle FLARE Syntax View"
        >
          <FiCode />
          {showSyntax ? 'Hide Syntax' : 'Show Syntax'}
        </button>

        <button
          onClick={handleRunWorkflow}
          disabled={isRunning}
          className={`px-6 py-2 rounded font-medium text-sm transition-colors ${isRunning
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
        >
          {isRunning ? '⏳ Running...' : '▶ Run Workflow'}
        </button>

        <div className="text-sm text-gray-500 flex items-center gap-3">
          <span className="mr-2">Nodes: {nodes.length}</span>
          <span>Connections: {edges.length}</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Canvas */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <HandleContextMenuContext.Provider
            value={{
              openHandleContextMenu: (nodeId, handleId, handleType, position) => {
                setContextMenu({
                  sourceNodeId: nodeId,
                  sourceHandle: handleId,
                  handleType,
                  position
                });
              }
            }}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              isValidConnection={isValidConnection}
              fitView
              defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
              style={{ width: '100%', height: '100%' }}
            >
              <Controls />
              <MiniMap />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          </HandleContextMenuContext.Provider>
        </div>
        {showSyntax && <SyntaxView />}

        {/* Context Menu */}
        {contextMenu && (
          <HandleContextMenu
            sourceNodeId={contextMenu.sourceNodeId}
            sourceHandle={contextMenu.sourceHandle}
            handleType={contextMenu.handleType}
            position={contextMenu.position}
            nodes={nodes}
            edges={edges}
            onClose={() => setContextMenu(null)}
            onConnect={(targetNodeId, targetHandle) => {
              const newEdge: Edge = {
                id: `edge-${contextMenu.sourceNodeId}-${targetNodeId}-${Date.now()}`,
                source: contextMenu.handleType === 'source' ? contextMenu.sourceNodeId : targetNodeId,
                sourceHandle: contextMenu.handleType === 'source' ? contextMenu.sourceHandle : targetHandle,
                target: contextMenu.handleType === 'source' ? targetNodeId : contextMenu.sourceNodeId,
                targetHandle: contextMenu.handleType === 'source' ? targetHandle : contextMenu.sourceHandle
              };
              storeAddEdge(newEdge);
            }}
          />
        )}
      </main>
    </div >
  );
}

export default App;
