// @ts-expect-error

import globP from 'glob-promise';
import { getFile } from './get-file.js';
/* ·········································································· */
import type {
  GenericData,
  GetContentProps,
  Module,
  ModulesEntries,
  ValFn,
} from './types';
import { watchers } from './watcher.js';
import { createHash } from './utils';
/* ========================================================================== */

const queriesCache = new Map<string, ModulesEntries<GenericData>>();

watchers.push(() => {
  queriesCache.clear();
});

/* —————————————————————————————————————————————————————————————————————————— */
/* No validator */
export async function getContent<
  Sources extends Record<string, string>,
  Validator extends ValFn<Sources>,
>(
  args: GetContentProps<Sources, GenericData, Validator>,
): Promise<ModulesEntries<GenericData>>;
/* ·········································································· */
/* With validator */
export async function getContent<
  Sources extends Record<string, string>,
  Validator extends ValFn<Sources>,
>(
  args: GetContentProps<Sources, Validator, Validator>,
): Promise<ModulesEntries<Awaited<ReturnType<Validator>>>>;
/* ·········································································· */
export async function getContent<
  Sources extends Record<string, string>,
  Validator extends ValFn<Sources>,
>({
  sources,
  dataValidator,
  markdownTransformers,
  modulesHandler,
  useCache = true,
  useFileCache = true,
  limit = undefined,
  paginate,
  log = false,
}: GetContentProps<Sources, Validator, Validator>): Promise<
  ModulesEntries<Awaited<ReturnType<Validator>>>
> {
  let startTime: number | undefined;
  if (log) {
    startTime = performance.now();
  }

  const queryMemo = {
    sources,
    paginate,
    dataValidator: dataValidator?.toString(),
    modulesHandler: modulesHandler?.toString(),
    markdownTransformers: markdownTransformers?.toString(),
  };
  const optionsHash = createHash(queryMemo);

  if (useCache && queriesCache.has(optionsHash)) {
    if (log) console.log('Cache hit for ', optionsHash);
    const fromCache = queriesCache.get(optionsHash)!;
    if (log && startTime) {
      const endTime = performance.now();
      console.log('Total query duration: ', endTime - startTime);
    }
    return fromCache as ModulesEntries<Awaited<ReturnType<Validator>>>;
  }
  if (log) console.log('No cache for ', optionsHash);

  const entries: Module<GenericData>[] = [];

  // const filesPath: string[] = [];
  await Promise.all(
    Object.entries(sources).map(
      async ([matcher, glob]) =>
        typeof glob === 'string' &&
        globP(glob, { dot: true }).then(async (filesPath) =>
          Promise.all(
            filesPath.map(async (filePath) => {
              const module: Module<GenericData> | undefined = await getFile({
                path: filePath,
                markdownTransformers,
                dataValidator,
                matcherName: matcher,
                matcherGlob: String(glob),
                useCache: useFileCache,
              });
              if (module) {
                entries.push(module);
              }
            }),
          ),
        ),
    ),
  );

  let result: Module<GenericData | Awaited<ReturnType<Validator>>>[] = entries;

  let start: number | undefined;
  let end: number | undefined;
  let totalEntries = entries.length;
  let totalPages: number | undefined;

  if (modulesHandler) {
    result = await modulesHandler({
      modules: result as Module<Awaited<ReturnType<Validator>>>[],
    });
  }

  totalEntries = result.length;

  if (limit) {
    result = result.slice(0, limit);
  }
  if (paginate) {
    const current = paginate.currentPageNumber ?? 1;
    const count = paginate.entriesCount;
    start = current === 0 ? current : current * count;
    end = current === 0 ? current + count : current * count + count;
    totalPages = Math.floor(totalEntries / (end - start) + 1);
    result = result.slice(start, end);
  }

  const moduleCollection: ModulesEntries<GenericData> = {
    entries: result as Module<GenericData>[],
    start,
    end,
    totalPages,
    totalEntries,
  };

  queriesCache.set(optionsHash, moduleCollection);

  if (log && startTime) {
    const endTime = performance.now();
    console.log('Total query duration: ', endTime - startTime);
  }

  return moduleCollection as ModulesEntries<Awaited<ReturnType<Validator>>>;
}
