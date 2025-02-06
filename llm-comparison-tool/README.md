# LLM Model Comparison Web Application

## Overview
This web application provides a comprehensive tool for comparing responses from multiple Large Language Models (LLMs) in real-time. Users can input prompts and receive simultaneous responses from various AI models, with detailed performance metrics.

## Features
- Dynamic grid layout responsive across multiple screen sizes
- Real-time model response comparison
- Performance metrics for each model
- Token usage statistics
- Dark/Light mode toggle
- Fullscreen model response view
- Copy model response functionality

## Model Sources
Models are dynamically fetched from: `https://text.pollinations.ai/models`

### Supported Interactions
- Prompt Input: Enter a prompt to query multiple models
- System Context Selection: Choose response style (Concise, Educational, Deep Thinking)
- Font Size Adjustment: Increase/decrease response text size
- Theme Toggle: Switch between dark and light modes

## Performance Metrics
For each model response, the application displays:
- Response time (ms)
- Character count
- Word count
- Token usage breakdown:
  - Prompt Tokens (pt)
  - Completion Tokens (ct)
  - Total Tokens (tt)

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

## API Endpoints
- Model List: `GET https://text.pollinations.ai/models`
- Model Queries: `POST https://text.pollinations.ai/openai`

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
- Previous prompts are saved automatically
- Access prompt history through input field autocomplete
- Select different system contexts to guide model responses
- System contexts are loaded from local configuration
