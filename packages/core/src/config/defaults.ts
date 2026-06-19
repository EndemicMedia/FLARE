/**
 * Shared configuration defaults for the FLARE engine.
 */

export const apiConfig = {
  pollinations: {
    baseUrl: 'https://gen.pollinations.ai',
    chatEndpoint: '/v1/chat/completions',
    imageEndpoint: '/image',
    defaultModel: 'openai',
    timeout: 60000,
  },
  retry: {
    maxAttempts: 3,
    baseDelay: 2000,
    maxDelay: 10000,
    backoffFactor: 2,
  },
} as const;

export const modelDefaults = {
  temperature: 0.7,
  maxTokens: 2048,
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
  networkError: 'Network error while communicating with API',
  invalidResponse: 'Received invalid response from API',
  rateLimitError: 'Rate limit exceeded, please try again later',
} as const;
