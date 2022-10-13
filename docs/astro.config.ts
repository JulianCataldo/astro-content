/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'astro/config';
/* ·········································································· */
// import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';
// import mdx from '@astrojs/mdx';
import image from '@astrojs/image';
import content from 'astro-content';
import mdxMermaidPlugin from '@julian_cataldo/astro-diagram';
/* —————————————————————————————————————————————————————————————————————————— */

import remarkEmbed, {
  type Settings as RemarkEmbedSettings,
} from 'remark-embed';
import remarkGfm from 'remark-gfm'; // import remarkMermaid from 'remark-mermaidjs';
// FIXME: Sometimes, everything goes havoc during heavy dev. of AC sources
// Here is a reminder: don't fiddle, just nuke the docs node_modules.
// FIXME: MDX errors, for now, are all silent. Bad thing.

// https://astro.build/config
export default defineConfig({
  site: 'https://astro-content.dev',
  server: {
    port: 9054,
    host: true,
  },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  integrations: [
    // react(),
    // mdx(),
    content({
      //
      logLevel: 'debug', // gui: false,
    }), // ——————————————————————————————————————
    image({
      serviceEntryPoint: '@astrojs/image/sharp',
    }),
    // TODO: 1. Try mermaid with MDX
    // TODO: 2. Try embedding it in Astro Content / Or let user control this?
    // TODO: 3. Monitor any conflict when user has its own pipeline (merge?)
    // mdx({ remarkPlugins: [mdxMermaidPlugin] }),
    sitemap({
      filter: (page) => !page.includes('/__content/api/~render/'),
    }),
  ],
  // TODO: Try to embed it by default with Astro Content
  markdown: {
    remarkPlugins: [
      // () => () => {},
      [
        remarkEmbed,
        {
          logLevel: 'info',
        } as RemarkEmbedSettings,
      ],
      // [remarkMermaid, { launchOptions: { args: ['--no-sandbox'] } }],
      mdxMermaidPlugin,
      remarkGfm,
    ],
  }, // vite: {
  //   css: {
  //     preprocessorOptions: {
  //       scss: {
  //         // TODO: add sass:colors and vars (not working 'cause dup. bug)
  //         // additionalData: `@use "./src/vars" as *;`,
  //       },
  //     },
  //   },
  // },
});
