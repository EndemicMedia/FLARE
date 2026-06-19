/**
 * Client-side FLARE engine configuration.
 * Ported from backend src/services/globals.js — Pollinations essentials only,
 * with browser-friendly retry settings.
 */

export const apiConfig = {
  pollinations: {
    baseUrl: 'https://gen.pollinations.ai',
    chatEndpoint: '/v1/chat/completions',
    modelsEndpoint: '/v1/models',
    imageEndpoint: '/image',
    defaultModel: 'openai',
    referrer: 'endemicmedia.github.io',
    timeout: 60000, // 60 seconds
  },

  retry: {
    maxAttempts: 3,
    baseDelay: 2000, // 2 seconds
    maxDelay: 10000, // 10 seconds
    backoffFactor: 2,
  },

  // Error detection patterns
  errors: {
    rateLimitCodes: [429],
    quotaCodes: [403],
    retryableCodes: [500, 502, 503, 504],
  },

  headers: {
    'Content-Type': 'application/json',
  },
} as const;

export const modelDefaults = {
  temperature: 0.7,
  maxTokens: 2048,
  seed: null,
} as const;

export const postProcessingConfig = {
  voting: {
    prompt: `From the following responses, select and return only the text of the best response, without any commentary or explanation of your choice.\n\nResponses:\n`,
    temperature: 0.3,
  },

  summarization: {
    prompt: `Please provide a concise summary that combines and consolidates the following responses into a single, coherent response:\n\n`,
    temperature: 0.5,
  },

  combination: {
    separator: '\n\n---\n\n',
    header: 'Combined responses from multiple models:',
  },
} as const;

export const errorMessages = {
  noModels: 'At least one model must be specified',
  emptyPrompt: 'Prompt cannot be empty',
  apiKeyMissing: 'API key is required but not provided',
  networkError: 'Network error while communicating with API',
  invalidResponse: 'Received invalid response from API',
  timeoutError: 'Request timed out',
  rateLimitError: 'Rate limit exceeded, please try again later',
} as const;
