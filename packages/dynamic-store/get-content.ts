import { kebabCase } from 'lodash-es';
import glob from 'glob-promise';
import { getFile } from './get-file';
/* ·········································································· */
import type { GetContentProps, Module, ModuleCollection } from './types';
import { watchers } from './watcher';
/* ========================================================================== */

const cache = new Map<string, Module[]>();

watchers.push(() => {
  cache.clear();
});

export async function getContent({
  globPath,
  paginate,
  sortBy,
  filters,
  transformers,
}: GetContentProps): Promise<ModuleCollection> {
  if (!cache.has(globPath)) {
    const entries: Module[] = [];
    const files = await glob(globPath, { dot: true });

    await Promise.all(
      files.map(async (f) => {
        const mod = await getFile(f, transformers);
        if (mod) {
          entries.push(mod);
        }
      }),
    );

    cache.set(globPath, entries);
  }

  let result = cache.get(globPath);

  let start: number | undefined;
  let end: number | undefined;

  let totalEntries = result?.length ?? 0;
  let totalPages = 1;

  if (!result) {
    return { entries: result, totalEntries, start, end, totalPages };
  }

  if (sortBy) {
    result = result.sort((a, b) => {
      const prev = String(a.frontmatter[sortBy]);
      const next = String(b.frontmatter[sortBy]);
      return prev > next ? -1 : 1;
    });
  }
  if (filters) {
    Object.entries(filters).forEach(([name, value]) => {
      if (value) {
        result = result?.filter(({ frontmatter }) => {
          const fm = frontmatter[name];

          return (
            Array.isArray(fm) &&
            fm.every((e) => typeof e === 'string') &&
            fm.some((t: string) => kebabCase(t) === kebabCase(value))
          );
        });
      }
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

  return { entries: result, totalEntries, start, end, totalPages };
}
