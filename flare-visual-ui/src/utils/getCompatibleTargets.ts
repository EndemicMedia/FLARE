import { type Node, type Edge } from 'reactflow';
import { validateConnection } from './connectionValidator';

export interface CompatibleTarget {
    nodeId: string;
    nodeName: string;
    nodeType: string;
    targetHandle: string;
    displayName: string;
}

/**
 * Finds all compatible target nodes/handles for a given source node and handle
 */
export function getCompatibleTargets(
    sourceNodeId: string,
    sourceHandle: string,
    handleType: 'source' | 'target',
    nodes: Node[],
    edges: Edge[]
): CompatibleTarget[] {
    const compatibleTargets: CompatibleTarget[] = [];
    const sourceNode = nodes.find(n => n.id === sourceNodeId);

    if (!sourceNode) return [];

    // If this is a source handle, find compatible target handles
    // If this is a target handle, find compatible source handles
    const candidateNodes = nodes.filter(n => n.id !== sourceNodeId);

    for (const candidateNode of candidateNodes) {
        // Get all handles for the candidate node
        const handles = getNodeHandles(candidateNode);

        // Filter handles by opposite type
        const oppositeHandles = handles.filter(h =>
            handleType === 'source' ? h.type === 'target' : h.type === 'source'
        );

        for (const handle of oppositeHandles) {
            // Create a test connection
            const testConnection = handleType === 'source'
                ? {
                    source: sourceNodeId,
                    sourceHandle: sourceHandle,
                    target: candidateNode.id,
                    targetHandle: handle.id
                }
                : {
                    source: candidateNode.id,
                    sourceHandle: handle.id,
                    target: sourceNodeId,
                    targetHandle: sourceHandle
                };

            // Validate the connection
            const { isValid } = validateConnection(testConnection, nodes, edges);

            if (isValid) {
                compatibleTargets.push({
                    nodeId: candidateNode.id,
                    nodeName: getNodeDisplayName(candidateNode),
                    nodeType: candidateNode.type || 'unknown',
                    targetHandle: handle.id,
                    displayName: `${getNodeDisplayName(candidateNode)} → ${handle.label || handle.id}`
                });
            }
        }
    }

    return compatibleTargets;
}

/**
 * Get all handles for a node based on its type
 */
function getNodeHandles(node: Node): Array<{ id: string; type: 'source' | 'target'; label?: string }> {
    const handles: Array<{ id: string; type: 'source' | 'target'; label?: string }> = [];

    switch (node.type) {
        case 'textInput':
            handles.push({ id: 'output', type: 'source', label: 'Output' });
            break;

        case 'modelQuery':
            handles.push({ id: 'input', type: 'target', label: 'Input' });
            handles.push({ id: 'output', type: 'source', label: 'Output' });
            break;

        case 'postProcessing':
            // Post-processing can have multiple inputs
            const inputCount = node.data?.inputCount || 2;
            for (let i = 0; i < inputCount; i++) {
                handles.push({ id: `input-${i}`, type: 'target', label: `Input ${i}` });
            }
            handles.push({ id: 'output', type: 'source', label: 'Output' });
            break;

        case 'imageGeneration':
            handles.push({ id: 'input', type: 'target', label: 'Input' });
            handles.push({ id: 'output', type: 'source', label: 'Output' });
            break;

        case 'flareCommand':
            handles.push({ id: 'input', type: 'target', label: 'Input' });
            handles.push({ id: 'output', type: 'source', label: 'Output' });
            break;

        case 'output':
            handles.push({ id: 'input', type: 'target', label: 'Input' });
            break;

        case 'parameter':
            handles.push({ id: 'output', type: 'source', label: 'Output' });
            break;

        default:
            // Unknown type, assume basic input/output
            handles.push({ id: 'input', type: 'target', label: 'Input' });
            handles.push({ id: 'output', type: 'source', label: 'Output' });
    }

    return handles;
}

/**
 * Get a human-readable display name for a node
 */
function getNodeDisplayName(node: Node): string {
    // Try to extract a meaningful name from node data
    if (node.data?.text) {
        const text = node.data.text.substring(0, 30);
        return text.length < node.data.text.length ? `${text}...` : text;
    }

    if (node.data?.model) {
        return `Model: ${node.data.model}`;
    }

    if (node.data?.models && Array.isArray(node.data.models)) {
        return `Model: ${node.data.models.join(', ')}`;
    }

    if (node.data?.operation) {
        return `${node.data.operation.toUpperCase()}`;
    }

    // Fallback to type-based name
    const typeNames: Record<string, string> = {
        textInput: 'Text Input',
        modelQuery: 'Model Query',
        postProcessing: 'Post-Processing',
        imageGeneration: 'Image Generation',
        flareCommand: 'Nested Workflow',
        output: 'Output',
        parameter: 'Parameter'
    };

    return typeNames[node.type || ''] || 'Node';
}
