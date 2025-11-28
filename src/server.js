// START: main server
/**
 * FLARE Backend Server - Main Entry Point
 * Express server with FLARE command processing capabilities
 * Version 2.0.0 - Atomic File Structure
 */
import express from 'express';
import { setupMiddleware } from './server/setupMiddleware.js';
import { setupRoutes } from './server/setupRoutes.js';
import { serverConfig } from './server/globals.js';

console.log('🔧 Starting FLARE server...');

// Create Express app
const app = express();
const PORT = process.env.PORT || serverConfig.port;

console.log(`📡 Configuring server for port ${PORT}`);

// Setup middleware
console.log('🔧 Setting up middleware...');
setupMiddleware(app, serverConfig);

// Setup routes
console.log('🔧 Setting up routes...');
setupRoutes(app, serverConfig);

// Add detailed API info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'FLARE API',
    version: '2.0.0',
    description: 'Multi-model AI orchestration system with post-processing capabilities',
    endpoints: [
      {
        method: 'POST',
        path: '/process-flare',
        description: 'Process FLARE commands with multi-model support',
        example: '{ "command": "{ flare model:mistral temp:0.7 `Write a haiku about AI` }" }'
      },
      {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint'
      },
      {
        method: 'GET',
        path: '/api/info',
        description: 'API information and documentation'
      }
    ],
    supportedCommands: ['sum', 'vote', 'comb', 'diff', 'exp', 'filter'],
    supportedModels: ['openai', 'mistral'],
    postProcessing: {
      sum: 'Summarize multiple responses',
      vote: 'Select best response via voting',
      comb: 'Combine responses without summarizing',
      diff: 'Analyze differences between responses',
      exp: 'Expand responses with additional detail',
      filter: 'Filter out low-quality responses'
    },
    examples: [
      '{ flare model:mistral `Explain quantum computing` }',
      '{ flare model:openai,mistral temp:0.5 vote `Best programming language?` }',
      '{ flare model:mistral temp:0.8 sum `Benefits of renewable energy` }'
    ]
  });
});

// Enhanced health endpoint with environment checks
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    environment: {
      healthy: true,
      checks: {
        apiKey: !!process.env.POLLINATIONS_API_KEY,
        networkAccess: true // Assume true for now
      },
      uptime: process.uptime(),
      nodeVersion: process.version
    }
  };

  res.status(200).json(health);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FLARE Backend v2.0.0 is running at http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API info: http://localhost:${PORT}/api/info`);
  console.log(`🌐 Web interface: http://localhost:${PORT}`);
  console.log(`🔄 FLARE endpoint: POST http://localhost:${PORT}/process-flare`);
});
// END: main server