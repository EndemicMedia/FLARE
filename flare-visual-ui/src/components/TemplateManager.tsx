import { useState, useEffect, useCallback, useRef } from 'react';
import { FiFolder, FiTrash2 } from 'react-icons/fi';
import { useFlareWorkflowStore } from '../store/flareWorkflowStore';
import type { WorkflowData } from '../utils/workflowPersistence';
import { logger } from '../utils/logger';

const TEMPLATES_STORAGE_KEY = 'flare_templates';

interface StoredTemplate {
  id: string;
  name: string;
  savedAt: string;
  workflow: WorkflowData;
}

// ---------------------------------------------------------------------------
// Prebuilt read-only example templates (hard-coded, never in localStorage)
// ---------------------------------------------------------------------------

const PRESET_TEMPLATES: StoredTemplate[] = [
  {
    id: 'preset-vote',
    name: 'Multi-model vote',
    savedAt: '',
    workflow: {
      version: '1.0.0',
      nodes: [
        { id: 'pv-in',  type: 'textInput',      position: { x: 50,  y: 220 }, data: { text: 'Enter your question', placeholder: 'Enter prompt...' } },
        { id: 'pv-m1',  type: 'modelQuery',      position: { x: 350, y: 80  }, data: { model: 'mistral', models: ['mistral'], temperature: 0.7 } },
        { id: 'pv-m2',  type: 'modelQuery',      position: { x: 350, y: 240 }, data: { model: 'openai',  models: ['openai'],  temperature: 0.7 } },
        { id: 'pv-m3',  type: 'modelQuery',      position: { x: 350, y: 400 }, data: { model: 'gemini',  models: ['gemini'],  temperature: 0.7 } },
        { id: 'pv-pp',  type: 'postProcessing',  position: { x: 660, y: 220 }, data: { operation: 'vote', inputCount: 3 } },
        { id: 'pv-out', type: 'output',           position: { x: 960, y: 220 }, data: { displayMode: 'text', content: null } },
      ],
      edges: [
        { id: 'pve1', source: 'pv-in', target: 'pv-m1' },
        { id: 'pve2', source: 'pv-in', target: 'pv-m2' },
        { id: 'pve3', source: 'pv-in', target: 'pv-m3' },
        { id: 'pve4', source: 'pv-m1', target: 'pv-pp' },
        { id: 'pve5', source: 'pv-m2', target: 'pv-pp' },
        { id: 'pve6', source: 'pv-m3', target: 'pv-pp' },
        { id: 'pve7', source: 'pv-pp', target: 'pv-out' },
      ],
    } as unknown as WorkflowData,
  },
  {
    id: 'preset-sum',
    name: 'Summarizer',
    savedAt: '',
    workflow: {
      version: '1.0.0',
      nodes: [
        { id: 'ps-in',  type: 'textInput',     position: { x: 50,  y: 200 }, data: { text: 'Summarize this article: ...', placeholder: 'Enter prompt...' } },
        { id: 'ps-m1',  type: 'modelQuery',     position: { x: 350, y: 120 }, data: { model: 'mistral', models: ['mistral'], temperature: 0.7 } },
        { id: 'ps-m2',  type: 'modelQuery',     position: { x: 350, y: 280 }, data: { model: 'openai',  models: ['openai'],  temperature: 0.7 } },
        { id: 'ps-pp',  type: 'postProcessing', position: { x: 650, y: 200 }, data: { operation: 'sum', inputCount: 2 } },
        { id: 'ps-out', type: 'output',          position: { x: 950, y: 200 }, data: { displayMode: 'text', content: null } },
      ],
      edges: [
        { id: 'pse1', source: 'ps-in', target: 'ps-m1' },
        { id: 'pse2', source: 'ps-in', target: 'ps-m2' },
        { id: 'pse3', source: 'ps-m1', target: 'ps-pp' },
        { id: 'pse4', source: 'ps-m2', target: 'ps-pp' },
        { id: 'pse5', source: 'ps-pp', target: 'ps-out' },
      ],
    } as unknown as WorkflowData,
  },
  {
    id: 'preset-comb',
    name: 'Model comparison',
    savedAt: '',
    workflow: {
      version: '1.0.0',
      nodes: [
        { id: 'pc-in',  type: 'textInput',     position: { x: 50,  y: 200 }, data: { text: 'Compare how different models answer this', placeholder: 'Enter prompt...' } },
        { id: 'pc-m1',  type: 'modelQuery',     position: { x: 350, y: 120 }, data: { model: 'mistral', models: ['mistral'], temperature: 0.7 } },
        { id: 'pc-m2',  type: 'modelQuery',     position: { x: 350, y: 280 }, data: { model: 'openai',  models: ['openai'],  temperature: 0.7 } },
        { id: 'pc-pp',  type: 'postProcessing', position: { x: 650, y: 200 }, data: { operation: 'comb', inputCount: 2 } },
        { id: 'pc-out', type: 'output',          position: { x: 950, y: 200 }, data: { displayMode: 'text', content: null } },
      ],
      edges: [
        { id: 'pce1', source: 'pc-in', target: 'pc-m1' },
        { id: 'pce2', source: 'pc-in', target: 'pc-m2' },
        { id: 'pce3', source: 'pc-m1', target: 'pc-pp' },
        { id: 'pce4', source: 'pc-m2', target: 'pc-pp' },
        { id: 'pce5', source: 'pc-pp', target: 'pc-out' },
      ],
    } as unknown as WorkflowData,
  },
  {
    id: 'preset-exp',
    name: 'Response expander',
    savedAt: '',
    workflow: {
      version: '1.0.0',
      nodes: [
        { id: 'pe-in',  type: 'textInput',     position: { x: 50,  y: 200 }, data: { text: 'Expand on the topic of AI', placeholder: 'Enter prompt...' } },
        { id: 'pe-m1',  type: 'modelQuery',     position: { x: 350, y: 200 }, data: { model: 'mistral', models: ['mistral'], temperature: 0.9 } },
        { id: 'pe-pp',  type: 'postProcessing', position: { x: 650, y: 200 }, data: { operation: 'exp', inputCount: 1 } },
        { id: 'pe-out', type: 'output',          position: { x: 950, y: 200 }, data: { displayMode: 'text', content: null } },
      ],
      edges: [
        { id: 'pee1', source: 'pe-in', target: 'pe-m1' },
        { id: 'pee2', source: 'pe-m1', target: 'pe-pp' },
        { id: 'pee3', source: 'pe-pp', target: 'pe-out' },
      ],
    } as unknown as WorkflowData,
  },
  {
    id: 'preset-img',
    name: 'Image generator',
    savedAt: '',
    workflow: {
      version: '1.0.0',
      nodes: [
        { id: 'pi-in',  type: 'textInput',       position: { x: 50,  y: 200 }, data: { text: 'A beautiful sunset over mountains', placeholder: 'Enter image prompt...' } },
        { id: 'pi-gen', type: 'imageGeneration',  position: { x: 400, y: 200 }, data: { model: 'flux', width: 1024, height: 1024, enhance: true, nologo: true } },
        { id: 'pi-out', type: 'output',            position: { x: 750, y: 200 }, data: { displayMode: 'text', content: null } },
      ],
      edges: [
        { id: 'pie1', source: 'pi-in',  target: 'pi-gen' },
        { id: 'pie2', source: 'pi-gen', target: 'pi-out' },
      ],
    } as unknown as WorkflowData,
  },
];

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

