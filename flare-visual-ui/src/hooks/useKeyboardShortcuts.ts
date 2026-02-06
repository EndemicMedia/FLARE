/**
 * Keyboard Shortcuts Hook
 * 
 * Provides global keyboard shortcuts for the workflow builder.
 * Based on UX documentation specifications.
 */

import { useEffect, useCallback } from 'react';
import { useFlareWorkflowStore } from '../store/flareWorkflowStore';

interface KeyboardShortcutsOptions {
    onExecute?: () => void;
    onSave?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
    const nodes = useFlareWorkflowStore((state) => state.nodes);
    const edges = useFlareWorkflowStore((state) => state.edges);
    const removeNode = useFlareWorkflowStore((state) => state.removeNode);
    const removeEdge = useFlareWorkflowStore((state) => state.removeEdge);
    const resetExecution = useFlareWorkflowStore((state) => state.resetExecution);
    const undo = useFlareWorkflowStore((state) => state.undo);
    const redo = useFlareWorkflowStore((state) => state.redo);
    const canUndo = useFlareWorkflowStore((state) => state.canUndo);
    const canRedo = useFlareWorkflowStore((state) => state.canRedo);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        // Don't trigger shortcuts when typing in input fields
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
            return;
        }

        const isMeta = event.metaKey || event.ctrlKey;
        const lowerKey = event.key.toLowerCase();

        // Delete selected node or edge: Delete or Backspace
        if (lowerKey === 'delete' || lowerKey === 'backspace') {
            // Only prevent default if we actually deleted something? 
            // Better to prevent default to avoid navigation
            event.preventDefault();

            // Check for selected nodes
            const selectedNodes = nodes.filter(n => n.selected);
            selectedNodes.forEach(n => removeNode(n.id));

            // Check for selected edges
            const selectedEdges = edges.filter(e => e.selected);
            selectedEdges.forEach(e => removeEdge(e.id));

            if (selectedNodes.length > 0 || selectedEdges.length > 0) {
                console.log('Keyboard: Deleted', selectedNodes.length, 'nodes and', selectedEdges.length, 'edges');
            }
        }

        // Execute workflow: Ctrl/Cmd + E
        if (isMeta && lowerKey === 'e') {
            event.preventDefault();
            options.onExecute?.();
            console.log('Keyboard: Execute workflow');
        }

        // Save workflow: Ctrl/Cmd + S
        if (isMeta && lowerKey === 's') {
            event.preventDefault();
            options.onSave?.();
            console.log('Keyboard: Save workflow');
        }

        // Undo: Ctrl/Cmd + Z (Strictly no shift)
        if (isMeta && lowerKey === 'z' && !event.shiftKey) {
            event.preventDefault();
            if (canUndo()) {
                undo();
                console.log('Keyboard: Undo');
            }
        }

        // Redo: Ctrl/Cmd + Shift + Z OR Ctrl/Cmd + Y
        // Note: lowerKey 'z' covers 'Z' that is produced when Shift is held
        if ((isMeta && event.shiftKey && lowerKey === 'z') || (isMeta && lowerKey === 'y')) {
            event.preventDefault();
            if (canRedo()) {
                redo();
                console.log('Keyboard: Redo');
            }
        }

        // Reset execution: Escape
        if (lowerKey === 'escape') {
            event.preventDefault();
            resetExecution();
            console.log('Keyboard: Reset execution');
        }
    }, [nodes, edges, removeNode, removeEdge, resetExecution, undo, redo, canUndo, canRedo, options]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}
