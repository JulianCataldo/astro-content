/* eslint-disable max-lines */
import path from 'node:path';
import { sentenceCase } from 'change-case';
import fs from 'node:fs/promises';
/* ·········································································· */
import type { FileInstance, YamlInstance } from '@astro-content/types/file';
import type { Options } from '@astro-content/types/integration';
import type { JSONSchema7 } from 'json-schema';
import type { ServerState } from '@astro-content/types/server-state';
import { state } from './state.js';
import { generateTypes, importHelper } from './generate-types.js';
import { loadFile } from './load-file.js';
import { getTrio } from './utils.js';
import { log } from './logger.js';
// import coreSchemaValidation from './core-schema-validation.js';
/* —————————————————————————————————————————————————————————————————————————— */

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

function saveContentStateForBuild() {
  const fState = JSON.stringify(state);
  const fPath = path.join(tempDir, 'state.json');
  fs.writeFile(fPath, fState).catch((e) => log(e));
}

export async function saveTsHelper() {
  await fs
    .writeFile(path.join(process.cwd(), 'content', 'index.ts'), importHelper)
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
        !filePath.endsWith('default.schema.yaml') &&
        'data' in inputFile
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

  /* Build mode */
  // IDEA: Try editMode condition to rule out regular content
  // FIXME!!!: Make function arg. or from Vite / Astro, NOT import.meta (not working after compilation).
  // if (import.meta.env.PROD) {
  saveContentStateForBuild();
  // }
  saveTsTypes().catch((e) => log(e));

  log('Collecting content', 'info');

  return state.content;
};

export { collect };
