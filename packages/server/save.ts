import fs from 'node:fs/promises';
/* ·········································································· */
import type { Save } from '@astro-content/types/dto';
import { log } from './logger';
/* —————————————————————————————————————————————————————————————————————————— */

export async function save(object: Save) {
  const dest = object.file;
  await fs.writeFile(dest, object.value).catch((e) => log(e));
}
