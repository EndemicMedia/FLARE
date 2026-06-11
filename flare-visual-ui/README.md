# FLARE Visual Workflow Builder

Visual node-based interface for FLARE (Fractal Language for Autonomous Recursive Expansion).

Live at https://endemicmedia.github.io/FLARE/app/

FLARE commands are executed **entirely in the browser**: the app parses the command, queries models in parallel directly against the Pollinations.ai API, and applies post-processing. No backend server is required.

## Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- ReactFlow (node-based UI)
- Zustand (state management)
- Vitest + Testing Library (unit tests), Playwright (e2e)

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Runs the development server on http://localhost:5173

## Testing

```bash
npx vitest run        # Run unit tests once (what CI runs)
npm test              # Vitest in watch mode
npm run test:e2e      # Playwright end-to-end tests
```

## Build

```bash
npm run build
```

Type-checks and creates an optimized production build in the `dist` folder.

For deployment under a subpath (e.g. GitHub Pages), set `VITE_BASE_PATH`:

```bash
VITE_BASE_PATH=/FLARE/app/ npm run build
```

The Pages deploy workflow (`.github/workflows/deploy.yml` at the repo root) uses exactly this.

## Preview

```bash
npm run preview
```

Preview the production build locally.

## Execution Engine (`src/engine/`)

The client-side FLARE engine — the public API is `executeFlareCommand()` in `index.ts` (parse → query models in parallel → post-process):

- `parseFlare.ts` — parses and validates flat FLARE command syntax (`{ flare model:... temp:... vote `prompt` }`)
- `pollinationsClient.ts` / `queryMultipleModels.ts` — direct browser calls to the Pollinations.ai text API, parallel across models with retries and graceful degradation
- `postProcessing.ts` — post-processing operations (`sum`, `vote`, `comb`, `diff`, `exp`, `filter`)
- `imageGeneration.ts` — builds Pollinations image-generation URLs
- `apiKey.ts` — API key management (see below)
- `config.ts` — API endpoints, model defaults, error messages

## API Key (BYOP — Bring Your Own Pollinations key)

By default the app uses a shared default API key. To use your own key:

1. **Settings gear** — open Settings in the app, paste your Pollinations API key, and Save. Use *Clear* to revert to the shared default key.
2. **URL hash** — open the app with `#api_key=YOUR_KEY` appended (e.g. `https://endemicmedia.github.io/FLARE/app/#api_key=YOUR_KEY`). The key is persisted and the hash is removed from the URL.

Resolution order: URL hash → localStorage (`flareApiKey`) → shared default key. The key is stored only in your browser (localStorage) and is sent only to Pollinations.ai. With your own key you pay for your usage directly and control your spending.
