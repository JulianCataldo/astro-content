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
    third = camelCase(path.basename(third, path.extname(third)));
  }
  return { first, second, third };
}
