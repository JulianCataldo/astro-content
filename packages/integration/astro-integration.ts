import type { AstroIntegration } from 'astro';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import remarkEmbed, { Settings as RemarkEmbedSettings } from 'remark-embed';
import remarkGfm from 'remark-gfm';
/* ·········································································· */
import {
  log,
  setLogLevel,
  getCurrentLevel,
} from '@astro-content/server/logger';
import { collect } from '@astro-content/server/collect';
import type { Settings } from '@astro-content/types/integration';
/* ·········································································· */
import { serverSetup } from './server-setup.js';
import { configSetup } from './config-setup.js';
import { buildDone, buildStart } from './build.js';
/* —————————————————————————————————————————————————————————————————————————— */

const astroContent = (settings?: Settings): AstroIntegration => {
  if (settings?.logLevel) setLogLevel(settings.logLevel);
  const currentLevel = getCurrentLevel();
  // Available in SSR / Client
  process.env.PUBLIC_LOG_LEVEL = currentLevel;

  log(`Integration loaded — Log level: ${currentLevel}`, 'info', 'pretty');
  log('1 >>> infos', 'info');
  log('2 >>> debug');
  log('3 >>> absurd', 'absurd');

  return {
    name: 'astro-content',

    hooks: {
      /* Stateful routes + Project setup */
      'astro:config:setup': configSetup,

      /* Stateless functions for web API */
      'astro:server:setup': serverSetup,

      // NOTE: Statically building the editor is a funny way to demonstrate it,
      // it is NOT supposed to be used in production by end-user.
      // NO GUARANTEE ABOUT LOCAL DATA BEING LEAKED (e.g. Absolute local paths).
      'astro:build:start': buildStart,
      'astro:build:done': buildDone,
    },
  };
};

/* ·········································································· */

export default function preset(settings: Settings = {}): AstroIntegration[] {
  const userSettings = settings;
  if (settings.gui === undefined) {
    userSettings.gui = true;
  }
  if (settings.includeInBuild === undefined) {
    userSettings.includeInBuild = false;
  }
  const command = process.argv[2] === 'dev' ? 'dev' : 'build';

  if (command === 'dev' && userSettings.gui) {
    process.env.HAS_GUI = 'true';
  } else if (
    command === 'build' &&
    userSettings.gui &&
    userSettings.includeInBuild
  ) {
    process.env.HAS_GUI = 'true';
  } else {
    process.env.HAS_GUI = 'false';
  }

  const integrations = [
    // NOTE: Monitor for side-effects when user already use `@astrojs/mdx`.
    mdx({
      remarkPlugins: [
        [remarkEmbed, { logLevel: 'info' } as RemarkEmbedSettings],
        remarkGfm,
      ],
    }),
    astroContent(userSettings),
  ];
  if (process.env.HAS_GUI === 'true') {
    // NOTE: Monitor for side-effects when user already use `@astrojs/react`.
    // If so, a `settings.includeReact` boolean might be added.
    integrations.push(react());
  }
  // FIXME: Need explicit return type, why?
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return integrations;
}
export { collect };
/* ·········································································· */
export type { Options } from '@astro-content/types/integration';
export type { FileInstance, YamlInstance } from '@astro-content/types/file';
