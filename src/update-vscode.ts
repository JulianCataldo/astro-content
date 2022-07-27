import mkdirp from 'mkdirp';
import { kebabCase } from 'lodash-es';

import * as fs from 'node:fs/promises';
import state from './state';
import conf from '../config';

export default async function updateVsCode() {
  const schemas = { ...state.schemas.content, ...state.schemas.internals };

  await mkdirp(conf.vscode.dest);

  const vsCodeSettings: { [key: string]: string[] } = {};

  Object.entries(schemas).forEach(([key, val]) => {
    Object.entries(val.properties).forEach(([propKey, propVal]) => {
      const dest = `${conf.vscode.dest}/${kebabCase(key)}-${kebabCase(
        propKey,
      )}.schema.json`;

      if (state.content[key]?.items) {
        vsCodeSettings[dest] = Object.entries(state.content[key].items).map(
          ([entryKey]) =>
            `content/${key}/${kebabCase(entryKey)}/${kebabCase(propKey)}.yaml`,
        );
      }

      fs.writeFile(dest, JSON.stringify(propVal, null, 2));
    });
  });

  const jsonSchemaSchema = {
    'http://json-schema.org/draft-07/schema#': ['**/*.schema.yaml'],
  };

  const settingsPath = './.vscode/settings.json';
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
}
