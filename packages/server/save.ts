import { kebabCase } from 'lodash-es';
import * as path from 'node:path';
import fs from 'node:fs/promises';
import type { SaveDTO } from '@astro-content/types/dto';
/* ·········································································· */
/* —————————————————————————————————————————————————————————————————————————— */

const extensions: Record<string, string> = {
  markdown: '.md',
  yaml: '.yaml',
  // 'mdx': '.mdx',
};

export default async function saveDTO(object: SaveDTO) {
  if (object.entity && object.entry && object.property) {
    const dest = path.join(
      process.cwd(),
      'content',
      kebabCase(object.entity),
      kebabCase(object.entry),
      `${kebabCase(object.property)}${extensions[object.language]}`,
    );
    await fs.writeFile(dest, object.value);
  }
}
