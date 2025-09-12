// START: getAvailablePostProcessingCommands function
/**
 * Get list of available post-processing commands
 * Returns metadata about each command
 */
export function getAvailablePostProcessingCommands() {
  return [
    {
      name: 'sum',
      description: 'Summarize multiple responses into a single coherent response',
      usage: 'sum or sum:modelname'
    },
    {
      name: 'vote',
      description: 'Select the best response from multiple model outputs',
      usage: 'vote or vote:modelname'
    },
    {
      name: 'comb',
      description: 'Combine all responses without summarizing',
      usage: 'comb'
    },
    {
      name: 'diff',
      description: 'Analyze and highlight differences between responses',
      usage: 'diff or diff:modelname'
    },
    {
      name: 'exp',
      description: 'Expand on responses with additional detail',
      usage: 'exp or exp:modelname'
    },
    {
      name: 'filter',
      description: 'Filter out low-quality or duplicate responses',
      usage: 'filter'
    }
  ];
}
// END: getAvailablePostProcessingCommands function