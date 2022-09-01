/* eslint-disable max-lines */
import path from 'node:path';
import { sentenceCase } from 'change-case';
import fs from 'node:fs/promises';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import draft7MetaSchema from 'ajv/dist/refs/json-schema-draft-07.json';
/* ·········································································· */
import type { YamlInstance } from '@astro-content/types/file';
import type { MarkdownInstance } from 'astro';
import state from './state';
import generateBrowserTypes from './generate-types';
import handleMd from './handle-md';
import { getTrio } from './utils';
// import coreSchemaValidation from './core-schema-validation';
/* —————————————————————————————————————————————————————————————————————————— */

/* ·········································································· */

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// FIXME: This prevents "duplicate key" error with AJV schema compiler
delete draft7MetaSchema.$id;

ajv.addMetaSchema(draft7MetaSchema);

const tempDir = path.join(process.cwd(), '.astro-content');

/* ·········································································· */

function handleSchema(filePath: string, file) {
  // FOR DEBUG ——v
  // state.schemas.content = {};

  console.log('schema');

  const { second: entity } = getTrio(filePath);

  const typeName = sentenceCase(
    path.basename(filePath).replace('.schema.yaml', ''),
  );
  state.schemas.content[entity] = {
    title: typeName,
    ...file.data,
  };
  state.schemas.raw[entity] = file.rawYaml;

  // await coreSchemaValidation();
}

/* ·········································································· */

function saveContentState() {
  const fState = JSON.stringify(state);
  const fPath = path.join(tempDir, 'state.json');
  fs.writeFile(fPath, fState).catch(() => null);

  fs.writeFile(
    path.join(process.cwd(), 'get.ts'),
    `${state.types?.ide}\n${state.types?.common}`,
  ).catch(() => null);
}

/* ·········································································· */

const collect = async (
  pFiles: Promise<
    MarkdownInstance<Record<string, unknown>>[] | YamlInstance<unknown>[]
  >,
) => {
  const files = await pFiles.then((p) => p);
  // console.log({ files });

  if (Array.isArray(files) === false) {
    console.log('No files!');
    return;
  }

  /* HANDLE USER SCHEMAS — Defaults + entities */
  files.forEach((inputFile) => {
    const filePath = inputFile.file;
    if (filePath) {
      if (
        filePath.endsWith('.schema.yaml') &&
        !filePath.endsWith('default.schema.yaml')
      ) {
        handleSchema(filePath, inputFile);
      }
    }
  });

  // TODO: Reset state
  /* HANDLE CONTENT — YAML + MD + MDX */
  const promises = files.map(async (inputFile) => {
    const filePath = inputFile.file;

    if (filePath && !filePath.endsWith('.schema.yaml')) {
      await handleMd(filePath, inputFile);
    }
  });
  await Promise.all(promises);

  state.types = await generateBrowserTypes(
    state.content,
    state.schemas,
    state.types.ide,
  );

  saveContentState();

  return state.content;
};

export default collect;
