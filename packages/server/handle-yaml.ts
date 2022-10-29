import type { Part } from '@astro-content/types/gui-state';
import yaml, { isNode, LineCounter } from 'yaml';
import Ajv from 'ajv';

import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';
import addFormats from 'ajv-formats';
import type { JSONSchema7 } from 'json-schema';
/* ·········································································· */
import { state } from './state.js';
import { log } from './logger.js';
/* —————————————————————————————————————————————————————————————————————————— */

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  logger: false,
  strictSchema: false,
  strictNumbers: false,
  strictTypes: false,
  strictTuples: false,
  strictRequired: false,

  loadSchema(uri) {
    /* Load external referenced schema relatively from schema path */
    return new Promise((resolve, reject) => {
      /* We use local file here, but you could use anything (fetch…) */
      readFile(fileURLToPath(uri), 'utf8')
        .then((data) => {
          try {
            const parsedSchema = yaml.parse(data) as unknown;
            if (parsedSchema && typeof parsedSchema === 'object') {
              resolve(parsedSchema);
            }
          } catch (_) {
            reject(new Error(`Could not parse ${uri}`));
          }
        })
        .catch((_) => {
          reject(new Error(`Could not locate ${uri}`));
        });
    });
  },
});
addFormats(ajv);

export async function handleYaml(
  entity: Part,
  entry: Part,
  property: Part,
  raw: string,
  schema?: JSONSchema7,
  schemaPath?: string,
) {
  log({ raw }, 'absurd', 'table');

  if (!entity || !entry || !property) {
    return false;
  }

  let schemaForAjv: JSONSchema7 | null = null;

  // FIXME: No unnecessary
  const yamlSchema =
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    state.schemas.content[entity]?.properties?.[property] || schema;
  log(yamlSchema, 'absurd');

  if (typeof yamlSchema === 'object') {
    schemaForAjv = {
      $id: pathToFileURL(`${schemaPath ?? ''}`).toString(),

      ...yamlSchema,
    };
  }

  if (schemaForAjv) {
    let validate;
    try {
      validate = await ajv
        .compileAsync(schemaForAjv)
        .then((v) => v)
        .catch((e) => {
          validate = false;
          // eslint-disable-next-line no-console
          console.error(e);
          return null;
        });
    } catch (e) {
      validate = false;
      log(e, 'absurd');
      return false;
    }

    log({ value: validate && validate.errors }, 'absurd');

    if (state.reports[entity] === undefined) {
      state.reports[entity] = {};
    }
    if (state.reports[entity]?.[entry] === undefined) {
      state.reports[entity] = { ...state.reports[entity], [entry]: {} };
    }
    if (state.reports[entity]?.[entry]?.[property] === undefined) {
      state.reports[entity] = {
        ...state.reports[entity],
        [entry]: {
          ...state.reports[entity]?.[entry],
          [property]: { ...state.reports[entity]?.[entry]?.lint, schema: [] },
        },
      };
    }

    if (raw && validate) {
      const lineCounter = new LineCounter();

      const yamlDoc = yaml.parseDocument(raw, { lineCounter });
      const yamlJS = yamlDoc.toJS() as unknown;

      validate(yamlJS);

      if (Array.isArray(state.reports[entity]?.[entry]?.[property]?.schema))
        // FIXME: (possibly undefined)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        // @ts-expect-error
        state.reports[entity][entry][property].schema = validate.errors?.map(
          (error) => {
            const ajvPath = error.instancePath.substring(1).split('/');
            const node = yamlDoc.getIn(ajvPath, true);

            if (isNode(node) && node.range) {
              const s = lineCounter.linePos(node.range[0]);
              const e = lineCounter.linePos(node.range[1]);
              const start = { line: s.line, column: s.col };
              const end = { line: e.line, column: e.col };

              return { ...error, position: { start, end } };
            }
            return error;
          },
        );
    }

    return state.reports[entity]?.[entry]?.[property];
  }
  return false;
}
