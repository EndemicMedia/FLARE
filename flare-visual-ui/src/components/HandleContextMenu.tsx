import { useEffect, useRef } from 'react';
import { type Node, type Edge } from 'reactflow';
import { getCompatibleTargets, type CompatibleTarget } from '../utils/getCompatibleTargets';

interface HandleContextMenuProps {
    sourceNodeId: string;
    sourceHandle: string;
    handleType: 'source' | 'target';
    position: { x: number; y: number };
    nodes: Node[];
    edges: Edge[];
    onClose: () => void;
    onConnect: (targetNodeId: string, targetHandle: string) => void;
}

export function HandleContextMenu({
    sourceNodeId,
    sourceHandle,
    handleType,
    position,
    nodes,
    edges,
    onClose,
    onConnect
}: HandleContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    // Get compatible targets
    const compatibleTargets = getCompatibleTargets(
        sourceNodeId,
        sourceHandle,
        handleType,
        nodes,
        edges
    );

    // Group by node type
    const groupedTargets = compatibleTargets.reduce((acc, target) => {
        if (!acc[target.nodeType]) {
            acc[target.nodeType] = [];
        }
        acc[target.nodeType].push(target);
        return acc;
    }, {} as Record<string, CompatibleTarget[]>);

    // Close on ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        // Small timeout to prevent immediate close from the same click that opened the menu
        const timeoutId = setTimeout(() => {
            window.addEventListener('mousedown', handleClickOutside);
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleItemClick = (target: CompatibleTarget) => {
        onConnect(target.nodeId, target.targetHandle);
        onClose();
    };

    const typeLabels: Record<string, string> = {
        textInput: 'Text Input',
        modelQuery: 'Model Query',
        postProcessing: 'Post-Processing',
        imageGeneration: 'Image Generation',
        flareCommand: 'Nested Workflow',
        output: 'Output',
        parameter: 'Parameter'
    };

    // Adjust position to prevent menu from going offscreen
    const adjustedPosition = { ...position };
    const menuWidth = 300; // Approximate menu width
    const menuHeight = Math.min(400, compatibleTargets.length * 40 + 100); // Approximate height

    // Check horizontal overflow
    if (adjustedPosition.x + menuWidth > window.innerWidth) {
        adjustedPosition.x = Math.max(0, window.innerWidth - menuWidth - 10);
    }

    // Check vertical overflow
    if (adjustedPosition.y + menuHeight > window.innerHeight) {
        adjustedPosition.y = Math.max(0, window.innerHeight - menuHeight - 10);
    }

    return (
        <div
            ref={menuRef}
            className="handle-context-menu"
            style={{
                position: 'fixed',
                left: adjustedPosition.x,
                top: adjustedPosition.y,
                zIndex: 1000
            }}
        >
            <div className="context-menu-header">
                {handleType === 'source' ? 'Connect to...' : 'Connect from...'}
            </div>

            {compatibleTargets.length === 0 ? (
                <div className="context-menu-empty">
                    No compatible targets available
                </div>
            ) : (
                <div className="context-menu-list">
                    {Object.entries(groupedTargets).map(([nodeType, targets]) => (
                        <div key={nodeType} className="context-menu-group">
                            <div className="context-menu-group-label">
                                {typeLabels[nodeType] || nodeType}
                            </div>
                            {targets.map((target, idx) => (
                                <div
                                    key={`${target.nodeId}-${target.targetHandle}-${idx}`}
                                    className="context-menu-item"
                                    onClick={() => handleItemClick(target)}
                                >
                                    <span className="context-menu-item-name">{target.nodeName}</span>
                                    {targets.length > 1 && (
                                        <span className="context-menu-item-handle">
                                            {target.targetHandle}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            <div className="context-menu-footer">
                Press <kbd>ESC</kbd> to close
            </div>
        </div>
    );
}
