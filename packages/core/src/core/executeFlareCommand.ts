/**
 * Main FLARE execution orchestrator.
 * parse → query models → post-process → return result.
 */
import type { FlareContext } from '../config/context.js';
import type { ModelQueryResult } from '../models/queryMultiple.js';
import { parseFlareCommand, validateParsedCommand } from '../parser/index.js';
import { queryMultipleModels } from '../models/queryMultiple.js';
import { applyPostProcessing } from '../postProcessing/index.js';

export interface FlareExecutionResult {
  result: string;
  modelResponses: ModelQueryResult[];
}

/**
 * Execute a FLARE command string end-to-end.
 *
 * Example:
 * ```ts
 * const ctx = createContext({ apiKey: 'sk_...' });
 * const { result } = await executeFlareCommand('{ flare model:mistral vote `Explain AI` }', ctx);
 * ```
 */
export async function executeFlareCommand(
  command: string,
  context: FlareContext
): Promise<FlareExecutionResult> {
  const parsed = parseFlareCommand(command);
  validateParsedCommand(parsed);

  const modelResponses = await queryMultipleModels(
    parsed.model,
    parsed.command,
    parsed.temp,
    context
  );

  const successful = modelResponses.filter((r) => r.success);
  if (successful.length === 0) {
    const errors = modelResponses.map((r) => `${r.model}: ${r.error}`).join('; ');
    throw new Error(`All models failed. Errors: ${errors}`);
  }

  const result = await applyPostProcessing(successful, parsed.postProcessing, parsed, context);

  return { result, modelResponses };
}
