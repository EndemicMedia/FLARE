// START: GeminiClient
/**
 * Gemini API Client
 * Direct Google API fallback
 */
import axios from 'axios';
import { apiConfig } from '../globals.js';

export class GeminiClient {
    constructor(apiKey = null) {
        this.baseURL = apiConfig.gemini.baseUrl;
        this.apiKey = apiKey || apiConfig.gemini.apiKey;
        this.defaultModel = apiConfig.gemini.defaultModel;
    }

    async createChatCompletion(messages, options = {}) {
        if (!this.apiKey) {
            throw new Error('Gemini API key not configured');
        }

        const model = options.model || this.defaultModel;
        const contents = this.convertMessages(messages);

        const response = await axios.post(
            `${this.baseURL}/${model}:generateContent?key=${this.apiKey}`,
            { contents },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: apiConfig.gemini.timeout
            }
        );

        // Convert Gemini format to OpenAI format
        return {
            choices: [{
                message: {
                    role: 'assistant',
                    content: response.data.candidates[0].content.parts[0].text
                }
            }],
            usage: {
                prompt_tokens: response.data.usageMetadata?.promptTokenCount || 0,
                completion_tokens: response.data.usageMetadata?.candidatesTokenCount || 0,
                total_tokens: response.data.usageMetadata?.totalTokenCount || 0
            },
            model: model,
            provider: 'gemini'
        };
    }

    convertMessages(messages) {
        return messages
            .filter(m => m.role !== 'system')
            .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));
    }

    async isAvailable() {
        return !!this.apiKey;
    }
}
// END: GeminiClient
