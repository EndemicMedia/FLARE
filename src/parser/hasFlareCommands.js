// START: hasFlareCommands function
/**
 * Check if text contains FLARE commands
 * Returns boolean indicating presence of FLARE commands
 */
import { patterns } from './globals.js';

export function hasFlareCommands(text) {
  if (!text || typeof text !== 'string') {
    return false;
  }
  return patterns.flareGlobal.test(text);
}
// END: hasFlareCommands function