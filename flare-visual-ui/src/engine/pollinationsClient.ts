/**
 * Pollinations.ai chat completion client with retry logic.
 * Ported from backend src/services/executeModelQuery.js, with the
 * no-retry-on-4xx check fixed to inspect the response status directly.
 */
import axios from 'axios';
import { apiConfig, modelDefaults, errorMessages } from './config';
import { getApiKey } from './apiKey';

export interface ModelQueryOptions {
  modelName?: string;
  temp?: number;
  prompt: string;
  seed?: number | null;
}

/** Error that must not be retried (4xx other than 429). */
class NonRetryableError extends Error {}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeModelQuery({
  modelName,
  temp,
  prompt,
  seed = null,
}: ModelQueryOptions): Promise<string> {
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    throw new Error(errorMessages.emptyPrompt);
  }

  const model = modelName || apiConfig.pollinations.defaultModel;
  const temperature = typeof temp === 'number' ? temp : modelDefaults.temperature;

  const requestBody: Record<string, unknown> = {
    model,
    messages: [
      {
        role: 'user',
        content: prompt.trim(),
      },
    ],
    referrer: apiConfig.pollinations.referrer,
    // Quirk preserved from the backend: 'openai' rejects custom temperature
    ...(model === 'openai' ? {} : { temperature }),
    ...(seed ? { seed } : {}),
  };

  const headers = {
    ...apiConfig.headers,
    Authorization: `Bearer ${getApiKey()}`,
  };

  const url = `${apiConfig.pollinations.baseUrl}${apiConfig.pollinations.chatEndpoint}`;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= apiConfig.retry.maxAttempts; attempt++) {
    try {
      console.log(`Querying ${model} (attempt ${attempt}/${apiConfig.retry.maxAttempts})`);

      const response = await axios.post(url, requestBody, {
        headers,
        timeout: apiConfig.pollinations.timeout,
        // Never throw on HTTP status — we inspect it directly so the
        // no-retry-on-4xx logic actually works (backend bug fixed here).
        validateStatus: () => true,
      });

      if (response.status >= 400) {
        const errorData = response.data;
        if (response.status === 429) {
          // Rate limit — retryable
          throw new Error(errorMessages.rateLimitError);
        } else if (response.status < 500) {
          // Client error — do NOT retry
          throw new NonRetryableError(
            errorData?.error?.message || `API error: ${response.status}`
          );
        } else {
          // Server error — retryable
          throw new Error(`Server error: ${response.status}`);
        }
      }

      // Validate response structure
      const content = response.data?.choices?.[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        console.warn('Unexpected API response structure:', JSON.stringify(response.data));
        throw new Error(errorMessages.invalidResponse);
      }

      const result = content.trim();
      if (!result) {
        throw new Error('Model returned empty response');
      }

      console.log(`Successfully got response from ${model} (${result.length} chars)`);
      return result;
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Error querying ${model} (attempt ${attempt}):`, lastError.message);

      // Don't retry on client errors (4xx) except rate limit
      if (error instanceof NonRetryableError) {
        break;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < apiConfig.retry.maxAttempts) {
        const backoff = Math.min(
          apiConfig.retry.baseDelay * Math.pow(apiConfig.retry.backoffFactor, attempt - 1),
          apiConfig.retry.maxDelay
        );
        console.log(`Retrying in ${backoff}ms...`);
        await delay(backoff);
      }
    }
  }

  // If we get here, all attempts failed
  const errorMessage = `Failed to query model ${model} after ${apiConfig.retry.maxAttempts} attempts. Last error: ${lastError?.message || 'Unknown error'}`;
  console.error(errorMessage);
  throw new Error(errorMessage);
}
