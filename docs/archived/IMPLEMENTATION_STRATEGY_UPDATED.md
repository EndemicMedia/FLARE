# FLARE Visual Workflow Builder - Updated Implementation Strategy

**Generated:** 2025-10-16 (Updated with backend integration details)
**Phase:** Phase 1 - Foundation
**Approach:** Parallel Agent Development

---

## Backend Integration Analysis

### Existing Backend Structure (Atomic File Organization)
```
src/
├── parser/          # FLARE syntax parsing
│   ├── parseFlareCommand.js        - Main parser (112 LOC)
│   ├── extractFlareCommands.js      - Extract commands from text
│   ├── validateParsedCommand.js     - Validation logic
│   └── globals.js                   - Patterns, defaults, validation
├── services/        # Business logic
│   ├── processFlareCommand.js       - Main orchestrator (61 LOC)
│   ├── executeModelQuery.js         - API integration (116 LOC)
│   ├── queryMultipleModels.js       - Multi-model execution
│   ├── applyPostProcessing.js       - Post-processing router
│   ├── applySummarization.js        - Sum operation
│   ├── applyVoting.js               - Vote operation
│   ├── applyCombination.js          - Comb operation
│   ├── applyDifference.js           - Diff operation
│   ├── applyExpansion.js            - Exp operation
│   ├── applyFiltering.js            - Filter operation
│   └── globals.js                   - API config, retry logic
└── server/          # Express server
    ├── setupApiRoutes.js            - POST /process-flare endpoint (79 LOC)
    └── server.js                    - Main entry point
```

### Key Integration Points

#### 1. POST /process-flare Endpoint
**Location:** `src/server/setupApiRoutes.js:12-38`
**Request Format:**
```json
{
  "command": "{ flare model:openai,mistral temp:0.8 vote `Your prompt` }"
}
```
**Response Format:**
```json
{
  "success": true,
  "result": "Final processed text...",
  "command": "{ flare model:openai,mistral temp:0.8 vote `Your prompt` }"
}
```

#### 2. Parser Integration
**Function:** `parseFlareCommand(commandString)`
**Location:** `src/parser/parseFlareCommand.js:18`
**Returns:**
```javascript
{
  model: ['openai', 'mistral'],      // Array of model names
  temp: 0.8,                          // Temperature (0.0-2.0)
  postProcessing: ['vote', 'sum'],    // Array of operations
  command: 'Your prompt',             // The actual prompt text
  vote_model: 'openai'                // Optional: specific model for post-processing
}
```

#### 3. Available Models
**Default:** `'openai'`
**Supported:** Any model name (Pollinations.ai supports many models)
**Common:** `openai`, `mistral`, `gemini`, `nova-fast`, `qwen-coder`, `bidara`

#### 4. Available Post-Processing Commands
**From:** `src/parser/globals.js:28-35`
- `sum` - Summarization (uses LLM to summarize multiple responses)
- `vote` - Voting (LLM selects best response)
- `comb` - Combination (concatenates responses with separator)
- `diff` - Difference analysis (LLM compares responses)
- `exp` - Expansion (LLM expands on responses)
- `filter` - Filtering (LLM filters low-quality responses)

#### 5. API Configuration
**Base URL:** `https://text.pollinations.ai`
**Endpoint:** `/openai`
**Auth:** Bearer token (default: `Ak59D5TL82X6feti`)
**Timeout:** 30 seconds
**Retry:** 3 attempts with exponential backoff

---

## Updated Token & LOC Estimates

### Phase 1 Components (6 Parallel Workstreams)

#### Workstream 1: Project Foundation & Setup
**Token Budget:** ~12,000 tokens (reduced from 15K)
**Lines of Code:** ~350 LOC (reduced, simpler setup)
**Reason for reduction:** Using Vite for simpler setup, less boilerplate

**Key Files & LOC Breakdown:**
- `package.json` (~50 LOC)
- `tsconfig.json` (~35 LOC)
- `vite.config.ts` (~25 LOC)
- `tailwind.config.js` (~20 LOC)
- `src/App.tsx` (~60 LOC)
- `src/main.tsx` (~15 LOC)
- `.env.example` (~8 LOC)
- `index.html` (~20 LOC)
- ESLint config (~30 LOC)
- Basic CSS setup (~60 LOC)
- README (~27 LOC)

