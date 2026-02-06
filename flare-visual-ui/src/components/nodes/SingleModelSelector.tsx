/**
 * Single Model Selector Component
 * 
 * Searchable dropdown for selecting a SINGLE AI model from Pollinations API.
 */

import { memo, useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiSearch } from 'react-icons/fi';
import { fetchAvailableModels, searchModels, type ModelOption } from '../../services/modelService';

interface SingleModelSelectorProps {
    selectedModel: string | null;
    onModelChange: (model: string) => void;
}

// Prevent drag from blocking interactions
const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();
// Prevent wheel from triggering React Flow zoom
const stopWheelPropagation = (e: React.WheelEvent) => e.stopPropagation();

export const SingleModelSelector = memo(function SingleModelSelector({
    selectedModel,
    onModelChange
}: SingleModelSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [availableModels, setAvailableModels] = useState<ModelOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch models on mount
    useEffect(() => {
        const loadModels = async () => {
            setIsLoading(true);
            try {
                const models = await fetchAvailableModels();
                setAvailableModels(models);
            } catch (error) {
                console.error('Failed to load models:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadModels();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const filteredModels = searchModels(availableModels, searchQuery);
    const currentModel = availableModels.find(m => m.id === selectedModel);

    const handleSelect = (modelId: string) => {
        onModelChange(modelId);
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div className="single-model-selector" ref={dropdownRef}>
            {/* Selected Model Display */}
            <button
                className="model-selector-button"
                onClick={() => setIsOpen(!isOpen)}
                onMouseDown={stopPropagation}
            >
                {currentModel ? (
                    <div className="selected-model-display">
                        <div
                            className="model-color-dot"
                            style={{ backgroundColor: currentModel.color }}
                        />
                        <span className="model-name">{currentModel.name}</span>
                    </div>
                ) : (
                    <span className="placeholder">Select a model...</span>
                )}
                <FiChevronDown size={16} className={isOpen ? 'rotated' : ''} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="model-dropdown-menu nowheel" onMouseDown={stopPropagation} onWheel={stopWheelPropagation}>
                    {/* Search Input */}
                    <div className="model-search">
                        <FiSearch size={14} />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search models..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onMouseDown={stopPropagation}
                        />
                    </div>

                    {/* Models List */}
                    <div className="model-list">
                        {isLoading ? (
                            <div className="model-loading">Loading models...</div>
                        ) : filteredModels.length === 0 ? (
                            <div className="model-empty">No models found</div>
                        ) : (
                            filteredModels.map(model => {
                                const isSelected = model.id === selectedModel;
                                return (
                                    <button
                                        key={model.id}
                                        className={`model-option ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleSelect(model.id)}
                                        onMouseDown={stopPropagation}
                                    >
                                        <div
                                            className="model-color-dot"
                                            style={{ backgroundColor: model.color }}
                                        />
                                        <div className="model-option-info">
                                            <div className="model-option-name">{model.name}</div>
                                            <div className="model-option-desc">{model.description}</div>
                                        </div>
                                        {isSelected && <span className="model-check">✓</span>}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});
