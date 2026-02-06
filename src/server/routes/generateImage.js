// START: generateImage route handler
/**
 * Express route handler for image generation
 * POST /generate-image
 */
import { PollinationsImageClient } from '../../services/providers/pollinationsImageClient.js';

export async function generateImage(req, res) {
    try {
        const {
            prompt,
            model = 'flux',
            width = 1024,
            height = 1024,
            seed,
            nologo = true,
            enhance = false,
            private: isPrivate = false,
            count = 1
        } = req.body;

        // Validate required fields
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid prompt. Please provide a text description for the image.'
            });
        }

        // Validate dimensions
        if (width < 256 || width > 2048 || height < 256 || height > 2048) {
            return res.status(400).json({
                success: false,
                error: 'Image dimensions must be between 256 and 2048 pixels'
            });
        }

        // Validate count
        if (count < 1 || count > 10) {
            return res.status(400).json({
                success: false,
                error: 'Count must be between 1 and 10'
            });
        }

        console.log(`🎨 Image generation request: "${prompt.substring(0, 50)}..." (${model}, ${width}x${height})`);

        const imageClient = new PollinationsImageClient();

        let result;
        if (count > 1) {
            // Generate multiple images
            const images = await imageClient.generateMultipleImages({
                prompt,
                model,
                width,
                height,
                seed,
                nologo,
                enhance,
                private: isPrivate
            }, count);

            result = {
                success: true,
                images,
                count: images.length,
                prompt,
                model
            };
        } else {
            // Generate single image
            const image = await imageClient.generateImage({
                prompt,
                model,
                width,
                height,
                seed,
                nologo,
                enhance,
                private: isPrivate
            });

            result = image;
        }

        console.log(`✅ Image generation successful`);
        res.json(result);

    } catch (error) {
        console.error('❌ Image generation error:', error.message);
        res.status(500).json({
            success: false,
            error: `Image generation failed: ${error.message}`
        });
    }
}

export default generateImage;
// END: generateImage route handler
