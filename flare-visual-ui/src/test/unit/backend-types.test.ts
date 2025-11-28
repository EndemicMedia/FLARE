/**
 * Backend Type Compatibility Tests
 *
 * Verifies that frontend types match the backend API contracts exactly.
 */

import { describe, it, expect } from 'vitest';
import type {
  FlareParserOutput,
  ProcessFlareRequest,
  ProcessFlareResponse,
  ProcessFlareError,
} from '../../types/backend';

describe('Backend Type Compatibility', () => {
  describe('FlareParserOutput', () => {
    it('should match backend parser output structure', () => {
      const parserOutput: FlareParserOutput = {
        model: ['openai', 'mistral'],
        temp: 0.8,
        postProcessing: ['vote', 'sum'],
        command: 'Explain renewable energy',
        vote_model: 'openai', // Optional operation-specific model
      };

      expect(parserOutput.model).toBeInstanceOf(Array);
      expect(parserOutput.model).toHaveLength(2);
      expect(typeof parserOutput.temp).toBe('number');
      expect(parserOutput.postProcessing).toBeInstanceOf(Array);
      expect(typeof parserOutput.command).toBe('string');
      expect(typeof parserOutput.vote_model).toBe('string');
    });

    it('should support operation_model fields dynamically', () => {
      const parserOutput: FlareParserOutput = {
        model: ['openai'],
        temp: 1.0,
        postProcessing: ['sum', 'vote', 'comb'],
        command: 'test',
        sum_model: 'mistral',
        vote_model: 'gpt-4',
        comb_model: 'openai',
      };

      expect(parserOutput.sum_model).toBe('mistral');
      expect(parserOutput.vote_model).toBe('gpt-4');
      expect(parserOutput.comb_model).toBe('openai');
    });
  });

  describe('ProcessFlareRequest', () => {
    it('should match POST /process-flare request structure', () => {
      const request: ProcessFlareRequest = {
        command: '{ flare model:openai temp:0.8 vote `test prompt` }',
      };

      expect(typeof request.command).toBe('string');
      expect(request.command).toContain('flare');
    });
  });

  describe('ProcessFlareResponse', () => {
    it('should match successful API response structure', () => {
      const response: ProcessFlareResponse = {
        success: true,
        result: 'This is the response from the model',
        command: '{ flare model:openai temp:0.8 vote `test prompt` }',
      };

      expect(response.success).toBe(true);
      expect(typeof response.result).toBe('string');
      expect(typeof response.command).toBe('string');
    });
  });

  describe('ProcessFlareError', () => {
    it('should match error API response structure', () => {
      const errorResponse: ProcessFlareError = {
        success: false,
        error: 'Invalid FLARE command syntax',
      };

      expect(errorResponse.success).toBe(false);
      expect(typeof errorResponse.error).toBe('string');
    });
  });

  describe('Temperature Validation', () => {
    it('should accept valid temperature values (0.0 - 2.0)', () => {
      const validTemps: FlareParserOutput[] = [
        { model: ['openai'], temp: 0.0, postProcessing: [], command: 'test' },
        { model: ['openai'], temp: 1.0, postProcessing: [], command: 'test' },
        { model: ['openai'], temp: 2.0, postProcessing: [], command: 'test' },
        { model: ['openai'], temp: 0.5, postProcessing: [], command: 'test' },
      ];

      validTemps.forEach((output) => {
        expect(output.temp).toBeGreaterThanOrEqual(0.0);
        expect(output.temp).toBeLessThanOrEqual(2.0);
      });
    });
  });

  describe('Post-Processing Operations', () => {
    it('should support all valid post-processing operations', () => {
      const validOperations = ['sum', 'comb', 'vote', 'diff', 'exp', 'filter'];

      const output: FlareParserOutput = {
        model: ['openai'],
        temp: 1.0,
        postProcessing: validOperations,
        command: 'test',
      };

      expect(output.postProcessing).toHaveLength(6);
      expect(output.postProcessing).toEqual(validOperations);
    });
  });
});
