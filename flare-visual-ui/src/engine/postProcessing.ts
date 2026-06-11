/**
 * Post-processing operations for FLARE results.
 * Ported from backend src/services/apply*.js + calculateSimilarity.js.
 *
 * Failure semantics: when an individual op fails, it logs a warning and the
 * pipeline continues with the prior results.
 */
import { executeModelQuery } from './pollinationsClient';
import { postProcessingConfig } from './config';
import type { ParsedFlareCommand } from './parseFlare';
import type { ModelQueryResult } from './queryMultipleModels';

/** Per-op model override context (subset of ParsedFlareCommand). */
export type PostProcessingContext = Partial<ParsedFlareCommand>;

/**
 * Calculate Jaccard word similarity between two text strings (0..1).
 */
export function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter((word) => words2.has(word)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

/**
 * Voting: use a model to select the best response.
 */
export async function applyVoting(
  responses: string[],
  parsedCommand: PostProcessingContext = {}
): Promise<string> {
  if (responses.length === 1) {
    return responses[0];
  }

  const votingPrompt =
    postProcessingConfig.voting.prompt +
    responses.map((r, i) => `Response ${i + 1}:\n${r}`).join('\n\n---\n\n');

  // Use specific model if provided (e.g., vote:openai)
  const votingModel = parsedCommand.vote_model || parsedCommand.model?.[0] || 'openai';

  try {
    const selectedResponse = await executeModelQuery({
      modelName: votingModel,
      temp: postProcessingConfig.voting.temperature,
      prompt: votingPrompt,
    });

    console.log(`Voting completed using ${votingModel}`);
    return selectedResponse;
  } catch (error: unknown) {
    console.warn('Voting failed, returning first response:', (error as Error).message);
    return responses[0];
  }
}

/**
 * Summarization: combine and summarize responses using a model.
 */
export async function applySummarization(
  responses: string[],
  parsedCommand: PostProcessingContext = {}
): Promise<string> {
  if (responses.length === 1) {
    return responses[0];
  }

  const combinedText = responses.join('\n\n---\n\n');
  const prompt = postProcessingConfig.summarization.prompt + combinedText;

  // Use specific model if provided (e.g., sum:openai)
  const summaryModel = parsedCommand.sum_model || parsedCommand.model?.[0] || 'openai';

  try {
    const summary = await executeModelQuery({
      modelName: summaryModel,
      temp: postProcessingConfig.summarization.temperature,
      prompt,
    });

    console.log(`Summarization completed using ${summaryModel}`);
    return summary;
  } catch (error: unknown) {
    console.warn('Summarization failed, returning combined text:', (error as Error).message);
    return combinedText;
  }
}

/**
 * Combination: pure string concatenation with the configured separator.
 */
export function applyCombination(
  responses: string[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _parsedCommand: PostProcessingContext = {}
): string {
  const { separator, header } = postProcessingConfig.combination;

  const combined =
    responses.length > 1 ? `${header}\n\n${responses.join(separator)}` : responses[0];

  console.log(`Combined ${responses.length} response(s)`);
  return combined;
}

/**
 * Difference analysis: use a model to highlight key differences.
 */
export async function applyDifference(
  responses: string[],
  parsedCommand: PostProcessingContext = {}
): Promise<string> {
  if (responses.length < 2) {
    return responses[0];
  }

  const diffPrompt =
    `Please analyze and highlight the key differences between these responses:\n\n` +
    responses.map((r, i) => `Response ${i + 1}:\n${r}`).join('\n\n---\n\n') +
    `\n\nProvide a summary that highlights what's different between these responses.`;

  const diffModel = parsedCommand.diff_model || parsedCommand.model?.[0] || 'openai';

  try {
    const differences = await executeModelQuery({
      modelName: diffModel,
      temp: 0.5,
      prompt: diffPrompt,
    });

    console.log(`Difference analysis completed using ${diffModel}`);
    return differences;
  } catch (error: unknown) {
    console.warn(
      'Difference analysis failed, returning combined responses:',
      (error as Error).message
    );
    return responses.join('\n\n---\n\n');
  }
}

/**
 * Expansion: use a model to add details/context to the first response.
 */
export async function applyExpansion(
  responses: string[],
  parsedCommand: PostProcessingContext = {}
): Promise<string> {
  const baseResponse = responses[0];
  const expansionModel = parsedCommand.exp_model || parsedCommand.model?.[0] || 'openai';

  const expansionPrompt =
    responses.length === 1
      ? `Please expand on and provide additional details for the following response:\n\n${baseResponse}`
      : `Please expand on the first response using insights from the additional responses:\n\n` +
        `Base Response:\n${baseResponse}\n\n` +
        `Additional Context:\n${responses.slice(1).join('\n\n---\n\n')}`;

  try {
    const expanded = await executeModelQuery({
      modelName: expansionModel,
      temp: 0.7,
      prompt: expansionPrompt,
    });

    console.log(`Expansion completed using ${expansionModel}`);
    return expanded;
  } catch (error: unknown) {
    console.warn('Expansion failed, returning original response:', (error as Error).message);
    return baseResponse;
  }
}

/**
 * Filtering: remove low-quality responses — too short (< 20 chars) or
 * too similar (> 90% Jaccard word similarity) to an earlier response.
 */
export function applyFiltering(
  responses: string[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _parsedCommand: PostProcessingContext = {}
): string[] {
  if (responses.length === 1) {
    return responses;
  }

  const filtered = responses.filter((response, index) => {
    // Remove responses that are too short (less than 20 characters)
    if (response.length < 20) {
      console.log(`Filtered out response ${index + 1}: too short (${response.length} chars)`);
      return false;
    }

    // Remove responses that are very similar to earlier ones
    for (let i = 0; i < index; i++) {
      const similarity = calculateSimilarity(response, responses[i]);
      if (similarity > 0.9) {
        console.log(
          `Filtered out response ${index + 1}: too similar to response ${i + 1} (${Math.round(similarity * 100)}% similar)`
        );
        return false;
      }
    }

    return true;
  });

  if (filtered.length === 0) {
    console.warn('All responses were filtered out, returning original responses');
    return responses;
  }

  console.log(`Filtering: kept ${filtered.length}/${responses.length} response(s)`);
  return filtered;
}

/**
 * Apply post-processing commands to model results, in sequence.
 * Accepts either raw response strings or ModelQueryResult objects.
 * An op failure logs a warning and continues with the prior results.
 */
export async function applyPostProcessing(
  modelResults: Array<ModelQueryResult | string>,
  postProcessingCommands: string[],
  parsedCommand: PostProcessingContext = {}
): Promise<string> {
  if (!Array.isArray(modelResults) || modelResults.length === 0) {
    throw new Error('No model results provided for post-processing');
  }

  const toResponse = (r: ModelQueryResult | string): string =>
    typeof r === 'string' ? r : (r.response ?? '');

  if (!Array.isArray(postProcessingCommands) || postProcessingCommands.length === 0) {
    // No post-processing, return first result
    return toResponse(modelResults[0]);
  }

  let currentResults: string[] = modelResults.map(toResponse);
  console.log(`Applying post-processing: ${postProcessingCommands.join(' → ')}`);

  // Apply each post-processing command in sequence
  for (const command of postProcessingCommands) {
    console.log(`Applying: ${command}`);

    try {
      switch (command) {
        case 'sum':
          currentResults = [await applySummarization(currentResults, parsedCommand)];
          break;

        case 'vote':
          currentResults = [await applyVoting(currentResults, parsedCommand)];
          break;

        case 'comb':
          currentResults = [applyCombination(currentResults, parsedCommand)];
          break;

        case 'diff':
          currentResults = [await applyDifference(currentResults, parsedCommand)];
          break;

        case 'exp':
          currentResults = [await applyExpansion(currentResults, parsedCommand)];
          break;

        case 'filter':
          currentResults = applyFiltering(currentResults, parsedCommand);
          break;

        default:
          console.warn(`Unknown post-processing command: ${command}`);
          break;
      }

      console.log(`${command} completed`);
    } catch (error: unknown) {
      console.warn(
        `Post-processing command '${command}' failed:`,
        (error as Error).message
      );
      // Continue with existing results rather than failing completely
    }
  }

  return currentResults[0];
}
