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
            // React Core
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react'
            }

            // Material Tailwind (UI)
            if (id.includes('@material-tailwind')) {
              return 'vendor-material'
            }

            // Framer Motion (Animation)
            if (id.includes('framer-motion')) {
              return 'vendor-framer'
            }

            // Icons
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }

            // Data Management
            if (id.includes('@tanstack')) {
              return 'vendor-tanstack'
            }
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'vendor-forms'
            }

            // Charts
            if (id.includes('recharts')) {
              return 'vendor-charts'
            }

            // Excel Generation
            if (id.includes('xlsx')) {
              return 'vendor-excel'
            }

            // PDF Generation
            if (id.includes('jspdf')) {
              return 'vendor-pdf'
            }

            // HTTP & Utils
            if (id.includes('axios') || id.includes('sweetalert2')) {
              return 'vendor-utils'
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
