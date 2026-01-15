// START: OpenRouterClient
/**
 * OpenRouter API Client
 * Fallback provider with free tier models
 */
import axios from 'axios';
import { apiConfig } from '../globals.js';

export class OpenRouterClient {
    constructor(apiKey = null) {
        this.baseURL = apiConfig.openRouter.baseUrl;
        this.apiKey = apiKey || apiConfig.openRouter.apiKey;
    }

    async createChatCompletion(messages, options = {}) {
        if (!this.apiKey) {
            throw new Error('OpenRouter API key not configured');
        }

        const response = await axios.post(
            `${this.baseURL}/chat/completions`,
            {
                model: options.model || 'allenai/molmo-2-8b:free',
                messages,
                ...(options.temperature !== undefined && { temperature: options.temperature }),
                ...(options.max_tokens && { max_tokens: options.max_tokens })
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://github.com/EndemicMedia/FLARE',
                    'X-Title': 'FLARE'
                },
                timeout: apiConfig.openRouter.timeout
            }
        );

        return {
            ...response.data,
            provider: 'openrouter'
        };
    }

    async isAvailable() {
        return !!this.apiKey;
    }
}
// END: OpenRouterClient
