// START: AIProviderManager
/**
 * AI Provider Manager
 * Orchestrates multi-provider fallback system
 */
import { PollinationsClient } from './pollinationsClient.js';
import { OpenRouterClient } from './openRouterClient.js';
import { GeminiClient } from './geminiClient.js';
import { ModelPriorityManager } from './modelPriorityManager.js';
import { apiConfig } from '../globals.js';

export class AIProviderManager {
    constructor(config = {}) {
        this.pollinationsClient = new PollinationsClient(config.pollinationsApiKey);
        this.openRouterClient = new OpenRouterClient(config.openRouterApiKey);
        this.geminiClient = new GeminiClient(config.geminiApiKey);

        this.modelPriorityManager = new ModelPriorityManager();

        const primary = this.modelPriorityManager.getPrimaryRecommendation();
        console.log(`📊 Primary model: ${primary.provider}/${primary.model} - ${primary.reason}`);
    }

    async createChatCompletion(messages, options = {}) {
        const fallbackChain = this.getProviderOrder(options);

        console.log(`🔄 Fallback chain: ${fallbackChain.map(p =>
            `${p.provider}/${p.model}`).join(' → ')}`);

        let lastError = null;

        for (const { provider, model } of fallbackChain) {
            const response = await this.tryProviderWithRetries(provider, messages, options, model);

            if (response.success) {
                console.log(`✅ Success with ${provider}/${model}`);
                return response.data;
            }

            lastError = response.error;
            console.log(`⚠️ ${provider}/${model} failed, trying next...`);
        }

        throw lastError || new Error('All AI providers failed');
    }

    async tryProviderWithRetries(providerName, messages, options, modelId = null) {
        const maxAttempts = apiConfig.retry.maxAttempts;
        let lastError = null;
        const model = modelId || this.modelPriorityManager.getRecommendedModel(providerName);

        // Log model metadata if available
        const metadata = this.modelPriorityManager.getModelMetadata(providerName, model);
        if (metadata) {
            console.log(`📊 Model quality: ${metadata.quality}/10, Expected latency: ${metadata.latency}ms`);
        }

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const client = this.getClient(providerName);
                console.log(`💬 Using ${providerName}/${model} (attempt ${attempt + 1}/${maxAttempts})`);

                const response = await client.createChatCompletion(messages, { ...options, model });
                return { success: true, data: response };

            } catch (error) {
                lastError = error;
                const status = error.response?.status;

                console.log(`❌ ${providerName} failed (attempt ${attempt + 1}):`, error.message);

                // Don't retry on rate limit or quota errors - rotate immediately
                if (this.isRateLimitError(error) || this.isQuotaError(error)) {
                    console.warn(`⏳ Rate/quota limit hit, rotating to next provider...`);
                    break;
                }

                // Don't retry on non-retryable errors
                if (!this.isRetryableError(error) && status >= 400 && status < 500) {
                    console.warn(`❌ Non-retryable client error (${status}), rotating to next provider...`);
                    break;
                }

                // Exponential backoff for retryable errors
                if (attempt < maxAttempts - 1 && this.isRetryableError(error)) {
                    const delay = Math.min(
                        apiConfig.retry.baseDelay * Math.pow(apiConfig.retry.backoffFactor, attempt),
                        apiConfig.retry.maxDelay
                    );
                    console.log(`⏳ Waiting ${delay}ms before retry...`);
                    await this.sleep(delay);
                }
            }
        }

        return { success: false, error: lastError };
    }

    getProviderOrder(options = {}) {
        const { minQuality = 6, maxLatency = null } = options;
        const fallbackChain = this.modelPriorityManager.getFallbackChain(minQuality, maxLatency);

        if (fallbackChain && fallbackChain.length > 0) {
            return fallbackChain;
        }

        return this.modelPriorityManager.getDefaultFallbackChain();
    }

    getClient(providerName) {
        switch (providerName) {
            case 'pollinations': return this.pollinationsClient;
            case 'openrouter': return this.openRouterClient;
            case 'gemini': return this.geminiClient;
            default: throw new Error(`Unknown provider: ${providerName}`);
        }
    }

    isRateLimitError(error) {
        const status = error.response?.status;
        const message = error.message?.toLowerCase() || '';
        return apiConfig.errors.rateLimitCodes.includes(status) ||
            message.includes('rate limit') ||
            message.includes('too many requests');
    }

    isQuotaError(error) {
        const status = error.response?.status;
        const message = error.message?.toLowerCase() || '';
        return apiConfig.errors.quotaCodes.includes(status) ||
            message.includes('quota') ||
            message.includes('resource_exhausted');
    }

    isRetryableError(error) {
        const status = error.response?.status;
        return apiConfig.errors.retryableCodes.includes(status) ||
            error.code === 'ECONNABORTED' ||
            error.code === 'ENOTFOUND' ||
            error.code === 'ETIMEDOUT';
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
// END: AIProviderManager
