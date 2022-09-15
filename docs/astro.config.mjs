/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'astro/config';
/* ·········································································· */
import react from '@astrojs/react';
// import mdx from '@astrojs/mdx';
import image from '@astrojs/image';
import content from 'astro-content';
/* —————————————————————————————————————————————————————————————————————————— */

// https://astro.build/config
export default defineConfig({
  site: 'https://astro-content.netlify.app',
  server: {
    port: 9054,
    host: true,
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  integrations: [
    react(),
    // mdx(),
    content({
      //
      // logLevel: 'debug',
      // gui: false,
    }),
    // ——————————————————————————————————————
    image(),
  ],

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // TODO: add sass:colors and vars (not working 'cause dup. bug)
          // additionalData: `@use "./src/vars" as *;`,
        },
      },
    },
  },
});
