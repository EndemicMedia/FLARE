import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from 'reactflow';
import { FiX } from 'react-icons/fi';
import { useFlareWorkflowStore } from '../../store/flareWorkflowStore';

export const CustomEdge = memo(function CustomEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    selected,
    style = {},
    markerEnd
}: EdgeProps) {
    const removeEdge = useFlareWorkflowStore((state) => state.removeEdge);

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        removeEdge(id);
    };

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    strokeWidth: selected ? 2.5 : 2,
                    stroke: selected ? '#5b21b6' : '#94a3b8'
                }}
            />
            {selected && (
                <EdgeLabelRenderer>
                    <button
                        className="edge-delete-button nodrag nopan"
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                            pointerEvents: 'all',
                        }}
                        onClick={handleDelete}
                        title="Delete connection"
                    >
                        <FiX size={14} />
                    </button>
                </EdgeLabelRenderer>
            )}
        </>
    );
});
