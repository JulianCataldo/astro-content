import type { AstroIntegration } from 'astro';
/* ·········································································· */
import { log } from '@astro-content/server/logger';
/* ·········································································· */
import { saveTsHelper } from '@astro-content/server/collect';
import ViteYaml from './load-yaml-plugin';
/* —————————————————————————————————————————————————————————————————————————— */
// FIXME: Find a more elegant way to import than a sub `node_modules`
// It crash if put in `gui` package (deps. resolution probably)
const guiPath = './node_modules/astro-content/node_modules/@astro-content/gui';

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
