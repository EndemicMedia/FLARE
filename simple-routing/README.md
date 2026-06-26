# Simple 1-to-1 LLM Routing

A lightweight browser tool for two-bot AI conversations with a 1-to-1 routing model — each user message routes through a single request/response cycle rather than the media-player approach of Slopcaster.

## Purpose

This tool differs from the LLM comparison tool and Slopcaster in scope:

| Tool | Purpose |
|---|---|
| **llm-comparison-tool** | Send one prompt to N models simultaneously and compare responses side-by-side |
| **Slopcaster** | Autonomous multi-turn bot conversation with TTS audio playback |
| **simple-routing** | Lightweight two-bot conversation loop, no audio, simpler UI |

Use **simple-routing** when you want a stripped-down bot-vs-bot conversation without the audio/playback overhead of Slopcaster.

## Usage

Open `index.html` directly in a browser — no build step or server required.

1. Optionally open **Settings** to change system prompts and pick a model.
2. Type a topic or opening question.
3. Click **Start Conversation**.
4. Use **Interrupt** to inject a user message, **Clear** to reset, or **Save** to export.

## LLM Providers

| Provider | Default | Requires account |
|---|---|---|
| Pollinations.ai | ✅ | No |
| Puter | No | Yes (free) |

Pollinations models are fetched dynamically from `https://text.pollinations.ai/models` on first use. The API endpoint for chat completions is `https://text.pollinations.ai/` (OpenAI-compatible streaming format).

## File Structure

```
simple-routing/
└── index.html    Single-file app (HTML + inline JS + Tailwind CSS)
```

## Local Setup

No dependencies to install. Open `index.html` in a modern browser.
