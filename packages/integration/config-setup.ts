import fs from 'fs/promises';
import { existsSync } from 'fs';
import { bold, green } from 'kleur/colors';
import type { AstroIntegration } from 'astro';
import mkdirp from 'mkdirp';
import path from 'node:path';
// NOTE: This is a ponyfill for `import.meta.resolve`, `require.resolve` equiv.
import { resolve } from 'import-meta-resolve';
import { fileURLToPath } from 'node:url';
// import Inspect from 'vite-plugin-inspect';
/* ·········································································· */
import { log } from '@astro-content/server/logger';
/* ·········································································· */
import { saveTsHelper } from '@astro-content/server/collect';
import { endpoints } from '@astro-content/server/state';
import ViteYaml from './load-yaml-plugin.js';
// import ViteJsonc from './load-jsonc-plugin.js';
/* —————————————————————————————————————————————————————————————————————————— */

const guiPath = path.dirname(
  fileURLToPath(
    await resolve('@astro-content/gui/package.json', import.meta.url),
  ),
);
// NOTE: One level above `dist`. The `astro-content/package.json`
//  trick is just working with `require.resolve`, unfortunately —————v
const integrationPath = fileURLToPath(await resolve('../', import.meta.url));
const tempDir = path.join(process.cwd(), '.astro-content');

/* ·········································································· */

const configSetup: AstroIntegration['hooks']['astro:config:setup'] = async ({
  injectRoute,
  updateConfig,
  config,
}) => {
  // FIX: Server port is from user config, not actual dev. server
  // This means that it can be wrong if port is already used and incremented.
  log(
    `
  📚  astro-content — ⚠️ ALPHA PREVIEW ⚠️
  
  ┃ Local    http://localhost:${config.server.port}/__content
  ┃ Network  http://0.0.0.0:${config.server.port}/__content
  `,
    'info',
  );

  log(config, 'absurd');

  /* Inject YAML import + metadata within `Astro.glob()` */
  updateConfig({
    vite: {
      plugins: [
        //
        ViteYaml(),
        // TODO: Align JSON with MD and YAML: override default loader
        // ViteJsonc(),
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
      // NOTE: I've fiddled a good amount of time to find this,
      // and I still don't know why this works.
      // > When package is distributed (not in workspace),
      // Vite was prefixing modules + loading them as CJS,
      // maybe because of some nested peer, loaded with a wrong old CJS version.
      // Adding this force 'untouched' module resolution.
      // > Might monitor side-effects.
      // https://vitejs.dev/config/dep-optimization-options.html#optimizedeps-exclude
      optimizeDeps: {
        include: ['react-split', 'zustand', 'classnames', 'prop-types'],
      },
    },
  });

  /* Inject stateful routes (share same state as all Astro SSR pages) */

  // TODO: Apply option to omit all GUI-related stuff
  // if () {
  injectRoute({
    pattern: path.join(endpoints.apiBase, '[endpoint]'),
    entryPoint: path.join(integrationPath, 'server-bridge.json.ts'),
  });
  injectRoute({
    pattern: endpoints.contentBase,
    entryPoint: path.join(guiPath, 'ssr-entrypoint.astro'),
  });
  injectRoute({
    pattern: path.join(endpoints.actions.render, '[...file]'),
    entryPoint: path.join(guiPath, 'preview-markdown.astro'),
  });
  injectRoute({
    pattern: endpoints.actions.refresh,
    entryPoint: path.join(integrationPath, 'trigger-transform.astro'),
  });
  // }

  /* Setup project */
  log(tempDir);
  await mkdirp(tempDir).catch(() => null);

  const minimalTypes = `export interface Entities {}`;
  await fs.writeFile(path.join(tempDir, 'types.ts'), minimalTypes);

  if (existsSync(`${process.cwd()}/content`)) {
    /* Init minimal import helper */
    saveTsHelper().catch(() => null);
  } else {
    const setupCommand = bold(green('pnpm content setup'));
    log(
      `Content base does not exist!\n` +
        `         ℹ️  Please run \`${setupCommand}\` in project root.\n`,
      'info',
      'pretty',
    );
  }
};

export { configSetup };
