import { describe, it, expect } from 'vitest';
import {
  AVAILABLE_MODELS,
  getModelById,
  getModelColor,
  modelSupportsTemperature,
  DEFAULT_MODEL
} from '../../../constants/models';
import {
  POST_PROCESSING_OPERATIONS,
  getOperationById,
  getOperationColor,
  operationRequiresMultipleModels
} from '../../../constants/postProcessing';

describe('Model Constants', () => {
  it('should have at least one model defined', () => {
    expect(AVAILABLE_MODELS.length).toBeGreaterThan(0);
  });

  it('should have unique model IDs', () => {
    const ids = AVAILABLE_MODELS.map(m => m.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('should get model by ID', () => {
    const model = getModelById('openai');
    expect(model).toBeDefined();
    expect(model?.id).toBe('openai');
  });

  it('should return undefined for non-existent model', () => {
    const model = getModelById('non-existent-model');
    expect(model).toBeUndefined();
  });

  it('should get model color', () => {
    const color = getModelColor('openai');
    expect(color).toBeDefined();
    expect(color).toMatch(/^#[0-9A-F]{6}$/i);
  });

  it('should return default color for non-existent model', () => {
    const color = getModelColor('non-existent');
    expect(color).toBe('#999999');
  });

  it('should check temperature support', () => {
    const openaiSupports = modelSupportsTemperature('openai');
    expect(typeof openaiSupports).toBe('boolean');
  });

  it('should have default model defined', () => {
    expect(DEFAULT_MODEL).toBeDefined();
    expect(typeof DEFAULT_MODEL).toBe('string');
  });

  it('should have OpenAI model that does not support temperature', () => {
    const model = getModelById('openai');
    expect(model?.supportsTemp).toBe(false);
  });
});

describe('Post-Processing Operations', () => {
  it('should have all 6 operations defined', () => {
    expect(POST_PROCESSING_OPERATIONS.length).toBe(6);
  });

  it('should have expected operation IDs', () => {
    const expectedOps = ['sum', 'vote', 'comb', 'diff', 'exp', 'filter'];
    const actualOps = POST_PROCESSING_OPERATIONS.map(op => op.id);

    expectedOps.forEach(expected => {
      expect(actualOps).toContain(expected);
    });
  });

  it('should get operation by ID', () => {
    const op = getOperationById('sum');
    expect(op).toBeDefined();
    expect(op?.id).toBe('sum');
    expect(op?.name).toBe('Summarize');
  });

  it('should return undefined for non-existent operation', () => {
    const op = getOperationById('invalid-op');
    expect(op).toBeUndefined();
  });

  it('should get operation color', () => {
    const color = getOperationColor('vote');
    expect(color).toBeDefined();
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });

  it('should check if operation requires multiple models', () => {
    const voteRequiresMultiple = operationRequiresMultipleModels('vote');
    expect(voteRequiresMultiple).toBe(true);

    const sumRequiresMultiple = operationRequiresMultipleModels('sum');
    expect(sumRequiresMultiple).toBe(false);
  });

  it('should have icons for all operations', () => {
    POST_PROCESSING_OPERATIONS.forEach(op => {
      expect(op.icon).toBeDefined();
      expect(op.icon.length).toBeGreaterThan(0);
    });
  });

  it('should have descriptions for all operations', () => {
    POST_PROCESSING_OPERATIONS.forEach(op => {
      expect(op.description).toBeDefined();
      expect(op.description.length).toBeGreaterThan(10);
    });
  });
});
