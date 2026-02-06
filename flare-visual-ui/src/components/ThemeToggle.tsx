/**
 * Theme Toggle Component
 * 
 * Provides a button to toggle between light/dark themes.
 */

import { memo } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useThemeStore } from '../store/themeStore';

// Prevent drag from blocking button clicks
const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

export const ThemeToggle = memo(function ThemeToggle() {
    const { theme, resolvedTheme, setTheme } = useThemeStore();

    const toggleTheme = () => {
        const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    return (
        <button
            onClick={toggleTheme}
            onMouseDown={stopPropagation}
            className="theme-toggle-button"
            title={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
            aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
        >
            {resolvedTheme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>
    );
});
