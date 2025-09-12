// START: validateParsedCommand function
/**
 * Validate parsed FLARE command object
 * Returns true if valid, throws error if invalid
 */
import { postProcessingCommands, validation } from './globals.js';

export function validateParsedCommand(parsed) {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error("Invalid parsed command object");
  }
  
  if (!Array.isArray(parsed.model) || parsed.model.length === 0) {
    throw new Error("At least one model must be specified");
  }
  
  if (typeof parsed.temp !== 'number' || parsed.temp < validation.temperature.min || parsed.temp > validation.temperature.max) {
    throw new Error(`Temperature must be between ${validation.temperature.min} and ${validation.temperature.max}`);
  }
  
  if (!parsed.command || typeof parsed.command !== 'string' || parsed.command.trim() === '') {
    throw new Error("Command prompt cannot be empty");
  }
  
  if (!Array.isArray(parsed.postProcessing)) {
    throw new Error("Post-processing must be an array");
  }
  
  // Validate post-processing commands
  for (const cmd of parsed.postProcessing) {
    if (!postProcessingCommands.has(cmd)) {
      throw new Error(`Unknown post-processing command: ${cmd}`);
    }
  }
  
  return true;
}
// END: validateParsedCommand function