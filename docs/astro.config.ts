/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'astro/config';
/* ·········································································· */
// import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';
// import mdx from '@astrojs/mdx';
import image from '@astrojs/image';
import content from 'astro-content';
import remarkMermaid from 'astro-diagram/remark-mermaid';
// import sassDts from 'vite-plugin-sass-dts';

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
      remarkMermaid,
      remarkGfm,
    ],
  },

  vite: {
    css: {
      modules: {
        // generateScopedName: '__[hash:base64:5]',
        localsConvention: 'camelCase',
      },
      //   preprocessorOptions: {
      //     scss: {
      //       // TODO: add sass:colors and vars (not working 'cause dup. bug)
      //       additionalData: `@use '/src/vars' as *;`,
      //     },
      //   },
    },
    ssr: {
      external: ['svgo'],
    },

    // build: {
    //   rollupOptions: { external: ['@wbmnky/license-report-generator'] },
    // },

    optimizeDeps: {
      include: [
        '@rjsf/core',
        '@rjsf/validator-ajv6',
        // 'leaflet',
        // '@rjsf/utils',
        // 'react-is'
      ],
    },

    plugins: [
      // sassDts({
      //   enabledMode: ['development', 'production'],
      //   global: {
      //     generate: true,
      //     outFile: path.resolve(process.cwd(), './src/style.d.ts'),
      //   },
      // }),
    ],
    // css: {
    //   preprocessorOptions: {
    //     scss: {
    //       additionalData: `@use "@/styles" as common;`,
    //       importer(...args) {
    //         if (args[0] !== '@/styles') {
    //           return;
    //         }

    //         return {
    //           file: `${path.resolve(process.cwd(), './src/layouts')}`,
    //         };
    //       },
    //     },
    //   },
    // },
  },
});
