import chalk from 'chalk';
import * as fs from 'node:fs/promises';
import mkdirp from 'mkdirp';
import _ from 'lodash-es';
import path from 'node:path';
import { pascalCase } from 'change-case';
/* ·········································································· */
import { conf } from './config';
import state from './state';
/* —————————————————————————————————————————————————————————————————————————— */

export default async function generateHelper() {
  const url = `http://${conf.server.host}:${conf.server.port}/content`;

  let content = `/* AUTO-GENERATED — Do not edit! */
import { timestamp } from '../.timestamp.json';
import fetchApi from '@julian_cataldo/content-components-client/fetch-api';\n
`;

  const contentSchemas = Object.entries(state.schemas.content);

  contentSchemas.forEach(([, schema]) => {
    if (schema.properties === undefined) return false;
    const name = schema.title;
    const imports = `import type { ${name} } from '../types/${name}';\n`;
    content += imports;
    return true;
  });

  content += `\nconsole.log(timestamp && '[CE] Trigger');\n\n`;

  contentSchemas.forEach(([key, schema]) => {
    if (schema.properties === undefined) return false;
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
      const entriesName = `export type ${name}EntryNames = '${itemsJoined}';\n`;

      content += entriesName;
      content += `export type ${_.startCase(_.camelCase(key))} = {
  [key in ${name}EntryNames]: ${name};
};
`;
      // IDEA: re-export?
      // content += `export type ${name};`;
    }
    return true;
  });

  const exports: string[] = [];

  contentSchemas.forEach(([key]) => {
    const fnName = `get${pascalCase(key)}`;
    const fnArrayName = `${fnName}Array`;
    exports.push(fnName, fnArrayName);

    content += `
async function ${fnName}(): Promise<${pascalCase(key)} | false> {
  const ${key} = await fetchApi('${url}', '${key}');
  if (${key} === false) {
    return false;
  }
  if (Object.keys(${key}).length) {
    return ${key} as unknown as ${pascalCase(key)};
  }
  return false;
}
async function ${fnArrayName}(): Promise<${
      state.schemas.content[key].title
    }[] | false>  {
  const ${key} = await fetchApi('${url}', '${key}');
  if (${key} === false) {
    return false;
  }
  if (Object.keys(${key}).length) {
    const entries = Object.entries(${key}).map(
      ([key, val]: [key: string, val: unknown]) => {
        return { _key: key, ...(val as ${pascalCase(key)}) };
      },
    );
    return entries as unknown as ${state.schemas.content[key].title}[];
  }
  return false;
}
`;
  });

  content += `
export default {
  ${exports.join(',\n  ')}
}
`;

  await mkdirp(conf.helpers.dest);
  const dest = path.join(conf.helpers.dest, 'get.ts');
  await fs.writeFile(dest, content);

  // eslint-disable-next-line no-console
  console.log(
    `${chalk.black.bgBlueBright('Helper')}(${chalk.green(
      'generate',
    )}): ${chalk.cyan(dest)}`,
  );
}
