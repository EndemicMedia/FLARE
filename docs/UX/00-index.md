# FLARE Visual Node-Based UI - Documentation Index

This documentation provides a comprehensive technical blueprint for implementing a visual, node-based UI for the FLARE (Fractal Language for Autonomous Recursive Expansion) system.

## Executive Summary

The interface will transform FLARE's text-based syntax into an intuitive drag-and-drop visual programming environment, enabling users to construct complex AI orchestration workflows without writing code.

**Key Objectives:**
- Visual representation of FLARE commands as interactive node graphs
- Real-time workflow execution with visual feedback
- Bidirectional conversion between node graphs and FLARE syntax
- Seamless integration with existing `/process-flare` backend endpoint
- Support for recursive/nested FLARE commands through visual composition

---

## Implementation Instructions for Claude

### Prerequisites: Understand Existing Architecture

Before starting implementation, familiarize yourself with the current FLARE backend:

1. **Core FLARE Processing Logic**
   - `src/services/flareProcessor.js` - Orchestrates FLARE command execution
   - `src/utilities/flareParser.js` - Parses FLARE syntax into structured data
   - `src/services/modelService.js` - Handles model API communication
   - `src/services/postProcessingService.js` - Implements post-processing operations

2. **Server & API Structure**
   - `src/server.js` - Express server with `/process-flare` endpoint
   - Current API accepts POST requests with FLARE syntax strings
   - Returns structured responses with model outputs

3. **Existing Frontend**
   - `llm-comparison-tool/index.html` - Current text-based interface
   - Review to understand user workflows and expectations

### Coding Standards & Best Practices

**Project-Specific Guidelines:**
- Use ES modules (`import/export`) - project is configured with `"type": "module"`
- Async/await pattern throughout (no callbacks or raw promises)
- Functional programming approach for parsers and processors
- Small, single-responsibility functions with self-documenting names
- TypeScript for the new visual UI (strong typing required)
- Never read entire files > 1000 lines at once - search for specific functions first

**Architecture Principles:**
1. **Separation of Concerns**
   - Components (UI/presentation logic only)
   - Services (business logic, API calls)
   - Utilities (pure functions, no side effects)
   - Types (TypeScript interfaces/types)

2. **State Management**
   - Use Zustand for global state (lightweight, recommended in docs)
   - Component-local state with React hooks for UI-only state
   - Immutable state updates
   - Single source of truth for graph data

3. **Error Handling**
   - Implement retry logic with exponential backoff (following existing patterns)
   - Use AbortController for cancellable requests
   - Graceful degradation for failed operations
   - User-friendly error messages with recovery options

4. **Testing Strategy**
   - Write unit tests with Mocha + Chai (existing test framework)
   - Use c8 for coverage reporting (already configured)
   - Separate unit tests (`src/test/unit/`) from E2E tests (`src/test/e2e/`)
   - Test each feature before marking tasks as complete

5. **Performance Optimization**
   - Implement virtual rendering for large graphs (>50 nodes)
   - Debounce state updates (300ms recommended)
   - Cache FLARE compilation results
   - Code splitting for non-critical features
   - Lazy load node type components

6. **Security Considerations**
   - Never expose API keys in frontend code
   - Use environment variables for sensitive configuration
   - Validate all user inputs before processing
   - Sanitize FLARE syntax to prevent injection attacks

### Implementation Approach: Incremental & Test-Driven

**Phase-by-Phase Development:**

#### Phase 1: Foundation (Week 1-2) - START HERE
**Initial Command to Claude:**
```
Implement Phase 1 from UX/05-implementation-roadmap.md:
1. Create new React + TypeScript + ReactFlow project in flare-ui/ directory
2. Set up basic canvas component with ModelQueryNode
3. Implement graph-to-FLARE compiler for single nodes
4. Integrate with existing /process-flare API endpoint
5. Display response in node with visual feedback
```

**Success Criteria (Phase 1):**
- [ ] ReactFlow canvas renders with drag-and-drop capability
- [ ] Single ModelQueryNode compiles to valid FLARE syntax: `{ model:gpt-4 "test prompt" }`
- [ ] API call to `/process-flare` succeeds and returns response
- [ ] Response displays in node output handle
- [ ] Basic error handling shows user-friendly messages
- [ ] Unit tests pass for graph compiler
- [ ] E2E test: create node → execute → see result

#### Phase 2-6: Progressive Enhancement
Follow [05-implementation-roadmap.md](./05-implementation-roadmap.md) for detailed tasks in each subsequent phase:
- Phase 2: Post-processing nodes (sum, vote, diff, etc.)
- Phase 3: FLARE-to-graph parser (bidirectional conversion)
- Phase 4: Recursive FLARE support (nested graphs)
- Phase 5: Advanced features (templates, history, export)
- Phase 6: Polish & production deployment

### Development Workflow

1. **Before Writing Code:**
   - Read relevant documentation files from UX/ folder
   - Review existing backend code for integration points
   - Create implementation plan with TodoWrite tool
   - Break large tasks into small, testable increments

2. **During Implementation:**
   - Write tests first (TDD approach when practical)
   - Commit working code frequently
   - Test against real backend `/process-flare` endpoint
   - Update documentation if implementation deviates from specs
   - Never mark tasks complete until tests pass

