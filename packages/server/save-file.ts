import fs from 'node:fs/promises';
import prettier from 'prettier';
/* ·········································································· */
import type { Save } from '@astro-content/types/dto';
import { log } from './logger.js';
/* —————————————————————————————————————————————————————————————————————————— */

export async function saveFile(object: Save) {
  const { file: dest, value, language } = object;

  let formattedValue: string | false = false;
  if (language) {
    formattedValue = prettier.format(value, {
      parser: language,
      // NOTE: Double quotes in MDX imports are breaking highlighting
      singleQuote: true,
    });
    log({ formattedValue, language }, 'debug');
  }

  const isSuccess = await fs
    .writeFile(dest, formattedValue || value)
    .then(() => true)
    .catch((e) => {
      log(e, 'info');
      return false;
    });
  return isSuccess;
}
