# 8. Testing Strategy

## 8.1 Unit Tests

**Node Component Tests:**
```javascript
// src/components/nodes/__tests__/ModelQueryNode.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import ModelQueryNode from '../ModelQueryNode';
import { useFlareWorkflowStore } from '../../../store/flareWorkflowStore';

describe('ModelQueryNode', () => {
  it('renders with correct models', () => {
    const data = {
      models: ['openai', 'mistral'],
      status: 'idle'
    };

    render(<ModelQueryNode data={data} id="test-1" />);

    expect(screen.getByText('Model Query')).toBeInTheDocument();
    expect(screen.getByText(/openai/i)).toBeInTheDocument();
    expect(screen.getByText(/mistral/i)).toBeInTheDocument();
  });

  it('updates store when models change', () => {
    const data = { models: ['openai'] };
    const updateNode = vi.fn();

    useFlareWorkflowStore.setState({ updateNode });

    render(<ModelQueryNode data={data} id="test-1" />);

    // Simulate model selection change
    const addButton = screen.getByRole('button', { name: /add model/i });
    fireEvent.click(addButton);

    expect(updateNode).toHaveBeenCalledWith('test-1', expect.any(Object));
  });
});
```

## 8.2 Integration Tests

**Graph Compilation Test:**
```javascript
// src/utils/__tests__/graphToFlare.test.js
import { graphToFlareCommand } from '../graphToFlare';

describe('graphToFlareCommand', () => {
  it('compiles simple graph to FLARE syntax', () => {
    const nodes = [
      {
        id: '1',
        type: 'textInput',
        data: { text: 'Explain AI' }
      },
      {
        id: '2',
        type: 'modelQuery',
        data: { models: ['openai', 'mistral'] }
      },
      {
        id: '3',
        type: 'output',
        data: { displayMode: 'text' }
      }
    ];

    const edges = [
      { source: '1', target: '2', sourceHandle: 'text', targetHandle: 'prompt' },
      { source: '2', target: '3', sourceHandle: 'responses', targetHandle: 'result' }
    ];

    const flare = graphToFlareCommand(nodes, edges);

    expect(flare).toBe('{ flare model:openai,mistral `Explain AI` }');
  });

  it('includes temperature and post-processing', () => {
    const nodes = [
      { id: '1', type: 'textInput', data: { text: 'Test' } },
      { id: '2', type: 'parameter', data: { paramType: 'temperature', value: 0.8 } },
      { id: '3', type: 'modelQuery', data: { models: ['openai'] } },
      { id: '4', type: 'postProcessing', data: { operation: 'vote' } },
      { id: '5', type: 'output', data: {} }
    ];

    const edges = [
      { source: '1', target: '3', sourceHandle: 'text', targetHandle: 'prompt' },
      { source: '2', target: '3', sourceHandle: 'tempValue', targetHandle: 'temperature' },
      { source: '3', target: '4', sourceHandle: 'responses', targetHandle: 'responses' },
      { source: '4', target: '5', sourceHandle: 'result', targetHandle: 'result' }
    ];

    const flare = graphToFlareCommand(nodes, edges);

    expect(flare).toBe('{ flare model:openai temp:0.8 vote `Test` }');
  });
});
```

## 8.3 End-to-End Tests

**Complete Workflow Test:**
```javascript
// src/__tests__/e2e/workflow.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';
import { flareApiService } from '../../services/flareApiService';

vi.mock('../../services/flareApiService');

describe('Complete Workflow', () => {
  it('creates workflow, executes, and displays results', async () => {
    // Mock API response
    flareApiService.processFlareCommand.mockResolvedValue(
      'AI is artificial intelligence...'
    );

    render(<App />);

    // Drag text input node
    const textInputNode = screen.getByText('Text Input');
    fireEvent.dragStart(textInputNode);
    const canvas = screen.getByTestId('react-flow-canvas');
    fireEvent.drop(canvas, { clientX: 250, clientY: 100 });

    // Configure text input
    const promptArea = screen.getByPlaceholderText(/enter your prompt/i);
    fireEvent.change(promptArea, { target: { value: 'Explain AI' } });

    // Drag model query node
    const modelNode = screen.getByText('Model Query');
    fireEvent.dragStart(modelNode);
    fireEvent.drop(canvas, { clientX: 250, clientY: 250 });

    // Connect nodes
    const textOutputHandle = screen.getAllByTestId('handle-source')[0];
    const modelInputHandle = screen.getAllByTestId('handle-target')[0];
    fireEvent.mouseDown(textOutputHandle);
    fireEvent.mouseUp(modelInputHandle);

    // Execute workflow
    const executeButton = screen.getByRole('button', { name: /execute/i });
    fireEvent.click(executeButton);

    // Wait for execution
    await waitFor(() => {
      expect(screen.getByText(/execution completed/i)).toBeInTheDocument();
    });

    // Verify API was called
    expect(flareApiService.processFlareCommand).toHaveBeenCalledWith(
      expect.stringContaining('Explain AI')
    );
  });
});
```
