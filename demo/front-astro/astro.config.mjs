import { defineConfig } from 'astro/config';
import nodeJs from '@astrojs/node';
/* ·········································································· */
import image from '@astrojs/image';
// import vue from '@astrojs/vue';
// import react from '@astrojs/react';
/* —————————————————————————————————————————————————————————————————————————— */

export default defineConfig({
  site: 'https://example.com',
  server: {
    port: 9054,
    host: true,
  },
  output: 'server',
  adapter: nodeJs(),
  integrations: [
    // vue(),
    // react(),
    image(),
  ],
});
