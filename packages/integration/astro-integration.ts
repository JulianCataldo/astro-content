import type { AstroIntegration } from 'astro';
/* ·········································································· */
import get from '@astro-content/server/collect';
import ViteYaml from './load-yaml-plugin';
// import state from 'server/state';
/* —————————————————————————————————————————————————————————————————————————— */

let defaultLogLevel = 'info';
if (process.argv.includes('--verbose')) {
  defaultLogLevel = 'debug';
} else if (process.argv.includes('--silent')) {
  defaultLogLevel = 'silent';
}

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
      },

      // 'astro:config:done': ({ config }) => {},

      'astro:server:setup': (/* { server } */) => {
        // server.watcher.on('all', (event, path) => {});
        //
        // server.middlewares.use((req, res, next) => {
        //   if (req.url?.startsWith('/__content/middleware')) {
        //     console.log({ r: req.url });
        //     res.end(JSON.stringify(state));
        //   } else {
        //     next();
        //   }
        // });
      },
    },
  };
};

export default astroContent;
export { get };
