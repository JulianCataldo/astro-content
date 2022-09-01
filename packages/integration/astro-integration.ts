import type { AstroIntegration } from 'astro';

/* ·········································································· */

import fs from 'node:fs/promises';
import path from 'node:path';
import mkdirp from 'mkdirp';
import bodyParser from 'body-parser';
import collect from '@astro-content/server/collect';
// import state from '@astro-content/server/state';
import save from '@astro-content/server/save';
import validateYaml from '@astro-content/server/validate-yaml';
import validateMd from '@astro-content/server/validate-md';
import state from '@astro-content/server/state';
import ViteYaml from './load-yaml-plugin';
/* —————————————————————————————————————————————————————————————————————————— */

let defaultLogLevel = 'info';
if (process.argv.includes('--verbose')) {
  defaultLogLevel = 'debug';
} else if (process.argv.includes('--silent')) {
  defaultLogLevel = 'silent';
}

const tempDir = path.join(process.cwd(), '.astro-content');

const astroContent = (): AstroIntegration => {
  console.log('object');
  return {
    name: 'astro-content',
    hooks: {
      'astro:config:setup': ({ injectRoute, updateConfig, config }) => {
        console.log(`
          📚   Content - WIP - Log level: ${defaultLogLevel}
        
        ┃ Local    http://localhost:${config.server.port}/__content
        ┃ Network  http://0.0.0.0:${config.server.port}/__content
        `);

        /* Inject YAML import + metadata with `Astro.glob()` */
        updateConfig({
          vite: {
            plugins: [ViteYaml()],
            server: {
              watch: {
                ignored: [
                  //
                  // '**/content/**',
                  '**/.astro-content/**',
                  '**/get.ts',
                ],
              },
            },
          },
        });

        injectRoute({
          pattern: '__content/api/[endpoint]',
          // IDEA: Could be optional (install GUI / CLI as separate package?)
          // FIXME: Find a more elegant way to import than a sub `node_modules`
          entryPoint:
            'astro-content/node_modules/@astro-content/gui/api.json.ts',
        });

        injectRoute({
          pattern: '/__content',
          entryPoint: 'astro-content/node_modules/@astro-content/gui/app.astro',
        });

        fs.writeFile(
          path.join(process.cwd(), 'get.ts'),
          `${state.types.ide}`,
        ).catch(() => null);
      },

      // 'astro:config:done': ({ config }) => {},

      'astro:server:setup': ({ server }) => {
        // server.watcher.on('all', (event, path) => {
        //   console.log(event, path);
        // });
        server.ws.on('vite:beforeFullReload', (event, path) => {
          console.log(event, path);
          console.log(event, path);
          console.log(event, path);
        });

        // FIXME: bodyParser typings
        server.middlewares.use(bodyParser.json());
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/__content/api/__save') {
            console.log({ r: req.url });
            console.log({ r: req.body });
            if (req.body) {
              await save(req.body);
            }

            res.end(JSON.stringify({ success: true }));
          } else if (req.url === '/__content/api/__validate') {
            console.log({ r: req.url });
            console.log({ r: req.body });
            let errors;
            if (req.body.language === 'markdown') {
              console.log('some MD');
              errors = await validateMd(
                req.body.value,
                req.body?.schema?.allOf?.[1]?.properties?.frontmatter || {},
              );
            } else if (req.body.language === 'yaml') {
              console.log('some YAML');
              errors = await validateYaml(
                req.body.entity,
                req.body.entry,
                req.body.property,
                null,
                req.body.value,
                req.body.schema,
              );
            }
            res.end(JSON.stringify({ success: true, errors }));
          } else {
            next();
          }
        });
        // console.log(state);
        // ssrData = state;
      },

      'astro:build:start': async (a) => {
        console.log(a);
        await mkdirp(tempDir);
      },
      'astro:build:done': async (a) => {
        console.log('DONE');
        await fs
          .readFile(path.join(tempDir, 'state.json'), 'utf-8')
          .then(async (data) => {
            if (typeof data === 'string') {
              const obj = JSON.parse(data);
              if (typeof obj === 'object') {
                return Promise.all(
                  Object.entries(obj).map(async ([key]) =>
                    fs.writeFile(
                      path.join(process.cwd(), `dist/__content/api/${key}`),
                      JSON.stringify(obj[key]),
                    ),
                  ),
                );
              }
            }
          });
      },
    },
  };
};

export default astroContent;
export { collect };
