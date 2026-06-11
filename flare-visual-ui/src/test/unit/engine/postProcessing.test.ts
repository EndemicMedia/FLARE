/**
 * Unit tests for engine/postProcessing.
 *
 * The pollinations client module is mocked; each op is verified to route to
 * the model with the expected meta-prompt (or, for comb/filter, no model call).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  applyPostProcessing,
  applyCombination,
  applyFiltering,
  calculateSimilarity
} from '../../../engine/postProcessing';
import { executeModelQuery } from '../../../engine/pollinationsClient';
import { postProcessingConfig } from '../../../engine/config';

vi.mock('../../../engine/pollinationsClient', () => ({
  executeModelQuery: vi.fn()
}));

const mockExecute = vi.mocked(executeModelQuery);

const responses = [
  { model: 'openai', response: 'Solar power is renewable energy.', success: true },
  { model: 'mistral', response: 'Wind turbines convert kinetic energy.', success: true }
];

describe('applyPostProcessing', () => {
  beforeEach(() => {
    mockExecute.mockReset();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the first response when no ops are requested', async () => {
    const result = await applyPostProcessing(responses, []);
    expect(result).toBe('Solar power is renewable energy.');
    expect(mockExecute).not.toHaveBeenCalled();
  });

  it('accepts raw strings as well as ModelQueryResult objects', async () => {
    const result = await applyPostProcessing(['just a string'], []);
    expect(result).toBe('just a string');
  });

  it('throws when no model results are provided', async () => {
    await expect(applyPostProcessing([], ['sum'])).rejects.toThrow(/No model results/);
  });

  it('sum: builds a summarization meta-prompt containing all responses', async () => {
    mockExecute.mockResolvedValue('A concise summary.');

    const result = await applyPostProcessing(responses, ['sum'], { model: ['openai'] });

    expect(result).toBe('A concise summary.');
    expect(mockExecute).toHaveBeenCalledTimes(1);

    const call = mockExecute.mock.calls[0][0];
    expect(call.prompt).toContain(postProcessingConfig.summarization.prompt);
    expect(call.prompt).toContain('Solar power is renewable energy.');
    expect(call.prompt).toContain('Wind turbines convert kinetic energy.');
    expect(call.temp).toBe(postProcessingConfig.summarization.temperature);
    expect(call.modelName).toBe('openai');
  });

  it('vote: builds a voting meta-prompt and honors a vote_model override', async () => {
    mockExecute.mockResolvedValue('Solar power is renewable energy.');

    const result = await applyPostProcessing(responses, ['vote'], {
      model: ['openai'],
      vote_model: 'mistral'
    });

    expect(result).toBe('Solar power is renewable energy.');
    const call = mockExecute.mock.calls[0][0];
    expect(call.prompt).toContain(postProcessingConfig.voting.prompt);
    expect(call.prompt).toContain('Response 1:');
    expect(call.prompt).toContain('Response 2:');
    expect(call.modelName).toBe('mistral');
    expect(call.temp).toBe(postProcessingConfig.voting.temperature);
  });

  it('diff: asks a model to highlight differences between responses', async () => {
    mockExecute.mockResolvedValue('They differ in energy source.');

    const result = await applyPostProcessing(responses, ['diff']);

    expect(result).toBe('They differ in energy source.');
    const call = mockExecute.mock.calls[0][0];
    expect(call.prompt).toMatch(/differences/i);
    expect(call.prompt).toContain('Solar power is renewable energy.');
  });

  it('exp: asks a model to expand on the first response', async () => {
    mockExecute.mockResolvedValue('An expanded answer.');

    const result = await applyPostProcessing([responses[0]], ['exp']);

    expect(result).toBe('An expanded answer.');
    const call = mockExecute.mock.calls[0][0];
    expect(call.prompt).toMatch(/expand/i);
    expect(call.prompt).toContain('Solar power is renewable energy.');
  });

  it('comb: pure concatenation without any model call', async () => {
    const result = await applyPostProcessing(responses, ['comb']);

    expect(mockExecute).not.toHaveBeenCalled();
    expect(result).toContain(postProcessingConfig.combination.header);
    expect(result).toContain('Solar power is renewable energy.');
    expect(result).toContain('Wind turbines convert kinetic energy.');
    expect(result).toContain(postProcessingConfig.combination.separator);
  });

  it('filter: drops short responses without any model call', async () => {
    const result = await applyPostProcessing(
      [
        { model: 'a', response: 'short', success: true },
        { model: 'b', response: 'This response is definitely long enough to keep.', success: true }
      ],
      ['filter']
    );

    expect(mockExecute).not.toHaveBeenCalled();
    expect(result).toBe('This response is definitely long enough to keep.');
  });

  it('continues with the prior result when an op fails', async () => {
    mockExecute.mockRejectedValue(new Error('model down'));

    const result = await applyPostProcessing(responses, ['sum']);

    // Summarization falls back to the combined text instead of throwing
    expect(result).toContain('Solar power is renewable energy.');
    expect(result).toContain('Wind turbines convert kinetic energy.');
  });

  it('applies ops in sequence (filter then sum)', async () => {
    mockExecute.mockResolvedValue('Summary of the survivors.');

    const result = await applyPostProcessing(
      [
        { model: 'a', response: 'tiny', success: true },
        { model: 'b', response: 'A sufficiently long first response to keep here.', success: true },
        { model: 'c', response: 'Another sufficiently long unique response to keep.', success: true }
      ],
      ['filter', 'sum']
    );

    expect(result).toBe('Summary of the survivors.');
    const call = mockExecute.mock.calls[0][0];
    expect(call.prompt).not.toContain('tiny');
    expect(call.prompt).toContain('A sufficiently long first response to keep here.');
  });

  it('single response short-circuits model-backed ops', async () => {
    const result = await applyPostProcessing([responses[0]], ['vote']);
    expect(result).toBe('Solar power is renewable energy.');
    expect(mockExecute).not.toHaveBeenCalled();
  });
});

describe('helpers', () => {
  it('calculateSimilarity: identical texts are 1, disjoint texts are 0', () => {
    expect(calculateSimilarity('alpha beta gamma', 'alpha beta gamma')).toBe(1);
    expect(calculateSimilarity('alpha beta', 'gamma delta')).toBe(0);
  });

  it('applyCombination joins with the configured separator', () => {
    const combined = applyCombination(['one', 'two']);
    expect(combined).toBe(
      `${postProcessingConfig.combination.header}\n\none${postProcessingConfig.combination.separator}two`
    );
  });

  it('applyFiltering returns originals when everything would be filtered out', () => {
    const out = applyFiltering(['a', 'b']);
    expect(out).toEqual(['a', 'b']);
  });
});
