# FLARE LLM Comparison Tool

A powerful web-based tool for comparing multiple Large Language Models (LLMs) side-by-side, powered by [Pollinations.ai](https://pollinations.ai). Test models simultaneously with real-time cost estimation and detailed performance metrics.

## Overview

Compare 25+ state-of-the-art LLMs including GPT-5, Claude, Gemini, DeepSeek, and more. Get instant insights into model behavior, response quality, and cost-effectiveness.

**Key Highlights:**
- 🤖 **25+ Models** - OpenAI, Anthropic, Google, Meta, xAI, and more
- 💰 **Real-time Cost Tracking** - See pollen costs per query
- ⚙️ **9 Generation Parameters** - Full control over model behavior
- 📊 **Performance Metrics** - Response time, tokens, and cost analysis
- ℹ️ **Model Information** - Capabilities, pricing, context windows
- 🎯 **System Contexts** - Pre-configured prompt templates

## Features

### ✨ Core Capabilities

#### Multi-Model Comparison
- Query up to 25+ models simultaneously
- Side-by-side response comparison
- Click model names to toggle enable/disable
- Visual indicators for model status
- Real-time streaming responses

#### Collapsible Parameter Panel
- **Compact by default** - Saves screen space
- **Expand with gear icon** (⚙️) - Next to system prompt dropdown
- **Larger controls** - Precise slider adjustments
- **Reset button** - Restore all defaults instantly
- **Info tooltips** - Hover (ℹ️) icons for parameter explanations

#### Model Information Tooltips
Each model card displays an info icon (ⓘ) showing:
- 📝 **Description** - What the model specializes in
- 🎯 **Capabilities** - Vision 👁️, Audio 🎙️🔊, Tools 🔧, Reasoning 🧠
- 📏 **Context Window** - Maximum token capacity
- 💰 **Pricing** - Input/output cost per million tokens
- 💎 **Access Level** - Free or paid-only models

#### Pollen Cost Estimation
- **Real-time calculation** - See cost per query
- **Detailed breakdown**:
  - Uncached prompt tokens × prompt cost
  - Cached prompt tokens × cached cost (when available)
  - Completion tokens × completion cost
- **High precision** - Up to 10 decimal places for tiny costs
- **Visual display** - Green text with 🌸 emoji below token counts

### 🔧 Advanced Controls

#### 9 Generation Parameters

**Primary Controls:**
1. **Temperature** (0.0-2.0, default: 0.7)
   - Controls randomness and creativity
   - Lower = focused, Higher = creative

2. **Top-P** (0.0-1.0, default: 1.0)
   - Nucleus sampling for diversity
   - Limits cumulative probability

3. **Max Tokens** (50-4000, default: 500)
   - Maximum response length

4. **Seed** (0-9999, default: random)
   - For reproducible outputs

**Penalty Controls:**
5. **Frequency Penalty** (-2.0 to 2.0, default: 0.0)
   - Reduces repetition of frequent words
   - Positive = less repetition

6. **Presence Penalty** (-2.0 to 2.0, default: 0.0)
   - Encourages discussing new topics
   - Positive = more topic diversity

7. **Repetition Penalty** (0.0-2.0, default: 1.0)
   - Alternative repetition control
   - > 1.0 = penalize repetition

**Advanced Sampling:**
8. **Top-K** (0-100, default: 0/off)
   - Limits token selection pool
   - 0 = disabled, higher = more restricted

9. **Min-P** (0.0-1.0, default: 0.0)
   - Minimum probability threshold
   - Filters low-probability tokens

**Each parameter includes:**
- 📖 Plain language explanation
- 🎯 Behavioral impact description
- 💡 Default value displayed
- ℹ️ Hover tooltips with examples

### 🌸 BYOP (Bring Your Own Pollen)

Use your own Pollinations API keys for unlimited access:

#### Option 1: OAuth Flow (Recommended)
1. Click the "🌸 BYOP" button in top-right
2. Click "Connect with Pollinations"
3. Sign in and authorize the app
4. API key automatically saved to browser

#### Option 2: Manual Entry
1. Click "🌸 BYOP" button
2. Paste your API key (pk_... or sk_...)
3. Click "Save"

**Key Types:**
- **Publishable keys** (`pk_*`): Safe for client-side, rate-limited by IP
- **Secret keys** (`sk_*`): Higher limits, keep secure

**Benefits:**
- 💰 Pay only for what you use
- 🔒 Keys stored locally in browser only
- ⚡ No rate limits with secret keys
- 💵 Transparent cost tracking

## Quick Start

### Option 1: Direct File Access (Recommended)
```bash
# Clone the repository
git clone https://github.com/yourusername/FLARE.git
cd FLARE/llm-comparison-tool

# Open directly in browser
open index.html  # macOS
# or
start index.html # Windows
# or
xdg-open index.html # Linux
```

### Option 2: Local Server
```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx http-server -p 8080

# Using PHP
php -S localhost:8080

# Then visit http://localhost:8080
```

### Option 3: GitHub Pages
Deploy to GitHub Pages for easy sharing:
1. Push code to GitHub repository
2. Enable GitHub Pages in repository settings
3. Share the public URL

## Usage Guide

### Basic Workflow

1. **Enter Your Prompt**
   - Type or paste your prompt in the main text area
   - Or select a system context template

2. **Select Models**
   - All models enabled by default
   - Click model name to toggle on/off
   - Disabled models appear grayed out with 🚫 icon

3. **Adjust Parameters** (Optional)
   - Click ⚙️ gear icon to expand parameter panel
   - Drag sliders or enter precise values
   - Hover ℹ️ icons for parameter explanations
   - Click "Reset" to restore defaults

4. **Submit Query**
   - Click "Submit" button
   - Watch responses appear in real-time
   - Compare outputs side-by-side

5. **Analyze Results**
   - View response text in each model card
   - Check performance metrics below each response:
     - Response time (ms)
     - Token counts (prompt + completion = total)
     - Pollen cost (🌸)
   - Hover model info icons (ⓘ) for detailed model information

### Understanding Model Information

Click the **ⓘ icon** next to any model name to see:

**Capabilities:**
- 👁️ **Vision** - Can process images
- 🎙️ **Audio Input** - Can process audio
- 🔊 **Audio Output** - Can generate audio
- 🔧 **Tools** - Supports function calling
- 🧠 **Reasoning** - Extended thinking capability

**Context Window:**
- Maximum tokens the model can process
- Example: "128K tokens" = ~96,000 words

**Pricing:**
- Input cost per million tokens
- Output cost per million tokens
- 💎 Badge indicates paid-only models

### Parameter Optimization Tips

**For Factual/Consistent Output:**
```
Temperature: 0.0 - 0.3
Top-P: 0.1 - 0.5
Seed: Set specific value (e.g., 42)
```
Best for: Technical documentation, factual Q&A, code generation

**For Creative/Diverse Output:**
```
Temperature: 0.7 - 1.5
Top-P: 0.9 - 1.0
Seed: 0 (random each time)
```
Best for: Creative writing, brainstorming, marketing copy

**To Reduce Repetition:**
```
Frequency Penalty: 0.5 - 1.0
Presence Penalty: 0.5 - 1.0
```
Or use:
```
Repetition Penalty: 1.1 - 1.5
```
Best for: Avoiding redundant phrasing, varied vocabulary

**For Focused Output:**
```
Top-K: 10 - 50
Min-P: 0.05 - 0.1
```
Best for: Reducing nonsensical outputs, maintaining coherence

## Available Models

### Current Model Lineup (25+)

**Fast & Efficient:**
- Amazon Nova Micro (nova-fast)
- Google Gemini 2.5 Flash Lite (gemini-fast)
- OpenAI GPT-5 Nano (openai-fast)
- Anthropic Claude Haiku 4.5 (claude-fast)

**Balanced Performance:**
- OpenAI GPT-5 Mini (openai)
- Mistral Small 3.2 24B (mistral)
- Anthropic Claude Sonnet 4.5 (claude)
- Google Gemini 3 Flash (gemini)

**Reasoning Models:**
- DeepSeek V3.2 (deepseek)
- Moonshot Kimi K2.5 (kimi) 🆕
- Z.ai GLM-4.7 (glm)
- MiniMax M2.1 (minimax)
- OpenAI GPT-5.2 (openai-large)

**Specialized:**
- Qwen3 Coder 30B (qwen-coder) - Code generation
- Perplexity Sonar (perplexity-fast) - Web search
- OpenAI GPT-4o Mini Audio (openai-audio) - Audio I/O
- ChickyTutor (chickytutor) - Language learning
- MIDIjourney (midijourney) - Music generation
- NomNom (nomnom) - Web search 🆕

**Premium (Paid):** 💎
- Google Gemini 2.5 Pro (gemini-legacy)
- Google Gemini 3 Pro (gemini-large)
- Anthropic Claude Opus 4.5 (claude-large)

## API Integration

### Endpoints Used
```
GET  https://gen.pollinations.ai/v1/models              # Fetch models
POST https://gen.pollinations.ai/v1/chat/completions    # Generate
GET  https://gen.pollinations.ai/account/balance        # Check balance
```

### Authentication
All requests include:
```javascript
headers: { 'Authorization': `Bearer ${apiKey}` }
```

### Model-Specific Parameter Support
The tool automatically filters parameters based on model capabilities:
- **OpenAI/Claude**: All parameters except repetition_penalty, top_k
- **Gemini**: Temperature, top_p, max_tokens only
- **DeepSeek/Qwen**: Full support including top_k, repetition_penalty

## Security & Privacy

### Local Storage Only
- User API keys stored in browser `localStorage`
- Keys never sent to any server except Pollinations.ai
- OAuth uses URL hash fragments (not logged)

### Key Types
- **Publishable keys** (pk_): Safe for client-side, IP rate-limited
- **Secret keys** (sk_): Higher limits, keep secure

⚠️ **Never commit API keys to version control!**

## Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

Requires JavaScript enabled.

## Documentation

- [Pollinations API Documentation](../POLLINATIONS-API.md)
- [BYOP Implementation Guide](../BRING_YOUR_OWN_POLLEN.md)
- [Parameter Guide](https://platform.openai.com/docs/api-reference/chat)

## Contributing

Contributions welcome! Areas for improvement:
- Additional model support
- More system prompt templates
- Export/import functionality
- Advanced comparison visualizations

## License

See root LICENSE file for details.

---

## 🌸 Powered by Pollinations.ai

This tool is built with [Pollinations.ai](https://pollinations.ai) - providing seamless access to multiple AI models through a unified API.

[![Built with Pollinations](https://img.shields.io/badge/Built%20with-Pollinations-8a2be2?style=for-the-badge&logo=data:image/svg+xml,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20viewBox%3D%220%200%20124%20124%22%3E%3Ccircle%20cx%3D%2262%22%20cy%3D%2262%22%20r%3D%2262%22%20fill%3D%22%23ffffff%22/%3E%3C/svg%3E&logoColor=white&labelColor=6a0dad)](https://pollinations.ai)

<p align="center">
  <a href="https://pollinations.ai">
    <img src="https://raw.githubusercontent.com/pollinations/pollinations/main/assets/logo-text.svg" alt="Pollinations.ai" height="60">
  </a>
</p>
