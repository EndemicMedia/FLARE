// START: parseFlareCommand function
/**
 * Parse FLARE command string into structured object
 * 
 * Example FLARE command:
 * { flare model:openai,mistral temp:0.8 vote sum `Explain renewable energy` }
 * 
 * Parsed result:
 * {
 *   model: ['openai', 'mistral'],
 *   temp: 0.8,
 *   postProcessing: ['vote', 'sum'],
 *   command: 'Explain renewable energy'
 * }
 */
import { patterns, defaults, postProcessingCommands, validation } from './globals.js';

export function parseFlareCommand(commandString) {
  if (!commandString || typeof commandString !== 'string') {
    throw new Error("Invalid FLARE command: must be a non-empty string");
  }

  const match = commandString.match(patterns.flareCommand);
  if (!match) {
    throw new Error("Invalid FLARE command syntax. Expected: { flare model:name temp:0.8 vote `prompt` }");
  }

  const [, parametersString, promptText] = match;
  
  // Check for empty prompt before parsing parameters
  const trimmedPrompt = promptText.trim();
  if (!trimmedPrompt) {
    throw new Error("FLARE command cannot have empty prompt");
  }
  
  const parsed = {
    model: [...defaults.model],
    temp: defaults.temperature,
    postProcessing: [...defaults.postProcessing],
    command: trimmedPrompt
  };

  // Parse parameters
  const parameters = parametersString.trim().split(patterns.parameterSplit);
  
  for (const param of parameters) {
    if (!param.trim()) continue;
    
    const separatorIndex = param.indexOf(':');
    if (separatorIndex === -1) {
      // Check if it's a post-processing command without value
      if (postProcessingCommands.has(param.trim())) {
        parsed.postProcessing.push(param.trim());
        continue;
      } else {
        console.warn(`Invalid FLARE parameter format: ${param} (expected key:value)`);
        continue;
      }
    }

    const key = param.substring(0, separatorIndex).trim();
    const value = param.substring(separatorIndex + 1).trim();

    if (!key || !value) {
      console.warn(`Invalid FLARE parameter: ${param} (empty key or value)`);
      continue;
    }

    switch (key) {
      case 'model':
        // Support multiple models: model:openai,mistral,gpt2
        parsed.model = value.split(',').map(m => m.trim()).filter(m => m.length > 0);
        if (parsed.model.length === 0) {
          throw new Error("At least one model must be specified");
        }
        break;
        
      case 'temp':
      case 'temperature':
        const tempValue = parseFloat(value);
        if (isNaN(tempValue)) {
          throw new Error(`Invalid temperature value: ${value} (must be a number)`);
        }
        if (tempValue < validation.temperature.min || tempValue > validation.temperature.max) {
          throw new Error(`Temperature must be between ${validation.temperature.min} and ${validation.temperature.max}`);
        }
        parsed.temp = tempValue;
        break;
        
      default:
        // Check if it's a post-processing command
        if (postProcessingCommands.has(key)) {
          parsed.postProcessing.push(key);
          // Handle post-processing with specific model (e.g., sum:openai)
          if (value && value !== 'true') {
            parsed[`${key}_model`] = value;
          }
        } else {
          console.warn(`Unknown FLARE parameter: ${key}`);
        }
        break;
    }
  }

  // Validate that at least one model is specified
  if (parsed.model.length === 0) {
    throw new Error("At least one model must be specified in FLARE command");
  }

  return parsed;
}
// END: parseFlareCommand function