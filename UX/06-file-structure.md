# 6. File Structure

```
flare-visual-ui/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── templates/
│       ├── text-summarizer.json
│       ├── multi-model-compare.json
│       └── content-moderator.json
├── src/
│   ├── components/
│   │   ├── FlareWorkflowCanvas.jsx
│   │   ├── FlareToolbar.jsx
│   │   ├── NodePalette.jsx
│   │   ├── NodeConfigPanel.jsx
│   │   ├── SyntaxView.jsx
│   │   ├── ExecutionMonitor.jsx
│   │   └── nodes/
│   │       ├── TextInputNode.jsx
│   │       ├── ModelQueryNode.jsx
│   │       ├── PostProcessingNode.jsx
│   │       ├── ParameterNode.jsx
│   │       ├── OutputNode.jsx
│   │       └── FlareCommandNode.jsx
│   ├── store/
│   │   └── flareWorkflowStore.js
│   ├── services/
│   │   ├── flareApiService.js
│   │   ├── workflowExecutor.js
│   │   └── templateService.js
│   ├── utils/
│   │   ├── graphToFlare.js
│   │   ├── flareToGraph.js
│   │   ├── connectionValidator.js
│   │   ├── topologicalSort.js
│   │   └── layoutAlgorithm.js
│   ├── styles/
│   │   ├── globals.css
│   │   ├── nodes.css
│   │   └── canvas.css
│   ├── types/
│   │   ├── nodes.ts
│   │   ├── edges.ts
│   │   └── workflow.ts
│   ├── App.jsx
│   └── index.jsx
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```
