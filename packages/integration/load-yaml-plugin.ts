// Based on: https://github.com/Modyfi/vite-plugin-yaml
// IDEA: could make this an independent package / plugin?
// TODO: Refactor / simplify: remove unused stuff, like YAML schema handling?

import { load, DEFAULT_SCHEMA } from 'js-yaml';
import { createFilter } from '@rollup/pluginutils';
import toSource from 'tosource';
import type { YAMLException, Schema } from 'js-yaml';
import type { Plugin } from 'vite';
import type { FilterPattern } from '@rollup/pluginutils';
import type { YamlInstance } from '@astro-content/types/file';

/* —————————————————————————————————————————————————————————————————————————— */

export interface PluginOptions {
  /**
   * A minimatch pattern, or array of patterns, which specifies the files in the build the plugin
   * should operate on.
   *
   * By default all files are targeted.
   */
  include?: FilterPattern;
  /**
   * A minimatch pattern, or array of patterns, which specifies the files in the build the plugin
   * should ignore.
   *
   * By default no files are ignored.
   */
  exclude?: FilterPattern;
  /**
   * Schema used to parse yaml files.
   *
   * @see https://github.com/nodeca/js-yaml/blob/49baadd52af887d2991e2c39a6639baa56d6c71b/README.md#load-string---options-
   */
  schema?: Schema;
  /**
   * A function that will be called for error reporting.
   *
   * Defaults to `console.warn()`.
   */
  onWarning?: (warning: YAMLException) => void;
}

const yamlExtension = /\.ya?ml$/;

/**
 * Transform YAML files to JS objects.
 */
export default (
  options: PluginOptions = { schema: DEFAULT_SCHEMA },
): Plugin => ({
  name: 'vite:transform-yaml',

  transform(code: string, id: string) {
    if (yamlExtension.test(id)) {
      // Filters the filesystem for files to include/exclude. Includes all files by default.
      const filter = createFilter(options.include, options.exclude);

      if (!filter(id)) {
        return null;
      }

      /**
       * Transforms file to JS object with customizable schema and error reporting.
       */
      const yamlData = load(code, {
        filename: id,
        schema: options.schema,
        onWarning: (warning: YAMLException) =>
          options.onWarning && typeof options.onWarning === 'function'
            ? options.onWarning(warning)
            : // eslint-disable-next-line no-console
              console.warn(warning.toString()),
      });

      const keys = `{ file, data, rawYaml }`;

      const data: YamlInstance<unknown> = {
        file: id,
        data: yamlData,
        rawYaml: code,
      };

      return {
        code: `const ${keys} = ${toSource(data)};\n\nexport ${keys};`,
      };
    }
    return null;
  },
});
