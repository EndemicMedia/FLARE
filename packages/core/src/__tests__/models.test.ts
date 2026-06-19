import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeModelQuery } from '../models/executeQuery.js';
import { queryMultipleModels } from '../models/queryMultiple.js';
import { FetchHttpClient } from '../transport/fetchAdapter.js';
import type { FlareContext } from '../config/context.js';
import type { HttpClient, HttpResponse } from '../transport/types.js';

function mockContext(httpClient: HttpClient): FlareContext {
  return { httpClient, keyResolver: () => 'test-key' };
}

function mockHttp(responses: Array<{ status: number; data: unknown }>): HttpClient {
  let callIndex = 0;
  return {
    async post(): Promise<HttpResponse> {
      const resp = responses[callIndex] ?? responses[responses.length - 1];
      callIndex++;
      return resp;
    },
  };
}

function successResponse(content: string) {
  return { status: 200, data: { choices: [{ message: { content } }] } };
}

describe('executeModelQuery', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns trimmed content on success', async () => {
    const ctx = mockContext(mockHttp([successResponse('  Hello  ')]));
    const result = await executeModelQuery({ prompt: 'hi', modelName: 'mistral' }, ctx);
    expect(result).toBe('Hello');
  });

  it('rejects empty prompt', async () => {
    const ctx = mockContext(mockHttp([successResponse('x')]));
    await expect(executeModelQuery({ prompt: '   ' }, ctx)).rejects.toThrow(/empty/i);
  });

  it('does not retry on 4xx (except 429)', async () => {
    const http = mockHttp([{ status: 400, data: { error: { message: 'Bad request' } } }]);
    const postSpy = vi.spyOn(http, 'post');
    const ctx = mockContext(http);

    const promise = executeModelQuery({ prompt: 'hi' }, ctx);
    await vi.runAllTimersAsync();
    await expect(promise).rejects.toThrow(/Bad request/);
    expect(postSpy).toHaveBeenCalledTimes(1);
  });

  it('retries on 429 and succeeds', async () => {
    const http = mockHttp([
      { status: 429, data: {} },
      successResponse('ok'),
    ]);
    const ctx = mockContext(http);

    const promise = executeModelQuery({ prompt: 'hi' }, ctx);
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe('ok');
  });

  it('retries on 5xx', async () => {
    const http = mockHttp([
      { status: 500, data: {} },
      { status: 503, data: {} },
      successResponse('finally'),
    ]);
    const ctx = mockContext(http);

    const promise = executeModelQuery({ prompt: 'hi' }, ctx);
    await vi.runAllTimersAsync();
    await expect(promise).resolves.toBe('finally');
  });

  it('throws after exhausting retries', async () => {
    const http = mockHttp([{ status: 500, data: {} }]);
    const ctx = mockContext(http);

    const promise = executeModelQuery({ prompt: 'hi' }, ctx);
    await vi.runAllTimersAsync();
    await expect(promise).rejects.toThrow(/after 3 attempts/);
  });

  it('throws on malformed response', async () => {
    const http = mockHttp([{ status: 200, data: { unexpected: true } }]);
    const ctx = mockContext(http);

    const promise = executeModelQuery({ prompt: 'hi' }, ctx);
    await vi.runAllTimersAsync();
    await expect(promise).rejects.toThrow(/invalid response/i);
  });

  it('omits temperature for openai model', async () => {
    const postFn = vi.fn().mockResolvedValue(successResponse('x'));
    const ctx = mockContext({ post: postFn });

    await executeModelQuery({ prompt: 'hi', modelName: 'openai', temp: 0.9 }, ctx);
    const body = postFn.mock.calls[0][1];
    expect(body).not.toHaveProperty('temperature');
  });

  it('includes temperature for non-openai models', async () => {
    const postFn = vi.fn().mockResolvedValue(successResponse('x'));
    const ctx = mockContext({ post: postFn });

    await executeModelQuery({ prompt: 'hi', modelName: 'mistral', temp: 0.9 }, ctx);
    const body = postFn.mock.calls[0][1];
    expect(body.temperature).toBe(0.9);
  });
});

describe('queryMultipleModels', () => {
  it('queries all models in parallel', async () => {
    const postFn = vi.fn()
      .mockResolvedValueOnce(successResponse('response1'))
      .mockResolvedValueOnce(successResponse('response2'));
    const ctx = mockContext({ post: postFn });

    const results = await queryMultipleModels(['mistral', 'openai'], 'test', 0.7, ctx);
    expect(results).toHaveLength(2);
    expect(results[0].success).toBe(true);
    expect(results[0].response).toBe('response1');
    expect(results[1].success).toBe(true);
    expect(results[1].response).toBe('response2');
  });

  it('captures failures per-model without crashing', async () => {
    const postFn = vi.fn()
      .mockResolvedValueOnce(successResponse('ok'))
      .mockResolvedValueOnce({ status: 400, data: { error: { message: 'fail' } } });
    const ctx = mockContext({ post: postFn });

    const results = await queryMultipleModels(['a', 'b'], 'test', 0.7, ctx);
    expect(results[0].success).toBe(true);
    expect(results[1].success).toBe(false);
    expect(results[1].error).toContain('fail');
  });
});
