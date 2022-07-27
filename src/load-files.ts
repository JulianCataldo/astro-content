import chokidar from 'chokidar';
import * as fs from 'node:fs/promises';
import _ from 'lodash-es';
import path from 'node:path';
import yaml from 'js-yaml';

import conf from '../config';
import mdToHtml from './md-to-html';
import state from './state';

export default async function loadFiles() {
  chokidar
    .watch(`${conf.components.src}/**/*.{md,yaml}`)
    .on('all', (eventName, schemaPath) => {
      if (['add', 'change'].includes(eventName)) {
        const parts = path.relative(conf.components.src, schemaPath);

        const typePath = path.dirname(path.dirname(parts));
        const objectPath = path.dirname(parts);

        const currentType = _.get(state.content, typePath.replaceAll('/', '.'));

        if (currentType?.type === 'collection') {
          const schema = state.schemas.content[typePath];

          Object.entries(schema.properties)?.forEach(async ([key, val]) => {
            const base = path.join(conf.components.src, path.dirname(parts));

            const collection = _.camelCase(path.basename(objectPath));

            if (val['$ref']?.includes('markdown.schema')) {
              const mdPath = path.join(base, `${_.kebabCase(key)}.md`);

              const file = await fs.readFile(mdPath, 'utf-8').catch(() => null);

              schema.properties[key] = state.schemas.internals.MarkdownFile;

              if (file) {
                const result = await mdToHtml(mdPath);

                const data = {
                  headings: 'yolo',
                  excerpt: 'yo',
                  body: result,
                };
                currentType.items[collection] = {
                  ...currentType.items[collection],
                  [key]: data,
                };
              }
            } else if (val.type === 'object') {
              const yamlPath = path.join(base, `${_.kebabCase(key)}.yaml`);

              const file = await fs
                .readFile(yamlPath, 'utf-8')
                .catch(() => null);

              if (file) {
                const data = yaml.load(file);

                currentType.items[collection] = {
                  ...currentType.items[collection],
                  [key]: data,
                };
              }
            }
          });
        }
      }
    });
}
