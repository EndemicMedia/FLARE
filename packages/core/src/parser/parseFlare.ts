/**
 * Parse a FLARE command string into a structured object.
 *
 * Example: { flare model:openai,mistral temp:0.8 vote `Explain quantum computing` }
 */
import type { ParsedFlareCommand, PostProcessingCommand } from '../types/index.js';
import { patterns, defaults, postProcessingCommands, validation } from './patterns.js';

export function parseFlareCommand(commandString: string): ParsedFlareCommand {
  if (!commandString || typeof commandString !== 'string') {
    throw new Error('Invalid FLARE command: must be a non-empty string');
  }

  const match = commandString.match(patterns.flareCommand);
  if (!match) {
    throw new Error('Invalid FLARE command syntax. Expected: { flare model:name temp:0.8 vote `prompt` }');
  }

  const [, parametersString, promptText] = match;

  const trimmedPrompt = promptText.trim();
  if (!trimmedPrompt) {
    throw new Error('FLARE command cannot have empty prompt');
  }

  const parsed: ParsedFlareCommand = {
    model: [...defaults.model],
    temp: defaults.temperature,
    postProcessing: [...defaults.postProcessing] as PostProcessingCommand[],
    command: trimmedPrompt,
  };

  const parameters = parametersString.trim().split(patterns.parameterSplit);

  for (const param of parameters) {
    if (!param.trim()) continue;

    const separatorIndex = param.indexOf(':');
    if (separatorIndex === -1) {
      // Standalone post-processing keyword (e.g. "vote")
      if (postProcessingCommands.has(param.trim())) {
        parsed.postProcessing.push(param.trim() as PostProcessingCommand);
        continue;
      }
      // Unknown standalone token — skip with warning
      continue;
    }

    const key = param.substring(0, separatorIndex).trim();
    const value = param.substring(separatorIndex + 1).trim();

    if (!key || !value) continue;

    switch (key) {
      case 'model': {
        parsed.model = value.split(',').map(m => m.trim()).filter(m => m.length > 0);
        if (parsed.model.length === 0) {
          throw new Error('At least one model must be specified');
        }
        break;
      }
      case 'temp':
      case 'temperature': {
        const tempValue = parseFloat(value);
        if (isNaN(tempValue)) {
          throw new Error(`Invalid temperature value: ${value} (must be a number)`);
        }
        if (tempValue < validation.temperature.min || tempValue > validation.temperature.max) {
          throw new Error(`Temperature must be between ${validation.temperature.min} and ${validation.temperature.max}`);
        }
        parsed.temp = tempValue;
        break;
      }
      default: {
        if (postProcessingCommands.has(key)) {
          parsed.postProcessing.push(key as PostProcessingCommand);
          if (value && value !== 'true') {
            (parsed as unknown as Record<string, unknown>)[`${key}_model`] = value;
          }
        }
        break;
      }
    }
  }

  if (parsed.model.length === 0) {
    throw new Error('At least one model must be specified in FLARE command');
  }

  return parsed;
}

/**
 * Validate a parsed FLARE command and throw on invalid state.
 */
export function validateParsedCommand(parsed: ParsedFlareCommand): void {
  if (!parsed.model || parsed.model.length === 0) {
    throw new Error('At least one model must be specified');
  }
  if (!parsed.command || parsed.command.trim() === '') {
    throw new Error('Prompt cannot be empty');
  }
  if (parsed.temp < validation.temperature.min || parsed.temp > validation.temperature.max) {
    throw new Error(`Temperature must be between ${validation.temperature.min} and ${validation.temperature.max}`);
  }
}
