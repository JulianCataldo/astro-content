import yaml from 'yaml';
import path from 'node:path';
import fs from 'node:fs/promises';
/* ·········································································· */
import type { Module, Transform } from './types';
import { watchers } from './watcher';
/* ========================================================================== */

const modules = new Map<string, Module>();

export async function getFile(
  file: string,
  transformers?: Transform[] | undefined,
) {
  if (modules.has(file)) {
    return modules.get(file);
  }

  let fmRaw: string | undefined;
  let content: string | undefined;

  const res = await fs
    .readFile(path.join(process.cwd(), file), 'utf8')
    .then((md) => {
      [, fmRaw, content] = md.split('---');
      let frontmatter = {};

      if (fmRaw) {
        try {
          const fm = yaml.parse(fmRaw) as unknown;
          if (typeof fm === 'object') {
            frontmatter = { ...fm };
          }
        } catch (e) {
          console.log(e);
        }
      }

      if (content) {
        if (transformers) {
          console.log({ transformers });
          transformers.forEach((transformer) => {
            if (typeof content === 'string') {
              content = transformer(content);
            }
          });
        }
        const mod: Module = { file, frontmatter, content };

        modules.set(file, mod);
        return mod;
      }
      return null;
    })
    .catch((e) => console.log(e));

  return res;
}

watchers.push((file) => {
  modules.delete(file);
});
