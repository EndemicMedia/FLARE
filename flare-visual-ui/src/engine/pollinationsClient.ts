/**
 * Pollinations.ai chat completion client with retry logic.
 * Uses native fetch to avoid axios header issues with CORS/CDN.
 */
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
    // Quirk preserved from the backend: 'openai' rejects custom temperature
    ...(model === 'openai' ? {} : { temperature }),
    ...(seed ? { seed } : {}),
  };

  const apiKey = getApiKey();
  const url = `${apiConfig.pollinations.baseUrl}${apiConfig.pollinations.chatEndpoint}?key=${encodeURIComponent(apiKey)}`;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= apiConfig.retry.maxAttempts; attempt++) {
    try {
      console.log(`Querying ${model} (attempt ${attempt}/${apiConfig.retry.maxAttempts})`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), apiConfig.pollinations.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 429) {
          throw new Error(errorMessages.rateLimitError);
        } else if (response.status < 500) {
          throw new NonRetryableError(
            errorData?.error?.message || `API error: ${response.status}`
          );
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const data = await response.json();

      // Validate response structure
      const content = data?.choices?.[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        console.warn('Unexpected API response structure:', JSON.stringify(data));
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
