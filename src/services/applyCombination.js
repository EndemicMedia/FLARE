// START: applyCombination function
/**
 * Apply combination post-processing to combine responses
 * Simply concatenates all responses with separators
 */
import { postProcessingConfig } from './globals.js';

export async function applyCombination(responses, parsedCommand = {}) {
  const separator = postProcessingConfig.combination.separator;
  const header = postProcessingConfig.combination.header;
  
  const combined = responses.length > 1 
    ? `${header}\n\n${responses.join(separator)}`
    : responses[0];
  
  console.log(`🔗 Combined ${responses.length} response(s)`);
  return combined;
}
// END: applyCombination function