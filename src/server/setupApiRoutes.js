// START: setupApiRoutes function
/**
 * Setup API routes for FLARE processing
 * Main processing endpoint and health checks
 */
import { processFlareCommand } from '../services/processFlareCommand.js';
import { processFlareResponse } from '../services/processFlareResponse.js';
import { generateImage } from './routes/generateImage.js';
import { httpStatus } from './globals.js';
import { parseFlareCommand, validateParsedCommand } from '../../packages/core/dist/index.js';

export function setupApiRoutes(app) {
  // Main FLARE processing endpoint
  app.post('/process-flare', async (req, res) => {
    try {
      const { command } = req.body;

      if (!command || typeof command !== 'string' || command.trim() === '') {
        return res.status(httpStatus.BAD_REQUEST).json({
          error: "Missing or invalid FLARE command. Please provide a valid command string."
        });
      }

      const result = await processFlareCommand(command.trim());

      res.status(httpStatus.OK).json({
        success: true,
        result,
        command: command.trim()
      });

    } catch (error) {
      console.error("Error processing FLARE command:", error);

      res.status(httpStatus.INTERNAL_ERROR).json({
        error: error.message || "Internal server error processing FLARE command.",
        success: false
      });
    }
  });

  // Text processing endpoint - processes documents with embedded FLARE commands
  app.post('/process-text', async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string' || text.trim() === '') {
        return res.status(httpStatus.BAD_REQUEST).json({
          error: "Missing or invalid text. Please provide text containing FLARE commands."
        });
      }

      const processedText = await processFlareResponse(text.trim());

      res.status(httpStatus.OK).json({
        success: true,
        originalText: text.trim(),
        processedText,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error("Error processing text with FLARE commands:", error);

      res.status(httpStatus.INTERNAL_ERROR).json({
        error: error.message || "Internal server error processing text.",
        success: false
      });
    }
  });

  // Parse-only endpoint: validates and returns the parsed FLARE structure
  // without executing any model queries. Used by the visual editor to
  // convert FLARE syntax into an editable graph.
  app.post('/parse-flare', (req, res) => {
    try {
      const { command } = req.body;

      if (!command || typeof command !== 'string' || command.trim() === '') {
        return res.status(httpStatus.BAD_REQUEST).json({
          error: 'Missing or invalid FLARE command. Please provide a valid command string.',
          success: false
        });
      }

      const parsed = parseFlareCommand(command.trim());
      validateParsedCommand(parsed);

      res.status(httpStatus.OK).json({
        success: true,
        parsed,
        command: command.trim()
      });
    } catch (error) {
      res.status(httpStatus.BAD_REQUEST).json({
        error: error.message || 'Failed to parse FLARE command.',
        success: false
      });
    }
  });

  // Image generation endpoint
  app.post('/generate-image', generateImage);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(httpStatus.OK).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    });
  });
}
// END: setupApiRoutes function