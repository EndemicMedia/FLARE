import { describe, it, expect, vi } from 'vitest';
import {
  calculateSimilarity,
  applyCombination,
  applyFiltering,
  applyVoting,
  applySummarization,
  applyDifference,
  applyExpansion,
  applyPostProcessing,
} from '../postProcessing/index.js';
import type { FlareContext } from '../config/context.js';
import type { HttpResponse } from '../transport/types.js';

function mockContext(response: string): FlareContext {
  return {
    httpClient: {
      async post(): Promise<HttpResponse> {
        return { status: 200, data: { choices: [{ message: { content: response } }] } };
      },
    },
    keyResolver: () => 'test-key',
  };
}

/** Context whose model query fails immediately (non-retryable), to exercise fallback paths. */
function failingContext(): FlareContext {
  return {
    httpClient: {
      async post(): Promise<HttpResponse> {
        return { status: 400, data: { error: { message: 'bad request' } } };
      },
    },
    keyResolver: () => 'test-key',
  };
}

describe('calculateSimilarity', () => {
  it('returns 1.0 for identical texts', () => {
    expect(calculateSimilarity('hello world', 'hello world')).toBe(1.0);
  });

  it('returns 0 for completely different texts', () => {
    expect(calculateSimilarity('hello world', 'foo bar')).toBe(0);
  });

  it('returns partial similarity for overlapping texts', () => {
    const sim = calculateSimilarity('hello world today', 'hello world tomorrow');
    expect(sim).toBeGreaterThan(0.3);
    expect(sim).toBeLessThan(1.0);
  });
});

describe('applyCombination', () => {
  it('joins multiple responses with separator', () => {
    const result = applyCombination(['Hello', 'World']);
    expect(result).toContain('Hello');
    expect(result).toContain('World');
    expect(result).toContain('---');
  });

  it('returns single response as-is', () => {
    expect(applyCombination(['only one'])).toBe('only one');
  });
});

describe('applyFiltering', () => {
  it('removes short responses (< 20 chars)', () => {
    const results = applyFiltering(['This is a valid response that is long enough', 'short']);
    expect(results).toHaveLength(1);
    expect(results[0]).toContain('valid response');
  });

  it('removes duplicate responses (> 90% similar)', () => {
    const results = applyFiltering([
      'This is a detailed response about quantum computing and physics in the modern world',
      'This is a detailed response about quantum computing and physics in the modern world today',
    ]);
    expect(results).toHaveLength(1);
  });

  it('returns original if all would be filtered', () => {
    const results = applyFiltering(['a', 'b']);
    expect(results).toEqual(['a', 'b']);
  });

  it('returns single response unchanged', () => {
    expect(applyFiltering(['only'])).toEqual(['only']);
  });
});

describe('applyVoting', () => {
  it('returns single response without calling model', async () => {
    const ctx = mockContext('should not be called');
    const result = await applyVoting(['only response'], {}, ctx);
    expect(result).toBe('only response');
  });

  it('calls model for multiple responses', async () => {
    const ctx = mockContext('Selected: response 2');
    const result = await applyVoting(['resp1', 'resp2'], { model: ['mistral'] }, ctx);
    expect(result).toBe('Selected: response 2');
  });
});

describe('applySummarization', () => {
  it('returns single response without calling model', async () => {
    const ctx = mockContext('nope');
    const result = await applySummarization(['only'], {}, ctx);
    expect(result).toBe('only');
  });

  it('summarizes multiple responses via model', async () => {
    const ctx = mockContext('A combined summary');
    const result = await applySummarization(['resp1', 'resp2'], { model: ['mistral'] }, ctx);
    expect(result).toBe('A combined summary');
  });

  it('falls back to combined text when the model fails', async () => {
    const ctx = failingContext();
    const result = await applySummarization(['resp1', 'resp2'], { model: ['mistral'] }, ctx);
    expect(result).toContain('resp1');
    expect(result).toContain('resp2');
  });
});

describe('applyDifference', () => {
  it('returns the single response without calling the model', async () => {
    const ctx = mockContext('should not be called');
    const result = await applyDifference(['only'], {}, ctx);
    expect(result).toBe('only');
  });

  it('analyzes differences across multiple responses via model', async () => {
    const ctx = mockContext('Key difference: tone');
    const result = await applyDifference(['resp1', 'resp2'], { model: ['mistral'] }, ctx);
    expect(result).toBe('Key difference: tone');
  });

  it('falls back to joined responses when the model fails', async () => {
    const ctx = failingContext();
    const result = await applyDifference(['resp1', 'resp2'], { model: ['mistral'] }, ctx);
    expect(result).toContain('resp1');
    expect(result).toContain('resp2');
  });
});

describe('applyExpansion', () => {
  it('expands a single response via model', async () => {
    const ctx = mockContext('Expanded with more detail');
    const result = await applyExpansion(['base'], { model: ['mistral'] }, ctx);
    expect(result).toBe('Expanded with more detail');
  });

  it('expands using additional responses as context', async () => {
    const ctx = mockContext('Expanded using extra context');
    const result = await applyExpansion(['base', 'extra'], { model: ['mistral'] }, ctx);
    expect(result).toBe('Expanded using extra context');
  });

  it('falls back to the base response when the model fails', async () => {
    const ctx = failingContext();
    const result = await applyExpansion(['base', 'extra'], { model: ['mistral'] }, ctx);
    expect(result).toBe('base');
  });
});

describe('applyPostProcessing', () => {
  it('returns first result when no commands', async () => {
    const ctx = mockContext('');
    const result = await applyPostProcessing(['first', 'second'], [], {}, ctx);
    expect(result).toBe('first');
  });

  it('applies comb command', async () => {
    const ctx = mockContext('');
    const result = await applyPostProcessing(['a', 'b'], ['comb'], {}, ctx);
    expect(result).toContain('a');
    expect(result).toContain('b');
  });

  it('applies filter then comb in sequence', async () => {
    const ctx = mockContext('');
    const responses = [
      'A valid long response about quantum physics and more',
      'B another valid response about different topics',
    ];
    const result = await applyPostProcessing(responses, ['filter', 'comb'], {}, ctx);
    expect(result).toContain('quantum');
    expect(result).toContain('different');
  });

  it('throws when no results provided', async () => {
    const ctx = mockContext('');
    await expect(applyPostProcessing([], ['vote'], {}, ctx)).rejects.toThrow(/No model results/);
  });

  it('handles ModelQueryResult objects', async () => {
    const ctx = mockContext('voted');
    const results = [
      { model: 'a', response: 'resp1', success: true },
      { model: 'b', response: 'resp2', success: true },
    ];
    const result = await applyPostProcessing(results, ['vote'], { model: ['openai'] }, ctx);
    expect(result).toBe('voted');
  });
});
