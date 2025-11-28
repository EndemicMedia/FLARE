/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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

