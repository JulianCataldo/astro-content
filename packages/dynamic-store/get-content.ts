/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
// @ts-expect-error

import glob from 'glob-promise';
import { kebabCase } from 'lodash-es';
import crypto from 'node:crypto';
import { getFile } from './get-file.js';
/* ·········································································· */
import type {
  GenericFrontmatter,
  GetContentProps,
  Module,
  ModuleCollection,
  Ufm,
} from './types';
import { watchers } from './watcher.js';
import { createHash } from './utils';
/* ========================================================================== */

const queriesCache = new Map<string, ModuleCollection<GenericFrontmatter>>();

watchers.push(() => {
  queriesCache.clear();
});

/* —————————————————————————————————————————————————————————————————————————— */
export async function getContent<
  Validator extends (args: { frontmatter: unknown }) => ReturnType<Validator>,
>(
  args: GetContentProps<GenericFrontmatter, Validator>,
): Promise<ModuleCollection<GenericFrontmatter> | undefined>;
// // /* ·········································································· */
export async function getContent<
  Validator extends (args: { frontmatter: unknown }) => ReturnType<Validator>,
>(
  args: GetContentProps<Validator, Validator>,
): Promise<ModuleCollection<Awaited<ReturnType<Validator>>> | undefined>;
/* ·········································································· */
export async function getContent<
  Validator extends (args: {
    frontmatter: unknown;
  }) => ReturnType<Validator> | undefined,
>({
  globPath,
  paginate,
  sortBy,
  order,
  filters,
  limit,
  frontmatterValidator,
  markdownTransformers,
  useCache = true,
}: GetContentProps<Validator, Validator>): Promise<
  ModuleCollection<Awaited<ReturnType<Validator>>> | undefined
> {
  const startTime = performance.now();
  const queryOptions = {
    globPath,
    paginate,
    sortBy,
    filters,
    limit,
    frontmatterValidator,
    markdownTransformers,
  };

  const optionsHash = createHash(queryOptions);

  if (useCache && queriesCache.has(optionsHash)) {
    // console.log('CACHE_HIT_GLOB', globPath);
    const fromCache = queriesCache.get(optionsHash)!;
    // const endTime = performance.now();
    // console.log('DURATION', endTime - startTime);
    return fromCache as ModuleCollection<Awaited<ReturnType<Validator>>>;
  }

  console.log('NO_CACHE_HIT_GLOB', globPath);
  const entries: Module<GenericFrontmatter>[] = [];
  const files = await glob(globPath, { dot: true });
  await Promise.all(
    files.map(async (filePath) => {
      const module: Module<GenericFrontmatter> | undefined = await getFile({
        filePath,
        markdownTransformers,
        frontmatterValidator,
        useCache,
      });
      if (module) {
        entries.push(module);
      }
    }),
  );
  let result: Module<GenericFrontmatter | Awaited<ReturnType<Validator>>>[] =
    entries;

  let start: number | undefined;
  let end: number | undefined;
  let totalEntries = entries.length;
  let totalPages = 1;
  if (frontmatterValidator && sortBy) {
    result = (result as Module<Awaited<ReturnType<Validator>>>[]).sort(
      (a, b) => {
        const prev = String(a.frontmatter?.[sortBy]);
        const next = String(b.frontmatter?.[sortBy]);
        const oi = order === 'ascending' ? 1 : -1;
        return prev > next ? oi * -1 : oi;
      },
    );
  }
  if (frontmatterValidator && filters) {
    Object.entries(filters).forEach(([name, value]) => {
      if (value) {
        result = result.filter(({ frontmatter }) => {
          const propFilters = (frontmatter as Record<string, unknown>)[name];
          return (
            Array.isArray(propFilters) &&
            propFilters.every((e) => typeof e === 'string') &&
            propFilters.some((t: string) => kebabCase(t) === kebabCase(value))
          );
        });
      }
    });
  }
  if (limit) {
    result = result.slice(0, limit);
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
  const moduleCollection: ModuleCollection<GenericFrontmatter> = {
    entries: result as Module<GenericFrontmatter>[],
    totalEntries,
    start,
    end,
    totalPages,
  };
  queriesCache.set(optionsHash, moduleCollection);
  const endTime = performance.now();
  console.log('DURATION', endTime - startTime);
  return moduleCollection as ModuleCollection<Awaited<ReturnType<Validator>>>;
}
