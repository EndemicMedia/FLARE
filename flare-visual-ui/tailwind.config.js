import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    path.resolve(__dirname, './index.html'),
    path.resolve(__dirname, './src/**/*.{js,ts,jsx,tsx}'),
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'node-idle': '#94a3b8',
        'node-loading': '#3b82f6',
        'node-completed': '#22c55e',
        'node-error': '#ef4444'
      }
    }
  },
  plugins: []
}

