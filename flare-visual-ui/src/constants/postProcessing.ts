/**
 * Post-processing operations available in FLARE
 * Based on parser globals configuration
 */

export interface PostProcessingOperation {
  id: string;
  name: string;
  description: string;
  requiresMultipleModels: boolean;
  icon: string;
  color: string;
}

export const POST_PROCESSING_OPERATIONS: PostProcessingOperation[] = [
  {
    id: 'sum',
    name: 'Summarize',
    description: 'Summarize multiple responses into one coherent response',
    requiresMultipleModels: false,
    icon: '📝',
    color: '#3498db'
  },
  {
    id: 'vote',
    name: 'Vote',
    description: 'Select and return the best response from multiple models',
    requiresMultipleModels: true,
    icon: '🗳️',
    color: '#e74c3c'
  },
  {
    id: 'comb',
    name: 'Combine',
    description: 'Combine all responses with separators',
    requiresMultipleModels: true,
    icon: '🔗',
    color: '#2ecc71'
  },
  {
    id: 'diff',
    name: 'Difference',
    description: 'Compare and analyze differences between responses',
    requiresMultipleModels: true,
    icon: '⚖️',
    color: '#f39c12'
  },
  {
    id: 'exp',
    name: 'Expand',
    description: 'Expand on the response with additional detail',
    requiresMultipleModels: false,
    icon: '🔍',
    color: '#9b59b6'
  },
  {
    id: 'filter',
    name: 'Filter',
    description: 'Filter and keep only high-quality responses',
    requiresMultipleModels: true,
    icon: '🔬',
    color: '#1abc9c'
  }
];

export const getOperationById = (id: string): PostProcessingOperation | undefined => {
  return POST_PROCESSING_OPERATIONS.find(op => op.id === id);
};

export const getOperationColor = (id: string): string => {
  const operation = getOperationById(id);
  return operation?.color || '#95a5a6';
};

export const operationRequiresMultipleModels = (id: string): boolean => {
  const operation = getOperationById(id);
  return operation?.requiresMultipleModels ?? false;
};
