// START: ModelPriorityManager
/**
 * Model Priority Manager
 * Provides intelligent model selection based on benchmarks
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ModelPriorityManager {
    constructor(benchmarkResultsPath = null) {
        this.benchmarkPath = benchmarkResultsPath ||
            path.join(__dirname, '..', '..', '..', 'benchmark-results.json');
        this.benchmarkData = null;
        this.loadBenchmarkResults();
    }

    loadBenchmarkResults() {
        try {
            if (fs.existsSync(this.benchmarkPath)) {
                const data = fs.readFileSync(this.benchmarkPath, 'utf8');
                this.benchmarkData = JSON.parse(data);
                console.log(`📊 Loaded benchmark results from ${this.benchmarkPath}`);
            } else {
                console.log(`📊 No benchmark results found, using defaults`);
            }
        } catch (error) {
            console.warn(`⚠️ Error loading benchmark results:`, error.message);
            this.benchmarkData = null;
        }
    }

    getDefaultFallbackChain() {
        return [
            { provider: 'pollinations', model: 'openai' },
            { provider: 'pollinations', model: 'mistral' },
            { provider: 'pollinations', model: 'gemini-fast' },
            { provider: 'openrouter', model: 'allenai/molmo-2-8b:free' }
        ];
    }

    getFallbackChain(minQuality = 6, maxLatency = null) {
        if (!this.benchmarkData?.recommendations?.fallbackChain) {
            return this.getDefaultFallbackChain();
        }

        return this.benchmarkData.recommendations.fallbackChain
            .filter(item => {
                if (item.quality < minQuality) return false;
                if (maxLatency && item.latency > maxLatency) return false;
                return true;
            });
    }

    getRecommendedModel(provider = 'pollinations') {
        if (!this.benchmarkData?.providers?.[provider]) {
            return provider === 'pollinations' ? 'openai' : null;
        }

        const models = this.benchmarkData.providers[provider].models;
        const recommended = models.find(m => m.recommended && m.status === 'working');
        return recommended?.id || models[0]?.id;
    }

    getPrimaryRecommendation() {
        if (this.benchmarkData?.recommendations?.primary) {
            return this.benchmarkData.recommendations.primary;
        }
        return { provider: 'pollinations', model: 'openai', reason: 'Default model' };
    }

    getModelMetadata(provider, modelId) {
        if (!this.benchmarkData?.providers?.[provider]) return null;
        return this.benchmarkData.providers[provider].models.find(m => m.id === modelId);
    }
}
// END: ModelPriorityManager
