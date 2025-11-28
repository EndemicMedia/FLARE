import type { Node, Edge } from 'reactflow';
import axios from 'axios';
import { useFlareWorkflowStore } from '../store/flareWorkflowStore';

const API_BASE_URL = 'http://localhost:8080';

interface FlareCommandParams {
  models: string[];
  temperature: number;
  postProcessing?: string;
  prompt: string;
}

export function buildFlareCommand(params: FlareCommandParams): string {
  const modelStr = params.models.join(',');
  const tempStr = params.temperature !== 1.0 ? ` temp:${params.temperature}` : '';
  const postProcStr = params.postProcessing ? ` ${params.postProcessing}` : '';

  return `{ flare model:${modelStr}${tempStr}${postProcStr} \`${params.prompt}\` }`;
}

export async function executeFlareCommand(command: string): Promise<string> {
  try {
    const response = await axios.post(`${API_BASE_URL}/process-flare`, {
      command,
    });

    if (response.data.success) {
      return response.data.result;
    } else {
      throw new Error(response.data.error || 'Unknown error');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Server error');
    } else if (error.request) {
      throw new Error('No response from server. Make sure FLARE backend is running on port 8080');
    } else {
      throw new Error(error.message || 'Request failed');
    }
  }
}

export async function executeWorkflow(
  nodes: Node[],
  _edges: Edge[]
): Promise<void> {
  // Find nodes in execution order
  const inputNodes = nodes.filter((n) => n.type === 'textInput');
  const modelNodes = nodes.filter((n) => n.type === 'modelQuery');
  const outputNodes = nodes.filter((n) => n.type === 'output');

  if (inputNodes.length === 0) {
    throw new Error('No input node found');
  }

  if (modelNodes.length === 0) {
    throw new Error('No model query node found');
  }

  if (outputNodes.length === 0) {
    throw new Error('No output node found');
  }

  // Get the first input node's text
  const inputNode = inputNodes[0];
  const prompt = inputNode.data.text || '';

  if (!prompt.trim()) {
    throw new Error('Input prompt is empty');
  }

  // Get the first model node's configuration
  const modelNode = modelNodes[0];
  const models = modelNode.data.models || ['mistral'];
  const temperature = modelNode.data.temperature || 1.0;
  const postProcessing = modelNode.data.postProcessing;

  if (models.length === 0) {
    throw new Error('No models selected');
  }

  // Build FLARE command
  const command = buildFlareCommand({
    models,
    temperature,
    postProcessing,
    prompt,
  });

  console.log('Executing FLARE command:', command);

  // Get store update function
  const { setNodeStatus } = useFlareWorkflowStore.getState();

  // Update all nodes to loading state
  const outputNode = outputNodes[0];
  setNodeStatus(modelNode.id, 'loading');
  setNodeStatus(outputNode.id, 'loading');

  try {
    // Execute command
    const result = await executeFlareCommand(command);

    // Update output node with result
    setNodeStatus(outputNode.id, 'completed', result);
    setNodeStatus(modelNode.id, 'completed');
  } catch (error: any) {
    // Update output node with error
    setNodeStatus(outputNode.id, 'error', null, error.message);
    setNodeStatus(modelNode.id, 'error', null, error.message);
    throw error;
  }
}
