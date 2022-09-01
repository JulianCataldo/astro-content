import fs from 'node:fs/promises';
import path from 'node:path';
import type { MarkdownInstance } from 'astro';
import prettier from 'prettier';
/* ·········································································· */
import type { YamlInstance } from '@astro-content/types/file';
import state from './state';
import validateData from './validate-yaml';
import validateMd from './validate-md';
import { getTrio } from './utils';
/* —————————————————————————————————————————————————————————————————————————— */

export default async function handleMd(
  filePath: string,
  file: MarkdownInstance<Record<string, unknown>>[] | YamlInstance<unknown>[],
) {
  // FOR DEBUG ——v
  // state.content = {};

  const { first: entity, second: entry, third: property } = getTrio(filePath);

  if (
    entity &&
    property &&
    state.schemas.content[entity]?.properties?.[property]
  ) {
    let collected;

    if (state.content[entity] === undefined) {
      state.content[entity] = {};
    }
    if (state.content[entity][entry] === undefined) {
      state.content[entity][entry] = {};
    }

    if (filePath.endsWith('yaml') || filePath.endsWith('yml')) {
      collected = { data: file.data, rawYaml: file.rawYaml };

      validateData(entity, entry, property, collected.data, collected.rawYaml);
    }
    if (filePath.endsWith('md')) {
      const rawMd = await fs.readFile(filePath, 'utf8');
      // const rawMd = 'sdfsdf';
      collected = {
        ...file,
        file: undefined,
        headings: file.getHeadings(),
        rawMd,
        body: prettier.format(file.compiledContent(), { parser: 'html' }),
      };

      validateMd(
        rawMd,
        state.schemas.content[entity].properties[property].allOf[1]?.properties
          .frontmatter || {},
      )
        .then((errs) => {
          if (state.errors[entity] === undefined) {
            state.errors[entity] = {};
          }
          if (state.errors[entity][entry] === undefined) {
            state.errors[entity] = { ...state.errors[entity], [entry]: {} };
          }
          if (state.errors[entity][entry][property] === undefined) {
            state.errors[entity] = {
              ...state.errors[entity],
              [entry]: {
                ...state.errors[entity][entry],
                [property]: { schema: [], lint: [], prose: [] },
              },
            };
          }
          state.errors[entity][entry][property].lint = errs.lint;
          state.errors[entity][entry][property].schema = errs.schema;
          state.errors[entity][entry][property].prose = errs.prose;
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
    state.content[entity][entry][property] = collected;
  }
}
