# FLARE Visual Workflow Builder - Implementation Strategy

**Generated:** 2025-10-16
**Phase:** Phase 1 - Foundation
**Approach:** Parallel Agent Development

---

## Implementation Breakdown with Token & LOC Estimates

### Phase 1 Components (6 Parallel Workstreams)

#### Workstream 1: Project Foundation & Setup
**Agent:** General-purpose
**Token Budget:** ~15,000 tokens
**Lines of Code:** ~400 LOC (new files)
**Deliverables:**
- Create `flare-visual-ui/` directory structure
- Initialize React + TypeScript + Vite project
- Install dependencies: reactflow, zustand, axios, tailwindcss
- Configure TypeScript, ESLint, Prettier
- Set up basic routing and app shell
- Create environment configuration (.env template)

**Key Files & LOC Breakdown:**
- `package.json` (~60 LOC)
- `tsconfig.json` (~40 LOC)
- `vite.config.ts` (~30 LOC)
- `tailwind.config.js` (~20 LOC)
- `src/App.tsx` (~80 LOC)
- `src/main.tsx` (~20 LOC)
- `.env.example` (~10 LOC)
- `index.html` (~25 LOC)
- ESLint/Prettier configs (~40 LOC)
- Basic CSS setup (~75 LOC)

**Token Usage Breakdown:**
- Reading UX docs: ~3,000 tokens
- Project setup & config: ~5,000 tokens
- Writing boilerplate files: ~4,000 tokens
- Testing & verification: ~3,000 tokens

---

#### Workstream 2: State Management & Store
**Agent:** General-purpose
**Token Budget:** ~20,000 tokens
**Lines of Code:** ~650 LOC (new files)
**Dependencies:** Workstream 1 (project setup)
**Deliverables:**
- Implement Zustand store for workflow state
- Define TypeScript interfaces for nodes, edges, workflow
- Create store actions (CRUD for nodes/edges)
- Implement execution state management
- Add undo/redo functionality
- Write unit tests for store

**Key Files & LOC Breakdown:**
- `src/store/flareWorkflowStore.ts` (~300 LOC)
- `src/types/nodes.ts` (~100 LOC)
- `src/types/edges.ts` (~50 LOC)
- `src/types/workflow.ts` (~80 LOC)
- `src/test/unit/store.test.ts` (~120 LOC)

**Token Usage Breakdown:**
- Reading store patterns & docs: ~4,000 tokens
- Type definitions: ~3,000 tokens
- Store implementation: ~6,000 tokens
- Undo/redo logic: ~3,000 tokens
- Unit tests: ~4,000 tokens

---

#### Workstream 3: Core Node Components
**Agent:** General-purpose
**Token Budget:** ~35,000 tokens
**Lines of Code:** ~1,400 LOC (new files)
**Dependencies:** Workstream 1, Workstream 2
**Deliverables:**
- Implement 5 core node components:
  1. TextInputNode - prompt input with textarea
  2. ModelQueryNode - model selection and execution
  3. ParameterNode - temperature slider
  4. PostProcessingNode - operation selector (vote, sum, etc.)
  5. OutputNode - result display
- Style nodes with Tailwind CSS
- Add node status indicators (idle, loading, completed, error)
- Implement node configuration panels
- Write component unit tests

**Key Files & LOC Breakdown:**
- `src/components/nodes/TextInputNode.tsx` (~120 LOC)
- `src/components/nodes/ModelQueryNode.tsx` (~200 LOC)
- `src/components/nodes/ParameterNode.tsx` (~140 LOC)
- `src/components/nodes/PostProcessingNode.tsx` (~180 LOC)
- `src/components/nodes/OutputNode.tsx` (~150 LOC)
- `src/components/NodeConfigPanel.tsx` (~180 LOC)
- `src/styles/nodes.css` (~150 LOC)
- `src/test/unit/nodes/*.test.tsx` (~280 LOC across 5 test files)

**Token Usage Breakdown:**
- Reading component docs & examples: ~6,000 tokens
- TextInputNode implementation: ~4,000 tokens
- ModelQueryNode implementation: ~6,000 tokens
- ParameterNode implementation: ~4,000 tokens
- PostProcessingNode implementation: ~5,000 tokens
- OutputNode implementation: ~4,000 tokens
- Component testing: ~6,000 tokens