3. **After Each Phase:**
   - Run full test suite: `npm test`
   - Verify integration with existing backend
   - Document any new patterns or architectural decisions
   - Create demo/screenshot for stakeholder review

### Integration with Existing System

**Key Integration Points:**

1. **API Endpoint Compatibility**
   - Use existing `/process-flare` POST endpoint
   - Send compiled FLARE syntax as request body: `{ flare: "compiled syntax here" }`
   - Parse response format (matches current backend structure)
   - Handle streaming responses if implemented

2. **FLARE Syntax Consistency**
   - Graph compiler must generate valid FLARE syntax
   - Test compiled syntax against parser: `flareParser.js`
   - Support all existing FLARE features (model params, post-processing, recursion)
   - Maintain backward compatibility with text-based syntax

3. **File Structure**
   - Place new UI in `flare-ui/` directory (separate from existing `llm-comparison-tool/`)
   - Share backend API (no changes to server.js required)
   - Reuse system prompts from `llm-comparison-tool/system.json` if needed
   - Follow structure defined in [06-file-structure.md](./06-file-structure.md)

### Checkpoint Review Process

After completing each phase:
1. Run: `npm test` (all tests must pass)
2. Manual testing checklist from phase documentation
3. Code review: check against coding standards above
4. Update LATEST.md with progress and next steps
5. Get approval before proceeding to next phase

### Reference Priority

When implementing features, consult documentation in this order:
1. [05-implementation-roadmap.md](./05-implementation-roadmap.md) - What to build and when
2. [02-architecture-design.md](./02-architecture-design.md) - How components fit together
3. [03-core-features.md](./03-core-features.md) - Detailed feature specifications
4. [04-technical-specifications.md](./04-technical-specifications.md) - Component implementation details
5. Other docs as needed for specific concerns (testing, performance, accessibility)

---

## Documentation Structure

### [01-framework-selection.md](./01-framework-selection.md)
**UI Framework Selection & Justification** - Details the evaluation and selection of React Flow as the optimal framework for FLARE's visual interface, including technical advantages, comparisons with alternatives, and installation instructions.

### [02-architecture-design.md](./02-architecture-design.md)
**Architecture Design** - Comprehensive component hierarchy, FLARE syntax to node mapping, connection logic and validation, state management architecture, and complete examples of how FLARE commands are represented as node graphs.

### [03-core-features.md](./03-core-features.md)
**Core Features Implementation** - Detailed implementation of node types (ModelQueryNode, PostProcessingNode, TextInputNode, ParameterNode), graph-to-FLARE compilation, FLARE-to-graph parsing, recursive FLARE command support, and real-time execution engine.

### [04-technical-specifications.md](./04-technical-specifications.md)
**Technical Specifications** - Component implementation details including the main canvas component, API integration patterns, node configuration panel, and visual feedback system with execution animations.

### [05-implementation-roadmap.md](./05-implementation-roadmap.md)
**Implementation Roadmap** - Six-phase development plan spanning 11 weeks, from foundation setup through production deployment, with detailed tasks, deliverables, and testing strategies for each phase.

### [06-file-structure.md](./06-file-structure.md)
**File Structure** - Complete project directory structure showing organization of components, services, utilities, styles, and types for the visual UI application.

### [07-dependencies-setup.md](./07-dependencies-setup.md)
**Dependencies & Setup** - Core dependencies (React, ReactFlow, Zustand), installation steps, and environment configuration for the project.

### [08-testing-strategy.md](./08-testing-strategy.md)
**Testing Strategy** - Comprehensive testing approach including unit tests for node components, integration tests for graph compilation, and end-to-end tests for complete workflows.

### [09-performance-considerations.md](./09-performance-considerations.md)
**Performance Considerations** - Optimization strategies including virtual rendering for large graphs, debounced state updates, FLARE compilation caching, and bundle size optimization through code splitting.

### [10-accessibility-ux.md](./10-accessibility-ux.md)
**Accessibility & UX Enhancements** - Keyboard shortcuts implementation, screen reader support, and other accessibility features to ensure the interface is usable by all users.

## Quick Start

1. Start with [01-framework-selection.md](./01-framework-selection.md) to understand the technology choices
2. Review [02-architecture-design.md](./02-architecture-design.md) to grasp the overall system design
3. Follow [05-implementation-roadmap.md](./05-implementation-roadmap.md) for the step-by-step development plan
4. Refer to specific technical sections as needed during implementation

## Key Success Factors

1. **Incremental Development**: Phased approach allows for early feedback and iteration
2. **Strong Typing**: TypeScript ensures maintainability and reduces bugs
3. **Comprehensive Testing**: Unit, integration, and E2E tests ensure reliability
4. **Performance Focus**: Optimization strategies from the start
5. **User-Centric Design**: Keyboard shortcuts, accessibility, and intuitive interactions

## Next Steps

1. Review and approve this technical plan
2. Set up development environment (Phase 1, Week 1)
3. Begin implementation with basic node system
4. Schedule weekly progress reviews
5. Plan user testing sessions for Phase 5

This visual interface will democratize FLARE's powerful AI orchestration capabilities, making them accessible to non-technical users while maintaining the full power and flexibility of the underlying FLARE language.
