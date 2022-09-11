import bodyParser from 'body-parser';
import type { IncomingMessage } from 'node:http';
import type { AstroIntegration } from 'astro';
/* ·········································································· */
import { log } from '@astro-content/server/logger';
/* ·········································································· */
import { actions } from '@astro-content/server/state';
import { saveFile } from '@astro-content/server/save-file';

import { handleYaml } from '@astro-content/server/handle-yaml';
import { handleMd } from '@astro-content/server/handle-md';
import { generateFakeEntries } from '@astro-content/server/generate-fake-data';

import type { PropertyReport } from '@astro-content/types/reports';
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
          req.url === actions.save.endpoint
          // —————————————————————————————————————————————————— SAVE ———————————
        ) {
          const body = req.body as Save;

          await saveFile(body);

          res.end(JSON.stringify({ success: true }));
        } else if (
          req.url === actions.validate.endpoint
          // —————————————————————————————————————————————————— VALIDATE ———————
        ) {
          const body = req.body as Validate;

          log(`Validating ${body.language ?? 'unknown'}`, 'debug', 'pretty');

          let reports: PropertyReport | false = {};

          if (
            //
            body.language === 'markdown'
          ) {
            reports = await handleMd(body.value, body.schema);
          } else if (
            //
            body.language === 'yaml'
          ) {
            const result = handleYaml(
              body.entity,
              body.entry,
              body.property,
              body.value,
            );
            if (result) {
              reports = result;
            }
          }
          res.end(JSON.stringify({ success: true, reports }));
        } else if (
          req.url === actions.fake.endpoint
          // —————————————————————————————————————————————————— FAKE ———————————
        ) {
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
