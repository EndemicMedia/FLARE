/**
 * FLARE-to-Graph Parser
 * Converts FLARE command syntax into visual workflow graph
 * Uses backend parser API to parse FLARE commands correctly
 */

import type { FlareNode } from '../types/nodes';
import type { FlareEdge } from '../types/edges';
import type { ParsedFlareCommand } from '../types/backend';
import type { ParsedFlareCommand } from '../types/backend';
import { getLayoutedElements } from './autoLayout';

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

    // Apply layout algorithm using Dagre
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);

    return {
      success: true,
      nodes: layoutedNodes,
      edges: layoutedEdges
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

  // 1. Create text input node
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

  const promptSourceId = textInputId;

  // 2. Create model query nodes (one per model)
  const modelNodeIds: string[] = [];
  const models = parsed.model || ['mistral']; // Default to mistral if none

  models.forEach((modelId) => {
    const mId = createNodeId();
    nodes.push({
      id: mId,
      type: 'modelQuery',
      position: { x: 0, y: 0 },
      data: {
        model: modelId,
        models: [modelId],
        temperature: parsed.temperature || 0.7
      }
    });

    edges.push({
      id: `edge-${promptSourceId}-${mId}`,
      source: promptSourceId,
      target: mId,
      targetHandle: 'input'
    });

    modelNodeIds.push(mId);
  });

  let lastNodeIds = modelNodeIds;

  // 3. Create post-processing nodes
  if (parsed.postProcessing && parsed.postProcessing.length > 0) {
    parsed.postProcessing.forEach((operation: string, idx: number) => {
      const ppNodeId = createNodeId();
      nodes.push({
        id: ppNodeId,
        type: 'postProcessing',
        position: { x: 0, y: 0 },
        data: {
          operation: operation as 'sum' | 'vote' | 'comb' | 'diff' | 'exp' | 'filter',
          inputCount: idx === 0 ? Math.max(2, modelNodeIds.length) : 1
        }
      });

      if (idx === 0) {
        // Connect all models to the first post-processing node
        modelNodeIds.forEach((mId, mIdx) => {
          edges.push({
            id: `edge-${mId}-${ppNodeId}-${mIdx}`,
            source: mId,
            target: ppNodeId,
            targetHandle: `input-${mIdx}`
          });
        });
      } else {
        // Connect previous post-processing node to this one
        const prevId = lastNodeIds[0];
        edges.push({
          id: `edge-${prevId}-${ppNodeId}`,
          source: prevId,
          target: ppNodeId,
          targetHandle: 'input-0'
        });
      }

      lastNodeIds = [ppNodeId];
    });
  }

  // 4. Create output node
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

  // Connect the last step(s) to the output
  lastNodeIds.forEach((sourceId, idx) => {
    edges.push({
      id: `edge-${sourceId}-${outputNodeId}-${idx}`,
      source: sourceId,
      target: outputNodeId,
      targetHandle: 'input'
    });
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
