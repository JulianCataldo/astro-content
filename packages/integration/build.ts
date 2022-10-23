import type { AstroIntegration } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
/* ·········································································· */
import { endpoints } from '@astro-content/server/state';
import { log } from '@astro-content/server/logger';
import type { ServerState, Endpoint } from '@astro-content/types/server-state';
/* —————————————————————————————————————————————————————————————————————————— */

// TODO: Centralize `tempDir`
const tempDir = path.join(process.cwd(), '.astro-content');

const buildStart: AstroIntegration['hooks']['astro:build:start'] =
  async () => {};

const buildDone: AstroIntegration['hooks']['astro:build:done'] = async () => {
  log(`Build done`);

  if (process.env.HAS_GUI === 'true') {
    // REFACTOR: Even if it's not supposed to be used by end user (yet?)

    // NOTE: We are saving / loading current state to files,
    // otherwise it will get erased.
    // IDEA: Test the new `astro:build:generated` hook maybe?
    await fs
      .readFile(path.join(tempDir, 'state.json'), 'utf-8')
      .then(async (data: unknown) => {
        if (typeof data === 'string') {
          const obj = JSON.parse(data) as ServerState;

          if (typeof obj === 'object') {
            return Promise.all(
              Object.entries(obj).map(async ([key]) => {
                const dest = path.join(
                  process.cwd(),
                  `dist${endpoints.apiBase}/${key}`,
                );

                return fs
                  .writeFile(dest, JSON.stringify(obj[key as Endpoint]))
                  .catch((e) => log(e));
              }),
            );
          }
        }
        return null;
      });
  }
};

export { buildStart, buildDone };
