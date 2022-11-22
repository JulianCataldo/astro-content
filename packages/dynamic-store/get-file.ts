// @ts-expect-error
/* eslint-disable max-lines */

import yaml from 'yaml';
import path from 'node:path';
import fs from 'node:fs/promises';
import { cloneDeep } from 'lodash-es';
/* ·········································································· */
import type { Module, GenericFrontmatter, GetFileProps, Ufm } from './types';
import { watchers } from './watcher.js';
import { createHash } from './utils';
/* ========================================================================== */

interface QueryStore {
  module: Module<GenericFrontmatter>;
  filePath: string;
}
const queriesCache = new Map<string, QueryStore>();

function basicInternalFmValidation(
  fm: unknown,
): GenericFrontmatter | undefined {
  if (
    fm !== null &&
    typeof fm === 'object' &&
    !Array.isArray(fm) &&
    Object.entries(fm).length > 0
  ) {
    return fm as GenericFrontmatter;
  }
  return undefined;
}

// From https://github.com/jxson/front-matter/blob/master/index.js
const platform = typeof process !== 'undefined' ? process.platform : '';
const optionalByteOrderMark = '\\ufeff?';
const fmPattern =
  `^(${optionalByteOrderMark}(= yaml =|---)` +
  `$([\\s\\S]*?)` +
  `^(?:\\2|\\.\\.\\.)\\s*` +
  `$${platform === 'win32' ? '\\r?' : ''}(?:\\n)?)`;

/* —————————————————————————————————————————————————————————————————————————— */
export async function getFile(
  args: GetFileProps<GenericFrontmatter>,
): Promise<Module<GenericFrontmatter> | undefined>;
/* ·········································································· */
export async function getFile<
  Validator extends (
    args: Ufm,
  ) => (Promise<ReturnType<Validator>> | ReturnType<Validator>) | undefined,
  AwaitedValidator = Awaited<ReturnType<Validator>>,
>(args: GetFileProps<Validator>): Promise<Module<AwaitedValidator> | undefined>;
/* ·········································································· */
export async function getFile<
  Validator extends (
    args: Ufm,
  ) => (Promise<ReturnType<Validator>> | ReturnType<Validator>) | undefined,
  AwaitedValidator = Awaited<ReturnType<Validator>>,
>({
  //
  filePath,
  markdownTransformers,
  /* This is the trick */
  frontmatterValidator = undefined,
  useCache = true,
}: GetFileProps<Validator>): Promise<
  Module<AwaitedValidator | GenericFrontmatter> | undefined
> {
  const queryOptions = {
    filePath,
    markdownTransformers,
    frontmatterValidator,
  };
  const optionsHash = createHash(queryOptions);

  if (useCache && queriesCache.has(optionsHash)) {
    // console.log('CACHE_HIT_FILE', filePath);
    return queriesCache.get(optionsHash)!.module;
  }
  // console.log('NO_CACHE_HIT_FILE', filePath);

  let fmRaw: string | undefined;
  let content: string | undefined;

  const result = await fs
    .readFile(path.join(process.cwd(), filePath), 'utf8')
    .then(async (md) => {
      let frontmatter: GenericFrontmatter | undefined;

      const regex = new RegExp(fmPattern, 'm');
      const match = regex.exec(md);

      if (match) {
        fmRaw = match[match.length - 1].replace(/^\s+|\s+$/g, '');
        content = md.replace(match[0], '');
      } else {
        content = md;
      }

      if (fmRaw) {
        try {
          const unknownFm = yaml.parse(fmRaw) as unknown;
          const valFm = basicInternalFmValidation(unknownFm);
          frontmatter = cloneDeep(valFm);
        } catch (e) {
          console.log(e);
        }
      }
      if (frontmatter && frontmatterValidator) {
        try {
          const validatedFm = await frontmatterValidator({ frontmatter });
          if (validatedFm) {
            frontmatter = validatedFm;
          }
        } catch (e) {
          console.log(e);
        }
      }
      if (content) {
        if (markdownTransformers) {
          markdownTransformers.forEach((transformer) => {
            if (typeof content === 'string') {
              content = transformer({ markdown: content });
            }
          });
        }
        const mod: Module<GenericFrontmatter> = {
          filePath,
          frontmatter,
          content,
        };
        queriesCache.set(optionsHash, {
          module: mod,
          filePath,
        });
        return mod;
      }
      return undefined;
    })
    .catch((e) => {
      console.log(e);
      return undefined;
    });

  return result;
}

watchers.push((file) => {
  queriesCache.forEach((query, key) => {
    if (query.filePath === file) {
      queriesCache.delete(key);
    }
  });
});
