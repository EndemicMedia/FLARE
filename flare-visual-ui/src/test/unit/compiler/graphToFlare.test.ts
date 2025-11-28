import { describe, it, expect } from 'vitest';
import {
  compileGraphToFlare,
  validateFlareCommand,
  extractPromptFromFlare,
  extractModelsFromFlare
} from '../../../utils/graphToFlare';
import type { FlareNode } from '../../../types/nodes';
import type { FlareEdge } from '../../../types/edges';

describe('Graph to FLARE Compiler', () => {
  describe('compileGraphToFlare', () => {
    it('should compile a simple workflow', () => {
      const nodes: FlareNode[] = [
        {
          id: 'text-1',
          type: 'textInput',
          position: { x: 0, y: 0 },
          data: { text: 'Explain AI' }
        },
        {
          id: 'model-1',
          type: 'modelQuery',
          position: { x: 100, y: 0 },
          data: { models: ['openai'] }
        }
      ];

      const edges: FlareEdge[] = [
        {
          id: 'e1',
          source: 'text-1',
          target: 'model-1',
          type: 'default'
        }
      ];

      const result = compileGraphToFlare(nodes, edges);

      expect(result.success).toBe(true);
      expect(result.flareCommand).toBeDefined();
      expect(result.flareCommand).toContain('flare');
      expect(result.flareCommand).toContain('model:openai');
      expect(result.flareCommand).toContain('Explain AI');
    });

    it('should compile workflow with temperature', () => {
      const nodes: FlareNode[] = [
        {
          id: 'text-1',
          type: 'textInput',
          position: { x: 0, y: 0 },
          data: { text: 'Test prompt' }
        },
        {
          id: 'param-1',
          type: 'parameter',
          position: { x: 100, y: 0 },
          data: { paramType: 'temperature', value: 0.8, min: 0, max: 2 }
        },
        {
          id: 'model-1',
          type: 'modelQuery',
          position: { x: 200, y: 0 },
          data: { models: ['mistral'] }
        }
      ];

      const edges: FlareEdge[] = [
        { id: 'e1', source: 'text-1', target: 'param-1', type: 'default' },
        { id: 'e2', source: 'param-1', target: 'model-1', type: 'default' }
      ];

      const result = compileGraphToFlare(nodes, edges);

      expect(result.success).toBe(true);
      expect(result.flareCommand).toContain('temp:0.8');
    });

    it('should compile workflow with post-processing', () => {
      const nodes: FlareNode[] = [
        {
          id: 'text-1',
          type: 'textInput',
          position: { x: 0, y: 0 },
          data: { text: 'Test' }
        },
        {
          id: 'model-1',
          type: 'modelQuery',
          position: { x: 100, y: 0 },
          data: { models: ['openai', 'mistral'] }
        },
        {
          id: 'pp-1',
          type: 'postProcessing',
          position: { x: 200, y: 0 },
          data: { operation: 'vote' }
        }
      ];

      const edges: FlareEdge[] = [
        { id: 'e1', source: 'text-1', target: 'model-1', type: 'default' },
        { id: 'e2', source: 'model-1', target: 'pp-1', type: 'default' }
      ];

      const result = compileGraphToFlare(nodes, edges);

      expect(result.success).toBe(true);
      expect(result.flareCommand).toContain('vote');
      expect(result.flareCommand).toContain('openai,mistral');
    });

    it('should fail with empty workflow', () => {
      const result = compileGraphToFlare([], []);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail without text input', () => {
      const nodes: FlareNode[] = [
        {
          id: 'model-1',
          type: 'modelQuery',
          position: { x: 0, y: 0 },
          data: { models: ['openai'] }
        }
      ];

      const result = compileGraphToFlare(nodes, []);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Workflow must have at least one text input node');
    });

    it('should fail without models', () => {
      const nodes: FlareNode[] = [
        {
          id: 'text-1',
          type: 'textInput',
          position: { x: 0, y: 0 },
          data: { text: 'Test' }
        }
      ];

      const result = compileGraphToFlare(nodes, []);

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Workflow must have at least one model query node');
    });

    it('should detect cycles', () => {
      const nodes: FlareNode[] = [
        {
          id: 'text-1',
          type: 'textInput',
          position: { x: 0, y: 0 },
          data: { text: 'Test' }
        },
        {
          id: 'model-1',
          type: 'modelQuery',
          position: { x: 100, y: 0 },
          data: { models: ['openai'] }
        }
      ];

      const edges: FlareEdge[] = [
        { id: 'e1', source: 'text-1', target: 'model-1', type: 'default' },
        { id: 'e2', source: 'model-1', target: 'text-1', type: 'default' } // Cycle
      ];

      const result = compileGraphToFlare(nodes, edges);

      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('Cycle detected'))).toBe(true);
    });
  });

  describe('validateFlareCommand', () => {
    it('should validate correct FLARE command', () => {
      const valid = validateFlareCommand('{ flare model:openai `Test` }');
      expect(valid).toBe(true);
    });

    it('should reject invalid commands', () => {
      expect(validateFlareCommand('invalid')).toBe(false);
      expect(validateFlareCommand('{ flare model:openai }')).toBe(false);
      expect(validateFlareCommand('flare model:openai `Test`')).toBe(false);
    });
  });

  describe('extractPromptFromFlare', () => {
    it('should extract prompt from FLARE command', () => {
      const prompt = extractPromptFromFlare('{ flare model:openai `Hello World` }');
      expect(prompt).toBe('Hello World');
    });

    it('should return null for invalid command', () => {
      const prompt = extractPromptFromFlare('invalid command');
      expect(prompt).toBeNull();
    });
  });

  describe('extractModelsFromFlare', () => {
    it('should extract single model', () => {
      const models = extractModelsFromFlare('{ flare model:openai `Test` }');
      expect(models).toEqual(['openai']);
    });

    it('should extract multiple models', () => {
      const models = extractModelsFromFlare('{ flare model:openai,mistral,gemini `Test` }');
      expect(models).toEqual(['openai', 'mistral', 'gemini']);
    });

    it('should return empty array for no models', () => {
      const models = extractModelsFromFlare('{ flare `Test` }');
      expect(models).toEqual([]);
    });
  });
});
