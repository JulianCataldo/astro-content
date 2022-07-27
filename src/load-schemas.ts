import * as fs from 'node:fs/promises';
import mkdirp from 'mkdirp';
import path from 'node:path';
import chokidar from 'chokidar';
import yaml from 'js-yaml';
import _ from 'lodash-es';

import { compile, JSONSchema } from 'json-schema-to-typescript';

import state from './state';

import conf from '../config';
import generateHelper from './generate-client-helper';

async function updateSchema({ schemaPath }: { schemaPath: string }) {
  const parts = path.relative(conf.components.src, schemaPath);
  const schemaName = path.basename(parts).replace('.schema.yaml', '');

  const file = await fs.readFile(schemaPath, 'utf-8');
  const schema: JSONSchema = yaml.load(file);
  let isSingleton = false;

  if (path.dirname(parts) === schemaName) {
    isSingleton = true;
  }

  const parent = path.dirname(parts);
  const pathParsed = parent.replaceAll('/', '.');

  const contentIsUnset = _.get(state.content, pathParsed) === undefined;
  if (contentIsUnset) {
    let data = {};
    if (isSingleton) {
      data = {
        type: 'singleton',
        data: {},
      };
    } else {
      data = {
        type: 'collection',
        items: {},
      };
    }
    _.set(state.content, pathParsed, data);
  }

  const directory = conf.types.dest;
  await mkdirp(directory);
  state.schemas.content[parent] = schema;

  setTimeout(() => {
    const destination = path.join(directory, `${schemaName}.ts`);

    compile(state.schemas.content[parent], 'untitled')
      .then((ts) => fs.writeFile(destination, ts))
      .catch(() => null);
  }, 2000);

  generateHelper();
}

async function watchFilesSchemas() {
  chokidar
    .watch(`${conf.components.src}/**/*.schema.yaml`)
    .on('all', async (eventName, schemaPath) => {
      if (['add', 'change'].includes(eventName)) {
        updateSchema({ schemaPath });
      }
    });
}

export default async function loadSchemas() {
  const internalSchemas = {
    MarkdownFile: yaml.load(
      await fs.readFile('./schemas/markdown.schema.yaml', 'utf-8'),
    ),
  };

  // REFACTOR: Move watchers in a central place?
  watchFilesSchemas();

  state.schemas.internals = {
    ...internalSchemas,
  };
}
