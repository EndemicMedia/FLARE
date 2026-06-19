/**
 * Execute a single model query against Pollinations.ai.
 * Uses the injected HttpClient from FlareContext.
 */
import type { FlareContext } from '../config/context.js';
import { apiConfig, modelDefaults, errorMessages } from '../config/defaults.js';

export interface ModelQueryOptions {
  modelName?: string;
  temp?: number;
  prompt: string;
  seed?: number | null;
}

class NonRetryableError extends Error {}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function executeModelQuery(
  opts: ModelQueryOptions,
  context: FlareContext
): Promise<string> {
  const { prompt, seed = null } = opts;

  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    throw new Error(errorMessages.emptyPrompt);
  }

  const model = opts.modelName || apiConfig.pollinations.defaultModel;
  const temperature = typeof opts.temp === 'number' ? opts.temp : modelDefaults.temperature;

  const requestBody: Record<string, unknown> = {
    model,
    messages: [{ role: 'user', content: prompt.trim() }],
    ...(model === 'openai' ? {} : { temperature }),
    ...(seed ? { seed } : {}),
  };

  const apiKey = context.keyResolver();
  const url = `${apiConfig.pollinations.baseUrl}${apiConfig.pollinations.chatEndpoint}?key=${encodeURIComponent(apiKey)}`;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= apiConfig.retry.maxAttempts; attempt++) {
    try {
      const response = await context.httpClient.post(url, requestBody, {
        timeout: apiConfig.pollinations.timeout,
      });

      if (response.status >= 400) {
        const errorData = response.data as Record<string, any> | null;
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

      const data = response.data as Record<string, any>;
      const content = data?.choices?.[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        throw new Error(errorMessages.invalidResponse);
      }

      const result = content.trim();
      if (!result) {
        throw new Error('Model returned empty response');
      }

      return result;
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (error instanceof NonRetryableError) break;

      if (attempt < apiConfig.retry.maxAttempts) {
        const backoff = Math.min(
          apiConfig.retry.baseDelay * Math.pow(apiConfig.retry.backoffFactor, attempt - 1),
          apiConfig.retry.maxDelay
        );
        await delay(backoff);
      }
    }
  }

  throw new Error(
    `Failed to query model ${model} after ${apiConfig.retry.maxAttempts} attempts. Last error: ${lastError?.message || 'Unknown error'}`
  );
}
