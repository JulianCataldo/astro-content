import * as fs from 'node:fs/promises';
import mkdirp from 'mkdirp';
import _ from 'lodash-es';
import path from 'node:path';
import changeCase from 'change-case';
import conf from '../config';

import state from './state';

export default async function generateHelper() {
  let content = `/* AUTO-GENERATED — Do not edit! */
import getContent from '@julian_cataldo/content-components/src/client/fetch-content';

`;
  const contentSchemas = Object.entries(state.schemas.content);

  contentSchemas.forEach(([, schema]) => {
    const name = schema.title;
    const imports = `import type { ${name} } from '../types/${name}';\n`;
    content += imports;
  });

  content += '\n';

  contentSchemas.forEach(([key, schema]) => {
    const name = schema.title;

    const entries: string[] = [];
    if (state.content[key] !== undefined) {
      if (state.content[key]?.items) {
        const items = Object.entries(state.content[key]?.items);
        items.forEach(([entryKey]) => {
          entries.push(entryKey);
        });
      }
    }

    if (entries.length) {
      const itemsJoined = entries.join("' | '");
      const entriesName = `type ${name}EntryNames = '${itemsJoined}';\n`;

      content += entriesName;
      content += `type ${_.startCase(_.camelCase(key))} = {
  [key in ${name}EntryNames]: ${name};
};
`;
    }
  });

  contentSchemas.forEach(([key]) => {
    content += `
export async function get${changeCase.pascalCase(key)}() {
  const ${key} = await getContent('${key}');
  if (Object.keys(${key}).length) {
    return ${key} as unknown as ${changeCase.pascalCase(key)};
  }
  return false;
}
export async function get${changeCase.pascalCase(key)}Array() {
  const ${key} = await getContent('${key}');
  if (Object.keys(${key}).length) {
    const entries = Object.entries(${key}).map(
      ([key, val]: [key: string, val: unknown]) => {
        return { _key: key, ...(val as ${changeCase.pascalCase(key)}) };
      },
    );
    return entries as ${changeCase.pascalCase(key)}[];
  }
  return false;
}
`;
  });

  await mkdirp(conf.helpers.dest);
  await fs.writeFile(path.join(conf.helpers.dest, 'get-content.ts'), content);
}
