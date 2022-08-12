import chokidar from 'chokidar';
import * as fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import _, { kebabCase } from 'lodash-es';
import path from 'node:path';
import yaml from 'js-yaml';
import chalk from 'chalk';
import mkdirp from 'mkdirp';

/* ·········································································· */
import { conf } from './config';
import mdToHtml from './md-to-html';
import state from './state';
import validateData from './validate-data';
import { $log } from './utils';
/* —————————————————————————————————————————————————————————————————————————— */

// Write dummy file for front-end framework hot-reload triggering in dev mode
function triggerDevChange() {
  // TODO: dev/prod mode detection
  const data = `{ "timestamp": "${Date.now().toString()}" }\n`;
  fs.writeFile(path.join(conf.dev.triggerFile), data);
}

async function saveBuild(type, entry, prop, data) {
  const base = path.join(kebabCase(type), kebabCase(entry));
  const dir = path.join(conf.components.dest, base);
  await mkdirp(dir);
  const filePath = path.join(dir, `${kebabCase(prop)}.json`);
  fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

function loadFile(eventName: string, schemaPath: string) {
  const parts = path.relative(conf.components.src, schemaPath) || schemaPath;

  const objectPath = path.dirname(parts);
  const c = state.content[objectPath];
  const isSingleton = c?.type === 'singleton';

  const typePath = isSingleton
    ? path.dirname(parts)
    : path.dirname(path.dirname(parts));

  const contentState = _.get(state.content, typePath.replaceAll('/', '.'));

  const schema = state.schemas.content[typePath];

  const base = path.join(conf.components.src, path.dirname(parts));

  if (schema?.properties === undefined) return false;

  Object.entries(schema.properties)?.forEach(async ([key, val]) => {
    const collection = _.camelCase(path.basename(objectPath));

    const targetProp = _.kebabCase(key);
    const currentProp = path.basename(parts, path.extname(parts));
    if (targetProp !== currentProp) return false;

    let data;

    const pathNoExt = path.join(base, `${_.kebabCase(key)}`);

    const mdPath = `${pathNoExt}.md`;
    const mdExists = existsSync(mdPath);
    if (mdExists) {
      const md = await mdToHtml(mdPath, val.properties.frontmatter);

      data = {
        headings: 'yolo',
        excerpt: 'yo',
        frontmatter: md.frontmatter,
        body: md.body,
      };
    } else if (val.type === 'object') {
      const file = await fs
        .readFile(`${pathNoExt}.yaml`, 'utf-8')
        .catch(() => null);

      if (file) {
        data = yaml.load(file);
      }
    }

    if (data) {
      validateData(typePath, collection, key, data);

      if (isSingleton) {
        contentState.data[key] = data;
        saveBuild(typePath, null, key, data);
      } else {
        contentState.items[collection] = {
          ...contentState.items[collection],
          [key]: data,
        };
        saveBuild(typePath, collection, key, data);
      }

      triggerDevChange();

      $log(`Content(${chalk.green(eventName)}): ${chalk.yellow(schemaPath)}`);
    }
    return true;
  });

  return true;
}

export default async function loadFiles() {
  chokidar
    .watch(path.join(conf.components.src, `**/*.{md,yaml}`), {
      ignored: ['node_modules', '**/*.schema.yaml', '**/*.log.yaml'],
    })
    .on('all', (eventName, schemaPath) => {
      if (['add', 'change'].includes(eventName)) {
        loadFile(eventName, schemaPath);
      }
      return true;
    });
}
