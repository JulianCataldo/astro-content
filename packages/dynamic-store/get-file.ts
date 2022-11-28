// @ts-expect-error

import nPath from 'node:path';
import fs from 'node:fs/promises';
import { getFileInfos, parseMd } from './file-loader';
/* ·········································································· */
import type {
  Module,
  GetFileProps,
  GenericModule,
  GetFileReturn,
} from './types';
import { watchers } from './watcher.js';
import { createHash } from './utils';
/* ========================================================================== */

interface QueryStore {
  module: GenericModule;
  path: string;
}
const queriesCache = new Map<string, QueryStore>();

watchers.push((file) => {
  queriesCache.forEach((query, key) => {
    if (query.path === file) {
      queriesCache.delete(key);
    }
  });
});

/* —————————————————————————————————————————————————————————————————————————— */

export const parse = <T, D>(
  module: Module<any, unknown>,
  {
    source,
    // rawBody,
    body = undefined,
    data,
  }: {
    source?: T;
    body?: string | undefined;
    data: D | undefined;
  },
): Module<T, D> => {
  const parsedModule: Module<T, D> = {
    ...(module as Module<T, D>),
    source,
    body,
    data: (data ?? {}) as D,
  };
  return parsedModule;
};

/* —————————————————————————————————————————————————————————————————————————— */

export async function getFile<
  Sources extends Record<string, string>,
  CustomModule extends Module<any, any>,
  ModuleType = CustomModule extends Module<any, any>
    ? /* No handler defined */
      GenericModule
    : /* With handler parsed module return type */
      CustomModule,
>({
  path,
  moduleHandler = undefined,
  source = undefined,
  glob = undefined,

  useCache = true,
  log = false,
}: //

GetFileProps<Sources, ModuleType>): GetFileReturn<ModuleType | undefined> {
  //

  const queryOptions = {
    path,
    moduleHandler: moduleHandler?.toString(),
  };
  const optionsHash = createHash(queryOptions);

  if (useCache && queriesCache.has(optionsHash)) {
    if (log) console.log('Cache hit for:', path, optionsHash);
    return queriesCache.get(optionsHash)!.module as ModuleType;
  }
  if (log) console.log('No cache for:', path, optionsHash);

  const result = await fs
    .readFile(nPath.join(process.cwd(), path), 'utf8')
    .then(async (markdownFileContent) => {
      const { body, data } = parseMd(markdownFileContent);

      const genericModule: GenericModule | CustomModule = {
        data: {},
        source: undefined,
        body,
        glob,
        path: getFileInfos(path),
      };

      if (data) {
        if (Object.entries(data).length !== 0) {
          genericModule.data = data;
        }

        if (moduleHandler) {
          let customModule: ModuleType = genericModule as ModuleType;

          try {
            customModule = await moduleHandler({
              module: genericModule,
              parse,
              source: source ?? genericModule.path.baseName,
              glob,
            });

            return customModule;
          } catch (e) {
            console.warn(e);
          }
        }
      }

      if (!data && !body) {
        return undefined;
      }

      return genericModule as ModuleType;
    })
    .catch((e) => {
      console.warn(e);
      return undefined;
    });

  queriesCache.set(optionsHash, {
    module: result as GenericModule,
    path,
  });

  return result;
}
