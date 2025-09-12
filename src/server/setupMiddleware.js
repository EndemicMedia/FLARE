// START: setupMiddleware function
/**
 * Setup all middleware for Express app
 * Coordinates JSON parsing, CORS, and static files
 */
import { setupJsonParser } from './setupJsonParser.js';
import { setupCors } from './setupCors.js';
import { setupStaticFiles } from './setupStaticFiles.js';

export function setupMiddleware(app, config) {
  setupJsonParser(app);
  setupCors(app);
  setupStaticFiles(app, config.paths.static);
}
// END: setupMiddleware function