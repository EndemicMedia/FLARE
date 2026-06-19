/**
 * FlareContext — dependency injection container for the FLARE engine.
 * All I/O (HTTP, key resolution) is injected here.
 */
import type { HttpClient } from '../transport/types.js';
import { FetchHttpClient } from '../transport/fetchAdapter.js';

export interface FlareContext {
  httpClient: HttpClient;
  keyResolver: () => string;
}

/** Default shared key (intentionally public per project decision). */
const DEFAULT_KEY = 'sk_EnngsXCASw0kBiuso2zekJuhIxS1l0sB';

/**
 * Create a context using fetch adapter. Resolves API key from:
 * 1. Provided apiKey option
 * 2. process.env.POLLINATIONS_API_KEY (Node.js)
 * 3. Hardcoded default
 */
export function createContext(options?: { apiKey?: string; httpClient?: HttpClient }): FlareContext {
  return {
    httpClient: options?.httpClient ?? new FetchHttpClient(),
    keyResolver: () => {
      if (options?.apiKey) return options.apiKey;
      if (typeof process !== 'undefined' && process.env?.POLLINATIONS_API_KEY) {
        return process.env.POLLINATIONS_API_KEY;
      }
      return DEFAULT_KEY;
    },
  };
}
