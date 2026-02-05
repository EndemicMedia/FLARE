# FLARE: Fractal Language for Autonomous Recursive Expansion

The FLARE language provides a powerful framework for recursive AI prompting. The ability to specify models, control response variability, and apply advanced post-processing functions enables developers to extract the most value from their AI tools. By leveraging multiple models, they can ensure diverse and accurate responses, similar to the "wisdom of the (llm) crowd" while post-processing functions like summarizing, combining, or contrasting these responses allow for nuanced and comprehensive outputs. This flexibility makes FLARE a versatile and valuable language for AI tool development.

## ✨ Key Features

- 🤖 **Multi-Model Support** - Query OpenAI, Mistral, and other models simultaneously
- 🧠 **Intelligent Post-Processing** - Vote, summarize, combine, and analyze responses
- ⚡ **High Performance** - Parallel model queries with automatic fallbacks
- 🏗️ **Atomic Architecture** - Maintainable, testable, and scalable codebase
- 📊 **Real-Time Monitoring** - Health checks, diagnostics, and API insights
- 🔧 **Easy Integration** - RESTful API with comprehensive error handling

## 🚀 Quick Start

### 1. Installation
```bash
# Clone the repository
git clone <your-repository-url>
cd FLARE

# Install dependencies
npm install

# Optional: Set up environment variables (works without API key!)
cp .env.example .env
```

### 2. Start the Server
```bash
# Start FLARE server
npm start

# Server runs on http://localhost:8080
# API available at http://localhost:8080/api/info
# Health check at http://localhost:8080/health
```

### 3. Test FLARE Commands
```bash
# Test with curl
curl -X POST http://localhost:8080/process-flare \
  -H "Content-Type: application/json" \
  -d '{"command": "{ flare model:mistral temp:0.7 `Write a haiku about AI` }"}'

# Or use the web interface at http://localhost:8080
```

## 🔑 API Configuration

FLARE now supports **multi-provider fallback** for enhanced reliability:

### Basic Configuration (Single Provider)
```bash
# .env file
POLLINATIONS_API_KEY=your_api_key_here     # Primary provider
PORT=8080                                  # Server port
```

### Advanced Configuration (Multi-Provider Fallback)
```bash
# AI Provider Configuration
AI_PROVIDER=pollinations                   # Primary provider
AI_PROVIDER_FALLBACK=true                  # Enable automatic fallback
AI_PROVIDER_PRIORITY=pollinations,openrouter,gemini  # Fallback order

# Provider API Keys
POLLINATIONS_API_KEY=your_key              # Primary (required)
OPENROUTER_API_KEY=your_key                # Fallback #1 (optional)
GOOGLE_GEMINI_API_KEY=your_key             # Fallback #2 (optional)

# Model Configuration
DEFAULT_MODEL=openai
```

### 🔄 Fallback System Features
- **Automatic Provider Rotation** - Seamlessly switches providers on failures
- **Rate Limit Handling** - Immediately rotates on 429 errors
- **Quota Management** - Handles 403 quota errors gracefully
- **Exponential Backoff** - Intelligent retry delays (10s → 60s)
- **Benchmark-Based Selection** - Uses quality metrics for model selection

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



## 🔗 API Integration

### REST API Endpoints

```bash
# Process FLARE commands
POST /process-flare
Content-Type: application/json
{
  "command": "{ flare model:mistral `Your prompt here` }"
}

# Process text documents with embedded FLARE commands
POST /process-text
Content-Type: application/json
{
  "text": "Your document with { flare model:mistral `embedded commands` } inside"
}

# Health check
GET /health

# API information
GET /api/info
```

### 🐍 Python Integration

```python
import requests

def query_flare(command):
    response = requests.post('http://localhost:8080/process-flare', 
        json={'command': command},
        headers={'Content-Type': 'application/json'}
    )
    return response.json()

# Example usage
result = query_flare("{ flare model:mistral temp:0.7 `Explain Python` }")
print(result['result'])
```

### 🌐 JavaScript Integration

```javascript
async function queryFLARE(command) {
    const response = await fetch('http://localhost:8080/process-flare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
    });
    return await response.json();
}

// Example usage
const result = await queryFLARE("{ flare model:mistral vote `Best web framework?` }");
console.log(result.result);
```

## 🧪 Development & Testing

### Unit & Integration Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit           # Unit tests (94.2% coverage)
npm run test:parser         # Parser tests only
npm run test:integration    # Integration tests
npm run test:e2e           # End-to-end tests

# Development server with auto-restart
npm run dev
```

### Feature Testing Scripts

**Complete Feature Test** - Tests all post-processing functions and capabilities:
```bash
# Ensure server is running first
npm start &

