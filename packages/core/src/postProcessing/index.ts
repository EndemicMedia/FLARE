/**
 * Post-processing operations for FLARE results.
 * All operations are isomorphic — model-calling ops require a FlareContext.
 */
import type { FlareContext } from '../config/context.js';
import type { ParsedFlareCommand } from '../types/index.js';
import { executeModelQuery } from '../models/executeQuery.js';
import { postProcessingConfig } from '../config/defaults.js';
import type { ModelQueryResult } from '../models/queryMultiple.js';

export type PostProcessingContext = Partial<ParsedFlareCommand>;

/** Jaccard word similarity (0..1). */
export function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/** Voting: use a model to select the best response. */
export async function applyVoting(
  responses: string[],
  parsedCommand: PostProcessingContext,
  context: FlareContext
): Promise<string> {
  if (responses.length === 1) return responses[0];

  const votingPrompt =
    postProcessingConfig.voting.prompt +
    responses.map((r, i) => `Response ${i + 1}:\n${r}`).join('\n\n---\n\n');

  const votingModel = (parsedCommand as any).vote_model || parsedCommand.model?.[0] || 'openai';

  try {
    return await executeModelQuery(
      { modelName: votingModel, temp: postProcessingConfig.voting.temperature, prompt: votingPrompt },
      context
    );
  } catch {
    return responses[0];
  }
}

/** Summarization: combine and summarize responses. */
export async function applySummarization(
  responses: string[],
  parsedCommand: PostProcessingContext,
  context: FlareContext
): Promise<string> {
  if (responses.length === 1) return responses[0];

  const combinedText = responses.join('\n\n---\n\n');
  const prompt = postProcessingConfig.summarization.prompt + combinedText;
  const summaryModel = (parsedCommand as any).sum_model || parsedCommand.model?.[0] || 'openai';

  try {
    return await executeModelQuery(
      { modelName: summaryModel, temp: postProcessingConfig.summarization.temperature, prompt },
      context
    );
  } catch {
    return combinedText;
  }
}

/** Combination: pure string concatenation. */
export function applyCombination(responses: string[]): string {
  const { separator, header } = postProcessingConfig.combination;
  return responses.length > 1 ? `${header}\n\n${responses.join(separator)}` : responses[0];
}

/** Difference analysis: highlight key differences between responses. */
export async function applyDifference(
  responses: string[],
  parsedCommand: PostProcessingContext,
  context: FlareContext
): Promise<string> {
  if (responses.length < 2) return responses[0];

  const diffPrompt =
    `Please analyze and highlight the key differences between these responses:\n\n` +
    responses.map((r, i) => `Response ${i + 1}:\n${r}`).join('\n\n---\n\n') +
    `\n\nProvide a summary that highlights what's different between these responses.`;

  const diffModel = (parsedCommand as any).diff_model || parsedCommand.model?.[0] || 'openai';

  try {
    return await executeModelQuery({ modelName: diffModel, temp: 0.5, prompt: diffPrompt }, context);
  } catch {
    return responses.join('\n\n---\n\n');
  }
}

/** Expansion: expand a response with additional detail. */
export async function applyExpansion(
  responses: string[],
  parsedCommand: PostProcessingContext,
  context: FlareContext
): Promise<string> {
  const baseResponse = responses[0];
  const expansionModel = (parsedCommand as any).exp_model || parsedCommand.model?.[0] || 'openai';

  const expansionPrompt =
    responses.length === 1
      ? `Please expand on and provide additional details for the following response:\n\n${baseResponse}`
      : `Please expand on the first response using insights from the additional responses:\n\nBase Response:\n${baseResponse}\n\nAdditional Context:\n${responses.slice(1).join('\n\n---\n\n')}`;

  try {
    return await executeModelQuery({ modelName: expansionModel, temp: 0.7, prompt: expansionPrompt }, context);
  } catch {
    return baseResponse;
  }
}

/** Filtering: remove short/duplicate responses. */
export function applyFiltering(responses: string[]): string[] {
  if (responses.length === 1) return responses;

  const filtered = responses.filter((response, index) => {
    if (response.length < 20) return false;
    for (let i = 0; i < index; i++) {
      if (calculateSimilarity(response, responses[i]) > 0.9) return false;
    }
    return true;
  });

  return filtered.length === 0 ? responses : filtered;
}

/** Apply post-processing pipeline to model results. */
export async function applyPostProcessing(
  modelResults: Array<ModelQueryResult | string>,
  commands: string[],
  parsedCommand: PostProcessingContext,
  context: FlareContext
): Promise<string> {
  if (!Array.isArray(modelResults) || modelResults.length === 0) {
    throw new Error('No model results provided for post-processing');
  }

  const toResponse = (r: ModelQueryResult | string): string =>
    typeof r === 'string' ? r : (r.response ?? '');

  if (!Array.isArray(commands) || commands.length === 0) {
    return toResponse(modelResults[0]);
  }

  let currentResults: string[] = modelResults.map(toResponse);

  for (const command of commands) {
    try {
      switch (command) {
        case 'sum':
          currentResults = [await applySummarization(currentResults, parsedCommand, context)];
          break;
        case 'vote':
          currentResults = [await applyVoting(currentResults, parsedCommand, context)];
          break;
        case 'comb':
          currentResults = [applyCombination(currentResults)];
          break;
        case 'diff':
          currentResults = [await applyDifference(currentResults, parsedCommand, context)];
          break;
        case 'exp':
          currentResults = [await applyExpansion(currentResults, parsedCommand, context)];
          break;
        case 'filter':
          currentResults = applyFiltering(currentResults);
          break;
      }
    } catch {
      // Continue with existing results on failure
    }
  }

  return currentResults[0];
}
