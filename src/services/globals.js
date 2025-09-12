// START: services configuration
/**
 * Services configuration and constants
 * API endpoints, retry policies, timeout settings
 */

export const apiConfig = {
  pollinations: {
    baseUrl: 'https://text.pollinations.ai',
    openaiEndpoint: '/openai',
    defaultModel: 'openai',
    referrer: 'endemicmedia.github.io',
    apiKey: process.env.POLLINATIONS_API_KEY || 'Ak59D5TL82X6feti',
    timeout: 30000, // 30 seconds
  },
  
  retry: {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffFactor: 2
  },
  
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'FLARE/2.0.0 (github.com/your-org/FLARE)',
  }
};

export const modelDefaults = {
  temperature: 0.7,
  maxTokens: 2048,
  seed: null
};

export const postProcessingConfig = {
  voting: {
    prompt: `From the following responses, select and return only the text of the best response, without any commentary or explanation of your choice.\n\nResponses:\n`,
    temperature: 0.3
  },
  
  summarization: {
    prompt: `Please provide a concise summary that combines and consolidates the following responses into a single, coherent response:\n\n`,
    temperature: 0.5
  },
  
  combination: {
    separator: '\n\n---\n\n',
    header: 'Combined responses from multiple models:'
  }
};

export const errorMessages = {
  noModels: 'At least one model must be specified',
  emptyPrompt: 'Prompt cannot be empty',
  apiKeyMissing: 'API key is required but not provided',
  networkError: 'Network error while communicating with API',
  invalidResponse: 'Received invalid response from API',
  timeoutError: 'Request timed out',
  rateLimitError: 'Rate limit exceeded, please try again later'
};
// END: services configuration