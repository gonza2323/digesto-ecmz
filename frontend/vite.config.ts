import path from 'node:path'
import react from '@vitejs/plugin-react'
import {defineConfig} from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(import.meta.dirname, './src'),
        },
    },
    server: {
        port: 5173,
    },
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        css: false,
    },
})
