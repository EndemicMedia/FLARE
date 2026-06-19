import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { executeFlareCommand } from '../core/executeFlareCommand.js';
import { createContext } from '../config/context.js';
import type { FlareContext } from '../config/context.js';
import type { HttpResponse } from '../transport/types.js';

function mockContext(responses: string[]): FlareContext {
  let callIndex = 0;
  return {
    httpClient: {
      async post(): Promise<HttpResponse> {
        const content = responses[callIndex] ?? responses[responses.length - 1];
        callIndex++;
        return { status: 200, data: { choices: [{ message: { content } }] } };
      },
    },
    keyResolver: () => 'test-key',
  };
}

describe('executeFlareCommand (integration)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('executes a simple single-model command', async () => {
    const ctx = mockContext(['Hello from mistral']);
    const { result, modelResponses } = await executeFlareCommand(
      '{ flare model:mistral `Say hello` }',
      ctx
    );
    expect(result).toBe('Hello from mistral');
    expect(modelResponses).toHaveLength(1);
    expect(modelResponses[0].success).toBe(true);
  });

  it('executes multi-model with vote post-processing', async () => {
    // First two calls are model queries, third is voting
    const ctx = mockContext(['Response A', 'Response B', 'Response B']);
    const { result } = await executeFlareCommand(
      '{ flare model:mistral,openai vote `Test` }',
      ctx
    );
    expect(result).toBe('Response B');
  });

  it('executes with comb post-processing', async () => {
    const ctx = mockContext(['Alpha', 'Beta']);
    const { result } = await executeFlareCommand(
      '{ flare model:a,b comb `Test` }',
      ctx
    );
    expect(result).toContain('Alpha');
    expect(result).toContain('Beta');
  });

  it('throws on all models failing', async () => {
    const ctx: FlareContext = {
      httpClient: {
        async post(): Promise<HttpResponse> {
          return { status: 400, data: { error: { message: 'nope' } } };
        },
      },
      keyResolver: () => 'key',
    };

    await expect(
      executeFlareCommand('{ flare model:bad `Test` }', ctx)
    ).rejects.toThrow(/All models failed/);
  });

  it('throws on invalid syntax', async () => {
    const ctx = mockContext(['x']);
    await expect(
      executeFlareCommand('not a valid command', ctx)
    ).rejects.toThrow(/syntax/i);
  });

  it('handles temperature parameter', async () => {
    const postFn = vi.fn().mockResolvedValue({
      status: 200,
      data: { choices: [{ message: { content: 'ok' } }] },
    });
    const ctx: FlareContext = { httpClient: { post: postFn }, keyResolver: () => 'k' };

    await executeFlareCommand('{ flare model:mistral temp:0.3 `Test` }', ctx);
    const body = postFn.mock.calls[0][1];
    expect(body.temperature).toBe(0.3);
  });
});

describe('createContext', () => {
  it('creates a context with default key', () => {
    const ctx = createContext();
    expect(ctx.keyResolver()).toBe('sk_EnngsXCASw0kBiuso2zekJuhIxS1l0sB');
  });

  it('uses provided API key', () => {
    const ctx = createContext({ apiKey: 'my-key' });
    expect(ctx.keyResolver()).toBe('my-key');
  });

  it('uses env variable when available', () => {
    const original = process.env.POLLINATIONS_API_KEY;
    process.env.POLLINATIONS_API_KEY = 'env-key';
    try {
      const ctx = createContext();
      expect(ctx.keyResolver()).toBe('env-key');
    } finally {
      if (original) process.env.POLLINATIONS_API_KEY = original;
      else delete process.env.POLLINATIONS_API_KEY;
    }
  });
});
