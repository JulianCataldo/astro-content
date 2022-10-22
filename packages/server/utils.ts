import path from 'node:path';
import { camelCase } from 'lodash-es';
/* ·········································································· */

/* —————————————————————————————————————————————————————————————————————————— */

export function getTrio(filePath: string) {
  // const relPath = path.relative(
  //   'content',
  //   path.relative(process.cwd(), filePath),
  // );

  const parts = filePath.split('/');
  let [third, second, first] = [parts.pop(), parts.pop(), parts.pop()];

  first = camelCase(first);
  second = camelCase(second);
  if (third) {
    const t = path.basename(third, path.extname(third));
    if (!t.startsWith('_')) {
      third = camelCase(t);
    }
  }
  return { first, second, third };
}
