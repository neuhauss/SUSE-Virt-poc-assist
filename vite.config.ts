import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // This is crucial for GitHub Pages. 
  // It ensures assets use relative paths (e.g. "./assets/index.js" instead of "/assets/index.js")
  base: './', 
})