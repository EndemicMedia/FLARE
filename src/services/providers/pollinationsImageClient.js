// START: PollinationsImageClient class
/**
 * Client for Pollinations Image Generation API
 * Handles image generation requests to gen.pollinations.ai
 */
import axios from 'axios';
import { apiConfig } from '../globals.js';

export class PollinationsImageClient {
    constructor(apiKey = null) {
        this.baseURL = apiConfig.pollinations.baseUrl;
        this.apiKey = apiKey || apiConfig.pollinations.apiKey;
        this.defaultModel = 'flux';
    }

    /**
     * Generate an image from a text prompt
     * @param {Object} params - Image generation parameters
     * @param {string} params.prompt - Text description of the image
     * @param {string} [params.model='flux'] - Model to use (flux, flux-realism, flux-anime, flux-3d, any-dark, flux-pro)
     * @param {number} [params.width=1024] - Image width
     * @param {number} [params.height=1024] - Image height
     * @param {number} [params.seed] - Random seed for reproducibility
     * @param {boolean} [params.nologo=true] - Remove Pollinations watermark
     * @param {boolean} [params.enhance=false] - Enhance prompt with AI
     * @param {boolean} [params.private=false] - Private generation (requires API key)
     * @returns {Promise<Object>} Image generation result with URL
     */
    async generateImage(params) {
        const {
            prompt,
            model = this.defaultModel,
            width = 1024,
            height = 1024,
            seed,
            nologo = true,
            enhance = false,
            private: isPrivate = false
        } = params;

        if (!prompt || prompt.trim().length === 0) {
            throw new Error('Image prompt is required');
        }

        // Build query parameters
        const queryParams = new URLSearchParams({
            model,
            width: width.toString(),
            height: height.toString(),
            nologo: nologo.toString(),
            enhance: enhance.toString(),
            private: isPrivate.toString()
        });

        if (seed !== undefined) {
            queryParams.append('seed', seed.toString());
        }

        // Encode prompt for URL
        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `${this.baseURL}/image/${encodedPrompt}?${queryParams.toString()}`;

        try {
            // Verify the image URL is accessible
            const response = await axios.head(imageUrl, {
                timeout: apiConfig.pollinations.timeout,
                headers: this.apiKey ? {
                    'Authorization': `Bearer ${this.apiKey}`
                } : {}
            });

            console.log(`🎨 Image generated successfully: ${model}`);

            return {
                success: true,
                imageUrl,
                model,
                prompt,
                width,
                height,
                seed,
                provider: 'pollinations'
            };
        } catch (error) {
            console.error('Image generation failed:', error.message);

            // Return the URL anyway - it might work when accessed directly
            // Pollinations generates images on-demand
            return {
                success: true,
                imageUrl,
                model,
                prompt,
                width,
                height,
                seed,
                provider: 'pollinations',
                note: 'Image will be generated on first access'
            };
        }
    }

    /**
     * Get list of available image models
     * @returns {Promise<Array>} List of available models
     */
    async getAvailableImageModels() {
        try {
            const response = await axios.get(`${this.baseURL}/image/models`, {
                timeout: apiConfig.pollinations.timeout,
                headers: this.apiKey ? {
                    'Authorization': `Bearer ${this.apiKey}`
                } : {}
            });

            console.log('📋 Retrieved available image models');
            return response.data;
        } catch (error) {
            console.error('Failed to fetch image models:', error.message);

            // Return default models if API call fails
            return [
                { id: 'flux', name: 'Flux', description: 'High-quality general purpose model' },
                { id: 'flux-realism', name: 'Flux Realism', description: 'Photorealistic images' },
                { id: 'flux-anime', name: 'Flux Anime', description: 'Anime-style images' },
                { id: 'flux-3d', name: 'Flux 3D', description: '3D rendered style' },
                { id: 'any-dark', name: 'Any Dark', description: 'Dark themed images' },
                { id: 'flux-pro', name: 'Flux Pro', description: 'Professional quality (requires API key)' }
            ];
        }
    }

    /**
     * Generate multiple images with different seeds
     * @param {Object} params - Base parameters
     * @param {number} count - Number of images to generate
     * @returns {Promise<Array>} Array of image results
     */
    async generateMultipleImages(params, count = 4) {
        const promises = [];
        const baseSeed = params.seed || Math.floor(Math.random() * 1000000);

        for (let i = 0; i < count; i++) {
            promises.push(
                this.generateImage({
                    ...params,
                    seed: baseSeed + i
                })
            );
        }

        const results = await Promise.all(promises);
        console.log(`🎨 Generated ${count} images`);
        return results;
    }
}

export default PollinationsImageClient;
// END: PollinationsImageClient class
