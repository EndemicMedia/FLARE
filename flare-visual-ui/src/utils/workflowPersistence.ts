/**
 * Workflow Persistence Utilities
 * Handles saving/loading workflows to/from files and localStorage
 */

import type { FlareNode } from '../types/nodes';
import type { FlareEdge } from '../types/edges';

export interface WorkflowData {
    version: string;
    nodes: FlareNode[];
    edges: FlareEdge[];
    metadata?: {
        name?: string;
        description?: string;
        createdAt?: string;
        updatedAt?: string;
    };
}

const WORKFLOW_VERSION = '1.0.0';
const LOCALSTORAGE_KEY = 'flare-workflow-autosave';

/**
 * Export workflow to JSON string
 */
export function exportWorkflow(
    nodes: FlareNode[],
    edges: FlareEdge[],
    metadata?: WorkflowData['metadata']
): string {
    const data: WorkflowData = {
        version: WORKFLOW_VERSION,
        nodes,
        edges,
        metadata: {
            ...metadata,
            updatedAt: new Date().toISOString(),
        },
    };

    return JSON.stringify(data, null, 2);
}

/**
 * Import workflow from JSON string
 */
export function importWorkflow(json: string): WorkflowData {
    try {
        const data = JSON.parse(json) as WorkflowData;

        // Validate structure
        if (!data.version || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
            throw new Error('Invalid workflow format');
        }

        return data;
    } catch (error) {
        throw new Error(`Failed to import workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Save workflow to downloadable JSON file
 */
export function saveToFile(
    nodes: FlareNode[],
    edges: FlareEdge[],
    filename: string = 'workflow.json'
): void {
    const json = exportWorkflow(nodes, edges, {
        name: filename.replace('.json', ''),
        createdAt: new Date().toISOString(),
    });

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Load workflow from file
 */
export function loadFromFile(file: File): Promise<WorkflowData> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const json = e.target?.result as string;
                const data = importWorkflow(json);
                resolve(data);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
    });
}

/**
 * Save workflow to localStorage
 */
export function saveToLocalStorage(nodes: FlareNode[], edges: FlareEdge[]): void {
    try {
        const json = exportWorkflow(nodes, edges);
        localStorage.setItem(LOCALSTORAGE_KEY, json);
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

/**
 * Load workflow from localStorage
 */
export function loadFromLocalStorage(): WorkflowData | null {
    try {
        const json = localStorage.getItem(LOCALSTORAGE_KEY);
        if (!json) return null;

        return importWorkflow(json);
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return null;
    }
}

/**
 * Clear localStorage autosave
 */
export function clearLocalStorage(): void {
    localStorage.removeItem(LOCALSTORAGE_KEY);
}

/**
 * Encode workflow to base64 URL hash
 */
export function encodeWorkflowToURL(nodes: FlareNode[], edges: FlareEdge[]): string {
  const json = exportWorkflow(nodes, edges);
  // Compress and encode to base64
  const base64 = btoa(encodeURIComponent(json));
  return `#workflow=${base64}`;
}

/**
 * Decode workflow from URL hash
 */
export function decodeWorkflowFromURL(hash: string): WorkflowData | null {
  try {
    // Extract base64 from hash
    const match = hash.match(/#workflow=(.+)/);
    if (!match) return null;

    const base64 = match[1];
    const json = decodeURIComponent(atob(base64));
    return importWorkflow(json);
  } catch (error) {
    console.error('Failed to decode workflow from URL:', error);
    return null;
  }
}

/**
 * Update browser URL with current workflow state
 */
export function updateURLWithWorkflow(nodes: FlareNode[], edges: FlareEdge[]): void {
  try {
    const hash = encodeWorkflowToURL(nodes, edges);
    window.history.replaceState(null, '', hash);
  } catch (error) {
    console.error('Failed to update URL:', error);
  }
}

/**
 * Load workflow from current URL hash
 */
export function loadWorkflowFromURL(): WorkflowData | null {
  return decodeWorkflowFromURL(window.location.hash);
}
