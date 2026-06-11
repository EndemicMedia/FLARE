/**
 * Unit tests for engine/queryMultipleModels.
 *
 * The pollinations client module is mocked so no network/retry code runs.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { queryMultipleModels } from '../../../engine/queryMultipleModels';
import { executeModelQuery } from '../../../engine/pollinationsClient';

vi.mock('../../../engine/pollinationsClient', () => ({
  executeModelQuery: vi.fn()
}));

const mockExecute = vi.mocked(executeModelQuery);

describe('queryMultipleModels', () => {
  beforeEach(() => {
    mockExecute.mockReset();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns one successful result per model', async () => {
    mockExecute.mockImplementation(({ modelName }) =>
      Promise.resolve(`response from ${modelName}`)
    );

    const results = await queryMultipleModels(['openai', 'mistral'], 'Explain AI', 0.8);

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({
      model: 'openai',
      response: 'response from openai',
      success: true
    });
    expect(results[1]).toEqual({
      model: 'mistral',
      response: 'response from mistral',
      success: true
    });

    // Prompt and temperature are forwarded to the client
    expect(mockExecute).toHaveBeenCalledTimes(2);
    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({ modelName: 'openai', temp: 0.8, prompt: 'Explain AI' })
    );
  });

  it('tolerates partial failure (one model fails, others succeed)', async () => {
    mockExecute.mockImplementation(({ modelName }) =>
      modelName === 'mistral'
        ? Promise.reject(new Error('mistral exploded'))
        : Promise.resolve('openai ok')
    );

    const results = await queryMultipleModels(['openai', 'mistral'], 'Hi');

    expect(results).toHaveLength(2);

    const openai = results.find((r) => r.model === 'openai');
    expect(openai?.success).toBe(true);
    expect(openai?.response).toBe('openai ok');

    const mistral = results.find((r) => r.model === 'mistral');
    expect(mistral?.success).toBe(false);
    expect(mistral?.error).toContain('mistral exploded');
    expect(mistral?.response).toBeUndefined();
  });

  it('throws only when ALL models fail', async () => {
    mockExecute.mockRejectedValue(new Error('everything is down'));

    await expect(queryMultipleModels(['openai', 'mistral'], 'Hi')).rejects.toThrow(
      /All models failed/
    );
  });

  it('throws when no models are provided', async () => {
    await expect(queryMultipleModels([], 'Hi')).rejects.toThrow(
      /At least one model must be specified/
    );
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
