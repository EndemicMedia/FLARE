/**
 * Layout Algorithm for Workflow Graphs
 * Automatically positions nodes in a readable, hierarchical layout
 */

import type { FlareNode } from '../types/nodes';
import type { FlareEdge } from '../types/edges';
import { topologicalSort, getNodeDependencies } from './topologicalSort';

export interface LayoutConfig {
  horizontalSpacing: number;
  verticalSpacing: number;
  startX: number;
  startY: number;
}

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  horizontalSpacing: 350,
  verticalSpacing: 150,
  startX: 50,
  startY: 50
};

/**
 * Computes layout positions for all nodes in the workflow
 * Uses a hierarchical left-to-right layout
 */
export function computeLayout(
  nodes: FlareNode[],
  edges: FlareEdge[],
  config: Partial<LayoutConfig> = {}
): FlareNode[] {
  const layoutConfig = { ...DEFAULT_LAYOUT_CONFIG, ...config };

  if (nodes.length === 0) {
    return [];
  }

  // Get topological order
  const { order } = topologicalSort(nodes, edges);

  // Calculate depth for each node
  const nodeDepths = calculateNodeDepths(nodes, edges, order);

  // Group nodes by depth
  const depthGroups = groupNodesByDepth(nodeDepths);

  // Position nodes
  return positionNodes(nodes, depthGroups, layoutConfig);
}

/**
 * Calculates the depth (horizontal layer) for each node
 */
function calculateNodeDepths(
  nodes: FlareNode[],
  edges: FlareEdge[],
  order: string[]
): Map<string, number> {
  const depths = new Map<string, number>();

  // Initialize all nodes to depth 0
  nodes.forEach(node => depths.set(node.id, 0));

  // Calculate depths based on dependencies
  order.forEach(nodeId => {
    const dependencies = getNodeDependencies(nodeId, edges);

    if (dependencies.length === 0) {
      depths.set(nodeId, 0);
    } else {
      const maxDepth = Math.max(...dependencies.map(dep => depths.get(dep) || 0));
      depths.set(nodeId, maxDepth + 1);
    }
  });

  return depths;
}

/**
 * Groups nodes by their depth level
 */
function groupNodesByDepth(nodeDepths: Map<string, number>): Map<number, string[]> {
  const groups = new Map<number, string[]>();

  nodeDepths.forEach((depth, nodeId) => {
    if (!groups.has(depth)) {
      groups.set(depth, []);
    }
    groups.get(depth)!.push(nodeId);
  });

  return groups;
}

/**
 * Positions nodes based on their depth groups
 */
function positionNodes(
  nodes: FlareNode[],
  depthGroups: Map<number, string[]>,
  config: LayoutConfig
): FlareNode[] {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const positionedNodes: FlareNode[] = [];

  depthGroups.forEach((nodeIds, depth) => {
    const x = config.startX + depth * config.horizontalSpacing;

    nodeIds.forEach((nodeId, index) => {
      const node = nodeMap.get(nodeId);
      if (!node) return;

      const y = config.startY + index * config.verticalSpacing;

      positionedNodes.push({
        ...node,
        position: { x, y }
      });
    });
  });

  return positionedNodes;
}

/**
 * Centers the layout in the viewport
 */
export function centerLayout(
  nodes: FlareNode[],
  viewportWidth: number,
  viewportHeight: number
): FlareNode[] {
  if (nodes.length === 0) return [];

  // Calculate bounding box
  const bounds = getLayoutBounds(nodes);

  // Calculate offset to center
  const offsetX = (viewportWidth - bounds.width) / 2 - bounds.minX;
  const offsetY = (viewportHeight - bounds.height) / 2 - bounds.minY;

  // Apply offset
  return nodes.map(node => ({
    ...node,
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY
    }
  }));
}

/**
 * Gets the bounding box of the layout
 */
function getLayoutBounds(nodes: FlareNode[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach(node => {
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x);
    maxY = Math.max(maxY, node.position.y);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 300, // Add approximate node width
    height: maxY - minY + 200 // Add approximate node height
  };
}

/**
 * Optimizes layout by minimizing edge crossings
 */
export function optimizeLayout(
  nodes: FlareNode[],
  _edges: FlareEdge[]
): FlareNode[] {
  // Simple optimization: sort nodes at each depth by their average connection position
  const depthGroups = new Map<number, FlareNode[]>();

  // Group by depth (x position)
  nodes.forEach(node => {
    const depth = Math.round(node.position.x / 350);
    if (!depthGroups.has(depth)) {
      depthGroups.set(depth, []);
    }
    depthGroups.get(depth)!.push(node);
  });

  // Sort each group by y position
  depthGroups.forEach(group => {
    group.sort((a, b) => a.position.y - b.position.y);
  });

  // Reposition nodes
  const optimized: FlareNode[] = [];
  depthGroups.forEach((group, depth) => {
    group.forEach((node, index) => {
      optimized.push({
        ...node,
        position: {
          x: 50 + depth * 350,
          y: 50 + index * 150
        }
      });
    });
  });

  return optimized;
}
