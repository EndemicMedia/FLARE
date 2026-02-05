# 7. Dependencies & Setup

## 7.1 Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "reactflow": "^11.10.0",
    "zustand": "^4.4.0",
    "axios": "^1.4.0",
    "@tailwindcss/forms": "^0.5.3"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "vite": "^4.4.0",
    "vitest": "^0.34.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "eslint": "^8.45.0",
    "prettier": "^3.0.0",
    "tailwindcss": "^3.3.0"
  }
}
```

## 7.2 Installation Steps

```bash
# Create new React app with Vite
npm create vite@latest flare-visual-ui -- --template react-ts

cd flare-visual-ui

# Install dependencies
npm install reactflow zustand axios

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install testing libraries
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Install ESLint and Prettier
npm install -D eslint prettier eslint-config-prettier eslint-plugin-react

# Start development server
npm run dev
```

## 7.3 Environment Configuration

```bash
# .env.local
REACT_APP_FLARE_API_URL=http://localhost:8080
REACT_APP_ENABLE_DEBUG=true
REACT_APP_MAX_NODES=100
```
