// START: setupJsonParser function
/**
 * Setup JSON parsing middleware for Express app
 * Enables parsing of JSON request bodies
 */
import express from 'express';

export function setupJsonParser(app) {
  app.use(express.json());
}
// END: setupJsonParser function