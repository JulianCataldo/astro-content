import fs from 'node:fs/promises';
import path from 'node:path';
import prettier from 'prettier';
/* ·········································································· */
import type { MarkdownInstance } from 'astro';
import type { FileInstance, YamlInstance } from '@astro-content/types/file';
import { state } from './state';
import { handleYaml } from './handle-yaml';
import { handleMd } from './handle-md';
import { getTrio } from './utils';
import generateExcerpt from './generate-excerpt';
import { log } from './logger';
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
              if (state.errors[entity] === undefined) {
                state.errors[entity] = {};
              }

              if (state.errors[entity]?.[entry] === undefined) {
                state.errors[entity] = { ...state.errors[entity], [entry]: {} };
              }
              if (state.errors[entity]?.[entry]?.[property] === undefined) {
                state.errors[entity] = {
                  ...state.errors[entity],
                  [entry]: {
                    ...state.errors[entity][entry],
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
              state.errors[entity][entry][property] = report;
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

    // FIXME:
    // if  (state.content[entity]?.[entry]?.[property])
    if (collected && typeof state.content[entity]?.[entry] === 'object') {
      state.content[entity][entry][property] = collected;
    }
  }
}
