// START: setupStaticFiles function
/**
 * Setup static file serving middleware
 * Serves files from specified static directory
 */
import express from 'express';

export function setupStaticFiles(app, staticPath) {
  // Serve static files from llm-comparison-tool directory
  app.use('/llm-tool', express.static(staticPath));
  app.use(express.static(staticPath));
}
// END: setupStaticFiles function