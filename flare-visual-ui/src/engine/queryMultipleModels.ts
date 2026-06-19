/**
 * Query multiple models in parallel with error recovery.
 * Ported from backend src/services/queryMultipleModels.js.
 */
import { executeModelQuery } from './pollinationsClient';
import { errorMessages } from './config';

export interface ModelQueryResult {
  model: string;
  response?: string;
  error?: string;
  success: boolean;
}

/**
 * Query all models in parallel. Returns one result per model with a success
 * flag. Throws only when ALL models fail (aggregate error message).
 */
export async function queryMultipleModels(
  models: string[],
  prompt: string,
  temperature?: number,
  seed: number | null = null
): Promise<ModelQueryResult[]> {
  if (!Array.isArray(models) || models.length === 0) {
    throw new Error(errorMessages.noModels);
  }

  console.log(`Querying ${models.length} model(s): ${models.join(', ')}`);

  const settled = await Promise.allSettled(
    models.map((model) =>
      executeModelQuery({ modelName: model, temp: temperature, prompt, seed })
    )
  );

  const results: ModelQueryResult[] = settled.map((outcome, i) => {
    const model = models[i];
    if (outcome.status === 'fulfilled') {
      return { model, response: outcome.value, success: true };
    }
    const message =
      outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
    console.error(`Model ${model} failed:`, message);
    return { model, error: message, success: false };
  });

  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  if (failed.length > 0) {
    console.warn(
      `${failed.length} model(s) failed:`,
      failed.map((f) => `${f.model}: ${f.error}`)
    );
  }

  if (successful.length === 0) {
    throw new Error(
      `All models failed. Errors: ${failed.map((f) => `${f.model}: ${f.error}`).join('; ')}`
    );
  }

  console.log(`${successful.length}/${models.length} model(s) succeeded`);
  return results;
}
