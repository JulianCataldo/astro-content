import { defineConfig } from 'astro/config';
/* ·········································································· */
import content from 'astro-content';
/* —————————————————————————————————————————————————————————————————————————— */

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  server: {
    port: 3000,
    host: true,
  },
  integrations: [
    content({
      // logLevel: "debug",
      // gui: true
      // previewUrl: '/'
    }),
  ],
});
