/**
 * Image Generation Node
 * 
 * Visual node for generating images using Pollinations API
 */

import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { FiImage, FiChevronDown, FiChevronRight, FiX } from 'react-icons/fi';
import { useFlareWorkflowStore } from '../../store/flareWorkflowStore';
import { useHandleContextMenu } from '../../contexts/HandleContextMenuContext';
import '../../styles/nodes.css';

// Image generation node data interface
export interface ImageGenerationNodeData {
    prompt?: string;
    width?: number;
    height?: number;
    model?: string;
    seed?: number | null;
    enhance?: boolean;
    nologo?: boolean;
    status?: 'idle' | 'running' | 'success' | 'error';
    imageUrl?: string;
    error?: string;
}

// Prevent drag from blocking interactions
const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

// Available image models
const IMAGE_MODELS = [
    { id: 'flux', name: 'Flux', description: 'High quality, fast' },
    { id: 'flux-realism', name: 'Flux Realism', description: 'Photorealistic images' },
    { id: 'flux-anime', name: 'Flux Anime', description: 'Anime style' },
    { id: 'flux-3d', name: 'Flux 3D', description: '3D rendered style' },
    { id: 'turbo', name: 'Turbo', description: 'Very fast generation' },
];

// Preset sizes
const SIZE_PRESETS = [
    { label: 'Square (1024x1024)', width: 1024, height: 1024 },
    { label: 'Landscape (1280x720)', width: 1280, height: 720 },
    { label: 'Portrait (720x1280)', width: 720, height: 1280 },
    { label: 'Wide (1920x1080)', width: 1920, height: 1080 },
];

export const ImageGenerationNode = memo(function ImageGenerationNode({
    data,
    id,
    selected
}: NodeProps<ImageGenerationNodeData>) {
    const updateNode = useFlareWorkflowStore((state) => state.updateNode);
    const removeNode = useFlareWorkflowStore((state) => state.removeNode);
    const { openHandleContextMenu } = useHandleContextMenu();
    const [showAdvanced, setShowAdvanced] = useState(false);

    const width = data.width ?? 1024;
    const height = data.height ?? 1024;
    const model = data.model ?? 'flux';
    const enhance = data.enhance ?? true;
    const nologo = data.nologo ?? true;

    const handleSizePreset = (preset: typeof SIZE_PRESETS[0]) => {
        updateNode(id, { width: preset.width, height: preset.height });
    };

    return (
        <div className={`flare-node image-generation-node ${data.status || 'idle'} ${selected ? 'selected' : ''}`}>
            <button className="node-close-btn" onClick={(e) => { e.stopPropagation(); removeNode(id); }} title="Remove node">
                <FiX size={14} />
            </button>
            <Handle
                type="target"
                position={Position.Left}
                id="input"
                className="node-handle"
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openHandleContextMenu(id, 'input', 'target', { x: e.clientX, y: e.clientY });
                }}
            />

            <div className="node-header image-header">
                <FiImage className="node-icon" />
                <span className="node-title">Generate Image</span>
            </div>

            <div className="node-content">
                {/* Prompt Input (if no connection) */}
                {!data.prompt && (
                    <div className="node-section">
                        <label className="node-label">Prompt</label>
                        <textarea
                            placeholder="Describe the image to generate..."
                            className="node-textarea"
                            rows={3}
                            onMouseDown={stopPropagation}
                            onChange={(e) => updateNode(id, { prompt: e.target.value })}
                        />
                    </div>
                )}

                {/* Model Selection */}
                <div className="node-section">
                    <label className="node-label">Model</label>
                    <select
                        value={model}
                        onChange={(e) => updateNode(id, { model: e.target.value })}
                        onMouseDown={stopPropagation}
                        className="node-select"
                    >
                        {IMAGE_MODELS.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Size Presets */}
                <div className="node-section">
                    <label className="node-label">Size</label>
                    <div className="size-presets">
                        {SIZE_PRESETS.map((preset) => (
                            <button
                                key={preset.label}
                                className={`size-preset-btn ${width === preset.width && height === preset.height ? 'selected' : ''}`}
                                onClick={() => handleSizePreset(preset)}
                                onMouseDown={stopPropagation}
                                title={preset.label}
                            >
                                {preset.width}x{preset.height}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Advanced Options */}
                <div className="node-section advanced-section">
                    <button
                        className="advanced-toggle"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        onMouseDown={stopPropagation}
                    >
                        {showAdvanced ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                        <span>⚙️ Advanced Options</span>
                    </button>

                    {showAdvanced && (
                        <div className="advanced-params">
                            {/* Custom Size */}
                            <div className="param-row size-inputs">
                                <div className="size-input-group">
                                    <label className="param-label">Width</label>
                                    <input
                                        type="number"
                                        min="256"
                                        max="2048"
                                        step="64"
                                        value={width}
                                        onChange={(e) => updateNode(id, { width: parseInt(e.target.value) || 1024 })}
                                        onMouseDown={stopPropagation}
                                        className="param-input"
                                    />
                                </div>
                                <div className="size-input-group">
                                    <label className="param-label">Height</label>
                                    <input
                                        type="number"
                                        min="256"
                                        max="2048"
                                        step="64"
                                        value={height}
                                        onChange={(e) => updateNode(id, { height: parseInt(e.target.value) || 1024 })}
                                        onMouseDown={stopPropagation}
                                        className="param-input"
                                    />
                                </div>
                            </div>

                            {/* Seed */}
                            <div className="param-row">
                                <label className="param-label">🎲 Seed (optional)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.seed ?? ''}
                                    placeholder="Random"
                                    onChange={(e) => updateNode(id, { seed: e.target.value ? parseInt(e.target.value) : null })}
                                    onMouseDown={stopPropagation}
                                    className="param-input"
                                />
                            </div>

                            {/* Enhance Toggle */}
                            <div className="param-row checkbox-row">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={enhance}
                                        onChange={(e) => updateNode(id, { enhance: e.target.checked })}
                                        onMouseDown={stopPropagation}
                                    />
                                    <span>✨ Enhance prompt with AI</span>
                                </label>
                            </div>

                            {/* No Logo Toggle */}
                            <div className="param-row checkbox-row">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={nologo}
                                        onChange={(e) => updateNode(id, { nologo: e.target.checked })}
                                        onMouseDown={stopPropagation}
                                    />
                                    <span>🚫 Remove watermark</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Image Preview */}
                {data.imageUrl && (
                    <div className="image-preview">
                        <img
                            src={data.imageUrl}
                            alt="Generated"
                            className="generated-image"
                            onMouseDown={stopPropagation}
                        />
                    </div>
                )}

                {/* Status Indicator */}
                {data.status === 'running' && (
                    <div className="node-status running">
                        ⏳ Generating image...
                    </div>
                )}
            </div>

            {data.error && (
                <div className="node-error">{data.error}</div>
            )}

            <Handle
                type="source"
                position={Position.Right}
                id="output"
                className="node-handle"
                onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openHandleContextMenu(id, 'output', 'source', { x: e.clientX, y: e.clientY });
                }}
            />
        </div>
    );
});
