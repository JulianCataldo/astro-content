/* eslint-disable max-lines */
import path from 'node:path';
import { sentenceCase } from 'change-case';
import fs from 'node:fs/promises';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
// import draft7MetaSchema from 'ajv/dist/refs/json-schema-draft-07.json';
/* ·········································································· */
import type { FileInstance, YamlInstance } from '@astro-content/types/file';
import type { Options } from '@astro-content/types/integration';
import type { JSONSchema7 } from 'json-schema';
import type { ServerState } from '@astro-content/types/server-state';
import { state } from './state';
import { generateTypes } from './generate-types';
import { loadFile } from './load-file';
import { getTrio } from './utils';
import { log } from './logger';
// import coreSchemaValidation from './core-schema-validation';
/* —————————————————————————————————————————————————————————————————————————— */

const ajv = new Ajv({
  allErrors: false,
  strict: false,
  logger: false,
  strictSchema: false,
  strictNumbers: false,
  strictTypes: false,
  strictTuples: false,
  strictRequired: false,
});
addFormats(ajv);

// FIXME: This prevents "duplicate key" error with AJV schema compiler
// delete draft7MetaSchema.$id;
// ajv.addMetaSchema(draft7MetaSchema);

const tempDir = path.join(process.cwd(), '.astro-content');

/* ·········································································· */

function handleSchema(filePath: string, unknownYaml: YamlInstance<unknown>) {
  log(['Schema', filePath]);

  // TODO: validate + assert schema (core meta schema validation)
  // await coreSchemaValidation();
  const file = unknownYaml as YamlInstance<JSONSchema7>;

  const { second: entity } = getTrio(filePath);

  const typeName = sentenceCase(
    path.basename(filePath).replace('.schema.yaml', ''),
  );
  state.schemas.content[entity] = {
    title: typeName,
    ...file.data,
  };
  state.schemas.raw[entity] = file.rawYaml;
  state.schemas.file[entity] = filePath;
}

/* ·········································································· */

function saveContentState() {
  const fState = JSON.stringify(state);
  const fPath = path.join(tempDir, 'state.json');
  fs.writeFile(fPath, fState).catch((e) => log(e));
}

const ide = `// eslint-disable-next-line import/no-extraneous-dependencies
import { collect } from 'astro-content';
import type { FileInstance, Options } from 'astro-content';
import type { Entities } from '../.astro-content/types';

const get = collect as (
  pFiles: Promise<FileInstance[]>,
  options?: Options,
) => Promise<Entities>;

export { get };
export * from "../.astro-content/types";
`;
export async function saveTsHelper() {
  await fs
    .writeFile(path.join(process.cwd(), 'content', 'index.ts'), ide)
    .catch((e) => log(e));
}
export async function saveTsTypes() {
  await fs
    .writeFile(
      path.join(process.cwd(), '.astro-content', 'types.ts'),
      `${state.types.ide}`,
    )
    .catch(() => null);
}

/* ·········································································· */

const collect = async (
  pFiles: Promise<FileInstance[]>,
  options?: Options,
): Promise<ServerState['content']> => {
  const files = await pFiles.then((p) => p).catch(() => null);
  log({ files });

  if (!Array.isArray(files)) {
    log('No files!');
    return {};
  }

  /* HANDLE USER SCHEMAS — Defaults + entities */

  /* Clean-up */
  state.schemas.content = {};

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

  /* HANDLE CONTENT — YAML + MD + MDX */

  /* Clean-up */
  state.content = {};

  const promises = files.map(async (inputFile: FileInstance) => {
    const filePath = inputFile.file;

    if (filePath && !filePath.endsWith('.schema.yaml')) {
      await loadFile(filePath, inputFile, options?.editMode);
    }
  });

  // TODO: Sort entities / entries / properties after everything is collected
  await Promise.all(promises);

  state.types = await generateTypes(state.content, state.schemas);

  // // Build mode
  // if (import.meta.env.PROD) {
  saveContentState();
  // }
  saveTsTypes().catch((e) => log(e));

  return state.content;
};

export { collect };
