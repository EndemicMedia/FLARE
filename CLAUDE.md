# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FLARE (Fractal Language for Autonomous Recursive Expansion) is a specialized language for recursive AI prompting that enables multi-model querying with post-processing functions. The MVP ships as a **static site on GitHub Pages** (https://endemicmedia.github.io/FLARE/); the Node backend is an optional local/dev component. The project consists of:

1. **Visual Workflow Editor** (`flare-visual-ui/`) - React app served at `/app/` that executes FLARE entirely in the browser via a client-side engine (`flare-visual-ui/src/engine/`) calling Pollinations.ai directly
2. **Backend Server** (`src/`) - Optional Node.js/Express API that processes FLARE commands (NOT deployed; local/dev only)
3. **LLM Comparison Tool** (`llm-comparison-tool/`) - Web interface for comparing multiple language models
4. **FLARE Parser** - Core language processor for parsing FLARE syntax (exists both in `src/parser/` for the backend and `flare-visual-ui/src/engine/parseFlare.ts` for the browser)

## Development Commands

### Environment Setup (backend only)
```bash
cp .env.example .env   # Copy environment template
# Edit .env with your actual API keys and configuration
```

### Server Management (optional local backend)
```bash
npm start              # Start the backend server (port 8080)
npm run serve          # Alternative start command
npm run dev            # Same entry point (src/server.js)
```

### Testing (backend)
```bash
npm test                  # Run all tests (mocha, src/test/**)
npm run test:unit         # Unit tests with coverage (c8)
npm run test:parser       # Parser unit tests only
npm run test:services     # Service unit tests only
npm run test:integration  # Integration tests (20s timeout)
npm run test:e2e          # End-to-end tests (15s timeout)
```

### Visual Workflow Editor (flare-visual-ui)
```bash
cd flare-visual-ui
npm run dev            # Vite dev server on http://localhost:5173
npx vitest run         # Run unit tests once (what CI runs)
npm run build          # Production build (tsc + vite); VITE_BASE_PATH sets the base path
```

### Development Server
```bash
# For the LLM comparison tool frontend
cd llm-comparison-tool && python serve.py
```

## Architecture Overview

### Core Components

**Client-Side FLARE Engine** (`flare-visual-ui/src/engine/`)
- `parseFlare.ts` - Parses and validates FLARE command syntax
- `pollinationsClient.ts` / `queryMultipleModels.ts` - Direct browser calls to Pollinations.ai (parallel, with retries)
- `postProcessing.ts` - Post-processing operations (sum, vote, comb, diff, exp, filter)
- `imageGeneration.ts` - Pollinations image URL builder
- `apiKey.ts` - BYOP key resolution: URL hash `#api_key=...` → localStorage `flareApiKey` → shared default key
- `index.ts` - Public API (`executeFlareCommand`)

**FLARE Language Processor (backend, atomic file structure — one function per file)**
- `src/parser/parseFlareCommand.js` - Parses FLARE command syntax
- `src/parser/extractFlareCommands.js` - Extracts commands embedded in text
- `src/services/processFlareCommand.js` - Orchestrates FLARE command execution
- `src/services/queryMultipleModels.js` / `src/services/executeModelQuery.js` - Model API communication
- `src/services/applyPostProcessing.js` (+ `applyVoting.js`, `applySummarization.js`, etc.) - Post-processing operations
- `src/services/providers/` - Multi-provider fallback (Pollinations primary, OpenRouter/Gemini fallbacks)

**Web Interface**
- `llm-comparison-tool/index.html` - Main comparison interface
- `src/server.js` - Express server entry point serving both API and static files
- `src/server/` - App setup: middleware, API routes, static routes

**Configuration**
- `src/services/globals.js` - API/provider configuration (reads environment variables)
- `.env` - Environment variables for sensitive data (API keys, etc.)
- `.env.example` - Template for required environment variables
- `llm-comparison-tool/system.json` - System prompts for different contexts

### FLARE Syntax Structure

FLARE commands use curly brace syntax: `{ flare model:modelname temp:0.8 vote `prompt text` }`

