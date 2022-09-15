// @ts-nocheck
import fs from 'node:fs/promises';
import path from 'node:path';
import prettier from 'prettier';
/* ·········································································· */
import type { MarkdownInstance } from 'astro';
import type { FileInstance, YamlInstance } from '@astro-content/types/file';
import { state } from './state.js';
import { handleYaml } from './handle-yaml.js';
import { handleMd } from './handle-md.js';
import { getTrio } from './utils.js';
import generateExcerpt from './generate-excerpt.js';
import { log } from './logger.js';
/* —————————————————————————————————————————————————————————————————————————— */

export async function loadFile(
  filePath: string,
  file: FileInstance,
  editMode = false,
) {
  const { first: entity, second: entry, third: property } = getTrio(filePath);

  if (property && state.schemas.content[entity].properties?.[property]) {
    let collected: FileInstance | null = null;

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
        data: yamlFile.data,
        rawYaml: yamlFile.rawYaml,
        file: path.relative(process.cwd(), filePath),
      };

      handleYaml(entity, entry, property, collected.rawYaml);
    }
    if (filePath.endsWith('md')) {
      const mdFile = file as MarkdownInstance<Record<string, unknown>>;

      // FIXME: Correct File Instance assertion
      collected = {
        ...mdFile,
        // For YAML, remove this
        file: path.relative(process.cwd(), filePath),
      };

      // collected.Content = file?.Content;

      if (editMode) {
        const rawMd = await fs.readFile(filePath, 'utf8');
        collected.headingsCompiled = mdFile.getHeadings();
        collected.rawMd = rawMd;
        collected.bodyCompiled = prettier.format(mdFile.compiledContent(), {
          parser: 'html',
        });
        collected.excerpt = await generateExcerpt(rawMd);

        log({ file, collected }, 'absurd');

        // NO VALIDATION outside edit-mode for now
        const propSchema =
          typeof state.schemas.content[entity] === 'object' &&
          state.schemas.content[entity].properties?.[property];

        if (typeof propSchema !== 'object') {
          return false;
        }
        if (Array.isArray(propSchema.allOf)) {
          log({ property });
          const frontmatterSchema =
            typeof propSchema.allOf[1] === 'object' &&
            typeof propSchema.allOf[1]?.properties?.frontmatter === 'object' &&
            propSchema.allOf[1]?.properties?.frontmatter;

          log(frontmatterSchema);

          handleMd(rawMd, frontmatterSchema || {})
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
        // if (filePath.endsWith('mdx')) {
        //   const rawMd = await fs.readFile(filePath, 'utf8');
        //   collected = {
        //     ...file,
        //     file: undefined,
        //     headings: file.getHeadings(),
        //     rawMd,
        //   };
        // }
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
