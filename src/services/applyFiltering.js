// START: applyFiltering function
/**
 * Apply filtering post-processing to remove low-quality responses
 * Filters out short and duplicate responses
 */
import { calculateSimilarity } from './calculateSimilarity.js';

export async function applyFiltering(responses, parsedCommand = {}) {
  if (responses.length === 1) {
    return responses;
  }

  // Simple filtering: remove very short or very similar responses
  const filtered = responses.filter((response, index) => {
    // Remove responses that are too short (less than 20 characters)
    if (response.length < 20) {
      console.log(`🚮 Filtered out response ${index + 1}: too short (${response.length} chars)`);
      return false;
    }
    
    // Remove responses that are very similar to earlier ones
    for (let i = 0; i < index; i++) {
      const similarity = calculateSimilarity(response, responses[i]);
      if (similarity > 0.9) {
        console.log(`🚮 Filtered out response ${index + 1}: too similar to response ${i + 1} (${Math.round(similarity * 100)}% similar)`);
        return false;
      }
    }
    
    return true;
  });

  if (filtered.length === 0) {
    console.warn('⚠️ All responses were filtered out, returning original responses');
    return responses;
  }

  console.log(`🔍 Filtering: kept ${filtered.length}/${responses.length} response(s)`);
  return filtered;
}
// END: applyFiltering function