/**
 * Workflow Integration Tests
 *
 * Tests real-world workflow scenarios to demonstrate
 * how the store would be used in the application.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useFlareWorkflowStore } from '../../store/flareWorkflowStore';

describe('Workflow Integration', () => {
  beforeEach(() => {
    useFlareWorkflowStore.getState().clear();
  });

  it('should create a complete FLARE workflow', () => {
    const store = useFlareWorkflowStore.getState();

    // 1. Add text input node
    store.addNode({
      type: 'textInput',
      position: { x: 100, y: 100 },
      data: {
        text: 'Explain renewable energy in simple terms',
        status: 'idle',
      },
    });

    // 2. Add temperature parameter node
    store.addNode({
      type: 'parameter',
      position: { x: 100, y: 200 },
      data: {
        paramType: 'temperature',
        value: 0.8,
        min: 0.0,
        max: 2.0,
        status: 'idle',
      },
    });

    // 3. Add model query node
    store.addNode({
      type: 'modelQuery',
      position: { x: 300, y: 150 },
      data: {
        models: ['openai', 'mistral'],
        status: 'idle',
      },
    });

    // 4. Add post-processing node
    store.addNode({
      type: 'postProcessing',
      position: { x: 500, y: 150 },
      data: {
        operation: 'vote',
        model: 'openai',
        status: 'idle',
      },
    });

    // 5. Add output node
    store.addNode({
      type: 'output',
      position: { x: 700, y: 150 },
      data: {
        displayMode: 'text',
        content: null,
        status: 'idle',
      },
    });

    const nodes = useFlareWorkflowStore.getState().nodes;
    expect(nodes).toHaveLength(5);

    // 6. Connect nodes
    const textInputId = nodes[0].id;
    const tempParamId = nodes[1].id;
    const modelQueryId = nodes[2].id;
    const postProcessingId = nodes[3].id;
    const outputId = nodes[4].id;

    // Text -> Model Query
    store.addEdge({ source: textInputId, target: modelQueryId });

    // Temperature -> Model Query
    store.addEdge({ source: tempParamId, target: modelQueryId });

    // Model Query -> Post-processing
    store.addEdge({ source: modelQueryId, target: postProcessingId });

    // Post-processing -> Output
    store.addEdge({ source: postProcessingId, target: outputId });

    const edges = useFlareWorkflowStore.getState().edges;
    expect(edges).toHaveLength(4);

    // 7. Verify workflow statistics
    const stats = store.getWorkflowStats();
    expect(stats.nodeCount).toBe(5);
    expect(stats.edgeCount).toBe(4);
    expect(stats.nodesByType).toEqual({
      textInput: 1,
      parameter: 1,
      modelQuery: 1,
      postProcessing: 1,
      output: 1,
    });
  });

  it('should simulate workflow execution', () => {
    const store = useFlareWorkflowStore.getState();

    // Create a simple workflow
    store.addNode({
      type: 'textInput',
      position: { x: 0, y: 0 },
      data: { text: 'test prompt', status: 'idle' },
    });

    store.addNode({
      type: 'modelQuery',
      position: { x: 200, y: 0 },
      data: { models: ['openai'], status: 'idle' },
    });

    store.addNode({
      type: 'output',
      position: { x: 400, y: 0 },
      data: { displayMode: 'text', content: null, status: 'idle' },
    });

    const nodes = useFlareWorkflowStore.getState().nodes;
    const [textInput, modelQuery, output] = nodes;

    // Connect nodes
    store.addEdge({ source: textInput.id, target: modelQuery.id });
    store.addEdge({ source: modelQuery.id, target: output.id });

    // Start execution
    store.setExecutionState('running');
    expect(useFlareWorkflowStore.getState().executionState).toBe('running');

    // Execute text input node
    store.setNodeStatus(textInput.id, 'loading');
    store.setNodeStatus(textInput.id, 'completed', 'test prompt');

    // Execute model query node
    store.setNodeStatus(modelQuery.id, 'loading');
    const modelResult = 'Renewable energy comes from sources that naturally replenish...';
    store.setNodeStatus(modelQuery.id, 'completed', [modelResult]);

    // Execute output node
    store.setNodeStatus(output.id, 'loading');
    store.updateNode(output.id, { content: modelResult });
    store.setNodeStatus(output.id, 'completed', modelResult);

    // Complete execution
    store.setExecutionState('completed');

    const state = useFlareWorkflowStore.getState();
    expect(state.executionState).toBe('completed');

    // Verify all nodes completed
    state.nodes.forEach((node) => {
      expect(node.data.status).toBe('completed');
    });

    // Verify execution progress
    expect(state.executionProgress[textInput.id].status).toBe('completed');
    expect(state.executionProgress[modelQuery.id].status).toBe('completed');
    expect(state.executionProgress[output.id].status).toBe('completed');
  });

  it('should handle workflow errors gracefully', () => {
    const store = useFlareWorkflowStore.getState();

    store.addNode({
      type: 'modelQuery',
      position: { x: 0, y: 0 },
      data: { models: ['openai'], status: 'idle' },
    });

    const nodeId = useFlareWorkflowStore.getState().nodes[0].id;

    // Start execution
    store.setExecutionState('running');

    // Simulate error
    store.setNodeStatus(
      nodeId,
      'loading'
    );

    const errorMessage = 'API timeout: Request timed out after 30s';
    store.setNodeStatus(nodeId, 'error', undefined, errorMessage);

    store.setExecutionState('error');

    const state = useFlareWorkflowStore.getState();
    expect(state.executionState).toBe('error');
    expect(state.nodes[0].data.status).toBe('error');
    expect(state.nodes[0].data.error).toBe(errorMessage);
    expect(state.executionProgress[nodeId].error).toBe(errorMessage);
  });

  it('should support multi-model queries with voting', () => {
    const store = useFlareWorkflowStore.getState();

    // Create workflow with multiple models
    store.addNode({
      type: 'textInput',
      position: { x: 0, y: 0 },
      data: { text: 'What is AI?', status: 'idle' },
    });

    store.addNode({
      type: 'modelQuery',
      position: { x: 200, y: 0 },
      data: {
        models: ['openai', 'mistral', 'anthropic'],
        status: 'idle',
      },
    });

    store.addNode({
      type: 'postProcessing',
      position: { x: 400, y: 0 },
      data: {
        operation: 'vote',
        model: 'openai',
        status: 'idle',
      },
    });

    const nodes = useFlareWorkflowStore.getState().nodes;
    const [, modelQuery, voting] = nodes;

    // Execute
    store.setExecutionState('running');

    // Model query returns multiple responses
    const responses = [
      'AI is artificial intelligence...',
      'Artificial intelligence refers to...',
      'AI stands for artificial intelligence...',
    ];

    store.setNodeStatus(modelQuery.id, 'loading');
    store.updateNode(modelQuery.id, { results: responses });
    store.setNodeStatus(modelQuery.id, 'completed', responses);

    // Voting picks best response
    store.setNodeStatus(voting.id, 'loading');
    const bestResponse = responses[1]; // Voting logic would determine this
    store.updateNode(voting.id, { result: bestResponse });
    store.setNodeStatus(voting.id, 'completed', bestResponse);

    store.setExecutionState('completed');

    const state = useFlareWorkflowStore.getState();
    expect(state.nodes[1].data).toHaveProperty('results');
    expect(state.nodes[2].data).toHaveProperty('result');
    expect(state.executionState).toBe('completed');
  });

  it('should compile workflow to FLARE command', () => {
    const store = useFlareWorkflowStore.getState();

    // Create workflow
    store.addNode({
      type: 'textInput',
      position: { x: 0, y: 0 },
      data: { text: 'Explain renewable energy', status: 'idle' },
    });

    store.addNode({
      type: 'parameter',
      position: { x: 0, y: 100 },
      data: { paramType: 'temperature', value: 0.8, min: 0, max: 2, status: 'idle' },
    });

    store.addNode({
      type: 'modelQuery',
      position: { x: 200, y: 0 },
      data: { models: ['openai', 'mistral'], status: 'idle' },
    });

    store.addNode({
      type: 'postProcessing',
      position: { x: 400, y: 0 },
      data: { operation: 'vote', status: 'idle' },
    });

    // Simulate compilation (this would be done by a compiler service)
    const compiledFlare = '{ flare model:openai,mistral temp:0.8 vote `Explain renewable energy` }';
    store.setCompiledFlare(compiledFlare);

    expect(useFlareWorkflowStore.getState().compiledFlare).toBe(compiledFlare);
  });

  it('should reset workflow execution state', () => {
    const store = useFlareWorkflowStore.getState();

    // Create and execute workflow
    store.addNode({
      type: 'modelQuery',
      position: { x: 0, y: 0 },
      data: { models: ['openai'], status: 'idle' },
    });

    const nodeId = useFlareWorkflowStore.getState().nodes[0].id;

    store.setExecutionState('running');
    store.setNodeStatus(nodeId, 'loading');
    store.setNodeStatus(nodeId, 'completed', 'result');
    store.setCompiledFlare('{ flare model:openai `test` }');
    store.setExecutionState('completed');

    // Verify execution state
    let state = useFlareWorkflowStore.getState();
    expect(state.executionState).toBe('completed');
    expect(state.nodes[0].data.status).toBe('completed');
    expect(Object.keys(state.executionProgress)).toHaveLength(1);
    expect(state.compiledFlare).toBe('{ flare model:openai `test` }');

    // Reset execution
    store.resetExecution();

    // Verify reset
    state = useFlareWorkflowStore.getState();
    expect(state.executionState).toBe('idle');
    expect(state.nodes[0].data.status).toBe('idle');
    expect(state.nodes[0].data.error).toBeUndefined();
    expect(state.executionProgress).toEqual({});
    expect(state.compiledFlare).toBeNull();
  });

  it('should handle node removal during workflow design', () => {
    const store = useFlareWorkflowStore.getState();

    // Create a workflow
    store.addNode({
      type: 'textInput',
      position: { x: 0, y: 0 },
      data: { text: 'test', status: 'idle' },
    });

    store.addNode({
      type: 'modelQuery',
      position: { x: 200, y: 0 },
      data: { models: ['openai'], status: 'idle' },
    });

    store.addNode({
      type: 'output',
      position: { x: 400, y: 0 },
      data: { displayMode: 'text', content: null, status: 'idle' },
    });

    const nodes = useFlareWorkflowStore.getState().nodes;
    const [textInput, modelQuery, output] = nodes;

    // Connect them
    store.addEdge({ source: textInput.id, target: modelQuery.id });
    store.addEdge({ source: modelQuery.id, target: output.id });

    expect(useFlareWorkflowStore.getState().edges).toHaveLength(2);

    // Remove middle node
    store.removeNode(modelQuery.id);

    const state = useFlareWorkflowStore.getState();
    expect(state.nodes).toHaveLength(2);
    expect(state.edges).toHaveLength(0); // All connected edges removed
  });
});
