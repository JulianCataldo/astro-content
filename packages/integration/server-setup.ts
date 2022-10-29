import bodyParser from 'body-parser';
import type { IncomingMessage } from 'node:http';
import type { AstroIntegration } from 'astro';
/* ·········································································· */
import { log } from '@astro-content/server/logger';
/* ·········································································· */
import { endpoints } from '@astro-content/server/state';
import { saveFile } from '@astro-content/server/save-file';

import { handleYaml } from '@astro-content/server/handle-yaml';
import { handleMd } from '@astro-content/server/handle-md';
import { generateFakeEntries } from '@astro-content/server/generate-fake-data';

import type { PropertyReport } from '@astro-content/types/reports';
import type { Save, Validate, Fake, Response } from '@astro-content/types/dto';
/* —————————————————————————————————————————————————————————————————————————— */

const serverSetup: AstroIntegration['hooks']['astro:server:setup'] = ({
  server,
}) => {
  server.watcher.on('all', (event, wPath) => {
    log({ event, wPath }, 'absurd');
    server.ws.send('content-reload');
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
          req.url === endpoints.actions.save
          // —————————————————————————————————————————————————— SAVE ———————————
        ) {
          const body = req.body as Save;

          // NOTE: For debugging only, add some fake I/O delay
          // await new Promise((resolve) => setTimeout(() => resolve(''), 2000));

          const success = await saveFile(body);
          const response: Response = { success };

          res.end(JSON.stringify(response));
        } else if (
          req.url === endpoints.actions.validate
          // —————————————————————————————————————————————————— VALIDATE ———————
        ) {
          const body = req.body as Validate;

          log(`Validating ${body.language ?? 'unknown'}`, 'debug', 'pretty');

          let reports: PropertyReport | false = {};

          if (
            //
            body.language === 'markdown' ||
            body.language === 'mdx'
          ) {
            reports = await handleMd(
              body.value,
              body.schema,
              body.language === 'mdx',
            );
          } else if (
            //
            body.language === 'yaml'
          ) {
            const result = await handleYaml(
              body.entity,
              body.entry,
              body.property,
              body.value,
              body.schema,
            );
            if (result) {
              reports = result;
            }
          }
          // TODO: Handle success / failure
          res.end(JSON.stringify({ success: true, reports }));
        } else if (
          req.url === endpoints.actions.fake
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
