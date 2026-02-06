import { useState, useEffect, useCallback } from 'react';
import { useFlareWorkflowStore } from '../store/flareWorkflowStore';
import { compileGraphToFlare } from '../utils/graphToFlare';
import { parseFlareToGraph } from '../utils/flareToGraph';
import { FiCode, FiAlertCircle } from 'react-icons/fi';

export const SyntaxView = () => {
  const nodes = useFlareWorkflowStore((state) => state.nodes);
  const edges = useFlareWorkflowStore((state) => state.edges);
  const setNodes = useFlareWorkflowStore((state) => state.setNodes);
  const setEdges = useFlareWorkflowStore((state) => state.setEdges);

  const [syntax, setSyntax] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Compile graph to syntax when nodes/edges change
  useEffect(() => {
    if (isEditing) return;

    // Skip compilation if no nodes (empty state)
    if (nodes.length === 0) {
      setSyntax('');
      return;
    }

    const result = compileGraphToFlare(nodes, edges);
    if (result.success && result.flareCommand) {
      setSyntax(result.flareCommand);
      setError(null);
    }
    // We don't show compilation errors here to avoid flashing errors while building
  }, [nodes, edges, isEditing]);

  // Handle text changes
  const handleSyntaxChange = useCallback(async (newSyntax: string) => {
    setSyntax(newSyntax);
    setIsEditing(true);

    try {
      // Basic validation first
      if (!newSyntax.trim().startsWith('{') || !newSyntax.trim().endsWith('}')) {
        return;
      }

      const result = await parseFlareToGraph(newSyntax);
      if (result.success) {
        // Update nodes - layout is already applied by parseFlareToGraph
        setNodes(result.nodes);
        setEdges(result.edges);
        setError(null);
      } else {
        setError(result.error || 'Failed to parse FLARE command');
      }
    } catch (e: any) {
      setError(e.message || 'Error parsing command');
    }
  }, [setNodes, setEdges]);

  const handleBlur = () => {
    setIsEditing(false);
    // Re-compile to ensuring syncing strictly
    const result = compileGraphToFlare(nodes, edges);
    if (result.success && result.flareCommand) {
      setSyntax(result.flareCommand);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 w-96 shadow-lg">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <FiCode />
          <span>FLARE Syntax</span>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-2">
        <p className="text-xs text-gray-500 mb-2">
          Edit the FLARE command below to update the graph instantly.
        </p>

        <textarea
          value={syntax}
          onChange={(e) => handleSyntaxChange(e.target.value)}
          onBlur={handleBlur}
          className="flex-1 w-full p-3 font-mono text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-gray-50 text-gray-800"
          placeholder="{ flare model:mistral `Enter your prompt...` }"
          spellCheck={false}
        />

        {error && (
          <div className="flex items-start gap-2 p-3 text-sm text-red-700 bg-red-50 rounded border border-red-200 transition-all">
            <FiAlertCircle className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
