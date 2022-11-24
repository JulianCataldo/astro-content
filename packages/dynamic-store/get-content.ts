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
export async function getContent<Validator extends ValFn>(
  args: GetContentProps<GenericData, Validator>,
): Promise<ModulesEntries<GenericData>>;
/* ·········································································· */
/* With validator */
export async function getContent<Validator extends ValFn>(
  args: GetContentProps<Validator, Validator>,
): Promise<ModulesEntries<Awaited<ReturnType<Validator>>>>;
/* ·········································································· */
export async function getContent<Validator extends ValFn>({
  glob,
  paginate,
  dataValidator,
  markdownTransformers,
  modulesProcessor,
  useCache = true,
  log = false,
}: GetContentProps<Validator, Validator>): Promise<
  ModulesEntries<Awaited<ReturnType<Validator>>>
> {
  let startTime: number | undefined;
  if (log) {
    startTime = performance.now();
  }

  const queryMemo = {
    glob,
    paginate,
    dataValidator: dataValidator?.toString(),
    modulesProcessor: modulesProcessor?.toString(),
    markdownTransformers: markdownTransformers?.toString(),
  };
  const optionsHash = createHash(queryMemo);

  if (useCache && queriesCache.has(optionsHash)) {
    if (log) console.log('Cache hit for ', glob);
    const fromCache = queriesCache.get(optionsHash)!;
    if (log && startTime) {
      const endTime = performance.now();
      console.log('Total query duration: ', endTime - startTime);
    }
    return fromCache as ModulesEntries<Awaited<ReturnType<Validator>>>;
  }
  if (log) console.log('No cache for ', glob);

  const entries: Module<GenericData>[] = [];
  const files = await globP(glob, { dot: true });
  await Promise.all(
    files.map(async (filePath) => {
      const module: Module<GenericData> | undefined = await getFile({
        path: filePath,
        markdownTransformers,
        dataValidator,
        useCache,
      });
      if (module) {
        entries.push(module);
      }
    }),
  );

  let result: Module<GenericData | Awaited<ReturnType<Validator>>>[] = entries;

  let start: number | undefined;
  let end: number | undefined;
  let totalEntries = entries.length;
  let totalPages: number | undefined;

  if (modulesProcessor) {
    result = await modulesProcessor({
      modules: result as Module<Awaited<ReturnType<Validator>>>[],
    });
  }

  totalEntries = result.length;

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
    totalEntries,
    start,
    end,
    totalPages,
  };

  queriesCache.set(optionsHash, moduleCollection);

  if (log && startTime) {
    const endTime = performance.now();
    console.log('Total query duration: ', endTime - startTime);
  }

  return moduleCollection as ModulesEntries<Awaited<ReturnType<Validator>>>;
}