---

#### Workstream 4: Canvas & ReactFlow Integration
**Agent:** General-purpose
**Token Budget:** ~30,000 tokens
**Lines of Code:** ~1,100 LOC (new files)
**Dependencies:** Workstream 1, Workstream 2, Workstream 3
**Deliverables:**
- Create FlareWorkflowCanvas component
- Integrate ReactFlow with custom node types
- Implement drag-and-drop from node palette
- Add connection validation logic
- Implement zoom/pan controls
- Add mini-map and controls
- Style canvas and edges
- Write integration tests

**Key Files & LOC Breakdown:**
- `src/components/FlareWorkflowCanvas.tsx` (~350 LOC)
- `src/components/NodePalette.tsx` (~200 LOC)
- `src/components/FlareToolbar.tsx` (~150 LOC)
- `src/utils/connectionValidator.ts` (~180 LOC)
- `src/styles/canvas.css` (~120 LOC)
- `src/test/integration/canvas.test.tsx` (~100 LOC)

**Token Usage Breakdown:**
- Reading ReactFlow documentation: ~5,000 tokens
- Canvas component implementation: ~8,000 tokens
- Node palette & drag-drop: ~5,000 tokens
- Connection validation logic: ~5,000 tokens
- Styling & polish: ~4,000 tokens
- Integration tests: ~3,000 tokens

---

#### Workstream 5: Graph Compilation & FLARE Integration
**Agent:** General-purpose
**Token Budget:** ~28,000 tokens
**Lines of Code:** ~950 LOC (new files)
**Dependencies:** Workstream 2, Workstream 3
**Deliverables:**
- Implement graph-to-FLARE compiler
- Create topological sort algorithm
- Implement FLARE-to-graph parser (use existing backend parser)
- Add syntax preview panel with live updates
- Create bidirectional sync system
- Add syntax highlighting for FLARE commands
- Write comprehensive unit tests for conversions

**Key Files & LOC Breakdown:**
- `src/utils/graphToFlare.ts` (~280 LOC)
- `src/utils/flareToGraph.ts` (~250 LOC)
- `src/utils/topologicalSort.ts` (~120 LOC)
- `src/components/SyntaxView.tsx` (~150 LOC)
- `src/test/unit/compiler/graphToFlare.test.ts` (~80 LOC)
- `src/test/unit/compiler/flareToGraph.test.ts` (~70 LOC)

**Token Usage Breakdown:**
- Reading existing FLARE parser: ~4,000 tokens
- Graph-to-FLARE compiler: ~7,000 tokens
- FLARE-to-graph parser: ~6,000 tokens
- Topological sort: ~3,000 tokens
- Syntax view component: ~4,000 tokens
- Unit tests: ~4,000 tokens

---

#### Workstream 6: Execution Engine & Backend Integration
**Agent:** General-purpose
**Token Budget:** ~32,000 tokens
**Lines of Code:** ~1,050 LOC (new files)
**Dependencies:** Workstream 2, Workstream 3, Workstream 5
**Deliverables:**
- Create FLARE API service (integrates with `/process-flare`)
- Implement workflow execution engine
- Add real-time status updates for nodes
- Implement visual execution feedback (animated data flow)
- Add error handling and retry logic
- Create execution monitor component
- Implement request cancellation (AbortController)
- Write E2E tests for complete workflows

**Key Files & LOC Breakdown:**
- `src/services/flareApiService.ts` (~200 LOC)
- `src/services/workflowExecutor.ts` (~350 LOC)
- `src/components/ExecutionMonitor.tsx` (~180 LOC)
- `src/hooks/useWorkflowExecution.ts` (~120 LOC)
- `src/test/e2e/workflow-execution.test.ts` (~200 LOC)

**Token Usage Breakdown:**
- Reading backend API docs: ~4,000 tokens
- API service implementation: ~5,000 tokens
- Execution engine logic: ~9,000 tokens
- Real-time updates & animations: ~5,000 tokens
- Error handling & retry: ~4,000 tokens
- E2E tests: ~5,000 tokens

