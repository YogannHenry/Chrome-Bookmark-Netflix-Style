import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { writeFileSync, mkdirSync, copyFileSync } from 'fs';

// Custom plugin to copy manifest and icons
const copyManifest = () => {
  return {
    name: 'copy-manifest',
    writeBundle: () => {
      // Ensure icons directory exists
      mkdirSync(resolve(__dirname, 'dist/icons'), { recursive: true });
      
      // Copy manifest.json
      copyFileSync(
        resolve(__dirname, 'manifest.json'),
        resolve(__dirname, 'dist/manifest.json')
      );
      
      // Create placeholder icons (you'll want to replace these with real icons)
      const sizes = [16, 48, 128];
      sizes.forEach(size => {
        writeFileSync(
          resolve(__dirname, `dist/icons/icon${size}.png`),
          Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==', 'base64')
        );
      });
    }
  };
};

export default defineConfig({
  plugins: [react(), copyManifest()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});