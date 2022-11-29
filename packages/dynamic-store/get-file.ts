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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  module: Module<any, unknown>,
  {
    from,
    body = undefined,
    data,
  }: {
    from?: T;
    body?: string | undefined;
    data: D | undefined;
  },
): Module<T, D> => {
  const parsedModule: Module<T, D> = {
    ...(module as Module<T, D>),
    from,
    body: body ?? module.body,
    data: data ?? (module.data as D),
  };
  return parsedModule;
};

/* —————————————————————————————————————————————————————————————————————————— */

export async function getFile<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CustomModule extends Module<any, any>,
  UniquePath extends string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ModuleType = CustomModule extends Module<any, any>
    ? /* No handler defined */
      GenericModule
    : /* With handler parsed module return type */
      CustomModule,
  From = UniquePath,
  Glob = undefined,
>({
  baseDir = '',
  from = undefined,
  moduleHandler = undefined,
  glob = undefined,
  path,

  useCache = true,
  log = false,
}: //

GetFileProps<ModuleType, UniquePath, From, Glob>): GetFileReturn<
  ModuleType | undefined
> {
  //
  const queryOptions = {
    from,
    moduleHandler: moduleHandler?.toString(),
  };
  const optionsHash = createHash(queryOptions);

  if (useCache && queriesCache.has(optionsHash)) {
    // eslint-disable-next-line no-console
    if (log) console.log('Cache hit for:', path, optionsHash);
    return queriesCache.get(optionsHash)!.module as ModuleType;
  }
  // eslint-disable-next-line no-console
  if (log) console.log('No cache for:', path, optionsHash);

  const result = await fs
    .readFile(nPath.join(process.cwd(), baseDir, path), 'utf8')
    .then(async (markdownFileContent) => {
      const { body, data } = parseMd(markdownFileContent);

      const genericModule: GenericModule | CustomModule = {
        data: {},
        from: undefined,
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
              from: (from ?? path) as From,
              glob: glob as Glob,
            });

            return customModule;
          } catch (e) {
            // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.warn(e);
      return undefined;
    });

  queriesCache.set(optionsHash, {
    module: result as GenericModule,
    path,
  });

  return result;
}
