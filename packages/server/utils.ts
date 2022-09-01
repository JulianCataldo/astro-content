import { blue, bold, dim, red, grey, yellow, cyan } from 'kleur/colors';
import path from 'node:path';
import { camelCase } from 'lodash-es';
/* ·········································································· */
import { conf } from './config';
/* —————————————————————————————————————————————————————————————————————————— */

// eslint-disable-next-line import/prefer-default-export
export function $log(msg: string) {
  if (conf.log.verbose) {
    // eslint-disable-next-line no-console
    console.log(`${dim(grey('08:09:09'))} ${bold(blue('[maestro]'))} ${msg}`);
  }
}
/* ·········································································· */
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
