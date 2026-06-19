/**
 * API key management (BYOP — Bring Your Own Pollinations key).
 * Resolution order: URL hash '#api_key=...' → localStorage 'flareApiKey' → shared default key.
 * Mirrors the pattern used in llm-comparison-tool/index.html.
 */

const STORAGE_KEY = 'flareApiKey';

/** Shared default key (intentionally public, per project decision). */
export const DEFAULT_API_KEY = 'sk_EnngsXCASw0kBiuso2zekJuhIxS1l0sB';

function hasBrowserStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Get the API key to use for Pollinations requests.
 * If a key is present in the URL hash (#api_key=...), it is persisted to
 * localStorage and the hash is cleaned, like the llm-comparison-tool.
 */
export function getApiKey(): string {
  if (typeof window !== 'undefined') {
    // 1. URL hash (BYOP redirect)
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const hashApiKey = hashParams.get('api_key');
    if (hashApiKey) {
      if (hasBrowserStorage()) {
        window.localStorage.setItem(STORAGE_KEY, hashApiKey);
      }
      // Clean the key from the URL
      window.location.hash = '';
      return hashApiKey;
    }

    // 2. localStorage (user-provided key)
    if (hasBrowserStorage()) {
      const storedKey = window.localStorage.getItem(STORAGE_KEY);
      if (storedKey) {
        return storedKey;
      }
    }
  }

  // 3. Shared default key
  return DEFAULT_API_KEY;
}

/** Persist a user-provided API key (used by the settings modal). */
export function setApiKey(key: string): void {
  if (!hasBrowserStorage()) return;
  const trimmed = key.trim();
  if (trimmed) {
    window.localStorage.setItem(STORAGE_KEY, trimmed);
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

/** Remove the user-provided API key, reverting to the shared default. */
export function clearApiKey(): void {
  if (!hasBrowserStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/** True when no user key is configured and the shared default key is in use. */
export function isUsingDefaultKey(): boolean {
  return getApiKey() === DEFAULT_API_KEY;
}
