/* eslint-disable no-console */
/* ·········································································· */
import type { LogLevel, Mode } from '@astro-content/types/logger';
/* —————————————————————————————————————————————————————————————————————————— */

export enum Levels {
  silent,
  info,
  debug,
  absurd,
}

const defaultLevel: LogLevel = 'debug';
const currentLevel: LogLevel = import.meta.env.PUBLIC_LOG_LEVEL as LogLevel;

export function log(
  //
  value: unknown,
  level?: LogLevel,
  mode: Mode = 'dump',
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
      console.log(
        // TODO: Time
        `${'00:00:00'} ` +
          // —————————————————————————————————————————————————
          `${'[content]'} ${literal}`,
      );
    } else if (mode === 'table') {
      console.table(value);
    } else {
      /* Default : dump as is */
      console.log(value);
    }
  }
}
