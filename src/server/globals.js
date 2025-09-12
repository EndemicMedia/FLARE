// START: server configuration
/**
 * Server configuration and constants
 * Environment variables and server settings
 */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const serverConfig = {
  port: process.env.PORT || 8080,
  pollinations: {
    apiKey: process.env.POLLINATIONS_API_KEY || '',
    apiUrl: process.env.POLLINATIONS_API_URL || 'https://text.pollinations.ai/openai',
    defaultModel: process.env.DEFAULT_MODEL || 'openai'
  },
  paths: {
    static: path.join(__dirname, '../../llm-comparison-tool'),
    testFile: path.join(__dirname, '../../test-llm-tool.html')
  }
};

export const httpStatus = {
  OK: 200,
  BAD_REQUEST: 400,
  INTERNAL_ERROR: 500
};
// END: server configuration