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
 * Compiles a workflow graph into a FLARE command string
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

  // Get execution order
  const { order, cycles } = topologicalSort(nodes, edges);

  if (cycles.length > 0) {
    errors.push(`Cycle detected in workflow: ${cycles[0].join(' -> ')}`);
    return { success: false, errors, warnings };
  }

  // Extract components
  const components = extractComponents(nodes, edges, order);

  if (!components.prompt) {
    errors.push('Workflow must contain a text input node');
    return { success: false, errors, warnings };
  }

  if (components.models.length === 0) {
    errors.push('Workflow must contain at least one model');
    return { success: false, errors, warnings };
  }

  // Build FLARE command
  const flareCommand = buildFlareCommand(components);

  return {
    success: true,
    flareCommand,
    errors,
    warnings
  };
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

  order.forEach(nodeId => {
    const node = nodeMap.get(nodeId);
    if (!node) return;

    if (isTextInputNode(node.data)) {
      components.prompt = node.data.text;
    } else if (isModelQueryNode(node.data)) {
      components.models = node.data.models;
    } else if (isParameterNode(node.data)) {
      if (node.data.paramType === 'temperature') {
        components.temperature = node.data.value;
      }
    } else if (isPostProcessingNode(node.data)) {
      components.postProcessing.push(node.data.operation);
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
    warnings.push('Multiple text input nodes detected - only the first will be used');
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
