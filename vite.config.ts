import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    // Optimize for Electron
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure Chart.js and other libs are properly bundled
    commonjsOptions: {
      include: [/chart\.js/, /framer-motion/, /node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        // Manual chunking to prevent issues
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart': ['chart.js', 'react-chartjs-2'],
          'motion': ['framer-motion'],
          'ui': ['lucide-react']
        }
      }
    }
  },
  optimizeDeps: {
    // Force pre-bundle these dependencies
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'chart.js',
      'react-chartjs-2',
      'framer-motion',
      'lucide-react',
      '@supabase/supabase-js'
    ],
    // Ensure ES modules are handled correctly
    esbuildOptions: {
      target: 'esnext'
    }
  }
})
