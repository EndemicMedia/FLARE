/**
 * FLARE parser constants and configuration.
 * Shared regex patterns, default values, and validation rules.
 */

/** FLARE command syntax patterns */
export const patterns = {
  /** Main FLARE command: { flare model:name temp:0.8 sum `prompt` } */
  flareCommand: /\{\s*flare\s+([^`]+?)\s*`([^`]+)`\s*\}/,

  /** Global pattern for extracting all FLARE commands from text */
  flareGlobal: /\{\s*flare\s+([^`]+?)\s*`[^`]+`\s*\}/g,

  /** Parameter splitting (whitespace) */
  parameterSplit: /\s+/,
} as const;

/** Default values for parsed commands */
export const defaults = {
  temperature: 1.0,
  model: [] as string[],
  postProcessing: [] as string[],
} as const;

/** Supported post-processing commands */
export const postProcessingCommands = new Set([
  'sum',    // Summarization
  'comb',   // Combination
  'vote',   // Voting
  'diff',   // Difference analysis
  'exp',    // Expansion
  'filter', // Filtering
]);

/** Parameter validation rules */
export const validation = {
  temperature: { min: 0.0, max: 2.0 },
} as const;
