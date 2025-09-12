// START: setupStaticRoutes function
/**
 * Setup static file routes
 * Serves main page and test routes
 */
import path from 'path';

export function setupStaticRoutes(app, config) {
  // Serve the LLM comparison tool at the root path
  app.get('/', (req, res) => {
    res.sendFile(path.join(config.paths.static, 'index.html'));
  });

  // Serve test page for debugging
  app.get('/test', (req, res) => {
    res.sendFile(config.paths.testFile);
  });
}
// END: setupStaticRoutes function