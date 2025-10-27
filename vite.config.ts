import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for external dependencies
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            if (id.includes('@mui/material') || id.includes('@mui/icons-material')) {
              return 'mui-vendor';
            }
            if (id.includes('lodash')) {
              return 'utils-vendor';
            }
            // Other vendor dependencies
            return 'vendor';
          }

          // App chunks for our code
          if (id.includes('/src/services/')) {
            return 'services';
          }
          if (id.includes('/src/components/')) {
            return 'components';
          }
          if (id.includes('/src/hooks/')) {
            return 'hooks';
          }
          if (id.includes('/src/utils/') || id.includes('/src/constants/')) {
            return 'utils';
          }
          if (id.includes('/src/config/')) {
            return 'config';
          }
        },
      },
    },
    // Optimize chunks
    chunkSizeWarningLimit: 300,
    // Enable tree shaking
    target: 'modules',
    // Minify with terser for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Development optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@mui/material',
      '@mui/icons-material',
    ],
  },
})
