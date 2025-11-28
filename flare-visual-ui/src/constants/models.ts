/**
 * Available models from Pollinations.ai integration
 * Based on backend services configuration
 */

export interface ModelDefinition {
  id: string;
  name: string;
  description: string;
  specialization: string;
  supportsTemp: boolean;
  color: string;
}

export const AVAILABLE_MODELS: ModelDefinition[] = [
  {
    id: 'mistral',
    name: 'Mistral Small 3.1 24B',
    description: 'General-purpose, creative writing',
    specialization: 'Creative Writing',
    supportsTemp: true,
    color: '#FF6B6B'
  },
  {
    id: 'gemini',
    name: 'Gemini 2.5 Flash Lite',
    description: 'Fast responses, analysis',
    specialization: 'Fast Analysis',
    supportsTemp: true,
    color: '#4ECDC4'
  },
  {
    id: 'nova-fast',
    name: 'Amazon Nova Micro',
    description: 'Quick processing',
    specialization: 'Quick Processing',
    supportsTemp: true,
    color: '#95E1D3'
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-5 Nano',
    description: 'General-purpose (does not support temp parameter)',
    specialization: 'General Purpose',
    supportsTemp: false,
    color: '#74B9FF'
  },
  {
    id: 'openai-fast',
    name: 'OpenAI GPT-4.1 Nano',
    description: 'Faster responses',
    specialization: 'Fast Responses',
    supportsTemp: true,
    color: '#A29BFE'
  },
  {
    id: 'qwen-coder',
    name: 'Qwen 2.5 Coder 32B',
    description: 'Code generation & debugging',
    specialization: 'Code Generation',
    supportsTemp: true,
    color: '#FD79A8'
  },
  {
    id: 'bidara',
    name: "NASA's BIDARA",
    description: 'Biomimetic design & research',
    specialization: 'Biomimetic Design',
    supportsTemp: true,
    color: '#FDCB6E'
  },
  {
    id: 'midijourney',
    name: 'MIDIjourney',
    description: 'Music composition',
    specialization: 'Music Composition',
    supportsTemp: true,
    color: '#6C5CE7'
  }
];

export const DEFAULT_MODEL = 'openai';

export const getModelById = (id: string): ModelDefinition | undefined => {
  return AVAILABLE_MODELS.find(model => model.id === id);
};

export const getModelColor = (id: string): string => {
  const model = getModelById(id);
  return model?.color || '#999999';
};

export const modelSupportsTemperature = (id: string): boolean => {
  const model = getModelById(id);
  return model?.supportsTemp ?? true;
};