**Token Usage Breakdown:**
- Context & setup: ~4,000 tokens
- Implementation: ~6,000 tokens
- Verification: ~2,000 tokens

---

#### Workstream 2: State Management & Store
**Token Budget:** ~18,000 tokens (reduced from 20K)
**Lines of Code:** ~580 LOC
**Reason:** Simpler types, reuse backend parser types

**Key Files & LOC Breakdown:**
- `src/store/flareWorkflowStore.ts` (~280 LOC)
- `src/types/nodes.ts` (~90 LOC)
- `src/types/edges.ts` (~45 LOC)
- `src/types/workflow.ts` (~70 LOC)
- `src/types/backend.ts` (~35 LOC) - Types matching backend API
- `src/test/unit/store.test.ts` (~60 LOC - minimal tests initially)

**Token Usage Breakdown:**
- Reading backend code: ~3,000 tokens
- Type definitions: ~4,000 tokens
- Store implementation: ~7,000 tokens
- Undo/redo: ~2,500 tokens
- Tests: ~1,500 tokens

---

#### Workstream 3: Core Node Components
**Token Budget:** ~32,000 tokens (reduced from 35K)
**Lines of Code:** ~1,200 LOC
**Reason:** Simpler initial components, less testing initially

**Key Files & LOC Breakdown:**
- `src/components/nodes/TextInputNode.tsx` (~100 LOC)
- `src/components/nodes/ModelQueryNode.tsx` (~170 LOC)
- `src/components/nodes/ParameterNode.tsx` (~110 LOC)
- `src/components/nodes/PostProcessingNode.tsx` (~150 LOC)
- `src/components/nodes/OutputNode.tsx` (~130 LOC)
- `src/components/NodeConfigPanel.tsx` (~150 LOC)
- `src/styles/nodes.css` (~130 LOC)
- `src/test/unit/nodes/*.test.tsx` (~160 LOC - basic smoke tests)
- `src/components/nodes/index.ts` (~20 LOC - exports)
- `src/constants/models.ts` (~40 LOC - model configs)
- `src/constants/postProcessing.ts` (~40 LOC - operation configs)

**Token Usage Breakdown:**
- Backend integration study: ~4,000 tokens
- TextInputNode: ~3,500 tokens
- ModelQueryNode: ~5,500 tokens
- ParameterNode: ~3,500 tokens
- PostProcessingNode: ~5,000 tokens
- OutputNode: ~3,500 tokens
- Constants & config: ~2,000 tokens
- Testing: ~5,000 tokens

---

#### Workstream 4: Canvas & ReactFlow Integration
**Token Budget:** ~28,000 tokens (reduced from 30K)
**Lines of Code:** ~980 LOC
**Reason:** Simpler validation, reuse backend validation

**Key Files & LOC Breakdown:**
- `src/components/FlareWorkflowCanvas.tsx` (~320 LOC)
- `src/components/NodePalette.tsx` (~180 LOC)
- `src/components/FlareToolbar.tsx` (~130 LOC)
- `src/utils/connectionValidator.ts` (~150 LOC)
- `src/styles/canvas.css` (~100 LOC)
- `src/test/integration/canvas.test.tsx` (~80 LOC)
- `src/hooks/useReactFlow.ts` (~20 LOC)

**Token Usage Breakdown:**
- ReactFlow integration: ~6,000 tokens
- Canvas implementation: ~8,000 tokens
- Node palette & drag-drop: ~5,000 tokens
- Connection validation: ~4,000 tokens
- Styling: ~3,000 tokens
- Testing: ~2,000 tokens

---

#### Workstream 5: Graph Compilation & FLARE Integration
**Token Budget:** ~25,000 tokens (reduced from 28K)
**Lines of Code:** ~830 LOC
**Reason:** **REUSE EXISTING BACKEND PARSER** - no need to reimplement!

