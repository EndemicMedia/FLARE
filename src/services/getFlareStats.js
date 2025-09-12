// START: getFlareStats function
/**
 * Get FLARE system statistics and configuration
 * Returns system metadata and configuration details
 */
export function getFlareStats() {
  return {
    version: '2.0.0',
    supportedCommands: ['sum', 'vote', 'comb', 'diff', 'exp', 'filter'],
    defaultModel: 'openai',
    maxRetries: 3,
    timeout: 30000
  };
}
// END: getFlareStats function