import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { setApiKey, clearApiKey, isUsingDefaultKey } from '../engine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [keyInput, setKeyInput] = useState('');
  const [usingDefault, setUsingDefault] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setKeyInput('');
      setUsingDefault(isUsingDefaultKey());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (keyInput.trim()) {
      setApiKey(keyInput.trim());
      setUsingDefault(isUsingDefaultKey());
      setKeyInput('');
    }
  };

  const handleClear = () => {
    clearApiKey();
    setKeyInput('');
    setUsingDefault(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Close settings"
            aria-label="Close settings"
          >
            <FiX size={20} />
          </button>
        </div>

        <label
          htmlFor="pollinations-api-key"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Pollinations API key (optional)
        </label>
        <input
          id="pollinations-api-key"
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="Paste your API key..."
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <p className="text-xs text-gray-500 mt-2">
          {usingDefault
            ? 'Using shared default key'
            : 'Using your key'}
        </p>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleSave}
            disabled={!keyInput.trim()}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              keyInput.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Save
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Clear
          </button>
          <div className="flex-1"></div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Done
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          With your own key you pay for your usage directly and control your
          spending. The key is stored only in your browser (localStorage).
        </p>
      </div>
    </div>
  );
}
