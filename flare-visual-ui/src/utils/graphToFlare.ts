/**
 * Graph-to-FLARE Compiler
 * Converts visual workflow graph into FLARE command syntax
 */

import type { FlareNode } from '../types/nodes';
import type { FlareEdge } from '../types/edges';
import {
  isTextInputNode,
  isModelQueryNode,
  isParameterNode,
  isPostProcessingNode
} from '../types/nodes';
import { topologicalSort } from './topologicalSort';

export interface CompilationResult {
  success: boolean;
  flareCommand?: string;
  errors: string[];
  warnings: string[];
}

/**
 * Compiles a workflow graph into FLARE command string(s)
 * Supports multiple disconnected workflows (one per TextInput node)
 */
export function compileGraphToFlare(
  nodes: FlareNode[],
  edges: FlareEdge[]
): CompilationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate graph structure
  const validation = validateGraph(nodes, edges);
  errors.push(...validation.errors);
  warnings.push(...validation.warnings);

  if (errors.length > 0) {
    return { success: false, errors, warnings };
  }

  // Find all TextInput nodes (each starts a separate workflow)
  const textInputNodes = nodes.filter(n => isTextInputNode(n.data));

  if (textInputNodes.length === 0) {
    errors.push('Workflow must contain at least one text input node');
    return { success: false, errors, warnings };
  }

  // Compile each workflow independently
  const flareCommands: string[] = [];

  for (const textInputNode of textInputNodes) {
    // Get nodes reachable from this specific TextInput
    const reachableNodes = getReachableNodesFrom(textInputNode.id, nodes, edges);

    // Get topological order for this subgraph
    const subgraphNodes = nodes.filter(n => reachableNodes.has(n.id));
    const subgraphEdges = edges.filter(e =>
      reachableNodes.has(e.source) && reachableNodes.has(e.target)
    );

    const { order, cycles } = topologicalSort(subgraphNodes, subgraphEdges);

    if (cycles.length > 0) {
      warnings.push(`Cycle detected in workflow starting from "${textInputNode.data.text?.substring(0, 20)}..."`);
      continue; // Skip this workflow
    }

    // Extract components for this workflow
    const components = extractComponents(subgraphNodes, subgraphEdges, order);

    // Check if workflow has required components
    if (!components.prompt) {
      warnings.push('Skipping workflow with no prompt');
      continue;
    }

    if (components.models.length === 0) {
      warnings.push(`Workflow "${components.prompt.substring(0, 20)}..." has no models - skipping`);
      continue;
    }

    // Build FLARE command for this workflow
    const flareCommand = buildFlareCommand(components);
    flareCommands.push(flareCommand);
  }

  if (flareCommands.length === 0) {
    errors.push('No valid workflows to compile');
    return { success: false, errors, warnings };
  }

  // Join multiple commands with newlines
  const finalCommand = flareCommands.join('\n\n');

  return {
    success: true,
    flareCommand: finalCommand,
    errors,
    warnings
  };
}

/**
 * Gets all nodes reachable from a specific starting node via BFS
 */
function getReachableNodesFrom(
  startNodeId: string,
  nodes: FlareNode[],
  edges: FlareEdge[]
): Set<string> {
  const reachable = new Set<string>();
  const adjacency = new Map<string, string[]>();

  // Build adjacency list
  nodes.forEach(n => adjacency.set(n.id, []));
  edges.forEach(edge => {
    const neighbors = adjacency.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacency.set(edge.source, neighbors);
  });

  // BFS from start node
  const queue = [startNodeId];
  reachable.add(startNodeId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const neighbors = adjacency.get(current) || [];

    neighbors.forEach(neighbor => {
      if (!reachable.has(neighbor)) {
        reachable.add(neighbor);
        queue.push(neighbor);
      }
    });
  }

  return reachable;
}

interface WorkflowComponents {
  prompt: string;
  models: string[];
  temperature?: number;
  postProcessing: string[];
}

/**
 * Extracts workflow components from nodes in execution order
 */
