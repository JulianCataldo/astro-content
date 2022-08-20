import chalk from 'chalk';
import * as fs from 'node:fs/promises';
import mkdirp from 'mkdirp';
import _ from 'lodash-es';
import path from 'node:path';
import { camelCase, pascalCase } from 'change-case';
/* ·········································································· */
import { conf } from './config';
import state from './state';
import { $log } from './utils';
/* —————————————————————————————————————————————————————————————————————————— */

export default async function generateHelper() {
  const url = `http://${conf.server.host}:${conf.server.port}/content`;

  let content = `/* AUTO-GENERATED — Do not edit! */
import { timestamp } from '../.timestamp.json';
import fetchApi from 'content-maestro/client/fetch-api';\n
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
    // if (state.content[key].type === 'singleton') return false;
    const name = schema.title;

    const entries: string[] = [];
    if (state.content[key]?.items) {
      console.log({ dd: state.content[key].items });
      const items = Object.entries(state.content[key].items);
      items.forEach(([entryKey]) => {
        entries.push(camelCase(entryKey));
      });
    }

    if (entries.length) {
      const itemsJoined = entries.join("' | '");
      const entriesName = `export type ${name}EntryNames = '${itemsJoined}';\n`;

      content += entriesName;
      content += `export type ${_.startCase(_.camelCase(key))} = {
  [key in ${name}EntryNames]?: ${name};
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

    content += `
async function ${fnName}(): Promise<${pascalCase(key)}> {
  const ${key} = await fetchApi('${url}', '${key}');
  
  const empty = {} as unknown as ${pascalCase(key)};
  if (${key} === false) {
    return empty;
  }
  if (Object.keys(${key}).length) {
    return ${key} as unknown as ${pascalCase(key)};
  }
  return empty;
}
`;
    const arrayFn = `
async function ${fnArrayName}(): Promise<${
      state.schemas.content[key].title
    }[]>  {
  const ${key} = await fetchApi('${url}', '${key}');


  const empty = [] as unknown as ${state.schemas.content[key].title}[]
  if (${key} === false) {
    return empty;
  }
  if (Object.keys(${key}).length) {
    const entries = Object.entries(${key}).map(
      ([key, val]: [key: string, val: unknown]) => {
        return { _key: key, ...(val as ${pascalCase(key)}) };
      },
    );
    return entries as ${state.schemas.content[key].title}[];
  }
  return empty;
}
`;
    exports.push(fnName);
    if (state.content[key].type === 'collection') {
      content += arrayFn;
      exports.push(fnArrayName);
    }
  });

  content += `
export default {
  ${exports.join(',\n  ')},
  apiUrl: '${url}'
}
`;

  await mkdirp(conf.helpers.dest);
  const dest = path.join(conf.helpers.dest, 'get.ts');
  await fs.writeFile(dest, content);

  $log(
    `${chalk.black.bgBlueBright('Helper')}(${chalk.green(
      'generate',
    )}): ${chalk.cyan(dest)}`,
  );
}