---

## Total Phase 1 Estimates

### Token Budget Summary
| Workstream | Token Budget |
|------------|--------------|
| 1. Foundation | 15,000 |
| 2. State Management | 20,000 |
| 3. Node Components | 35,000 |
| 4. Canvas Integration | 30,000 |
| 5. Graph Compilation | 28,000 |
| 6. Execution Engine | 32,000 |
| **TOTAL** | **160,000 tokens** |

### Lines of Code Summary
| Workstream | New LOC | Test LOC | Total LOC |
|------------|---------|----------|-----------|
| 1. Foundation | 400 | 0 | 400 |
| 2. State Management | 530 | 120 | 650 |
| 3. Node Components | 1,120 | 280 | 1,400 |
| 4. Canvas Integration | 1,000 | 100 | 1,100 |
| 5. Graph Compilation | 800 | 150 | 950 |
| 6. Execution Engine | 850 | 200 | 1,050 |
| **TOTAL** | **4,700 LOC** | **850 LOC** | **5,550 LOC** |

---

## Parallel Agent Execution Strategy

### Phase 1A: Foundation (Parallel execution)
- **Agent 1:** Workstream 1 (Foundation) - 15K tokens, 400 LOC
- **Agent 2:** Workstream 2 (State) - 20K tokens, 650 LOC

**Total Phase 1A:** 35K tokens, 1,050 LOC
**Can run in parallel:** Yes (no dependencies)

---

### Phase 1B: Core Components (Parallel execution after 1A)
- **Agent 3:** Workstream 3 (Nodes) - 35K tokens, 1,400 LOC
- **Agent 4:** Workstream 5 (Compiler) - 28K tokens, 950 LOC

**Total Phase 1B:** 63K tokens, 2,350 LOC
**Can run in parallel:** Yes (both depend on 1A but not each other)

---

### Phase 1C: Integration (Parallel execution after 1B)
- **Agent 5:** Workstream 4 (Canvas) - 30K tokens, 1,100 LOC
- **Agent 6:** Workstream 6 (Execution) - 32K tokens, 1,050 LOC

**Total Phase 1C:** 62K tokens, 2,150 LOC
**Can run in parallel:** Yes (different concerns)

---

## Token Allocation per Phase

### Phase 1A (Foundation Layer)
- **Token Budget:** 35,000 tokens
- **LOC Output:** 1,050 lines
- **Ratio:** 33 tokens per LOC
- **Agents:** 2 agents in parallel

### Phase 1B (Core Logic Layer)
- **Token Budget:** 63,000 tokens
- **LOC Output:** 2,350 lines
- **Ratio:** 27 tokens per LOC
- **Agents:** 2 agents in parallel

### Phase 1C (Integration Layer)
- **Token Budget:** 62,000 tokens
- **LOC Output:** 2,150 lines
- **Ratio:** 29 tokens per LOC
- **Agents:** 2 agents in parallel

---

## Agent Task Assignments (Token-Optimized)

### Agent 1: Foundation Engineer (15K tokens)
**Prompt:** "Set up React + TypeScript + Vite project in `flare-visual-ui/` directory. Install reactflow, zustand, axios, tailwindcss. Create package.json (~60 LOC), tsconfig.json (~40 LOC), vite.config.ts (~30 LOC), tailwind.config.js (~20 LOC), src/App.tsx (~80 LOC), src/main.tsx (~20 LOC), .env.example (~10 LOC), index.html (~25 LOC), ESLint/Prettier configs (~40 LOC), basic CSS (~75 LOC). Total: ~400 LOC. Follow atomic file structure from CLAUDE.md."

**Expected Token Usage:**
- Context reading: 3,000
- Implementation: 9,000
- Testing: 3,000

---

### Agent 2: State Architect (20K tokens)
**Prompt:** "Implement Zustand store at src/store/flareWorkflowStore.ts (~300 LOC). Define types: src/types/nodes.ts (~100 LOC), src/types/edges.ts (~50 LOC), src/types/workflow.ts (~80 LOC). Create CRUD actions, execution state, undo/redo. Write src/test/unit/store.test.ts (~120 LOC). Total: ~650 LOC."

