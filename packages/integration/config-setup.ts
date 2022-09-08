import type { AstroIntegration } from 'astro';
/* ·········································································· */
import { log } from '@astro-content/server/logger';
/* ·········································································· */
import { saveTsHelper } from '@astro-content/server/collect';
import ViteYaml from './load-yaml-plugin';
/* —————————————————————————————————————————————————————————————————————————— */

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
      plugins: [ViteYaml()],
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
  injectRoute({
    pattern: '__content/api/[endpoint]',
    entryPoint: './node_modules/astro-content/server-api.json.ts',
  });
  injectRoute({
    pattern: '/__content',
    // IDEA: Could be optional (install GUI / CLI as separate package?)
    // FIXME: Find a more elegant way to import than a sub `node_modules`
    // It crash if put in `gui` package (deps. resolution probably)
    entryPoint:
      './node_modules/astro-content/node_modules/@astro-content/gui/ssr-entrypoint.astro',
  });

  /* Init minimal import helper */
  saveTsHelper().catch(() => null);
};

export { configSetup };