function readTemplates(): StoredTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredTemplate[];
  } catch {
    return [];
  }
}

function writeTemplates(templates: StoredTemplate[]): void {
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
  } catch (err) {
    logger.error('Failed to write templates to localStorage:', err);
  }
}

// ---------------------------------------------------------------------------
// TemplateManager component
// ---------------------------------------------------------------------------

export function TemplateManager() {
  const [open, setOpen] = useState(false);
  const [userTemplates, setUserTemplates] = useState<StoredTemplate[]>([]);
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const nodes = useFlareWorkflowStore((state) => state.nodes);
  const edges = useFlareWorkflowStore((state) => state.edges);
  const loadWorkflow = useFlareWorkflowStore((state) => state.loadWorkflow);

  // Load templates from localStorage on mount and whenever panel opens
  useEffect(() => {
    if (open) {
      setUserTemplates(readTemplates());
    }
  }, [open]);

  // Close panel when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSave = useCallback(() => {
    const name = saveName.trim();
    if (!name) return;

    const template: StoredTemplate = {
      id: `tpl-${Date.now()}`,
      name,
      savedAt: new Date().toISOString(),
      workflow: {
        version: '1.0.0',
        nodes,
        edges,
        metadata: { name, updatedAt: new Date().toISOString() },
      },
    };

    const updated = [...readTemplates(), template];
    writeTemplates(updated);
    setUserTemplates(updated);
    setSaveName('');
    setShowSaveInput(false);
    logger.debug('Template saved:', name);
  }, [saveName, nodes, edges]);

  const handleDelete = useCallback((id: string) => {
    const updated = readTemplates().filter((t) => t.id !== id);
    writeTemplates(updated);
    setUserTemplates(updated);
    logger.debug('Template deleted:', id);
  }, []);

  const handleLoad = useCallback(
    (workflow: WorkflowData) => {
      loadWorkflow(workflow);
      setOpen(false);
      logger.debug('Template loaded');
    },
    [loadWorkflow]
  );

  const formatDate = (iso: string) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`px-4 py-2 border rounded font-medium text-sm flex items-center gap-2 transition-colors ${
          open
            ? 'bg-gray-200 text-gray-800 border-gray-300'
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
        }`}
        title="Browse and manage workflow templates"
      >
        <FiFolder size={14} />
        Templates
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Workflow Templates</span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-xs"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Save current workflow */}
          <div className="px-4 py-3 border-b border-gray-100">
            {showSaveInput ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') { setShowSaveInput(false); setSaveName(''); }
                  }}
                  placeholder="Template name…"
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={handleSave}
                  disabled={!saveName.trim()}
                  className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-40 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => { setShowSaveInput(false); setSaveName(''); }}
                  className="px-2 py-1.5 bg-gray-200 text-gray-600 text-sm rounded hover:bg-gray-300 transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSaveInput(true)}
                className="w-full px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded hover:bg-blue-100 transition-colors flex items-center gap-2 justify-center font-medium"
              >
                <span>+</span> Save current as template
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {/* User templates */}
            {userTemplates.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">My Templates</span>
                </div>
                {userTemplates.map((tpl) => (
                  <TemplateRow
                    key={tpl.id}
                    name={tpl.name}
                    date={formatDate(tpl.savedAt)}
                    onLoad={() => handleLoad(tpl.workflow)}
                    onDelete={() => handleDelete(tpl.id)}
                  />
                ))}
              </div>
            )}

            {/* Preset templates */}
            <div>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Presets</span>
              </div>
              {PRESET_TEMPLATES.map((tpl) => (
                <TemplateRow
                  key={tpl.id}
                  name={tpl.name}
                  isPreset
                  onLoad={() => handleLoad(tpl.workflow)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TemplateRow sub-component
// ---------------------------------------------------------------------------

interface TemplateRowProps {
  name: string;
  date?: string;
  isPreset?: boolean;
  onLoad: () => void;
  onDelete?: () => void;
}

function TemplateRow({ name, date, isPreset, onLoad, onDelete }: TemplateRowProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-gray-800 truncate font-medium">{name}</span>
          {isPreset && (
            <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
              Preset
            </span>
          )}
        </div>
        {date && <span className="text-xs text-gray-400">{date}</span>}
      </div>
      <button
        onClick={onLoad}
        className="px-2.5 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors font-medium flex-shrink-0"
      >
        Load
      </button>
      {onDelete && (
        <button
          onClick={onDelete}
          className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
          title="Delete template"
        >
          <FiTrash2 size={13} />
        </button>
      )}
    </div>
  );
}