function extractComponents(
  nodes: FlareNode[],
  _edges: FlareEdge[],
  order: string[]
): WorkflowComponents {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  const components: WorkflowComponents = {
    prompt: '',
    models: [],
    postProcessing: []
  };

  const seenModels = new Set<string>();

  order.forEach(nodeId => {
    const node = nodeMap.get(nodeId);
    if (!node) return;

    if (isTextInputNode(node.data)) {
      // Use the last prompt found in execution order
      components.prompt = node.data.text;
    } else if (isModelQueryNode(node.data)) {
      // Collect all models from all ModelQuery nodes
      const models = node.data.models || (node.data.model ? [node.data.model] : []);
      models.forEach(m => {
        if (!seenModels.has(m)) {
          components.models.push(m);
          seenModels.add(m);
        }
      });

      // Use temperature from ModelQuery if present (latest one wins)
      if (node.data.temperature !== undefined) {
        components.temperature = node.data.temperature;
      }
    } else if (isParameterNode(node.data)) {
      if (node.data.paramType === 'temperature') {
        components.temperature = node.data.value;
      }
    } else if (isPostProcessingNode(node.data)) {
      // Keep track of processing ops in sequence
      if (!components.postProcessing.includes(node.data.operation)) {
        components.postProcessing.push(node.data.operation);
      }
    }
  });

  return components;
}

/**
 * Builds FLARE command string from components
 * Format: { flare model:openai,mistral temp:0.8 sum vote `prompt text` }
 */
function buildFlareCommand(components: WorkflowComponents): string {
  const parts: string[] = ['flare'];

  // Add models
  if (components.models.length > 0) {
    parts.push(`model:${components.models.join(',')}`);
  }

  // Add temperature
  if (components.temperature !== undefined) {
    parts.push(`temp:${components.temperature.toFixed(1)}`);
  }

  // Add post-processing operations
  parts.push(...components.postProcessing);

  // Build command
  const parameters = parts.join(' ');
  const prompt = components.prompt || '';

  return `{ ${parameters} \`${prompt}\` }`;
}

/**
 * Validates graph structure and returns errors/warnings
 */
function validateGraph(
  nodes: FlareNode[],
  edges: FlareEdge[]
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (nodes.length === 0) {
    errors.push('Workflow is empty');
    return { errors, warnings };
  }

  // Count node types
  const textInputNodes = nodes.filter(n => isTextInputNode(n.data));
  const modelNodes = nodes.filter(n => isModelQueryNode(n.data));
  const outputNodes = nodes.filter(n => n.type === 'output');

  if (textInputNodes.length === 0) {
    errors.push('Workflow must have at least one text input node');
  }

  if (textInputNodes.length > 1) {
    // Multiple workflows is now supported, no warning needed
  }

  if (modelNodes.length === 0) {
    errors.push('Workflow must have at least one model query node');
  }

  if (outputNodes.length === 0) {
    warnings.push('Workflow has no output node');
  }

  // Validate connections
  const nodeIds = new Set(nodes.map(n => n.id));
  edges.forEach(edge => {
    if (!nodeIds.has(edge.source)) {
      errors.push(`Edge references non-existent source node: ${edge.source}`);
    }
    if (!nodeIds.has(edge.target)) {
      errors.push(`Edge references non-existent target node: ${edge.target}`);
    }
  });

  return { errors, warnings };
}

/**
 * Validates FLARE command syntax (basic check)
 */
export function validateFlareCommand(command: string): boolean {
  const flarePattern = /^\{\s*flare\s+.*`.*`\s*\}$/;
  return flarePattern.test(command);
}

/**
 * Extracts prompt from FLARE command
 */
export function extractPromptFromFlare(command: string): string | null {
  const match = command.match(/`([^`]+)`/);
  return match ? match[1] : null;
}

/**
 * Extracts models from FLARE command
 */
export function extractModelsFromFlare(command: string): string[] {
  const match = command.match(/model:([^\s`]+)/);
  if (!match) return [];
  return match[1].split(',');
}
