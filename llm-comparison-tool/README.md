# LLM Model Comparison Web Application

## Overview
This web application provides a comprehensive tool for comparing responses from multiple Large Language Models (LLMs) in real-time. Users can input prompts and receive simultaneous responses from various AI models, with detailed performance metrics.

## Quick Start

### Option 1: Standalone Frontend
```bash
cd llm-comparison-tool
npm install
npm start
# Access at http://localhost:8080
```

### Option 2: Via Backend Server
```bash
# From project root
npm start
# Access at http://localhost:8080 (serves both backend API and frontend)
```

### Option 3: Simple HTTP Server
```bash
cd llm-comparison-tool
python -m http.server 8080
# or
python serve.py
```

## Features
- Dynamic grid layout responsive across multiple screen sizes
- Real-time model response comparison
- **Model parameter controls** - Temperature, Top-P, Max Tokens, Seed
- Performance metrics for each model
- Token usage statistics with parameter display
- Dark/Light mode toggle
- Fullscreen model response view
- Copy model response functionality

## Model Sources
Models are dynamically fetched from: `https://gen.pollinations.ai/v1/models`

### Supported Interactions
- **Prompt Input**: Enter a prompt to query multiple models
- **System Context Selection**: Choose response style (Concise, Educational, Deep Thinking, Coder)
- **Model Parameter Controls**:
  - **Temperature** (0.0-2.0): Controls randomness/creativity of responses
  - **Top-P** (0.0-1.0): Nucleus sampling for response diversity
  - **Max Tokens** (1-4000): Maximum response length
  - **Seed**: Optional seed for reproducible results (leave empty for random)
- **Font Size Adjustment**: Increase/decrease response text size
- **Theme Toggle**: Switch between dark and light modes

## Performance Metrics
For each model response, the application displays:
- **Response time** (ms)
- **Character count** and **word count**
- **Token usage breakdown**:
  - Prompt Tokens + Completion Tokens = Total Tokens
- **Model parameters used**:
  - T: Temperature, P: Top-P, Max: Max Tokens, S: Seed

## Responsive Design
The application uses a responsive grid layout:
- Mobile: 1 column
- Tablet: 2-3 columns
- Desktop: 4-6 columns

## Technologies
- HTML5
- Tailwind CSS
- JavaScript
- Axios for API requests
- Marked.js for Markdown rendering

## Security & Authentication

### Referrer-Based Authentication
- The application uses **referrer-based authentication** for Pollinations.ai API
- No API keys are exposed in the frontend code (secure by design)
- Referrer is automatically set to `endemicmedia.github.io` for proper attribution
- Local development uses the same referrer for consistent behavior

### Security Features
- ✅ **No hardcoded API keys** - All authentication handled via referrer headers
- ✅ **Client-side only** - No sensitive data stored or transmitted
- ✅ **Local storage only** - Prompt history saved locally in browser
- ✅ **HTTPS APIs** - All API calls use secure HTTPS endpoints

## API Endpoints
- Model List: `GET https://gen.pollinations.ai/v1/models`
- Model Queries: `POST https://gen.pollinations.ai/v1/chat/completions`

### API Request Headers
```javascript
// Automatically included in requests:
{
  "referrer": "endemicmedia.github.io",
  "Content-Type": "application/json"
}
```

## Usage
1. Enter a prompt in the input field
2. Select a system context (optional)
3. Click "Submit"
4. View responses from multiple models simultaneously

## Customization
- Adjust font size using +/- buttons
- Toggle between dark and light themes
- View full model responses in fullscreen mode with copy functionality
- Save prompt history for quick reuse
- Track fastest responding models with visual indicators

## Interaction Features
### Fullscreen Mode
- Click the expand icon to view any model response in fullscreen
- Copy text directly from fullscreen view
- View complete model statistics in fullscreen header
- Close by clicking outside or using the close button

### Response Management
- Copy responses to clipboard with visual feedback
- Track the three fastest responding models (highlighted in green)
- Cancel ongoing requests with the cancel button
- View response status (queued, loading, completed, error)

### History and Context
- Previous prompts are saved automatically in browser localStorage
- Access prompt history through input field autocomplete (max 20 prompts)
- Select different system contexts to guide model responses:
  - **Concise** - Short, direct answers (3-4 sentences)
  - **Educational** - Comprehensive, structured explanations
  - **Coder** - Code-focused responses with minimal explanation
  - **Deep Thinking** - Structured analytical framework with thinking process
- System contexts are loaded from `system.json` configuration

## Configuration

### System Prompts (`system.json`)
The application loads system context prompts from `system.json`. You can customize these contexts:

```json
{
  "systemPrompts": {
    "concise": "Your concise prompt here...",
    "educational": "Your educational prompt here...",
    "custom": "Your custom context here..."
  }
}
```

### Browser Compatibility
- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- JavaScript must be enabled
- LocalStorage support required for prompt history

### Development Notes
- The tool is **client-side only** - no backend database required
- All data stays in the browser (localStorage for settings/history)
- Can be deployed as static files to any web server
- CORS is handled by the Pollinations.ai API
