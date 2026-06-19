/**
 * Node Type Definitions
 *
 * Defines all node types for the FLARE visual workflow builder.
 * Compatible with ReactFlow and maps to FLARE language semantics.
 */

import type { Node, Edge } from 'reactflow';

/**
 * Available node types in the workflow
 */
export type NodeType =
  | 'textInput'
  | 'modelQuery'
  | 'parameter'
  | 'postProcessing'
  | 'output'
  | 'imageGeneration'
  | 'flareCommand';

/**
 * Node execution status
 */
export type NodeStatus = 'idle' | 'loading' | 'running' | 'success' | 'completed' | 'error';

/**
 * Base properties shared by all node data types
 */
export interface BaseNodeData {
  status?: NodeStatus;
  error?: string;
}

/**
 * Text Input Node
 * Represents the prompt/query input for FLARE commands
 */
export interface TextInputNodeData extends BaseNodeData {
  text: string;
  placeholder?: string;
}

/**
 * Model Query Node
 * Represents single model selection and execution
 */
export interface ModelQueryNodeData extends BaseNodeData {
  model?: string;           // Single model (new architecture)
  models: string[];         // Array for backwards compatibility
  temperature?: number;
  maxTokens?: number;
  seed?: number | null;
  topP?: number;
  result?: string;          // Single result from the model
  results?: string[];       // Array for backwards compatibility
}

/**
 * Parameter Node
 * Represents FLARE parameters like temperature
 */
export interface ParameterNodeData extends BaseNodeData {
  paramType: 'temperature';
  value: number;
  min: number;
  max: number;
}

/**
 * Post-Processing Node
 * Represents operations like sum, vote, comb, diff, exp, filter
 * Supports multiple dynamic inputs
 */
export interface PostProcessingNodeData extends BaseNodeData {
  operation: 'sum' | 'vote' | 'comb' | 'diff' | 'exp' | 'filter';
  model?: string; // Optional model for post-processing (e.g., vote_model)
  inputCount?: number; // Number of input handles (default: 2)
  inputs?: string[]; // Array of input values
  result?: string;
}

/**
 * Output Node
 * Displays final results from workflow execution
 */
export interface OutputNodeData extends BaseNodeData {
  displayMode: 'text' | 'json' | 'markdown';
  content: string | null;
}

/**
 * Image Generation Node
 * Represents image generation using the Pollinations API
 */
export interface ImageGenerationNodeData extends BaseNodeData {
  prompt?: string;
  width?: number;
  height?: number;
  model?: string;
  seed?: number | null;
  enhance?: boolean;
  nologo?: boolean;
  imageUrl?: string;
}

/**
 * Flare Command Node
 * Represents a nested FLARE workflow within the main graph
 */
export interface FlareCommandNodeData extends BaseNodeData {
  subGraph: {
    nodes: Node[];
    edges: Edge[];
  };
  compiled?: string;
  result?: string;
}

/**
 * Union type for all possible node data types
 */
export type NodeData =
  | TextInputNodeData
  | ModelQueryNodeData
  | ParameterNodeData
  | PostProcessingNodeData
  | OutputNodeData
  | ImageGenerationNodeData
  | FlareCommandNodeData;

/**
 * Complete node structure for the workflow
 * Based on ReactFlow's Node interface so it inherits position/selected/etc.
 */
export type FlareNode = Node<NodeData> & { type: NodeType };

/**
 * Type guard for TextInputNodeData
 */
export function isTextInputNode(data: NodeData): data is TextInputNodeData {
  return 'text' in data;
}

/**
 * Type guard for ModelQueryNodeData
 */
export function isModelQueryNode(data: NodeData): data is ModelQueryNodeData {
  return 'models' in data;
}

/**
 * Type guard for ParameterNodeData
 */
export function isParameterNode(data: NodeData): data is ParameterNodeData {
  return 'paramType' in data;
}

/**
 * Type guard for PostProcessingNodeData
 */
export function isPostProcessingNode(data: NodeData): data is PostProcessingNodeData {
  return 'operation' in data;
}

/**
 * Type guard for OutputNodeData
 */
export function isOutputNode(data: NodeData): data is OutputNodeData {
  return 'displayMode' in data;
}
