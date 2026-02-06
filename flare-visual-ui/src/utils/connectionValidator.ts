import { type Connection, type Edge, type Node } from 'reactflow';

/**
 * Validates a connection between two nodes
 * Returns detailed validation result
 */
export interface ValidationResult {
    isValid: boolean;
    message?: string;
}

export function validateConnection(
    connection: Connection | Edge,
    nodes: Node[],
    edges: Edge[]
): ValidationResult {
    const sourceId = connection.source;
    const targetId = connection.target;

    if (!sourceId || !targetId) return { isValid: false };

    const sourceNode = nodes.find((n) => n.id === sourceId);
    const targetNode = nodes.find((n) => n.id === targetId);

    if (!sourceNode || !targetNode) return { isValid: false };

    // 1. Self-connection check
    if (sourceId === targetId) {
        return { isValid: false, message: 'Cannot connect node to itself' };
    }

    // 2. Cycle Detection
    if (hasPath(targetId, sourceId, edges)) {
        return { isValid: false, message: 'Cycle detected: Cannot connect back to predecessor' };
    }

    // 3. Single Input Connection Check
    // Check if target handle already has an incoming connection
    const targetHandle = connection.targetHandle;
    const existingConnection = edges.find(
        e => e.target === targetId &&
            // Check specific handle if handles are used, otherwise just checks node
            (targetHandle ? e.targetHandle === targetHandle : true)
    );

    if (existingConnection) {
        return { isValid: false, message: 'This input already has a connection. Only one connection per input is allowed.' };
    }

    const sourceType = sourceNode.type;
    const targetType = targetNode.type;

    // 3. Type Compatibility Rules

    // Output nodes cannot have outgoing connections
    if (sourceType === 'output') {
        return { isValid: false, message: 'Output nodes cannot have outgoing connections' };
    }

    // Text Input
    // Valid targets: Model Query, Image Generation, Flare Command (context input)
    if (sourceType === 'textInput') {
        if (['modelQuery', 'imageGeneration', 'flareCommand'].includes(targetType!)) {
            return { isValid: true };
        }
        return { isValid: false, message: 'Text Input can only connect to Model Query, Image Generation, or Nested Workflow' };
    }

    // Parameter
    // Valid targets: Model Query, Image Generation
    if (sourceType === 'parameter') {
        if (['modelQuery', 'imageGeneration'].includes(targetType!)) {
            return { isValid: true };
        }
        return { isValid: false, message: 'Parameters can only connect to Model Query or Image Generation' };
    }

    // Model Query
    // Valid targets: Post Processing, Output, Model Query (chaining), Flare Command
    if (sourceType === 'modelQuery') {
        if (['postProcessing', 'output', 'modelQuery', 'flareCommand'].includes(targetType!)) {
            return { isValid: true };
        }
        return { isValid: false, message: `Model Query cannot connect to ${targetType}` };
    }

    // Image Generation
    // Valid targets: Output (for now)
    if (sourceType === 'imageGeneration') {
        if (['output'].includes(targetType!)) {
            return { isValid: true };
        }
        return { isValid: false, message: 'Image Generation can only connect to Output' };
    }

    // Post Processing
    // Valid targets: Post Processing, Output, Model Query, Flare Command
    if (sourceType === 'postProcessing') {
        if (['postProcessing', 'output', 'modelQuery', 'flareCommand'].includes(targetType!)) {
            return { isValid: true };
        }
        return { isValid: false, message: `Post Processing cannot connect to ${targetType}` };
    }

    // Flare Command (Nested Workflow)
    // Valid targets: Output, Flare Command (nested nesting), Post Processing
    if (sourceType === 'flareCommand') {
        if (['output', 'flareCommand', 'postProcessing'].includes(targetType!)) {
            return { isValid: true };
        }
        return { isValid: false, message: 'Nested Workflow can only connect to Output, Post Processing, or another Nested Workflow' };
    }

    // Default: Allow if unknown types (future proofing, or fail safe)
    return { isValid: true };
}

/**
 * Checks if there is a path from startNode to endNode
 * DFS implementation
 */
function hasPath(startId: string, endId: string, edges: Edge[]): boolean {
    if (startId === endId) return true;

    const stack = [startId];
    const visited = new Set<string>();

    while (stack.length > 0) {
        const currentId = stack.pop()!;

        if (visited.has(currentId)) continue;
        visited.add(currentId);

        const outgoers = edges
            .filter((e) => e.source === currentId)
            .map((e) => e.target);

        for (const outgoerId of outgoers) {
            if (outgoerId === endId) return true;
            if (!visited.has(outgoerId)) {
                stack.push(outgoerId);
            }
        }
    }

    return false;
}
