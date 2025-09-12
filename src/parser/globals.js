// START: parser constants
/**
 * FLARE parser constants and configuration
 * Regex patterns, default values, and validation rules
 */

// FLARE command syntax patterns
export const patterns = {
  // Main FLARE command pattern: { flare model:name temp:0.8 sum `prompt` }
  flareCommand: /\{\s*flare\s+([^`]+?)\s*`([^`]+)`\s*\}/,
  
  // Global pattern for extracting all FLARE commands from text
  flareGlobal: /\{\s*flare\s+([^`]+?)\s*`[^`]+`\s*\}/g,
  
  // Parameter extraction patterns
  parameterSplit: /\s+/,
  keyValueSplit: /:/
};

// Default values
export const defaults = {
  temperature: 1.0,
  model: [],
  postProcessing: []
};

// Supported post-processing commands
export const postProcessingCommands = new Set([
  'sum',      // Summarization
  'comb',     // Combination
  'vote',     // Voting
  'diff',     // Difference analysis
  'exp',      // Expansion
  'filter'    // Filtering
]);

// Parameter validation
export const validation = {
  temperature: {
    min: 0.0,
    max: 2.0
  }
};
// END: parser constants