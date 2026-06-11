/**
 * Unit tests for engine/pollinationsClient.
 *
 * axios is mocked; retry backoff uses fake timers so no test actually sleeps.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeModelQuery } from '../../../engine/pollinationsClient';
import { apiConfig } from '../../../engine/config';

const { mockPost } = vi.hoisted(() => ({ mockPost: vi.fn() }));

vi.mock('axios', () => ({
  default: { post: mockPost }
}));

function successResponse(content: string) {
  return {
    status: 200,
    data: { choices: [{ message: { content } }] }
  };
}

describe('executeModelQuery', () => {
  beforeEach(() => {
    mockPost.mockReset();
    vi.useFakeTimers();
    // Silence client logging
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns the trimmed response content on success', async () => {
    mockPost.mockResolvedValueOnce(successResponse('  Hello world  '));

    const result = await executeModelQuery({ modelName: 'mistral', temp: 0.8, prompt: 'Hi' });

    expect(result).toBe('Hello world');
    expect(mockPost).toHaveBeenCalledTimes(1);

    const [url, body, options] = mockPost.mock.calls[0];
    expect(url).toBe(
      `${apiConfig.pollinations.baseUrl}${apiConfig.pollinations.chatEndpoint}`
    );
    expect(body.model).toBe('mistral');
    expect(body.temperature).toBe(0.8);
    expect(body.messages).toEqual([{ role: 'user', content: 'Hi' }]);
    expect(options.headers.Authorization).toMatch(/^Bearer .+/);
  });

  it('retries after a 429 rate limit and succeeds on the next attempt', async () => {
    mockPost
      .mockResolvedValueOnce({ status: 429, data: {} })
      .mockResolvedValueOnce(successResponse('ok after retry'));

    const promise = executeModelQuery({ modelName: 'mistral', prompt: 'Hi' });
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe('ok after retry');
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it('retries 5xx server errors and network failures', async () => {
    mockPost
      .mockResolvedValueOnce({ status: 503, data: {} })
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(successResponse('third time lucky'));

    const promise = executeModelQuery({ modelName: 'mistral', prompt: 'Hi' });
    await vi.runAllTimersAsync();

    await expect(promise).resolves.toBe('third time lucky');
    expect(mockPost).toHaveBeenCalledTimes(3);
  });

  it('does NOT retry non-429 4xx errors (single call)', async () => {
    mockPost.mockResolvedValue({
      status: 400,
      data: { error: { message: 'Bad request' } }
    });

    const promise = executeModelQuery({ modelName: 'mistral', prompt: 'Hi' });
    const expectation = expect(promise).rejects.toThrow(/Bad request/);
    await vi.runAllTimersAsync();
    await expectation;

    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it('throws after exhausting all attempts when the server keeps failing', async () => {
    mockPost.mockResolvedValue({ status: 500, data: {} });

    const promise = executeModelQuery({ modelName: 'mistral', prompt: 'Hi' });
    const expectation = expect(promise).rejects.toThrow(
      new RegExp(`after ${apiConfig.retry.maxAttempts} attempts`)
    );
    await vi.runAllTimersAsync();
    await expectation;

    expect(mockPost).toHaveBeenCalledTimes(apiConfig.retry.maxAttempts);
  });

  it('throws on malformed response structure', async () => {
    mockPost.mockResolvedValue({ status: 200, data: { unexpected: 'shape' } });

    const promise = executeModelQuery({ modelName: 'mistral', prompt: 'Hi' });
    const expectation = expect(promise).rejects.toThrow(/invalid response/i);
    await vi.runAllTimersAsync();
    await expectation;
  });

  it('throws on empty response content', async () => {
    mockPost.mockResolvedValue(successResponse('   '));

    const promise = executeModelQuery({ modelName: 'mistral', prompt: 'Hi' });
    const expectation = expect(promise).rejects.toThrow(/empty response/i);
    await vi.runAllTimersAsync();
    await expectation;
  });

  it('omits temperature when modelName is "openai"', async () => {
    mockPost.mockResolvedValueOnce(successResponse('openai reply'));

    await executeModelQuery({ modelName: 'openai', temp: 0.9, prompt: 'Hi' });

    const body = mockPost.mock.calls[0][1];
    expect(body.model).toBe('openai');
    expect(body).not.toHaveProperty('temperature');
  });

  it('includes seed only when provided', async () => {
    mockPost.mockResolvedValueOnce(successResponse('seeded'));
    await executeModelQuery({ modelName: 'mistral', prompt: 'Hi', seed: 42 });
    expect(mockPost.mock.calls[0][1].seed).toBe(42);

    mockPost.mockResolvedValueOnce(successResponse('unseeded'));
    await executeModelQuery({ modelName: 'mistral', prompt: 'Hi' });
    expect(mockPost.mock.calls[1][1]).not.toHaveProperty('seed');
  });

  it('rejects an empty prompt without calling the API', async () => {
    await expect(executeModelQuery({ modelName: 'mistral', prompt: '   ' })).rejects.toThrow(
      /prompt cannot be empty/i
    );
    expect(mockPost).not.toHaveBeenCalled();
  });
});
