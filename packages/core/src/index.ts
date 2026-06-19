// Types
export type { ParsedFlareCommand, PostProcessingCommand } from './types/index.js';
export type { HttpClient, HttpResponse, RequestOptions } from './transport/types.js';
export type { FlareContext } from './config/context.js';
export type { FlareExecutionResult } from './core/executeFlareCommand.js';
export type { ModelQueryResult, ModelQueryOptions } from './models/index.js';

// Parser
export {
  parseFlareCommand,
  validateParsedCommand,
  extractFlareCommands,
  extractAndParseFlareCommands,
  countFlareCommands,
  hasFlareCommands,
  patterns,
  defaults,
  postProcessingCommands,
  validation,
} from './parser/index.js';

// Transport
export { FetchHttpClient } from './transport/index.js';

// Config
export { apiConfig, modelDefaults, postProcessingConfig, errorMessages } from './config/defaults.js';
export { createContext } from './config/context.js';

// Models
export { executeModelQuery } from './models/executeQuery.js';
export { queryMultipleModels } from './models/queryMultiple.js';

// Post-Processing
export {
  applyPostProcessing,
  applyVoting,
  applySummarization,
  applyCombination,
  applyDifference,
  applyExpansion,
  applyFiltering,
  calculateSimilarity,
} from './postProcessing/index.js';

// Core
export { executeFlareCommand } from './core/index.js';
