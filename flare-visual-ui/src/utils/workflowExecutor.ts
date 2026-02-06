import type { Node, Edge } from 'reactflow';
import axios from 'axios';
import { useFlareWorkflowStore } from '../store/flareWorkflowStore';
import type { ImageGenerationNodeData } from '../components/nodes/ImageGenerationNode';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface FlareCommandParams {
  models: string[];
  temperature: number;
  postProcessing?: string[];
  prompt: string;
}

export function buildFlareCommand(params: FlareCommandParams): string {
  const modelStr = params.models.join(',');
  const tempStr = params.temperature !== 1.0 ? ` temp:${params.temperature}` : '';
  const postProcStr = params.postProcessing && params.postProcessing.length > 0
    ? ` ${params.postProcessing.join(' ')}`
    : '';

  return `{ flare model:${modelStr}${tempStr}${postProcStr} \`${params.prompt}\` }`;
}

export async function executeFlareCommand(command: string): Promise<string> {
  try {
    const response = await axios.post(`${API_BASE_URL}/process-flare`, {
      command,
    });
    return response.data.result;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error(error.message || 'Unknown error');
  }
}

/**
 * Executes a single image generation node
 */
async function executeImageGenerationNode(node: Node<ImageGenerationNodeData>) {
  const { setNodeStatus, updateNode } = useFlareWorkflowStore.getState();

  setNodeStatus(node.id, 'running');

  try {
    const { prompt, model, width, height, seed, enhance, nologo } = node.data;

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    const response = await axios.post(`${API_BASE_URL}/generate-image`, {
      prompt,
      model,
      width,
      height,
      seed,
      enhance,
      nologo
    });

    if (response.data.success) {
      const imageUrl = response.data.url;
      updateNode(node.id, { imageUrl, status: 'success', error: undefined });
      setNodeStatus(node.id, 'success', { imageUrl });
    } else {
      throw new Error(response.data.error || 'Failed to generate image');
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Generation failed';
    setNodeStatus(node.id, 'error', null, errorMessage);
    updateNode(node.id, { status: 'error', error: errorMessage });
  }
}

export async function executeWorkflow(
  nodes: Node[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _edges: Edge[]
): Promise<void> {
  const { setNodeStatus } = useFlareWorkflowStore.getState();

  // 1. Identify workflow types
  const inputNodes = nodes.filter((n) => n.type === 'textInput');
  const modelNodes = nodes.filter((n) => n.type === 'modelQuery');
  const outputNodes = nodes.filter((n) => n.type === 'output');
  const imageNodes = nodes.filter((n) => n.type === 'imageGeneration');
  const postProcNodes = nodes.filter((n) => n.type === 'postProcessing');
  const flareCommandNodes = nodes.filter((n) => n.type === 'flareCommand');

  const hasTextWorkflow = inputNodes.length > 0 && modelNodes.length > 0 && outputNodes.length > 0;
  const hasImageWorkflow = imageNodes.length > 0;
  const hasNestedWorkflow = flareCommandNodes.length > 0;

  if (!hasTextWorkflow && !hasImageWorkflow && !hasNestedWorkflow) {
    throw new Error('Incomplete workflow. Add Text Input + Model + Output OR Image Generation OR Nested Workflow node.');
  }

  // 2. Execute Image Generation Nodes (Independent)
  const imagePromises = imageNodes.map(node => executeImageGenerationNode(node));

  // 3. Execute Text Workflow (if valid)
  let textPromise = Promise.resolve();

  if (hasTextWorkflow) {
    const inputNode = inputNodes[0];
    const prompt = inputNode.data.text || '';

    if (prompt.trim()) {
      // Collect models
      // Support both new single-model nodes and legacy multi-model
      const allModels = new Set<string>();
      modelNodes.forEach(node => {
        if (node.data.model) allModels.add(node.data.model);
        if (node.data.models) node.data.models.forEach((m: string) => allModels.add(m));
      });

      const models = Array.from(allModels);

      // Get config from first model node (simplified execution)
      const firstModel = modelNodes[0];
      const temperature = firstModel.data.temperature || 1.0;

      // Collect post-processing
      const postProcessingOps: string[] = [];
      postProcNodes.forEach(node => {
        if (node.data.operation) postProcessingOps.push(node.data.operation);
      });
      // Also check legacy post-processing on model node
      if (firstModel.data.postProcessing) {
        postProcessingOps.push(firstModel.data.postProcessing);
      }

      const command = buildFlareCommand({
        models: models.length > 0 ? models : ['mistral'],
        temperature,
        postProcessing: postProcessingOps,
        prompt
      });

      console.log('Executing FLARE command:', command);

      // Set loading states
      modelNodes.forEach(n => setNodeStatus(n.id, 'loading'));
      outputNodes.forEach(n => setNodeStatus(n.id, 'loading'));
      postProcNodes.forEach(n => setNodeStatus(n.id, 'loading'));

      textPromise = (async () => {
        try {
          // Fix: Use correct endpoint path based on previous file content
          // Previous file used /process-flare without api prefix, sticking to that
          const response = await axios.post(`${API_BASE_URL}/process-flare`, { command });

          if (response.data.success) {
            const result = response.data.result;
            outputNodes.forEach(n => setNodeStatus(n.id, 'completed', result));
            modelNodes.forEach(n => setNodeStatus(n.id, 'completed'));
            postProcNodes.forEach(n => setNodeStatus(n.id, 'completed'));
          } else {
            throw new Error(response.data.error || 'Unknown error');
          }
        } catch (error: any) {
          const msg = error.response?.data?.error || error.message;
          outputNodes.forEach(n => setNodeStatus(n.id, 'error', null, msg));
          modelNodes.forEach(n => setNodeStatus(n.id, 'error', null, msg));
        }
      })();
    } else {
      console.warn('Text workflow skipped: Empty prompt');
    }
  }

  // 4. Execute Nested Workflows (FlareCommand nodes)
  const nestedPromises = flareCommandNodes.map(async (node) => {
    setNodeStatus(node.id, 'running');

    try {
      const subGraph = node.data.subGraph;

      if (!subGraph || !subGraph.nodes || subGraph.nodes.length === 0) {
        console.warn(`FlareCommand node ${node.id} has empty sub-graph`);
        setNodeStatus(node.id, 'completed', '(Empty nested workflow)');
        return;
      }

      // Recursively execute sub-graph
      await executeWorkflow(subGraph.nodes, subGraph.edges || []);

      // Get result from sub-graph output node
      const subOutputNode = subGraph.nodes.find((n: Node) => n.type === 'output');
      const result = subOutputNode?.data?.content || '(Nested workflow completed)';

      setNodeStatus(node.id, 'success', result);
    } catch (error: any) {
      const errorMessage = error.message || 'Nested workflow execution failed';
      setNodeStatus(node.id, 'error', null, errorMessage);
      console.error(`FlareCommand node ${node.id} failed:`, error);
    }
  });

  // Await all executions
  await Promise.all([...imagePromises, textPromise, ...nestedPromises]);
}
