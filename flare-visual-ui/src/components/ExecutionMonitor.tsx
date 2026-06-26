/**
 * ExecutionMonitor
 *
 * A small fixed overlay panel (bottom-right) that shows live node execution
 * status while the workflow is running. Auto-hides when idle.
 */

import { useFlareWorkflowStore } from '../store/flareWorkflowStore';

const STATUS_ICONS: Record<string, string> = {
  idle: '⬜',
  queued: '🕐',
  loading: '⏳',
  running: '⏳',
  success: '✅',
  completed: '✅',
  error: '❌',
};

const STATUS_COLORS: Record<string, string> = {
  idle: 'text-gray-400',
  queued: 'text-yellow-400',
  loading: 'text-blue-400',
  running: 'text-blue-400',
  success: 'text-green-400',
  completed: 'text-green-400',
  error: 'text-red-400',
};

export function ExecutionMonitor() {
  const executionState = useFlareWorkflowStore((s) => s.executionState);
  const executionProgress = useFlareWorkflowStore((s) => s.executionProgress);
  const nodes = useFlareWorkflowStore((s) => s.nodes);

  if (executionState === 'idle' && Object.keys(executionProgress).length === 0) {
    return null;
  }

  const activeEntries = nodes.filter(
    (n) => n.data.status && n.data.status !== 'idle'
  );

  if (activeEntries.length === 0 && executionState === 'idle') {
    return null;
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-40 bg-gray-900/95 border border-gray-700 rounded-xl shadow-2xl p-4 min-w-[220px] max-w-xs"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-white font-semibold text-xs uppercase tracking-wide">
          Execution
        </span>
        {executionState === 'running' && (
          <span className="text-blue-400 text-xs animate-pulse">● Running</span>
        )}
        {executionState === 'completed' && (
          <span className="text-green-400 text-xs">● Done</span>
        )}
        {executionState === 'error' && (
          <span className="text-red-400 text-xs">● Error</span>
        )}
      </div>

      <ul className="space-y-1">
        {activeEntries.map((node) => {
          const status = node.data.status || 'idle';
          const icon = STATUS_ICONS[status] ?? '⬜';
          const color = STATUS_COLORS[status] ?? 'text-gray-400';
          const label =
            (node.data as Record<string, unknown>).label ||
            (node.data as Record<string, unknown>).text ||
            node.type ||
            node.id;

          return (
            <li key={node.id} className="flex items-center gap-2 text-xs">
              <span>{icon}</span>
              <span className="text-gray-300 truncate max-w-[130px]">{String(label)}</span>
              <span className={`ml-auto ${color} font-medium`}>{status}</span>
            </li>
          );
        })}
      </ul>

      {activeEntries.length === 0 && executionState === 'running' && (
        <p className="text-gray-500 text-xs">Initialising…</p>
      )}
    </div>
  );
}
