# FLARE: Fractal Language for Autonomous Recursive Expansion

The FLARE language provides a powerful framework for recursive AI prompting. The ability to specify models, control response variability, and apply advanced post-processing functions enables developers to extract the most value from their AI tools. By leveraging multiple models, they can ensure diverse and accurate responses, similar to the "wisdom of the (llm) crowd" while post-processing functions like summarizing, combining, or contrasting these responses allow for nuanced and comprehensive outputs. This flexibility makes FLARE a versatile and valuable language for AI tool development.

> **MVP scope:** the current release executes *flat* FLARE commands (one command at a time, multiple models, post-processing). Recursive / nested FLARE commands are on the roadmap.

## 🌐 Try it live

FLARE ships as a static site on GitHub Pages — no installation or server required:

| Page | URL |
|------|-----|
| 🏠 Landing page | https://endemicmedia.github.io/FLARE/ |
| 🎨 Visual workflow editor | https://endemicmedia.github.io/FLARE/app/ |
| ⚖️ LLM comparison tool | https://endemicmedia.github.io/FLARE/llm-comparison-tool/ |
| 🎙️ Slopcaster | https://endemicmedia.github.io/FLARE/slopcaster/ |
| 🔀 Simple routing | https://endemicmedia.github.io/FLARE/simple-routing/ |

## ✨ Key Features

- 🤖 **Multi-Model Support** - Query multiple models simultaneously via Pollinations.ai
- 🧠 **Intelligent Post-Processing** - Vote, summarize, combine, and analyze responses
- ⚡ **Runs Entirely in the Browser** - The visual editor needs no backend server
- 🎨 **Visual Workflow Editor** - Build FLARE commands as node graphs
- 📊 **Parallel Queries** - Models are queried concurrently with graceful degradation
- 🔧 **Optional Local Backend** - An Express API for development and integrations

## 🎨 Visual Workflow Editor

