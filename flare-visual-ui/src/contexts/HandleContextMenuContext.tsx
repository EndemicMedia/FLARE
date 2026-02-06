import { createContext, useContext } from 'react';

export interface HandleContextMenuContextValue {
    openHandleContextMenu: (
        nodeId: string,
        handleId: string,
        handleType: 'source' | 'target',
        position: { x: number; y: number }
    ) => void;
}

export const HandleContextMenuContext = createContext<HandleContextMenuContextValue | null>(null);

export function useHandleContextMenu() {
    const context = useContext(HandleContextMenuContext);
    if (!context) {
        // Return a no-op function if context is not available
        return {
            openHandleContextMenu: () => {
                console.warn('HandleContextMenuContext not found');
            }
        };
    }
    return context;
}
