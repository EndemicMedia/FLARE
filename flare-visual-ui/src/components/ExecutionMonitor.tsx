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

// Node data keys that are internal/noise — not useful as operation parameters.
const HIDDEN_PARAM_KEYS = new Set([
  'status',
  'error',
  'label',
  'placeholder',
  'subGraph',
  'compiled',
]);

/** Format a single param value for compact display. */
function formatParamValue(value: unknown): string {
  if (value == null) return '—';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'string') return value.length > 60 ? `${value.slice(0, 60)}…` : value;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/** Extract displayable operation parameters from a node's data. */
function getNodeParams(data: Record<string, unknown>): Array<[string, string]> {
  return Object.entries(data)
    .filter(([key, value]) => !HIDDEN_PARAM_KEYS.has(key) && value !== undefined && value !== '')
    .map(([key, value]) => [key, formatParamValue(value)] as [string, string]);
}

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
          const data = node.data as Record<string, unknown>;
          const label = data.label || data.text || node.type || node.id;
          const params = getNodeParams(data);
          const error = typeof data.error === 'string' ? data.error : null;

          return (
            <li key={node.id} className="group relative flex items-center gap-2 text-xs cursor-help">
              <span>{icon}</span>
              <span className="text-gray-300 truncate max-w-[130px]">{String(label)}</span>
              <span className={`ml-auto ${color} font-medium`}>{status}</span>

              {/* Hover info box: all operation parameters */}
              <div
                className="pointer-events-none absolute bottom-full right-0 mb-2 hidden group-hover:block z-50 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-3 text-left"
                role="tooltip"
              >
                <div className="text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">
                  {String(node.type)} · {String(node.id)}
                </div>
                {params.length > 0 ? (
                  <dl className="space-y-1">
                    {params.map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <dt className="text-gray-400 shrink-0">{key}:</dt>
                        <dd className="text-gray-100 break-words text-right ml-auto">{value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-gray-500">No parameters</p>
                )}
                {error && (
                  <p className="mt-2 pt-2 border-t border-gray-700 text-red-400 break-words">{error}</p>
                )}
              </div>
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
