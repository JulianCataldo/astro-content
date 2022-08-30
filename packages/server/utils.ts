import { blue, bold, dim, red, grey, yellow, cyan } from 'kleur/colors';
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
