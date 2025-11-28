import { expect } from 'chai';
import { 
  extractFlareCommands,
  extractAndParseFlareCommands,
  replaceFlareCommandsInText,
  hasFlareCommands,
  countFlareCommands
} from '../../../parser/exports.js';

describe('FLARE Parser - Extractor Tests', () => {

  describe('extractFlareCommands', () => {
    
    it('should extract single FLARE command from text', () => {
      const text = 'Here is some text. { flare model:openai `Extract this command` } And more text.';
      const commands = extractFlareCommands(text);
      
      expect(commands).to.have.lengthOf(1);
      expect(commands[0]).to.equal('{ flare model:openai `Extract this command` }');
    });

    it('should extract multiple FLARE commands from text', () => {
      const text = 'First: { flare model:openai `Command 1` }. Second: { flare model:mistral temp:0.5 sum `Command 2` }';
      const commands = extractFlareCommands(text);
      
      expect(commands).to.have.lengthOf(2);
      expect(commands[0]).to.equal('{ flare model:openai `Command 1` }');
      expect(commands[1]).to.equal('{ flare model:mistral temp:0.5 sum `Command 2` }');
    });

    it('should return empty array when no commands found', () => {
      const text = 'This is just regular text with no FLARE commands.';
      const commands = extractFlareCommands(text);
      
      expect(commands).to.be.an('array').that.is.empty;
    });

    it('should handle empty or null input', () => {
      expect(extractFlareCommands('')).to.be.an('array').that.is.empty;
      expect(extractFlareCommands(null)).to.be.an('array').that.is.empty;
      expect(extractFlareCommands(undefined)).to.be.an('array').that.is.empty;
    });
  });

  describe('extractAndParseFlareCommands', () => {
    
    it('should extract and parse single command from text', () => {
      const text = 'Text with { flare model:openai temp:0.8 `Parse this command` } more text.';
      const parsed = extractAndParseFlareCommands(text);
      
      expect(parsed).to.have.lengthOf(1);
      expect(parsed[0]).to.deep.include({
        model: ['openai'],
        temp: 0.8,
        command: 'Parse this command'
      });
      expect(parsed[0]._originalText).to.equal('{ flare model:openai temp:0.8 `Parse this command` }');
      expect(parsed[0]._index).to.equal(0);
    });

    it('should extract and parse multiple commands from text', () => {
      const text = 'First: { flare model:gpt4 `First command` }. Second: { flare model:openai,mistral vote `Second command` }';
      const parsed = extractAndParseFlareCommands(text);
      
      expect(parsed).to.have.lengthOf(2);
      expect(parsed[0]).to.deep.include({
        model: ['gpt4'],
        command: 'First command'
      });
      expect(parsed[1]).to.deep.include({
        model: ['openai', 'mistral'],
        postProcessing: ['vote'],
        command: 'Second command'
      });
    });

    it('should continue parsing even if one command fails', () => {
      // Use a command that will match the regex but fail parsing due to no models
      const text = 'Good: { flare model:openai `Good command` }. Bad: { flare temp:0.5 `No model specified` }. Good: { flare model:mistral `Another good` }';
      
      // Capture console.error to test error handling
      const errors = [];
      const originalError = console.error;
      console.error = (msg, ...args) => {
        errors.push(typeof msg === 'string' ? msg : String(msg));
        if (args.length > 0) {
          errors.push(...args.map(a => String(a)));
        }
      };
      
      const parsed = extractAndParseFlareCommands(text);
      
      console.error = originalError;
      
      expect(parsed).to.have.lengthOf(2);
      expect(parsed[0].command).to.equal('Good command');
      expect(parsed[1].command).to.equal('Another good');
      
      // Check that error was logged 
      const errorMessages = errors.join(' ');
      const hasError = errorMessages.includes('Error parsing FLARE command');
      expect(hasError).to.be.true;
    });
  });

  describe('replaceFlareCommandsInText', () => {
    
    it('should replace single FLARE command with result', () => {
      const originalText = 'Before { flare model:openai `Test command` } after.';
      const results = ['REPLACED CONTENT'];
      
      const replaced = replaceFlareCommandsInText(originalText, results);
      
      expect(replaced).to.equal('Before REPLACED CONTENT after.');
    });

    it('should replace multiple FLARE commands with results', () => {
      const originalText = 'First { flare model:openai `Command 1` } and second { flare model:mistral `Command 2` } done.';
      const results = ['RESULT 1', 'RESULT 2'];
      
      const replaced = replaceFlareCommandsInText(originalText, results);
      
      expect(replaced).to.equal('First RESULT 1 and second RESULT 2 done.');
    });

    it('should handle results with special regex characters', () => {
      const originalText = 'Text { flare model:openai `Command` } end.';
      const results = ['Result with (parentheses) and [brackets] and $symbols^'];
      
      const replaced = replaceFlareCommandsInText(originalText, results);
      
      expect(replaced).to.equal('Text Result with (parentheses) and [brackets] and $symbols^ end.');
    });

    it('should handle missing results gracefully', () => {
      const originalText = 'Text { flare model:openai `Command` } end.';
      const results = []; // No results
      
      const replaced = replaceFlareCommandsInText(originalText, results);
      
      expect(replaced).to.equal(originalText); // Should remain unchanged
    });

    it('should handle null/undefined results', () => {
      const originalText = 'Text { flare model:openai `Command` } end.';
      const results = [null, undefined];
      
      const replaced = replaceFlareCommandsInText(originalText, results);
      
      expect(replaced).to.equal('Text  end.'); // null/undefined becomes empty string
    });

    it('should handle empty or null input text', () => {
      expect(replaceFlareCommandsInText('', ['result'])).to.equal('');
      expect(replaceFlareCommandsInText(null, ['result'])).to.equal(null);
      expect(replaceFlareCommandsInText(undefined, ['result'])).to.equal(undefined);
    });
  });

  describe('hasFlareCommands', () => {
    
    it('should return true when FLARE commands are present', () => {
      const text = 'Text with { flare model:openai `command` } present.';
      expect(hasFlareCommands(text)).to.be.true;
    });

    it('should return false when no FLARE commands are present', () => {
      const text = 'Just regular text without any commands.';
      expect(hasFlareCommands(text)).to.be.false;
    });

    it('should handle empty or null input', () => {
      expect(hasFlareCommands('')).to.be.false;
      expect(hasFlareCommands(null)).to.be.false;
      expect(hasFlareCommands(undefined)).to.be.false;
    });
  });

  describe('countFlareCommands', () => {
    
    it('should count single FLARE command', () => {
      const text = 'Text with { flare model:openai `command` } here.';
      expect(countFlareCommands(text)).to.equal(1);
    });

    it('should count multiple FLARE commands', () => {
      const text = 'First { flare model:openai `cmd1` } and { flare model:mistral `cmd2` } and { flare model:gpt4 `cmd3` }';
      expect(countFlareCommands(text)).to.equal(3);
    });

    it('should return 0 when no commands are present', () => {
      const text = 'No commands in this text.';
      expect(countFlareCommands(text)).to.equal(0);
    });

    it('should handle empty or null input', () => {
      expect(countFlareCommands('')).to.equal(0);
      expect(countFlareCommands(null)).to.equal(0);
      expect(countFlareCommands(undefined)).to.equal(0);
    });
  });
});