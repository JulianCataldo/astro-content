// Based on: https://github.com/Modyfi/vite-plugin-yaml
// NOTE: Work in progress
// IDEA: Could make this an independent package / plugin?

import type { Plugin } from 'vite';

/* —————————————————————————————————————————————————————————————————————————— */

const jsoncExtension = /\.json?c$/;

/**
 * Transform YAML files to JS objects.
 */
export default (): Plugin => ({
  name: 'vite:transform-jsonc',

  // transform(code: string, id: string) {
  //   if (jsoncExtension.test(id)) {
  //     const JsoncInstance = `${code.replace('export ', '')}`;

  //     return {
  //       code: JsoncInstance,
  //     };
  //   }
  //   return null;
  // },
});
