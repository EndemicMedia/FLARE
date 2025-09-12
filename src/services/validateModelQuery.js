// START: validateModelQuery function
/**
 * Validate model query parameters
 * Returns true if valid, throws error if invalid
 */
import { errorMessages } from './globals.js';

export function validateModelQuery({ modelName, temp, prompt }) {
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    throw new Error(errorMessages.emptyPrompt);
  }
  
  if (temp !== undefined && (typeof temp !== 'number' || temp < 0 || temp > 2)) {
    throw new Error('Temperature must be a number between 0 and 2');
  }
  
  if (modelName && typeof modelName !== 'string') {
    throw new Error('Model name must be a string');
  }
  
  return true;
}
// END: validateModelQuery function