import { expect } from 'chai';
import { parseFlareCommand, validateParsedCommand } from '../../../parser/exports.js';

describe('FLARE Parser - Syntax Tests', () => {
  
  describe('parseFlareCommand', () => {
    
    it('should parse a complete FLARE command with multiple models and post-processing', () => {
      const command = '{ flare model:openai,mistral temp:0.8 vote sum `Test prompt for multiple models` }';
      const result = parseFlareCommand(command);
      
      expect(result).to.deep.equal({
        model: ['openai', 'mistral'],
        temp: 0.8,
        postProcessing: ['vote', 'sum'],
        command: 'Test prompt for multiple models'
      });
    });

    it('should parse a simple command with only model and prompt', () => {
      const command = '{ flare model:openai `Simple test prompt` }';
      const result = parseFlareCommand(command);
      
      expect(result).to.deep.equal({
        model: ['openai'],
        temp: 1.0, // Default temperature
        postProcessing: [],
        command: 'Simple test prompt'
      });
    });

    it('should handle different spacing variations', () => {
      const command = '{flare   model:gpt4   temp:0.1    vote   `Spaced command`}';
      const result = parseFlareCommand(command);
      
      expect(result).to.deep.equal({
        model: ['gpt4'],
        temp: 0.1,
        postProcessing: ['vote'],
        command: 'Spaced command'
      });
    });

    it('should parse post-processing commands without values', () => {
      const command = '{ flare model:openai vote comb filter `Test post-processing` }';
      const result = parseFlareCommand(command);
      
      expect(result.postProcessing).to.include.members(['vote', 'comb', 'filter']);
    });

    it('should parse post-processing commands with specific models', () => {
      const command = '{ flare model:openai,mistral sum:gpt4 `Test with specific summarization model` }';
      const result = parseFlareCommand(command);
      
      expect(result.postProcessing).to.include('sum');
      expect(result.sum_model).to.equal('gpt4');
    });

    it('should handle temperature alias', () => {
      const command = '{ flare model:openai temperature:0.9 `Test temperature alias` }';
      const result = parseFlareCommand(command);
      
      expect(result.temp).to.equal(0.9);
    });

    it('should throw error for invalid syntax (missing backticks)', () => {
      const command = '{ flare model:openai temp:0.5 Hello world }';
      expect(() => parseFlareCommand(command)).to.throw('Invalid FLARE command syntax');
    });

    it('should throw error for invalid syntax (missing flare keyword)', () => {
      const command = '{ model:openai `Hello world` }';
      expect(() => parseFlareCommand(command)).to.throw('Invalid FLARE command syntax');
    });

    it('should throw error for empty prompt', () => {
      const command = '{ flare model:openai `  ` }'; // Whitespace-only prompt
      expect(() => parseFlareCommand(command)).to.throw('FLARE command cannot have empty prompt');
    });

    it('should throw error for invalid temperature range', () => {
      const command = '{ flare model:openai temp:3.0 `Invalid temperature` }';
      expect(() => parseFlareCommand(command)).to.throw('Temperature must be between');
    });

    it('should throw error for no models specified', () => {
      const command = '{ flare temp:0.5 `No models` }';
      expect(() => parseFlareCommand(command)).to.throw('At least one model must be specified');
    });

    it('should handle complex prompts with special characters', () => {
      const command = '{ flare model:openai `Complex prompt with "quotes", symbols: @#$%^&*()` }';
      const result = parseFlareCommand(command);
      
      expect(result.command).to.equal('Complex prompt with "quotes", symbols: @#$%^&*()');
    });

    it('should warn about unknown parameters', () => {
      const consoleSpy = {
        warnings: []
      };
      const originalWarn = console.warn;
      console.warn = (msg) => consoleSpy.warnings.push(msg);

      const command = '{ flare model:openai unknown:value `Test unknown param` }';
      const result = parseFlareCommand(command);

      expect(consoleSpy.warnings.some(w => w.includes('Unknown FLARE parameter: unknown'))).to.be.true;
      console.warn = originalWarn;
    });
  });

  describe('validateParsedCommand', () => {
    
    it('should validate a correct parsed command', () => {
      const parsed = {
        model: ['openai'],
        temp: 0.7,
        postProcessing: ['sum'],
        command: 'Valid command'
      };
      
      expect(() => validateParsedCommand(parsed)).to.not.throw();
    });

    it('should throw error for missing models', () => {
      const parsed = {
        model: [],
        temp: 0.7,
        postProcessing: [],
        command: 'No models'
      };
      
      expect(() => validateParsedCommand(parsed)).to.throw('At least one model must be specified');
    });

    it('should throw error for invalid temperature', () => {
      const parsed = {
        model: ['openai'],
        temp: -1,
        postProcessing: [],
        command: 'Invalid temp'
      };
      
      expect(() => validateParsedCommand(parsed)).to.throw('Temperature must be between');
    });

    it('should throw error for empty command', () => {
      const parsed = {
        model: ['openai'],
        temp: 0.7,
        postProcessing: [],
        command: ''
      };
      
      expect(() => validateParsedCommand(parsed)).to.throw('Command prompt cannot be empty');
    });

    it('should throw error for invalid post-processing command', () => {
      const parsed = {
        model: ['openai'],
        temp: 0.7,
        postProcessing: ['invalid_command'],
        command: 'Test'
      };
      
      expect(() => validateParsedCommand(parsed)).to.throw('Unknown post-processing command: invalid_command');
    });
  });
});