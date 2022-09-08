import type { AstroIntegration } from 'astro';
import mkdirp from 'mkdirp';
import fs from 'node:fs/promises';
import path from 'node:path';
/* ·········································································· */
import { log } from '@astro-content/server/logger';
import type { ServerState, Endpoint } from '@astro-content/types/server-state';
/* —————————————————————————————————————————————————————————————————————————— */

const tempDir = path.join(process.cwd(), '.astro-content');

const buildStart: AstroIntegration['hooks']['astro:build:start'] = async () => {
  log(tempDir);
  await mkdirp(tempDir);
};

const buildDone: AstroIntegration['hooks']['astro:build:done'] = async () => {
  log(`Build done`);

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
                `dist/__content/api/${key}`,
              );

              return fs
                .writeFile(
                  dest,
                  // FIXME: key of ServerState
                  JSON.stringify(obj[key as Endpoint]),
                )
                .catch((e) => log(e));
            }),
          );
        }
      }
      return null;
    });
};

export { buildStart, buildDone };