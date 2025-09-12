// START: extractAndParseFlareCommands function
/**
 * Extract and parse FLARE commands from text
 * Returns array of parsed command objects
 */
import { extractFlareCommands } from './extractFlareCommands.js';
import { parseFlareCommand } from './parseFlareCommand.js';

export function extractAndParseFlareCommands(text) {
  const commandStrings = extractFlareCommands(text);
  const parsedCommands = [];
  
  for (let i = 0; i < commandStrings.length; i++) {
    try {
      const parsed = parseFlareCommand(commandStrings[i]);
      parsed._originalText = commandStrings[i];
      parsed._index = i;
      parsedCommands.push(parsed);
    } catch (error) {
      console.error(`Error parsing FLARE command ${i + 1}: ${error.message}`);
      console.error(`Command text: ${commandStrings[i]}`);
      // Continue processing other commands even if one fails
    }
  }
  
  return parsedCommands;
}
// END: extractAndParseFlareCommands function