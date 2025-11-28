# FLARE Backend Implementation TODO List

This document outlines the tasks required to fully implement the FLARE backend system according to the project's README and the Pollinations API documentation.

---

### General
- [ ] **Configuration:** Create a central configuration file (e.g., `config.js`) to manage settings like the Pollinations API base URL, default model, server port, and any API tokens, instead of hardcoding them.
- [ ] **Error Handling:** Implement more robust and consistent error handling across all services. Errors from the Pollinations API should be gracefully caught and propagated back to the user with meaningful messages.
- [ ] **Logging:** Enhance logging to provide more insight into the request lifecycle, including the parsed FLARE command, which models are being queried, and the results of post-processing.

---

### `modelService.js`
- [ ] **Switch to POST Endpoint:** Refactor `executeModelQuery` to use the `POST https://text.pollinations.ai/openai` endpoint. This is more robust, aligns with the OpenAI-compatible standard, and handles parameters like temperature more explicitly.
- [ ] **Pass All Parameters:** Ensure all relevant parameters from the parsed FLARE command (especially `temp`) are correctly passed to the Pollinations API in the `executeModelQuery` function.
- [ ] **Standardize Response Parsing:** By using the `POST` endpoint, the response structure will be predictable (OpenAI chat completion format). Update the response parsing logic to reliably extract the content from `response.data.choices[0].message.content`.
- [ ] **Authentication:** Implement a strategy to use an API token for the Pollinations API. This should be read from the new config file and included as a Bearer token in the `Authorization` header of the request.

---

### `postProcessingService.js`
- [ ] **Improve Summarization (`sum`):** The current implementation is too basic. Re-implement the `summarizationPostProcessing` function to make a new call to the language model.
    - **Action:** Combine the responses from the initial queries into a single text block.
    - **Action:** Create a new prompt like: "Please summarize the following texts into a single, coherent response: [combined text]".
    - **Action:** Send this new prompt to the `modelService` to get a high-quality summary.
- [ ] **Improve Voting (`vote`):** The current word-frequency voting is not effective for complex responses.
    - **Action:** Re-implement the `votingPostProcessing` function.
    - **Action:** Combine the responses.
    - **Action:** Formulate a new prompt asking a model to choose the best response, e.g., "From the following responses, which one best answers the original question? Please return only that response, without any extra commentary. Responses: [combined text]".
    - **Action:** Send this to the `modelService`.
- [ ] **Implement Other Post-Processing:** Add implementations for the other planned post-processing commands mentioned in `flareParser.js`:
    - [ ] `comb`: Combine responses into a single text.
    - [ ] `diff`: Find the differences between responses.
    - [ ] `exp`: Explain the responses.
    - [ ] `filter`: Filter the responses based on some criteria.

---

### `test/testFlareBackend.js`
- [ ] **Fix Port Number:** Update the port in the test script from `3000` to `8080` to match the server configuration.
- [ ] **Add Assertions:** The script currently only prints responses. Add actual tests using an assertion library like `chai` or Node's built-in `assert` module to verify that the responses are not null, are strings, and (eventually) match expected outputs for canned queries.
- [ ] **Expand Test Cases:** Add more test cases to cover:
    - Queries with multiple models.
    - All implemented post-processing commands (`sum`, `vote`, etc.).
    - Invalid FLARE command syntax to ensure errors are handled correctly.

---

### `server.js`
- [ ] **Integrate Configuration:** Refactor the server to use the proposed `config.js` file for the port number.
- [ ] **CORS Configuration:** The current CORS setup is wide open (`*`). For a production environment, this should be tightened to only allow requests from specific, trusted origins.




Build a visual workflow builder for composable AI blocks with the following specifications:

## CORE FUNCTIONALITY

1. **Drag-and-Drop Interface**
   - Sidebar library with categorized AI blocks (Input/Output, AI Processing, Logic & Flow)
   - Canvas area where blocks can be dropped and positioned
   - Visual connections between blocks showing data flow
   - Each block is draggable and repositionable on the canvas

2. **Block Types & Categories**

   INPUT/OUTPUT:
   - Text Input: Text area for user input
   - File Upload: File selection interface
   - Output: Display results (text/JSON toggle)

   AI PROCESSING:
   - Summarize: Configurable length (short/medium/long)
   - Translate: Language selection dropdown
   - Sentiment Analysis: Returns positive/negative/neutral
   - Extract Data: Extract structured data from text
   - Classify: Categorize content with custom labels

   LOGIC & FLOW:
   - If/Then: Conditional branching with true/false outputs
   - Loop: Iterate over array inputs
   - Merge: Combine multiple inputs

