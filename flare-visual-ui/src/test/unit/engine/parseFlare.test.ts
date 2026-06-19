/**
 * Unit tests for engine/parseFlare.
 *
 * Representative subset ported from the backend parser fixtures
 * (src/test/unit/parser/syntax.test.js), adapted to Vitest.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseFlareCommand,
  validateParsedCommand,
  type ParsedFlareCommand
} from '../../../engine/parseFlare';

describe('parseFlareCommand', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('parses a complete command with multiple models and post-processing', () => {
    const result = parseFlareCommand(
      '{ flare model:openai,mistral temp:0.8 vote sum `Test prompt for multiple models` }'
    );

    expect(result).toEqual({
      model: ['openai', 'mistral'],
      temp: 0.8,
      postProcessing: ['vote', 'sum'],
      command: 'Test prompt for multiple models'
    });
  });

  it('parses a simple command with defaults', () => {
    const result = parseFlareCommand('{ flare model:openai `Simple test prompt` }');

    expect(result).toEqual({
      model: ['openai'],
      temp: 1.0, // default temperature
      postProcessing: [],
      command: 'Simple test prompt'
    });
  });

  it('handles different spacing variations', () => {
    const result = parseFlareCommand(
      '{flare   model:gpt4   temp:0.1    vote   `Spaced command`}'
    );

    expect(result).toEqual({
      model: ['gpt4'],
      temp: 0.1,
      postProcessing: ['vote'],
      command: 'Spaced command'
    });
  });

  it('parses post-processing commands without values', () => {
    const result = parseFlareCommand(
      '{ flare model:openai vote comb filter `Test post-processing` }'
    );

    expect(result.postProcessing).toEqual(expect.arrayContaining(['vote', 'comb', 'filter']));
  });

  it('parses post-processing commands with specific models (sum:gpt4)', () => {
    const result = parseFlareCommand(
      '{ flare model:openai,mistral sum:gpt4 `Test with specific summarization model` }'
    );

    expect(result.postProcessing).toContain('sum');
    expect(result.sum_model).toBe('gpt4');
  });

  it('handles the temperature alias', () => {
    const result = parseFlareCommand(
      '{ flare model:openai temperature:0.9 `Test temperature alias` }'
    );

    expect(result.temp).toBe(0.9);
  });

  it('handles complex prompts with special characters', () => {
    const result = parseFlareCommand(
      '{ flare model:openai `Complex prompt with "quotes", symbols: @#$%^&*()` }'
    );

    expect(result.command).toBe('Complex prompt with "quotes", symbols: @#$%^&*()');
  });

  it('throws for invalid syntax (missing backticks)', () => {
    expect(() =>
      parseFlareCommand('{ flare model:openai temp:0.5 Hello world }')
    ).toThrow('Invalid FLARE command syntax');
  });

  it('throws for invalid syntax (missing flare keyword)', () => {
    expect(() => parseFlareCommand('{ model:openai `Hello world` }')).toThrow(
      'Invalid FLARE command syntax'
    );
  });

  it('throws for an empty (whitespace-only) prompt', () => {
    expect(() => parseFlareCommand('{ flare model:openai `  ` }')).toThrow(
      'FLARE command cannot have empty prompt'
    );
  });

  it('throws for an out-of-range temperature', () => {
    expect(() =>
      parseFlareCommand('{ flare model:openai temp:3.0 `Invalid temperature` }')
    ).toThrow('Temperature must be between');
  });

  it('throws when no models are specified', () => {
    expect(() => parseFlareCommand('{ flare temp:0.5 `No models` }')).toThrow(
      'At least one model must be specified'
    );
  });

  it('warns about unknown parameters without failing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = parseFlareCommand('{ flare model:openai unknown:value `Test unknown param` }');

    expect(result.model).toEqual(['openai']);
    expect(
      warnSpy.mock.calls.some((args) => String(args[0]).includes('Unknown FLARE parameter: unknown'))
    ).toBe(true);
  });
});

describe('validateParsedCommand', () => {
  const valid: ParsedFlareCommand = {
    model: ['openai'],
    temp: 0.7,
    postProcessing: ['sum'],
    command: 'Valid command'
  };

  it('accepts a correct parsed command', () => {
    expect(() => validateParsedCommand(valid)).not.toThrow();
    expect(validateParsedCommand(valid)).toBe(true);
  });

  it('throws for missing models', () => {
    expect(() => validateParsedCommand({ ...valid, model: [] })).toThrow(
      'At least one model must be specified'
    );
  });

  it('throws for an invalid temperature', () => {
    expect(() => validateParsedCommand({ ...valid, temp: -1 })).toThrow(
      'Temperature must be between'
    );
  });

  it('throws for an empty command prompt', () => {
    expect(() => validateParsedCommand({ ...valid, command: '' })).toThrow(
      'Command prompt cannot be empty'
    );
  });

  it('throws for an unknown post-processing command', () => {
    expect(() =>
      validateParsedCommand({
        ...valid,
        postProcessing: ['invalid_command'] as unknown as ParsedFlareCommand['postProcessing']
      })
    ).toThrow('Unknown post-processing command: invalid_command');
  });
});
