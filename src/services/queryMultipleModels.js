// START: queryMultipleModels function
/**
 * Query multiple models in parallel and return results
 * Handles parallel execution with error recovery
 */
import { executeModelQuery } from './executeModelQuery.js';
import { errorMessages } from './globals.js';

export async function queryMultipleModels(models, prompt, temperature, seed = null) {
  if (!Array.isArray(models) || models.length === 0) {
    throw new Error(errorMessages.noModels);
  }

  console.log(`🚀 Querying ${models.length} model(s): ${models.join(', ')}`);
  
  // Execute all model queries in parallel
  const modelPromises = models.map(async (model) => {
    try {
      const response = await executeModelQuery({
        modelName: model,
        temp: temperature,
        prompt: prompt,
        seed: seed
      });
      return { model, response, success: true };
    } catch (error) {
      console.error(`❌ Model ${model} failed:`, error.message);
      return { model, error: error.message, success: false };
    }
  });

  const results = await Promise.all(modelPromises);
  
  // Separate successful and failed results
  const successful = results.filter(r => r.success).map(r => ({ model: r.model, response: r.response }));
  const failed = results.filter(r => !r.success).map(r => ({ model: r.model, error: r.error }));

  if (failed.length > 0) {
    console.warn(`⚠️ ${failed.length} model(s) failed:`, failed.map(f => `${f.model}: ${f.error}`));
  }

  if (successful.length === 0) {
    throw new Error(`All models failed. Errors: ${failed.map(f => `${f.model}: ${f.error}`).join('; ')}`);
  }

  console.log(`✅ ${successful.length}/${models.length} model(s) succeeded`);
  return successful;
}
// END: queryMultipleModels function