import mkdirp from 'mkdirp';
import { kebabCase } from 'lodash-es';
import chalk from 'chalk';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import yaml from 'yaml';
import { existsSync as fileExists } from 'node:fs';
/* ·········································································· */
import state from './state';
import { conf } from './config';
import { $log } from './utils';
/* —————————————————————————————————————————————————————————————————————————— */

export default async function updateVsCode() {
  const schemas = { ...state.schemas.content, ...state.schemas.internals };

  await mkdirp(conf.vscode.dest);

  const vsCodeSettings: { [key: string]: string[] } = {};
  const remarkSchemaSettings: { [key: string]: string[] } = {};

  Object.entries(schemas).forEach(([key, val]) => {
    if (val.properties === undefined) return false;

    Object.entries(val.properties).forEach(([propKey, propVal]) => {
      if (state.content[key]?.items) {
        // vsCodeSettings[dest] = Object.entries(state.content[key].items).map(
        //   ([entryKey]) =>
        //     `content/${key}//${kebabCase(propKey)}.yaml`,

        let data = propVal;

        const isMd =
          state.schemas.content[key].properties[propKey].properties
            ?.frontmatter;
        if (isMd) {
          data = propVal.properties.frontmatter;
        }

        const dest = path.join(
          conf.vscode.dest,
          `${kebabCase(key)}-${kebabCase(propKey)}${
            isMd ? '.frontmatter' : ''
          }.schema.yaml`,
        );
        // );

        // console.log({ ext, s: state.schemas.content[key] });
        let scPath: string;
        if (isMd) {
          scPath = `content/${key}/*/${propKey}.${isMd ? 'md' : 'yaml'}`;
          remarkSchemaSettings[dest] = [scPath];
        } else {
          scPath = `content/${key}/*/${kebabCase(propKey)}.yaml`;
          vsCodeSettings[dest] = [scPath];
        }
        fs.writeFile(dest, yaml.stringify(data));
      }
    });
    return true;
  });

  const jsonMetaSchema = {
    'http://json-schema.org/draft-07/schema#': ['**/*.schema.yaml'],
  };

  const settingsPath = './.vscode/settings.json';

  if (fileExists(settingsPath) === false) {
    await mkdirp(path.dirname(settingsPath));
    await fs.writeFile(
      settingsPath,
      JSON.stringify({ 'yaml.schemas': {} }, null, 2),
    );
  }
  const currentSettings = JSON.parse(await fs.readFile(settingsPath, 'utf-8'));

  const data = JSON.stringify(
    {
      ...currentSettings,
      'yaml.schemas': {
        // ...currentSettings['yaml.schemas'],
        ...jsonMetaSchema,
        ...vsCodeSettings,
      },
    },
    null,
    2,
  );
  await fs.writeFile(settingsPath, data);

  await fs.writeFile(
    path.join(conf.vscode.dest, 'schemas.mjs'),
    `export default ${JSON.stringify(remarkSchemaSettings, null, 2)}`,
  );

  $log(
    `${chalk.black.bgYellowBright('VSCode settings')}(${chalk.green(
      'update',
    )}): ${chalk.cyan(settingsPath)}`,
  );
}
