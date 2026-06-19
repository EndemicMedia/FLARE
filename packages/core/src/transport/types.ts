/**
 * Transport layer types — HTTP client abstraction for isomorphic code.
 */

export interface HttpResponse {
  status: number;
  data: unknown;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * Abstract HTTP client interface — implemented by platform-specific adapters.
 */
export interface HttpClient {
  post(url: string, body: Record<string, unknown>, options?: RequestOptions): Promise<HttpResponse>;
}
