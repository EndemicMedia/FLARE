/**
 * FLARE parser types
 */

export interface ParsedFlareCommand {
  model: string[];
  temp: number;
  postProcessing: PostProcessingCommand[];
  command: string;
  /** Original command text (set by extractAndParse) */
  _originalText?: string;
  /** Index in source text (set by extractAndParse) */
  _index?: number;
  /** Per-operation model override, e.g. sum_model, vote_model */
  [key: `${string}_model`]: string | undefined;
}

export type PostProcessingCommand = 'sum' | 'comb' | 'vote' | 'diff' | 'exp' | 'filter';
