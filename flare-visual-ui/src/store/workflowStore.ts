import { create } from 'zustand';
import type { Node, Edge } from 'reactflow';

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  addNode: (node: Node) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  nodes: [],
  edges: [],
  isRunning: false,
  
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  updateNodeData: (nodeId, newData) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...newData } }
          : node
      ),
    })),
  
  addNode: (node) =>
    set((state) => ({
      nodes: [...state.nodes, node],
    })),
  
  setIsRunning: (running) => set({ isRunning: running }),
}));
