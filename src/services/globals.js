// START: services configuration
/**
 * Services configuration and constants
 * API endpoints, retry policies, timeout settings
 */

export const apiConfig = {
  pollinations: {
    baseUrl: 'https://gen.pollinations.ai',
    chatEndpoint: '/v1/chat/completions',
    modelsEndpoint: '/v1/models',
    defaultModel: 'openai',
    referrer: 'endemicmedia.github.io',
    apiKey: process.env.POLLINATIONS_API_KEY || 'Ak59D5TL82X6feti',
    timeout: 60000, // 60 seconds
  },
  
  openRouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    timeout: 60000,
  },
  
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: process.env.GOOGLE_GEMINI_API_KEY,
    defaultModel: 'models/gemini-2.5-flash',
    timeout: 60000,
  },
  
  fallback: {
    enabled: process.env.AI_PROVIDER_FALLBACK !== 'false',
    priority: (process.env.AI_PROVIDER_PRIORITY || 'pollinations').split(',').map(p => p.trim()),
  },
  
  retry: {
    maxAttempts: 4,
    baseDelay: 10000, // 10 seconds
    maxDelay: 60000, // 60 seconds
    backoffFactor: 2
  },
  
  // Error detection patterns
  errors: {
    rateLimitCodes: [429],
    quotaCodes: [403],
    retryableCodes: [500, 502, 503, 504],
  },
  
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'FLARE/2.0.0 (github.com/EndemicMedia/FLARE)',
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