**Key Files & LOC Breakdown:**
- `src/utils/graphToFlare.ts` (~240 LOC) - Graph → FLARE string
- `src/utils/flareToGraph.ts` (~220 LOC) - **Calls backend parser API**
- `src/utils/topologicalSort.ts` (~100 LOC)
- `src/components/SyntaxView.tsx` (~130 LOC)
- `src/utils/layoutAlgorithm.ts` (~80 LOC) - Auto-layout for parsed graphs
- `src/test/unit/compiler/graphToFlare.test.ts` (~60 LOC)

**Token Usage Breakdown:**
- Reading backend parser: ~4,000 tokens
- Graph-to-FLARE compiler: ~7,000 tokens
- FLARE-to-graph (using backend): ~5,000 tokens
- Topological sort: ~2,500 tokens
- Syntax view: ~3,500 tokens
- Testing: ~3,000 tokens

**CRITICAL INSIGHT:** We can call `parseFlareCommand()` from frontend via API or import it directly if we expose it! This saves ~5,000 tokens and 100+ LOC.

---

#### Workstream 6: Execution Engine & Backend Integration
**Token Budget:** ~30,000 tokens (reduced from 32K)
**Lines of Code:** ~950 LOC
**Reason:** Direct integration with `/process-flare`, simpler execution

**Key Files & LOC Breakdown:**
- `src/services/flareApiService.ts` (~180 LOC)
- `src/services/workflowExecutor.ts` (~320 LOC)
- `src/components/ExecutionMonitor.tsx` (~160 LOC)
- `src/hooks/useWorkflowExecution.ts` (~110 LOC)
- `src/utils/executionHelpers.ts` (~80 LOC)
- `src/test/e2e/workflow-execution.test.ts` (~100 LOC)

**Token Usage Breakdown:**
- Backend API study: ~4,000 tokens
- API service implementation: ~5,000 tokens
- Execution engine: ~8,000 tokens
- Real-time updates: ~4,500 tokens
- Error handling: ~3,500 tokens
- Testing: ~5,000 tokens

---

## Updated Total Phase 1 Estimates

### Token Budget Summary
| Workstream | Original | Updated | Savings |
|------------|----------|---------|---------|
| 1. Foundation | 15,000 | 12,000 | 3,000 |
| 2. State Management | 20,000 | 18,000 | 2,000 |
| 3. Node Components | 35,000 | 32,000 | 3,000 |
| 4. Canvas Integration | 30,000 | 28,000 | 2,000 |
| 5. Graph Compilation | 28,000 | 25,000 | 3,000 |
| 6. Execution Engine | 32,000 | 30,000 | 2,000 |
| **TOTAL** | **160,000** | **145,000** | **15,000** |

### Lines of Code Summary
| Workstream | Original | Updated | Reduction |
|------------|----------|---------|-----------|
| 1. Foundation | 400 | 350 | 50 |
| 2. State Management | 650 | 580 | 70 |
| 3. Node Components | 1,400 | 1,200 | 200 |
| 4. Canvas Integration | 1,100 | 980 | 120 |
| 5. Graph Compilation | 950 | 830 | 120 |
| 6. Execution Engine | 1,050 | 950 | 100 |
| **TOTAL** | **5,550 LOC** | **4,890 LOC** | **660 LOC** |

**Total Savings:** 15,000 tokens, 660 LOC by leveraging existing backend!

---

## Backend Reusability Opportunities

### 1. Parser Reuse (MAJOR SAVINGS)
**Original Plan:** Reimplement FLARE parser in TypeScript
**Better Approach:** Call `/process-flare` or expose parser as shared module
**Savings:** ~5,000 tokens, ~200 LOC

**Implementation Options:**
A. **API Call:** Send FLARE string to backend, get parsed result
B. **Shared Module:** Import `parseFlareCommand` from backend (if we use JS/TS interop)
C. **Parser Service Endpoint:** Create new endpoint `/parse-flare` that just parses without executing

