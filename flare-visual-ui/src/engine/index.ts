/**
 * Client-side FLARE execution engine — public API.
 * Runs entirely in the browser; all AI calls go directly to Pollinations.ai.
 */
import { parseFlareCommand, validateParsedCommand } from './parseFlare';
import { queryMultipleModels, type ModelQueryResult } from './queryMultipleModels';
import { applyPostProcessing } from './postProcessing';

export interface FlareExecutionResult {
  /** Final result text after post-processing */
  result: string;
  /** Per-model raw results (including failures) */
  modelResponses: ModelQueryResult[];
}

/**
 * Execute a flat FLARE command string end-to-end:
 * parse → query models in parallel → apply post-processing.
 *
 * Example: executeFlareCommand('{ flare model:mistral,openai temp:0.7 vote `Explain quantum computing` }')
 */
export async function executeFlareCommand(command: string): Promise<FlareExecutionResult> {
  const parsed = parseFlareCommand(command);
  validateParsedCommand(parsed);

  const modelResponses = await queryMultipleModels(parsed.model, parsed.command, parsed.temp);

  const successful = modelResponses.filter((r) => r.success);
  const result = await applyPostProcessing(successful, parsed.postProcessing, parsed);

  return { result, modelResponses };
}

// Parser
export {
  parseFlareCommand,
  validateParsedCommand,
  postProcessingCommands,
  type ParsedFlareCommand,
  type PostProcessingCommand,
} from './parseFlare';

// Model querying
export { executeModelQuery, type ModelQueryOptions } from './pollinationsClient';
export { queryMultipleModels, type ModelQueryResult } from './queryMultipleModels';

// Post-processing
export {
  applyPostProcessing,
  applyVoting,
  applySummarization,
  applyCombination,
  applyDifference,
  applyExpansion,
  applyFiltering,
  calculateSimilarity,
  type PostProcessingContext,
} from './postProcessing';

// Image generation
export { buildImageUrl, type ImageGenerationOptions } from './imageGeneration';

// API key management
export {
  getApiKey,
  setApiKey,
  clearApiKey,
  isUsingDefaultKey,
  DEFAULT_API_KEY,
} from './apiKey';

// Configuration
export { apiConfig, modelDefaults, postProcessingConfig, errorMessages } from './config';
