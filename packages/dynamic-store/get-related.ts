import type { Module, ModuleCollection } from './types';
import { getContent } from './get-content';
import { watchers } from './watcher';
/* ========================================================================== */

const relatedsCache = new Map<string, Module[]>();

watchers.push(() => {
  relatedsCache.clear();
});

export async function getRelatedContent(
  globPath: string,
  module: Module,
  relation: string,
  relatedCount = 10,
) {
  const { entries } = await getContent({ globPath });

  if (relatedsCache.has(module.file)) {
    return {
      entries: relatedsCache.get(module.file),
    } as ModuleCollection;
  }

  const related: Record<string, { relationsCount: number }> = {};

  const rels = module.frontmatter[relation];
  if (Array.isArray(rels)) {
    rels.forEach((rel) => {
      entries?.forEach(({ file: otherFile, frontmatter: otherData }) => {
        const otherRels = otherData[relation];
        if (
          otherFile !== module.file &&
          Array.isArray(otherRels) &&
          otherRels.some((otherRel) => String(otherRel) === String(rel))
        ) {
          if (!related[otherFile]) {
            related[otherFile] = { relationsCount: 1 };
          } else if (related[otherFile]?.relationsCount) {
            related[otherFile] = {
              relationsCount: Number(related[otherFile]?.relationsCount) + 1,
            };
          }
        }
      });
    });
  }
  const relatedSorted = Object.entries(related)
    .sort(
      ([, { relationsCount: pCount }], [, { relationsCount: nCount }]) =>
        pCount - nCount,
    )
    .reverse()
    .slice(0, relatedCount);

  const relatedSingles: Module[] = [];

  relatedSorted.forEach(([otherFile, otherData]) => {
    const relatedSingle = entries
      ?.filter(({ file }) => file === otherFile)
      .pop();

    if (relatedSingle) {
      relatedSingles.push({
        ...relatedSingle,
        relationsCount: otherData.relationsCount,
      });
    }
  });

  relatedsCache.set(module.file, relatedSingles);

  return { entries: relatedSingles } as ModuleCollection;
}
