# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FLARE (Fractal Language for Autonomous Recursive Expansion) is a specialized language for recursive AI prompting that enables multi-model querying with post-processing functions. The project consists of:

1. **Backend Server** - Node.js/Express API that processes FLARE commands
2. **LLM Comparison Tool** - Web interface for comparing multiple language models
3. **FLARE Parser** - Core language processor for parsing FLARE syntax

## Development Commands

### Environment Setup
```bash
cp .env.example .env   # Copy environment template
# Edit .env with your actual API keys and configuration
```

### Server Management
```bash
npm start              # Start the backend server (port 8080)
npm run serve          # Alternative start command
```

### Testing
```bash
npm test               # Run all tests (unit + e2e)
npm run test:unit      # Run unit tests with coverage (c8)
npm run test:e2e       # Run end-to-end tests (10s timeout)
```

### Development Server
```bash
# For the LLM comparison tool frontend
cd llm-comparison-tool && python serve.py
```

## Architecture Overview

### Core Components

**FLARE Language Processor**
- `backend/utilities/flareParser.js` - Parses FLARE command syntax
- `backend/services/flareProcessor.js` - Orchestrates FLARE command execution  
- `backend/services/modelService.js` - Handles model API communication
- `backend/services/postProcessingService.js` - Implements post-processing operations (sum, vote, diff, etc.)

**Web Interface**
- `llm-comparison-tool/index.html` - Main comparison interface
- `backend/server.js` - Express server serving both API and static files
- Static file serving at both `/llm-tool/*` and root paths

**Configuration**
- `backend/config.js` - Server and API configuration (uses environment variables)
- `.env` - Environment variables for sensitive data (API keys, etc.)
- `.env.example` - Template for required environment variables
- `llm-comparison-tool/system.json` - System prompts for different contexts

### FLARE Syntax Structure

FLARE commands use curly brace syntax: `{ flare model:modelname temp:0.8 vote `prompt text` }`

**Core Parameters:**
- `model` - Specify model(s), comma-separated for multiple
- `temp` - Temperature setting for response variability
- Post-processing: `sum`, `comb`, `vote`, `diff`, `exp`, `filter`

### Testing Architecture

**Unit Tests** (`backend/test/unit/`)
- `flareParser.test.js` - Parser functionality
- `postProcessingService.test.js` - Post-processing operations

**E2E Tests** (`backend/test/e2e/`)
- `flare.e2e.js` - Full workflow integration tests

## Key Implementation Notes

### API Integration
- Primary endpoint: `/process-flare` (POST)
- Integrates with Pollinations.ai text API
- CORS enabled for external requests
- Referrer-based API access pattern

### Frontend Features
- Real-time model comparison interface
- Dark/light theme support
- Fullscreen modal for detailed responses
- Response copying and statistics display
- Prompt history with localStorage persistence

### Error Handling
- Retry logic with exponential backoff (3 attempts max)
- Request cancellation support via AbortController
- Graceful degradation for failed model queries
- Comprehensive error status display

## Security Considerations

### Environment Variables
- **NEVER** commit API keys or secrets to version control
- Use `.env` file for local development (already in .gitignore)
- Required environment variables:
  - `POLLINATIONS_API_KEY` - Your Pollinations.ai API key
  - `PORT` - Server port (defaults to 8080)
  - `POLLINATIONS_API_URL` - API endpoint URL
  - `DEFAULT_MODEL` - Default model to use

### API Key Management
- API keys are loaded from environment variables in `backend/config.js`
- Frontend uses referrer-based authentication (no API keys exposed)
- Backend services should use Bearer token authentication

## Development Patterns

### Module Structure
- ES modules (`"type": "module"` in package.json)
- Async/await throughout
- Functional programming approach for parsers and processors

### Testing Patterns
- Mocha + Chai for assertions
- c8 for coverage reporting
- Separate unit and integration test suites
- Timeout configurations for long-running tests

### File Organization
```
backend/
├── server.js           # Express server entry point
├── config.js          # Configuration constants
├── utilities/         # Pure functions (parsing, etc.)
├── services/          # Business logic (processing, models)
└── test/
    ├── unit/          # Isolated component tests
    └── e2e/           # Integration tests

llm-comparison-tool/    # Frontend web interface
```