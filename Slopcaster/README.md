# Slopcaster – AI Conversation Player

Slopcaster is a browser-based tool that lets two AI bots hold an autonomous conversation on any topic you give them. It includes text-to-speech (TTS) playback so you can listen back to the generated dialogue.

## Features

- Two-bot conversation loop with configurable system prompts
- TTS audio generation and a media-player-style playback UI (play, pause, prev, next)
- Provider choice: **Pollinations.ai** (default, no account needed) or **Puter** (requires Puter sign-in)
- Dark / light mode toggle
- Export conversation as Markdown or JSON
- Markdown rendering for bot responses

## Usage

Open `index.html` directly in a browser — no build step or server required.

1. Optionally open **Settings** to adjust system prompts, choose a model, or switch the LLM provider.
2. Type a topic or opening question in the text area.
3. Click **Start Conversation**. The two bots will take turns responding.
4. Use the **Play** button to listen to the conversation with TTS audio.
5. Click **Interrupt** to inject a new user message mid-conversation.
6. Use **Copy** or **Save** to export the transcript.

## LLM Providers

| Provider | Default | Requires account |
|---|---|---|
| Pollinations.ai | ✅ | No |
| Puter | No | Yes (free) |

Models are fetched dynamically from the Pollinations API (`https://text.pollinations.ai/models`) on first load.

## File Structure

```
Slopcaster/
├── index.html          Main entry point
├── css/styles.css      Custom styles
└── js/
    ├── main.js         Initialization entry point
    ├── modules/        Core logic (state, LLM, audio, settings, etc.)
    └── components/     UI components (settings panel, conversation display, etc.)
```

## Local Setup

No dependencies to install. Just open `index.html` in a modern browser (Chrome, Firefox, Safari, Edge).

For Puter models, the Puter JS SDK is loaded from CDN (`https://js.puter.com/v2/`). If Puter is unavailable, Pollinations remains fully functional.
