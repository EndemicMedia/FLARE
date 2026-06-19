/**
 * Query multiple models in parallel with error recovery.
 */
import type { FlareContext } from '../config/context.js';
import { executeModelQuery } from './executeQuery.js';

export interface ModelQueryResult {
  model: string;
  response?: string;
  error?: string;
  success: boolean;
}

export async function queryMultipleModels(
  models: string[],
  prompt: string,
  temperature: number,
  context: FlareContext
): Promise<ModelQueryResult[]> {
  const results = await Promise.allSettled(
    models.map(async (model) => {
      const response = await executeModelQuery(
        { modelName: model, temp: temperature, prompt },
        context
      );
      return { model, response, success: true } as ModelQueryResult;
    })
  );

  return results.map((result, i) => {
    if (result.status === 'fulfilled') return result.value;
    const error = result.reason instanceof Error ? result.reason.message : String(result.reason);
    return { model: models[i], error, success: false };
  });
}