**Core Parameters:**
- `model` - Specify model(s), comma-separated for multiple
- `temp` - Temperature setting for response variability
- Post-processing: `sum`, `comb`, `vote`, `diff`, `exp`, `filter`

**MVP scope:** flat FLARE commands only. Recursive/nested commands are roadmap, not a current feature.

### Testing Architecture

**Backend Tests** (`src/test/`)
- `src/test/unit/parser/` - Parser functionality
- `src/test/unit/services/` - Services and post-processing operations
- `src/test/integration/` - Integration tests
- `src/test/e2e/` - Full workflow integration tests

**UI Tests** (`flare-visual-ui/`)
- Vitest unit tests in `src/**/*.{test,spec}.{ts,tsx}` (jsdom)
- Playwright e2e specs in `tests/e2e` (`npm run test:e2e`)

## Deployment

- `.github/workflows/deploy.yml` runs on push to `main`: backend unit tests → UI tests (`npx vitest run`) → UI build with `VITE_BASE_PATH=/FLARE/app/` → assembles `_site/` (landing page at `/`, editor at `/app/`, plus `/llm-comparison-tool/`, `/slopcaster/`, `/simple-routing/`) → deploys to GitHub Pages
- One-time repo setting: Pages → Source = "GitHub Actions"
- The backend in `src/` is NOT deployed

## Key Implementation Notes

### API Integration
- Browser (deployed site): `flare-visual-ui/src/engine/` calls Pollinations.ai text API directly — no server
- Backend (local dev): primary endpoint `/process-flare` (POST); also `/process-text`, `/generate-image`, `/health`
- CORS enabled for external requests
- Referrer-based API access pattern

### Frontend Features
- Visual node-based workflow editing (ReactFlow) with in-browser execution
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

### Environment Variables (backend)
- **NEVER** commit API keys or secrets to version control
- Use `.env` file for local development (already in .gitignore)
- Key environment variables:
  - `POLLINATIONS_API_KEY` - Your Pollinations.ai API key
  - `PORT` - Server port (defaults to 8080)
  - `DEFAULT_MODEL` - Default model to use
  - Optional fallback: `AI_PROVIDER`, `AI_PROVIDER_FALLBACK`, `AI_PROVIDER_PRIORITY`, `OPENROUTER_API_KEY`, `GOOGLE_GEMINI_API_KEY`

### API Key Management
- Backend keys are loaded from environment variables (`src/services/globals.js`)
- Visual editor (BYOP): users can supply their own Pollinations key via the Settings gear or `#api_key=KEY` URL hash; stored only in browser localStorage (`flareApiKey`); otherwise a shared default key is used
- Backend services should use Bearer token authentication

## Development Patterns

### Module Structure
- ES modules (`"type": "module"` in package.json)
- Async/await throughout
- Atomic file structure in `src/`: one function per file, file name matches function name
- TypeScript + React 19 + Vite in `flare-visual-ui/`

### Testing Patterns
- Mocha + Chai for backend assertions; c8 for coverage
- Vitest (+ Testing Library) for UI unit tests; Playwright for UI e2e
- Separate unit and integration test suites
- Timeout configurations for long-running tests

### File Organization
```
src/                        # Optional local backend (NOT deployed)
├── server.js               # Express server entry point
├── server/                 # App creation, middleware, routes
├── parser/                 # Pure parsing functions (one per file)
├── services/               # Business logic (queries, post-processing)
│   └── providers/          # Multi-provider fallback clients
└── test/
    ├── unit/               # Isolated component tests
    ├── integration/        # Integration tests
    └── e2e/                # End-to-end tests

flare-visual-ui/            # Visual workflow editor (deployed at /app/)
└── src/engine/             # Client-side FLARE execution engine

llm-comparison-tool/        # Comparison frontend (deployed)
Slopcaster/                 # Deployed at /slopcaster/
simple-routing/             # Deployed at /simple-routing/
landing/                    # Landing page (deployed at /)
.github/workflows/deploy.yml  # Test + build + Pages deploy
```