# Run comprehensive test suite
./test-all-features.sh
```
This comprehensive script tests:
- ✅ All 6 post-processing functions (`vote`, `sum`, `comb`, `diff`, `filter`, `exp`)  
- ✅ Single and multi-model queries with temperature control
- ✅ Document processing with embedded commands
- ✅ Specialized models (`qwen-coder`, `bidara`, `midijourney`)
- ✅ Error handling and graceful degradation
- ✅ Multi-model coordination with parallel processing

**Model Testing** - Quick verification of available models:
```bash 
./test-models.sh           # Test mistral, gemini, openai models
./demo-flare.sh           # Interactive demo with debug information
```

**Test Results**: All scripts generate detailed markdown reports:
- `test-results.md` - Complete feature test results with actual API responses
- `output.md` - Model-specific test results showing real AI outputs
- Server logs show detailed processing pipeline execution

**Prerequisites**: Server must be running on `localhost:8080` before executing test scripts.

## 🏗️ Architecture

FLARE v2.0 uses an **Atomic File Structure** where each file contains exactly one function, organized by language constructs:

```
src/
├── server/                    # Express server components
│   ├── createExpressApp.js       # Express app creation
│   ├── setupMiddleware.js        # CORS, body parsing
│   ├── setupApiRoutes.js         # API route definitions
│   ├── startServer.js            # Server startup
│   └── exports.js               # Module exports
├── parser/                    # FLARE command parsing (atomic functions)
│   ├── parseFlareCommand.js      # Parse single FLARE command
│   ├── validateParsedCommand.js  # Command validation
│   ├── extractFlareCommands.js   # Extract commands from text
│   ├── processFlareResponse.js   # Process complete response
│   └── replaceFlareCommands.js   # Replace commands with results
├── services/                  # Business logic (atomic functions)
│   ├── providers/                # Multi-provider fallback system
│   │   ├── pollinationsClient.js     # Primary Pollinations API client
│   │   ├── openRouterClient.js       # OpenRouter fallback client
│   │   ├── geminiClient.js           # Gemini fallback client
│   │   ├── modelPriorityManager.js   # Benchmark-based selection
│   │   └── aiProviderManager.js      # Orchestration & fallback logic
│   ├── executeModelQuery.js      # Single model query execution
│   ├── queryMultipleModels.js    # Multi-model coordination
│   ├── applyPostProcessing.js    # Post-processing operations
│   ├── handleQueryFailure.js     # Error handling
│   └── processFlareCommand.js    # Complete command processing
├── operations/                # Post-processing operations
│   ├── sum.js                    # Summarization
│   ├── vote.js                   # Response voting
│   ├── comb.js                   # Response combination
│   └── diff.js                   # Response comparison
└── test/                     # Comprehensive test suite
```

### Implementation Strategy

**Atomic Architecture Principles:**
- **One Function Per File** - Each `.js` file contains exactly one function with the same name
- **Maximum Modularity** - Functions are pure, testable, and composable
- **Clear Dependencies** - Import/export relationships are explicit and minimal
- **Language-Based Organization** - Structure follows code constructs, not application features

**Core Processing Pipeline:**
1. **Text Input** → `extractFlareCommands()` → Extract embedded FLARE commands
2. **FLARE Commands** → `parseFlareCommand()` → Parse syntax and parameters  
3. **Parsed Commands** → `queryMultipleModels()` → Execute model queries in parallel
4. **Raw Responses** → `applyPostProcessing()` → Apply intelligent post-processing
5. **Processed Results** → `replaceFlareCommands()` → Replace commands with results
6. **Final Output** → Seamlessly integrated natural text

This structure provides:
- ✅ **Ultimate Maintainability** - Individual functions are easy to locate, test, and modify
- ✅ **Perfect Testability** - Each function can be tested in isolation with clear inputs/outputs
- ✅ **Infinite Scalability** - New functionality adds new files without affecting existing code
- ✅ **Maximum Clarity** - Function names match file names for instant comprehension

## 💡 Document Processing with Embedded AI

### The Power of Seamless Integration

FLARE's `/process-text` endpoint enables **natural document processing** where AI-generated content seamlessly integrates into your text:

#### 📝 Original Document with FLARE Commands:
```text
Artificial intelligence is transforming our world in unprecedented ways. 
{ flare model:mistral temp:0.5 `Explain in 2-3 sentences how AI is changing healthcare specifically` } 
Additionally, the field of education is experiencing significant changes due to AI integration. 
{ flare model:gemini temp:0.5 `Describe in 2-3 sentences how AI is revolutionizing education and learning` } 
Looking toward the future, these technological advances promise even more remarkable developments. 
{ flare model:mistral temp:0.7 `Predict in 2-3 sentences what AI might accomplish in the next 5-10 years` }
```

#### ✨ Final Processed Result:
**Artificial intelligence is transforming our world in unprecedented ways.** AI is significantly transforming healthcare by enabling more accurate diagnoses through advanced image analysis and predictive algorithms, and by personalizing treatment plans based on vast amounts of patient data. Additionally, AI-driven tools are streamlining administrative tasks, enhancing patient monitoring, and facilitating the development of new drugs, ultimately improving efficiency and patient outcomes. **Additionally, the field of education is experiencing significant changes due to AI integration.** AI is revolutionizing education by offering personalized learning experiences tailored to individual student needs and paces, providing instant feedback and adaptive content. It's also automating administrative tasks for educators, freeing up their time for more impactful teaching and student interaction. This shift promises to make education more accessible, efficient, and effective for learners of all backgrounds. **Looking toward the future, these technological advances promise even more remarkable developments.** In the next 5-10 years, AI is likely to make significant strides in personalizing healthcare through advanced diagnostics and predictive analytics, potentially revolutionizing disease prevention and treatment. Additionally, AI could enhance autonomous systems, leading to more widespread use of self-driving cars and drones, and it may also play a crucial role in addressing climate change by optimizing resource management and energy efficiency.

#### 🎯 What Makes This Special:
- ✅ **Perfect Integration** - FLARE commands are seamlessly replaced with AI-generated content
- ✅ **Context Preservation** - Each AI response understands and maintains the narrative flow  
- ✅ **Natural Reading** - Final text reads as a coherent document, not a patchwork
- ✅ **Multi-Model Coordination** - Different models contribute their specialized strengths
- ✅ **Zero Manual Editing** - No post-processing needed for natural language flow

### 🔧 Traditional Use Cases

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

## 🚦 Status & Monitoring

### Health Check
```bash
curl http://localhost:8080/health
```

Returns comprehensive system status:
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "environment": {
    "healthy": true,
    "checks": {
      "apiKey": true,
      "networkAccess": true
    },
    "uptime": 3600.5,
    "nodeVersion": "v20.18.1"
  }
}
```

