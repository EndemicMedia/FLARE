// START: executeModelQuery function
/**
 * Execute single model query with retry logic and error handling
 * Handles API communication with Pollinations.ai
 */
import axios from 'axios';
import { apiConfig, modelDefaults, errorMessages } from './globals.js';

export async function executeModelQuery({ modelName, temp, prompt, seed = null }) {
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    throw new Error(errorMessages.emptyPrompt);
  }

  const model = modelName || apiConfig.pollinations.defaultModel;
  const temperature = typeof temp === 'number' ? temp : modelDefaults.temperature;
  
  const requestBody = {
    model: model,
    messages: [
      {
        role: 'user',
        content: prompt.trim()
      }
    ],
    ...(model === 'openai' ? {} : { temperature: temperature }), // Conditionally add temperature
    ...(seed && { seed: seed })
  };

  const headers = {
    ...apiConfig.headers,
    'Authorization': `Bearer ${apiConfig.pollinations.apiKey}`,
  };

  // Use the OpenAI-compatible endpoint
  const url = `${apiConfig.pollinations.baseUrl}${apiConfig.pollinations.openaiEndpoint}`;

  let lastError;
  
  for (let attempt = 1; attempt <= apiConfig.retry.maxAttempts; attempt++) {
    try {
      console.log(`Querying ${model} (attempt ${attempt}/${apiConfig.retry.maxAttempts})`);
      
      const response = await axios.post(url, requestBody, { 
        headers,
        timeout: apiConfig.pollinations.timeout,
        validateStatus: (status) => status < 500 // Don't throw on 4xx errors
      });

      if (response.status >= 400) {
        const errorData = response.data;
        if (response.status === 429) {
          throw new Error(errorMessages.rateLimitError);
        } else if (response.status >= 400 && response.status < 500) {
          throw new Error(errorData?.error?.message || `API error: ${response.status}`);
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      // Validate response structure
      if (!response.data?.choices?.[0]?.message?.content) {
        console.warn('Unexpected API response structure:', JSON.stringify(response.data, null, 2));
        throw new Error(errorMessages.invalidResponse);
      }

      const result = response.data.choices[0].message.content.trim();
      
      if (!result) {
        throw new Error('Model returned empty response');
      }

      console.log(`✓ Successfully got response from ${model} (${result.length} chars)`);
      return result;

    } catch (error) {
      lastError = error;
      
      // Log the specific error
      if (error.code === 'ECONNABORTED') {
        console.error(`⚠️ Timeout querying ${model} (attempt ${attempt}):`, errorMessages.timeoutError);
      } else if (error.response?.status === 429) {
        console.error(`⚠️ Rate limit hit for ${model} (attempt ${attempt}):`, errorMessages.rateLimitError);
      } else if (error.response) {
        console.error(`⚠️ API error for ${model} (attempt ${attempt}):`, {
          status: error.response.status,
          data: error.response.data
        });
      } else if (error.request) {
        console.error(`⚠️ Network error for ${model} (attempt ${attempt}):`, errorMessages.networkError);
      } else {
        console.error(`⚠️ Error querying ${model} (attempt ${attempt}):`, error.message);
      }

      // Don't retry on client errors (4xx) except rate limit
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        break;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < apiConfig.retry.maxAttempts) {
        const delay = Math.min(
          apiConfig.retry.baseDelay * Math.pow(apiConfig.retry.backoffFactor, attempt - 1),
          apiConfig.retry.maxDelay
        );
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // If we get here, all retries failed
  const errorMessage = `Failed to query model ${model} after ${apiConfig.retry.maxAttempts} attempts. Last error: ${lastError?.message || 'Unknown error'}`;
  console.error(`❌ ${errorMessage}`);
  throw new Error(errorMessage);
}
// END: executeModelQuery function