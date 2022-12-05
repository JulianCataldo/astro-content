// @ts-expect-error

import globP from 'glob-promise';
import { getFile } from './get-file.js';
import { watchers } from './watcher.js';
import { createHash } from './utils.js';
/* ·········································································· */
import type {
  GetContentProps,
  GetContentReturn,
  GenericModule,
  Module,
  ModulesEntries,
} from './types';
/* ========================================================================== */

const queriesCache = new Map<string, ModulesEntries<GenericModule>>();

watchers.push(() => {
  queriesCache.clear();
});

/* —————————————————————————————————————————————————————————————————————————— */

export async function getContent<
  Sources extends Record<string, string>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CustomModule extends Module<any, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ModuleType = CustomModule extends Module<any, any>
    ? /* No handler defined */
      GenericModule
    : /* With handler parsed module return type */
      CustomModule,
  From = keyof Sources,
  Glob = Sources[keyof Sources],
>({
  baseDir = '',
  sources,
  moduleHandler = undefined,
  modulesListHandler = undefined,

  useCache = true,
  useFileCache = true,
  log = false,

  paginate,
}: GetContentProps<
  Sources,
  ModuleType,
  From,
  Glob
>): GetContentReturn<ModuleType> {
  let startTime: number | undefined;
  if (log) {
    startTime = performance.now();
  }

  const queryMemo = {
    sources,
    paginate,
    moduleHandler: moduleHandler?.toString(),
    modulesListHandler: modulesListHandler?.toString(),
  };
  const optionsHash = createHash(queryMemo);

  if (useCache && queriesCache.has(optionsHash)) {
    // eslint-disable-next-line no-console
    if (log) console.log('Cache hit for batch:', optionsHash);

    const fromCache = queriesCache.get(optionsHash)!;

    if (log && startTime) {
      const endTime = performance.now();
      // eslint-disable-next-line no-console
      console.log('Total query duration: ', endTime - startTime);
    }

    return fromCache as ModulesEntries<ModuleType>;
  }
  // eslint-disable-next-line no-console
  if (log) console.log('No cache for batch:', optionsHash);

  const entries: ModuleType[] = [];

  await Promise.all(
    Object.entries(sources).map(
      async ([from, glob]: [keyof Sources, Sources[keyof Sources]]) =>
        globP(`${baseDir}/${glob}`, { dot: true }).then(async (filesPath) =>
          Promise.all(
            filesPath.map(async (filePath) => {
              const module: ModuleType | undefined = await getFile({
                path: filePath,

                moduleHandler,

                from: from as From,
                glob: glob as Glob,

                useCache: useFileCache,
                log,
              });
              if (module) {
                entries.push(module);
              }
            }),
          ),
        ),
    ),
  );

  let result: ModuleType[] | undefined = entries;
  let start: number | undefined;
  let end: number | undefined;
  let totalEntries = entries.length;
  let totalPages: number | undefined;

  if (modulesListHandler) {
    result = await modulesListHandler({
      modules: result,
    });
  }
  totalEntries = result?.length ?? 0;

  if (result && paginate) {
    const current = paginate.currentPageNumber ?? 1;
    const count = paginate.entriesCount;

    start = current === 0 ? current : current * count;
    end = current === 0 ? current + count : current * count + count;
    totalPages = Math.floor(totalEntries / (end - start) + 1);

    result = result.slice(start, end);
  }

  const moduleCollection: ModulesEntries<ModuleType> = {
    entries: result,
    start,
    end,
    totalPages,
    totalEntries,
  };

  /* Since it is validated, we can store the resulting query as generic data */
  queriesCache.set(
    optionsHash,
    moduleCollection as ModulesEntries<GenericModule>,
  );

  if (log && startTime) {
    const endTime = performance.now();
    // eslint-disable-next-line no-console
    console.log('Total query duration: ', endTime - startTime);
  }

  return moduleCollection;
}
