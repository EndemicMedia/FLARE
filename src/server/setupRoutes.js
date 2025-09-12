// START: setupRoutes function
/**
 * Setup all routes for Express app
 * Coordinates static routes and API routes
 */
import { setupStaticRoutes } from './setupStaticRoutes.js';
import { setupApiRoutes } from './setupApiRoutes.js';

export function setupRoutes(app, config) {
  setupStaticRoutes(app, config);
  setupApiRoutes(app);
}
// END: setupRoutes function