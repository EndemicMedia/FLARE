// START: applyPostProcessing function
/**
 * Apply post-processing commands to model results
 * Coordinates all post-processing operations
 */
import { applySummarization } from './applySummarization.js';
import { applyVoting } from './applyVoting.js';
import { applyCombination } from './applyCombination.js';
import { applyDifference } from './applyDifference.js';
import { applyExpansion } from './applyExpansion.js';
import { applyFiltering } from './applyFiltering.js';

export async function applyPostProcessing(modelResults, postProcessingCommands, parsedCommand = {}) {
  if (!Array.isArray(modelResults) || modelResults.length === 0) {
    throw new Error('No model results provided for post-processing');
  }

  if (!Array.isArray(postProcessingCommands) || postProcessingCommands.length === 0) {
    // No post-processing, return first successful result
    return modelResults[0]?.response || modelResults[0];
  }

  let currentResults = modelResults.map(r => r.response || r);
  console.log(`📋 Applying post-processing: ${postProcessingCommands.join(' → ')}`);

  // Apply each post-processing command in sequence
  for (const command of postProcessingCommands) {
    console.log(`🔄 Applying: ${command}`);
    
    try {
      switch (command) {
        case 'sum':
          currentResults = [await applySummarization(currentResults, parsedCommand)];
          break;
          
        case 'vote':
          currentResults = [await applyVoting(currentResults, parsedCommand)];
          break;
          
        case 'comb':
          currentResults = [await applyCombination(currentResults, parsedCommand)];
          break;
          
        case 'diff':
          currentResults = [await applyDifference(currentResults, parsedCommand)];
          break;
          
        case 'exp':
          currentResults = [await applyExpansion(currentResults, parsedCommand)];
          break;
          
        case 'filter':
          currentResults = await applyFiltering(currentResults, parsedCommand);
          break;
          
        default:
          console.warn(`Unknown post-processing command: ${command}`);
          break;
      }
      
      console.log(`✅ ${command} completed`);
      
    } catch (error) {
      console.error(`❌ Post-processing command '${command}' failed:`, error.message);
      // Continue with existing results rather than failing completely
    }
  }

  return Array.isArray(currentResults) ? currentResults[0] : currentResults;
}
// END: applyPostProcessing function