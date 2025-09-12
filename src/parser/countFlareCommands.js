// START: countFlareCommands function
/**
 * Count FLARE commands in text
 * Returns number of FLARE commands found
 */
import { patterns } from './globals.js';

export function countFlareCommands(text) {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  const matches = text.match(patterns.flareGlobal);
  return matches ? matches.length : 0;
}
// END: countFlareCommands function