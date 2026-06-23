/**
 * Batch parsing utilities — extract, count, and check for FLARE commands in text.
 */
import type { ParsedFlareCommand } from '../types/index.js';
import { patterns } from './patterns.js';
import { parseFlareCommand } from './parseFlare.js';

/**
 * Extract all FLARE command strings from text.
 * Returns raw command strings (not yet parsed).
 */
export function extractFlareCommands(text: string): string[] {
  if (!text || typeof text !== 'string') return [];
  const matches = [...text.matchAll(patterns.flareGlobal)];
  return matches.map(match => match[0]);
}

/**
 * Extract and parse all FLARE commands from text.
 * Continues on errors — failed commands are skipped.
 */
export function extractAndParseFlareCommands(text: string): ParsedFlareCommand[] {
  const commandStrings = extractFlareCommands(text);
  const parsed: ParsedFlareCommand[] = [];

  for (let i = 0; i < commandStrings.length; i++) {
    try {
      const result = parseFlareCommand(commandStrings[i]);
      result._originalText = commandStrings[i];
      result._index = i;
      parsed.push(result);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`Error parsing FLARE command ${i + 1}: ${msg}`);
    }
  }

  return parsed;
}

/** Count FLARE commands in text. */
export function countFlareCommands(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  const matches = text.match(patterns.flareGlobal);
  return matches ? matches.length : 0;
}

/** Check if text contains any FLARE commands. */
export function hasFlareCommands(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  return patterns.flareGlobal.test(text);
}

/**
 * Replace FLARE commands in text with their results.
 * Replacements happen in reverse order to preserve string indices.
 */
export function replaceFlareCommandsInText(originalText: string, commandResults: string[]): string {
  if (!originalText || typeof originalText !== 'string') return originalText;
  if (!Array.isArray(commandResults) || commandResults.length === 0) return originalText;

  let processedText = originalText;
  const commandStrings = extractFlareCommands(originalText);

  for (let i = commandStrings.length - 1; i >= 0; i--) {
    if (commandResults[i] !== undefined) {
      const result = typeof commandResults[i] === 'string'
        ? commandResults[i]
        : String(commandResults[i] || '');

      const commandText = commandStrings[i];
      const escapedCommand = commandText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedCommand, 'g');

      let replacementCount = 0;
      processedText = processedText.replace(regex, (match) => {
        replacementCount++;
        return replacementCount === 1 ? result : match;
      });
    }
  }

  return processedText;
}
