/**
 * FLARE-to-Graph Parser
 * Converts FLARE command syntax into visual workflow graph
 * Uses backend parser API to parse FLARE commands correctly
 */

import type { FlareNode } from '../types/nodes';
import type { FlareEdge } from '../types/edges';
import type { ParsedFlareCommand } from '../types/backend';
import { computeLayout } from './layoutAlgorithm';

export interface ParseResult {
  success: boolean;
  nodes: FlareNode[];
  edges: FlareEdge[];
  error?: string;
}

/**
 * Parses a FLARE command and converts it to a workflow graph
 * Uses the backend API for parsing to ensure consistency
 */
export async function parseFlareToGraph(
  flareCommand: string,
  backendUrl = 'http://localhost:8080'
): Promise<ParseResult> {
  try {
    // Call backend parser (note: this endpoint needs to be added to backend)
    const parsed = await parseFlareCommand(flareCommand, backendUrl);

    if (!parsed) {
      return {
        success: false,
        nodes: [],
        edges: [],
        error: 'Failed to parse FLARE command'
      };
    }

    // Convert parsed command to graph
    const { nodes, edges } = buildGraphFromParsed(parsed);

    // Apply layout algorithm
    const layoutedNodes = computeLayout(nodes, edges);

    return {
      success: true,
      nodes: layoutedNodes,
      edges
    };
  } catch (error) {
    return {
      success: false,
      nodes: [],
      edges: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Calls backend parser API to parse FLARE command
 * Note: This endpoint needs to be added to the backend server
 */
async function parseFlareCommand(
  command: string,
  _backendUrl: string
): Promise<ParsedFlareCommand | null> {
  try {
    // For now, use client-side basic parsing
    // TODO: Add POST /parse-flare endpoint to backend
    return parseFlareLocally(command);
  } catch (error) {
    console.error('Error parsing FLARE command:', error);
    return null;
  }
}

/**
 * Local FLARE parser (basic implementation)
 * Should be replaced with backend API call for production
 */
function parseFlareLocally(command: string): ParsedFlareCommand | null {
  // Basic regex pattern matching FLARE syntax
  const pattern = /\{\s*flare\s+([^`]+)\s*`([^`]+)`\s*\}/;
  const match = command.match(pattern);

  if (!match) {
    return null;
  }

  const params = match[1].trim();
  const prompt = match[2];

  const parsed: ParsedFlareCommand = {
    prompt,
    model: [],
    temperature: 1.0,
    postProcessing: []
  };

  // Parse parameters
  const paramParts = params.split(/\s+/);

  paramParts.forEach(part => {
    if (part.startsWith('model:')) {
      const models = part.substring(6).split(',');
      parsed.model = models;
    } else if (part.startsWith('temp:')) {
      parsed.temperature = parseFloat(part.substring(5));
    } else if (['sum', 'vote', 'comb', 'diff', 'exp', 'filter'].includes(part)) {
      parsed.postProcessing.push(part);
    }
  });

  return parsed;
}

/**
 * Builds workflow graph from parsed FLARE command
 */
function buildGraphFromParsed(parsed: ParsedFlareCommand): {
  nodes: FlareNode[];
  edges: FlareEdge[];
} {
  const nodes: FlareNode[] = [];
  const edges: FlareEdge[] = [];

  let nodeIdCounter = 1;
  const createNodeId = () => `node-${nodeIdCounter++}`;

  // Create text input node
  const textInputId = createNodeId();
  nodes.push({
    id: textInputId,
    type: 'textInput',
    position: { x: 0, y: 0 },
    data: {
      text: parsed.prompt,
      placeholder: 'Enter your prompt here...'
    }
  });

  let lastNodeId = textInputId;

  // Create parameter node for temperature (if not default)
  if (parsed.temperature !== undefined && parsed.temperature !== 1.0) {
    const tempNodeId = createNodeId();
    nodes.push({
      id: tempNodeId,
      type: 'parameter',
      position: { x: 0, y: 0 },
      data: {
        paramType: 'temperature',
        value: parsed.temperature,
        min: 0.0,
        max: 2.0
      }
    });

    edges.push({
      id: `edge-${lastNodeId}-${tempNodeId}`,
      source: lastNodeId,
      target: tempNodeId,
      type: 'default'
    });

    lastNodeId = tempNodeId;
  }

  // Create model query node
  const modelNodeId = createNodeId();
  nodes.push({
    id: modelNodeId,
    type: 'modelQuery',
    position: { x: 0, y: 0 },
    data: {
      models: parsed.model || []
    }
  });

  edges.push({
    id: `edge-${lastNodeId}-${modelNodeId}`,
    source: lastNodeId,
    target: modelNodeId,
    type: 'default'
  });

  lastNodeId = modelNodeId;

  // Create post-processing nodes
  if (parsed.postProcessing && parsed.postProcessing.length > 0) {
    parsed.postProcessing.forEach((operation: string) => {
      const ppNodeId = createNodeId();
      nodes.push({
        id: ppNodeId,
        type: 'postProcessing',
        position: { x: 0, y: 0 },
        data: {
          operation: operation as 'sum' | 'vote' | 'comb' | 'diff' | 'exp' | 'filter'
        }
      });

      edges.push({
        id: `edge-${lastNodeId}-${ppNodeId}`,
        source: lastNodeId,
        target: ppNodeId,
        type: 'default'
      });

      lastNodeId = ppNodeId;
    });
  }

  // Create output node
  const outputNodeId = createNodeId();
  nodes.push({
    id: outputNodeId,
    type: 'output',
    position: { x: 0, y: 0 },
    data: {
      displayMode: 'text',
      content: null
    }
  });

  edges.push({
    id: `edge-${lastNodeId}-${outputNodeId}`,
    source: lastNodeId,
    target: outputNodeId,
    type: 'default'
  });

  return { nodes, edges };
}

/**
 * Validates FLARE command syntax
 */
export function validateFlareCommand(command: string): boolean {
  const pattern = /\{\s*flare\s+([^`]+)\s*`([^`]+)`\s*\}/;
  return pattern.test(command);
}