### API Information
```bash
curl http://localhost:8080/api/info
```

Lists all available features and supported commands.

## 🔍 Troubleshooting

### Common Issues

**❌ API Connection Errors**
- Check internet connectivity
- Verify API key if using custom configuration
- Check server logs for detailed error messages

**❌ Invalid FLARE Syntax**
- Ensure proper curly brace structure: `{ flare ... }`
- Verify model names are correct
- Check temperature values are between 0.0-2.0

**❌ Server Won't Start**
- Check port 8080 isn't in use: `lsof -i :8080`
- Verify Node.js version (v14+ required)
- Check npm dependencies are installed

### Getting Help

- 📝 Check the test files in `src/test/` for usage examples
- 🔍 Review server logs for detailed error information
- 📊 Use the health endpoint to diagnose system status
- 🧪 Run the test suite to verify functionality: `npm test`
- 🚀 Run feature tests to see real examples: `./test-all-features.sh`
- 📋 Check generated reports: `test-results.md` and `output.md`

## 📈 Performance

- **Parallel Processing** - Multiple model queries execute simultaneously
- **Automatic Fallbacks** - Graceful degradation when models fail
- **Retry Logic** - Exponential backoff for failed requests
- **Error Recovery** - Continue processing even if some models fail
- **Resource Management** - Intelligent timeout and connection management

## 🛡️ Security

- **API Key Protection** - Environment variable configuration
- **Input Validation** - Comprehensive FLARE command validation
- **Error Handling** - Secure error messages without exposing internals
- **Rate Limiting** - Built-in request throttling
- **CORS Support** - Configurable cross-origin request handling

## 📋 System Requirements

- **Node.js** v14 or higher
- **npm** v6 or higher
- **Internet connection** for API access
- **2GB RAM** minimum (recommended: 4GB+)
- **Port 8080** available (configurable via PORT environment variable)

---

## 🌟 What Makes FLARE Special

1. **🚀 Production Ready** - Used in live applications with proven reliability
2. **⚡ Fast & Efficient** - Optimized for performance with parallel processing
3. **🧠 Intelligent** - AI-powered post-processing for enhanced results
4. **🔧 Easy to Use** - Simple syntax that anyone can learn quickly
5. **🏗️ Scalable Architecture** - Built to grow with your needs
6. **🧪 Well Tested** - 94.2% test coverage ensures reliability
7. **📚 Fully Documented** - Comprehensive guides and examples

**Start orchestrating AI models today with FLARE v2.0!** 🎉

---

## 🌸 Powered by Pollinations.ai

FLARE is built with [Pollinations.ai](https://pollinations.ai) - providing seamless access to multiple AI models through a unified API.

[![Built with Pollinations](https://img.shields.io/badge/Built%20with-Pollinations-8a2be2?style=for-the-badge&logo=data:image/svg+xml,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20viewBox%3D%220%200%20124%20124%22%3E%3Ccircle%20cx%3D%2262%22%20cy%3D%2262%22%20r%3D%2262%22%20fill%3D%22%23ffffff%22/%3E%3C/svg%3E&logoColor=white&labelColor=6a0dad)](https://pollinations.ai)

<p align="center">
  <a href="https://pollinations.ai">
    <img src="https://raw.githubusercontent.com/pollinations/pollinations/main/assets/logo-text.svg" alt="Pollinations.ai" height="60">
  </a>
</p>