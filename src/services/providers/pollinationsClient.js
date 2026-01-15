// START: PollinationsClient
/**
 * Pollinations API Client
 * Uses gen.pollinations.ai OpenAI-compatible endpoint
 */
import axios from 'axios';
import { apiConfig } from '../globals.js';

export class PollinationsClient {
    constructor(apiKey = null) {
        this.baseURL = apiConfig.pollinations.baseUrl;
        this.apiKey = apiKey || apiConfig.pollinations.apiKey;
        this.defaultModel = apiConfig.pollinations.defaultModel;
    }

    async createChatCompletion(messages, options = {}) {
        const model = options.model || this.defaultModel;

        const response = await axios.post(
            `${this.baseURL}${apiConfig.pollinations.chatEndpoint}`,
            {
                model,
                messages,
                ...(model !== 'openai' && options.temperature !== undefined && { temperature: options.temperature }),
                ...(options.max_tokens && { max_tokens: options.max_tokens }),
                ...(options.seed && { seed: options.seed }),
                stream: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: apiConfig.pollinations.timeout
            }
        );

        return {
            ...response.data,
            provider: 'pollinations'
        };
    }

    async getAvailableModels() {
        const response = await axios.get(
            `${this.baseURL}${apiConfig.pollinations.modelsEndpoint}`,
            {
                headers: { 'Authorization': `Bearer ${this.apiKey}` },
                timeout: 5000
            }
        );
        return response.data;
    }

    async isAvailable() {
        try {
            await this.getAvailableModels();
            return true;
        } catch {
            return false;
        }
    }
}
// END: PollinationsClient
