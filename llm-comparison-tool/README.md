# FLARE LLM Comparison Tool

A powerful web-based tool for comparing multiple Large Language Models (LLMs) side-by-side, powered by [Pollinations.ai](https://pollinations.ai). Built on the FLARE (Fractal Language for Autonomous Recursive Expansion) framework, this tool enables you to test and compare different models with fine-grained control over generation parameters.

## Overview

The FLARE language provides a powerful framework for recursive AI prompting. By leveraging multiple models simultaneously, you can:
- **Ensure diverse responses** - Similar to "wisdom of the crowd" but for LLMs
- **Compare model behaviors** - See how different models handle the same prompt
- **Control generation** - Fine-tune temperature, top-p, penalties, and more
- **Evaluate performance** - Track response time, token usage, and quality

This flexibility makes FLARE a versatile and valuable tool for AI development, research, and practical applications.

## Features

### ✨ Core Capabilities
- 🤖 **Multi-Model Comparison** - Query multiple LLMs simultaneously
- ⚙️ **9 Generation Parameters** - Full control over model behavior
- 📊 **Real-time Results** - See responses as they generate
- 🎯 **Performance Metrics** - Response time and token usage tracking
- 💾 **Prompt History** - Save and reuse previous prompts
- 🎨 **System Contexts** - Pre-configured prompt templates

### 🔧 Advanced Controls

#### Model Parameters (with tooltips & examples)
1. **Temperature** (0-2, default: 0.7) - Controls randomness and creativity
2. **Top-P** (0-1, default: 1.0) - Nucleus sampling for token selection
3. **Max Tokens** (50-4000, default: 500) - Maximum response length
4. **Seed** (0-9999, default: random) - For reproducible outputs
5. **Frequency Penalty** (0-2, default: 0) - Reduces word repetition
6. **Presence Penalty** (0-2, default: 0) - Encourages new topics
7. **Repetition Penalty** (0-2, default: 0) - Alternative repetition control
8. **Top-K** (0-100, default: off) - Limits token selection pool
9. **Min-P** (0-1, default: 0) - Minimum probability threshold

Each parameter includes:
- 📖 Clear explanations with examples
- 🎯 Min/max value demonstrations
- 💡 Default value indicators
- ℹ️ Hover tooltips with detailed guidance

### 🌸 BYOP (Bring Your Own Pollen)

Users can use their own Pollinations API keys in two ways:

#### Option 1: OAuth Flow (Recommended)
1. Click the "🌸 BYOP" button
2. Click "Connect with Pollinations"
3. Sign in and authorize
4. API key automatically saved

#### Option 2: Manual Entry
1. Click "🌸 BYOP"
2. Enter your API key (pk_... or sk_...)
3. Click "Save"

**Benefits:**
- 💰 Pay for what you use
- 🔒 Secure (keys never leave your browser)
- ⚡ No rate limits with secret keys
- 💵 $0 API costs for developers

## Quick Start

### Option 1: Direct File Access (No Server Required)
```bash
# Clone the repository
git clone <repository-url>
cd FLARE/llm-comparison-tool

# Open directly in browser
open index.html
```

### Option 2: Local Server
```bash
# Using Python
python -m http.server 8080

# Using Node.js
npx http-server -p 8080

# Then visit http://localhost:8080
```

### Option 3: GitHub Pages
Visit the live deployment: [Your GitHub Pages URL]

## Usage

### Basic Workflow
1. **Enter a prompt** in the text input
2. **Select models** to compare (click to enable/disable)
3. **Adjust parameters** (optional) - click ⚙️ icon to expand controls
4. **Click Submit** to query all enabled models
5. **Compare results** side-by-side

### Parameter Optimization Tips

**For Consistent Output** (factual tasks):
- Temperature: 0.0-0.3
- Top-P: 0.1-0.5
- Set a specific seed

**For Creative Output** (writing, brainstorming):
- Temperature: 0.7-1.5
- Top-P: 0.9-1.0
- Seed: 0 (random)

**To Reduce Repetition**:
- Frequency Penalty: 0.5-1.0
- Presence Penalty: 0.5-1.0
- Or use Repetition Penalty: 0.5-1.0

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

**Built with ❤️ using [Pollinations.ai](https://pollinations.ai)**
