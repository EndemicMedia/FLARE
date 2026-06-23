import { describe, it, expect } from 'vitest';
import {
  parseFlareCommand,
  validateParsedCommand,
  extractFlareCommands,
  extractAndParseFlareCommands,
  countFlareCommands,
  hasFlareCommands,
  replaceFlareCommandsInText,
  postProcessingCommands,
} from '../parser/index.js';

describe('parseFlareCommand', () => {
  it('parses a basic command with model and prompt', () => {
    const result = parseFlareCommand('{ flare model:openai `Hello world` }');
    expect(result.model).toEqual(['openai']);
    expect(result.command).toBe('Hello world');
    expect(result.temp).toBe(1.0);
    expect(result.postProcessing).toEqual([]);
  });

  it('parses multiple models', () => {
    const result = parseFlareCommand('{ flare model:openai,mistral,gpt2 `test` }');
    expect(result.model).toEqual(['openai', 'mistral', 'gpt2']);
  });

  it('parses temperature', () => {
    const result = parseFlareCommand('{ flare model:openai temp:0.8 `test` }');
    expect(result.temp).toBe(0.8);
  });

  it('parses post-processing commands', () => {
    const result = parseFlareCommand('{ flare model:openai vote sum `test` }');
    expect(result.postProcessing).toContain('vote');
    expect(result.postProcessing).toContain('sum');
  });

  it('parses post-processing with model override', () => {
    const result = parseFlareCommand('{ flare model:openai sum:mistral `test` }');
    expect(result.postProcessing).toContain('sum');
    expect((result as any).sum_model).toBe('mistral');
  });

  it('throws on empty string', () => {
    expect(() => parseFlareCommand('')).toThrow();
  });

  it('throws on invalid syntax', () => {
    expect(() => parseFlareCommand('not a flare command')).toThrow(/syntax/i);
  });

  it('throws on empty prompt (backticks with nothing inside)', () => {
    expect(() => parseFlareCommand('{ flare model:openai `` }')).toThrow(/syntax/i);
  });

  it('throws on temperature out of range', () => {
    expect(() => parseFlareCommand('{ flare model:openai temp:3.0 `test` }')).toThrow(/between/);
  });

  it('throws on invalid temperature value', () => {
    expect(() => parseFlareCommand('{ flare model:openai temp:abc `test` }')).toThrow(/must be a number/);
  });

  it('accepts temperature keyword', () => {
    const result = parseFlareCommand('{ flare model:openai temperature:0.5 `test` }');
    expect(result.temp).toBe(0.5);
  });
});

describe('validateParsedCommand', () => {
  it('passes for valid command', () => {
    const parsed = parseFlareCommand('{ flare model:openai `test` }');
    expect(() => validateParsedCommand(parsed)).not.toThrow();
  });

  it('throws on empty model array', () => {
    expect(() => validateParsedCommand({ model: [], temp: 1.0, postProcessing: [], command: 'test' })).toThrow();
  });

  it('throws on empty command', () => {
    expect(() => validateParsedCommand({ model: ['openai'], temp: 1.0, postProcessing: [], command: '' })).toThrow();
  });
});

describe('postProcessingCommands', () => {
  it('contains all expected commands', () => {
    expect(postProcessingCommands.has('sum')).toBe(true);
    expect(postProcessingCommands.has('comb')).toBe(true);
    expect(postProcessingCommands.has('vote')).toBe(true);
    expect(postProcessingCommands.has('diff')).toBe(true);
    expect(postProcessingCommands.has('exp')).toBe(true);
    expect(postProcessingCommands.has('filter')).toBe(true);
  });
});

describe('extractFlareCommands', () => {
  it('extracts multiple commands from text', () => {
    const text = 'Some text { flare model:openai `prompt1` } more text { flare model:mistral `prompt2` }';
    const commands = extractFlareCommands(text);
    expect(commands).toHaveLength(2);
    expect(commands[0]).toContain('prompt1');
    expect(commands[1]).toContain('prompt2');
  });

  it('returns empty array for no commands', () => {
    expect(extractFlareCommands('no commands here')).toEqual([]);
  });

  it('returns empty array for empty/null input', () => {
    expect(extractFlareCommands('')).toEqual([]);
    expect(extractFlareCommands(null as any)).toEqual([]);
  });
});

describe('extractAndParseFlareCommands', () => {
  it('extracts and parses valid commands', () => {
    const text = '{ flare model:openai `hello` } and { flare model:mistral temp:0.5 `world` }';
    const results = extractAndParseFlareCommands(text);
    expect(results).toHaveLength(2);
    expect(results[0].model).toEqual(['openai']);
    expect(results[0].command).toBe('hello');
    expect(results[1].model).toEqual(['mistral']);
    expect(results[1].temp).toBe(0.5);
  });

  it('sets _originalText and _index', () => {
    const text = '{ flare model:openai `test` }';
    const results = extractAndParseFlareCommands(text);
    expect(results[0]._originalText).toBe(text);
    expect(results[0]._index).toBe(0);
  });

  it('skips invalid commands and continues', () => {
    // The second command has empty model which should fail
    const text = '{ flare model:openai `valid` }';
    const results = extractAndParseFlareCommands(text);
    expect(results).toHaveLength(1);
  });
});

describe('countFlareCommands', () => {
  it('counts commands in text', () => {
    const text = '{ flare model:a `1` } text { flare model:b `2` } more { flare model:c `3` }';
    expect(countFlareCommands(text)).toBe(3);
  });

  it('returns 0 for no commands', () => {
    expect(countFlareCommands('no commands')).toBe(0);
  });

  it('returns 0 for empty input', () => {
    expect(countFlareCommands('')).toBe(0);
  });
});

describe('hasFlareCommands', () => {
  it('returns true when commands exist', () => {
    expect(hasFlareCommands('text { flare model:openai `test` } more')).toBe(true);
  });

  it('returns false when no commands', () => {
    expect(hasFlareCommands('just plain text')).toBe(false);
  });

  it('returns false for empty input', () => {
    expect(hasFlareCommands('')).toBe(false);
  });
});

describe('replaceFlareCommandsInText', () => {
  it('replaces commands with results', () => {
    const text = 'Before { flare model:openai `hello` } After';
    const result = replaceFlareCommandsInText(text, ['REPLACED']);
    expect(result).toBe('Before REPLACED After');
  });

  it('replaces multiple commands in order', () => {
    const text = '{ flare model:a `1` } and { flare model:b `2` }';
    const result = replaceFlareCommandsInText(text, ['FIRST', 'SECOND']);
    expect(result).toBe('FIRST and SECOND');
  });

  it('returns original text when no results provided', () => {
    const text = 'some text { flare model:a `1` }';
    expect(replaceFlareCommandsInText(text, [])).toBe(text);
  });

  it('returns original text for empty input', () => {
    expect(replaceFlareCommandsInText('', ['x'])).toBe('');
  });
});
