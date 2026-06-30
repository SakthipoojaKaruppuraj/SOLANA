import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env': {},
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@solana/web3.js') || id.includes('@solana/buffer-layout')) {
              return 'solana-web3';
            }
            if (id.includes('@anchor-lang/core') || id.includes('@coral-xyz/anchor') || id.includes('borsh') || id.includes('buffer')) {
              return 'anchor';
            }
            if (id.includes('@solana/wallet-adapter-base') || id.includes('@solana/wallet-adapter-react')) {
              return 'solana-wallets';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-core';
            }
            return 'vendor';
          }
        },
      },
    },
  },
})

