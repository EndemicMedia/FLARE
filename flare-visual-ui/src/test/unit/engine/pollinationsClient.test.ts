/**
 * Unit tests for engine/pollinationsClient.
 *
 * fetch is mocked; retry backoff uses fake timers so no test actually sleeps.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeModelQuery } from '../../../engine/pollinationsClient';
import { apiConfig } from '../../../engine/config';

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function successResponse(content: string) {
  return jsonResponse(200, { choices: [{ message: { content } }] });
}

describe('executeModelQuery', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);
    vi.useFakeTimers();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns the trimmed response content on success', async () => {
    mockFetch.mockResolvedValueOnce(successResponse('  Hello world  '));

    const result = await executeModelQuery({ modelName: 'mistral', temp: 0.8, prompt: 'Hi' });

    expect(result).toBe('Hello world');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain(
      `${apiConfig.pollinations.baseUrl}${apiConfig.pollinations.chatEndpoint}`
    );
    expect(url).toContain('key=');
    const body = JSON.parse(options.body);
    expect(body.model).toBe('mistral');
    expect(body.temperature).toBe(0.8);
    expect(body.messages).toEqual([{ role: 'user', content: 'Hi' }]);
  });

  it('retries after a 429 rate limit and succeeds on the next attempt', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(429, {}))
      .mockResolvedValueOnce(successResponse('ok after retry'));

    const promise = executeModelQuery({ modelName: 'mistral', prompt: 'Hi' });
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe('ok after retry');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('retries 5xx server errors and network failures', async () => {
    mockFetch
      .mockResolvedValueOnce(jsonResponse(503, {}))
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(successResponse('third time lucky'));

    const promise = executeModelQuery({ modelName: 'mistral', prompt: 'Hi' });
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe('third time lucky');
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('does NOT retry non-429 4xx errors (single call)', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(
      jsonResponse(400, { error: { message: 'Bad request' } })
    ));

    const promise = executeModelQuery({ modelName: 'mistral', prompt: 'Hi' });
    const expectation = expect(promise).rejects.toThrow(/Bad request/);
    await vi.runAllTimersAsync();
    await expectation;

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('throws after exhausting all attempts when the server keeps failing', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(jsonResponse(500, {})));

    const promise = executeModelQuery({ modelName: 'mistral', prompt: 'Hi' });
    const expectation = expect(promise).rejects.toThrow(
      new RegExp(`after ${apiConfig.retry.maxAttempts} attempts`)
    );
    await vi.runAllTimersAsync();
    await expectation;

    expect(mockFetch).toHaveBeenCalledTimes(apiConfig.retry.maxAttempts);
  });

  it('throws on malformed response structure', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(jsonResponse(200, { unexpected: 'shape' })));

    const promise = executeModelQuery({ modelName: 'mistral', prompt: 'Hi' });
    const expectation = expect(promise).rejects.toThrow(/invalid response/i);
    await vi.runAllTimersAsync();
    await expectation;
  });

  it('throws on empty response content', async () => {
    mockFetch.mockImplementation(() => Promise.resolve(successResponse('   ')));

    const promise = executeModelQuery({ modelName: 'mistral', prompt: 'Hi' });
    const expectation = expect(promise).rejects.toThrow(/empty response/i);
    await vi.runAllTimersAsync();
    await expectation;
  });

  it('omits temperature when modelName is "openai"', async () => {
    mockFetch.mockResolvedValueOnce(successResponse('openai reply'));

    await executeModelQuery({ modelName: 'openai', temp: 0.9, prompt: 'Hi' });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.model).toBe('openai');
    expect(body).not.toHaveProperty('temperature');
  });

  it('includes seed only when provided', async () => {
    mockFetch.mockResolvedValueOnce(successResponse('seeded'));
    await executeModelQuery({ modelName: 'mistral', prompt: 'Hi', seed: 42 });
    expect(JSON.parse(mockFetch.mock.calls[0][1].body).seed).toBe(42);

    mockFetch.mockResolvedValueOnce(successResponse('unseeded'));
    await executeModelQuery({ modelName: 'mistral', prompt: 'Hi' });
    expect(JSON.parse(mockFetch.mock.calls[1][1].body)).not.toHaveProperty('seed');
  });

  it('rejects an empty prompt without calling the API', async () => {
    await expect(executeModelQuery({ modelName: 'mistral', prompt: '   ' })).rejects.toThrow(
      /prompt cannot be empty/i
    );
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
