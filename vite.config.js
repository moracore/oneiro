import { defineConfig } from 'vite';
import react            from '@vitejs/plugin-react';
import { VitePWA }      from 'vite-plugin-pwa';

export default defineConfig({
  base: '/oneiro/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name:             'Oneiro',
        short_name:       'Oneiro',
        description:      'Procedural world generation for tabletop RPGs',
        theme_color:      '#0f0f1a',
        background_color: '#0f0f1a',
        display:          'standalone',
        orientation:      'any',
        start_url:        '/oneiro/',
        icons: [
          {
            src:   'icons/icon-192.png',
            sizes: '192x192',
            type:  'image/png',
          },
          {
            src:   'icons/icon-512.png',
            sizes: '512x512',
            type:  'image/png',
          },
          {
            src:     'icons/icon-512.png',
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Cache all assets so the app works fully offline
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
});
