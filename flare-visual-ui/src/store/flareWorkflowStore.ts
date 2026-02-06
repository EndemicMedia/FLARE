/**
 * FLARE Workflow Zustand Store
 *
 * Central state management for the visual workflow builder.
 * Manages nodes, edges, execution state, and workflow operations.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { applyNodeChanges, applyEdgeChanges, type OnNodesChange, type OnEdgesChange, type NodeChange, type EdgeChange } from 'reactflow';
import type { FlareNode, NodeData, NodeStatus } from '../types/nodes';
import type { FlareEdge } from '../types/edges';
import type { ExecutionState, NodeExecutionStatus } from '../types/workflow';
import { saveToLocalStorage, loadFromLocalStorage, updateURLWithWorkflow, loadWorkflowFromURL, saveToFile, loadFromFile, type WorkflowData } from '../utils/workflowPersistence';

/**
 * History state for undo/redo
 */
interface HistoryState {
  nodes: FlareNode[];
  edges: FlareEdge[];
}

/**
 * Store state interface
 */
interface FlareWorkflowState {
  // ===== State =====
  nodes: FlareNode[];
  edges: FlareEdge[];
  selectedNodeId: string | null;
  executionState: ExecutionState;
  executionProgress: Record<string, NodeExecutionStatus>;
  compiledFlare: string | null;

  // ===== History =====
  history: {
    past: HistoryState[];
    future: HistoryState[];
  };

  // ===== Node CRUD Operations =====
  onNodesChange: OnNodesChange;

  /**
   * Add a new node to the workflow
   */
  addNode: (node: Omit<FlareNode, 'id'> | FlareNode) => void;

  /**
   * Update an existing node's data
   */
  updateNode: (nodeId: string, updates: Partial<NodeData>) => void;

  /**
   * Remove a node and its connected edges
   */
  removeNode: (nodeId: string) => void;

  /**
   * Replace all nodes (used for workflow loading)
   */
  setNodes: (nodes: FlareNode[]) => void;

  /**
   * Get a node by ID
   */
  getNode: (nodeId: string) => FlareNode | undefined;

  // ===== Edge CRUD Operations =====
  onEdgesChange: OnEdgesChange;

  /**
   * Add a new edge between nodes
   */
  addEdge: (edge: Omit<FlareEdge, 'id'> | FlareEdge) => void;

  /**
   * Remove an edge
   */
  removeEdge: (edgeId: string) => void;

  /**
   * Replace all edges (used for workflow loading)
   */
  setEdges: (edges: FlareEdge[]) => void;

  /**
   * Check if an edge exists between two nodes
   */
  hasEdge: (sourceId: string, targetId: string) => boolean;

  // ===== Selection Management =====
  /**
   * Set the currently selected node
   */
  setSelectedNode: (nodeId: string | null) => void;

  /**
   * Get the currently selected node
   */
  getSelectedNode: () => FlareNode | undefined;

  // ===== Execution Management =====
  /**
   * Set the overall execution state
   */
  setExecutionState: (state: ExecutionState) => void;

  /**
   * Update a specific node's execution status
   */
  setNodeStatus: (
    nodeId: string,
    status: NodeStatus,
    result?: unknown,
    error?: string
  ) => void;

  /**
   * Reset execution state for all nodes
   */
  resetExecution: () => void;

  /**
   * Get execution status for a node
   */
  getNodeExecutionStatus: (nodeId: string) => NodeExecutionStatus | undefined;

  // ===== Workflow Management =====
  /**
   * Set the compiled FLARE command
   */
  setCompiledFlare: (command: string | null) => void;

  /**
   * Clear the entire workflow
   */
  clear: () => void;

  /**
   * Get workflow statistics
   */
  getWorkflowStats: () => {
    nodeCount: number;
    edgeCount: number;
    nodesByType: Record<string, number>;
  };

  // ===== Save/Load =====
  /**
   * Save workflow to file
   */
  saveWorkflowToFile: (filename?: string) => void;

  /**
   * Load workflow from file
   */
  loadWorkflowFromFile: (file: File) => Promise<void>;

