/**
 * Unit tests for engine/imageGeneration (pure URL builder, no network).
 */
import { describe, it, expect } from 'vitest';
import { buildImageUrl } from '../../../engine/imageGeneration';
import { apiConfig } from '@flare/core';

describe('buildImageUrl', () => {
  it('builds a URL on the Pollinations image endpoint with the encoded prompt', () => {
    const url = buildImageUrl({ prompt: 'a cat sitting on a mat' });

    expect(url.startsWith(`${apiConfig.pollinations.baseUrl}/image/`)).toBe(true);
    expect(url).toContain(encodeURIComponent('a cat sitting on a mat'));
  });

  it('applies sensible defaults (model, size, nologo, enhance)', () => {
    const url = new URL(buildImageUrl({ prompt: 'hello' }));

    expect(url.searchParams.get('model')).toBe('flux');
    expect(url.searchParams.get('width')).toBe('1024');
    expect(url.searchParams.get('height')).toBe('1024');
    expect(url.searchParams.get('nologo')).toBe('true');
    expect(url.searchParams.get('enhance')).toBe('false');
    expect(url.searchParams.has('seed')).toBe(false);
  });

  it('honors explicit options including seed', () => {
    const url = new URL(
      buildImageUrl({
        prompt: 'a robot',
        model: 'turbo',
        width: 512,
        height: 256,
        seed: 42,
        nologo: false,
        enhance: true
      })
    );

    expect(url.searchParams.get('model')).toBe('turbo');
    expect(url.searchParams.get('width')).toBe('512');
    expect(url.searchParams.get('height')).toBe('256');
    expect(url.searchParams.get('seed')).toBe('42');
    expect(url.searchParams.get('nologo')).toBe('false');
    expect(url.searchParams.get('enhance')).toBe('true');
  });

  it('URL-encodes special characters in the prompt', () => {
    const prompt = 'cats & dogs: 100% friends?';
    const url = buildImageUrl({ prompt });

    expect(url).toContain(encodeURIComponent(prompt));
    // Raw unsafe characters must not appear in the path
    const path = url.split('?')[0];
    expect(path).not.toContain('&');
    expect(path).not.toContain('?');
    expect(path).not.toContain(' ');
  });

  it('throws on an empty or whitespace-only prompt', () => {
    expect(() => buildImageUrl({ prompt: '' })).toThrow(/prompt/i);
    expect(() => buildImageUrl({ prompt: '   ' })).toThrow(/prompt/i);
  });
});
