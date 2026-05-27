import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Points to the local copy of the json_to_ui source
      '@lib': path.resolve(__dirname, 'src/lib'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      onwarn(warning, warn) {
        // suppress "use client" directive warnings from MUI
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
        warn(warning)
      },
    },
  },
  server: {
    port: 5173,
    // Proxy API calls to the backend server
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@jsonforms/react', '@jsonforms/core'],
  },
})
