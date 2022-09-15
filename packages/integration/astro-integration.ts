import type { AstroIntegration } from 'astro';
import react from '@astrojs/react';
// import mdx from '@astrojs/mdx';
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
      'astro:config:setup': configSetup,

      'astro:server:setup': serverSetup,

      'astro:build:start': buildStart,
      'astro:build:done': buildDone,
    },
  };
};

/* ·········································································· */
export default function preset(settings: Settings = {}) {
  const userSettings = settings;
  if (settings.gui === undefined) {
    userSettings.gui = true;
  }

  const integrations = [
    // TODO: Fit MDX here (is it headless)?
    // mdx(),
    astroContent(userSettings),
  ];
  if (userSettings.gui === true) {
    // NOTE: Monitor for side-effects when user already use `@astrojs/react`.
    // If so, a `settings.includeReact` might be added.
    integrations.push(react());
  }
  return integrations;
}
export { collect };
/* ·········································································· */
export type { Options } from '@astro-content/types/integration';
export type { FileInstance } from '@astro-content/types/file';
