/**
 * Edge Type Definitions
 *
 * Defines connections between nodes in the FLARE visual workflow.
 * Compatible with ReactFlow's Edge interface.
 */

/**
 * Edge structure connecting two nodes
 */
export interface FlareEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: 'default' | 'smoothstep' | 'straight' | 'step';
  animated?: boolean;
  label?: string;
}

/**
 * Handle types for connection validation
 * Defines what type of data flows through a connection
 */
export type HandleType =
  | 'text'         // Raw text/prompt output
  | 'prompt'       // Formatted prompt input
  | 'temperature'  // Temperature parameter connection
  | 'tempValue'    // Temperature value output
  | 'responses'    // Multiple model responses
  | 'result'       // Single result output
  | 'processed';   // Post-processed output

/**
 * Connection validation rules
 * Defines how handles can connect to each other
 */
export interface ConnectionRule {
  maxConnections: number;
  required: boolean;
  compatibleWith: HandleType[];
}

/**
 * Connection rules map for each handle type
 */
export const connectionRules: Record<HandleType, ConnectionRule> = {
  text: {
    maxConnections: -1, // Unlimited
    required: false,
    compatibleWith: ['prompt']
  },
  prompt: {
    maxConnections: 1,
    required: true,
    compatibleWith: ['text']
  },
  temperature: {
    maxConnections: 1,
    required: false,
    compatibleWith: ['tempValue']
  },
  tempValue: {
    maxConnections: -1, // Can connect to multiple model nodes
    required: false,
    compatibleWith: ['temperature']
  },
  responses: {
    maxConnections: -1,
    required: false,
    compatibleWith: ['processed', 'result']
  },
  result: {
    maxConnections: -1,
    required: false,
    compatibleWith: ['processed', 'result', 'responses']
  },
  processed: {
    maxConnections: 1,
    required: false,
    compatibleWith: ['responses', 'result']
  }
};

/**
 * Validates if two handle types can be connected
 */
export function canConnect(sourceType: HandleType, targetType: HandleType): boolean {
  const rule = connectionRules[sourceType];
  return rule.compatibleWith.includes(targetType);
}

/**
 * Checks if a handle has reached its maximum connections
 */
export function hasMaxConnections(
  handleId: string,
  handleType: HandleType,
  edges: FlareEdge[],
  isSource: boolean
): boolean {
  const rule = connectionRules[handleType];

  if (rule.maxConnections === -1) {
    return false; // Unlimited connections
  }

  const connectionCount = edges.filter(edge =>
    isSource ? edge.source === handleId : edge.target === handleId
  ).length;

  return connectionCount >= rule.maxConnections;
}
