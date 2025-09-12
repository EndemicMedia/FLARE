// START: applyExpansion function
/**
 * Apply expansion post-processing to expand on responses
 * Uses a model to add additional details and context
 */
import { executeModelQuery } from './executeModelQuery.js';

export async function applyExpansion(responses, parsedCommand = {}) {
  const baseResponse = responses[0];
  
  if (responses.length === 1) {
    // Expand the single response
    const expansionPrompt = `Please expand on and provide additional details for the following response:\n\n${baseResponse}`;
    
    const expansionModel = parsedCommand.exp_model || parsedCommand.model?.[0] || 'openai';
    
    try {
      const expanded = await executeModelQuery({
        modelName: expansionModel,
        temp: 0.7,
        prompt: expansionPrompt
      });
      
      console.log(`📈 Response expansion completed using ${expansionModel}`);
      return expanded;
      
    } catch (error) {
      console.error('Expansion failed, returning original response:', error.message);
      return baseResponse;
    }
  } else {
    // Use additional responses to expand the first one
    const expansionPrompt = `Please expand on the first response using insights from the additional responses:\n\n` +
      `Base Response:\n${baseResponse}\n\n` +
      `Additional Context:\n${responses.slice(1).join('\n\n---\n\n')}`;
    
    const expansionModel = parsedCommand.exp_model || parsedCommand.model?.[0] || 'openai';
    
    try {
      const expanded = await executeModelQuery({
        modelName: expansionModel,
        temp: 0.7,
        prompt: expansionPrompt
      });
      
      console.log(`📈 Context-based expansion completed using ${expansionModel}`);
      return expanded;
      
    } catch (error) {
      console.error('Context-based expansion failed, returning base response:', error.message);
      return baseResponse;
    }
  }
}
// END: applyExpansion function