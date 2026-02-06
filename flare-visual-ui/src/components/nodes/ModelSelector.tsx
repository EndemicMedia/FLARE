/**
 * Model Selector Component
 * 
 * Searchable dropdown for selecting AI models from Pollinations API.
 * Supports multi-select with visual chips display.
 */

import { memo, useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiSearch, FiX } from 'react-icons/fi';
import { fetchAvailableModels, searchModels, type ModelOption } from '../../services/modelService';

interface ModelSelectorProps {
    selectedModels: string[];
    onModelsChange: (models: string[]) => void;
}

// Prevent drag from blocking interactions
const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();
// Prevent wheel from triggering React Flow zoom
const stopWheelPropagation = (e: React.WheelEvent) => e.stopPropagation();

export const ModelSelector = memo(function ModelSelector({
    selectedModels,
    onModelsChange
}: ModelSelectorProps) {
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

    const toggleModel = (modelId: string) => {
        const newSelection = selectedModels.includes(modelId)
            ? selectedModels.filter(m => m !== modelId)
            : [...selectedModels, modelId];
        onModelsChange(newSelection);
    };

    const removeModel = (modelId: string) => {
        onModelsChange(selectedModels.filter(m => m !== modelId));
    };

    const getModelById = (id: string) => availableModels.find(m => m.id === id);

    return (
        <div className="model-selector-container" ref={dropdownRef}>
            {/* Selected Models Display */}
            <div className="selected-models">
                {selectedModels.length === 0 ? (
                    <span className="placeholder">Click to select models...</span>
                ) : (
                    selectedModels.map(modelId => {
                        const model = getModelById(modelId);
                        return (
                            <span
                                key={modelId}
                                className="selected-model-chip"
                                style={{
                                    borderColor: model?.color || '#ccc',
                                    backgroundColor: model?.color ? `${model.color}20` : 'transparent'
                                }}
                            >
                                <span className="chip-name">{model?.name || modelId}</span>
                                <button
                                    className="chip-remove"
                                    onClick={(e) => { e.stopPropagation(); removeModel(modelId); }}
                                    onMouseDown={stopPropagation}
                                    title="Remove model"
                                >
                                    <FiX size={12} />
                                </button>
                            </span>
                        );
                    })
                )}
            </div>

            {/* Dropdown Toggle */}
            <button
                className="model-dropdown-toggle"
                onClick={() => setIsOpen(!isOpen)}
                onMouseDown={stopPropagation}
            >
                <FiChevronDown size={16} className={isOpen ? 'rotated' : ''} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="model-dropdown-menu" onMouseDown={stopPropagation} onWheel={stopWheelPropagation}>
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
                                const isSelected = selectedModels.includes(model.id);
                                return (
                                    <button
                                        key={model.id}
                                        className={`model-option ${isSelected ? 'selected' : ''}`}
                                        onClick={() => toggleModel(model.id)}
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
