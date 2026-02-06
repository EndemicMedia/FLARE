/**
 * Model Service
 * 
 * Fetches available AI models from the Pollinations API.
 * Provides caching and fallback to hardcoded models.
 */

import axios from 'axios';

export interface PollinationsModel {
    id: string;
    name: string;
    description?: string;
    provider?: string;
    context_length?: number;
    pricing?: {
        prompt: number;
        completion: number;
    };
}

export interface ModelOption {
    id: string;
    name: string;
    description: string;
    provider: string;
    color: string;
    contextLength?: number;
}

// Pollinations API endpoint
const POLLINATIONS_MODELS_URL = 'https://gen.pollinations.ai/v1/models';

// Color palette for providers
const PROVIDER_COLORS: Record<string, string> = {
    openai: '#74aa9c',
    mistral: '#ff7000',
    google: '#4285f4',
    anthropic: '#d4a574',
    meta: '#0668e1',
    qwen: '#6366f1',
    deepseek: '#00d4aa',
    nvidia: '#76b900',
    default: '#6c757d',
};

// Fallback models if API fails
const FALLBACK_MODELS: ModelOption[] = [
    { id: 'mistral', name: 'Mistral Small 3.1 24B', description: 'Fast, efficient model', provider: 'mistral', color: '#ff7000' },
    { id: 'gemini', name: 'Gemini 2.5 Flash Lite', description: 'Google Gemini model', provider: 'google', color: '#4285f4' },
    { id: 'openai', name: 'OpenAI GPT-5 Nano', description: 'Fast OpenAI model', provider: 'openai', color: '#74aa9c' },
    { id: 'qwen-coder', name: 'Qwen 2.5 Coder 32B', description: 'Code-specialized model', provider: 'qwen', color: '#6366f1' },
    { id: 'deepseek', name: 'DeepSeek V3', description: 'Large context model', provider: 'deepseek', color: '#00d4aa' },
];

// Cache for models
let modelsCache: ModelOption[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get color for a provider
 */
function getProviderColor(provider: string): string {
    const normalizedProvider = provider.toLowerCase();
    for (const [key, color] of Object.entries(PROVIDER_COLORS)) {
        if (normalizedProvider.includes(key)) {
            return color;
        }
    }
    return PROVIDER_COLORS.default;
}

/**
 * Transform API response to ModelOption format
 */
function transformModel(model: PollinationsModel): ModelOption {
    const provider = model.provider || model.id.split('/')[0] || 'unknown';
    return {
        id: model.id,
        name: model.name || model.id,
        description: model.description || `${provider} model`,
        provider,
        color: getProviderColor(provider),
        contextLength: model.context_length,
    };
}

/**
 * Fetch available models from Pollinations API
 */
export async function fetchAvailableModels(): Promise<ModelOption[]> {
    // Return cached models if still valid
    if (modelsCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
        console.log('Using cached models');
        return modelsCache;
    }

    try {
        console.log('Fetching models from Pollinations API...');
        const response = await axios.get<PollinationsModel[]>(POLLINATIONS_MODELS_URL, {
            timeout: 10000,
        });

        // Check if response.data is an array (old API) or has .data property (OpenAI format)
        const modelsList = Array.isArray(response.data) ? response.data :
            (response.data && Array.isArray((response.data as any).data)) ? (response.data as any).data : [];

        if (modelsList.length > 0) {
            modelsCache = modelsList.map(transformModel);
            cacheTimestamp = Date.now();
            console.log(`Fetched ${modelsCache.length} models from API`);
            return modelsCache;
        }
    } catch (error) {
        console.warn('Failed to fetch models from API, using fallback:', error);
    }

    // Return fallback models if API fails
    return FALLBACK_MODELS;
}

/**
 * Get a model by ID
 */
export function getModelById(models: ModelOption[], modelId: string): ModelOption | undefined {
    return models.find(m => m.id === modelId);
}

/**
 * Search models by name or description
 */
export function searchModels(models: ModelOption[], query: string): ModelOption[] {
    if (!query.trim()) return models;

    const lowerQuery = query.toLowerCase();
    return models.filter(m =>
        m.name.toLowerCase().includes(lowerQuery) ||
        m.id.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery) ||
        m.provider.toLowerCase().includes(lowerQuery)
    );
}
