import bodyParser from 'body-parser';
import type { IncomingMessage } from 'node:http';
import type { AstroIntegration } from 'astro';
/* ·········································································· */
import { log } from '@astro-content/server/logger';
/* ·········································································· */
import { save } from '@astro-content/server/save';

import { validateYaml } from '@astro-content/server/validate-yaml';
import { validateMd } from '@astro-content/server/validate-md';
import { generateFakeEntries } from '@astro-content/server/generate-fake-data';

import type { PropertyReport } from '@astro-content/types/server-state';
import type { Save, Validate, Fake } from '@astro-content/types/dto';
/* —————————————————————————————————————————————————————————————————————————— */

const serverSetup: AstroIntegration['hooks']['astro:server:setup'] = ({
  server,
}) => {
  server.watcher.on('all', (event, wPath) => {
    log({ event, wPath }, 'absurd');
  });
  server.ws.on('vite:beforeFullReload', () => {
    log('Full reload…', 'absurd', 'pretty');
  });

  // FIXME: bodyParser typings
  server.middlewares.use(bodyParser.json());

  server.middlewares.use(
    // FIXME: `server.middlewares.use` doesn't take an async?
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    async (req: IncomingMessage & { body?: unknown }, res, next) => {
      log({ url: req.url, body: req.body }, 'absurd');

      if (req.body) {
        if (
          // —————————————————————————————————————————————————————— SAVE ———————
          req.url === '/__content/api/~save'
        ) {
          const body = req.body as Save;

          await save(body);

          res.end(JSON.stringify({ success: true }));
        } else if (
          // —————————————————————————————————————————————————— VALIDATE ———————
          req.url === '/__content/api/~validate'
        ) {
          const body = req.body as Validate;

          log(`Validating ${body.language ?? 'unknown'}`, 'debug', 'pretty');

          let errors: PropertyReport | false = {};

          if (
            //
            body.language === 'markdown'
          ) {
            errors = await validateMd(body.value, body.schema);
          } else if (
            //
            body.language === 'yaml'
          ) {
            const result = validateYaml(
              body.entity,
              body.entry,
              body.property,
              body.value,
            );
            if (result) {
              errors = result;
            }
          }
          res.end(JSON.stringify({ success: true, errors }));
        } else if (req.url === '/__content/api/~fake') {
          /**
           *  ——————————————————————————————————————————————————— FAKE ———————
           * */

          const body = req.body as Fake;

          log('Generating fake entries');

          const fakeEntries = await generateFakeEntries(body.schema);

          res.end(JSON.stringify(fakeEntries));
        } else {
          next();
        }
      }
    },
  );
};

export { serverSetup };
