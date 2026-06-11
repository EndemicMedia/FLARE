/**
 * FLARE command parser (flat commands only).
 * Ported from backend src/parser/parseFlareCommand.js + validateParsedCommand.js.
 */

// FLARE command syntax patterns
export const patterns = {
  // Main FLARE command pattern: { flare model:name temp:0.8 sum `prompt` }
  flareCommand: /\{\s*flare\s+([^`]+?)\s*`([^`]+)`\s*\}/,

  // Global pattern for extracting all FLARE commands from text
  flareGlobal: /\{\s*flare\s+([^`]+?)\s*`[^`]+`\s*\}/g,

  // Parameter extraction patterns
  parameterSplit: /\s+/,
};

// Default values
export const defaults = {
  temperature: 1.0,
  model: [] as string[],
  postProcessing: [] as PostProcessingCommand[],
};

export type PostProcessingCommand = 'sum' | 'comb' | 'vote' | 'diff' | 'exp' | 'filter';

// Supported post-processing commands
export const postProcessingCommands: Set<string> = new Set([
  'sum', // Summarization
  'comb', // Combination
  'vote', // Voting
  'diff', // Difference analysis
  'exp', // Expansion
  'filter', // Filtering
]);

// Parameter validation
export const validation = {
  temperature: {
    min: 0.0,
    max: 2.0,
  },
};

export interface ParsedFlareCommand {
  /** Models to query (e.g. ['openai', 'mistral']) */
  model: string[];
  /** Temperature (0.0 - 2.0) */
  temp: number;
  /** Post-processing operations, in order */
  postProcessing: PostProcessingCommand[];
  /** The prompt text */
  command: string;
  /** Per-op model overrides, e.g. sum_model from `sum:openai` */
  sum_model?: string;
  vote_model?: string;
  comb_model?: string;
  diff_model?: string;
  exp_model?: string;
  filter_model?: string;
}

/**
 * Parse a FLARE command string into a structured object.
 *
 * Example: { flare model:openai,mistral temp:0.8 vote sum `Explain renewable energy` }
 */
export function parseFlareCommand(commandString: string): ParsedFlareCommand {
  if (!commandString || typeof commandString !== 'string') {
    throw new Error('Invalid FLARE command: must be a non-empty string');
  }

  const match = commandString.match(patterns.flareCommand);
  if (!match) {
    throw new Error(
      'Invalid FLARE command syntax. Expected: { flare model:name temp:0.8 vote `prompt` }'
    );
  }

  const [, parametersString, promptText] = match;

  // Check for empty prompt before parsing parameters
  const trimmedPrompt = promptText.trim();
  if (!trimmedPrompt) {
    throw new Error('FLARE command cannot have empty prompt');
  }

  const parsed: ParsedFlareCommand = {
    model: [...defaults.model],
    temp: defaults.temperature,
    postProcessing: [...defaults.postProcessing],
    command: trimmedPrompt,
  };

  // Parse parameters
  const parameters = parametersString.trim().split(patterns.parameterSplit);

  for (const param of parameters) {
    if (!param.trim()) continue;

    const separatorIndex = param.indexOf(':');
    if (separatorIndex === -1) {
      // Check if it's a post-processing command without value
      if (postProcessingCommands.has(param.trim())) {
        parsed.postProcessing.push(param.trim() as PostProcessingCommand);
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
        parsed.model = value
          .split(',')
          .map((m) => m.trim())
          .filter((m) => m.length > 0);
        if (parsed.model.length === 0) {
          throw new Error('At least one model must be specified');
        }
        break;

      case 'temp':
      case 'temperature': {
        const tempValue = parseFloat(value);
        if (isNaN(tempValue)) {
          throw new Error(`Invalid temperature value: ${value} (must be a number)`);
        }
        if (tempValue < validation.temperature.min || tempValue > validation.temperature.max) {
          throw new Error(
            `Temperature must be between ${validation.temperature.min} and ${validation.temperature.max}`
          );
        }
        parsed.temp = tempValue;
        break;
      }

      default:
        // Check if it's a post-processing command
        if (postProcessingCommands.has(key)) {
          parsed.postProcessing.push(key as PostProcessingCommand);
          // Handle post-processing with specific model (e.g., sum:openai)
          if (value && value !== 'true') {
            (parsed as unknown as Record<string, unknown>)[`${key}_model`] = value;
          }
        } else {
          console.warn(`Unknown FLARE parameter: ${key}`);
        }
        break;
    }
  }

  // Validate that at least one model is specified
  if (parsed.model.length === 0) {
    throw new Error('At least one model must be specified in FLARE command');
  }

  return parsed;
}

/**
 * Validate a parsed FLARE command object.
 * Returns true if valid, throws an Error if invalid.
 */
export function validateParsedCommand(parsed: ParsedFlareCommand): boolean {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid parsed command object');
  }

  if (!Array.isArray(parsed.model) || parsed.model.length === 0) {
    throw new Error('At least one model must be specified');
  }

  if (
    typeof parsed.temp !== 'number' ||
    parsed.temp < validation.temperature.min ||
    parsed.temp > validation.temperature.max
  ) {
    throw new Error(
      `Temperature must be between ${validation.temperature.min} and ${validation.temperature.max}`
    );
  }

  if (!parsed.command || typeof parsed.command !== 'string' || parsed.command.trim() === '') {
    throw new Error('Command prompt cannot be empty');
  }

  if (!Array.isArray(parsed.postProcessing)) {
    throw new Error('Post-processing must be an array');
  }

  // Validate post-processing commands
  for (const cmd of parsed.postProcessing) {
    if (!postProcessingCommands.has(cmd)) {
      throw new Error(`Unknown post-processing command: ${cmd}`);
    }
  }

  return true;
}
