
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Zorg dat process.env altijd een object is, zelfs als variabelen ontbreken
    'process.env': JSON.stringify(process.env || {})
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
