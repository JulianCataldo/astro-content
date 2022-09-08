import type { AstroIntegration } from 'astro';
/* ·········································································· */
import {
  log,
  setLogLevel,
  getCurrentLevel,
} from '@astro-content/server/logger';
import { collect } from '@astro-content/server/collect';
import type { Settings } from '@astro-content/types/integration';
/* ·········································································· */
import { serverSetup } from './server-setup';
import { configSetup } from './config-setup';
import { buildDone, buildStart } from './build';
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

export default astroContent;
export { collect };
