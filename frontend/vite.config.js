import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split React core libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor'
            }

            // Large UI libraries
            if (id.includes('@material-tailwind') || id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'ui-vendor'
            }

            // Data/State management libraries
            if (id.includes('@tanstack/react-query') || id.includes('@tanstack/react-table') ||
                id.includes('react-hook-form') || id.includes('zod')) {
              return 'data-vendor'
            }

            // Charts
            if (id.includes('recharts')) {
              return 'charts-vendor'
            }

            // File generation libraries
            if (id.includes('jspdf') || id.includes('xlsx')) {
              return 'file-vendor'
            }

            // HTTP and utilities
            if (id.includes('axios') || id.includes('sweetalert2')) {
              return 'utils-vendor'
            }

            // All other node_modules
            return 'vendor'
          }
        },
      },
    },
    // Increase chunk size warning limit to 1000kb (optional - only warnings will be reduced)
    chunkSizeWarningLimit: 1000,
  },
})
