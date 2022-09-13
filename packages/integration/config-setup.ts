import { existsSync } from 'fs';
import type { AstroIntegration } from 'astro';
// import Inspect from 'vite-plugin-inspect';
/* ·········································································· */
import { log } from '@astro-content/server/logger';
/* ·········································································· */
import { saveTsHelper } from '@astro-content/server/collect';
import { endpoints } from '@astro-content/server/state';
import ViteYaml from './load-yaml-plugin';
/* —————————————————————————————————————————————————————————————————————————— */
// FIXME: Find a more elegant way to import than a sub `node_modules`
// It crash if put in `gui` package (deps. resolution probably)
const guiPath = './node_modules/@astro-content/gui';

const configSetup: AstroIntegration['hooks']['astro:config:setup'] = ({
  injectRoute,
  updateConfig,
  config,
}) => {
  log(`
📚  astro-content — ⚠️ ALPHA PREVIEW ⚠️

┃ Local    http://localhost:${config.server.port}/__content
┃ Network  http://0.0.0.0:${config.server.port}/__content
  `);

  log(config, 'absurd');

  /* Inject YAML import + metadata within `Astro.glob()` */
  updateConfig({
    vite: {
      plugins: [
        //
        ViteYaml(),
        // TODO: Try it (not working)
        // Inspect({
        //   // build: true,
        //   outputDir: '.vite-inspect',
        // }),
      ],
      server: {
        watch: {
          ignored: [
            // TODO: Prevent auto-refresh when saving on editor GUI
            // '**/content/**',
            '**/.astro-content/**',
            '**/content/index.ts',
          ],
        },
      },
    },
  });

  /* Inject stateful routes (share same state as all Astro SSR pages) */

  /* Check if `@astro-content/gui` is properly installed */
  if (existsSync(`${guiPath}/package.json`)) {
    injectRoute({
      pattern: `${endpoints.apiBase}/[endpoint]`,
      entryPoint: `${guiPath}/server-bridge.json.ts`,
    });
    injectRoute({
      pattern: endpoints.contentBase,
      entryPoint: `${guiPath}/ssr-entrypoint.astro`,
    });
  }

  injectRoute({
    pattern: endpoints.actions.refresh,
    entryPoint: `./node_modules/astro-content/trigger-transform.astro`,
  });

  /* Init minimal import helper */
  saveTsHelper().catch(() => null);
};

export { configSetup };
