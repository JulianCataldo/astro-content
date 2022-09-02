/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'astro/config';
/* ·········································································· */
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import content from 'astro-content';

/* —————————————————————————————————————————————————————————————————————————— */

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  server: {
    port: 9054,
    host: true,
  },
  integrations: [
    // v————— Base: CLI + Server
    content(),
    // v————— (Optional) For GUI
    react(),
    mdx(),
  ],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @use "./src/vars" as *;
        `,
        },
      },
    },
  },
});
