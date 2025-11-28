/**
 * Workflow State Type Definitions
 *
 * Defines the overall workflow state structure and execution status.
 */

import type { FlareNode } from './nodes';
import type { FlareEdge } from './edges';

/**
 * Overall execution state of the workflow
 */
export type ExecutionState = 'idle' | 'running' | 'completed' | 'error';

/**
 * Individual node execution status during workflow run
 */
export interface NodeExecutionStatus {
  status: 'idle' | 'queued' | 'loading' | 'completed' | 'error';
  result?: unknown;
  error?: string;
  timestamp: number;
}

/**
 * Complete workflow state
 */
export interface WorkflowState {
  nodes: FlareNode[];
  edges: FlareEdge[];
  selectedNodeId: string | null;
  executionState: ExecutionState;
  executionProgress: Record<string, NodeExecutionStatus>;
  compiledFlare: string | null;
}

/**
 * Workflow history for undo/redo functionality
 */
export interface WorkflowHistory {
  past: WorkflowState[];
  present: WorkflowState;
  future: WorkflowState[];
}

/**
 * Execution plan generated from the workflow graph
 */
export interface ExecutionPlan {
  stages: ExecutionStage[];
  totalNodes: number;
  estimatedDuration: number;
}

/**
 * A stage in the execution plan (nodes that can run in parallel)
 */
export interface ExecutionStage {
  nodeIds: string[];
  dependencies: string[];
  stageNumber: number;
}

/**
 * Validation result for the workflow
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  nodeId: string;
  message: string;
  type: 'missing_connection' | 'invalid_connection' | 'circular_dependency' | 'invalid_parameter';
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  nodeId: string;
  message: string;
  type: 'unused_node' | 'suboptimal_configuration';
}

/**
 * Workflow metadata for saving/loading
 */
export interface WorkflowMetadata {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  author?: string;
  tags?: string[];
}

/**
 * Complete serialized workflow for import/export
 */
export interface SerializedWorkflow {
  metadata: WorkflowMetadata;
  workflow: WorkflowState;
}