  /**
   * Load workflow from data
   */
  loadWorkflow: (data: WorkflowData) => void;

  /**
   * Sync workflow to URL hash
   */
  syncToURL: () => void;

  // ===== History/Undo/Redo =====
  /**
   * Undo last change
   */
  undo: () => void;

  /**
   * Redo last undone change
   */
  redo: () => void;

  /**
   * Check if undo is available
   */
  canUndo: () => boolean;

  /**
   * Check if redo is available
   */
  canRedo: () => boolean;
}

/**
 * Generate a unique ID for nodes/edges
 */
function generateId(prefix: 'node' | 'edge'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Main Zustand store
 */
export const useFlareWorkflowStore = create<FlareWorkflowState>()(
  devtools(
    (set, get) => ({
      // ===== Initial State =====
      nodes: [],
      edges: [],
      selectedNodeId: null,
      executionState: 'idle',
      executionProgress: {},
      compiledFlare: null,
      history: {
        past: [],
        future: [],
      },

      // ===== Node CRUD =====
      onNodesChange: (changes: NodeChange[]) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes) as FlareNode[],
        }, false, 'onNodesChange');
      },

      addNode: (node) => {
        const newNode: FlareNode = {
          ...node,
          id: node.id || generateId('node'),
        };

        // Record history
        const { nodes, edges, history } = get();
        const newPast = [...history.past, { nodes, edges }];

        set(
          (state) => ({
            nodes: [...state.nodes, newNode],
            history: {
              past: newPast,
              future: [],
            },
          }),
          false,
          'addNode'
        );
      },

      updateNode: (nodeId, updates) => {
        set(
          (state) => ({
            nodes: state.nodes.map((n) =>
              n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n
            ),
          }),
          false,
          'updateNode'
        );
      },

      removeNode: (nodeId) => {
        // Record history
        const { nodes, edges, history } = get();
        const newPast = [...history.past, { nodes, edges }];

        set(
          (state) => ({
            nodes: state.nodes.filter((n) => n.id !== nodeId),
            edges: state.edges.filter(
              (e) => e.source !== nodeId && e.target !== nodeId
            ),
            selectedNodeId:
              state.selectedNodeId === nodeId ? null : state.selectedNodeId,
            executionProgress: Object.fromEntries(
              Object.entries(state.executionProgress).filter(
                ([id]) => id !== nodeId
              )
            ),
            history: {
              past: newPast,
              future: [],
            },
          }),
          false,
          'removeNode'
        );
      },

      setNodes: (nodes) => {
        set({ nodes }, false, 'setNodes');
      },

      getNode: (nodeId) => {
        return get().nodes.find((n) => n.id === nodeId);
      },

      // ===== Edge CRUD =====
      onEdgesChange: (changes: EdgeChange[]) => {
        set({
          edges: applyEdgeChanges(changes, get().edges) as FlareEdge[],
        }, false, 'onEdgesChange');
      },

      addEdge: (edge) => {
        const newEdge: FlareEdge = {
          ...edge,
          id: edge.id || generateId('edge'),
        };

        // Record history
        const { nodes, edges, history } = get();
        const newPast = [...history.past, { nodes, edges }];

        set(
          (state) => ({
            edges: [...state.edges, newEdge],
            history: {
              past: newPast,
              future: [],
            },
          }),
          false,
          'addEdge'
        );
      },

      removeEdge: (edgeId) => {
        // Record history
        const { nodes, edges, history } = get();
        const newPast = [...history.past, { nodes, edges }];

        set(
          (state) => ({
            edges: state.edges.filter((e) => e.id !== edgeId),
            history: {
              past: newPast,
              future: [],
            },
          }),
          false,
          'removeEdge'
        );
      },

      setEdges: (edges) => {
        set({ edges }, false, 'setEdges');
      },

      hasEdge: (sourceId, targetId) => {
        return get().edges.some(
          (e) => e.source === sourceId && e.target === targetId
        );
      },

      // ===== Selection =====
      setSelectedNode: (nodeId) => {
        set({ selectedNodeId: nodeId }, false, 'setSelectedNode');
      },

      getSelectedNode: () => {
        const { selectedNodeId, nodes } = get();
        if (!selectedNodeId) return undefined;
        return nodes.find((n) => n.id === selectedNodeId);
      },

      // ===== Execution =====
      setExecutionState: (executionState) => {
        set({ executionState }, false, 'setExecutionState');
      },

      setNodeStatus: (nodeId, status, result, error) => {
        set(
          (state) => ({
            nodes: state.nodes.map((n) =>
              n.id === nodeId
                ? { ...n, data: { ...n.data, status, error } }
                : n
            ),
            executionProgress: {
              ...state.executionProgress,
              [nodeId]: {
                status: status as NodeExecutionStatus['status'],
                result,
                error,
                timestamp: Date.now(),
              },
            },
          }),
          false,
          'setNodeStatus'
        );
      },

      resetExecution: () => {
        set(
          (state) => ({
            executionState: 'idle',
            executionProgress: {},
            compiledFlare: null,
            nodes: state.nodes.map((n) => ({
              ...n,
              data: { ...n.data, status: 'idle', error: undefined },
            })),
          }),
          false,
          'resetExecution'
        );
      },

      getNodeExecutionStatus: (nodeId) => {
        return get().executionProgress[nodeId];
      },

      // ===== Workflow Management =====
      setCompiledFlare: (command) => {
        set({ compiledFlare: command }, false, 'setCompiledFlare');
      },

      clear: () => {
        set(
          {
            nodes: [],
            edges: [],
            selectedNodeId: null,
            executionState: 'idle',
            executionProgress: {},
            compiledFlare: null,
          },
          false,
          'clear'
        );
      },

      getWorkflowStats: () => {
        const { nodes, edges } = get();

        const nodesByType = nodes.reduce(
          (acc, node) => {
            acc[node.type] = (acc[node.type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        return {
          nodeCount: nodes.length,
          edgeCount: edges.length,
          nodesByType,
        };
      },

      // ===== Save/Load =====
      saveWorkflowToFile: (filename = 'workflow.json') => {
        const { nodes, edges } = get();
        saveToFile(nodes, edges, filename);
      },

      loadWorkflowFromFile: async (file: File) => {
        try {
          const data = await loadFromFile(file);
          get().loadWorkflow(data);
        } catch (error) {
          console.error('Failed to load workflow:', error);
          throw error;
        }
      },

      loadWorkflow: (data: WorkflowData) => {
        set(
          {
            nodes: data.nodes,
            edges: data.edges,
            selectedNodeId: null,
            executionState: 'idle',
            executionProgress: {},
            history: { past: [], future: [] },
          },
          false,
          'loadWorkflow'
        );
        // Sync to URL after loading
        get().syncToURL();
      },

      syncToURL: () => {
        const { nodes, edges } = get();
        updateURLWithWorkflow(nodes, edges);
      },

      // ===== History/Undo/Redo =====
      undo: () => {
        const { history, nodes, edges } = get();
        if (history.past.length === 0) return;

        const previous = history.past[history.past.length - 1];
        const newPast = history.past.slice(0, -1);

        set(
          {
            nodes: previous.nodes,
            edges: previous.edges,
            history: {
              past: newPast,
              future: [{ nodes, edges }, ...history.future],
            },
          },
          false,
          'undo'
        );
        get().syncToURL();
      },

      redo: () => {
        const { history, nodes, edges } = get();
        if (history.future.length === 0) return;

        const next = history.future[0];
        const newFuture = history.future.slice(1);

        set(
          {
            nodes: next.nodes,
            edges: next.edges,
            history: {
              past: [...history.past, { nodes, edges }],
              future: newFuture,
            },
          },
          false,
          'redo'
        );
        get().syncToURL();
      },

      canUndo: () => {
        return get().history.past.length > 0;
      },

      canRedo: () => {
        return get().history.future.length > 0;
      },
    }),
    { name: 'FlareWorkflowStore' }
  )
);