The visual editor at [`/app/`](https://endemicmedia.github.io/FLARE/app/) (source: `flare-visual-ui/`) lets you build FLARE workflows as node graphs and run them instantly.

**How execution works:** FLARE commands are executed entirely in your browser by a client-side engine (`flare-visual-ui/src/engine/`). The engine parses the command, queries the selected models in parallel **directly against the Pollinations.ai API**, and applies post-processing — there is no intermediate server.

### 🔑 Bring your own Pollinations API key (optional)

By default the editor uses a shared default key. To use your own key (you pay for your own usage and control your spending):

- **Settings gear** — open Settings in the editor, paste your key, and Save; or
- **URL hash** — open the app with `#api_key=YOUR_KEY` appended, e.g. `https://endemicmedia.github.io/FLARE/app/#api_key=YOUR_KEY`. The key is read from the hash and the hash is cleaned from the URL.

Either way the key is stored **only in your browser** (localStorage key `flareApiKey`). Use the Settings gear's *Clear* button to revert to the shared default key.

## 🎯 FLARE Command Syntax

FLARE uses an intuitive curly-brace syntax to define AI orchestration commands:

```javascript
{ flare model:model_name temp:temperature post_processing `your prompt here` }
```

### 📝 Basic Examples

```javascript
// Single model query
{ flare model:mistral `Explain quantum computing` }

// Multiple models with voting
{ flare model:openai,mistral vote `What is the best programming language?` }

// Temperature control (0.0 = deterministic, 1.0+ = creative)
{ flare model:mistral temp:0.1 `Count from 1 to 5` }
{ flare model:mistral temp:0.9 `Write a creative story opening` }
```

### 🧠 Post-Processing Commands

| Command | Description | Example |
|---------|-------------|---------|
| `sum` | Summarize multiple responses | `{ flare model:openai,mistral sum `Explain AI` }` |
| `vote` | Select the best response | `{ flare model:openai,mistral vote `Rate JavaScript 1-10` }` |
| `comb` | Combine all responses | `{ flare model:openai,mistral comb `List AI benefits` }` |
| `diff` | Compare responses | `{ flare model:openai,mistral diff `React vs Vue` }` |
| `exp` | Expand responses | `{ flare model:mistral exp `Explain machine learning` }` |
| `filter` | Filter quality responses | `{ flare model:openai,mistral filter `Pros and cons` }` |

### 🎛️ Parameters

- **`model`**: Specify one or more models (see available models below)
- **`temp`**: Control randomness (0.0-2.0, default: 1.0)
- **Post-processing**: Apply intelligent response processing. If a specific model is not provided for a post-processing command (e.g., `sum:openai`), it will default to the first model specified in the main `model:` parameter. If no models are specified in the main `model:` parameter, it will fall back to `'openai'`.

> **Note:** nested FLARE commands (a command inside another command's prompt) are not yet supported — this is part of the recursion roadmap.

### 🤖 Available Models

FLARE integrates with Pollinations.ai and supports these anonymous-tier models:

| Model | Description | Specialization |
|-------|-------------|----------------|
| `mistral` | Mistral Small 3.1 24B | General-purpose, creative writing |
| `gemini` | Gemini 2.5 Flash Lite | Fast responses, analysis |
| `nova-fast` | Amazon Nova Micro | Quick processing |
| `openai` | OpenAI GPT-5 Nano | General-purpose (Note: Does not support `temp` parameter) |
| `openai-fast` | OpenAI GPT-4.1 Nano | Faster responses |
| `qwen-coder` | Qwen 2.5 Coder 32B | **Code generation & debugging** |
| `bidara` | NASA's BIDARA | **Biomimetic design & research** |
| `midijourney` | MIDIjourney | **Music composition** |

## 🔧 Use Cases

#### Content Generation
```javascript
// Generate multiple perspectives on a topic
{ flare model:openai,mistral vote `Explain climate change impacts` }

// Create comprehensive summaries
{ flare model:openai,mistral sum `Benefits of renewable energy` }
```

#### Research & Analysis
```javascript
// Compare different viewpoints
{ flare model:openai,mistral diff `Pros and cons of remote work` }

// Expand on technical concepts
{ flare model:mistral exp `Explain blockchain technology` }
```

#### Creative Writing
```javascript
// Generate creative content with controlled randomness
{ flare model:mistral temp:0.9 `Write a sci-fi story opening` }

// Combine different creative approaches
{ flare model:openai,mistral comb `Create a marketing slogan for AI tools` }
```

#### Quality Assurance
```javascript
// Filter and improve content quality
{ flare model:openai,mistral filter `Write professional email about project delays` }

// Vote for the best solution
{ flare model:openai,mistral vote `Best approach to database optimization` }
```

## 🚀 Deployment

The site deploys automatically: every push to `main` triggers the GitHub Actions workflow (`.github/workflows/deploy.yml`), which runs the backend unit tests and the UI test suite, builds the visual editor (with `VITE_BASE_PATH=/FLARE/app/`), assembles the static site (landing page, `/app/`, `/llm-comparison-tool/`, `/slopcaster/`, `/simple-routing/`), and deploys it to GitHub Pages.

One-time repository setup: **Settings → Pages → Source = "GitHub Actions"**.

## 🛠️ Optional: local backend server (development)

> The Node.js/Express backend in `src/` is an **optional local/dev component**. It is **not** part of the deployed GitHub Pages site — the live visual editor executes FLARE in the browser. Use the backend if you want a REST API for integrations or local experimentation.

### Quick start

```bash
git clone <your-repository-url>
cd FLARE
npm install

# Optional: environment variables (works without an API key)
cp .env.example .env

npm start   # server on http://localhost:8080
```

```bash
# Test with curl
curl -X POST http://localhost:8080/process-flare \
  -H "Content-Type: application/json" \
  -d '{"command": "{ flare model:mistral temp:0.7 `Write a haiku about AI` }"}'
```

### Configuration

```bash
# .env — basic
POLLINATIONS_API_KEY=your_api_key_here     # Primary provider
PORT=8080                                  # Server port

# .env — multi-provider fallback (optional)
AI_PROVIDER=pollinations                   # Primary provider
AI_PROVIDER_FALLBACK=true                  # Enable automatic fallback
AI_PROVIDER_PRIORITY=pollinations,openrouter,gemini  # Fallback order
OPENROUTER_API_KEY=your_key                # Fallback #1 (optional)
GOOGLE_GEMINI_API_KEY=your_key             # Fallback #2 (optional)
DEFAULT_MODEL=openai
```

The fallback system rotates providers automatically on failures, rate limits (429), and quota errors (403), with exponential backoff retries.

### REST API endpoints

```bash
POST /process-flare    # Process a single FLARE command: {"command": "{ flare ... }"}
POST /process-text     # Process a document with embedded FLARE commands: {"text": "..."}
POST /generate-image   # Image generation
GET  /health           # Health check / diagnostics
```

`/process-text` enables document processing: FLARE commands embedded in natural text are executed and seamlessly replaced with the AI-generated content, producing a coherent final document.

Example client (any language works the same way):

```javascript
const response = await fetch('http://localhost:8080/process-flare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: "{ flare model:mistral vote `Best web framework?` }" })
});
const result = await response.json();
```

### Tests

```bash
npm test                    # All tests
npm run test:unit           # Unit tests with coverage (c8)
npm run test:parser         # Parser tests only
npm run test:services       # Service tests only
npm run test:integration    # Integration tests
npm run test:e2e            # End-to-end tests
```

### Architecture

The backend uses an **Atomic File Structure** — each file contains exactly one function:

```
src/
├── server.js              # Entry point
├── server/                # Express app, middleware, routes
├── parser/                # FLARE command parsing (parseFlareCommand, extractFlareCommands, ...)
├── services/              # Query execution, post-processing
│   └── providers/         # Multi-provider fallback (Pollinations, OpenRouter, Gemini)
└── test/                  # unit / integration / e2e suites
```

**Core processing pipeline:** extract commands → parse → query models in parallel → apply post-processing → replace commands with results.

### Troubleshooting

- **API connection errors** — check connectivity, your API key, and server logs
- **Invalid FLARE syntax** — verify `{ flare ... }` structure, model names, and temp range (0.0-2.0)
- **Server won't start** — check port 8080 isn't in use (`lsof -i :8080`) and dependencies are installed
- Check `src/test/` for usage examples and `GET /health` for system status

---

## 🌸 Powered by Pollinations.ai

FLARE is built with [Pollinations.ai](https://pollinations.ai) - providing seamless access to multiple AI models through a unified API.

[![Built with Pollinations](https://img.shields.io/badge/Built%20with-Pollinations-8a2be2?style=for-the-badge&logo=data:image/svg+xml,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20viewBox%3D%220%200%20124%20124%22%3E%3Ccircle%20cx%3D%2262%22%20cy%3D%2262%22%20r%3D%2262%22%20fill%3D%22%23ffffff%22/%3E%3C/svg%3E&logoColor=white&labelColor=6a0dad)](https://pollinations.ai)

<p align="center">
  <a href="https://pollinations.ai">
    <img src="https://raw.githubusercontent.com/pollinations/pollinations/main/assets/logo-text.svg" alt="Pollinations.ai" height="60">
  </a>
</p>
