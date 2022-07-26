/* eslint-disable no-console */
import { blue, bold, dim } from 'kleur/colors';
// TODO: Try consola
// import consola from 'consola';
/* ·········································································· */
import type { LogLevel } from '@astro-content/types/logger';
/* —————————————————————————————————————————————————————————————————————————— */

export enum Levels {
  silent,
  info,
  debug,
  absurd,
}

export type Mode = 'pretty' | 'dump' | 'table';

let currentLevel: LogLevel = 'info';
const defaultLevel: LogLevel = 'debug';

export function getCurrentLevel() {
  return currentLevel;
}

export function setLogLevel(level: LogLevel) {
  // if (process.argv.includes('--verbose')) {
  //   currentLevel = 'debug';
  // } else if (process.argv.includes('--silent')) {
  //   currentLevel = 'silent';
  // } else if (process.argv.includes('--absurd')) {
  //   currentLevel = 'absurd';
  // }
  currentLevel = level;
}

export function log(
  //
  value: unknown,
  level?: LogLevel,
  mode: Mode = 'dump',
  // TODO: Try consola
  // type: 'success' | 'info' | 'error' = 'info',
) {
  let loggingLevel: LogLevel;
  if (!level) {
    loggingLevel = defaultLevel;
  } else {
    loggingLevel = level;
  }

  if (Levels[loggingLevel] <= Levels[currentLevel]) {
    if (mode === 'pretty') {
      const literal = typeof value === 'string' ? value : JSON.stringify(value);
      const time = new Date().toLocaleTimeString();

      console.log(
        `${dim(time)} ` +
          // —————————————————————————————————————————————————
          `${bold(blue('[content]'))} ${literal}`,
      );
    } else if (mode === 'table') {
      console.table(value);
    } else {
      /* Default : dump as is */
      console.log(value);
    }
  }
}