**Recommendation:** Option C - Add lightweight parser-only endpoint:
```javascript
// In setupApiRoutes.js
app.post('/parse-flare', (req, res) => {
  try {
    const parsed = parseFlareCommand(req.body.command);
    res.json({ success: true, parsed });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

### 2. Validation Reuse
**Backend has:** Model validation, temperature validation, prompt validation
**Frontend should:** Call backend validation OR copy validation rules from `src/parser/globals.js`

### 3. Constants Reuse
**Backend defines:**
- Available models (dynamic list could be added)
- Post-processing commands: `['sum', 'vote', 'comb', 'diff', 'exp', 'filter']`
- Temperature range: 0.0 - 2.0
- Retry config: 3 attempts, exponential backoff

**Frontend should:** Import these constants directly from backend types

---

## Updated Parallel Execution Strategy

### Phase 1A: Foundation (29K tokens, 930 LOC)
**Can run in parallel:**
- **Agent 1:** Workstream 1 (Foundation) - 12K tokens, 350 LOC
- **Agent 2:** Workstream 2 (State) - 18K tokens, 580 LOC

**Integration step:** Merge and verify store works with React app

---

### Phase 1B: Core Logic (57K tokens, 2,030 LOC)
**Can run in parallel after 1A:**
- **Agent 3:** Workstream 3 (Nodes) - 32K tokens, 1,200 LOC
- **Agent 4:** Workstream 5 (Compiler) - 25K tokens, 830 LOC

**Integration step:** Verify nodes use store, compiler produces valid FLARE

---

### Phase 1C: Integration (58K tokens, 1,930 LOC)
**Can run in parallel after 1B:**
- **Agent 5:** Workstream 4 (Canvas) - 28K tokens, 980 LOC
- **Agent 6:** Workstream 6 (Execution) - 30K tokens, 950 LOC

**Integration step:** Full E2E test: drag → compile → execute → display

---

## Agent Task Assignments (Updated)

### Agent 1: Foundation Engineer (12K tokens)
**Prompt:**
```
Set up React + TypeScript + Vite project in flare-visual-ui/ directory.

Dependencies:
- reactflow@11.x
- zustand@4.x
- axios@1.x
- tailwindcss@3.x
- @types/react, @types/react-dom

Create structure:
- package.json (~50 LOC)
- tsconfig.json with strict: true (~35 LOC)
- vite.config.ts with proper aliases (~25 LOC)
- tailwind.config.js (~20 LOC)
- src/App.tsx with router setup (~60 LOC)
- src/main.tsx (~15 LOC)
- .env.example with VITE_API_URL=http://localhost:8080 (~8 LOC)
- index.html (~20 LOC)
- .eslintrc.json (~30 LOC)
- src/styles/globals.css (~60 LOC)
- README.md (~27 LOC)

Total: ~350 LOC

Backend Integration:
- API base URL: http://localhost:8080
- Endpoint: /process-flare
- CORS: Already configured in backend

Verify:
- npm run dev starts successfully
- npm run build completes without errors
- TypeScript strict mode enabled
```

**Expected Token Usage:** ~12,000
- Setup & config: 10,000
- Verification: 2,000

---

### Agent 2: State Architect (18K tokens)
**Prompt:**
```
Implement Zustand store for FLARE workflow state management.

Backend Integration Points:
- Backend parser returns: { model: string[], temp: number, postProcessing: string[], command: string }
- POST /process-flare accepts: { command: string }
- Response format: { success: boolean, result: string, command: string }

Files to create:
1. src/types/backend.ts (~35 LOC) - Match backend API types
2. src/types/nodes.ts (~90 LOC) - Node type definitions
3. src/types/edges.ts (~45 LOC) - Edge type definitions
4. src/types/workflow.ts (~70 LOC) - Workflow state types
5. src/store/flareWorkflowStore.ts (~280 LOC) - Main Zustand store
6. src/test/unit/store.test.ts (~60 LOC) - Basic tests

Total: ~580 LOC

Store Actions:
- addNode, updateNode, removeNode
- addEdge, removeEdge
- setExecutionState, setNodeStatus
- undo, redo (use zustand/middleware)
- compileToFlare (returns FLARE syntax string)
- executeWorkflow (calls /process-flare)

Use strict TypeScript, no 'any' types.
```

**Expected Token Usage:** ~18,000
- Backend study: 3,000
- Types: 4,000
- Store: 9,000
- Tests: 2,000

---

### Agent 3: Component Builder (32K tokens)
**Prompt:**
```
Create 5 React node components using ReactFlow and Tailwind CSS.

