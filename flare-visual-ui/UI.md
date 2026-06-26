# FLARE Visual Editor — UI Guide

The visual editor is a node-based workflow builder (ReactFlow) that compiles to FLARE
syntax and executes entirely in the browser against Pollinations.ai.

---

## Layout

- **Canvas** — ReactFlow surface with `MiniMap`, `Controls`, and dotted `Background`.
  Pan, zoom, select, and connect nodes via handles.
- **Toolbar** — Add-node buttons, Run, Save/Load (JSON), Auto-layout, Syntax view toggle,
  and Settings (theme + BYOP API key).
- **Syntax panel** — Toggleable view showing the compiled FLARE command for the graph.

---

## Node Types

| Type | Purpose |
|------|---------|
| `textInput` | Prompt entry |
| `modelQuery` | Model selection + temperature |
| `parameter` | Temperature slider |
| `postProcessing` | Post-op selection (`sum`, `vote`, `comb`, `diff`, `exp`, `filter`) |
| `output` | Result display (text / json / markdown) |
| `imageGeneration` | Image prompt + model/size params |
| `flareCommand` | Nested workflow wrapper (sub-graph) |

Each node shows a status indicator (`idle` / `running` / `success` / `error`) during execution.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Backspace` / `Delete` | Delete selected nodes/edges |
| `Ctrl/Cmd + E` | Execute workflow |
| `Ctrl/Cmd + S` | Save workflow to file |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` / `Ctrl/Cmd + Y` | Redo |
| `Escape` | Reset execution state |

---

## Theme

Dark/light themes are managed by `themeStore` (`src/store/themeStore.ts`). The default is a
dark canvas optimized for readability of node content and edges.

### Color reference (dark theme)

| Token | Value |
|-------|-------|
| Canvas background | `#121212` |
| Node surface | `#181818` |
| Elevated / hover | `#282828` |
| Primary text | `#FFFFFF` |
| Secondary text | `#B3B3B3` |
| Accent | `#1DB954` |
| Error | `#E22134` |
| Warning | `#FFA42B` |

---

## State

- **`flareWorkflowStore`** — nodes, edges, execution state/progress, undo/redo history,
  and persistence (`saveWorkflowToFile`, `loadWorkflowFromFile`, URL sync).
- **`themeStore`** — theme toggle.

See [STATE_ARCHITECTURE.md](STATE_ARCHITECTURE.md) for the full type and store contracts.
