import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages serves this project from /Vayntr-Talent/, not the domain root.
export default defineConfig({
  base: '/Vayntr-Talent/',
  plugins: [react()],
  server: {
    allowedHosts: ['pv-95531e006c57-12d2d5a4-2a05-46c3-994a-e8849c846cf8.style.dev'],
  },
  preview: {
    allowedHosts: ['pv-95531e006c57-12d2d5a4-2a05-46c3-994a-e8849c846cf8.style.dev'],
  },
})