Backend Integration:
- Available models: openai, mistral, gemini, nova-fast, qwen-coder, bidara (from src/services/globals.js)
- Post-processing: sum, vote, comb, diff, exp, filter (from src/parser/globals.js:28-35)
- Temperature range: 0.0 - 2.0 (from src/parser/globals.js:38-42)

Files to create:
1. src/constants/models.ts (~40 LOC) - Model list and icons
2. src/constants/postProcessing.ts (~40 LOC) - Post-processing configs
3. src/components/nodes/TextInputNode.tsx (~100 LOC)
4. src/components/nodes/ModelQueryNode.tsx (~170 LOC)
5. src/components/nodes/ParameterNode.tsx (~110 LOC)
6. src/components/nodes/PostProcessingNode.tsx (~150 LOC)
7. src/components/nodes/OutputNode.tsx (~130 LOC)
8. src/components/NodeConfigPanel.tsx (~150 LOC)
9. src/components/nodes/index.ts (~20 LOC)
10. src/styles/nodes.css (~130 LOC)
11. src/test/unit/nodes/*.test.tsx (~160 LOC across 5 files)

Total: ~1,200 LOC

Node Status States:
- idle (gray)
- loading (blue, animated)
- completed (green)
- error (red)

Use ReactFlow's Handle component for connection points.
Use Zustand store via useFlareWorkflowStore hook.
```

**Expected Token Usage:** ~32,000

---

### Agent 4: Compiler Engineer (25K tokens)
**Prompt:**
```
Implement graph-to-FLARE compilation and FLARE-to-graph parsing.

CRITICAL: Backend parser already exists at src/parser/parseFlareCommand.js
DO NOT reimplement the parser. Instead, call the backend API.

Backend Parser API:
- Function: parseFlareCommand(commandString)
- Input: "{ flare model:openai,mistral temp:0.8 vote `prompt` }"
- Output: { model: ['openai', 'mistral'], temp: 0.8, postProcessing: ['vote'], command: 'prompt' }

Files to create:
1. src/utils/graphToFlare.ts (~240 LOC) - Compile graph to FLARE syntax
2. src/utils/flareToGraph.ts (~220 LOC) - Parse FLARE using backend, convert to graph
3. src/utils/topologicalSort.ts (~100 LOC) - Determine execution order
4. src/utils/layoutAlgorithm.ts (~80 LOC) - Auto-layout for parsed graphs
5. src/components/SyntaxView.tsx (~130 LOC) - Live syntax preview
6. src/test/unit/compiler/graphToFlare.test.ts (~60 LOC)

Total: ~830 LOC

Graph-to-FLARE Algorithm:
1. Find output node (end of graph)
2. Traverse backwards collecting: models, temp, postProcessing, prompt
3. Build FLARE string: { flare model:X,Y temp:Z operation `prompt` }

FLARE-to-Graph Algorithm:
1. Send FLARE string to backend API (or call parseFlareCommand via shared import)
2. Get parsed object
3. Create nodes based on parsed data
4. Connect nodes in logical order
5. Apply auto-layout algorithm

Use topological sort for execution order validation.
```

**Expected Token Usage:** ~25,000
- Backend parser study: 4,000
- Graph-to-FLARE: 7,000
- FLARE-to-graph: 5,000
- Layout & sort: 5,000
- Testing: 4,000

---

### Agent 5: Canvas Integrator (28K tokens)
**Prompt:**
```
Build ReactFlow canvas with drag-and-drop node palette.

Backend Integration:
- Connection validation should match FLARE syntax rules
- Invalid connections: same as invalid FLARE syntax

Files to create:
1. src/components/FlareWorkflowCanvas.tsx (~320 LOC) - Main canvas
2. src/components/NodePalette.tsx (~180 LOC) - Draggable node palette
3. src/components/FlareToolbar.tsx (~130 LOC) - Toolbar with execute button
4. src/utils/connectionValidator.ts (~150 LOC) - Connection validation
5. src/hooks/useReactFlow.ts (~20 LOC) - ReactFlow utilities
6. src/styles/canvas.css (~100 LOC)
7. src/test/integration/canvas.test.tsx (~80 LOC)

Total: ~980 LOC

Connection Rules (from backend syntax):
- TextInput.text → ModelQuery.prompt (required, max 1)
- Parameter.tempValue → ModelQuery.temperature (optional, max 1)
- ModelQuery.responses → PostProcessing.responses OR Output.result
- PostProcessing.result → PostProcessing.responses OR Output.result

Use ReactFlow's:
- Controls (zoom, pan)
- MiniMap
- Background (dots pattern)
- onConnect for connection validation
- onNodesChange, onEdgesChange for state updates

Integrate with Zustand store from Workstream 2.
Use node components from Workstream 3.
```

**Expected Token Usage:** ~28,000

---

### Agent 6: Execution Engineer (30K tokens)
**Prompt:**
```
Implement workflow execution engine integrating with backend /process-flare endpoint.

Backend API:
- Endpoint: POST http://localhost:8080/process-flare
- Request: { "command": "{ flare model:openai `prompt` }" }
- Response: { "success": true, "result": "response text", "command": "..." }
- Error Response: { "success": false, "error": "error message" }

Backend Retry Logic (DO NOT reimplement):
- 3 attempts with exponential backoff
- Already handled by backend
- Frontend just needs to show loading state

Files to create:
1. src/services/flareApiService.ts (~180 LOC) - API client
2. src/services/workflowExecutor.ts (~320 LOC) - Execution orchestration
3. src/components/ExecutionMonitor.tsx (~160 LOC) - Execution status UI
4. src/hooks/useWorkflowExecution.ts (~110 LOC) - React hook
5. src/utils/executionHelpers.ts (~80 LOC) - Helper functions
6. src/test/e2e/workflow-execution.test.ts (~100 LOC)

Total: ~950 LOC

Execution Flow:
1. Compile graph to FLARE syntax (use graphToFlare from Workstream 5)
2. Set all nodes to 'loading' status
3. Call POST /process-flare with compiled FLARE
4. Update nodes to 'completed' or 'error' based on response
5. Display result in Output node

Use AbortController for request cancellation.
Use Zustand store for state updates.
Implement visual execution feedback (animated edges).
```

**Expected Token Usage:** ~30,000
- Backend API study: 4,000
- API service: 5,000
- Execution engine: 9,000
- Real-time updates: 4,000
- Error handling: 3,000
- Testing: 5,000

---

## Token Safety Margins (Updated)

### Total Phase 1 with Buffer
- Estimated: 145,000 tokens
- With 15% buffer: **167,000 tokens**
- Available budget: 200,000 tokens
- **Remaining:** 33,000 tokens for integration, debugging, and adjustments

### Per-Phase Buffer
- Phase 1A: 29K → 33K (4K buffer)
- Phase 1B: 57K → 66K (9K buffer)
- Phase 1C: 58K → 67K (9K buffer)

---

## Success Metrics (Updated)

### Token Efficiency
- Target: <30 tokens per LOC
- Updated ratio: ~30 tokens per LOC (excellent)
- Savings from backend reuse: 15,000 tokens

### Code Coverage
- Target: 4,890 LOC total
- Test LOC: ~560 (11% by LOC, >85% by coverage)
- Reduced test LOC by focusing on critical paths initially

### Integration Points
- ✅ Direct API integration with `/process-flare`
- ✅ Reuse backend parser via API or shared module
- ✅ Match backend types exactly
- ✅ Use backend validation rules
- ✅ Leverage backend retry logic

---

## Critical Success Factors

### 1. Backend Dependency
**All agents must:**
- Read backend source code first
- Match backend API contracts exactly
- Not reimplement what backend already does
- Test against running backend server

### 2. Type Safety
**All TypeScript must:**
- Match backend response types exactly
- Use strict mode (no `any` types)
- Export types for reuse across agents

### 3. Integration Testing
**After each phase:**
- Start backend server: `cd /Users/A200326959/Development/FLARE && npm start`
- Verify API responds: `curl http://localhost:8080/health`
- Test compiled FLARE: `curl -X POST http://localhost:8080/process-flare -H "Content-Type: application/json" -d '{"command":"{ flare model:openai \`test\` }"}'`

---

**Ready to launch Phase 1A with updated strategy and backend integration!**
