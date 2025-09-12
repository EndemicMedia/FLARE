// START: applySummarization function
/**
 * Apply summarization post-processing to multiple responses
 * Combines and summarizes responses using a specified model
 */
import { executeModelQuery } from './executeModelQuery.js';
import { postProcessingConfig } from './globals.js';

export async function applySummarization(responses, parsedCommand = {}) {
  if (responses.length === 1) {
    return responses[0];
  }

  const combinedText = responses.join('\n\n---\n\n');
  const prompt = postProcessingConfig.summarization.prompt + combinedText;
  
  // Use specific model if provided (e.g., sum:openai)
  const summaryModel = parsedCommand.sum_model || parsedCommand.model?.[0] || 'openai';
  
  try {
    const summary = await executeModelQuery({
      modelName: summaryModel,
      temp: postProcessingConfig.summarization.temperature,
      prompt: prompt
    });
    
    console.log(`📝 Summarization completed using ${summaryModel}`);
    return summary;
    
  } catch (error) {
    console.error('Summarization failed, returning combined text:', error.message);
    return combinedText;
  }
}
// END: applySummarization function