// START: applyVoting function
/**
 * Apply voting post-processing to select best response
 * Uses a model to vote on the best response from multiple options
 */
import { executeModelQuery } from './executeModelQuery.js';
import { postProcessingConfig } from './globals.js';

export async function applyVoting(responses, parsedCommand = {}) {
  if (responses.length === 1) {
    return responses[0];
  }

  const votingPrompt = postProcessingConfig.voting.prompt + 
    responses.map((r, i) => `Response ${i + 1}:\n${r}`).join('\n\n---\n\n');
  
  // Use specific model if provided (e.g., vote:openai)
  const votingModel = parsedCommand.vote_model || parsedCommand.model?.[0] || 'openai';
  
  try {
    const selectedResponse = await executeModelQuery({
      modelName: votingModel,
      temp: postProcessingConfig.voting.temperature,
      prompt: votingPrompt
    });
    
    console.log(`🗳️ Voting completed using ${votingModel}`);
    return selectedResponse;
    
  } catch (error) {
    console.error('Voting failed, returning first response:', error.message);
    return responses[0];
  }
}
// END: applyVoting function