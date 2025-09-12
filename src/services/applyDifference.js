// START: applyDifference function
/**
 * Apply difference post-processing to analyze differences between responses
 * Uses a model to highlight key differences between responses
 */
import { executeModelQuery } from './executeModelQuery.js';

export async function applyDifference(responses, parsedCommand = {}) {
  if (responses.length < 2) {
    return responses[0];
  }

  const diffPrompt = `Please analyze and highlight the key differences between these responses:\n\n` +
    responses.map((r, i) => `Response ${i + 1}:\n${r}`).join('\n\n---\n\n') +
    `\n\nProvide a summary that highlights what's different between these responses.`;
  
  const diffModel = parsedCommand.diff_model || parsedCommand.model?.[0] || 'openai';
  
  try {
    const differences = await executeModelQuery({
      modelName: diffModel,
      temp: 0.5,
      prompt: diffPrompt
    });
    
    console.log(`🔍 Difference analysis completed using ${diffModel}`);
    return differences;
    
  } catch (error) {
    console.error('Difference analysis failed, returning combined responses:', error.message);
    return responses.join('\n\n---\n\n');
  }
}
// END: applyDifference function