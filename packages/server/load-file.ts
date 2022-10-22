// FIXME:
// @ts-nocheck

import fs from 'node:fs/promises';
// import path from 'node:path';
// import prettier from 'prettier';
/* ·········································································· */
import type { MarkdownInstance } from 'astro';
import type {
  FileInstanceExtended,
  OriginalInstance,
  YamlInstance,
} from '@astro-content/types/file';
import { state } from './state.js';
import { handleYaml } from './handle-yaml.js';
import { handleMd } from './handle-md.js';
import { getTrio } from './utils.js';
import { generateExcerpt } from './generate-excerpt.js';
import { log } from './logger.js';
/* —————————————————————————————————————————————————————————————————————————— */

export async function loadFile(
  filePath: string,
  file: OriginalInstance,
  editMode = false,
) {
  const { first: entity, second: entry, third: property } = getTrio(filePath);

  if (property && state.schemas.content[entity].properties?.[property]) {
    let collected: FileInstanceExtended | null = null;

    if (state.content[entity] === undefined) {
      state.content[entity] = {};
    }
    if (state.content[entity]?.[entry] === undefined) {
      state.content[entity] = {
        ...state.content[entity],
        [entry]: {},
      };
    }

    if (filePath.endsWith('yaml') || filePath.endsWith('yml')) {
      const yamlFile = file as YamlInstance<unknown>;
      collected = {
        language: 'yaml',
        ...yamlFile,
        // file: editMode ? path.relative(process.cwd(), filePath) : yamlFile.file,
      };

      handleYaml(entity, entry, property, collected.raw);
    }
    if (filePath.endsWith('md') || filePath.endsWith('mdx')) {
      const mdFile = file as MarkdownInstance<Record<string, unknown>>;

      // FIXME:
      // @ts-expect-error
      collected = {
        language: filePath.endsWith('md') ? 'markdown' : 'mdx',
        ...mdFile,
        // file: editMode ? path.relative(process.cwd(), filePath) : mdFile.file,
      };

      // collected.Content = file?.Content;

      if (editMode) {
        const raw = await fs.readFile(filePath, 'utf8');
        collected.headingsCompiled = mdFile.getHeadings();
        collected.raw = raw;
        // NOTE: Disabled for now, using the separate renderer in iframe.
        // collected.bodyCompiled = 'NONE';
        // prettier.format(mdFile.compiledContent(), {
        //   parser: 'html',
        // });
        collected.excerpt = await generateExcerpt(raw);

        log({ file, collected }, 'absurd');
      }

      // NO VALIDATION outside edit-mode for now
      const propSchema =
        typeof state.schemas.content[entity] === 'object' &&
        state.schemas.content[entity].properties?.[property];

      if (typeof propSchema !== 'object') {
        return false;
      }
      if (propSchema.properties) {
        log({ property });
        const frontmatterSchema = propSchema;

        log(frontmatterSchema);
        // setTimeout(() => {
        //   console.log({ frontmatterSchema });
        // }, 1500);

        handleMd(collected.raw, frontmatterSchema, collected.language === 'mdx')
          .then((report) => {
            if (state.reports[entity] === undefined) {
              state.reports[entity] = {};
            }

            if (state.reports[entity]?.[entry] === undefined) {
              state.reports[entity] = {
                ...state.reports[entity],
                [entry]: {},
              };
            }
            if (state.reports[entity]?.[entry]?.[property] === undefined) {
              state.reports[entity] = {
                ...state.reports[entity],
                [entry]: {
                  ...state.reports[entity][entry],
                  [property]: {
                    schema: [],
                    lint: [],
                    prose: [],
                    footnotes: [],
                    links: [],
                  },
                },
              };
            }
            state.reports[entity][entry][property] = report;
          })
          .then(() => null)
          .catch(() => null);
      }
    }

    log({ collected }, 'absurd');

    // FIXME: Possibly undefined
    // if  (state.content[entity]?.[entry]?.[property])
    if (collected && typeof state.content[entity]?.[entry] === 'object') {
      state.content[entity][entry][property] = collected;
    }
  }
  return null;
}
