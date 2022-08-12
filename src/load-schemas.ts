import * as fs from 'node:fs/promises';
import mkdirp from 'mkdirp';
import path from 'node:path';
import chokidar from 'chokidar';
import yaml from 'js-yaml';
import _ from 'lodash-es';
import chalk from 'chalk';
import { pascalCase } from 'change-case';
import { compile, JSONSchema } from 'json-schema-to-typescript';
/* ·········································································· */
import state from './state';
import { conf } from './config';
import generateHelper from './generate-client-helper';
import updateVsCode from './update-vscode';
import { $log } from './utils';
/* —————————————————————————————————————————————————————————————————————————— */

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
    const data = isSingleton
      ? { type: 'singleton', data: {} }
      : { type: 'collection', items: {} };

    _.set(state.content, pathParsed, data);

    $log(
      `${chalk.bgMagenta('Schemas')}(${pathParsed}): ${chalk.yellow(
        'Content structure updated',
      )}`,
    );
  }

  // FIXME: avoid setTimeout
  setTimeout(() => updateVsCode(), 50);

  const directory = conf.types.dest;

  await mkdirp(directory);
  state.schemas.content[parent] = { title: pascalCase(schemaName), ...schema };

  // FIXME: avoid setTimeout
  setTimeout(() => {
    const destination = path.join(directory, `${schemaName}.ts`);

    const schemaForTs = {
      definitions: { ...state.schemas.internals },
      ...state.schemas.content[parent],
    };

    compile(schemaForTs, 'untitled')
      .then((ts) => {
        fs.writeFile(destination, ts);
      })
      .catch((e) => console.error(e));
  }, 2000);

  generateHelper();
}

async function watchFilesSchemas() {
  // IDEA: throttle all files writes, using last detected change?

  const schemasGlob = path.join(
    process.cwd(),
    conf.components.src,
    `**/*.schema.yaml`,
  );

  chokidar
    .watch(schemasGlob, {
      ignored: ['**/node_modules'],
    })
    .on('all', async (eventName, schemaPath) => {
      if (['add', 'change'].includes(eventName)) {
        // eslint-disable-next-line no-console
        $log(
          `${chalk.black.bgMagenta('Schemas')}(${chalk.green(
            eventName,
          )}): ${chalk.yellow(schemaPath)}`,
        );
        await updateSchema({ schemaPath });
      }
    });
}

export default async function loadSchemas() {
  // REFACTOR: Move watchers in a central place?
  watchFilesSchemas();

  state.schemas.internals = {
    MarkdownFile: {
      title: 'Markdown file',
      type: 'object',
      properties: {
        headings: {
          type: 'string',
        },
        body: {
          type: 'string',
        },
        excerpt: {
          type: 'string',
        },
      },
      required: ['body'],
      additionalProperties: false,
    },
  };
}
