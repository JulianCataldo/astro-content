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

  Object.entries(schemas).forEach(([key, val]) => {
    if (val.properties === undefined) return false;

    Object.entries(val.properties).forEach(([propKey, propVal]) => {
      const dest = `${conf.vscode.dest}/${kebabCase(key)}-${kebabCase(
        propKey,
      )}.schema.yaml`;

      if (state.content[key]?.items) {
        vsCodeSettings[dest] = Object.entries(state.content[key].items).map(
          ([entryKey]) =>
            `content/${key}/${kebabCase(entryKey)}/${kebabCase(propKey)}.yaml`,
        );
      }

      fs.writeFile(dest, yaml.stringify(propVal));
    });
    return true;
  });

  const jsonSchemaSchema = {
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
        ...currentSettings['yaml.schemas'],
        ...jsonSchemaSchema,
        ...vsCodeSettings,
      },
    },
    null,
    2,
  );
  await fs.writeFile(settingsPath, data);

  $log(
    `${chalk.black.bgYellowBright('VSCode settings')}(${chalk.green(
      'update',
    )}): ${chalk.cyan(settingsPath)}`,
  );
}
