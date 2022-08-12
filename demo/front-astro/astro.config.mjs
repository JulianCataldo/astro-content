/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'astro/config';
import nodeJs from '@astrojs/node';
/* ·········································································· */
import vue from '@astrojs/vue';
import react from '@astrojs/react';
/* —————————————————————————————————————————————————————————————————————————— */

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  server: {
    port: 9054,
    host: true,
  },
  output: 'server',
  adapter: nodeJs(),
  integrations: [vue(), react()],
});
