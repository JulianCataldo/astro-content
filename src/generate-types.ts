import * as fs from 'node:fs/promises';
import glob from 'glob-promise';
import { compileFromFile } from 'json-schema-to-typescript';
import configuration from '../config';

export default async function generateTypes() {
  const schemas = await glob(`./content/**/*.schema.json`);

  const vsCodeYamlSchemas = {};

  schemas.forEach((schema) => {
    const parts = schema.split('/');
    const schemaName = parts.pop().split('.').shift();
    const collection = parts[parts.length - 1];
    const directory = configuration.schemas.dest;
    const destination = `${directory}/${schemaName}.ts`;

    compileFromFile(schema)
      .then((ts) => fs.writeFile(destination, ts))
      .catch(() => console.log(e));

    const schemaKey = schema.replace('./', '');
    vsCodeYamlSchemas[schemaKey] = [`content/${collection}/*/frontmatter.yaml`];
  });

  const vsCodeSettings = {
    'yaml.schemas': vsCodeYamlSchemas,
  };

  // FIXME: Update instead of overwriting all settings
  await fs.writeFile(
    './.vscode/settings.json',
    JSON.stringify(vsCodeSettings, null, 2),
  );
}
