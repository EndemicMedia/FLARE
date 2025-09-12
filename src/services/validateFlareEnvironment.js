// START: validateFlareEnvironment function
/**
 * Validate FLARE environment and connectivity
 * Tests API key and network connectivity
 */
import { queryMultipleModels } from './queryMultipleModels.js';

export async function validateFlareEnvironment() {
  const checks = {
    apiKey: !!process.env.POLLINATIONS_API_KEY,
    networkAccess: false
  };

  // Test basic network connectivity
  try {
    const testResult = await queryMultipleModels(
      ['openai'],
      'Test connection - please respond with "OK"',
      0.1
    );
    checks.networkAccess = testResult.length > 0;
  } catch (error) {
    console.warn('Network connectivity test failed:', error.message);
  }

  return {
    healthy: checks.apiKey && checks.networkAccess,
    checks: checks,
    recommendations: [
      ...(checks.apiKey ? [] : ['Set POLLINATIONS_API_KEY environment variable']),
      ...(checks.networkAccess ? [] : ['Check network connectivity to pollinations.ai'])
    ]
  };
}
// END: validateFlareEnvironment function