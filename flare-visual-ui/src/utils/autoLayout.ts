/**
 * Auto Layout Utility using Dagre
 * 
 * Automatically arranges nodes in a tree/hierarchical layout
 */

import dagre from 'dagre';
import type { Node, Edge } from 'reactflow';

const NODE_WIDTH = 250;
const NODE_HEIGHT = 150;

export interface LayoutOptions {
    direction?: 'TB' | 'LR' | 'BT' | 'RL'; // Top-Bottom, Left-Right, etc.
    nodeSpacing?: number;
    rankSpacing?: number;
}

/**
 * Apply Dagre layout algorithm to nodes
 */
export function getLayoutedElements(
    nodes: Node[],
    edges: Edge[],
    options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
    const {
        direction = 'LR', // Left to Right by default
        nodeSpacing = 50,
        rankSpacing = 150,
    } = options;

    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    // Configure graph layout
    dagreGraph.setGraph({
        rankdir: direction,
        nodesep: nodeSpacing,
        ranksep: rankSpacing,
    });

    // Add nodes to dagre graph
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    });

    // Add edges to dagre graph
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    // Calculate layout
    dagre.layout(dagreGraph);

    // Apply calculated positions to nodes
    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        return {
            ...node,
            position: {
                // Center the node at the calculated position
                x: nodeWithPosition.x - NODE_WIDTH / 2,
                y: nodeWithPosition.y - NODE_HEIGHT / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
}
