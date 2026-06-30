/**
 * Client-side FLARE execution engine — public API.
 * Delegates to @flare/core for parsing, querying, and post-processing.
 * Browser-specific features (BYOP keys, image generation) remain local.
 */
import {
  parseFlareCommand,
  validateParsedCommand,
  queryMultipleModels as coreQueryMultipleModels,
  applyPostProcessing as coreApplyPostProcessing,
  createContext,
  type FlareExecutionResult,
  type ModelQueryResult,
  type ParsedFlareCommand,
  type PostProcessingCommand,
  postProcessingCommands,
  calculateSimilarity,
  applyCombination,
  applyFiltering,
} from '@flare/core';
import { getApiKey } from './apiKey';

export type { FlareExecutionResult, ModelQueryResult, ParsedFlareCommand, PostProcessingCommand };

/**
 * Execute a flat FLARE command string end-to-end using the browser context.
 * Uses the BYOP key from localStorage/URL hash.
 */
export async function executeFlareCommand(command: string): Promise<FlareExecutionResult> {
  const parsed = parseFlareCommand(command);
  validateParsedCommand(parsed);

  const context = createContext({ apiKey: getApiKey() });

  const modelResponses = await coreQueryMultipleModels(
    parsed.model,
    parsed.command,
    parsed.temp,
    context
  );

  const successful = modelResponses.filter((r) => r.success);
  if (successful.length === 0) {
    const errors = modelResponses.map((r) => `${r.model}: ${r.error}`).join('; ');
    const has403 = errors.includes('403');
    if (has403 && isUsingDefaultKey()) {
      throw new Error(
        'API request blocked (403). The shared default key may be rate-limited or blocked for automated contexts. ' +
        'Open Settings (⚙) and enter your own Pollinations API key to continue.'
      );
    }
    throw new Error(`All models failed. Errors: ${errors}`);
  }

  const result = await coreApplyPostProcessing(successful, parsed.postProcessing, parsed, context);

  return { result, modelResponses };
}

// Re-export from @flare/core
export { parseFlareCommand, validateParsedCommand, postProcessingCommands };
export { calculateSimilarity, applyCombination, applyFiltering };

// Re-export browser-specific modules
export { buildImageUrl, type ImageGenerationOptions } from './imageGeneration';
export { getApiKey, setApiKey, clearApiKey, isUsingDefaultKey, DEFAULT_API_KEY } from './apiKey';
export { apiConfig, modelDefaults, postProcessingConfig, errorMessages } from '@flare/core';
