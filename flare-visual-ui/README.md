# FLARE Visual Workflow Builder

Visual node-based interface for FLARE (Fractal Language for Autonomous Recursive Expansion).

## Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- ReactFlow (node-based UI)
- Zustand (state management)
- Axios (HTTP client)

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Runs the development server on http://localhost:5173

## Build

```bash
npm run build
```

Creates an optimized production build in the `dist` folder.

## Preview

```bash
npm run preview
```

Preview the production build locally.

## API Integration

- Backend API: http://localhost:8080
- Main endpoint: POST /process-flare
- Proxy configured in Vite to route `/api/*` requests to backend

## Environment Variables

Copy `.env.example` to `.env` and configure as needed:

```bash
cp .env.example .env
```

Available variables:
- `VITE_API_URL` - Backend API URL (default: http://localhost:8080)
- `VITE_API_TIMEOUT` - API request timeout in ms (default: 30000)
