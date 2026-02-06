/**
 * Hook to auto-sync workflow state to URL and localStorage
 */

import { useEffect } from 'react';
import { useFlareWorkflowStore } from '../store/flareWorkflowStore';
import { saveToLocalStorage, loadWorkflowFromURL } from '../utils/workflowPersistence';

/**
 * Debounce utility
 */
function debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Hook to sync workflow state to URL and localStorage
 */
export function useWorkflowSync() {
    const nodes = useFlareWorkflowStore((state) => state.nodes);
    const edges = useFlareWorkflowStore((state) => state.edges);
    const syncToURL = useFlareWorkflowStore((state) => state.syncToURL);
    const loadWorkflow = useFlareWorkflowStore((state) => state.loadWorkflow);

    // Load from URL on mount
    useEffect(() => {
        const urlData = loadWorkflowFromURL();
        if (urlData) {
            loadWorkflow(urlData);
        }
    }, [loadWorkflow]);

    // Sync to URL and localStorage on changes (debounced)
    useEffect(() => {
        const debouncedSync = debounce(() => {
            syncToURL();
            saveToLocalStorage(nodes, edges);
        }, 500);

        debouncedSync();
    }, [nodes, edges, syncToURL]);
}
