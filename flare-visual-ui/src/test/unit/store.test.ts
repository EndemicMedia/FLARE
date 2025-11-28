/**
 * Unit Tests for FlareWorkflowStore
 *
 * Tests the Zustand store's state management functionality
 * including node/edge CRUD operations, execution state, and workflow management.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useFlareWorkflowStore } from '../../store/flareWorkflowStore';
import type { FlareNode } from '../../types/nodes';
import type { FlareEdge } from '../../types/edges';

describe('FlareWorkflowStore', () => {
  beforeEach(() => {
    // Clear store before each test
    useFlareWorkflowStore.getState().clear();
  });

  describe('Node Operations', () => {
    it('should add a node', () => {
      const { addNode } = useFlareWorkflowStore.getState();

      addNode({
        type: 'textInput',
        position: { x: 0, y: 0 },
        data: { text: '', status: 'idle' },
      });

      const currentNodes = useFlareWorkflowStore.getState().nodes;
      expect(currentNodes).toHaveLength(1);
      expect(currentNodes[0].type).toBe('textInput');
      expect(currentNodes[0].data).toHaveProperty('text', '');
      expect(currentNodes[0].id).toBeDefined();
    });

    it('should remove a node and its connected edges', () => {
      const { addNode, addEdge, removeNode } = useFlareWorkflowStore.getState();

      // Add two nodes
      addNode({
        type: 'textInput',
        position: { x: 0, y: 0 },
        data: { text: '', status: 'idle' },
      });
      addNode({
        type: 'modelQuery',
        position: { x: 100, y: 0 },
        data: { models: ['openai'], status: 'idle' },
      });

      const nodes = useFlareWorkflowStore.getState().nodes;
      const nodeId1 = nodes[0].id;
      const nodeId2 = nodes[1].id;

      // Add edge between them
      addEdge({ source: nodeId1, target: nodeId2 });

      // Remove first node
      removeNode(nodeId1);

      const state = useFlareWorkflowStore.getState();
      expect(state.nodes).toHaveLength(1);
      expect(state.edges).toHaveLength(0); // Edge should be removed
      expect(state.nodes[0].id).toBe(nodeId2);
    });

    it('should update a node', () => {
      const { addNode, updateNode } = useFlareWorkflowStore.getState();

      addNode({
        type: 'textInput',
        position: { x: 0, y: 0 },
        data: { text: '', status: 'idle' },
      });

      const nodeId = useFlareWorkflowStore.getState().nodes[0].id;

      updateNode(nodeId, { text: 'Updated text', status: 'completed' });

      const node = useFlareWorkflowStore.getState().nodes[0];
      expect(node.data).toHaveProperty('text', 'Updated text');
      expect(node.data.status).toBe('completed');
    });

    it('should get a node by ID', () => {
      const { addNode, getNode } = useFlareWorkflowStore.getState();

      addNode({
        type: 'textInput',
        position: { x: 0, y: 0 },
        data: { text: 'test', status: 'idle' },
      });

      const nodeId = useFlareWorkflowStore.getState().nodes[0].id;
      const node = getNode(nodeId);

      expect(node).toBeDefined();
      expect(node?.type).toBe('textInput');
    });

    it('should replace all nodes with setNodes', () => {
      const { addNode, setNodes } = useFlareWorkflowStore.getState();

      // Add initial nodes
      addNode({
        type: 'textInput',
        position: { x: 0, y: 0 },
        data: { text: '', status: 'idle' },
      });

      expect(useFlareWorkflowStore.getState().nodes).toHaveLength(1);

      // Replace with new nodes
      const newNodes: FlareNode[] = [
        {
          id: 'node-1',
          type: 'modelQuery',
          position: { x: 100, y: 100 },
          data: { models: ['openai', 'mistral'], status: 'idle' },
        },
        {
          id: 'node-2',
          type: 'output',
          position: { x: 200, y: 200 },
          data: { displayMode: 'text', content: null, status: 'idle' },
        },
      ];

      setNodes(newNodes);

      const state = useFlareWorkflowStore.getState();
      expect(state.nodes).toHaveLength(2);
      expect(state.nodes[0].type).toBe('modelQuery');
      expect(state.nodes[1].type).toBe('output');
    });
  });

  describe('Edge Operations', () => {
    it('should add an edge', () => {
      const { addEdge } = useFlareWorkflowStore.getState();

      addEdge({ source: 'node-1', target: 'node-2' });

      const edges = useFlareWorkflowStore.getState().edges;
      expect(edges).toHaveLength(1);
      expect(edges[0].source).toBe('node-1');
      expect(edges[0].target).toBe('node-2');
      expect(edges[0].id).toBeDefined();
    });

    it('should remove an edge', () => {
      const { addEdge, removeEdge } = useFlareWorkflowStore.getState();

      addEdge({ source: 'node-1', target: 'node-2' });

      const edgeId = useFlareWorkflowStore.getState().edges[0].id;
      removeEdge(edgeId);

      expect(useFlareWorkflowStore.getState().edges).toHaveLength(0);
    });

    it('should check if an edge exists', () => {
      const { addEdge, hasEdge } = useFlareWorkflowStore.getState();

      addEdge({ source: 'node-1', target: 'node-2' });

      expect(hasEdge('node-1', 'node-2')).toBe(true);
      expect(hasEdge('node-2', 'node-1')).toBe(false);
      expect(hasEdge('node-1', 'node-3')).toBe(false);
    });

    it('should replace all edges with setEdges', () => {
      const { addEdge, setEdges } = useFlareWorkflowStore.getState();

      // Add initial edge
      addEdge({ source: 'node-1', target: 'node-2' });

      expect(useFlareWorkflowStore.getState().edges).toHaveLength(1);

      // Replace with new edges
      const newEdges: FlareEdge[] = [
        {
          id: 'edge-1',
          source: 'node-2',
          target: 'node-3',
        },
        {
          id: 'edge-2',
          source: 'node-3',
          target: 'node-4',
          type: 'smoothstep',
          animated: true,
        },
      ];

      setEdges(newEdges);

      const state = useFlareWorkflowStore.getState();
      expect(state.edges).toHaveLength(2);
      expect(state.edges[0].source).toBe('node-2');
      expect(state.edges[1].animated).toBe(true);
    });
  });

  describe('Selection Management', () => {
    it('should set and get selected node', () => {
      const { addNode, setSelectedNode, getSelectedNode } =
        useFlareWorkflowStore.getState();

      addNode({
        type: 'textInput',
        position: { x: 0, y: 0 },
        data: { text: 'test', status: 'idle' },
      });

      const nodeId = useFlareWorkflowStore.getState().nodes[0].id;

      setSelectedNode(nodeId);
      expect(useFlareWorkflowStore.getState().selectedNodeId).toBe(nodeId);

      const selectedNode = getSelectedNode();
      expect(selectedNode).toBeDefined();
      expect(selectedNode?.id).toBe(nodeId);
    });

    it('should clear selection when removing selected node', () => {
      const { addNode, setSelectedNode, removeNode } =
        useFlareWorkflowStore.getState();

      addNode({
        type: 'textInput',
        position: { x: 0, y: 0 },
        data: { text: '', status: 'idle' },
      });

      const nodeId = useFlareWorkflowStore.getState().nodes[0].id;
      setSelectedNode(nodeId);

      expect(useFlareWorkflowStore.getState().selectedNodeId).toBe(nodeId);

      removeNode(nodeId);

      expect(useFlareWorkflowStore.getState().selectedNodeId).toBeNull();
    });
  });

  describe('Execution Management', () => {
    it('should update execution state', () => {
      const { setExecutionState } = useFlareWorkflowStore.getState();

      setExecutionState('running');
      expect(useFlareWorkflowStore.getState().executionState).toBe('running');

      setExecutionState('completed');
      expect(useFlareWorkflowStore.getState().executionState).toBe('completed');
    });

    it('should update node status', () => {
      const { addNode, setNodeStatus } = useFlareWorkflowStore.getState();

      addNode({
        type: 'modelQuery',
        position: { x: 0, y: 0 },
        data: { models: ['openai'], status: 'idle' },
      });

      const nodeId = useFlareWorkflowStore.getState().nodes[0].id;

      setNodeStatus(nodeId, 'loading');

      const state = useFlareWorkflowStore.getState();
      expect(state.nodes[0].data.status).toBe('loading');
      expect(state.executionProgress[nodeId]).toBeDefined();
      expect(state.executionProgress[nodeId].status).toBe('loading');
      expect(state.executionProgress[nodeId].timestamp).toBeDefined();
    });

    it('should reset execution', () => {
      const { addNode, setExecutionState, setNodeStatus, resetExecution } =
        useFlareWorkflowStore.getState();

      addNode({
        type: 'modelQuery',
        position: { x: 0, y: 0 },
        data: { models: ['openai'], status: 'idle' },
      });

      const nodeId = useFlareWorkflowStore.getState().nodes[0].id;

      setExecutionState('running');
      setNodeStatus(nodeId, 'loading', { result: 'test' });

      resetExecution();

      const state = useFlareWorkflowStore.getState();
      expect(state.executionState).toBe('idle');
      expect(state.executionProgress).toEqual({});
      expect(state.nodes[0].data.status).toBe('idle');
      expect(state.compiledFlare).toBeNull();
    });

    it('should get node execution status', () => {
      const { addNode, setNodeStatus, getNodeExecutionStatus } =
        useFlareWorkflowStore.getState();

      addNode({
        type: 'modelQuery',
        position: { x: 0, y: 0 },
        data: { models: ['openai'], status: 'idle' },
      });

      const nodeId = useFlareWorkflowStore.getState().nodes[0].id;
      const result = { response: 'test response' };

      setNodeStatus(nodeId, 'completed', result);

      const executionStatus = getNodeExecutionStatus(nodeId);
      expect(executionStatus).toBeDefined();
      expect(executionStatus?.status).toBe('completed');
      expect(executionStatus?.result).toEqual(result);
    });
  });

  describe('Workflow Management', () => {
    it('should set compiled FLARE command', () => {
      const { setCompiledFlare } = useFlareWorkflowStore.getState();

      const command = '{ flare model:openai temp:0.8 vote `test prompt` }';
      setCompiledFlare(command);

      expect(useFlareWorkflowStore.getState().compiledFlare).toBe(command);
    });

    it('should clear the entire workflow', () => {
      const {
        addNode,
        addEdge,
        setExecutionState,
        setCompiledFlare,
        clear,
      } = useFlareWorkflowStore.getState();

      // Add some data
      addNode({
        type: 'textInput',
        position: { x: 0, y: 0 },
        data: { text: 'test', status: 'idle' },
      });
      addEdge({ source: 'node-1', target: 'node-2' });
      setExecutionState('running');
      setCompiledFlare('{ flare model:openai `test` }');

      // Clear everything
      clear();

      const state = useFlareWorkflowStore.getState();
      expect(state.nodes).toHaveLength(0);
      expect(state.edges).toHaveLength(0);
      expect(state.selectedNodeId).toBeNull();
      expect(state.executionState).toBe('idle');
      expect(state.executionProgress).toEqual({});
      expect(state.compiledFlare).toBeNull();
    });

    it('should get workflow statistics', () => {
      const { addNode, getWorkflowStats } = useFlareWorkflowStore.getState();

      addNode({
        type: 'textInput',
        position: { x: 0, y: 0 },
        data: { text: '', status: 'idle' },
      });
      addNode({
        type: 'modelQuery',
        position: { x: 100, y: 0 },
        data: { models: ['openai'], status: 'idle' },
      });
      addNode({
        type: 'modelQuery',
        position: { x: 200, y: 0 },
        data: { models: ['mistral'], status: 'idle' },
      });

      const stats = getWorkflowStats();

      expect(stats.nodeCount).toBe(3);
      expect(stats.nodesByType.textInput).toBe(1);
      expect(stats.nodesByType.modelQuery).toBe(2);
    });
  });
});