3. **Visual Connection System**
   - Each block has input/output connection points (dots)
   - Click and drag from output dot to input dot to create connection
   - Connections rendered as SVG paths or lines
   - Delete connections by clicking on them
   - Validate that connections only go from outputs to compatible inputs

4. **Block Configuration**
   - Each block has an inline configuration panel
   - Settings specific to block type (e.g., summary length, target language)
   - Delete button (×) to remove block from canvas
   - Visual indicator showing block state (idle/processing/complete/error)

5. **Workflow Execution**
   - "Test Run" button to execute the workflow with sample/provided inputs
   - Real-time progress visualization during execution
   - Show execution flow with animated highlights moving through connections
   - Display results in output blocks
   - Error handling with visual indicators on failed blocks

6. **Template System**
   - Pre-built workflow templates users can load
   - Examples: Text Summarizer, Content Moderator, Data Extractor, Translation Pipeline
   - "Save Template" to persist custom workflows

## TECHNICAL IMPLEMENTATION

**Frontend Technologies:**
- HTML5 Canvas or SVG for connection rendering
- Vanilla JavaScript or React for UI components
- CSS Grid/Flexbox for layout
- Drag API or library like interact.js for drag-and-drop
- Consider using a library like React Flow, jsPlumb, or building custom

**Data Structure:**
```javascript
{
  blocks: [
    {
      id: "block-1",
      type: "text-input",
      position: { x: 100, y: 100 },
      config: { placeholder: "Enter text..." },
      outputs: ["out-1"]
    },
    // ... more blocks
  ],
  connections: [
    {
      id: "conn-1",
      from: { blockId: "block-1", output: "out-1" },
      to: { blockId: "block-2", input: "in-1" }
    }
  ]
}
```

**AI Integration:**
- Use LLM API (OpenAI, Anthropic, etc.) for AI processing blocks
- Each AI block type maps to specific prompts/functions
- Handle async processing with proper loading states
- Implement rate limiting and error handling

**Execution Engine:**
- Topological sort to determine execution order
- Execute blocks in dependency order
- Pass data between blocks through connections
- Support conditional branching (If/Then blocks)
- Handle loops and iterations

## UI/UX DESIGN

**Visual Style:**
- Color-coded block categories (blue=input, purple=AI, yellow=logic, green=output)
- Clean, modern interface with good contrast
- Connection lines with slight curves for visual appeal
- Hover states showing possible connection points
- Zoom and pan controls for large workflows

**Interactions:**
- Drag blocks from sidebar → canvas creates new block instance
- Drag blocks on canvas to reposition
- Click block to select (highlight border)
- Double-click block to focus/configure
- Right-click for context menu (duplicate, delete, configure)
- Keyboard shortcuts (Delete key removes selected, Ctrl+Z undo)

**Feedback:**
- Visual confirmation when blocks connect
- Animated "data flow" during execution
- Progress indicators on each block during test runs
- Toast notifications for errors
- Validation messages for incomplete workflows

## ADVANCED FEATURES (Optional)

- Real-time collaboration with multiple users
- Workflow versioning and history
- Export workflow as code or API endpoint
- Import/export workflows as JSON
- Subflows: Group blocks into reusable components
- Custom block creation interface
- Marketplace for sharing workflow templates
- Analytics dashboard showing workflow performance

## EXAMPLE WORKFLOW (Text Summarizer)

1. User drags "Text Input" block to canvas
2. User drags "Summarize" block and connects output of Text Input to input of Summarize
3. User configures Summarize block (select "short" length)
4. User drags "Output" block and connects Summarize output to Output input
5. User clicks "Test Run"
6. User enters text in Text Input block
7. System executes: Input → Summarize (calls LLM API) → Output (displays result)
8. User sees summarized text in Output block

This creates an intuitive, no-code interface for building AI-powered workflows that democratizes access to LLM capabilities.


 Implementation Tips
• Start with a minimal version: just drag-drop blocks and manual connections

• Use React Flow or similar library to accelerate development

• Mock AI responses initially, integrate real LLM APIs later

• Focus on core workflow execution before adding advanced features

• Test with 2-3 block types first, expand library incrementally

🎯 Key Success Factor
The interface should feel like playing with LEGO blocks—intuitive, visual, and immediately satisfying. Each connection made should feel like a small accomplishment.