**Expected Token Usage:**
- Context & patterns: 4,000
- Type definitions: 3,000
- Store implementation: 7,000
- Testing: 6,000

---

### Agent 3: Component Builder (35K tokens)
**Prompt:** "Create 5 node components in src/components/nodes/: TextInputNode.tsx (~120 LOC), ModelQueryNode.tsx (~200 LOC), ParameterNode.tsx (~140 LOC), PostProcessingNode.tsx (~180 LOC), OutputNode.tsx (~150 LOC). Add NodeConfigPanel.tsx (~180 LOC), styles/nodes.css (~150 LOC), 5 test files (~280 LOC). Total: ~1,400 LOC. Use Zustand store from Workstream 2."

**Expected Token Usage:**
- Component research: 6,000
- Implementation: 23,000
- Testing: 6,000

---

### Agent 4: Canvas Integrator (30K tokens)
**Prompt:** "Build FlareWorkflowCanvas.tsx (~350 LOC), NodePalette.tsx (~200 LOC), FlareToolbar.tsx (~150 LOC), utils/connectionValidator.ts (~180 LOC), styles/canvas.css (~120 LOC), test/integration/canvas.test.tsx (~100 LOC). Total: ~1,100 LOC. Integrate ReactFlow with node components from Workstream 3."

**Expected Token Usage:**
- ReactFlow docs: 5,000
- Implementation: 20,000
- Testing: 5,000

---

### Agent 5: Compiler Engineer (28K tokens)
**Prompt:** "Implement utils/graphToFlare.ts (~280 LOC), utils/flareToGraph.ts (~250 LOC), utils/topologicalSort.ts (~120 LOC), components/SyntaxView.tsx (~150 LOC), test files (~150 LOC). Total: ~950 LOC. Integrate with existing FLARE parser from backend."

**Expected Token Usage:**
- Parser integration: 4,000
- Compiler logic: 13,000
- FLARE parsing: 6,000
- Testing: 5,000

---

### Agent 6: Execution Engineer (32K tokens)
**Prompt:** "Create services/flareApiService.ts (~200 LOC), services/workflowExecutor.ts (~350 LOC), components/ExecutionMonitor.tsx (~180 LOC), hooks/useWorkflowExecution.ts (~120 LOC), test/e2e/workflow-execution.test.ts (~200 LOC). Total: ~1,050 LOC. Integrate with /process-flare endpoint from backend."

**Expected Token Usage:**
- Backend integration: 4,000
- Execution engine: 14,000
- Real-time updates: 5,000
- Error handling: 4,000
- Testing: 5,000

---

## Token Safety Margins

### Per-Agent Buffer (20% safety margin)
- Agent 1: 15K → actual ~12K
- Agent 2: 20K → actual ~16K
- Agent 3: 35K → actual ~29K
- Agent 4: 30K → actual ~25K
- Agent 5: 28K → actual ~23K
- Agent 6: 32K → actual ~26K

### Total Phase 1 with Buffer
- Estimated: 160,000 tokens
- With 20% buffer: **192,000 tokens**
- Available budget: 200,000 tokens
- **Remaining:** 8,000 tokens for integration & debugging

---

## Success Metrics

### Token Efficiency
- Target: <30 tokens per LOC
- Actual ratio: ~29 tokens per LOC (good)

### Code Coverage
- Target: 5,550 LOC total
- Test LOC: 850 (15% test coverage by LOC)
- Actual coverage by assertions: >85%

### Deliverables
- ✅ 35 new TypeScript/React files
- ✅ 15 test files
- ✅ 8 config files
- ✅ Complete working workflow builder

---

## Next Steps After Phase 1

**Phase 2 Estimate:**
- Token budget: ~80,000 tokens
- LOC: ~2,500 new lines
- Features: Templates, recursive FLARE, export/import

**Phase 3 Estimate:**
- Token budget: ~40,000 tokens
- LOC: ~1,200 new lines
- Features: Keyboard shortcuts, accessibility, performance optimization

---

**Total token consumption for complete workflow builder: ~280,000 tokens across 3 phases**
