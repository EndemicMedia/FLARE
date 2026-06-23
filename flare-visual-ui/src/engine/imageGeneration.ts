/**
 * Pollinations image URL builder.
 * Ported from backend src/services/providers/pollinationsImageClient.js.
 * Pollinations generates images on-demand when the URL is fetched, so this
 * is a pure function — no network call needed.
 */
import { apiConfig } from '@flare/core';

export interface ImageGenerationOptions {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  seed?: number;
  nologo?: boolean;
  enhance?: boolean;
}

/**
 * Build a Pollinations image generation URL:
 * https://gen.pollinations.ai/image/{encodedPrompt}?model=...&width=...&...
 */
export function buildImageUrl(opts: ImageGenerationOptions): string {
  const {
    prompt,
    model = 'flux',
    width = 1024,
    height = 1024,
    seed,
    nologo = true,
    enhance = false,
  } = opts;

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
  });

  if (seed !== undefined) {
    queryParams.append('seed', seed.toString());
  }

  // Encode prompt for URL
  const encodedPrompt = encodeURIComponent(prompt);
  return `${apiConfig.pollinations.baseUrl}/image/${encodedPrompt}?${queryParams.toString()}`;
}
