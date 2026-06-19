/**
 * Fetch-based HTTP client adapter (works in both browser and Node.js 18+).
 */
import type { HttpClient, HttpResponse, RequestOptions } from './types.js';

export class FetchHttpClient implements HttpClient {
  async post(url: string, body: Record<string, unknown>, options?: RequestOptions): Promise<HttpResponse> {
    const controller = new AbortController();
    const timeout = options?.timeout ?? 60000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers ?? {}),
        },
        body: JSON.stringify(body),
        signal: options?.signal ?? controller.signal,
      });

      const data = await response.json().catch(() => null);
      return { status: response.status, data };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
