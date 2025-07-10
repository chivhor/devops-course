import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Output directory
    outDir: 'dist', // Default build folder

    // Folder for assets
    assetsDir: 'assets',

    // Minification for production
    minify: 'esbuild', // Use esbuild for faster minification

    // Enable source maps for debugging, disable for production
    sourcemap: false, // Disable for better performance in production

    // Optimize CSS (code splitting)
    cssCodeSplit: true,

    // Split the code for better caching
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js', // Cache busting for JavaScript files
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]', // Cache busting for static assets
      },
    },

    future: {
      hoverOnlyWhenSupported: true,
    }

    // Target modern browsers for better performance and smaller bundle size
    // target: 'esnext', // Modern browsers
  },
})
