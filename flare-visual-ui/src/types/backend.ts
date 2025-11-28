/**
 * Backend API Type Definitions
 *
 * These types match the FLARE backend API contracts exactly.
 * Based on:
 * - /src/parser/parseFlareCommand.js
 * - /src/server/setupApiRoutes.js
 */

/**
 * Parser output structure from parseFlareCommand()
 *
 * Example:
 * {
 *   model: ['openai', 'mistral'],
 *   temp: 0.8,
 *   postProcessing: ['vote', 'sum'],
 *   command: 'Explain renewable energy',
 *   vote_model: 'openai'  // Optional for operation-specific models
 * }
 */
export interface FlareParserOutput {
  model: string[];
  temp: number;
  postProcessing: string[];
  command: string;
  [key: string]: string | number | string[]; // For operation_model fields like vote_model, sum_model
}

/**
 * Request payload for POST /process-flare
 */
export interface ProcessFlareRequest {
  command: string;
}

/**
 * Successful response from POST /process-flare
 */
export interface ProcessFlareResponse {
  success: true;
  result: string;
  command: string;
}

/**
 * Error response from POST /process-flare
 */
export interface ProcessFlareError {
  success: false;
  error: string;
}

/**
 * Union type for all possible API responses
 */
export type ApiResponse = ProcessFlareResponse | ProcessFlareError;

/**
 * Parsed FLARE command structure
 * Used for converting FLARE syntax to graph representation
 */
export interface ParsedFlareCommand {
  prompt: string;
  model: string[];
  temperature?: number;
  postProcessing: string[];
}
