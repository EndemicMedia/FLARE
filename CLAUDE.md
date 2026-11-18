# CLAUDE.md

## What ships
- The product is a **static site on GitHub Pages**. The visual editor (`flare-visual-ui/`, served at `/app/`) runs FLARE in the browser and calls Pollinations.ai directly; there is no deployed backend.
- The Node/Express server in `src/` is optional and local/dev only. Never make the deployed site depend on it.
- MVP scope is **flat FLARE commands only**. Recursive/nested commands are roadmap; do not present them as working.

## Deploy
- `.github/workflows/deploy.yml` deploys on push to `main`: backend unit tests, UI tests, UI build with `VITE_BASE_PATH=/FLARE/app/`, then assembles `_site/`. A new top-level page must be added to that assembly step.
- The UI test command CI runs is `npx vitest run` in `flare-visual-ui/`; run that, not watch mode.

## API keys
- BYOP resolution order (`flare-visual-ui/src/engine/apiKey.ts`): URL hash `#api_key=...` → localStorage `flareApiKey` → shared default key. Keys stay in the browser only.
- Backend keys come from `.env` (template `.env.example`); never commit them.
- Backend CORS is configured in `src/server/setupCors.js`.

## Code structure
- `src/` uses one function per file, file name matching the function name. Keep it that way.
- ES modules throughout (`"type": "module"`).
