// START: extractFlareCommands function
/**
 * Extract FLARE commands from text
 * Returns array of command strings found in the text
 */
import { patterns } from './globals.js';

export function extractFlareCommands(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const matches = [...text.matchAll(patterns.flareGlobal)];
  return matches.map(match => match[0]);
}
// END: extractFlareCommands function