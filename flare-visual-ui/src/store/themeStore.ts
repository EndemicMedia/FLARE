/**
 * Theme Store
 * 
 * Manages dark/light mode theme state with localStorage persistence.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
}

/**
 * Resolve the actual theme based on system preference
 */
function getResolvedTheme(theme: Theme): 'light' | 'dark' {
    if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
}

/**
 * Apply theme to document
 */
function applyTheme(resolvedTheme: 'light' | 'dark') {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: 'light',
            resolvedTheme: 'light',

            setTheme: (theme) => {
                const resolvedTheme = getResolvedTheme(theme);
                applyTheme(resolvedTheme);
                set({ theme, resolvedTheme });
            },
        }),
        {
            name: 'flare-theme',
            onRehydrateStorage: () => (state) => {
                // Apply theme on rehydration
                if (state) {
                    const resolvedTheme = getResolvedTheme(state.theme);
                    state.resolvedTheme = resolvedTheme;
                    applyTheme(resolvedTheme);
                }
            },
        }
    )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
    const theme = useThemeStore.getState().theme;
    const resolvedTheme = getResolvedTheme(theme);
    useThemeStore.setState({ resolvedTheme });
    applyTheme(resolvedTheme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        const currentTheme = useThemeStore.getState().theme;
        if (currentTheme === 'system') {
            const resolvedTheme = e.matches ? 'dark' : 'light';
            useThemeStore.setState({ resolvedTheme });
            applyTheme(resolvedTheme);
        }
    });
}
