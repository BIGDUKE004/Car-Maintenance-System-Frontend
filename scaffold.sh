#!/bin/bash
set -e

echo "Scaffolding frontend in the current directory..."

mkdir -p public src/lib src/services src/context src/components/ds src/components/layout src/components/forms src/pages/public src/pages/customer src/pages/admin

# --- Config Files ---
cat > .env.example << 'FILE'
VITE_API_BASE_URL=https://car-maintenance-system-5f6u.onrender.com
FILE

cat > .gitignore << 'FILE'
node_modules
dist
.env
.env.local
*.log
.DS_Store
FILE

cat > package.json << 'FILE'
{
  "name": "car-maintenance-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.59.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.27.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.2",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "typescript": "^5.6.2",
    "vite": "^5.4.8"
  }
}
FILE

cat > tsconfig.json << 'FILE'
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src"]
}
FILE

cat > tsconfig.node.json << 'FILE'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
FILE

cat > vite.config.ts << 'FILE'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: 5173 }
})
FILE

cat > postcss.config.js << 'FILE'
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
FILE

cat > tailwind.config.ts << 'FILE'
import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#05080f', 900: '#0B1220', 800: '#111a2e', 700: '#18233c' },
        surface: { 900: '#0e1729', 800: '#142036', 700: '#1b2a44' },
        cyan: { DEFAULT: '#38E1FF', 400: '#5ae8ff', 600: '#0fb8d4' },
        teal: { DEFAULT: '#2dd4bf', 600: '#14b8a6' },
        slate: { 300: '#c2ccdc', 400: '#94a3b8', 500: '#64748b' },
        amber: { DEFAULT: '#f5a524', 600: '#d9860f' },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(56,225,255,0.25), 0 0 24px -6px rgba(56,225,255,0.35)',
      },
      transitionTimingFunction: {
        'out-quint': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config
FILE

cat > index.html << 'FILE'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0B1220" />
    <title>Motora — Vehicle Maintenance, Documented</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  </head>
  <body class="bg-ink-900 text-slate-300 font-body">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
FILE

# --- SRC FILES ---
echo "Creating src files..."
cat > src/vite-env.d.ts << 'FILE'
/// <reference types="vite/client" />
interface ImportMetaEnv { readonly VITE_API_BASE_URL: string }
interface ImportMeta { readonly env: ImportMetaEnv }
FILE

cat > src/index.css << 'FILE'
@import './lib/tokens.css';
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { color-scheme: dark; }
  body { @apply bg-ink-900 text-slate-300 antialiased; font-feature-settings: "tnum" 1; }
  :focus-visible { @apply outline-none ring-2 ring-cyan ring-offset-2 ring-offset-ink-900 rounded; }
}
@layer utilities {
  .text-tabular { font-variant-numeric: tabular-nums; }
  .glass {
    background: linear-gradient(180deg, rgba(20,32,54,0.72), rgba(14,23,41,0.85));
    backdrop-filter: blur(10px);
    border: 1px solid rgba(148,163,184,0.14);
  }
}
FILE

cat > src/lib/tokens.css << 'FILE'
:root {
  --ink-950: #05080f; --ink-900: #0B1220; --ink-800: #111a2e; --ink-700: #18233c;
  --surface-900: #0e1729; --surface-800: #142036; --surface-700: #1b2a44;
  --cyan: #38E1FF; --cyan-400: #5ae8ff; --cyan-600: #0fb8d4;
  --teal: #2dd4bf; --slate-300: #c2ccdc; --slate-400: #94a3b8;
  --amber: #f5a524; --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}
FILE

cat > src/lib/jwt.ts << 'FILE'
export interface JwtPayload { sub: string; role: 'CUSTOMER' | 'WORKSHOP_ADMIN'; exp: number }
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.')
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as JwtPayload
  } catch { return null }
}
FILE

cat > src/lib/format.ts << 'FILE'
export const ngn = (v: string | number | null | undefined): string => {
  const n = typeof v === 'string' ? Number(v) : v ?? 0
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(n)
}
export const date = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: '2-digit' })
}
export const dateTime = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-NG', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}
export const initials = (first?: string, last?: string) => `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?'
FILE

cat > src/lib/transitions.ts << 'FILE'
import type { MaintenanceStatus } from '@/services/types'
export const ALLOWED_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  PENDING: ['ACCEPTED'], ACCEPTED: ['INSPECTING'], INSPECTING: ['AWAITING_APPROVAL', 'IN_PROGRESS'],
  AWAITING_APPROVAL: ['IN_PROGRESS'], IN_PROGRESS: ['COMPLETED'], COMPLETED: [], CANCELED: [],
}
export const STATUS_ORDER: MaintenanceStatus[] = ['PENDING', 'ACCEPTED', 'INSPECTING', 'AWAITING_APPROVAL', 'IN_PROGRESS', 'COMPLETED']
export const STATUS_LABEL: Record<MaintenanceStatus, string> = {
  PENDING: 'Received', ACCEPTED: 'Accepted', INSPECTING: 'Inspecting',
  AWAITING_APPROVAL: 'Awaiting approval', IN_PROGRESS: 'In progress', COMPLETED: 'Ready', CANCELED: 'Canceled',
}
FILE

cat > src/lib/constants.ts << 'FILE'
export const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) ?? 'http://localhost:8000'
export const TOKEN_KEY = 'motora.token'
FILE

echo "Done. Files created. You can now run npm install."
