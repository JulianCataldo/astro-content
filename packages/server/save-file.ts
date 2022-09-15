import fs from 'node:fs/promises';
/* ·········································································· */
import type { Save } from '@astro-content/types/dto';
import { log } from './logger.js';
/* —————————————————————————————————————————————————————————————————————————— */

export async function saveFile(object: Save) {
  const { file: dest, value } = object;

  const isSuccess = await fs
    .writeFile(dest, value)
    .then(() => true)
    .catch((e) => {
      log(e, 'info');
      return false;
    });
  return isSuccess;
}
