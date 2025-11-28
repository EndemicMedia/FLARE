/**
 * Topological Sort for Workflow Execution Order
 * Determines the correct order to execute nodes based on their dependencies
 */

import type { FlareNode } from '../types/nodes';
import type { FlareEdge } from '../types/edges';

export interface TopologicalSortResult {
  order: string[];
  cycles: string[][];
}

/**
 * Performs topological sort on the workflow graph
 * Returns execution order and any detected cycles
 */
export function topologicalSort(
  nodes: FlareNode[],
  edges: FlareEdge[]
): TopologicalSortResult {
  const nodeIds = new Set(nodes.map(n => n.id));
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  // Initialize graph structures
  nodeIds.forEach(id => {
    inDegree.set(id, 0);
    adjacency.set(id, []);
  });

  // Build adjacency list and calculate in-degrees
  edges.forEach(edge => {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      return; // Skip invalid edges
    }

    adjacency.get(edge.source)!.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
  });

  // Kahn's algorithm for topological sort
  const queue: string[] = [];
  const order: string[] = [];

  // Start with nodes that have no dependencies
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);

    const neighbors = adjacency.get(current) || [];
    neighbors.forEach(neighbor => {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);

      if (newDegree === 0) {
        queue.push(neighbor);
      }
    });
  }

  // Detect cycles
  const cycles: string[][] = [];
  if (order.length < nodeIds.size) {
    // There are unvisited nodes, indicating cycles
    const unvisited = Array.from(nodeIds).filter(id => !order.includes(id));
    const cycleNodes = detectCycles(unvisited, adjacency);
    cycles.push(...cycleNodes);
  }

  return { order, cycles };
}

/**
 * Detects cycles in the graph using DFS
 */
function detectCycles(
  startNodes: string[],
  adjacency: Map<string, string[]>
): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const currentPath: string[] = [];

  function dfs(node: string): boolean {
    visited.add(node);
    recursionStack.add(node);
    currentPath.push(node);

    const neighbors = adjacency.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        // Cycle detected
        const cycleStart = currentPath.indexOf(neighbor);
        cycles.push(currentPath.slice(cycleStart));
        return true;
      }
    }

    currentPath.pop();
    recursionStack.delete(node);
    return false;
  }

  startNodes.forEach(node => {
    if (!visited.has(node)) {
      dfs(node);
    }
  });

  return cycles;
}

/**
 * Validates if the workflow graph is acyclic (DAG)
 */
export function isAcyclic(nodes: FlareNode[], edges: FlareEdge[]): boolean {
  const { cycles } = topologicalSort(nodes, edges);
  return cycles.length === 0;
}

/**
 * Gets the dependencies of a specific node
 */
export function getNodeDependencies(
  nodeId: string,
  edges: FlareEdge[]
): string[] {
  return edges
    .filter(edge => edge.target === nodeId)
    .map(edge => edge.source);
}

/**
 * Gets the dependents of a specific node
 */
export function getNodeDependents(
  nodeId: string,
  edges: FlareEdge[]
): string[] {
  return edges
    .filter(edge => edge.source === nodeId)
    .map(edge => edge.target);
}
